import { pool } from './server/config/database';
import dotenv from 'dotenv';
dotenv.config();

async function clearFakeTrackingIds() {
  if (!pool) {
    console.error('No database connection');
    process.exit(1);
  }

  // Clear trackingId for orders where trackingId is a Shiprocket internal numeric ID (not a real AWB)
  // Real AWBs are typically long alphanumeric strings like courier tracking numbers
  // Internal Shiprocket IDs are pure numeric 6-12 digit numbers
  const result = await pool.query(`
    UPDATE orders 
    SET tracking_id = NULL, carrier_name = NULL, tracking_url = NULL
    WHERE tracking_id ~ '^[0-9]{6,12}$'
    RETURNING id, tracking_id, status
  `);

  console.log(`Cleared fake tracking IDs from ${result.rowCount} orders:`);
  result.rows.forEach((r: any) => console.log(`  - Order ${r.id}: cleared tracking_id (was: ${r.tracking_id})`));
  
  process.exit(0);
}

clearFakeTrackingIds().catch(e => { console.error(e); process.exit(1); });
