/**
 * Admin Import Controller
 */
const importService = require('../../services/admin/import.service');
const analyticsService = require('../../services/admin/analytics.service');

class AdminImportController {
  async importCSV(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const result = await importService.importCSV(csvContent);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSampleCSV(req, res) {
    const sampleCSV = analyticsService.getSampleCSV();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="sample-candidates-import.csv"');
    res.send(sampleCSV);
  }
}

module.exports = new AdminImportController();

