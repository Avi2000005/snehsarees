import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: (process.env.DATABASE_URL || '').trim(),
  RAZORPAY_KEY_ID: (process.env.RAZORPAY_KEY_ID || '').trim(),
  RAZORPAY_KEY_SECRET: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
  ADMIN_SECRET: (process.env.ADMIN_SECRET || 'super_secret_admin_token').trim(),
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL || 'info@snehsarees.in').trim(),
  ADMIN_PASSWORD: (process.env.ADMIN_PASSWORD || 'Snehsarees@2026').trim(),
  JWT_SECRET: (process.env.JWT_SECRET || 'super_secret_jwt_sign_key_999').trim(),
  LOGIN_LIMIT_WINDOW_MS: parseInt(process.env.LOGIN_LIMIT_WINDOW_MS || '900000', 10), // Default: 15 minutes
  LOGIN_LIMIT_MAX: parseInt(process.env.LOGIN_LIMIT_MAX || '5', 10),                 // Default: 5 attempts
  CLOUDINARY_CLOUD_NAME: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  CLOUDINARY_API_KEY: (process.env.CLOUDINARY_API_KEY || '').trim(),
  CLOUDINARY_API_SECRET: (process.env.CLOUDINARY_API_SECRET || '').trim(),
  NODE_ENV: (process.env.NODE_ENV || 'development').trim(),
  FRONTEND_URL: (process.env.FRONTEND_URL || '').trim(),
  SHIPROCKET_EMAIL: (process.env.SHIPROCKET_EMAIL || '').trim(),
  SHIPROCKET_PASSWORD: (process.env.SHIPROCKET_PASSWORD || '').trim(),
  // Brevo email service for OTP
  BREVO_API_KEY: (process.env.BREVO_API_KEY || '').trim(),
  BREVO_SENDER_EMAIL: (process.env.BREVO_SENDER_EMAIL || 'info@snehsarees.in').trim(),
  BREVO_SENDER_NAME: (process.env.BREVO_SENDER_NAME || 'Sneh Sarees').trim(),
};
