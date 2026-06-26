import React from 'react';
import { ArrowLeft, Heart, ShoppingBag } from 'lucide-react';
import { products } from '../../data';
import { ActivePage, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface WishlistViewProps {
  wishlist: number[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onNavigate,
  onToggleWishlist,
  onAddToCart
}) => {
  const wishlistItems = products.filter((p) => wishlist.includes(p.id));

  const renderGridCard = (p: Product) => {
    const isTrending = p.tags && p.tags.includes('trending');

    return (
      <div
        key={p.id}
        onClick={() => onNavigate('product', String(p.id))}
        className="grid-product-card bg-white rounded-xl overflow-hidden shadow-xs border border-[#E8E0D5] cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
      >
        <div className="grid-card-img relative h-[190px] md:h-[228px] lg:h-[250px] bg-[#F0E8DC]">
          <SareeSwatch id={p.id} />
          {isTrending && (
            <div className="trending-badge absolute top-2 left-2 bg-[#E8871E] text-white text-[9px] font-bold px-2 py-0.75 rounded-full tracking-wider uppercase">
              TRENDING
            </div>
          )}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p.id);
            }}
            className="grid-wishlist absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 rounded-full flex items-center justify-center text-sm z-10 active:scale-120 transition-transform cursor-pointer"
          >
            ♥
          </div>
        </div>
        <div className="grid-card-info p-2.5 md:p-3.5">
          <div className="grid-product-name font-serif text-sm md:text-base font-semibold text-[#1A1A1A] leading-tight mb-1 line-clamp-2 min-h-[38px]">
            {p.name}
          </div>
          <span className="grid-fabric-tag inline-block text-[10px] font-semibold text-[#888888] bg-[#F0E8DC] px-2 py-0.5 rounded-md mb-2">
            {p.fabric}
          </span>
          <div className="grid-rating text-[11px] text-[#C9A84C] mb-1">
            ★★★★★ <span className="text-[#888888] ml-1">({p.reviews})</span>
          </div>
          <div className="grid-price text-base font-bold text-[#7B1C2E] mb-2.5 font-sans">
            ₹{p.price.toLocaleString('en-IN')}
          </div>
          <div className="grid-card-btns flex flex-col gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(p.id);
              }}
              className="grid-cart-btn w-full border border-[#7B1C2E] text-[#7B1C2E] text-[11px] font-semibold py-1.5 rounded-lg active:scale-98 transition-transform cursor-pointer"
            >
              Add to Cart
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(p.id);
                onNavigate('checkout');
              }}
              className="grid-buy-btn w-full bg-[#7B1C2E] text-white text-[11px] font-semibold py-1.5 rounded-lg hover:bg-[#9B2840] active:scale-98 transition-transform cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="page-wishlist">
      {/* Header bar */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          My Wishlist
        </div>
        <div className="w-[34px] md:w-10 h-[34px] md:h-10" /> {/* Spacer */}
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-4 pb-[80px]">
        {wishlistItems.length === 0 ? (
          /* Wishlist Empty placeholder state */
          <div className="wishlist-empty text-center py-16 px-6 max-w-sm mx-auto">
            <div className="wishlist-empty-icon mb-4 flex justify-center text-maroon opacity-30">
              <Heart className="w-14 h-14" strokeWidth={1.2} />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
              Your wishlist is empty
            </h2>
            <p className="text-xs text-[#888888] leading-relaxed mb-6">
              Tap the heart icon on any saree to save it here and view it later.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="empty-cart-btn bg-[#7B1C2E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#9B2840]"
            >
              Explore Sarees
            </button>
          </div>
        ) : (
          /* Saved sarees feed */
          <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4.5 pt-2">
            {wishlistItems.map((p) => renderGridCard(p))}
          </div>
        )}
      </div>
    </div>
  );
};