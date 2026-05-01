exports.up = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.string("phone_number", 20).nullable().after("personal_email");
    table.string("constituency", 100).nullable().after("county");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    table.dropColumn("phone_number");
    table.dropColumn("constituency");
  });
};
