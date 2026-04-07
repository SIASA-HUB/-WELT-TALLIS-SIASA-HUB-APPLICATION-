const { safeQuery } = require("../configurations/db");

class ManifestoVoteModel {
  static async upsert(
    manifesto_id,
    agenda_item_id,
    leader_id,
    user_id,
    vote_type,
  ) {
    const now = new Date();

    // Check if user already voted on this agenda item
    const existingVote = await safeQuery(
      `SELECT vote_id FROM manifesto_votes WHERE manifesto_id = ? AND agenda_item_id = ? AND user_id = ?`,
      [manifesto_id, agenda_item_id, user_id],
    );

    if (existingVote.length > 0) {
      await safeQuery(
        `UPDATE manifesto_votes SET vote_type = ?, created_at = ? WHERE vote_id = ?`,
        [vote_type, now, existingVote[0].vote_id],
      );
      return { action: "updated", vote_type };
    } else {
      await safeQuery(
        `INSERT INTO manifesto_votes (manifesto_id, agenda_item_id, leader_id, user_id, vote_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [manifesto_id, agenda_item_id, leader_id, user_id, vote_type, now],
      );
      return { action: "created", vote_type };
    }
  }

  static async getStats(manifesto_id, agenda_item_id = null) {
    let query = `
      SELECT 
          SUM(vote_type = 'approve') AS approve_count,
          SUM(vote_type = 'reject') AS reject_count,
          SUM(vote_type = 'neutral') AS neutral_count,
          COUNT(*) AS total_votes
       FROM manifesto_votes
       WHERE manifesto_id = ?
    `;
    let params = [manifesto_id];

    if (agenda_item_id) {
      query += ` AND agenda_item_id = ?`;
      params.push(agenda_item_id);
    }

    const statsRows = await safeQuery(query, params);

    const stats = statsRows[0] || {
      approve_count: 0,
      reject_count: 0,
      neutral_count: 0,
      total_votes: 0,
    };

    return {
      approve_count: Number(stats.approve_count) || 0,
      reject_count: Number(stats.reject_count) || 0,
      neutral_count: Number(stats.neutral_count) || 0,
      total_votes: Number(stats.total_votes) || 0,
    };
  }

  static async getRecentVotes(manifesto_id, limit = 10) {
    return await safeQuery(
      `SELECT user_id, vote_type, created_at, agenda_item_id
       FROM manifesto_votes
       WHERE manifesto_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [manifesto_id, limit],
    );
  }

  static async getUserVote(manifesto_id, agenda_item_id, user_id) {
    const rows = await safeQuery(
      `SELECT vote_type FROM manifesto_votes WHERE manifesto_id = ? AND agenda_item_id = ? AND user_id = ?`,
      [manifesto_id, agenda_item_id, user_id],
    );
    return rows.length > 0 ? rows[0].vote_type : null;
  }

  static async deleteByManifestoId(manifesto_id) {
    await safeQuery(`DELETE FROM manifesto_votes WHERE manifesto_id = ?`, [
      manifesto_id,
    ]);
    return true;
  }
}

module.exports = ManifestoVoteModel;
