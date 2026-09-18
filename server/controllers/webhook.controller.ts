import { Request, Response, NextFunction } from 'express';
import { db } from '../data/db';
import { syncShiprocketOrderStatus } from '../services/shiprocket.service';

/**
 * Handles incoming webhooks from Shiprocket.
 * Configured in Shiprocket Dashboard ➔ Settings ➔ API ➔ Webhooks.
 *
 * Supported events:
 * - Order Status Updates (CANCELED, DELIVERED, SHIPPED, etc.)
 * - Tracking / AWB Updates (IN TRANSIT, OUT FOR DELIVERY, DELIVERED, CANCELED)
 */
export const handleShiprocketWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawPayload = req.body || {};
    const payload = rawPayload.data || rawPayload;

    console.log('[Shiprocket Webhook] 🔔 Incoming webhook:', JSON.stringify(payload).slice(0, 500));

    // Extract identifier candidates
    const channelOrderId = (
      payload.channel_order_id ||
      payload.custom_order_id ||
      payload.order_no ||
      payload.order_id
    )?.toString().trim();

    const awb = (payload.awb || payload.awb_code || payload.tracking_id)?.toString().trim();
    const rawStatus = (payload.current_status || payload.status || payload.event || '').toString().toUpperCase();
    const statusCode = Number(payload.status_code || payload.current_status_id || payload.shipment_status);
    const courierName = payload.courier_name || payload.sr_courier_name || 'Shiprocket';
    const trackingUrl = payload.tracking_url || (awb ? `https://shiprocket.co/tracking/${awb}` : '');

    // Check if this is a test webhook sent by Shiprocket's "Test Webhook" button
    if (
      payload.test ||
      rawStatus === 'TEST' ||
      rawStatus.includes('TEST') ||
      payload.event === 'test' ||
      (!channelOrderId && !awb)
    ) {
      console.log('[Shiprocket Webhook] 🧪 Test connection ping received successfully from Shiprocket.');
      return res.status(200).json({
        success: true,
        message: 'Webhook connection tested and verified successfully.'
      });
    }

    // 1. Locate the order in our local database
    let targetOrder = null;

    if (channelOrderId) {
      targetOrder = await db.getOrderById(channelOrderId);
    }

    // Fallback: search by trackingId or AWB in DB
    if (!targetOrder && awb) {
      const allOrders = await db.getOrders();
      targetOrder = allOrders.find(o => o.trackingId === awb) || null;
    }

    // Fallback: search by channelOrderId if it is substring or numeric
    if (!targetOrder && channelOrderId) {
      const allOrders = await db.getOrders();
      targetOrder = allOrders.find(
        o => o.id === channelOrderId || o.id.toLowerCase() === channelOrderId.toLowerCase()
      ) || null;
    }

    if (!targetOrder) {
      console.warn(`[Shiprocket Webhook] No matching local order found for identifier: ${channelOrderId || awb}`);
      // Still return 200 OK so Shiprocket does not keep retrying unnecessarily
      return res.status(200).json({
        success: true,
        message: 'Webhook acknowledged, but order was not found in store database.'
      });
    }

    const orderId = targetOrder.id;
    const currentStatus = (targetOrder as any).status || 'placed';

    console.log(`[Shiprocket Webhook] Matched Order ${orderId} (current status: ${currentStatus}, incoming: ${rawStatus || statusCode})`);

    // 2. Map Shiprocket status
    const isCancelled =
      rawStatus === 'CANCELED' ||
      rawStatus === 'CANCELLED' ||
      rawStatus.includes('CANCEL') ||
      statusCode === 5 ||
      statusCode === 8;

    const isDelivered =
      rawStatus === 'DELIVERED' ||
      rawStatus.includes('DELIVER') ||
      statusCode === 7;

    const isShipped =
      rawStatus === 'SHIPPED' ||
      rawStatus === 'IN TRANSIT' ||
      rawStatus === 'OUT FOR DELIVERY' ||
      rawStatus === 'PICKED UP' ||
      [6, 17, 18, 19, 42].includes(statusCode);

    const isProcessing =
      rawStatus === 'PROCESSING' ||
      rawStatus === 'READY TO SHIP' ||
      rawStatus === 'NEW';

    // 3. Process status transition & stock restoration
    if (isCancelled) {
      if (currentStatus !== 'cancelled') {
        // Restore inventory stock for all items in the order
        if (currentStatus !== 'pending_payment' && Array.isArray(targetOrder.items)) {
          for (const it of targetOrder.items) {
            await db.restoreProductStock(it.id, it.qty);
          }
          console.log(`[Shiprocket Webhook] ♻️ Stock restored for cancelled order ${orderId}`);
        }
        await db.updateOrderStatus(orderId, 'cancelled');
        console.log(`[Shiprocket Webhook] ✅ Order ${orderId} marked cancelled.`);
      }
    } else if (isDelivered) {
      if (currentStatus !== 'delivered') {
        await db.updateOrderStatus(orderId, 'delivered');
        console.log(`[Shiprocket Webhook] ✅ Order ${orderId} marked delivered.`);
      }
    } else if (isShipped) {
      const finalAwb = awb || targetOrder.trackingId;
      const finalCourier = courierName || targetOrder.carrierName || 'Shiprocket';
      const finalUrl = trackingUrl || (finalAwb ? `https://shiprocket.co/tracking/${finalAwb}` : targetOrder.trackingUrl || '');

      if (finalAwb) {
        await db.updateOrderTracking(orderId, finalAwb, finalCourier, finalUrl);
      } else {
        await db.updateOrderStatus(orderId, 'shipped');
      }
      console.log(`[Shiprocket Webhook] 🚚 Order ${orderId} marked shipped (AWB: ${finalAwb}).`);
    } else if (isProcessing) {
      if (currentStatus === 'paid' || currentStatus === 'placed') {
        await db.updateOrderStatus(orderId, 'processing');
        console.log(`[Shiprocket Webhook] 📦 Order ${orderId} marked processing.`);
      }
    }

    // Optionally run a secondary verification sync to catch any other details
    syncShiprocketOrderStatus(orderId, true).catch(e => {
      console.warn(`[Shiprocket Webhook] Background sync error for ${orderId}:`, e.message);
    });

    return res.status(200).json({
      success: true,
      orderId,
      processedStatus: isCancelled ? 'cancelled' : isDelivered ? 'delivered' : isShipped ? 'shipped' : currentStatus,
    });
  } catch (err) {
    next(err);
  }
};
