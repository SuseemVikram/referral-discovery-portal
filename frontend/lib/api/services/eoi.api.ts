/**
 * EOI API Service
 */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface SendEOIRequest {
  candidate_ids: string[];
  filter_roles?: string[];
  filter_skills?: string[];
}

export interface SendEOIResponse {
  success: boolean;
  sent: number;
}

export const eoiApi = {
  /**
   * Send Expression of Interest
   */
  sendEOI: async (data: SendEOIRequest): Promise<SendEOIResponse> => {
    return apiClient.post<SendEOIResponse>(API_ENDPOINTS.eoi, data);
  },
};

