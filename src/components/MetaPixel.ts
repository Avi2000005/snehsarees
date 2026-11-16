/**
 * MetaPixel.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Utility functions to fire Meta Pixel (Facebook Pixel) standard events
 * from React components. Powers both:
 *
 *   Option 1 — Instagram Product Catalog / Shopping:
 *     ViewContent → lets Meta know which products people view (feeds catalog relevance)
 *
 *   Option 2 — Ads / Boosted Posts:
 *     AddToCart, InitiateCheckout, Purchase → conversion tracking for ad ROI
 *
 * Usage:
 *   import { pixelViewContent, pixelAddToCart, pixelInitiateCheckout, pixelPurchase } from '../MetaPixel';
 *
 *   // On product page load:
 *   pixelViewContent({ id: product.id, name: product.name, price: product.effectivePrice });
 *
 *   // On add to cart:
 *   pixelAddToCart({ id: product.id, name: product.name, price: product.price });
 *
 *   // On checkout start:
 *   pixelInitiateCheckout({ value: cartTotal, numItems: cart.length, items: cart });
 *
 *   // On order confirmed:
 *   pixelPurchase({ orderId: order.id, value: order.total, numItems: order.items.length, items: order.items });
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Extend Window to include fbq
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/** Fire a raw fbq event safely (no-op if Pixel not loaded) */
function fbq(...args: unknown[]): void {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
}

// ─── Standard Events ─────────────────────────────────────────────────────────

export interface MetaItemParam {
  id: number | string;
  name?: string;
  price?: number;
  qty?: number;
  category?: string;
}

export interface ViewContentParams {
  id: number | string;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}

/**
 * ViewContent — fires when a user views a product page.
 * Required for Instagram Catalog to match views to products.
 */
export function pixelViewContent(params: ViewContentParams): void {
  fbq('track', 'ViewContent', {
    content_ids:      [String(params.id)],
    content_name:     params.name,
    content_type:     'product',
    value:            params.price,
    currency:         params.currency || 'INR',
    content_category: params.category || 'Sarees',
  });
}

export interface AddToCartParams {
  id: number | string;
  name: string;
  price: number;
  currency?: string;
}

/**
 * AddToCart — fires when a user adds a product to cart.
 * Enables "Add to Cart" custom audiences for retargeting ads.
 */
export function pixelAddToCart(params: AddToCartParams): void {
  fbq('track', 'AddToCart', {
    content_ids:  [String(params.id)],
    content_name: params.name,
    content_type: 'product',
    value:        params.price,
    currency:     params.currency || 'INR',
  });
}

export interface InitiateCheckoutParams {
  value: number;
  numItems?: number;
  currency?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  items?: MetaItemParam[];
}

/**
 * InitiateCheckout — fires when a user reaches the checkout page.
 */
export function pixelInitiateCheckout(params: InitiateCheckoutParams): void {
  const content_ids: string[] =
    params.content_ids || (params.items ? params.items.map((it) => String(it.id)) : []);
  const contents =
    params.contents ||
    (params.items
      ? params.items.map((it) => ({
          id: String(it.id),
          quantity: it.qty || 1,
          item_price: it.price || 0,
        }))
      : undefined);
  const numItems =
    params.numItems ?? (params.items ? params.items.reduce((s, it) => s + (it.qty || 1), 0) : 1);

  fbq('track', 'InitiateCheckout', {
    value:        params.value,
    currency:     params.currency || 'INR',
    content_type: 'product',
    num_items:    numItems,
    ...(content_ids.length > 0 ? { content_ids } : {}),
    ...(contents && contents.length > 0 ? { contents } : {}),
  });
}

export interface PurchaseParams {
  orderId: string | number;
  value: number;
  numItems?: number;
  currency?: string;
  content_ids?: string[];
  contents?: Array<{ id: string; quantity: number; item_price?: number }>;
  items?: MetaItemParam[];
}

/**
 * Purchase — fires after a successful order.
 * This is the standard event for ad ROI measurement and ROAS optimization.
 * Automatically deduplicates using sessionStorage so it never double-fires on refresh.
 */
export function pixelPurchase(params: PurchaseParams): void {
  const orderIdStr = String(params.orderId);

  // Prevent duplicate purchase events for the same order ID (e.g. page refresh)
  if (typeof window !== 'undefined' && orderIdStr) {
    const key = `meta_pixel_purchased_${orderIdStr}`;
    try {
      if (sessionStorage.getItem(key)) {
        console.warn(`[MetaPixel] Purchase event for order #${orderIdStr} already tracked. Skipping duplicate.`);
        return;
      }
      sessionStorage.setItem(key, '1');
    } catch {
      // Ignore sessionStorage exceptions (e.g. private mode)
    }
  }

  const content_ids: string[] =
    params.content_ids || (params.items ? params.items.map((it) => String(it.id)) : []);
  const contents =
    params.contents ||
    (params.items
      ? params.items.map((it) => ({
          id: String(it.id),
          quantity: it.qty || 1,
          item_price: it.price || 0,
        }))
      : undefined);
  const numItems =
    params.numItems ?? (params.items ? params.items.reduce((s, it) => s + (it.qty || 1), 0) : 1);

  fbq('track', 'Purchase', {
    content_type: 'product',
    value:        params.value,
    currency:     params.currency || 'INR',
    num_items:    numItems,
    order_id:     orderIdStr,
    ...(content_ids.length > 0 ? { content_ids } : {}),
    ...(contents && contents.length > 0 ? { contents } : {}),
  });
}

/**
 * Search — fires when a user performs a search.
 */
export function pixelSearch(searchString: string): void {
  fbq('track', 'Search', {
    search_string: searchString,
    content_type:  'product',
  });
}
