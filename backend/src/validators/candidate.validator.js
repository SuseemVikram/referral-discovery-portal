const { z } = require('zod');

// For candidate filtering (public API)
const candidateFiltersSchema = z.object({
  roles: z.string().optional(),
  skills: z.string().optional(),
  location: z.string().optional(),
  remote_ok: z.string().optional(),
  availability_status: z.enum(['Open', 'Paused']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

module.exports = {
  candidateFiltersSchema,
};

