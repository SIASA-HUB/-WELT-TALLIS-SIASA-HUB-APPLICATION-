// migrations/20260221_create_users.js

exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("users");

  if (!exists) {
    await knex.schema.createTable("users", (table) => {
      table.increments("id").primary(); // auto_increment PK
      table.string("user_id", 50).notNullable().unique();
      table.string("anonymous_username", 50).notNullable().unique();
      table.string("password_hash", 255).notNullable();

      table.enu("gender", ["Male", "Female", "Other"]).nullable();
      table.string("age_bracket", 20).nullable();
      table.string("generation", 50).nullable();
      table.string("ward", 100).nullable();

      table.boolean("voter_card").defaultTo(false);
      table.boolean("will_vote").nullable();

      table
        .enu("role", ["user", "admin", "leader"])
        .notNullable()
        .defaultTo("user");

      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").nullable();

      table.boolean("is_verified").defaultTo(false);
      table.string("county", 100).nullable();

      // Optional indexes for faster lookups
      table.index(["county"]);
      table.index(["ward"]);
      table.index(["role"]);
    });
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
