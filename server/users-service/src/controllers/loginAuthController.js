// controllers/loginAuthController.js - Complete with Email/Username Login Support

const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
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
  getTokenFromRequest,
} = require("../../../global/index");

// Generate secure random token
const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Validate login input (supports email or username)
const validateLoginInput = (identifier, password) => {
  const errors = [];

  if (!identifier || identifier.trim() === "") {
    errors.push("Email or Username is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  // Check if identifier is email format
  const isEmail = identifier && identifier.includes('@') && identifier.includes('.');
  
  if (isEmail && identifier.length > 255) {
    errors.push("Email is too long");
  }
  
  if (!isEmail && identifier && identifier.length > 50) {
    errors.push("Username is too long");
  }

  return { errors, isEmail };
};

// Store refresh token in database
const storeRefreshToken = async (
  userId,
  refreshToken,
  userAgent,
  ipAddress,
) => {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await AuthModel.storeRefreshToken({
      userId,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });
  } catch (error) {
    Logger.error("Failed to store refresh token", { error: error.message });
  }
};

// Invalidate old refresh tokens
const invalidateOldRefreshTokens = async (userId, currentToken = null) => {
  try {
    await AuthModel.invalidateExpiredTokens(userId);

    if (currentToken) {
      // Keep only the current session, invalidate others
      await AuthModel.invalidateAllSessionsExcept(userId, currentToken);
    }
  } catch (error) {
    Logger.error("Failed to invalidate old tokens", { error: error.message });
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password, remember_me = false } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  // Validate input
  const { errors, isEmail } = validateLoginInput(identifier, password);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  try {
    // Find user by email OR username
    let user;
    
    if (isEmail) {
      // Search by email
      user = await AuthModel.findUserByEmail(identifier);
    } else {
      // Search by username
      user = await AuthModel.findUserByUsername(identifier);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/username or password",
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
        message: "Invalid email/username or password",
      });
    }

    // Create user payload for tokens (INCLUDES ROLE)
    const userPayload = {
      userId: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      email: user.email,
      county: user.county,
      ageBracket: user.age_bracket,
      generation: user.generation,
      role: user.role || "user",
      voterCard: user.voter_card === 1,
      willVote: user.will_vote,
      political_party: user.political_party,
      employment_status: user.employment_status,
      permissions: user.permissions || [],
    };

    // Generate tokens with expiration based on remember_me
    const accessTokenExpiry = remember_me ? "7d" : "2h";
    const refreshTokenExpiry = remember_me ? "30d" : "7d";

    const accessToken = generateAccessToken(userPayload, accessTokenExpiry);
    const refreshToken = generateRefreshToken(userPayload, refreshTokenExpiry);

    // Store refresh token in database for session management
    await storeRefreshToken(user.user_id, refreshToken, userAgent, ipAddress);

    // Invalidate old tokens (keep only current session)
    await invalidateOldRefreshTokens(user.user_id, refreshToken);

    // Generate CSRF protection
    const csrfSecret = await generateCsrfSecret();
    const csrfToken = generateCsrfToken(csrfSecret);

    // Create session ID for tracking
    const sessionId = generateSecureToken();

    // Set cookies with security options (Lax for dev/prod compatibility)
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken, {
      maxAge: remember_me ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });
    setCsrfSecretCookie(res, csrfSecret);

    // User info for client (non-sensitive) - INCLUDES ROLE
    const userInfo = {
      user_id: user.user_id,
      session_id: sessionId,
      username: user.anonymous_username,
      real_name: user.real_name,
      email: user.email,
      county: user.county,
      ward: user.ward,
      age_bracket: user.age_bracket,
      role: user.role || "user",
      political_party: user.political_party,
      employment_status: user.employment_status,
      is_verified: user.is_verified === 1,
      avatar: user.avatar || null,
      last_login: new Date().toISOString(),
    };

    setUserInfoCookie(res, userInfo);

    // Log successful login
    Logger.info(
      `User ${user.anonymous_username} (ID: ${user.user_id}) logged in successfully from ${ipAddress} - Role: ${user.role || 'user'} - Login via: ${isEmail ? 'email' : 'username'}`,
    );

    // Return success response with ROLE and Token included
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        ...userInfo,
        role: user.role || "user",
      },
      accessToken, // Restored for frontend localStorage support
      csrfToken,
      sessionId,
      expiresIn: remember_me ? 604800 : 7200, // seconds (7 days or 2 hours)
      rememberMe: remember_me,
    });
  } catch (error) {
    Logger.error("Login error", {
      error: error.message,
      stack: error.stack,
      identifier: identifier,
      ip: ipAddress,
    });

    return res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ============================================
// REFRESH TOKEN
// ============================================
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;
  const ipAddress = req.ip || req.connection.remoteAddress;

  if (!token) {
    Logger.warn(`[REFRESH] No refresh token found in cookies. IP: ${ipAddress}`);
    return res.status(401).json({
      success: false,
      message: "No refresh token provided. Please login again.",
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    if (!decoded) {
      // Token is invalid or expired
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    // Check if token exists in database and is valid
    const isValidToken = await AuthModel.isValidRefreshToken(
      decoded.userId,
      token,
    );
    if (!isValidToken) {
      Logger.warn(
        `Invalid refresh token attempt for user ${decoded.userId} from ${ipAddress}`,
      );
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: "Session expired. Please login again.",
      });
    }

    // Get fresh user data
    const user = await AuthModel.findUserById(decoded.userId);

    if (!user) {
      Logger.error(`User not found during refresh: ${decoded.userId}`);
      clearAuthCookies(res);
      return res.status(404).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    // Check if user is still active
    if (user.is_active === 0) {
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated.",
      });
    }

    // Create updated user payload
    const userPayload = {
      userId: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      email: user.email,
      county: user.county,
      ageBracket: user.age_bracket,
      role: user.role || "user",
      permissions: user.permissions || [],
    };

    // Generate new tokens
    const newAccessToken = generateAccessToken(userPayload);
    const newCsrfSecret = await generateCsrfSecret();
    const newCsrfToken = generateCsrfToken(newCsrfSecret);

    // Prepare public user info for client
    const userInfo = {
      user_id: user.user_id,
      username: user.anonymous_username,
      real_name: user.real_name,
      email: user.email,
      county: user.county,
      ward: user.ward,
      age_bracket: user.age_bracket,
      role: user.role || "user",
      political_party: user.political_party,
      employment_status: user.employment_status,
      is_verified: user.is_verified === 1,
    };

    setAccessTokenCookie(res, newAccessToken);
    setCsrfSecretCookie(res, newCsrfSecret);

    setUserInfoCookie(res, userInfo);

    Logger.info(
      `Token refreshed for user ${user.anonymous_username} (ID: ${user.user_id})`,
    );

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      csrfToken: newCsrfToken,
      user: userInfo, // Added for frontend context consistency
      expiresIn: 7200, 
    });
  } catch (error) {
    Logger.error("Refresh token error", {
      error: error.message,
      stack: error.stack,
      ip: ipAddress,
    });

    clearAuthCookies(res);
    res.status(403).json({
      success: false,
      message: "Invalid refresh token. Please login again.",
    });
  }
});

