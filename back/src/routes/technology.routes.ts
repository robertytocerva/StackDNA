import { Router } from 'express';
import { searchTechnologies, getTechnologyDetail } from '../controllers/technology.controller.js';
import { validateSearchQuery } from '../middlewares/validation.middleware.js';
import { MethodNotAllowedError } from '../utils/errors.js';
import type { Request, Response, NextFunction } from 'express';

const router = Router();

// GET /api/technologies - Search with filters
router.get('/technologies', validateSearchQuery, searchTechnologies);

// GET /api/technologies/:idOrSlug - Detail
router.get('/technologies/:idOrSlug', getTechnologyDetail);

// Handle unsupported methods
router.all('/technologies', (_req: Request, _res: Response, next: NextFunction) => {
  next(new MethodNotAllowedError('Solo se permite GET en /api/technologies'));
});

router.all('/technologies/:idOrSlug', (_req: Request, _res: Response, next: NextFunction) => {
  next(new MethodNotAllowedError('Solo se permite GET en /api/technologies/:idOrSlug'));
});

export default router;
