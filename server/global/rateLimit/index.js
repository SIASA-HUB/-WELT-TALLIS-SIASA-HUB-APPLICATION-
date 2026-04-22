// global/rateLimit/index.js — Production-grade rate limiters
const rateLimit = require("express-rate-limit");

// ============================================================
// FACTORY — Create a custom rate limiter
// ============================================================
const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: message || "Too many requests. Try again later." },
    handler: (req, res, _next, options) => {
      res.status(429).json(options.message);
    },
    skip: (req) => req.method === "OPTIONS",
  });

// ============================================================
// PRE-BUILT LIMITERS
// ============================================================

/** General API — 200 req / 15 min */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Rate limit exceeded. Please slow down.",
});

/** Auth endpoints — 15 req / 15 min (prevent brute force) */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 45,
  message: "Too many login attempts. Try again in 15 minutes.",
});

/** Strict — 30 req / 15 min (sensitive ops) */
const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many requests to this endpoint.",
});

/** User-facing — 200 req / 15 min */
const userLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests. Please wait.",
});

/** Admin — strict — 50 req / 15 min */
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Admin rate limit exceeded.",
});

/** Endorsements — 20 req / 5 min */
const endorsementLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: "Too many endorsement actions. Please wait.",
});

/** Wallet operations — 15 req / 10 min */
const walletLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: "Too many wallet operations. Please wait.",
});

/** Public reads — 300 req / 15 min */
const publicLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please slow down.",
});

/** Search — 60 req / 1 min */
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many search requests. Slow down.",
});

/** Upload — 10 req / 10 min */
const uploadLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many file uploads. Please wait.",
});

// ============================================================
// WHITELIST HELPERS (for internal service-to-service calls)
// ============================================================
const INTERNAL_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

const skipIfWhitelisted = (req) => {
  const ip = req.ip || req.connection?.remoteAddress;
  return INTERNAL_IPS.has(ip);
};

const createWhitelistAwareLimiter = (options) =>
  rateLimit({
    ...options,
    skip: (req) => skipIfWhitelisted(req) || req.method === "OPTIONS",
  });

/** Apply multiple rate limiters in sequence */
const applyLimiters = (...limiters) => (req, res, next) => {
  let i = 0;
  const run = () => {
    if (i >= limiters.length) return next();
    limiters[i++](req, res, run);
  };
  run();
};

module.exports = {
  createRateLimiter,
  apiLimiter,
  authLimiter,
  strictLimiter,
  userLimiter,
  adminLimiter,
  endorsementLimiter,
  walletLimiter,
  publicLimiter,
  searchLimiter,
  uploadLimiter,
  skipIfWhitelisted,
  createWhitelistAwareLimiter,
  applyLimiters,
};
