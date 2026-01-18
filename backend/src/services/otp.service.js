/**
 * OTP Service
 * Handles OTP generation, storage, and verification using Twilio Verify Service
 */
const twilio = require('twilio');
const logger = require('../utils/logger');
const config = require('../config/env');

let twilioClient = null;

if (config.twilio.accountSid && config.twilio.authToken) {
  twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
}

class OTPService {
  /**
   * Send OTP via SMS using Twilio Verify Service
   */
  async sendOTP(phoneNumber) {
    if (!twilioClient) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Twilio not configured. OTP will be logged to console only.');
        logger.info(`[DEV MODE] OTP for ${phoneNumber}: 123456`);
        return { success: true, message: 'OTP sent successfully (dev mode)' };
      }
      throw new Error('Twilio is not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
    }

    if (!config.twilio.verifyServiceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID is required');
    }

    try {
      const verification = await twilioClient.verify.v2
        .services(config.twilio.verifyServiceSid)
        .verifications
        .create({
          to: phoneNumber,
          channel: 'sms',
        });

      logger.info(`OTP verification sent to ${phoneNumber}. Status: ${verification.status}`);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      logger.error(`Failed to send OTP to ${phoneNumber}:`, error.message);
      
      if (error.code === 60200) {
        throw new Error('Invalid phone number format');
      } else if (error.code === 60203) {
        throw new Error('Maximum number of attempts reached. Please try again later.');
      } else if (error.code === 20429) {
        throw new Error('Too many requests. Please try again later.');
      }
      
      throw new Error(`Failed to send OTP: ${error.message}`);
    }
  }

  /**
   * Verify OTP using Twilio Verify Service
   */
  async verifyOTP(phoneNumber, otp) {
    if (!twilioClient) {
      if (process.env.NODE_ENV === 'development') {
        if (otp === '123456') {
          logger.info(`[DEV MODE] OTP verified for ${phoneNumber}`);
          return { valid: true };
        }
        return { valid: false, error: 'Invalid OTP' };
      }
      throw new Error('Twilio is not configured');
    }

    if (!config.twilio.verifyServiceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID is required');
    }

    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(config.twilio.verifyServiceSid)
        .verificationChecks
        .create({
          to: phoneNumber,
          code: otp,
        });

      if (verificationCheck.status === 'approved') {
        logger.info(`OTP verified successfully for ${phoneNumber}`);
        return { valid: true };
      } else {
        logger.warn(`OTP verification failed for ${phoneNumber}. Status: ${verificationCheck.status}`);
        return { valid: false, error: 'Invalid or expired OTP' };
      }
    } catch (error) {
      logger.error(`Failed to verify OTP for ${phoneNumber}:`, error.message);
      
      if (error.code === 20404) {
        return { valid: false, error: 'OTP not found or expired. Please request a new OTP.' };
      } else if (error.code === 60202) {
        return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
      }
      
      return { valid: false, error: `Verification failed: ${error.message}` };
    }
  }

  /**
   * Check if OTP exists for phone number (not applicable with Twilio Verify)
   * Kept for backward compatibility
   */
  hasOTP(phoneNumber) {
    return true;
  }
}

module.exports = new OTPService();

