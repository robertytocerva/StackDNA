import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

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

  if (config.database.url) {
    poolConfig.connectionString = config.database.url;
  } else {
    poolConfig.host = config.database.host;
    poolConfig.port = config.database.port;
    poolConfig.database = config.database.name;
    poolConfig.user = config.database.user;
    poolConfig.password = config.database.password;
  }

  return new Pool(poolConfig);
}

/** Singleton pool de conexiones PostgreSQL */
export const pool: pg.Pool = createPool();
