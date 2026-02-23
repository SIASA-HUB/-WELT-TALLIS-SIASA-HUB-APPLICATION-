const { safeQuery } = require("../configurations/db");

/**
 * ===============================
 * MANIFESTO VOTE MODEL
 * ===============================
 */

class ManifestoVoteModel {
  /**
   * Create or update a vote
   */
  static async upsert(manifesto_id, leader_id, user_id, user_name, vote_type) {
    const voted_at = new Date();

    // Check if user already voted
    const existingVote = await safeQuery(
      `SELECT id FROM manifesto_votes 
       WHERE manifesto_id = ? AND user_id = ?`,
      [manifesto_id, user_id],
    );

    if (existingVote.length > 0) {
      // Update existing vote
      await safeQuery(
        `UPDATE manifesto_votes 
         SET vote_type = ?, voted_at = ?
         WHERE manifesto_id = ? AND user_id = ?`,
        [vote_type, voted_at, manifesto_id, user_id],
      );
      return { action: "updated", vote_type };
    } else {
      // Insert new vote
      await safeQuery(
        `INSERT INTO manifesto_votes 
         (manifesto_id, leader_id, user_id, user_name, vote_type, voted_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          manifesto_id,
          leader_id,
          user_id,
          user_name || "Anonymous",
          vote_type,
          voted_at,
        ],
      );
      return { action: "created", vote_type };
    }
  }

  /**
   * Get vote statistics for a manifesto
   */
  static async getStats(manifesto_id) {
    const statsRows = await safeQuery(
      `SELECT 
          SUM(vote_type = 'approve') AS approve_count,
          SUM(vote_type = 'reject') AS reject_count,
          SUM(vote_type = 'neutral') AS neutral_count,
          COUNT(*) AS total_votes
       FROM manifesto_votes
       WHERE manifesto_id = ?`,
      [manifesto_id],
    );

    const stats = statsRows[0] || {
      approve_count: 0,
      reject_count: 0,
      neutral_count: 0,
      total_votes: 0,
    };

    const totalVotes = stats.total_votes;
    const approvalRate = totalVotes
      ? Math.round((stats.approve_count / totalVotes) * 100)
      : 0;
    const rejectionRate = totalVotes
      ? Math.round((stats.reject_count / totalVotes) * 100)
      : 0;
    const neutralRate = totalVotes
      ? Math.round((stats.neutral_count / totalVotes) * 100)
      : 0;

    return {
      ...stats,
      approval_rate: approvalRate,
      rejection_rate: rejectionRate,
      neutral_rate: neutralRate,
    };
  }

  /**
   * Get recent votes for a manifesto
   */
  static async getRecentVotes(manifesto_id, limit = 10) {
    return await safeQuery(
      `SELECT user_name, vote_type, voted_at
       FROM manifesto_votes
       WHERE manifesto_id = ?
       ORDER BY voted_at DESC
       LIMIT ?`,
      [manifesto_id, limit],
    );
  }

  /**
   * Get user's vote on a manifesto
   */
  static async getUserVote(manifesto_id, user_id) {
    const rows = await safeQuery(
      `SELECT vote_type FROM manifesto_votes
       WHERE manifesto_id = ? AND user_id = ?`,
      [manifesto_id, user_id],
    );

    return rows.length > 0 ? rows[0].vote_type : null;
  }

  /**
   * Delete a vote (if needed)
   */
  static async delete(manifesto_id, user_id) {
    await safeQuery(
      `DELETE FROM manifesto_votes
       WHERE manifesto_id = ? AND user_id = ?`,
      [manifesto_id, user_id],
    );
    return true;
  }
}

module.exports = ManifestoVoteModel;
