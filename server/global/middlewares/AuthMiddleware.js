// shared/auth/middleware.js
const { verifyAccessToken } = require("../auth/Tokens");
const { getTokenFromRequest, getUserFromCookies } = require("../auth/Cookies");
const Logger = require("../logger/Logger");

// Main Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please log in again.",
      });
    }

    // Attach user to request
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

// Role-based Authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!roles.includes(req.user.role)) {
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
