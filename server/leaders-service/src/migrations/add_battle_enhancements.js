// migration file: add_battle_enhancements.js (fixed version)
exports.up = async function (knex) {
  // Check if columns exist and add them if they don't
  const hasTitle = await knex.schema.hasColumn("battles", "title");
  if (!hasTitle) {
    await knex.schema.table("battles", (table) => {
      table.string("title", 255).nullable();
    });
    console.log("✅ Added 'title' column to battles table");
  }

  const hasHostId = await knex.schema.hasColumn("battles", "host_id");
  if (!hasHostId) {
    await knex.schema.table("battles", (table) => {
      table.string("host_id", 100).nullable();
    });
    console.log("✅ Added 'host_id' column to battles table");
  }

  const hasHostName = await knex.schema.hasColumn("battles", "host_name");
  if (!hasHostName) {
    await knex.schema.table("battles", (table) => {
      table.string("host_name", 100).nullable();
    });
    console.log("✅ Added 'host_name' column to battles table");
  }

  const hasGiftTotal = await knex.schema.hasColumn("battles", "gift_total");
  if (!hasGiftTotal) {
    await knex.schema.table("battles", (table) => {
      table.integer("gift_total").defaultTo(0);
    });
    console.log("✅ Added 'gift_total' column to battles table");
  }

  const hasEndedAt = await knex.schema.hasColumn("battles", "ended_at");
  if (!hasEndedAt) {
    await knex.schema.table("battles", (table) => {
      table.timestamp("ended_at").nullable();
    });
    console.log("✅ Added 'ended_at' column to battles table");
  }

  // Create battle_hosts table if it doesn't exist
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

  // Create battle_gifts table if it doesn't exist
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

  // Add indexes for better performance (check if they exist first)
  try {
    // Check if status index exists
    const statusIndexExists = await knex.raw(`
      SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_NAME = 'battles' AND INDEX_NAME = 'battles_status_index'
    `);

    if (!statusIndexExists[0] || statusIndexExists[0].length === 0) {
      await knex.schema.table("battles", (table) => {
        table.index("status", "battles_status_index");
      });
      console.log("✅ Added status index to battles table");
    } else {
      console.log("Status index already exists, skipping");
    }
  } catch (error) {
    console.log("Could not check/add status index:", error.message);
  }

  try {
    // Check if expires_at index exists
    const expiresAtIndexExists = await knex.raw(`
      SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_NAME = 'battles' AND INDEX_NAME = 'battles_expires_at_index'
    `);

    if (!expiresAtIndexExists[0] || expiresAtIndexExists[0].length === 0) {
      await knex.schema.table("battles", (table) => {
        table.index("expires_at", "battles_expires_at_index");
      });
      console.log("✅ Added expires_at index to battles table");
    } else {
      console.log("Expires_at index already exists, skipping");
    }
  } catch (error) {
    console.log("Could not check/add expires_at index:", error.message);
  }

  try {
    // Check if host_id index exists
    const hostIdIndexExists = await knex.raw(`
      SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_NAME = 'battles' AND INDEX_NAME = 'battles_host_id_index'
    `);

    if (!hostIdIndexExists[0] || hostIdIndexExists[0].length === 0) {
      await knex.schema.table("battles", (table) => {
        table.index("host_id", "battles_host_id_index");
      });
      console.log("✅ Added host_id index to battles table");
    } else {
      console.log("Host_id index already exists, skipping");
    }
  } catch (error) {
    console.log("Could not check/add host_id index:", error.message);
  }

  // Create trigger to update battle gift totals (separate DROP and CREATE)
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

  // Create trigger to update host stats when battle ends (separate DROP and CREATE)
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
};

exports.down = async function (knex) {
  // Drop triggers
  try {
    await knex.raw("DROP TRIGGER IF EXISTS update_battle_gift_totals");
    await knex.raw("DROP TRIGGER IF EXISTS update_host_on_battle_end");
    console.log("✅ Dropped triggers");
  } catch (error) {
    console.log("Error dropping triggers:", error.message);
  }

  // Drop tables
  await knex.schema.dropTableIfExists("battle_gifts");
  await knex.schema.dropTableIfExists("battle_hosts");
  console.log("✅ Dropped battle_gifts and battle_hosts tables");

  // Drop columns from battles table
  const hasTitle = await knex.schema.hasColumn("battles", "title");
  if (hasTitle) {
    await knex.schema.table("battles", (table) => {
      table.dropColumn("title");
    });
  }

  const hasHostId = await knex.schema.hasColumn("battles", "host_id");
  if (hasHostId) {
    await knex.schema.table("battles", (table) => {
      table.dropColumn("host_id");
    });
  }

  const hasHostName = await knex.schema.hasColumn("battles", "host_name");
  if (hasHostName) {
    await knex.schema.table("battles", (table) => {
      table.dropColumn("host_name");
    });
  }

  const hasGiftTotal = await knex.schema.hasColumn("battles", "gift_total");
  if (hasGiftTotal) {
    await knex.schema.table("battles", (table) => {
      table.dropColumn("gift_total");
    });
  }

  const hasEndedAt = await knex.schema.hasColumn("battles", "ended_at");
  if (hasEndedAt) {
    await knex.schema.table("battles", (table) => {
      table.dropColumn("ended_at");
    });
  }

  console.log("✅ Dropped columns from battles table");
};
