import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware.
 * - AppError instances: respond with statusCode and structured JSON.
 * - Unknown errors: respond 500 with generic message, log full details with correlationId.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
    return;
  }

  // Unknown error - never expose internals
  const correlationId = randomUUID();

  logger.error('Unhandled error', {
    correlationId,
    method: req.method,
    path: req.path,
    params: req.params,
    query: req.query,
    stack: err.stack,
  });

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
      details: { correlationId },
    },
  });
}
