// controllers/loginAuthController.js - Fixed for your global/index.js exports

const asyncHandler = require("express-async-handler");
const AuthModel = require("../models/userAuthModel");
const Logger = require("../utils/logger/logger");

// Import from global index (correct path)
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setCsrfSecretCookie,
  setUserInfoCookie,
  clearAuthCookies,
  generateCsrfSecret,
  generateCsrfToken,
} = require("../../../global/index");

// ============================================
// LOGIN USER
// ============================================
const loginUser = asyncHandler(async (req, res) => {
  const { anonymous_username, password } = req.body;

  console.log("Login attempt:", { anonymous_username, password: "***" });

  if (!anonymous_username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    const user = await AuthModel.findUserForAuth(anonymous_username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await AuthModel.verifyPassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const userPayload = {
      userId: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      county: user.county,
      ageBracket: user.age_bracket,
      generation: user.generation,
      role: user.role || "user",
      voterCard: user.voter_card === 1,
      willVote: user.will_vote,
      political_party: user.political_party,
      employment_status: user.employment_status,
    };

    // Generate tokens
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    const csrfSecret = await generateCsrfSecret();

    const csrfToken = generateCsrfToken(csrfSecret);

    // Set cookies
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);
    setCsrfSecretCookie(res, csrfSecret);

    const userInfo = {
      user_id: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      county: user.county,
      ward: user.ward,
      age_bracket: user.age_bracket,
      role: user.role || "user",
      political_party: user.political_party,
      employment_status: user.employment_status,
      is_verified: user.is_verified === 1,
    };
    setUserInfoCookie(res, userInfo);

    // Update last login
    await AuthModel.updateLastLogin(user.user_id);

    Logger.info(`User ${user.anonymous_username} logged in`);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userInfo,
      csrfToken,
    });
  } catch (error) {
    Logger.error("Login error", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============================================
// REFRESH TOKEN
// ============================================
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Session expired",
    });
  }

  try {
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const user = await AuthModel.findUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userPayload = {
      userId: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      county: user.county,
      ageBracket: user.age_bracket,
      role: user.role || "user",
    };

    const newAccessToken = generateAccessToken(userPayload);
    const csrfSecret = await generateCsrfSecret();
    const csrfToken = generateCsrfToken(csrfSecret);

    setAccessTokenCookie(res, newAccessToken);
    setCsrfSecretCookie(res, csrfSecret);

    // Update user info cookie with latest role
    const userInfo = {
      user_id: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      county: user.county,
      ward: user.ward,
      age_bracket: user.age_bracket,
      role: user.role || "user",
      political_party: user.political_party,
      employment_status: user.employment_status,
    };
    setUserInfoCookie(res, userInfo);

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      csrfToken,
    });
  } catch (error) {
    Logger.error("Refresh error", { error: error.message });
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
});

// ============================================
// LOGOUT
// ============================================
const logoutUser = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  Logger.info("User logged out");
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ============================================
// VERIFY TOKEN
// ============================================
const verifyToken = asyncHandler(async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  res.status(200).json({
    success: true,
    message: "Token is valid",
    user: {
      userId: decoded.userId,
      username: decoded.username,
      county: decoded.county,
      role: decoded.role || "user",
    },
  });
});

// ============================================
// GET USER FROM COOKIE
// ============================================
const getUserFromCookie = asyncHandler(async (req, res) => {
  const userInfo = req.cookies.user_info;

  if (!userInfo) {
    return res.status(404).json({
      success: false,
      message: "No user info cookie found",
    });
  }

  try {
    const userData =
      typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error parsing user info",
    });
  }
});

// ============================================
// CHECK AUTH STATUS
// ============================================
const checkAuthStatus = asyncHandler(async (req, res) => {
  const accessToken = req.cookies.access_token;
  const userInfoCookie = req.cookies.user_info;

  if (!accessToken || !userInfoCookie) {
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
    });
  }

  const decoded = verifyAccessToken(accessToken);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      isAuthenticated: false,
    });
  }

  const userInfo =
    typeof userInfoCookie === "string"
      ? JSON.parse(userInfoCookie)
      : userInfoCookie;

  return res.status(200).json({
    success: true,
    isAuthenticated: true,
    user: userInfo,
  });
});

// ============================================
// GET CSRF TOKEN
// ============================================
const getCsrfToken = asyncHandler(async (req, res) => {
  const csrfSecret = await generateCsrfSecret();
  const csrfToken = generateCsrfToken(csrfSecret);
  setCsrfSecretCookie(res, csrfSecret);

  res.status(200).json({
    success: true,
    csrfToken,
  });
});

module.exports = {
  loginUser,
  refreshToken,
  logoutUser,
  verifyToken,
  getUserFromCookie,
  checkAuthStatus,
  getCsrfToken,
};
