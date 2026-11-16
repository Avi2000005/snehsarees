import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { ENV } from '../config/env';
import cloudinary from '../config/cloudinary';
import { createShipment, syncShiprocketOrderStatus, syncActiveOrdersWithShiprocket } from '../services/shiprocket.service';
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail, sendOrderShippedEmail, sendOrderDeliveredEmail } from '../services/order-email.service';
import { sanitizeProductDescriptionServer } from '../utils/sanitizeHtml';
import { getImageDimensions } from '../utils/imageDimensions';

// Admin: Get ALL confirmed orders (exclude unpaid / pending orders)
export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await db.getOrders();
    const confirmedOrders = (orders || []).filter(
      (o: any) => o.status !== 'pending' && o.status !== 'pending_payment'
    );
    res.json(confirmedOrders);
  } catch (err) {
    next(err);
  }
};

// Product CRUD
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, price, fabric, occasion, colour, tags, isReel, views, rating, reviews, blouse, desc, image, stock, categoryId, variants, discountPrice, reelUrl, isArchived, galleryImages, imageWidth, imageHeight, galleryImagesMeta } = req.body;

    const newProduct = await db.createProduct({
      name: name ? String(name).trim() : 'Untitled Saree',
      price: price !== undefined && price !== null && price !== '' ? parseFloat(price) : 0,
      discountPrice: discountPrice !== undefined && discountPrice !== null && discountPrice !== '' ? parseFloat(discountPrice) : undefined,
      fabric: fabric ? String(fabric).trim() : '',
      occasion: occasion ? String(occasion).trim() : '',
      colour: colour ? String(colour).trim() : '',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' && tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : []),
      isReel: Boolean(isReel),
      views: views ? String(views) : '0',
      rating: rating ? parseFloat(rating) : 5.0,
      reviews: reviews ? parseInt(reviews, 10) : 0,
      blouse: Boolean(blouse),
      desc: desc ? sanitizeProductDescriptionServer(desc) : '',
      image: image ? String(image).trim() : '',
      imageWidth: imageWidth ? parseInt(imageWidth, 10) : undefined,
      imageHeight: imageHeight ? parseInt(imageHeight, 10) : undefined,
      galleryImagesMeta: Array.isArray(galleryImagesMeta) ? galleryImagesMeta : undefined,
      stock: stock !== undefined && stock !== null && stock !== '' ? parseInt(stock, 10) : 10,
      categoryId: categoryId !== undefined && categoryId !== null && categoryId !== '' ? parseInt(categoryId, 10) : undefined,
      variants: Array.isArray(variants) ? variants : [],
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      reelUrl: reelUrl ? String(reelUrl).trim() : undefined,
      isArchived: Boolean(isArchived)
    });

    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
};

