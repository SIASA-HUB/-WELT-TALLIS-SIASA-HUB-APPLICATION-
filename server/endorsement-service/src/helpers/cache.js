// utils/cache/advancedCache.js - High-Performance Caching
const redis = require("../redis/redis");
const Logger = require("../logger/logger");

class AdvancedCache {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
    this.hotDataTTL = 60; // 1 minute for hot data
    this.coldDataTTL = 3600; // 1 hour for cold data
  }

  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key, data, ttl = this.defaultTTL) {
    try {
      await redis.set(key, JSON.stringify(data), "EX", ttl);
      return true;
    } catch (error) {
      Logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      Logger.error(`Cache del error for key ${key}:`, error);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await Promise.all(keys.map((key) => redis.del(key)));
        Logger.info(
          `Cleared ${keys.length} cache keys matching pattern: ${pattern}`,
        );
      }
      return keys.length;
    } catch (error) {
      Logger.error(`Cache delPattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  async getOrSet(key, fetcher, ttl = this.defaultTTL) {
    let data = await this.get(key);
    if (data !== null) {
      return data;
    }

    data = await fetcher();
    if (data) {
      await this.set(key, data, ttl);
    }
    return data;
  }

  // Invalidate all caches for a leader
  async invalidateLeaderCache(leaderId) {
    const patterns = [
      `leader:${leaderId}:endorsements:*`,
      `leader:${leaderId}:recent:*`,
      `leader:${leaderId}:boosted:*`,
      `leader:${leaderId}:trending:*`,
      `leader:${leaderId}:stats:*`,
      `global:trending:*`,
    ];

    for (const pattern of patterns) {
      await this.delPattern(pattern);
    }

    Logger.info(`Invalidated all caches for leader: ${leaderId}`);
  }

  // Preload hot data
  async preloadHotData(leaderId, fetchFunction) {
    const hotKey = `leader:${leaderId}:hot_data`;
    const data = await fetchFunction();
    await this.set(hotKey, data, this.hotDataTTL);
    return data;
  }
}

module.exports = new AdvancedCache();
