/**
 * Auth API Service
 */
import { apiClient } from '../client';
import { API_ENDPOINTS } from '../endpoints';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  company: string;
  role: string;
  linkedin: string;
  contact_number?: string;
  consent: boolean;
}

export interface AuthResponse {
  token: string;
  referrer?: {
    id: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  company: string;
  role: string;
  linkedin: string;
  contact_number?: string;
  is_admin: boolean;
}

export interface UpdateProfileRequest {
  full_name?: string;
  company?: string;
  role?: string;
  linkedin?: string;
  contact_number?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export const authApi = {
  /**
   * Login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.login, data);
  },

  /**
   * Signup
   */
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.signup, data);
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>(API_ENDPOINTS.me);
  },

  /**
   * Update profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    return apiClient.put<User>(API_ENDPOINTS.me, data);
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(API_ENDPOINTS.changePassword, data);
  },

  /**
   * Logout (no-op on server, handled client-side)
   */
  logout: async (): Promise<{ success: boolean }> => {
    return apiClient.post(API_ENDPOINTS.logout);
  },

  /**
   * Request OTP
   */
  requestOTP: async (phone_number: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/auth/otp/request', { phone_number });
  },

  /**
   * Verify OTP
   */
  verifyOTP: async (phone_number: string, otp: string): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/otp/verify', { phone_number, otp });
  },
};

