import fs from 'fs';
import path from 'path';

const API_FALLBACK_URL = 'https://p01--snehsarees-api--yrw84d9nkxgs.code.run';

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  fabric: string;
  occasion: string;
  colour: string;
  tags: string[];
  isReel: boolean;
  image?: string;
  stock?: number;
}

async function fetchWithTimeout(url: string, timeoutMs: number = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

async function main() {
  console.log('[SSG/Prerender] Starting static generation for Sneh Sarees...');

  // 1. Fetch live catalog (products, categories, banners)
  const apiUrl = (process.env.VITE_API_URL || API_FALLBACK_URL).replace(/\/api\/?$/i, '').replace(/\/+$/, '');

  let products: Product[] = (await fetchWithTimeout(`${apiUrl}/api/products`)) || [];
  let categories: Category[] = (await fetchWithTimeout(`${apiUrl}/api/categories`)) || [];
  let banners = (await fetchWithTimeout(`${apiUrl}/api/banners`)) || [];

  // Fallback to local data if network was unreachable
  if (!products || products.length === 0) {
    try {
      const dbPath = path.resolve(process.cwd(), 'server/data/db.json');
      if (fs.existsSync(dbPath)) {
        const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        products = db.products || [];
        categories = db.categories || [];
      }
    } catch (e) {
      console.warn('[SSG] Local db fallback error:', e);
    }
  }

  console.log(`[SSG] Catalog ready: ${products.length} products, ${categories.length} categories.`);

  const catalogPayload = {
    products,
    categories,
    banners: banners || [],
    reels: [],
    reviews: []
  };

  const catalogJsonString = JSON.stringify(catalogPayload).replace(/<\/script/gi, '<\\/script');

  // 2. Generate Semantic HTML Markup for the Home view (for crawlers, View Source, and instant initial paint)
  const categoryChipsHtml = categories.map((c) => {
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;width:76px;text-align:center;">
        <div style="width:68px;height:68px;border-radius:16px;background:#fff;border:1px solid #E8E0D5;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          ${c.imageUrl ? `<img src="${c.imageUrl}" alt="${c.name}" width="68" height="68" style="width:100%;height:100%;object-fit:cover;" />` : `<span style="font-size:11px;font-weight:700;color:#C4601A;">${c.name.slice(0, 2).toUpperCase()}</span>`}
        </div>
        <span style="font-size:11px;font-weight:600;color:#4A4A4A;line-height:1.2;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${c.name}</span>
      </div>
    `.trim();
  }).join('\n');

  const productCardsHtml = products.slice(0, 24).map((p, idx) => {
    const isPriority = idx < 4;
    const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
    const discountPercent = p.discountPrice && p.discountPrice > 0 ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;

    return `
      <article style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #E8E0D5;box-shadow:0 1px 4px rgba(0,0,0,0.04);display:flex;flex-direction:column;">
        <div style="position:relative;width:100%;aspect-ratio:3/4;background:#F0E8DC;overflow:hidden;">
          ${p.image ? `<img src="${p.image}" alt="${p.name} - Best Kota Doria Saree" width="400" height="533" loading="${isPriority ? 'eager' : 'lazy'}" ${isPriority ? 'fetchpriority="high"' : ''} style="width:100%;height:100%;object-fit:cover;" />` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#C4601A,#7A2F08);"></div>`}
          ${discountPercent > 0 ? `<span style="position:absolute;top:10px;left:10px;background:#C4601A;color:#fff;font-size:9px;font-weight:800;padding:2px 8px;border-radius:999px;text-transform:uppercase;">${discountPercent}% OFF</span>` : ''}
        </div>
        <div style="padding:14px;display:flex;flex-direction:column;gap:6px;flex:1;">
          <h3 style="font-size:14px;font-weight:700;color:#111;margin:0;line-height:1.35;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;min-height:38px;">
            <a href="/?product=${p.id}" style="color:inherit;text-decoration:none;">${p.name}</a>
          </h3>
          <div style="font-size:11px;font-weight:600;color:#666;">${p.fabric || 'Kota Doria'} · ${p.occasion || 'Authentic Handloom'}</div>
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:auto;padding-top:4px;">
            <span style="font-size:16px;font-weight:800;color:#C4601A;">₹${effectivePrice.toLocaleString('en-IN')}</span>
            ${p.discountPrice && p.discountPrice > 0 ? `<span style="font-size:12px;color:#888;text-decoration:line-through;">₹${p.price.toLocaleString('en-IN')}</span>` : ''}
          </div>
        </div>
      </article>
    `.trim();
  }).join('\n');

  const preRenderedHtml = `
    <div id="sneh-prerender-shell" style="max-width:1320px;margin:0 auto;font-family:'Plus Jakarta Sans',sans-serif;color:#1A1A1A;">
      <!-- Top Bar Header -->
      <header style="position:sticky;top:0;background:rgba(255,255,255,0.95);backdrop-filter:blur(8px);border-bottom:1px solid #E8E0D5;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;z-index:20;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:38px;height:38px;border-radius:999px;border:1px solid #F5E4BC;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;">
            <img src="/logo.jpg" alt="Sneh Sarees Logo" width="38" height="38" style="width:100%;height:100%;object-fit:cover;" />
          </div>
          <a href="/" style="font-family:'Playfair Display',serif;font-size:20px;font-weight:700;color:#C4601A;text-decoration:none;">Sneh Sarees</a>
        </div>
        <div style="font-size:12px;font-weight:700;color:#7A2F08;text-transform:uppercase;letter-spacing:0.5px;">Kota, Rajasthan</div>
      </header>

      <main style="padding:14px 16px 80px;">
        <!-- Category Strip -->
        <section aria-label="Product Categories" style="margin-bottom:18px;">
          <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;width:76px;text-align:center;">
              <div style="width:68px;height:68px;border-radius:16px;background:#C4601A;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(196,96,26,0.25);">
                <span style="font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;">ALL</span>
              </div>
              <span style="font-size:11px;font-weight:700;color:#C4601A;">All Sarees</span>
            </div>
            ${categoryChipsHtml}
          </div>
        </section>

        <!-- Featured Banner -->
        <section style="background:linear-gradient(135deg,#C4601A,#7A2F08);border-radius:20px;padding:24px 20px;color:#fff;margin-bottom:24px;box-shadow:0 2px 10px rgba(122,47,8,0.15);display:flex;align-items:center;justify-content:space-between;">
          <div>
            <span style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#F5E4BC;">Special Offers</span>
            <h2 style="font-family:'Playfair Display',serif;font-size:22px;margin:6px 0 10px;line-height:1.25;color:#fff;">New Festive Collection Arrived</h2>
            <a href="/?view=viewall" style="display:inline-block;background:#F5E4BC;color:#7A2F08;font-size:11px;font-weight:800;padding:8px 18px;border-radius:999px;text-decoration:none;text-transform:uppercase;">Explore Collection</a>
          </div>
        </section>

        <!-- Product Grid Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <h2 style="font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#111;margin:0;">
            Best Sarees for Women Collection
          </h2>
          <span style="font-size:12px;font-weight:700;color:#333;">${products.length} Sarees</span>
        </div>

        <!-- Products Grid -->
        <section aria-label="Saree Collection" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;margin-bottom:40px;">
          ${productCardsHtml}
        </section>
      </main>

      <!-- Bottom Nav Bar -->
      <nav aria-label="Bottom Navigation" style="position:fixed;bottom:0;left:0;right:0;height:60px;background:#fff;border-top:1px solid #E8E0D5;display:flex;align-items:center;justify-content:space-around;z-index:30;box-shadow:0 -2px 10px rgba(0,0,0,0.05);">
        <a href="/" style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:700;color:#C4601A;text-decoration:none;">
          <span>Home</span>
        </a>
        <a href="/#/wishlist" style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:600;color:#888;text-decoration:none;">
          <span>Wishlist</span>
        </a>
        <a href="/#/orders" style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:600;color:#888;text-decoration:none;">
          <span>My Orders</span>
        </a>
        <a href="/#/cart" style="display:flex;flex-direction:column;align-items:center;gap:3px;font-size:10px;font-weight:600;color:#888;text-decoration:none;">
          <span>Cart</span>
        </a>
      </nav>
    </div>
  `.trim();

  // 3. Inject into index.html and dist/client/index.html (if exists)
  const targets = [
    path.resolve(process.cwd(), 'index.html'),
    path.resolve(process.cwd(), 'dist/client/index.html')
  ];

  for (const filePath of targets) {
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf8');

    // Inject Catalog JSON
    const scriptTag = `<script id="__SNEH_INITIAL_CATALOG__" type="application/json">${catalogJsonString}</script>`;
    if (content.includes('id="__SNEH_INITIAL_CATALOG__"')) {
      content = content.replace(/<script id="__SNEH_INITIAL_CATALOG__"[^>]*>[\s\S]*?<\/script>/i, scriptTag);
    } else {
      content = content.replace('</head>', `  ${scriptTag}\n  </head>`);
    }

    // Replace root content
    const rootRegex = /<div id="root">[\s\S]*?<\/div>(\s*<script)/i;
    if (rootRegex.test(content)) {
      content = content.replace(rootRegex, `<div id="root">\n${preRenderedHtml}\n    </div>$1`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[SSG] Updated ${filePath} with pre-rendered catalog HTML.`);
  }

  console.log('[SSG] Prerender completed successfully.');
}

main().catch((err) => {
  console.error('[SSG] Fatal prerender error:', err);
  process.exit(0); // non-blocking for build
});

