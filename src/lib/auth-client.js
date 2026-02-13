export const AUTH_USER_STORAGE_KEY = 'tradesarace_auth_user_v1';

export function loadStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.id !== 'number') return null;
    if (typeof parsed.name !== 'string') return null;
    if (typeof parsed.email !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}
