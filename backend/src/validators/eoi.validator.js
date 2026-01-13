const { z } = require('zod');

const eoiSchema = z.object({
  candidate_ids: z.array(z.string()).min(1),
  filter_roles: z.array(z.string()).optional(),
  filter_skills: z.array(z.string()).optional(),
});

module.exports = {
  eoiSchema,
};

