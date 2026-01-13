/**
 * Admin Analytics Controller
 */
const analyticsService = require('../../services/admin/analytics.service');
const { analyticsQuerySchema } = require('../../validators/admin.validator');

class AnalyticsController {
  async getAnalytics(req, res, next) {
    try {
      const validated = analyticsQuerySchema.parse(req.query);
      const days = validated.days || '30';
      const data = await analyticsService.getAnalytics(days);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async exportAnalytics(req, res, next) {
    try {
      const validated = analyticsQuerySchema.parse(req.query);
      const days = validated.days || '30';
      const { content, filename } = await analyticsService.exportAnalytics(days);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();

