import dotenv from 'dotenv';
dotenv.config();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'info@snehsarees.in').trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'admin123').trim();

async function run() {
  console.log('Testing Category Creation over HTTP...');
  try {
    // 1. Log in to get Admin Token
    console.log('Logging in as Admin:', ADMIN_EMAIL);
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    
    if (!loginRes.ok) {
      throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
    }
    
    const { token } = await loginRes.json();
    console.log('Login success! Admin Token obtained.');

    // 2. Perform HTTP POST to create a Category
    const newCategory = {
      name: 'HTTP Test Category',
      slug: 'http-test-category',
      imageUrl: 'http://images.unsplash.com/photo-1610030469983-98e550d6193c'
    };

    console.log('Sending category POST request...');
    const catRes = await fetch('http://localhost:5000/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(newCategory),
    });

    console.log('Response Status:', catRes.status);
    const responseBody = await catRes.text();
    console.log('Response Body:', responseBody);

    if (catRes.ok) {
      const parsed = JSON.parse(responseBody);
      console.log('Successfully verified! Cleaning up category id:', parsed.id);
      
      // Cleanup delete
      const delRes = await fetch(`http://localhost:5000/api/admin/categories/${parsed.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Cleanup delete response status:', delRes.status);
    }
    process.exit(0);
  } catch (err: any) {
    console.error('HTTP test failed:', err.message);
    process.exit(1);
  }
}

run();