// Bulk Product Creation from Excel / CSV
export const createBulkProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products provided in upload payload.' });
    }

    // Pre-fetch all categories for intelligent multi-level matching
    const categories = await db.getCategories();
    
    const resolveCategoryId = (catInput?: any, fabricInput?: string): number | undefined => {
      if (catInput !== undefined && catInput !== null && catInput !== '') {
        // 1. Direct integer ID
        const parsedId = parseInt(String(catInput).trim(), 10);
        if (!isNaN(parsedId) && categories.some(c => c.id === parsedId)) {
          return parsedId;
        }

        const catStr = String(catInput).trim().toLowerCase();
        const catNormalized = catStr.replace(/[^a-z0-9]/g, '');

        // 2. Exact match on Name or Slug (case-insensitive)
        const exactMatch = categories.find(
          c => c.name.trim().toLowerCase() === catStr || c.slug.trim().toLowerCase() === catStr
        );
        if (exactMatch) return exactMatch.id;

        // 3. Normalized match (ignoring spaces, dashes, underscores like 'kota-doria', 'kotadoria')
        const normalizedMatch = categories.find(
          c => c.name.toLowerCase().replace(/[^a-z0-9]/g, '') === catNormalized ||
               c.slug.toLowerCase().replace(/[^a-z0-9]/g, '') === catNormalized
        );
        if (normalizedMatch) return normalizedMatch.id;

        // 4. Substring / partial match (e.g. 'Kota Silk' matches 'Silk' or 'Kota Doria')
        const substringMatch = categories.find(
          c => catStr.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(catStr)
        );
        if (substringMatch) return substringMatch.id;
      }

      // 5. Fallback: If Category is blank, check if Fabric matches any category
      if (fabricInput && typeof fabricInput === 'string') {
        const fabStr = fabricInput.trim().toLowerCase();
        const fabMatch = categories.find(c => fabStr.includes(c.name.toLowerCase()));
        if (fabMatch) return fabMatch.id;
      }

      return undefined;
    };

    const sanitizedList = products.map((item: any) => {
      // Resolve categoryId using multi-level matching
      const categoryId = resolveCategoryId(
        item.categoryId !== undefined && item.categoryId !== '' ? item.categoryId : item.category,
        item.fabric
      );

      // Parse tags
      let tags: string[] = [];
      if (Array.isArray(item.tags)) {
        tags = item.tags;
      } else if (typeof item.tags === 'string' && item.tags.trim()) {
        tags = item.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }

      // Parse blouse
      let blouse = false;
      if (typeof item.blouse === 'boolean') {
        blouse = item.blouse;
      } else if (typeof item.blouse === 'string') {
        const lower = item.blouse.trim().toLowerCase();
        blouse = lower === 'yes' || lower === 'true' || lower === '1' || lower.includes('blouse') || lower === 'with blouse';
      }

      let rawPrice = item.price !== undefined && item.price !== null && item.price !== '' ? parseFloat(item.price) : 0;
      let rawDiscount = item.discountPrice !== undefined && item.discountPrice !== null && item.discountPrice !== '' ? parseFloat(item.discountPrice) : undefined;

      let price = isNaN(rawPrice) ? 0 : rawPrice;
      let discountPrice = rawDiscount !== undefined && !isNaN(rawDiscount) ? rawDiscount : undefined;

      // Ensure price is the higher MRP and discountPrice is the lower selling price
      if (discountPrice !== undefined && discountPrice > 0 && price > 0) {
        if (discountPrice > price) {
          const temp = price;
          price = discountPrice;
          discountPrice = temp;
        } else if (discountPrice === price) {
          discountPrice = undefined;
        }
      }

      let stock = 0;
      if (item.stock !== undefined && item.stock !== null && item.stock !== '') {
        const parsedStock = parseInt(String(item.stock).trim(), 10);
        stock = isNaN(parsedStock) ? 0 : parsedStock;
      }

      return {
        name: item.name ? String(item.name).trim() : 'Untitled Saree',
        price,
        discountPrice,
        fabric: item.fabric ? String(item.fabric).trim() : '',
        occasion: item.occasion ? String(item.occasion).trim() : '',
        colour: item.colour || item.color ? String(item.colour || item.color).trim() : '',
        tags,
        isReel: Boolean(item.isReel),
        views: item.views ? String(item.views) : '0',
        rating: item.rating ? parseFloat(item.rating) : 5.0,
        reviews: item.reviews ? parseInt(item.reviews, 10) : 0,
        blouse,
        desc: item.desc || item.description ? sanitizeProductDescriptionServer(item.desc || item.description) : '',
        image: item.image || item.imageUrl ? String(item.image || item.imageUrl).trim() : '',
        stock,
        categoryId,
        variants: Array.isArray(item.variants) ? item.variants : [],
        galleryImages: Array.isArray(item.galleryImages) ? item.galleryImages : [],
        reelUrl: item.reelUrl ? String(item.reelUrl).trim() : undefined,
        code: item.code ? String(item.code).trim() : undefined,
        isArchived: Boolean(item.isArchived)
      };
    });

    const created = await db.createBulkProducts(sanitizedList);
    res.status(201).json({
      success: true,
      count: created.length,
      products: created
    });
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

    const payload = { ...req.body };
    if (payload.desc !== undefined && payload.desc !== null) {
      payload.desc = sanitizeProductDescriptionServer(payload.desc);
    }

    const updated = await db.updateProduct(id, payload);
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

    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const currentStatus = (order as any).status || 'placed';

    // Transitioning from pending_payment to confirmed -> deduct stock now
    if (currentStatus === 'pending_payment' && (status === 'placed' || status === 'paid' || status === 'processing')) {
      for (const item of order.items) {
        await db.deductProductStock(item.id, item.qty);
      }

      // Send order confirmation email when admin confirms order
      sendOrderConfirmationEmail(order).catch((e: any) => {
        console.error(`[Admin] Confirmation email dispatch error for ${id}:`, e.message);
      });

      // Auto-dispatch to Shiprocket when admin confirms a ManualUPI order
      try {
        const shipment = await createShipment(order as any);
        if (shipment.trackingId) {
          await db.updateOrderTracking(id, shipment.trackingId, shipment.carrierName, shipment.trackingUrl);
          console.log(`[Admin] Shiprocket shipment auto-created for ${id} — AWB: ${shipment.trackingId}`);
        }
      } catch (shipErr: any) {
        console.error(`[Admin] Shiprocket auto-dispatch failed for ${id}:`, shipErr.message);
      }
    }

    // Cancellation flow — restore stock (only if stock was already deducted)
    if (status === 'cancelled') {
      // Guard: only allow cancellation from pre-shipment statuses
      if (['shipped', 'delivered', 'cancelled'].includes(currentStatus)) {
        return res.status(400).json({
          error: `Cannot cancel an order that is already ${currentStatus}. Contact support for shipped/delivered orders.`,
        });
      }

      // Restore stock for each item in the order (only if not pending_payment)
      if (currentStatus !== 'pending_payment') {
        for (const item of order.items) {
          await db.restoreProductStock(item.id, item.qty);
        }
      }
    }

    const success = await db.updateOrderStatus(id, status);
    if (!success) {
      return res.status(404).json({ error: 'Order not found to update.' });
    }

    // Trigger transactional emails on status milestone changes
    if (status === 'shipped' && currentStatus !== 'shipped') {
      sendOrderShippedEmail(id).catch((e: any) => {
        console.error(`[Admin] Shipped email dispatch error for ${id}:`, e.message);
      });
    } else if (status === 'delivered' && currentStatus !== 'delivered') {
      sendOrderDeliveredEmail(id).catch((e: any) => {
        console.error(`[Admin] Delivered email dispatch error for ${id}:`, e.message);
      });
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

    // Send shipment notification email with tracking details
    sendOrderShippedEmail(id, {
      trackingId: finalTrackingId,
      carrierName: finalCarrierName,
      trackingUrl: finalTrackingUrl,
    }).catch((e: any) => {
      console.error(`[Admin] Shipped email dispatch error for ${id}:`, e.message);
    });

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

// Admin: Synchronize a single order with Shiprocket
export const syncOrderWithShiprocket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await syncShiprocketOrderStatus(id, true);
    const updatedOrder = await db.getOrderById(id);
    res.json({
      success: true,
      result,
      order: updatedOrder
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Synchronize all active orders with Shiprocket
export const syncAllOrdersWithShiprocket = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await syncActiveOrdersWithShiprocket();
    const updatedOrders = await db.getOrders();
    const confirmedOrders = (updatedOrders || []).filter(
      (o: any) => o.status !== 'pending' && o.status !== 'pending_payment'
    );
    res.json({
      success: true,
      results,
      orders: confirmedOrders
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

// Helper to upload a single buffer to Cloudinary (preserves natural aspect ratio, downscale only, no cropping)
const uploadBufferToCloudinary = (fileBuffer: Buffer): Promise<{ imageUrl: string; width?: number; height?: number }> => {
  return new Promise((resolve) => {
    const bufferDims = getImageDimensions(fileBuffer);
    if (!ENV.CLOUDINARY_API_KEY) {
      console.log('Cloudinary: Operating in demo/mock mode. Simulating photo upload.');
      return resolve({
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        width: bufferDims?.width || 800,
        height: bufferDims?.height || 1000
      });
    }

    // Preserve natural aspect ratio (crop: 'limit' only downscales if larger, never crops or distorts)
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'laxmi_store_sarees',
        transformation: [{ width: 2400, height: 3200, crop: 'limit' }]
      },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload failed for item, falling back to placeholder:', error.message);
          return resolve({
            imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            width: bufferDims?.width || 800,
            height: bufferDims?.height || 1000
          });
        }
        resolve({
          imageUrl: result?.secure_url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          width: result?.width || bufferDims?.width,
          height: result?.height || bufferDims?.height
        });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Upload Saree Image to Cloudinary
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const { imageUrl, width, height } = await uploadBufferToCloudinary(req.file.buffer);
    res.json({ imageUrl, width, height });
  } catch (err) {
    next(err);
  }
};

// Bulk Upload Saree Images to Cloudinary
export const uploadBulkProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No image files uploaded.' });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const { imageUrl, width, height } = await uploadBufferToCloudinary(file.buffer);
        return {
          originalname: file.originalname,
          imageUrl,
          width,
          height
        };
      })
    );

    res.json({ success: true, uploaded: results });
  } catch (err) {
    next(err);
  }
};

