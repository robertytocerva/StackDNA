import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware for handling unmatched routes.
 * Returns 404 with standard error structure.
 */
export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.path}`,
    },
  });
}
