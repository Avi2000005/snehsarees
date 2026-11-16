/**
 * backfill-image-dimensions.ts
 * Safely inspects existing products without dimensions and backfills width & height.
 * Does NOT modify or delete image files.
 * Run: npx tsx scripts/backfill-image-dimensions.ts
 */
import fs from 'fs';
import path from 'path';
import { getImageDimensions } from '../server/utils/imageDimensions';
import { db } from '../server/data/db';

async function fetchBuffer(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) return null;
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }
    const localPath = path.resolve(process.cwd(), url.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
    return null;
  } catch {
    return null;
  }
}

async function run() {
  console.log('Starting backfill of product image dimensions...');
  try {
    const products = await db.getProducts();
    console.log(`Found ${products.length} products to check.`);

    let updatedCount = 0;
    for (const p of products) {
      let needsUpdate = false;
      const updateData: any = {};

      if (p.image && (!p.imageWidth || !p.imageHeight)) {
        const buf = await fetchBuffer(p.image);
        if (buf) {
          const dims = getImageDimensions(buf);
          if (dims) {
            updateData.imageWidth = dims.width;
            updateData.imageHeight = dims.height;
            needsUpdate = true;
            console.log(`Product #${p.id} (${p.name}): detected ${dims.width}x${dims.height}`);
          }
        }
      }

      if (needsUpdate) {
        await db.updateProduct(p.id, updateData);
        updatedCount++;
      }
    }

    console.log(`Backfill finished. Updated ${updatedCount} products.`);
  } catch (err: any) {
    console.error('Error during backfill:', err.message);
  }
}

run();
