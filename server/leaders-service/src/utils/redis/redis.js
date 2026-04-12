// utils/redis/redis.js - Resilient Redis client that never crashes the service
const Redis = require("ioredis");
const Logger = require("../logger/logger");

// Create Redis client with retry strategy so connection failures are graceful
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // Retry up to 3 times, then give up (don't crash)
  retryStrategy: (times) => {
    if (times > 3) {
      Logger.warn("⚠️ Redis: max retries reached. Caching disabled.");
      return null; // Stop retrying
    }
    return Math.min(times * 500, 2000);
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: false,
});

redis.on("connect", () => Logger.info("🔌 Redis connecting..."));
redis.on("ready", () => Logger.info("✅ Redis connected and ready"));
redis.on("error", (err) => {
  // Log but don't crash — the app works without Redis (just slower)
  Logger.warn(`⚠️ Redis error (non-fatal): ${err.message}`);
});
redis.on("close", () => Logger.warn("⚠️ Redis connection closed"));
redis.on("reconnecting", () => Logger.info("🔄 Redis reconnecting..."));

// Safe wrappers that never throw — return null if Redis is down
const safeGet = async (key) => {
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
};

const safeSetex = async (key, seconds, value) => {
  try {
    return await redis.set(key, value, "EX", seconds);
  } catch {
    return null;
  }
};

const safeDel = async (...keys) => {
  try {
    return await redis.del(...keys);
  } catch {
    return null;
  }
};

module.exports = redis;

// Attach safe helpers to the client for convenience
module.exports.safeGet = safeGet;
module.exports.safeSetex = safeSetex;
module.exports.safeDel = safeDel;
