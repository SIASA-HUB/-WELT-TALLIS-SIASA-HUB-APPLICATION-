/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  // Check if columns exist before adding them
  const hasCategoryId = await knex.schema.hasColumn("products", "category_id");
  const hasSubcategoryId = await knex.schema.hasColumn("products", "subcategory_id");
  const hasBrand = await knex.schema.hasColumn("products", "brand");

  await knex.schema.alterTable("products", (table) => {
    if (!hasCategoryId) table.integer("category_id").unsigned();
    if (!hasSubcategoryId) table.integer("subcategory_id").unsigned();
    if (!hasBrand) table.string("brand", 255);
  });

  // Adding foreign keys separately in case the table already exists but lacks them
  // Note: For now, we allow them to be nullable so we can migrate data smoothly.

  console.log("Products table altered with category_id, subcategory_id, and brand");
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("products", (table) => {
    table.dropColumn("category_id");
    table.dropColumn("subcategory_id");
    table.dropColumn("brand");
  });
};
