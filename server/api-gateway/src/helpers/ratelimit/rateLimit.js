const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../../utils/redis/redis');

const createRateLimiter = ({ windowMs, max, keyGenerator, message }) =>
  rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
    }),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
    message,
  });

// GLOBAL API LIMIT
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

// STRICT LIMITER FOR SENSITIVE ENDPOINTS
const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50, // Stricter limit for sensitive routes
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many requests to sensitive endpoints. Please try again later.',
  },
});

// USER LIMIT (JWT AUTH)
const userLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) =>
    req.user?.id
      ? `user:${req.user.id}`
      : req.ip,
  message: {
    success: false,
    message: 'Rate limit exceeded.',
  },
});

// Mock or actual verifyAccessToken function
// You need to implement this based on your JWT setup
const verifyAccessToken = (token) => {
  try {
    // Add your actual JWT verification logic here
    // This is a placeholder - replace with your actual implementation
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'ballot-super-secret-key-change-in-production';
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  apiLimiter,
  strictLimiter,  
  userLimiter,
  verifyAccessToken,  
};