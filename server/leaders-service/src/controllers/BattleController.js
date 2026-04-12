// controllers/leaderController.js - Complete Fixed Version (No Duplicates)

const Logger = require("../utils/logger/logger");
const LeaderModel = require("../models/LeadersModel");
const {
  asyncHandler,
  bcrypt,
  jwt,
  crypto,
  redis,
  db: { safeQuery, safeQueryOne },
  utils: { getKenyaTimeISO },
} = require("../../../global/index");

// Socket.IO instance (will be set from server)
let io;

// Helper to get duration in milliseconds
const getDurationMs = (duration) => {
  switch (duration) {
    case "1h":
      return 60 * 60 * 1000;
    case "3h":
      return 3 * 60 * 60 * 1000;
    case "6h":
      return 6 * 60 * 60 * 1000;
    case "12h":
      return 12 * 60 * 60 * 1000;
    case "1d":
      return 24 * 60 * 60 * 1000;
    case "3d":
      return 3 * 24 * 60 * 60 * 1000;
    case "7d":
      return 7 * 24 * 60 * 60 * 1000;
    default:
      return 7 * 24 * 60 * 60 * 1000;
  }
};

// Helper to format date for MySQL DATETIME
const formatMySQLDateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Set Socket.IO instance
const setIo = (socketIo) => {
  io = socketIo;
};

// Create a new battle (FIXED - no undefined values)
const createBattle = asyncHandler(async (req, res) => {
  const {
    challenger1_id,
    challenger2_id,
    created_by,
    duration,
    title,
    host_id,
    host_name,
  } = req.body;


  if (!challenger1_id || !challenger2_id) {
    return res.status(400).json({
      success: false,
      message: "Both challengers are required",
    });
  }

  if (challenger1_id === challenger2_id) {
    return res.status(400).json({
      success: false,
      message: "Cannot create a battle with the same aspirant",
    });
  }

  try {
    // Get challenger details - REMOVED status = 'active' filter
    const challenger1 = await safeQueryOne(
      `SELECT leader_id, name, party, position_running_for, 
              COALESCE((SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1), image_url) as primary_image
       FROM leaders WHERE leader_id = ?`,
      [challenger1_id],
    );

    const challenger2 = await safeQueryOne(
      `SELECT leader_id, name, party, position_running_for,
              COALESCE((SELECT image_url FROM leader_images WHERE leader_id = leaders.leader_id AND is_primary = 1 LIMIT 1), image_url) as primary_image
       FROM leaders WHERE leader_id = ?`,
      [challenger2_id],
    );


    if (!challenger1 || !challenger2) {
      return res.status(404).json({
        success: false,
        message: "One or both aspirants not found",
      });
    }

    const battleId = `battle_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const createdAt = getKenyaTimeISO();
    const durationMs = getDurationMs(duration || "7d");
    const expiresDate = new Date(Date.now() + durationMs);
    const expiresAt = formatMySQLDateTime(expiresDate);


    // FIXED: Handle undefined values - convert to null explicitly
    const finalTitle = title && title.trim() !== "" ? title : null;
    const finalHostId =
      host_id && host_id !== "undefined" ? host_id : created_by || null;
    const finalHostName =
      host_name && host_name !== "undefined"
        ? host_name
        : created_by
          ? "Host"
          : "Anonymous Host";
    const finalCreatedBy =
      created_by && created_by !== "undefined" ? created_by : "system";


    // Create battle in database
    await safeQuery(
      `INSERT INTO battles (battle_id, challenger1_id, challenger2_id, challenger1_data, challenger2_data, 
                           votes_left, votes_right, status, created_by, created_at, expires_at,
                           title, host_id, host_name, gift_total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        battleId,
        challenger1_id,
        challenger2_id,
        JSON.stringify(challenger1),
        JSON.stringify(challenger2),
        0,
        0,
        "active",
        finalCreatedBy,
        createdAt,
        expiresAt,
        finalTitle,
        finalHostId,
        finalHostName,
        0,
      ],
    );

    // Clear cache
    await redis.del("battles:active");
    await redis.del("battles:all");
    await redis.del("battles:top-creators");

    const battle = {
      id: battleId,
      title: finalTitle,
      hostId: finalHostId,
      hostName: finalHostName,
      left: {
        leader_id: challenger1.leader_id,
        name: challenger1.name,
        political_party: challenger1.party,
        position_running_for: challenger1.position_running_for,
        primary_image: challenger1.primary_image,
      },
      right: {
        leader_id: challenger2.leader_id,
        name: challenger2.name,
        political_party: challenger2.party,
        position_running_for: challenger2.position_running_for,
        primary_image: challenger2.primary_image,
      },
      votesLeft: 0,
      votesRight: 0,
      views: 0,
      giftTotal: 0,
      status: "active",
      created_at: createdAt,
      expires_at: expiresAt,
    };

    // Emit real-time event for new battle
    if (io) {
      io.emit("new-battle", {
        battleId,
        battle,
      });
    }

    Logger.info(
      `Battle created: ${battleId} - ${challenger1.name} vs ${challenger2.name}`,
    );

    res.status(201).json({
      success: true,
      message: "Battle created successfully",
      data: battle,
    });
    } catch (error) {
    Logger.error("Create battle error:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error creating battle",
      error: error.message,
    });
  }
});