// Bulk Assign Product Images & Variants in Database
export const bulkAssignProductImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { assignments } = req.body;
    if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({ error: 'No image assignments provided.' });
    }

    let updatedCount = 0;
    for (const item of assignments) {
      const productId = parseInt(item.productId, 10);
      if (isNaN(productId) || !item.imageUrl) continue;

      const product = await db.getProductById(productId);
      if (!product) continue;

      if (item.isVariant && item.variantColour) {
        const currentVariants = product.variants || [];
        const existingIdx = currentVariants.findIndex(
          v => v.colour.trim().toLowerCase() === item.variantColour.trim().toLowerCase()
        );
        let newVariants = [...currentVariants];
        if (existingIdx >= 0) {
          newVariants[existingIdx] = {
            ...currentVariants[existingIdx],
            colour: item.variantColour.trim(),
            image: item.imageUrl,
            ...(item.width ? { width: item.width } : {}),
            ...(item.height ? { height: item.height } : {})
          };
        } else {
          newVariants.push({
            colour: item.variantColour.trim(),
            image: item.imageUrl,
            width: item.width,
            height: item.height
          });
        }
        const updatePayload: any = { variants: newVariants };
        if (!product.image) {
          updatePayload.image = item.imageUrl;
          if (item.width) updatePayload.imageWidth = item.width;
          if (item.height) updatePayload.imageHeight = item.height;
        }
        await db.updateProduct(productId, updatePayload);
        updatedCount++;
      } else {
        const updatePayload: any = {
          image: item.imageUrl,
          ...(item.width ? { imageWidth: item.width } : {}),
          ...(item.height ? { imageHeight: item.height } : {})
        };
        await db.updateProduct(productId, updatePayload);
        updatedCount++;
      }
    }

    res.json({ success: true, count: updatedCount });
  } catch (err) {
    next(err);
  }
};

