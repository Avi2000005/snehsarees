import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { ENV } from '../config/env';
import cloudinary from '../config/cloudinary';
import { createShipment } from '../services/shiprocket.service';

// Admin: Get ALL orders (no user filter)
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// Product CRUD
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, fabric, occasion, colour, tags, isReel, views, rating, reviews, blouse, desc, image, stock, categoryId, variants, discountPrice, reelUrl } = req.body;

    if (!name || price === undefined || !fabric || !occasion || !colour) {
      return res.status(400).json({ error: 'Missing product attributes. Name, price, fabric, occasion, and colour are required.' });
    }

    const newProduct = await db.createProduct({
      name,
      price: parseFloat(price),
      discountPrice: discountPrice !== undefined && discountPrice !== null && discountPrice !== '' ? parseFloat(discountPrice) : undefined,
      fabric,
      occasion,
      colour,
      tags: tags || [],
      isReel: isReel || false,
      views: views || '0',
      rating: rating ? parseFloat(rating) : 5.0,
      reviews: reviews ? parseInt(reviews, 10) : 0,
      blouse: blouse || false,
      desc: desc || '',
      image: image || '',
      stock: stock !== undefined ? parseInt(stock, 10) : 10,
      categoryId: categoryId !== undefined ? parseInt(categoryId, 10) : undefined,
      variants: variants || [],
      reelUrl: reelUrl || undefined
    });

    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const updated = await db.updateProduct(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found to update.' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID.' });
    }

    const success = await db.deleteProduct(id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found to delete.' });
    }

    res.json({ success: true, message: 'Product removed from catalog.' });
  } catch (err) {
    next(err);
  }
};

// Order Status Update (with stock restoration on cancellation)
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status string is required.' });
    }

    // Cancellation flow — restore stock
    if (status === 'cancelled') {
      const order = await db.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }

      const currentStatus = (order as any).status || 'placed';
      // Guard: only allow cancellation from pre-shipment statuses
      if (['shipped', 'delivered', 'cancelled'].includes(currentStatus)) {
        return res.status(400).json({
          error: `Cannot cancel an order that is already ${currentStatus}. Contact support for shipped/delivered orders.`,
        });
      }

      // Restore stock for each item in the order
      for (const item of order.items) {
        await db.restoreProductStock(item.id, item.qty);
      }
    }

    const success = await db.updateOrderStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: 'Order not found to update.' });
    }

    const message = status === 'cancelled'
      ? `Order ${id} cancelled. Stock restored for ${(await db.getOrderById(id))?.items.length || 0} item(s).`
      : `Order status shifted to '${status}'.`;

    res.json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// Order Tracking Update — manual entry OR auto-dispatch via Shiprocket
export const updateOrderTracking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { trackingId, carrierName, trackingUrl, autoDispatch } = req.body;

    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    let finalTrackingId = trackingId;
    let finalCarrierName = carrierName;
    let finalTrackingUrl = trackingUrl;

    // Auto-dispatch via Shiprocket if requested
    if (autoDispatch) {
      try {
        const shipment = await createShipment(order as any);
        finalTrackingId = shipment.trackingId || trackingId;
        finalCarrierName = shipment.carrierName || carrierName;
        finalTrackingUrl = shipment.trackingUrl || trackingUrl;
      } catch (err: any) {
        console.error('Auto-dispatch failed, using manual tracking data:', err.message);
      }
    }

    if (!finalTrackingId || !finalCarrierName) {
      return res.status(400).json({ error: 'Tracking ID and carrier name are required.' });
    }

    const success = await db.updateOrderTracking(id, finalTrackingId, finalCarrierName, finalTrackingUrl || '');
    if (!success) {
      return res.status(404).json({ error: 'Order not found to update tracking.' });
    }

    res.json({
      success: true,
      message: `Order ${id} marked as shipped with tracking ${finalTrackingId}.`,
      trackingId: finalTrackingId,
      carrierName: finalCarrierName,
      trackingUrl: finalTrackingUrl,
    });
  } catch (err) {
    next(err);
  }
};

// Inquiry Status Update
export const updateInquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(id) || !status) {
      return res.status(400).json({ error: 'Valid inquiry ID and status are required.' });
    }

    if (status !== 'pending' && status !== 'contacted' && status !== 'closed') {
      return res.status(400).json({ error: "Inquiry status must be one of: 'pending', 'contacted', 'closed'." });
    }

    const success = await db.updateInquiryStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: 'Inquiry not found to update.' });
    }

    res.json({ success: true, message: `Wholesale inquiry status shifted to '${status}'.` });
  } catch (err) {
    next(err);
  }
};

// Order Location Update
export const updateOrderLocation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address string is required.' });
    }

    const success = await db.updateOrderLocation(id, address);
    if (!success) {
      return res.status(404).json({ error: 'Order not found to update location.' });
    }

    res.json({ success: true, message: `Order shipping location updated to '${address}'.` });
  } catch (err) {
    next(err);
  }
};

// Upload Saree Image to Cloudinary
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    // Mock upload if Cloudinary API key is missing
    if (!ENV.CLOUDINARY_API_KEY) {
      console.log('Cloudinary: Operating in demo/mock mode. Simulating upload.');
      return res.json({
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'laxmi_store_sarees' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload stream failed, falling back to mock placeholder:', error.message);
          return res.json({
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          });
        }
        res.json({ imageUrl: result?.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
};
