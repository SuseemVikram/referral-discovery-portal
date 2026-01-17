/**
 * Admin Candidates Controller
 */
const adminCandidatesService = require('../../services/admin/candidates.service');
const { visibilitySchema, availabilitySchema } = require('../../validators/admin.validator');
const { sanitizeQueryParam } = require('../../utils/sanitize');

class AdminCandidatesController {
  async getAllCandidates(req, res, next) {
    try {
      // Sanitize query parameters
      const filters = {
        email: req.query.email ? sanitizeQueryParam(req.query.email) : undefined,
        roles: req.query.roles ? sanitizeQueryParam(req.query.roles) : undefined,
        skills: req.query.skills ? sanitizeQueryParam(req.query.skills) : undefined,
      };
      const candidates = await adminCandidatesService.getAllCandidates(filters);
      res.json({ candidates });
    } catch (error) {
      next(error);
    }
  }

  async updateVisibility(req, res, next) {
    try {
      const validatedData = visibilitySchema.parse(req.body);
      const candidate = await adminCandidatesService.updateVisibility(
        req.params.id,
        validatedData.is_active
      );
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async updateAvailability(req, res, next) {
    try {
      const validatedData = availabilitySchema.parse(req.body);
      const candidate = await adminCandidatesService.updateAvailability(
        req.params.id,
        validatedData.availability_status
      );
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req, res, next) {
    try {
      const candidate = await adminCandidatesService.deleteCandidate(req.params.id);
      res.json({
        success: true,
        message: `Candidate ${candidate.first_name} ${candidate.last_name_initial}. has been deleted`,
        id: candidate.id,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminCandidatesController();

