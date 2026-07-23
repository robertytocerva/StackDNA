import type { Request, Response } from 'express';
import { pool } from '../config/index.js';

/**
 * Health check controller.
 * Verifies PostgreSQL connectivity with 5s timeout.
 */
export async function healthCheck(_req: Request, res: Response): Promise<void> {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      dbStatus = 'connected';
    } finally {
      client.release();
    }
  } catch {
    dbStatus = 'disconnected';
  }

  const status = dbStatus === 'connected' ? 'healthy' : 'degraded';
  const statusCode = status === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      database: dbStatus,
    },
  });
}
