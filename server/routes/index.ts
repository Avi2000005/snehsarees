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
import webhookRoutes from './webhook.routes';
import feedRoutes from './feed.routes';
import offersRoutes from './offers.routes';
import settingsRoutes from './settings.routes';
import policyRoutes from './policy.routes';

const router = Router();

router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/banners', offerRoutes);
router.use('/offers', offersRoutes);
router.use('/coupons', couponRoutes);
router.use('/settings', settingsRoutes);
router.use('/policies', policyRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reels', reelRoutes);
router.use('/returns', returnRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/feed', feedRoutes);

export default router;
