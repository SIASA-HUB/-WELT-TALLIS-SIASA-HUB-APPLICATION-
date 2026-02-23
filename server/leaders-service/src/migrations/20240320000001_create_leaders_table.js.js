exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("leaders");

  if (!exists) {
    await knex.schema.createTable("leaders", (table) => {
      table.string("leader_id", 50).primary();
      table.string("name", 255).notNullable();
      table.string("party", 100);
      table.string("slogan", 255);
      table.string("motto", 500);
      table.string("position", 100);
      table.string("position_running_for", 100);
      table.string("county", 100);
      table.string("constituency", 100);
      table.string("ward", 100);
      table.string("location", 100);
      table.text("education");
      table.text("experience");
      table.json("tags");
      table.string("image_url", 255);
      table
        .enu("status", ["active", "inactive", "suspended", "deleted"])
        .defaultTo("active");
      table.boolean("verification").defaultTo(false);
      table.integer("likes_count").defaultTo(0);
      table.integer("dislikes_count").defaultTo(0);
      table.integer("views_count").defaultTo(0);
      table.integer("comments_count").defaultTo(0);
      table.integer("followers_count").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("party");
      table.index("county");
      table.index("status");
      table.index("created_at");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leaders");
};
