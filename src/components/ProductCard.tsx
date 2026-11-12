import React from 'react';
import { Product, ActivePage } from '../types';
import { SareeSwatch } from './SareeSwatch';

export interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onNavigate: (page: ActivePage, param?: string) => void;
  onAddToCart: (id: number) => void;
  onToggleWishlist: (id: number) => void;
  showTrendingBadge?: boolean;
  className?: string;
  imageHeightClass?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product: p,
  isWishlisted,
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  showTrendingBadge = false,
  className = '',
  imageHeightClass = 'h-[220px] sm:h-[260px] md:h-[300px] lg:h-[330px]'
}) => {
  const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  const isOutOfStock = p.stock === 0;
  const isLowStock = effectivePrice >= 2000 && p.stock !== undefined && p.stock > 0 && p.stock <= 3;
  const isTrending = showTrendingBadge || (p.tags && p.tags.includes('trending'));

  return (
    <div
      onClick={() => !isOutOfStock && onNavigate('product', String(p.id))}
      className={`product-card w-full bg-white rounded-2xl overflow-hidden shadow-xs border border-[#E8E0D5] relative transition-all duration-200 ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg hover:-translate-y-1'
      } ${className}`}
    >
      <div className={`product-card-img relative w-full ${imageHeightClass} bg-[#F0E8DC]`}>
        <SareeSwatch
          id={p.id}
          imageUrl={p.image}
          altText={`${p.name} - Best Kota Doria Handloom Saree with Zari Border`}
        />
        {isTrending && (
          <div className="absolute top-2.5 left-2.5 bg-[#E8871E] text-white text-[9px] font-bold px-2 py-0.75 rounded-full tracking-wider uppercase shadow-xs">
            TRENDING
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="bg-red-700 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              OUT OF STOCK
            </span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute bottom-2.5 left-2.5 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-md animate-pulse z-10">
            Only {p.stock} Left!
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(p.id);
          }}
          className="wishlist-btn absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-xs rounded-full flex items-center justify-center text-sm z-10 active:scale-120 transition-transform cursor-pointer shadow-xs"
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isWishlisted ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-card-info p-3 sm:p-4">
        <div className="product-name font-sans text-[14px] sm:text-[15px] lg:text-[16px] font-bold text-[#111111] leading-snug mb-1 line-clamp-2 min-h-[40px]">
          {p.name}
        </div>
        <div className="product-fabric text-[11px] sm:text-xs font-semibold text-[#555555] mb-2 line-clamp-1">
          {p.fabric ? `${p.fabric} · ` : '· '}{p.occasion || 'Everyday'}
        </div>
        <div className="product-price flex items-center gap-2 mb-3 font-sans flex-wrap">
          {p.discountPrice && p.discountPrice > 0 ? (
            <>
              <span className="text-[15px] sm:text-[16px] lg:text-[17px] font-extrabold text-[#C4601A]">
                ₹{p.discountPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-500 font-medium line-through">
                ₹{p.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF
              </span>
            </>
          ) : (
            <span className="text-[15px] sm:text-[16px] lg:text-[17px] font-extrabold text-[#C4601A]">
              ₹{p.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <button
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(p.id);
          }}
          className={`card-buy-btn w-full text-white text-[11px] sm:text-xs font-bold py-2 sm:py-2.5 rounded-xl tracking-wider transition-colors cursor-pointer shadow-xs ${
            isOutOfStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#C4601A] hover:bg-[#a84e15]'
          }`}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
