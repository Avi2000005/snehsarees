import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

// ─── Offer Banners ────────────────────────────────────────────────────────────
export const getActiveBanners = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await db.getActiveBanners()); } catch (e) { next(e); }
};

export const getAllBanners = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await db.getAllBanners()); } catch (e) { next(e); }
};

export const createBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, subtitle, badgeText, ctaText, ctaLink, bgFrom, bgTo, isActive, sortOrder, expiresAt, discountPercent, categoryId, imageUrl } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required.' });
    const banner = await db.createBanner({ title, subtitle, badgeText, ctaText, ctaLink, bgFrom, bgTo, isActive, sortOrder, expiresAt, discountPercent, categoryId, imageUrl });
    res.status(201).json(banner);
  } catch (e) { next(e); }
};

export const updateBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.updateBanner(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Banner not found.' });
    res.json(updated);
  } catch (e) { next(e); }
};

export const deleteBanner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteBanner(id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// ─── Store Offers & Promos ───────────────────────────────────────────────────
export const getActiveOffers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [offers, coupons] = await Promise.all([
      db.getActiveOffers(),
      db.getCoupons().then(list => list.filter(c => c.isActive && c.showOnStore !== false && (!c.expiresAt || new Date(c.expiresAt) > new Date()))).catch(() => [])
    ]);

    const existingCodes = new Set(offers.map(o => (o.code || '').toUpperCase()).filter(Boolean));
    const couponOffers = coupons
      .filter(c => !existingCodes.has(c.code.toUpperCase()))
      .map(c => ({
        id: -c.id,
        title: c.description || (c.discountType === 'percent' ? `Save ${c.discountValue}% on your order` : `Flat ₹${c.discountValue} OFF`),
        code: c.code,
        conditions: c.minOrderValue > 0 ? `Orders above ₹${c.minOrderValue}` : undefined,
        isActive: true,
        sortOrder: 100,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt
      }));

    res.json([...offers, ...couponOffers]);
  } catch (e) { next(e); }
};

export const getAllOffers = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await db.getAllOffers()); } catch (e) { next(e); }
};

export const createOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, code, conditions, isActive, sortOrder, expiresAt } = req.body;
    if (!title) return res.status(400).json({ error: 'Title / offer text is required.' });
    const offer = await db.createOffer({
      title,
      code: code ? code.trim().toUpperCase() : undefined,
      conditions,
      isActive: isActive !== false,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      expiresAt: expiresAt || undefined
    });
    res.status(201).json(offer);
  } catch (e) { next(e); }
};

export const updateOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.updateOffer(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Offer not found.' });
    res.json(updated);
  } catch (e) { next(e); }
};

export const deleteOffer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await db.deleteOffer(id);
    res.json({ success: true });
  } catch (e) { next(e); }
};
