const asyncHandler = require("express-async-handler");
const PollModel = require("../models/pollsModel");
const Logger = require("../utils/logger/logger");
const redis = require("../utils/redis/redis");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamp");
const {
  uploadToCloudinary,
  deleteMediaFromCloudinary,
} = require("../utils/images/imageProcessing");
const createPoll = asyncHandler(async (req, res) => {
  const { question, category, options } = req.body;
  const io = req.app.get("io");
  const knex = req.db; // Or however you access knex

  // 1. Validation
  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Question and at least two options are required",
    });
  }

  // 2. Handle Image (Your Cloudinary logic is fine)
  let imageUrl = null;
  let imagePublicId = null;
  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer);
    imageUrl = uploadResult.url;
    imagePublicId = uploadResult.public_id;
  }

  try {
    const poll_id = uuidv4(); // Generate a unique ID for the poll

    // 3. Database Transaction
    const newPoll = await knex.transaction(async (trx) => {
      // Insert into 'polls' table
      const [pollRecord] = await trx("polls")
        .insert({
          poll_id,
          question,
          category: category || "General",
          image_url: imageUrl,
          image_public_id: imagePublicId,
          status: "active",
        })
        .returning("*");

      // Prepare options for 'poll_options' table
      const optionsToInsert = options.map((opt, index) => ({
        option_id: uuidv4(),
        poll_id: poll_id,
        option_label: typeof opt === "string" ? opt : opt.label,
        sort_order: index,
      }));

      await trx("poll_options").insert(optionsToInsert);

      return { ...pollRecord, options: optionsToInsert };
    });

    // 4. Real-time emit
    io.emit("poll:created", newPoll);

    res.status(201).json({
      success: true,
      data: newPoll,
    });
  } catch (error) {
    Logger.error("[CREATE POLL] Error:", error);
    res.status(500).json({ success: false, message: "Database failure" });
  }
});

// ===== GET ALL POLLS =====
const getAllPolls = asyncHandler(async (req, res) => {
  const { category, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const cacheKey = `polls:list:${category || "all"}:${status || "active"}:page=${page}`;

  Logger.info("[GET ALL POLLS] Request received");

  try {
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        ...JSON.parse(cached),
      });
    }

    // Get polls from database
    const polls = await PollModel.getAll({ category, status, limit, offset });

    // Get total count
    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM polls WHERE status = ? ${category && category !== "All" ? "AND category = ?" : ""}`,
      category && category !== "All"
        ? [status || "active", category]
        : [status || "active"],
    );

    const response = {
      success: true,
      source: "database",
      data: polls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        pages: Math.ceil((countResult?.total || 0) / limit),
      },
    };

    // Cache for 5 minutes
    await redis.set(cacheKey, JSON.stringify(response), { EX: 300 });

    res.status(200).json(response);
  } catch (error) {
    Logger.error("[GET ALL POLLS] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch polls",
    });
  }
});

// ===== GET POLL BY ID =====
const getPollById = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  Logger.info(`[GET POLL] Request for ID: ${pollId}`);

  if (!pollId) {
    return res.status(400).json({
      success: false,
      message: "Poll ID is required",
    });
  }

  try {
    const poll = await PollModel.getById(pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    res.status(200).json({
      success: true,
      data: poll,
    });
  } catch (error) {
    Logger.error("[GET POLL] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch poll",
    });
  }
});

// ===== VOTE ON POLL =====
const voteOnPoll = asyncHandler(async (req, res) => {
  const { pollId } = req.params;
  const { option } = req.body;
  const io = req.app.get("io");

  const userId = req.user?.id || null;
  const ipAddress = req.ip || req.connection.remoteAddress;

  Logger.info(
    `[VOTE POLL] Vote received for poll: ${pollId}, option: ${option}`,
  );

  if (!pollId || !option) {
    return res.status(400).json({
      success: false,
      message: "Poll ID and option are required",
    });
  }

  try {
    const result = await PollModel.vote(pollId, option, userId, ipAddress);

    // Get updated poll data
    const updatedPoll = await PollModel.getById(pollId);

    // Emit real-time update to all clients
    io.emit("poll:updated", {
      poll_id: pollId,
      results: result,
      poll: updatedPoll,
    });

    // Emit to specific room for this poll
    io.to(`poll:${pollId}`).emit("vote:cast", {
      option,
      results: result,
    });

    Logger.info(`[VOTE POLL] Vote recorded successfully`);

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "You have already voted in this poll") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    Logger.error("[VOTE POLL] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record vote",
    });
  }
});

// ===== SHARE POLL =====
const sharePoll = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  Logger.info(`[SHARE POLL] Share request for poll: ${pollId}`);

  try {
    const newShareCount = await PollModel.share(pollId);

    res.status(200).json({
      success: true,
      message: "Share count updated",
      data: { shares: newShareCount },
    });
  } catch (error) {
    Logger.error("[SHARE POLL] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update share count",
    });
  }
});

// ===== GET POLL RESULTS =====
const getPollResults = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  Logger.info(`[GET POLL RESULTS] Request for poll: ${pollId}`);

  try {
    const results = await PollModel.getResults(pollId);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    Logger.error("[GET POLL RESULTS] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
    });
  }
});

// ===== DELETE POLL =====
const deletePoll = asyncHandler(async (req, res) => {
  const { pollId } = req.params;

  Logger.info(`[DELETE POLL] Request for poll: ${pollId}`);

  try {
    await PollModel.delete(pollId);

    res.status(200).json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error) {
    Logger.error("[DELETE POLL] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete poll",
    });
  }
});

module.exports = {
  createPoll,
  getAllPolls,
  getPollById,
  voteOnPoll,
  sharePoll,
  getPollResults,
  deletePoll,
};
