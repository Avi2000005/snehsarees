/**
 * feed.controller.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Generates Meta / Facebook / Instagram product feed in XML (RSS 2.0 / Google
 * Shopping / Meta Catalog format) and CSV formats.
 *
 * Endpoints:
 *   GET /api/feed/meta        → XML feed (Meta Commerce Manager / Google Merchant)
 *   GET /api/feed/meta.csv    → CSV feed (alternate for Meta catalog upload)
 *   GET /api/feed/verify      → simple text file for domain verification hint
 *
 * The XML feed follows Meta's Product Catalog spec:
 * https://www.facebook.com/business/help/120325381656392
 */

import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { ENV } from '../config/env';

const SITE_URL = (ENV.FRONTEND_URL || 'https://www.snehsarees.in').replace(/\/$/, '');
const BRAND    = 'Sneh Sarees';

// ─── helpers ──────────────────────────────────────────────────────────────────

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags if any
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&apos;');
}

function escapeCsv(val: string | number | undefined): string {
  const s = String(val ?? '').replace(/<[^>]*>?/gm, '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toAbsoluteUrl(pathOrUrl?: string): string {
  if (!pathOrUrl || !pathOrUrl.trim()) return `${SITE_URL}/logo.jpg`;
  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `${SITE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

function buildProductUrl(id: number): string {
  return `${SITE_URL}/?product=${id}`;
}

function getAvailability(stock?: number): string {
  if (stock === undefined) return 'in stock';
  return stock > 0 ? 'in stock' : 'out of stock';
}

// ─── XML feed ─────────────────────────────────────────────────────────────────

export const getMetaXmlFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let products = await db.getProducts();

    // Only active, published products with images
    products = products.filter(
      (p: any) =>
        Boolean(p.image && p.image.trim()) &&
        !p.isArchived &&
        !(Array.isArray(p.tags) && p.tags.includes('archived')) &&
        (p.stock === undefined || p.stock > 0)
    );

    const now = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(BRAND)} - Authentic Kota Doria Sarees</title>
    <link>${SITE_URL}/</link>
    <description>Authentic handloom sarees from ${SITE_URL}</description>
    <g:updated>${now}</g:updated>\n`;

    for (const p of products) {
      const rawPrice = Number(p.price) || 0;
      const rawDiscountPrice = p.discountPrice ? Number(p.discountPrice) : 0;
      const hasDiscount = rawDiscountPrice > 0 && rawDiscountPrice < rawPrice;

      const title = escapeXml(p.name);
      const description = escapeXml(
        p.desc?.trim()
          ? p.desc.trim()
          : `${p.name} - authentic ${p.fabric || 'handloom'} saree by ${BRAND}. Available in ${p.colour || 'various colours'}.`
      );
      const productUrl  = buildProductUrl(p.id);
      const imageUrl    = escapeXml(toAbsoluteUrl(p.image));
      const availability = getAvailability(p.stock);

      // Collect additional images from variants (must also be absolute)
      const additionalImages: string[] = [];
      if (Array.isArray(p.variants)) {
        for (const v of p.variants) {
          if (v.image && v.image.trim() && v.image !== p.image) {
            additionalImages.push(toAbsoluteUrl(v.image));
          }
        }
      }

      xml += `
    <item>
      <g:id>${escapeXml(String(p.id))}</g:id>
      <g:item_group_id>${escapeXml(String(p.id))}</g:item_group_id>
      <title>${title}</title>
      <description>${description}</description>
      <link>${escapeXml(productUrl)}</link>
      <g:image_link>${imageUrl}</g:image_link>`;

      // Additional images (up to 9 more)
      additionalImages.slice(0, 9).forEach(img => {
        xml += `
      <g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`;
      });

      xml += `
      <g:availability>${availability}</g:availability>
      <g:condition>new</g:condition>
      <g:price>${rawPrice}.00 INR</g:price>`;

      if (hasDiscount) {
        xml += `
      <g:sale_price>${rawDiscountPrice}.00 INR</g:sale_price>`;
      }

      xml += `
      <g:brand>${escapeXml(BRAND)}</g:brand>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Ceremonial Clothing &gt; Saris &amp; Lehengas</g:google_product_category>
      <g:product_type>Sarees &gt; ${escapeXml(p.fabric || 'Handloom')}</g:product_type>`;

      if (p.fabric) {
        xml += `
      <g:material>${escapeXml(p.fabric)}</g:material>`;
      }

      if (p.colour) {
        xml += `
      <g:color>${escapeXml(p.colour)}</g:color>`;
      }

      if (p.code) {
        xml += `
      <g:mpn>${escapeXml(p.code)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>`;
      } else {
        xml += `
      <g:identifier_exists>no</g:identifier_exists>`;
      }

      // Shipping (pan-India)
      xml += `
      <g:shipping>
        <g:country>IN</g:country>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    }

    xml += `
  </channel>
</rss>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    next(err);
  }
};

// ─── CSV feed ─────────────────────────────────────────────────────────────────

export const getMetaCsvFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let products = await db.getProducts();

    products = products.filter(
      (p: any) =>
        Boolean(p.image && p.image.trim()) &&
        !p.isArchived &&
        !(Array.isArray(p.tags) && p.tags.includes('archived'))
    );

    const CSV_HEADERS = [
      'id', 'title', 'description', 'availability', 'condition',
      'price', 'sale_price', 'link', 'image_link', 'additional_image_link',
      'brand', 'google_product_category', 'product_type',
      'material', 'color', 'mpn', 'identifier_exists', 'shipping'
    ];

    const rows: string[] = [CSV_HEADERS.join(',')];

    for (const p of products) {
      const rawPrice = Number(p.price) || 0;
      const rawDiscountPrice = p.discountPrice ? Number(p.discountPrice) : 0;
      const hasDiscount = rawDiscountPrice > 0 && rawDiscountPrice < rawPrice;

      const description = (p.desc?.trim())
        ? p.desc.trim()
        : `${p.name} - authentic ${p.fabric || 'handloom'} saree by ${BRAND}.`;

      const additionalImages = Array.isArray(p.variants)
        ? p.variants
            .filter((v: any) => v.image && v.image.trim() && v.image !== p.image)
            .slice(0, 3)
            .map((v: any) => toAbsoluteUrl(v.image))
            .join('|')
        : '';

      const row = [
        escapeCsv(p.id),
        escapeCsv(p.name),
        escapeCsv(description),
        escapeCsv(getAvailability(p.stock)),
        escapeCsv('new'),
        escapeCsv(`${rawPrice}.00 INR`),
        escapeCsv(hasDiscount ? `${rawDiscountPrice}.00 INR` : ''),
        escapeCsv(buildProductUrl(p.id)),
        escapeCsv(toAbsoluteUrl(p.image)),
        escapeCsv(additionalImages),
        escapeCsv(BRAND),
        escapeCsv('Apparel & Accessories > Clothing > Saris & Lehengas'),
        escapeCsv(`Sarees > ${p.fabric || 'Handloom'}`),
        escapeCsv(p.fabric || ''),
        escapeCsv(p.colour || ''),
        escapeCsv(p.code || ''),
        escapeCsv(p.code ? 'yes' : 'no'),
        escapeCsv('IN::0.00 INR'),
      ];
      rows.push(row.join(','));
    }

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', 'attachment; filename="snehsarees-meta-feed.csv"');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(rows.join('\n'));
  } catch (err) {
    next(err);
  }
};