// Get all active battles (UPDATED with title and host)
const getActiveBattles = asyncHandler(async (req, res) => {
  const cacheKey = "battles:active";

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cached),
      });
    }

    const battles = await safeQuery(
      `SELECT battle_id, challenger1_data, challenger2_data, votes_left, votes_right, 
              views, status, created_at, expires_at, title, host_name, gift_total
       FROM battles 
       WHERE status = 'active' AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 50`,
      [],
    );


    const formattedBattles = battles.map((battle) => ({
      id: battle.battle_id,
      title: battle.title,
      hostName: battle.host_name,
      left: JSON.parse(battle.challenger1_data),
      right: JSON.parse(battle.challenger2_data),
      votesLeft: battle.votes_left,
      votesRight: battle.votes_right,
      views: battle.views || 0,
      giftTotal: battle.gift_total || 0,
      status: battle.status,
      created_at: battle.created_at,
      expires_at: battle.expires_at,
    }));

    await redis.setex(cacheKey, 30, JSON.stringify(formattedBattles));

    res.status(200).json({
      success: true,
      source: "database",
      count: formattedBattles.length,
      data: formattedBattles,
    });
  } catch (error) {
    Logger.error("Get active battles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching battles",
    });
  }
});

// Get completed battles (NEW)
const getCompletedBattles = asyncHandler(async (req, res) => {
  const cacheKey = "battles:completed";
  const { limit = 50, offset = 0 } = req.query;

  try {
    const cached = await redis.get(cacheKey);
    if (cached && offset === 0) {
      const data = JSON.parse(cached);
      return res.status(200).json({
        success: true,
        source: "redis",
        data: data.slice(offset, offset + parseInt(limit)),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: data.length,
        },
      });
    }

    const battles = await safeQuery(
      `SELECT battle_id, challenger1_data, challenger2_data, votes_left, votes_right, 
              views, status, created_at, ended_at, expires_at, title, host_name, gift_total
       FROM battles 
       WHERE status = 'ended' 
       ORDER BY ended_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );

    const total = await safeQueryOne(
      `SELECT COUNT(*) as total FROM battles WHERE status = 'ended'`,
    );

    const formattedBattles = battles.map((battle) => {
      const left = JSON.parse(battle.challenger1_data);
      const right = JSON.parse(battle.challenger2_data);
      const isLeftWinner = battle.votes_left > battle.votes_right;

      return {
        id: battle.battle_id,
        title: battle.title,
        hostName: battle.host_name,
        left,
        right,
        votesLeft: battle.votes_left,
        votesRight: battle.votes_right,
        views: battle.views || 0,
        giftTotal: battle.gift_total || 0,
        status: battle.status,
        created_at: battle.created_at,
        ended_at: battle.ended_at || battle.expires_at,
        expires_at: battle.expires_at,
        winner: isLeftWinner ? left : right,
        winnerMargin: Math.abs(battle.votes_left - battle.votes_right),
        totalVotes: battle.votes_left + battle.votes_right,
      };
    });

    if (offset === 0) {
      await redis.setex(cacheKey, 300, JSON.stringify(formattedBattles));
    }

    res.status(200).json({
      success: true,
      data: formattedBattles,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: total?.total || 0,
      },
    });
  } catch (error) {
    Logger.error("Get completed battles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching completed battles",
    });
  }
});

// Get battle by ID (UPDATED with title and host)
const getBattleById = asyncHandler(async (req, res) => {
  const { battleId } = req.params;

  try {
    const battle = await safeQueryOne(
      `SELECT battle_id, challenger1_data, challenger2_data, votes_left, votes_right, 
              views, status, created_at, expires_at, ended_at, title, host_name, gift_total
       FROM battles 
       WHERE battle_id = ?`,
      [battleId],
    );

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle not found",
      });
    }

    // Increment views
    await safeQuery(
      `UPDATE battles SET views = views + 1 WHERE battle_id = ?`,
      [battleId],
    );

    const formattedBattle = {
      id: battle.battle_id,
      title: battle.title,
      hostName: battle.host_name,
      left: JSON.parse(battle.challenger1_data),
      right: JSON.parse(battle.challenger2_data),
      votesLeft: battle.votes_left,
      votesRight: battle.votes_right,
      views: battle.views + 1,
      giftTotal: battle.gift_total || 0,
      status: battle.status,
      created_at: battle.created_at,
      expires_at: battle.expires_at,
      ended_at: battle.ended_at,
    };

    res.status(200).json({
      success: true,
      data: formattedBattle,
    });
  } catch (error) {
    Logger.error("Get battle by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching battle",
    });
  }
});

// Vote in a battle (UPDATED with Socket.IO room)
const voteBattle = asyncHandler(async (req, res) => {
  const { battle_id, candidate_id, device_id } = req.body;


  if (!battle_id || !candidate_id) {
    return res.status(400).json({
      success: false,
      message: "Battle ID and candidate ID are required",
    });
  }

  try {
    const existingVote = await safeQueryOne(
      `SELECT * FROM battle_votes WHERE battle_id = ? AND device_id = ?`,
      [battle_id, device_id],
    );

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: "You have already voted in this battle",
      });
    }

    const battle = await safeQueryOne(
      `SELECT battle_id, challenger1_id, challenger2_id, votes_left, votes_right, status
       FROM battles 
       WHERE battle_id = ? AND status = 'active'`,
      [battle_id],
    );

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle not found or already ended",
      });
    }

    const isLeft = battle.challenger1_id === candidate_id;
    const isRight = battle.challenger2_id === candidate_id;

    if (!isLeft && !isRight) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate for this battle",
      });
    }

    await safeQuery(
      `INSERT INTO battle_votes (battle_id, candidate_id, device_id, created_at)
       VALUES (?, ?, ?, ?)`,
      [battle_id, candidate_id, device_id, getKenyaTimeISO()],
    );

    let newVotesLeft = battle.votes_left;
    let newVotesRight = battle.votes_right;

    if (isLeft) {
      newVotesLeft += 1;
    } else {
      newVotesRight += 1;
    }

    await safeQuery(
      `UPDATE battles SET votes_left = ?, votes_right = ? WHERE battle_id = ?`,
      [newVotesLeft, newVotesRight, battle_id],
    );

    await redis.del("battles:active");
    await redis.del("battles:completed");

    // Emit real-time vote update to battle room
    if (io) {
      io.to(`battle_${battle_id}`).emit("vote-update", {
        battleId: battle_id,
        votesLeft: newVotesLeft,
        votesRight: newVotesRight,
        candidateId: candidate_id,
        deviceId: device_id,
        timestamp: new Date().toISOString(),
      });
    }

    Logger.info(
      `Vote recorded: ${battle_id} - ${candidate_id} from ${device_id}`,
    );

    res.status(200).json({
      success: true,
      message: "Vote recorded successfully",
      data: {
        votes_left: newVotesLeft,
        votes_right: newVotesRight,
      },
    });
  } catch (error) {
    Logger.error("Vote battle error:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error recording vote",
    });
  }
});

// Send gift to battle (NEW)
const sendGift = asyncHandler(async (req, res) => {
  const { battle_id, gift_value, device_id, user_name } = req.body;


  if (!battle_id || !gift_value) {
    return res.status(400).json({
      success: false,
      message: "Battle ID and gift value are required",
    });
  }

  try {
    const battle = await safeQueryOne(
      `SELECT battle_id, gift_total FROM battles WHERE battle_id = ?`,
      [battle_id],
    );

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle not found",
      });
    }

    const giftId = `gift_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    await safeQuery(
      `INSERT INTO battle_gifts (gift_id, battle_id, gift_value, device_id, user_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        giftId,
        battle_id,
        gift_value,
        device_id,
        user_name || "Anonymous",
        getKenyaTimeISO(),
      ],
    );

    const newGiftTotal = (battle.gift_total || 0) + gift_value;

    await safeQuery(`UPDATE battles SET gift_total = ? WHERE battle_id = ?`, [
      newGiftTotal,
      battle_id,
    ]);

    await redis.del("battles:active");
    await redis.del("battles:completed");
    await redis.del("battles:top-creators");

    // Emit real-time gift update
    if (io) {
      io.to(`battle_${battle_id}`).emit("gift-update", {
        battleId: battle_id,
        giftValue: gift_value,
        giftTotal: newGiftTotal,
        userName: user_name || "Anonymous",
        deviceId: device_id,
        timestamp: new Date().toISOString(),
      });
    }

    Logger.info(`Gift sent: ${battle_id} - ${gift_value} coins from ${device_id}`);

    res.status(200).json({
      success: true,
      message: "Gift sent successfully",
      data: {
        gift_id: giftId,
        gift_value: gift_value,
        gift_total: newGiftTotal,
      },
    });
  } catch (error) {
    Logger.error("Send gift error:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Error sending gift",
    });
  }
});

// Add reaction to battle
const addReaction = asyncHandler(async (req, res) => {
  const { battle_id, reaction, device_id } = req.body;

  if (!battle_id || !reaction) {
    return res.status(400).json({
      success: false,
      message: "Battle ID and reaction are required",
    });
  }

  try {
    const battle = await safeQueryOne(
      `SELECT battle_id FROM battles WHERE battle_id = ?`,
      [battle_id],
    );

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle not found",
      });
    }

    await safeQuery(
      `INSERT INTO battle_reactions (battle_id, reaction, device_id, created_at)
       VALUES (?, ?, ?, ?)`,
      [battle_id, reaction, device_id, getKenyaTimeISO()],
    );

    // Get updated reaction count
    const reactionCount = await safeQueryOne(
      `SELECT COUNT(*) as count FROM battle_reactions WHERE battle_id = ? AND reaction = ?`,
      [battle_id, reaction],
    );

    // Emit real-time reaction update
    if (io) {
      io.to(`battle_${battle_id}`).emit("reaction-update", {
        battleId: battle_id,
        reaction,
        reactionCount: reactionCount?.count || 0,
        deviceId: device_id,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Reaction added",
    });
  } catch (error) {
    Logger.error("Add reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding reaction",
    });
  }
});

// Get reactions for a battle
const getReactions = asyncHandler(async (req, res) => {
  const { battleId } = req.params;

  try {
    const reactions = await safeQuery(
      `SELECT reaction, COUNT(*) as count 
       FROM battle_reactions 
       WHERE battle_id = ? 
       GROUP BY reaction 
       ORDER BY count DESC`,
      [battleId],
    );

    res.status(200).json({
      success: true,
      data: reactions,
    });
  } catch (error) {
    Logger.error("Get reactions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reactions",
    });
  }
});

// Add comment to battle
const addComment = asyncHandler(async (req, res) => {
  const { battle_id, comment, device_id, user_name } = req.body;

  if (!battle_id || !comment) {
    return res.status(400).json({
      success: false,
      message: "Battle ID and comment are required",
    });
  }

  try {
    const battle = await safeQueryOne(
      `SELECT battle_id FROM battles WHERE battle_id = ?`,
      [battle_id],
    );

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle not found",
      });
    }

    const commentId = `cmt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    await safeQuery(
      `INSERT INTO battle_comments (comment_id, battle_id, user_name, comment, device_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        commentId,
        battle_id,
        user_name || "Anonymous",
        comment,
        device_id,
        getKenyaTimeISO(),
      ],
    );

    const newComment = {
      id: commentId,
      user: user_name || "Anonymous",
      text: comment,
      created_at: getKenyaTimeISO(),
    };

    // Emit real-time comment update
    if (io) {
      io.to(`battle_${battle_id}`).emit("comment-update", {
        battleId: battle_id,
        comment: newComment,
        deviceId: device_id,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment added",
      data: newComment,
    });
  } catch (error) {
    Logger.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
    });
  }
});

// Get comments for a battle
const getComments = asyncHandler(async (req, res) => {
  const { battleId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    const comments = await safeQuery(
      `SELECT comment_id, user_name, comment, created_at
       FROM battle_comments 
       WHERE battle_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [battleId, parseInt(limit), parseInt(offset)],
    );

    const total = await safeQueryOne(
      `SELECT COUNT(*) as total FROM battle_comments WHERE battle_id = ?`,
      [battleId],
    );

    res.status(200).json({
      success: true,
      data: comments.map((c) => ({
        id: c.comment_id,
        user: c.user_name,
        text: c.comment,
        created_at: c.created_at,
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: total?.total || 0,
      },
    });
  } catch (error) {
    Logger.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
});

// End a battle (UPDATED with gift total)
const endBattle = asyncHandler(async (req, res) => {
  const { battleId } = req.params;

  try {
    const battle = await safeQueryOne(
      `SELECT battle_id, host_id, host_name, gift_total, votes_left, votes_right, challenger1_data, challenger2_data
       FROM battles WHERE battle_id = ?`,
      [battleId],
    );

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: "Battle not found",
      });
    }

    if (battle.status === "ended") {
      return res.status(400).json({
        success: false,
        message: "Battle already ended",
      });
    }

    const endedAt = getKenyaTimeISO();

    await safeQuery(
      `UPDATE battles SET status = 'ended', ended_at = ? WHERE battle_id = ?`,
      [endedAt, battleId],
    );

    // Update host earnings (10% of gifts)
    const hostEarnings = (battle.gift_total || 0) * 0.1;

    if (battle.host_id) {
      const result = await safeQuery(
        `UPDATE battle_hosts SET total_battles = total_battles + 1, total_earnings = total_earnings + ?
         WHERE host_id = ?`,
        [hostEarnings, battle.host_id],
      );

      if (result.affectedRows === 0) {
        await safeQuery(
          `INSERT INTO battle_hosts (host_id, host_name, total_battles, total_earnings, created_at)
           VALUES (?, ?, 1, ?, ?)`,
          [battle.host_id, battle.host_name, hostEarnings, getKenyaTimeISO()],
        );
      }
    }

    await redis.del("battles:active");
    await redis.del("battles:completed");
    await redis.del("battles:top-creators");

    const left = JSON.parse(battle.challenger1_data);
    const right = JSON.parse(battle.challenger2_data);
    const isLeftWinner = battle.votes_left > battle.votes_right;

    const completedBattle = {
      id: battle.battle_id,
      hostId: battle.host_id,
      hostName: battle.host_name,
      left,
      right,
      votesLeft: battle.votes_left,
      votesRight: battle.votes_right,
      giftTotal: battle.gift_total || 0,
      ended_at: endedAt,
      winner: isLeftWinner ? left : right,
    };

    // Emit battle ended event
    if (io) {
      io.to(`battle_${battleId}`).emit("battle-ended", {
        battleId,
        battle: completedBattle,
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Battle ended successfully",
      data: completedBattle,
    });
  } catch (error) {
    Logger.error("End battle error:", error);
    res.status(500).json({
      success: false,
      message: "Error ending battle",
    });
  }
});

// Get top battle creators (NEW)
const getTopCreators = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const cacheKey = "battles:top-creators";

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cached),
      });
    }

    const creators = await safeQuery(
      `SELECT host_id, host_name, total_battles, total_earnings, created_at
       FROM battle_hosts
       WHERE total_battles > 0
       ORDER BY total_battles DESC, total_earnings DESC
       LIMIT ?`,
      [parseInt(limit)],
    );

    const formattedCreators = creators.map((c) => ({
      id: c.host_id,
      name: c.host_name,
      battlesHosted: c.total_battles,
      earnings: c.total_earnings,
      joinedAt: c.created_at,
    }));

    await redis.setex(cacheKey, 300, JSON.stringify(formattedCreators));

    res.status(200).json({
      success: true,
      data: formattedCreators,
    });
  } catch (error) {
    Logger.error("Get top creators error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top creators",
    });
  }
});

