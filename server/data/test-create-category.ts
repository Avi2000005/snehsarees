import { db } from './db';

async function run() {
  console.log('Testing db.createCategory directly...');
  try {
    const result = await db.createCategory({
      name: 'Test Dynamic Cat',
      slug: 'test-dynamic-cat',
      imageUrl: 'http://example.com/test.jpg'
    });
    console.log('Category creation success! Created item:', result);
    
    // Cleanup
    const success = await db.deleteCategory(result.id);
    console.log('Cleaned up test category:', success);
    process.exit(0);
  } catch (err: any) {
    console.error('ERROR during category creation:', err);
    process.exit(1);
  }
}

run();
