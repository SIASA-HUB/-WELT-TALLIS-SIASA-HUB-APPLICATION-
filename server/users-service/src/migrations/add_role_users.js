// src/migrations/20260221_add_role_to_users.js

exports.up = async function (knex) {
  const exists = await knex.schema.hasColumn("users", "role");
  if (!exists) {
    await knex.schema.alterTable("users", (table) => {
      table
        .enu("role", ["user", "admin", "leader"])
        .notNullable()
        .defaultTo("user");
    });
  }
};

exports.down = async function (knex) {
  const exists = await knex.schema.hasColumn("users", "role");
  if (exists) {
    await knex.schema.alterTable("users", (table) => {
      table.dropColumn("role");
    });
  }
};
