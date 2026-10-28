/**
 * Migration: Create Portfolio Views Table (Deduplicated View Tracking)
 */
exports.up = function(knex) {
  return knex.schema.createTable('portfolio_views', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('visitor_hash', 64).notNullable();
    table.string('view_date', 10).notNullable(); // 'YYYY-MM-DD'
    table.timestamps(true, true);

    table.unique(['user_id', 'visitor_hash', 'view_date']);
    table.index(['user_id', 'view_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('portfolio_views');
};
