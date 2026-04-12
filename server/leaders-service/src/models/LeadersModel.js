// models/leadersModel.js
const { safeQuery, safeQueryOne } = require("../configurations/db");
const redis = require("../utils/redis/redis"); // Redis instance
const Logger = require("../utils/logger/logger");
const bcrypt = require("bcrypt");

// Utility to transform leader data for API responses (excludes password)
function transformLeaderData(leader, index) {
  return {
    id: leader.leader_id,
    name: leader.name,
    party: leader.party || null,
    location: leader.location || null,
    position: leader.position || null,
    county: leader.county || null,
    constituency: leader.constituency || null,
    ward: leader.ward || null,
    likes: leader.likes || 0,
    dislikes: leader.dislikes || 0,
    views: leader.views || 0,
    commentsCount: leader.comments_count || 0,
    image: leader.image_url || null,
    verification: leader.verification || null,
    education: leader.education || null,
    experience: leader.experience || null,
    email: leader.email || null,
    phone: leader.phone || null,
    status: leader.status || null,
    rank: index + 1,
  };
}

class LeaderModel {
  // ===== CREATE with password hashing =====
  static async create(data) {
    // Hash password if provided
    if (data.password) {
      const saltRounds = 10;
      data.password_hash = await bcrypt.hash(data.password, saltRounds);
      delete data.password; // Remove plain password
    }

    const columns = Object.keys(data);
    const placeholders = columns.map(() => "?").join(", ");
    const values = Object.values(data);

    const sql = `
      INSERT INTO leaders (${columns.join(", ")})
      VALUES (${placeholders})
    `;

    await safeQuery(sql, values);

    // Update Redis cache after creation
    const cacheKey = "global:all_leaders";
    try {
      const cached = await redis.get(cacheKey);
      const leadersList = cached ? JSON.parse(cached) : [];
      // Don't store password in cache
      const safeData = { ...data };
      delete safeData.password_hash;
      leadersList.unshift(safeData);
      await redis.set(cacheKey, JSON.stringify(leadersList), 'EX', 3600);
    } catch (err) {
      Logger.error("Error updating Redis cache after creating leader:", err);
    }

    // Return data without password
    const { password_hash, ...safeData } = data;
    return safeData;
  }

  // ===== FIND BY EMAIL (for authentication) =====
  static async findByEmail(email) {
    try {
      const leader = await safeQueryOne(
        `SELECT 
          leader_id,
          name,
          email,
          phone,
          password_hash,
          party,
          position,
          position_running_for,
          county,
          constituency,
          ward,
          location,
          image_url,
          education,
          experience,
          verification,
          status,
          created_at,
          updated_at
        FROM leaders
        WHERE email = ? AND status != 'deleted'`,
        [email],
      );

      return leader;
    } catch (error) {
      Logger.error("Error finding leader by email:", error);
      throw error;
    }
  }

  // ===== FIND BY PHONE (for authentication) =====
  static async findByPhone(phone) {
    try {
      const leader = await safeQueryOne(
        `SELECT 
          leader_id,
          name,
          email,
          phone,
          password_hash,
          party,
          position,
          position_running_for,
          county,
          constituency,
          ward,
          location,
          image_url,
          education,
          experience,
          verification,
          status,
          created_at,
          updated_at
        FROM leaders
        WHERE phone = ? AND status != 'deleted'`,
        [phone],
      );

      return leader;
    } catch (error) {
      Logger.error("Error finding leader by phone:", error);
      throw error;
    }
  }

  // ===== VERIFY PASSWORD =====
  static async verifyPassword(leaderId, plainPassword) {
    try {
      const leader = await safeQueryOne(
        `SELECT password_hash FROM leaders WHERE leader_id = ?`,
        [leaderId],
      );

      if (!leader || !leader.password_hash) {
        return false;
      }

      return await bcrypt.compare(plainPassword, leader.password_hash);
    } catch (error) {
      Logger.error("Error verifying password:", error);
      return false;
    }
  }

