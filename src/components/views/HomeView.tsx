import React from 'react';
import { Menu, Search, ShoppingBag, Eye, Play } from 'lucide-react';
import { products } from '../../data';
import { ActivePage, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import logoUrl from '@/assets/logo.jpg';

interface HomeViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  onOpenDrawer: () => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  cartCount: number;
  wishlist: number[];
  activeHomeCategory: string;
  onSetCategory: (category: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenDrawer,
  onToggleWishlist,
  onAddToCart,
  cartCount,
  wishlist,
  activeHomeCategory,
  onSetCategory
}) => {
  const getFilteredSarees = () => {
    if (activeHomeCategory === 'all') {
      return products;
    }
    return products.filter((p) => {
      if (activeHomeCategory === 'Banarasi') {
        return p.name.toLowerCase().includes('banarasi');
      }
      return p.fabric === activeHomeCategory || p.occasion === activeHomeCategory;
    });
  };

  const filtered = getFilteredSarees();
  const dealProducts = filtered.filter((p) => p.tags.includes('deals'));
  const bsProducts = filtered.filter((p) => p.tags.includes('best-seller'));
  const trendProducts = filtered.filter((p) => p.tags.includes('trending'));
  const reelProducts = filtered.filter((p) => p.isReel);

  const categories = [
    { id: 'all', label: 'All', icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] ${active ? 'stroke-white' : 'stroke-maroon'}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="4" cy="6" r="1" fill="currentColor" />
        <circle cx="4" cy="12" r="1" fill="currentColor" />
        <circle cx="4" cy="18" r="1" fill="currentColor" />
      </svg>
    )},
    { id: 'Silk', label: 'Silk', icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] ${active ? 'stroke-white' : 'stroke-maroon'}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M12 2C6 2 3 7 3 12s3 10 9 10 9-5 9-10S18 2 12 2z" />
        <path d="M12 2c2 4 2 16 0 20M2 12c4 2 16 2 20 0" />
      </svg>
    )},
    { id: 'Cotton', label: 'Cotton', icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] ${active ? 'stroke-white' : 'stroke-maroon'}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M12 2a5 5 0 00-5 5c0 2.5 1.5 4.5 3 5.5V20h4v-7.5c1.5-1 3-3 3-5.5a5 5 0 00-5-5z" />
        <path d="M9 20h6" />
      </svg>
    )},
    { id: 'Banarasi', label: 'Banarasi', icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] ${active ? 'stroke-white' : 'stroke-[#C9A84C]'}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M12 3l2 5h5l-4 3 1.5 5L12 13l-4.5 3L9 11 5 8h5z" />
      </svg>
    )},
    { id: 'Wedding', label: 'Wedding', icon: (active: boolean) => (
      <svg className={`w-[22px] h-[22px] ${active ? 'stroke-white' : 'stroke-maroon'}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402C1 3.147 4.198 1 7.5 1c2.15 0 4.15 1.1 5.5 2.8C14.35 2.1 16.35 1 18.5 1 21.8 1 25 3.147 25 7.191" />
        <path d="M12 21.593l-1-1" />
      </svg>
    )}
  ];

  const handleViewAllRoute = (sectionKey: string) => {
    // Determine target based on home active selection
    // Map section trigger to viewall type parameters
    const sectionTypes: Record<string, string> = {
      'deals': 'deals',
      'new-launches': 'all',
      'best-sellers': 'best-sellers',
      'trending': 'trending',
      'reels': 'reels'
    };
    onNavigate('viewall', sectionTypes[sectionKey] || 'all');
  };

  const renderProductScrollCard = (p: Product, showTrendingBadge: boolean = false) => {
    const favorited = wishlist.includes(p.id);

    return (
      <div
        key={p.id}
        onClick={() => onNavigate('product', String(p.id))}
        className="product-card shrink-0 w-[148px] md:w-[188px] lg:w-[210px] bg-white rounded-xl overflow-hidden shadow-xs border border-[#E8E0D5] cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
      >
        <div className="product-card-img relative h-[180px] md:h-[228px] lg:h-[254px] bg-[#F0E8DC]">
          <SareeSwatch id={p.id} />
          {showTrendingBadge && (
            <div className="absolute top-2 left-2 bg-[#E8871E] text-white text-[9px] font-bold px-2 py-0.75 rounded-full tracking-wider uppercase">
              TRENDING
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p.id);
            }}
            className="wishlist-btn absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 rounded-full flex items-center justify-center text-sm z-10 active:scale-120 transition-transform cursor-pointer"
          >
            {favorited ? '♥' : '♡'}
          </button>
        </div>
        <div className="product-card-info p-2.5 md:p-3.5">
          <div className="product-name font-serif text-[15px] lg:text-[16px] font-bold text-[#1A1A1A] leading-tight mb-1 line-clamp-2 min-h-[38px]">
            {p.name}
          </div>
          <div className="product-fabric text-[10px] md:text-xs font-semibold text-[#888888] mb-1.5 line-clamp-1">
            {p.fabric} · {p.occasion}
          </div>
          <div className="product-price text-[15px] lg:text-[16px] font-extrabold text-[#7B1C2E] mb-2 font-sans">
            ₹{p.price.toLocaleString('en-IN')}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(p.id);
            }}
            className="card-buy-btn w-full bg-[#7B1C2E] text-white text-[11px] lg:text-xs font-semibold py-1.5 md:py-2 rounded-lg tracking-wider hover:bg-[#9B2840] transition-colors cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="page-home">
      {/* Top Header Navigation */}
      <div className="top-nav fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-full h-[56px] md:h-[60px] lg:h-[68px] bg-white border-b border-[#E8E0D5] flex items-center justify-between px-3.5 md:px-7 lg:px-12 z-20 shadow-sm gap-1 md:gap-4">
        <button
          onClick={onOpenDrawer}
          className="nav-btn w-[34px] h-[34px] md:w-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5 md:w-6 lg:w-6 text-[#1A1A1A]" />
        </button>

        <div className="nav-brand font-serif text-[19px] md:text-[22px] lg:text-[26.4px] font-bold text-[#7B1C2E] tracking-wider text-center flex-1 truncate flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border border-[#C9A84C] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Snehsarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span>Snehsarees</span>
        </div>

        <div className="nav-actions flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onNavigate('search')}
            className="nav-btn w-[34px] h-[34px] md:w-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 md:w-6 lg:w-6 text-[#1A1A1A]" />
          </button>

          <button
            onClick={() => onNavigate('cart')}
            className="nav-btn w-[34px] h-[34px] md:w-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors relative cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 md:w-6 lg:w-6 text-[#1A1A1A]" />
            {cartCount > 0 && (
              <span className="cart-badge absolute -top-0.5 -right-0.5 bg-[#7B1C2E] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="text-[10px] md:text-xs font-bold text-[#7B1C2E] border border-[#7B1C2E] rounded-full px-2 py-1 leading-none hover:bg-[#7B1C2E] hover:text-white transition-all shrink-0 cursor-pointer"
          >
            ← Snehsarees
          </button>
        </div>
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-[64px] md:pt-[70px] lg:pt-[80px] pb-[80px] md:pb-[96px]">
        {/* Clickable Search Placeholder */}
        <div className="search-bar-wrap py-2.5 md:py-3 cursor-pointer">
          <div
            onClick={() => onNavigate('search')}
            className="search-bar w-full bg-[#F0E8DC] border border-[#E8E0D5] rounded-full p-2.5 px-4 flex items-center gap-2.5 focus-within:border-[#7B1C2E] transition-colors md:p-3"
          >
            <Search className="w-[18px] h-[18px] text-[#888888] shrink-0" />
            <input
              type="text"
              placeholder="Search for sarees, fabrics, occasions..."
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A1A] cursor-pointer placeholder-[#888888]"
            />
          </div>
        </div>

        {/* Horizontal Category Tab strip */}
        <div className="category-strip flex flex-wrap gap-2 md:gap-3 justify-center py-2 pb-3.5">
          {categories.map((c) => {
            const active = activeHomeCategory === c.id;
            return (
              <div
                key={c.id}
                onClick={() => onSetCategory(c.id)}
                className="cat-item flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div
                  className={`cat-icon w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center shadow-sm border border-[#E8E0D5] transition-all ${
                    active
                      ? 'bg-[#7B1C2E] border-[#7B1C2E] scale-95'
                      : 'bg-white hover:bg-[#FAF6F0] active:scale-95'
                  }`}
                >
                  {c.icon(active)}
                </div>
                <div
                  className={`cat-label text-[10px] md:text-[11px] font-semibold text-center leading-tight transition-colors ${
                    active ? 'text-[#7B1C2E] font-bold' : 'text-[#4A4A4A] group-hover:text-[#7B1C2E]'
                  }`}
                >
                  {c.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Promo discount Banner */}
        <div className="offers-banner bg-gradient-to-br from-[#7B1C2E] via-[#A0243A] to-[#7B1C2E] rounded-[20px] p-5 md:p-6 lg:p-7 min-h-[110px] md:min-h-[120px] lg:min-h-[148px] flex justify-between items-center relative overflow-hidden my-1 shadow-sm">
          <div className="banner-text z-10 flex flex-col items-start">
            <span className="banner-tag text-[9px] md:text-[10px] font-bold text-[#E8D08A] tracking-[0.15em] uppercase mb-1.5">
              Special Offers
            </span>
            <span className="banner-title font-serif text-[20px] md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-2.5">
              New Festive Collection Arrived
            </span>
            <button
              onClick={() => handleViewAllRoute('deals')}
              className="banner-btn bg-[#C9A84C] text-[#5A1020] text-[11px] md:text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:brightness-110 shadow-xs"
            >
              Explore Now
            </button>
          </div>
          <div className="banner-emoji font-sans select-none z-10 scale-100 md:scale-110 lg:scale-[1.25]">
            <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
              <path
                d="M20 8c-4 0-8 3-8 8s4 8 8 8h24c4 0 8 3 8 8s-4 8-8 8H12c-4 0-8 3-8 8s4 8 8 8"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="20" cy="16" r="4" fill="#C9A84C" opacity="0.8" />
              <circle cx="44" cy="32" r="4" fill="#C9A84C" opacity="0.8" />
              <circle cx="20" cy="48" r="4" fill="#C9A84C" opacity="0.8" />
            </svg>
          </div>
        </div>

        {/* Section: Deals */}
        <div className="section-header flex justify-between items-center py-4 px-0">
          <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A]">
            Deals
          </div>
          <button
            onClick={() => handleViewAllRoute('deals')}
            className="view-all-btn text-[#7B1C2E] text-xs font-semibold py-1 cursor-pointer hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="h-scroll flex gap-3 md:gap-3.5 overflow-x-auto pb-3.5 no-scroll">
          {dealProducts.length > 0 ? (
            dealProducts.slice(0, 4).map((p) => renderProductScrollCard(p))
          ) : (
            <p className="text-xs text-[#888888] italic py-4">No deals found for this category</p>
          )}
        </div>

        <div className="saree-divider my-2.5" />

        {/* Section: New Launches */}
        <div className="section-header flex justify-between items-center py-4 px-0">
          <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A]">
            New Launches
          </div>
          <button
            onClick={() => handleViewAllRoute('new-launches')}
            className="view-all-btn text-[#7B1C2E] text-xs font-semibold py-1 cursor-pointer hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="h-scroll flex gap-3 md:gap-3.5 overflow-x-auto pb-3.5 no-scroll">
          {filtered.slice(0, 4).map((p) => renderProductScrollCard(p))}
        </div>

        <div className="saree-divider my-2.5" />

        {/* Section: Best Sellers */}
        <div className="section-header flex justify-between items-center py-4 px-0">
          <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A]">
            Best Sellers
          </div>
          <button
            onClick={() => handleViewAllRoute('best-sellers')}
            className="view-all-btn text-[#7B1C2E] text-xs font-semibold py-1 cursor-pointer hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="h-scroll flex gap-3 md:gap-3.5 overflow-x-auto pb-3.5 no-scroll">
          {bsProducts.length > 0 ? (
            bsProducts.slice(0, 4).map((p) => renderProductScrollCard(p))
          ) : (
            <p className="text-xs text-[#888888] italic py-4 font-serif">Out of stock for this category</p>
          )}
        </div>

        <div className="saree-divider my-2.5" />

        {/* Section: Trending */}
        <div className="section-header flex justify-between items-center py-4 px-0">
          <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A]">
            Trending
          </div>
          <button
            onClick={() => handleViewAllRoute('trending')}
            className="view-all-btn text-[#7B1C2E] text-xs font-semibold py-1 cursor-pointer hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="h-scroll flex gap-3 md:gap-3.5 overflow-x-auto pb-3.5 no-scroll">
          {trendProducts.length > 0 ? (
            trendProducts.slice(0, 4).map((p) => renderProductScrollCard(p, true))
          ) : (
            <p className="text-xs text-[#888888] italic py-4 font-serif">No trending sarees in this category</p>
          )}
        </div>

        <div className="saree-divider my-2.5" />

        {/* Section: Trending Reels */}
        <div className="section-header flex justify-between items-center py-4 px-0">
          <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A]">
            Trending Reels
          </div>
          <button
            onClick={() => handleViewAllRoute('reels')}
            className="view-all-btn text-[#7B1C2E] text-xs font-semibold py-1 cursor-pointer hover:underline"
          >
            View All →
          </button>
        </div>
        <div className="h-scroll flex gap-3 md:gap-3.5 overflow-x-auto pb-3.5 no-scroll">
          {reelProducts.length > 0 ? (
            reelProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('product', String(p.id))}
                className="reel-card shrink-0 w-[130px] h-[220px] md:w-[148px] md:h-[250px] lg:w-[162px] lg:h-[275px] rounded-xl overflow-hidden relative shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
              >
                <div className="reel-card-img w-full h-full bg-[#922B21]">
                  <SareeSwatch id={p.id + 3} />
                </div>
                <div className="reel-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="reel-views absolute top-2 left-2 bg-black/40 text-white text-[10px] font-medium px-2 py-0.75 rounded-full flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> {p.views}
                </div>
                <div className="reel-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white/25 backdrop-blur-xs rounded-full flex items-center justify-center">
                  <Play className="w-4 h-4 fill-white text-white shrink-0" />
                </div>
                <div className="reel-info absolute bottom-0 left-0 right-0 p-2.5 flex flex-col">
                  <div className="reel-name font-serif text-xs font-semibold text-white leading-snug mb-1 line-clamp-2 min-h-[30px]">
                    {p.name}
                  </div>
                  <div className="reel-price text-xs font-bold text-[#E8D08A] mb-1.5">
                    ₹{p.price.toLocaleString('en-IN')}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(p.id);
                    }}
                    className="reel-buy text-[10px] font-semibold text-white border border-white/60 py-1 px-2 mb-1.5 rounded-full inline-block text-center hover:bg-white hover:text-black hover:border-white transition-all cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#888888] italic py-4">No reels found for this category</p>
          )}
        </div>
      </div>
    </div>
  );
};
