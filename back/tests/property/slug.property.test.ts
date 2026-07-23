// Feature: technology-catalog-api, Property 4: Slug es determinista y URL-safe
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateSlug } from '../../src/utils/slug.js';

describe('Property 4: Slug es determinista y URL-safe', () => {
  it('should produce only lowercase alphanumeric characters and hyphens', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 500 }), (nombre) => {
        const slug = generateSlug(nombre);
        expect(slug).toMatch(/^[a-z0-9-]*[a-z0-9]$|^[a-z0-9]$|^unnamed$/);
      }),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 500 }), (nombre) => {
        const slug1 = generateSlug(nombre);
        const slug2 = generateSlug(nombre);
        expect(slug1).toBe(slug2);
      }),
      { numRuns: 100 }
    );
  });

  it('should have a maximum length of 100 characters', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 1000 }), (nombre) => {
        const slug = generateSlug(nombre);
        expect(slug.length).toBeLessThanOrEqual(100);
      }),
      { numRuns: 100 }
    );
  });

  it('should not contain consecutive hyphens', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 500 }), (nombre) => {
        const slug = generateSlug(nombre);
        expect(slug).not.toContain('--');
      }),
      { numRuns: 100 }
    );
  });

  it('should not start or end with a hyphen', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 500 }), (nombre) => {
        const slug = generateSlug(nombre);
        if (slug !== 'unnamed') {
          expect(slug[0]).not.toBe('-');
          expect(slug[slug.length - 1]).not.toBe('-');
        }
      }),
      { numRuns: 100 }
    );
  });
});
