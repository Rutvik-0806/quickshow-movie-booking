/** API base URL: empty in production (same host) or http://localhost:5000 in dev */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const apiUrl = (path) => {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};
