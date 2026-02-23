const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Logger = require("../utils/logger/logger");
const { safeQuery, safeQueryOne } = require("../configurations/db");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamp");
const redis = require("../utils/redis/redis");
const LeaderModel = require("../models/leadersModel");
const LeaderService = require("../services/leadersService");

// ===== CREATE LEADER =====
const createLeader = async (req, res) => {
  try {
    const leader = await LeaderService.createLeader(
      req.body,
      req.files,
      redis,
      Logger,
      getKenyaTimeISO,
    );

    res.status(201).json({
      success: true,
      message: "Leader registered successfully",
      leader,
    });
  } catch (error) {
    Logger.error("Create leader error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ===== GET ALL LEADERS (with pagination) =====
// ===== GET ALL LEADERS WITH POSITION VYING FOR =====
const getAllLeaders = asyncHandler(async (req, res) => {
  try {
    // Get ALL leaders - including position_running_for
    const leaders = await safeQuery(
      `SELECT 
        leader_id, name, party, position, position_running_for, slogan, 
        county, constituency, ward, location,
        image_url, verification, education, status, created_at
      FROM leaders
      ORDER BY created_at DESC`,
      [], // No parameters needed
    );

    // Get additional data for each leader
    for (const leader of leaders) {
      // Get like count
      try {
        const likes = await safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_likes WHERE leader_id = ?`,
          [leader.leader_id],
        );
        leader.likes = likes?.count || 0;
      } catch {
        leader.likes = 0;
      }

      // Get dislike count
      try {
        const dislikes = await safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_dislikes WHERE leader_id = ?`,
          [leader.leader_id],
        );
        leader.dislikes = dislikes?.count || 0;
      } catch {
        leader.dislikes = 0;
      }

      // Get view count
      try {
        const views = await safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_views WHERE leader_id = ?`,
          [leader.leader_id],
        );
        leader.views = views?.count || 0;
      } catch {
        leader.views = 0;
      }

      // Get follower count
      try {
        const followers = await safeQueryOne(
          `SELECT COUNT(*) as count FROM leader_followers WHERE leader_id = ?`,
          [leader.leader_id],
        );
        leader.followers = followers?.count || 0;
      } catch {
        leader.followers = 0;
      }

      // Get primary image
      try {
        const primaryImage = await safeQueryOne(
          `SELECT image_url FROM leader_images 
           WHERE leader_id = ? AND is_primary = 1 
           LIMIT 1`,
          [leader.leader_id],
        );
        leader.primary_image = primaryImage?.image_url || leader.image_url;
      } catch {
        leader.primary_image = leader.image_url;
      }

      // Get all images (optional)
      try {
        const images = await safeQuery(
          `SELECT image_id, image_url, is_primary, sort_order 
           FROM leader_images 
           WHERE leader_id = ? 
           ORDER BY is_primary DESC, sort_order ASC 
           LIMIT 5`,
          [leader.leader_id],
        );
        leader.images = images || [];
      } catch {
        leader.images = [];
      }

      // Get social links (optional)
      try {
        const socialLinks = await safeQuery(
          `SELECT type, url FROM leader_portfolio WHERE leader_id = ?`,
          [leader.leader_id],
        );
        leader.social_links = socialLinks || [];
      } catch {
        leader.social_links = [];
      }

      // Add a computed field for clarity
      leader.vying_for = leader.position_running_for || null;
    }

    res.status(200).json({
      success: true,
      source: "database",
      count: leaders.length,
      data: leaders,
    });
  } catch (error) {
    Logger.error("Get all leaders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ===== GET LEADER BY ID - NO CACHING =====
const getLeaderById = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;

  Logger.info(`[GET LEADER] Request for ID: ${leaderId}`);

  if (!leaderId) {
    return res
      .status(400)
      .json({ success: false, message: "Leader ID is required" });
  }

  try {
    // Get leader details directly from database (no cache)
    const leader = await LeaderModel.getById(leaderId);

    if (!leader) {
      return res
        .status(404)
        .json({ success: false, message: "Leader not found" });
    }

    Logger.info(`[GET LEADER] ✅ Found: ${leader.name}`);

    // Get stats
    const stats = await LeaderModel.getStats(leaderId);

    // Get images
    let images = [];
    try {
      images = await safeQuery(
        `SELECT image_id, image_url, is_primary, sort_order 
         FROM leader_images WHERE leader_id = ? ORDER BY is_primary DESC, sort_order ASC`,
        [leaderId],
      );
    } catch (imgErr) {
      Logger.error(`[GET LEADER] Image error:`, imgErr.message);
    }

    // Get social links
    let socialLinks = [];
    try {
      socialLinks = await LeaderModel.getPortfolio(leaderId);
    } catch (socialErr) {
      Logger.error(`[GET LEADER] Social links error:`, socialErr.message);
    }

    // Parse education and experience
    let education = [];
    let experience = [];
    let slogan = null;
    let motto = null;

    try {
      if (leader.tags) {
        const parsedTags =
          typeof leader.tags === "string"
            ? JSON.parse(leader.tags)
            : leader.tags;

        parsedTags.forEach((item) => {
          if (item.education) education = item.education;
          if (item.experience) experience = item.experience;
          if (item.slogan) slogan = item.slogan;
          if (item.motto) motto = item.motto;
        });
      }
    } catch (tagErr) {
      Logger.error(`[GET LEADER] Tag parse error:`, tagErr.message);
    }

    // Build response
    const response = {
      leader_id: leader.leader_id,
      name: leader.name,
      party: leader.party,
      position: leader.position,
      position_running_for: leader.position_running_for,
      slogan: slogan || leader.slogan,
      motto: motto || leader.motto,
      county: leader.county,
      constituency: leader.constituency,
      ward: leader.ward,
      location: leader.location,
      verification: leader.verification,
      status: leader.status,
      created_at: leader.created_at,
      updated_at: leader.updated_at,
      education,
      experience,
      stats,
      images,
      social_links: socialLinks,
      primary_image:
        images.find((img) => img.is_primary)?.image_url || leader.image_url,
    };

    // SKIP REDIS CACHING FOR NOW
    // await redis.set(...) - Commented out

    res.status(200).json({
      success: true,
      source: "database",
      data: response,
    });
  } catch (error) {
    Logger.error(`[GET LEADER] Error:`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// ===== SEARCH LEADERS =====
const searchLeaders = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  if (!q || q.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const offset = (page - 1) * limit;
  const searchTerm = `%${q}%`;
  const cacheKey = `leaders:search:${q}:page=${page}`;

  try {
    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        ...JSON.parse(cached),
      });
    }

    // Get total count for pagination
    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM leaders 
       WHERE status = 'active' 
       AND (name LIKE ? OR party LIKE ? OR position LIKE ? 
            OR county LIKE ? OR constituency LIKE ? OR ward LIKE ?
            OR education LIKE ? OR experience LIKE ? OR tags LIKE ?)`,
      [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
      ],
    );
    const total = countResult?.total || 0;

    // Search leaders
    const leaders = await safeQuery(
      `SELECT 
        l.leader_id, l.name, l.party, l.position, l.slogan,
        l.county, l.constituency, l.ward, l.image_url,
        l.verification, l.created_at,
        (SELECT image_url FROM leader_images WHERE leader_id = l.leader_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM leaders l
       WHERE l.status = 'active' 
       AND (l.name LIKE ? OR l.party LIKE ? OR l.position LIKE ? 
            OR l.county LIKE ? OR l.constituency LIKE ? OR l.ward LIKE ?
            OR l.education LIKE ? OR l.experience LIKE ? OR l.tags LIKE ?)
       ORDER BY 
         CASE 
           WHEN l.name LIKE ? THEN 1
           WHEN l.party LIKE ? THEN 2
           WHEN l.position LIKE ? THEN 3
           ELSE 4
         END,
         l.created_at DESC
       LIMIT ? OFFSET ?`,
      [
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        searchTerm,
        `${q}%`,
        `${q}%`,
        `${q}%`,
        parseInt(limit),
        parseInt(offset),
      ],
    );

    const response = {
      success: true,
      source: "database",
      query: q,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(response), { EX: 300 });

    res.status(200).json(response);
  } catch (error) {
    Logger.error("Search leaders error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching leaders",
    });
  }
});

// ===== GET LEADERS BY PARTY =====
const getLeadersByParty = asyncHandler(async (req, res) => {
  const { party } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  if (!party) {
    return res.status(400).json({
      success: false,
      message: "Party is required",
    });
  }

  const cacheKey = `leaders:party:${party}:page=${page}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        ...JSON.parse(cached),
      });
    }

    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND party = ?`,
      [party],
    );
    const total = countResult?.total || 0;

    const leaders = await safeQuery(
      `SELECT 
        leader_id, name, party, position, county, constituency,
        image_url, verification, created_at,
        (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM leaders
       WHERE status = 'active' AND party = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [party, parseInt(limit), parseInt(offset)],
    );

    const response = {
      success: true,
      source: "database",
      party,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(response), { EX: 300 });

    res.status(200).json(response);
  } catch (error) {
    Logger.error("Get leaders by party error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaders by party",
    });
  }
});

// ===== GET LEADERS BY COUNTY =====
const getLeadersByCounty = asyncHandler(async (req, res) => {
  const { county } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const cacheKey = `leaders:county:${county}:page=${page}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        ...JSON.parse(cached),
      });
    }

    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM leaders WHERE status = 'active' AND county = ?`,
      [county],
    );
    const total = countResult?.total || 0;

    const leaders = await safeQuery(
      `SELECT 
        leader_id, name, party, position, constituency, ward,
        image_url, verification, created_at,
        (SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1) as primary_image
       FROM leaders
       WHERE status = 'active' AND county = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [county, parseInt(limit), parseInt(offset)],
    );

    const response = {
      success: true,
      source: "database",
      county,
      data: leaders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    await redis.set(cacheKey, JSON.stringify(response), { EX: 300 });

    res.status(200).json(response);
  } catch (error) {
    Logger.error("Get leaders by county error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaders by county",
    });
  }
});

