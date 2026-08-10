import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await db.getCoupons();
    res.json(coupons);
  } catch (e) {
    next(e);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscountCap, usageLimit, perUserLimit, applicableCategoryId, isActive, expiresAt } = req.body;
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Code, discountType, and discountValue are required.' });
    }
    const coupon = await db.createCoupon({
      code,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderValue: parseFloat(minOrderValue || '0'),
      maxDiscountCap: maxDiscountCap ? parseFloat(maxDiscountCap) : undefined,
      usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
      perUserLimit: perUserLimit ? parseInt(perUserLimit) : 1,
      applicableCategoryId: applicableCategoryId ? parseInt(applicableCategoryId) : undefined,
      isActive: isActive !== false,
      expiresAt
    });
    res.status(201).json(coupon);
  } catch (e) {
    next(e);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await db.deleteCoupon(id);
    res.json({ success });
  } catch (e) {
    next(e);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, userId, cartTotal, categoryIds } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required.' });
    }

    const coupon = await db.getCouponByCode(code);
    if (!coupon) {
      return res.status(400).json({ error: 'Invalid coupon code.' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ error: 'Coupon is inactive.' });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Coupon has expired.' });
    }

    if (coupon.usageLimit !== undefined && coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit has been reached.' });
    }

    const total = parseFloat(cartTotal || '0');
    if (total < coupon.minOrderValue) {
      return res.status(400).json({ error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` });
    }

    if (userId) {
      const usageCount = await db.getCouponUsageCount(coupon.id, userId);
      if (usageCount >= coupon.perUserLimit) {
        return res.status(400).json({ error: 'You have reached the usage limit for this coupon.' });
      }
    }

    // Category restrictions check
    if (coupon.applicableCategoryId) {
      const catIds: number[] = Array.isArray(categoryIds) ? categoryIds.map((id: any) => parseInt(id)) : [];
      if (!catIds.includes(coupon.applicableCategoryId)) {
        return res.status(400).json({ error: 'This coupon is not applicable to the items in your cart.' });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = (total * coupon.discountValue) / 100;
      if (coupon.maxDiscountCap !== undefined && coupon.maxDiscountCap !== null && discountAmount > coupon.maxDiscountCap) {
        discountAmount = coupon.maxDiscountCap;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed order total
    if (discountAmount > total) {
      discountAmount = total;
    }

    res.json({
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      description: coupon.description
    });
  } catch (e) {
    next(e);
  }
};
