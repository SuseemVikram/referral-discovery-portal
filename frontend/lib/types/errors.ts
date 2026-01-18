export interface ApiError extends Error {
  status?: number;
  code?: string;
  response?: {
    body?: unknown;
    headers?: unknown;
  };
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 'status' in error;
}

export function isAuthError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return error.status === 401 || error.status === 403;
}
