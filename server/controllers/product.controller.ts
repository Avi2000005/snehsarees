import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

async function applyActiveOfferDiscounts(productsList: any[]) {
  try {
    const activeBanners = await db.getActiveBanners();
    const bannerDiscounts = activeBanners.filter(b => b.discountPercent && b.discountPercent > 0);

    if (bannerDiscounts.length === 0) {
      return productsList;
    }

    return productsList.map(product => {
      let bestDiscountPercent = 0;

      for (const banner of bannerDiscounts) {
        if (!banner.categoryId || banner.categoryId === product.categoryId) {
          if (banner.discountPercent && banner.discountPercent > bestDiscountPercent) {
            bestDiscountPercent = banner.discountPercent;
          }
        }
      }

      if (bestDiscountPercent > 0) {
        const offerDiscountPrice = Math.round(product.price * (1 - bestDiscountPercent / 100));
        if (!product.discountPrice || offerDiscountPrice < product.discountPrice) {
          return {
            ...product,
            discountPrice: offerDiscountPrice
          };
        }
      }

      return product;
    });
  } catch (e) {
    console.error('Error applying offer discounts:', e);
    return productsList;
  }
}

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let list = await db.getProducts();

    const { fabric, occasion, colour, search } = req.query;

    if (fabric) {
      list = list.filter((p) => p.fabric.toLowerCase() === String(fabric).toLowerCase());
    }

    if (occasion) {
      list = list.filter((p) => p.occasion.toLowerCase() === String(occasion).toLowerCase());
    }

    if (colour) {
      list = list.filter((p) => p.colour.toLowerCase() === String(colour).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          p.occasion.toLowerCase().includes(q)
      );
    }

    const discountedList = await applyActiveOfferDiscounts(list);
    res.json(discountedList);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const discountedProducts = await applyActiveOfferDiscounts([product]);
    res.json(discountedProducts[0]);
  } catch (err) {
    next(err);
  }
};
