// utils/redis/redis.js
const Redis = require('ioredis');
const Logger = require('../logger/logger');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0, 
});

// Log Redis connection
redis.on('connect', () => {
  Logger.info('Redis connected');
});

redis.on('error', (err) => {
  Logger.error('Redis connection error', { message: err.message, stack: err.stack });
});

module.exports = redis;
