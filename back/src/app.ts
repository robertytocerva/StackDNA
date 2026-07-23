import express from 'express';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();

// JSON body parsing
app.use(express.json());

// Register all routes
app.use(routes);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});

export { app, server };
