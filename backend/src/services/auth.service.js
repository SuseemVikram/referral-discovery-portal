/**
 * Authentication Service
 * Handles authentication business logic
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const referrerRepository = require('../repositories/referrer.repository');
const { ConflictError, UnauthorizedError, NotFoundError } = require('../utils/errors');
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
   */
  async getProfile(referrerId) {
    return referrerRepository.findById(referrerId);
  }

  /**
   * Update referrer profile
   */
  async updateProfile(referrerId, data) {
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
   * Mobile OTP login/signup
   */
  async mobileOTPAuth(phoneNumber, signupData = null) {
    // Check if user exists by phone_number
    let referrer = await referrerRepository.findByPhoneNumber(phoneNumber);
    
    if (!referrer) {
      // If signupData is provided, create user with all details (mobile signup)
      if (signupData) {
        const { email, full_name, company, role, linkedin, contact_number } = signupData;
        
        // Validate required fields for mobile signup
        if (!email || !full_name || !company || !role || !linkedin || !contact_number) {
          throw new Error('All fields (email, name, company, role, LinkedIn, contact number) are required for mobile signup');
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
          contact_number,
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

