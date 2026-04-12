// clean-migrations.js
const { pool, initDB } = require('./src/configurations/db');

async function cleanMigrations() {
  try {
    console.log("🔧 Connecting to database...");
    await initDB();
    
    console.log("✅ Connected, cleaning migrations...");
    
    // Delete problematic migration
    await pool.execute(
      "DELETE FROM knex_migrations WHERE name = ?",
      ['20260411211722_create_orders_table.js']
    );
    console.log("✅ Deleted migration record");
    
    // Clear lock
    await pool.execute("DELETE FROM knex_migrations_lock");
    console.log("✅ Cleared lock");
    
    console.log("\n✅ FIX COMPLETE! Restart your server.\n");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Try running this SQL manually in MySQL:\n");
    console.log("USE ballot;");
    console.log("DELETE FROM knex_migrations WHERE name = '20260411211722_create_orders_table.js';");
    console.log("DELETE FROM knex_migrations_lock;\n");
  } finally {
    process.exit(0);
  }
}

cleanMigrations();