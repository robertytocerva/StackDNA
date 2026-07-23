exports.up = function (knex) {
  return knex.schema.createTable('sync_logs', (table) => {
    table.increments('id').primary();
    table.string('fuente', 50).notNullable();
    table.string('status', 20).notNullable();
    table.integer('items_synced').defaultTo(0);
    table.text('error_message');
    table.timestamp('executed_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('sync_logs');
};
