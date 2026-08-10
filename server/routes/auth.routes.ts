import { Router } from 'express';
import { sendRegistrationOtp, register, login, logout, getMe, forgotPassword, resetPassword, sendEmailUpdateOtp, updateProfile, deleteAccount } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware';
import { userMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Registration flow (OTP-gated)
router.post('/send-otp', sendRegistrationOtp);
router.post('/register', register);

// Login
router.post('/login', loginRateLimiter, login);

// Forgot / reset password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Session management
router.post('/logout', logout);
router.get('/me', userMiddleware, getMe);

// Profile Settings
router.post('/send-email-update-otp', userMiddleware, sendEmailUpdateOtp);
router.put('/profile', userMiddleware, updateProfile);
router.delete('/account', userMiddleware, deleteAccount);

export default router;
