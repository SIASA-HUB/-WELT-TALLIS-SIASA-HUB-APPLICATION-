// shared/auth/middleware.js
const { verifyAccessToken } = require("../auth/tokens");
const { getTokenFromRequest, getUserFromCookies } = require("../auth/cookies");
const Logger = require("../logger/logger");

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

    // Attach user to request
    if (decoded && decoded.userId) {
      Logger.info(`[AUTH] Authenticated user ${decoded.userId} via ${source} for ${req.path}`);
    }
    req.user = decoded;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    Logger.error("Authentication error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

// Optional Authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
        req.userId = decoded.userId;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Role-based Authorization Hierarchy
const ROLE_HIERARCHY = {
  user: 1,
  admin: 2,
  market_admin: 3,
  super_admin: 4,
  ceo: 5,
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role || "user";
    const userLevel = ROLE_HIERARCHY[userRole] || 1;

    // Check if user has ANY of the required roles OR a higher role in the hierarchy
    const hasPermission = roles.some((requiredRole) => {
      const requiredLevel = ROLE_HIERARCHY[requiredRole] || 1;
      return userLevel >= requiredLevel;
    });

    if (!hasPermission) {
      Logger.warn(`[AUTH] Access denied for user ${req.user.userId}. Role: ${userRole}, Required: ${roles.join(", ")}`);
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource",
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

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isAuthenticated,
};
