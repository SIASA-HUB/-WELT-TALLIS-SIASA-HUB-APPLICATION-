// models/endorsementModel.js
const { safeQuery, safeQueryOne } = require("../configurations/db");
const redis = require("../utils/redis/redis");
const Logger = require("../utils/logger/logger");

class EndorsementModel {
  // ===== CREATE ENDORSEMENT =====
  static async create(endorsementData) {
    const {
      leader_id,
      user_id,
      user_name,
      amount,
      phrase,
      message,
      image_url,
      level,
    } = endorsementData;

    // Check if user has reached max endorsements for this leader (admin config)
    const maxEndorsements = await this.getMaxEndorsementsPerUser(leader_id);
    const userEndorsementCount = await this.getUserEndorsementCount(
      leader_id,
      user_id,
    );

    if (userEndorsementCount >= maxEndorsements) {
      throw new Error(
        `You have reached the maximum of ${maxEndorsements} endorsement(s) for this leader`,
      );
    }

    const sql = `
      INSERT INTO endorsements (
        leader_id, 
        user_id, 
        user_name, 
        amount, 
        phrase, 
        message, 
        image_url,
        level,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
    `;

    const result = await safeQuery(sql, [
      leader_id,
      user_id,
      user_name,
      amount,
      phrase,
      message,
      image_url,
      level,
    ]);

    // Update leader's endorsement count (not earnings - just count of endorsements)
    await this.updateLeaderEndorsementCount(leader_id);

    // Update user's total endorsements (for user profile)
    await this.updateUserTotalEndorsements(user_id);

    // Update platform total revenue (for admin)
    await this.updatePlatformRevenue(amount);

    // Clear cache for this leader's endorsements
    await this.clearEndorsementCache(leader_id);

    // Return the created endorsement
    const newEndorsement = await this.getById(result.insertId);

    return newEndorsement;
  }

  // ===== GET ENDORSEMENT BY ID =====
  static async getById(endorsementId) {
    const sql = `
      SELECT 
        e.id,
        e.leader_id,
        e.user_id,
        e.user_name,
        e.amount,
        e.phrase,
        e.message,
        e.image_url,
        e.level,
        e.status,
        e.created_at,
        l.name as leader_name,
        l.image_url as leader_image
      FROM endorsements e
      LEFT JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.id = ? AND e.status = 'active'
    `;

    return await safeQueryOne(sql, [endorsementId]);
  }

  // ===== GET ENDORSEMENTS BY LEADER =====
  static async getByLeaderId(leaderId, limit = 50, offset = 0) {
    const cacheKey = `leader:${leaderId}:endorsements:${limit}:${offset}`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const sql = `
        SELECT 
          e.id,
          e.user_id,
          e.user_name,
          e.amount,
          e.phrase,
          e.message,
          e.image_url,
          e.level,
          e.created_at,
          u.avatar_url as user_avatar
        FROM endorsements e
        LEFT JOIN users u ON e.user_id = u.user_id
        WHERE e.leader_id = ? AND e.status = 'active'
        ORDER BY e.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const endorsements = await safeQuery(sql, [leaderId, limit, offset]);

      const countResult = await safeQueryOne(
        `SELECT COUNT(*) as total FROM endorsements WHERE leader_id = ? AND status = 'active'`,
        [leaderId],
      );

      const result = {
        endorsements,
        total: countResult?.total || 0,
        limit,
        offset,
      };

      await redis.set(cacheKey, JSON.stringify(result), { EX: 300 });

      return result;
    } catch (error) {
      Logger.error("Error fetching endorsements by leader:", error);
      throw new Error("Failed to fetch endorsements");
    }
  }

  // ===== GET ENDORSEMENTS BY USER =====
  static async getByUserId(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT 
        e.id,
        e.leader_id,
        e.user_name,
        e.amount,
        e.phrase,
        e.message,
        e.image_url,
        e.level,
        e.created_at,
        l.name as leader_name,
        l.image_url as leader_image
      FROM endorsements e
      LEFT JOIN leaders l ON e.leader_id = l.leader_id
      WHERE e.user_id = ? AND e.status = 'active'
      ORDER BY e.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const endorsements = await safeQuery(sql, [userId, limit, offset]);

    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM endorsements WHERE user_id = ? AND status = 'active'`,
      [userId],
    );

