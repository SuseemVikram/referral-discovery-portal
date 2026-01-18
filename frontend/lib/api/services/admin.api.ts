/**
 * Admin API Service
 */
import { apiClient } from '../client';
import { API_ENDPOINTS, API_BASE_URL } from '../endpoints';
import { getToken } from '../../auth';

export interface AdminCandidate {
  id: string;
  first_name: string;
  last_name_initial: string;
  candidate_email: string;
  target_roles: string[];
  primary_skills: string[];
  availability_status: 'Open' | 'Paused';
  is_active: boolean;
}

export interface AdminCandidateFilters {
  email?: string;
  roles?: string;
  skills?: string;
}

export interface AdminReferrer {
  id: string;
  email: string;
  full_name: string;
  company: string;
  role: string;
  linkedin: string | null;
  is_admin: boolean;
  createdAt: string;
  eoiCount: number;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  company: string;
}

export interface EOILogEntry {
  sentAt: string;
  referrerEmail: string;
  referrerName: string;
  referrerCompany: string;
  candidateId: string;
  candidateName: string;
  candidateRoles: string[];
}

export interface AnalyticsData {
  summary: {
    totalEOIs: number;
    totalCandidates: number;
    totalReferrers: number;
    activeCandidates: number;
    periodEOIs: number;
    periodDays: number;
  };
  topCandidates: {
    id: string;
    name: string;
    roles: string[];
    skills: string[];
    availability: string;
    isActive: boolean;
    eoiCount: number;
  }[];
  topSkills: { skill: string; count: number }[];
  topRoles: { role: string; count: number }[];
  topReferrers: { id: string; name: string; company: string; eoiCount: number }[];
  eoiTrend: { date: string; count: number }[];
}

export interface ImportSummary {
  total: number;
  created: number;
  updated: number;
  failed: number;
}

export const adminApi = {
  /**
   * Get all candidates (admin)
   */
  getCandidates: async (filters?: AdminCandidateFilters): Promise<{ candidates: AdminCandidate[] }> => {
    const params = new URLSearchParams();
    
    if (filters?.email) {
      params.append('email', filters.email);
    }
    if (filters?.roles) {
      params.append('roles', filters.roles);
    }
    if (filters?.skills) {
      params.append('skills', filters.skills);
    }

    const queryString = params.toString();
    const endpoint = queryString
      ? `${API_ENDPOINTS.adminCandidates}?${queryString}`
      : API_ENDPOINTS.adminCandidates;

    return apiClient.get<{ candidates: AdminCandidate[] }>(endpoint);
  },

  /**
   * Update candidate visibility
   */
  updateCandidateVisibility: async (id: string, isActive: boolean): Promise<{ id: string; is_active: boolean }> => {
    return apiClient.put<{ id: string; is_active: boolean }>(
      API_ENDPOINTS.adminCandidateVisibility(id),
      { is_active: isActive }
    );
  },

  /**
   * Update candidate availability
   */
  updateCandidateAvailability: async (id: string, availabilityStatus: 'Open' | 'Paused'): Promise<{ id: string; availability_status: 'Open' | 'Paused' }> => {
    return apiClient.put<{ id: string; availability_status: 'Open' | 'Paused' }>(
      API_ENDPOINTS.adminCandidateAvailability(id),
      { availability_status: availabilityStatus }
    );
  },

  /**
   * Delete candidate
   */
  deleteCandidate: async (id: string): Promise<{ id: string; first_name: string; last_name_initial: string }> => {
    return apiClient.delete<{ id: string; first_name: string; last_name_initial: string }>(
      API_ENDPOINTS.adminCandidateDelete(id)
    );
  },

  /**
   * Delete all candidates
   */
  deleteAllCandidates: async (): Promise<{ success: boolean; message: string; count: number }> => {
    return apiClient.delete<{ success: boolean; message: string; count: number }>(
      API_ENDPOINTS.adminCandidateDeleteAll
    );
  },

  /**
   * Get all referrers (admin)
   */
  getReferrers: async (): Promise<{ referrers: AdminReferrer[] }> => {
    return apiClient.get<{ referrers: AdminReferrer[] }>(API_ENDPOINTS.adminReferrers);
  },

  getReferrerById: async (id: string): Promise<{ referrer: AdminReferrer & { phone_number: string | null; updatedAt: string } }> => {
    return apiClient.get<{ referrer: AdminReferrer & { phone_number: string | null; updatedAt: string } }>(API_ENDPOINTS.adminReferrerById(id));
  },

  /**
   * Update referrer admin status
   */
  updateReferrerAdminStatus: async (id: string, isAdmin: boolean): Promise<{ id: string; is_admin: boolean }> => {
    return apiClient.put<{ id: string; is_admin: boolean }>(
      API_ENDPOINTS.adminReferrerAdmin(id),
      { is_admin: isAdmin }
    );
  },

  /**
   * Get all admins
   */
  getAdmins: async (): Promise<{ admins: Admin[] }> => {
    return apiClient.get<{ admins: Admin[] }>(API_ENDPOINTS.adminAdmins);
  },

  /**
   * Add admin by email
   */
  addAdmin: async (email: string): Promise<{ admin: Admin }> => {
    return apiClient.post<{ admin: Admin }>(API_ENDPOINTS.adminAddAdmin, { email });
  },

  /**
   * Remove admin
   */
  removeAdmin: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.adminRemoveAdmin(id));
  },

  /**
   * Get EOI logs
   */
  getEOILogs: async (): Promise<{ logs: EOILogEntry[] }> => {
    return apiClient.get<{ logs: EOILogEntry[] }>(API_ENDPOINTS.adminEOILog);
  },

  /**
   * Export EOI logs as CSV
   */
  exportEOILogs: async (): Promise<Blob> => {
    const token = getToken();
    
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.adminEOIExport}`,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export EOI logs');
    }

    return response.blob();
  },

  /**
   * Get analytics data
   */
  getAnalytics: async (days: string): Promise<AnalyticsData> => {
    return apiClient.get<AnalyticsData>(`${API_ENDPOINTS.adminAnalytics}?days=${days}`);
  },

  /**
   * Export analytics as CSV
   */
  exportAnalytics: async (days: string): Promise<Blob> => {
    const token = getToken();
    
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.adminAnalyticsExport}?days=${days}`,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export analytics');
    }

    return response.blob();
  },

  /**
   * Download sample CSV
   */
  downloadSampleCSV: async (): Promise<Blob> => {
    const token = getToken();
    
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.adminSampleCSV}`,
      {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download sample CSV');
    }

    return response.blob();
  },

  /**
   * Import candidates from CSV
   */
  importCandidates: async (file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.postFormData<ImportSummary>(API_ENDPOINTS.adminImportCSV, formData);
  },
};

