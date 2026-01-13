/**
 * Candidates Controller
 * Handles HTTP requests for candidate endpoints
 */
const candidateService = require('../services/candidate.service');
const { ValidationError } = require('../utils/errors');
const { candidateFiltersSchema } = require('../validators/candidate.validator');
const cache = require('../lib/redis-cache');

class CandidatesController {
  /**
   * GET /api/candidates
   * Get candidates with filters and pagination
   */
  async getCandidates(req, res, next) {
    try {
      // Validate query parameters
      const validated = candidateFiltersSchema.parse(req.query);

      const filters = {
        roles: validated.roles,
        skills: validated.skills,
        location: validated.location,
        remote_ok: validated.remote_ok,
        availability_status: validated.availability_status,
      };

      const pagination = {
        page: Math.max(1, parseInt(validated.page || '1', 10) || 1),
        limit: Math.min(50, Math.max(1, parseInt(validated.limit || '12', 10) || 12)),
      };

      // Check cache
      const cacheKey = cache.generateKey('candidates', { filters, pagination });
      const cached = await cache.get(cacheKey);
      
      if (cached) {
        // Set cache headers
        res.set('Cache-Control', 'public, max-age=30');
        return res.json(cached);
      }

      const startTime = Date.now();
      const result = await candidateService.getCandidates(filters, pagination);
      const queryTime = Date.now() - startTime;

      // Log slow queries (> 500ms) in development or if very slow (> 1000ms)
      if (queryTime > 1000 || (process.env.NODE_ENV === 'development' && queryTime > 500)) {
        console.warn(`Slow query detected: ${queryTime}ms`, { filters, pagination });
      }

      // Cache for 60 seconds (increased for better performance)
      await cache.set(cacheKey, result, 60);

      // Set cache and performance headers
      res.set('Cache-Control', 'public, max-age=30');
      res.set('X-Query-Time', `${queryTime}ms`);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/candidates/:id
   * Get single candidate by ID
   */
  async getCandidateById(req, res, next) {
    try {
      const { id } = req.params;
      const candidate = await candidateService.getCandidateById(id);
      res.json(candidate);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CandidatesController();

