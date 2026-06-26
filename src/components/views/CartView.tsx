import React from 'react';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem, ActivePage } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface CartViewProps {
  cart: CartItem[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onChangeQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onNavigate,
  onChangeQty,
  onRemoveItem
}) => {
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  };

  const totalCost = getCartTotal();
  const itemCount = getCartCount();

  return (
    <div id="page-cart" className="bg-[#FAF6F0] min-h-screen">
      {/* Header navigations */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          {itemCount > 0 ? `My Cart (${itemCount})` : 'My Cart'}
        </div>
        <div className="w-[34px] md:w-10 h-[34px] md:h-10" /> {/* Balance empty spacer */}
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-4 pb-[80px]">
        {cart.length === 0 ? (
          /* State A: EMPTY CART SCREEN */
          <div className="empty-cart text-center py-16 px-6 max-w-sm mx-auto">
            <div className="empty-cart-icon mb-4 flex justify-center text-maroon opacity-35">
              <ShoppingBag className="w-14 h-14" strokeWidth={1.2} />
            </div>
            <h2 className="empty-cart-title font-serif text-2xl font-semibold mb-2">
              Your cart is empty
            </h2>
            <p className="empty-cart-text text-xs text-[#888888] leading-relaxed mb-6">
              Discover our beautiful collection of handcrafted sarees and start picking your favorites.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="empty-cart-btn bg-[#7B1C2E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#9B2840] active:scale-95 transition-all cursor-pointer inline-block"
            >
              Browse Sarees
            </button>
          </div>
        ) : (
          /* State B: FULL CART ENTRIES */
          <div className="max-w-[700px] mx-auto flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              {cart.map((item, i) => (
                <div
                  key={`${item.id}-${item.colour}`}
                  className="cart-item bg-white rounded-xl p-3.5 flex gap-3.5 border border-[#E8E0D5] shadow-xs"
                >
                  <div className="cart-item-img w-20 h-25 md:w-24 md:h-29 rounded-lg overflow-hidden shrink-0 bg-[#F0E8DC]">
                    <SareeSwatch id={item.id} />
                  </div>
                  <div className="cart-item-info flex-1 flex flex-col">
                    <h4 className="cart-item-name font-serif text-[15px] font-semibold text-[#1A1A1A] leading-snug mb-1">
                      {item.name}
                    </h4>
                    <span className="cart-item-colour text-xs text-[#888888] mb-2.5">
                      Colour: {item.colour}
                    </span>
                    <div className="cart-item-price text-[#7B1C2E] font-bold text-base mb-3 font-sans">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </div>
                    {/* Quantity controls dashboard */}
                    <div className="cart-qty-row flex items-center justify-between mt-auto">
                      <div className="qty-controls flex items-center bg-[#FAF6F0] rounded-lg border border-[#E8E0D5] p-0.5 select-none text-[#7B1C2E]">
                        <button
                          onClick={() => onChangeQty(i, -1)}
                          className="qty-btn w-7.5 h-7.5 flex items-center justify-center font-bold text-base hover:bg-neutral-200/50 rounded-md transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="qty-num w-8 text-center text-xs font-bold text-[#1A1A1A]">
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
                <span className="summary-value text-[#2E7D32] font-semibold">FREE ✓</span>
              </div>
              <hr className="summary-divider border-0 border-t border-[#E8E0D5] my-4" />
              <div className="summary-row flex justify-between items-center">
                <span className="summary-label text-base font-bold text-[#1A1A1A]">Total</span>
                <span className="summary-value text-lg font-extrabold text-[#7B1C2E]">
                  ₹{totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('checkout')}
              className="checkout-btn bg-[#7B1C2E] text-white text-sm font-bold tracking-wide py-4.5 rounded-xl hover:bg-[#9B2840] active:scale-99 transition-all cursor-pointer shadow-md text-center mt-2"
            >
              Proceed to Checkout →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
