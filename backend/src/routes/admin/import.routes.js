/**
 * Admin Import Routes
 */
const express = require('express');
const multer = require('multer');
const importController = require('../../controllers/admin/import.controller');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/import-csv', upload.single('file'), importController.importCSV.bind(importController));
router.get('/sample-csv', importController.getSampleCSV.bind(importController));

module.exports = router;

