/**
 * Candidate Service
 * Handles candidate business logic
 */
const candidateRepository = require('../repositories/candidate.repository');

class CandidateService {
  /**
   * Get candidates with filters and pagination
   */
  async getCandidates(filters = {}, pagination = {}) {
    return candidateRepository.findMany(filters, pagination);
  }

  /**
   * Get candidate by ID
   */
  async getCandidateById(id) {
    return candidateRepository.findById(id);
  }

  /**
   * Get unique roles and skills from active candidates
   */
  async getUniqueRolesAndSkills() {
    return candidateRepository.getUniqueRolesAndSkills();
  }
}

module.exports = new CandidateService();

