// utils/redis/redis.js
const Redis = require("ioredis");
const Logger = require("../logger/logger");

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

// Optional: log connection status
redis.on("connect", () => Logger.info("Redis connected"));
redis.on("error", (err) => Logger.error("Redis error:", err));

module.exports = redis;
