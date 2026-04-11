const { db } = require("../global/index");
const Logger = require("./utils/logger/logger");

async function resetAllWallets() {
  Logger.info("🔄 Starting global wallet reset to 100 points...");
  
  try {
    // Update all existing wallets to 100
    const updateResult = await db.safeQuery(
      `UPDATE user_wallets SET balance = 100 WHERE balance < 100 OR balance IS NULL`
    );
    
    Logger.info(`✅ Updated ${updateResult.affectedRows || 0} existing wallets to 100 points.`);
    
    // Find users without wallets and create them
    const usersWithoutWallets = await db.safeQuery(
      `SELECT user_id FROM users WHERE user_id NOT IN (SELECT user_id FROM user_wallets)`
    );
    
    Logger.info(`🧐 Found ${usersWithoutWallets.length} users without wallets.`);
    
    for (const user of usersWithoutWallets) {
      await db.safeQuery(
        `INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus, created_at, updated_at)
         VALUES (?, 100, 0, 100, NOW(), NOW())`,
        [user.user_id]
      );
      
      await db.safeQuery(
        `INSERT INTO wallet_transactions 
         (transaction_id, user_id, amount, type, description, status, completed_at)
         VALUES (?, ?, 100, 'bonus', 'System balance adjustment', 'completed', NOW())`,
        [`ADJ-${Date.now()}-${user.user_id.substring(0, 8)}`, user.user_id]
      );
    }
    
    Logger.info(`✅ Created ${usersWithoutWallets.length} new wallets with 100 points.`);
    Logger.info("🎉 Global wallet stabilization complete!");
    process.exit(0);
  } catch (error) {
    Logger.error("❌ Global wallet reset failed:", error);
    process.exit(1);
  }
}

resetAllWallets();
