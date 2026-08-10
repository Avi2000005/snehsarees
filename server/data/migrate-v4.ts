import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || 'postgresql://postgres:Avi@2005@localhost:5432/snehsarees').trim(),
});

async function migrate() {
  console.log('Migration v4: Connecting to PostgreSQL...');
  try {
    // 1. Add columns to categories table
    await pool.query(`
      ALTER TABLE categories
        ADD COLUMN IF NOT EXISTS history TEXT,
        ADD COLUMN IF NOT EXISTS properties TEXT,
        ADD COLUMN IF NOT EXISTS care TEXT
    `);
    console.log('✅ Columns history, properties, care added successfully to categories table.');

    console.log('Migration v4: Completed successfully!');
  } catch (err: any) {
    console.error('Migration v4 ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
