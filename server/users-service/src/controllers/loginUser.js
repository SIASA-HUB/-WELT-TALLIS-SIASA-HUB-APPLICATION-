const Logger = require('../utils/logger/logger');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Added missing import
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamps');
const { safeQuery, safeQueryOne } = require('../configurations/db');

// Environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

/* =============================
   1️⃣ LOGIN USER
   ============================= */
const loginUser = asyncHandler(async (req, res) => {
  const { anonymous_username, password } = req.body;

  if (!anonymous_username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    // FETCH USER
    const user = await safeQueryOne(
      'SELECT * FROM users WHERE anonymous_username = ? LIMIT 1',
      [anonymous_username.trim()]
    );

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // PASSWORD CHECK
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // GENERATE TOKENS
    // We use the system user_id (UUID) in the token payload for scale
    const accessToken = jwt.sign(
      { userId: user.user_id, username: user.anonymous_username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    // SET SECURITY COOKIES (HttpOnly - Frontend cannot touch these)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    };

    res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    // SET USER DATA COOKIE (Non-HttpOnly - Frontend CAN read this)
    // This allows the frontend to know who is logged in without an API call
    res.cookie('user_info', JSON.stringify({ username: user.anonymous_username }), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // UPDATE LAST LOGIN
    await safeQuery(
      'UPDATE users SET updated_at = ? WHERE user_id = ?',
      [getKenyaTimeISO(), user.user_id]
    );

    Logger.info(`User ${user.anonymous_username} logged in successfully`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        username: user.anonymous_username,
        generation: user.generation
      }
    });

  } catch (error) {
    Logger.error('Login error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/* =============================
   2️⃣ REFRESH TOKEN
   ============================= */
const refreshUserToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ message: 'Session expired' });

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    
    // Check if user still exists using the UUID
    const user = await safeQueryOne('SELECT user_id, anonymous_username FROM users WHERE user_id = ?', [decoded.userId]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newAccessToken = jwt.sign(
      { userId: user.user_id, username: user.anonymous_username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000,
      sameSite: 'Strict'
    });

    res.status(200).json({ success: true, username: user.anonymous_username });

  } catch (error) {
    Logger.error('Refresh error', { error: error.message });
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

/* =============================
   3️⃣ LOGOUT
   ============================= */
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('user_info'); // Clear the user info too
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

module.exports = {
  loginUser,
  refreshToken: refreshUserToken,
  logoutUser
};