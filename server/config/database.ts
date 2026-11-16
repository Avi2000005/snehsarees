import pg from 'pg';
import { ENV } from './env';

const { Pool } = pg;

export let pool: pg.Pool | null = null;

if (ENV.DATABASE_URL) {
  const isNeonOrRemote = ENV.DATABASE_URL.includes('neon.tech') || ENV.DATABASE_URL.includes('sslmode=require') || ENV.NODE_ENV === 'production';

  pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    ssl: isNeonOrRemote ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,  // 30s — Neon free-tier cold-start can take ~10–20s
  });

  pool.on('error', (err) => {
    console.warn('PostgreSQL pool idle connection warning:', err.message);
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
        await pool!.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;');
        await pool!.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT \'{}\';');
        await pool!.query('ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT \'{}\';');
        
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

        await pool!.query(`
          CREATE TABLE IF NOT EXISTS offers (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            code VARCHAR(50),
            conditions TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INTEGER DEFAULT 0,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await pool!.query(`
          CREATE TABLE IF NOT EXISTS store_settings (
            key VARCHAR(100) PRIMARY KEY,
            value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);

        await pool!.query(`
          CREATE TABLE IF NOT EXISTS policies (
            id SERIAL PRIMARY KEY,
            slug VARCHAR(100) UNIQUE NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            is_published BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          CREATE INDEX IF NOT EXISTS idx_policies_slug ON policies(slug);
          CREATE INDEX IF NOT EXISTS idx_policies_published ON policies(is_published);
        `);
      } catch (e: any) {
        console.error('Database migration error:', e.message);
      }
    })
    .catch((err) => {
      console.error('Database: PostgreSQL connection failed:', err.message);
    });
} else {
  console.error('CRITICAL: No DATABASE_URL provided. Exiting.');
  process.exit(1);
}
