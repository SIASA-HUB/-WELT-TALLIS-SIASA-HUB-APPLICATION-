exports.up = async function(knex) {
  const hasBoostCount = await knex.schema.hasColumn('endorsements', 'boost_count');
  const hasTotalBoostAmount = await knex.schema.hasColumn('endorsements', 'total_boost_amount');

  await knex.schema.table('endorsements', (table) => {
    if (!hasBoostCount) {
      table.integer('boost_count').defaultTo(0);
    }
    if (!hasTotalBoostAmount) {
      table.decimal('total_boost_amount', 10, 2).defaultTo(0);
    }
  });
};

exports.down = async function(knex) {
  await knex.schema.table('endorsements', (table) => {
    table.dropColumn('boost_count');
    table.dropColumn('total_boost_amount');
  });
};