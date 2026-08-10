import { Router } from 'express';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import inquiryRoutes from './inquiry.routes';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import offerRoutes from './offer.routes';
import couponRoutes from './coupon.routes';
import reviewRoutes from './review.routes';
import reelRoutes from './reel.routes';
import returnRoutes from './return.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', offerRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reels', reelRoutes);
router.use('/returns', returnRoutes);

export default router;
