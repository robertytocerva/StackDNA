import type { ExternalTechnology } from './technology.types.js';

export interface ExternalConnector {
  readonly source: string;

  fetchList(params: { offset: number; limit: number }): Promise<ExternalTechnology[]>;
  fetchDetail(identifier: string): Promise<ExternalTechnology | null>;
}

export interface ConnectorConfig {
  baseUrl: string;
  rateLimitPerMinute: number;
  timeoutMs: number;
  maxRetries: number;
}

export interface CacheEntry {
  id: number;
  cache_key: string;
  fuente: string;
  response_body: unknown;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}
