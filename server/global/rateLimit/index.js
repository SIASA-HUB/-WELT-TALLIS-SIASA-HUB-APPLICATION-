// shared/config/redis.js
const Redis = require("ioredis");
const Logger = require("../logger/Logger");

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 500, 2000);
    return delay;
  },
});

// Optional: log connection status
redis.on("connect", () => Logger.info("Redis connecting..."));
redis.on("ready", () => Logger.info(" Redis connected and ready"));
redis.on("error", (err) => Logger.error("Redis error:", err.message));
redis.on("close", () => Logger.warn(" Redis connection closed"));

// Export the redis client directly
module.exports = redis;
