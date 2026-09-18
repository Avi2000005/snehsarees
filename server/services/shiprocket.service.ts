import { ENV } from '../config/env';
import { Order } from '../../src/types';
import { db } from '../data/db';

interface ShipmentResult {
  trackingId: string;
  carrierName: string;
  trackingUrl: string;
}

// Token cache — reuse for up to 9 days (Shiprocket tokens are valid for 10 days)
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

/**
 * Fetches a Shiprocket auth token using API user email + password credentials.
 * Caches the token for 9 days to avoid re-login on every order.
 */
async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ENV.SHIPROCKET_EMAIL,
      password: ENV.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Shiprocket auth failed (${res.status}): ${errBody}`);
  }

  const data = await res.json();
  cachedToken = data.token as string;
  tokenExpiresAt = now + 9 * 24 * 60 * 60 * 1000; // 9 days
  return cachedToken!;
}

/**
 * Parses city, pincode, and state from order fields.
 * Prefers dedicated fields (city, pincode, state) if present on the order object.
 * Falls back to safe defaults so Shiprocket never rejects the payload.
 */
function parseAddressFields(order: Order & { city?: string; pincode?: string; state?: string }) {
  return {
    city: order.city?.trim() || 'India',
    pincode: order.pincode?.trim() || '000000',
    state: order.state?.trim() || 'Rajasthan',
  };
}

/**
 * Creates a shipment on Shiprocket after an order is confirmed/paid.
 * Falls back gracefully to mock mode if credentials are not set.
 *
 * Pickup location "Primary" must be configured in:
 * Shiprocket Dashboard → Settings → Manage Pickups
 */
export async function createShipment(
  order: Order & { userId?: number; city?: string; pincode?: string; state?: string }
): Promise<ShipmentResult> {
  // --- MOCK MODE (no credentials) ---
  if (!ENV.SHIPROCKET_EMAIL || !ENV.SHIPROCKET_PASSWORD) {
    console.log('[Shiprocket] Mock mode — credentials not set.');
    const mockAwb = `AWB${Date.now().toString().slice(-8)}`;
    return {
      trackingId: mockAwb,
      carrierName: 'Shiprocket (Demo)',
      trackingUrl: `https://shiprocket.co/tracking/${mockAwb}`,
    };
  }

  // --- REAL SHIPROCKET API ---
  try {
    const token = await getShiprocketToken();
    const { city, pincode, state } = parseAddressFields(order);

    // Build Shiprocket order payload
    // Docs: https://apiv2.shiprocket.in/v1/external/orders/create/adhoc
    const payload = {
      order_id: order.id,
      order_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      pickup_location: ENV.SHIPROCKET_PICKUP_LOCATION || 'work', // Matches your Shiprocket Address Nickname
      billing_customer_name: order.name,
      billing_last_name: '',
      billing_address: order.address,
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: 'India',
      billing_email: '',
      billing_phone: order.phone,
      shipping_is_billing: true,
      order_items: order.items.map((it) => ({
        name: it.name,
        sku: `SAREE-${it.id}`,
        units: it.qty,
        selling_price: it.price,
        discount: 0,
        tax: '',
        hsn: 521007, // HSN code for sarees (silk/cotton woven)
      })),
      payment_method: order.method === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.total,
      length: 30,  // cm — standard saree package
      breadth: 25,
      height: 10,
      weight: 0.5, // kg
    };

    console.log(`[Shiprocket] Creating order for ${order.id} — ${order.name} (${city}, ${state} - ${pincode})`);

    const orderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(`Shiprocket order creation failed: ${JSON.stringify(orderData)}`);
    }

    // Shiprocket returns shipment_id (internal) and awb_code (courier tracking)
    const awb = orderData.awb_code || orderData.shipment_id?.toString() || `SR-${order.id}`;
    const trackingUrl = `https://shiprocket.co/tracking/${awb}`;

    console.log(`[Shiprocket] ✅ Order ${order.id} dispatched — AWB: ${awb}`);

    return {
      trackingId: awb,
      carrierName: orderData.courier_name || 'Shiprocket',
      trackingUrl,
    };
  } catch (err: any) {
    console.error('[Shiprocket] ❌ API call failed, falling back to manual tracking:', err.message);
    // Graceful fallback — admin can manually enter tracking info later
    return {
      trackingId: '',
      carrierName: 'Manual',
      trackingUrl: '',
    };
  }
}

/**
 * Fetches the Shiprocket-generated invoice PDF URL for a shipped order.
 * Pass the order's trackingId (AWB) or Shiprocket shipment ID.
 * Returns null if invoice is not yet available or credentials are missing.
 */
