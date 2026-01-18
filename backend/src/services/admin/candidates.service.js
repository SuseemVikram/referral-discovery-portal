/**
 * Admin Candidates Service
 */
const prisma = require('../../lib/prisma');
const candidateRepository = require('../../repositories/candidate.repository');
const eoiLogRepository = require('../../repositories/eoi-log.repository');

class AdminCandidatesService {
  /**
   * Get all candidates (admin view - includes email)
   */
  async getAllCandidates(filters = {}) {
    return candidateRepository.findAll(filters);
  }

  /**
   * Update candidate visibility
   */
  async updateVisibility(id, isActive) {
    return candidateRepository.updateVisibility(id, isActive);
  }

  /**
   * Update candidate availability
   */
  async updateAvailability(id, availabilityStatus) {
    return candidateRepository.updateAvailability(id, availabilityStatus);
  }

  /**
   * Delete candidate
   */
  async deleteCandidate(id) {
    await eoiLogRepository.deleteByCandidateId(id);
    return candidateRepository.delete(id);
  }

  /**
   * Delete all candidates
   */
  async deleteAllCandidates() {
    await prisma.eOILog.deleteMany({});
    return candidateRepository.deleteAll();
  }
}

module.exports = new AdminCandidatesService();

