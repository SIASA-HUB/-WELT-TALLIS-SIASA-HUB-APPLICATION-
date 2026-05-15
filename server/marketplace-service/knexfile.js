const path = require("path");
require("dotenv").config();

module.exports = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "ballot",
    },
    migrations: {
      directory: path.join(__dirname, "src", "migrations"),
      tableName: "knex_migrations_marketplace",
    },
    seeds: {
      directory: path.join(__dirname, "src", "seeds"),
    },
  },

  production: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.join(__dirname, "src", "migrations"),
      tableName: "knex_migrations_marketplace",
    },
    seeds: {
      directory: path.join(__dirname, "src", "seeds"),
    },
  },
};
