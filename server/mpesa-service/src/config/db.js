import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ballot',
  },
  migrations: {
    tableName: 'knex_migrations_mpesa'
  },
  pool: { min: 0, max: 7 }
});

export default db;
