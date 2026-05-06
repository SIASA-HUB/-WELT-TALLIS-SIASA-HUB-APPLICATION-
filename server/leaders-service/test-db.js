const knex = require('knex');
const config = require('./knexfile');
const db = knex(config.development);

async function test() {
  try {
    console.log('Testing DB connection...');
    await db.raw('SELECT 1');
    console.log('✅ DB Connected!');
    process.exit(0);
  } catch (err) {
    console.error('❌ DB Connection failed:', err.message);
    process.exit(1);
  }
}

test();
