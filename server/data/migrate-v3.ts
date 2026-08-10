import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || 'postgresql://postgres:Avi@2005@localhost:5432/snehsarees').trim(),
});

async function migrate() {
  console.log('Migration v3: Connecting to PostgreSQL...');
  try {
    // 1. Add columns to offer_banners
    await pool.query(`
      ALTER TABLE offer_banners
        ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS image_url TEXT
    `);
    console.log('✅ Columns discount_percent, category_id, image_url added successfully to offer_banners table.');

    console.log('Migration v3: Completed successfully!');
  } catch (err: any) {
    console.error('Migration v3 ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
