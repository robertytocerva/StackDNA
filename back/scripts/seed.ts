import { pool } from '../src/config/index.js';
import { runMigrations } from '../src/migrations/runner.js';
import { runSeeding } from '../src/services/seeding.service.js';
import { getAllConnectors } from '../src/services/connectors/index.js';

async function main(): Promise<void> {
  console.log('=== Technology Catalog Seeding ===\n');

  try {
    // Step 1: Run pending migrations
    console.log('[1/3] Running migrations...');
    await runMigrations();
    console.log('');

    // Step 2: Get all connectors
    console.log('[2/3] Initializing connectors...');
    const connectors = getAllConnectors();
    console.log(`  Connectors: ${connectors.map((c) => c.source).join(', ')}\n`);

    // Step 3: Execute seeding
    console.log('[3/3] Seeding technologies...');
    const summary = await runSeeding(connectors);

    // Print summary
    console.log('\n=== Seeding Summary ===');
    console.log(`  Total processed: ${summary.processed}`);
    console.log(`  Inserted: ${summary.inserted}`);
    console.log(`  Updated: ${summary.updated}`);
    console.log(`  Errors: ${summary.errors}`);
    console.log('\n  By source:');
    for (const [source, stats] of Object.entries(summary.bySource)) {
      console.log(`    ${source}: processed=${stats.processed}, inserted=${stats.inserted}, updated=${stats.updated}, errors=${stats.errors}`);
    }
    console.log('\n=== Done ===');
  } catch (error) {
    console.error('Seeding failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
