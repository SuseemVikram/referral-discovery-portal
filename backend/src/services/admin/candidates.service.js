/**
 * Admin Candidates Service
 */
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
    // Delete related EOI logs first
    await eoiLogRepository.deleteByCandidateId(id);
    // Then delete candidate
    return candidateRepository.delete(id);
  }
}

module.exports = new AdminCandidatesService();

