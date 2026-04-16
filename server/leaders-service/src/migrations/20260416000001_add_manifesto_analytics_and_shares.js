exports.up = async function (knex) {
  if (!(await knex.schema.hasTable('manifesto_analytics'))) {
    await knex.schema.createTable('manifesto_analytics', (table) => {
      table.uuid('manifesto_id').primary();
      table.integer('views_count').notNullable().defaultTo(0);
      table.integer('reads_count').notNullable().defaultTo(0);
      table.integer('shares_count').notNullable().defaultTo(0);
      table.integer('votes_count').notNullable().defaultTo(0);
      table.timestamps(true, true);

      table
        .foreign('manifesto_id')
        .references('manifesto_id')
        .inTable('manifestos')
        .onDelete('CASCADE');
    });
  }

  if (!(await knex.schema.hasTable('manifesto_shares'))) {
    await knex.schema.createTable('manifesto_shares', (table) => {
      table.increments('id').primary();
      table.uuid('manifesto_id').notNullable();
      table.uuid('user_id').nullable();
      table.string('platform').notNullable().defaultTo('generic');
      table.timestamp('created_at').defaultTo(knex.fn.now());

      table
        .foreign('manifesto_id')
        .references('manifesto_id')
        .inTable('manifestos')
        .onDelete('CASCADE');
      table.index(['manifesto_id']);
      table.index(['user_id']);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('manifesto_shares');
  await knex.schema.dropTableIfExists('manifesto_analytics');
};
