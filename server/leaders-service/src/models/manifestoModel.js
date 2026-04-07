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

    // Add unique IDs to each agenda item
    const agendaItemsWithIds = agenda_items.map((item, index) => ({
      id: this.generateAgendaItemId(),
      index: index,
      title: item.title,
      description: item.description,
    }));

    await safeQuery(
      `INSERT INTO manifestos (manifesto_id, leader_id, main_agenda, agenda_items, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        manifesto_id,
        leader_id,
        main_agenda,
        JSON.stringify(agendaItemsWithIds), // Store as JSON string
        now,
        now,
      ],
    );

    return {
      manifesto_id,
      leader_id,
      main_agenda,
      agenda_items: agendaItemsWithIds,
      created_at: now,
    };
  }

  static async update(manifesto_id, main_agenda, agenda_items) {
    const now = getKenyaTimeISO();

    const agendaItemsWithIds = agenda_items.map((item, index) => ({
      id: item.id || this.generateAgendaItemId(),
      index: index,
      title: item.title,
      description: item.description,
    }));

    await safeQuery(
      `UPDATE manifestos
       SET main_agenda = ?, agenda_items = ?, updated_at = ?
       WHERE manifesto_id = ?`,
      [main_agenda, JSON.stringify(agendaItemsWithIds), now, manifesto_id],
    );
    return { manifesto_id, main_agenda, agenda_items: agendaItemsWithIds };
  }

  static async findByLeaderId(leader_id) {
    const rows = await safeQuery(
      `SELECT manifesto_id, leader_id, main_agenda, agenda_items, created_at, updated_at
       FROM manifestos
       WHERE leader_id = ?
       ORDER BY created_at DESC`,
      [leader_id],
    );

    if (!rows || rows.length === 0) return [];

    return rows.map((item) => {
      let agendaItems = item.agenda_items;

      // Parse if it's a string
      if (typeof agendaItems === "string") {
        try {
          agendaItems = JSON.parse(agendaItems);
        } catch (e) {
          console.error("Error parsing agenda_items:", e);
          agendaItems = [];
        }
      }

      // Handle case where agenda_items might be an array of strings
      if (Array.isArray(agendaItems) && agendaItems.length > 0) {
        agendaItems = agendaItems.map((agendaItem) => {
          // If agenda item is a string, parse it
          if (typeof agendaItem === "string") {
            try {
              return JSON.parse(agendaItem);
            } catch (e) {
              return agendaItem;
            }
          }
          return agendaItem;
        });
      }

      return {
        ...item,
        agenda_items: agendaItems,
      };
    });
  }

  static async findById(manifesto_id) {
    const rows = await safeQuery(
      `SELECT manifesto_id, leader_id, main_agenda, agenda_items, created_at, updated_at
       FROM manifestos
       WHERE manifesto_id = ?`,
      [manifesto_id],
    );
    if (rows.length === 0) return null;

    let agendaItems = rows[0].agenda_items;

    // Parse if it's a string
    if (typeof agendaItems === "string") {
      try {
        agendaItems = JSON.parse(agendaItems);
      } catch (e) {
        console.error("Error parsing agenda_items:", e);
        agendaItems = [];
      }
    }

    // Handle case where agenda_items might be an array of strings
    if (Array.isArray(agendaItems) && agendaItems.length > 0) {
      agendaItems = agendaItems.map((agendaItem) => {
        if (typeof agendaItem === "string") {
          try {
            return JSON.parse(agendaItem);
          } catch (e) {
            return agendaItem;
          }
        }
        return agendaItem;
      });
    }

    return {
      ...rows[0],
      agenda_items: agendaItems,
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
}

module.exports = ManifestoModel;
