import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Heart } from 'lucide-react';
import { products, SAREE_COLORS } from '../../data';
import { ActivePage } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface ProductDetailViewProps {
  productId: number;
  onNavigate: (page: ActivePage, param?: string) => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  wishlist: number[];
  cartCount: number;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigate,
  onToggleWishlist,
  onAddToCart,
  wishlist,
  cartCount
}) => {
  const p = products.find((x) => x.id === productId);
  const [selectedColour, setSelectedColour] = useState(p?.colour || 'Red');
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!p) {
    return (
      <div className="p-10 text-center font-serif">
        <h3 className="text-lg">Saree collection not found</h3>
        <button onClick={() => onNavigate('home')} className="mt-4 text-[#7B1C2E] underline">
          Go back Home
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(p.id);

  const colorsList = SAREE_COLORS.slice(0, 5);

  const simulatedReviews = [
    { name: 'Priya S.', stars: 5, text: 'Absolutely beautiful! The fabric quality is amazing.' },
    { name: 'Meena K.', stars: 5, text: 'Fast delivery, exactly as shown. Perfect for the occasion.' },
    { name: 'Ritu D.', stars: 4, text: 'Good quality saree, blouse piece is well made too.' }
  ];

  const handleAddToCart = () => {
    onAddToCart(p.id, selectedColour);
  };

  const handleBuyNow = () => {
    onAddToCart(p.id, selectedColour);
    onNavigate('checkout');
  };

  return (
    <div id="page-product" className="bg-[#FAF6F0] min-h-screen pb-[100px]">
      {/* Top Bar Navigation */}
      <div className="pd-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between px-4 md:px-7 lg:px-12 z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="pd-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="pd-nav-title font-serif text-base md:text-lg font-bold text-[#1A1A1A]">
          Product Details
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="pd-wishlist text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full cursor-pointer"
            onClick={() => onToggleWishlist(p.id)}
          >
            <Heart
              className={`w-[22px] h-[22px] ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]'}`}
            />
          </button>
          <button
            className="pd-cart-btn text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full relative cursor-pointer ml-1"
            onClick={() => onNavigate('cart')}
          >
            <ShoppingBag className="w-5.5 h-5.5" />
            {cartCount > 0 && (
              <span className="cart-badge absolute -top-0.5 -right-0.5 bg-[#7B1C2E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main product slider */}
      <div className="max-w-[800px] mx-auto bg-white shadow-xs rounded-b-2xl overflow-hidden pb-4">
        <div className="pd-image-slider relative w-full h-[340px] md:h-[420px] lg:h-[480px] bg-[#F0E8DC]">
          <SareeSwatch id={p.id} />
          {/* Custom pagination slider dots */}
          <div className="pd-dots absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {[0, 1, 2].map((sIndex) => (
              <button
                key={sIndex}
                onClick={() => setCurrentSlide(sIndex)}
                className={`pd-dot h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === sIndex ? 'bg-white w-4.5' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Info panel */}
        <div className="pd-body p-5 md:p-9 pt-6">
          <h1 className="pd-name font-serif text-2xl md:text-3xl lg:text-[34px] font-bold text-[#1A1A1A] leading-tight mb-2 tracking-tight">
            {p.name}
          </h1>
          <div className="pd-price text-2xl md:text-[28px] font-extrabold text-[#7B1C2E] mb-3.5 tracking-tight font-sans">
            ₹{p.price.toLocaleString('en-IN')}
          </div>
          <div className="pd-tags flex flex-wrap gap-2 mb-4">
            <span className="pd-tag text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#7B1C2E]/8 text-[#7B1C2E]">
              {p.fabric}
            </span>
            <span className="pd-tag text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#7B1C2E]/8 text-[#7B1C2E]">
              {p.occasion}
            </span>
            <span className="pd-tag text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#7B1C2E]/8 text-[#7B1C2E]">
              ★ {p.rating} Stars ({p.reviews} reviews)
            </span>
          </div>

          {/* Color Selection Circular Swatches */}
          <div className="pd-section-label text-xs font-bold text-[#555555] uppercase tracking-wider mb-2.5">
            Select Colour
          </div>
          <div className="colour-swatches flex gap-3 mb-5 flex-wrap">
            {colorsList.map((c, i) => {
              const active = selectedColour === c.name;
              return (
                <button
                  key={i}
                  className={`colour-swatch w-8 h-8 rounded-full border-2.5 transition-transform relative cursor-pointer active:scale-95 ${
                    active ? 'border-[#7B1C2E] scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setSelectedColour(c.name)}
                  title={c.name}
                >
                  {/* Small check icon */}
                  {active && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-[11px] font-bold">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Blouse alert bubble */}
          {p.blouse ? (
            <div className="pd-blouse-info bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold mb-5 flex items-center gap-1.5">
              <span>✓</span> Blouse Piece Included
            </div>
          ) : (
            <div className="pd-blouse-info bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold mb-5 flex items-center gap-1.5">
              <span>ℹ</span> Blouse Piece Not Included
            </div>
          )}

          {/* Description */}
          <div className="pd-section-label text-xs font-bold text-[#555555] uppercase tracking-wider mb-2">
            Description
          </div>
          <p className="pd-description text-[#4A4A4A] text-sm md:text-base leading-relaxed mb-6 font-serif">
            {p.desc}
          </p>
        </div>

        {/* Customer review feed */}
        <div className="pd-reviews-section px-5 md:px-9 pb-6">
          <h3 className="pd-reviews-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A] mb-4.5">
            Customer Reviews ({p.reviews})
          </h3>
          <div className="flex flex-col gap-3">
            {simulatedReviews.map((r, i) => (
              <div key={i} className="pd-review-card bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-3.5 shadow-5xs">
                <div className="pd-review-header flex items-center gap-2.5 mb-2">
                  <div className="pd-review-avatar w-8 h-8 rounded-full bg-[#7B1C2E] flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                    {r.name[0]}
                  </div>
                  <div>
                    <h5 className="pd-reviewer-name text-[13px] font-semibold text-[#1A1A1A] leading-tight">
                      {r.name}
                    </h5>
                    <div className="pd-review-stars text-[#C9A84C] text-[10px]">
                      {'★'.repeat(r.stars)}
                    </div>
                  </div>
                </div>
                <p className="pd-review-text text-xs text-[#4A4A4A] leading-relaxed">
                  {r.text}
                </p>
              </div>
            ))}
          </div>

          <button className="w-full border border-[#E8E0D5] py-2.5 mt-4 rounded-lg text-xs font-bold text-[#4A4A4A] hover:bg-[#FAF6F0] transition-colors cursor-pointer">
            View All Reviews
          </button>
        </div>
      </div>

      {/* STICKY BOTTOM ACTION TOOLBAR */}
      <div className="pd-sticky-bar fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-full bg-white border-t border-[#E8E0D5] p-2.5 px-3 md:px-9 flex gap-2 items-center z-[13] shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <button
          className="pd-add-cart flex-1 border-2 border-[#7B1C2E] text-[#7B1C2E] text-xs md:text-sm font-bold py-3.5 rounded-xl hover:bg-[#7B1C2E]/4 active:scale-98 transition-all cursor-pointer"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
        <button
          className="pd-buy-now flex-1 bg-[#7B1C2E] text-white text-xs md:text-sm font-bold py-3.5 rounded-xl hover:bg-[#9B2840] active:scale-98 transition-all cursor-pointer"
          onClick={handleBuyNow}
        >
          Buy Now
        </button>
        <button
          className={`pd-wishlist-sticky w-12 h-12 shrink-0 border border-[#E8E0D5] rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
            isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'bg-white text-gray-400'
          }`}
          onClick={() => onToggleWishlist(p.id)}
        >
          <Heart className={`w-5.5 h-5.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>
      </div>
    </div>
  );
};
