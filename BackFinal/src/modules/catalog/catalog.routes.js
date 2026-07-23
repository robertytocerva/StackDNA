const express = require('express');
const router = express.Router();
const catalogController = require('./catalog.controller');
const { query } = require('express-validator');
const validate = require('../validationHandler');

router.get(
  '/technologies',
  [
    query('query').optional().isString(),
    query('type').optional().isIn(['api', 'framework', 'libreria', 'herramienta']),
    query('category').optional().isString(),
    query('lang').optional().isIn(['javascript', 'python', 'java']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  catalogController.search
);

router.get('/technologies/:slug', catalogController.getBySlug);
router.get('/categories', catalogController.getCategories);
router.get('/ecosystems', catalogController.getEcosystems);

module.exports = router;
