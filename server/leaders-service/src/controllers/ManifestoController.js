// ManifestoController.js - Full rewrite with voting, agenda delete, personalization, and trending
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

  if (!leader_id || !main_agenda) {
    return res.status(400).json({ success: false, message: "leader_id and main_agenda are required" });
  }
  if (!Array.isArray(agenda_items) || agenda_items.length === 0) {
    return res.status(400).json({ success: false, message: "At least one agenda item is required" });
  }

  // Validate each agenda item has a title
  for (const item of agenda_items) {
    if (!item.title || item.title.trim() === '') {
      return res.status(400).json({ success: false, message: "Each agenda item must have a title" });
    }
  }

  const manifesto = await ManifestoModel.create(leader_id, main_agenda, agenda_items);
  res.status(201).json({ success: true, data: manifesto, message: "Manifesto created successfully" });
});

// ===== GET MANIFESTO BY ID =====
const getManifestoById = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  
  if (!manifestoId) {
    return res.status(400).json({ success: false, message: "Manifesto ID is required" });
  }
  
  try {
    const manifesto = await ManifestoModel.findById(manifestoId);
    if (!manifesto) {
      return res.status(404).json({ success: false, message: "Manifesto not found" });
    }
    res.status(200).json({ success: true, data: manifesto });
  } catch (error) {
    Logger.error("Get manifesto by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch manifesto" });
  }
});

// ===== UPDATE MANIFESTO =====
const updateManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { main_agenda, agenda_items } = req.body;
  
  if (!manifestoId) {
    return res.status(400).json({ success: false, message: "Manifesto ID is required" });
  }
  
  try {
    await ManifestoModel.update(manifestoId, main_agenda, agenda_items);
    const updatedManifesto = await ManifestoModel.findById(manifestoId);
    res.status(200).json({ success: true, data: updatedManifesto, message: "Manifesto updated successfully" });
  } catch (error) {
    Logger.error("Update manifesto error:", error);
    res.status(500).json({ success: false, message: "Failed to update manifesto" });
  }
});

// ===== DELETE MANIFESTO =====
const deleteManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  
  if (!manifestoId) {
    return res.status(400).json({ success: false, message: "Manifesto ID is required" });
  }
  
  try {
    await ManifestoModel.delete(manifestoId);
    res.status(200).json({ success: true, message: "Manifesto deleted successfully" });
  } catch (error) {
    Logger.error("Delete manifesto error:", error);
    res.status(500).json({ success: false, message: "Failed to delete manifesto" });
  }
});

// ===== DELETE SINGLE AGENDA ITEM =====
const deleteAgendaItem = asyncHandler(async (req, res) => {
  const { agendaId } = req.params;
  
  if (!agendaId) {
    return res.status(400).json({ success: false, message: "Agenda ID is required" });
  }

  try {
    await safeQuery(`DELETE FROM manifesto_agendas WHERE id = ?`, [agendaId]);
    res.status(200).json({ success: true, message: "Agenda item deleted successfully" });
  } catch (error) {
    Logger.error("Delete agenda item error:", error);
    res.status(500).json({ success: false, message: "Failed to delete agenda item" });
  }
});

// ===== GET MANIFESTO BY LEADER ID =====
const getManifestoByLeaderId = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  
  if (!leaderId) {
    return res.status(400).json({ success: false, message: "Leader ID is required" });
  }
  
  try {
    const manifestos = await ManifestoModel.findByLeaderId(leaderId);
    if (!manifestos || manifestos.length === 0) {
      return res.status(200).json({ 
        success: true, 
        data: [], 
        message: "No manifesto found for this leader" 
      });
    }
    res.status(200).json({ success: true, data: manifestos });
  } catch (error) {
    Logger.error("Get manifesto by leader ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch manifesto", data: [] });
  }
});

