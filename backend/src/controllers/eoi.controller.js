/**
 * EOI Controller
 * Handles HTTP requests for Expression of Interest endpoints
 */
const eoiService = require('../services/eoi.service');
const { eoiSchema } = require('../validators/eoi.validator');

class EOIController {
  /**
   * POST /api/eoi
   * Send Expression of Interest to candidates
   */
  async sendEOI(req, res, next) {
    try {
      const validatedData = eoiSchema.parse(req.body);
      const result = await eoiService.sendEOI(
        req.user.id,
        validatedData.candidate_ids,
        validatedData.filter_roles || [],
        validatedData.filter_skills || []
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EOIController();

