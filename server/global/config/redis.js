// shared/redis/index.js
const Redis = require("ioredis");
const Logger = require("../logger/logger");

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      Logger.warn("[Redis] max retries reached. Cache disabled.");
      return null; // stop reconnecting
    }
    return Math.min(times * 200, 2000);
  },
  maxRetriesPerRequest: null,  // Don't throw on individual commands
  enableOfflineQueue: false,
  enableReadyCheck: false,
  connectTimeout: 3000,
  lazyConnect: true,
});

// Attempt connection lazily — failure is non-fatal
redis.connect().catch(() => {
  Logger.warn("[Redis] Initial connection failed — cache disabled.");
});

// Connection logging
redis.on("connect", () => Logger.info("[Redis] Connecting..."));
redis.on("ready", () => Logger.info("[Redis] Ready"));
redis.on("error", (err) => Logger.warn(`[Redis] ${err.message}`));
redis.on("close", () => Logger.warn("[Redis] Connection closed"));
redis.on("reconnecting", () => Logger.info("[Redis] Reconnecting..."));

// Simple wrapper functions for convenience (optional)
const get = async (key) => {
  const value = await redis.get(key);
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const set = async (key, value, ttlSeconds = null) => {
  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  if (ttlSeconds) {
    // Handle both number and object like { ttl: 300 }
    let finalTtl = typeof ttlSeconds === "object" ? (ttlSeconds.ttl || ttlSeconds.expiry) : ttlSeconds;

    // Ensure it's a valid integer
    finalTtl = Math.floor(Number(finalTtl));

    if (!isNaN(finalTtl) && finalTtl > 0) {
      return await redis.set(key, stringValue, "EX", finalTtl);
    }
  }
  return await redis.set(key, stringValue);
};

const del = async (...keys) => {
  return await redis.del(...keys);
};

const exists = async (key) => {
  return await redis.exists(key);
};

const expire = async (key, seconds) => {
  let finalSeconds = typeof seconds === "object" ? (seconds.ttl || seconds.expiry) : seconds;
  finalSeconds = Math.floor(Number(finalSeconds));
  if (!isNaN(finalSeconds)) {
    return await redis.expire(key, finalSeconds);
  }
  return false;
};

const incr = async (key) => {
  return await redis.incr(key);
};


module.exports = {
  redis,
  get,
  set,
  del,
  exists,
  expire,
  incr,
};
