exports.up = function (knex) {
  return knex.schema
    .dropTableIfExists('examples')
    .raw('ALTER TABLE technologies DROP CONSTRAINT IF EXISTS technologies_nombre_unique')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS nombre')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS descripcion_corta')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS descripcion_larga')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS openapi_spec_url')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS fuente')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS fuente_id')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS lenguajes')
    .raw(`
      ALTER TABLE technologies
        ADD COLUMN slug VARCHAR(255) UNIQUE,
        ADD COLUMN nombre VARCHAR(255) NOT NULL DEFAULT '',
        ADD COLUMN lenguaje VARCHAR(50),
        ADD COLUMN ecosistema VARCHAR(50),
        ADD COLUMN descripcion TEXT,
        ADD COLUMN logo_url VARCHAR(500),
        ADD COLUMN homepage_url VARCHAR(500),
        ADD COLUMN version VARCHAR(50),
        ADD COLUMN key_features TEXT[] DEFAULT '{}',
        ADD COLUMN use_cases TEXT[] DEFAULT '{}',
        ADD COLUMN installation TEXT
    `)
    .raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_slug ON technologies (slug)
    `)
    .raw(`
      CREATE INDEX IF NOT EXISTS idx_tech_lenguaje ON technologies (lenguaje)
    `)
    .raw(`
      CREATE INDEX IF NOT EXISTS idx_tech_ecosistema ON technologies (ecosistema)
    `);
};

exports.down = function (knex) {
  return knex.schema
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS slug')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS lenguaje')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS ecosistema')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS descripcion')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS logo_url')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS homepage_url')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS version')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS key_features')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS use_cases')
    .raw('ALTER TABLE technologies DROP COLUMN IF EXISTS installation')
    .raw('DROP INDEX IF EXISTS idx_tech_slug')
    .raw('DROP INDEX IF EXISTS idx_tech_lenguaje')
    .raw('DROP INDEX IF EXISTS idx_tech_ecosistema')
    .raw(`CREATE TABLE IF NOT EXISTS examples (
      id SERIAL PRIMARY KEY,
      tecnologia_id INTEGER REFERENCES technologies(id) ON DELETE CASCADE,
      lenguaje VARCHAR(50) NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      codigo TEXT NOT NULL,
      descripcion TEXT,
      endpoint_relacionado VARCHAR(500),
      created_at TIMESTAMP DEFAULT NOW()
    )`);
};
