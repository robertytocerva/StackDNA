import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

/**
 * Zod schema for environment variables validation.
 * Supports DATABASE_URL as primary source, or individual DB_* variables as fallback.
 */
const envSchema = z
  .object({
    // Required
    PORT: z
      .string({ required_error: 'PORT is required' })
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive('PORT must be a positive integer')),

    NODE_ENV: z.enum(['development', 'production', 'test'], {
      required_error: 'NODE_ENV is required',
      invalid_type_error: 'NODE_ENV must be one of: development, production, test',
    }),

    // Database: DATABASE_URL takes priority, otherwise individual vars are required
    DATABASE_URL: z.string().url().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional(),
    DB_NAME: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),

    // Optional
    GITHUB_TOKEN: z.string().optional(),

    // Cache TTLs (in seconds) - optional with defaults
    CACHE_TTL_APIS_GURU: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional()
      .default('86400'),

    CACHE_TTL_NPM: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional()
      .default('21600'),

    CACHE_TTL_PYPI: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional()
      .default('21600'),

    CACHE_TTL_GITHUB: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional()
      .default('43200'),
  })
  .superRefine((data, ctx) => {
    // If DATABASE_URL is not provided, all individual DB vars are required
    if (!data.DATABASE_URL) {
      const missingDbVars: string[] = [];

      if (!data.DB_HOST) missingDbVars.push('DB_HOST');
      if (!data.DB_PORT) missingDbVars.push('DB_PORT');
      if (!data.DB_NAME) missingDbVars.push('DB_NAME');
      if (!data.DB_USER) missingDbVars.push('DB_USER');
      if (!data.DB_PASSWORD) missingDbVars.push('DB_PASSWORD');

      if (missingDbVars.length > 0) {
        for (const varName of missingDbVars) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${varName} is required when DATABASE_URL is not provided`,
            path: [varName],
          });
        }
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema.
 * Loads .env file first, then validates. If validation fails,
 * prints errors to stderr and exits with code 1.
 */
export function loadAndValidateEnv(): Env {
  // Load .env file (won't override existing env vars)
  loadDotenv();

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.issues.map(
      (issue) => `  - ${issue.path.join('.')}: ${issue.message}`
    );

    process.stderr.write(
      `\nError: Missing or invalid environment variables:\n${errorMessages.join('\n')}\n\n`
    );
    process.exit(1);
  }

  return result.data;
}
