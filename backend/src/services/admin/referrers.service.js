/**
 * Admin Referrers Service
 */
const referrerRepository = require('../../repositories/referrer.repository');
const { clearAdminCache } = require('../../middleware/requireAdmin');

class AdminReferrersService {
  /**
   * Get all referrers with EOI counts
   */
  async getAllReferrers() {
    const referrers = await referrerRepository.findAll();

    // Transform to include EOI count
    return referrers.map((r) => ({
      id: r.id,
      email: r.email,
      full_name: r.full_name,
      company: r.company,
      role: r.role,
      linkedin: r.linkedin,
      is_admin: r.is_admin,
      createdAt: r.createdAt,
      eoiCount: r._count.eoiLogs,
    }));
  }

  /**
   * Update referrer admin status
   */
  async updateAdminStatus(id, isAdmin) {
    const result = await referrerRepository.updateAdminStatus(id, isAdmin);
    // Clear cache when admin status changes
    await clearAdminCache(id);
    return result;
  }
}

module.exports = new AdminReferrersService();

