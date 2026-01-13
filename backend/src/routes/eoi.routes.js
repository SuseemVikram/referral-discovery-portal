/**
 * EOI Routes
 */
const express = require('express');
const eoiController = require('../controllers/eoi.controller');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, eoiController.sendEOI.bind(eoiController));

module.exports = router;

