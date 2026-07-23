import { loadAndValidateEnv } from './env.js';

/**
 * Validated application configuration.
 * Loaded once at startup - if validation fails, the process exits.
 */
const env = loadAndValidateEnv();

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,

  database: {
    url: env.DATABASE_URL,
    host: env.DB_HOST,
    port: env.DB_PORT,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  },

  github: {
    token: env.GITHUB_TOKEN,
  },

  cacheTtl: {
    apisGuru: env.CACHE_TTL_APIS_GURU,
    npm: env.CACHE_TTL_NPM,
    pypi: env.CACHE_TTL_PYPI,
    github: env.CACHE_TTL_GITHUB,
  },
} as const;

export type AppConfig = typeof config;

export { pool } from './database.js';
