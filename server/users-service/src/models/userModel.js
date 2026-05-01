// models/userModel.js
const { safeQuery, safeQueryOne } = require("../configurations/db");
const { randomUUID } = require("crypto");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");

const saltRounds = 10;

// ============================================
// ROLE CONSTANTS
// ============================================
const ROLES = {
  USER: "user",
  ADMIN: "admin",
  MARKET_ADMIN: "market_admin",
  SUPER_ADMIN: "super_admin",
  CEO: "ceo",
};

const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.MARKET_ADMIN]: 3,
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.CEO]: 5,
};

const VALID_ROLES = Object.values(ROLES);

class UserModel {
  /**
   * Check if a role is valid
   */
  static isValidRole(role) {
    return VALID_ROLES.includes(role);
  }

  /**
   * Get role hierarchy level
   */
  static getRoleLevel(role) {
    return ROLE_HIERARCHY[role] || 0;
  }

  /**
   * Check if user has permission to assign a role
   */
  static canAssignRole(assignerRole, targetRole) {
    const assignerLevel = this.getRoleLevel(assignerRole);
    const targetLevel = this.getRoleLevel(targetRole);
    return assignerLevel > targetLevel;
  }

  /**
   * Check if user has permission to access a resource
   */
  static hasPermission(userRole, requiredRole) {
    const userLevel = this.getRoleLevel(userRole);
    const requiredLevel = this.getRoleLevel(requiredRole);
    return userLevel >= requiredLevel;
  }

  /**
   * Generate a unique user ID
   */
  static generateUserId() {
    return `USR-${randomUUID().split("-").slice(0, 2).join("-")}`;
  }

  /**
   * Generate a unique anonymous username (fallback when user doesn't choose)
   */
  static async generateAnonymousUserName() {
    const maxAttempts = 5;

    for (let i = 0; i < maxAttempts; i++) {
      const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      const username = `Anon_KE_${suffix}`;

      const exists = await this.findByUsername(username);
      if (!exists) return username;
    }

    // fallback if unlikely collision persists
    const timestamp = Date.now().toString().slice(-6);
    return `Anon_KE_${timestamp}`;
  }

  /**
   * Validate username format - NO RESTRICTIONS! Just check not empty
   */
  static isValidUsername(username) {
    if (!username) return false;
    return username.length > 0 && username.length <= 100;
  }