// ===== GET MANIFESTO STATS =====
const getManifestoStats = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { agenda_item_id } = req.query;

  if (!manifestoId) {
    return res.status(400).json({ success: false, message: "Manifesto ID is required" });
  }

  try {
    if (agenda_item_id) {
      const stats = await ManifestoVoteModel.getStats(manifestoId, agenda_item_id);
      const analytics = await ManifestoModel.getAnalytics(manifestoId);
      return res.status(200).json({
        success: true,
        data: {
          manifestoId,
          agenda_item_id,
          analytics: analytics || { views: 0, shares: 0, avg_read_time: 0 },
          stats: stats || { approve_count: 0, reject_count: 0, total_votes: 0 },
        },
      });
    }

    const manifesto = await ManifestoModel.findById(manifestoId);
    if (!manifesto) {
      return res.status(404).json({ success: false, message: "Manifesto not found" });
    }

    const analytics = await ManifestoModel.getAnalytics(manifestoId);
    const agendaStats = await ManifestoVoteModel.getStats(manifestoId);
    const recentVotes = await ManifestoVoteModel.getRecentVotes(manifestoId, 15);

    res.status(200).json({
      success: true,
      data: {
        manifesto,
        analytics: analytics || { views: 0, shares: 0, avg_read_time: 0 },
        agenda_stats: agendaStats || [],
      },
      recent_votes: recentVotes || [],
    });
  } catch (error) {
    Logger.error("Get manifesto stats error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch manifesto stats",
      data: {
        manifesto: null,
        analytics: { views: 0, shares: 0, avg_read_time: 0 },
        agenda_stats: []
      }
    });
  }
});

// ===== UNIFIED VOTE ON AGENDA ITEM =====
const voteManifestoAgenda = asyncHandler(async (req, res) => {
  const { agenda_id, vote_type = "approve" } = req.body;
  const user_id = req.userId || req.user?.user_id || req.body.user_id;

  if (!agenda_id || !user_id) {
    return res.status(400).json({ success: false, message: "agenda_id and user_id are required" });
  }

  try {
    // Verify agenda exists
    const agenda = await safeQueryOne(
      `SELECT id, manifesto_id, votes_count FROM manifesto_agendas WHERE id = ?`,
      [agenda_id]
    );
    if (!agenda) {
      return res.status(404).json({ success: false, message: "Agenda item not found" });
    }

    const result = await ManifestoVoteModel.vote(agenda_id, user_id, vote_type);

    if (result.already_voted) {
      return res.status(409).json({ 
        success: false, 
        message: "You have already voted on this agenda item", 
        data: { votes_count: agenda.votes_count || 0 } 
      });
    }

    await ManifestoModel.updateVoteAnalytics(agenda.manifesto_id, 1);

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      data: {
        manifesto_id: agenda.manifesto_id,
        agenda_id,
        stats: {
          votes_count: result.votes_count || 0,
          approve_count: result.approve_count || 0,
          reject_count: result.reject_count || 0,
          total_votes: result.total_votes || 0,
          vote_type,
        }
      },
    });
  } catch (error) {
    Logger.error("Vote manifesto agenda error:", error);
    res.status(500).json({ success: false, message: "Failed to record vote" });
  }
});

// ===== OLD voteOnManifesto (kept for backward compat) =====
const voteOnManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { agenda_item_id, vote_type = "approve" } = req.body;
  const user_id = req.userId || req.user?.user_id || req.body.user_id;

  if (!agenda_item_id || !user_id) {
    return res.status(400).json({ success: false, message: "agenda_item_id and user_id are required" });
  }

  try {
    const result = await ManifestoVoteModel.vote(agenda_item_id, user_id, vote_type);
    if (result.already_voted) {
      return res.status(409).json({ success: false, already_voted: true, message: result.message });
    }

    const agenda = await safeQueryOne(
      `SELECT manifesto_id FROM manifesto_agendas WHERE id = ? LIMIT 1`,
      [agenda_item_id]
    );

    if (agenda?.manifesto_id) {
      await ManifestoModel.updateVoteAnalytics(agenda.manifesto_id, 1);
    }

    res.status(200).json({
      success: true,
      message: "Vote recorded",
      data: {
        manifestoId,
        agenda_item_id,
        stats: {
          votes_count: result.votes_count || 0,
          approve_count: result.approve_count || 0,
          reject_count: result.reject_count || 0,
          total_votes: result.total_votes || 0,
        }
      }
    });
  } catch (error) {
    Logger.error("Vote on manifesto error:", error);
    res.status(500).json({ success: false, message: "Failed to record vote" });
  }
});

