import { pool } from '../config/index.js';

export interface MigrationRecord {
  id: number;
  filename: string;
  executed_at: Date;
  checksum: string;
  status: 'success' | 'failed';
  error_detail: string | null;
}

export async function getExecutedMigrations(): Promise<MigrationRecord[]> {
  const result = await pool.query<MigrationRecord>(
    `SELECT id, filename, executed_at, checksum, status, error_detail
     FROM migrations_history
     ORDER BY filename ASC`
  );
  return result.rows;
}

export async function recordMigration(
  filename: string,
  checksum: string,
  status: 'success' | 'failed',
  errorDetail?: string
): Promise<void> {
  await pool.query(
    `INSERT INTO migrations_history (filename, checksum, status, error_detail)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (filename) DO UPDATE SET
       checksum = $2,
       status = $3,
       executed_at = NOW(),
       error_detail = $4`,
    [filename, checksum, status, errorDetail ?? null]
  );
}

export async function verifyChecksum(
  filename: string,
  expectedChecksum: string
): Promise<boolean> {
  const result = await pool.query<{ checksum: string }>(
    `SELECT checksum FROM migrations_history WHERE filename = $1 AND status = 'success'`,
    [filename]
  );

  if (result.rows.length === 0) {
    return true; // Not executed yet, no checksum to verify
  }

  return result.rows[0].checksum === expectedChecksum;
}
