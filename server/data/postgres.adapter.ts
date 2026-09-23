import { IDatabase } from './db.interface';
import { Product, Order, CartItem, Category, OfferBanner, Coupon, Review, Reel, ReturnRequest } from '../../src/types';
import { Inquiry } from '../models/inquiry.model';
import { User } from '../models/user.model';
import { pool } from '../config/database';

function mapDbRowToProduct(row: any): Product {
  if (!row) return row;
  return {
    id: row.id,
    name: row.name,
    price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    discountPrice: row.discount_price ? (typeof row.discount_price === 'string' ? parseFloat(row.discount_price) : row.discount_price) : undefined,
    fabric: row.fabric,
    occasion: row.occasion,
    colour: row.colour,
    tags: row.tags || [],
    isReel: row.is_reel || false,
    views: row.views,
    rating: typeof row.rating === 'string' ? parseFloat(row.rating) : row.rating,
    reviews: row.reviews,
    blouse: row.blouse || false,
    desc: row.description || '',
    image: row.image || '',
    stock: row.stock !== undefined ? parseInt(row.stock, 10) : 0,
    categoryId: row.category_id !== null && row.category_id !== undefined ? parseInt(row.category_id, 10) : undefined,
    variants: row.variants ? (typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants) : [],
    reelUrl: row.reel_url || undefined,
    code: row.code || (Array.isArray(row.tags) ? row.tags.find((t: string) => t && t.startsWith('code:'))?.replace('code:', '') : undefined),
    isArchived: row.is_archived === true || (Array.isArray(row.tags) && row.tags.includes('archived'))
  };
}

export class PostgresDatabaseAdapter implements IDatabase {
  private getPool() {
    if (!pool) {
      throw new Error('Database: PostgreSQL client pool is not initialized.');
    }
    return pool;
  }

  // Products CRUD
  async getProducts(): Promise<Product[]> {
    const client = this.getPool();
    const result = await client.query('SELECT * FROM products ORDER BY id ASC');
    return result.rows.map(mapDbRowToProduct);
  }

