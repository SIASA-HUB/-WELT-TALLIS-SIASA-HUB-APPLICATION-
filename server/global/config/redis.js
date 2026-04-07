// shared/redis/index.js
const Redis = require("ioredis");
const Logger = require("../logger/logger");

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Connection logging
redis.on("connect", () => Logger.info("🔌 Redis connecting..."));
redis.on("ready", () => Logger.info("✅ Redis connected and ready"));
redis.on("error", (err) => Logger.error("❌ Redis error:", err.message));
redis.on("close", () => Logger.warn("⚠️ Redis connection closed"));
redis.on("reconnecting", () => Logger.info("🔄 Redis reconnecting..."));

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
    return await redis.set(key, stringValue, "EX", ttlSeconds);
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
  return await redis.expire(key, seconds);
};

const incr = async (key) => {
  return await redis.incr(key);
};

module.exports = {
  redis, // Raw Redis client
  get, // Get with JSON parsing
  set, // Set with JSON stringify
  del, // Delete keys
  exists, // Check existence
  expire, // Set expiration
  incr, // Increment
};
