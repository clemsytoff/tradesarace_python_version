/** Base URL de l'API Python (Flask). */
export const API_BASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) || 'http://localhost:5000';

export function apiUrl(path) {
  return path.startsWith('http') ? path : `${API_BASE}${path}`;
}
