const asyncHandler = require('express-async-handler');
// Use the imports you already defined
const { safeQuery } = require('../configurations/db'); 
const Logger = require('../utils/logger/logger');
const { getKenyaTimeISO } = require('../utils/timestamps/timeStamp');

/**
 * ===============================
 * CREATE MANIFESTO
 * ===============================
 */

const generateManifestoId = () => {
  const prefix = 'MAN';
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 10)
    .toUpperCase();

  return `${prefix}-${randomPart}`;
};


const createManifesto = asyncHandler(async (req, res) => {
  const { leader_id, main_agenda, agenda_items } = req.body;

  if (!leader_id || !main_agenda || !agenda_items) {
    res.status(400);
    throw new Error('leader_id, main_agenda and agenda_items are required');
  }

  if (!Array.isArray(agenda_items) || agenda_items.length === 0) {
    res.status(400);
    throw new Error('agenda_items must be a non-empty array');
  }

  for (const item of agenda_items) {
    if (!item.title || !item.description) {
      res.status(400);
      throw new Error('Each agenda item must have a title and description');
    }
  }

  const created_at = getKenyaTimeISO();

  // INSERT WITHOUT manifesto_id — DB auto-generates it
  const result = await safeQuery(
    `INSERT INTO manifestos (leader_id, main_agenda, agenda_items, created_at)
     VALUES (?, ?, ?, ?)`,
    [leader_id, main_agenda, JSON.stringify(agenda_items), created_at]
  );

  // safeQuery should return the inserted ID, adjust if necessary
  const manifesto_id = result.insertId;

  Logger.info(`[Manifesto] Created: ${manifesto_id}`);

  res.status(201).json({
    success: true,
    data: {
      manifesto_id, // numeric ID now
      leader_id,
      main_agenda,
      agenda_items,
      created_at
    }
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
        throw new Error('Manifesto ID is required');
    }

    // FIX: Changed db.query to safeQuery
    await safeQuery(
        `UPDATE manifestos
         SET main_agenda = ?, agenda_items = ?
         WHERE manifesto_id = ?`,
        [
            main_agenda,
            JSON.stringify(agenda_items),
            manifesto_id
        ]
    );

    Logger.info(`[Manifesto] Updated: ${manifesto_id}`);

    res.status(200).json({
        success: true,
        message: 'Manifesto updated successfully'
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
        throw new Error('Leader ID is required');
    }

    // FIX: Changed db.query to safeQuery
    const rows = await safeQuery(
        `SELECT manifesto_id, leader_id, main_agenda, agenda_items, created_at
         FROM manifestos
         WHERE leader_id = ?`,
        [leader_id]
    );

    if (!rows || rows.length === 0) {
        res.status(404);
        throw new Error('No manifesto found for this leader');
    }

    res.status(200).json({
        success: true,
        data: rows.map(item => ({
            ...item,
            agenda_items: typeof item.agenda_items === 'string' ? JSON.parse(item.agenda_items) : item.agenda_items
        }))
    });
});


const getManifestoStats = asyncHandler(async (req, res) => {
    const { manifesto_id } = req.params;

    if (!manifesto_id) {
        return res.status(400).json({
            success: false,
            message: 'manifesto_id is required'
        });
    }

    // 1️⃣ Get vote stats
    const statsRows = await safeQuery(
        `SELECT 
            SUM(vote_type = 'approve') AS approve_count,
            SUM(vote_type = 'reject') AS reject_count,
            SUM(vote_type = 'neutral') AS neutral_count,
            COUNT(*) AS total_votes
         FROM manifesto_votes
         WHERE manifesto_id = ?`,
        [manifesto_id]
    );

    const statsData = statsRows[0] || {
        approve_count: 0,
        reject_count: 0,
        neutral_count: 0,
        total_votes: 0
    };

    // 2️⃣ Get recent voters
    const recentVotes = await safeQuery(
        `SELECT user_name, vote_type, voted_at
         FROM manifesto_votes
         WHERE manifesto_id = ?
         ORDER BY voted_at DESC
         LIMIT 10`,
        [manifesto_id]
    );

  const totalVotes = statsData.total_votes;

const approvalRate  = totalVotes ? Math.round((statsData.approve_count / totalVotes) * 100) : 0;
const rejectionRate = totalVotes ? Math.round((statsData.reject_count / totalVotes) * 100) : 0;
const neutralRate   = totalVotes ? Math.round((statsData.neutral_count / totalVotes) * 100) : 0;


    res.status(200).json({
        success: true,
        data: {
            manifesto_id,
            approve_count: statsData.approve_count,
            reject_count: statsData.reject_count,
            neutral_count: statsData.neutral_count,
            total_votes: totalVotes,
            approval_rate: approvalRate,
            rejection_rate: rejectionRate,
            neutral_rate: neutralRate,
            recent_votes: recentVotes
        }
    });
});






const voteOnManifesto = asyncHandler(async (req, res) => {
    const { manifesto_id } = req.params;
    const { user_id, user_name, vote_type } = req.body;

    if (!manifesto_id || !user_id || !vote_type) {
        return res.status(400).json({
            success: false,
            message: 'manifesto_id, user_id, and vote_type are required'
        });
    }

    if (!['approve', 'reject', 'neutral'].includes(vote_type)) {
        return res.status(400).json({
            success: false,
            message: 'vote_type must be approve, reject, or neutral'
        });
    }

    // 1️⃣ Check manifesto + get leader_id
    const manifestoRows = await safeQuery(
        `SELECT leader_id FROM manifestos WHERE manifesto_id = ?`,
        [manifesto_id]
    );

    if (manifestoRows.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Manifesto not found'
        });
    }

    const leader_id = manifestoRows[0].leader_id;

    // 2️⃣ Check if user already voted
    const existingVote = await safeQuery(
        `SELECT id FROM manifesto_votes 
         WHERE manifesto_id = ? AND user_id = ?`,
        [manifesto_id, user_id]
    );

    const voted_at = new Date();

    if (existingVote.length > 0) {
        // Update vote
        await safeQuery(
            `UPDATE manifesto_votes 
             SET vote_type = ?, voted_at = ?
             WHERE manifesto_id = ? AND user_id = ?`,
            [vote_type, voted_at, manifesto_id, user_id]
        );
    } else {
        // Insert vote
        await safeQuery(
            `INSERT INTO manifesto_votes 
             (manifesto_id, leader_id, user_id, user_name, vote_type, voted_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                manifesto_id,
                leader_id,
                user_id,
                user_name || 'Anonymous',
                vote_type,
                voted_at
            ]
        );
    }

    // 3️⃣ Get updated stats
    const stats = await safeQuery(
        `SELECT 
            SUM(vote_type = 'approve') AS approve_count,
            SUM(vote_type = 'reject') AS reject_count,
            SUM(vote_type = 'neutral') AS neutral_count,
            COUNT(*) AS total_votes
         FROM manifesto_votes
         WHERE manifesto_id = ?`,
        [manifesto_id]
    );

    res.status(200).json({
        success: true,
        message: 'Vote recorded successfully',
        data: {
            manifesto_id,
            leader_id,
            user_vote: vote_type,
            stats: stats[0]
        }
    });
});




const createManifestoComment = asyncHandler(async (req, res) => {
  const { user_id, user_name, comment, created_at } = req.body;
  const     { manifesto_id     }   =   req.params;

  if (!manifesto_id) {
    res.status(400);
    throw new Error('manifesto_id is required');
  }
  if (!user_id) {
    res.status(400);
    throw new Error('user_id is required');
  }
  if (!user_name) {
    res.status(400);
    throw new Error('user_name is required');
  }
  if (!comment) {
    res.status(400);
    throw new Error('comment is required');
  }

  // You can set created_at manually, or let it be NULL
  const commentTime = created_at || getKenyaTimeISO(); // optional

  await safeQuery(
    `INSERT INTO manifesto_comments 
      (manifesto_id, user_id, user_name, comment, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [manifesto_id, user_id, user_name, comment, commentTime]
  );

  Logger.info(`[Manifesto Comment] User ${user_id} commented on manifesto ${manifesto_id}`);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: {
      manifesto_id,
      user_id,
      user_name,
      comment,
      created_at: commentTime
    }
  });
});





const getManifestoComments = asyncHandler(async (req, res) => {
  const { manifesto_id } = req.params;

  if (!manifesto_id) {
    res.status(400);
    throw new Error('manifesto_id is required');
  }

  // Fetch all comments for this manifesto
  const [comments] = await safeQuery(
    `SELECT user_id, user_name, comment, created_at
     FROM manifesto_comments
     WHERE manifesto_id = ?
     ORDER BY created_at DESC`,
    [manifesto_id]
  );

  res.status(200).json({
    success: true,
    data: comments
  });
});



module.exports = {
    createManifesto,
    createManifestoComment,
    editManifesto,
    getManifestoByLeaderId,
    voteOnManifesto,
    getManifestoStats,
    getManifestoComments
};