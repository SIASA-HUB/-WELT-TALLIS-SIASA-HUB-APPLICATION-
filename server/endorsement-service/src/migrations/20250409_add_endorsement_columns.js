// migrations/20250409_add_endorsement_columns.js - Fixed with existence checks

exports.up = async function (knex) {
  // Check if columns exist before adding
  const hasColumn = async (columnName) => {
    const exists = await knex.schema.hasColumn("endorsements", columnName);
    return exists;
  };

  // Add thumbnail_url column
  if (!(await hasColumn("thumbnail_url"))) {
    await knex.schema.table("endorsements", function (table) {
      table.string("thumbnail_url", 500).nullable().after("image_url");
    });
    console.log("✅ Added thumbnail_url column");
  }

  // Add media_type column
  if (!(await hasColumn("media_type"))) {
    await knex.schema.table("endorsements", function (table) {
      table.string("media_type", 20).defaultTo("text").after("thumbnail_url");
    });
    console.log("✅ Added media_type column");
  }

  // Add post_type column
  if (!(await hasColumn("post_type"))) {
    await knex.schema.table("endorsements", function (table) {
      table.string("post_type", 20).defaultTo("text").after("media_type");
    });
    console.log("✅ Added post_type column");
  }

  // Add boost_count column
  if (!(await hasColumn("boost_count"))) {
    await knex.schema.table("endorsements", function (table) {
      table.integer("boost_count").defaultTo(0).after("comments");
    });
    console.log("✅ Added boost_count column");
  }

  // Add total_boost_amount column
  if (!(await hasColumn("total_boost_amount"))) {
    await knex.schema.table("endorsements", function (table) {
      table
        .decimal("total_boost_amount", 10, 2)
        .defaultTo(0)
        .after("boost_count");
    });
    console.log("✅ Added total_boost_amount column");
  }

  // status column already exists, skip adding
  console.log("ℹ️ status column already exists, skipping");

  // Add indexes (check if they exist first)
  const hasIndex = async (indexName) => {
    const result = await knex.raw(
      `SELECT COUNT(*) as count FROM information_schema.statistics 
       WHERE table_schema = DATABASE() AND table_name = 'endorsements' AND index_name = ?`,
      [indexName],
    );
    return result[0].count > 0;
  };

  if (!(await hasIndex("idx_media_type"))) {
    await knex.schema.table("endorsements", function (table) {
      table.index("media_type", "idx_media_type");
    });
    console.log("✅ Added idx_media_type index");
  }

  if (!(await hasIndex("idx_post_type"))) {
    await knex.schema.table("endorsements", function (table) {
      table.index("post_type", "idx_post_type");
    });
    console.log("✅ Added idx_post_type index");
  }

  if (!(await hasIndex("idx_boost_count"))) {
    await knex.schema.table("endorsements", function (table) {
      table.index("boost_count", "idx_boost_count");
    });
    console.log("✅ Added idx_boost_count index");
  }

  console.log("✅ Migration completed successfully");
};

exports.down = async function (knex) {
  // Only drop columns that we added (skip status)
  const hasColumn = async (columnName) => {
    const exists = await knex.schema.hasColumn("endorsements", columnName);
    return exists;
  };

  if (await hasColumn("thumbnail_url")) {
    await knex.schema.table("endorsements", function (table) {
      table.dropColumn("thumbnail_url");
    });
  }

  if (await hasColumn("media_type")) {
    await knex.schema.table("endorsements", function (table) {
      table.dropColumn("media_type");
    });
  }

  if (await hasColumn("post_type")) {
    await knex.schema.table("endorsements", function (table) {
      table.dropColumn("post_type");
    });
  }

  if (await hasColumn("boost_count")) {
    await knex.schema.table("endorsements", function (table) {
      table.dropColumn("boost_count");
    });
  }

  if (await hasColumn("total_boost_amount")) {
    await knex.schema.table("endorsements", function (table) {
      table.dropColumn("total_boost_amount");
    });
  }

  // Drop indexes
  await knex.schema.table("endorsements", function (table) {
    table.dropIndex("media_type", "idx_media_type");
    table.dropIndex("post_type", "idx_post_type");
    table.dropIndex("boost_count", "idx_boost_count");
  });

  console.log("✅ Rollback completed");
};
