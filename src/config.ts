const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
export const API_URL = rawUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
