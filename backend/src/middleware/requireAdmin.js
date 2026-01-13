const prisma = require('../lib/prisma');
const logger = require('../utils/logger');
const cache = require('../lib/redis-cache');

// Cache TTL: 5 minutes (admin status rarely changes)
const ADMIN_CACHE_TTL = 300; // 5 minutes in seconds
const ADMIN_CACHE_PREFIX = 'admin:';

async function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const cacheKey = `${ADMIN_CACHE_PREFIX}${req.user.id}`;
    
    // Try to get from cache first
    const cachedAdminStatus = await cache.get(cacheKey);
    if (cachedAdminStatus !== null) {
      // Cache hit
      if (cachedAdminStatus === true) {
        return next();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Cache miss - query database
    const referrer = await prisma.referrer.findUnique({
      where: { id: req.user.id },
      select: {
        is_admin: true,
      },
    });

    const isAdmin = referrer?.is_admin === true;

    // Cache the result (cache both true and false)
    await cache.set(cacheKey, isAdmin, ADMIN_CACHE_TTL);

    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  } catch (error) {
    logger.error('Admin check error:', error);
    return res.status(403).json({ error: 'Forbidden' });
  }
}

/**
 * Clear admin cache for a specific user
 * Call this when admin status changes
 */
async function clearAdminCache(userId) {
  const cacheKey = `${ADMIN_CACHE_PREFIX}${userId}`;
  await cache.delete(cacheKey);
}

module.exports = requireAdmin;
module.exports.clearAdminCache = clearAdminCache;

