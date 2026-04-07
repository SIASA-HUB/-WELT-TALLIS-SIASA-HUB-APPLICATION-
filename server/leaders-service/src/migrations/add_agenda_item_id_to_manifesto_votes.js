// migration file: update_existing_manifestos_with_agenda_ids.js
exports.up = async function (knex) {
  try {
    console.log("Updating existing manifestos with agenda item IDs...");

    // Get all manifestos
    const manifestos = await knex.raw(`
      SELECT manifesto_id, agenda_items FROM manifestos
    `);

    console.log(`Found ${manifestos[0].length} manifestos to update`);

    for (const manifesto of manifestos[0]) {
      let agendaItems = manifesto.agenda_items;

      // Parse if it's a string
      if (typeof agendaItems === "string") {
        agendaItems = JSON.parse(agendaItems);
      }

      // Check if agenda items already have IDs
      const needsUpdate = agendaItems.some((item) => !item.id);

      if (needsUpdate) {
        // Add IDs to agenda items that don't have them
        const updatedAgendaItems = agendaItems.map((item, index) => ({
          id: item.id || require("crypto").randomUUID(),
          index: index,
          title: item.title,
          description: item.description,
        }));

        // Update the manifesto
        await knex.raw(
          `
          UPDATE manifestos 
          SET agenda_items = ?, updated_at = NOW()
          WHERE manifesto_id = ?
        `,
          [JSON.stringify(updatedAgendaItems), manifesto.manifesto_id],
        );

        console.log(`✅ Updated manifesto: ${manifesto.manifesto_id}`);
      } else {
        console.log(`⏭️ Manifesto already has IDs: ${manifesto.manifesto_id}`);
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    throw error;
  }
};

exports.down = async function (knex) {
  try {
    console.log("Rolling back: removing agenda item IDs...");

    // Get all manifestos
    const manifestos = await knex.raw(`
      SELECT manifesto_id, agenda_items FROM manifestos
    `);

    for (const manifesto of manifestos[0]) {
      let agendaItems = manifesto.agenda_items;

      if (typeof agendaItems === "string") {
        agendaItems = JSON.parse(agendaItems);
      }

      // Remove IDs from agenda items
      const updatedAgendaItems = agendaItems.map((item) => ({
        title: item.title,
        description: item.description,
      }));

      await knex.raw(
        `
        UPDATE manifestos 
        SET agenda_items = ?, updated_at = NOW()
        WHERE manifesto_id = ?
      `,
        [JSON.stringify(updatedAgendaItems), manifesto.manifesto_id],
      );

      console.log(`✅ Reverted manifesto: ${manifesto.manifesto_id}`);
    }

    console.log("✅ Rollback completed!");
  } catch (error) {
    console.error("❌ Rollback error:", error.message);
  }
};
