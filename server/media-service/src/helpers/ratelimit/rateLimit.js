// src/helpers/ratelimit/rateLimit.js
const rateLimit = require('express-rate-limit');

// Helper to create a rate limiter
const createRateLimiter = ({ windowMs, max, keyGenerator, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable `X-RateLimit-*` headers
    keyGenerator,
    message: typeof message === 'object' ? message : { success: false, message },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: typeof message === 'object' ? message.message : message,
        error: 'RATE_LIMIT_EXCEEDED',
      });
    },
  });

// ----------------------------
// Global API limiter (per IP)
// ----------------------------
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  keyGenerator: (req) => req.ip,
  message: 'Too many requests from this IP. Please try again later.',
});

// ----------------------------
// User-specific limiter (per user ID or fallback to IP)
// ----------------------------
const mediaLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  keyGenerator: (req) => req.user?.user_id ? `user:${req.user.user_id}` : req.ip,
  message: 'Rate limit exceeded for this user.',
});

module.exports = {
  apiLimiter,
  mediaLimiter,
  createRateLimiter,
};
