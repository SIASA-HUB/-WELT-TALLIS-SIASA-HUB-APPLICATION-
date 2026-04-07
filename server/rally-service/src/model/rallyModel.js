const { safeQuery, safeQueryOne } = require("../configurations/db");
const Rally = require("./rally");
const Logger = require("../utils/logger/logger");
const redis = require("../utils/redis/redis");

class RallyModel {
  // ===== CREATE RALLY =====
  static async create(rallyData, getKenyaTimeISO) {
    const rally = new Rally(rallyData);
    const validation = rally.validate();

    if (!validation.isValid) {
      Logger.error("Rally validation failed:", validation.errors);
      throw new Error(validation.errors.join(", "));
    }

    const now = getKenyaTimeISO();
    rally.created_at = now;
    rally.updated_at = now;

    const query = `
      INSERT INTO rallies (
        rally_id, name, description, date, time, end_time,
        location, venue, county, image, image_public_id, party,
        leader, status, type, attendees_count, likes_count,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      rally.rally_id,
      rally.name,
      rally.description,
      rally.date,
      rally.time,
      rally.end_time,
      rally.location,
      rally.venue,
      rally.county,
      rally.image,
      rally.image_public_id,
      rally.party,
      rally.leader,
      rally.status,
      rally.type,
      rally.attendees_count || 0,
      rally.likes_count || 0,
      rally.created_at,
      rally.updated_at,
    ];

    await safeQuery(query, values);

    // Clear cache
    await redis.del("rallies:all");
    await redis.del("rallies:upcoming");

    Logger.info(`Rally created: ${rally.rally_id} - ${rally.name}`);

    return rally;
  }

  // ===== GET ALL RALLIES WITH CACHE =====
  static async getAll(filters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      county,
      party,
      type,
      search,
    } = filters;

    const offset = (page - 1) * limit;
    const cacheKey = `rallies:list:page=${page}:limit=${limit}:status=${status || "all"}:county=${county || "all"}:party=${party || "all"}:type=${type || "all"}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      let whereClause = "1=1";
      const params = [];

      if (status) {
        whereClause += " AND status = ?";
        params.push(status);
      }
      if (county) {
        whereClause += " AND county = ?";
        params.push(county);
      }
      if (party) {
        whereClause += " AND party = ?";
        params.push(party);
      }
      if (type) {
        whereClause += " AND type = ?";
        params.push(type);
      }

      if (search) {
        whereClause +=
          " AND (name LIKE ? OR description LIKE ? OR location LIKE ?)";
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const countResult = await safeQueryOne(
        `SELECT COUNT(*) as total FROM rallies WHERE ${whereClause}`,
        params,
      );
      const total = countResult?.total || 0;

      const query = `SELECT * FROM rallies WHERE ${whereClause} ORDER BY date ASC, time ASC LIMIT ? OFFSET ?`;
      const rallies = await safeQuery(query, [
        ...params,
        parseInt(limit),
        parseInt(offset),
      ]);

      const result = {
        data: rallies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };

      await redis.set(cacheKey, JSON.stringify(result), "EX", 600);
      return result;
    } catch (error) {
      Logger.error("Error in RallyModel.getAll:", error);
      throw error;
    }
  }

