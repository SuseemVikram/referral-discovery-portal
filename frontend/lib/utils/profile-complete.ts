export interface UserProfile {
  company?: string | null;
  role?: string | null;
  linkedin?: string | null;
  contact_number?: string | null;
}

export function isProfileComplete(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  
  const company = user.company?.trim() || '';
  const role = user.role?.trim() || '';
  const linkedin = user.linkedin?.trim() || '';
  const contact_number = user.contact_number?.trim() || '';
  
  return !!(company && role && linkedin && contact_number);
}

export const RETURN_PATH_KEY = 'profile_return_path';
export const RETURN_SELECTION_KEY = 'profile_return_selection';

export function storeReturnPath(path: string, selectedIds?: string[]): void {
  sessionStorage.setItem(RETURN_PATH_KEY, path);
  if (selectedIds && selectedIds.length > 0) {
    sessionStorage.setItem(RETURN_SELECTION_KEY, JSON.stringify(selectedIds));
  }
}

export function getReturnPath(): { path: string | null; selectedIds: string[] } {
  const path = sessionStorage.getItem(RETURN_PATH_KEY);
  const selectionStr = sessionStorage.getItem(RETURN_SELECTION_KEY);
  const selectedIds = selectionStr ? JSON.parse(selectionStr) : [];
  
  return { path, selectedIds };
}

export function clearReturnPath(): void {
  sessionStorage.removeItem(RETURN_PATH_KEY);
  sessionStorage.removeItem(RETURN_SELECTION_KEY);
}
