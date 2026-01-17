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
    // Add connection timeout to prevent hanging
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
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
    // Use a timeout for verification to prevent hanging
    const verifyPromise = emailTransporter.verify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SMTP verification timeout after 10 seconds')), 10000);
    });
    
    await Promise.race([verifyPromise, timeoutPromise]);
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
    
    // Log helpful message for common issues
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      logger.error('[SMTP] Connection timeout - This may indicate:');
      logger.error('[SMTP] 1. Railway blocking outbound SMTP connections (port 587)');
      logger.error('[SMTP] 2. Gmail blocking Railway IP addresses');
      logger.error('[SMTP] 3. Network/firewall issues');
      logger.error('[SMTP] 4. Incorrect SMTP_HOST or SMTP_PORT');
      logger.error('[SMTP] Emails may still work - verification is just a connectivity test');
    }
    
    return verificationStatus;
  }
}

module.exports = {
  getTransporter,
  verifyTransporter,
};

