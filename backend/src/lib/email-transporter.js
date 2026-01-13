/**
 * Email Transporter Setup
 * Separated from email service for better organization
 */
const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

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
    console.warn('SMTP credentials not configured. Email sending will be disabled.');
    return null;
  }

  transporter = nodemailer.createTransport(smtpConfig);
  return transporter;
}

module.exports = {
  getTransporter,
};

