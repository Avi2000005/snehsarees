import { Router } from 'express';
import { createReturn, getMyReturns, getReturnForOrder } from '../controllers/return.controller';
import { userMiddleware } from '../middlewares/user.middleware';

const router = Router();

// Protect all customer return endpoints
router.use(userMiddleware);

router.post('/', createReturn);
router.get('/', getMyReturns);
router.get('/order/:orderId', getReturnForOrder);

export default router;
