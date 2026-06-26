import React from 'react';
import { ArrowLeft, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react';
import { Order, ActivePage } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface OrdersViewProps {
  orders: Order[];
  onNavigate: (page: ActivePage, param?: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onNavigate }) => {
  return (
    <div id="page-orders" className="bg-[#FAF6F0] min-h-screen">
      {/* Header bar */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          My Orders
        </div>
        <div className="w-[34px] md:w-10 h-[34px] md:h-10" /> {/* Spacer */}
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[820px] mx-auto pt-4 pb-[80px]">
        {orders.length === 0 ? (
          /* Empty placeholder orders state */
          <div className="text-center py-16 px-6 max-w-sm mx-auto">
            <div className="mb-4 flex justify-center text-maroon opacity-35">
              <ShoppingBag className="w-14 h-14" strokeWidth={1.2} />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
              No orders found
            </h2>
            <p className="text-xs text-[#888888] leading-relaxed mb-6">
              You haven't placed any saree orders yet. Your purchases will appear here.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="empty-cart-btn bg-[#7B1C2E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#9B2840] cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          /* Active orders lists */
          <div className="flex flex-col gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-xl p-4.5 border border-[#E8E0D5] shadow-xs flex flex-col gap-3.5"
              >
                {/* Order Meta Header */}
                <div className="flex items-start justify-between border-b border-[#E8E0D5] pb-3 text-xs text-[#4A4A4A]">
                  <div>
                    <span className="block font-bold text-[#7B1C2E] text-[13px] mb-0.5">
                      Order #{ord.id}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-[#888888] mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 leading-none shrink-0 font-sans">
                    <CheckCircle2 className="w-3.5 h-3.5 font-bold" /> Placed
                  </span>
                </div>

                {/* Items in the order */}
                <div className="flex flex-col gap-2.5">
                  {ord.items.map((it, itemIdx) => (
                    <div key={itemIdx} className="flex gap-3">
                      <div className="w-10 h-13 rounded-md overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8E0D5]">
                        <SareeSwatch id={it.id} />
                      </div>
                      <div className="flex-1 flex flex-col justify-center text-xs">
                        <span className="font-serif font-bold text-gray-800 leading-tight">
                          {it.name}
                        </span>
                        <span className="text-[11px] text-[#888888] mt-1">
                          Colour: {it.colour} · Qty: {it.qty}
                        </span>
                      </div>
                      <div className="self-center font-bold text-xs text-right font-sans">
                        ₹{(it.price * it.qty).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total recap */}
                <div className="border-t border-[#E8E0D5] pt-3 flex justify-between items-center text-xs text-[#4A4A4A]">
                  <div>
                    <span className="block font-semibold">Delivery Address</span>
                    <span className="block text-[11px] text-[#888888] mt-0.5 line-clamp-1 max-w-[280px] md:max-w-md">
                      {ord.address}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="block text-[10px] text-gray-400">Total Charged</span>
                    <span className="block text-sm font-extrabold text-[#7B1C2E] font-sans">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