// ============================================
// LOGOUT
// ============================================
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  const userId = req.user?.userId; // From auth middleware if available

  try {
    // Invalidate the specific refresh token in database
    if (refreshToken && userId) {
      await AuthModel.invalidateRefreshToken(userId, refreshToken);
      Logger.info(`User ${userId} logged out, token invalidated`);
    } else if (refreshToken) {
      // Try to find user from token if middleware not used
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded && decoded.userId) {
        await AuthModel.invalidateRefreshToken(decoded.userId, refreshToken);
      }
    }
  } catch (error) {
    Logger.error("Error during logout token invalidation", {
      error: error.message,
    });
  }

  // Clear all auth cookies
  clearAuthCookies(res);

  Logger.info(
    `User logged out successfully${userId ? ` (ID: ${userId})` : ""}`,
  );

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// ============================================
// LOGOUT ALL DEVICES
// ============================================
const logoutAllDevices = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    // Invalidate all sessions for this user
    await AuthModel.invalidateAllUserSessions(userId);

    // Clear current session cookies
    clearAuthCookies(res);

    Logger.info(`User ${userId} logged out from all devices`);

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    Logger.error("Logout all devices error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error logging out from all devices",
    });
  }
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
      isAuthenticated: false,
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
        isAuthenticated: false,
      });
    }

    // Verify user still exists and is active
    const user = await AuthModel.findUserById(decoded.userId);

    if (!user || user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: "User account is invalid or deactivated",
        isAuthenticated: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
      isAuthenticated: true,
      user: {
        userId: decoded.userId,
        username: decoded.username,
        email: decoded.email,
        county: decoded.county,
        role: decoded.role || "user",
        permissions: decoded.permissions || [],
      },
    });
  } catch (error) {
    Logger.error("Token verification error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error verifying token",
      isAuthenticated: false,
    });
  }
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
      isAuthenticated: false,
    });
  }

  try {
    let userData;
    try {
      userData = typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
    } catch (parseError) {
      Logger.error("Failed to parse userInfo cookie", { error: parseError.message });
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "Invalid session data",
        isAuthenticated: false,
      });
    }

    // Verify the user still exists in database
    const user = await AuthModel.findUserById(userData.user_id);
    if (!user || user.is_active === 0) {
      clearAuthCookies(res);
      return res.status(401).json({
        success: false,
        message: "User account no longer exists",
        isAuthenticated: false,
      });
    }

    return res.status(200).json({
      success: true,
      user: userData,
      isAuthenticated: true,
    });
  } catch (error) {
    Logger.error("Error in getUserFromCookie", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error retrieving user info",
    });
  }
});

