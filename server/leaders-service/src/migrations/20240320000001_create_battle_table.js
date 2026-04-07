exports.up = async function (knex) {
  // 1. Create battles table (UPDATED with new columns)
  const battlesExists = await knex.schema.hasTable("battles");
  if (!battlesExists) {
    await knex.schema.createTable("battles", (table) => {
      table.string("battle_id", 100).primary();
      table.string("challenger1_id", 50).notNullable();
      table.string("challenger2_id", 50).notNullable();
      table.json("challenger1_data").notNullable();
      table.json("challenger2_data").notNullable();
      table.integer("votes_left").defaultTo(0);
      table.integer("votes_right").defaultTo(0);
      table.integer("views").defaultTo(0);
      table.integer("gift_total").defaultTo(0);
      table.enu("status", ["active", "ended", "cancelled"]).defaultTo("active");
      table.string("created_by", 100).defaultTo("system");
      table.string("host_id", 100);
      table.string("host_name", 100);
      table.string("title", 255);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("expires_at");
      table.timestamp("ended_at");

      table.index("status");
      table.index("created_at");
      table.index("expires_at");
      table.index("host_id");
      table.index(["challenger1_id", "challenger2_id"]);
    });
    console.log("✅ Created battles table");
  }

  // 2. Create battle_hosts table
  const hostsExists = await knex.schema.hasTable("battle_hosts");
  if (!hostsExists) {
    await knex.schema.createTable("battle_hosts", (table) => {
      table.increments("id").primary();
      table.string("host_id", 100).notNullable().unique();
      table.string("host_name", 100).notNullable();
      table.integer("total_battles").defaultTo(0);
      table.decimal("total_earnings", 10, 2).defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("host_id");
      table.index("total_battles");
      table.index("total_earnings");
    });
    console.log("✅ Created battle_hosts table");
  }

  // 3. Create battle_gifts table
  const giftsExists = await knex.schema.hasTable("battle_gifts");
  if (!giftsExists) {
    await knex.schema.createTable("battle_gifts", (table) => {
      table.string("gift_id", 100).primary();
      table.string("battle_id", 100).notNullable();
      table.integer("gift_value").notNullable();
      table.string("device_id", 100);
      table.string("user_name", 100);
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("battle_id");
      table.index("device_id");
      table.index("created_at");

      table
        .foreign("battle_id")
        .references("battle_id")
        .inTable("battles")
        .onDelete("CASCADE");
    });
    console.log("✅ Created battle_gifts table");
  }

  // 4. Create battle_votes table
  const votesExists = await knex.schema.hasTable("battle_votes");
  if (!votesExists) {
    await knex.schema.createTable("battle_votes", (table) => {
      table.increments("vote_id").primary();
      table.string("battle_id", 100).notNullable();
      table.string("candidate_id", 50).notNullable();
      table.string("device_id", 100).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.unique(["battle_id", "device_id"]);
      table.index("battle_id");
      table.index("candidate_id");
      table.index("device_id");
      table.index("created_at");

      table
        .foreign("battle_id")
        .references("battle_id")
        .inTable("battles")
        .onDelete("CASCADE");
    });
    console.log("✅ Created battle_votes table");
  }

  // 5. Create battle_reactions table
  const reactionsExists = await knex.schema.hasTable("battle_reactions");
  if (!reactionsExists) {
    await knex.schema.createTable("battle_reactions", (table) => {
      table.increments("reaction_id").primary();
      table.string("battle_id", 100).notNullable();
      table.string("reaction", 10).notNullable();
      table.string("device_id", 100).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("battle_id");
      table.index("reaction");
      table.index("device_id");
      table.index("created_at");

      table
        .foreign("battle_id")
        .references("battle_id")
        .inTable("battles")
        .onDelete("CASCADE");
    });
    console.log("✅ Created battle_reactions table");
  }

  // 6. Create battle_comments table
  const commentsExists = await knex.schema.hasTable("battle_comments");
  if (!commentsExists) {
    await knex.schema.createTable("battle_comments", (table) => {
      table.string("comment_id", 100).primary();
      table.string("battle_id", 100).notNullable();
      table.string("user_name", 100);
      table.text("comment").notNullable();
      table.string("device_id", 100).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("battle_id");
      table.index("device_id");
      table.index("created_at");

      table
        .foreign("battle_id")
        .references("battle_id")
        .inTable("battles")
        .onDelete("CASCADE");
    });
    console.log("✅ Created battle_comments table");
  }

  // 7. Create battle_views table
  const viewsExists = await knex.schema.hasTable("battle_views");
  if (!viewsExists) {
    await knex.schema.createTable("battle_views", (table) => {
      table.increments("view_id").primary();
      table.string("battle_id", 100).notNullable();
      table.string("device_id", 100);
      table.timestamp("viewed_at").defaultTo(knex.fn.now());

      table.index("battle_id");
      table.index("device_id");

      table
        .foreign("battle_id")
        .references("battle_id")
        .inTable("battles")
        .onDelete("CASCADE");
    });
    console.log("✅ Created battle_views table");
  }

  // 8. Create battle_leaderboard table
  const leaderboardExists = await knex.schema.hasTable("battle_leaderboard");
  if (!leaderboardExists) {
    await knex.schema.createTable("battle_leaderboard", (table) => {
      table.integer("rank").primary();
      table.string("leader_id", 50).notNullable();
      table.string("name", 255).notNullable();
      table.string("party", 100);
      table.string("image_url", 255);
      table.integer("total_votes").defaultTo(0);
      table.integer("battles_participated").defaultTo(0);
      table.integer("battles_won").defaultTo(0);
      table.integer("gifts_received").defaultTo(0);
      table.decimal("gift_value_total", 10, 2).defaultTo(0);
      table.timestamp("updated_at").defaultTo(knex.fn.now());

      table.index("total_votes");
      table.index("battles_won");
      table.index("gift_value_total");
    });
    console.log("✅ Created battle_leaderboard table");
  }

  // 9. Create battle_stats table
  const statsExists = await knex.schema.hasTable("battle_stats");
  if (!statsExists) {
    await knex.schema.createTable("battle_stats", (table) => {
      table.string("stat_key", 50).primary();
      table.json("stat_value").notNullable();
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
    console.log("✅ Created battle_stats table");
  }

  // 10. Create trigger to update battle vote counts (FIXED)
  try {
    await knex.raw(`DROP TRIGGER IF EXISTS update_battle_vote_counts`);
    await knex.raw(`
      CREATE TRIGGER update_battle_vote_counts
      AFTER INSERT ON battle_votes
      FOR EACH ROW
      BEGIN
        DECLARE left_votes INT DEFAULT 0;
        DECLARE right_votes INT DEFAULT 0;
        
        SELECT 
          COUNT(CASE WHEN candidate_id = challenger1_id THEN 1 END),
          COUNT(CASE WHEN candidate_id = challenger2_id THEN 1 END)
        INTO left_votes, right_votes
        FROM battle_votes bv
        CROSS JOIN battles b ON b.battle_id = bv.battle_id
        WHERE bv.battle_id = NEW.battle_id;
        
        UPDATE battles 
        SET votes_left = left_votes, votes_right = right_votes
        WHERE battle_id = NEW.battle_id;
      END;
    `);
    console.log("✅ Created update_battle_vote_counts trigger");
  } catch (error) {
    console.log("Trigger creation failed:", error.message);
  }

  // 11. Create trigger to update battle gift totals (FIXED)
  try {
    await knex.raw(`DROP TRIGGER IF EXISTS update_battle_gift_totals`);
    await knex.raw(`
      CREATE TRIGGER update_battle_gift_totals
      AFTER INSERT ON battle_gifts
      FOR EACH ROW
      BEGIN
        UPDATE battles 
        SET gift_total = gift_total + NEW.gift_value
        WHERE battle_id = NEW.battle_id;
      END;
    `);
    console.log("✅ Created update_battle_gift_totals trigger");
  } catch (error) {
    console.log("Trigger creation failed:", error.message);
  }

  // 12. Create trigger to update battle views
  try {
    await knex.raw(`DROP TRIGGER IF EXISTS update_battle_views`);
    await knex.raw(`
      CREATE TRIGGER update_battle_views
      AFTER INSERT ON battle_views
      FOR EACH ROW
      BEGIN
        UPDATE battles 
        SET views = views + 1
        WHERE battle_id = NEW.battle_id;
      END;
    `);
    console.log("✅ Created update_battle_views trigger");
  } catch (error) {
    console.log("Trigger creation failed:", error.message);
  }

  // 13. Create trigger to update battle_hosts when battle ends (FIXED)
  try {
    await knex.raw(`DROP TRIGGER IF EXISTS update_host_on_battle_end`);
    await knex.raw(`
      CREATE TRIGGER update_host_on_battle_end
      AFTER UPDATE ON battles
      FOR EACH ROW
      BEGIN
        IF NEW.status = 'ended' AND OLD.status != 'ended' AND NEW.host_id IS NOT NULL THEN
          INSERT INTO battle_hosts (host_id, host_name, total_battles, total_earnings, updated_at)
          VALUES (NEW.host_id, NEW.host_name, 1, NEW.gift_total * 0.1, NOW())
          ON DUPLICATE KEY UPDATE
            total_battles = total_battles + 1,
            total_earnings = total_earnings + (NEW.gift_total * 0.1),
            updated_at = NOW();
        END IF;
      END;
    `);
    console.log("✅ Created update_host_on_battle_end trigger");
  } catch (error) {
    console.log("Trigger creation failed:", error.message);
  }

  // 14. Insert initial battle stats
  try {
    await knex("battle_stats")
      .insert({
        stat_key: "global",
        stat_value: JSON.stringify({
          total_battles: 0,
          active_battles: 0,
          ended_battles: 0,
          total_views: 0,
          total_votes: 0,
          total_comments: 0,
          total_gifts: 0,
          total_gift_value: 0,
        }),
        updated_at: knex.fn.now(),
      })
      .onConflict("stat_key")
      .ignore();
    console.log("✅ Inserted initial battle stats");
  } catch (error) {
    console.log("Initial stats insertion failed:", error.message);
  }
};

exports.down = async function (knex) {
  // Drop triggers
  try {
    await knex.raw("DROP TRIGGER IF EXISTS update_battle_vote_counts");
    await knex.raw("DROP TRIGGER IF EXISTS update_battle_gift_totals");
    await knex.raw("DROP TRIGGER IF EXISTS update_battle_views");
    await knex.raw("DROP TRIGGER IF EXISTS update_host_on_battle_end");
    console.log("✅ Dropped triggers");
  } catch (error) {
    console.log("Error dropping triggers:", error.message);
  }

  // Drop tables in reverse order
  await knex.schema.dropTableIfExists("battle_stats");
  await knex.schema.dropTableIfExists("battle_leaderboard");
  await knex.schema.dropTableIfExists("battle_views");
  await knex.schema.dropTableIfExists("battle_comments");
  await knex.schema.dropTableIfExists("battle_reactions");
  await knex.schema.dropTableIfExists("battle_gifts");
  await knex.schema.dropTableIfExists("battle_hosts");
  await knex.schema.dropTableIfExists("battle_votes");
  await knex.schema.dropTableIfExists("battles");
  console.log("✅ Dropped all battle tables");
};
