import { Router } from 'express';
import { getOrders, createRazorpayOrder, verifyRazorpayPayment, getOrderInvoice } from '../controllers/order.controller';
import { userMiddleware, optionalUserMiddleware } from '../middlewares/user.middleware';

const router = Router();

router.get('/', optionalUserMiddleware, getOrders);
router.post('/razorpay-create', userMiddleware, createRazorpayOrder);
router.post('/razorpay-verify', userMiddleware, verifyRazorpayPayment);
router.get('/:id/invoice', userMiddleware, getOrderInvoice);

export default router;