  // ===== UPDATE PASSWORD =====
  static async updatePassword(leaderId, newPassword) {
    try {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      await safeQuery(
        `UPDATE leaders SET password_hash = ?, updated_at = NOW() WHERE leader_id = ?`,
        [password_hash, leaderId],
      );

      // Clear cache
      await redis.del(`leader:${leaderId}`);
      await redis.del("global:all_leaders");

      return true;
    } catch (error) {
      Logger.error("Error updating password:", error);
      throw error;
    }
  }

  // ===== GET ALL ACTIVE (excludes passwords) =====
  static async getAllActive(limit = 50) {
    const cacheKey = "global:all_leaders";

    try {
      // 1️ Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map((leader, index) =>
          transformLeaderData(leader, index),
        );
      }

      // 2 Fallback to database (exclude password_hash)
      const sql = `
        SELECT 
          leader_id, 
          name, 
          party, 
          location, 
          position,
          county,
          constituency,
          ward,
          email,
          phone,
          likes, 
          dislikes, 
          views, 
          comments_count,
          image_url, 
          verification, 
          education,
          experience,
          status
        FROM leaders                   
        WHERE status = 'active'
        LIMIT ?
      `;
      const leaders = await safeQuery(sql, [limit]);

      // Transform for API response
      const transformedLeaders = leaders.map((leader, index) =>
        transformLeaderData(leader, index),
      );

