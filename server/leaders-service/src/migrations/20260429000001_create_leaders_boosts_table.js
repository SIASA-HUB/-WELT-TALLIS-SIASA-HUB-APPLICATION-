// migrations/20260429000001_create_leaders_boosts_table.js
// FIX: LeaderController queries this table but it was never created,
// causing getLeaderById to throw "Table 'ballot.leaders_boosts' doesn't exist"
// which broke all leader profile pages (no photos, no stories).

exports.up = async function (knex) {
  const exists = await knex.schema.hasTable('leaders_boosts');
  if (!exists) {
    await knex.schema.createTable('leaders_boosts', (table) => {
      table.increments('id').primary();
      table.string('leader_id', 50).notNullable();
      table.string('user_id', 50).notNullable();
      table.decimal('amount', 10, 2).notNullable().defaultTo(0);
      table.string('transaction_id', 100).nullable();
      table.string('status', 20).defaultTo('completed');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table.index('leader_id');
      table.index('user_id');
      table.index('created_at');
    });

    console.log('✅ Created leaders_boosts table');
  } else {
    console.log('⏭️  leaders_boosts table already exists, skipping');
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('leaders_boosts');
};
