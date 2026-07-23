import * as cacheRepository from '../repositories/cache.repository.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

type FetchFn<T> = () => Promise<T>;

/**
 * Gets a cached entry by key and source.
 * Returns null if not found or expired.
 */
export async function get<T>(key: string, fuente: string): Promise<T | null> {
  const entry = await cacheRepository.findByKey(buildCacheKey(key, fuente));
  if (!entry) return null;

  if (new Date(entry.expires_at) > new Date()) {
    return entry.response_body as T;
  }

  // Expired
  return null;
}

/**
 * Gets a cached entry, returning expired data as fallback info.
 */
export async function getWithExpired<T>(
  key: string,
  fuente: string
): Promise<{ data: T | null; expired: boolean }> {
  const entry = await cacheRepository.findByKey(buildCacheKey(key, fuente));
  if (!entry) return { data: null, expired: false };

  const isExpired = new Date(entry.expires_at) <= new Date();
  return { data: entry.response_body as T, expired: isExpired };
}

/**
 * Sets a cache entry.
 */
export async function set(
  key: string,
  fuente: string,
  body: unknown,
  ttlSeconds: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await cacheRepository.upsert({
    cache_key: buildCacheKey(key, fuente),
    fuente,
    response_body: body,
    expires_at: expiresAt,
  });
}

/**
 * Gets from cache if available (hit), otherwise fetches from external source.
 * If fetch fails and expired cache exists, returns stale data as fallback.
 */
export async function getOrFetch<T>(
  key: string,
  fuente: string,
  fetchFn: FetchFn<T>
): Promise<T> {
  const ttl = getTtlForSource(fuente);

  // Check cache
  const { data: cached, expired } = await getWithExpired<T>(key, fuente);

  if (cached !== null && !expired) {
    return cached; // Cache hit
  }

  // Cache miss or expired - fetch from external source
  try {
    const freshData = await fetchFn();
    await set(key, fuente, freshData, ttl);
    return freshData;
  } catch (error) {
    // If we have stale cached data, use it as fallback
    if (cached !== null) {
      logger.warn('External fetch failed, using stale cache', {
        key,
        fuente,
        error: error instanceof Error ? error.message : String(error),
      });
      return cached;
    }
    throw error;
  }
}

/**
 * Returns the configured TTL in seconds for a given source.
 */
function getTtlForSource(fuente: string): number {
  switch (fuente) {
    case 'apis-guru':
      return config.cacheTtl.apisGuru;
    case 'npm':
      return config.cacheTtl.npm;
    case 'pypi':
      return config.cacheTtl.pypi;
    case 'github':
      return config.cacheTtl.github;
    default:
      return 21600; // Default 6 hours
  }
}

function buildCacheKey(key: string, fuente: string): string {
  return `${fuente}:${key}`;
}

/**
 * Cleans up expired entries if count exceeds threshold.
 */
export async function cleanupExpired(): Promise<number> {
  const expiredCount = await cacheRepository.countExpired();
  if (expiredCount > 10000) {
    return await cacheRepository.deleteExpired(5000);
  }
  return 0;
}
