const catalogService = require('./catalog.service');

class CatalogController {
  async search(req, res, next) {
    try {
      const { query, type, category, lang, page, limit } = req.query;
      const result = await catalogService.search({
        query,
        type,
        category,
        lang,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req, res, next) {
    try {
      const tech = await catalogService.getBySlug(req.params.slug);
      if (!tech) return res.status(404).json({ error: 'Technology not found' });
      res.json(tech);
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await catalogService.getCategories();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  async getEcosystems(req, res, next) {
    try {
      const ecosystems = await catalogService.getEcosystems();
      res.json(ecosystems);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CatalogController();
