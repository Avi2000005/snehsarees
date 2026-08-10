import { Router } from 'express';
import { validateCoupon } from '../controllers/coupon.controller';
import { userMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Validate is authenticated check
router.post('/validate', userMiddleware, validateCoupon);

export default router;
