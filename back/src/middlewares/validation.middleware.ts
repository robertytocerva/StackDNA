import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors.js';

/**
 * Zod schema for validating search query parameters.
 */
export const searchQuerySchema = z.object({
  query: z
    .string()
    .max(200, 'query debe tener máximo 200 caracteres')
    .min(1, 'query no puede estar vacío')
    .optional(),
  type: z
    .enum(['API', 'Framework', 'Library'], {
      invalid_type_error: 'type debe ser uno de: API, Framework, Library',
    })
    .optional(),
  category: z.string().optional(),
  language: z.string().optional(),
  sort: z
    .enum(['popularity', 'downloads', 'recent'], {
      invalid_type_error: 'sort debe ser uno de: popularity, downloads, recent',
    })
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive('page debe ser un entero positivo'))
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1, 'limit debe ser al menos 1').max(100, 'limit debe ser máximo 100'))
    .optional()
    .default('20'),
});

export type SearchQueryParams = z.infer<typeof searchQuerySchema>;

/**
 * Middleware that validates request query params against the search schema.
 * Returns 400 with all validation errors simultaneously.
 * Ignores unrecognized parameters.
 */
export function validateSearchQuery(req: Request, _res: Response, next: NextFunction): void {
  const result = searchQuerySchema.safeParse(req.query);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'unknown',
      reason: issue.message,
    }));
    throw new ValidationError(details);
  }

  // Attach validated params to request for downstream use
  (req as Request & { validatedQuery: SearchQueryParams }).validatedQuery = result.data;
  next();
}
