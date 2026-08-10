import { products } from '../../src/data';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = __dirname;
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'db.json');

const seededCategories = [
  { id: 1, name: "Silk", slug: "silk" },
  { id: 2, name: "Cotton", slug: "cotton" },
  { id: 3, name: "Georgette", slug: "georgette" },
  { id: 4, name: "Linen", slug: "linen" }
];

const mappedProducts = products.map(p => {
  let catId = 1;
  const fab = (p.fabric || '').toLowerCase();
  if (fab.includes('cotton')) catId = 2;
  else if (fab.includes('georgette')) catId = 3;
  else if (fab.includes('linen')) catId = 4;

  return {
    ...p,
    image: p.image || '',
    stock: 10,
    categoryId: catId
  };
});

const initialDb = {
  users: [],
  categories: seededCategories,
  products: mappedProducts,
  orders: [],
  inquiries: []
};

fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), 'utf-8');
console.log('Seed: Created db.json successfully with Categories & Stock.');
