// shared/auth/cookies.js
const getSecureCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax", 
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
};

// Cookie options for public cookies (frontend readable)
const getPublicCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
  };
};

// Set access token cookie
const setAccessTokenCookie = (res, token) => {
  res.cookie("access_token", token, {
    ...getSecureCookieOptions(),
    maxAge: 60 * 60 * 2000,  // 2hours
  });
};

// Set refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  res.cookie("refresh_token", token, {
    ...getSecureCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Set user info cookie (frontend readable)
const setUserInfoCookie = (res, user) => {
  const userInfo = {
    userId: user.user_id,
    username: user.anonymous_username,
    county: user.county,
    ageBracket: user.age_bracket,
    role: user.role || "user",
    displayName: user.display_name || user.anonymous_username,
  };

  res.cookie("user_info", JSON.stringify(userInfo), {
    ...getPublicCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Clear all auth cookies
const clearAuthCookies = (res) => {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  res.clearCookie("user_info", { path: "/" });
};

// Get user from cookies (for middleware)
const getUserFromCookies = (req) => {
  const userInfoCookie = req.cookies?.user_info;

  if (!userInfoCookie) {
    return null;
  }

  try {
    return typeof userInfoCookie === "string"
      ? JSON.parse(userInfoCookie)
      : userInfoCookie;
  } catch (error) {
    return null;
  }
};

// Get token from cookies or headers
const getTokenFromRequest = (req) => {
  let token = null;

  // Check Authorization header first (most reliable for microservices)
  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  // Check cookies as fallback
  if (!token) {
    token = req.cookies?.access_token;
  }

  return token;
};
// NEW: Set CSRF secret cookie
const setCsrfSecretCookie = (res, secret) => {
  res.cookie("csrf_secret", secret, {
    ...getSecureCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
module.exports = {
  getSecureCookieOptions,
  getPublicCookieOptions,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setUserInfoCookie,
  clearAuthCookies,
  setCsrfSecretCookie,
  getUserFromCookies,
  getTokenFromRequest,
};
