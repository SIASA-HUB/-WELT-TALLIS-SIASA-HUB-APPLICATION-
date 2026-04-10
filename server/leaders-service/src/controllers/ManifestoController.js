const asyncHandler = require("express-async-handler");
const Logger = require("../utils/logger/logger");
const ManifestoModel = require("../models/manifestoModel");
const ManifestoVoteModel = require("../models/manifestoVoteModel");
const { safeQuery, safeQueryOne } = require("../configurations/db");
const redis = require("../utils/redis/redis");

// ===== CREATE MANIFESTO =====
const createManifesto = asyncHandler(async (req, res) => {
  const { leader_id, main_agenda, agenda_items } = req.body;

  if (!leader_id || !main_agenda || !agenda_items) {
    return res.status(400).json({
      success: false,
      message: "leader_id, main_agenda and agenda_items are required",
    });
  }

  if (!Array.isArray(agenda_items) || agenda_items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "agenda_items must be a non-empty array",
    });
  }

  for (const item of agenda_items) {
    if (!item.title || !item.description) {
      return res.status(400).json({
        success: false,
        message: "Each agenda item must have a title and description",
      });
    }
  }

  const manifesto = await ManifestoModel.create(
    leader_id,
    main_agenda,
    agenda_items,
  );

  Logger.info(`[Manifesto] Created: ${manifesto.manifesto_id}`);

  res.status(201).json({
    success: true,
    data: manifesto,
  });
});

// ===== EDIT MANIFESTO =====
const editManifesto = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;
  const { main_agenda, agenda_items } = req.body;

  if (!manifesto_id) {
    return res.status(400).json({
      success: false,
      message: "Manifesto ID is required",
    });
  }

  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  await ManifestoModel.update(manifesto_id, main_agenda, agenda_items);

  Logger.info(`[Manifesto] Updated: ${manifesto_id}`);

  res.status(200).json({
    success: true,
    message: "Manifesto updated successfully",
  });
});

// ===== GET MANIFESTO BY LEADER ID =====
const getManifestoByLeaderId = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;

  if (!leaderId) {
    return res.status(400).json({
      success: false,
      message: "Leader ID is required",
    });
  }

  try {
    const manifestos = await ManifestoModel.findByLeaderId(leaderId);

    if (!manifestos || manifestos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No manifesto found for this leader",
      });
    }

    res.status(200).json({
      success: true,
      data: manifestos,
    });
  } catch (error) {
    console.error("Error in getManifestoByLeaderId:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch manifesto",
    });
  }
});

// ===== GET MANIFESTO STATS =====
const getManifestoStats = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;
  const { agenda_item_id } = req.query;

  if (!manifesto_id) {
    return res.status(400).json({
      success: false,
      message: "manifesto_id is required",
    });
  }

  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  const stats = await ManifestoVoteModel.getStats(manifesto_id, agenda_item_id);
  const recentVotes = await ManifestoVoteModel.getRecentVotes(manifesto_id, 10);

  res.status(200).json({
    success: true,
    data: {
      manifesto_id,
      agenda_item_id,
      ...stats,
      recent_votes: recentVotes,
    },
  });
});

// ===== VOTE ON MANIFESTO AGENDA ITEM =====
const voteOnManifesto = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;
  const { agenda_item_id, user_id, vote_type } = req.body;

  console.log("=== VOTE DEBUG ===");
  console.log("manifesto_id:", manifesto_id);
  console.log("agenda_item_id:", agenda_item_id);
  console.log("user_id:", user_id);
  console.log("vote_type:", vote_type);

  if (!manifesto_id || !agenda_item_id || !user_id || !vote_type) {
    return res.status(400).json({
      success: false,
      message:
        "manifesto_id, agenda_item_id, user_id, and vote_type are required",
    });
  }

  if (!["approve", "reject", "neutral"].includes(vote_type)) {
    return res.status(400).json({
      success: false,
      message: "vote_type must be approve, reject, or neutral",
    });
  }

  const manifesto = await ManifestoModel.findById(manifesto_id);

  if (!manifesto) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  const voteResult = await ManifestoVoteModel.upsert(
    manifesto_id,
    agenda_item_id,
    manifesto.leader_id,
    user_id,
    vote_type,
  );

  const stats = await ManifestoVoteModel.getStats(manifesto_id, agenda_item_id);

  res.status(200).json({
    success: true,
    message: `Vote ${voteResult.action} successfully`,
    data: {
      manifesto_id,
      agenda_item_id,
      leader_id: manifesto.leader_id,
      user_vote: vote_type,
      stats,
    },
  });
});

// ===== DELETE MANIFESTO =====
const deleteManifesto = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;

  if (!manifesto_id) {
    return res.status(400).json({
      success: false,
      message: "Manifesto ID is required",
    });
  }

  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  await ManifestoVoteModel.deleteByManifestoId(manifesto_id);
  await ManifestoModel.delete(manifesto_id);

  Logger.info(`[Manifesto] Deleted: ${manifesto_id}`);

  res.status(200).json({
    success: true,
    message: "Manifesto deleted successfully",
  });
});

