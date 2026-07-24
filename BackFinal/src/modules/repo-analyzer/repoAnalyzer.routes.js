const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const repoAnalyzerController = require('./repoAnalyzer.controller');

const analyzeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  validate: false,
  message: {
    error: 'Daily analysis limit reached (5 per day). Try again tomorrow.',
  },
});

router.post('/analyze', analyzeLimiter, repoAnalyzerController.analyze);
router.get('/history', repoAnalyzerController.getHistory);

module.exports = router;
