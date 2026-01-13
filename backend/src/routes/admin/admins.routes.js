/**
 * Admin Roles Routes
 */
const express = require('express');
const adminsController = require('../../controllers/admin/admins.controller');

const router = express.Router();

router.get('/', adminsController.getAllAdmins.bind(adminsController));
router.post('/', adminsController.addAdmin.bind(adminsController));
router.delete('/:id', adminsController.removeAdmin.bind(adminsController));

module.exports = router;

