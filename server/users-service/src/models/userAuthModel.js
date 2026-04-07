// models/userAuthModel.js
const { safeQueryOne, safeQuery } = require("../configurations/db");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");

class AuthModel {
  /**
   * Find user for authentication (includes password hash)
   */
  static async findUserForAuth(username) {
    return await safeQueryOne(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username, 
        password_hash, 
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        is_verified,
        role,
        political_party,
        employment_status,
        created_at
      FROM users 
      WHERE anonymous_username = ? OR real_name = ?`,
      [username, username],
    );
  }

  /**
   * Find user by ID
   */
  static async findUserById(userId) {
    return await safeQueryOne(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username, 
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        is_verified,
        role,
        political_party,
        employment_status,
        created_at
      FROM users 
      WHERE user_id = ?`,
      [userId],
    );
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId) {
    const now = getKenyaTimeISO();
    await safeQuery(`UPDATE users SET updated_at = ? WHERE user_id = ?`, [
      now,
      userId,
    ]);
  }
}

module.exports = AuthModel;