export async function getShiprocketInvoiceUrl(shipmentId: string): Promise<string | null> {
  if (!ENV.SHIPROCKET_EMAIL || !ENV.SHIPROCKET_PASSWORD || !shipmentId) {
    return null;
  }

  try {
    const token = await getShiprocketToken();

    // Shiprocket invoice endpoint — accepts shipment IDs as comma-separated list
    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/print/invoice?ids=${encodeURIComponent(shipmentId)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Shiprocket] Invoice fetch failed (${res.status}): ${errText}`);
      return null;
    }

    const data = await res.json();
    // Shiprocket returns { invoice_url: 'https://...' }
    return data.invoice_url || null;
  } catch (err: any) {
    console.error('[Shiprocket] Invoice URL fetch error:', err.message);
    return null;
  }
}

export interface ShiprocketSyncResult {
  updated: boolean;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  message: string;
  trackingId?: string;
  carrierName?: string;
}

// In-memory sync throttle (10 seconds per order)
const syncThrottleMap = new Map<string, { time: number; result: ShiprocketSyncResult }>();

/**
 * Synchronizes an order's status and tracking details directly with Shiprocket API.
 * If the status on Shiprocket is CANCELED, order is marked cancelled and product stock is restored.
 * If SHIPPED / IN TRANSIT / DELIVERED, status and tracking details are updated in the database.
 */
export async function syncShiprocketOrderStatus(
  orderId: string,
  bypassThrottle = false
): Promise<ShiprocketSyncResult> {
  const localOrder = await db.getOrderById(orderId);
  if (!localOrder) {
    return {
      updated: false,
      orderId,
      previousStatus: '',
      newStatus: '',
      message: 'Order not found in store database.'
    };
  }

  const currentStatus = (localOrder as any).status || 'placed';

  // Check throttle cache unless bypassed
  if (!bypassThrottle) {
    const cached = syncThrottleMap.get(orderId);
    if (cached && Date.now() - cached.time < 10000) {
      return cached.result;
    }
  }

  // If mock mode or credentials missing
  if (!ENV.SHIPROCKET_EMAIL || !ENV.SHIPROCKET_PASSWORD) {
    return {
      updated: false,
      orderId,
      previousStatus: currentStatus,
      newStatus: currentStatus,
      message: 'Shiprocket credentials not configured (mock mode).'
    };
  }

  try {
    const token = await getShiprocketToken();

    // 1. Search for order on Shiprocket by channel_order_id or store order id
    const searchRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders?search=${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    let srOrder: any = null;
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (Array.isArray(searchData.data) && searchData.data.length > 0) {
        srOrder = searchData.data.find(
          (o: any) =>
            o.channel_order_id === orderId ||
            o.id?.toString() === orderId ||
            o.channel_order_id?.toLowerCase() === orderId.toLowerCase()
        ) || searchData.data[0];
      }
    }

    let detectedStatus: 'cancelled' | 'delivered' | 'shipped' | 'processing' | null = null;
    let awb = '';
    let courierName = '';

    if (srOrder) {
      const srStatus = (srOrder.status || '').toString().toUpperCase();
      const srStatusCode = Number(srOrder.status_code);
      const firstShipment = Array.isArray(srOrder.shipments) && srOrder.shipments[0] ? srOrder.shipments[0] : null;
      const shipmentStatus = firstShipment ? Number(firstShipment.status) : null;

      awb = firstShipment?.awb || srOrder.awb_code || '';
      courierName = firstShipment?.courier_name || firstShipment?.sr_courier_name || srOrder.courier_name || 'Shiprocket';

      // Check for CANCELED:
      // Status code 5 = CANCELED in Shiprocket orders
      // Shipment status 8 = CANCELED in Shiprocket shipments
      if (
        srStatus === 'CANCELED' ||
        srStatus === 'CANCELLED' ||
        srStatusCode === 5 ||
        shipmentStatus === 8
      ) {
        detectedStatus = 'cancelled';
      } else if (
        srStatus === 'DELIVERED' ||
        srStatusCode === 7 ||
        shipmentStatus === 7
      ) {
        detectedStatus = 'delivered';
      } else if (
        srStatus === 'SHIPPED' ||
        srStatus === 'IN TRANSIT' ||
        srStatus === 'OUT FOR DELIVERY' ||
        srStatus === 'PICKED UP' ||
        [6, 17, 18, 19, 42].includes(shipmentStatus || 0) ||
        (awb && awb.length > 3)
      ) {
        detectedStatus = 'shipped';
      } else if (
        srStatus === 'READY TO SHIP' ||
        srStatus === 'PROCESSING' ||
        srStatus === 'NEW'
      ) {
        detectedStatus = 'processing';
      }
    }

    // 2. Fallback: If status not determined or order had trackingId, check courier tracking API
    if (!detectedStatus && localOrder.trackingId) {
      try {
        const trackRes = await fetch(
          `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${encodeURIComponent(localOrder.trackingId)}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (trackRes.ok) {
          const trackData = await trackRes.json();
          const trackingEntry = trackData[localOrder.trackingId]?.tracking_data || trackData.tracking_data;
          if (trackingEntry) {
            const trackStatus = trackingEntry.shipment_status;
            const errStr = (trackingEntry.error || '').toString().toLowerCase();
            if (trackStatus === 8 || errStr.includes('cancelled') || errStr.includes('canceled')) {
              detectedStatus = 'cancelled';
            } else if (trackStatus === 7) {
              detectedStatus = 'delivered';
            } else if ([6, 17, 18, 19, 42].includes(trackStatus)) {
              detectedStatus = 'shipped';
            }
          }
        }
      } catch (trackErr: any) {
        console.warn(`[Shiprocket Sync] Tracking fallback error for ${orderId}:`, trackErr.message);
      }
    }

    if (!detectedStatus) {
      const resObj: ShiprocketSyncResult = {
        updated: false,
        orderId,
        previousStatus: currentStatus,
        newStatus: currentStatus,
        message: 'No status change detected on Shiprocket.'
      };
      syncThrottleMap.set(orderId, { time: Date.now(), result: resObj });
      return resObj;
    }

    // 3. Apply state transitions and stock restoration
    if (detectedStatus === 'cancelled') {
      if (currentStatus !== 'cancelled') {
        // Restore stock if it was previously deducted
        if (currentStatus !== 'pending_payment' && Array.isArray(localOrder.items)) {
          for (const item of localOrder.items) {
            await db.restoreProductStock(item.id, item.qty);
          }
          console.log(`[Shiprocket Sync] Stock restored for cancelled order ${orderId}`);
        }
        await db.updateOrderStatus(orderId, 'cancelled');
        const resObj: ShiprocketSyncResult = {
          updated: true,
          orderId,
          previousStatus: currentStatus,
          newStatus: 'cancelled',
          message: 'Order cancelled on Shiprocket. Inventory stock has been restored.'
        };
        syncThrottleMap.set(orderId, { time: Date.now(), result: resObj });
        return resObj;
      }
    } else if (detectedStatus === 'delivered') {
      if (currentStatus !== 'delivered') {
        await db.updateOrderStatus(orderId, 'delivered');
        const resObj: ShiprocketSyncResult = {
          updated: true,
          orderId,
          previousStatus: currentStatus,
          newStatus: 'delivered',
          message: 'Order marked as delivered.'
        };
        syncThrottleMap.set(orderId, { time: Date.now(), result: resObj });
        return resObj;
      }
    } else if (detectedStatus === 'shipped') {
      const needsTrackingUpdate = Boolean(awb && localOrder.trackingId !== awb);
      if (currentStatus !== 'shipped' || needsTrackingUpdate) {
        const trackingUrl = awb ? `https://shiprocket.co/tracking/${awb}` : (localOrder.trackingUrl || '');
        await db.updateOrderTracking(orderId, awb || localOrder.trackingId || `SR-${orderId}`, courierName, trackingUrl);
        const resObj: ShiprocketSyncResult = {
          updated: true,
          orderId,
          previousStatus: currentStatus,
          newStatus: 'shipped',
          trackingId: awb || localOrder.trackingId,
          carrierName: courierName,
          message: `Order shipped via ${courierName}${awb ? ` (AWB: ${awb})` : ''}.`
        };
        syncThrottleMap.set(orderId, { time: Date.now(), result: resObj });
        return resObj;
      }
    } else if (detectedStatus === 'processing') {
      if (currentStatus === 'paid' || currentStatus === 'placed') {
        await db.updateOrderStatus(orderId, 'processing');
        const resObj: ShiprocketSyncResult = {
          updated: true,
          orderId,
          previousStatus: currentStatus,
          newStatus: 'processing',
          message: 'Order status updated to processing on Shiprocket.'
        };
        syncThrottleMap.set(orderId, { time: Date.now(), result: resObj });
        return resObj;
      }
    }

    const resObj: ShiprocketSyncResult = {
      updated: false,
      orderId,
      previousStatus: currentStatus,
      newStatus: currentStatus,
      message: `Status is up to date (${currentStatus}).`
    };
    syncThrottleMap.set(orderId, { time: Date.now(), result: resObj });
    return resObj;
  } catch (err: any) {
    console.error(`[Shiprocket Sync] Error syncing order ${orderId}:`, err.message);
    return {
      updated: false,
      orderId,
      previousStatus: currentStatus,
      newStatus: currentStatus,
      message: `Shiprocket sync error: ${err.message}`
    };
  }
}

/**
 * Synchronizes all active/in-flight orders in the database with Shiprocket.
 * Targets orders with statuses 'paid', 'placed', 'processing', or 'shipped'.
 */
export async function syncActiveOrdersWithShiprocket(): Promise<ShiprocketSyncResult[]> {
  try {
    const allOrders = await db.getOrders();
    const activeOrders = allOrders.filter(o =>
      ['paid', 'placed', 'processing', 'shipped'].includes((o as any).status || '')
    );

    const results: ShiprocketSyncResult[] = [];
    for (const order of activeOrders) {
      const res = await syncShiprocketOrderStatus(order.id, true);
      results.push(res);
    }
    return results;
  } catch (err: any) {
    console.error('[Shiprocket Sync] Failed to sync active orders:', err.message);
    return [];
  }
}

