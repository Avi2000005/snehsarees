import { Response, NextFunction } from 'express';
import { db } from '../data/db';
import { UserRequest } from '../middlewares/user.middleware';

const RETURN_WINDOW_DAYS = 7;

// Customer: Submit a return request
export const createReturn = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Sign in to request a return.' });

    const { orderId, reason, description, resolution, items } = req.body;

    if (!orderId || !reason || !resolution || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'orderId, reason, resolution and items are required.' });
    }

    // Validate order belongs to user
    const order = await db.getOrderById(orderId);
    if (!order || (order as any).userId !== userId) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Order must be delivered to request a return.' });
    }

    // Check return window (7 days from delivery date)
    const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date();
    const daysElapsed = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysElapsed > RETURN_WINDOW_DAYS) {
      return res.status(400).json({ error: `Return window of ${RETURN_WINDOW_DAYS} days from delivery has expired.` });
    }

    // Check if a return already exists for this order
    const existing = await db.getReturnByOrderId(orderId);
    if (existing) {
      return res.status(409).json({ error: 'A return request already exists for this order.' });
    }

    const returnReq = await db.createReturn({
      orderId,
      userId,
      reason,
      description: description || undefined,
      resolution,
      status: 'requested',
      items,
    });

    res.status(201).json(returnReq);
  } catch (err) {
    next(err);
  }
};

// Customer: Get my returns
export const getMyReturns = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Sign in to view returns.' });

    const returns = await db.getReturnsByUserId(userId);
    res.json(returns);
  } catch (err) {
    next(err);
  }
};

// Customer: Get return status for a specific order
export const getReturnForOrder = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Sign in required.' });

    const ret = await db.getReturnByOrderId(req.params.orderId);
    if (!ret || ret.userId !== userId) {
      return res.status(404).json({ error: 'Return not found.' });
    }
    res.json(ret);
  } catch (err) {
    next(err);
  }
};

// Admin: Get all returns
export const getAllReturns = async (_req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const returns = await db.getAllReturns();
    res.json(returns);
  } catch (err) {
    next(err);
  }
};

// Admin: Update return status
export const updateReturnStatus = async (req: UserRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { status, adminNote } = req.body;

    const validStatuses = ['requested', 'approved', 'picked_up', 'refunded', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const success = await db.updateReturnStatus(id, status, adminNote);
    if (!success) return res.status(404).json({ error: 'Return not found.' });

    res.json({ success: true, status });
  } catch (err) {
    next(err);
  }
};
