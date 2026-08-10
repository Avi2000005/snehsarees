/**
 * Safe DB migration — adds tracking columns to the orders table
 * if they don't already exist. Does NOT drop any data.
 */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || 'postgresql://postgres:Avi@2005@localhost:5432/snehsarees').trim(),
});

async function migrate() {
  console.log('Migration: Connecting to PostgreSQL...');
  try {
    await pool.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS tracking_id   VARCHAR(100),
        ADD COLUMN IF NOT EXISTS carrier_name  VARCHAR(100),
        ADD COLUMN IF NOT EXISTS tracking_url  TEXT
    `);
    console.log('Migration: tracking_id, carrier_name, tracking_url columns added (or already existed). ✅');

    // Also ensure status column default exists
    const check = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'orders' AND column_name = 'status'
    `);
    if (check.rows.length === 0) {
      await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'placed'`);
      console.log('Migration: status column added. ✅');
    } else {
      console.log('Migration: status column already exists. ✅');
    }

    // Verify
    const cols = await pool.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position
    `);
    console.log('Migration: orders table columns now:', cols.rows.map((r: any) => r.column_name).join(', '));
    console.log('Migration: Completed successfully!');
  } catch (err: any) {
    console.error('Migration ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