  async getProductById(id: number): Promise<Product | null> {
    const client = this.getPool();
    const result = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] ? mapDbRowToProduct(result.rows[0]) : null;
  }

  async createProduct(product: Omit<Product, 'id'> & { id?: number }): Promise<Product> {
    const client = this.getPool();
    const query = `
      INSERT INTO products (
        name, price, fabric, occasion, colour, tags, 
        is_reel, views, rating, reviews, blouse, description, image, stock, category_id, variants, discount_price, reel_url, is_archived
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;
    const tags = Array.isArray(product.tags) ? [...product.tags] : [];
    if (product.code && !tags.some(t => t.startsWith('code:'))) {
      tags.push('code:' + product.code);
    }
    const values = [
      product.name || 'Untitled Product',
      product.price !== undefined && !isNaN(product.price) ? product.price : 0,
      product.fabric || '',
      product.occasion || '',
      product.colour || '',
      tags,
      product.isReel || false,
      product.views || '0',
      product.rating || 5.0,
      product.reviews || 0,
      product.blouse || false,
      product.desc || '',
      product.image || '',
      product.stock !== undefined && !isNaN(product.stock) ? product.stock : 0,
      product.categoryId !== undefined ? product.categoryId : null,
      JSON.stringify(product.variants || []),
      product.discountPrice !== undefined && !isNaN(product.discountPrice) ? product.discountPrice : null,
      product.reelUrl || null,
      product.isArchived === true
    ];
    const result = await client.query(query, values);
    return mapDbRowToProduct(result.rows[0]);
  }

  async createBulkProducts(products: Array<Omit<Product, 'id'> & { id?: number }>): Promise<Product[]> {
    if (!products || products.length === 0) return [];
    const pool = this.getPool();
    const client = await pool.connect();
    const created: Product[] = [];
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO products (
          name, price, fabric, occasion, colour, tags, 
          is_reel, views, rating, reviews, blouse, description, image, stock, category_id, variants, discount_price, reel_url, is_archived
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *
      `;
      for (const product of products) {
        const tags = Array.isArray(product.tags) ? [...product.tags] : [];
        if (product.code && !tags.some(t => t.startsWith('code:'))) {
          tags.push('code:' + product.code);
        }
        const values = [
          product.name || 'Untitled Product',
          product.price !== undefined && !isNaN(product.price) ? product.price : 0,
          product.fabric || '',
          product.occasion || '',
          product.colour || '',
          tags,
          product.isReel || false,
          product.views || '0',
          product.rating || 5.0,
          product.reviews || 0,
          product.blouse || false,
          product.desc || '',
          product.image || '',
          product.stock !== undefined && !isNaN(product.stock) ? product.stock : 0,
          product.categoryId !== undefined ? product.categoryId : null,
          JSON.stringify(product.variants || []),
          product.discountPrice !== undefined && !isNaN(product.discountPrice) ? product.discountPrice : null,
          product.reelUrl || null,
          product.isArchived === true
        ];
        const res = await client.query(query, values);
        if (res.rows[0]) {
          created.push(mapDbRowToProduct(res.rows[0]));
        }
      }
      await client.query('COMMIT');
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    const client = this.getPool();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const mapping: Record<string, string> = {
      name: 'name',
      price: 'price',
      fabric: 'fabric',
      occasion: 'occasion',
      colour: 'colour',
      tags: 'tags',
      isReel: 'is_reel',
      views: 'views',
      rating: 'rating',
      reviews: 'reviews',
      blouse: 'blouse',
      desc: 'description',
      image: 'image',
      stock: 'stock',
      categoryId: 'category_id',
      variants: 'variants',
      discountPrice: 'discount_price',
      reelUrl: 'reel_url',
      isArchived: 'is_archived'
    };

    for (const [key, value] of Object.entries(product)) {
      if (key === 'code' && value !== undefined) {
        // Tag with code:VALUE
        const current = await this.getProductById(id);
        if (current) {
          const newTags = (current.tags || []).filter(t => !t.startsWith('code:'));
          if (value) newTags.push('code:' + value);
          fields.push(`tags = $${idx}`);
          values.push(newTags);
          idx++;
        }
      } else if (mapping[key] !== undefined && value !== undefined) {
        fields.push(`${mapping[key]} = $${idx}`);
        if (key === 'variants') {
          values.push(JSON.stringify(value || []));
        } else {
          values.push(value);
        }
        idx++;
      }
    }

    if (fields.length === 0) {
      return this.getProductById(id);
    }

    values.push(id);
    const query = `
      UPDATE products 
      SET ${fields.join(', ')} 
      WHERE id = $${idx} 
      RETURNING *
    `;
    const result = await client.query(query, values);
    return result.rows[0] ? mapDbRowToProduct(result.rows[0]) : null;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    const client = this.getPool();
    const query = `
      SELECT o.id, o.user_id as "userId", u.email as "userEmail", o.customer_name as name, o.phone, o.address, o.total, o.method, o.status,
             o.tracking_id as "trackingId", o.carrier_name as "carrierName", o.tracking_url as "trackingUrl",
             o.coupon_code as "couponCode", o.discount_amount as "discountAmount", COALESCE(o.delivery_fee, 0) as "deliveryFee",
             o.processing_at as "processingAt", o.shipped_at as "shippedAt", o.delivered_at as "deliveredAt",
             o.cancelled_at as "cancelledAt", o.created_at as "createdAt",
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.product_id,
                   'name', oi.product_name,
                   'price', oi.price,
                   'fabric', oi.fabric,
                   'colour', oi.colour,
                   'qty', oi.qty
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status NOT IN ('pending', 'pending_payment')
      GROUP BY o.id, u.email
      ORDER BY o.created_at DESC
    `;
    const result = await client.query(query);
    return result.rows;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const client = this.getPool();
    const query = `
      SELECT o.id, o.user_id as "userId", u.email as "userEmail", o.customer_name as name, o.phone, o.address, o.total, o.method, o.status,
             o.tracking_id as "trackingId", o.carrier_name as "carrierName", o.tracking_url as "trackingUrl",
             o.coupon_code as "couponCode", o.discount_amount as "discountAmount", COALESCE(o.delivery_fee, 0) as "deliveryFee",
             o.processing_at as "processingAt", o.shipped_at as "shippedAt", o.delivered_at as "deliveredAt",
             o.cancelled_at as "cancelledAt", o.created_at as "createdAt",
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.product_id,
                   'name', oi.product_name,
                   'price', oi.price,
                   'fabric', oi.fabric,
                   'colour', oi.colour,
                   'qty', oi.qty
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1 AND o.status NOT IN ('pending', 'pending_payment')
      GROUP BY o.id, u.email
      ORDER BY o.created_at DESC
    `;
    const result = await client.query(query, [userId]);
    return result.rows;
  }

  async getOrderById(id: string): Promise<Order | null> {
    const client = this.getPool();
    const query = `
      SELECT o.id, o.user_id as "userId", u.email as "userEmail", o.customer_name as name, o.phone, o.address, o.total, o.method, o.status,
             o.tracking_id as "trackingId", o.carrier_name as "carrierName", o.tracking_url as "trackingUrl",
             o.coupon_code as "couponCode", o.discount_amount as "discountAmount", COALESCE(o.delivery_fee, 0) as "deliveryFee",
             o.processing_at as "processingAt", o.shipped_at as "shippedAt", o.delivered_at as "deliveredAt",
             o.cancelled_at as "cancelledAt", o.created_at as "createdAt",
             COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.product_id,
                   'name', oi.product_name,
                   'price', oi.price,
                   'fabric', oi.fabric,
                   'colour', oi.colour,
                   'qty', oi.qty
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'::json
             ) as items
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id, u.email
    `;
    const result = await client.query(query, [id]);
    return result.rows[0] || null;
  }

  async createOrder(order: Order & { userId?: number }): Promise<Order> {
    const client = this.getPool();
    
    // Using transaction block to ensure atomic inserts
    const dbClient = await client.connect();
    try {
      await dbClient.query('BEGIN');

      const orderQuery = `
        INSERT INTO orders (id, user_id, customer_name, phone, address, total, method, status, coupon_code, discount_amount, delivery_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;
      const orderValues = [
        order.id,
        order.userId || null,
        order.name,
        order.phone,
        order.address,
        order.total,
        order.method,
        (order as any).status || 'placed',
        order.couponCode || null,
        order.discountAmount || 0,
        order.deliveryFee || 0
      ];
      await dbClient.query(orderQuery, orderValues);

      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, product_name, price, fabric, colour, qty)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      for (const item of order.items) {
        const itemValues = [
          order.id,
          item.id,
          item.name,
          item.price,
          item.fabric,
          item.colour,
          item.qty
        ];
        await dbClient.query(itemQuery, itemValues);
      }

      await dbClient.query('COMMIT');
      return order;
    } catch (err) {
      await dbClient.query('ROLLBACK');
      throw err;
    } finally {
      dbClient.release();
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<boolean> {
    const client = this.getPool();
    let query = 'UPDATE orders SET status = $1';
    const values: any[] = [status];
    if (status === 'processing') {
      query += ', processing_at = NOW()';
    } else if (status === 'shipped') {
      query += ', shipped_at = NOW()';
    } else if (status === 'delivered') {
      query += ', delivered_at = NOW()';
    } else if (status === 'cancelled') {
      query += ', cancelled_at = NOW()';
    }
    query += ' WHERE id = $2';
    values.push(id);
    const result = await client.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }

  async updateOrderLocation(id: string, address: string): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('UPDATE orders SET address = $1 WHERE id = $2', [address, id]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateOrderTracking(id: string, trackingId: string, carrierName: string, trackingUrl: string): Promise<boolean> {
    const client = this.getPool();
    // Only mark as 'shipped' with a timestamp if we have a real AWB tracking number.
    // An empty trackingId means the order was just registered on Shiprocket (no courier assigned yet).
    if (trackingId && trackingId.trim().length > 0) {
      const result = await client.query(
        'UPDATE orders SET tracking_id = $1, carrier_name = $2, tracking_url = $3, status = $4, shipped_at = NOW() WHERE id = $5',
        [trackingId, carrierName, trackingUrl, 'shipped', id]
      );
      return (result.rowCount ?? 0) > 0;
    } else {
      // No real AWB yet — just update carrier info, don't change status or shipped_at
      const result = await client.query(
        'UPDATE orders SET carrier_name = COALESCE($1, carrier_name), tracking_url = COALESCE($2, tracking_url) WHERE id = $3',
        [carrierName || null, trackingUrl || null, id]
      );
      return (result.rowCount ?? 0) > 0;
    }
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    const client = this.getPool();
    const query = `
      SELECT id, name, boutique, whatsapp, quantity, preferred_type as "preferredType", details, status, created_at as "createdAt"
      FROM inquiries
      ORDER BY created_at DESC
    `;
    const result = await client.query(query);
    return result.rows;
  }

  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'status' | 'createdAt'>): Promise<Inquiry> {
    const client = this.getPool();
    const query = `
      INSERT INTO inquiries (name, boutique, whatsapp, quantity, preferred_type, details)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, boutique, whatsapp, quantity, preferred_type as "preferredType", details, status, created_at as "createdAt"
    `;
    const values = [
      inquiry.name,
      inquiry.boutique,
      inquiry.whatsapp,
      inquiry.quantity,
      inquiry.preferredType,
      inquiry.details
    ];
    const result = await client.query(query, values);
    return result.rows[0];
  }

  async updateInquiryStatus(id: number, status: 'pending' | 'contacted' | 'closed'): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('UPDATE inquiries SET status = $1 WHERE id = $2', [status, id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Users CRUD
  private mapDbRowToUser(row: any): User | null {
    if (!row) return null;
    return {
      id: row.id,
      phone: row.phone || undefined,
      email: row.email || undefined,
      username: row.username || undefined,
      addresses: row.addresses ? (typeof row.addresses === 'string' ? JSON.parse(row.addresses) : row.addresses) : [],
      password: row.password || undefined,
      name: row.name,
      createdAt: row.createdAt || row.created_at
    };
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const client = this.getPool();
    const query = `
      INSERT INTO users (phone, email, username, name, password, addresses)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, phone, email, username, name, addresses, created_at as "createdAt"
    `;
    const values = [
      user.phone || null,
      user.email || null,
      user.username || null,
      user.name,
      user.password,
      JSON.stringify(user.addresses || [])
    ];
    const result = await client.query(query, values);
    return this.mapDbRowToUser(result.rows[0])!;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const client = this.getPool();
    const result = await client.query('SELECT id, phone, email, username, password, name, addresses, created_at as "createdAt" FROM users WHERE phone = $1', [phone]);
    return this.mapDbRowToUser(result.rows[0]);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = this.getPool();
    const result = await client.query('SELECT id, phone, email, username, password, name, addresses, created_at as "createdAt" FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return this.mapDbRowToUser(result.rows[0]);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const client = this.getPool();
    const result = await client.query('SELECT id, phone, email, username, password, name, addresses, created_at as "createdAt" FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    return this.mapDbRowToUser(result.rows[0]);
  }

  async getUserById(id: number): Promise<User | null> {
    const client = this.getPool();
    const result = await client.query('SELECT id, phone, email, username, password, name, addresses, created_at as "createdAt" FROM users WHERE id = $1', [id]);
    return this.mapDbRowToUser(result.rows[0]);
  }

  async updateUserPassword(id: number, passwordHash: string): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('UPDATE users SET password = $1 WHERE id = $2', [passwordHash, id]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateUser(id: number, user: Partial<User>): Promise<boolean> {
    const client = this.getPool();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const mapping: Record<string, string> = {
      phone: 'phone',
      email: 'email',
      username: 'username',
      name: 'name',
      password: 'password',
      addresses: 'addresses'
    };

    for (const [key, value] of Object.entries(user)) {
      if (mapping[key] !== undefined && value !== undefined) {
        fields.push(`${mapping[key]} = $${idx}`);
        if (key === 'addresses') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        idx++;
      }
    }

    if (fields.length === 0) {
      return true;
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = $${idx}
    `;
    const result = await client.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteUser(id: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Product Stock Decrement
  async deductProductStock(id: number, qty: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query(
      'UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2',
      [qty, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Product Stock Restore (on cancellation)
  async restoreProductStock(id: number, qty: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query(
      'UPDATE products SET stock = stock + $1 WHERE id = $2',
      [qty, id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Categories CRUD
  async getCategories(): Promise<Category[]> {
    const client = this.getPool();
    const result = await client.query('SELECT id, name, slug, image_url as "imageUrl", description, history, properties, care FROM categories ORDER BY id ASC');
    return result.rows;
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const client = this.getPool();
    const result = await client.query('SELECT id, name, slug, image_url as "imageUrl", description, history, properties, care FROM categories WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async createCategory(category: Omit<Category, 'id'> & { id?: number }): Promise<Category> {
    const client = this.getPool();
    const query = 'INSERT INTO categories (name, slug, image_url, description, history, properties, care) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, slug, image_url as "imageUrl", description, history, properties, care';
    const result = await client.query(query, [
      category.name,
      category.slug,
      category.imageUrl || null,
      category.description || null,
      category.history || null,
      category.properties || null,
      category.care || null
    ]);
    return result.rows[0];
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<Category | null> {
    const client = this.getPool();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const mapping: Record<string, string> = {
      name: 'name',
      slug: 'slug',
      imageUrl: 'image_url',
      description: 'description',
      history: 'history',
      properties: 'properties',
      care: 'care'
    };

    for (const [key, value] of Object.entries(category)) {
      if (mapping[key] !== undefined && value !== undefined) {
        fields.push(`${mapping[key]} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) {
      return this.getCategoryById(id);
    }

    values.push(id);
    const query = `UPDATE categories SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, slug, image_url as "imageUrl", description, history, properties, care`;
    const result = await client.query(query, values);
    return result.rows[0] || null;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const client = this.getPool();
    // Cascade delete products in this category
    await client.query('DELETE FROM products WHERE category_id = $1', [id]);
    const result = await client.query('DELETE FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Offer Banners ───────────────────────────────────────────────────────────
  private mapBanner(row: any): OfferBanner {
    return {
      id: row.id, title: row.title, subtitle: row.subtitle,
      badgeText: row.badge_text, ctaText: row.cta_text, ctaLink: row.cta_link,
      bgFrom: row.bg_from, bgTo: row.bg_to, isActive: row.is_active,
      sortOrder: row.sort_order, expiresAt: row.expires_at, createdAt: row.created_at,
      discountPercent: row.discount_percent, categoryId: row.category_id, imageUrl: row.image_url
    };
  }

  async getActiveBanners(): Promise<OfferBanner[]> {
    const client = this.getPool();
    const result = await client.query(
      `SELECT * FROM offer_banners WHERE is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY sort_order ASC, created_at DESC`
    );
    return result.rows.map(this.mapBanner.bind(this));
  }

  async getAllBanners(): Promise<OfferBanner[]> {
    const client = this.getPool();
    const result = await client.query(`SELECT * FROM offer_banners ORDER BY sort_order ASC, created_at DESC`);
    return result.rows.map(this.mapBanner.bind(this));
  }

  async createBanner(b: Omit<OfferBanner, 'id' | 'createdAt'>): Promise<OfferBanner> {
    const client = this.getPool();
    const result = await client.query(
      `INSERT INTO offer_banners (title, subtitle, badge_text, cta_text, cta_link, bg_from, bg_to, is_active, sort_order, expires_at, discount_percent, category_id, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [b.title, b.subtitle||null, b.badgeText||null, b.ctaText||'Explore Now', b.ctaLink||'deals',
       b.bgFrom||'#E8920E', b.bgTo||'#C4601A', b.isActive !== false, b.sortOrder||0, b.expiresAt||null,
       b.discountPercent||0, b.categoryId||null, b.imageUrl||null]
    );
    return this.mapBanner(result.rows[0]);
  }

  async updateBanner(id: number, d: Partial<OfferBanner>): Promise<OfferBanner | null> {
    const client = this.getPool();
    const map: Record<string, string> = { 
      title:'title', subtitle:'subtitle', badgeText:'badge_text', ctaText:'cta_text', ctaLink:'cta_link', 
      bgFrom:'bg_from', bgTo:'bg_to', isActive:'is_active', sortOrder:'sort_order', expiresAt:'expires_at',
      discountPercent:'discount_percent', categoryId:'category_id', imageUrl:'image_url'
    };
    const fields: string[] = []; const values: any[] = []; let idx = 1;
    for (const [k, v] of Object.entries(d)) { if (map[k] && v !== undefined) { fields.push(`${map[k]}=$${idx++}`); values.push(v); } }
    if (!fields.length) return null;
    values.push(id);
    const result = await client.query(`UPDATE offer_banners SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`, values);
    return result.rows[0] ? this.mapBanner(result.rows[0]) : null;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('DELETE FROM offer_banners WHERE id=$1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Coupons ─────────────────────────────────────────────────────────────────
  private mapCoupon(row: any): Coupon {
    return {
      id: row.id, code: row.code, description: row.description,
      discountType: row.discount_type, discountValue: parseFloat(row.discount_value),
      minOrderValue: parseFloat(row.min_order_value||'0'),
      maxDiscountCap: row.max_discount_cap ? parseFloat(row.max_discount_cap) : undefined,
      usageLimit: row.usage_limit, usedCount: row.used_count||0,
      perUserLimit: row.per_user_limit||1,
      applicableCategoryId: row.applicable_category_id||undefined,
      isActive: row.is_active, expiresAt: row.expires_at, createdAt: row.created_at,
    };
  }

  async getCoupons(): Promise<Coupon[]> {
    const client = this.getPool();
    const result = await client.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return result.rows.map(this.mapCoupon);
  }

  async getCouponByCode(code: string): Promise<Coupon | null> {
    const client = this.getPool();
    const result = await client.query('SELECT * FROM coupons WHERE UPPER(code)=UPPER($1)', [code]);
    return result.rows[0] ? this.mapCoupon(result.rows[0]) : null;
  }

  async createCoupon(c: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Promise<Coupon> {
    const client = this.getPool();
    const result = await client.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, max_discount_cap, usage_limit, per_user_limit, applicable_category_id, is_active, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [c.code.toUpperCase(), c.description||null, c.discountType, c.discountValue,
       c.minOrderValue||0, c.maxDiscountCap||null, c.usageLimit||null, c.perUserLimit||1,
       c.applicableCategoryId||null, c.isActive !== false, c.expiresAt||null]
    );
    return this.mapCoupon(result.rows[0]);
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('DELETE FROM coupons WHERE id=$1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async recordCouponUsage(couponId: number, userId: number, orderId: string): Promise<void> {
    const client = this.getPool();
    await client.query('INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1,$2,$3)', [couponId, userId, orderId]);
  }

  async getCouponUsageCount(couponId: number, userId: number): Promise<number> {
    const client = this.getPool();
    const result = await client.query('SELECT COUNT(*) FROM coupon_usages WHERE coupon_id=$1 AND user_id=$2', [couponId, userId]);
    return parseInt(result.rows[0].count);
  }

  async incrementCouponUsage(couponId: number): Promise<void> {
    const client = this.getPool();
    await client.query('UPDATE coupons SET used_count = used_count + 1 WHERE id=$1', [couponId]);
  }

  // ─── Reviews ─────────────────────────────────────────────────────────────────
  private mapReview(row: any): Review {
    return {
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      userName: row.user_name,
      userUsername: row.user_username || undefined,
      rating: row.rating,
      body: row.body,
      isVerified: row.is_verified,
      createdAt: row.created_at,
      productName: row.product_name,
    };
  }

  async getProductReviews(productId: number): Promise<Review[]> {
    const client = this.getPool();
    const result = await client.query(
      'SELECT r.*, p.name as product_name, u.username as user_username FROM reviews r LEFT JOIN products p ON r.product_id=p.id LEFT JOIN users u ON r.user_id=u.id WHERE r.product_id=$1 ORDER BY r.created_at DESC',
      [productId]
    );
    return result.rows.map(this.mapReview.bind(this));
  }

  async getRecentReviews(limit = 8): Promise<Review[]> {
    const client = this.getPool();
    const result = await client.query(
      'SELECT r.*, p.name as product_name, u.username as user_username FROM reviews r LEFT JOIN products p ON r.product_id=p.id LEFT JOIN users u ON r.user_id=u.id ORDER BY r.created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows.map(this.mapReview.bind(this));
  }

  async getAllReviews(): Promise<Review[]> {
    const client = this.getPool();
    const result = await client.query(
      'SELECT r.*, p.name as product_name, u.username as user_username FROM reviews r LEFT JOIN products p ON r.product_id=p.id LEFT JOIN users u ON r.user_id=u.id ORDER BY r.created_at DESC'
    );
    return result.rows.map(this.mapReview.bind(this));
  }

  async createReview(r: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const client = this.getPool();
    const result = await client.query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, body, is_verified) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [r.productId, r.userId||null, r.userName, r.rating, r.body||null, r.isVerified||false]
    );
    return this.mapReview(result.rows[0]);
  }

  async deleteReview(id: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('DELETE FROM reviews WHERE id=$1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async updateReview(id: number, data: { rating?: number; body?: string }): Promise<Review | null> {
    const client = this.getPool();
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (data.rating !== undefined) { fields.push(`rating=$${idx++}`); values.push(data.rating); }
    if (data.body !== undefined) { fields.push(`body=$${idx++}`); values.push(data.body); }
    if (!fields.length) return null;
    values.push(id);
    const result = await client.query(
      `UPDATE reviews SET ${fields.join(', ')} WHERE id=$${idx} RETURNING *`,
      values
    );
    return result.rows[0] ? this.mapReview(result.rows[0]) : null;
  }

  async getReviewsByUserId(userId: number): Promise<Review[]> {
    const client = this.getPool();
    const result = await client.query(
      `SELECT r.*, p.name as product_name, u.username as user_username
       FROM reviews r
       LEFT JOIN products p ON r.product_id = p.id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows.map(this.mapReview.bind(this));
  }

  // ─── Reels ───────────────────────────────────────────────────────────────────
  private mapReel(row: any): Reel {
    return {
      id: row.id, productId: row.product_id, videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url, caption: row.caption,
      isActive: row.is_active, sortOrder: row.sort_order, createdAt: row.created_at,
      product: row.product_name ? {
        id: row.product_id, name: row.product_name, price: parseFloat(row.product_price||'0'),
        discountPrice: row.product_discount_price ? parseFloat(row.product_discount_price) : undefined,
        image: row.product_image, fabric: row.product_fabric||'', occasion: row.product_occasion||'',
        colour: row.product_colour||'', tags: [], isReel: true, rating: 5, reviews: 0, blouse: false, desc: '',
      } : undefined,
    };
  }

  async getActiveReels(): Promise<Reel[]> {
    const client = this.getPool();
    const result = await client.query(`
      SELECT r.*, p.name as product_name, p.price as product_price, p.discount_price as product_discount_price,
             p.image as product_image, p.fabric as product_fabric, p.occasion as product_occasion, p.colour as product_colour
      FROM reels r LEFT JOIN products p ON r.product_id=p.id
      WHERE r.is_active=TRUE ORDER BY r.sort_order ASC, r.created_at DESC
    `);
    return result.rows.map(this.mapReel);
  }

  async getAllReels(): Promise<Reel[]> {
    const client = this.getPool();
    const result = await client.query(`
      SELECT r.*, p.name as product_name, p.price as product_price, p.discount_price as product_discount_price,
             p.image as product_image, p.fabric as product_fabric, p.occasion as product_occasion, p.colour as product_colour
      FROM reels r LEFT JOIN products p ON r.product_id=p.id
      ORDER BY r.sort_order ASC, r.created_at DESC
    `);
    return result.rows.map(this.mapReel);
  }

  async createReel(rl: Omit<Reel, 'id' | 'createdAt'>): Promise<Reel> {
    const client = this.getPool();
    const result = await client.query(
      `INSERT INTO reels (product_id, video_url, thumbnail_url, caption, is_active, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [rl.productId, rl.videoUrl, rl.thumbnailUrl||null, rl.caption||null, rl.isActive !== false, rl.sortOrder||0]
    );
    return this.mapReel(result.rows[0]);
  }

  async updateReel(id: number, d: Partial<Reel>): Promise<Reel | null> {
    const client = this.getPool();
    const map: Record<string, string> = { videoUrl:'video_url', thumbnailUrl:'thumbnail_url', caption:'caption', isActive:'is_active', sortOrder:'sort_order', productId:'product_id' };
    const fields: string[] = []; const values: any[] = []; let idx = 1;
    for (const [k, v] of Object.entries(d)) { if (map[k] && v !== undefined) { fields.push(`${map[k]}=$${idx++}`); values.push(v); } }
    if (!fields.length) return null;
    values.push(id);
    const result = await client.query(`UPDATE reels SET ${fields.join(',')} WHERE id=$${idx} RETURNING *`, values);
    return result.rows[0] ? this.mapReel(result.rows[0]) : null;
  }

  async deleteReel(id: number): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query('DELETE FROM reels WHERE id=$1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // ─── Returns ────────────────────────────────────────────────────────────────

  private mapReturn(row: any): ReturnRequest {
    return {
      id: row.id,
      orderId: row.order_id,
      userId: row.user_id,
      userEmail: row.user_email,
      customerName: row.customer_name,
      phone: row.phone,
      reason: row.reason,
      description: row.description,
      resolution: row.resolution,
      status: row.status,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []),
      adminNote: row.admin_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async createReturn(ret: Omit<ReturnRequest, 'id' | 'createdAt' | 'updatedAt'> & { userId?: number }): Promise<ReturnRequest> {
    const client = this.getPool();
    const result = await client.query(
      `INSERT INTO returns (order_id, user_id, reason, description, resolution, status, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [ret.orderId, ret.userId || null, ret.reason, ret.description || null, ret.resolution, ret.status || 'requested', JSON.stringify(ret.items || [])]
    );
    return this.mapReturn(result.rows[0]);
  }

  async getReturnsByUserId(userId: number): Promise<ReturnRequest[]> {
    const client = this.getPool();
    const result = await client.query(
      `SELECT r.*, o.customer_name, o.phone, u.email as user_email
       FROM returns r
       LEFT JOIN orders o ON o.id = r.order_id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return result.rows.map(row => this.mapReturn(row));
  }

  async getReturnByOrderId(orderId: string): Promise<ReturnRequest | null> {
    const client = this.getPool();
    const result = await client.query(
      `SELECT r.*, o.customer_name, o.phone, u.email as user_email
       FROM returns r
       LEFT JOIN orders o ON o.id = r.order_id
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.order_id = $1`,
      [orderId]
    );
    return result.rows[0] ? this.mapReturn(result.rows[0]) : null;
  }

  async getAllReturns(): Promise<ReturnRequest[]> {
    const client = this.getPool();
    const result = await client.query(
      `SELECT r.*, o.customer_name, o.phone
       FROM returns r
       LEFT JOIN orders o ON o.id = r.order_id
       ORDER BY r.created_at DESC`
    );
    return result.rows.map(row => this.mapReturn(row));
  }

  async updateReturnStatus(id: number, status: string, adminNote?: string): Promise<boolean> {
    const client = this.getPool();
    const result = await client.query(
      `UPDATE returns SET status=$1, admin_note=COALESCE($2, admin_note), updated_at=NOW() WHERE id=$3`,
      [status, adminNote || null, id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
