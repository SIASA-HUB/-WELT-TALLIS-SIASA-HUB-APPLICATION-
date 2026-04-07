/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("products");
  if (!exists) {
    await knex.schema.createTable("products", (table) => {
      table.increments("id").primary();
      table.string("name", 255).notNullable();
      table.string("title", 500);
      table.text("description");
      table.decimal("price", 10, 2).notNullable();
      table.decimal("cost", 10, 2);
      table.decimal("mrp", 10, 2);
      table.string("discount", 50);
      table.string("image", 500);
      table.string("url", 500);
      table.string("detail_url", 500);
      table.string("category", 100);
      table.string("sub_category", 100);
      table.integer("stock").defaultTo(0);
      table.string("seller", 255);
      table.boolean("featured").defaultTo(false);
      table.enum("status", ["active", "inactive", "draft"]).defaultTo("active");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("category");
      table.index("status");
      table.index("featured");
    });
    console.log("✅ Products table created");
  } else {
    console.log("⚠️ Products table already exists");
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  const exists = await knex.schema.hasTable("products");
  if (exists) {
    await knex.schema.dropTable("products");
    console.log("✅ Products table dropped");
  }
};
