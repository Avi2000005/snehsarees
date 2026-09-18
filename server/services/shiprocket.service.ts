import { ENV } from '../config/env';
import { Order } from '../../src/types';

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
      pickup_location: 'Primary', // Must match a location name in your Shiprocket account
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
