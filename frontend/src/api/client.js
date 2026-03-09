/**
 * API client for AcademiaAI.
 * Uses VITE_API_URL env var in production (Vercel), falls back to relative path for local dev.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

export function apiUrl(path) {
  return `${API_BASE}${path}`;
}
