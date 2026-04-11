
const Logger = require("../utils/logger/logger");
const ManifestoModel = require("../models/manifestoModel");
const ManifestoVoteModel = require("../models/manifestoVoteModel");
const {
  asyncHandler,
  db: { safeQuery, safeQueryOne },
  utils: { getKenyaTimeISO },
} = require("../../../global/index");


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
    message: "Manifesto created successfully",
  });
});

// ===== GET MANIFESTO BY ID =====
const getManifestoById = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;

  if (!manifestoId) {
    return res.status(400).json({
      success: false,
      message: "Manifesto ID is required",
    });
  }

  const manifesto = await ManifestoModel.findById(manifestoId);

  if (!manifesto) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  res.status(200).json({
    success: true,
    data: manifesto,
  });
});

// ===== UPDATE MANIFESTO =====
const updateManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { main_agenda, agenda_items } = req.body;

  if (!manifestoId) {
    return res.status(400).json({
      success: false,
      message: "Manifesto ID is required",
    });
  }

  const exists = await ManifestoModel.exists(manifestoId);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  if (agenda_items && Array.isArray(agenda_items)) {
    for (const item of agenda_items) {
      if ((item.title && !item.description) || (!item.title && item.description)) {
        return res.status(400).json({
          success: false,
          message: "Each agenda item must have both title and description",
        });
      }
    }
  }

  await ManifestoModel.update(manifestoId, main_agenda, agenda_items);

  const updatedManifesto = await ManifestoModel.findById(manifestoId);

  Logger.info(`[Manifesto] Updated: ${manifestoId}`);

  res.status(200).json({
    success: true,
    data: updatedManifesto,
    message: "Manifesto updated successfully",
  });
});

// ===== DELETE MANIFESTO =====
const deleteManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;

  if (!manifestoId) {
    return res.status(400).json({
      success: false,
      message: "Manifesto ID is required",
    });
  }

  const exists = await ManifestoModel.exists(manifestoId);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  // Delete all votes first
  await ManifestoVoteModel.deleteByManifestoId(manifestoId);
  
  // Then delete the manifesto
  await ManifestoModel.delete(manifestoId);

  Logger.info(`[Manifesto] Deleted: ${manifestoId}`);

  res.status(200).json({
    success: true,
    message: "Manifesto deleted successfully",
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
});

// ===== GET MANIFESTO STATS =====
const getManifestoStats = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { agenda_item_id } = req.query;

  if (!manifestoId) {
    return res.status(400).json({
      success: false,
      message: "manifesto_id is required",
    });
  }

  const exists = await ManifestoModel.exists(manifestoId);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  const stats = await ManifestoVoteModel.getStats(manifestoId, agenda_item_id);
  const recentVotes = await ManifestoVoteModel.getRecentVotes(manifestoId, 10);

  res.status(200).json({
    success: true,
    data: {
      manifestoId,
      agenda_item_id,
      ...stats,
      recent_votes: recentVotes,
    },
  });
});

// ===== VOTE ON MANIFESTO AGENDA ITEM =====
const voteOnManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { agenda_item_id, user_id, vote_type } = req.body;

  if (!manifestoId || !agenda_item_id || !user_id || !vote_type) {
    return res.status(400).json({
      success: false,
      message: "manifesto_id, agenda_item_id, user_id, and vote_type are required",
    });
  }

  if (!["approve", "reject", "neutral"].includes(vote_type)) {
    return res.status(400).json({
      success: false,
      message: "vote_type must be approve, reject, or neutral",
    });
  }

  const manifesto = await ManifestoModel.findById(manifestoId);

  if (!manifesto) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  const voteResult = await ManifestoVoteModel.upsert(
    manifestoId,
    agenda_item_id,
    manifesto.leader_id,
    user_id,
    vote_type,
  );

  const stats = await ManifestoVoteModel.getStats(manifestoId, agenda_item_id);

  res.status(200).json({
    success: true,
    message: `Vote ${voteResult.action} successfully`,
    data: {
      manifestoId,
      agenda_item_id,
      leader_id: manifesto.leader_id,
      user_vote: vote_type,
      stats,
    },
  });
});



// ===== GET PERSONALIZED RANDOM MANIFESTOS =====
const getTrendingManifestos = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const userId = req.user?.user_id || req.query.user_id;
  
  let userCounty = null;
  let userWard = null;
  let userConstituency = null;
  
  // Get user's county and ward if userId is provided
  if (userId) {
    try {
      const user = await safeQueryOne(
        `SELECT county, ward, constituency FROM users WHERE user_id = ?`,
        [userId]
      );
      if (user) {
        userCounty = user.county;
        userWard = user.ward;
        userConstituency = user.constituency;
      }
    } catch (error) {
      Logger.warn("Could not fetch user location:", error.message);
    }
  }
  
  // Get manifestos - NO status column (manifestos table doesn't have status)
  let query = `
    SELECT 
      m.manifesto_id as id,
      m.manifesto_id,
      m.leader_id,
      m.main_agenda,
      m.agenda_items,
      m.created_at,
      l.name as leader_name,
      l.party as leader_party,
      l.position as leader_position,
      l.county,
      l.constituency,
      l.ward,
      l.image_url as leader_image
    FROM manifestos m
    JOIN leaders l ON m.leader_id = l.leader_id
    WHERE l.status = 'active'
  `;
  
  let manifestos = await safeQuery(query);
  
  if (!manifestos || manifestos.length === 0) {
    return res.status(200).json({
      success: true,
      data: [],
      meta: { total: 0, limit },
    });
  }
  
  // Personalize: Prioritize manifestos from user's county/ward
  if (userCounty || userWard || userConstituency) {
    manifestos = manifestos.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Boost score for matching county
      if (userCounty && a.county === userCounty) scoreA += 10;
      if (userCounty && b.county === userCounty) scoreB += 10;
      
      // Boost score for matching constituency
      if (userConstituency && a.constituency === userConstituency) scoreA += 20;
      if (userConstituency && b.constituency === userConstituency) scoreB += 20;
      
      // Boost score for matching ward
      if (userWard && a.ward === userWard) scoreA += 50;
      if (userWard && b.ward === userWard) scoreB += 50;
      
      // Random fallback
      scoreA += Math.random() * 10;
      scoreB += Math.random() * 10;
      
      return scoreB - scoreA;
    });
  } else {
    // Random shuffle if no user location
    for (let i = manifestos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [manifestos[i], manifestos[j]] = [manifestos[j], manifestos[i]];
    }
  }
  
  // Limit results
  manifestos = manifestos.slice(0, limit);
  
  res.status(200).json({
    success: true,
    data: manifestos,
    meta: {
      total: manifestos.length,
      limit,
      personalized: !!(userCounty || userWard || userConstituency),
      user_location: {
        county: userCounty,
        constituency: userConstituency,
        ward: userWard,
      },
      timestamp: new Date().toISOString(),
    },
  });
});

// ===== SIMPLE VOTE ON MANIFESTO =====
const voteManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const userId = req.user?.user_id || req.body.user_id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const result = await ManifestoVoteModel.simpleVote(manifestoId, userId);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.message,
    });
  }

  Logger.info(`User ${userId} voted for manifesto ${manifestoId}`);

  return res.status(200).json({
    success: true,
    message: "Vote recorded successfully",
  });
});

module.exports = {
  createManifesto,
  getManifestoById,
  updateManifesto,
  deleteManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteOnManifesto,
  getTrendingManifestos,
  voteManifesto,
};