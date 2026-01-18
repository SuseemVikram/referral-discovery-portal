/**
 * Admin Import Service
 * Handles CSV import logic
 */
const { parse } = require('csv-parse/sync');
const candidateRepository = require('../../repositories/candidate.repository');
const logger = require('../../utils/logger');

const REQUIRED_COLUMNS = [
  'candidate_id',
  'first_name',
  'target_roles',
  'primary_skills',
  'location',
  'remote_ok',
  'availability_status',
  'short_profile',
  'candidate_email',
];

// Optional columns (either last_name OR last_name_initial)
const OPTIONAL_NAME_COLUMNS = ['last_name', 'last_name_initial'];

class ImportService {
  /**
   * Import candidates from CSV
   */
  async importCSV(csvContent) {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Validate headers
    const headers = Object.keys(records[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Validate that at least one name column exists (last_name OR last_name_initial)
    const hasLastNameColumn = OPTIONAL_NAME_COLUMNS.some(col => headers.includes(col));
    if (!hasLastNameColumn) {
      throw new Error(`Missing required column: either 'last_name' or 'last_name_initial' must be present`);
    }

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const record of records) {
      try {
        // Validate candidate_id
        if (!record.candidate_id || record.candidate_id.trim() === '') {
          logger.warn(`Skipping record: missing candidate_id`);
          failed++;
          continue;
        }

        const candidate_id = record.candidate_id.trim();

        // Parse data
        const target_roles = record.target_roles
          ? record.target_roles.split(',').map((r) => r.trim()).filter(Boolean)
          : [];
        const primary_skills = record.primary_skills
          ? record.primary_skills.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
        const remote_ok = record.remote_ok === 'true' || record.remote_ok === true;
        const availability_status = record.availability_status || 'Open';

        // Handle last_name_initial: accept either last_name (derive initial) or last_name_initial
        let last_name_initial = '';
        if (record.last_name_initial && record.last_name_initial.trim()) {
          const value = record.last_name_initial.trim();
          // If it's more than 1 character, extract just the first character (uppercase)
          // This allows CSV to have full names but store only initial for privacy
          last_name_initial = value.charAt(0).toUpperCase();
        } else if (record.last_name && record.last_name.trim()) {
          // Derive initial from last_name (first character, uppercase)
          last_name_initial = record.last_name.trim().charAt(0).toUpperCase();
        } else {
          throw new Error(`Missing last name information for candidate ${candidate_id}`);
        }

        // Handle projects: accept either JSON projects column OR separate project columns
        let projects = {};
        if (record.projects && record.projects.trim()) {
          // Try to parse as JSON first (backward compatibility)
          try {
            projects = JSON.parse(record.projects);
          } catch (error) {
            // If not JSON, treat as empty
            projects = {};
          }
        } else {
          // Parse from separate columns: project1_title, project1_bullets, project2_title, project2_bullets
          if (record.project1_title || record.project2_title) {
            projects = {};
            
            if (record.project1_title && record.project1_title.trim()) {
              const bullets = record.project1_bullets
                ? record.project1_bullets.split('|').map(b => b.trim()).filter(Boolean)
                : [];
              projects.project1 = {
                title: record.project1_title.trim(),
                bullets: bullets,
              };
            }
            
            if (record.project2_title && record.project2_title.trim()) {
              const bullets = record.project2_bullets
                ? record.project2_bullets.split('|').map(b => b.trim()).filter(Boolean)
                : [];
              projects.project2 = {
                title: record.project2_title.trim(),
                bullets: bullets,
              };
            }
          }
        }

        const candidateData = {
          id: candidate_id,
          candidate_email: record.candidate_email,
          first_name: record.first_name,
          last_name_initial: last_name_initial,
          target_roles,
          primary_skills,
          location: record.location,
          remote_ok,
          availability_status,
          short_profile: record.short_profile,
          projects: projects,
        };

        // Check if candidate exists before upsert
        let existing = null;
        try {
          existing = await candidateRepository.findById(candidate_id);
        } catch (error) {
          // Candidate doesn't exist, will be created
          existing = null;
        }

        // Upsert candidate
        await candidateRepository.upsert(candidateData);

        // Count based on whether candidate existed before upsert
        if (existing) {
          updated++;
        } else {
          created++;
        }
      } catch (error) {
        logger.error(`Failed to process record: ${record.candidate_id}`, error);
        failed++;
      }
    }

    return {
      total: records.length,
      created,
      updated,
      failed,
    };
  }
}

module.exports = new ImportService();

