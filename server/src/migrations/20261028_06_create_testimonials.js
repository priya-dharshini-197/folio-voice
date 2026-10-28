/**
 * Migration: Create Testimonials Table
 */
exports.up = function(knex) {
  return knex.schema.createTable('testimonials', function(table) {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('client_name', 100).notNullable();
    table.string('client_role', 100).nullable();
    table.string('client_company', 100).nullable();
    table.text('testimonial').notNullable();
    table.integer('rating').nullable(); // 1 - 5 stars
    table.string('date', 50).nullable();
    table.string('source_type', 50).notNullable().defaultTo('self_entered'); // self_entered vs verified
    table.integer('related_project_id').unsigned().nullable()
      .references('id').inTable('projects').onDelete('SET NULL');
    table.boolean('is_published').notNullable().defaultTo(false);
    table.timestamps(true, true);

    table.index(['user_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('testimonials');
};

