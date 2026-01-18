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
   * Get referrer by ID with EOI count
   */
  async getReferrerById(id) {
    const prisma = require('../../lib/prisma');
    const referrer = await prisma.referrer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        company: true,
        role: true,
        linkedin: true,
        phone_number: true,
        is_admin: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            eoiLogs: true,
          },
        },
      },
    });

    if (!referrer) {
      const { NotFoundError } = require('../utils/errors');
      throw new NotFoundError('Referrer');
    }

    return {
      id: referrer.id,
      email: referrer.email,
      full_name: referrer.full_name,
      company: referrer.company,
      role: referrer.role,
      linkedin: referrer.linkedin,
      phone_number: referrer.phone_number,
      is_admin: referrer.is_admin,
      createdAt: referrer.createdAt,
      updatedAt: referrer.updatedAt,
      eoiCount: referrer._count.eoiLogs,
    };
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

