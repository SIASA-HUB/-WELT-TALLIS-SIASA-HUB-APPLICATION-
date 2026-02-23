// models/leadersModel.js
const { safeQuery, safeQueryOne } = require("../configurations/db");
const redis = require("../utils/redis/redis"); // Redis instance
const Logger = require("../utils/logger/logger");

// Utility to transform leader data for API responses
function transformLeaderData(leader, index) {
  return {
    id: leader.leader_id,
    name: leader.name,
    party: leader.party || null,
    location: leader.location || null,
    position: leader.position || null,
    likes: leader.likes || 0,
    dislikes: leader.dislikes || 0,
    views: leader.views || 0,
    commentsCount: leader.comments_count || 0,
    image: leader.image_url || null,
    verification: leader.verification || null,
    education: leader.education || null,
    rank: index + 1,
  };
}

class LeaderModel {
  // ===== CREATE =====
  static async create(data) {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => "?").join(", ");
    const values = Object.values(data);

    const sql = `
      INSERT INTO leaders (${columns.join(", ")})
      VALUES (${placeholders})
    `;

    await safeQuery(sql, values);

    // 🔹 Update Redis cache after creation
    const cacheKey = "global:all_leaders";
    try {
      const cached = await redis.get(cacheKey);
      const leadersList = cached ? JSON.parse(cached) : [];
      leadersList.unshift(data); // add new leader at the beginning
      await redis.set(cacheKey, JSON.stringify(leadersList), { EX: 3600 });
    } catch (err) {
      Logger.error("Error updating Redis cache after creating leader:", err);
    }

    return data;
  }

  // ===== GET ALL ACTIVE =====
  static async getAllActive(limit = 50) {
    const cacheKey = "global:all_leaders";

    try {
      // 1️⃣ Try cache first
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const leaders = JSON.parse(cachedData);
        return leaders.map(transformLeaderData);
      }

      // 2️⃣ Fallback to database
      const sql = `
        SELECT 
          leader_id, name, party, location, position,
          likes, dislikes, views, comments_count,
          image_url, verification, education
        FROM leaders                   
        WHERE status = 'active'
        LIMIT ?
      `;
      const leaders = await safeQuery(sql, [limit]);

      // Transform for API response
      const transformedLeaders = leaders.map(transformLeaderData);

      // Cache results for 1 hour
      await redis.set(cacheKey, JSON.stringify(leaders), { EX: 3600 });

      return transformedLeaders;
    } catch (error) {
      Logger.error("Error fetching all active leaders:", error);

      throw new Error("Failed to fetch leaders");
    }
  }
  // ===== GET BY ID - SIMPLIFIED =====
  static async getById(leaderId) {
    try {
      // Get main leader details
      const leader = await safeQueryOne(
        `SELECT 
        leader_id,
        name,
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

      // Process education and experience
      const educationList = leader.education
        ? leader.education
            .split("|")
            .map((e) => e.trim())
            .filter((e) => e)
        : [];

      const experienceList = leader.experience
        ? leader.experience
            .split("|")
            .map((e) => e.trim())
            .filter((e) => e)
        : [];

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
      console.error("Error in getById:", error);
      throw error;
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
}

module.exports = LeaderModel;
