// migration file: add_leader_auth_columns_simple.js
exports.up = async function (knex) {
  try {
    // Add email column
    await knex.raw(`
      ALTER TABLE leaders 
      ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE NULL
    `);
    console.log("✅ Added email column");

    // Add index for email
    await knex.raw(`
      ALTER TABLE leaders 
      ADD INDEX IF NOT EXISTS idx_leaders_email (email)
    `);
    console.log("✅ Added email index");

    // Add phone column
    await knex.raw(`
      ALTER TABLE leaders 
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50) UNIQUE NULL
    `);
    console.log("✅ Added phone column");

    // Add index for phone
    await knex.raw(`
      ALTER TABLE leaders 
      ADD INDEX IF NOT EXISTS idx_leaders_phone (phone)
    `);
    console.log("✅ Added phone index");

    // Add password_hash column
    await knex.raw(`
      ALTER TABLE leaders 
      ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) NULL
    `);
    console.log("✅ Added password_hash column");

    // Add bio column
    await knex.raw(`
      ALTER TABLE leaders 
      ADD COLUMN IF NOT EXISTS bio TEXT NULL
    `);
    console.log("✅ Added bio column");

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("Migration error:", error.message);
    throw error;
  }
};

exports.down = async function (knex) {
  try {
    // Drop indexes
    await knex.raw(`DROP INDEX IF EXISTS idx_leaders_email ON leaders`);
    await knex.raw(`DROP INDEX IF EXISTS idx_leaders_phone ON leaders`);
    console.log("✅ Dropped indexes");

    // Drop columns
    await knex.raw(`ALTER TABLE leaders DROP COLUMN IF EXISTS email`);
    await knex.raw(`ALTER TABLE leaders DROP COLUMN IF EXISTS phone`);
    await knex.raw(`ALTER TABLE leaders DROP COLUMN IF EXISTS password_hash`);
    await knex.raw(`ALTER TABLE leaders DROP COLUMN IF EXISTS bio`);
    console.log("✅ Dropped columns");
  } catch (error) {
    console.error("Rollback error:", error.message);
  }
};
