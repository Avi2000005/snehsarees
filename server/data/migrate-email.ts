/**
 * migrate-email.ts — Add email column to users table for email-based login
 * Run: npx tsx server/data/migrate-email.ts
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: (process.env.DATABASE_URL || '').trim(),
});

async function migrate() {
  console.log('Migration email: Starting...');
  try {
    // Add email column to users (nullable at first so existing rows don't break)
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
    console.log('✅ users.email column added');

    // Create unique index only on non-null emails
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
      ON users(email)
      WHERE email IS NOT NULL
    `);
    console.log('✅ unique index on users.email (nullable-safe)');

    // Show current columns
    const cols = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    console.log('\nUsers table columns:');
    cols.rows.forEach((r: any) => console.log(` - ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));

    console.log('\n✅ Email migration completed successfully!');
  } catch (err: any) {
    console.error('Migration email ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
