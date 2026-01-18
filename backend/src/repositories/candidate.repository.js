const prisma = require('../lib/prisma');
const { NotFoundError } = require('../utils/errors');
const { sanitizeQueryParam, sanitizeStringArray, sanitizeString } = require('../utils/sanitize');

class CandidateRepository {
  /**
   * Find candidate by ID (public fields only)
   */
  async findById(id) {
    const candidate = await prisma.candidate.findFirst({
      where: {
        id,
        is_active: true,
      },
      select: {
        id: true,
        first_name: true,
        last_name_initial: true,
        target_roles: true,
        primary_skills: true,
        location: true,
        remote_ok: true,
        availability_status: true,
        short_profile: true,
        projects: true,
        cohort: true,
      },
    });

    if (!candidate) {
      throw new NotFoundError('Candidate');
    }

    return candidate;
  }

  /**
   * Find many candidates with filters and pagination
   */
  async findMany(filters = {}, pagination = {}) {
    const {
      roles,
      skills,
      location,
      remote_ok,
      availability_status,
    } = filters;

    const { page = 1, limit = 12 } = pagination;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50); // Max 50 per page

    const where = {
      is_active: true,
    };

    if (availability_status) {
      where.availability_status = availability_status;
    }

    if (roles) {
      const rolesArray = roles.split(',').map((r) => sanitizeString(r.trim())).filter(Boolean);
      if (rolesArray.length > 0) {
        where.target_roles = { hasSome: rolesArray };
      }
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => sanitizeString(s.trim())).filter(Boolean);
      if (skillsArray.length > 0) {
        where.primary_skills = { hasSome: skillsArray };
      }
    }

    if (location) {
      const sanitizedLocation = sanitizeQueryParam(location);
      if (sanitizedLocation) {
        where.location = {
          contains: sanitizedLocation,
          mode: 'insensitive',
        };
      }
    }

    if (remote_ok !== undefined) {
      where.remote_ok = remote_ok === 'true';
    }

    // Optimize: Only count if needed, use cursor-based pagination for better performance
    // Optimize: Fetch candidates first, only count if we got results
    const candidates = await prisma.candidate.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        first_name: true,
        last_name_initial: true,
        target_roles: true,
        primary_skills: true,
        location: true,
        remote_ok: true,
        cohort: true,
        short_profile: true,
        projects: true, // Keep projects but we'll optimize it separately
        availability_status: true,
      },
    });

    // Only count if needed for pagination (on first page or when we have results)
    let totalCount = 0;
    if (page === 1 || candidates.length === take) {
      // Use optimized count - only count active candidates
      totalCount = await prisma.candidate.count({ where });
    } else {
      // Estimate count for subsequent pages
      totalCount = (page - 1) * take + candidates.length;
    }

    return {
      candidates,
      pagination: {
        page,
        limit: take,
        total: totalCount,
        totalPages: Math.ceil(totalCount / take),
        hasMore: page * take < totalCount,
      },
    };
  }

  /**
   * Find candidates by IDs (for EOI - includes email)
   */
  async findByIdsForEOI(ids) {
    return prisma.candidate.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        candidate_email: true,
        first_name: true,
        last_name_initial: true,
        target_roles: true,
        primary_skills: true,
      },
    });
  }

  /**
   * Find all candidates (admin - includes email)
   */
  async findAll(filters = {}) {
    const { email, roles, skills } = filters;
    const where = {};

    // Sanitize email query parameter
    if (email && typeof email === 'string' && email.trim()) {
      const sanitizedEmail = sanitizeQueryParam(email);
      if (sanitizedEmail) {
        where.candidate_email = {
          contains: sanitizedEmail,
          mode: 'insensitive',
        };
      }
    }

    // Sanitize roles query parameter
    if (roles && typeof roles === 'string' && roles.trim()) {
      const sanitizedRoles = sanitizeQueryParam(roles);
      if (sanitizedRoles) {
        const roleList = sanitizedRoles.split(',').map((r) => r.trim()).filter(Boolean);
        const sanitizedRoleList = sanitizeStringArray(roleList);
        if (sanitizedRoleList.length > 0) {
          where.target_roles = { hasSome: sanitizedRoleList };
        }
      }
    }

    // Sanitize skills query parameter
    if (skills && typeof skills === 'string' && skills.trim()) {
      const sanitizedSkills = sanitizeQueryParam(skills);
      if (sanitizedSkills) {
        const skillList = sanitizedSkills.split(',').map((s) => s.trim()).filter(Boolean);
        const sanitizedSkillList = sanitizeStringArray(skillList);
        if (sanitizedSkillList.length > 0) {
          where.primary_skills = { hasSome: sanitizedSkillList };
        }
      }
    }

    return prisma.candidate.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        first_name: true,
        last_name_initial: true,
        candidate_email: true,
        target_roles: true,
        primary_skills: true,
        availability_status: true,
        is_active: true,
      },
    });
  }

  /**
   * Update candidate visibility
   */
  async updateVisibility(id, isActive) {
    return prisma.candidate.update({
      where: { id },
      data: { is_active: isActive },
      select: {
        id: true,
        is_active: true,
      },
    });
  }

  /**
   * Update candidate availability
   */
  async updateAvailability(id, availabilityStatus) {
    return prisma.candidate.update({
      where: { id },
      data: { availability_status: availabilityStatus },
      select: {
        id: true,
        availability_status: true,
      },
    });
  }

  /**
   * Delete candidate
   */
  async delete(id) {
    // Prisma will handle cascade delete of EOI logs
    return prisma.candidate.delete({
      where: { id },
      select: {
        id: true,
        first_name: true,
        last_name_initial: true,
      },
    });
  }

  /**
   * Create or update candidate (for CSV import)
   */
  async upsert(candidateData) {
    const { id, ...data } = candidateData;
    
    return prisma.candidate.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  /**
   * Count candidates
   */
  async count(where = {}) {
    return prisma.candidate.count({ where });
  }

  /**
   * Delete all candidates
   */
  async deleteAll() {
    const result = await prisma.candidate.deleteMany({});
    return { count: result.count };
  }

  /**
   * Get unique roles and skills from active candidates
   */
  async getUniqueRolesAndSkills() {
    const candidates = await prisma.candidate.findMany({
      where: {
        is_active: true,
      },
      select: {
        target_roles: true,
        primary_skills: true,
      },
    });

    const rolesSet = new Set();
    const skillsSet = new Set();

    candidates.forEach((candidate) => {
      if (candidate.target_roles) {
        candidate.target_roles.forEach((role) => rolesSet.add(role));
      }
      if (candidate.primary_skills) {
        candidate.primary_skills.forEach((skill) => skillsSet.add(skill));
      }
    });

    return {
      roles: Array.from(rolesSet).sort(),
      skills: Array.from(skillsSet).sort(),
    };
  }
}

module.exports = new CandidateRepository();

