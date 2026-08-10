import { Product, Order, Category, OfferBanner, Coupon, Review, Reel, ReturnRequest } from '../../src/types';
import { Inquiry } from '../models/inquiry.model';
import { User } from '../models/user.model';

export interface IDatabase {
  // Product inventory CRUD
  getProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id'> & { id?: number }): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;
  deductProductStock(id: number, qty: number): Promise<boolean>;
  restoreProductStock(id: number, qty: number): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | null>;
  createCategory(category: Omit<Category, 'id'> & { id?: number }): Promise<Category>;
  updateCategory(id: number, category: Partial<Category>): Promise<Category | null>;
  deleteCategory(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  getOrderById(id: string): Promise<Order | null>;
  createOrder(order: Order & { userId?: number }): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<boolean>;
  updateOrderLocation(id: string, address: string): Promise<boolean>;
  updateOrderTracking(id: string, trackingId: string, carrierName: string, trackingUrl: string): Promise<boolean>;

  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  createInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<Inquiry>;
  updateInquiryStatus(id: number, status: 'pending' | 'contacted' | 'closed'): Promise<boolean>;

  // Users
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  getUserByPhone(phone: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserById(id: number): Promise<User | null>;
  updateUserPassword(id: number, passwordHash: string): Promise<boolean>;
  updateUser(id: number, user: Partial<User>): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;

  // Offer Banners
  getActiveBanners(): Promise<OfferBanner[]>;
  getAllBanners(): Promise<OfferBanner[]>;
  createBanner(banner: Omit<OfferBanner, 'id' | 'createdAt'>): Promise<OfferBanner>;
  updateBanner(id: number, data: Partial<OfferBanner>): Promise<OfferBanner | null>;
  deleteBanner(id: number): Promise<boolean>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | null>;
  createCoupon(coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon>;
  deleteCoupon(id: number): Promise<boolean>;
  recordCouponUsage(couponId: number, userId: number, orderId: string): Promise<void>;
  getCouponUsageCount(couponId: number, userId: number): Promise<number>;
  incrementCouponUsage(couponId: number): Promise<void>;

  // Reviews
  getProductReviews(productId: number): Promise<Review[]>;
  getRecentReviews(limit?: number): Promise<Review[]>;
  getAllReviews(): Promise<Review[]>;
  createReview(review: Omit<Review, 'id' | 'createdAt'>): Promise<Review>;
  updateReview(id: number, data: { rating?: number; body?: string }): Promise<Review | null>;
  deleteReview(id: number): Promise<boolean>;
  getReviewsByUserId(userId: number): Promise<Review[]>;

  // Reels
  getActiveReels(): Promise<Reel[]>;
  getAllReels(): Promise<Reel[]>;
  createReel(reel: Omit<Reel, 'id' | 'createdAt'>): Promise<Reel>;
  updateReel(id: number, data: Partial<Reel>): Promise<Reel | null>;
  deleteReel(id: number): Promise<boolean>;

  // Returns
  createReturn(ret: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'> & { userId?: number }): Promise<ReturnRequest>;
  getReturnsByUserId(userId: number): Promise<ReturnRequest[]>;
  getReturnByOrderId(orderId: string): Promise<ReturnRequest | null>;
  getAllReturns(): Promise<ReturnRequest[]>;
  updateReturnStatus(id: number, status: string, adminNote?: string): Promise<boolean>;
}
