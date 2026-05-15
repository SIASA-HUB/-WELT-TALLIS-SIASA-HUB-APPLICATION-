/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('products', (table) => {
    table.index(['sub_category'], 'idx_products_sub_cat_mig');
    table.index(['stock'], 'idx_products_stock_mig');
    table.index(['rating'], 'idx_products_rating_mig');
    table.index(['updated_at'], 'idx_products_updated_mig');
    table.index(['created_at'], 'idx_products_created_mig');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('products', (table) => {
    table.dropIndex([], 'idx_products_sub_cat_mig');
    table.dropIndex([], 'idx_products_stock_mig');
    table.dropIndex([], 'idx_products_rating_mig');
    table.dropIndex([], 'idx_products_updated_mig');
    table.dropIndex([], 'idx_products_created_mig');
  });
};
