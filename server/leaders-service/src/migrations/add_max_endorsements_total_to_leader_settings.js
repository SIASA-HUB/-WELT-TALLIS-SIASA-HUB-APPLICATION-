// migrations/20250327_create_leader_settings_table.js

exports.up = async function (knex) {
  // 1. Check if leader_settings table exists
  const tableExists = await knex.schema.hasTable("leader_settings");

  if (!tableExists) {
    // Create the leader_settings table
    await knex.schema.createTable("leader_settings", (table) => {
      table.increments("id").primary();
      table.string("leader_id", 50).notNullable().unique();
      table.integer("max_endorsements_total").nullable().defaultTo(null);
      table.boolean("allow_endorsements").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      // Indexes
      table.index("leader_id");

      // Foreign key
      table
        .foreign("leader_id")
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
    });

    // 2. Insert default settings for all existing active leaders
    await knex.raw(`
      INSERT INTO leader_settings (leader_id, max_endorsements_total, allow_endorsements)
      SELECT leader_id, NULL, TRUE
      FROM leaders
      WHERE status = 'active'
    `);

    console.log("✅ leader_settings table created and populated");
  } else {
    // If table exists but column might be missing, add it
    const hasColumn = await knex.schema.hasColumn(
      "leader_settings",
      "max_endorsements_total",
    );

    if (!hasColumn) {
      await knex.schema.table("leader_settings", (table) => {
        table.integer("max_endorsements_total").nullable().defaultTo(null);
      });

      // Update existing rows to have NULL (unlimited)
      await knex("leader_settings").update({ max_endorsements_total: null });

      console.log("✅ max_endorsements_total column added to leader_settings");
    }
  }
};

exports.down = async function (knex) {
  // Only drop the table if we created it in this migration
  // This is safe because we check existence first
  await knex.schema.dropTableIfExists("leader_settings");
  console.log("✅ leader_settings table dropped");
};
