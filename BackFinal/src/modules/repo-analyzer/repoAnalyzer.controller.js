const repoAnalyzerService = require('./repoAnalyzer.service');

class RepoAnalyzerController {
  async analyze(req, res, next) {
    try {
      const { repoUrl } = req.body;

      if (!repoUrl) {
        return res.status(400).json({ error: 'repoUrl is required' });
      }

      const result = await repoAnalyzerService.analyze(repoUrl);

      const rateLimitInfo = {
        limit: 5,
        remaining: Math.max(0, 5 - (req.rateLimit?.current || 0)),
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      res.json({
        ...result,
        rateLimit: rateLimitInfo,
      });
    } catch (err) {
      if (err.status) {
        return res.status(err.status).json({ error: err.message });
      }
      next(err);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await repoAnalyzerService.getHistory(10);
      res.json(history);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new RepoAnalyzerController();
