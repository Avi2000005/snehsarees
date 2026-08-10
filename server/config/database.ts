import pg from 'pg';
import { ENV } from './env';

const { Pool } = pg;

export let pool: pg.Pool | null = null;

if (ENV.DATABASE_URL) {
  pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    ssl: ENV.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test the connection
  pool.query('SELECT NOW()')
    .then(async () => {
      console.log('Database: PostgreSQL connected successfully.');
      try {
        await pool!.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS processing_at TIMESTAMP;');
        await pool!.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP;');
        await pool!.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;');
        await pool!.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;');
        
        await pool!.query(`
          CREATE TABLE IF NOT EXISTS returns (
            id SERIAL PRIMARY KEY,
            order_id VARCHAR(50) NOT NULL,
            user_id INTEGER,
            reason TEXT NOT NULL,
            description TEXT,
            resolution VARCHAR(50) NOT NULL,
            status VARCHAR(50) DEFAULT 'requested',
            items TEXT,
            admin_note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
      } catch (e: any) {
        console.error('Database migration error:', e.message);
      }
    })
    .catch((err) => {
      console.error('CRITICAL: Database PostgreSQL connection failed! Exiting.', err.message);
      process.exit(1);
    });
} else {
  console.error('CRITICAL: No DATABASE_URL provided. Exiting.');
  process.exit(1);
}
