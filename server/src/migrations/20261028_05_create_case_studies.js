/**
 * Migration: Create Case Studies Table
 */
exports.up = function(knex) {
  return knex.schema.createTable('case_studies', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 150).notNullable();
    table.string('project_context', 200).nullable();
    table.text('problem').nullable();
    table.text('approach').nullable();
    table.text('solution').nullable();
    table.text('result').nullable();
    table.integer('related_project_id').unsigned().nullable()
      .references('id').inTable('projects').onDelete('SET NULL');
    table.text('image_url').nullable();
    table.boolean('is_published').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.index(['user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('case_studies');
};

