/**
 * Environment variable validation and configuration
 */
require('dotenv').config();

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
];

// FRONTEND_URL is required in production for CORS
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL environment variable is required in production');
}

const optionalEnvVars = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  EOI_DAILY_LIMIT: '20',
  NODE_ENV: 'development',
};

// Validate required environment variables
function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Set optional defaults
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
    }
  });
}

// Validate on module load
validateEnv();

// Extract email from FROM_EMAIL if it's in format "Name <email@example.com>"
function extractEmail(emailString) {
  if (!emailString) return emailString;
  // Match email in format "Name <email@example.com>" or just "email@example.com"
  const emailMatch = emailString.match(/<(.+?)>|(.+@.+\..+)/);
  return emailMatch ? (emailMatch[1] || emailMatch[2]) : emailString;
}

// Warn if FROM_EMAIL doesn't match SMTP_USER (required for Gmail)
const smtpUser = process.env.SMTP_USER;
const fromEmailRaw = process.env.FROM_EMAIL || smtpUser;

// Extract the email part for comparison with SMTP_USER
const fromEmail = extractEmail(fromEmailRaw);

// Use the full FROM_EMAIL (with display name if present) for nodemailer
// But ensure the email part matches SMTP_USER for Gmail compatibility
const fromEmailForNodemailer = fromEmailRaw;

if (smtpUser && fromEmail && smtpUser !== fromEmail) {
  console.warn(`[SMTP] WARNING: FROM_EMAIL email part (${fromEmail}) does not match SMTP_USER (${smtpUser}). Gmail requires them to match.`);
}

module.exports = {
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: fromEmailForNodemailer, // Use full FROM_EMAIL (can include display name)
    admin: process.env.ADMIN_EMAIL,
  },
  app: {
    env: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 4000,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  eoi: {
    dailyLimit: Number(process.env.EOI_DAILY_LIMIT) || 20,
  },
};

