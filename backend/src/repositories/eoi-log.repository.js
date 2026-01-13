const prisma = require('../lib/prisma');

class EOILogRepository {
  /**
   * Count EOIs for a referrer since a date
   */
  async countByReferrerSince(referrerId, sinceDate) {
    return prisma.eOILog.count({
      where: {
        referrerId,
        sentAt: {
          gte: sinceDate,
        },
      },
    });
  }

  /**
   * Create EOI log entry
   */
  async create(data) {
    return prisma.eOILog.create({
      data,
    });
  }

  /**
   * Find all EOI logs (admin)
   */
  async findAll() {
    return prisma.eOILog.findMany({
      orderBy: {
        sentAt: 'desc',
      },
      select: {
        sentAt: true,
        referrerEmail: true,
        referrerCompany: true,
        referrerName: true,
        candidateId: true,
        candidateName: true,
        candidateRoles: true,
      },
    });
  }

  /**
   * Find EOI logs in date range
   */
  async findByDateRange(startDate, endDate) {
    return prisma.eOILog.findMany({
      where: {
        sentAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        sentAt: true,
        referrerEmail: true,
        referrerName: true,
        referrerCompany: true,
        candidateId: true,
        candidateName: true,
        candidateRoles: true,
      },
      orderBy: {
        sentAt: 'desc',
      },
    });
  }

  /**
   * Count total EOIs
   */
  async count() {
    return prisma.eOILog.count();
  }

  /**
   * Count EOIs in date range
   */
  async countByDateRange(startDate) {
    return prisma.eOILog.count({
      where: {
        sentAt: { gte: startDate },
      },
    });
  }

  /**
   * Group by candidate (for analytics)
   */
  async groupByCandidate(limit = 10) {
    return prisma.eOILog.groupBy({
      by: ['candidateId'],
      _count: { candidateId: true },
      orderBy: { _count: { candidateId: 'desc' } },
      take: limit,
    });
  }

  /**
   * Group by referrer (for analytics)
   */
  async groupByReferrer(limit = 5) {
    return prisma.eOILog.groupBy({
      by: ['referrerId'],
      _count: { referrerId: true },
      orderBy: { _count: { referrerId: 'desc' } },
      take: limit,
    });
  }

  /**
   * Delete EOIs for a candidate (cascade delete helper)
   */
  async deleteByCandidateId(candidateId) {
    return prisma.eOILog.deleteMany({
      where: { candidateId },
    });
  }
}

module.exports = new EOILogRepository();

