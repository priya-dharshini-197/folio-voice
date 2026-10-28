/**
 * Migration: Create Projects Table
 */
exports.up = function(knex) {
  return knex.schema.createTable('projects', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 150).notNullable();
    table.text('description').nullable();
    table.text('cover_image_url').nullable();
    table.string('category', 50).notNullable().defaultTo('General');
    table.text('tags').nullable(); // JSON string e.g. '["React","Node"]'
    table.text('tech_stack').nullable(); // JSON string
    table.text('github_url').nullable();
    table.text('live_url').nullable();
    table.boolean('is_featured').notNullable().defaultTo(false);
    table.boolean('is_published').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.index(['user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('projects');
};
