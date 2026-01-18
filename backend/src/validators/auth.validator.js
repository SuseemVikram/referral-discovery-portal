const { z } = require('zod');

const { MAX_LENGTHS } = require('../utils/validation-constants');

const signupSchema = z.object({
  email: z.string().email().max(MAX_LENGTHS.EMAIL),
  password: z.string().min(6).max(200),
  full_name: z.string().max(MAX_LENGTHS.FULL_NAME),
  company: z.string().max(MAX_LENGTHS.COMPANY),
  role: z.string().max(MAX_LENGTHS.ROLE),
  linkedin: z.string().max(MAX_LENGTHS.LINKEDIN).optional(),
  phone_number: z.string().max(MAX_LENGTHS.CONTACT_NUMBER).optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent must be true',
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  full_name: z.string().max(MAX_LENGTHS.FULL_NAME).optional(),
  company: z.string().max(MAX_LENGTHS.COMPANY).optional(),
  role: z.string().max(MAX_LENGTHS.ROLE).optional(),
  linkedin: z.string().max(MAX_LENGTHS.LINKEDIN).optional(),
  phone_number: z.string().max(MAX_LENGTHS.CONTACT_NUMBER).optional(),
  /** Required to take a number already on another account; sent after OTP verification. */
  phone_change_otp: z.string().min(4).max(8).optional(),
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, { message: 'Current password is required' }),
  new_password: z.string().min(6, { message: 'New password must be at least 6 characters' }),
});

module.exports = {
  signupSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
};

