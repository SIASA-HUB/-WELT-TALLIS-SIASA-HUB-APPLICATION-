// migration file: fix_existing_manifesto_data.js
exports.up = async function (knex) {
  try {
    console.log("Fixing existing manifesto data...");

    // Get all manifestos
    const manifestos = await knex.raw(`
      SELECT manifesto_id, agenda_items FROM manifestos
    `);

    console.log(`Found ${manifestos[0].length} manifestos to fix`);

    for (const manifesto of manifestos[0]) {
      let agendaItems = manifesto.agenda_items;

      // Parse if it's a string
      if (typeof agendaItems === "string") {
        try {
          agendaItems = JSON.parse(agendaItems);
        } catch (e) {
          console.error(`Error parsing for ${manifesto.manifesto_id}:`, e);
          continue;
        }
      }

      // Fix the structure - ensure it's an array of objects
      let fixedItems = [];

      if (Array.isArray(agendaItems)) {
        for (let i = 0; i < agendaItems.length; i++) {
          let item = agendaItems[i];

          // If item is a string, parse it
          if (typeof item === "string") {
            try {
              item = JSON.parse(item);
            } catch (e) {
              console.error(`Error parsing item ${i}:`, e);
              continue;
            }
          }

          // Ensure item has id, title, description
          fixedItems.push({
            id: item.id || crypto.randomUUID(),
            index: i,
            title: item.title || "Untitled",
            description: item.description || "No description",
          });
        }
      }

      // Update the manifesto with fixed data
      await knex.raw(
        `
        UPDATE manifestos 
        SET agenda_items = ?, updated_at = NOW()
        WHERE manifesto_id = ?
      `,
        [JSON.stringify(fixedItems), manifesto.manifesto_id],
      );

      console.log(`✅ Fixed manifesto: ${manifesto.manifesto_id}`);
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration error:", error.message);
    throw error;
  }
};

exports.down = async function (knex) {
  console.log("Rollback not needed for data fix");
};
