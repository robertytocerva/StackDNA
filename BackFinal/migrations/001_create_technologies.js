exports.up = function (knex) {
  return knex.schema.createTable('technologies', (table) => {
    table.increments('id').primary();
    table.string('nombre', 255).notNullable().unique();
    table.string('tipo', 20).notNullable();
    table.specificType('lenguajes', 'text[]').notNullable().defaultTo('{}');
    table.string('categoria', 100);
    table.text('descripcion_corta');
    table.text('descripcion_larga');
    table.string('repo_url', 500);
    table.string('docs_url', 500);
    table.string('openapi_spec_url', 500);
    table.jsonb('stats').defaultTo('{}');
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.string('fuente', 50).notNullable();
    table.string('fuente_id', 255);
    table.timestamps(true, true);

    table.index('tipo');
    table.index('categoria');
    table.index('fuente');
    table.index(['fuente', 'fuente_id'], 'idx_fuente_id');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('technologies');
};