// Admin: Re-dispatch or test transactional email for an order
export const resendOrderEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, recipientEmail } = req.body; // type: 'placed' | 'admin_alert' | 'shipped' | 'delivered'

    if (!type || !['placed', 'admin_alert', 'shipped', 'delivered'].includes(type)) {
      return res.status(400).json({ error: "Email type must be one of: 'placed', 'admin_alert', 'shipped', 'delivered'." });
    }

    const order = await db.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (recipientEmail && typeof recipientEmail === 'string' && recipientEmail.includes('@')) {
      order.userEmail = recipientEmail.trim().toLowerCase();
    }

    let success = false;
    if (type === 'placed') {
      success = await sendOrderConfirmationEmail(order, true);
    } else if (type === 'admin_alert') {
      success = await sendAdminOrderNotificationEmail(order);
    } else if (type === 'shipped') {
      success = await sendOrderShippedEmail(order, undefined, true);
    } else if (type === 'delivered') {
      success = await sendOrderDeliveredEmail(order, true);
    }

    if (!success) {
      return res.status(500).json({
        error: `Failed to send ${type} email. Please verify that a valid email address is associated with this order.`,
      });
    }

    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} notification email successfully sent for order #${order.id}.`,
    });
  } catch (err) {
    next(err);
  }
};

