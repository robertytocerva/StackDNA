exports.up = function (knex) {
  return knex.schema.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_fuente_fuente_id 
    ON technologies (fuente, fuente_id)
  `);
};

exports.down = function (knex) {
  return knex.schema.raw('DROP INDEX IF EXISTS idx_tech_fuente_fuente_id');
};
