exports.up = async function(knex) {
  const hasViews = await knex.schema.hasColumn('endorsements', 'views');
  const hasShares = await knex.schema.hasColumn('endorsements', 'shares');
  const hasFeatured = await knex.schema.hasColumn('endorsements', 'featured');
  const hasExpiresAt = await knex.schema.hasColumn('endorsements', 'expires_at');

  await knex.schema.table('endorsements', (table) => {
    if (!hasViews) {
      table.integer('views').defaultTo(0);
    }
    if (!hasShares) {
      table.integer('shares').defaultTo(0);
    }
    if (!hasFeatured) {
      table.boolean('featured').defaultTo(false);
    }
    if (!hasExpiresAt) {
      table.timestamp('expires_at').nullable();
    }
  });
};

exports.down = async function(knex) {
  await knex.schema.table('endorsements', (table) => {
    table.dropColumn('views');
    table.dropColumn('shares');
    table.dropColumn('featured');
    table.dropColumn('expires_at');
  });
};