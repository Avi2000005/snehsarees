import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

export const getActiveReels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reels = await db.getActiveReels();
    res.json(reels);
  } catch (e) {
    next(e);
  }
};

export const getAllReels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reels = await db.getAllReels();
    res.json(reels);
  } catch (e) {
    next(e);
  }
};

export const createReel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, videoUrl, thumbnailUrl, caption, isActive, sortOrder } = req.body;
    if (!productId || !videoUrl) {
      return res.status(400).json({ error: 'Product ID and Video URL are required.' });
    }
    const reel = await db.createReel({
      productId: parseInt(productId),
      videoUrl,
      thumbnailUrl,
      caption,
      isActive: isActive !== false,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0
    });
    res.status(201).json(reel);
  } catch (e) {
    next(e);
  }
};

export const updateReel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.updateReel(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Reel not found.' });
    }
    res.json(updated);
  } catch (e) {
    next(e);
  }
};

export const deleteReel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await db.deleteReel(id);
    res.json({ success });
  } catch (e) {
    next(e);
  }
};
