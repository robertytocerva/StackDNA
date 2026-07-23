const express = require('express');
const router = express.Router();
const { runSync, runAllSyncs, getSyncStatus } = require('../../jobs/syncJobs');

router.post('/sync/:source', async (req, res, next) => {
  try {
    const { source } = req.params;
    if (source === 'all') {
      const results = await runAllSyncs();
      return res.json({ message: 'All syncs completed', results });
    }

    const result = await runSync(source);
    if (!result) {
      return res.status(409).json({ error: 'Sync already in progress' });
    }
    res.json({ message: `Sync completed for ${source}`, result });
  } catch (err) {
    next(err);
  }
});

router.get('/sync/status', async (req, res, next) => {
  try {
    const logs = await getSyncStatus();
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
