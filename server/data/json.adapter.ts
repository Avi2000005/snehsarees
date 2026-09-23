import { IDatabase } from './db.interface';
import { Product, Order, Category, ReturnRequest } from '../../src/types';
import { Inquiry } from '../models/inquiry.model';
import { User } from '../models/user.model';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'db.json');

interface DbStructure {
  products: Product[];
  orders: Order[];
  inquiries: Inquiry[];
  users: User[];
  categories: Category[];
  returns?: ReturnRequest[];
}

export class JsonDatabaseAdapter implements IDatabase {
  private async readDb(): Promise<DbStructure> {
    try {
      const data = await fs.readFile(dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (!parsed.users) parsed.users = [];
      if (!parsed.categories) parsed.categories = [];
      if (!parsed.returns) parsed.returns = [];
      return parsed;
    } catch (err) {
      return { products: [], orders: [], inquiries: [], users: [], categories: [], returns: [] };
    }
  }

  private async writeDb(data: DbStructure): Promise<void> {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  }

  // Products CRUD
  async getProducts(): Promise<Product[]> {
    const db = await this.readDb();
    return db.products;
  }

  async getProductById(id: number): Promise<Product | null> {
    const db = await this.readDb();
    return db.products.find((p) => p.id === id) || null;
  }

  async createProduct(product: Omit<Product, 'id'> & { id?: number }): Promise<Product> {
    const db = await this.readDb();
    const nextId = product.id || (db.products.length > 0 ? Math.max(...db.products.map((p) => p.id)) + 1 : 1);
    const newProduct: Product = {
      name: product.name || 'Untitled Product',
      price: product.price !== undefined && !isNaN(product.price) ? product.price : 0,
      discountPrice: product.discountPrice !== undefined && !isNaN(product.discountPrice) ? product.discountPrice : undefined,
      fabric: product.fabric || '',
      occasion: product.occasion || '',
      colour: product.colour || '',
      tags: product.tags || [],
      isReel: product.isReel || false,
      views: product.views || '0',
      rating: product.rating || 5.0,
      reviews: product.reviews || 0,
      blouse: product.blouse || false,
      desc: product.desc || '',
      image: product.image || '',
      stock: product.stock !== undefined && !isNaN(product.stock) ? product.stock : 0,
      categoryId: product.categoryId !== undefined ? product.categoryId : undefined,
      variants: product.variants || [],
      reelUrl: product.reelUrl || undefined,
      code: product.code || undefined,
      isArchived: product.isArchived ?? false,
      id: nextId
    };
    db.products.push(newProduct);
    await this.writeDb(db);
    return newProduct;
  }

  async createBulkProducts(products: Array<Omit<Product, 'id'> & { id?: number }>): Promise<Product[]> {
    if (!products || products.length === 0) return [];
    const db = await this.readDb();
    let currentMaxId = db.products.length > 0 ? Math.max(...db.products.map((p) => p.id)) : 0;
    const created: Product[] = [];
    for (const product of products) {
      currentMaxId += 1;
      const newProduct: Product = {
        name: product.name || 'Untitled Product',
        price: product.price !== undefined && !isNaN(product.price) ? product.price : 0,
        discountPrice: product.discountPrice !== undefined && !isNaN(product.discountPrice) ? product.discountPrice : undefined,
        fabric: product.fabric || '',
        occasion: product.occasion || '',
        colour: product.colour || '',
        tags: product.tags || [],
        isReel: product.isReel || false,
        views: product.views || '0',
        rating: product.rating || 5.0,
        reviews: product.reviews || 0,
        blouse: product.blouse || false,
        desc: product.desc || '',
        image: product.image || '',
        stock: product.stock !== undefined && !isNaN(product.stock) ? product.stock : 0,
        categoryId: product.categoryId !== undefined ? product.categoryId : undefined,
        variants: product.variants || [],
        reelUrl: product.reelUrl || undefined,
        code: product.code || undefined,
        isArchived: product.isArchived ?? false,
        id: product.id || currentMaxId
      };
      db.products.push(newProduct);
      created.push(newProduct);
    }
    await this.writeDb(db);
    return created;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    const db = await this.readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    db.products[index] = { ...db.products[index], ...product };
    await this.writeDb(db);
    return db.products[index];
  }

  async deleteProduct(id: number): Promise<boolean> {
    const db = await this.readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    db.products.splice(index, 1);
    await this.writeDb(db);
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const db = await this.readDb();
    return (db.orders || [])
      .filter((o: any) => o.status !== 'pending' && o.status !== 'pending_payment')
      .map((o: any) => {
        const user = db.users?.find((u: any) => u.id === o.userId);
        return {
          ...o,
          userEmail: o.userEmail || user?.email || undefined
        };
      });
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const db = await this.readDb();
    const user = db.users?.find((u: any) => u.id === userId);
    return (db.orders || [])
      .filter((o: any) => o.userId === userId && o.status !== 'pending' && o.status !== 'pending_payment')
      .map((o: any) => ({
        ...o,
        userEmail: o.userEmail || user?.email || undefined
      }));
  }

  async getOrderById(id: string): Promise<Order | null> {
    const db = await this.readDb();
    const order = db.orders.find((o) => o.id === id);
    if (!order) return null;
    const user = db.users?.find((u: any) => u.id === (order as any).userId);
    return {
      ...order,
      userEmail: (order as any).userEmail || user?.email || undefined
    };
  }

  async createOrder(order: Order & { userId?: number }): Promise<Order> {
    const db = await this.readDb();
    db.orders.push(order);
    await this.writeDb(db);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<boolean> {
    const db = await this.readDb();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    const ord = db.orders[index] as any;
    ord.status = status;
    const now = new Date().toISOString();
    if (status === 'processing') {
      ord.processingAt = now;
    } else if (status === 'shipped') {
      ord.shippedAt = now;
    } else if (status === 'delivered') {
      ord.deliveredAt = now;
    } else if (status === 'cancelled') {
      ord.cancelledAt = now;
    }
    await this.writeDb(db);
    return true;
  }

  async updateOrderLocation(id: string, address: string): Promise<boolean> {
    const db = await this.readDb();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    db.orders[index].address = address;
    await this.writeDb(db);
    return true;
  }

  async updateOrderTracking(id: string, trackingId: string, carrierName: string, trackingUrl: string): Promise<boolean> {
    const db = await this.readDb();
    const index = db.orders.findIndex((o) => o.id === id);
    if (index === -1) return false;
    const ord = db.orders[index] as any;
    ord.trackingId = trackingId;
    ord.carrierName = carrierName;
    ord.trackingUrl = trackingUrl;
    ord.status = 'shipped';
    ord.shippedAt = new Date().toISOString();
    await this.writeDb(db);
    return true;
  }

  async linkGuestOrders(userId: number, email?: string, phone?: string): Promise<number> {
    const db = await this.readDb();
    if (!db.orders || !Array.isArray(db.orders)) return 0;

    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    if (!cleanPhone && !cleanEmail) return 0;

    let linkedCount = 0;
    for (const order of db.orders) {
      if (!order.userId) {
        const orderPhoneDigits = order.phone ? String(order.phone).replace(/\D/g, '').slice(-10) : '';
        const orderEmail = (order.userEmail || (order as any).customer_email || (order as any).email || '').trim().toLowerCase();

        const phoneMatch = cleanPhone && orderPhoneDigits && orderPhoneDigits === cleanPhone;
        const emailMatch = cleanEmail && orderEmail && orderEmail === cleanEmail;

        if (phoneMatch || emailMatch) {
          order.userId = userId;
          if (cleanEmail && !order.userEmail) {
            order.userEmail = cleanEmail;
          }
          linkedCount++;
        }
      }
    }

    if (linkedCount > 0) {
      await this.writeDb(db);
    }
    return linkedCount;
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    const db = await this.readDb();
    return db.inquiries;
  }

  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<Inquiry> {
    const db = await this.readDb();
    const nextId = db.inquiries.length > 0 ? Math.max(...db.inquiries.map((i) => i.id || 0)) + 1 : 1;
    const newInquiry: Inquiry = {
      ...inquiry,
      id: nextId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    db.inquiries.push(newInquiry);
    await this.writeDb(db);
    return newInquiry;
  }

  async updateInquiryStatus(id: number, status: 'pending' | 'contacted' | 'closed'): Promise<boolean> {
    const db = await this.readDb();
    const index = db.inquiries.findIndex((i) => i.id === id);
    if (index === -1) return false;
    db.inquiries[index].status = status;
    await this.writeDb(db);
    return true;
  }

  // Users CRUD
  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const db = await this.readDb();
    const nextId = db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
    const newUser: User = {
      ...user,
      id: nextId,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    await this.writeDb(db);
    return newUser;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const db = await this.readDb();
    return db.users.find((u) => u.phone === phone) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.readDb();
    return db.users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const db = await this.readDb();
    return db.users.find((u) => u.username && u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  async getUserById(id: number): Promise<User | null> {
    const db = await this.readDb();
    return db.users.find((u) => u.id === id) || null;
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<boolean> {
    const db = await this.readDb();
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return false;
    db.users[userIndex].password = passwordHash;
    await this.writeDb(db);
    return true;
  }

  async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    const db = await this.readDb();
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return false;
    db.users[userIndex] = { ...db.users[userIndex], ...user };
    await this.writeDb(db);
    return true;
  }

  async deleteUser(id: number): Promise<boolean> {
    const db = await this.readDb();
    const userIndex = db.users.findIndex((u) => u.id === id);
    if (userIndex === -1) return false;
    db.users.splice(userIndex, 1);
    await this.writeDb(db);
    return true;
  }

  // Product stock decrement
  async deductProductStock(id: number, qty: number): Promise<boolean> {
    const db = await this.readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const currentStock = db.products[index].stock || 0;
    db.products[index].stock = Math.max(0, currentStock - qty);
    await this.writeDb(db);
    return true;
  }

  // Product stock restore (on cancellation)
  async restoreProductStock(id: number, qty: number): Promise<boolean> {
    const db = await this.readDb();
    const index = db.products.findIndex((p) => p.id === id);
    if (index === -1) return false;
    const currentStock = db.products[index].stock || 0;
    db.products[index].stock = currentStock + qty;
    await this.writeDb(db);
    return true;
  }

  // Categories CRUD
  async getCategories(): Promise<Category[]> {
    const db = await this.readDb();
    return db.categories || [];
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const db = await this.readDb();
    return db.categories.find((c) => c.id === id) || null;
  }

  async createCategory(category: Omit<Category, 'id'> & { id?: number }): Promise<Category> {
    const db = await this.readDb();
    if (!db.categories) db.categories = [];
    const nextId = category.id || (db.categories.length > 0 ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1);
    const newCategory: Category = { ...category, id: nextId } as Category;
    db.categories.push(newCategory);
    await this.writeDb(db);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category | null> {
    const db = await this.readDb();
    if (!db.categories) return null;
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) return null;
    db.categories[index] = { ...db.categories[index], ...category } as Category;
    await this.writeDb(db);
    return db.categories[index];
  }

  async deleteCategory(id: number): Promise<boolean> {
    const db = await this.readDb();
    if (!db.categories) return false;
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    
    // Cascade delete products in this category
    if (db.products) {
      db.products = db.products.filter((p) => p.categoryId !== id);
    }
    
    db.categories.splice(index, 1);
    await this.writeDb(db);
    return true;
  }

  // Offer Banners
  async getActiveBanners(): Promise<any[]> { return []; }
  async getAllBanners(): Promise<any[]> { return []; }
  async createBanner(banner: any): Promise<any> { return { ...banner, id: Date.now() }; }
  async updateBanner(id: number, data: any): Promise<any> { return null; }
  async deleteBanner(id: number): Promise<boolean> { return true; }

  // Coupons
  async getCoupons(): Promise<any[]> { return []; }
  async getCouponByCode(code: string): Promise<any | null> { return null; }
  async createCoupon(coupon: any): Promise<any> { return { ...coupon, id: Date.now() }; }
  async deleteCoupon(id: number): Promise<boolean> { return true; }
  async recordCouponUsage(couponId: number, userId: number, orderId: string): Promise<void> {}
  async getCouponUsageCount(couponId: number, userId: number): Promise<number> { return 0; }
  async incrementCouponUsage(couponId: number): Promise<void> {}

  // Reviews
  async getProductReviews(productId: number): Promise<any[]> { return []; }
  async getRecentReviews(limit?: number): Promise<any[]> { return []; }
  async getAllReviews(): Promise<any[]> { return []; }
  async createReview(review: any): Promise<any> { return { ...review, id: Date.now() }; }
  async updateReview(id: number, data: { rating?: number; body?: string }): Promise<any | null> { return null; }
  async deleteReview(id: number): Promise<boolean> { return true; }
  async getReviewsByUserId(userId: number): Promise<any[]> { return []; }

  // Reels
  async getActiveReels(): Promise<any[]> { return []; }
  async getAllReels(): Promise<any[]> { return []; }
  async createReel(reel: any): Promise<any> { return { ...reel, id: Date.now() }; }
  async updateReel(id: number, data: any): Promise<any> { return null; }
  async deleteReel(id: number): Promise<boolean> { return true; }

  // Returns
  async createReturn(ret: any): Promise<any> {
    const db = await this.readDb();
    if (!db.returns) db.returns = [];
    const newReturn = {
      ...ret,
      id: db.returns.length > 0 ? Math.max(...db.returns.map((r: any) => r.id)) + 1 : 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.returns.push(newReturn);
    await this.writeDb(db);
    return newReturn;
  }

  async getReturnsByUserId(userId: number): Promise<any[]> {
    const db = await this.readDb();
    if (!db.returns) return [];
    return db.returns.filter((r: any) => r.userId === userId).map((r: any) => {
      const order = db.orders.find((o) => o.id === r.orderId);
      return {
        ...r,
        customerName: order?.name || 'Customer',
        phone: order?.phone || 'No phone'
      };
    });
  }

  async getReturnByOrderId(orderId: string): Promise<any | null> {
    const db = await this.readDb();
    if (!db.returns) return null;
    return db.returns.find((r: any) => r.orderId === orderId) || null;
  }

  async getAllReturns(): Promise<any[]> {
    const db = await this.readDb();
    if (!db.returns) return [];
    return db.returns.map((r: any) => {
      const order = db.orders.find((o) => o.id === r.orderId);
      return {
        ...r,
        customerName: order?.name || 'Customer',
        phone: order?.phone || 'No phone'
      };
    });
  }

  async updateReturnStatus(id: number, status: string, adminNote?: string): Promise<boolean> {
    const db = await this.readDb();
    if (!db.returns) return false;
    const index = db.returns.findIndex((r: any) => r.id === id);
    if (index === -1) return false;
    db.returns[index].status = status as any;
    if (adminNote !== undefined) {
      db.returns[index].adminNote = adminNote;
    }
    db.returns[index].updatedAt = new Date().toISOString();
    await this.writeDb(db);
    return true;
  }
}
