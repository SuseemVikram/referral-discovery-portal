/**
 * Admin Referrers Routes
 */
const express = require('express');
const referrersController = require('../../controllers/admin/referrers.controller');

const router = express.Router();

router.get('/', referrersController.getAllReferrers.bind(referrersController));
router.get('/:id', referrersController.getReferrerById.bind(referrersController));
router.put('/:id/admin', referrersController.updateAdminStatus.bind(referrersController));

module.exports = router;

