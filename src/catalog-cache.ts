/**
 * catalog-cache.ts
 *
 * High-performance module-level catalog cache with Stale-While-Revalidate (SWR).
 * Seeds synchronously from window.__SNEH_INITIAL_CATALOG__ or authentic fallback data,
 * ensuring that components render products & categories immediately on the very first
 * paint with ZERO layout shift, ZERO spinner, and ZERO intermediate "No sarees found" messages.
 */

import { API_URL } from './config';
import { products as seedProducts } from './data';
import type { Product, Category, OfferBanner, Reel, Review } from './types';

export type CatalogStatus = 'idle' | 'loading' | 'success' | 'error';

export interface CatalogData {
  products: Product[];
  categories: Category[];
  banners: OfferBanner[];
  reels: Reel[];
  reviews: Review[];
}

export const SEED_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Kotadoria Silk',
    slug: 'silk',
    imageUrl: '',
    description: 'Authentic Kota Doria sarees woven with fine mulberry silk and metallic zari yarns on signature Khat check grids.',
    history: 'Kota Doria weaving in Rajasthan features the union of silk for luster and cotton for strength. The signature Khat grid creates a shimmering translucent drape cherished across royal Rajasthani celebrations.',
    properties: 'Shimmering luster, lightweight Khat square grid, pure silk and zari blend, airy and regal.',
    care: 'Dry clean recommended · store wrapped in soft cotton fabric · keep away from direct moisture.'
  },
  {
    id: 2,
    name: 'Kotadoria Cotton',
    slug: 'cotton',
    imageUrl: '',
    description: 'Featherlight, breathable pure cotton Kota Doria sarees featuring traditional Khat check patterns.',
    history: 'Crafted for centuries by master artisans in Kaithoon, Kota. Cotton Kota Doria is prized for its cooling properties and delicate geometric square weave.',
    properties: 'Ultra-lightweight, highly breathable Khat checks, skin-friendly natural combed cotton.',
    care: 'Gentle hand wash in cold water with mild detergent · dry in shade · light starch if desired.'
  },
  {
    id: 3,
    name: 'Kotadoria Zari',
    slug: 'zari',
    imageUrl: '',
    description: 'Kota Doria sarees framed with intricate temple and floral gold zari borders.',
    history: 'Woven on multi-treadle pit looms in Kota, adding rich metallic borders to breezy translucent Khat bodies.',
    properties: 'Pure metallic gold/silver zari border, geometric square weave body, royal festive elegance.',
    care: 'Dry clean only · store wrapped in muslin cloth.'
  },
  {
    id: 4,
    name: 'Kotadoria Handblock',
    slug: 'handblock',
    imageUrl: '',
    description: 'Traditional Rajasthani Bagru and Dabu wooden block printing on authentic Kota Doria grid fabric.',
    history: 'A celebration of Rajasthani craftsmanship pairing Kaithoon\'s Khat weaving with artisanal natural vegetable block stamping.',
    properties: 'Eco-friendly vegetable dyes, intricate artisan motifs, soft breathable handfeel.',
    care: 'Gentle hand wash separately in cold water · dry in shade.'
  }
];

export const SEED_BANNERS: OfferBanner[] = [
  {
    id: 1,
    title: 'New Festive Collection Arrived',
    badgeText: 'Special Offers',
    ctaText: 'Explore Now',
    ctaLink: 'deals',
    bgFrom: '#C4601A',
    bgTo: '#7A2F08',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString()
  }
];

function getInitialCatalog(): CatalogData {
  if (typeof window !== 'undefined') {
    const scriptEl = document.getElementById('__SNEH_INITIAL_CATALOG__');
    if (scriptEl && scriptEl.textContent) {
      try {
        const parsed = JSON.parse(scriptEl.textContent);
        if (parsed.products && parsed.products.length > 0) {
          return parsed;
        }
      } catch {
        // Fall through to seed defaults
      }
    }
    if ((window as unknown as { __SNEH_INITIAL_CATALOG__?: CatalogData }).__SNEH_INITIAL_CATALOG__) {
      const injected = (window as unknown as { __SNEH_INITIAL_CATALOG__: CatalogData }).__SNEH_INITIAL_CATALOG__;
      if (injected.products && injected.products.length > 0) {
        return injected;
      }
    }
  }

  return {
    products: seedProducts,
    categories: SEED_CATEGORIES,
    banners: SEED_BANNERS,
    reels: [],
    reviews: []
  };
}

let cachedCatalog: CatalogData = getInitialCatalog();
let catalogPromise: Promise<CatalogData> | null = null;
let currentStatus: CatalogStatus = cachedCatalog.products.length > 0 ? 'success' : 'loading';

