const { safeQueryOne } = require("../configurations/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";

class AuthModel {
  /**
   * Find user by username for authentication
   */
  static async findUserForAuth(username) {
    return await safeQueryOne(
      `SELECT 
                user_id, 
                anonymous_username, 
                password_hash,
                gender,
                age_bracket,
                county,
                ward,
                voter_card,
                will_vote,
                is_verified,
                role
            FROM users 
            WHERE anonymous_username = ? 
            LIMIT 1`,
      [username.trim()],
    );
  }

  /**
   * Find user by ID for token refresh
   */
  static async findUserById(userId) {
    return await safeQueryOne(
      `SELECT 
                user_id, 
                anonymous_username,
                county,
                age_bracket,
                will_vote,
                voter_card,
                role
            FROM users 
            WHERE user_id = ? 
            LIMIT 1`,
      [userId],
    );
  }

  /**
   * Verify password
   */
  static async verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate access token
   */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.user_id,
        username: user.anonymous_username,
        county: user.county,
        ageBracket: user.age_bracket,
        willVote: user.will_vote,
        role: user.role || "user",
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES },
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user) {
    return jwt.sign({ userId: user.user_id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES,
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Prepare user data for frontend (masks sensitive info)
   */
  static prepareUserData(user) {
    return {
      user_id: user.user_id,
      username: user.anonymous_username,
      gender: user.gender,
      age_bracket: user.age_bracket,
      county: user.county,
      ward: user.ward,
      voter_card: user.voter_card ? "****" + user.voter_card.slice(-4) : null,
      will_vote: user.will_vote === 1,
      voter_status: user.voter_card ? "Registered Voter" : "Not Registered",
      voting_intention: user.will_vote === 1 ? "Will Vote" : "Undecided",
      is_verified: user.is_verified === 1,
      role: user.role || "user",
    };
  }

  /**
   * Create user info for cookie
   */
  static createUserInfo(user) {
    return {
      username: user.anonymous_username,
      county: user.county,
      voter_status: user.voter_card ? "registered" : "unregistered",
      will_vote: user.will_vote,
      role: user.role || "user",
    };
  }

  /**
   * Cookie options
   */
  static getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };
  }

  /**
   * Public cookie options (for frontend-readable cookies)
   */
  static getPublicCookieOptions() {
    return {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };
  }
}

module.exports = AuthModel;
