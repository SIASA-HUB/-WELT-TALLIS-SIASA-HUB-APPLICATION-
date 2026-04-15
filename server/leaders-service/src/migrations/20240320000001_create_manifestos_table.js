exports.up = async function (knex) {
  if (!(await knex.schema.hasTable("manifestos"))) {
    await knex.schema.createTable("manifestos", (table) => {
      table.uuid("manifesto_id").primary();
      table.uuid("leader_id").notNullable();
      table.text("main_agenda").notNullable();
      // agenda_items JSON column retained for legacy data migrations
      // (normalize_manifesto_agendas migration migrates this to manifesto_agendas table)
      table.json("agenda_items").defaultTo("[]");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index(["leader_id"]);
    });
    console.log("✅ Created manifestos table");
  } else {
    console.log("⏭️  manifestos table already exists, skipping");
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("manifestos");
};