// ===== GET TRENDING MANIFESTOS - FIXED (removed status column) =====
const getTrendingManifestos = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const cacheKey = `manifestos:trending:${limit}`;

  try {
    // Try to get from cache if redis is available
    let cached = null;
    if (redis && redis.get) {
      try {
        cached = await redis.get(cacheKey);
      } catch (cacheErr) {
        console.log("Redis cache error, skipping:", cacheErr.message);
      }
    }

    if (cached) {
      return res.status(200).json({
        success: true,
        source: "cache",
        data: JSON.parse(cached),
      });
    }

    // Fetch manifestos with leader info - REMOVED status column check
    const manifestos = await safeQuery(
      `SELECT 
        m.manifesto_id as id,
        m.leader_id,
        m.main_agenda as title,
        m.agenda_items as pledges,
        m.created_at as date_published,
        l.name as leader_name,
        l.image_url as leader_image,
        l.position_running_for as position,
        COALESCE(
          (SELECT COUNT(*) FROM manifesto_votes WHERE manifesto_id = m.manifesto_id),
          0
        ) as likes,
        CASE 
          WHEN DATEDIFF(NOW(), m.created_at) <= 7 THEN 100
          WHEN DATEDIFF(NOW(), m.created_at) <= 30 THEN 80
          WHEN DATEDIFF(NOW(), m.created_at) <= 90 THEN 60
          ELSE 40
        END as trending_score
      FROM manifestos m
      JOIN leaders l ON m.leader_id = l.leader_id
      ORDER BY trending_score DESC, likes DESC, m.created_at DESC
      LIMIT ?`,
      [limit],
    );

    if (!manifestos || manifestos.length === 0) {
      return res.status(200).json({
        success: true,
        source: "database",
        data: [],
        meta: { total: 0, limit },
      });
    }

    // Format the response
    const formattedManifestos = manifestos.map((m) => {
      // Parse agenda_items
      let pledges = m.pledges;
      let pledgeList = [];
      let summaryText = "";

      if (typeof pledges === "string") {
        try {
          pledges = JSON.parse(pledges);
        } catch (e) {
          pledges = [];
        }
      }

      // Extract titles from agenda_items for display
      if (Array.isArray(pledges) && pledges.length > 0) {
        pledgeList = pledges.map((item) => {
          if (item.title) return item.title;
          if (item.description) return item.description;
          return typeof item === "string" ? item : "Key pledge";
        });

        // Create summary from first agenda item description
        if (pledges[0] && pledges[0].description) {
          summaryText = pledges[0].description;
        } else if (pledges[0] && pledges[0].title) {
          summaryText = pledges[0].title;
        }
      }

      // If no summary from agenda items, use main_agenda
      if (!summaryText && m.title) {
        summaryText = m.title;
      }

      return {
        id: m.id,
        leader_id: m.leader_id,
        leader_name: m.leader_name,
        leader_image: m.leader_image,
        position: m.position || "Candidate",
        title: m.title || "Manifesto",
        summary: summaryText || `${m.leader_name}'s vision for Kenya`,
        pledges: pledgeList.slice(0, 3),
        views: 0,
        likes: parseInt(m.likes) || 0,
        trending_score: parseInt(m.trending_score) || 50,
        date_published: m.date_published,
      };
    });

    // Cache if redis is available
    if (redis && redis.setEx) {
      try {
        await redis.setEx(cacheKey, 300, JSON.stringify(formattedManifestos));
      } catch (cacheErr) {
        console.log("Redis cache set error:", cacheErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      source: "database",
      data: formattedManifestos,
      meta: {
        total: formattedManifestos.length,
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    Logger.error("Error fetching trending manifestos:", error);

    // Return empty array instead of error
    return res.status(200).json({
      success: true,
      source: "database",
      data: [],
      meta: { total: 0, limit: 20 },
    });
  }
});

// ===== VOTE ON MANIFESTO =====
const voteManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const userId = req.user?.user_id || req.body.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    // Check if already voted
    const existing = await safeQueryOne(
      `SELECT id FROM manifesto_votes 
       WHERE manifesto_id = ? AND user_id = ?`,
      [manifestoId, userId],
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already voted for this manifesto",
      });
    }

    await safeQuery(
      `INSERT INTO manifesto_votes (manifesto_id, user_id, created_at) 
       VALUES (?, ?, NOW())`,
      [manifestoId, userId],
    );

    // Update trending score
    await safeQuery(
      `UPDATE manifestos 
       SET trending_score = trending_score + 10,
           updated_at = NOW()
       WHERE manifesto_id = ?`,
      [manifestoId],
    );

    // Clear cache
    if (redis && redis.del) {
      await redis.del(`manifestos:trending:*`);
    }

    Logger.info(`User ${userId} voted for manifesto ${manifestoId}`);

    return res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
    });
  } catch (error) {
    Logger.error("Error voting on manifesto:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = {
  createManifesto,
  getTrendingManifestos,
  editManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteOnManifesto,
  deleteManifesto,
  voteManifesto,
};
