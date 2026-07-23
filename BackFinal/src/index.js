require('dotenv').config();
const app = require('./app');
const db = require('./config/database');
const { startSyncJobs } = require('./jobs/syncJobs');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await db.raw('SELECT 1');
    console.log('DB connected');

    await db.migrate.latest();
    console.log('Migrations complete');

    startSyncJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
