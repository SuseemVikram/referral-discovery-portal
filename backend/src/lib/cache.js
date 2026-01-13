/**
 * Simple in-memory cache with TTL
 * For production, consider using Redis
 */
class SimpleCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key from object
   */
  generateKey(prefix, data) {
    const str = JSON.stringify(data);
    return `${prefix}:${str}`;
  }

  /**
   * Get value from cache
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set value in cache with TTL (time to live in seconds)
   */
  set(key, value, ttl = 60) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    });
  }

  /**
   * Delete a key from cache
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear cache by prefix
   */
  clearByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
module.exports = new SimpleCache();
