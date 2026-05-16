// shared/auth/middleware.js
const { verifyAccessToken } = require("../auth/tokens");
const { getTokenFromRequest, getUserFromCookies } = require("../auth/cookies");
const Logger = require("../logger/logger");

// Role-based Authorization Hierarchy
const ROLE_HIERARCHY = {
  user: 1,
  aspirant: 2,
  leader: 2,
  market_admin: 3,
  admin: 4,
  super_admin: 5,
  ceo: 6,
};

// Main Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    const source = req.headers.authorization ? "header" : (req.cookies?.access_token ? "cookie" : "none");

    if (!token) {
      Logger.warn(`[AUTH] Authentication failed: No token found. Source: ${source}, Path: ${req.path}`);
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      Logger.warn(`[AUTH] Authentication failed: Invalid or expired token. Source: ${source}, Path: ${req.path}`);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
      });
    }

    // IDENTITY VALIDATION: Check for role/ID prefix consistency
    const userId = decoded.userId || decoded.user_id;
    const role = (decoded.role || "user").toLowerCase();

    // Verify ID has a valid prefix (USR_ or LDR_)
    const hasValidPrefix = userId.startsWith('USR-') || userId.startsWith('USR_') || 
                           userId.startsWith('LDR-') || userId.startsWith('LDR_');

    if (!hasValidPrefix && role !== 'admin' && role !== 'ceo') {
      Logger.error(`[AUTH] Identity Conflict: ${userId} has no valid prefix`);
      return res.status(403).json({
        success: false,
        message: "Authentication integrity failure. Please login again.",
      });
    }

    // DESYNC DETECTION: Compare token identity with cookie identity if present
    const cookieUser = getUserFromCookies(req);
    if (cookieUser && cookieUser.userId && cookieUser.userId !== userId) {
      Logger.warn(`[AUTH] Session Desync Detected: Token ID(${userId}) != Cookie ID(${cookieUser.userId})`);
      // We prioritize the Token (Bearer) but log the conflict
      // In strict mode, we could reject the request here
    }

    // Attach user to request
    Logger.info(`[AUTH] Authenticated ${role} ${userId} via ${source} for ${req.path}`);
    req.user = decoded;
    req.userId = userId;
    req.role = role;

    next();
  } catch (error) {
    Logger.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = (req.user.role || "user").toLowerCase();
    const userLevel = ROLE_HIERARCHY[userRole] || 1;

    // Check if user has ANY of the required roles OR a higher role in the hierarchy
    const hasPermission = roles.some((requiredRole) => {
      const normalizedRequiredRole = requiredRole.toLowerCase();
      const requiredLevel = ROLE_HIERARCHY[normalizedRequiredRole] || 1;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      Logger.warn(`[AUTH] Access denied for ${userRole} ${req.user.userId}. Required: ${roles.join(", ")}`);
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Check if user is authenticated (returns boolean, no error)
const isAuthenticated = (req) => {
  const token = getTokenFromRequest(req);
  if (!token) return false;

  const decoded = verifyAccessToken(token);
  return !!decoded;
};

// Optional Authentication Middleware
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    if (!decoded) return next();

    const userId = decoded.userId || decoded.user_id;
    const role = (decoded.role || "user").toLowerCase();

    req.user = decoded;
    req.userId = userId;
    req.role = role;

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isAuthenticated,
};
