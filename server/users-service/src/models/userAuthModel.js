// models/userAuthModel.js - Complete Fixed Version (No syntax errors)

const { safeQuery, safeQueryOne } = require("../configurations/db");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");
const Logger = require("../utils/logger/logger");

class UserAuthModel {
  /**
   * Find user for authentication (by username OR email)
   */
  static async findUserForAuth(identifier) {
    if (!identifier) return null;

    console.log(` Looking for user with identifier: ${identifier}`);

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
   * Find user by email
   */
  static async findUserByEmail(email) {
    if (!email) return null;

    console.log(`🔍 Looking for user by email: ${email}`);

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
   * Find user by username
   */
  static async findUserByUsername(username) {
    if (!username) return null;

    console.log(`🔍 Looking for user by username: ${username}`);

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
      WHERE anonymous_username = ?
      LIMIT 1`,
      [username],
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
  // SESSION MANAGEMENT METHODS
  // ============================================

  static async storeRefreshToken({ userId, refreshToken, userAgent, ipAddress, expiresAt }) {
    try {
      await safeQuery(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id VARCHAR(50) NOT NULL,
          token VARCHAR(500) NOT NULL,
          user_agent TEXT,
          ip_address VARCHAR(50),
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_id (user_id),
          INDEX idx_token (token)
        )
      `);

      await safeQuery(
        `INSERT INTO refresh_tokens (user_id, token, user_agent, ip_address, expires_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, refreshToken, userAgent, ipAddress, expiresAt],
      );
      console.log(`✅ Stored refresh token for user ${userId}`);
      return true;
    } catch (error) {
      Logger.error("Error storing refresh token:", error);
      return false;
    }
  }

  static async isValidRefreshToken(userId, token) {
    try {
      const rows = await safeQuery(
        `SELECT * FROM refresh_tokens WHERE user_id = ? AND token = ? AND expires_at > NOW()`,
        [userId, token],
      );
      return rows.length > 0;
    } catch (error) {
      Logger.error("Error validating refresh token:", error);
      return false;
    }
  }

  static async invalidateRefreshToken(userId, token) {
    try {
      await safeQuery(
        `DELETE FROM refresh_tokens WHERE user_id = ? AND token = ?`,
        [userId, token],
      );
      console.log(`✅ Invalidated refresh token for user ${userId}`);
      return true;
    } catch (error) {
      Logger.error("Error invalidating refresh token:", error);
      return false;
    }
  }

  static async invalidateExpiredTokens(userId) {
    try {
      await safeQuery(
        `DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < NOW()`,
        [userId],
      );
      console.log(`✅ Invalidated expired tokens for user ${userId}`);
      return true;
    } catch (error) {
      Logger.error("Error invalidating expired tokens:", error);
      return false;
    }
  }

  static async invalidateAllSessionsExcept(userId, currentToken) {
    try {
      await safeQuery(
        `DELETE FROM refresh_tokens WHERE user_id = ? AND token != ?`,
        [userId, currentToken],
      );
      console.log(`✅ Invalidated all sessions except current for user ${userId}`);
      return true;
    } catch (error) {
      Logger.error("Error invalidating sessions:", error);
      return false;
    }
  }

  static async invalidateAllUserSessions(userId) {
    try {
      await safeQuery(`DELETE FROM refresh_tokens WHERE user_id = ?`, [userId]);
      console.log(`✅ Invalidated all sessions for user ${userId}`);
      return true;
    } catch (error) {
      Logger.error("Error invalidating all sessions:", error);
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
      const rows = await safeQuery(
        `SELECT token, user_agent, ip_address, created_at, expires_at 
         FROM refresh_tokens WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
      );
      return rows;
    } catch (error) {
      Logger.error("Error getting user sessions:", error);
      return [];
    }
  }

  static async terminateSession(userId, sessionId) {
    try {
      await safeQuery(
        `DELETE FROM refresh_tokens WHERE user_id = ? AND token = ?`,
        [userId, sessionId],
      );
      console.log(`✅ Terminated session ${sessionId} for user ${userId}`);
      return true;
    } catch (error) {
      Logger.error("Error terminating session:", error);
      return false;
    }
  }
}

module.exports = UserAuthModel;