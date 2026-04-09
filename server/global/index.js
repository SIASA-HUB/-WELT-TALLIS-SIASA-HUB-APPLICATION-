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
const authTokens = require("./auth/Tokens");
const authCookies = require("./auth/Cookies");
const authCsrf = require("./auth/CSRF");
const authMiddleware = require("./middlewares/AuthMiddleware");
const db = require("./config/db");
const redis = require("./config/Redis");
const rateLimiter = require("./rateLimit/index");
const logger = require("./logger/Logger");
const mpesa = require("./mpesa/index");
const {
  getKenyaTimeISO,
  getKenyaTimeFormatted,
} = require("./utils/TimeStamps");

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
};