// ============================================
// CHECK AUTH STATUS
// ============================================
const checkAuthStatus = asyncHandler(async (req, res) => {
  const token = getTokenFromRequest(req);
  const userInfoCookie = req.cookies.user_info;

  if (!token) {
    return res.status(200).json({
      success: true,
      isAuthenticated: false,
      message: "No active session found",
    });
  }

  try {
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      // Token expired but might have refresh token
      const refreshToken = req.cookies.refresh_token;
      if (refreshToken) {
        return res.status(200).json({
          success: true,
          isAuthenticated: false,
          needsRefresh: true,
          message: "Access token expired, refresh needed",
        });
      }

      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: "Session expired",
      });
    }

    // Verify user still exists
    const user = await AuthModel.findUserById(decoded.userId);
    if (!user || user.is_active === 0) {
      clearAuthCookies(res);
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: "User account is invalid",
      });
    }

    // handle user data normalization
    let finalUser = userInfoCookie;
    if (typeof userInfoCookie === "string") {
      try { finalUser = JSON.parse(userInfoCookie); } catch (_) { finalUser = null; }
    }

    if (!finalUser) {
      // Reconstruct from database/token if cookie is missing
      finalUser = {
        user_id: user.user_id,
        username: user.anonymous_username || decoded.username,
        real_name: user.real_name || decoded.real_name,
        email: user.email || decoded.email,
        role: user.role || decoded.role || "user",
        county: user.county,
        ward: user.ward,
        political_party: user.political_party,
        is_verified: user.is_verified === 1,
      };
    }

    Logger.info(`[AUTH] Status check successful for user: ${finalUser.username} (ID: ${finalUser.user_id})`);

    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      user: finalUser,
      role: finalUser.role,
      permissions: decoded.permissions || [],
    });
  } catch (error) {
    Logger.error("[AUTH] Status check error", { error: error.message });
    return res.status(200).json({
      success: true,
      isAuthenticated: false,
      message: "Internal error during auth check",
    });
  }
});

// ============================================
// GET CSRF TOKEN
// ============================================
const getCsrfToken = asyncHandler(async (req, res) => {
  const csrfSecret = await generateCsrfSecret();
  const csrfToken = generateCsrfToken(csrfSecret);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  setCsrfSecretCookie(res, csrfSecret, cookieOptions);

  res.status(200).json({
    success: true,
    csrfToken,
    expiresIn: 3600, // 1 hour
  });
});

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // Validate new password
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters",
    });
  }

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "New passwords do not match",
    });
  }

  try {
    const user = await AuthModel.findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isValid = await AuthModel.verifyPassword(
      currentPassword,
      user.password_hash,
    );

    if (!isValid) {
      Logger.warn(`Failed password change attempt for user ${userId}`);
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await AuthModel.updatePassword(userId, newPasswordHash);

    // Invalidate all sessions except current
    const currentRefreshToken = req.cookies.refresh_token;
    await AuthModel.invalidateAllSessionsExcept(userId, currentRefreshToken);

    Logger.info(`Password changed successfully for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Password changed successfully. You have been logged out from all other devices.",
    });
  } catch (error) {
    Logger.error("Change password error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error changing password",
    });
  }
});

// ============================================
// GET SESSIONS
// ============================================
const getUserSessions = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const sessions = await AuthModel.getUserSessions(userId);
    const currentSessionToken = req.cookies.refresh_token;

    // Mark current session
    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.token === currentSessionToken,
    }));

    res.status(200).json({
      success: true,
      sessions: sessionsWithCurrent,
    });
  } catch (error) {
    Logger.error("Get sessions error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error retrieving sessions",
    });
  }
});

// ============================================
// TERMINATE SESSION
// ============================================
const terminateSession = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { sessionId } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    await AuthModel.terminateSession(userId, sessionId);

    Logger.info(`Session ${sessionId} terminated for user ${userId}`);

    res.status(200).json({
      success: true,
      message: "Session terminated successfully",
    });
  } catch (error) {
    Logger.error("Terminate session error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error terminating session",
    });
  }
});

// ============================================
// EXPORTS
// ============================================
module.exports = {
  loginUser,
  refreshToken,
  logoutUser,
  logoutAllDevices,
  verifyToken,
  getUserFromCookie,
  checkAuthStatus,
  getCsrfToken,
  changePassword,
  getUserSessions,
  terminateSession,
};
