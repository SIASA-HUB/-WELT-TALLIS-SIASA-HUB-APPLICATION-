const AuthModel = require("../../models/userAuthModel");

const protect = async (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = AuthModel.verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      county: decoded.county,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed",
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Not authorized as admin",
    });
  }
};

module.exports = { protect, adminOnly };
