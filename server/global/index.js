const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("knex");
const winston = require("winston");

//internal module s
const authTokens = require("./auth/tokens");
const authCookies = require("./auth/cookies");
const authCsrf = require("./auth/csrf");
const authMiddleware = require("./middlewares/AuthMiddleware");
const { sanitizeMiddleware, sanitizeString, sanitizeObject, isValidUUID, isValidKenyanPhone, isPositiveAmount, safeInt } = require("./middlewares/sanitize");
const db = require("./config/db");
const redis = require("./config/redis");
const rateLimiter = require("./rateLimit/index");
const logger = require("./logger/logger");
const mpesa = require("./mpesa/index");
const {
  getKenyaTimeISO,
  getKenyaTimeFormatted,
} = require("./utils/timeStamps");

// === STARTUP GUARD: enforce strong JWT secrets ===
const WEAK_SECRETS = new Set(['ballot-super-secret-key-change-in-production', 'ballot-refresh-secret-key', 'default', 'secret', 'changeme']);
if (WEAK_SECRETS.has(process.env.JWT_SECRET)) {
  logger.warn('⚠️  JWT_SECRET is using a default/weak value. Set a strong secret in your .env file.');
}
if (WEAK_SECRETS.has(process.env.JWT_REFRESH_SECRET)) {
  logger.warn('⚠️  JWT_REFRESH_SECRET is using a default/weak value.');
}

// core    exports
module.exports = {
  // --- Global Libraries (For version consistency) ---
  bcrypt,
  crypto,
  jwt,
  asyncHandler,
  express,
  helmet,
  cors,
  knex,
  winston,

  // --- Auth Tokens ---
  generateAccessToken: authTokens.generateAccessToken,
  generateRefreshToken: authTokens.generateRefreshToken,
  verifyAccessToken: authTokens.verifyAccessToken,
  verifyRefreshToken: authTokens.verifyRefreshToken,
  decodeToken: authTokens.decodeToken,
  ACCESS_TOKEN_EXPIRY: authTokens.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY: authTokens.REFRESH_TOKEN_EXPIRY,

  // --- Auth Cookies ---
  setAccessTokenCookie: authCookies.setAccessTokenCookie,
  setRefreshTokenCookie: authCookies.setRefreshTokenCookie,
  setCsrfSecretCookie: authCookies.setCsrfSecretCookie,
  setUserInfoCookie: authCookies.setUserInfoCookie,
  clearAuthCookies: authCookies.clearAuthCookies,
  getUserFromCookies: authCookies.getUserFromCookies,
  getTokenFromRequest: authCookies.getTokenFromRequest,
  getSecureCookieOptions: authCookies.getSecureCookieOptions,
  getPublicCookieOptions: authCookies.getPublicCookieOptions,

  // --- CSRF Protection ---
  generateCsrfSecret: authCsrf.generateSecret,
  generateCsrfToken: authCsrf.generateToken,
  verifyCsrfToken: authCsrf.verifyToken,
  csrfProtection: authCsrf.csrfProtection,

  // --- Auth Middleware ---
  authenticate: authMiddleware.authenticate,
  optionalAuth: authMiddleware.optionalAuth,
  authorize: authMiddleware.authorize,
  isAuthenticated: authMiddleware.isAuthenticated,

  // --- Rate Limiters ---
  createRateLimiter: rateLimiter.createRateLimiter,
  apiLimiter: rateLimiter.apiLimiter,
  strictLimiter: rateLimiter.strictLimiter,
  userLimiter: rateLimiter.userLimiter,
  adminLimiter: rateLimiter.adminLimiter,
  endorsementLimiter: rateLimiter.endorsementLimiter,
  walletLimiter: rateLimiter.walletLimiter,
  publicLimiter: rateLimiter.publicLimiter,
  searchLimiter: rateLimiter.searchLimiter,
  uploadLimiter: rateLimiter.uploadLimiter,
  authLimiter: rateLimiter.authLimiter,
  createWhitelistAwareLimiter: rateLimiter.createWhitelistAwareLimiter,
  applyLimiters: rateLimiter.applyLimiters,
  skipIfWhitelisted: rateLimiter.skipIfWhitelisted,

  // --- Database (ballot  / Siasa Hub) ---
  db: {
    pool: db.pool,
    initDB: db.initDB,
    safeQuery: db.safeQuery,
    safeQueryOne: db.safeQueryOne,
    getConnection: db.getConnection,
    transaction: db.transaction,
    healthCheck: db.healthCheck,
    getPoolStatus: db.getPoolStatus,
    closeDB: db.closeDB,
  },

  // --- Redis Cache ---
  redis: {
    client: redis.redis,
    get: redis.get,
    set: redis.set,
    del: redis.del,
    exists: redis.exists,
    expire: redis.expire,
    incr: redis.incr,
  },

  // --- Logger ---
  logger: logger,

  // --- M-Pesa (Kenya Infrastructure) ---
  mpesa: {
    stkPush: mpesa.stkPush.bind(mpesa),
    queryStatus: mpesa.queryStatus.bind(mpesa),
    formatPhoneNumber: mpesa.formatPhoneNumber.bind(mpesa),
    getAccessToken: mpesa.getAccessToken.bind(mpesa),
    simulateCallback: mpesa.simulateCallback.bind(mpesa),
  },

  // --- Utilities ---
  utils: {
    getKenyaTimeISO,
    getKenyaTimeFormatted,
  },

  // --- Input Sanitization ---
  sanitizeMiddleware,
  sanitizeString,
  sanitizeObject,
  isValidUUID,
  isValidKenyanPhone,
  isPositiveAmount,
  safeInt,
};
