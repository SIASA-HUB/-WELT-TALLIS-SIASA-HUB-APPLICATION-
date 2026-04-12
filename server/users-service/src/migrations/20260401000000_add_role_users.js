exports.up = async function (knex) {
  const hasRoleColumn = await knex.schema.hasColumn("users", "role");

  if (!hasRoleColumn) {
    await knex.schema.table("users", function (table) {
      table
        .enum("role", ["user", "admin", "market_admin", "super_admin", "ceo"])
        .defaultTo("user")
        .notNullable()
        .after("password_hash");

      table.index("role", "idx_users_role");
    });
    console.log(" Added 'role' column to users table");
  } else {
    console.log("'role' column already exists, skipping...");
  }

  // Check if updated_by column exists
  const hasUpdatedByColumn = await knex.schema.hasColumn("users", "updated_by");

  if (!hasUpdatedByColumn) {
    await knex.schema.table("users", function (table) {
      table.string("updated_by", 255).nullable().after("updated_at");
    });
    console.log("Added 'updated_by' column to users table");
  } else {
    console.log("'updated_by' column already exists, skipping...");
  }

  // Add other new columns if they don't exist
  const hasPoliticalLeanings = await knex.schema.hasColumn(
    "users",
    "political_leanings",
  );
  if (!hasPoliticalLeanings) {
    await knex.schema.table("users", function (table) {
      table
        .enum("political_leanings", [
          "Pro-Government",
          "Opposition",
          "Undecided",
          "Prefer not to say",
        ])
        .defaultTo("Prefer not to say")
        .after("employment_status");
    });
    console.log("Added 'political_leanings' column");
  }

  const hasVoteFrequency = await knex.schema.hasColumn(
    "users",
    "vote_frequency",
  );
  if (!hasVoteFrequency) {
    await knex.schema.table("users", function (table) {
      table
        .enum("vote_frequency", [
          "Always",
          "Sometimes",
          "Rarely",
          "Never",
          "First-time voter",
          "Prefer not to say",
        ])
        .defaultTo("Prefer not to say")
        .after("political_leanings");
    });
    console.log("Added 'vote_frequency' column");
  }

  const hasPersonalEmail = await knex.schema.hasColumn(
    "users",
    "personal_email",
  );
  if (!hasPersonalEmail) {
    await knex.schema.table("users", function (table) {
      table
        .string("personal_email", 255)
        .unique()
        .nullable()
        .after("vote_frequency");
      table.index("personal_email", "idx_users_personal_email");
    });
    console.log("Added 'personal_email' column");
  }
};

exports.down = async function (knex) {
  // Only drop columns if they exist
  const hasPoliticalLeanings = await knex.schema.hasColumn(
    "users",
    "political_leanings",
  );
  if (hasPoliticalLeanings) {
    await knex.schema.table("users", function (table) {
      table.dropColumn("political_leanings");
    });
  }

  const hasVoteFrequency = await knex.schema.hasColumn(
    "users",
    "vote_frequency",
  );
  if (hasVoteFrequency) {
    await knex.schema.table("users", function (table) {
      table.dropColumn("vote_frequency");
    });
  }

  const hasPersonalEmail = await knex.schema.hasColumn(
    "users",
    "personal_email",
  );
  if (hasPersonalEmail) {
    await knex.schema.table("users", function (table) {
      table.dropIndex("personal_email", "idx_users_personal_email");
      table.dropColumn("personal_email");
    });
  }

  const hasUpdatedBy = await knex.schema.hasColumn("users", "updated_by");
  if (hasUpdatedBy) {
    await knex.schema.table("users", function (table) {
      table.dropColumn("updated_by");
    });
  }

  console.log(" 'role' column preserved (not dropped) to avoid data loss");
};
