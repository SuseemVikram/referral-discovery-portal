/**
 * API Endpoints Configuration
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  signup: '/auth/signup',
  me: '/auth/me',
  changePassword: '/auth/me/password',
  logout: '/auth/logout',

  // Public
  candidates: '/api/candidates',
  candidatesFilterMetadata: '/api/candidates/metadata/filters',

  // Protected
  eoi: '/api/eoi',

  // Admin
  adminCandidates: '/api/admin/candidates',
  adminCandidateDeleteAll: '/api/admin/candidates/all',
  adminCandidateVisibility: (id: string) => `/api/admin/candidates/${id}/visibility`,
  adminCandidateAvailability: (id: string) => `/api/admin/candidates/${id}/availability`,
  adminCandidateDelete: (id: string) => `/api/admin/candidates/${id}`,
  adminReferrers: '/api/admin/referrers',
  adminReferrerById: (id: string) => `/api/admin/referrers/${id}`,
  adminReferrerAdmin: (id: string) => `/api/admin/referrers/${id}/admin`,
  adminAdmins: '/api/admin/admins',
  adminAddAdmin: '/api/admin/admins',
  adminRemoveAdmin: (id: string) => `/api/admin/admins/${id}`,
  adminEOILog: '/api/admin/eoi-log',
  adminEOIExport: '/api/admin/eoi-log/export',
  adminImportCSV: '/api/admin/import-csv',
  adminSampleCSV: '/api/admin/sample-csv',
  adminAnalytics: '/api/admin/analytics',
  adminAnalyticsExport: '/api/admin/analytics/export',
};