    return {
      endorsements,
      total: countResult?.total || 0,
      limit,
      offset,
    };
  }

  // ===== GET TOP ENDORSEMENTS BY LEADER =====
  static async getTopByLeaderId(leaderId, limit = 10) {
    const cacheKey = `leader:${leaderId}:top_endorsements:${limit}`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const sql = `
        SELECT 
          e.id,
          e.user_id,
          e.user_name,
          e.amount,
          e.phrase,
          e.message,
          e.image_url,
          e.level,
          e.created_at,
          u.avatar_url as user_avatar
        FROM endorsements e
        LEFT JOIN users u ON e.user_id = u.user_id
        WHERE e.leader_id = ? AND e.status = 'active'
        ORDER BY e.amount DESC, e.created_at DESC
        LIMIT ?
      `;

      const topEndorsements = await safeQuery(sql, [leaderId, limit]);

      await redis.set(cacheKey, JSON.stringify(topEndorsements), { EX: 300 });

      return topEndorsements;
    } catch (error) {
      Logger.error("Error fetching top endorsements:", error);
      throw new Error("Failed to fetch top endorsements");
    }
  }

  // ===== GET LEADER ENDORSEMENT COUNT (NOT MONEY) =====
  static async getLeaderEndorsementCount(leaderId) {
    const cacheKey = `leader:${leaderId}:endorsement_count`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return parseInt(cachedData);
      }

      const result = await safeQueryOne(
        `SELECT COUNT(*) as total FROM endorsements WHERE leader_id = ? AND status = 'active'`,
        [leaderId],
      );

      const total = result?.total || 0;
      await redis.set(cacheKey, total.toString(), { EX: 300 });

      return total;
    } catch (error) {
      Logger.error("Error getting leader endorsement count:", error);
      return 0;
    }
  }

  // ===== UPDATE LEADER ENDORSEMENT COUNT =====
  static async updateLeaderEndorsementCount(leaderId) {
    try {
      await safeQuery(
        `UPDATE leaders SET endorsement_count = COALESCE(endorsement_count, 0) + 1 WHERE leader_id = ?`,
        [leaderId],
      );

      await redis.del(`leader:${leaderId}:endorsement_count`);
    } catch (error) {
      Logger.error("Error updating leader endorsement count:", error);
    }
  }

  // ===== GET USER TOTAL ENDORSEMENTS (COUNT) =====
  static async getUserTotalEndorsements(userId) {
    const result = await safeQueryOne(
      `SELECT COUNT(*) as total FROM endorsements WHERE user_id = ? AND status = 'active'`,
      [userId],
    );
    return result?.total || 0;
  }

  // ===== UPDATE USER TOTAL ENDORSEMENTS =====
  static async updateUserTotalEndorsements(userId) {
    try {
      await safeQuery(
        `UPDATE users SET total_endorsements = COALESCE(total_endorsements, 0) + 1 WHERE user_id = ?`,
        [userId],
      );
    } catch (error) {
      Logger.error("Error updating user total endorsements:", error);
    }
  }

  // ===== GET PLATFORM TOTAL REVENUE (FOR ADMIN) =====
  static async getPlatformTotalRevenue() {
    const cacheKey = "platform:total_revenue";

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return parseInt(cachedData);
      }

      const result = await safeQueryOne(
        `SELECT COALESCE(SUM(amount), 0) as total FROM endorsements WHERE status = 'active'`,
        [],
      );

      const total = result?.total || 0;
      await redis.set(cacheKey, total.toString(), { EX: 3600 });

      return total;
    } catch (error) {
      Logger.error("Error getting platform total revenue:", error);
      return 0;
    }
  }

  // ===== UPDATE PLATFORM REVENUE =====
  static async updatePlatformRevenue(amount) {
    try {
      await safeQuery(
        `UPDATE platform_stats SET total_revenue = COALESCE(total_revenue, 0) + ? WHERE id = 1`,
        [amount],
      );

      await redis.del("platform:total_revenue");
    } catch (error) {
      Logger.error("Error updating platform revenue:", error);
    }
  }

  // ===== GET MAX ENDORSEMENTS PER USER (ADMIN CONFIG) =====
  static async getMaxEndorsementsPerUser(leaderId) {
    try {
      const result = await safeQueryOne(
        `SELECT max_endorsements_per_user FROM leader_settings WHERE leader_id = ?`,
        [leaderId],
      );

      return result?.max_endorsements_per_user || 3; // Default to 3 if not set
    } catch (error) {
      Logger.error("Error getting max endorsements per user:", error);
      return 3;
    }
  }

  // ===== GET USER ENDORSEMENT COUNT FOR SPECIFIC LEADER =====
  static async getUserEndorsementCount(leaderId, userId) {
    const result = await safeQueryOne(
      `SELECT COUNT(*) as total FROM endorsements WHERE leader_id = ? AND user_id = ? AND status = 'active'`,
      [leaderId, userId],
    );
    return result?.total || 0;
  }

  // ===== CLEAR CACHE =====
  static async clearEndorsementCache(leaderId) {
    try {
      const keys = await redis.keys(`leader:${leaderId}:endorsements:*`);
      if (keys.length > 0) {
        await redis.del(keys);
      }
      await redis.del(`leader:${leaderId}:top_endorsements:*`);
    } catch (error) {
      Logger.error("Error clearing endorsement cache:", error);
    }
  }

  // ===== ADMIN: UPDATE MAX ENDORSEMENTS PER USER =====
  static async updateMaxEndorsementsPerUser(leaderId, maxCount) {
    const sql = `
      INSERT INTO leader_settings (leader_id, max_endorsements_per_user, updated_at)
      VALUES (?, ?, NOW())
      ON DUPLICATE KEY UPDATE 
        max_endorsements_per_user = ?,
        updated_at = NOW()
    `;

    await safeQuery(sql, [leaderId, maxCount, maxCount]);

    // Clear related caches
    await redis.del(`leader:${leaderId}:settings`);
  }

  // ===== GET LEADER SETTINGS =====
  static async getLeaderSettings(leaderId) {
    const cacheKey = `leader:${leaderId}:settings`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const result = await safeQueryOne(
        `SELECT * FROM leader_settings WHERE leader_id = ?`,
        [leaderId],
      );

      const settings = result || { max_endorsements_per_user: 3 };
      await redis.set(cacheKey, JSON.stringify(settings), { EX: 3600 });

      return settings;
    } catch (error) {
      Logger.error("Error getting leader settings:", error);
      return { max_endorsements_per_user: 3 };
    }
  }
}

module.exports = EndorsementModel;
