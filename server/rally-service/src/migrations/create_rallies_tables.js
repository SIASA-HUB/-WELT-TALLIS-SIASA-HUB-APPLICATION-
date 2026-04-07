exports.up = async function (knex) {
  // Create rallies table
  const ralliesExists = await knex.schema.hasTable("rallies");
  if (!ralliesExists) {
    await knex.schema.createTable("rallies", (table) => {
      table.string("rally_id", 50).primary();
      table.string("name", 255).notNullable();
      table.text("description");
      table.date("date").notNullable();
      table.string("time", 10).notNullable();
      table.string("end_time", 10);
      table.string("location", 255).notNullable();
      table.string("venue", 255);
      table.string("county", 100).notNullable();
      table.string("image", 500);
      table.string("image_public_id", 255);
      table.string("party", 50).notNullable();
      table.string("leader", 100).notNullable();
      table
        .enu("status", ["upcoming", "ongoing", "completed", "cancelled"])
        .defaultTo("upcoming");
      table
        .enu("type", ["rally", "townhall", "summit", "meeting"])
        .defaultTo("rally");
      table.integer("attendees_count").defaultTo(0);
      table.integer("likes_count").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("status");
      table.index("county");
      table.index("party");
      table.index("date");
    });
  }

  // Create rally_likes table
  const likesExists = await knex.schema.hasTable("rally_likes");
  if (!likesExists) {
    await knex.schema.createTable("rally_likes", (table) => {
      table.string("like_id", 50).primary();
      table
        .string("rally_id", 50)
        .notNullable()
        .references("rally_id")
        .inTable("rallies")
        .onDelete("CASCADE");
      table.string("user_id", 50).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("rally_id");
      table.index("user_id");
      table.unique(["rally_id", "user_id"]);
    });
  }

  // Create rally_attendees table
  const attendeesExists = await knex.schema.hasTable("rally_attendees");
  if (!attendeesExists) {
    await knex.schema.createTable("rally_attendees", (table) => {
      table.string("attend_id", 50).primary();
      table
        .string("rally_id", 50)
        .notNullable()
        .references("rally_id")
        .inTable("rallies")
        .onDelete("CASCADE");
      table.string("user_id", 50).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("rally_id");
      table.index("user_id");
      table.unique(["rally_id", "user_id"]);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("rally_attendees");
  await knex.schema.dropTableIfExists("rally_likes");
  await knex.schema.dropTableIfExists("rallies");
};
