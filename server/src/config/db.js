const knex = require('knex');
const knexConfig = require('../../knexfile');

// PostgreSQL returns DATE columns as JavaScript Date objects. Return plain 'YYYY-MM-DD'
// text instead, so Postgres behaves like SQLite does on your laptop.
try {
    const pg = require('pg');
    pg.types.setTypeParser(1082, (value) => value); // 1082 = DATE
} catch (e) {
    // the pg driver is only needed when Postgres is in use
}

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

module.exports = db;