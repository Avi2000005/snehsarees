import { Response, NextFunction } from 'express';
import { db } from '../data/db';
import { razorpayInstance } from '../config/razorpay';
import { ENV } from '../config/env';
import { Order, CartItem } from '../../src/types';
import { UserRequest } from '../middlewares/user.middleware';
import crypto from 'crypto';

export const getOrders = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { orderIds } = req.query;

    const list: Order[] = [];
    const seenIds = new Set<string>();

    if (userId) {
      const userOrders = await db.getOrdersByUserId(userId);
      userOrders.forEach(o => {
        seenIds.add(o.id);
        list.push(o);
      });
    }

    if (orderIds && typeof orderIds === 'string') {
      const ids = orderIds.split(',').map(s => s.trim()).filter(Boolean);
      for (const id of ids) {
        if (!seenIds.has(id)) {
          const ord = await db.getOrderById(id);
          if (ord) {
            seenIds.add(ord.id);
            list.push(ord);
          }
        }
      }
    }

    // Populate missing item images from products database
    for (const ord of list) {
      if (ord.items && Array.isArray(ord.items)) {
        for (const item of ord.items) {
          if (!item.image && item.id) {
            const dbProduct = await db.getProductById(item.id);
            if (dbProduct && dbProduct.image) {
              item.image = dbProduct.image;
            }
          }
        }
      }
    }

    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const createRazorpayOrder = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, address, items, method, couponCode } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Sign in to place an order.' });
    }

    if (!name || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid order payload. Delivery information and products are required.' });
    }

    if (method === 'COD' || method === 'cod') {
      return res.status(400).json({ error: 'Cash on Delivery (COD) is currently unavailable. Please pay via UPI QR code.' });
    }

    // 1. Recalculate cart total securely from database
    let calculatedTotal = 0;
    const validatedItems: CartItem[] = [];
    const categoryIds: number[] = [];

    for (const item of items) {
      const dbProduct = await db.getProductById(item.id);
      if (!dbProduct) {
        return res.status(404).json({ error: `Product with ID ${item.id} not found.` });
      }

      const itemPrice = dbProduct.discountPrice && dbProduct.discountPrice > 0 ? dbProduct.discountPrice : dbProduct.price;
      calculatedTotal += itemPrice * item.qty;

      validatedItems.push({
        id: dbProduct.id,
        name: dbProduct.name,
        price: itemPrice,
        fabric: dbProduct.fabric,
        colour: dbProduct.colour,
        qty: item.qty,
        image: dbProduct.image,
      });

      if (dbProduct.categoryId) {
        categoryIds.push(dbProduct.categoryId);
      }
    }

    // 2. Validate coupon and calculate discount
    let discountAmount = 0;
    let validCouponId: number | null = null;
    let appliedCouponCode: string | null = null;

    if (couponCode) {
      const coupon = await db.getCouponByCode(couponCode);
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
      if (calculatedTotal < coupon.minOrderValue) {
        return res.status(400).json({ error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.` });
      }

      const usageCount = await db.getCouponUsageCount(coupon.id, userId);
      if (usageCount >= coupon.perUserLimit) {
        return res.status(400).json({ error: 'You have reached the usage limit for this coupon.' });
      }

      if (coupon.applicableCategoryId && !categoryIds.includes(coupon.applicableCategoryId)) {
        return res.status(400).json({ error: 'This coupon is not applicable to the items in your cart.' });
      }

      if (coupon.discountType === 'percent') {
        discountAmount = (calculatedTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountCap !== undefined && coupon.maxDiscountCap !== null && discountAmount > coupon.maxDiscountCap) {
          discountAmount = coupon.maxDiscountCap;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      if (discountAmount > calculatedTotal) {
        discountAmount = calculatedTotal;
      }

      validCouponId = coupon.id;
      appliedCouponCode = coupon.code;
    }

    const deliveryFee = calculatedTotal >= 2000 ? 0 : 100;
    const finalTotal = Math.max(0, calculatedTotal - discountAmount + deliveryFee);

    // Generate proper, professional brand order ID
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `SNEH-ORD-${dateStr}-${randStr}`;

    // 3. Contact Razorpay if applicable
    let razorpayOrderId: string | null = null;

    if (method === 'Razorpay' && razorpayInstance) {
      try {
        const rpOrder = await razorpayInstance.orders.create({
          amount: Math.round(finalTotal * 100), // Paise conversion
          currency: 'INR',
          receipt: orderId,
        });
        razorpayOrderId = rpOrder.id;
      } catch (err: any) {
        console.error('Razorpay SDK Order creation failed:', err.message);
        return res.status(500).json({ error: 'Failed to contact payment processor. Please try again.' });
      }
    }

    // 4. Save order to database
    const newOrder: Order = {
      id: orderId, // Always use custom brand order ID
      items: validatedItems,
      total: finalTotal,
      method,
      name,
      phone,
      address,
      createdAt: new Date().toISOString(),
      couponCode: appliedCouponCode || undefined,
      discountAmount: discountAmount || undefined,
      deliveryFee: deliveryFee
    };

    if (method === 'ManualUPI') {
      (newOrder as any).status = 'pending_payment';
    } else if (method === 'Razorpay') {
      (newOrder as any).status = 'pending';
    } else {
      (newOrder as any).status = 'placed';
    }

    await db.createOrder({ ...newOrder, userId });

    // Deduct stock immediately only for non-pending orders (e.g. COD)
    if (method !== 'Razorpay' && method !== 'ManualUPI') {
      for (const it of validatedItems) {
        await db.deductProductStock(it.id, it.qty);
      }
    }
    if (validCouponId) {
      await db.recordCouponUsage(validCouponId, userId, newOrder.id);
      await db.incrementCouponUsage(validCouponId);
    }

    res.status(201).json({
      order: newOrder,
      razorpayKeyId: ENV.RAZORPAY_KEY_ID,
      razorpayOrderId,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Sign in required to verify payments.' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment signature verification parameters.' });
    }

    const targetOrderId = order_id || razorpay_order_id;
    const order = await db.getOrderById(targetOrderId);
    if (!order || (order as any).userId !== userId) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const finalizeOrder = async () => {
      await db.updateOrderStatus(targetOrderId, 'paid');
      for (const it of order.items) {
        await db.deductProductStock(it.id, it.qty);
      }
      if (order.couponCode) {
        const coupon = await db.getCouponByCode(order.couponCode);
        if (coupon) {
          await db.recordCouponUsage(coupon.id, userId, targetOrderId);
          await db.incrementCouponUsage(coupon.id);
        }
      }
    };

    if (!ENV.RAZORPAY_KEY_SECRET) {
      console.log('Payment Gateway: Operating in demo/mock mode. Autoverifying order.');
      await finalizeOrder();
      return res.json({ success: true, message: 'Mock payment verified.' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await finalizeOrder();
      console.log(`Payment: Order ${targetOrderId} verified successfully via PaymentID: ${razorpay_payment_id}`);
      res.json({ success: true });
    } else {
      console.warn(`Payment: Verification signature mismatch for Order ${targetOrderId}`);
      res.status(400).json({ success: false, error: 'Cryptographic signature verification failed.' });
    }
  } catch (err) {
    next(err);
  }
};
