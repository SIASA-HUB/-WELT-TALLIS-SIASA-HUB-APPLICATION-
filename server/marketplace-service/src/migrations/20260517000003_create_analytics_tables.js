/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const userActivityExists = await knex.schema.hasTable("user_activity");
  if (!userActivityExists) {
    await knex.schema.createTable("user_activity", (table) => {
      table.increments("id").primary();
      table.string("user_id", 255).notNullable();
      table.integer("product_id").unsigned();
      table.string("category_slug", 255);
      table.enum("action_type", ["view", "click", "add_to_cart", "purchase"]).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("user_id");
      table.index("product_id");
      table.index("category_slug");
      table.index("action_type");
    });

  }

  const recommendationsExists = await knex.schema.hasTable("recommendations");
  if (!recommendationsExists) {
    await knex.schema.createTable("recommendations", (table) => {
      table.increments("id").primary();
      table.string("user_id", 255).notNullable();
      table.integer("product_id").unsigned().notNullable();
      table.decimal("score", 10, 4).defaultTo(0);
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.foreign("product_id").references("id").on("products").onDelete("CASCADE");
      table.index("user_id");
      table.unique(["user_id", "product_id"]);
    });
    console.log("✅ Recommendations table created");
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("recommendations");
  await knex.schema.dropTableIfExists("user_activity");
};
