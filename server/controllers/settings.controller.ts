import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

export const getStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await db.getStoreSettings();
    res.json(settings);
  } catch (e) {
    next(e);
  }
};

export const updateStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = req.body || {};
    const updated = await db.updateStoreSettings(payload);
    res.json(updated);
  } catch (e) {
    next(e);
  }
};
