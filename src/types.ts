export interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  fabric: string;
  occasion: string;
  colour: string;
  tags: string[];
  isReel: boolean;
  views?: string;
  rating: number;
  reviews: number;
  blouse: boolean;
  desc: string;
  image?: string;
  stock?: number;
  categoryId?: number;
  variants?: { colour: string; image: string }[];
  reelUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  history?: string;
  properties?: string;
  care?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  fabric: string;
  colour: string;
  qty: number;
  image?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  method: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  status?: string;
  userEmail?: string;
  userId?: number;
  trackingId?: string;
  carrierName?: string;
  trackingUrl?: string;
  couponCode?: string;
  discountAmount?: number;
  deliveryFee?: number;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface OfferBanner {
  id: number;
  title: string;
  subtitle?: string;
  badgeText?: string;
  ctaText: string;
  ctaLink: string;
  bgFrom: string;
  bgTo: string;
  isActive: boolean;
  sortOrder: number;
  expiresAt?: string;
  createdAt: string;
  discountPercent?: number;
  categoryId?: number;
  imageUrl?: string;
}

export interface Coupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscountCap?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  applicableCategoryId?: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userId?: number;
  userName: string;
  userUsername?: string;
  rating: number;
  body?: string;
  isVerified: boolean;
  createdAt: string;
  productName?: string;
}

export interface Reel {
  id: number;
  productId: number;
  videoUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  product?: Product;
}

export interface ChatReply {
  msg: string;
  replies: string[];
  action?: 'silk' | 'cotton' | 'wedding' | 'wa';
}

export type ActivePage =
  | 'landing'
  | 'home'
  | 'search'
  | 'viewall'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'success'
  | 'pending_payment'
  | 'wishlist'
  | 'orders'
  | 'profile'
  | 'bulk'
  | 'auth'
  | 'admin';
export type ReturnStatus = 'requested' | 'approved' | 'picked_up' | 'refunded' | 'rejected';
export type ReturnReason = 'damaged' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'size_issue' | 'other';
export type ReturnResolution = 'refund' | 'exchange';

export interface ReturnItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

export interface ReturnRequest {
  id: number;
  orderId: string;
  userId?: number;
  userEmail?: string;
  customerName?: string;
  phone?: string;
  reason: ReturnReason;
  description?: string;
  resolution: ReturnResolution;
  status: ReturnStatus;
  items: ReturnItem[];
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAddress {
  id: string;
  label: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  addresses?: UserAddress[];
}
