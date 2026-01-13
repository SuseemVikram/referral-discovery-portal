/**
 * Admin Analytics Routes
 */
const express = require('express');
const analyticsController = require('../../controllers/admin/analytics.controller');

const router = express.Router();

router.get('/', analyticsController.getAnalytics.bind(analyticsController));
router.get('/export', analyticsController.exportAnalytics.bind(analyticsController));

module.exports = router;

