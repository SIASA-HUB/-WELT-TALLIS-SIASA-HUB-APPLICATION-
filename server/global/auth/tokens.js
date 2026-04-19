// shared/auth/tokens.js
const jwt = require("jsonwebtoken");

const JWT_SECRET =
  process.env.JWT_SECRET || "ballot-super-secret-key-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "ballot-refresh-secret-key";

// Token expiration times
const ACCESS_TOKEN_EXPIRY = "2h";
const REFRESH_TOKEN_EXPIRY = "7d";

// Generate Access Token
const generateAccessToken = (user, expiresIn = ACCESS_TOKEN_EXPIRY) => {
  // Aliases for common user object structures
  const userId = user.userId || user.user_id || user.id;
  const username = user.username || user.anonymous_username || user.user_name;
  const email = user.email || user.personal_email;
  
  return jwt.sign(
    {
      userId,
      username,
      email,
      county: user.county,
      role: user.role || "user",
      ageBracket: user.age_bracket || user.ageBracket,
    },
    JWT_SECRET,
    { expiresIn },
  );
};

// Generate Refresh Token
const generateRefreshToken = (user, expiresIn = REFRESH_TOKEN_EXPIRY) => {
  const userId = user.userId || user.user_id || user.id;
  
  return jwt.sign(
    {
      userId,
      sessionId: user.sessionId || `${userId}-${Date.now()}`,
    },
    JWT_REFRESH_SECRET,
    { expiresIn },
  );
};

// Verify Access Token
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

// Decode Token (no verification)
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};
