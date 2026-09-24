import React from 'react';
import { ArrowLeft, Trash2, ShoppingBag, Home } from 'lucide-react';
import { CartItem, ActivePage } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface CartViewProps {
  cart: CartItem[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  onChangeQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  user?: { id: number; name: string } | null;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onNavigate,
  onBack,
  onChangeQty,
  onRemoveItem,
  user,
}) => {
  const handleCheckoutClick = () => {
    // Guests are allowed to checkout without logging in
    onNavigate('checkout');
  };
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  };

  const totalCost = getCartTotal();
  const itemCount = getCartCount();
  const deliveryFee: number = 0; // Free delivery for now
  const grandTotal = totalCost + deliveryFee;

  return (
    <div id="page-cart" className="min-h-screen bg-transparent">
      {/* Header navigations */}
      <div className="va-top-bar sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          {itemCount > 0 ? `My Cart (${itemCount})` : 'My Cart'}
        </div>
        <button
          className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
          title="Return to Home Section"
        >
          <Home className="w-[22px] h-[22px]" />
        </button>
      </div>

      <div className="max-w-[620px] mx-auto p-4 pt-2 pb-32">
        {cart.length === 0 ? (
          /* Empty state */
          <div className="cart-empty flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center mb-4 text-[#C4601A]">
              <ShoppingBag className="w-10 h-10 stroke-1" />
            </div>
            <h3 className="empty-title font-serif text-xl font-bold text-[#1A1A1A] mb-2">
              Your Cart is Empty
            </h3>
            <p className="empty-desc text-xs text-[#888888] max-w-xs mb-6 leading-relaxed">
              Explore our Kota Doria saree collections and discover your favorite designs.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="empty-btn bg-[#C4601A] text-white text-xs font-bold px-7 py-3.5 rounded-xl hover:bg-[#a84e15] transition-colors cursor-pointer shadow-md"
            >
              Explore Collection →
            </button>
          </div>
        ) : (
          /* Populated state */
          <div className="flex flex-col gap-4">
            <div className="cart-items-list flex flex-col gap-3">
              {cart.map((item, i) => (
                <div
                  key={`${item.id}-${item.colour}`}
                  className="cart-item bg-white rounded-xl p-3.5 border border-[#E8E0D5] flex gap-3.5 items-center shadow-xs"
                >
                  <div className="cart-thumb w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[#E8E0D5] bg-[#FAF6F0]">
                    <SareeSwatch id={item.id} imageUrl={item.image} />
                  </div>
                  <div className="cart-info flex-1 min-w-0">
                    <h4 className="cart-name font-serif text-sm font-semibold text-[#1A1A1A] truncate mb-0.5">
                      {item.name}
                    </h4>
                    <p className="cart-meta text-[11px] text-[#888888] mb-2 flex items-center gap-1.5">
                      <span className="font-semibold text-[#C4601A]">{item.fabric}</span> • <span>{item.colour}</span>
                    </p>
                    <div className="cart-bottom flex justify-between items-center">
                      <span className="cart-price font-bold text-sm text-[#1A1A1A]">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                      <div className="cart-qty-ctrl flex items-center bg-[#FAF6F0] border border-[#E8E0D5] rounded-lg">
                        <button
                          onClick={() => onChangeQty(i, -1)}
                          className="qty-btn w-7.5 h-7.5 flex items-center justify-center font-bold text-base hover:bg-neutral-200/50 rounded-md transition-colors cursor-pointer"
                        >
                          -
                        </button>
                        <span className="qty-val px-2 text-xs font-bold text-[#1A1A1A]">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => onChangeQty(i, 1)}
                          className="qty-btn w-7.5 h-7.5 flex items-center justify-center font-bold text-base hover:bg-neutral-200/50 rounded-md transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => onRemoveItem(i)}
                        className="cart-delete text-[#DC3545] hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer block"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations summaries */}
            <div className="cart-summary bg-white rounded-xl p-5 border border-[#E8E0D5] shadow-xs mt-2">
              <h3 className="summary-title font-serif text-lg font-semibold mb-4 text-[#1A1A1A]">
                Order Summary
              </h3>
              <div className="summary-row flex justify-between mb-3 text-sm">
                <span className="summary-label text-[#888888]">Subtotal ({itemCount} items)</span>
                <span className="summary-value font-semibold text-[#1A1A1A]">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="summary-row flex justify-between mb-3 text-sm">
                <span className="summary-label text-[#888888]">Delivery Charges</span>
                {deliveryFee === 0 ? (
                  <span className="summary-value text-[#2E7D32] font-semibold">FREE ✓</span>
                ) : (
                  <span className="summary-value text-[#1A1A1A] font-semibold">₹{deliveryFee.toLocaleString('en-IN')}</span>
                )}
              </div>
              <div className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg mb-3 flex items-center justify-between">
                <span>🎉 Free delivery on all orders!</span>
              </div>
              <hr className="summary-divider border-0 border-t border-[#E8E0D5] my-4" />
              <div className="summary-row flex justify-between items-center">
                <span className="summary-label text-base font-bold text-[#1A1A1A]">Total</span>
                <span className="summary-value text-lg font-extrabold text-[#C4601A]">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="checkout-btn bg-[#C4601A] text-white text-sm font-bold tracking-wide py-4.5 rounded-xl hover:bg-[#a84e15] active:scale-99 transition-all cursor-pointer shadow-md text-center mt-2"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


