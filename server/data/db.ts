import { IDatabase } from './db.interface';
import { JsonDatabaseAdapter } from './json.adapter';
import { PostgresDatabaseAdapter } from './postgres.adapter';
import { pool } from '../config/database';

class DynamicDatabaseAdapter implements IDatabase {
  private pg = new PostgresDatabaseAdapter();
  private json = new JsonDatabaseAdapter();

  private getActiveAdapter(): IDatabase {
    if (!pool) {
      throw new Error('Database: PostgreSQL is not connected or initialized.');
    }
    return this.pg;
  }

  getProducts() { return this.getActiveAdapter().getProducts(); }
  getProductById(id: number) { return this.getActiveAdapter().getProductById(id); }
  createProduct(product: any) { return this.getActiveAdapter().createProduct(product); }
  updateProduct(id: number, product: any) { return this.getActiveAdapter().updateProduct(id, product); }
  deleteProduct(id: number) { return this.getActiveAdapter().deleteProduct(id); }
  deductProductStock(id: number, qty: number) { return this.getActiveAdapter().deductProductStock(id, qty); }
  restoreProductStock(id: number, qty: number) { return this.getActiveAdapter().restoreProductStock(id, qty); }

  getCategories() { return this.getActiveAdapter().getCategories(); }
  getCategoryById(id: number) { return this.getActiveAdapter().getCategoryById(id); }
  createCategory(category: any) { return this.getActiveAdapter().createCategory(category); }
  updateCategory(id: number, category: any) { return this.getActiveAdapter().updateCategory(id, category); }
  deleteCategory(id: number) { return this.getActiveAdapter().deleteCategory(id); }

  getOrders() { return this.getActiveAdapter().getOrders(); }
  getOrdersByUserId(userId: number) { return this.getActiveAdapter().getOrdersByUserId(userId); }
  getOrderById(id: string) { return this.getActiveAdapter().getOrderById(id); }
  createOrder(order: any) { return this.getActiveAdapter().createOrder(order); }
  updateOrderStatus(id: string, status: string) { return this.getActiveAdapter().updateOrderStatus(id, status); }
  updateOrderLocation(id: string, address: string) { return this.getActiveAdapter().updateOrderLocation(id, address); }
  updateOrderTracking(id: string, trackingId: string, carrierName: string, trackingUrl: string) { return this.getActiveAdapter().updateOrderTracking(id, trackingId, carrierName, trackingUrl); }

  getInquiries() { return this.getActiveAdapter().getInquiries(); }
  createInquiry(inquiry: any) { return this.getActiveAdapter().createInquiry(inquiry); }
  updateInquiryStatus(id: number, status: any) { return this.getActiveAdapter().updateInquiryStatus(id, status); }

  createUser(user: any) { return this.getActiveAdapter().createUser(user); }
  getUserByPhone(phone: string) { return this.getActiveAdapter().getUserByPhone(phone); }
  getUserByEmail(email: string) { return this.getActiveAdapter().getUserByEmail(email); }
  getUserByUsername(username: string) { return this.getActiveAdapter().getUserByUsername(username); }
  getUserById(id: number) { return this.getActiveAdapter().getUserById(id); }
  updateUserPassword(id: number, passwordHash: string) { return this.getActiveAdapter().updateUserPassword(id, passwordHash); }
  updateUser(id: number, user: any) { return this.getActiveAdapter().updateUser(id, user); }
  deleteUser(id: number) { return this.getActiveAdapter().deleteUser(id); }

  // Offer Banners
  getActiveBanners() { return this.getActiveAdapter().getActiveBanners(); }
  getAllBanners() { return this.getActiveAdapter().getAllBanners(); }
  createBanner(banner: any) { return this.getActiveAdapter().createBanner(banner); }
  updateBanner(id: number, data: any) { return this.getActiveAdapter().updateBanner(id, data); }
  deleteBanner(id: number) { return this.getActiveAdapter().deleteBanner(id); }

  // Coupons
  getCoupons() { return this.getActiveAdapter().getCoupons(); }
  getCouponByCode(code: string) { return this.getActiveAdapter().getCouponByCode(code); }
  createCoupon(coupon: any) { return this.getActiveAdapter().createCoupon(coupon); }
  deleteCoupon(id: number) { return this.getActiveAdapter().deleteCoupon(id); }
  recordCouponUsage(couponId: number, userId: number, orderId: string) { return this.getActiveAdapter().recordCouponUsage(couponId, userId, orderId); }
  getCouponUsageCount(couponId: number, userId: number) { return this.getActiveAdapter().getCouponUsageCount(couponId, userId); }
  incrementCouponUsage(couponId: number) { return this.getActiveAdapter().incrementCouponUsage(couponId); }

  // Reviews
  getProductReviews(productId: number) { return this.getActiveAdapter().getProductReviews(productId); }
  getRecentReviews(limit?: number) { return this.getActiveAdapter().getRecentReviews(limit); }
  getAllReviews() { return this.getActiveAdapter().getAllReviews(); }
  createReview(review: any) { return this.getActiveAdapter().createReview(review); }
  updateReview(id: number, data: any) { return this.getActiveAdapter().updateReview(id, data); }
  deleteReview(id: number) { return this.getActiveAdapter().deleteReview(id); }
  getReviewsByUserId(userId: number) { return this.getActiveAdapter().getReviewsByUserId(userId); }

  // Reels
  getActiveReels() { return this.getActiveAdapter().getActiveReels(); }
  getAllReels() { return this.getActiveAdapter().getAllReels(); }
  createReel(reel: any) { return this.getActiveAdapter().createReel(reel); }
  updateReel(id: number, data: any) { return this.getActiveAdapter().updateReel(id, data); }
  deleteReel(id: number) { return this.getActiveAdapter().deleteReel(id); }

  // Returns
  createReturn(ret: any) { return this.getActiveAdapter().createReturn(ret); }
  getReturnsByUserId(userId: number) { return this.getActiveAdapter().getReturnsByUserId(userId); }
  getReturnByOrderId(orderId: string) { return this.getActiveAdapter().getReturnByOrderId(orderId); }
  getAllReturns() { return this.getActiveAdapter().getAllReturns(); }
  updateReturnStatus(id: number, status: string, adminNote?: string) { return this.getActiveAdapter().updateReturnStatus(id, status, adminNote); }
}

export const db = new DynamicDatabaseAdapter();
export * from './db.interface';
