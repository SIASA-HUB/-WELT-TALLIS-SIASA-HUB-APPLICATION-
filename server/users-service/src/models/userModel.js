// models/userModel.js
const { safeQuery, safeQueryOne } = require("../configurations/db");
const { randomUUID } = require("crypto");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");

const saltRounds = 10;

class UserModel {
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
    // Only check that username is not empty and not too long (DB limit)
    return username.length > 0 && username.length <= 100;
  }

  /**
   * Validate real name
   */
  static isValidRealName(realName) {
    const nameRegex = /^[a-zA-Z\s-]{3,100}$/;
    return nameRegex.test(realName.trim());
  }

  /**
   * ✅ NO POLITICAL PARTY VALIDATION - Accept anything
   */
  static isValidPoliticalParty(party) {
    // Accept any political party value from frontend
    return true;
  }

  /**
   * ✅ NO EMPLOYMENT STATUS VALIDATION - Accept anything
   */
  static isValidEmploymentStatus(status) {
    // Accept any employment status value from frontend
    return true;
  }

  static getGenerationLabel(bracket) {
    const mapping = {
      "18-25": "Gen Z",
      "26-35": "Millennial",
      "36-45": "Gen X",
      "46-55": "Gen X",
      "56+": "Boomer",
    };
    return mapping[bracket] || "Unknown";
  }

  static isValidAgeBracket(bracket) {
    const validBrackets = ["18-25", "26-35", "36-45", "46-55", "56+"];
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

  // ✅ Find by username (exact match)
  static async findByUsername(username) {
    return await safeQueryOne(
      "SELECT * FROM users WHERE anonymous_username = ? LIMIT 1",
      [username],
    );
  }

  // ✅ Alias for findByUsername
  static async findByAnonymousUsername(username) {
    return await this.findByUsername(username);
  }

  static async findByRealName(realName) {
    return await safeQuery(
      "SELECT * FROM users WHERE real_name LIKE ? ORDER BY created_at DESC",
      [`%${realName}%`],
    );
  }

  static async findById(userId) {
    return await safeQueryOne("SELECT * FROM users WHERE user_id = ? LIMIT 1", [
      userId,
    ]);
  }

  static async findByIdWithDetails(userId) {
    return await safeQueryOne(
      `SELECT 
        user_id, 
        anonymous_username,
        real_name,
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
   * Create a new user - NO VALIDATION on political_party or employment_status
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

    // ✅ NO VALIDATION for political_party or employment_status - accept anything from frontend

    const normalizedCounty = this.normalizeCounty(county);
    const userRole = role || "user";

    // Accept whatever comes from frontend, default if empty
    const finalPoliticalParty = political_party || "Undecided";
    const finalEmploymentStatus = employment_status || "Prefer not to say";

    await safeQuery(
      `INSERT INTO users
        (user_id, real_name, anonymous_username, gender, age_bracket, generation, county, ward,
         voter_card, will_vote, password_hash, role, political_party, employment_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        real_name.trim(),
        anonymous_username,
        gender || null,
        age_bracket || null,
        generation || null,
        normalizedCounty,
        ward || null,
        voter_card || 0,
        will_vote !== undefined && will_vote !== null ? will_vote : 2,
        password_hash,
        userRole,
        finalPoliticalParty,
        finalEmploymentStatus,
        now,
        now,
      ],
    );

    return user_id;
  }

  /**
   * Update user - NO VALIDATION on political_party or employment_status
   */
  static async update(userId, updateData) {
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
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        fields.push(`${field} = ?`);

        // Validations
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

        // ✅ NO VALIDATION for political_party or employment_status - accept anything

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

  static async updateLastLogin(userId) {
    await safeQuery("UPDATE users SET updated_at = ? WHERE user_id = ?", [
      getKenyaTimeISO(),
      userId,
    ]);
  }

  static async exists(userId) {
    const user = await safeQueryOne(
      "SELECT 1 FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return !!user;
  }

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

  static async getAll(limit = 50, offset = 0) {
    return await safeQuery(
      `SELECT 
        user_id, 
        real_name,
        anonymous_username, 
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

  static async getCountByCounty(county) {
    const [result] = await safeQuery(
      `SELECT COUNT(*) AS total FROM users WHERE county = ?`,
      [county],
    );
    return result ? result.total : 0;
  }

  static async getUserCountsByCounty() {
    return await safeQuery(
      `SELECT county, COUNT(*) AS count
       FROM users
       GROUP BY county
       ORDER BY count DESC`,
    );
  }

  /**
   * GET COUNTY STATS - FIXED: Add this missing method
   */
  static async getCountyStats() {
    return await safeQuery(
      `SELECT 
        county, 
        COUNT(*) AS total_users,
        SUM(voter_card = 1) AS registered_voters,
        SUM(will_vote = 1) AS will_vote_count,
        SUM(will_vote = 0) AS wont_vote_count,
        SUM(will_vote = 2) AS undecided_count
      FROM users
      WHERE county IS NOT NULL AND county != ''
      GROUP BY county
      ORDER BY total_users DESC`,
    );
  }

  /**
   * Get demographic stats - groups by actual values from DB
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

    // Political party distribution - groups by whatever users entered
    const byPoliticalParty = await safeQuery(
      `SELECT political_party, COUNT(*) AS count
       FROM users
       WHERE political_party IS NOT NULL
       GROUP BY political_party
       ORDER BY count DESC`,
    );

    // Employment status distribution - groups by whatever users entered
    const byEmploymentStatus = await safeQuery(
      `SELECT employment_status, COUNT(*) AS count
       FROM users
       WHERE employment_status IS NOT NULL
       GROUP BY employment_status
       ORDER BY count DESC`,
    );

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

    // Also include county stats in the response
    const countyStats = await this.getCountyStats();

    return {
      by_age: byAge || [],
      by_gender: byGender || [],
      by_generation: byGeneration || [],
      by_county: byCounty || [],
      by_political_party: byPoliticalParty || [],
      by_employment_status: byEmploymentStatus || [],
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
}

module.exports = UserModel;
