exports.up = async function(knex) {
  const hasComments = await knex.schema.hasColumn('endorsements', 'comments');
  const hasIsPinned = await knex.schema.hasColumn('endorsements', 'is_pinned');
  const hasPinnedAt = await knex.schema.hasColumn('endorsements', 'pinned_at');

  await knex.schema.table('endorsements', (table) => {
    if (!hasComments) {
      table.integer('comments').defaultTo(0);
    }
    if (!hasIsPinned) {
      table.boolean('is_pinned').defaultTo(false);
    }
    if (!hasPinnedAt) {
      table.timestamp('pinned_at').nullable();
    }
  });
};

exports.down = async function(knex) {
  await knex.schema.table('endorsements', (table) => {
    table.dropColumn('comments');
    table.dropColumn('is_pinned');
    table.dropColumn('pinned_at');
  });
};