// migrations/20260103120000_add_boost_columns_to_leaders.js

const Logger = require("../utils/logger/logger");

exports.up = async function (knex) {
  try {
    Logger.info("📦 Starting migration: Adding boost columns to leaders table");

    // Check if boost_count column exists
    const hasBoostCount = await knex.schema.hasColumn("leaders", "boost_count");
    if (!hasBoostCount) {
      await knex.schema.table("leaders", (table) => {
        table.integer("boost_count").defaultTo(0);
      });
      Logger.info("✅ Added column: boost_count");
    } else {
      Logger.info("⏭️  Column boost_count already exists, skipping");
    }

    // Check if total_boost_amount column exists
    const hasTotalBoostAmount = await knex.schema.hasColumn(
      "leaders",
      "total_boost_amount",
    );
    if (!hasTotalBoostAmount) {
      await knex.schema.table("leaders", (table) => {
        table.decimal("total_boost_amount", 10, 2).defaultTo(0.0);
      });
      Logger.info("✅ Added column: total_boost_amount");
    } else {
      Logger.info("⏭️  Column total_boost_amount already exists, skipping");
    }

    // Check if boost_score column exists
    const hasBoostScore = await knex.schema.hasColumn("leaders", "boost_score");
    if (!hasBoostScore) {
      await knex.schema.table("leaders", (table) => {
        table.integer("boost_score").defaultTo(0);
      });
      Logger.info("✅ Added column: boost_score");
    } else {
      Logger.info("⏭️  Column boost_score already exists, skipping");
    }

    Logger.info("🎉 Migration completed: Boost columns added successfully");
  } catch (error) {
    Logger.error("❌ Migration failed:", error);
    throw error;
  }
};

exports.down = async function (knex) {
  try {
    Logger.info("📦 Rolling back: Removing boost columns from leaders table");

    await knex.schema.table("leaders", (table) => {
      table.dropColumn("boost_count");
      table.dropColumn("total_boost_amount");
      table.dropColumn("boost_score");
    });

    Logger.info("✅ Rollback completed: Boost columns removed");
  } catch (error) {
    Logger.error("❌ Rollback failed:", error);
    throw error;
  }
};
