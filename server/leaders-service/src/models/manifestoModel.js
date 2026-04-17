const { safeQuery } = require("../configurations/db");
const { getKenyaTimeISO } = require("../utils/timestamps/timeStamp");
const crypto = require("crypto");

class ManifestoModel {
  static generateUUID() {
    return crypto.randomUUID();
  }

  static generateAgendaItemId() {
    return crypto.randomUUID();
  }

  static async create(leader_id, main_agenda, agenda_items) {
    const manifesto_id = this.generateUUID();
    const now = getKenyaTimeISO();

    // 1. Insert the main manifesto record
    await safeQuery(
      `INSERT INTO manifestos (manifesto_id, leader_id, main_agenda, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [manifesto_id, leader_id, main_agenda, now, now]
    );

    // 2. Insert each agenda item into manifesto_agendas table
    const agendaItemsWithIds = [];
    for (const [index, item] of agenda_items.entries()) {
      const agenda_id = this.generateAgendaItemId();
      await safeQuery(
        `INSERT INTO manifesto_agendas (id, manifesto_id, title, description, votes_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [agenda_id, manifesto_id, item.title, item.description, 0, now, now]
      );
      agendaItemsWithIds.push({
        id: agenda_id,
        index: index,
        title: item.title,
        description: item.description,
        votes_count: 0
      });
    }

    await safeQuery(
      `INSERT INTO manifesto_analytics (manifesto_id, views_count, reads_count, shares_count, votes_count, created_at, updated_at)
       VALUES (?, 0, 0, 0, 0, ?, ?)
       ON DUPLICATE KEY UPDATE manifesto_id = manifesto_id`,
      [manifesto_id, now, now]
    );

    return {
      manifesto_id,
      leader_id,
      main_agenda,
      agenda_items: agendaItemsWithIds,
      created_at: now,
    };
  }

  static async ensureAnalyticsRecord(manifesto_id) {
    if (!manifesto_id) return false;
    await safeQuery(
      `INSERT INTO manifesto_analytics (manifesto_id, views_count, reads_count, shares_count, votes_count, created_at, updated_at)
       VALUES (?, 0, 0, 0, 0, NOW(), NOW())
       ON DUPLICATE KEY UPDATE manifesto_id = manifesto_id`,
      [manifesto_id]
    );
    return true;
  }

  static async getAnalytics(manifesto_id) {
    if (!manifesto_id) {
      return { views_count: 0, reads_count: 0, shares_count: 0, votes_count: 0 };
    }

    const rows = await safeQuery(
      `SELECT manifesto_id, views_count, reads_count, shares_count, votes_count
       FROM manifesto_analytics
       WHERE manifesto_id = ?`,
      [manifesto_id]
    );
    if (!rows || rows.length === 0) {
      return { views_count: 0, reads_count: 0, shares_count: 0, votes_count: 0 };
    }
    return rows[0];
  }

  static async incrementAnalytics(manifesto_id, field) {
    if (!manifesto_id || !['views_count', 'reads_count', 'shares_count', 'votes_count'].includes(field)) {
      return false;
    }
    await this.ensureAnalyticsRecord(manifesto_id);
    await safeQuery(
      `UPDATE manifesto_analytics SET ${field} = ${field} + 1, updated_at = NOW() WHERE manifesto_id = ?`,
      [manifesto_id]
    );
    return true;
  }

  static async updateVoteAnalytics(manifesto_id, increment = 1) {
    if (!manifesto_id) return false;
    await this.ensureAnalyticsRecord(manifesto_id);
    await safeQuery(
      `UPDATE manifesto_analytics SET votes_count = votes_count + ?, updated_at = NOW() WHERE manifesto_id = ?`,
      [increment, manifesto_id]
    );
    return true;
  }

