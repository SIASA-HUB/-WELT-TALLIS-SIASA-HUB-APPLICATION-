exports.up = async function (knex) {
  // Portfolio table
  if (!(await knex.schema.hasTable("leader_portfolio"))) {
    await knex.schema.createTable("leader_portfolio", (table) => {
      table.increments("id").primary();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("type", 50).notNullable();
      table.text("url").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("leader_id");
      table.index("type");
    });
  }

  // Likes table
  if (!(await knex.schema.hasTable("leader_likes"))) {
    await knex.schema.createTable("leader_likes", (table) => {
      table.increments("id").primary();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("user_id", 50);
      table.string("ip_address", 45);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("leader_id");
      table.unique(["leader_id", "user_id", "ip_address"], "unique_like");
    });
  }

  // Dislikes table
  if (!(await knex.schema.hasTable("leader_dislikes"))) {
    await knex.schema.createTable("leader_dislikes", (table) => {
      table.increments("id").primary();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("user_id", 50);
      table.string("ip_address", 45);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("leader_id");
      table.unique(["leader_id", "user_id", "ip_address"], "unique_dislike");
    });
  }

  // Views table
  if (!(await knex.schema.hasTable("leader_views"))) {
    await knex.schema.createTable("leader_views", (table) => {
      table.increments("id").primary();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("user_id", 50);
      table.string("ip_address", 45);
      table.string("session_id", 100);
      table.timestamp("viewed_at").defaultTo(knex.fn.now());
      table.index("leader_id");
      table.index("viewed_at");
    });
  }

  // Followers table
  if (!(await knex.schema.hasTable("leader_followers"))) {
    await knex.schema.createTable("leader_followers", (table) => {
      table.increments("id").primary();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("user_id", 50).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.index("leader_id");
      table.index("user_id");
      table.unique(["leader_id", "user_id"], "unique_follower");
    });
  }

  // Comments table
  if (!(await knex.schema.hasTable("leader_comments"))) {
    await knex.schema.createTable("leader_comments", (table) => {
      table.increments("id").primary();
      table.string("comment_id", 50).notNullable().unique();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
      table.string("user_id", 50);
      table.string("user_name", 100);
      table.text("comment").notNullable();
      table.integer("likes").defaultTo(0);
      table.integer("dislikes").defaultTo(0);
      table.string("status", 20).defaultTo("approved");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.index("leader_id");
      table.index("status");
      table.index("created_at");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leader_comments");
  await knex.schema.dropTableIfExists("leader_followers");
  await knex.schema.dropTableIfExists("leader_views");
  await knex.schema.dropTableIfExists("leader_dislikes");
  await knex.schema.dropTableIfExists("leader_likes");
  await knex.schema.dropTableIfExists("leader_portfolio");
};
