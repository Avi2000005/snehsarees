import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { products } from '../../src/data';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, 'schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgresql:Avi@2005@localhost:5432/snehsarees',
});

async function run() {
  console.log('PostgreSQL: Connecting to database...');
  try {
    // 1. Drop existing tables to apply schema modifications
    console.log('PostgreSQL: Dropping existing tables for clean sync...');
    await pool.query('DROP TABLE IF EXISTS order_items CASCADE');
    await pool.query('DROP TABLE IF EXISTS orders CASCADE');
    await pool.query('DROP TABLE IF EXISTS products CASCADE');
    await pool.query('DROP TABLE IF EXISTS categories CASCADE');
    await pool.query('DROP TABLE IF EXISTS inquiries CASCADE');
    await pool.query('DROP TABLE IF EXISTS users CASCADE');

    // 2. Run schema sql statements
    console.log('PostgreSQL: Initializing tables from schema.sql...');
    await pool.query(schemaSql);
    console.log('PostgreSQL: Tables created successfully.');

    // 3. Insert default categories
    console.log('PostgreSQL: Seeding categories...');
    const catRows = [
      { id: 1, name: "Silk", slug: "silk" },
      { id: 2, name: "Cotton", slug: "cotton" },
      { id: 3, name: "Georgette", slug: "georgette" },
      { id: 4, name: "Linen", slug: "linen" }
    ];

    for (const cat of catRows) {
      await pool.query(
        'INSERT INTO categories (id, name, slug, image_url) VALUES ($1, $2, $3, $4)',
        [cat.id, cat.name, cat.slug, '']
      );
    }

    // 4. Insert default products
    console.log('PostgreSQL: Seeding products...');
    for (const p of products) {
      let catId = 1;
      const fab = (p.fabric || '').toLowerCase();
      if (fab.includes('cotton')) catId = 2;
      else if (fab.includes('georgette')) catId = 3;
      else if (fab.includes('linen')) catId = 4;

      await pool.query(`
        INSERT INTO products (
          id, name, price, fabric, occasion, colour, tags, 
          is_reel, views, rating, reviews, blouse, description, image, stock, category_id, variants
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        p.id,
        p.name,
        p.price,
        p.fabric,
        p.occasion,
        p.colour,
        p.tags || [],
        p.isReel || false,
        p.views || '0',
        p.rating || 5.0,
        p.reviews || 0,
        p.blouse || false,
        p.desc || '',
        p.image || '',
        10,
        catId,
        JSON.stringify([])
      ]);
    }

    // 5. Sync sequences to prevent unique key violation on inserts
    console.log('PostgreSQL: Syncing table serial sequences...');
    await pool.query("SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id)+1 FROM categories), 1), false)");
    await pool.query("SELECT setval('products_id_seq', COALESCE((SELECT MAX(id)+1 FROM products), 1), false)");

    console.log('PostgreSQL: Seeding completed successfully!');
  } catch (err: any) {
    console.error('Error during PostgreSQL initialization:', err.message);
  } finally {
    await pool.end();
  }
}

run();
