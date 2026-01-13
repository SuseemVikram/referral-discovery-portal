// API Configuration
// In production, use environment variable: process.env.NEXT_PUBLIC_API_URL

// Validate API URL in production
const API_BASE_URL_ENV = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE_URL_ENV && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production');
}

export const API_BASE_URL = API_BASE_URL_ENV || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  signup: `${API_BASE_URL}/auth/signup`,
  me: `${API_BASE_URL}/auth/me`,
  changePassword: `${API_BASE_URL}/auth/me/password`,
  logout: `${API_BASE_URL}/auth/logout`,
  
  // Public
  candidates: `${API_BASE_URL}/api/candidates`,
  
  // Protected
  eoi: `${API_BASE_URL}/api/eoi`,
  
  // Admin
  adminCandidates: `${API_BASE_URL}/api/admin/candidates`,
  adminCandidateDelete: (id: string) => `${API_BASE_URL}/api/admin/candidates/${id}`,
  adminReferrers: `${API_BASE_URL}/api/admin/referrers`,
  adminAdmins: `${API_BASE_URL}/api/admin/admins`,
  adminEOILog: `${API_BASE_URL}/api/admin/eoi-log`,
  adminEOIExport: `${API_BASE_URL}/api/admin/eoi-log/export`,
  adminImportCSV: `${API_BASE_URL}/api/admin/import-csv`,
  adminSampleCSV: `${API_BASE_URL}/api/admin/sample-csv`,
  adminAnalytics: `${API_BASE_URL}/api/admin/analytics`,
  adminAnalyticsExport: `${API_BASE_URL}/api/admin/analytics/export`,
};

