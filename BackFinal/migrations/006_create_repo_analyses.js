/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('repo_analyses', table => {
    table.increments('id').primary();
    table.text('repo_url').notNullable();
    table.string('owner', 255).notNullable();
    table.string('repo_name', 255).notNullable();
    table.string('status', 20).defaultTo('pending');
    table.string('commit_sha', 40);
    table.jsonb('result');
    table.timestamps(true, true);
  }).then(() => {
    return knex.schema.raw('CREATE UNIQUE INDEX idx_repo_analyses_url ON repo_analyses(repo_url)');
  }).then(() => {
    return knex.schema.raw('CREATE INDEX idx_repo_analyses_status ON repo_analyses(status)');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('repo_analyses');
};
