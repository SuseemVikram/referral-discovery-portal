/**
 * Auth Routes
 */
const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/google', authController.googleAuth.bind(authController));
router.post('/otp/request', authController.requestOTP.bind(authController));
router.post('/otp/verify', authController.verifyOTP.bind(authController));
router.post('/me/send-verify-phone-otp', authenticateToken, authController.sendVerifyPhoneOtp.bind(authController));
router.post('/me/verify-phone-otp', authenticateToken, authController.verifyPhoneOtp.bind(authController));
router.get('/me', authenticateToken, authController.getProfile.bind(authController));
router.put('/me', authenticateToken, authController.updateProfile.bind(authController));
router.put('/me/password', authenticateToken, authController.changePassword.bind(authController));

module.exports = router;

