// shared/auth/csrf.js
const Tokens = require("csrf");

const tokens = new Tokens();

// Generate CSRF Secret (store per user session) - FIXED for async
const generateSecret = async () => {
  try {
    // secret() returns a Promise
    const secret = await tokens.secret();
    return secret;
  } catch (error) {
    console.error("Error generating CSRF secret:", error);
    throw error;
  }
};

// Generate CSRF Token (sync version using secret)
const generateToken = (secret) => {
  if (!secret) {
    throw new Error("CSRF secret is required to generate token");
  }
  // create() is synchronous
  return tokens.create(secret);
};

// Verify CSRF Token
const verifyToken = (secret, token) => {
  if (!secret || !token) {
    return false;
  }
  return tokens.verify(secret, token);
};

// Middleware to verify CSRF token
const csrfProtection = (req, res, next) => {
  // Skip for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers["x-csrf-token"] || req.body._csrf;
  const csrfSecret = req.cookies?.csrf_secret;

  if (!csrfToken || !csrfSecret) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing",
    });
  }

  if (!verifyToken(csrfSecret, csrfToken)) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  next();
};

module.exports = {
  generateSecret,
  generateToken,
  verifyToken,
  csrfProtection,
};
