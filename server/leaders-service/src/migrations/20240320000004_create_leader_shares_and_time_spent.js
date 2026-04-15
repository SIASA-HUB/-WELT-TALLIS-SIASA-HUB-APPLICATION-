exports.up = async function (knex) {
  // Shares table
  if (!(await knex.schema.hasTable("leader_shares"))) {
    await knex.schema.createTable("leader_shares", (table) => {
      table.increments("id").primary();
      table.string("leader_id", 50).notNullable();
      table.string("user_id", 50);
      table.string("ip_address", 45);
      table.string("platform", 50);
      table.string("session_id", 100);
      table.timestamp("shared_at").defaultTo(knex.fn.now());
      
      table.index("leader_id");
      table.index("platform");
      table.index("shared_at");
    });
  }

  // Time spent table
  if (!(await knex.schema.hasTable("leader_time_spent"))) {
    await knex.schema.createTable("leader_time_spent", (table) => {
      table.increments("id").primary();
      table.string("leader_id", 50).notNullable();
      table.string("user_id", 50);
      table.string("ip_address", 45);
      table.string("session_id", 100);
      table.integer("time_spent_seconds").defaultTo(0);
      table.timestamp("recorded_at").defaultTo(knex.fn.now());
      
      table.index("leader_id");
      table.index("recorded_at");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leader_time_spent");
  await knex.schema.dropTableIfExists("leader_shares");
};
