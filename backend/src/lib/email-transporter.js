/**
 * Email Transporter Setup
 * Separated from email service for better organization
 */
const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;
let verificationStatus = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const smtpConfig = {
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  };

  if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
    // Use logger.error so it's always visible in production
    logger.error('SMTP credentials not configured. Email sending is disabled.');
    logger.error(`SMTP_USER: ${smtpConfig.auth.user ? 'SET' : 'MISSING'}, SMTP_PASS: ${smtpConfig.auth.pass ? 'SET' : 'MISSING'}`);
    return null;
  }

  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
}

/**
 * Verify SMTP connection
 * Call this on startup to ensure email is configured correctly
 */
async function verifyTransporter() {
  if (verificationStatus !== null) {
    return verificationStatus;
  }

  const emailTransporter = getTransporter();
  
  if (!emailTransporter) {
    verificationStatus = { success: false, error: 'SMTP credentials not configured' };
    logger.error('[SMTP] Verification failed: SMTP credentials not configured');
    return verificationStatus;
  }

  try {
    await emailTransporter.verify();
    verificationStatus = { success: true };
    logger.error('[SMTP] Verification successful - Email service is ready');
    return verificationStatus;
  } catch (error) {
    verificationStatus = { success: false, error: error.message };
    logger.error('[SMTP] Verification failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    return verificationStatus;
  }
}

module.exports = {
  getTransporter,
  verifyTransporter,
};