// ===== GET USER VOTES FOR MANIFESTO =====
const getManifestoUserVotes = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { user_id } = req.query;

  if (!manifestoId || !user_id) {
    return res.status(400).json({ success: false, message: "manifestoId and user_id are required" });
  }

  try {
    const votes = await ManifestoVoteModel.getUserVotesForManifesto(manifestoId, user_id);
    res.status(200).json({ success: true, data: votes || [] });
  } catch (error) {
    Logger.error("Get user votes error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user votes", data: [] });
  }
});

// ===== TRACK MANIFESTO VIEW =====
const trackManifestoView = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { read_time = 0 } = req.body;
  const user_id = req.userId || req.user?.user_id || null;

  if (!manifestoId) {
    return res.status(400).json({ success: false, message: "manifestoId is required" });
  }

  try {
    await ManifestoModel.trackView(manifestoId, user_id, read_time);
    const analytics = await ManifestoModel.getAnalytics(manifestoId);

    res.status(200).json({
      success: true,
      message: "Manifesto view tracked",
      data: { 
        manifestoId, 
        analytics: analytics || { views: 0, shares: 0, avg_read_time: 0 } 
      },
    });
  } catch (error) {
    Logger.error("Track manifesto view error:", error);
    res.status(500).json({ success: false, message: "Failed to track view" });
  }
});

// ===== TRACK SHARE =====
const trackShare = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { platform = 'generic' } = req.body;
  const user_id = req.userId || req.user?.user_id || null;

  if (!manifestoId) {
    return res.status(400).json({ success: false, message: "manifestoId is required" });
  }

  try {
    await ManifestoModel.trackShare(manifestoId, user_id, platform);
    const analytics = await ManifestoModel.getAnalytics(manifestoId);

    res.status(200).json({
      success: true,
      message: "Manifesto share tracked",
      data: { 
        manifestoId, 
        platform, 
        analytics: analytics || { views: 0, shares: 0, avg_read_time: 0 } 
      },
    });
  } catch (error) {
    Logger.error("Track share error:", error);
    res.status(500).json({ success: false, message: "Failed to track share" });
  }
});

// ===== TRACK READ TIME =====
const trackReadTime = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { user_id, read_time } = req.body;
  const authenticatedUser = req.userId || req.user?.user_id || null;

  if (!manifestoId || read_time == null) {
    return res.status(400).json({ success: false, message: "manifestoId and read_time are required" });
  }

  try {
    await ManifestoModel.trackRead(manifestoId, authenticatedUser || user_id || null, read_time);
    const analytics = await ManifestoModel.getAnalytics(manifestoId);

    res.status(200).json({
      success: true,
      message: "Read time tracked",
      data: { 
        manifestoId, 
        read_time, 
        analytics: analytics || { views: 0, shares: 0, avg_read_time: 0 } 
      },
    });
  } catch (error) {
    Logger.error("Track read time error:", error);
    res.status(500).json({ success: false, message: "Failed to track read time" });
  }
});

// ===== GET TRENDING MANIFESTOS =====
const getTrendingManifestos = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  
  try {
    const manifestos = await ManifestoModel.getTrending(limit);
    res.status(200).json({ 
      success: true, 
      data: manifestos || [], 
      count: (manifestos || []).length 
    });
  } catch (error) {
    Logger.error("Get trending manifestos error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trending manifestos", data: [] });
  }
});

// ===== GET PERSONALIZED MANIFESTOS =====
const getPersonalizedManifestos = asyncHandler(async (req, res) => {
  const { county, ward, constituency, political_party, limit = 20 } = req.query;
  
  try {
    const manifestos = await ManifestoModel.getPersonalized(county, ward, constituency, political_party, parseInt(limit));
    res.status(200).json({ 
      success: true, 
      data: manifestos || [], 
      count: (manifestos || []).length 
    });
  } catch (error) {
    Logger.error("Get personalized manifestos error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch personalized manifestos", data: [] });
  }
});

module.exports = {
  createManifesto,
  getManifestoById,
  updateManifesto,
  deleteManifesto,
  deleteAgendaItem,
  getManifestoByLeaderId,
  getManifestoStats,
  voteManifestoAgenda,
  voteOnManifesto,
  getManifestoUserVotes,
  trackManifestoView,
  trackShare,
  trackReadTime,
  getTrendingManifestos,
  getPersonalizedManifestos,
};
