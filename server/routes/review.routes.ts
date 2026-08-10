import { Router } from 'express';
import { getProductReviews, getRecentReviews, createReview, updateReview, deleteUserReview, getUserReviews } from '../controllers/review.controller';
import { userMiddleware } from '../middlewares/user.middleware';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.get('/recent', getRecentReviews);
router.get('/my', userMiddleware, getUserReviews);
router.post('/', userMiddleware, createReview);
router.put('/:id', userMiddleware, updateReview);
router.delete('/:id', userMiddleware, deleteUserReview);

export default router;
