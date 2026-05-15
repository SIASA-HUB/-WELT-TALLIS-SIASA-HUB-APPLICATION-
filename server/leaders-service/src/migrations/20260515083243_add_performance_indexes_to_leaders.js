/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('leaders', (table) => {
    // Basic lookups (some might exist but Knex will skip if names match or we can try/catch)
    // To be safe with existing indexes, we check or use unique names
    
    // Performance/Analytics
    table.index(['likes'], 'idx_leaders_likes_mig');
    table.index(['dislikes'], 'idx_leaders_dislikes_mig');
    table.index(['endorsement_count'], 'idx_leaders_endorsements_mig');
    table.index(['shares'], 'idx_leaders_shares_mig');
    
    // Filtering - Category might not exist, let's check
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('leaders', (table) => {
    table.dropIndex([], 'idx_leaders_likes_mig');
    table.dropIndex([], 'idx_leaders_dislikes_mig');
    table.dropIndex([], 'idx_leaders_endorsements_mig');
    table.dropIndex([], 'idx_leaders_shares_mig');
  });
};
