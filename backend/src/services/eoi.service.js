/**
 * EOI Service
 * Handles Expression of Interest business logic
 */
const eoiLogRepository = require('../repositories/eoi-log.repository');
const candidateRepository = require('../repositories/candidate.repository');
const referrerRepository = require('../repositories/referrer.repository');
const emailService = require('./email.service');
const { NotFoundError, RateLimitError } = require('../utils/errors');
const config = require('../config/env');
const logger = require('../utils/logger');

class EOIService {
  /**
   * Send EOI to candidates
   * @param {string} referrerId - Referrer ID
   * @param {string[]} candidateIds - Array of candidate IDs
   * @param {string[]} filterRoles - Optional: Roles used in filter
   * @param {string[]} filterSkills - Optional: Skills used in filter
   */
  async sendEOI(referrerId, candidateIds, filterRoles = [], filterSkills = []) {
    // Get referrer
    const referrer = await referrerRepository.findById(referrerId);
    if (!referrer) {
      throw new NotFoundError('Referrer');
    }

    if (!referrer.company || !referrer.role || !referrer.linkedin || !referrer.contact_number ||
        referrer.company.trim() === '' || referrer.role.trim() === '' || 
        referrer.linkedin.trim() === '' || referrer.contact_number.trim() === '') {
      throw new Error('Please complete your profile (company, role, LinkedIn, and contact number are required) before sending interest to candidates.');
    }

    // Get candidates first (outside transaction)
    const candidates = await candidateRepository.findByIdsForEOI(candidateIds);

    if (candidates.length === 0) {
      throw new NotFoundError('No candidates found');
    }

    // Check rate limit and create EOI logs in a transaction to prevent race conditions
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const prisma = require('../lib/prisma');
    
    // Use transaction to atomically check rate limit and create logs
    const result = await prisma.$transaction(async (tx) => {
      // Count existing EOIs today within transaction
      const todayEOICount = await tx.eOILog.count({
        where: {
          referrerId,
          sentAt: {
            gte: startOfToday,
          },
        },
      });

      // Check if adding these candidates would exceed the limit
      if (todayEOICount + candidateIds.length > config.eoi.dailyLimit) {
        throw new RateLimitError(
          `Daily EOI limit reached. You have sent ${todayEOICount} EOIs today. Limit: ${config.eoi.dailyLimit} per day.`
        );
      }

      let sentCount = 0;
      const candidateNames = [];
      const processedCandidateIds = [];

      // Process each candidate
      for (const candidate of candidates) {
        const candidateName = candidate.first_name;

        // Create EOI log entry within transaction (before sending email)
        // Use foreign keys directly (referrerId, candidateId) - Prisma handles relations automatically
        await tx.eOILog.create({
          data: {
            referrerId: referrer.id,
            candidateId: candidate.id,
            referrerEmail: referrer.email,
            referrerName: referrer.full_name || '',
            referrerCompany: referrer.company || '',
            candidateEmail: candidate.candidate_email,
            candidateName: candidateName,
            candidateRoles: candidate.target_roles,
          },
        });

        candidateNames.push(candidateName);
        processedCandidateIds.push(candidate.id);
        sentCount++;
      }

      // Return data for email sending (outside transaction)
      return {
        candidateNames,
        processedCandidateIds,
        sentCount,
        candidates,
      };
    });

    // Send emails after transaction completes (so logs are saved even if email fails)
    // Note: We don't have requestId here, but email service will handle null gracefully
    for (const candidate of result.candidates) {
      const candidateName = candidate.first_name;
      try {
        // Send email to candidate
        const emailRoles = filterRoles.length > 0 ? filterRoles : candidate.target_roles;
        const emailSkills = filterSkills.length > 0 ? filterSkills : candidate.primary_skills;
        
        await emailService.sendEOIEmail(
          candidate.candidate_email,
          candidateName,
          referrer.full_name,
          referrer.company,
          referrer.email,
          referrer.role,
          referrer.linkedin,
          referrer.contact_number,
          emailRoles,
          emailSkills,
          null // requestId not available in service layer
        );
      } catch (error) {
        // Log full error details
        logger.error(
          `Email sending failed for ${candidate.candidate_email}, but EOI log was created`,
          {
            error: error.message,
            code: error.code,
            response: error.response,
            responseCode: error.responseCode,
            candidateEmail: candidate.candidate_email,
            candidateId: candidate.id,
          }
        );
      }
    }

    // Send admin notification
    try {
      await emailService.sendAdminEOINotification(
        referrer.full_name,
        referrer.email,
        referrer.company,
        referrer.role,
        result.candidateNames,
        result.processedCandidateIds,
        null // requestId not available in service layer
      );
    } catch (error) {
      logger.error('Admin notification failed, but EOI was sent:', {
        error: error.message,
        code: error.code,
        response: error.response,
        responseCode: error.responseCode,
      });
    }

    return {
      success: true,
      sent: result.sentCount,
    };
  }
}

module.exports = new EOIService();