// Get trending battles (NEW)
const getTrendingBattles = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  const cacheKey = "battles:trending";

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        source: "redis",
        data: JSON.parse(cached),
      });
    }

    const battles = await safeQuery(
      `SELECT battle_id, title, challenger1_data, challenger2_data, votes_left, votes_right, 
              views, gift_total, created_at, expires_at, host_name
       FROM battles
       WHERE status = 'active' AND expires_at > NOW()
       ORDER BY (views + (votes_left + votes_right) * 2 + gift_total * 3) DESC
       LIMIT ?`,
      [parseInt(limit)],
    );

    const formattedBattles = battles.map((battle) => ({
      id: battle.battle_id,
      title: battle.title,
      hostName: battle.host_name,
      left: JSON.parse(battle.challenger1_data),
      right: JSON.parse(battle.challenger2_data),
      votesLeft: battle.votes_left,
      votesRight: battle.votes_right,
      views: battle.views || 0,
      giftTotal: battle.gift_total || 0,
      created_at: battle.created_at,
      expires_at: battle.expires_at,
      trendingScore:
        (battle.views || 0) +
        (battle.votes_left + battle.votes_right) * 2 +
        (battle.gift_total || 0) * 3,
    }));

    await redis.setex(cacheKey, 60, JSON.stringify(formattedBattles));

    res.status(200).json({
      success: true,
      data: formattedBattles,
    });
  } catch (error) {
    Logger.error("Get trending battles error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trending battles",
    });
  }
});

