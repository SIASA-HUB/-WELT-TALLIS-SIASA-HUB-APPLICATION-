// migrations/20250407_add_new_user_fields.js

exports.up = function (knex) {
  return knex.schema.table("users", function (table) {
    // Add political leanings column
    table
      .enum("political_leanings", [
        "Pro-Government",
        "Opposition",
        "Undecided",
        "Prefer not to say",
      ])
      .defaultTo("Prefer not to say");

    // Add vote frequency column
    table
      .enum("vote_frequency", [
        "Always",
        "Sometimes",
        "Rarely",
        "Never",
        "First-time voter",
        "Prefer not to say",
      ])
      .defaultTo("Prefer not to say");

    // Add personal email column
    table.string("personal_email", 255).unique().nullable();

    // Add index for faster email lookups
    table.index("personal_email", "idx_users_personal_email");
  });
};

exports.down = function (knex) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("political_leanings");
    table.dropColumn("vote_frequency");
    table.dropColumn("personal_email");
  });
};
