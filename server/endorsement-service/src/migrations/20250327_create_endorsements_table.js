// migrations/20250327_create_endorsements_table.js

exports.up = async function (knex) {
  // 1. Create endorsements table
  const endorsementsExists = await knex.schema.hasTable("endorsements");
  if (!endorsementsExists) {
    await knex.schema.createTable("endorsements", (table) => {
      table.increments("id").primary();
      table.string("leader_id", 50).notNullable();
      table.string("user_id", 50).notNullable();
      table.string("user_name", 100).notNullable();
      table.integer("amount").notNullable();
      table.string("phrase", 50).notNullable();
      table.text("message").notNullable();
      table.string("image_url", 500);
      table.string("level", 20).notNullable();
      table.enu("status", ["active", "deleted"]).defaultTo("active");
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("deleted_at").nullable();

      table.index("leader_id");
      table.index("user_id");
      table.index("status");
      table.index("created_at");
      table.index("level");
      table.index(["leader_id", "status"]);
      table.index(["user_id", "status"]);
      table.index(["leader_id", "user_id", "status"]);

      table
        .foreign("leader_id")
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
    });
  }

  // 2. Create leader_settings table
  const leaderSettingsExists = await knex.schema.hasTable("leader_settings");
  if (!leaderSettingsExists) {
    await knex.schema.createTable("leader_settings", (table) => {
      table.increments("id").primary();
      table.string("leader_id", 50).notNullable().unique();
      table.integer("max_endorsements_per_user").defaultTo(3);
      table.boolean("allow_endorsements").defaultTo(true);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("leader_id");
      table
        .foreign("leader_id")
        .references("leader_id")
        .inTable("leaders")
        .onDelete("CASCADE");
    });
  }

  // 3. Create platform_stats table
  const platformStatsExists = await knex.schema.hasTable("platform_stats");
  if (!platformStatsExists) {
    await knex.schema.createTable("platform_stats", (table) => {
      table.increments("id").primary();
      table.decimal("total_revenue", 10, 2).defaultTo(0);
      table.integer("total_endorsements").defaultTo(0);
      table.integer("total_users").defaultTo(0);
      table.integer("total_leaders").defaultTo(0);
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    await knex("platform_stats").insert({
      id: 1,
      total_revenue: 0,
      total_endorsements: 0,
      total_users: 0,
      total_leaders: 0,
    });
  }

  // 4. Add columns to leaders table
  const hasEndorsementCount = await knex.schema.hasColumn(
    "leaders",
    "endorsement_count",
  );
  if (!hasEndorsementCount) {
    await knex.schema.table("leaders", (table) => {
      table.integer("endorsement_count").defaultTo(0);
      table.decimal("total_platform_revenue", 10, 2).defaultTo(0);
    });
  }

  // 5. Create endorsement_analytics table
  const analyticsExists = await knex.schema.hasTable("endorsement_analytics");
  if (!analyticsExists) {
    await knex.schema.createTable("endorsement_analytics", (table) => {
      table.date("date").primary();
      table.integer("total_endorsements").defaultTo(0);
      table.decimal("total_revenue", 10, 2).defaultTo(0);
      table.integer("unique_users").defaultTo(0);
      table.integer("unique_leaders").defaultTo(0);
      table.json("level_breakdown").defaultTo(JSON.stringify({}));
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }

  // 6. Drop existing triggers if they exist (separate statements)
  await knex.raw("DROP TRIGGER IF EXISTS update_platform_stats_on_endorsement");
  await knex.raw("DROP TRIGGER IF EXISTS update_leader_endorsement_count");

  // 7. Create trigger for platform stats
  await knex.raw(`
    CREATE TRIGGER update_platform_stats_on_endorsement
    AFTER INSERT ON endorsements
    FOR EACH ROW
    BEGIN
      UPDATE platform_stats 
      SET 
        total_revenue = total_revenue + NEW.amount,
        total_endorsements = total_endorsements + 1,
        updated_at = NOW()
      WHERE id = 1;
    END
  `);

  // 8. Create trigger for leader endorsement count
  await knex.raw(`
    CREATE TRIGGER update_leader_endorsement_count
    AFTER INSERT ON endorsements
    FOR EACH ROW
    BEGIN
      UPDATE leaders 
      SET 
        endorsement_count = COALESCE(endorsement_count, 0) + 1,
        total_platform_revenue = COALESCE(total_platform_revenue, 0) + NEW.amount
      WHERE leader_id = NEW.leader_id;
    END
  `);

  // 9. Create stored procedure
  await knex.raw(`
    CREATE OR REPLACE PROCEDURE update_endorsement_analytics()
    BEGIN
      INSERT INTO endorsement_analytics (date, total_endorsements, total_revenue, unique_users, unique_leaders, level_breakdown)
      SELECT 
        DATE(e.created_at) as date,
        COUNT(*) as total_endorsements,
        COALESCE(SUM(e.amount), 0) as total_revenue,
        COUNT(DISTINCT e.user_id) as unique_users,
        COUNT(DISTINCT e.leader_id) as unique_leaders,
        JSON_OBJECT(
          'bronze', COUNT(CASE WHEN e.level = 'bronze' THEN 1 END),
          'silver', COUNT(CASE WHEN e.level = 'silver' THEN 1 END),
          'gold', COUNT(CASE WHEN e.level = 'gold' THEN 1 END)
        ) as level_breakdown
      FROM endorsements e
      WHERE DATE(e.created_at) = CURDATE() AND e.status = 'active'
      GROUP BY DATE(e.created_at)
      ON DUPLICATE KEY UPDATE
        total_endorsements = VALUES(total_endorsements),
        total_revenue = VALUES(total_revenue),
        unique_users = VALUES(unique_users),
        unique_leaders = VALUES(unique_leaders),
        level_breakdown = VALUES(level_breakdown);
    END
  `);

  // 10. Insert default leader settings
  await knex.raw(`
    INSERT IGNORE INTO leader_settings (leader_id, max_endorsements_per_user, allow_endorsements)
    SELECT leader_id, 3, true
    FROM leaders
    WHERE status = 'active'
  `);
};

exports.down = async function (knex) {
  // Drop triggers
  try {
    await knex.raw(
      "DROP TRIGGER IF EXISTS update_platform_stats_on_endorsement",
    );
    await knex.raw("DROP TRIGGER IF EXISTS update_leader_endorsement_count");
  } catch (error) {
    console.log("Error dropping triggers:", error.message);
  }

  // Drop stored procedure
  try {
    await knex.raw("DROP PROCEDURE IF EXISTS update_endorsement_analytics");
  } catch (error) {
    console.log("Error dropping procedure:", error.message);
  }

  // Remove columns from leaders table
  const hasEndorsementCount = await knex.schema.hasColumn(
    "leaders",
    "endorsement_count",
  );
  if (hasEndorsementCount) {
    await knex.schema.table("leaders", (table) => {
      table.dropColumn("endorsement_count");
      table.dropColumn("total_platform_revenue");
    });
  }

  // Drop tables
  await knex.schema.dropTableIfExists("endorsement_analytics");
  await knex.schema.dropTableIfExists("platform_stats");
  await knex.schema.dropTableIfExists("leader_settings");
  await knex.schema.dropTableIfExists("endorsements");
};
