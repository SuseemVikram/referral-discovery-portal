const prisma = require('../lib/prisma');
const { NotFoundError } = require('../utils/errors');

class ReferrerRepository {
  /**
   * Find referrer by ID
   * @param {string} id
   * @param {object} [opts] - { includePassword, includeAuthFlags }
   */
  async findById(id, opts = {}) {
    const { includePassword = false, includeAuthFlags = false } = typeof opts === 'boolean' ? { includePassword: opts } : opts;
    const select = {
      id: true,
      email: true,
      full_name: true,
      company: true,
      role: true,
      linkedin: true,
      phone_number: true,
      is_admin: true,
      createdAt: true,
    };

    if (includePassword) {
      select.password_hash = true;
    }
    if (includeAuthFlags) {
      select.password_hash = true;
      select.google_id = true;
    }

    const referrer = await prisma.referrer.findUnique({
      where: { id },
      select,
    });

    if (!referrer) {
      throw new NotFoundError('Referrer');
    }

    return referrer;
  }

  /**
   * Find referrer by email
   * @param {boolean} [includePassword=false]
   */
  async findByEmail(email, includePassword = false) {
    const select = {
      id: true,
      email: true,
      full_name: true,
      company: true,
      role: true,
      linkedin: true,
      phone_number: true,
      is_admin: true,
      createdAt: true,
    };

    if (includePassword) {
      select.password_hash = true;
    }

    return prisma.referrer.findUnique({
      where: { email },
      select,
    });
  }

  /**
   * Find referrer by Google ID
   */
  async findByGoogleId(googleId) {
    return prisma.referrer.findFirst({
      where: { google_id: googleId },
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
      },
    });
  }

  /**
   * Find referrer by phone number
   */
  async findByPhoneNumber(phoneNumber) {
    return prisma.referrer.findUnique({
      where: { phone_number: phoneNumber },
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
      },
    });
  }

  /**
   * Create referrer
   */
  async create(data) {
    return prisma.referrer.create({
      data,
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
      },
    });
  }

  /**
   * Update referrer
   */
  async update(id, data) {
    return prisma.referrer.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        full_name: true,
        company: true,
        role: true,
        linkedin: true,
        phone_number: true,
        is_admin: true,
      },
    });
  }

  /**
   * Update password
   */
  async updatePassword(id, passwordHash) {
    return prisma.referrer.update({
      where: { id },
      data: { password_hash: passwordHash },
      select: {
        id: true,
      },
    });
  }

  /**
   * Find all referrers (admin)
   */
  async findAll() {
    return prisma.referrer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        company: true,
        role: true,
        linkedin: true,
        is_admin: true,
        createdAt: true,
        _count: {
          select: {
            eoiLogs: true,
          },
        },
      },
    });
  }

  /**
   * Update admin status
   */
  async updateAdminStatus(id, isAdmin) {
    return prisma.referrer.update({
      where: { id },
      data: { is_admin: isAdmin },
      select: {
        id: true,
        is_admin: true,
      },
    });
  }

  /**
   * Count admins
   */
  async countAdmins() {
    return prisma.referrer.count({
      where: { is_admin: true },
    });
  }
}

module.exports = new ReferrerRepository();

