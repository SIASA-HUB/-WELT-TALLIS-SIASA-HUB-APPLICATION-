// utils/redis/redis.js
const Redis = require("ioredis");
const Logger = require("../logger/logger");

class RedisClient {
  constructor() {
    this.client = this.createClient();
    this.registerEvents();
  }

  createClient() {
    return new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_DB) || 0,

      //retry
      retryStrategy: (times) => Math.min(times * 100, 2000),

      maxRetriesPerRequest: null,

      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  registerEvents() {
    this.client.on("connect", () => {
      Logger.info("Redis: Connecting...");
    });

    this.client.on("ready", () => {
      Logger.info("Redis: Connected and ready");
    });

    this.client.on("reconnecting", () => {
      Logger.warn("Redis: Reconnecting...");
    });

    this.client.on("close", () => {
      Logger.warn("Redis: Connection closed");
    });

    this.client.on("error", (err) => {
      Logger.error("Redis error:", err);
    });
  }

  //4  rate limitting
  call(...args) {
    return this.client.call(...args);
  }
  //basic ops
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (err) {
      Logger.error("Redis GET error:", err);
      return null;
    }
  }

  async set(key, value, options = {}) {
    try {
      if (options.ttl) {
        await this.client.set(key, value, "EX", options.ttl);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (err) {
      Logger.error("Redis SET error:", err);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (err) {
      Logger.error("Redis DEL error:", err);
      return false;
    }
  }

  async exists(key) {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (err) {
      Logger.error("Redis EXISTS error:", err);
      return false;
    }
  }

  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (err) {
      Logger.error("Redis EXPIRE error:", err);
      return false;
    }
  }

  //list  ops
  async lpush(key, ...values) {
    try {
      return await this.client.lpush(key, ...values);
    } catch (err) {
      Logger.error("Redis LPUSH error:", err);
      return 0;
    }
  }

  async lrange(key, start, stop) {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (err) {
      Logger.error("Redis LRANGE error:", err);
      return [];
    }
  }

  async ltrim(key, start, stop) {
    try {
      await this.client.ltrim(key, start, stop);
      return true;
    } catch (err) {
      Logger.error("Redis LTRIM error:", err);
      return false;
    }
  }

  //set  ops
  async zadd(key, ...args) {
    try {
      return await this.client.zadd(key, ...args);
    } catch (err) {
      Logger.error("Redis ZADD error:", err);
      return 0;
    }
  }

  async zincrby(key, increment, member) {
    try {
      return await this.client.zincrby(key, increment, member);
    } catch (err) {
      Logger.error("Redis ZINCRBY error:", err);
      return 0;
    }
  }

  async zrevrange(key, start, stop, withScores = false) {
    try {
      return withScores
        ? await this.client.zrevrange(key, start, stop, "WITHSCORES")
        : await this.client.zrevrange(key, start, stop);
    } catch (err) {
      Logger.error("Redis ZREVRANGE error:", err);
      return [];
    }
  }
  //shut
  async quit() {
    try {
      await this.client.quit();
      Logger.info("Redis: Connection closed gracefully");
    } catch (err) {
      Logger.error("Redis quit error:", err);
    }
  }
}

module.exports = new RedisClient();
