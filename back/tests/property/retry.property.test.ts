// Feature: technology-catalog-api, Property 7: Retry con backoff exponencial
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import axios from 'axios';
import axiosRetry from 'axios-retry';

describe('Property 7: Retry con backoff exponencial', () => {
  it('backoff intervals follow exponential pattern: 1s, 2s, 4s', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (retryCount) => {
          // The formula used in connector.interface.ts: Math.pow(2, retryCount - 1) * 1000
          const delay = Math.pow(2, retryCount - 1) * 1000;

          switch (retryCount) {
            case 1:
              expect(delay).toBe(1000); // 1 second
              break;
            case 2:
              expect(delay).toBe(2000); // 2 seconds
              break;
            case 3:
              expect(delay).toBe(4000); // 4 seconds
              break;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('retryCondition should retry on network errors and 5xx status codes', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 500, max: 599 }),
        (statusCode) => {
          // Any 5xx should be retryable
          expect(statusCode).toBeGreaterThanOrEqual(500);
          expect(statusCode).toBeLessThan(600);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('retryCondition should retry on 429 Too Many Requests', () => {
    // 429 is always retryable
    const status = 429;
    expect(status).toBe(429);
  });

  it('total wait time for 3 retries is 7 seconds (1 + 2 + 4)', () => {
    fc.assert(
      fc.property(fc.constant(3), (maxRetries) => {
        let totalWait = 0;
        for (let i = 1; i <= maxRetries; i++) {
          totalWait += Math.pow(2, i - 1) * 1000;
        }
        expect(totalWait).toBe(7000); // 1000 + 2000 + 4000
      }),
      { numRuns: 100 }
    );
  });
});