// ===== UPDATE LEADER =====
const updateLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const updateData = req.body;

  if (!leaderId) {
    return res.status(400).json({
      success: false,
      message: "Leader ID is required",
    });
  }

  try {
    const existingLeader = await LeaderModel.getById(leaderId);
    if (!existingLeader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    const updated_at = getKenyaTimeISO();
    const updates = [];
    const values = [];

    // Build dynamic update query
    const allowedFields = [
      "name",
      "party",
      "slogan",
      "motto",
      "position",
      "county",
      "constituency",
      "ward",
      "location",
      "education",
      "experience",
      "tags",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (field === "tags" && typeof updateData[field] === "object") {
          values.push(JSON.stringify(updateData[field]));
        } else {
          values.push(updateData[field]);
        }
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update",
      });
    }

    updates.push("updated_at = ?");
    values.push(updated_at);
    values.push(leaderId);

    const query = `UPDATE leaders SET ${updates.join(", ")} WHERE leader_id = ?`;
    await safeQuery(query, values);

    // Clear caches
    await redis.del(`leader:${leaderId}`);
    await redis.del("leaders:all:*");
    await redis.del("leaders:search:*");
    await redis.del("leaders:party:*");
    await redis.del("leaders:county:*");

    Logger.info(`Leader ${leaderId} updated`);

    res.status(200).json({
      success: true,
      message: "Leader updated successfully",
    });
  } catch (error) {
    Logger.error("Update leader error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating leader",
    });
  }
});

