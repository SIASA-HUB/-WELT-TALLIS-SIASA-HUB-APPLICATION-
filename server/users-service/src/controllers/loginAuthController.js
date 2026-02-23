const asyncHandler = require("express-async-handler");
const AuthModel = require("../models/userAuthModel");
const Logger = require("../utils/logger/logger");

// Environment variables
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";

//login users
const loginUser = asyncHandler(async (req, res) => {
  const { anonymous_username, password } = req.body;

  if (!anonymous_username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  try {
    // Find user for authentication
    const user = await AuthModel.findUserForAuth(anonymous_username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
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

    // Generate tokens
    const accessToken = AuthModel.generateAccessToken(user);
    const refreshToken = AuthModel.generateRefreshToken(user);

    // Set secure cookies
    const cookieOptions = AuthModel.getCookieOptions();

    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Prepare user data for frontend
    const userData = AuthModel.prepareUserData(user);
    userData.last_login = new Date().toISOString();

    // Set public user info cookie
    res.cookie("user_info", AuthModel.createUserInfoCookie(user), {
      ...AuthModel.getPublicCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Update last login timestamp
    await AuthModel.updateLastLogin(user.user_id);

    Logger.info(`User ${user.anonymous_username} logged in successfully`, {
      county: user.county,
      age_bracket: user.age_bracket,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    Logger.error("Login error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/* =============================
   2️⃣ REFRESH TOKEN
   ============================= */
const refreshUserToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Session expired",
    });
  }

  try {
    // Verify refresh token
    const decoded = AuthModel.verifyRefreshToken(token);

    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Find user
    const user = await AuthModel.findUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new access token
    const newAccessToken = AuthModel.generateAccessToken(user);

    // Set new access token cookie
    res.cookie("access_token", newAccessToken, {
      ...AuthModel.getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    });

    // Update user info cookie
    res.cookie("user_info", AuthModel.createUserInfoCookie(user), {
      ...AuthModel.getPublicCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      username: user.anonymous_username,
      county: user.county,
      age_bracket: user.age_bracket,
      will_vote: user.will_vote === 1,
      role: user.role || "user",
    });
  } catch (error) {
    Logger.error("Refresh error", { error: error.message });
    res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
});

/* =============================
   3️⃣ LOGOUT
   ============================= */
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.clearCookie("user_info");

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

/* =============================
   4️⃣ VERIFY TOKEN (Middleware helper)
   ============================= */
const verifyToken = asyncHandler(async (req, res) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const decoded = AuthModel.verifyAccessToken(token);

  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  // Find user to ensure they still exist
  const user = await AuthModel.findUserById(decoded.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    user: {
      userId: decoded.userId,
      username: decoded.username,
      county: decoded.county,
      role: decoded.role,
    },
  });
});

module.exports = {
  loginUser,
  refreshToken: refreshUserToken,
  logoutUser,
  verifyToken,
};
