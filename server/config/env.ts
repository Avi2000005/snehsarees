import dotenv from 'dotenv';
dotenv.config();

function cleanEnv(val?: string, defaultVal: string = ''): string {
  if (!val) return defaultVal;
  return val.trim().replace(/^["']|["']$/g, '').trim();
}

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  DATABASE_URL: cleanEnv(process.env.DATABASE_URL),
  RAZORPAY_KEY_ID: cleanEnv(process.env.RAZORPAY_KEY_ID),
  RAZORPAY_KEY_SECRET: cleanEnv(process.env.RAZORPAY_KEY_SECRET),
  ADMIN_SECRET: cleanEnv(process.env.ADMIN_SECRET, 'super_secret_admin_token'),
  ADMIN_EMAIL: cleanEnv(process.env.ADMIN_EMAIL, 'info@snehsarees.in'),
  ADMIN_PASSWORD: cleanEnv(process.env.ADMIN_PASSWORD, 'Snehsarees@2026'),
  JWT_SECRET: cleanEnv(process.env.JWT_SECRET, 'super_secret_jwt_sign_key_999'),
  LOGIN_LIMIT_WINDOW_MS: parseInt(process.env.LOGIN_LIMIT_WINDOW_MS || '900000', 10), // Default: 15 minutes
  LOGIN_LIMIT_MAX: parseInt(process.env.LOGIN_LIMIT_MAX || '5', 10),                 // Default: 5 attempts
  CLOUDINARY_CLOUD_NAME: cleanEnv(process.env.CLOUDINARY_CLOUD_NAME),
  CLOUDINARY_API_KEY: cleanEnv(process.env.CLOUDINARY_API_KEY),
  CLOUDINARY_API_SECRET: cleanEnv(process.env.CLOUDINARY_API_SECRET),
  NODE_ENV: cleanEnv(process.env.NODE_ENV, 'development'),
  FRONTEND_URL: cleanEnv(process.env.FRONTEND_URL, 'https://www.snehsarees.in'),
  SHIPROCKET_EMAIL: cleanEnv(process.env.SHIPROCKET_EMAIL),
  SHIPROCKET_PASSWORD: cleanEnv(process.env.SHIPROCKET_PASSWORD),
  SHIPROCKET_PICKUP_LOCATION: cleanEnv(process.env.SHIPROCKET_PICKUP_LOCATION, 'work'),
  // Brevo email service for OTP
  BREVO_API_KEY: cleanEnv(process.env.BREVO_API_KEY),
  BREVO_SENDER_EMAIL: cleanEnv(process.env.BREVO_SENDER_EMAIL, 'info@snehsarees.in'),
  BREVO_SENDER_NAME: cleanEnv(process.env.BREVO_SENDER_NAME, 'Sneh Sarees'),
};
