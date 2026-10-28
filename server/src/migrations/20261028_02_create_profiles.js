/**
 * Migration: Create Profiles Table
 */
exports.up = function(knex) {
  return knex.schema.createTable('profiles', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().unique()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('username', 50).notNullable().unique();
    table.string('full_name', 100).notNullable();
    table.string('headline', 150).nullable();
    table.text('bio').nullable();
    table.text('avatar_url').nullable();
    table.string('location', 100).nullable();
    table.string('contact_email', 255).nullable();
    table.text('github_url').nullable();
    table.text('linkedin_url').nullable();
    table.text('website_url').nullable();
    table.text('resume_url').nullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('profiles');
};

