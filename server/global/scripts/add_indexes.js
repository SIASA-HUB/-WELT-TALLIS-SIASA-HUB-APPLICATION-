const knex = require('knex');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from a service that has them
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

async function addIndexes() {
  console.log('🚀 Starting database indexing...');

  try {
    // 1. Leaders table
    if (await db.schema.hasTable('leaders')) {
      console.log('--- Indexing leaders table ---');
      const indexes = [
        { cols: ['slug'], name: 'idx_leaders_slug' },
        { cols: ['county'], name: 'idx_leaders_county' },
        { cols: ['constituency'], name: 'idx_leaders_constituency' },
        { cols: ['ward'], name: 'idx_leaders_ward' },
        { cols: ['category'], name: 'idx_leaders_category' },
        { cols: ['views'], name: 'idx_leaders_views' },
        { cols: ['likes_count'], name: 'idx_leaders_likes' },
        { cols: ['comments_count'], name: 'idx_leaders_comments' }
      ];
      for (const idx of indexes) {
        try {
          await db.schema.alterTable('leaders', (table) => {
            table.index(idx.cols, idx.name);
          });
          console.log(`✅ Index ${idx.name} added`);
        } catch (e) {
          console.log(`ℹ️ Index ${idx.name} already exists or skipped`);
        }
      }
    }

    // 2. Endorsements table
    if (await db.schema.hasTable('endorsements')) {
      console.log('--- Indexing endorsements table ---');
      const indexes = [
        { cols: ['leader_id'], name: 'idx_endorsements_leader_id' },
        { cols: ['user_id'], name: 'idx_endorsements_user_id' },
        { cols: ['status'], name: 'idx_endorsements_status' },
        { cols: ['created_at'], name: 'idx_endorsements_created_at' }
      ];
      for (const idx of indexes) {
        try {
          await db.schema.alterTable('endorsements', (table) => {
            table.index(idx.cols, idx.name);
          });
          console.log(`Index ${idx.name} added`);
        } catch (e) {
          console.log(`ℹ Index ${idx.name} already exists or skipped`);
        }
      }
    }

    // 3. Payments table
    if (await db.schema.hasTable('payments')) {
      console.log('--- Indexing payments table ---');
      const indexes = [
        { cols: ['transaction_id'], name: 'idx_payments_transaction_id' },
        { cols: ['phone_number'], name: 'idx_payments_phone' },
        { cols: ['status'], name: 'idx_payments_status' }
      ];
      for (const idx of indexes) {
        try {
          await db.schema.alterTable('payments', (table) => {
            table.index(idx.cols, idx.name);
          });
          console.log(`Index ${idx.name} added`);
        } catch (e) {
          console.log(`ℹIndex ${idx.name} already exists or skipped`);
        }
      }
    }

    console.log('🎉 Indexing process complete!');
  } catch (error) {
    console.error('❌ Indexing failed:', error.message);
  } finally {
    await db.destroy();
  }
}

addIndexes();
