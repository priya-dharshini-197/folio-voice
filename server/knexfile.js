require('dotenv').config();
const path = require('path');

/**
 * Knex database configuration.
 * Seamlessly switches between SQLite (local dev) and PostgreSQL (production).
 */
const isPostgres = process.env.DB_CLIENT === 'pg' || !!process.env.DATABASE_URL;

module.exports = {
  development: isPostgres
    ? {
        client: 'pg',
        connection: process.env.DATABASE_URL || {
          host: process.env.DB_HOST || '127.0.0.1',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'folio_voice'
        },
        migrations: {
          directory: path.join(__dirname, 'src/migrations')
        }
      }
    : {
        client: 'sqlite3',
        connection: {
          filename: path.resolve(__dirname, process.env.DB_FILENAME || './data/folio.sqlite')
        },
        useNullAsDefault: true,
        migrations: {
          directory: path.join(__dirname, 'src/migrations')
        }
      },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    migrations: {
      directory: path.join(__dirname, 'src/migrations')
    }
  }
};
