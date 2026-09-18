import { pool } from './server/config/database';
import dotenv from 'dotenv';
dotenv.config();

async function clearStaleTimestamps() {
  if (!pool) {
    console.error('No database connection');
    process.exit(1);
  }

  // Clear shipped_at for orders that are NOT in shipped/delivered status
  // This removes the stale timestamps that were set when orders were incorrectly marked shipped
  const result1 = await pool.query(`
    UPDATE orders 
    SET shipped_at = NULL
    WHERE status NOT IN ('shipped', 'delivered')
      AND shipped_at IS NOT NULL
    RETURNING id, status, shipped_at
  `);
  console.log(`Cleared stale shipped_at from ${result1.rowCount} orders`);
  result1.rows.forEach((r: any) => console.log(`  - Order ${r.id} (${r.status}): cleared shipped_at`));

  // Clear processing_at for orders that are NOT in processing/shipped/delivered status
  const result2 = await pool.query(`
    UPDATE orders 
    SET processing_at = NULL
    WHERE status NOT IN ('processing', 'shipped', 'delivered')
      AND processing_at IS NOT NULL
    RETURNING id, status
  `);
  console.log(`Cleared stale processing_at from ${result2.rowCount} orders`);
  result2.rows.forEach((r: any) => console.log(`  - Order ${r.id} (${r.status}): cleared processing_at`));

  console.log('Done!');
  process.exit(0);
}

clearStaleTimestamps().catch(e => { console.error(e); process.exit(1); });
