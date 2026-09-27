/**
 * order-email.service.ts — Transactional email notifications for Sneh Sarees
 * Dispatches automated, branded emails via Brevo REST API when:
 * 1. Customer places / confirms an order
 * 2. Order is shipped with tracking / AWB details
 * 3. Order is delivered to the customer
 */

import { ENV } from '../config/env';
import { db } from '../data/db';
import { Order, CartItem } from '../../src/types';

interface TrackingInfo {
  trackingId?: string;
  carrierName?: string;
  trackingUrl?: string;
}

/**
 * Resolves the customer's email address from order data or associated user profile.
 */
async function resolveCustomerEmail(order: Order): Promise<string | null> {
  const directEmail =
    order.userEmail ||
    (order as any).customer_email ||
    (order as any).customerEmail ||
    (order as any).email;

  if (directEmail && typeof directEmail === 'string' && directEmail.includes('@')) {
    return directEmail.trim().toLowerCase();
  }

  // Look up registered user by userId if available
  if (order.userId) {
    try {
      const user = await db.getUserById(order.userId);
      if (user?.email && user.email.includes('@')) {
        return user.email.trim().toLowerCase();
      }
    } catch (err) {
      console.warn(`[OrderEmail] Failed to fetch user #${order.userId} for order ${order.id}:`, err);
    }
  }

  return null;
}

/**
 * Ensures item images are loaded from database if missing.
 */
async function enrichOrderItems(items: CartItem[]): Promise<CartItem[]> {
  if (!Array.isArray(items)) return [];
  const enriched: CartItem[] = [];

  for (const it of items) {
    const itemCopy = { ...it };
    if (!itemCopy.image && itemCopy.id) {
      try {
        const prod = await db.getProductById(itemCopy.id);
        if (prod?.image) {
          itemCopy.image = prod.image;
        }
      } catch {
        // Non-fatal
      }
    }
    enriched.push(itemCopy);
  }

  return enriched;
}

/**
 * Format currency with Indian Rupee symbol
 */
