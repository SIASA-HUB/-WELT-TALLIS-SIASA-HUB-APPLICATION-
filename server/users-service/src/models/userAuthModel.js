// models/userAuthModel.js
const { safeQuery, safeQueryOne } = require("../configurations/db");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");

class UserAuthModel {
  /**
   * Find user for authentication (by username)
   * This method is called by loginUser in authController
   */
  static async findUserForAuth(username) {
    if (!username) return null;

    return await safeQueryOne(
      `SELECT 
        user_id, 
        anonymous_username, 
        real_name,
        password_hash,
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
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId) {
    if (!userId) return;

    await safeQuery(`UPDATE users SET updated_at = ? WHERE user_id = ?`, [
      getKenyaTimeISO(),
      userId,
    ]);
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
}

module.exports = UserAuthModel;
