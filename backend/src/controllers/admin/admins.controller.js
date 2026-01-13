/**
 * Admin Roles Controller
 */
const adminsService = require('../../services/admin/admins.service');
const { addAdminSchema } = require('../../validators/admin.validator');

class AdminsController {
  async getAllAdmins(req, res, next) {
    try {
      const admins = await adminsService.getAllAdmins();
      res.json({ admins });
    } catch (error) {
      next(error);
    }
  }

  async addAdmin(req, res, next) {
    try {
      const validatedData = addAdminSchema.parse(req.body);
      const admin = await adminsService.addAdminByEmail(validatedData.email);
      res.json(admin);
    } catch (error) {
      next(error);
    }
  }

  async removeAdmin(req, res, next) {
    try {
      const result = await adminsService.removeAdmin(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminsController();

