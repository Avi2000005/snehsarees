import { ENV } from '../config/env';
import { Order } from '../../src/types';

interface ShipmentResult {
  trackingId: string;
  carrierName: string;
  trackingUrl: string;
}

/**
 * Fetches a Shiprocket auth token using email + password credentials.
 * Only called when real credentials are set in .env.
 */
async function getShiprocketToken(): Promise<string> {
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ENV.SHIPROCKET_EMAIL,
      password: ENV.SHIPROCKET_PASSWORD,
    }),
  });

  if (!res.ok) {
    throw new Error(`Shiprocket auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.token as string;
}

/**
 * Creates a shipment via Shiprocket API, or returns a mock result if no credentials are set.
 *
 * FUTURE INTEGRATION: When you have Shiprocket credentials, set SHIPROCKET_EMAIL and
 * SHIPROCKET_PASSWORD in your .env file. This function will then automatically call the
 * real Shiprocket Create Shipment API.
 *
 * For India Post or any other carrier: replace the body payload and endpoint URL below
 * with the respective API call format.
 */
export async function createShipment(order: Order & { userId?: number }): Promise<ShipmentResult> {
  // --- STUB / MOCK MODE ---
  if (!ENV.SHIPROCKET_EMAIL || !ENV.SHIPROCKET_PASSWORD) {
    console.log('[Shiprocket] Operating in mock/stub mode — credentials not set.');
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

    // Build the Shiprocket order payload
    // See: https://apiv2.shiprocket.in/v1/external/orders/create/adhoc
    const payload = {
      order_id: order.id,
      order_date: new Date().toISOString().split('T')[0],
      billing_customer_name: order.name,
      billing_phone: order.phone,
      billing_address: order.address,
      billing_city: 'India',       // TODO: parse city from address or add address fields
      billing_pincode: '000000',   // TODO: parse pincode from address
      billing_state: 'Maharashtra',// TODO: parse state from address
      billing_country: 'India',
      billing_email: '',           // optional
      shipping_is_billing: true,
      order_items: order.items.map((it) => ({
        name: it.name,
        sku: `SAREE-${it.id}`,
        units: it.qty,
        selling_price: it.price,
      })),
      payment_method: order.method === 'COD' ? 'COD' : 'Prepaid',
      sub_total: order.total,
      length: 30,   // cm — default saree dimensions
      breadth: 25,
      height: 10,
      weight: 0.5,  // kg
    };

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

    // Extract AWB from response
    const awb = orderData.shipment_id?.toString() || orderData.awb_code || `SR-${order.id}`;
    const trackingUrl = `https://shiprocket.co/tracking/${awb}`;

    return {
      trackingId: awb,
      carrierName: 'Shiprocket',
      trackingUrl,
    };
  } catch (err: any) {
    console.error('[Shiprocket] API call failed, falling back to manual tracking:', err.message);
    // Fall back gracefully — admin can manually enter tracking info
    return {
      trackingId: '',
      carrierName: 'Manual',
      trackingUrl: '',
    };
  }
}
