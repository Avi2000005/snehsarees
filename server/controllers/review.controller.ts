import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = parseInt(req.params.productId);
    const reviews = await db.getProductReviews(productId);
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

export const getRecentReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
    const reviews = await db.getRecentReviews(limit);
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

export const getAllReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviews = await db.getAllReviews();
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

// GET /api/reviews/my — all reviews by the logged-in user
export const getUserReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Sign in to view your reviews.' });
    const reviews = await db.getReviewsByUserId(user.id);
    res.json(reviews);
  } catch (e) {
    next(e);
  }
};

// POST /api/reviews — write a review (only for delivered orders)
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, body } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'You must be logged in to write a review.' });

    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required.' });
    }

    const parsedRating = parseInt(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Verify purchase from a DELIVERED order
    let isVerified = false;
    try {
      const userOrders = await db.getOrdersByUserId(user.id);
      isVerified = userOrders.some(order =>
        (order.status === 'delivered') &&
        order.items.some(item => item.id === parseInt(productId))
      );
    } catch (err) {
      console.error('Error verifying review purchase status:', err);
    }

    if (!isVerified) {
      return res.status(403).json({ error: 'You can only review products from delivered orders.' });
    }

    const review = await db.createReview({
      productId: parseInt(productId),
      userId: user.id,
      userName: user.name || 'Anonymous Customer',
      rating: parsedRating,
      body: body || '',
      isVerified: true
    });

    // Recalculate product rating
    try {
      const reviews = await db.getProductReviews(parseInt(productId));
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 4.5;
      await db.updateProduct(parseInt(productId), { rating: avgRating, reviews: reviews.length });
    } catch (err) {
      console.error('Failed to update product aggregated review count/rating:', err);
    }

    res.status(201).json(review);
  } catch (e) {
    next(e);
  }
};

// PUT /api/reviews/:id — edit own review
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { rating, body } = req.body;
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Sign in required.' });

    // Ownership check — fetch all user reviews
    const userReviews = await db.getReviewsByUserId(user.id);
    const owned = userReviews.find(r => r.id === id);
    if (!owned) return res.status(403).json({ error: 'You can only edit your own reviews.' });

    const parsedRating = rating ? parseInt(rating) : undefined;
    if (parsedRating !== undefined && (parsedRating < 1 || parsedRating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const updated = await db.updateReview(id, {
      rating: parsedRating,
      body: body !== undefined ? body : undefined,
    });

    if (!updated) return res.status(404).json({ error: 'Review not found.' });

    // Recalculate product rating
    try {
      const reviews = await db.getProductReviews(owned.productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 4.5;
      await db.updateProduct(owned.productId, { rating: avgRating, reviews: reviews.length });
    } catch (err) {
      console.error('Failed to recalculate product rating after edit:', err);
    }

    res.json(updated);
  } catch (e) {
    next(e);
  }
};

// DELETE /api/reviews/:id — delete own review (user-owned)
export const deleteUserReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Sign in required.' });

    // Ownership check
    const userReviews = await db.getReviewsByUserId(user.id);
    const owned = userReviews.find(r => r.id === id);
    if (!owned) return res.status(403).json({ error: 'You can only delete your own reviews.' });

    const success = await db.deleteReview(id);
    if (!success) return res.status(404).json({ error: 'Review not found.' });

    // Recalculate product rating
    try {
      const reviews = await db.getProductReviews(owned.productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = reviews.length > 0 ? parseFloat((totalRating / reviews.length).toFixed(1)) : 4.5;
      await db.updateProduct(owned.productId, { rating: avgRating, reviews: reviews.length });
    } catch (err) {
      console.error('Failed to recalculate product rating after deletion:', err);
    }

    res.json({ success: true });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/admin/reviews/:id — admin delete (no ownership check)
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const success = await db.deleteReview(id);
    res.json({ success });
  } catch (e) {
    next(e);
  }
};
