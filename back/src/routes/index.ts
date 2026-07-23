import { Router } from 'express';
import technologyRoutes from './technology.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

// API routes
router.use('/api', technologyRoutes);

// Health check at root level
router.use(healthRoutes);

export default router;
