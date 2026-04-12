exports.up = async function(knex) {
  const hasTable = await knex.schema.hasTable('endorsement_boosts');
  
  if (!hasTable) {
    await knex.schema.createTable('endorsement_boosts', (table) => {
      table.increments('id').primary();
      table.string('endorsement_id', 36).notNullable();
      table.string('user_id', 50).notNullable();
      table.decimal('amount', 10, 2).defaultTo(0);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index('endorsement_id');
      table.index('user_id');
    });
  }
};

exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('endorsement_boosts');
};