/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const productImagesExists = await knex.schema.hasTable("product_images");
  if (!productImagesExists) {
    await knex.schema.createTable("product_images", (table) => {
      table.increments("id").primary();
      table.integer("product_id").unsigned().notNullable();
      table.string("url", 500).notNullable();
      table.boolean("is_primary").defaultTo(false);
      table.integer("sort_order").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.foreign("product_id").references("id").on("products").onDelete("CASCADE");
      table.index("product_id");
    });

  }

  const productVariantsExists = await knex.schema.hasTable("product_variants");
  if (!productVariantsExists) {
    await knex.schema.createTable("product_variants", (table) => {
      table.increments("id").primary();
      table.integer("product_id").unsigned().notNullable();
      table.string("sku", 100).unique();
      table.string("size", 50);
      table.string("color", 50);
      table.decimal("price", 10, 2);
      table.integer("stock").defaultTo(0);
      table.enum("status", ["active", "inactive"]).defaultTo("active");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.foreign("product_id").references("id").on("products").onDelete("CASCADE");
      table.index("product_id");
      table.index("sku");
    });
    console.log("✅ Product_variants table created");
  }

  const productTagsExists = await knex.schema.hasTable("product_tags");
  if (!productTagsExists) {
    await knex.schema.createTable("product_tags", (table) => {
      table.increments("id").primary();
      table.integer("product_id").unsigned().notNullable();
      table.string("tag", 100).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.foreign("product_id").references("id").on("products").onDelete("CASCADE");
      table.index("product_id");
      table.index("tag");
    });
    console.log("✅ Product_tags table created");
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("product_tags");
  await knex.schema.dropTableIfExists("product_variants");
  await knex.schema.dropTableIfExists("product_images");
};
