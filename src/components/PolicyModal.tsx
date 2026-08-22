import React, { useState } from 'react';
import { X, Shield, FileText, Truck, RotateCcw, Ban, HelpCircle, CheckCircle2, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';
import { BUSINESS_WHATSAPP } from '../config';

export type PolicyTab = 'privacy' | 'terms' | 'shipping' | 'cancellation' | 'faqs';

interface PolicyModalProps {
  isOpen: boolean;
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  initialTab = 'privacy',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const tabs: { id: PolicyTab; label: string; icon: any }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'cancellation', label: 'Cancellation & Payments', icon: Ban },
    { id: 'faqs', label: 'FAQs & Help', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-[840px] h-[90vh] max-h-[720px] bg-white rounded-2xl md:rounded-3xl border border-[#E8E0D5] shadow-2xl flex flex-col overflow-hidden animate-scale-100">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 md:px-7 border-b border-[#E8E0D5] bg-[#FAF6F0] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center text-[#C4601A]">
              {activeTab === 'privacy' && <Shield className="w-4.5 h-4.5" />}
              {activeTab === 'terms' && <FileText className="w-4.5 h-4.5" />}
              {activeTab === 'shipping' && <Truck className="w-4.5 h-4.5" />}
              {activeTab === 'cancellation' && <Ban className="w-4.5 h-4.5" />}
              {activeTab === 'faqs' && <HelpCircle className="w-4.5 h-4.5" />}
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
                Store Policies &amp; Legal Center
              </h2>
              <p className="text-[11px] text-[#888888]">Standard e-commerce consumer terms &amp; guidelines</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
            title="Close Policies"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-[#E8E0D5] bg-white px-2 md:px-4 overflow-x-auto no-scroll shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#C4601A] text-[#C4601A] bg-[#FFF8F3]'
                    : 'border-transparent text-gray-600 hover:text-[#1A1A1A] hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C4601A]' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 md:p-8 overflow-y-auto flex-1 font-sans text-xs sm:text-sm text-[#3A3A3A] leading-relaxed space-y-6">

          {/* ═════════ 1. PRIVACY POLICY ═════════ */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FFF8F3] border border-[#F0C8A0] rounded-xl p-4">
                <h3 className="font-serif text-base font-bold text-[#C4601A] mb-1">Privacy Policy</h3>
                <p className="text-xs text-[#7A3A12]">
                  Last Updated: August 2026. Sneh Sarees is dedicated to safeguarding your personal data, honoring your privacy rights, and maintaining absolute transparency in all consumer interactions.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">1</span>
                  Information We Collect
                </h4>
                <p>When you visit or make a purchase on Sneh Sarees, we collect necessary personal details to process and fulfill your artisanal saree orders:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  <li><strong>Personal Identifiers:</strong> Name, email address, contact phone number, and delivery addresses.</li>
                  <li><strong>Order Information:</strong> Saree selections, quantities, price details, and transaction reference/UTR identifiers.</li>
                  <li><strong>Technical &amp; Device Details:</strong> IP address, browser type, operating system, and session cookies to persist cart state.</li>
                  <li><strong>Payment Security:</strong> We do <em>NOT</em> store credit/debit card numbers, CVVs, or net banking passwords. All payments are verified securely via UPI QR verification and banking gateways.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">2</span>
                  How We Use Your Information
                </h4>
                <p>Your data is used strictly for legitimate commercial and fulfillment objectives:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  <li>To verify, inspect, package, and deliver your handloom saree orders.</li>
                  <li>To send real-time order confirmation receipts, WhatsApp updates, and courier AWB tracking links.</li>
                  <li>To provide responsive customer support and resolve post-order service or return inquiries.</li>
                  <li>To prevent fraudulent transactions and maintain system integrity.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">3</span>
                  Zero Data Selling &amp; Third-Party Disclosure
                </h4>
                <p>
                  <strong>We strictly NEVER sell, rent, lease, or monetize your personal information to third-party advertisers, data brokers, or marketing syndicates.</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Data is only shared with certified logistics carriers (e.g. Shiprocket, India Post, Delhivery) exclusively for doorstep delivery handover, and with law enforcement authorities only when mandated by valid legal statutes.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">4</span>
                  Data Protection &amp; Security Measures
                </h4>
                <p>
                  We implement multi-layered encryption protocols (TLS/SSL), restricted administrative role access, and secure database storage to prevent unauthorized data access, loss, or misuse.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">5</span>
                  Your Privacy Rights &amp; Account Deletion
                </h4>
                <p>
                  You have full rights to access, review, modify, or permanently delete your account data at any time via your Profile settings or by emailing our Grievance Officer at <strong>support@snehsarees.com</strong>.
                </p>
              </section>
            </div>
          )}

          {/* ═════════ 2. TERMS & CONDITIONS ═════════ */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FFF8F3] border border-[#F0C8A0] rounded-xl p-4">
                <h3 className="font-serif text-base font-bold text-[#C4601A] mb-1">Terms &amp; Conditions of Service</h3>
                <p className="text-xs text-[#7A3A12]">
                  Please read these Terms carefully before using our website or purchasing handcrafted handloom products from Sneh Sarees.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">1</span>
                  Acceptance &amp; Eligibility
                </h4>
                <p>
                  By accessing, browsing, or placing an order on Sneh Sarees, you acknowledge that you are at least 18 years of age (or browsing under parental/guardian supervision) and agree to be bound by these legal terms.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">2</span>
                  Handcrafted &amp; Handloom Characteristics
                </h4>
                <p>
                  All sarees featured in our catalog are artisanal handloom products woven or hand-embroidered by regional master artisans:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  <li>Minor irregularities in yarn weave, slubs, selvedge knots, block dye nuances, and zari alignments are natural characteristics of authentic handcrafted heritage art.</li>
                  <li>Digital screen calibrations and lighting differences across phones/monitors may produce slight perceptible color variations from physical fabrics.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">3</span>
                  Pricing, Taxes &amp; Currency
                </h4>
                <p>
                  All retail prices are quoted in Indian Rupees (₹ INR) and include all applicable GST taxes and weaving levies. Sneh Sarees reserves the right to correct typographical or listing errors prior to order dispatch.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">4</span>
                  Order Acceptance &amp; Payment Verification
                </h4>
                <p>
                  Placing an order constitutes an offer to purchase. An order is confirmed once payment verification (via UPI QR or online gateway) is approved by our billing team. Sneh Sarees reserves the right to cancel orders due to unforeseen fabric defect during final inspection or incorrect delivery coordinates.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">5</span>
                  Intellectual Property
                </h4>
                <p>
                  All brand marks, logos, saree photographs, catalog descriptions, and artwork are the exclusive intellectual property of Sneh Sarees. Any unauthorized commercial copying, reproduction, or redistribution is strictly prohibited.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">6</span>
                  Governing Law &amp; Jurisdiction
                </h4>
                <p>
                  These Terms of Service are governed by and construed under the laws of India. Any legal proceedings or dispute claims shall be subject to the exclusive jurisdiction of the competent courts in Rajasthan, India.
                </p>
              </section>
            </div>
          )}

          {/* ═════════ 3. SHIPPING & DELIVERY ═════════ */}
          {activeTab === 'shipping' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FFF8F3] border border-[#F0C8A0] rounded-xl p-4">
                <h3 className="font-serif text-base font-bold text-[#C4601A] mb-1">Shipping &amp; Express Delivery Policy</h3>
                <p className="text-xs text-[#7A3A12]">
                  We partner with top-tier courier networks to ensure your handcrafted sarees arrive safely, on time, and in pristine condition.
                </p>
              </div>

              {/* Delivery rates highlight banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-emerald-900 uppercase tracking-wider">Orders ₹2,000 &amp; Above</h5>
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">FREE Express Doorstep Delivery (₹0)</p>
                    <span className="text-[10px] text-emerald-700">Applies automatically on cart total ≥ ₹2,000</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Truck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-amber-900 uppercase tracking-wider">Orders Below ₹2,000</h5>
                    <p className="text-xs text-amber-800 font-semibold mt-0.5">Flat ₹100 Standard Delivery Charge</p>
                    <span className="text-[10px] text-amber-700">Covers courier freight &amp; secure tamper-proof packing</span>
                  </div>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">1</span>
                  Dispatch &amp; Processing Timelines
                </h4>
                <p>
                  Every saree undergoes a meticulous master-weaver quality inspection and multi-layer moisture-proof packaging before dispatch.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  <li><strong>Dispatch Window:</strong> 1 to 2 business days from payment confirmation.</li>
                  <li><strong>Transit Time:</strong> 3 to 5 business days for major metropolitan cities; 5 to 7 business days for other regional areas.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">2</span>
                  Live Shipment Tracking
                </h4>
                <p>
                  Upon parcel handover to our courier partner (Shiprocket / India Post / Delhivery), you will receive:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  <li>An official Air Waybill (AWB) tracking number.</li>
                  <li>Instant WhatsApp tracking alerts with a one-click live tracking link.</li>
                  <li>Direct access in your <strong>My Orders</strong> portal.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">3</span>
                  Delivery Attempts &amp; Address Verification
                </h4>
                <p>
                  Our courier partners will attempt delivery up to 3 times before returning the parcel to our hub. Please provide complete address details with landmark and a reachable 10-digit mobile number at checkout.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">4</span>
                  Transit Damage &amp; Unboxing Video Guideline
                </h4>
                <div className="bg-[#FFF8E1] border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-700" /> Mandatory Unboxing Video Requirement:
                  </p>
                  <p>
                    Please record a continuous, uncut 360-degree unboxing video from opening the outer courier polybag to inspecting the saree fabric. This is required for courier damage claims and rapid replacement dispatch.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* ═════════ 4. CANCELLATION & PAYMENTS ═════════ */}
          {activeTab === 'cancellation' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-[#FFF8F3] border border-[#F0C8A0] rounded-xl p-4">
                <h3 className="font-serif text-base font-bold text-[#C4601A] mb-1">Cancellation &amp; Payment Policies</h3>
                <p className="text-xs text-[#7A3A12]">
                  Transparent guidelines for order cancellations, accepted digital payment methods, and automated transaction dispute handling.
                </p>
              </div>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">1</span>
                  Order Cancellation Guidelines
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-gray-700">
                  <li><strong>Before Dispatch:</strong> You can cancel your order free of charge at any time prior to courier dispatch by contacting our support team on WhatsApp with your Order ID. 100% of the paid amount is refunded immediately.</li>
                  <li><strong>After Dispatch &amp; Delivery:</strong> Once the parcel is in transit or delivered, orders cannot be cancelled. As our sarees are authentic handcrafted Kota Doria handlooms inspected before dispatch, we currently do not offer returns or exchanges after delivery.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">2</span>
                  Accepted Payment Methods
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E8E0D5]">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md inline-block mb-1">Active</span>
                    <h6 className="font-bold text-xs text-[#1A1A1A]">Instant UPI QR Code</h6>
                    <p className="text-[11px] text-gray-600 mt-1">Scan our official verified QR code with Google Pay, PhonePe, Paytm, BHIM, or Cred.</p>
                  </div>
                  <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#E8E0D5]">
                    <span className="text-[10px] font-extrabold uppercase bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md inline-block mb-1">Coming Soon</span>
                    <h6 className="font-bold text-xs text-[#1A1A1A]">Cards &amp; Net Banking</h6>
                    <p className="text-[11px] text-gray-600 mt-1">Direct Visa/Mastercard/RuPay card checkout and Netbanking options.</p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">3</span>
                  Cash on Delivery (COD) Status
                </h4>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                  <p className="font-bold">⚠️ Cash on Delivery is currently unavailable:</p>
                  <p className="mt-1 text-amber-800">
                    To maintain direct artisan-to-doorstep coordination and prevent transit delivery rejections, all orders are accepted on a prepaid online basis via UPI QR Code.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="font-serif font-bold text-[#1A1A1A] text-sm md:text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FFF0E8] text-[#C4601A] flex items-center justify-center text-xs font-bold">4</span>
                  Failed Transactions &amp; Auto-Reversals
                </h4>
                <p>
                  If money is debited from your bank account but an order confirmation is not generated due to network disruption, your bank will automatically reverse the transaction within <strong>5 to 7 working days</strong> according to RBI banking standards. You may also contact our WhatsApp support with your bank transaction UTR reference for immediate reconciliation.
                </p>
              </section>
            </div>
          )}

          {/* ═════════ 6. FAQS ═════════ */}
          {activeTab === 'faqs' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[#FFF8F3] border border-[#F0C8A0] rounded-xl p-4 mb-2">
                <h3 className="font-serif text-base font-bold text-[#C4601A] mb-1">Frequently Asked Questions (FAQs)</h3>
                <p className="text-xs text-[#7A3A12]">
                  Find quick answers to common queries about saree fabrics, authenticity, care, delivery, and orders.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8E0D5]">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-[#C4601A]">Q:</span> Are your sarees 100% authentic Kota Doria?
                  </h4>
                  <p className="text-xs text-gray-700 pl-4">
                    A: Yes! Every saree in our catalog is procured directly from traditional master weavers of Kota Doria (Kotadoria) in Kota, Rajasthan. We specialize exclusively in authentic, handcrafted Kota Doria sarees featuring genuine Khat-weave square grids without synthetic machine compromises.
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8E0D5]">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-[#C4601A]">Q:</span> Is a blouse piece included with the saree?
                  </h4>
                  <p className="text-xs text-gray-700 pl-4">
                    A: Most sarees include an 80cm unstitched running blouse piece matching the saree design. Each product page explicitly highlights "Blouse Piece Included" or "Blouse Piece Not Included" for complete clarity.
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8E0D5]">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-[#C4601A]">Q:</span> How much does delivery cost?
                  </h4>
                  <p className="text-xs text-gray-700 pl-4">
                    A: Delivery is <strong>FREE for all orders ₹2,000 and above</strong>. For orders below ₹2,000, a flat delivery fee of <strong>₹100</strong> applies across India.
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8E0D5]">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-[#C4601A]">Q:</span> What are the recommended care instructions for Kota Doria sarees?
                  </h4>
                  <p className="text-xs text-gray-700 pl-4">
                    A: For Kota Doria cotton and silk sarees, gentle hand wash in cold water with mild detergent or gentle dry clean is recommended. Dry in the shade to preserve the delicate Khat-weave structure and natural luster.
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8E0D5]">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-[#C4601A]">Q:</span> Do you accept returns or exchanges after delivery?
                  </h4>
                  <p className="text-xs text-gray-700 pl-4">
                    A: Because every saree is an authentic, delicate handcrafted Kota Doria handloom weave checked thoroughly prior to dispatch, we currently do not accept returns or exchanges once delivered. However, you can cancel your order anytime before courier dispatch with a 100% instant refund.
                  </p>
                </div>

                <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#E8E0D5]">
                  <h4 className="font-serif font-bold text-[#1A1A1A] text-xs sm:text-sm mb-1.5 flex items-center gap-2">
                    <span className="text-[#C4601A]">Q:</span> Do you accept bulk or wedding trousseau orders?
                  </h4>
                  <p className="text-xs text-gray-700 pl-4">
                    A: Yes! We cater to wedding parties, boutiques, and bulk gifting with authentic Kota Doria wholesale pricing tiers. You can submit an inquiry through our <strong>Bulk Order</strong> page or connect with us directly on WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Support Footer Box */}
          <div className="bg-[#FAF6F0] border border-[#E8E0D5] rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C4601A] block">Customer Grievance &amp; Helpdesk</span>
              <p className="text-xs font-semibold text-[#1A1A1A]">Have questions regarding our policies?</p>
              <p className="text-[11px] text-gray-500">Reach our dedicated support team Mon–Sat (9 AM to 7 PM IST)</p>
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              <a
                href={`https://wa.me/${BUSINESS_WHATSAPP || '919414067123'}?text=${encodeURIComponent('Namaste Sneh Sarees! I have a question regarding store policies.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" /> WhatsApp Support
              </a>
            </div>
          </div>

        </div>

        {/* Modal Bottom Close Bar */}
        <div className="bg-[#FAF6F0] p-3.5 px-6 border-t border-[#E8E0D5] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#888888]">
            © {new Date().getFullYear()} Sneh Sarees · Handcrafted with pride in India
          </span>
          <button
            onClick={onClose}
            className="bg-[#C4601A] hover:bg-[#A0450F] font-bold text-white px-6 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            Close &amp; Continue
          </button>
        </div>

      </div>
    </div>
  );
};