function formatCurrency(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Format date in pleasant Indian format
 */
function formatDate(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Sends transactional email via Brevo REST API
 */
async function sendBrevoEmail(payload: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}): Promise<boolean> {
  if (!ENV.BREVO_API_KEY) {
    console.log(
      `[OrderEmail - Mock Mode] BREVO_API_KEY is not configured in .env. ` +
      `Email would be sent to: "${payload.toEmail}" with subject: "${payload.subject}"`
    );
    return true; // Mark as successful in demo/mock mode
  }

  const senderEmail = ENV.BREVO_SENDER_EMAIL || 'info@snehsarees.in';
  const senderName = ENV.BREVO_SENDER_NAME || 'Sneh Sarees';

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': ENV.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: payload.toEmail, name: payload.toName || 'Valued Customer' }],
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[OrderEmail] Brevo API error (${response.status}):`, errText);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error(`[OrderEmail] Failed to connect to Brevo API:`, err.message);
    return false;
  }
}

/**
 * Shared email header
 */
function renderEmailHeader(subtitle: string = 'Premium Handloom Silks & Swatches'): string {
  return `
    <tr>
      <td style="background:linear-gradient(135deg,#C4601A 0%,#E8920E 100%);padding:36px 32px;text-align:center;">
        <h1 style="margin:0;color:#FFFFFF;font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
          Sneh Sarees
        </h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;letter-spacing:1px;font-weight:500;">
          ${subtitle} · Kota, Rajasthan
        </p>
      </td>
    </tr>
  `;
}

/**
 * Shared email footer
 */
function renderEmailFooter(): string {
  const year = new Date().getFullYear();
  const siteUrl = ENV.FRONTEND_URL || 'https://www.snehsarees.in';

  return `
    <tr>
      <td style="background:#FAF6F0;padding:28px 32px;text-align:center;border-top:1px solid #E8E0D5;">
        <p style="margin:0 0 10px;font-size:13px;color:#666666;font-weight:600;">
          Sneh Sarees · Kota Heritage Silks & Handlooms
        </p>
        <p style="margin:0 0 12px;font-size:12px;color:#888888;line-height:1.6;">
          Have questions or need assistance with your order?<br/>
          Write to us at <a href="mailto:info@snehsarees.in" style="color:#C4601A;text-decoration:none;font-weight:600;">info@snehsarees.in</a> or visit our online store.
        </p>
        <p style="margin:0;font-size:11px;color:#AAAAAA;">
          &copy; ${year} <a href="${siteUrl}" style="color:#C4601A;text-decoration:none;font-weight:600;">Sneh Sarees</a>. All rights reserved.
        </p>
      </td>
    </tr>
  `;
}

/**
 * Render items table HTML
 */
function renderItemsList(items: CartItem[]): string {
  const rows = items.map((it) => {
    const itemTotal = it.price * it.qty;
    const thumbnailHtml = it.image
      ? `<td width="64" style="padding:12px 12px 12px 0;vertical-align:top;">
           <img src="${it.image}" alt="${it.name}" width="60" height="60" style="border-radius:8px;object-fit:cover;display:block;border:1px solid #E8E0D5;" />
         </td>`
      : `<td width="64" style="padding:12px 12px 12px 0;vertical-align:top;">
           <div style="width:60px;height:60px;border-radius:8px;background:#FAF6F0;border:1px dashed #C4601A;display:flex;align-items:center;justify-content:center;color:#C4601A;font-size:20px;text-align:center;line-height:60px;">🥻</div>
         </td>`;

    return `
      <tr style="border-bottom:1px solid #F0EAE1;">
        ${thumbnailHtml}
        <td style="padding:12px 0;vertical-align:top;">
          <div style="font-size:14px;font-weight:600;color:#1A1A1A;margin-bottom:3px;">${it.name}</div>
          <div style="font-size:12px;color:#777777;">
            ${it.fabric ? it.fabric : ''}${it.fabric && it.colour ? ' · ' : ''}${it.colour ? it.colour : ''}
          </div>
          <div style="font-size:12px;color:#999999;margin-top:2px;">
            Qty: <strong style="color:#333333;">${it.qty}</strong> × ${formatCurrency(it.price)}
          </div>
        </td>
        <td align="right" style="padding:12px 0;vertical-align:top;font-size:14px;font-weight:700;color:#C4601A;">
          ${formatCurrency(itemTotal)}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 20px;">
      ${rows}
    </table>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ORDER CONFIRMATION / PLACED EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail(orderOrId: string | Order, force = false): Promise<boolean> {
  try {
    const order: Order | null =
      typeof orderOrId === 'string' ? await db.getOrderById(orderOrId) : orderOrId;

    if (!order) {
      console.warn(`[OrderEmail] Cannot send confirmation: order not found.`);
      return false;
    }

    // Check if confirmation email was already sent (unless force is requested)
    if (!force) {
      const alreadySent = await db.isOrderEmailSent(order.id, 'placed');
      if (alreadySent) {
        console.log(`[OrderEmail] Order confirmation email already sent for #${order.id}. Skipping.`);
        return true;
      }
    }

    const customerEmail = await resolveCustomerEmail(order);
    if (!customerEmail) {
      console.warn(`[OrderEmail] No email address found for order #${order.id}. Skipping confirmation email.`);
      return false;
    }

    const items = await enrichOrderItems(order.items || []);
    const siteUrl = ENV.FRONTEND_URL || 'https://www.snehsarees.in';
    const trackOrderUrl = `${siteUrl}/#orders`;

    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const discount = order.discountAmount || 0;
    const deliveryFee = order.deliveryFee !== undefined ? order.deliveryFee : (subtotal >= 2000 ? 0 : 100);
    const grandTotal = order.total;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — Sneh Sarees #${order.id}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:'Segoe UI',Arial,sans-serif;color:#333333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #E8E0D5;">
          ${renderEmailHeader('Handloom Silks & Bridal Swatches')}
          <tr>
            <td style="padding:36px 32px;">
              <!-- Confirmation Badge -->
              <div style="display:inline-block;background:#EBF9F1;border:1px solid #A3E3BE;border-radius:24px;padding:6px 14px;margin-bottom:16px;">
                <span style="color:#0E864E;font-size:12px;font-weight:700;letter-spacing:0.5px;">✓ ORDER CONFIRMED</span>
              </div>

              <h2 style="margin:0 0 12px;color:#1A1A1A;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;">
                Thank you for your order, ${order.name || 'Customer'}!
              </h2>
              <p style="margin:0 0 24px;color:#666666;font-size:14px;line-height:1.6;">
                We have received your order and our master weavers are preparing your handcrafted sarees with utmost care. Below is your complete order receipt.
              </p>

              <!-- Order Summary Pill Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #EAE3D6;">
                <tr>
                  <td style="padding:4px 8px;font-size:12px;color:#777777;">Order ID</td>
                  <td style="padding:4px 8px;font-size:12px;color:#777777;">Order Date</td>
                  <td style="padding:4px 8px;font-size:12px;color:#777777;">Payment</td>
                </tr>
                <tr>
                  <td style="padding:4px 8px;font-size:14px;font-weight:700;color:#C4601A;font-family:monospace;">${order.id}</td>
                  <td style="padding:4px 8px;font-size:13px;font-weight:600;color:#1A1A1A;">${formatDate(order.createdAt)}</td>
                  <td style="padding:4px 8px;font-size:13px;font-weight:600;color:#1A1A1A;">${order.method || 'Online'}</td>
                </tr>
              </table>

              <!-- Items Section -->
              <h3 style="margin:0 0 8px;font-size:16px;color:#1A1A1A;font-weight:700;border-bottom:2px solid #FAF6F0;padding-bottom:8px;">
                Items in Your Order
              </h3>
              ${renderItemsList(items)}

              <!-- Pricing Breakdown -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E0D5;padding-top:16px;margin-bottom:24px;">
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666666;">Subtotal</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#333333;font-weight:600;">${formatCurrency(subtotal)}</td>
                </tr>
                ${discount > 0 ? `
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#0E864E;">Coupon Discount ${order.couponCode ? `(${order.couponCode})` : ''}</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#0E864E;font-weight:600;">-${formatCurrency(discount)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding:6px 0;font-size:13px;color:#666666;">Delivery Fee</td>
                  <td align="right" style="padding:6px 0;font-size:13px;color:#333333;font-weight:600;">
                    ${deliveryFee === 0 ? '<span style="color:#0E864E;">FREE</span>' : formatCurrency(deliveryFee)}
                  </td>
                </tr>
                <tr style="border-top:2px solid #1A1A1A;">
                  <td style="padding:14px 0 6px;font-size:16px;font-weight:800;color:#1A1A1A;">Total Amount Paid</td>
                  <td align="right" style="padding:14px 0 6px;font-size:18px;font-weight:800;color:#C4601A;">${formatCurrency(grandTotal)}</td>
                </tr>
              </table>

              <!-- Delivery Address Box -->
              <div style="background:#FAF6F0;border-radius:12px;padding:20px;margin-bottom:28px;border:1px solid #EAE3D6;">
                <div style="font-size:12px;font-weight:700;color:#C4601A;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">
                  📦 Delivery Address
                </div>
                <div style="font-size:14px;font-weight:700;color:#1A1A1A;margin-bottom:4px;">${order.name}</div>
                <div style="font-size:13px;color:#555555;line-height:1.5;">${order.address}</div>
                <div style="font-size:13px;color:#555555;margin-top:4px;">Phone: <strong>${order.phone}</strong></div>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:12px;">
                <a href="${trackOrderUrl}" style="display:inline-block;background:linear-gradient(135deg,#C4601A 0%,#E8920E 100%);color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:8px;box-shadow:0 3px 12px rgba(196,96,26,0.25);">
                  View Order Status &rarr;
                </a>
              </div>
            </td>
          </tr>
          ${renderEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const success = await sendBrevoEmail({
      toEmail: customerEmail,
      toName: order.name || 'Valued Customer',
      subject: `✨ Order Confirmed: #${order.id} — Sneh Sarees`,
      htmlContent,
    });

    if (success) {
      await db.markOrderEmailSent(order.id, 'placed');
      console.log(`[OrderEmail] ✅ Order confirmation email sent to ${customerEmail} for order #${order.id}`);
    }

    return success;
  } catch (err: any) {
    console.error(`[OrderEmail] Failed to process order confirmation email:`, err.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ORDER SHIPPED EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOrderShippedEmail(
  orderOrId: string | Order,
  trackingData?: TrackingInfo,
  force = false
): Promise<boolean> {
  try {
    const order: Order | null =
      typeof orderOrId === 'string' ? await db.getOrderById(orderOrId) : orderOrId;

    if (!order) {
      console.warn(`[OrderEmail] Cannot send shipped email: order not found.`);
      return false;
    }

    // Check if shipped email was already sent (unless force is requested)
    if (!force) {
      const alreadySent = await db.isOrderEmailSent(order.id, 'shipped');
      if (alreadySent) {
        console.log(`[OrderEmail] Shipped email already sent for #${order.id}. Skipping.`);
        return true;
      }
    }

    const customerEmail = await resolveCustomerEmail(order);
    if (!customerEmail) {
      console.warn(`[OrderEmail] No email address found for order #${order.id}. Skipping shipped email.`);
      return false;
    }

    const trackingId = trackingData?.trackingId || order.trackingId || 'In Transit';
    const carrierName = trackingData?.carrierName || order.carrierName || 'Shiprocket';
    const trackingUrl =
      trackingData?.trackingUrl ||
      order.trackingUrl ||
      (trackingId && trackingId !== 'In Transit' ? `https://shiprocket.co/tracking/${trackingId}` : `${ENV.FRONTEND_URL || 'https://www.snehsarees.in'}/#orders`);

    const items = await enrichOrderItems(order.items || []);
    const siteUrl = ENV.FRONTEND_URL || 'https://www.snehsarees.in';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Order Has Shipped — Sneh Sarees #${order.id}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:'Segoe UI',Arial,sans-serif;color:#333333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #E8E0D5;">
          ${renderEmailHeader('Handloom Silks & Bridal Swatches')}
          <tr>
            <td style="padding:36px 32px;">
              <!-- Shipped Badge -->
              <div style="display:inline-block;background:#FFF4E5;border:1px solid #F5C68A;border-radius:24px;padding:6px 14px;margin-bottom:16px;">
                <span style="color:#C4601A;font-size:12px;font-weight:700;letter-spacing:0.5px;">🚚 SHIPPED &amp; ON THE WAY</span>
              </div>

              <h2 style="margin:0 0 12px;color:#1A1A1A;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;">
                Great news, ${order.name || 'Customer'}!
              </h2>
              <p style="margin:0 0 24px;color:#666666;font-size:14px;line-height:1.6;">
                Your package has been dispatched from our Kota warehouse and is currently on its way to your delivery address.
              </p>

              <!-- Live Tracking Highlight Card -->
              <div style="background:#FAF6F0;border:2px solid #C4601A;border-radius:14px;padding:24px;margin-bottom:28px;text-align:center;">
                <div style="font-size:11px;font-weight:700;color:#777777;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                  Courier Partner: <strong style="color:#1A1A1A;">${carrierName}</strong>
                </div>
                <div style="font-size:13px;color:#555555;margin-bottom:6px;">AWB / Tracking Number</div>
                <div style="font-size:24px;font-weight:800;color:#C4601A;font-family:monospace;letter-spacing:2px;margin-bottom:18px;">
                  ${trackingId}
                </div>
                <a href="${trackingUrl}" style="display:inline-block;background:#C4601A;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;box-shadow:0 3px 10px rgba(196,96,26,0.25);">
                  Track Shipment Live &rarr;
                </a>
              </div>

              <!-- Delivery Destination -->
              <div style="background:#FAF6F0;border-radius:12px;padding:18px;margin-bottom:24px;border:1px solid #EAE3D6;">
                <div style="font-size:11px;font-weight:700;color:#C4601A;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                  📍 Shipping Destination
                </div>
                <div style="font-size:13px;font-weight:700;color:#1A1A1A;">${order.name}</div>
                <div style="font-size:12px;color:#555555;line-height:1.5;margin-top:2px;">${order.address}</div>
              </div>

              <!-- Package Contents -->
              <h3 style="margin:0 0 8px;font-size:15px;color:#1A1A1A;font-weight:700;border-bottom:2px solid #FAF6F0;padding-bottom:8px;">
                Package Contents (${items.length} item${items.length === 1 ? '' : 's'})
              </h3>
              ${renderItemsList(items)}

              <p style="margin:20px 0 0;font-size:12px;color:#888888;line-height:1.6;text-align:center;">
                Delivery typically takes 3 to 5 business days. Please keep your phone (${order.phone}) reachable for delivery updates from the courier executive.
              </p>
            </td>
          </tr>
          ${renderEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const success = await sendBrevoEmail({
      toEmail: customerEmail,
      toName: order.name || 'Valued Customer',
      subject: `🚚 Your Sneh Sarees Order Has Shipped! #${order.id}`,
      htmlContent,
    });

    if (success) {
      await db.markOrderEmailSent(order.id, 'shipped');
      console.log(`[OrderEmail] ✅ Order shipped email sent to ${customerEmail} for order #${order.id}`);
    }

    return success;
  } catch (err: any) {
    console.error(`[OrderEmail] Failed to process order shipped email:`, err.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ORDER DELIVERED EMAIL
// ─────────────────────────────────────────────────────────────────────────────
export async function sendOrderDeliveredEmail(orderOrId: string | Order, force = false): Promise<boolean> {
  try {
    const order: Order | null =
      typeof orderOrId === 'string' ? await db.getOrderById(orderOrId) : orderOrId;

    if (!order) {
      console.warn(`[OrderEmail] Cannot send delivered email: order not found.`);
      return false;
    }

    // Check if delivered email was already sent (unless force is requested)
    if (!force) {
      const alreadySent = await db.isOrderEmailSent(order.id, 'delivered');
      if (alreadySent) {
        console.log(`[OrderEmail] Delivered email already sent for #${order.id}. Skipping.`);
        return true;
      }
    }

    const customerEmail = await resolveCustomerEmail(order);
    if (!customerEmail) {
      console.warn(`[OrderEmail] No email address found for order #${order.id}. Skipping delivered email.`);
      return false;
    }

    const items = await enrichOrderItems(order.items || []);
    const siteUrl = ENV.FRONTEND_URL || 'https://www.snehsarees.in';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delivered — Sneh Sarees Order #${order.id}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF6F0;font-family:'Segoe UI',Arial,sans-serif;color:#333333;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF6F0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);border:1px solid #E8E0D5;">
          ${renderEmailHeader('Handloom Silks & Bridal Swatches')}
          <tr>
            <td style="padding:36px 32px;">
              <!-- Delivered Badge -->
              <div style="display:inline-block;background:#EBF9F1;border:1px solid #A3E3BE;border-radius:24px;padding:6px 14px;margin-bottom:16px;">
                <span style="color:#0E864E;font-size:12px;font-weight:700;letter-spacing:0.5px;">✨ DELIVERED SAFELY</span>
              </div>

              <h2 style="margin:0 0 12px;color:#1A1A1A;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;">
                Your package has arrived, ${order.name || 'Customer'}!
              </h2>
              <p style="margin:0 0 24px;color:#666666;font-size:14px;line-height:1.6;">
                We are thrilled to let you know that your Sneh Sarees order has been successfully delivered. We hope you fall in love with the pure fabric and artisanal craftsmanship!
              </p>

              <!-- Delivery Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF6F0;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid #EAE3D6;">
                <tr>
                  <td style="padding:4px 8px;font-size:12px;color:#777777;">Order ID</td>
                  <td style="padding:4px 8px;font-size:12px;color:#777777;">Delivery Status</td>
                  <td style="padding:4px 8px;font-size:12px;color:#777777;">Delivered On</td>
                </tr>
                <tr>
                  <td style="padding:4px 8px;font-size:14px;font-weight:700;color:#C4601A;font-family:monospace;">${order.id}</td>
                  <td style="padding:4px 8px;font-size:13px;font-weight:700;color:#0E864E;">Delivered</td>
                  <td style="padding:4px 8px;font-size:13px;font-weight:600;color:#1A1A1A;">${formatDate()}</td>
                </tr>
              </table>

              <!-- Delivered Items -->
              <h3 style="margin:0 0 8px;font-size:15px;color:#1A1A1A;font-weight:700;border-bottom:2px solid #FAF6F0;padding-bottom:8px;">
                Delivered Sarees
              </h3>
              ${renderItemsList(items)}

              <!-- Saree Care Tip Card -->
              <div style="background:#FFF9F2;border-left:4px solid #C4601A;border-radius:4px;padding:16px 20px;margin:24px 0;">
                <div style="font-size:13px;font-weight:700;color:#C4601A;margin-bottom:4px;">
                  🧵 Saree Care Tip for Pure Handlooms
                </div>
                <div style="font-size:12px;color:#666666;line-height:1.5;">
                  We recommend dry cleaning for the first wash to preserve the natural silk luster and zari sheen. Store in a breathable cotton or muslin bag away from direct sunlight.
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="text-align:center;margin:28px 0 12px;">
                <a href="${siteUrl}" style="display:inline-block;background:linear-gradient(135deg,#C4601A 0%,#E8920E 100%);color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:14px 28px;border-radius:8px;box-shadow:0 3px 12px rgba(196,96,26,0.25);margin-right:10px;">
                  Shop New Collections &rarr;
                </a>
              </div>

              <p style="margin:24px 0 0;font-size:12px;color:#888888;line-height:1.6;text-align:center;">
                If you have any feedback or require assistance with exchange or return, please write to us within 7 days at <a href="mailto:info@snehsarees.in" style="color:#C4601A;text-decoration:none;font-weight:600;">info@snehsarees.in</a>.
              </p>
            </td>
          </tr>
          ${renderEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();

    const success = await sendBrevoEmail({
      toEmail: customerEmail,
      toName: order.name || 'Valued Customer',
      subject: `🎉 Delivered: Your Sneh Sarees Order #${order.id} Has Arrived!`,
      htmlContent,
    });

    if (success) {
      await db.markOrderEmailSent(order.id, 'delivered');
      console.log(`[OrderEmail] ✅ Order delivered email sent to ${customerEmail} for order #${order.id}`);
    }

    return success;
  } catch (err: any) {
    console.error(`[OrderEmail] Failed to process order delivered email:`, err.message);
    return false;
  }
}
