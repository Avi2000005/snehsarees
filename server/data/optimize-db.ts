/**
 * optimize-db.ts — Runs migrations to create index optimizations on the PostgreSQL database
 * Run: npx tsx server/data/optimize-db.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
});

async function optimize() {
  console.log('PostgreSQL Optimisation: Starting...');
  try {
    // 1. Create indexes for foreign keys to speed up JOIN queries
    console.log('Creating idx_orders_user_id on orders...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`);

    console.log('Creating idx_order_items_order_id on order_items...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)`);

    console.log('Creating idx_reviews_product_id on reviews...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id)`);

    console.log('Creating idx_reels_product_id on reels...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_reels_product_id ON reels(product_id)`);

    // 2. Create indexes for category filters on catalog pages
    console.log('Creating idx_products_category_id on products...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`);

    // 3. Create index for sorting products by creation date (New arrivals)
    console.log('Creating idx_products_created_at on products...');
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)`);

    console.log('\n✅ Database optimization completed successfully!');
  } catch (err: any) {
    console.error('❌ Optimisation ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

optimize();
