import React, { useState } from 'react';
import { ArrowLeft, Check, Copy, Home, MessageCircle, QrCode, ShoppingBag, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Order, ActivePage } from '../../types';
import { BUSINESS_WHATSAPP, PAYMENT_QR_URL } from '../../config';
import { SareeSwatch } from '../SareeSwatch';

interface PendingPaymentViewProps {
  order: Order | null;
  onNavigate: (page: ActivePage, param?: string) => void;
}

export const PendingPaymentView: React.FC<PendingPaymentViewProps> = ({ order, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    if (!order?.id) return;
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!order) return;
    const msg =
      `Namaste Sneh Sarees! 🙏\n\n` +
      `I have placed an order and want to share my payment details:\n` +
      `• Order ID: ${order.id}\n` +
      `• Amount: ₹${order.total.toLocaleString('en-IN')}\n` +
      `• Customer Name: ${order.name}\n` +
      `• Phone: ${order.phone}\n\n` +
      `I am attaching my payment screenshot below. Please confirm my order and share live tracking once dispatched! Thank you! ✨`;

    const phoneNum = BUSINESS_WHATSAPP || '919461037123';
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!order) {
    return (
      <div className="bg-transparent min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-700">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-2">Order Not Found</h2>
        <p className="text-xs text-[#888888] max-w-sm mb-6">
          We could not find the active order details. You can review all your orders in your account.
        </p>
        <button
          onClick={() => onNavigate('orders')}
          className="bg-[#C4601A] text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-[#a84e15] transition-colors cursor-pointer"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div id="page-pending-payment" className="min-h-screen pb-16 bg-[#FAF6F0]/80 backdrop-blur-xs">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          onClick={() => onNavigate('orders')}
          className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          title="View Orders"
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          Complete Payment
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          title="Return to Home"
        >
          <Home className="w-[22px] h-[22px]" />
        </button>
      </div>

      <div className="max-w-[620px] mx-auto px-4 pt-6 space-y-5">
        {/* Status Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white text-center shadow-md relative overflow-hidden">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-2">
            Order Placed · Awaiting Payment Confirmation
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold mb-1">
            Pay ₹{order.total.toLocaleString('en-IN')} via UPI
          </h1>
          <p className="text-xs text-amber-100 font-medium max-w-md mx-auto leading-relaxed">
            Scan our official UPI QR code below, complete your payment, and share the screenshot on WhatsApp to verify and dispatch your order.
          </p>
        </div>

        {/* Order ID & Meta Box */}
        <div className="bg-white rounded-2xl p-4 border border-[#E8E0D5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
              Your Order ID
            </span>
            <span className="font-mono font-bold text-sm text-[#1A1A1A]">
              {order.id}
            </span>
          </div>
          <button
            onClick={handleCopyOrderId}
            className="flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#E8E0D5] text-[#C4601A] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-[#E8E0D5]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* QR Code & Payment Action Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-[#C4601A] font-serif font-bold text-base">
            <QrCode className="w-5 h-5" />
            <span>Scan UPI QR Code</span>
          </div>

          <div className="bg-[#FAF6F0] p-4 rounded-2xl border-2 border-dashed border-[#C4601A]/30 flex flex-col items-center">
            <img
              src={PAYMENT_QR_URL || '/payment-qr.jpg'}
              alt="Sneh Sarees Payment QR Code"
              className="w-[230px] h-[230px] object-contain rounded-xl shadow-xs bg-white p-2 border border-[#E8E0D5]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/payment-qr.jpg';
              }}
            />
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Sneh Sarees Merchant QR</span>
            </div>
          </div>

          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-0.5">
              Exact Amount to Pay
            </p>
            <p className="text-2xl font-extrabold text-amber-900">
              ₹{order.total.toLocaleString('en-IN')}
            </p>
          </div>

          {/* 4 Step Instructions */}
          <div className="w-full text-left space-y-2.5 pt-2">
            <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
              Quick Steps to Complete:
            </h4>
            {[
              'Open GPay, PhonePe, Paytm, or any UPI app on your phone.',
              'Scan the QR code above and pay the exact amount.',
              'Take a screenshot of the successful payment receipt.',
              'Click the button below to send your screenshot to WhatsApp.',
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#4A4A4A]">
                <div className="w-5 h-5 rounded-full bg-[#C4601A] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <span className="leading-tight font-medium">{step}</span>
              </div>
            ))}
          </div>

          {/* WhatsApp Primary CTA */}
          <button
            id="btn-whatsapp-screenshot"
            onClick={handleOpenWhatsApp}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-4 rounded-xl text-sm font-bold shadow-md active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2.5 mt-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send Payment Screenshot on WhatsApp</span>
          </button>

          <p className="text-[11px] text-[#888888] font-medium leading-relaxed">
            ⚡ Once verified by our team, we will confirm your order and send live tracking details directly to your WhatsApp &amp; Account!
          </p>
        </div>

        {/* Order Items Preview */}
        <div className="bg-white rounded-2xl p-5 border border-[#E8E0D5] shadow-xs space-y-3">
          <h4 className="font-serif font-bold text-sm text-[#1A1A1A] flex items-center justify-between">
            <span>Ordered Items ({order.items.length})</span>
            <span className="text-xs font-sans text-[#888888]">Subtotal: ₹{order.total.toLocaleString('en-IN')}</span>
          </h4>
          <div className="divide-y divide-[#FAF6F0]">
            {order.items.map((it, idx) => (
              <div key={idx} className="py-2.5 flex items-center gap-3 first:pt-0 last:pb-0">
                <div className="w-12 h-14 rounded-lg bg-[#FAF6F0] overflow-hidden shrink-0 border border-[#E8E0D5]">
                  <SareeSwatch id={it.id} imageUrl={it.image} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xs font-bold text-[#1A1A1A] truncate">{it.name}</p>
                  <p className="text-[11px] text-[#888888]">Qty: {it.qty} · Colour: {it.colour}</p>
                </div>
                <div className="text-xs font-bold text-[#1A1A1A]">
                  ₹{(it.price * it.qty).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E0D5] text-[11px] text-[#666666]">
            <span className="font-bold text-[#1A1A1A]">Delivery Address:</span> {order.address}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 bg-white border border-[#E8E0D5] hover:border-[#C4601A] text-[#1A1A1A] py-3.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#C4601A]" />
            <span>Go to My Orders</span>
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 bg-[#C4601A] hover:bg-[#a84e15] text-white py-3.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
