import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/index.js';

interface MigrationRecord {
  filename: string;
  checksum: string;
  status: string;
}

function calculateChecksum(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

async function ensureMigrationsTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations_history (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      checksum VARCHAR(64) NOT NULL,
      status VARCHAR(10) NOT NULL CHECK (status IN ('success', 'failed')),
      error_detail TEXT
    );
  `);
}

async function getExecutedMigrations(): Promise<MigrationRecord[]> {
  const result = await pool.query<MigrationRecord>(
    `SELECT filename, checksum, status FROM migrations_history ORDER BY filename ASC`
  );
  return result.rows;
}

async function discoverMigrationFiles(scriptsDir: string): Promise<string[]> {
  const files = await readdir(scriptsDir);
  return files
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

export async function runMigrations(): Promise<void> {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const scriptsDir = resolve(currentDir, 'scripts');

  await ensureMigrationsTable();

  const executedMigrations = await getExecutedMigrations();
  const executedMap = new Map<string, MigrationRecord>();
  for (const m of executedMigrations) {
    executedMap.set(m.filename, m);
  }

  const migrationFiles = await discoverMigrationFiles(scriptsDir);

  for (const filename of migrationFiles) {
    const existing = executedMap.get(filename);

    // Skip the migrations table creation script if already bootstrapped
    if (filename === '001_create_migrations_table.sql' && !existing) {
      const filePath = join(scriptsDir, filename);
      const content = await readFile(filePath, 'utf8');
      const checksum = calculateChecksum(content);
      await pool.query(
        `INSERT INTO migrations_history (filename, checksum, status) VALUES ($1, $2, 'success') ON CONFLICT (filename) DO NOTHING`,
        [filename, checksum]
      );
      console.log(`[migrations] ✓ ${filename} (bootstrapped)`);
      continue;
    }

    if (existing) {
      if (existing.status === 'success') {
        // Verify checksum integrity
        const filePath = join(scriptsDir, filename);
        const content = await readFile(filePath, 'utf8');
        const currentChecksum = calculateChecksum(content);

        if (currentChecksum !== existing.checksum) {
          throw new Error(
            `Integrity error: Migration "${filename}" has been modified after execution. ` +
              `Expected checksum: ${existing.checksum}, current: ${currentChecksum}`
          );
        }
        continue;
      }
      // If it failed previously, retry it
    }

    // Execute pending migration
    const filePath = join(scriptsDir, filename);
    const content = await readFile(filePath, 'utf8');
    const checksum = calculateChecksum(content);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(content);
      await client.query('COMMIT');

      await pool.query(
        `INSERT INTO migrations_history (filename, checksum, status)
         VALUES ($1, $2, 'success')
         ON CONFLICT (filename) DO UPDATE SET checksum = $2, status = 'success', executed_at = NOW(), error_detail = NULL`,
        [filename, checksum]
      );
      console.log(`[migrations] ✓ ${filename}`);
    } catch (error) {
      await client.query('ROLLBACK');

      const errorMessage = error instanceof Error ? error.message : String(error);

      await pool.query(
        `INSERT INTO migrations_history (filename, checksum, status, error_detail)
         VALUES ($1, $2, 'failed', $3)
         ON CONFLICT (filename) DO UPDATE SET checksum = $2, status = 'failed', executed_at = NOW(), error_detail = $3`,
        [filename, checksum, errorMessage]
      );
      console.error(`[migrations] ✗ ${filename}: ${errorMessage}`);
      throw new Error(`Migration "${filename}" failed: ${errorMessage}`);
    } finally {
      client.release();
    }
  }

  console.log('[migrations] All migrations executed successfully.');
}

// Allow direct execution via `npm run migrate`
const isDirectExecution = process.argv[1]?.includes('runner');
if (isDirectExecution) {
  runMigrations()
    .then(() => {
      process.exit(0);
    })
    .catch((err: Error) => {
      console.error('[migrations] Fatal error:', err.message);
      process.exit(1);
    });
}
