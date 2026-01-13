/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */
const authService = require('../services/auth.service');
const {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} = require('../validators/auth.validator');

class AuthController {
  /**
   * POST /auth/signup
   * Register a new referrer
   */
  async signup(req, res, next) {
    try {
      const validatedData = signupSchema.parse(req.body);
      const result = await authService.signup(validatedData);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/login
   * Login referrer
   */
  async login(req, res, next) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(
        validatedData.email,
        validatedData.password
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/logout
   * Logout (no-op, handled client-side)
   */
  async logout(req, res) {
    res.json({ success: true });
  }

  /**
   * GET /auth/me
   * Get current referrer profile
   */
  async getProfile(req, res, next) {
    try {
      const referrer = await authService.getProfile(req.user.id);
      res.json(referrer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /auth/me
   * Update referrer profile
   */
  async updateProfile(req, res, next) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const referrer = await authService.updateProfile(
        req.user.id,
        validatedData
      );
      res.json(referrer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /auth/me/password
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(
        req.user.id,
        validatedData.current_password,
        validatedData.new_password
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/google
   * Google OAuth login/signup
   */
  async googleAuth(req, res, next) {
    try {
      const { google_id, email, name, image } = req.body;
      
      if (!google_id || !email) {
        return res.status(400).json({ error: 'Google ID and email are required' });
      }

      const result = await authService.googleAuth(google_id, email, name, image);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/otp/request
   * Request OTP for mobile number
   */
  async requestOTP(req, res, next) {
    try {
      const otpService = require('../services/otp.service');
      const { phone_number } = req.body;

      if (!phone_number) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }

      await otpService.sendOTP(phone_number);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/otp/verify
   * Verify OTP and login/signup
   */
  async verifyOTP(req, res, next) {
    try {
      const otpService = require('../services/otp.service');
      const { phone_number, otp } = req.body;

      if (!phone_number || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      // Verify OTP
      const verification = otpService.verifyOTP(phone_number, otp);
      
      if (!verification.valid) {
        return res.status(400).json({ error: verification.error });
      }

      // Authenticate user
      const result = await authService.mobileOTPAuth(phone_number);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

