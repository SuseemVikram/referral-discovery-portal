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
   * POST /auth/me/send-verify-phone-otp
   * Send OTP to current user's phone for re-verification
   */
  async sendVerifyPhoneOtp(req, res, next) {
    try {
      const result = await authService.sendVerifyPhoneOtp(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /auth/me/verify-phone-otp
   * Verify OTP for current user's phone (re-verification)
   */
  async verifyPhoneOtp(req, res, next) {
    try {
      const { otp } = req.body;
      if (!otp || typeof otp !== 'string' || !otp.trim()) {
        return res.status(400).json({ error: 'OTP is required' });
      }
      const result = await authService.verifyPhoneOtp(req.user.id, otp.trim());
      res.json(result);
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
   * Checks if phone exists first - if new user, returns needsSignup flag
   */
  async requestOTP(req, res, next) {
    try {
      const otpService = require('../services/otp.service');
      const referrerRepository = require('../repositories/referrer.repository');
      let { phone_number, check_only, for_signup } = req.body;

      if (!phone_number) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      // Normalize phone number: remove spaces, ensure E.164 format
      phone_number = phone_number.trim().replace(/\s+/g, '');
      
      // Ensure it starts with + (required for Twilio E.164 format)
      if (!phone_number.startsWith('+')) {
        return res.status(400).json({ 
          error: 'Phone number must include country code. Format: +[country code][number] (e.g., +911234567890)' 
        });
      }

      // Validate phone number format (E.164: + followed by 1-15 digits)
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone_number)) {
        return res.status(400).json({ 
          error: 'Invalid phone number format. Use E.164 format: +[country code][number] (e.g., +911234567890)' 
        });
      }

      // If check_only flag, just return whether phone exists (without sending OTP)
      if (check_only) {
        const existingReferrer = await referrerRepository.findByPhoneNumber(phone_number);
        return res.json({ 
          exists: !!existingReferrer,
          needsSignup: !existingReferrer 
        });
      }

      // For signup flow: allow sending OTP only if phone does NOT already have an account
      if (for_signup) {
        const existingReferrer = await referrerRepository.findByPhoneNumber(phone_number);
        if (existingReferrer) {
          return res.status(409).json({
            error: 'This number is already registered. Please sign in instead.',
            alreadyRegistered: true,
          });
        }
        await otpService.sendOTP(phone_number);
        return res.json({ success: true, message: 'OTP sent successfully' });
      }

      // For login flow: check if phone exists before sending OTP
      const existingReferrer = await referrerRepository.findByPhoneNumber(phone_number);
      
      // If phone not found and this is for login, return needsSignup flag (don't send OTP)
      if (!existingReferrer) {
        return res.status(404).json({ 
          needsSignup: true,
          phoneNumber: phone_number,
          message: 'Phone number not registered. Please sign up first.' 
        });
      }

      // Phone exists - send OTP for login
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
      let { phone_number, otp, signup_data } = req.body;

      if (!phone_number || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
      }

      // Normalize phone number: remove spaces
      phone_number = phone_number.trim().replace(/\s+/g, '');

      // Verify OTP (now async with Twilio)
      const verification = await otpService.verifyOTP(phone_number, otp);
      
      if (!verification.valid) {
        return res.status(400).json({ error: verification.error });
      }

      // Authenticate user (with signup data if provided)
      const result = await authService.mobileOTPAuth(phone_number, signup_data);
      
      // If needs signup, return 404-like status to indicate redirect needed
      if (result.needsSignup) {
        return res.status(404).json({ 
          needsSignup: true, 
          phoneNumber: result.phoneNumber,
          message: 'Phone number not found. Please sign up.' 
        });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

