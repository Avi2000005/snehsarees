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
