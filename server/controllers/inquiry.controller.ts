import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

export const createInquiry = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, boutique, whatsapp, quantity, preferredType, details } = req.body;

    if (!name || !whatsapp || !quantity || !preferredType) {
      return res.status(400).json({
        error: 'Missing required inquiry parameters: name, whatsapp, quantity, and preferredType are required.',
      });
    }

    const inquiry = await db.createInquiry({
      name,
      boutique,
      whatsapp,
      quantity,
      preferredType,
      details,
    });

    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
};

export const getInquiries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await db.getInquiries();
    res.json(list);
  } catch (err) {
    next(err);
  }
};
