const rateLimit = require('express-rate-limit');

/**
 * Helper to create a rate limiter using local memory storage.
 * Note: Memory storage resets if the server restarts and isn't shared 
 * across multiple server instances (clusters).
 */
const createRateLimiter = ({ windowMs, max, keyGenerator, message }) =>
  rateLimit({
    // Store: default is MemoryStore (no Redis needed)
    windowMs,
    max,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,   // Disable the `X-RateLimit-*` headers
    keyGenerator,
    message,
    // Optional: add a handler for custom logging when limit is reached
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json(options.message);
    }
  });

// ========== GLOBAL API LIMIT (100 requests per 15 minutes) ==========
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.ip,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

// ========== USER LIMIT (JWT AUTH - 60 requests per minute) ==========
const userLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) =>
    req.user?.id
      ? `user:${req.user.id}`
      : req.ip,
  message: {
    success: false,
    message: 'Rate limit exceeded for your account. Please slow down.',
  },
});

module.exports = {
  apiLimiter,
  userLimiter,
};