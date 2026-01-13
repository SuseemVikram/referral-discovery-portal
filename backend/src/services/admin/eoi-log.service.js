/**
 * Admin EOI Log Service
 */
const eoiLogRepository = require('../../repositories/eoi-log.repository');

class EOILogService {
  /**
   * Get all EOI logs
   */
  async getAllLogs() {
    return eoiLogRepository.findAll();
  }

  /**
   * Export EOI logs as CSV
   */
  async exportLogsAsCSV() {
    const logs = await eoiLogRepository.findAll();

    const headers = [
      'Timestamp',
      'Referrer Name',
      'Referrer Email',
      'Referrer Company',
      'Candidate ID',
      'Candidate Name',
      'Candidate Roles',
    ];

    const rows = logs.map((log) => [
      new Date(log.sentAt).toISOString(),
      `"${(log.referrerName || '').replace(/"/g, '""')}"`,
      `"${(log.referrerEmail || '').replace(/"/g, '""')}"`,
      `"${(log.referrerCompany || '').replace(/"/g, '""')}"`,
      log.candidateId,
      `"${(log.candidateName || '').replace(/"/g, '""')}"`,
      `"${(log.candidateRoles || []).join(', ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const filename = `eoi-logs-${new Date().toISOString().split('T')[0]}.csv`;

    return {
      content: csvContent,
      filename,
    };
  }
}

module.exports = new EOILogService();

