const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  company: z.string(),
  role: z.string(),
  linkedin: z.string().optional(),
  contact_number: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Consent must be true',
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateProfileSchema = z.object({
  full_name: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  linkedin: z.string().optional(),
  contact_number: z.string().optional(),
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