/** Fetch (or return cached) full catalog data with background revalidation. */
export function getCatalog(forceRefresh: boolean = false): Promise<CatalogData> {
  if (!forceRefresh && catalogPromise) return catalogPromise;

  currentStatus = 'loading';

  catalogPromise = Promise.all([
    fetch(`${API_URL}/api/products`).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`${API_URL}/api/categories`).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`${API_URL}/api/banners`).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`${API_URL}/api/reels`).then(r => (r.ok ? r.json() : null)).catch(() => null),
    fetch(`${API_URL}/api/reviews/recent`).then(r => (r.ok ? r.json() : null)).catch(() => null),
  ]).then(([products, categories, banners, reels, reviews]) => {
    const updated: CatalogData = {
      products: Array.isArray(products) && products.length > 0 ? products : cachedCatalog.products,
      categories: Array.isArray(categories) && categories.length > 0 ? categories : cachedCatalog.categories,
      banners: Array.isArray(banners) && banners.length > 0 ? banners : cachedCatalog.banners,
      reels: Array.isArray(reels) ? reels : cachedCatalog.reels,
      reviews: Array.isArray(reviews) ? reviews : cachedCatalog.reviews,
    };
    cachedCatalog = updated;
    currentStatus = 'success';
    catalogPromise = null;
    return updated;
  }).catch(() => {
    catalogPromise = null;
    currentStatus = cachedCatalog.products.length > 0 ? 'success' : 'error';
    return cachedCatalog;
  });

  return catalogPromise;
}

/** Return the cached catalog synchronously. */
export function getCatalogSync(): CatalogData {
  return cachedCatalog;
}

/** Invalidate the cache (call after admin edits). */
export function invalidateCatalogCache(): void {
  catalogPromise = null;
  getCatalog(true);
}

/** Preload catalog immediately. */
export function preloadCatalog(): Promise<CatalogData> {
  return getCatalog();
}

import { useState, useEffect, useCallback } from 'react';

export function useCatalog(): CatalogData & {
  ready: boolean;
  status: CatalogStatus;
  reload: () => Promise<CatalogData>;
} {
  const [data, setData] = useState<CatalogData>(getCatalogSync);
  const [status, setStatus] = useState<CatalogStatus>(() => currentStatus);

  const reload = useCallback(() => {
    setStatus('loading');
    return getCatalog(true).then((res) => {
      setData(res);
      setStatus('success');
      return res;
    }).catch(() => {
      setStatus('error');
      return getCatalogSync();
    });
  }, []);

  useEffect(() => {
    let mounted = true;
    getCatalog().then(freshData => {
      if (mounted) {
        setData(freshData);
        setStatus('success');
      }
    }).catch(() => {
      if (mounted) {
        setStatus(cachedCatalog.products.length > 0 ? 'success' : 'error');
      }
    });
    return () => { mounted = false; };
  }, []);

  return {
    ...data,
    ready: status === 'success' || data.products.length > 0,
    status,
    reload
  };
}

/**
 * Hook for fetching or resolving a single product.
 */
export function useProduct(productId: number): {
  product: Product | null;
  loading: boolean;
  status: CatalogStatus;
  error: boolean;
  reload: () => void;
} {
  const cached = getCatalogSync().products.find(p => p.id === productId) ?? null;
  const [product, setProduct] = useState<Product | null>(cached);
  const [status, setStatus] = useState<CatalogStatus>(cached ? 'success' : 'loading');

  const fetchSingleProduct = useCallback(() => {
    setStatus('loading');
    let mounted = true;

    // Check catalog first
    getCatalog().then(cat => {
      if (!mounted) return;
      const found = cat.products.find(p => p.id === productId);
      if (found) {
        setProduct(found);
        setStatus('success');
      } else {
        fetch(`${API_URL}/api/products/${productId}`)
          .then(r => {
            if (!r.ok) throw new Error('Not found');
            return r.json();
          })
          .then((d: Product) => {
            if (mounted) {
              setProduct(d);
              setStatus('success');
            }
          })
          .catch(() => {
            if (mounted) {
              setProduct(null);
              setStatus('error');
            }
          });
      }
    });

    return () => { mounted = false; };
  }, [productId]);

  useEffect(() => {
    const fromSync = getCatalogSync().products.find(p => p.id === productId);
    if (fromSync) {
      setProduct(fromSync);
      setStatus('success');
      return;
    }
    return fetchSingleProduct();
  }, [productId, fetchSingleProduct]);

  return {
    product,
    loading: status === 'loading',
    status,
    error: status === 'error',
    reload: fetchSingleProduct
  };
}
