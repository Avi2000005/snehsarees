/**
 * One-Time Migration Script: Migrate hardcoded policies into the database
 * 
 * Usage:
 *   npx tsx scripts/migrate-policies.ts
 */

import { db } from '../server/data/db';
import { pool } from '../server/config/database';

const POLICIES_TO_MIGRATE = [
  {
    slug: 'shipping-policy',
    title: 'Shipping & Delivery Policy',
    content: `
<h2>Shipping & Delivery Terms</h2>
<p>We take immense pride in ensuring every handcrafted Kota Doria saree reaches you quickly, securely, and in pristine condition.</p>

<h3>1. Free Express Shipping</h3>
<p>We offer complimentary <strong>Free Express Shipping</strong> across India on all orders of <strong>₹2,000 and above</strong>. For domestic orders below ₹2,000, a flat nominal delivery fee of ₹100 applies.</p>

<h3>2. Dispatch & Transit Timelines</h3>
<ul>
  <li><strong>Order Dispatch:</strong> All orders are dispatched within <strong>1 to 3 business days</strong> from payment confirmation (subject to order verification).</li>
  <li><strong>Metro Cities:</strong> Usually delivered within <strong>1 to 3 business days</strong> after dispatch.</li>
  <li><strong>Rest of India:</strong> Delivered within <strong>2 to 7 business days</strong> depending on regional connectivity.</li>
</ul>

<h3>3. Trusted Pan-India Courier Partners</h3>
<p>We partner with India's leading logistics providers including <strong>Bluedart, Delhivery, DTDC, and Shiprocket</strong> to ensure fast and secure doorstep delivery.</p>

<h3>4. Live Shipment Tracking</h3>
<p>Once your parcel is handed over to our courier partner, you will receive an Air Waybill (AWB) tracking number and live tracking link via SMS, WhatsApp, and email. You can also view live delivery status anytime under <strong>My Orders</strong> on our website.</p>

<h3>5. Secure & Tamper-Proof Packaging</h3>
<p>Every saree undergoes thorough quality inspection by our master artisans in Kota before being sealed in weather-resistant, tamper-proof packaging.</p>
    `.trim(),
    is_published: true,
  },
  {
    slug: 'return-policy',
    title: 'Return & Refund Policy',
    content: `
<h2>Return & Refund Policy</h2>
<p>Sneh Sarees offers a hassle-free <strong>7-day return and exchange policy</strong> on all eligible handcrafted sarees, subject to company terms and conditions.</p>

<h3>1. 7-Day Return Guarantee</h3>
<p>Returns and exchange requests are gladly accepted within <strong>7 calendar days of parcel delivery</strong> for all eligible orders.</p>

<h3>2. Eligibility Criteria</h3>
<ul>
  <li>The saree must be in its original, unused, unwashed condition with all brand tags and product packaging intact.</li>
  <li>Customized sarees, stitched blouse pieces, or fall-pico alterations made on personal request are not eligible for return.</li>
  <li>Return requests must be initiated within 7 days from the recorded delivery date.</li>
</ul>

<h3>3. How to Request a Return or Exchange</h3>
<p>You can effortlessly initiate a request directly through your <strong>My Orders</strong> page on our website by selecting the order and clicking <em>"Request Return/Exchange"</em>, or by messaging our support helpline on WhatsApp with your Order ID.</p>

<h3>4. Pickup & Refund Timelines</h3>
<ul>
  <li><strong>Reverse Pickup:</strong> Once approved, our courier partner will arrange a doorstep reverse pickup within 1 to 3 business days.</li>
  <li><strong>Quality Inspection:</strong> The parcel is inspected at our hub upon arrival.</li>
  <li><strong>Refund Credit:</strong> Refunds are processed back to your original payment method or bank account within <strong>3 to 5 business days</strong> of quality approval.</li>
</ul>

<h3>5. Transit Damage & Mandatory Unboxing Guideline</h3>
<p>In the rare event of transit damage or missing items, please retain the outer courier packaging and share a continuous, uncut unboxing video within 48 hours with our customer care team on WhatsApp for immediate priority replacement.</p>
    `.trim(),
    is_published: true,
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    content: `
<h2>Privacy Policy</h2>
<p>Sneh Sarees is dedicated to honoring your privacy rights, safeguarding your personal data, and maintaining complete transparency in all our customer relationships.</p>

<h3>1. Information We Collect</h3>
<p>When you browse or place an order on Sneh Sarees, we collect necessary personal details to process and fulfill your purchases:</p>
<ul>
  <li><strong>Personal Identifiers:</strong> Name, email address, contact phone number, and delivery addresses.</li>
  <li><strong>Order Information:</strong> Saree selections, quantities, prices, and payment reference identifiers.</li>
  <li><strong>Payment Security:</strong> We do <em>NOT</em> store credit/debit card numbers, CVVs, or netbanking passwords. All digital payments are processed through secure, RBI-compliant payment channels and verified UPI QR codes.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<ul>
  <li>To inspect, package, and deliver your orders accurately.</li>
  <li>To send real-time order receipts, WhatsApp notifications, and courier tracking updates.</li>
  <li>To provide responsive customer support and resolve post-order service inquiries.</li>
  <li>To prevent fraudulent transactions and safeguard platform integrity.</li>
</ul>

<h3>3. Zero Data Selling Commitment</h3>
<p><strong>We strictly NEVER sell, rent, lease, or monetize your personal information to third-party advertisers, data brokers, or marketing syndicates.</strong> Customer delivery information is shared solely with certified logistics couriers (such as Shiprocket, Delhivery, DTDC) exclusively for doorstep delivery handover.</p>

<h3>4. Data Security Measures</h3>
<p>We implement multi-layered encryption protocols (TLS/SSL), role-based administrative access, and secure data storage to prevent unauthorized access or disclosure.</p>

<h3>5. Your Privacy Rights</h3>
<p>You have full rights to review, update, or permanently delete your account data at any time via your Profile settings or by emailing our Grievance Officer at <strong>info@snehsarees.in</strong>.</p>
    `.trim(),
    is_published: true,
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    content: `
<h2>Terms & Conditions of Service</h2>
<p>Please read these Terms carefully before using our website or purchasing sarees from Sneh Sarees.</p>

<h3>1. Acceptance & Eligibility</h3>
<p>By browsing, accessing, or placing an order on Sneh Sarees, you acknowledge that you are at least 18 years of age (or browsing under parental/guardian supervision) and agree to be bound by these Terms of Service.</p>

<h3>2. Handcrafted Saree Characteristics</h3>
<p>All sarees featured in our collection are authentic traditional handloom and artisanal textiles:</p>
<ul>
  <li>Natural subtle variations in yarn weave, textures, selvedge finishes, and zari nuances are intrinsic hallmarks of authentic handloom textile art.</li>
  <li>Digital screen calibrations and lighting differences across various phones and monitors may cause slight perceptible color variations from physical fabrics.</li>
</ul>

<h3>3. Pricing, Taxes & Invoicing</h3>
<p>All prices listed on our website are quoted in Indian Rupees (₹ INR) and include all applicable GST taxes. Sneh Sarees reserves the right to correct typographical or listing errors prior to order dispatch.</p>

<h3>4. Order Confirmation & Payment Verification</h3>
<p>Placing an order constitutes an offer to purchase. An order is confirmed once payment verification (via UPI QR or online gateway) is validated by our accounts team.</p>

<h3>5. Intellectual Property</h3>
<p>All brand marks, logos, saree photographs, catalog descriptions, and website graphics are the exclusive intellectual property of Sneh Sarees. Any unauthorized commercial reproduction, copying, or redistribution is strictly prohibited.</p>

<h3>6. Governing Law & Jurisdiction</h3>
<p>These Terms of Service are governed by and construed under the laws of the Republic of India. Any legal dispute or claim shall be subject to the exclusive jurisdiction of the competent courts in Kota, Rajasthan, India.</p>
    `.trim(),
    is_published: true,
  },
  {
    slug: 'cancellation-policy',
    title: 'Cancellation & Payment Policy',
    content: `
<h2>Cancellation & Payment Policies</h2>
<p>We believe in transparent, straightforward guidelines for order cancellations, accepted digital payment methods, and automated transaction reconciliation.</p>

<h3>1. Order Cancellation Guidelines</h3>
<ul>
  <li><strong>Before Dispatch:</strong> You can cancel your order free of charge at any time prior to courier dispatch by contacting our support team on WhatsApp with your Order ID. 100% of the paid amount will be refunded immediately.</li>
  <li><strong>After Dispatch:</strong> Once a parcel is in transit with the courier, orders cannot be cancelled mid-transit. You may initiate a return or exchange under our 7-day return policy upon doorstep delivery.</li>
</ul>

<h3>2. Accepted Payment Methods</h3>
<ul>
  <li><strong>Instant UPI QR Code:</strong> Scan our verified QR code using Google Pay, PhonePe, Paytm, BHIM, Cred, or any UPI app for zero-fee, instant confirmation.</li>
  <li><strong>Net Banking & Cards:</strong> Supported for direct online checkout.</li>
</ul>

<h3>3. Cash on Delivery (COD) Status</h3>
<p>To prevent delivery disruptions, fake bookings, and ensure seamless courier dispatch, orders are accepted on a prepaid basis via verified UPI QR Code and online banking.</p>

<h3>4. Failed Transactions & Auto-Reversals</h3>
<p>If money was debited from your bank account but an order confirmation was not generated due to a network disruption, your bank will automatically reverse the transaction within <strong>5 to 7 working days</strong> according to RBI standards. You may also share the bank transaction UTR with our WhatsApp support for immediate reconciliation.</p>
    `.trim(),
    is_published: true,
  },
];

async function runMigration() {
  console.log('🚀 Starting policy migration into database...');

  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS policies (
          id SERIAL PRIMARY KEY,
          slug VARCHAR(100) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          is_published BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_policies_slug ON policies(slug);
        CREATE INDEX IF NOT EXISTS idx_policies_published ON policies(is_published);
      `);
      console.log('✅ PostgreSQL `policies` table checked/created.');
    } catch (e: any) {
      console.warn('PostgreSQL table init note:', e.message);
    }
  }

  for (const pol of POLICIES_TO_MIGRATE) {
    try {
      const existing = await db.getPolicyBySlug(pol.slug, true);
      if (existing) {
        console.log(`ℹ️ Policy '${pol.slug}' already exists (ID: ${existing.id}). Skipping to preserve user edits.`);
      } else {
        const created = await db.createPolicy(pol);
        console.log(`✅ Created policy '${created.slug}' (ID: ${created.id}, Title: "${created.title}").`);
      }
    } catch (err: any) {
      console.error(`❌ Error migrating policy '${pol.slug}':`, err.message || err);
    }
  }

  console.log('🎉 Policy migration completed successfully.');
}

runMigration().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
