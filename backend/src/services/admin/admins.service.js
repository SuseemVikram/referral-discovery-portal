/**
 * Admin Roles Service
 * Handles admin role management
 */
const referrerRepository = require('../../repositories/referrer.repository');
const { NotFoundError, ConflictError, ForbiddenError } = require('../../utils/errors');
const { clearAdminCache } = require('../../middleware/requireAdmin');

class AdminsService {
  /**
   * Get all admins
   */
  async getAllAdmins() {
    const admins = await referrerRepository.findAll();
    return admins.filter((r) => r.is_admin).map((r) => ({
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      company: r.company,
    }));
  }

  /**
   * Add admin by email
   */
  async addAdminByEmail(email) {
    const referrer = await referrerRepository.findByEmail(email);

    if (!referrer) {
      throw new NotFoundError('No referrer found with this email');
    }

    if (referrer.is_admin) {
      throw new ConflictError('This user is already an admin');
    }

    const updatedReferrer = await referrerRepository.updateAdminStatus(referrer.id, true);
    
    // Clear cache when admin status changes
    await clearAdminCache(referrer.id);

    return {
      id: updatedReferrer.id,
      email: referrer.email,
      full_name: referrer.full_name,
    };
  }

  /**
   * Remove admin
   */
  async removeAdmin(adminId, currentUserId) {
    // Prevent admin from removing themselves
    if (adminId === currentUserId) {
      throw new ForbiddenError('You cannot remove yourself as admin');
    }

    // Check if this is the last admin
    const adminCount = await referrerRepository.countAdmins();

    if (adminCount <= 1) {
      throw new ForbiddenError('Cannot remove the last admin');
    }

    const referrer = await referrerRepository.updateAdminStatus(adminId, false);
    
    // Clear cache when admin status changes
    await clearAdminCache(adminId);

    return {
      success: true,
      email: referrer.email,
    };
  }
}

module.exports = new AdminsService();

