/**
 * Candidates API Service
 */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface Candidate {
  id: string;
  first_name: string;
  last_name_initial: string;
  target_roles: string[];
  primary_skills: string[];
  location: string;
  remote_ok: boolean;
  cohort?: string;
  short_profile: string;
  projects: any;
  availability_status: 'Open' | 'Paused';
}

export interface CandidateFilters {
  roles?: string[];
  skills?: string[];
  location?: string;
  remote_ok?: boolean;
  availability_status?: 'Open' | 'Paused';
  page?: number;
  limit?: number;
}

export interface CandidatesResponse {
  candidates: Candidate[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export const candidatesApi = {
  /**
   * Get candidates with filters and pagination
   */
  getCandidates: async (filters: CandidateFilters = {}): Promise<CandidatesResponse> => {
    const params = new URLSearchParams();

    if (filters.roles && filters.roles.length > 0) {
      params.append('roles', filters.roles.join(','));
    }
    if (filters.skills && filters.skills.length > 0) {
      params.append('skills', filters.skills.join(','));
    }
    if (filters.location) {
      params.append('location', filters.location);
    }
    if (filters.remote_ok !== undefined) {
      params.append('remote_ok', String(filters.remote_ok));
    }
    if (filters.availability_status) {
      params.append('availability_status', filters.availability_status);
    }
    if (filters.page) {
      params.append('page', String(filters.page));
    }
    if (filters.limit) {
      params.append('limit', String(filters.limit));
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.candidates}?${queryString}`
      : API_ENDPOINTS.candidates;

    return apiClient.get<CandidatesResponse>(endpoint, {
      cache: 'no-store',
    });
  },

  /**
   * Get single candidate by ID
   */
  getCandidate: async (id: string): Promise<Candidate> => {
    return apiClient.get<Candidate>(`${API_ENDPOINTS.candidates}/${id}`, {
      cache: 'no-store',
    });
  },

  /**
   * Get unique roles and skills from active candidates for filter options
   */
  getFilterMetadata: async (): Promise<{ roles: string[]; skills: string[] }> => {
    return apiClient.get<{ roles: string[]; skills: string[] }>(API_ENDPOINTS.candidatesFilterMetadata, {
      cache: 'no-store',
    });
  },
};

