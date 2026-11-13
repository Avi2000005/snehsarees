/**
 * catalog-cache.ts
 *
 * Module-level in-memory cache for the catalog data that every page needs
 * (products, categories, banners, reels, reviews).
 *
 * Fetches once on first access, then returns the cached result instantly on
 * every subsequent call — so views never have to show a loading spinner for
 * data that was already fetched during app bootstrap.
 */

import { API_URL } from './config';
import type { Product, Category, OfferBanner, Reel, Review } from './types';

export interface CatalogData {
  products: Product[];
  categories: Category[];
  banners: OfferBanner[];
  reels: Reel[];
  reviews: Review[];
}

let cachedCatalog: CatalogData | null = null;
let catalogPromise: Promise<CatalogData> | null = null;

/** Fetch (or return cached) full catalog data. */
export function getCatalog(): Promise<CatalogData> {
  if (cachedCatalog) return Promise.resolve(cachedCatalog);
  if (catalogPromise) return catalogPromise;

  catalogPromise = Promise.all([
    fetch(`${API_URL}/api/products`).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/categories`).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/banners`).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/reels`).then(r => r.json()).catch(() => []),
    fetch(`${API_URL}/api/reviews/recent`).then(r => r.json()).catch(() => []),
  ]).then(([products, categories, banners, reels, reviews]) => {
    const data: CatalogData = {
      products: Array.isArray(products) ? products : [],
      categories: Array.isArray(categories) ? categories : [],
      banners: Array.isArray(banners) ? banners : [],
      reels: Array.isArray(reels) ? reels : [],
      reviews: Array.isArray(reviews) ? reviews : [],
    };
    cachedCatalog = data;
    catalogPromise = null;
    return data;
  }).catch(() => {
    catalogPromise = null;
    const empty: CatalogData = { products: [], categories: [], banners: [], reels: [], reviews: [] };
    return empty;
  });

  return catalogPromise;
}

/** Return the cached catalog synchronously (empty arrays if not yet loaded). */
export function getCatalogSync(): CatalogData {
  return cachedCatalog ?? { products: [], categories: [], banners: [], reels: [], reviews: [] };
}

/** Invalidate the cache (call after admin makes changes). */
export function invalidateCatalogCache(): void {
  cachedCatalog = null;
  catalogPromise = null;
}

/**
 * Kick off the catalog fetch immediately so it races the app bootstrap.
 * Call this once from main.tsx before createRoot().render().
 */
export function preloadCatalog(): void {
  getCatalog();
}

/**
 * React hook: returns catalog data, kicking off a fetch if needed.
 * Renders with cached data instantly if available; otherwise triggers a
 * re-render once data arrives.
 */
import { useState, useEffect } from 'react';

export function useCatalog(): CatalogData & { ready: boolean } {
  const [data, setData] = useState<CatalogData>(getCatalogSync);
  const [ready, setReady] = useState(cachedCatalog !== null);

  useEffect(() => {
    if (cachedCatalog) {
      setData(cachedCatalog);
      setReady(true);
      return;
    }
    let mounted = true;
    getCatalog().then(d => {
      if (mounted) {
        setData(d);
        setReady(true);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { ...data, ready };
}

/**
 * React hook: returns a single product from the catalog by id.
 * Falls back to a fresh API fetch if not found in catalog (direct URL open).
 */
export function useProduct(productId: number): {
  product: Product | null;
  loading: boolean;
  error: boolean;
} {
  const cached = getCatalogSync().products.find(p => p.id === productId) ?? null;
  const [product, setProduct] = useState<Product | null>(cached);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Check cache first (may now be populated from preload)
    const fromCache = getCatalogSync().products.find(p => p.id === productId) ?? null;
    if (fromCache) {
      setProduct(fromCache);
      setLoading(false);
      return;
    }

    // Not in cache yet — wait for catalog then check again
    let mounted = true;
    setLoading(true);
    setError(false);

    getCatalog().then(catalog => {
      if (!mounted) return;
      const found = catalog.products.find(p => p.id === productId) ?? null;
      if (found) {
        setProduct(found);
        setLoading(false);
      } else {
        // Product not in bulk list (archived/unpublished) — try individual endpoint
        return fetch(`${API_URL}/api/products/${productId}`)
          .then(r => { if (!r.ok) throw new Error(); return r.json(); })
          .then((data: Product) => {
            if (mounted) { setProduct(data); setLoading(false); }
          })
          .catch(() => {
            if (mounted) { setProduct(null); setLoading(false); setError(true); }
          });
      }
    }).catch(() => {
      if (mounted) { setProduct(null); setLoading(false); setError(true); }
    });

    return () => { mounted = false; };
  }, [productId]);

  return { product, loading, error };
}

