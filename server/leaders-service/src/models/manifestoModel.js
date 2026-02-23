const { safeQuery } = require("../configurations/db");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamp");

//  manifesto     model

class ManifestoModel {
  /**
   * Generate a unique manifesto ID
   */
  static generateManifestoId() {
    const prefix = "MAN";
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    return `${prefix}-${randomPart}`;
  }

  /**
   * Create a new manifesto
   */
  static async create(leader_id, main_agenda, agenda_items) {
    const created_at = getKenyaTimeISO();

    const result = await safeQuery(
      `INSERT INTO manifestos (leader_id, main_agenda, agenda_items, created_at)
       VALUES (?, ?, ?, ?)`,
      [leader_id, main_agenda, JSON.stringify(agenda_items), created_at],
    );

    return {
      manifesto_id: result.insertId,
      leader_id,
      main_agenda,
      agenda_items,
      created_at,
    };
  }

  /**
   * Update an existing manifesto
   */
  static async update(manifesto_id, main_agenda, agenda_items) {
    await safeQuery(
      `UPDATE manifestos
       SET main_agenda = ?, agenda_items = ?
       WHERE manifesto_id = ?`,
      [main_agenda, JSON.stringify(agenda_items), manifesto_id],
    );

    return { manifesto_id, main_agenda, agenda_items };
  }

  /**
   * Find manifesto by leader ID
   */
  static async findByLeaderId(leader_id) {
    const rows = await safeQuery(
      `SELECT manifesto_id, leader_id, main_agenda, agenda_items, created_at
       FROM manifestos
       WHERE leader_id = ?`,
      [leader_id],
    );

    return rows.map((item) => ({
      ...item,
      agenda_items:
        typeof item.agenda_items === "string"
          ? JSON.parse(item.agenda_items)
          : item.agenda_items,
    }));
  }

  /**
   * Find manifesto by manifesto ID
   */
  static async findById(manifesto_id) {
    const rows = await safeQuery(
      `SELECT manifesto_id, leader_id, main_agenda, agenda_items, created_at
       FROM manifestos
       WHERE manifesto_id = ?`,
      [manifesto_id],
    );

    if (rows.length === 0) return null;

    return {
      ...rows[0],
      agenda_items:
        typeof rows[0].agenda_items === "string"
          ? JSON.parse(rows[0].agenda_items)
          : rows[0].agenda_items,
    };
  }

  /**
   * Check if manifesto exists
   */
  static async exists(manifesto_id) {
    const rows = await safeQuery(
      `SELECT 1 FROM manifestos WHERE manifesto_id = ?`,
      [manifesto_id],
    );
    return rows.length > 0;
  }

  /**
   * Delete manifesto (if needed)
   */
  static async delete(manifesto_id) {
    await safeQuery(`DELETE FROM manifestos WHERE manifesto_id = ?`, [
      manifesto_id,
    ]);
    return true;
  }
}

module.exports = ManifestoModel;