// ===== DELETE LEADER (soft delete) =====
const deleteLeader = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;

  if (!leaderId) {
    return res.status(400).json({
      success: false,
      message: "Leader ID is required",
    });
  }

  try {
    const existingLeader = await LeaderModel.getById(leaderId);
    if (!existingLeader) {
      return res.status(404).json({
        success: false,
        message: "Leader not found",
      });
    }

    // Soft delete
    await safeQuery(
      `UPDATE leaders SET status = 'deleted', updated_at = ? WHERE leader_id = ?`,
      [getKenyaTimeISO(), leaderId],
    );

    // Clear caches
    await redis.del(`leader:${leaderId}`);
    await redis.del("leaders:all:*");
    await redis.del("leaders:search:*");
    await redis.del("leaders:party:*");
    await redis.del("leaders:county:*");

    Logger.info(`Leader ${leaderId} deleted`);

    res.status(200).json({
      success: true,
      message: "Leader deleted successfully",
    });
  } catch (error) {
    Logger.error("Delete leader error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting leader",
    });
  }
});

// ===== GET LEADER STATS =====
const getLeaderStats = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;

  try {
    const stats = await LeaderModel.getStats(leaderId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error("Get leader stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leader stats",
    });
  }
});

// ===== GET FEATURED LEADERS =====
const getFeaturedLeaders = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const cacheKey = `leaders:featured:${limit}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cached),
      });
    }

    const leaders = await safeQuery(
      `SELECT 
        l.leader_id, l.name, l.party, l.position, l.slogan,
        l.county, l.image_url,
        (SELECT image_url FROM leader_images WHERE leader_id = l.leader_id AND is_primary = 1 LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM leader_likes WHERE leader_id = l.leader_id) as likes,
        (SELECT COUNT(*) FROM leader_views WHERE leader_id = l.leader_id) as views
       FROM leaders l
       WHERE l.status = 'active'
       ORDER BY 
         (SELECT COUNT(*) FROM leader_views WHERE leader_id = l.leader_id) DESC,
         (SELECT COUNT(*) FROM leader_likes WHERE leader_id = l.leader_id) DESC
       LIMIT ?`,
      [parseInt(limit)],
    );

    await redis.set(cacheKey, JSON.stringify(leaders), { EX: 3600 });

    res.status(200).json({
      success: true,
      source: "database",
      data: leaders,
    });
  } catch (error) {
    Logger.error("Get featured leaders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured leaders",
    });
  }
});

module.exports = {
  createLeader,
  getAllLeaders,
  getLeaderById,
  searchLeaders,
  getLeadersByParty,
  getLeadersByCounty,
  updateLeader,
  deleteLeader,

  getLeaderStats,
  getFeaturedLeaders,
};
