exports.up = async function (knex) {
  //  Add the shares counter column to the main leaders table
  const hasSharesColumn = await knex.schema.hasColumn("leaders", "shares");
  if (!hasSharesColumn) {
    await knex.schema.alterTable("leaders", (table) => {
      table.integer("shares").defaultTo(0).after("views");
    });
  }

  // Create the leader_shares
  const hasSharesTable = await knex.schema.hasTable("leader_shares");
  if (!hasSharesTable) {
    await knex.schema.createTable("leader_shares", (table) => {
      table.increments("id").primary();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("user_id", 50).nullable();
      table.string("ip_address", 45).nullable();
      table.string("platform", 50).nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("leader_id");
    });
  }
};

exports.down = async function (knex) {
  // Remove the tracking table
  await knex.schema.dropTableIfExists("leader_shares");

  // Remove the column from leaders table
  await knex.schema.alterTable("leaders", (table) => {
    table.dropColumn("shares");
  });
};
