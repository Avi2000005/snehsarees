const rawUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim();
export const API_URL = rawUrl.replace(/\/api\/?$/i, '').replace(/\/+$/, '');
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://www.snehsarees.in').trim();
export const PAYMENT_QR_URL = (import.meta.env.VITE_PAYMENT_QR_URL || '/payment-qr.jpg').trim();
export const BUSINESS_WHATSAPP = (import.meta.env.VITE_BUSINESS_WHATSAPP || '919414067123').trim();

