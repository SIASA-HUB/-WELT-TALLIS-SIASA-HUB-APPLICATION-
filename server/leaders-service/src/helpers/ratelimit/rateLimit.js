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




  //   USER LIMIT (JWT AUTH)

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

module.exports = {
  apiLimiter,
  userLimiter,
};
