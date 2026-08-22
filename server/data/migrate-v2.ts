/**
 * migrate-v2.ts — Safe migration for Offers, Coupons, Reviews, Reels
 * Uses ADD COLUMN IF NOT EXISTS and CREATE TABLE IF NOT EXISTS — no data loss.
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
});

async function migrate() {
  console.log('Migration v2: Starting...');
  try {
    // 1. Add discount_price to products
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2)`);
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS reel_url TEXT`);
    console.log('✅ products.discount_price, products.reel_url');

    // 2. Add coupon & delivery fields to orders
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50)`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0`);
    await pool.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT`);
    console.log('✅ orders.coupon_code, orders.discount_amount, orders.delivery_fee, categories.description');

    // 3. Create offer_banners table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS offer_banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        badge_text VARCHAR(100),
        cta_text VARCHAR(100) DEFAULT 'Explore Now',
        cta_link VARCHAR(100) DEFAULT 'deals',
        bg_from VARCHAR(30) DEFAULT '#E8920E',
        bg_to VARCHAR(30) DEFAULT '#C4601A',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ offer_banners table');

    // 4. Seed a default banner if empty
    const bannerCount = await pool.query('SELECT COUNT(*) FROM offer_banners');
    if (parseInt(bannerCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO offer_banners (title, subtitle, badge_text, cta_text, cta_link, bg_from, bg_to, sort_order)
        VALUES ('New Festive Collection Arrived', 'Discover exquisite handcrafted sarees for every occasion', 'Special Offers', 'Explore Now', 'deals', '#7B1C2E', '#A0243A', 0)
      `);
      console.log('✅ Default banner seeded');
    }

    // 5. Create coupons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_type VARCHAR(10) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_value DECIMAL(10,2) DEFAULT 0,
        max_discount_cap DECIMAL(10,2),
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        per_user_limit INTEGER DEFAULT 1,
        applicable_category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ coupons table');

    // 6. Create coupon_usages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupon_usages (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_id VARCHAR(100),
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ coupon_usages table');

    // 7. Seed demo coupon
    const cpCount = await pool.query('SELECT COUNT(*) FROM coupons');
    if (parseInt(cpCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO coupons (code, description, discount_type, discount_value, min_order_value, per_user_limit)
        VALUES ('WELCOME10', 'Welcome 10% off for new customers', 'percent', 10, 500, 1),
               ('FLAT200', 'Flat ₹200 off on orders above ₹1500', 'flat', 200, 1500, 1)
      `);
      console.log('✅ Demo coupons seeded: WELCOME10, FLAT200');
    }

    // 8. Create reviews table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        body TEXT,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ reviews table');

    // 9. Create reels table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reels (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        video_url TEXT NOT NULL,
        thumbnail_url TEXT,
        caption TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ reels table');

    // Summary
    const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`);
    console.log('\nAll tables:', tables.rows.map((r: any) => r.table_name).join(', '));
    console.log('\n✅ Migration v2 completed successfully!');
  } catch (err: any) {
    console.error('Migration v2 ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
