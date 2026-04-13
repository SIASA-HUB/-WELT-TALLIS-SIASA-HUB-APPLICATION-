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
  const manifesto = await ManifestoModel.findById(manifestoId);
  if (!manifesto) return res.status(404).json({ success: false, message: "Manifesto not found" });
  res.status(200).json({ success: true, data: manifesto });
});

// ===== UPDATE MANIFESTO =====
const updateManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { main_agenda, agenda_items } = req.body;
  await ManifestoModel.update(manifestoId, main_agenda, agenda_items);
  const updatedManifesto = await ManifestoModel.findById(manifestoId);
  res.status(200).json({ success: true, data: updatedManifesto, message: "Manifesto updated successfully" });
});

// ===== DELETE MANIFESTO =====
const deleteManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  await ManifestoModel.delete(manifestoId);
  res.status(200).json({ success: true, message: "Manifesto deleted successfully" });
});

// ===== DELETE SINGLE AGENDA ITEM =====
const deleteAgendaItem = asyncHandler(async (req, res) => {
  const { agendaId } = req.params;
  if (!agendaId) return res.status(400).json({ success: false, message: "agendaId is required" });

  await safeQuery(`DELETE FROM manifesto_agendas WHERE id = ?`, [agendaId]);
  res.status(200).json({ success: true, message: "Agenda item deleted successfully" });
});

// ===== GET MANIFESTO BY LEADER ID =====
const getManifestoByLeaderId = asyncHandler(async (req, res) => {
  const { leaderId } = req.params;
  const manifestos = await ManifestoModel.findByLeaderId(leaderId);
  if (!manifestos || manifestos.length === 0) {
    return res.status(404).json({ success: false, message: "No manifesto found for this leader" });
  }
  res.status(200).json({ success: true, data: manifestos });
});

// ===== GET MANIFESTO STATS =====
const getManifestoStats = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { agenda_item_id } = req.query;

  if (agenda_item_id) {
    const stats = await ManifestoVoteModel.getStats(manifestoId, agenda_item_id);
    return res.status(200).json({ success: true, data: { manifestoId, agenda_item_id, ...stats } });
  }

  const manifesto = await ManifestoModel.findById(manifestoId);
  if (!manifesto) return res.status(404).json({ success: false, message: "Manifesto not found" });

  const agendaStats = await ManifestoVoteModel.getStats(manifestoId);
  const recentVotes = await ManifestoVoteModel.getRecentVotes(manifestoId, 15);

  res.status(200).json({
    success: true,
    data: agendaStats,
    recent_votes: recentVotes
  });
});

// ===== UNIFIED VOTE ON AGENDA ITEM =====
// POST /manifestos/vote  { agenda_id, user_id, vote_type }
const voteManifestoAgenda = asyncHandler(async (req, res) => {
  const { agenda_id, user_id, vote_type = "approve" } = req.body;

  if (!agenda_id) {
    return res.status(400).json({ success: false, message: "agenda_id is required" });
  }
  if (!user_id || user_id === "guest") {
    return res.status(401).json({ success: false, message: "Please log in to vote" });
  }

  // Verify agenda exists
  const agenda = await safeQueryOne(
    `SELECT id, manifesto_id, votes_count FROM manifesto_agendas WHERE id = ?`,
    [agenda_id]
  );
  if (!agenda) return res.status(404).json({ success: false, message: "Agenda item not found" });

  const result = await ManifestoVoteModel.vote(agenda_id, user_id, vote_type);

  if (result.already_voted) {
    return res.status(409).json({ success: false, message: "You have already voted on this agenda item", data: { votes_count: agenda.votes_count } });
  }

  res.status(200).json({
    success: true,
    message: "Vote recorded successfully",
    data: { agenda_id, votes_count: result.votes_count, vote_type }
  });
});

// ===== OLD voteOnManifesto (kept for backward compat) =====
const voteOnManifesto = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { agenda_item_id, user_id, vote_type = "approve" } = req.body;

  if (!agenda_item_id || !user_id) {
    return res.status(400).json({ success: false, message: "agenda_item_id and user_id are required" });
  }

  const result = await ManifestoVoteModel.vote(agenda_item_id, user_id, vote_type);
  if (result.already_voted) {
    return res.status(409).json({ success: false, already_voted: true, message: result.message });
  }

  res.status(200).json({
    success: true,
    message: "Vote recorded",
    data: { manifestoId, agenda_item_id, votes_count: result.votes_count }
  });
});

// ===== GET USER VOTES FOR MANIFESTO =====
const getManifestoUserVotes = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { user_id } = req.query;

  if (!manifestoId || !user_id) {
    return res.status(400).json({ success: false, message: "manifestoId and user_id are required" });
  }

  const votes = await ManifestoVoteModel.getUserVotesForManifesto(manifestoId, user_id);
  res.status(200).json({ success: true, data: votes });
});

// ===== GET TRENDING MANIFESTOS (real data) =====
const getTrendingManifestos = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const manifestos = await ManifestoModel.getTrending(limit);
  res.status(200).json({ success: true, data: manifestos });
});

// ===== GET PERSONALIZED MANIFESTOS =====
const getPersonalizedManifestos = asyncHandler(async (req, res) => {
  const { county, ward, constituency, political_party, limit = 20 } = req.query;
  const manifestos = await ManifestoModel.getPersonalized(county, ward, constituency, political_party, parseInt(limit));
  res.status(200).json({ success: true, data: manifestos });
});

// ===== TRACK MANIFESTO READ TIME =====
const trackReadTime = asyncHandler(async (req, res) => {
  const { manifestoId } = req.params;
  const { user_id, read_time } = req.body;

  if (!manifestoId || !read_time) {
    return res.status(400).json({ success: false, message: "manifestoId and read_time are required" });
  }

  await ManifestoModel.trackView(manifestoId, user_id, read_time);
  res.status(200).json({ success: true, message: "Read time tracked" });
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
  getTrendingManifestos,
  getPersonalizedManifestos,
  trackReadTime,
};