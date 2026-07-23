const cron = require('node-cron');
const db = require('../config/database');
const { syncNpm } = require('../services/npmSync');
const { syncPypi } = require('../services/pypiSync');
const { syncMaven } = require('../services/mavenSync');

const SYNC_SOURCES = {
  npm: syncNpm,
  pypi: syncPypi,
  maven: syncMaven,
};

let isSyncing = false;

async function runSync(source) {
  if (isSyncing) {
    console.log('Sync already in progress, skipping...');
    return null;
  }

  isSyncing = true;
  console.log(`Starting sync for: ${source}`);

  try {
    const syncFn = SYNC_SOURCES[source];
    if (!syncFn) {
      throw new Error(`Unknown source: ${source}`);
    }
    const result = await syncFn();
    console.log(`Sync completed for ${source}: ${result.items_synced} items`);
    return result;
  } catch (err) {
    console.error(`Sync failed for ${source}:`, err.message);
    return { fuente: source, status: 'error', items_synced: 0, error_message: err.message };
  } finally {
    isSyncing = false;
  }
}

async function runAllSyncs() {
  for (const source of Object.keys(SYNC_SOURCES)) {
    await runSync(source);
  }
}

async function getSyncStatus() {
  const logs = await db('sync_logs')
    .select('fuente', 'status', 'items_synced', 'error_message', 'executed_at')
    .orderBy('executed_at', 'desc')
    .limit(20);

  return logs;
}

async function initialSyncIfNeeded() {
  const [{ count }] = await db('technologies').count('* as count');
  if (parseInt(count) === 0) {
    console.log('Empty database detected, running initial sync...');
    await runAllSyncs();
  } else {
    console.log(`Database has ${count} technologies, skipping initial sync`);
  }
}

function startSyncJobs() {
  initialSyncIfNeeded();

  cron.schedule('0 */6 * * *', () => runSync('npm'));
  cron.schedule('0 */6 * * *', () => runSync('pypi'));
  cron.schedule('0 3 * * *', () => runSync('maven'));

  console.log('Sync cron jobs started');
}

module.exports = { startSyncJobs, runSync, runAllSyncs, getSyncStatus };