// Get battle leaderboard (UPDATED with gift data)
const getBattleLeaderboard = asyncHandler(async (req, res) => {
  const { type = "votes", limit = 10 } = req.query;

  try {
    let orderBy = "";

    switch (type) {
      case "views":
        orderBy = "views DESC";
        break;
      case "gifts":
        orderBy = "gift_total DESC";
        break;
      case "engagement":
        orderBy =
          "(views + (votes_left + votes_right) * 2 + gift_total * 3) DESC";
        break;
      default:
        orderBy = "(votes_left + votes_right) DESC";
    }

    const leaderboard = await safeQuery(
      `SELECT battle_id, title, challenger1_data, challenger2_data, 
              votes_left, votes_right, views, gift_total, host_name
       FROM battles
       WHERE status = 'ended'
       ORDER BY ${orderBy}
       LIMIT ?`,
      [parseInt(limit)],
    );

    const formattedLeaderboard = leaderboard.map((battle) => ({
      id: battle.battle_id,
      title: battle.title,
      hostName: battle.host_name,
      left: JSON.parse(battle.challenger1_data),
      right: JSON.parse(battle.challenger2_data),
      votesLeft: battle.votes_left,
      votesRight: battle.votes_right,
      totalVotes: battle.votes_left + battle.votes_right,
      views: battle.views || 0,
      giftTotal: battle.gift_total || 0,
    }));

    res.status(200).json({
      success: true,
      data: formattedLeaderboard,
    });
  } catch (error) {
    Logger.error("Get battle leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leaderboard",
    });
  }
});

