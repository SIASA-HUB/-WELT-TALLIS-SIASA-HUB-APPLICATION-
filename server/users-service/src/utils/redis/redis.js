// utils/redis/redis.js - Resilient, never crashes the service
const Redis = require('ioredis');
const Logger = require('../logger/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  retryStrategy: (times) => {
    if (times > 3) {
      Logger.warn('⚠️ Redis: max retries reached. Cache disabled.');
      return null; // Stop retrying - don't crash
    }
    return Math.min(times * 500, 2000);
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
});

redis.on('connect', () => Logger.info('🔌 Redis connecting...'));
redis.on('ready', () => Logger.info('✅ Redis connected'));
redis.on('error', (err) => {
  // Non-fatal — app works without Redis cache
  Logger.warn(`⚠️ Redis (non-fatal): ${err.message}`);
});
redis.on('close', () => Logger.warn('⚠️ Redis connection closed'));

module.exports = redis;
