require('dotenv').config();
const path = require('path');

/**
 * Knex database configuration.
 * - development: a local SQLite file (set DB_CLIENT=pg to use Postgres locally instead)
 * - production: PostgreSQL through DATABASE_URL (Neon), used when deployed on Render
 * Having DATABASE_URL in your local .env does NOT switch development away from SQLite.
 */
const migrations = { directory: path.join(__dirname, 'src/migrations') };
const useLocalPostgres = process.env.DB_CLIENT === 'pg';

module.exports = {
  development: useLocalPostgres
    ? {
      client: 'pg',
      connection: process.env.DATABASE_URL,
      migrations
    }
    : {
      client: 'sqlite3',
      connection: {
        filename: path.resolve(__dirname, process.env.DB_FILENAME || './data/folio.sqlite')
      },
      useNullAsDefault: true,
      migrations
    },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 0, max: 5 },
    migrations
  }
};