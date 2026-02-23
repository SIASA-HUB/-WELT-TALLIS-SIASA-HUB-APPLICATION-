exports.up = async function (knex) {
  // Create polls table
  if (!(await knex.schema.hasTable("polls"))) {
    await knex.schema.createTable("polls", (table) => {
      table.string("poll_id", 50).primary();
      table.string("question", 500).notNullable();
      table.string("category", 100).defaultTo("General");
      table.string("image_url", 500);
      table.string("image_public_id", 255);
      table.enu("status", ["active", "closed", "deleted"]).defaultTo("active");
      table.timestamp("start_date").defaultTo(knex.fn.now());
      table.timestamp("end_date").nullable();
      table.integer("total_votes").defaultTo(0);
      table.integer("shares_count").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("category");
      table.index("status");
      table.index("created_at");
    });
  }

  // Create poll options table
  if (!(await knex.schema.hasTable("poll_options"))) {
    await knex.schema.createTable("poll_options", (table) => {
      table.string("option_id", 50).primary();
      table
        .string("poll_id", 50)
        .notNullable()
        .references("poll_id")
        .inTable("polls")
        .onDelete("CASCADE");
      table.string("option_label", 255).notNullable();
      table.string("party", 100);
      table.string("rating", 50);
      table.string("issue", 100);
      table.integer("sort_order").defaultTo(0);
      table.integer("vote_count").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("poll_id");
    });
  }

  // Create votes table for tracking (optional)
  if (!(await knex.schema.hasTable("poll_votes"))) {
    await knex.schema.createTable("poll_votes", (table) => {
      table.increments("id").primary();
      table
        .string("poll_id", 50)
        .notNullable()
        .references("poll_id")
        .inTable("polls")
        .onDelete("CASCADE");
      table
        .string("option_id", 50)
        .references("option_id")
        .inTable("poll_options")
        .onDelete("CASCADE");
      table.string("user_id", 50);
      table.string("ip_address", 45);
      table.string("session_id", 100);
      table.timestamp("voted_at").defaultTo(knex.fn.now());

      table.index("poll_id");
      table.index("user_id");
      table.index("ip_address");
      table.unique(["poll_id", "user_id", "ip_address"], "unique_vote");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("poll_votes");
  await knex.schema.dropTableIfExists("poll_options");
  await knex.schema.dropTableIfExists("polls");
};
