const { safeQuery, safeQueryOne } = require("../configurations/db");
const redis = require("../utils/redis/redis");
const Logger = require("../utils/logger/logger");

const PollModel = {
  // Create a new poll
  async create(data) {
    const { question, category, options, image_url, image_public_id } = data;

    const poll_id = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    // Insert into MySQL
    await safeQuery(
      `INSERT INTO polls (poll_id, question, category, image_url, image_public_id, total_votes, shares_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, 0, NOW(), NOW())`,
      [
        poll_id,
        question,
        category || "General",
        image_url || null,
        image_public_id || null,
      ],
    );

    // Insert options
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const option_id = `opt_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 3)}`;

      await safeQuery(
        `INSERT INTO poll_options (option_id, poll_id, option_label, party, rating, issue, sort_order, vote_count)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          option_id,
          poll_id,
          option.label,
          option.party || null,
          option.rating || null,
          option.issue || null,
          i,
        ],
      );
    }

    // Store in Redis for fast access
    await redis.hSet(`poll:${poll_id}`, "question", question);
    await redis.hSet(`poll:${poll_id}`, "category", category || "General");
    await redis.hSet(`poll:${poll_id}`, "image_url", image_url || "");
    await redis.hSet(`poll:${poll_id}`, "total_votes", "0");
    await redis.hSet(`poll:${poll_id}`, "shares", "0");

    return {
      poll_id,
      question,
      category,
      options,
      image_url,
      total_votes: 0,
    };
  },

  // Get poll by ID
  async getById(pollId) {
    // Try Redis first
    const pollData = await redis.hGetAll(`poll:${pollId}`);
    const votesData = await redis.hGetAll(`poll:${pollId}:votes`);

    if (Object.keys(pollData).length > 0) {
      // Get options from Redis
      let options = [];
      if (Object.keys(votesData).length > 0) {
        options = Object.entries(votesData).map(([label, count]) => ({
          label,
          count: parseInt(count),
          percentage: 0, // Will calculate below
        }));
      } else {
        // Fallback to MySQL for options
        const dbOptions = await safeQuery(
          `SELECT option_label, party, rating, issue, vote_count 
           FROM poll_options WHERE poll_id = ? ORDER BY sort_order`,
          [pollId],
        );

        options = dbOptions.map((opt) => ({
          label: opt.option_label,
          party: opt.party,
          rating: opt.rating,
          issue: opt.issue,
          count: opt.vote_count,
        }));
      }

      // Calculate percentages
      const totalVotes = options.reduce((sum, opt) => sum + opt.count, 0);
      options = options.map((opt) => ({
        ...opt,
        percentage:
          totalVotes > 0 ? Math.round((opt.count / totalVotes) * 100) : 0,
      }));

      return {
        poll_id: pollId,
        question: pollData.question,
        category: pollData.category,
        image_url: pollData.image_url,
        total_votes: totalVotes,
        shares: parseInt(pollData.shares || 0),
        options,
      };
    }

    // Fallback to MySQL
    const poll = await safeQueryOne(`SELECT * FROM polls WHERE poll_id = ?`, [
      pollId,
    ]);

    if (!poll) return null;

    const options = await safeQuery(
      `SELECT option_label, party, rating, issue, vote_count 
       FROM poll_options WHERE poll_id = ? ORDER BY sort_order`,
      [pollId],
    );

    const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

    return {
      poll_id: poll.poll_id,
      question: poll.question,
      category: poll.category,
      image_url: poll.image_url,
      total_votes: totalVotes,
      shares: poll.shares_count,
      options: options.map((opt) => ({
        label: opt.option_label,
        party: opt.party,
        rating: opt.rating,
        issue: opt.issue,
        count: opt.vote_count,
        percentage:
          totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0,
      })),
    };
  },

  // Get all polls
  async getAll(filters = {}) {
    const { category, status = "active", limit = 20, offset = 0 } = filters;

    let query = "SELECT * FROM polls WHERE status = ?";
    const params = [status];

    if (category && category !== "All") {
      query += " AND category = ?";
      params.push(category);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const polls = await safeQuery(query, params);

    // Get options for each poll
    for (const poll of polls) {
      const options = await safeQuery(
        `SELECT option_label, party, rating, issue, vote_count 
         FROM poll_options WHERE poll_id = ? ORDER BY sort_order`,
        [poll.poll_id],
      );

      const totalVotes = options.reduce((sum, opt) => sum + opt.vote_count, 0);

      poll.options = options.map((opt) => ({
        label: opt.option_label,
        party: opt.party,
        rating: opt.rating,
        issue: opt.issue,
        count: opt.vote_count,
        percentage:
          totalVotes > 0 ? Math.round((opt.vote_count / totalVotes) * 100) : 0,
      }));

      poll.total_votes = totalVotes;
    }

    return polls;
  },

  // Vote on poll
  async vote(pollId, optionLabel, userId = null, ipAddress = null) {
    // Check if user already voted (simple check)
    if (userId || ipAddress) {
      const voteKey = userId ? `user:${userId}:votes` : `ip:${ipAddress}:votes`;
      const hasVoted = await redis.sIsMember(voteKey, pollId);

      if (hasVoted) {
        throw new Error("You have already voted in this poll");
      }

      await redis.sAdd(voteKey, pollId);
      if (ipAddress) {
        await redis.expire(voteKey, 86400); // 24 hours
      }
    }

    // Increment in Redis
    const newCount = await redis.hIncrBy(
      `poll:${pollId}:votes`,
      optionLabel,
      1,
    );

    // Increment total votes
    const totalVotes = await redis.hIncrBy(`poll:${pollId}`, "total_votes", 1);

    // Update MySQL asynchronously (don't await)
    safeQuery(
      `UPDATE poll_options SET vote_count = vote_count + 1 
       WHERE poll_id = ? AND option_label = ?`,
      [pollId, optionLabel],
    ).catch((err) => Logger.error("MySQL vote update error:", err));

    safeQuery(
      `UPDATE polls SET total_votes = total_votes + 1 WHERE poll_id = ?`,
      [pollId],
    ).catch((err) => Logger.error("MySQL poll total update error:", err));

    // Get all votes for percentages
    const allVotes = await redis.hGetAll(`poll:${pollId}:votes`);
    const percentages = {};

    for (const [opt, count] of Object.entries(allVotes)) {
      percentages[opt] = Math.round(
        (parseInt(count) / parseInt(totalVotes)) * 100,
      );
    }

    return {
      option: optionLabel,
      new_count: newCount,
      total_votes: parseInt(totalVotes),
      percentages,
    };
  },

  // Increment share count
  async share(pollId) {
    const newShareCount = await redis.hIncrBy(`poll:${pollId}`, "shares", 1);

    safeQuery(
      `UPDATE polls SET shares_count = shares_count + 1 WHERE poll_id = ?`,
      [pollId],
    ).catch((err) => Logger.error("MySQL share update error:", err));

    return newShareCount;
  },

  // Get poll results
  async getResults(pollId) {
    const votes = await redis.hGetAll(`poll:${pollId}:votes`);
    const pollData = await redis.hGetAll(`poll:${pollId}`);

    const totalVotes = Object.values(votes).reduce(
      (sum, v) => sum + parseInt(v),
      0,
    );

    const results = Object.entries(votes).map(([option, count]) => ({
      label: option,
      count: parseInt(count),
      percentage:
        totalVotes > 0 ? Math.round((parseInt(count) / totalVotes) * 100) : 0,
    }));

    // Sort by count descending
    results.sort((a, b) => b.count - a.count);

    return {
      poll_id: pollId,
      question: pollData.question,
      total_votes: totalVotes,
      shares: parseInt(pollData.shares || 0),
      results,
    };
  },

  // Delete poll
  async delete(pollId) {
    // Remove from Redis
    await redis.del(`poll:${pollId}`);
    await redis.del(`poll:${pollId}:votes`);

    // Soft delete in MySQL
    await safeQuery(`UPDATE polls SET status = 'deleted' WHERE poll_id = ?`, [
      pollId,
    ]);

    return true;
  },
};

module.exports = PollModel;
