exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("leaders");

  if (!exists) {
    await knex.schema.createTable("leaders", (table) => {
      table.string("leader_id", 50).primary();
      table.string("name", 255).notNullable();

      // Authentication fields
      table.string("email", 255).unique().nullable();
      table.string("phone", 50).unique().nullable();
      table.string("password_hash", 255).nullable();

      // Political information
      table.string("party", 100);
      table.string("slogan", 255);
      table.string("motto", 500);
      table.string("position", 100);
      table.string("position_running_for", 100);

      // Location information
      table.string("county", 100);
      table.string("constituency", 100);
      table.string("ward", 100);
      table.string("location", 100);

      // Background information
      table.text("education");
      table.text("experience");
      table.text("bio");
      table.json("tags");

      // Media
      table.string("image_url", 255);

      // Status and verification
      table
        .enu("status", [
          "pending",
          "active",
          "inactive",
          "suspended",
          "deleted",
        ])
        .defaultTo("pending");
      table.boolean("verification").defaultTo(false);

      // Engagement metrics
      table.integer("likes").defaultTo(0);
      table.integer("dislikes").defaultTo(0);
      table.integer("views").defaultTo(0);
      table.integer("comments_count").defaultTo(0);
      table.integer("followers").defaultTo(0);
      table.integer("endorsement_count").defaultTo(0);
      table.integer("shares").defaultTo(0);

      // Timestamps
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      // Indexes for better performance
      table.index("email");
      table.index("phone");
      table.index("party");
      table.index("county");
      table.index("constituency");
      table.index("ward");
      table.index("status");
      table.index("created_at");
      table.index(["county", "constituency", "ward"]);
      table.string("slug", 255).unique().nullable();
      table.index("slug");
    });

    console.log("✅ Created leaders table with all required columns");
  } else {
    // If table exists, add missing columns
    console.log("Leaders table exists, checking for missing columns...");

    // Add email column if missing
    const hasEmail = await knex.schema.hasColumn("leaders", "email");
    if (!hasEmail) {
      await knex.schema.table("leaders", (table) => {
        table.string("email", 255).unique().nullable();
        table.index("email");
      });
      console.log("✅ Added email column");
    }

    // Add phone column if missing
    const hasPhone = await knex.schema.hasColumn("leaders", "phone");
    if (!hasPhone) {
      await knex.schema.table("leaders", (table) => {
        table.string("phone", 50).unique().nullable();
        table.index("phone");
      });
      console.log("✅ Added phone column");
    }

    // Add password_hash column if missing
    const hasPasswordHash = await knex.schema.hasColumn(
      "leaders",
      "password_hash",
    );
    if (!hasPasswordHash) {
      await knex.schema.table("leaders", (table) => {
        table.string("password_hash", 255).nullable();
      });
      console.log("✅ Added password_hash column");
    }

    // Add constituency column if missing
    const hasConstituency = await knex.schema.hasColumn(
      "leaders",
      "constituency",
    );
    if (!hasConstituency) {
      await knex.schema.table("leaders", (table) => {
        table.string("constituency", 100).nullable();
        table.index("constituency");
      });
      console.log("✅ Added constituency column");
    }

    // Add ward column if missing
    const hasWard = await knex.schema.hasColumn("leaders", "ward");
    if (!hasWard) {
      await knex.schema.table("leaders", (table) => {
        table.string("ward", 100).nullable();
        table.index("ward");
      });
      console.log("✅ Added ward column");
    }

    // Add bio column if missing
    const hasBio = await knex.schema.hasColumn("leaders", "bio");
    if (!hasBio) {
      await knex.schema.table("leaders", (table) => {
        table.text("bio").nullable();
      });
      console.log("✅ Added bio column");
    }

    // Add slug column if missing
    const hasSlug = await knex.schema.hasColumn("leaders", "slug");
    if (!hasSlug) {
      await knex.schema.table("leaders", (table) => {
        table.string("slug", 255).unique().nullable();
        table.index("slug");
      });
      console.log("✅ Added slug column");
    }

    // Add endorsement_count and shares if missing
    const hasEndorsementCount = await knex.schema.hasColumn("leaders", "endorsement_count");
    if (!hasEndorsementCount) {
      await knex.schema.table("leaders", (table) => {
        table.integer("endorsement_count").defaultTo(0);
        table.integer("shares").defaultTo(0);
      });
      console.log("✅ Added endorsement_count and shares columns");
    }

    // Update status enum if needed (add 'pending' if not exists)
    await knex
      .raw(
        `
      ALTER TABLE leaders 
      MODIFY COLUMN status ENUM('pending', 'active', 'inactive', 'suspended', 'deleted') 
      DEFAULT 'pending'
    `,
      )
      .catch((err) => console.log("Status enum update skipped:", err.message));
  }
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leaders");
  console.log("✅ Dropped leaders table");
};
