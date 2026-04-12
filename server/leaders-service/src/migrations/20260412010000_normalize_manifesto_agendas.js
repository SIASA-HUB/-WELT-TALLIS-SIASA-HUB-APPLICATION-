exports.up = async function (knex) {
  // 1. Create manifesto_agendas table
  if (!(await knex.schema.hasTable("manifesto_agendas"))) {
    await knex.schema.createTable("manifesto_agendas", (table) => {
      table.uuid("id").primary();
      table.uuid("manifesto_id").notNullable();
      table.string("title").notNullable();
      table.text("description").notNullable();
      table.integer("votes_count").defaultTo(0);
      table.timestamps(true, true);
      
      table.foreign("manifesto_id").references("manifesto_id").inTable("manifestos").onDelete("CASCADE");
      table.index(["manifesto_id"]);
    });
  }

  // 2. Create agenda_votes table
  if (!(await knex.schema.hasTable("agenda_votes"))) {
    await knex.schema.createTable("agenda_votes", (table) => {
      table.increments("id").primary();
      table.uuid("agenda_id").notNullable();
      table.uuid("user_id").notNullable();
      table.string("vote_type").notNullable(); // 'approve', 'reject'
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.foreign("agenda_id").references("id").inTable("manifesto_agendas").onDelete("CASCADE");
      table.unique(["agenda_id", "user_id"]); // Prevent duplicate votes
      table.index(["agenda_id"]);
      table.index(["user_id"]);
    });
  }

  // 3. Create manifesto_views table (Read-time tracking)
  if (!(await knex.schema.hasTable("manifesto_views"))) {
    await knex.schema.createTable("manifesto_views", (table) => {
      table.increments("id").primary();
      table.uuid("manifesto_id").notNullable();
      table.uuid("user_id").nullable(); // Can be anonymous
      table.integer("read_time").defaultTo(0); // in seconds
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.foreign("manifesto_id").references("manifesto_id").inTable("manifestos").onDelete("CASCADE");
      table.index(["manifesto_id"]);
    });
  }

  // 4. Migrate existing data
  const manifestos = await knex("manifestos").select("manifesto_id", "agenda_items");
  
  for (const manifesto of manifestos) {
    let items = manifesto.agenda_items;
    if (typeof items === "string") {
      try {
        items = JSON.parse(items);
      } catch (e) {
        continue;
      }
    }

    if (Array.isArray(items)) {
      for (const item of items) {
        // Only insert if it looks like a valid agenda item
        if (item.title || item.description) {
          const itemId = item.id || knex.raw("(UUID())");
          
          // Check if item already exists to prevent duplicate entry errors
          const existing = (item.id && typeof item.id === 'string') ? await knex("manifesto_agendas").where("id", item.id).first() : null;
          
          if (!existing) {
            await knex("manifesto_agendas").insert({
              id: itemId,
              manifesto_id: manifesto.manifesto_id,
              title: item.title || "Untitled Agenda",
              description: item.description || "",
              votes_count: 0,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now()
            });
          }
        }
      }
    }
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("manifesto_views");
  await knex.schema.dropTableIfExists("agenda_votes");
  await knex.schema.dropTableIfExists("manifesto_agendas");
};
