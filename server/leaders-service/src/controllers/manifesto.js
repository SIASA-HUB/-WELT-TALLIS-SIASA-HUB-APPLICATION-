const asyncHandler = require("express-async-handler");
const Logger = require("../utils/logger/logger");
const ManifestoModel = require("../models/manifestoModel");
const ManifestoVoteModel = require("../models/manifestoVoteModel");
const ManifestoCommentModel = require("../models/manifestoComentModel");

//crete  manifesto
const createManifesto = asyncHandler(async (req, res) => {
  const { leader_id, main_agenda, agenda_items } = req.body;

  if (!leader_id || !main_agenda || !agenda_items) {
    res.status(400);
    throw new Error("leader_id, main_agenda and agenda_items are required");
  }

  if (!Array.isArray(agenda_items) || agenda_items.length === 0) {
    res.status(400);
    throw new Error("agenda_items must be a non-empty array");
  }

  for (const item of agenda_items) {
    if (!item.title || !item.description) {
      res.status(400);
      throw new Error("Each agenda item must have a title and description");
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

/**
 * ===============================
 * EDIT MANIFESTO
 * ===============================
 */
const editManifesto = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;
  const { main_agenda, agenda_items } = req.body;

  if (!manifesto_id) {
    res.status(400);
    throw new Error("Manifesto ID is required");
  }

  // Check if manifesto exists
  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    res.status(404);
    throw new Error("Manifesto not found");
  }

  await ManifestoModel.update(manifesto_id, main_agenda, agenda_items);

  Logger.info(`[Manifesto] Updated: ${manifesto_id}`);

  res.status(200).json({
    success: true,
    message: "Manifesto updated successfully",
  });
});

/**
 * ===============================
 * GET MANIFESTO BY LEADER ID
 * ===============================
 */
const getManifestoByLeaderId = asyncHandler(async (req, res) => {
  const { leader_id } = req.params;

  if (!leader_id) {
    res.status(400);
    throw new Error("Leader ID is required");
  }

  const manifestos = await ManifestoModel.findByLeaderId(leader_id);

  if (!manifestos || manifestos.length === 0) {
    res.status(404);
    throw new Error("No manifesto found for this leader");
  }

  res.status(200).json({
    success: true,
    data: manifestos,
  });
});

/**
 * ===============================
 * GET MANIFESTO STATS
 * ===============================
 */
const getManifestoStats = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;

  if (!manifesto_id) {
    return res.status(400).json({
      success: false,
      message: "manifesto_id is required",
    });
  }

  // Check if manifesto exists
  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  // Get vote stats
  const stats = await ManifestoVoteModel.getStats(manifesto_id);

  // Get recent voters
  const recentVotes = await ManifestoVoteModel.getRecentVotes(manifesto_id, 10);

  // Get comment count
  const commentCount = await ManifestoCommentModel.getCount(manifesto_id);

  res.status(200).json({
    success: true,
    data: {
      manifesto_id,
      ...stats,
      comment_count: commentCount,
      recent_votes: recentVotes,
    },
  });
});

/**
 * ===============================
 * VOTE ON MANIFESTO
 * ===============================
 */
const voteOnManifesto = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;
  const { user_id, user_name, vote_type } = req.body;

  if (!manifesto_id || !user_id || !vote_type) {
    return res.status(400).json({
      success: false,
      message: "manifesto_id, user_id, and vote_type are required",
    });
  }

  if (!["approve", "reject", "neutral"].includes(vote_type)) {
    return res.status(400).json({
      success: false,
      message: "vote_type must be approve, reject, or neutral",
    });
  }

  // Get manifesto to verify it exists and get leader_id
  const manifesto = await ManifestoModel.findById(manifesto_id);

  if (!manifesto) {
    return res.status(404).json({
      success: false,
      message: "Manifesto not found",
    });
  }

  // Record vote
  const voteResult = await ManifestoVoteModel.upsert(
    manifesto_id,
    manifesto.leader_id,
    user_id,
    user_name,
    vote_type,
  );

  // Get updated stats
  const stats = await ManifestoVoteModel.getStats(manifesto_id);

  res.status(200).json({
    success: true,
    message: `Vote ${voteResult.action} successfully`,
    data: {
      manifesto_id,
      leader_id: manifesto.leader_id,
      user_vote: vote_type,
      stats,
    },
  });
});

/**
 * ===============================
 * CREATE MANIFESTO COMMENT
 * ===============================
 */
const createManifestoComment = asyncHandler(async (req, res) => {
  const { user_id, user_name, comment, created_at } = req.body;
  const { manifesto_id } = req.params;

  if (!manifesto_id) {
    res.status(400);
    throw new Error("manifesto_id is required");
  }
  if (!user_id) {
    res.status(400);
    throw new Error("user_id is required");
  }
  if (!user_name) {
    res.status(400);
    throw new Error("user_name is required");
  }
  if (!comment) {
    res.status(400);
    throw new Error("comment is required");
  }

  // Check if manifesto exists
  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    res.status(404);
    throw new Error("Manifesto not found");
  }

  const newComment = await ManifestoCommentModel.create(
    manifesto_id,
    user_id,
    user_name,
    comment,
    created_at,
  );

  Logger.info(
    `[Manifesto Comment] User ${user_id} commented on manifesto ${manifesto_id}`,
  );

  res.status(201).json({
    success: true,
    message: "Comment added successfully",
    data: newComment,
  });
});

/**
 * ===============================
 * GET MANIFESTO COMMENTS
 * ===============================
 */
const getManifestoComments = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;

  if (!manifesto_id) {
    res.status(400);
    throw new Error("manifesto_id is required");
  }

  // Check if manifesto exists
  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    res.status(404);
    throw new Error("Manifesto not found");
  }

  const comments = await ManifestoCommentModel.findByManifestoId(manifesto_id);

  res.status(200).json({
    success: true,
    data: comments,
  });
});

/**
 * ===============================
 * DELETE MANIFESTO (Optional)
 * ===============================
 */
const deleteManifesto = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;

  if (!manifesto_id) {
    res.status(400);
    throw new Error("Manifesto ID is required");
  }

  // Check if manifesto exists
  const exists = await ManifestoModel.exists(manifesto_id);
  if (!exists) {
    res.status(404);
    throw new Error("Manifesto not found");
  }

  // Delete related data first (if your DB doesn't have CASCADE)
  await ManifestoVoteModel.deleteByManifestoId?.(manifesto_id);
  await ManifestoCommentModel.deleteByManifestoId(manifesto_id);

  // Delete manifesto
  await ManifestoModel.delete(manifesto_id);

  Logger.info(`[Manifesto] Deleted: ${manifesto_id}`);

  res.status(200).json({
    success: true,
    message: "Manifesto deleted successfully",
  });
});

module.exports = {
  createManifesto,
  createManifestoComment,
  editManifesto,
  getManifestoByLeaderId,
  getManifestoStats,
  voteOnManifesto,
  getManifestoComments,
  deleteManifesto,
};
