/**
 * migrate-v5.ts — Add username and addresses columns to users table
 * Run: npx tsx server/data/migrate-v5.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
});

async function migrate() {
  console.log('Migration v5: Starting...');
  try {
    // 1. Add username column
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100)`);
    console.log('✅ users.username column added');

    // Create unique index on username (only where not null, so older rows without it won't clash)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
      ON users(username)
      WHERE username IS NOT NULL
    `);
    console.log('✅ unique index on users.username');

    // 2. Add addresses column
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS addresses JSONB DEFAULT '[]'::jsonb`);
    console.log('✅ users.addresses column added');

    console.log('\n✅ Migration v5 completed successfully!');
  } catch (err: any) {
    console.error('Migration v5 ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
