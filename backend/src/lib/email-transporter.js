/**
 * Email Transporter Setup
 * Supports both SMTP (via nodemailer) and SendGrid API
 * SendGrid API is preferred on Railway (works via HTTPS port 443)
 */
const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;
let verificationStatus = null;
let emailProvider = null; // 'sendgrid' or 'smtp'

/**
 * Create SendGrid API adapter (compatible with nodemailer sendMail interface)
 */
function createSendGridAdapter() {
  let sgMail;
  try {
    sgMail = require('@sendgrid/mail');
  } catch (error) {
    logger.error('[SendGrid] @sendgrid/mail package not installed. Run: npm install @sendgrid/mail');
    return null;
  }

  const sendGridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendGridApiKey) {
    logger.error('[SendGrid] SENDGRID_API_KEY environment variable not set');
    return null;
  }

  sgMail.setApiKey(sendGridApiKey);

  // Return adapter object with sendMail method compatible with nodemailer
  return {
    sendMail: async (mailOptions) => {
      const msg = {
        to: mailOptions.to,
        from: mailOptions.from || config.email.from,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      };

      try {
        const result = await sgMail.send(msg);
        
        // Check for errors in response
        if (result[0]?.statusCode !== 202) {
          const errorBody = result[0]?.body || {};
          const errorMessages = errorBody.errors?.map((e) => e.message).join(', ') || errorBody.message || 'Unknown SendGrid error';
          const error = new Error(`SendGrid API error: ${errorMessages} (Status: ${result[0]?.statusCode})`);
          error.code = result[0]?.statusCode;
          error.response = {
            body: errorBody,
            headers: result[0]?.headers,
          };
          throw error;
        }
        
        // Return format compatible with nodemailer response
        return {
          messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
          response: '250 Message accepted',
          accepted: [msg.to].flat(),
          rejected: [],
          pending: [],
        };
      } catch (error) {
        // Re-throw SendGrid errors with full details
        if (error.response) {
          const errorBody = error.response.body || {};
          const errorMessages = errorBody.errors?.map((e) => `${e.message}${e.field ? ` (field: ${e.field})` : ''}`).join(', ') || error.message;
          const detailedError = new Error(`SendGrid API error: ${errorMessages}`);
          detailedError.code = error.code || error.response?.statusCode || 500;
          detailedError.response = {
            body: errorBody,
            headers: error.response.headers,
          };
          throw detailedError;
        }
        throw error;
      }
      
      // Return format compatible with nodemailer response
      return {
        messageId: result[0]?.headers?.['x-message-id'] || 'unknown',
        response: '250 Message accepted',
        accepted: [msg.to].flat(),
        rejected: [],
        pending: [],
      };
    },
    verify: async () => {
      // SendGrid API doesn't need verification - just test the API key
      try {
        // Try to get API key info (this validates the key)
        // Note: SendGrid doesn't have a simple verification endpoint
        // So we'll just return success if API key is set
        return true;
      } catch (error) {
        throw new Error(`SendGrid API key validation failed: ${error.message}`);
      }
    },
  };
}

/**
 * Create SMTP transporter (nodemailer)
 */
function createSMTPTransporter() {
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
    logger.error('SMTP credentials not configured. Email sending is disabled.');
    logger.error(`SMTP_USER: ${smtpConfig.auth.user ? 'SET' : 'MISSING'}, SMTP_PASS: ${smtpConfig.auth.pass ? 'SET' : 'MISSING'}`);
    return null;
  }

  return nodemailer.createTransport(smtpConfig);
}

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Priority: SendGrid API > SMTP
  // Check for SendGrid API key first (works better on Railway)
  if (process.env.SENDGRID_API_KEY) {
    logger.info('[Email] Using SendGrid API (via HTTPS)');
    emailProvider = 'sendgrid';
    transporter = createSendGridAdapter();
    if (transporter) {
      return transporter;
    }
    // Fall through to SMTP if SendGrid adapter creation fails
    logger.warn('[Email] SendGrid API setup failed, falling back to SMTP');
  }

  // Use SMTP (nodemailer)
  logger.info('[Email] Using SMTP');
  emailProvider = 'smtp';
  transporter = createSMTPTransporter();
  return transporter;
}

/**
 * Verify email transporter connection
 * Call this on startup to ensure email is configured correctly
 * Skips verification for SendGrid API (uses HTTPS, doesn't need SMTP verification)
 */
async function verifyTransporter() {
  if (verificationStatus !== null) {
    return verificationStatus;
  }

  const emailTransporter = getTransporter();
  
  if (!emailTransporter) {
    verificationStatus = { success: false, error: 'Email credentials not configured' };
    logger.error('[Email] Verification failed: Email credentials not configured');
    if (!process.env.SENDGRID_API_KEY && (!config.email.user || !config.email.pass)) {
      logger.error('[Email] Set either SENDGRID_API_KEY (recommended) or SMTP_USER/SMTP_PASS');
    }
    return verificationStatus;
  }

  // SendGrid API doesn't need SMTP verification (uses HTTPS)
  if (emailProvider === 'sendgrid') {
    verificationStatus = { success: true };
    logger.info('[Email] SendGrid API configured (no SMTP verification needed)');
    return verificationStatus;
  }

  // Verify SMTP connection
  try {
    // Use a timeout for verification to prevent hanging
    const verifyPromise = emailTransporter.verify();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('SMTP verification timeout after 10 seconds')), 10000);
    });
    
    await Promise.race([verifyPromise, timeoutPromise]);
    verificationStatus = { success: true };
    // Don't log here - let the caller log (allows for warning vs info level)
    return verificationStatus;
  } catch (error) {
    verificationStatus = { success: false, error: error.message };
    logger.error('[Email] SMTP verification failed:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    // Log helpful message for common issues
    if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
      const smtpHost = config.email.host || 'smtp.gmail.com';
      const smtpPort = config.email.port || 587;
      const isSendGrid = smtpHost.includes('sendgrid');
      
      logger.error('[Email] SMTP connection timeout - This may indicate:');
      logger.error('[Email] 1. Railway blocking outbound SMTP connections (ports 587/2525)');
      logger.error('[Email] 2. Solution: Use SendGrid API instead of SMTP');
      logger.error('[Email]    Set SENDGRID_API_KEY in Railway (uses HTTPS port 443, not blocked)');
      logger.error('[Email]    See RAILWAY_EMAIL_API_FIX.md for details');
      if (isSendGrid) {
        logger.error('[Email]    Or try SendGrid port 2525: Set SMTP_PORT=2525');
      }
      logger.error('[Email] 3. Network/firewall issues');
      logger.error('[Email] 4. Incorrect SMTP_HOST or SMTP_PORT');
      logger.error(`[Email]    Current: ${smtpHost}:${smtpPort}`);
      logger.error('[Email] Note: Emails may still work - verification is just a connectivity test');
    }
    
    return verificationStatus;
  }
}

module.exports = {
  getTransporter,
  verifyTransporter,
};

