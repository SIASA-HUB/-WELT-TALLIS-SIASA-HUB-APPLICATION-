// ManifestoVoteModel.js - Fixed: uses raw pool connections, not knex
const { safeQuery, safeQueryOne, getConnection } = require("../configurations/db");

class ManifestoVoteModel {
  /**
   * Vote on a specific agenda item (per-agenda normalized voting)
   */
  static async vote(agenda_id, user_id, vote_type) {
    const conn = await getConnection();
    try {
      await conn.beginTransaction();

      // 1. Check duplicate vote
      const [existing] = await conn.execute(
        `SELECT id FROM agenda_votes WHERE agenda_id = ? AND user_id = ?`,
        [agenda_id, user_id]
      );
      if (existing.length > 0) {
        await conn.rollback();
        conn.release();
        return { success: false, already_voted: true, message: "Already voted on this agenda item" };
      }

      // 2. Insert vote
      await conn.execute(
        `INSERT INTO agenda_votes (agenda_id, user_id, vote_type, created_at) VALUES (?, ?, ?, NOW())`,
        [agenda_id, user_id, vote_type]
      );

      // 3. Increment votes_count atomically
      await conn.execute(
        `UPDATE manifesto_agendas SET votes_count = votes_count + 1 WHERE id = ?`,
        [agenda_id]
      );

      await conn.commit();
      conn.release();

      // 4. Return new count and vote breakdown
      const updated = await safeQueryOne(
        `SELECT votes_count FROM manifesto_agendas WHERE id = ?`,
        [agenda_id]
      );
      const voteBreakdown = await safeQueryOne(
        `SELECT 
           COALESCE(SUM(vote_type = 'approve'), 0) as approve_count,
           COALESCE(SUM(vote_type = 'reject'), 0) as reject_count,
           COUNT(*) as total_votes
         FROM agenda_votes
         WHERE agenda_id = ?`,
        [agenda_id]
      );

      return {
        success: true,
        votes_count: updated?.votes_count || 0,
        approve_count: voteBreakdown?.approve_count || 0,
        reject_count: voteBreakdown?.reject_count || 0,
        total_votes: voteBreakdown?.total_votes || 0,
      };
    } catch (error) {
      try { await conn.rollback(); conn.release(); } catch {}
      throw error;
    }
  }

  /**
   * Get a user's vote on a specific agenda item
   */
  static async getUserVote(agenda_id, user_id) {
    const row = await safeQueryOne(
      `SELECT vote_type FROM agenda_votes WHERE agenda_id = ? AND user_id = ? LIMIT 1`,
      [agenda_id, user_id]
    );
    return row?.vote_type || null;
  }

  /**
   * Get all votes by a user for a given manifesto
   */
  static async getUserVotesForManifesto(manifesto_id, user_id) {
    return await safeQuery(
      `SELECT av.agenda_id, av.vote_type
       FROM agenda_votes av
       JOIN manifesto_agendas ma ON av.agenda_id = ma.id
       WHERE ma.manifesto_id = ? AND av.user_id = ?`,
      [manifesto_id, user_id]
    );
  }

  /**
   * Get vote stats for all agendas in a manifesto
   */
  static async getStats(manifesto_id, agenda_id = null) {
    if (agenda_id) {
      const row = await safeQueryOne(
        `SELECT 
           ma.id as agenda_id,
           ma.title,
           ma.votes_count,
           COALESCE(SUM(av.vote_type = 'approve'), 0) as approve_count,
           COALESCE(SUM(av.vote_type = 'reject'), 0) as reject_count,
           COUNT(av.id) as total_votes
         FROM manifesto_agendas ma
         LEFT JOIN agenda_votes av ON ma.id = av.agenda_id
         WHERE ma.id = ?
         GROUP BY ma.id`,
        [agenda_id]
      );
      return {
        total_votes: row?.total_votes || row?.votes_count || 0,
        approve_count: row?.approve_count || 0,
        reject_count: row?.reject_count || 0,
        votes_count: row?.votes_count || 0,
        title: row?.title || '',
      };
    }

    return await safeQuery(
      `SELECT 
         ma.id as agenda_id,
         ma.title,
         ma.votes_count,
         COALESCE(SUM(av.vote_type = 'approve'), 0) as approve_count,
         COALESCE(SUM(av.vote_type = 'reject'), 0) as reject_count,
         COUNT(av.id) as total_votes
       FROM manifesto_agendas ma
       LEFT JOIN agenda_votes av ON ma.id = av.agenda_id
       WHERE ma.manifesto_id = ?
       GROUP BY ma.id
       ORDER BY ma.votes_count DESC`,
      [manifesto_id]
    );
  }

  /**
   * Get recent votes across all agendas in a manifesto
   */
  static async getRecentVotes(manifesto_id, limit = 10) {
    return await safeQuery(
      `SELECT v.user_id, v.vote_type, v.created_at, v.agenda_id, a.title
       FROM agenda_votes v
       JOIN manifesto_agendas a ON v.agenda_id = a.id
       WHERE a.manifesto_id = ?
       ORDER BY v.created_at DESC
       LIMIT ?`,
      [manifesto_id, limit]
    );
  }

  /**
   * Delete votes for a manifesto (cascade handles this via FK)
   */
  static async deleteByManifestoId(manifesto_id) {
    return true; // ON DELETE CASCADE handles it
  }
}

module.exports = ManifestoVoteModel;
