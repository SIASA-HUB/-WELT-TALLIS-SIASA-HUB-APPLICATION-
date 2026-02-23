const { safeQuery, safeQueryOne } = require("../configurations/db");
const { randomUUID } = require("crypto");
const bcrypt = require("bcrypt");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamps");
const KENYA_COUNTIES = require("../utils/kenyanCounty/counties");

const saltRounds = 10;

class UserModel {
  /**
   * Generate a unique user ID
   */
  static generateUserId() {
    return `USR-${randomUUID().split("-").slice(0, 2).join("-")}`;
  }

  /**
   * Generate a unique anonymous username
   */

  static async generateAnonymousUserName() {
    const maxAttempts = 5;

    for (let i = 0; i < maxAttempts; i++) {
      const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      const username = `Anon-KE-${suffix}`;

      const exists = await this.findByUsername(username);
      if (!exists) return username;
    }

    // fallback if unlikely collision persists
    const timestamp = Date.now().toString().slice(-6);
    return `Anon-KE-${timestamp}`;
  }

  // Maps the numeric age bracket to a Generation Label

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
  //  validate   age  barckets
  static isValidAgeBracket(bracket) {
    const validBrackets = ["18-25", "26-35", "36-45", "46-55", "56+"];
    return validBrackets.includes(bracket);
  }

  //   validate   county  name

  static isValidCounty(county) {
    if (!county) return true;
    return KENYA_COUNTIES.map((c) => c.toLowerCase()).includes(
      county.trim().toLowerCase(),
    );
  }

  //  hash  passwords
  static async hashPassword(password) {
    return await bcrypt.hash(password, saltRounds);
  }

  //  compare    passwords
  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  //   find user  by username
  static async findByUsername(username) {
    return await safeQueryOne(
      "SELECT * FROM users WHERE anonymous_username = ? LIMIT 1",
      [username],
    );
  }

  //  find user  by id
  static async findById(userId) {
    return await safeQueryOne("SELECT * FROM users WHERE user_id = ? LIMIT 1", [
      userId,
    ]);
  }

  //  user  by  id   with all details
  static async findByIdWithDetails(userId) {
    return await safeQueryOne(
      `SELECT 
                user_id, 
                anonymous_username, 
                gender,
                age_bracket,
                generation,
                county,
                ward,
                voter_card,
                will_vote,
                is_verified,
                created_at,
                updated_at
            FROM users 
            WHERE user_id = ? 
            LIMIT 1`,
      [userId],
    );
  }

  //   craete  new  user
  static async create(userData) {
    const {
      anonymous_username,
      gender,
      age_bracket,
      generation,
      county,
      ward,
      voter_card,
      will_vote,
      password_hash,
      role, //  optional  default    user
    } = userData;

    const user_id = this.generateUserId();
    const now = getKenyaTimeISO();

    // normalize county
    const normalizedCounty = this.normalizeCounty(county);

    // default role
    const userRole = role || "user";

    await safeQuery(
      `INSERT INTO users
        (user_id, anonymous_username, gender, age_bracket, generation, county, ward,
         voter_card, will_vote, password_hash, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        anonymous_username,
        gender || null,
        age_bracket || null,
        generation || null,
        normalizedCounty,
        ward || null,
        voter_card || false,
        will_vote || null,
        password_hash,
        userRole,
        now,
        now,
      ],
    );

    return user_id;
  }

  //  update  user
  static async update(userId, updateData) {
    const fields = [];
    const values = [];

    //  update    query
    const allowedFields = [
      "anonymous_username",
      "county",
      "ward",
      "gender",
      "age_bracket",
      "generation",
      "voter_card",
      "will_vote",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(updateData[field]);
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

  //  last login attempt
  static async updateLastLogin(userId) {
    await safeQuery("UPDATE users SET updated_at = ? WHERE user_id = ?", [
      getKenyaTimeISO(),
      userId,
    ]);
  }

  //  if user  exists  by id
  static async exists(userId) {
    const user = await safeQueryOne(
      "SELECT 1 FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return !!user;
  }

  //    get user stattistics

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

  //  alll users
  static async getAll(limit = 50, offset = 0) {
    return await safeQuery(
      `SELECT 
                user_id, 
                anonymous_username, 
                gender,
                age_bracket,
                generation,
                county,
                ward,
                is_verified,
                created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?`,
      [limit, offset],
    );
  }

  // users  by county

  static async getCountByCounty(county) {
    const [result] = await safeQuery(
      `SELECT COUNT(*) AS total FROM users WHERE county = ?`,
      [county],
    );

    return result ? result.total : 0;
  }

  //  all user  counts   by     county

  static async getUserCountsByCounty() {
    const rows = await safeQuery(
      `SELECT county, COUNT(*) AS count
       FROM users
       GROUP BY county
       ORDER BY count DESC`,
    );

    // returns array of { county, count }
    return rows;
  }

  //  user  demogarphic  statistsics

  static async getDemographicStats() {
    // 1️⃣ Age distribution
    const byAge = await safeQuery(
      `SELECT age_bracket, COUNT(*) AS count
     FROM users
     WHERE age_bracket IS NOT NULL
     GROUP BY age_bracket
     ORDER BY FIELD(age_bracket, '18-25','26-35','36-45','46-55','56+')`,
    );

    // 2️⃣ Gender distribution
    const byGender = await safeQuery(
      `SELECT gender, COUNT(*) AS count
     FROM users
     WHERE gender IS NOT NULL
     GROUP BY gender`,
    );

    // 3️⃣ Generation distribution
    const byGeneration = await safeQuery(
      `SELECT generation, COUNT(*) AS count
     FROM users
     WHERE generation IS NOT NULL
     GROUP BY generation`,
    );

    // 4️⃣ County distribution
    const byCounty = await safeQuery(
      `SELECT county, COUNT(*) AS count
     FROM users
     WHERE county IS NOT NULL
     GROUP BY county
     ORDER BY count DESC`,
    );

    // 5️⃣ Voting / registration statistics
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

    // 6️⃣ Gender voting breakdown
    const genderVotes = await safeQuery(
      `SELECT gender,
       SUM(will_vote = 1) AS votes,
       COUNT(*) AS total_users
     FROM users
     GROUP BY gender
     ORDER BY votes DESC`,
    );

    // 7️⃣ Generation voting breakdown
    const generationVotes = await safeQuery(
      `SELECT generation,
       SUM(will_vote = 1) AS votes,
       COUNT(*) AS total_users
     FROM users
     GROUP BY generation
     ORDER BY votes DESC`,
    );

    // 8️⃣ County voting breakdown
    const countyVotes = await safeQuery(
      `SELECT county,
       SUM(will_vote = 1) AS votes,
       COUNT(*) AS total_users
     FROM users
     GROUP BY county
     ORDER BY votes ASC`, // ASC to see counties with less votes first
    );

    return {
      by_age: byAge || [],
      by_gender: byGender || [],
      by_generation: byGeneration || [],
      by_county: byCounty || [],
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
    };
  }
}

module.exports = UserModel;
