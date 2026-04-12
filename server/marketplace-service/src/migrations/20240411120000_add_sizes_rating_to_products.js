/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('products', table => {
    table.string('sizes', 500).nullable().comment('Comma separated sizes or JSON string');
    table.decimal('rating', 3, 1).defaultTo(4.5);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('products', table => {
    table.dropColumn('sizes');
    table.dropColumn('rating');
  });
};
