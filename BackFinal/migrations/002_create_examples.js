exports.up = function (knex) {
  return knex.schema.createTable('examples', (table) => {
    table.increments('id').primary();
    table
      .integer('tecnologia_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('technologies')
      .onDelete('CASCADE');
    table.string('lenguaje', 50).notNullable();
    table.string('titulo', 255).notNullable();
    table.text('codigo').notNullable();
    table.text('descripcion');
    table.string('endpoint_relacionado', 500);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('tecnologia_id');
    table.index('lenguaje');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('examples');
};