  static async update(manifesto_id, main_agenda, agenda_items) {
    const now = getKenyaTimeISO();

    // 1. Update main manifesto
    await safeQuery(
      `UPDATE manifestos
       SET main_agenda = ?, updated_at = ?
       WHERE manifesto_id = ?`,
      [main_agenda, now, manifesto_id]
    );

    // 2. Refresh agendas: For simplicity, we delete existing and re-insert, or update if we have IDs
    // But normalized approach usually involves sync. Let's do a sync update.
    for (const item of agenda_items) {
      if (item.id) {
        await safeQuery(
          `UPDATE manifesto_agendas
           SET title = ?, description = ?, updated_at = ?
           WHERE id = ? AND manifesto_id = ?`,
          [item.title, item.description, now, item.id, manifesto_id]
        );
      } else {
        const agenda_id = this.generateAgendaItemId();
        await safeQuery(
          `INSERT INTO manifesto_agendas (id, manifesto_id, title, description, votes_count, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [agenda_id, manifesto_id, item.title, item.description, 0, now, now]
        );
      }
    }

    return { manifesto_id, main_agenda };
  }

  static async findByLeaderId(leader_id) {
    const rows = await safeQuery(
      `SELECT m.manifesto_id, m.leader_id, m.main_agenda, m.created_at, m.updated_at,
              COALESCE(ma.views_count, 0) as views_count,
              COALESCE(ma.reads_count, 0) as reads_count,
              COALESCE(ma.shares_count, 0) as shares_count,
              COALESCE(ma.votes_count, 0) as votes_count
       FROM manifestos m
       LEFT JOIN manifesto_analytics ma ON m.manifesto_id = ma.manifesto_id
       WHERE m.leader_id = ?
       ORDER BY m.created_at DESC`,
      [leader_id]
    );

    if (!rows || rows.length === 0) return [];

    const finalManifestos = [];
    for (const m of rows) {
      const agendas = await safeQuery(
        `SELECT id, title, description, votes_count FROM manifesto_agendas WHERE manifesto_id = ? ORDER BY created_at ASC`,
        [m.manifesto_id]
      );
      finalManifestos.push({
        ...m,
        agenda_items: agendas
      });
    }

    return finalManifestos;
  }

  static async findById(manifesto_id) {
    const rows = await safeQuery(
      `SELECT m.manifesto_id, m.leader_id, m.main_agenda, m.created_at, m.updated_at,
              COALESCE(ma.views_count, 0) as views_count,
              COALESCE(ma.reads_count, 0) as reads_count,
              COALESCE(ma.shares_count, 0) as shares_count,
              COALESCE(ma.votes_count, 0) as votes_count
       FROM manifestos m
       LEFT JOIN manifesto_analytics ma ON m.manifesto_id = ma.manifesto_id
       WHERE m.manifesto_id = ?`,
      [manifesto_id]
    );
    if (rows.length === 0) return null;

    const agendas = await safeQuery(
      `SELECT id, title, description, votes_count FROM manifesto_agendas WHERE manifesto_id = ? ORDER BY created_at ASC`,
      [manifesto_id]
    );

    return {
      ...rows[0],
      agenda_items: agendas,
    };
  }

  static async exists(manifesto_id) {
    const rows = await safeQuery(
      `SELECT 1 FROM manifestos WHERE manifesto_id = ?`,
      [manifesto_id],
    );
    return rows.length > 0;
  }

  static async delete(manifesto_id) {
    await safeQuery(`DELETE FROM manifestos WHERE manifesto_id = ?`, [
      manifesto_id,
    ]);
    return true;
  }


  // Get trending manifestos with real vote counts and leader images
  static async getTrending(limit = 20) {
    const rows = await safeQuery(
      `SELECT 
        m.manifesto_id, m.leader_id, m.main_agenda, m.created_at,
        l.name as leader_name, l.party as leader_party,
        l.position as leader_position, l.position_running_for,
        l.county as leader_county, l.constituency as leader_constituency,
        l.ward as leader_ward, l.slug as leader_slug,
        COALESCE(l.image_url, li.image_url) as leader_image,
        COALESCE((
          SELECT SUM(votes_count) FROM manifesto_agendas ma WHERE ma.manifesto_id = m.manifesto_id
        ), 0) as total_votes,
        COALESCE((
          SELECT COUNT(*) FROM manifesto_agendas ma WHERE ma.manifesto_id = m.manifesto_id
        ), 0) as agenda_count
      FROM manifestos m
      JOIN leaders l ON m.leader_id = l.leader_id
      LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
      WHERE l.status = 'active'
      ORDER BY total_votes DESC, m.created_at DESC
      LIMIT ?`,
      [limit]
    );

    // Attach top agenda for each manifesto
    const result = [];
    for (const m of rows) {
      const topAgenda = await safeQuery(
        `SELECT id, title, votes_count FROM manifesto_agendas WHERE manifesto_id = ? ORDER BY votes_count DESC LIMIT 3`,
        [m.manifesto_id]
      );
      result.push({ ...m, top_agendas: topAgenda });
    }
    return result;
  }

  // Get manifestos personalized by location + party
  static async getPersonalized(county, ward, constituency, political_party, limit = 20) {
    let conditions = [`l.status = 'active'`];
    const params = [];

    if (county) { conditions.push(`l.county = ?`); params.push(county); }
    if (ward) { conditions.push(`l.ward = ?`); params.push(ward); }
    if (constituency) { conditions.push(`l.constituency = ?`); params.push(constituency); }
    if (political_party && political_party !== 'Undecided' && political_party !== 'Prefer not to say') {
      conditions.push(`l.party = ?`); params.push(political_party);
    }

    params.push(limit);

    const rows = await safeQuery(
      `SELECT 
        m.manifesto_id, m.leader_id, m.main_agenda, m.created_at,
        l.name as leader_name, l.party as leader_party,
        l.position as leader_position, l.position_running_for,
        l.county as leader_county, l.constituency as leader_constituency, l.ward as leader_ward,
        l.slug as leader_slug,
        COALESCE(l.image_url, li.image_url) as leader_image,
        COALESCE((SELECT SUM(votes_count) FROM manifesto_agendas ma WHERE ma.manifesto_id = m.manifesto_id), 0) as total_votes
       FROM manifestos m
       JOIN leaders l ON m.leader_id = l.leader_id
       LEFT JOIN leader_images li ON l.leader_id = li.leader_id AND li.is_primary = 1
       WHERE ${conditions.join(' AND ')}
       ORDER BY total_votes DESC, m.created_at DESC
       LIMIT ?`,
      params
    );

    // Attach agendas
    for (const m of rows) {
      m.agenda_items = await safeQuery(
        `SELECT id, title, votes_count FROM manifesto_agendas WHERE manifesto_id = ? ORDER BY votes_count DESC`,
        [m.manifesto_id]
      );
    }
    return rows;
  }

  // Delete a single agenda item (votes cascade)
  static async deleteAgenda(agendaId) {
    await safeQuery(`DELETE FROM manifesto_agendas WHERE id = ?`, [agendaId]);
    return true;
  }

  // Track View / Read Time and increment analytics totals
  static async trackView(manifesto_id, user_id, read_time = 0) {
    if (!manifesto_id) return false;
    await safeQuery(
      `INSERT INTO manifesto_views (manifesto_id, user_id, read_time, created_at)
       VALUES (?, ?, ?, NOW())`,
      [manifesto_id, user_id || null, read_time]
    );

    await this.incrementAnalytics(manifesto_id, 'views_count');
    return true;
  }

  static async trackRead(manifesto_id, user_id, read_time = 0) {
    if (!manifesto_id) return false;
    await safeQuery(
      `INSERT INTO manifesto_views (manifesto_id, user_id, read_time, created_at)
       VALUES (?, ?, ?, NOW())`,
      [manifesto_id, user_id || null, read_time]
    );

    await this.incrementAnalytics(manifesto_id, 'reads_count');
    return true;
  }

  static async trackShare(manifesto_id, user_id, platform = 'generic') {
    if (!manifesto_id) return false;
    await safeQuery(
      `INSERT INTO manifesto_shares (manifesto_id, user_id, platform, created_at)
       VALUES (?, ?, ?, NOW())`,
      [manifesto_id, user_id || null, platform]
    );

    await this.incrementAnalytics(manifesto_id, 'shares_count');
    return true;
  }
}

module.exports = ManifestoModel;
