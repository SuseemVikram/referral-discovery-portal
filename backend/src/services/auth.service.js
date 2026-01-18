/**
 * Authentication Service
 * Handles authentication business logic
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const referrerRepository = require('../repositories/referrer.repository');
const otpService = require('./otp.service');
const emailService = require('./email.service');
const { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } = require('../utils/errors');
const config = require('../config/env');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Sign up a new referrer
   */
  async signup(data) {
    const { email, password, ...otherData } = data;

    // Check if email already exists
    const existingReferrer = await referrerRepository.findByEmail(email);
    if (existingReferrer) {
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create referrer
    const referrer = await referrerRepository.create({
      email,
      password_hash,
      ...otherData,
    });

    // Generate JWT token
    const token = this.generateToken(referrer.id, referrer.email);

    return {
      token,
      referrer: {
        id: referrer.id,
        email: referrer.email,
      },
    };
  }

  /**
   * Login referrer
   */
  async login(email, password) {
    // Find referrer with password hash
    const referrer = await referrerRepository.findByEmail(email, true);

    if (!referrer) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, referrer.password_hash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(referrer.id, referrer.email);

    return {
      token,
      referrer: {
        id: referrer.id,
        email: referrer.email,
      },
    };
  }

  /**
   * Get referrer profile
   * Includes phone_is_primary: true when user signed up with mobile (no password, no Google) and has phone.
   */
  async getProfile(referrerId) {
    const referrer = await referrerRepository.findById(referrerId, { includeAuthFlags: true });
    const phone_is_primary = !!(
      referrer.phone_number &&
      !referrer.password_hash &&
      !referrer.google_id
    );
    return {
      id: referrer.id,
      email: referrer.email,
      full_name: referrer.full_name,
      company: referrer.company,
      role: referrer.role,
      linkedin: referrer.linkedin,
      phone_number: referrer.phone_number,
      phone_verified_at: referrer.phone_verified_at,
      is_admin: referrer.is_admin,
      createdAt: referrer.createdAt,
      phone_is_primary,
    };
  }

  /**
   * Update referrer profile
   */
  async updateProfile(referrerId, data) {
    // Handle phone_number: normalize if provided, or set to null if explicitly empty/undefined
    if (data.phone_number !== undefined) {
      const ref = await referrerRepository.findById(referrerId, { includeAuthFlags: true });
      if (data.phone_number && data.phone_number.trim()) {
        let normalizedPhone = data.phone_number.trim().replace(/\s+/g, '');
        
        // Normalize to E.164 format: ensure it starts with +
        if (!normalizedPhone.startsWith('+')) {
          // If it's a 10-digit number (likely Indian), add +91
          if (/^\d{10}$/.test(normalizedPhone)) {
            normalizedPhone = '+91' + normalizedPhone;
          } else {
            // For other formats, just prepend +
            normalizedPhone = '+' + normalizedPhone;
          }
        }
        
        // Only update if valid E.164 format
        if (/^\+[1-9]\d{1,14}$/.test(normalizedPhone)) {
          data.phone_number = normalizedPhone;
        } else {
          // Invalid format, remove it
          data.phone_number = null;
        }
      } else {
        // Trying to clear phone — block if it is the user's primary sign-in (mobile signup)
        const phone_is_primary = !!(ref.phone_number && !ref.password_hash && !ref.google_id);
        if (phone_is_primary) {
          throw new BadRequestError(
            'Phone number cannot be removed because it is your primary sign-in method. Add a password or link Google first.'
          );
        }
        data.phone_number = null;
      }

      // If the new number is already on another account: require OTP, then transfer it
      if (data.phone_number) {
        const other = await referrerRepository.findByPhoneNumber(data.phone_number);
        if (other && other.id !== referrerId) {
          if (data.phone_change_otp) {
            const v = await otpService.verifyOTP(data.phone_number, data.phone_change_otp);
            if (!v.valid) throw new BadRequestError(v.error || 'Invalid or expired OTP');
            delete data.phone_change_otp;
            data.phone_verified_at = new Date();
            await prisma.$transaction([
              prisma.referrer.update({
                where: { id: other.id },
                data: { phone_number: null, phone_verified_at: null },
              }),
              prisma.referrer.update({
                where: { id: referrerId },
                data,
              }),
            ]);
            emailService.sendPhoneReassignedEmail(
              other.email,
              other.full_name || 'User',
              data.phone_number
            ).catch(() => {});
            return this.getProfile(referrerId);
          }
          await otpService.sendOTP(data.phone_number);
          const { phone_number, phone_change_otp, ...rest } = data;
          if (Object.keys(rest).length > 0) {
            await referrerRepository.update(referrerId, rest);
          }
          return {
            needs_phone_otp: true,
            pending_phone: data.phone_number,
            message: 'This number is on another account. An OTP was sent. Enter it and save again to transfer it to your account.',
          };
        }
      }

      // Clear verification when phone number changes (normal case)
      if (data.phone_number !== ref.phone_number) {
        data.phone_verified_at = null;
      }
    }

    delete data.phone_change_otp;
    return referrerRepository.update(referrerId, data);
  }

  /**
   * Change password
   */
  async changePassword(referrerId, currentPassword, newPassword) {
    // Get referrer with password hash
    const referrer = await referrerRepository.findById(referrerId, true);

    // Check if user has a password (OAuth/OTP users might not have one)
    if (!referrer.password_hash) {
      throw new UnauthorizedError('No password set. Please set a password first.');
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, referrer.password_hash);

    if (!passwordMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await referrerRepository.updatePassword(referrerId, newPasswordHash);

    return { success: true, message: 'Password updated successfully' };
  }

  /**
   * Generate JWT token
   */
  generateToken(id, email) {
    return jwt.sign(
      { id, email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Google OAuth login/signup
   */
  async googleAuth(googleId, email, name, image) {
    // Check if user exists by google_id
    let referrer = await referrerRepository.findByGoogleId(googleId);
    
    if (!referrer) {
      // Check if email exists (user might have signed up with email/password)
      referrer = await referrerRepository.findByEmail(email);
      
      if (referrer) {
        // Link Google account to existing account
        referrer = await referrerRepository.update(referrer.id, {
          google_id: googleId,
        });
      } else {
        // Create new referrer with Google OAuth
        referrer = await referrerRepository.create({
          email,
          google_id: googleId,
          full_name: name || null,
          // Other fields will be filled in account page
          company: null,
          role: null,
          password_hash: null, // No password for OAuth users
        });
      }
    }

    // Generate JWT token
    const token = this.generateToken(referrer.id, referrer.email);

    return {
      token,
      referrer: {
        id: referrer.id,
        email: referrer.email,
      },
    };
  }

  /**
   * Send OTP to the current user's phone for re-verification.
   * User must be logged in and have a phone number.
   */
  async sendVerifyPhoneOtp(referrerId) {
    const referrer = await referrerRepository.findById(referrerId);
    if (!referrer.phone_number || !referrer.phone_number.trim()) {
      throw new BadRequestError('No phone number on your account.');
    }
    await otpService.sendOTP(referrer.phone_number);
    return { success: true, message: 'OTP sent to your phone' };
  }

  /**
   * Verify OTP for the current user's phone (re-verification flow).
   * Sets phone_verified_at on success.
   */
  async verifyPhoneOtp(referrerId, otp) {
    const referrer = await referrerRepository.findById(referrerId);
    if (!referrer.phone_number || !referrer.phone_number.trim()) {
      throw new BadRequestError('No phone number on your account.');
    }
    const result = await otpService.verifyOTP(referrer.phone_number, otp);
    if (!result.valid) {
      throw new BadRequestError(result.error || 'Invalid or expired OTP');
    }
    await referrerRepository.update(referrerId, { phone_verified_at: new Date() });
    return { success: true, message: 'Phone number verified' };
  }

  /**
   * Mobile OTP login/signup
   */
  async mobileOTPAuth(phoneNumber, signupData = null) {
    // Check if user exists by phone_number
    let referrer = await referrerRepository.findByPhoneNumber(phoneNumber);
    
    if (!referrer) {
      // If signupData is provided, create user with all details (mobile signup)
      if (signupData) {
        const { email, full_name, company, role, linkedin } = signupData;
        
        // Validate required fields for mobile signup
        if (!email || !full_name || !company || !role || !linkedin) {
          throw new Error('All fields (email, name, company, role, LinkedIn) are required for mobile signup');
        }

        // Check if email already exists
        const existingReferrer = await referrerRepository.findByEmail(email);
        if (existingReferrer) {
          throw new ConflictError('Email already exists');
        }

        referrer = await referrerRepository.create({
          email,
          phone_number: phoneNumber,
          full_name,
          company,
          role,
          linkedin,
          password_hash: null, // No password for OTP users
        });
      } else {
        // No signup data - user needs to signup
        return { needsSignup: true, phoneNumber };
      }
    }

    // Generate JWT token
    const token = this.generateToken(referrer.id, referrer.email);

    return {
      token,
      referrer: {
        id: referrer.id,
        email: referrer.email,
      },
      needsSignup: false,
    };
  }
}

module.exports = new AuthService();

