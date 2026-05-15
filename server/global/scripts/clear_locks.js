const knex = require('knex');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../leaders-service/.env') });

const dbConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ballot',
  }
};

const db = knex(dbConfig);

async function clearLocks() {
  console.log('🔄 Clearing knex migration locks...');
  try {
    const tables = ['knex_migrations_leaders', 'knex_migrations_marketplace', 'knex_migrations_lock', 'knex_migrations_users_lock'];
    
    for (const table of tables) {
      try {
        const lockTable = table.endsWith('_lock') ? table : `${table}_lock`;
        const exists = await db.schema.hasTable(lockTable);
        if (exists) {
          await db(lockTable).update({ is_locked: 0 });
          console.log(`✅ Cleared lock for ${lockTable}`);
        }
      } catch (e) {
        // Table might not exist, skip
      }
    }
    
    // Also try raw SQL for generic names
    try {
        await db.raw('UPDATE knex_migrations_lock SET is_locked = 0');
        console.log('✅ Cleared generic knex_migrations_lock');
    } catch (e) {}

    console.log('🎉 Lock clearing complete!');
  } catch (error) {
    console.error('❌ Failed to clear locks:', error.message);
  } finally {
    await db.destroy();
  }
}

clearLocks();
