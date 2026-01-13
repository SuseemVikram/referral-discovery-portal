/**
 * Admin EOI Log Routes
 */
const express = require('express');
const eoiLogController = require('../../controllers/admin/eoi-log.controller');

const router = express.Router();

router.get('/', eoiLogController.getAllLogs.bind(eoiLogController));
router.get('/export', eoiLogController.exportLogs.bind(eoiLogController));

module.exports = router;

