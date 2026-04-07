// src/migrations/20260324_add_real_name_to_users.js

exports.up = async function (knex) {
  // Start transaction
  await knex.transaction(async (trx) => {
    // 1. Check if real_name column exists
    const hasRealName = await trx.schema.hasColumn("users", "real_name");

    if (!hasRealName) {
      // Add real_name column
      await trx.schema.alterTable("users", (table) => {
        table.string("real_name", 100).nullable();
      });

      // Populate existing users with their anonymous_username
      await trx("users")
        .whereNull("real_name")
        .update({ real_name: trx.raw("anonymous_username") });

      // Make real_name NOT NULL after populating
      await trx.schema.alterTable("users", (table) => {
        table.string("real_name", 100).notNullable().alter();
      });
    }

    // 2. Check if indexes exist using raw SQL query
    const [realNameIndex] = await trx.raw(`
      SELECT 1 FROM information_schema.statistics 
      WHERE table_schema = DATABASE() 
      AND table_name = 'users' 
      AND index_name = 'idx_users_real_name'
      LIMIT 1
    `);

    if (!realNameIndex) {
      // Add index for real_name
      await trx.schema.alterTable("users", (table) => {
        table.index("real_name", "idx_users_real_name");
      });
    }

    // 3. Check if username index exists
    const [usernameIndex] = await trx.raw(`
      SELECT 1 FROM information_schema.statistics 
      WHERE table_schema = DATABASE() 
      AND table_name = 'users' 
      AND index_name = 'idx_users_username'
      LIMIT 1
    `);

    if (!usernameIndex) {
      // Add index for anonymous_username
      await trx.schema.alterTable("users", (table) => {
        table.index("anonymous_username", "idx_users_username");
      });
    }

    // 4. Add check constraints (optional - may fail in some MySQL versions)
    try {
      // Check if constraint exists
      const [usernameConstraint] = await trx.raw(`
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
        WHERE constraint_schema = DATABASE() 
        AND table_name = 'users' 
        AND constraint_name = 'chk_username_format'
        LIMIT 1
      `);

      if (!usernameConstraint) {
        await trx.raw(`
          ALTER TABLE users 
          ADD CONSTRAINT chk_username_format 
          CHECK (LENGTH(anonymous_username) >= 3 AND LENGTH(anonymous_username) <= 30)
        `);
      }

      const [realNameConstraint] = await trx.raw(`
        SELECT 1 FROM information_schema.TABLE_CONSTRAINTS 
        WHERE constraint_schema = DATABASE() 
        AND table_name = 'users' 
        AND constraint_name = 'chk_real_name_format'
        LIMIT 1
      `);

      if (!realNameConstraint) {
        await trx.raw(`
          ALTER TABLE users 
          ADD CONSTRAINT chk_real_name_format 
          CHECK (LENGTH(real_name) >= 3 AND LENGTH(real_name) <= 100)
        `);
      }
    } catch (error) {
      // Some MySQL versions don't support CHECK constraints
      console.log(
        "Note: Check constraints could not be added. Validation will be handled in application layer.",
      );
    }
  });
};

exports.down = async function (knex) {
  await knex.transaction(async (trx) => {
    // Drop constraints
    try {
      await trx.raw(
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_username_format",
      );
      await trx.raw(
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_real_name_format",
      );
    } catch (error) {
      console.log("Note: Could not drop constraints");
    }

    // Drop indexes
    try {
      const [realNameIndex] = await trx.raw(`
        SELECT 1 FROM information_schema.statistics 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND index_name = 'idx_users_real_name'
        LIMIT 1
      `);

      if (realNameIndex) {
        await trx.schema.alterTable("users", (table) => {
          table.dropIndex("real_name", "idx_users_real_name");
        });
      }

      const [usernameIndex] = await trx.raw(`
        SELECT 1 FROM information_schema.statistics 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND index_name = 'idx_users_username'
        LIMIT 1
      `);

      if (usernameIndex) {
        await trx.schema.alterTable("users", (table) => {
          table.dropIndex("anonymous_username", "idx_users_username");
        });
      }
    } catch (error) {
      console.log("Note: Could not drop indexes");
    }

    // Drop real_name column
    const hasRealName = await trx.schema.hasColumn("users", "real_name");
    if (hasRealName) {
      await trx.schema.alterTable("users", (table) => {
        table.dropColumn("real_name");
      });
    }
  });
};