      // Cache results for 1 hour
      await redis.set(cacheKey, JSON.stringify(leaders), 'EX', 3600);

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error fetching all active leaders:", error);
      throw new Error("Failed to fetch leaders");
    }
  }

  // ===== GET BY ID - COMPLETE WITH ALL FIELDS (excludes password) =====
  static async getById(leaderId) {
    try {
      const leader = await safeQueryOne(
        `SELECT 
          leader_id,
          name,
          email,
          phone,
          party,
          slogan,
          motto,
          position,
          position_running_for as vying_for,
          county,
          constituency,
          ward,
          location,
          image_url,
          education,
          experience,
          verification,
          status,
          likes,
          dislikes,
          views,
          followers,
          created_at,
          updated_at
        FROM leaders
        WHERE leader_id = ?`,
        [leaderId],
      );

      if (!leader) {
        return null;
      }

      // Get images
      const images = await safeQuery(
        `SELECT 
          image_url, 
          thumbnail_url, 
          is_primary 
        FROM leader_images 
        WHERE leader_id = ? 
        ORDER BY is_primary DESC`,
        [leaderId],
      );

      // Get social links
      const socialLinks = await safeQuery(
        `SELECT type, url FROM leader_portfolio WHERE leader_id = ?`,
        [leaderId],
      );

      // Process education - handle both array and pipe-separated string
      let educationList = [];
      if (leader.education) {
        if (Array.isArray(leader.education)) {
          educationList = leader.education;
        } else if (typeof leader.education === "string") {
          try {
            // Try JSON parse first
            educationList = JSON.parse(leader.education);
          } catch {
            // Fallback to pipe separation
            educationList = leader.education
              .split("|")
              .map((e) => e.trim())
              .filter((e) => e);
          }
        }
      }

      // Process experience - handle both array and pipe-separated string
      let experienceList = [];
      if (leader.experience) {
        if (Array.isArray(leader.experience)) {
          experienceList = leader.experience;
        } else if (typeof leader.experience === "string") {
          try {
            // Try JSON parse first
            experienceList = JSON.parse(leader.experience);
          } catch {
            // Fallback to pipe separation
            experienceList = leader.experience
              .split("|")
              .map((e) => e.trim())
              .filter((e) => e);
          }
        }
      }

      // Find primary image
      const primaryImage = images.find((img) => img.is_primary) || images[0];

      return {
        ...leader,
        education: educationList,
        experience: experienceList,
        images: images,
        primary_image: primaryImage?.image_url || leader.image_url,
        thumbnail_image: primaryImage?.thumbnail_url || leader.image_url,
        social_links: socialLinks,
      };
    } catch (error) {
      Logger.error("Error in getById:", error);
      throw error;
    }
  }

  // ===== GET BY COUNTY =====
  static async getByCounty(county, limit = 50) {
    try {
      const cacheKey = `county:${county}:leaders`;

      // Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map((leader, index) =>
          transformLeaderData(leader, index),
        );
      }

      const sql = `
        SELECT 
          leader_id, 
          name, 
          party, 
          location, 
          position,
          county,
          constituency,
          ward,
          email,
          phone,
          likes, 
          dislikes, 
          views, 
          comments_count,
          image_url, 
          verification, 
          education,
          experience,
          status
        FROM leaders                   
        WHERE status = 'active' 
          AND county = ?
        LIMIT ?
      `;

      const leaders = await safeQuery(sql, [county, limit]);
      const transformedLeaders = leaders.map((leader, index) =>
        transformLeaderData(leader, index),
      );

      // Cache for 30 minutes
      await redis.set(cacheKey, JSON.stringify(leaders), 'EX', 1800);

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error fetching leaders by county:", error);
      throw new Error("Failed to fetch leaders by county");
    }
  }

  // ===== GET BY CONSTITUENCY =====
  static async getByConstituency(constituency, limit = 50) {
    try {
      const cacheKey = `constituency:${constituency}:leaders`;

      // Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map((leader, index) =>
          transformLeaderData(leader, index),
        );
      }

      const sql = `
        SELECT 
          leader_id, 
          name, 
          party, 
          location, 
          position,
          county,
          constituency,
          ward,
          email,
          phone,
          likes, 
          dislikes, 
          views, 
          comments_count,
          image_url, 
          verification, 
          education,
          experience,
          status
        FROM leaders                   
        WHERE status = 'active' 
          AND constituency = ?
        LIMIT ?
      `;

      const leaders = await safeQuery(sql, [constituency, limit]);
      const transformedLeaders = leaders.map((leader, index) =>
        transformLeaderData(leader, index),
      );

      // Cache for 30 minutes
      await redis.set(cacheKey, JSON.stringify(leaders), { EX: 1800 });

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error fetching leaders by constituency:", error);
      throw new Error("Failed to fetch leaders by constituency");
    }
  }

  // ===== GET BY WARD =====
  static async getByWard(ward, limit = 50) {
    try {
      const cacheKey = `ward:${ward}:leaders`;

      // Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map((leader, index) =>
          transformLeaderData(leader, index),
        );
      }

      const sql = `
        SELECT 
          leader_id, 
          name, 
          party, 
          location, 
          position,
          county,
          constituency,
          ward,
          email,
          phone,
          likes, 
          dislikes, 
          views, 
          comments_count,
          image_url, 
          verification, 
          education,
          experience,
          status
        FROM leaders                   
        WHERE status = 'active' 
          AND ward = ?
        LIMIT ?
      `;

      const leaders = await safeQuery(sql, [ward, limit]);
      const transformedLeaders = leaders.map((leader, index) =>
        transformLeaderData(leader, index),
      );

      // Cache for 30 minutes
      await redis.set(cacheKey, JSON.stringify(leaders), { EX: 1800 });

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error fetching leaders by ward:", error);
      throw new Error("Failed to fetch leaders by ward");
    }
  }

  // ===== GET BY POSITION =====
  static async getByPosition(position, limit = 50) {
    try {
      const cacheKey = `position:${position}:leaders`;

      // Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map((leader, index) =>
          transformLeaderData(leader, index),
        );
      }

      const sql = `
        SELECT 
          leader_id, 
          name, 
          party, 
          location, 
          position,
          county,
          constituency,
          ward,
          email,
          phone,
          likes, 
          dislikes, 
          views, 
          comments_count,
          image_url, 
          verification, 
          education,
          experience,
          status
        FROM leaders                   
        WHERE status = 'active' 
          AND (position = ? OR position_running_for = ?)
        LIMIT ?
      `;

      const leaders = await safeQuery(sql, [position, position, limit]);
      const transformedLeaders = leaders.map((leader, index) =>
        transformLeaderData(leader, index),
      );

      // Cache for 30 minutes
      await redis.set(cacheKey, JSON.stringify(leaders), 'EX', 1800);

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error fetching leaders by position:", error);
      throw new Error("Failed to fetch leaders by position");
    }
  }

  // ===== GET SEARCH RESULTS =====
  static async searchLeaders(searchTerm, limit = 20) {
    try {
      const cacheKey = `search:${searchTerm}:leaders`;

      // Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map((leader, index) =>
          transformLeaderData(leader, index),
        );
      }

      const sql = `
        SELECT 
          leader_id, 
          name, 
          party, 
          location, 
          position,
          county,
          constituency,
          ward,
          email,
          phone,
          likes, 
          dislikes, 
          views, 
          comments_count,
          image_url, 
          verification, 
          education,
          experience,
          status
        FROM leaders                   
        WHERE status = 'active' 
          AND (
            name LIKE ? OR 
            party LIKE ? OR 
            county LIKE ? OR 
            constituency LIKE ? OR 
            ward LIKE ? OR
            position LIKE ? OR
            position_running_for LIKE ? OR
            email LIKE ? OR
            phone LIKE ?
          )
        LIMIT ?
      `;

      const searchPattern = `%${searchTerm}%`;
      const leaders = await safeQuery(sql, [
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        limit,
      ]);

      const transformedLeaders = leaders.map((leader, index) =>
        transformLeaderData(leader, index),
      );

      // Cache for 15 minutes
      await redis.set(cacheKey, JSON.stringify(leaders), 'EX', 900);

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error searching leaders:", error);
      throw new Error("Failed to search leaders");
    }
  }

  // ===== STATS =====
  static async getStats(leaderId) {
    const [likes, dislikes, views, followers] = await Promise.all([
      safeQueryOne(
        `SELECT COUNT(*) AS count FROM leader_likes WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) AS count FROM leader_dislikes WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) AS count FROM leader_views WHERE leader_id = ?`,
        [leaderId],
      ),
      safeQueryOne(
        `SELECT COUNT(*) AS count FROM leader_followers WHERE leader_id = ?`,
        [leaderId],
      ),
    ]);

    return {
      likes: likes?.count || 0,
      dislikes: dislikes?.count || 0,
      views: views?.count || 0,
      followers: followers?.count || 0,
    };
  }

  // ===== PORTFOLIO =====
  static async getPortfolio(leaderId) {
    return safeQuery(
      `SELECT type, url FROM leader_portfolio WHERE leader_id = ?`,
      [leaderId],
    );
  }

  // ===== UPDATE LEADER =====
  static async update(leaderId, data) {
    const fields = Object.keys(data);
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = [...Object.values(data), leaderId];

    const sql = `
      UPDATE leaders 
      SET ${setClause}, updated_at = NOW()
      WHERE leader_id = ?
    `;

    await safeQuery(sql, values);

    // Clear related caches
    await Promise.all([
      redis.del("global:all_leaders"),
      redis.del(`leader:${leaderId}`),
    ]);

    return true;
  }

  // ===== UPDATE PROFILE (with password handling) =====
  static async updateProfile(leaderId, updateData) {
    const fields = [];
    const values = [];

    // Handle password separately
    if (updateData.password) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(updateData.password, saltRounds);
      fields.push("password_hash = ?");
      values.push(password_hash);
      delete updateData.password;
    }

    // Handle other fields
    const allowedFields = [
      "name",
      "email",
      "phone",
      "party",
      "slogan",
      "motto",
      "position",
      "position_running_for",
      "county",
      "constituency",
      "ward",
      "location",
      "education",
      "experience",
      "bio",
      "image_url",
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        // Stringify arrays for storage
        if (
          (field === "education" || field === "experience") &&
          Array.isArray(updateData[field])
        ) {
          values.push(JSON.stringify(updateData[field]));
        } else {
          values.push(updateData[field]);
        }
      }
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push("updated_at = NOW()");
    values.push(leaderId);

    const sql = `
      UPDATE leaders 
      SET ${fields.join(", ")} 
      WHERE leader_id = ?
    `;

    await safeQuery(sql, values);

    // Clear caches
    await Promise.all([
      redis.del("global:all_leaders"),
      redis.del(`leader:${leaderId}`),
    ]);

    return true;
  }
}

module.exports = LeaderModel;