// Get user's vote history
const getUserVotes = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;

  try {
    const votes = await safeQuery(
      `SELECT bv.battle_id, bv.candidate_id, bv.created_at,
              b.challenger1_data, b.challenger2_data, b.title
       FROM battle_votes bv
       JOIN battles b ON bv.battle_id = b.battle_id
       WHERE bv.device_id = ?
       ORDER BY bv.created_at DESC`,
      [deviceId],
    );

    const formattedVotes = votes.map((vote) => ({
      battle_id: vote.battle_id,
      battle_title: vote.title,
      voted_for: vote.candidate_id,
      voted_at: vote.created_at,
      battle: {
        challenger1: JSON.parse(vote.challenger1_data),
        challenger2: JSON.parse(vote.challenger2_data),
      },
    }));

    res.status(200).json({
      success: true,
      data: formattedVotes,
    });
  } catch (error) {
    Logger.error("Get user votes error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user votes",
    });
  }
});

// Get battle statistics (UPDATED with gift totals)
const getBattleStats = asyncHandler(async (req, res) => {
  try {
    const stats = await safeQueryOne(
      `SELECT 
        COUNT(*) as total_battles,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_battles,
        SUM(CASE WHEN status = 'ended' THEN 1 ELSE 0 END) as ended_battles,
        SUM(views) as total_views,
        (SELECT COUNT(*) FROM battle_votes) as total_votes,
        (SELECT COUNT(*) FROM battle_comments) as total_comments,
        (SELECT COUNT(*) FROM battle_gifts) as total_gifts,
        SUM(gift_total) as total_gift_value
       FROM battles`,
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    Logger.error("Get battle stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching battle stats",
    });
  }
});

