// migrations/20250328_create_wallet_tables.js
exports.up = async function (knex) {
  // ============================================
  // 1. USER WALLETS TABLE
  // ============================================
  const walletsExists = await knex.schema.hasTable("user_wallets");
  if (!walletsExists) {
    await knex.schema.createTable("user_wallets", (table) => {
      table.increments("id").primary();
      table.string("user_id", 50).notNullable().unique();
      table.decimal("balance", 10, 2).defaultTo(0);
      table.decimal("total_deposited", 10, 2).defaultTo(0);
      table.decimal("total_spent", 10, 2).defaultTo(0);
      table.decimal("total_bonus", 10, 2).defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
      table.index("user_id");
    });
  }

  // ============================================
  // 2. WALLET TRANSACTIONS TABLE
  // ============================================
  const transactionsExists = await knex.schema.hasTable("wallet_transactions");
  if (!transactionsExists) {
    await knex.schema.createTable("wallet_transactions", (table) => {
      table.string("transaction_id", 100).primary();
      table.string("user_id", 50).notNullable();
      table.decimal("amount", 10, 2).notNullable();
      table
        .enu("type", ["deposit", "endorsement", "bonus", "refund"])
        .notNullable();
      table.string("reference_id", 100).nullable();
      table.text("description");
      table
        .enu("status", ["pending", "completed", "failed"])
        .defaultTo("pending");
      table.string("mpesa_receipt", 50).nullable();
      table.string("mpesa_phone", 15).nullable();
      table.string("checkout_request_id", 100).nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("completed_at").nullable();

      table.index("user_id");
      table.index("type");
      table.index("status");
      table.index("mpesa_receipt");
      table.index("checkout_request_id");
    });
  }

  // ============================================
  // 3. RECHARGE PACKAGES TABLE
  // ============================================
  const packagesExists = await knex.schema.hasTable("recharge_packages");
  if (!packagesExists) {
    await knex.schema.createTable("recharge_packages", (table) => {
      table.increments("id").primary();
      table.string("name", 100).notNullable();
      table.decimal("amount", 10, 2).notNullable();
      table.decimal("bonus", 10, 2).defaultTo(0);
      table.text("description");
      table.boolean("is_active").defaultTo(true);
      table.integer("sort_order").defaultTo(0);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });

    // Insert default packages
    await knex("recharge_packages").insert([
      {
        name: "Starter",
        amount: 100,
        bonus: 0,
        description: "100 points",
        sort_order: 1,
      },
      {
        name: "Popular",
        amount: 500,
        bonus: 50,
        description: "500 + 50 bonus points",
        sort_order: 2,
      },
      {
        name: "Premium",
        amount: 1000,
        bonus: 150,
        description: "1000 + 150 bonus points",
        sort_order: 3,
      },
      {
        name: "Pro",
        amount: 2000,
        bonus: 400,
        description: "2000 + 400 bonus points",
        sort_order: 4,
      },
      {
        name: "Elite",
        amount: 5000,
        bonus: 1250,
        description: "5000 + 1250 bonus points",
        sort_order: 5,
      },
      {
        name: "Ultimate",
        amount: 10000,
        bonus: 3000,
        description: "10000 + 3000 bonus points",
        sort_order: 6,
      },
    ]);
  }

  // ============================================
  // 4. PLATFORM EARNINGS TABLE
  // ============================================
  const earningsExists = await knex.schema.hasTable("platform_earnings");
  if (!earningsExists) {
    await knex.schema.createTable("platform_earnings", (table) => {
      table.increments("id").primary();
      table.decimal("total_revenue", 12, 2).defaultTo(0);
      table.decimal("total_deposits", 12, 2).defaultTo(0);
      table.decimal("total_bonus_given", 12, 2).defaultTo(0);
      table.decimal("total_endorsements_spent", 12, 2).defaultTo(0);
      table.decimal("platform_fee", 12, 2).defaultTo(0);
      table.decimal("pending_balance", 12, 2).defaultTo(0);
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });

    await knex("platform_earnings").insert({
      total_revenue: 0,
      total_deposits: 0,
      total_bonus_given: 0,
      total_endorsements_spent: 0,
      platform_fee: 0,
      pending_balance: 0,
    });
  }

  // ============================================
  // 5. DAILY EARNINGS ANALYTICS TABLE
  // ============================================
  const dailyAnalyticsExists = await knex.schema.hasTable(
    "daily_earnings_analytics",
  );
  if (!dailyAnalyticsExists) {
    await knex.schema.createTable("daily_earnings_analytics", (table) => {
      table.date("date").primary();
      table.decimal("deposits", 12, 2).defaultTo(0);
      table.decimal("endorsements_spent", 12, 2).defaultTo(0);
      table.decimal("bonus_given", 12, 2).defaultTo(0);
      table.decimal("net_revenue", 12, 2).defaultTo(0);
      table.integer("unique_users").defaultTo(0);
      table.integer("total_transactions").defaultTo(0);
      table.json("amount_breakdown").defaultTo(JSON.stringify({}));
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  }

  // ============================================
  // 6. USER ANALYTICS TABLE
  // ============================================
  const userAnalyticsExists = await knex.schema.hasTable("user_analytics");
  if (!userAnalyticsExists) {
    await knex.schema.createTable("user_analytics", (table) => {
      table.increments("id").primary();
      table.string("user_id", 50).notNullable().unique();
      table.integer("total_deposits_count").defaultTo(0);
      table.integer("total_endorsements_count").defaultTo(0);
      table.decimal("lifetime_value", 10, 2).defaultTo(0);
      table.timestamp("last_activity").nullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index("user_id");
      table.index("lifetime_value");
    });
  }

  // ============================================
  // 7. CREATE STORED PROCEDURE FOR DAILY ANALYTICS
  // ============================================
  await knex.raw(`
    CREATE OR REPLACE PROCEDURE update_daily_wallet_analytics()
    BEGIN
      DECLARE yesterday DATE;
      SET yesterday = DATE_SUB(CURDATE(), INTERVAL 1 DAY);
      
      INSERT INTO daily_earnings_analytics (date, deposits, endorsements_spent, bonus_given, net_revenue, unique_users, total_transactions)
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) as deposits,
        COALESCE(SUM(CASE WHEN type = 'endorsement' AND status = 'completed' THEN amount ELSE 0 END), 0) as endorsements,
        COALESCE(SUM(CASE WHEN type = 'bonus' AND status = 'completed' THEN amount ELSE 0 END), 0) as bonus,
        COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'bonus' AND status = 'completed' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'endorsement' AND status = 'completed' THEN amount ELSE 0 END), 0) as net_revenue,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_transactions
      FROM wallet_transactions
      WHERE DATE(created_at) = yesterday AND status = 'completed'
      ON DUPLICATE KEY UPDATE
        deposits = VALUES(deposits),
        endorsements_spent = VALUES(endorsements_spent),
        bonus_given = VALUES(bonus_given),
        net_revenue = VALUES(net_revenue),
        unique_users = VALUES(unique_users),
        total_transactions = VALUES(total_transactions);
    END
  `);
};

exports.down = async function (knex) {
  // Drop stored procedure
  try {
    await knex.raw("DROP PROCEDURE IF EXISTS update_daily_wallet_analytics");
  } catch (error) {
    console.log("Error dropping procedure:", error.message);
  }

  // Drop tables in reverse order
  await knex.schema.dropTableIfExists("user_analytics");
  await knex.schema.dropTableIfExists("daily_earnings_analytics");
  await knex.schema.dropTableIfExists("platform_earnings");
  await knex.schema.dropTableIfExists("recharge_packages");
  await knex.schema.dropTableIfExists("wallet_transactions");
  await knex.schema.dropTableIfExists("user_wallets");
};
