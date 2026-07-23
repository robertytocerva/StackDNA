import pg from 'pg';
import { loadAndValidateEnv } from './env.js';

const { Pool } = pg;

const env = loadAndValidateEnv();

/**
 * Configura el pool de conexiones PostgreSQL.
 * Soporta DATABASE_URL como fuente primaria de conexión,
 * o variables individuales (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).
 */
function createPool(): pg.Pool {
  const poolConfig: pg.PoolConfig = {
    min: 2,
    max: 10,
    connectionTimeoutMillis: 30000,
  };

  if (env.DATABASE_URL) {
    poolConfig.connectionString = env.DATABASE_URL;
    poolConfig.ssl = { rejectUnauthorized: false };
  } else {
    poolConfig.host = env.DB_HOST;
    poolConfig.port = env.DB_PORT;
    poolConfig.database = env.DB_NAME;
    poolConfig.user = env.DB_USER;
    poolConfig.password = env.DB_PASSWORD;
  }

  return new Pool(poolConfig);
}

/** Singleton pool de conexiones PostgreSQL */
export const pool: pg.Pool = createPool();
