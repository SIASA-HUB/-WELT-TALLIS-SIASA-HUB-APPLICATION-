exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("leader_images");

  if (!exists) {
    await knex.schema.createTable("leader_images", (table) => {
      table.increments("id").primary();
      table.string("image_id", 50).notNullable().unique();
      table
        .string("leader_id", 50)
        .notNullable()
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");

      table.text("image_url").notNullable();
      table.text("thumbnail_url");
      table.text("medium_url");
      table.text("social_url");
      table.string("public_id", 255);
      table.boolean("is_primary").defaultTo(false);
      table.integer("sort_order").defaultTo(0);
      table.integer("width");
      table.integer("height");
      table.string("format", 20);
      table.integer("bytes");
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("leader_id");
      table.index("is_primary");
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leader_images");
};
