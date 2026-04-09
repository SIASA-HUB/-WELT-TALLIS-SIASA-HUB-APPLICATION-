// models/userAuthModel.js - Fixed (removed is_active)

const { safeQuery, safeQueryOne } = require("../configurations/db");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");

class UserAuthModel {
  /**
   * Find user for authentication (by username OR email)
   * This method is called by loginUser in authController
   * Now supports login with either anonymous_username OR personal_email
   */
  static async findUserForAuth(identifier) {
    if (!identifier) return null;

    console.log(`🔍 Looking for user with identifier: ${identifier}`);

    // Search by both anonymous_username AND personal_email
    return await safeQueryOne(
      `SELECT 
        user_id, 
        anonymous_username, 
        real_name,
        password_hash,
        personal_email as email,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        political_party,
        employment_status,
        role,
        is_verified,
        created_at,
        updated_at
      FROM users 
      WHERE anonymous_username = ? OR personal_email = ?
      LIMIT 1`,
      [identifier, identifier],
    );
  }

  /**
   * Find user by ID
   */
  static async findUserById(userId) {
    if (!userId) return null;

    return await safeQueryOne(
      `SELECT 
        user_id, 
        anonymous_username, 
        real_name,
        password_hash,
        personal_email as email,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        political_party,
        employment_status,
        role,
        is_verified,
        created_at,
        updated_at
      FROM users 
      WHERE user_id = ? 
      LIMIT 1`,
      [userId],
    );
  }

  /**
   * Find user by email
   */
  static async findUserByEmail(email) {
    if (!email) return null;

    return await safeQueryOne(
      `SELECT 
        user_id, 
        anonymous_username, 
        real_name,
        password_hash,
        personal_email as email,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        political_party,
        employment_status,
        role,
        is_verified,
        created_at,
        updated_at
      FROM users 
      WHERE personal_email = ? 
      LIMIT 1`,
      [email],
    );
  }

  /**
   * Verify password for a user
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) return false;
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`🔐 Password verification: ${isValid ? "SUCCESS" : "FAILED"}`);
    return isValid;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId, ipAddress = null, userAgent = null) {
    if (!userId) return;

    await safeQuery(
      `UPDATE users SET 
        updated_at = ?,
        last_login = ?,
        last_login_ip = ?,
        last_login_user_agent = ?
      WHERE user_id = ?`,
      [getKenyaTimeISO(), getKenyaTimeISO(), ipAddress, userAgent, userId],
    );
    console.log(`✅ Updated last login for user ${userId}`);
  }

  /**
   * Get user role
   */
  static async getUserRole(userId) {
    const user = await safeQueryOne(
      `SELECT role FROM users WHERE user_id = ? LIMIT 1`,
      [userId],
    );
    return user?.role || "user";
  }

  /**
   * Check if user exists by username
   */
  static async userExistsByUsername(username) {
    const user = await safeQueryOne(
      `SELECT 1 FROM users WHERE anonymous_username = ? LIMIT 1`,
      [username],
    );
    return !!user;
  }

  /**
   * Check if user exists by email
   */
  static async userExistsByEmail(email) {
    if (!email) return false;
    const user = await safeQueryOne(
      `SELECT 1 FROM users WHERE personal_email = ? LIMIT 1`,
      [email],
    );
    return !!user;
  }

  /**
   * Get user by username with all details
   */
  static async getUserByUsername(username) {
    return await this.findUserForAuth(username);
  }

  /**
   * Get user by ID with all details
   */
  static async getUserById(userId) {
    return await this.findUserById(userId);
  }

  // ============================================
  // SESSION MANAGEMENT METHODS (placeholders)
  // ============================================

  static async storeRefreshToken({
    userId,
    refreshToken,
    userAgent,
    ipAddress,
    expiresAt,
  }) {
    try {
      console.log(`📝 Storing refresh token for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error storing refresh token:", error);
      return false;
    }
  }

  static async isValidRefreshToken(userId, token) {
    try {
      console.log(`🔍 Validating refresh token for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error validating refresh token:", error);
      return false;
    }
  }

  static async invalidateRefreshToken(userId, token) {
    try {
      console.log(`🚫 Invalidating refresh token for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating refresh token:", error);
      return false;
    }
  }

  static async invalidateExpiredTokens(userId) {
    try {
      console.log(`🧹 Invalidating expired tokens for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating expired tokens:", error);
      return false;
    }
  }

  static async invalidateAllSessionsExcept(userId, currentToken) {
    try {
      console.log(
        `🔒 Invalidating all sessions except current for user ${userId}`,
      );
      return true;
    } catch (error) {
      console.error("Error invalidating sessions:", error);
      return false;
    }
  }

  static async invalidateAllUserSessions(userId) {
    try {
      console.log(`🚫 Invalidating all sessions for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error invalidating all sessions:", error);
      return false;
    }
  }

  static async updatePassword(userId, newPasswordHash) {
    if (!userId || !newPasswordHash) return false;

    await safeQuery(
      `UPDATE users SET password_hash = ?, updated_at = ? WHERE user_id = ?`,
      [newPasswordHash, getKenyaTimeISO(), userId],
    );
    console.log(`✅ Updated password for user ${userId}`);
    return true;
  }

  static async getUserSessions(userId) {
    try {
      console.log(`📱 Getting sessions for user ${userId}`);
      return [];
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }

  static async terminateSession(userId, sessionId) {
    try {
      console.log(`🔚 Terminating session ${sessionId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error("Error terminating session:", error);
      return false;
    }
  }
}

module.exports = UserAuthModel;
