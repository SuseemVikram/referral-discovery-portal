/**
 * Admin Referrers Controller
 */
const adminReferrersService = require('../../services/admin/referrers.service');
const { adminToggleSchema } = require('../../validators/admin.validator');

class AdminReferrersController {
  async getAllReferrers(req, res, next) {
    try {
      const referrers = await adminReferrersService.getAllReferrers();
      res.json({ referrers });
    } catch (error) {
      next(error);
    }
  }

  async getReferrerById(req, res, next) {
    try {
      const referrer = await adminReferrersService.getReferrerById(req.params.id);
      res.json({ referrer });
    } catch (error) {
      next(error);
    }
  }

  async updateAdminStatus(req, res, next) {
    try {
      const validatedData = adminToggleSchema.parse(req.body);
      const referrer = await adminReferrersService.updateAdminStatus(
        req.params.id,
        validatedData.is_admin
      );
      res.json(referrer);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminReferrersController();

