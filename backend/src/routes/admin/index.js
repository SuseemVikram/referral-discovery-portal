/**
 * Admin Routes Aggregator
 * Combines all admin route modules
 */
const express = require('express');
const candidatesRouter = require('./candidates.routes');
const importRouter = require('./import.routes');
const referrersRouter = require('./referrers.routes');
const adminsRouter = require('./admins.routes');
const eoiLogRouter = require('./eoi-log.routes');
const analyticsRouter = require('./analytics.routes');

const router = express.Router();

// Mount all admin routes
router.use('/candidates', candidatesRouter);
router.use('/', importRouter); // /import-csv and /sample-csv
router.use('/referrers', referrersRouter);
router.use('/admins', adminsRouter);
router.use('/eoi-log', eoiLogRouter);
router.use('/analytics', analyticsRouter);

module.exports = router;

