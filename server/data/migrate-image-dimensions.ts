/**
 * migrate-image-dimensions.ts — Add image dimension fields to products table
 * Run: npx tsx server/data/migrate-image-dimensions.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
});

async function migrate() {
  console.log('Migration image dimensions: Starting...');
  try {
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_width INTEGER`);
    console.log('✅ products.image_width column added');

    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS image_height INTEGER`);
    console.log('✅ products.image_height column added');

    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images_meta JSONB DEFAULT '[]'::jsonb`);
    console.log('✅ products.gallery_images_meta column added');

    console.log('\n✅ Migration completed successfully!');
  } catch (err: any) {
    console.error('Migration ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