  // ===== GET UPCOMING RALLIES =====
  static async getUpcoming(limit = 10) {
    const cacheKey = `rallies:upcoming:${limit}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const query = `SELECT * FROM rallies WHERE status = 'upcoming' AND date >= CURDATE() ORDER BY date ASC, time ASC LIMIT ?`;
      const rallies = await safeQuery(query, [parseInt(limit)]);
      await redis.set(cacheKey, JSON.stringify(rallies), "EX", 600);
      return rallies;
    } catch (error) {
      Logger.error("Error in RallyModel.getUpcoming:", error);
      throw error;
    }
  }

  // ===== GET RALLY BY ID =====
  static async getById(rallyId) {
    const cacheKey = `rally:${rallyId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);

      const rally = await safeQueryOne(
        "SELECT * FROM rallies WHERE rally_id = ?",
        [rallyId],
      );
      if (!rally) return null;

      await redis.set(cacheKey, JSON.stringify(rally), "EX", 600);
      return rally;
    } catch (error) {
      Logger.error(`Error in RallyModel.getById for ${rallyId}:`, error);
      throw error;
    }
  }

  // ===== UPDATE RALLY =====
  static async update(rallyId, updateData, getKenyaTimeISO) {
    try {
      const updates = [];
      const values = [];
      const allowedFields = [
        "name",
        "description",
        "date",
        "time",
        "end_time",
        "location",
        "venue",
        "county",
        "image",
        "image_public_id",
        "party",
        "leader",
        "status",
        "type",
      ];

      allowedFields.forEach((field) => {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      });

      if (updates.length === 0) throw new Error("No fields to update");

      updates.push("updated_at = ?");
      values.push(getKenyaTimeISO());
      values.push(rallyId);

      await safeQuery(
        `UPDATE rallies SET ${updates.join(", ")} WHERE rally_id = ?`,
        values,
      );
      await this.clearCaches();
      return this.getById(rallyId);
    } catch (error) {
      Logger.error(`Error in RallyModel.update for ${rallyId}:`, error);
      throw error;
    }
  }

  // ===== DELETE RALLY =====
  static async delete(rallyId) {
    try {
      await safeQuery("DELETE FROM rallies WHERE rally_id = ?", [rallyId]);
      await this.clearCaches();
      return true;
    } catch (error) {
      Logger.error(`Error in RallyModel.delete for ${rallyId}:`, error);
      throw error;
    }
  }

  // ===== TOGGLE LIKE - FIXED =====
  static async toggleLike(rallyId, userId, getKenyaTimeISO) {
    try {
      const existing = await safeQueryOne(
        "SELECT * FROM rally_likes WHERE rally_id = ? AND user_id = ?",
        [rallyId, userId],
      );

      if (existing) {
        await safeQuery(
          "DELETE FROM rally_likes WHERE rally_id = ? AND user_id = ?",
          [rallyId, userId],
        );
        await safeQuery(
          "UPDATE rallies SET likes_count = GREATEST(0, likes_count - 1) WHERE rally_id = ?",
          [rallyId],
        );
      } else {
        const likeId = `like_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await safeQuery(
          "INSERT INTO rally_likes (like_id, rally_id, user_id, created_at) VALUES (?, ?, ?, ?)",
          [likeId, rallyId, userId, getKenyaTimeISO()],
        );
        await safeQuery(
          "UPDATE rallies SET likes_count = likes_count + 1 WHERE rally_id = ?",
          [rallyId],
        );
      }

      // Fetch the updated count to return to UI
      const updatedRally = await safeQueryOne(
        "SELECT likes_count FROM rallies WHERE rally_id = ?",
        [rallyId],
      );

      return {
        liked: !existing,
        likes_count: updatedRally.likes_count,
      };
    } catch (error) {
      Logger.error(`Error in RallyModel.toggleLike for ${rallyId}:`, error);
      throw error;
    }
  }

  // ===== TOGGLE ATTEND - FIXED =====
  static async toggleAttend(rallyId, userId, getKenyaTimeISO) {
    try {
      const existing = await safeQueryOne(
        "SELECT * FROM rally_attendees WHERE rally_id = ? AND user_id = ?",
        [rallyId, userId],
      );

      if (existing) {
        await safeQuery(
          "DELETE FROM rally_attendees WHERE rally_id = ? AND user_id = ?",
          [rallyId, userId],
        );
        await safeQuery(
          "UPDATE rallies SET attendees_count = GREATEST(0, attendees_count - 1) WHERE rally_id = ?",
          [rallyId],
        );
      } else {
        const attendId = `att_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await safeQuery(
          "INSERT INTO rally_attendees (attend_id, rally_id, user_id, created_at) VALUES (?, ?, ?, ?)",
          [attendId, rallyId, userId, getKenyaTimeISO()],
        );
        await safeQuery(
          "UPDATE rallies SET attendees_count = attendees_count + 1 WHERE rally_id = ?",
          [rallyId],
        );
      }

      const updatedRally = await safeQueryOne(
        "SELECT attendees_count FROM rallies WHERE rally_id = ?",
        [rallyId],
      );

      return {
        attending: !existing,
        attendees_count: updatedRally.attendees_count,
      };
    } catch (error) {
      Logger.error(`Error in RallyModel.toggleAttend for ${rallyId}:`, error);
      throw error;
    }
  }

  static async getByParty(party, limit = 20) {
    const query = `SELECT * FROM rallies WHERE party = ? AND status = 'upcoming' ORDER BY date ASC LIMIT ?`;
    return await safeQuery(query, [party, parseInt(limit)]);
  }

  static async getByCounty(county, limit = 20) {
    const query = `SELECT * FROM rallies WHERE county = ? AND status = 'upcoming' ORDER BY date ASC LIMIT ?`;
    return await safeQuery(query, [county, parseInt(limit)]);
  }

  static async clearCaches() {
    try {
      const keys = await redis.keys("rallies:*");
      if (keys.length > 0) await redis.del(keys);
    } catch (error) {
      Logger.error("Error clearing rally caches:", error);
    }
  }
}

module.exports = RallyModel;
