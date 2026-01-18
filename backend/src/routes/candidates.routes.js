/**
 * Candidate Routes
 */
const express = require('express');
const candidatesController = require('../controllers/candidates.controller');

const router = express.Router();

router.get('/metadata/filters', candidatesController.getFilterMetadata.bind(candidatesController));
router.get('/', candidatesController.getCandidates.bind(candidatesController));
router.get('/:id', candidatesController.getCandidateById.bind(candidatesController));

module.exports = router;

