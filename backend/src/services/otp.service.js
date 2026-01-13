/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */
const crypto = require('crypto');
const logger = require('../utils/logger');

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map();

// OTP configuration
const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

class OTPService {
  /**
   * Generate a random OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Store OTP with expiry
   */
  storeOTP(phoneNumber, otp) {
    const expiry = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
    otpStore.set(phoneNumber, {
      otp,
      expiry,
      attempts: 0,
    });
    
    // Clean up expired OTPs
    setTimeout(() => {
      if (otpStore.has(phoneNumber)) {
        const stored = otpStore.get(phoneNumber);
        if (stored.expiry < Date.now()) {
          otpStore.delete(phoneNumber);
        }
      }
    }, OTP_EXPIRY_MINUTES * 60 * 1000);
  }

  /**
   * Verify OTP
   */
  verifyOTP(phoneNumber, otp) {
    const stored = otpStore.get(phoneNumber);
    
    if (!stored) {
      return { valid: false, error: 'OTP not found or expired' };
    }

    if (stored.expiry < Date.now()) {
      otpStore.delete(phoneNumber);
      return { valid: false, error: 'OTP expired' };
    }

    if (stored.attempts >= 5) {
      return { valid: false, error: 'Too many attempts. Please request a new OTP' };
    }

    stored.attempts++;

    if (stored.otp !== otp) {
      return { valid: false, error: 'Invalid OTP' };
    }

    // OTP verified, remove it
    otpStore.delete(phoneNumber);
    return { valid: true };
  }

  /**
   * Send OTP via SMS (placeholder - integrate with Twilio or other provider)
   */
  async sendOTP(phoneNumber) {
    const otp = this.generateOTP();
    this.storeOTP(phoneNumber, otp);

    // NOTE: SMS integration pending - currently logging OTP for development/testing
    // In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
    // Only log OTP in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.info(`OTP for ${phoneNumber}: ${otp}`);
    }
    
    // Placeholder: In production, use Twilio or another SMS service
    // Example with Twilio:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: `Your OTP is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });

    return { success: true, message: 'OTP sent successfully' };
  }

  /**
   * Check if OTP exists for phone number
   */
  hasOTP(phoneNumber) {
    const stored = otpStore.get(phoneNumber);
    return stored && stored.expiry > Date.now();
  }
}

module.exports = new OTPService();

