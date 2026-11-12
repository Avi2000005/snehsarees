/**
 * MetaPixel.tsx
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
 *   pixelInitiateCheckout({ value: cartTotal, numItems: cart.length });
 *
 *   // On order confirmed:
 *   pixelPurchase({ orderId: order.id, value: order.total, numItems: order.items.length });
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

export interface ViewContentParams {
  id: number;
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
    content_ids:   [String(params.id)],
    content_name:  params.name,
    content_type:  'product',
    value:         params.price,
    currency:      params.currency || 'INR',
    content_category: params.category || 'Sarees',
  });
}

export interface AddToCartParams {
  id: number;
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
  numItems: number;
  currency?: string;
}

/**
 * InitiateCheckout — fires when a user reaches the checkout page.
 */
export function pixelInitiateCheckout(params: InitiateCheckoutParams): void {
  fbq('track', 'InitiateCheckout', {
    value:     params.value,
    currency:  params.currency || 'INR',
    num_items: params.numItems,
  });
}

export interface PurchaseParams {
  orderId: string;
  value: number;
  numItems: number;
  currency?: string;
}

/**
 * Purchase — fires after a successful order.
 * This is the most important event for ad ROI measurement.
 */
export function pixelPurchase(params: PurchaseParams): void {
  fbq('track', 'Purchase', {
    content_type: 'product',
    value:        params.value,
    currency:     params.currency || 'INR',
    num_items:    params.numItems,
    order_id:     params.orderId,
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

