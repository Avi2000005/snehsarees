import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import cloudinary from '../config/cloudinary';
import { ENV } from '../config/env';

// Helper to upload review photo to Cloudinary (or fallback)
export const uploadReviewBufferToCloudinary = (fileBuffer: Buffer): Promise<string> => {
  return new Promise((resolve) => {
    if (!ENV.CLOUDINARY_API_KEY) {
      return resolve(`data:image/jpeg;base64,${fileBuffer.toString('base64')}`);
    }
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'laxmi_store_reviews',
        transformation: [{ width: 1400, height: 1800, crop: 'limit', quality: 'auto' }]
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          console.warn('Cloudinary review upload failed, falling back to base64:', error?.message);
          return resolve(`data:image/jpeg;base64,${fileBuffer.toString('base64')}`);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Upload review images (up to 5 photos)
export const uploadReviewImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    const urls = await Promise.all(
      files.map(async (file) => {
        return await uploadReviewBufferToCloudinary(file.buffer);
      })
    );

    res.json({ success: true, urls });
  } catch (err) {
    next(err);
  }
};

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

// POST /api/reviews — write a review (anyone can review, name asked and saved)
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, rating, body, userName, images } = req.body;
    const user = (req as any).user;

    if (!productId || !rating) {
      return res.status(400).json({ error: 'Product ID and rating are required.' });
    }

    // Name is required — anyone can submit by providing their name
    let reviewerName = (typeof userName === 'string' && userName.trim()) || '';
    if (!reviewerName && user && user.id) {
      try {
        const dbUser = await db.getUserById(user.id);
        reviewerName = dbUser?.name || dbUser?.username || '';
      } catch (err) {
        // ignore
      }
    }
    if (!reviewerName && user) {
      reviewerName = user.phone || 'Verified Customer';
    }

    if (!reviewerName) {
      return res.status(400).json({ error: 'Please enter your name to submit a review.' });
    }

    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    // Check if the user is a verified buyer with a delivered order
    let isVerified = false;
    if (user && user.id) {
      try {
        const userOrders = await db.getOrdersByUserId(user.id);
        isVerified = userOrders.some(order =>
          (order.status === 'delivered') &&
          order.items.some(item => item.id === parseInt(productId))
        );
      } catch (err) {
        console.error('Error verifying review purchase status:', err);
      }
    }

    // Clean images array
    const reviewImages: string[] = Array.isArray(images)
      ? images.filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      : [];

    const review = await db.createReview({
      productId: parseInt(productId),
      userId: user?.id || null,
      userName: reviewerName,
      rating: parsedRating,
      body: body ? String(body).trim() : '',
      isVerified,
      images: reviewImages
    });

    // Recalculate product rating & reviews count
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
    const { rating, body, images } = req.body;
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
      images: Array.isArray(images) ? images : undefined,
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
