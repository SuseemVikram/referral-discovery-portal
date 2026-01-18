/**
 * Admin Candidates Routes
 */
const express = require('express');
const candidatesController = require('../../controllers/admin/candidates.controller');

const router = express.Router();

router.get('/', candidatesController.getAllCandidates.bind(candidatesController));
router.put('/:id/visibility', candidatesController.updateVisibility.bind(candidatesController));
router.put('/:id/availability', candidatesController.updateAvailability.bind(candidatesController));
router.delete('/all', candidatesController.deleteAllCandidates.bind(candidatesController));
router.delete('/:id', candidatesController.deleteCandidate.bind(candidatesController));

module.exports = router;

