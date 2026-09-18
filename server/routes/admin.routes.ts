import { Router } from 'express';
import { adminMiddleware } from '../middlewares/admin.middleware';
import {
  createProduct,
  createBulkProducts,
  updateProduct,
  deleteProduct,
  updateOrderStatus,
  updateInquiryStatus,
  updateOrderLocation,
  updateOrderTracking,
  syncOrderWithShiprocket,
  syncAllOrdersWithShiprocket,
  uploadProductImage,
  uploadBulkProductImages,
  bulkAssignProductImages,
  getAllOrders,
} from '../controllers/admin.controller';
import { getInquiries } from '../controllers/inquiry.controller';
import { createCategory, updateCategory, deleteCategory, uploadCategoryImage } from '../controllers/category.controller';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/offer.controller';
import { getCoupons, createCoupon, deleteCoupon } from '../controllers/coupon.controller';
import { getAllReviews, deleteReview } from '../controllers/review.controller';
import { getAllReels, createReel, updateReel, deleteReel } from '../controllers/reel.controller';
import { getAllReturns, updateReturnStatus } from '../controllers/return.controller';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Apply adminMiddleware to all child endpoints
router.use(adminMiddleware);

// Inventory Product CRUD
router.post('/products', createProduct);
router.post('/products/bulk', createBulkProducts);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/upload', upload.single('image'), uploadProductImage);
router.post('/products/upload-bulk', upload.array('images', 100), uploadBulkProductImages);
router.post('/products/bulk-assign-images', bulkAssignProductImages);

// Orders lists & status modifications
router.get('/orders', getAllOrders);
router.post('/orders/sync-shiprocket', syncAllOrdersWithShiprocket);
router.post('/orders/:id/sync-shiprocket', syncOrderWithShiprocket);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/location', updateOrderLocation);
router.put('/orders/:id/tracking', updateOrderTracking);

// Wholesale inquiries lists & status modifications
router.get('/inquiries', getInquiries);
router.put('/inquiries/:id/status', updateInquiryStatus);

// Categories CRUD (Admin Panel)
router.post('/categories/upload', upload.single('image'), uploadCategoryImage);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Offer Banners CRUD
router.get('/banners', getAllBanners);
router.post('/banners', createBanner);
router.put('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// Coupons CRUD
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Reviews Admin
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// Reels CRUD
router.get('/reels', getAllReels);
router.post('/reels', createReel);
router.put('/reels/:id', updateReel);
router.delete('/reels/:id', deleteReel);

// Returns Management
router.get('/returns', getAllReturns);
router.put('/returns/:id', updateReturnStatus);

export default router;
