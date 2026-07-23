// Feature: technology-catalog-api, Property 8: Respuestas de error tienen estructura uniforme
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ValidationError, NotFoundError, MethodNotAllowedError, InternalError } from '../../src/utils/errors.js';

describe('Property 8: Respuestas de error tienen estructura uniforme', () => {
  it('all AppError subclasses produce valid error response structure', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('ValidationError', 'NotFoundError', 'MethodNotAllowedError', 'InternalError'),
        fc.string({ minLength: 1, maxLength: 200 }),
        (errorType, message) => {
          let error;
          switch (errorType) {
            case 'ValidationError':
              error = new ValidationError([{ field: 'test', reason: message }]);
              break;
            case 'NotFoundError':
              error = new NotFoundError(message);
              break;
            case 'MethodNotAllowedError':
              error = new MethodNotAllowedError(message);
              break;
            case 'InternalError':
              error = new InternalError(message);
              break;
          }

          // Verify the error has a valid code (non-empty string)
          expect(error!.code).toBeTruthy();
          expect(typeof error!.code).toBe('string');
          expect(error!.code.length).toBeGreaterThan(0);

          // Verify the error has a valid message (non-empty string)
          expect(error!.message).toBeTruthy();
          expect(typeof error!.message).toBe('string');
          expect(error!.message.length).toBeGreaterThan(0);

          // Verify statusCode is a valid HTTP error code
          expect(error!.statusCode).toBeGreaterThanOrEqual(400);
          expect(error!.statusCode).toBeLessThan(600);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('error codes are consistent for each error type', () => {
    const validationError = new ValidationError([{ field: 'x', reason: 'y' }]);
    expect(validationError.code).toBe('VALIDATION_ERROR');
    expect(validationError.statusCode).toBe(400);

    const notFound = new NotFoundError();
    expect(notFound.code).toBe('NOT_FOUND');
    expect(notFound.statusCode).toBe(404);

    const methodNotAllowed = new MethodNotAllowedError();
    expect(methodNotAllowed.code).toBe('METHOD_NOT_ALLOWED');
    expect(methodNotAllowed.statusCode).toBe(405);

    const internal = new InternalError();
    expect(internal.code).toBe('INTERNAL_ERROR');
    expect(internal.statusCode).toBe(500);
  });
});
