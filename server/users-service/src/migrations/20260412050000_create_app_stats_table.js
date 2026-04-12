// 20260412050000_create_app_stats_table.js
exports.up = async function(knex) {
  const exists = await knex.schema.hasTable('app_stats');
  if (!exists) {
    await knex.schema.createTable('app_stats', (table) => {
      table.increments('id').primary();
      table.string('stat_key', 100).notNullable();
      table.integer('stat_value').defaultTo(0);
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.index('stat_key');
    });
    console.log("Created app_stats table");
  } else {
    console.log("ℹapp_stats table already exists, skipping");
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('app_stats');
  console.log("Dropped app_stats table");
};