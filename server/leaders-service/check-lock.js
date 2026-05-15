const knex = require('knex');
const knexConfig = require('./knexfile');
const db = knex(knexConfig.development);

async function test() {
  try {
    console.log('Testing DB connection...');
    const result = await db.raw('SELECT 1+1 AS result');
    console.log('DB Connection OK:', result[0][0].result);
    
    console.log('Checking migration lock...');
    const lock = await db('knex_migrations_leaders_lock').select('*');
    console.log('Lock status:', lock);
    
    if (lock[0] && lock[0].is_locked) {
      console.log('Lock detected! Attempting to free...');
      await db('knex_migrations_leaders_lock').update({ is_locked: 0 });
      console.log('Lock freed.');
    }
  } catch (err) {
    console.error('DB Test Failed:', err.message);
  } finally {
    await db.destroy();
  }
}

test();
