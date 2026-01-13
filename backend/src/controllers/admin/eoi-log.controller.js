/**
 * Admin EOI Log Controller
 */
const eoiLogService = require('../../services/admin/eoi-log.service');

class EOILogController {
  async getAllLogs(req, res, next) {
    try {
      const logs = await eoiLogService.getAllLogs();
      res.json({ logs });
    } catch (error) {
      next(error);
    }
  }

  async exportLogs(req, res, next) {
    try {
      const { content, filename } = await eoiLogService.exportLogsAsCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(content);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EOILogController();

