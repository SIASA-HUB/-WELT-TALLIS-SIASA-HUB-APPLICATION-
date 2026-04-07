// migrations/20250402_add_boost_columns.js

exports.up = async function (knex) {
  // Add boost columns to endorsements table
  const hasBoostCount = await knex.schema.hasColumn(
    "endorsements",
    "boost_count",
  );
  if (!hasBoostCount) {
    await knex.schema.table("endorsements", (table) => {
      table.integer("boost_count").defaultTo(0);
      table.decimal("total_boost_amount", 10, 2).defaultTo(0);
    });
  }

  // Create endorsement_boosts table
  const hasBoostsTable = await knex.schema.hasTable("endorsement_boosts");
  if (!hasBoostsTable) {
    await knex.schema.createTable("endorsement_boosts", (table) => {
      table.increments("id").primary();
      table.integer("endorsement_id").unsigned().notNullable();
      table.string("user_id", 255).notNullable();
      table.integer("amount").notNullable().defaultTo(10);
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("endorsement_id");
      table.index("user_id");
      table.index("created_at");

      table
        .foreign("endorsement_id")
        .references("id")
        .inTable("endorsements")
        .onDelete("CASCADE");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("endorsement_boosts");

  const hasBoostCount = await knex.schema.hasColumn(
    "endorsements",
    "boost_count",
  );
  if (hasBoostCount) {
    await knex.schema.table("endorsements", (table) => {
      table.dropColumn("boost_count");
      table.dropColumn("total_boost_amount");
    });
  }
};
