/**
 * Redis Cache Implementation
 * Falls back to in-memory cache if Redis is not available
 */
const Redis = require('ioredis');
const simpleCache = require('./cache');

let redis = null;
let useRedis = false;

// Initialize Redis connection
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
      useRedis = false;
    });

    redis.on('connect', () => {
      console.log('Redis connected');
      useRedis = true;
    });

    // Connect asynchronously
    redis.connect().catch(() => {
      console.warn('Redis connection failed, using in-memory cache');
      useRedis = false;
    });
  } catch (error) {
    console.warn('Redis initialization failed, using in-memory cache:', error.message);
    useRedis = false;
  }
}

class Cache {
  /**
   * Generate cache key
   */
  generateKey(prefix, data) {
    const str = JSON.stringify(data);
    return `${prefix}:${str}`;
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (useRedis && redis) {
      try {
        const value = await redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Redis get error:', error);
        // Fallback to simple cache
        return simpleCache.get(key);
      }
    }
    return simpleCache.get(key);
  }

  /**
   * Set value in cache with TTL (seconds)
   */
  async set(key, value, ttl = 60) {
    if (useRedis && redis) {
      try {
        await redis.setex(key, ttl, JSON.stringify(value));
        return;
      } catch (error) {
        console.error('Redis set error:', error);
        // Fallback to simple cache
      }
    }
    simpleCache.set(key, value, ttl);
  }

  /**
   * Delete a key
   */
  async delete(key) {
    if (useRedis && redis) {
      try {
        await redis.del(key);
        return;
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }
    simpleCache.delete(key);
  }

  /**
   * Clear cache by prefix
   */
  async clearByPrefix(prefix) {
    if (useRedis && redis) {
      try {
        const keys = await redis.keys(`${prefix}*`);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return;
      } catch (error) {
        console.error('Redis clear error:', error);
      }
    }
    simpleCache.clearByPrefix(prefix);
  }
}

module.exports = new Cache();
