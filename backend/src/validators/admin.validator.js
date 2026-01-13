const { z } = require('zod');

const visibilitySchema = z.object({
  is_active: z.boolean(),
});

const availabilitySchema = z.object({
  availability_status: z.enum(['Open', 'Paused']),
});

const adminToggleSchema = z.object({
  is_admin: z.boolean(),
});

const addAdminSchema = z.object({
  email: z.string().email(),
});

const analyticsQuerySchema = z.object({
  days: z.string().optional(),
});

module.exports = {
  visibilitySchema,
  availabilitySchema,
  adminToggleSchema,
  addAdminSchema,
  analyticsQuerySchema,
};