  /**
   * Validate real name
   */
  static isValidRealName(realName) {
    const nameRegex = /^[a-zA-Z\s\-'.]{3,100}$/; // Relaxed to allow apostrophes, dots, etc.
    return nameRegex.test(realName.trim());
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    if (!email) return null;
    return await safeQueryOne(
      "SELECT * FROM users WHERE personal_email = ? LIMIT 1",
      [email],
    );
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    return await safeQueryOne(
      "SELECT * FROM users WHERE anonymous_username = ? LIMIT 1",
      [username],
    );
  }

  /**
   * Alias for findByUsername
   */
  static async findByAnonymousUsername(username) {
    return await this.findByUsername(username);
  }

  /**
   * Find users by real name
   */
  static async findByRealName(realName) {
    return await safeQuery(
      "SELECT * FROM users WHERE real_name LIKE ? ORDER BY created_at DESC",
      [`%${realName}%`],
    );
  }

  /**
   * Find user by ID
   */
  static async findById(userId) {
    return await safeQueryOne("SELECT * FROM users WHERE user_id = ? LIMIT 1", [
      userId,
    ]);
  }

  /**
   * Find user by ID with role
   */
  static async findByIdWithRole(userId) {
    return await safeQueryOne(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username, 
        role,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        political_party,
        employment_status,
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
   * Find user by ID with full details
   */
  static async findByIdWithDetails(userId) {
    return await safeQueryOne(
      `SELECT 
        user_id, 
        anonymous_username,
        real_name,
        role,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        voter_card,
        will_vote,
        political_party,
        employment_status,
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
   * Find user by role
   */
  static async findByRole(role, limit = 100, offset = 0) {
    return await safeQuery(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username, 
        role,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        is_verified,
        created_at
      FROM users
      WHERE role = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [role, limit, offset],
    );
  }

  /**
   * Get all users with role information
   */
  static async getAllWithRoles(limit = 100, offset = 0) {
    return await safeQuery(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username, 
        role,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        is_verified,
        created_at,
        updated_at
      FROM users
      ORDER BY 
        FIELD(role, 'ceo', 'super_admin', 'market_admin', 'admin', 'user'),
        created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset],
    );
  }

  /**
   * Get all users (paginated)
   */
  static async getAll(limit = 50, offset = 0) {
    return await safeQuery(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username,
        role,
        gender,
        age_bracket,
        generation,
        county,
        ward,
        political_party,
        employment_status,
        is_verified,
        created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset],
    );
  }

  /**
   * Get total count of users
   */
  static async getTotalCount() {
    const result = await safeQueryOne(`SELECT COUNT(*) as total FROM users`);
    return result?.total || 0;
  }

  /**
   * Update user role (admin only)
   */
  static async updateRole(userId, newRole, updatedBy) {
    if (!this.isValidRole(newRole)) {
      throw new Error(
        `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      );
    }

    await safeQuery(
      `UPDATE users 
       SET role = ?, updated_at = ?, updated_by = ?
       WHERE user_id = ?`,
      [newRole, getKenyaTimeISO(), updatedBy, userId],
    );

    return true;
  }

  /**
   * Update user role with permission check
   */
  static async updateUserRole(userId, newRole, updatedByUserId, updatedByRole) {
    // Validate the new role
    if (!this.isValidRole(newRole)) {
      throw new Error(
        `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}`,
      );
    }

    // Check if the user making the change has permission
    if (!this.canAssignRole(updatedByRole, newRole)) {
      throw new Error("You don't have permission to assign this role");
    }

    // Get current user role
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if downgrading from higher role
    if (this.getRoleLevel(user.role) > this.getRoleLevel(newRole)) {
      // Only super_admin and CEO can downgrade higher roles
      if (!this.hasPermission(updatedByRole, ROLES.SUPER_ADMIN)) {
        throw new Error("You don't have permission to downgrade this user");
      }
    }

    await safeQuery(
      `UPDATE users 
       SET role = ?, updated_at = ?, updated_by = ?
       WHERE user_id = ?`,
      [newRole, getKenyaTimeISO(), updatedByUserId, userId],
    );

    return true;
  }

  /**
   * Create a new user - Default role is "user"
   */
  static async create(userData) {
    const {
      real_name,
      anonymous_username,
      gender,
      age_bracket,
      generation,
      county,
      ward,
      voter_card,
      will_vote,
      password_hash,
      role,
      political_party,
      employment_status,
      personal_email,
      phone_number,
      political_leanings,
      vote_frequency,
      constituency,
    } = userData;

    const user_id = this.generateUserId();
    const now = getKenyaTimeISO();

    // Validations
    if (!real_name) {
      throw new Error("Real name is required");
    }

    if (!this.isValidRealName(real_name)) {
      throw new Error(
        "Real name must be 3-100 characters and contain only letters, spaces, and hyphens",
      );
    }

    if (!anonymous_username) {
      throw new Error("Username is required");
    }

    if (!this.isValidUsername(anonymous_username)) {
      throw new Error(
        "Username is required and must be less than 100 characters",
      );
    }

    // Set default role to "user" if not provided or invalid
    let userRole = ROLES.USER;
    if (role && this.isValidRole(role)) {
      userRole = role;
    }

    const normalizedCounty = this.normalizeCounty(county);
    const finalPoliticalParty = political_party || "Undecided";
    const finalEmploymentStatus = employment_status || "Prefer not to say";
    const finalPoliticalLeanings = political_leanings || "Prefer not to say";
    const finalVoteFrequency = vote_frequency || "Prefer not to say";

    await safeQuery(
      `INSERT INTO users
        (user_id, real_name, anonymous_username, gender, age_bracket, generation, county, ward, constituency,
         voter_card, will_vote, password_hash, role, political_party, employment_status, 
         personal_email, phone_number, political_leanings, vote_frequency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        real_name.trim(),
        anonymous_username,
        gender || null,
        age_bracket || null,
        generation || null,
        normalizedCounty,
        ward || null,
        constituency || null,
        voter_card || 0,
        will_vote !== undefined && will_vote !== null ? will_vote : 2,
        password_hash,
        userRole,
        finalPoliticalParty,
        finalEmploymentStatus,
        personal_email || null,
        phone_number || null,
        finalPoliticalLeanings,
        finalVoteFrequency,
        now,
        now,
      ],
    );

    return user_id;
  }

  /**
   * Update user - with role validation
   */
  static async update(userId, updateData, updatedByRole = null) {
    const fields = [];
    const values = [];

    const allowedFields = [
      "real_name",
      "anonymous_username",
      "county",
      "ward",
      "gender",
      "age_bracket",
      "generation",
      "voter_card",
      "will_vote",
      "political_party",
      "employment_status",
      "personal_email",
      "phone_number",
      "political_leanings",
      "vote_frequency",
      "constituency",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        fields.push(`${field} = ?`);

        if (field === "real_name" && !this.isValidRealName(updateData[field])) {
          throw new Error(
            "Real name must be 3-100 characters and contain only letters, spaces, and hyphens",
          );
        }

        if (
          field === "anonymous_username" &&
          !this.isValidUsername(updateData[field])
        ) {
          throw new Error("Username must be less than 100 characters");
        }

        if (field === "county" && updateData[field]) {
          values.push(this.normalizeCounty(updateData[field]));
        } else if (field === "real_name") {
          values.push(updateData[field].trim());
        } else {
          values.push(updateData[field]);
        }
      }
    });

    if (fields.length === 0) {
      return false;
    }

    fields.push("updated_at = ?");
    values.push(getKenyaTimeISO());
    values.push(userId);

    await safeQuery(
      `UPDATE users SET ${fields.join(", ")} WHERE user_id = ?`,
      values,
    );

    return true;
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId) {
    await safeQuery("UPDATE users SET updated_at = ? WHERE user_id = ?", [
      getKenyaTimeISO(),
      userId,
    ]);
  }

  /**
   * Check if user exists
   */
  static async exists(userId) {
    const user = await safeQueryOne(
      "SELECT 1 FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return !!user;
  }

  /**
   * Check if username exists (for validation)
   */
  static async usernameExists(username) {
    const user = await safeQueryOne(
      "SELECT 1 FROM users WHERE anonymous_username = ? LIMIT 1",
      [username],
    );
    return !!user;
  }

  /**
   * Check if email exists
   */
  static async emailExists(email) {
    if (!email) return false;
    const user = await safeQueryOne(
      "SELECT 1 FROM users WHERE personal_email = ? LIMIT 1",
      [email],
    );
    return !!user;
  }

  /**
   * Get user stats (engagements, votes, comments, following)
   */
  static async getUserStats(userId) {
    const [stats] = await safeQuery(
      `SELECT 
        (SELECT COUNT(*) FROM leader_engagements WHERE user_id = ?) as total_engagements,
        (SELECT COUNT(*) FROM manifesto_votes WHERE user_id = ?) as total_manifesto_votes,
        (SELECT COUNT(*) FROM leader_comments WHERE user_id = ?) as total_comments,
        (SELECT COUNT(*) FROM user_following WHERE user_id = ? AND following_type = 'leader') as following_count
      FROM dual`,
      [userId, userId, userId, userId],
    );

    return (
      stats || {
        total_engagements: 0,
        total_manifesto_votes: 0,
        total_comments: 0,
        following_count: 0,
      }
    );
  }

  /**
   * Get count of users by county
   */
  static async getCountByCounty(county) {
    const [result] = await safeQuery(
      `SELECT COUNT(*) AS total FROM users WHERE county = ?`,
      [county],
    );
    return result ? result.total : 0;
  }

  /**
   * Get user counts grouped by county
   */
  static async getUserCountsByCounty() {
    return await safeQuery(
      `SELECT county, COUNT(*) AS count
       FROM users
       GROUP BY county
       ORDER BY count DESC`,
    );
  }

  /**
   * Get county statistics with registration rates
   */
  static async getCountyStats() {
    return await safeQuery(
      `SELECT 
        county, 
        COUNT(*) AS total_users,
        SUM(CASE WHEN voter_card = 1 THEN 1 ELSE 0 END) AS registered_voters,
        SUM(CASE WHEN will_vote = 1 THEN 1 ELSE 0 END) AS will_vote_count,
        SUM(CASE WHEN will_vote = 0 THEN 1 ELSE 0 END) AS wont_vote_count,
        SUM(CASE WHEN will_vote = 2 THEN 1 ELSE 0 END) AS undecided_count,
        ROUND((SUM(CASE WHEN voter_card = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 1) AS registration_rate
      FROM users
      WHERE county IS NOT NULL AND county != ''
      GROUP BY county
      ORDER BY total_users DESC`,
      [],
    );
  }

  /**
   * Get role distribution statistics
   */
  static async getRoleDistribution() {
    return await safeQuery(
      `SELECT 
        role, 
        COUNT(*) AS count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users)), 2) AS percentage
      FROM users
      GROUP BY role
      ORDER BY 
        FIELD(role, 'ceo', 'super_admin', 'market_admin', 'admin', 'user')`,
    );
  }

  /**
   * Get comprehensive demographic statistics
   */
  static async getDemographicStats() {
    const byAge = await safeQuery(
      `SELECT age_bracket, COUNT(*) AS count
       FROM users
       WHERE age_bracket IS NOT NULL
       GROUP BY age_bracket
       ORDER BY FIELD(age_bracket, '18-25','26-35','36-45','46-55','56+')`,
    );

    const byGender = await safeQuery(
      `SELECT gender, COUNT(*) AS count
       FROM users
       WHERE gender IS NOT NULL
       GROUP BY gender`,
    );

    const byGeneration = await safeQuery(
      `SELECT generation, COUNT(*) AS count
       FROM users
       WHERE generation IS NOT NULL
       GROUP BY generation`,
    );

    const byCounty = await safeQuery(
      `SELECT county, COUNT(*) AS count
       FROM users
       WHERE county IS NOT NULL
       GROUP BY county
       ORDER BY count DESC`,
    );

    const byPoliticalParty = await safeQuery(
      `SELECT political_party, COUNT(*) AS count
       FROM users
       WHERE political_party IS NOT NULL
       GROUP BY political_party
       ORDER BY count DESC`,
    );

    const byEmploymentStatus = await safeQuery(
      `SELECT employment_status, COUNT(*) AS count
       FROM users
       WHERE employment_status IS NOT NULL
       GROUP BY employment_status
       ORDER BY count DESC`,
    );

    const byRole = await this.getRoleDistribution();

    const voterStats = await safeQuery(
      `SELECT 
        SUM(voter_card = 1) AS registered_voters,
        SUM(voter_card = 0) AS not_registered,
        SUM(will_vote = 1) AS will_vote,
        SUM(will_vote = 0) AS wont_vote,
        SUM(will_vote = 2) AS undecided,
        COUNT(*) AS total_users
      FROM users`,
    );

    const genderVotes = await safeQuery(
      `SELECT gender,
        SUM(will_vote = 1) AS votes,
        COUNT(*) AS total_users
      FROM users
      GROUP BY gender
      ORDER BY votes DESC`,
    );

    const generationVotes = await safeQuery(
      `SELECT generation,
        SUM(will_vote = 1) AS votes,
        COUNT(*) AS total_users
      FROM users
      GROUP BY generation
      ORDER BY votes DESC`,
    );

    const countyVotes = await safeQuery(
      `SELECT county,
        SUM(will_vote = 1) AS votes,
        COUNT(*) AS total_users
      FROM users
      GROUP BY county
      ORDER BY votes ASC`,
    );

    const countyStats = await this.getCountyStats();

    return {
      by_age: byAge || [],
      by_gender: byGender || [],
      by_generation: byGeneration || [],
      by_county: byCounty || [],
      by_political_party: byPoliticalParty || [],
      by_employment_status: byEmploymentStatus || [],
      by_role: byRole || [],
      voting_intentions: voterStats[0] || {
        registered_voters: 0,
        not_registered: 0,
        will_vote: 0,
        wont_vote: 0,
        undecided: 0,
        total_users: 0,
      },
      gender_votes: genderVotes || [],
      generation_votes: generationVotes || [],
      county_votes: countyVotes || [],
      county_stats: countyStats || [],
    };
  }

  // ============================================
  // VALIDATION HELPERS
  // ============================================

  static isValidPoliticalParty(party) {
    return true;
  }

  static isValidEmploymentStatus(status) {
    return true;
  }

  static getGenerationLabel(bracket) {
    const mapping = {
      "18-30": "Gen Z",
      "31-40": "Millennial",
      "41-50": "Gen X",
      "51-60": "Gen X",
      "61+": "Boomer",
    };
    return mapping[bracket] || "Unknown";
  }

  static isValidAgeBracket(bracket) {
    const validBrackets = ["18-30", "31-40", "41-50", "51-60", "61+", "Prefer not to say"];
    return validBrackets.includes(bracket);
  }

  static isValidCounty(county) {
    if (!county) return true;
    return typeof county === "string" && county.trim().length > 0;
  }

  static normalizeCounty(county) {
    if (!county) return null;
    return county
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

// Export ROLES for use in other files
module.exports = { UserModel, ROLES, VALID_ROLES, ROLE_HIERARCHY };