// Countdown tick (for voice alerts)
const countdownTick = asyncHandler(async (req, res) => {
  const { battleId, seconds } = req.body;

  if (io) {
    io.to(`battle_${battleId}`).emit("countdown-voice", {
      battleId,
      seconds,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(200).json({
    success: true,
    message: "Countdown tick sent",
  });
});

// Clean up expired battles (cron job)
const cleanupExpiredBattles = async () => {
  try {
    // Get expired active battles
    const expiredBattles = await safeQuery(
      `SELECT battle_id, host_id, host_name, gift_total, votes_left, votes_right, challenger1_data, challenger2_data
       FROM battles 
       WHERE status = 'active' AND expires_at < NOW()`,
    );

    for (const battle of expiredBattles) {
      // End the battle
      await safeQuery(
        `UPDATE battles SET status = 'ended', ended_at = ? WHERE battle_id = ?`,
        [getKenyaTimeISO(), battle.battle_id],
      );

      // Update host earnings
      const hostEarnings = (battle.gift_total || 0) * 0.1;

      if (battle.host_id) {
        await safeQuery(
          `UPDATE battle_hosts SET total_battles = total_battles + 1, total_earnings = total_earnings + ?
           WHERE host_id = ?`,
          [hostEarnings, battle.host_id],
        );
      }

      // Emit battle ended event
      if (io) {
        const left = JSON.parse(battle.challenger1_data);
        const right = JSON.parse(battle.challenger2_data);
        const isLeftWinner = battle.votes_left > battle.votes_right;

        io.to(`battle_${battle.battle_id}`).emit("battle-ended", {
          battleId: battle.battle_id,
          battle: {
            id: battle.battle_id,
            hostId: battle.host_id,
            hostName: battle.host_name,
            left,
            right,
            votesLeft: battle.votes_left,
            votesRight: battle.votes_right,
            giftTotal: battle.gift_total || 0,
            winner: isLeftWinner ? left : right,
          },
        });
      }
    }

    if (expiredBattles.length > 0) {
      Logger.info(`Cleaned up ${expiredBattles.length} expired battles`);
      await redis.del("battles:active");
      await redis.del("battles:completed");
      await redis.del("battles:top-creators");
    }
  } catch (error) {
    Logger.error("Cleanup expired battles error:", error);
  }
};

module.exports = {
  createBattle,
  getActiveBattles,
  getCompletedBattles,
  getBattleById,
  voteBattle,
  sendGift,
  addReaction,
  getReactions,
  addComment,
  getComments,
  endBattle,
  getTopCreators,
  getTrendingBattles,
  getBattleLeaderboard,
  getUserVotes,
  cleanupExpiredBattles,
  getBattleStats,
  countdownTick,
  setIo,
};