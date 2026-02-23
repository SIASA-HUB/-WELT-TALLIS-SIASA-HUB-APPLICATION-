const { safeQuery } = require("../configurations/db");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamp");

/**
 * ===============================
 * MANIFESTO COMMENT MODEL
 * ===============================
 */

class ManifestoCommentModel {
  /**
   * Create a new comment
   */
  static async create(
    manifesto_id,
    user_id,
    user_name,
    comment,
    created_at = null,
  ) {
    const commentTime = created_at || getKenyaTimeISO();

    await safeQuery(
      `INSERT INTO manifesto_comments 
        (manifesto_id, user_id, user_name, comment, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [manifesto_id, user_id, user_name, comment, commentTime],
    );

    return {
      manifesto_id,
      user_id,
      user_name,
      comment,
      created_at: commentTime,
    };
  }

  /**
   * Get all comments for a manifesto
   */
  static async findByManifestoId(manifesto_id) {
    const comments = await safeQuery(
      `SELECT user_id, user_name, comment, created_at
       FROM manifesto_comments
       WHERE manifesto_id = ?
       ORDER BY created_at DESC`,
      [manifesto_id],
    );

    return comments;
  }

  /**
   * Get comment count for a manifesto
   */
  static async getCount(manifesto_id) {
    const result = await safeQuery(
      `SELECT COUNT(*) as count
       FROM manifesto_comments
       WHERE manifesto_id = ?`,
      [manifesto_id],
    );

    return result[0]?.count || 0;
  }

  /**
   * Delete a comment (if needed)
   */
  static async delete(comment_id) {
    await safeQuery(`DELETE FROM manifesto_comments WHERE id = ?`, [
      comment_id,
    ]);
    return true;
  }

  /**
   * Delete all comments for a manifesto (if needed)
   */
  static async deleteByManifestoId(manifesto_id) {
    await safeQuery(`DELETE FROM manifesto_comments WHERE manifesto_id = ?`, [
      manifesto_id,
    ]);
    return true;
  }
}

module.exports = ManifestoCommentModel;
