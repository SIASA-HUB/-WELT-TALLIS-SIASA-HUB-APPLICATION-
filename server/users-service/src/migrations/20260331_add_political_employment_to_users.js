// migrations/20260331_add_political_employment_to_users.js

exports.up = async function (knex) {
  // Check if political_party column exists
  const hasPoliticalParty = await knex.schema.hasColumn(
    "users",
    "political_party",
  );
  if (!hasPoliticalParty) {
    await knex.schema.table("users", (table) => {
      table
        .string("political_party", 50)
        .defaultTo("Undecided")
        .comment("Political party affiliation");
      table.index("political_party");
    });
  }

  // Check if employment_status column exists
  const hasEmploymentStatus = await knex.schema.hasColumn(
    "users",
    "employment_status",
  );
  if (!hasEmploymentStatus) {
    await knex.schema.table("users", (table) => {
      table
        .string("employment_status", 50)
        .defaultTo("Prefer not to say")
        .comment("Employment status");
      table.index("employment_status");
    });
  }

  // Add composite index for demographics if not exists
  const hasDemographicsIndex = await knex.raw(`
    SELECT COUNT(*) as count 
    FROM information_schema.statistics 
    WHERE table_name = 'users' 
    AND index_name = 'idx_demographics'
  `);

  try {
    if (hasDemographicsIndex[0].count === 0) {
      await knex.raw(`
        CREATE INDEX idx_demographics ON users(county, age_bracket, political_party)
      `);
      console.log("Created composite index idx_demographics");
    }
  } catch (err) {
    console.log("Note: Could not create idx_demographics:", err.message);
  }
};

exports.down = async function (knex) {
  // Remove indexes first
  await knex.raw(`DROP INDEX IF EXISTS idx_political_party ON users`);
  await knex.raw(`DROP INDEX IF EXISTS idx_employment_status ON users`);
  await knex.raw(`DROP INDEX IF EXISTS idx_demographics ON users`);

  // Remove columns
  const hasPoliticalParty = await knex.schema.hasColumn(
    "users",
    "political_party",
  );
  if (hasPoliticalParty) {
    await knex.schema.table("users", (table) => {
      table.dropColumn("political_party");
    });
  }

  const hasEmploymentStatus = await knex.schema.hasColumn(
    "users",
    "employment_status",
  );
  if (hasEmploymentStatus) {
    await knex.schema.table("users", (table) => {
      table.dropColumn("employment_status");
    });
  }
};
