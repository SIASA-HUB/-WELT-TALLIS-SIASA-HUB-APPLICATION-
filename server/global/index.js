// index.js - API Gateway 

const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const knex = require("knex");
const winston = require("winston");

// internal modules
const authTokens = require("./auth/tokens");
const authCookies = require("./auth/cookies");
const authCsrf = require("./auth/csrf");
const authMiddleware = require("./middlewares/AuthMiddleware");
const { sanitizeMiddleware, sanitizeString, sanitizeObject, isValidUUID, isValidKenyanPhone, isPositiveAmount, safeInt } = require("./middlewares/sanitize");
const db = require("./config/db");
const redis = require("./config/redis");
const rateLimiter = require("./rateLimit/index");
const logger = require("./logger/logger");
const { getKenyaTimeISO, getKenyaTimeFormatted } = require("./utils/timeStamps");
const { sendEmail } = require("./utils/emailHelper");

// === STARTUP GUARD: enforce strong JWT secrets ===
const WEAK_SECRETS = new Set([
  'ballot-super-secret-key-change-in-production',
  'ballot-refresh-secret-key',
  'default',
  'secret',
  'changeme'
]);

if (WEAK_SECRETS.has(process.env.JWT_SECRET)) {
  logger.warn('JWT_SECRET is using a default/weak value. Set a strong secret in your .env file.');
}
if (WEAK_SECRETS.has(process.env.JWT_REFRESH_SECRET)) {
  logger.warn('JWT_REFRESH_SECRET is using a default/weak value.');
}

// ============================================
// SAFE REDIS EXPORTS (with fallback methods)
// ============================================
const safeRedisClient = redis?.redis || null;
const safeRedisGet = async (key) => {
  if (!safeRedisClient || safeRedisClient.status !== 'ready') return null;
  try {
    return await redis.get(key);
  } catch (err) {
    logger.error(`Redis get error: ${key}`, err);
    return null;
  }
};
const safeRedisSet = async (key, value, ttl) => {
  if (!safeRedisClient || safeRedisClient.status !== 'ready') return false;
  try {
    await redis.set(key, value, ttl);
    return true;
  } catch (err) {
    logger.error(`Redis set error: ${key}`, err);
    return false;
  }
};
const safeRedisDel = async (key) => {
  if (!safeRedisClient || safeRedisClient.status !== 'ready') return false;
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    logger.error(`Redis del error: ${key}`, err);
    return false;
  }
};
const safeRedisExists = async (key) => {
  if (!safeRedisClient) return false;
  try {
    return await redis.exists(key);
  } catch (err) {
    logger.error(`Redis exists error: ${key}`, err);
    return false;
  }
};
const safeRedisExpire = async (key, seconds) => {
  if (!safeRedisClient) return false;
  try {
    return await redis.expire(key, seconds);
  } catch (err) {
    logger.error(`Redis expire error: ${key}`, err);
    return false;
  }
};
const safeRedisIncr = async (key) => {
  if (!safeRedisClient) return 0;
  try {
    return await redis.incr(key);
  } catch (err) {
    logger.error(`Redis incr error: ${key}`, err);
    return 0;
  }
};
const safeRedisKeys = async (pattern) => {
  if (!safeRedisClient || safeRedisClient.status !== 'ready') return [];
  try {
    // If redis client has .keys() method
    if (typeof redis.keys === 'function') return await redis.keys(pattern);
    // If redis client has .sendCommand() (raw Redis)
    if (typeof redis.sendCommand === 'function') {
      const result = await redis.sendCommand('KEYS', [pattern]);
      return Array.isArray(result) ? result : [];
    }
    logger.warn(`Redis keys pattern ${pattern} not supported`);
    return [];
  } catch (err) {
    logger.error(`Redis keys error: ${pattern}`, err);
    return [];
  }
};
const safeRedisScan = async (cursor, match, count) => {
  if (!safeRedisClient) return ['0', []];
  try {
    if (typeof redis.scan === 'function') {
      return await redis.scan(cursor, 'MATCH', match, 'COUNT', count);
    }
    return ['0', []];
  } catch (err) {
    logger.error(`Redis scan error`, err);
    return ['0', []];
  }
};
const safeRedisSendCommand = async (command, args) => {
  if (!safeRedisClient) return null;
  try {
    if (typeof redis.sendCommand === 'function') {
      return await redis.sendCommand(command, args);
    }
    return null;
  } catch (err) {
    logger.error(`Redis sendCommand error: ${command}`, err);
    return null;
  }
};

// ============================================
// CORE EXPORTS (all original, plus safe Redis methods)
// ============================================
module.exports = {
  // --- Global Libraries ---
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

  // --- Database ---
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

  // --- Redis Cache
  redis: {
    client: safeRedisClient,
    get: safeRedisGet,
    set: safeRedisSet,
    del: safeRedisDel,
    exists: safeRedisExists,
    expire: safeRedisExpire,
    incr: safeRedisIncr,
    keys: safeRedisKeys,
    scan: safeRedisScan,
    sendCommand: safeRedisSendCommand,
  },

  // --- Logger ---
  logger: logger,

  // --- Utilities ---
  utils: {
    getKenyaTimeISO,
    getKenyaTimeFormatted,
    sendEmail,
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
