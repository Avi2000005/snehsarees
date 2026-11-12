/**
 * migrate-order-email-flags.ts
 * Adds missing email notification tracking columns to the orders table.
 *
 * Run with: npx tsx server/data/migrate-order-email-flags.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
});

async function migrate() {
  console.log('Migration: Adding email flag columns to orders table...');
  try {
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_placed_sent BOOLEAN DEFAULT FALSE`);
    console.log('✅ orders.email_placed_sent column added');

    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_shipped_sent BOOLEAN DEFAULT FALSE`);
    console.log('✅ orders.email_shipped_sent column added');

    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS email_delivered_sent BOOLEAN DEFAULT FALSE`);
    console.log('✅ orders.email_delivered_sent column added');

    // Also ensure cancelled_at exists (used in some status updates)
    await pool.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP`);
    console.log('✅ orders.cancelled_at column added');

    // Verify by listing current orders table columns
    const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'orders'
      ORDER BY ordinal_position
    `);
    console.log('\nOrders table columns:');
    cols.rows.forEach((r: any) =>
      console.log(` - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable}, default: ${r.column_default})`)
    );

    console.log('\n✅ Migration completed successfully! Orders will now load in admin panel.');
  } catch (err: any) {
    console.error('Migration ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
