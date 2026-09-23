import { Router } from 'express';
import { validateCoupon } from '../controllers/coupon.controller';
import { optionalUserMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Guests can also validate coupons; per-user limits are skipped when not logged in
router.post('/validate', optionalUserMiddleware, validateCoupon);

export default router;
