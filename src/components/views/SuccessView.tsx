import React from 'react';
import { ActivePage, Order } from '../../types';

interface SuccessViewProps {
  order: Order | null;
  onNavigate: (page: ActivePage, param?: string) => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({ order, onNavigate }) => {
  if (!order) {
    return (
      <div className="bg-[#FAF6F0] min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-4">No Order Details Found</h2>
        <button
          onClick={() => onNavigate('home')}
          className="bg-[#7B1C2E] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#9B2840]"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const triggerWhatsAppDispatchMsg = () => {
    const itemsSerialized = (order.items || [])
      .map((i) => `• ${i.name || 'Saree'} ×${i.qty || 1} — ₹${((i.price || 0) * (i.qty || 1)).toLocaleString('en-IN')}`)
      .join('\n');

    const msg = `Namaste Snehsarees!\n\nOrder Confirmed!\nOrder ID: ${order.id}\n\nItems:\n${itemsSerialized} \n\nTotal: Rs.${(order.total || 0).toLocaleString('en-IN')} (${order.method || 'Unknown'})\nDelivery to: ${order.address || ''}\n\nPlease confirm dispatch. Thank you!`;

    const encodedMsg = encodeURIComponent(msg);
    try {
      window.open(`https://wa.me/919414067123?text=${encodedMsg}`, '_blank');
    } catch (e) {
      console.error('Success view WhatsApp launch error:', e);
    }
  };

  return (
    <div id="page-success" className="bg-[#FAF6F0] min-h-screen flex flex-col items-center justify-start p-6 pt-16 pb-10 max-w-[620px] mx-auto">
      {/* Pop-In Checkbox Animation Indicator */}
      <div className="success-circle w-[90px] h-[90px] md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-br from-emerald-700 to-emerald-600 flex items-center justify-center text-white text-4xl shadow-lg mb-5 animate-scale-100">
        ✓
      </div>

      <h1 className="success-title font-serif text-3xl md:text-[38px] font-semibold text-[#1A1A1A] mb-1.5 text-center">
        Order Confirmed!
      </h1>
      <p className="success-subtitle text-xs text-[#888888] mb-6 text-center leading-relaxed">
        Your beautiful handcrafted saree is on its way
      </p>

      <div className="success-order-id bg-white border border-[#E8E0D5] rounded-xl px-5 py-3 text-sm text-[#4A4A4A] mb-4 w-full text-center shadow-xs">
        Order ID:{' '}
        <strong id="success-order-id" className="text-[#7B1C2E] font-bold">
          #{order.id}
        </strong>
      </div>

      {/* Recaps card */}
      <div id="success-items-card" className="success-card bg-white rounded-xl p-5 border border-[#E8E0D5] w-full shadow-xs mb-4">
        <h3 className="success-card-title font-serif text-base font-bold text-[#1A1A1A] mb-4">
          Order Summary
        </h3>

        <div id="success-items-list" className="flex flex-col gap-2.5">
          {(order.items || []).map((i, idx) => (
            <div key={idx} className="success-item flex justify-between text-xs">
              <span className="success-item-name text-gray-700">
                {i.name || 'Saree'} <span className="text-[#888888]">x{i.qty || 1}</span>
              </span>
              <span className="success-item-price font-semibold text-[#1A1A1A]">
                ₹{((i.price || 0) * (i.qty || 1)).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <hr className="success-divider border-0 border-t border-[#E8E0D5] my-4" />

        <div className="success-item flex justify-between text-sm items-center">
          <span className="font-bold text-gray-800">Total Paid</span>
          <span className="success-item-price text-base font-extrabold text-[#7B1C2E]" id="success-total">
            ₹{(order.total || 0).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="success-item flex justify-between text-xs items-center mt-3 text-gray-500">
          <span>Payment Info</span>
          <span className="font-semibold text-emerald-600 block text-right" id="success-payment-method">
            {(order.method || 'Processing')} ✓
          </span>
        </div>
      </div>

      <div className="success-delivery text-[#888888] text-xs font-semibold text-center mb-6">
        Estimated delivery: 5–7 business days
      </div>

      {/* WhatsApp Track button */}
      <button
        onClick={triggerWhatsAppDispatchMsg}
        className="whatsapp-btn w-full bg-[#25D366] text-white py-4 rounded-xl text-sm font-bold tracking-wider hover:brightness-110 active:scale-99 transition-all cursor-pointer text-center mb-3.5"
      >
        Track Order on WhatsApp
      </button>

      <button
        onClick={() => onNavigate('home')}
        className="continue-btn w-full border-1.5 border-[#7B1C2E] text-[#7B1C2E] hover:bg-[#7B1C2E]/4 py-3.5 rounded-xl text-sm font-semibold active:scale-99 transition-all cursor-pointer text-center bg-transparent"
      >
        Continue Shopping
      </button>
    </div>
  );
};
