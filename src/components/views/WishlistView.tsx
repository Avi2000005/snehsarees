import React from 'react';
import { ArrowLeft, Heart, ShoppingBag, Home } from 'lucide-react';
import { ActivePage, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { ProductCard } from '../ProductCard';

interface WishlistViewProps {
  wishlist: number[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  onBuyNow: (id: number, colour?: string, directProduct?: Product) => void;
  productsList: Product[];
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onNavigate,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  productsList
}) => {
  const wishlistItems = productsList.filter((p) => wishlist.includes(p.id));

  const renderGridCard = (p: Product) => {
    return (
      <ProductCard
        key={p.id}
        product={p}
        isWishlisted={true}
        onNavigate={onNavigate}
        onAddToCart={(id) => onAddToCart(id)}
        onToggleWishlist={onToggleWishlist}
      />
    );
  };

  return (
    <div id="page-wishlist">
      {/* Header bar */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          My Wishlist
        </div>
        <button
          className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
          title="Return to Home Section"
        >
          <Home className="w-[22px] h-[22px]" />
        </button>
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-4 pb-32">
        {wishlistItems.length === 0 ? (
          /* Wishlist Empty placeholder state */
          <div className="wishlist-empty text-center py-16 px-6 max-w-sm mx-auto">
            <div className="wishlist-empty-icon mb-4 flex justify-center text-primrose opacity-30">
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
              className="empty-cart-btn bg-[#C4601A] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#FFF0E8]"
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

