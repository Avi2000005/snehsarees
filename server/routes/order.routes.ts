import { Router } from 'express';
import { getOrders, createRazorpayOrder, verifyRazorpayPayment, getOrderInvoice, syncCustomerOrderTracking, guestTrackOrder } from '../controllers/order.controller';
import { userMiddleware, optionalUserMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Guest order tracking (no auth required)
router.post('/guest-track', guestTrackOrder);

router.get('/', optionalUserMiddleware, getOrders);
// Allow guests to create and verify orders (optionalUserMiddleware — userId will be null for guests)
router.post('/razorpay-create', optionalUserMiddleware, createRazorpayOrder);
router.post('/razorpay-verify', optionalUserMiddleware, verifyRazorpayPayment);
router.get('/:id/invoice', userMiddleware, getOrderInvoice);
router.post('/:id/sync-tracking', optionalUserMiddleware, syncCustomerOrderTracking);

export default router;
