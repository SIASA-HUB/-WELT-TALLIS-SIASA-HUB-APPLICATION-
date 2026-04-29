// run-migrations.js
// Run this script to apply all pending migrations
// Usage: node run-migrations.js
// This bypasses PowerShell execution policy restrictions on npx

require('dotenv').config();
const path = require('path');
const knex = require('knex');

const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ballot',
  },
  migrations: {
    directory: path.join(__dirname, 'src', 'migrations'),
    tableName: 'knex_migrations_leaders',
  },
};

const db = knex(config);

async function runMigrations() {
  console.log('🚀 Running leaders-service migrations...');
  console.log(`📦 DB: ${config.connection.database}@${config.connection.host}:${config.connection.port}`);
  
  try {
    const [batchNo, log] = await db.migrate.latest();
    if (log.length === 0) {
      console.log('✅ Already up to date — no new migrations to run.');
    } else {
      console.log(`✅ Batch ${batchNo} ran ${log.length} migration(s):`);
      log.forEach(file => console.log(`   → ${path.basename(file)}`));
    }
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
