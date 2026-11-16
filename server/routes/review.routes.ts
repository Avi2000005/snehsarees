import { Router } from 'express';
import multer from 'multer';
import {
  getProductReviews,
  getRecentReviews,
  createReview,
  updateReview,
  deleteUserReview,
  getUserReviews,
  uploadReviewImages
} from '../controllers/review.controller';
import { userMiddleware, optionalUserMiddleware } from '../middlewares/user.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per image
});

router.get('/product/:productId', getProductReviews);
router.get('/recent', getRecentReviews);
router.get('/my', userMiddleware, getUserReviews);
router.post('/upload', upload.array('images', 5), uploadReviewImages);
router.post('/', optionalUserMiddleware, createReview);
router.put('/:id', userMiddleware, updateReview);
router.delete('/:id', userMiddleware, deleteUserReview);

export default router;
