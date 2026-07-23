import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import Bottleneck from 'bottleneck';
import type { ExternalConnector, ConnectorConfig } from '../../types/connector.types.js';
import type { ExternalTechnology } from '../../types/technology.types.js';

export type { ExternalConnector };

/**
 * Default connector configuration.
 */
const DEFAULT_CONFIG: Omit<ConnectorConfig, 'baseUrl'> = {
  rateLimitPerMinute: 30,
  timeoutMs: 10000,
  maxRetries: 3,
};

/**
 * Creates a rate-limited Axios instance with retry logic.
 */
export function createConnectorClient(config: Partial<ConnectorConfig> & { baseUrl: string }): {
  client: AxiosInstance;
  limiter: Bottleneck;
} {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Configure Bottleneck rate limiter
  const limiter = new Bottleneck({
    reservoir: finalConfig.rateLimitPerMinute,
    reservoirRefreshAmount: finalConfig.rateLimitPerMinute,
    reservoirRefreshInterval: 60 * 1000, // 1 minute
    maxConcurrent: 5,
  });

  // Create Axios instance
  const client = axios.create({
    baseURL: finalConfig.baseUrl,
    timeout: finalConfig.timeoutMs,
  });

  // Configure axios-retry with exponential backoff
  axiosRetry(client, {
    retries: finalConfig.maxRetries,
    retryDelay: (retryCount) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.pow(2, retryCount - 1) * 1000;
    },
    retryCondition: (error) => {
      // Retry on network errors, timeouts, and 429/5xx
      return (
        axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.response?.status === 429 ||
        (error.response?.status !== undefined && error.response.status >= 500)
      );
    },
  });

  return { client, limiter };
}
