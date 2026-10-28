/**
 * Migration: Create Skills Table
 */
exports.up = function(knex) {
  return knex.schema.createTable('skills', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('category', 50).notNullable().defaultTo('Frontend');
    table.integer('proficiency').nullable(); // 1 - 100 self-reported
    table.integer('years_of_experience').nullable();
    table.timestamps(true, true);

    table.index(['user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('skills');
};

