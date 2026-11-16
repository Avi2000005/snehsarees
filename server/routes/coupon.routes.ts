import { Router } from 'express';
import { validateCoupon, getActiveCoupons } from '../controllers/coupon.controller';
import { optionalUserMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Public endpoint for active valid coupons
router.get('/', getActiveCoupons);

// Guests can also validate coupons; per-user limits are skipped when not logged in
router.post('/validate', optionalUserMiddleware, validateCoupon);

export default router;
