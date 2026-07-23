import { pool } from '../config/index.js';
import type { CacheEntry } from '../types/connector.types.js';

export async function findByKey(cacheKey: string): Promise<CacheEntry | null> {
  const result = await pool.query<CacheEntry>(
    `SELECT * FROM external_cache WHERE cache_key = $1`,
    [cacheKey]
  );
  return result.rows[0] ?? null;
}

export async function upsert(entry: {
  cache_key: string;
  fuente: string;
  response_body: unknown;
  expires_at: Date;
}): Promise<void> {
  await pool.query(
    `INSERT INTO external_cache (cache_key, fuente, response_body, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (cache_key) DO UPDATE SET
       response_body = $3,
       expires_at = $4,
       updated_at = NOW()`,
    [entry.cache_key, entry.fuente, JSON.stringify(entry.response_body), entry.expires_at]
  );
}

export async function deleteExpired(limit: number): Promise<number> {
  const result = await pool.query(
    `DELETE FROM external_cache
     WHERE id IN (
       SELECT id FROM external_cache
       WHERE expires_at < NOW()
       LIMIT $1
     )`,
    [limit]
  );
  return result.rowCount ?? 0;
}

export async function countExpired(): Promise<number> {
  const result = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int as total FROM external_cache WHERE expires_at < NOW()`
  );
  return result.rows[0].total;
}
