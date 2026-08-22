import React, { useState, useEffect } from 'react';
import { Menu, Search, ShoppingBag, Eye, Play, Sparkles, ChevronLeft, ChevronRight, Star, Film, MessageSquare, X, User, BookOpen, MapPin, Layers, ShieldCheck, Compass, Feather, Scroll, Sun, HeartHandshake, Shield, Truck, RotateCcw, Ban, HelpCircle, FileText } from 'lucide-react';
import { ActivePage, Product, Category, OfferBanner, Reel, Review, UserProfile } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { API_URL } from '../../config';
import logoUrl from '@/assets/logo.jpg';
import saree3dBg from '../saree_heritage_3d_bg.png';
import { PolicyModal, PolicyTab } from '../PolicyModal';

interface HomeViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  onOpenDrawer: () => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  cartCount: number;
  wishlist: number[];
  activeHomeCategory: string;
  onSetCategory: (category: string) => void;
  user: UserProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenDrawer,
  onToggleWishlist,
  onAddToCart,
  cartCount,
  wishlist,
  activeHomeCategory,
  onSetCategory,
  user
}) => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive UI state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab | null>(null);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/products`).then(res => res.json()),
      fetch(`${API_URL}/api/categories`).then(res => res.json()),
      fetch(`${API_URL}/api/banners`).then(res => res.json()),
      fetch(`${API_URL}/api/reels`).then(res => res.json()),
      fetch(`${API_URL}/api/reviews/recent`).then(res => res.json())
    ]).then(([prodData, catData, bannerData, reelData, reviewData]) => {
      setProductsList(prodData || []);
      setCategories(catData || []);
      setBanners(bannerData || []);
      setReels(reelData || []);
      setReviews(reviewData || []);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading dynamic Home data:', err);
      setLoading(false);
    });
  }, []);

  // Auto-advance banner carousel every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const getFilteredSarees = () => {
    if (activeHomeCategory === 'all') {
      return productsList;
    }
    const selectedCategoryObj = categories.find(c => c.slug === activeHomeCategory);
    return productsList.filter((p) => {
      if (selectedCategoryObj && p.categoryId === selectedCategoryObj.id) {
        return true;
      }
      return (p.fabric || '').toLowerCase() === activeHomeCategory.toLowerCase();
    });
  };

  const filtered = getFilteredSarees();
  const reelProducts = filtered.filter((p) => p.isReel);

  const getActiveHeritage = () => {
    const cat = categories.find((c) => c.slug === activeHomeCategory);
    if (!cat) return null;
    return {
      title: cat.name + " Saree Collection",
      origin: "Kota Doria Collection",
      craft: "Authentic Saree Weaves",
      details: cat.description || "Carefully curated saree fabrics chosen for their quality, lightweight feel, and elegant drape.",
      history: cat.history || "Timeless designs celebrating traditional Kota Doria art and elegance.",
      properties: cat.properties || "Lightweight textures, elegant borders, and comfortable all-day wear.",
      care: cat.care || "Dry clean or gentle hand wash recommended. Handle with care."
    };
  };

  const heritage = getActiveHeritage();

  const scrollToHeritage = () => {
    setTimeout(() => {
      const el = document.getElementById('category-heritage-section');
      if (el) {
        const yOffset = -150;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 50);
  };

  const handleViewAllRoute = (sectionKey?: string) => {
    onNavigate('viewall', sectionKey === 'reels' ? 'reels' : 'all');
  };

  const renderCategoryIcon = (slug: string, active: boolean, imageUrl?: string) => {
    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={slug}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      );
    }

    const strokeColor = active ? 'stroke-white' : 'stroke-[#C4601A]';
    return (
      <svg className={`w-[22px] h-[22px] ${strokeColor}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };

  const renderProductScrollCard = (p: Product, showTrendingBadge: boolean = false) => {
    const favorited = wishlist.includes(p.id);
    const isOutOfStock = p.stock === 0;
    const isLowStock = p.stock !== undefined && p.stock > 0 && p.stock <= 3;

    return (
      <div
        key={p.id}
        onClick={() => !isOutOfStock && onNavigate('product', String(p.id))}
        className={`product-card shrink-0 w-[148px] md:w-[188px] lg:w-[210px] bg-white rounded-xl overflow-hidden shadow-xs border border-[#E8E0D5] relative transition-all duration-200 ${isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:-translate-y-0.5'
          }`}
      >
        <div className="product-card-img relative h-[180px] md:h-[228px] lg:h-[254px] bg-[#F0E8DC]">
          <SareeSwatch id={p.id} imageUrl={p.image} />
          {showTrendingBadge && (
            <div className="absolute top-2 left-2 bg-[#E8871E] text-white text-[9px] font-bold px-2 py-0.75 rounded-full tracking-wider uppercase shadow-xs">
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
            <div className="absolute bottom-2 left-2 bg-red-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-md animate-pulse z-10">
              Only {p.stock} Left!
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p.id);
            }}
            className="wishlist-btn absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 rounded-full flex items-center justify-center text-sm z-10 active:scale-120 transition-transform cursor-pointer shadow-xs"
          >
            {favorited ? '♥' : '♡'}
          </button>
        </div>
        <div className="product-card-info p-2.5 md:p-3.5">
          <div className="product-name font-sans text-[14px] lg:text-[15px] font-bold text-[#111111] leading-tight mb-1 line-clamp-2 min-h-[38px]">
            {p.name}
          </div>
          <div className="product-fabric text-[10px] md:text-xs font-semibold text-[#222222] mb-1.5 line-clamp-1">
            {p.fabric} · {p.occasion}
          </div>
          <div className="product-price flex items-center gap-1.5 mb-2 font-sans flex-wrap">
            {p.discountPrice && p.discountPrice > 0 ? (
              <>
                <span className="text-[14px] lg:text-[15px] font-extrabold text-[#C4601A]">
                  ₹{p.discountPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-gray-600 font-medium line-through">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] font-bold text-emerald-700">
                  {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="text-[14px] lg:text-[15px] font-extrabold text-[#C4601A]">
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
            className={`card-buy-btn w-full text-white text-[10px] lg:text-xs font-bold py-1.5 md:py-2 rounded-lg tracking-wider transition-colors cursor-pointer shadow-2xs ${isOutOfStock ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#C4601A] hover:bg-[#FFF0E8]'
              }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
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

        <div className="nav-brand font-serif text-[19px] md:text-[22px] lg:text-[26.4px] font-bold text-[#C4601A] tracking-wider text-center flex-1 truncate flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border border-[#F5E4BC] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Sneh Sarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span><span className="text-[#C4601A]">Sneh</span> <span className="text-[#E8920E]">Sarees</span></span>
        </div>

        <div className="nav-actions flex items-center gap-1 shrink-0">
          <button
            onClick={() => onNavigate('search')}
            className="nav-btn w-[34px] h-[34px] md:w-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 md:w-6 lg:w-6 text-[#1A1A1A]" />
          </button>



          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="nav-btn w-[34px] h-[34px] md:w-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer"
              title="My Profile"
            >
              <User className="w-5 h-5 md:w-6 lg:w-6 text-[#1A1A1A]" />
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="text-[#C4601A] hover:bg-[#FFF0E8] text-xs font-bold px-3 py-1.5 rounded-full border border-[#C4601A]/20 transition-all cursor-pointer shrink-0 active:scale-95"
              title="Login / Register"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-[64px] md:pt-[70px] lg:pt-[80px] pb-[80px] md:pb-[96px]">
        {/* Clickable Search Placeholder */}
        <div className="search-bar-wrap py-2.5 md:py-3 cursor-pointer">
          <div
            onClick={() => onNavigate('search')}
            className="search-bar w-full bg-[#F0E8DC] border border-[#E8E0D5] rounded-full p-2.5 px-4 flex items-center gap-2.5 focus-within:border-[#C4601A] transition-colors md:p-3"
          >
            <Search className="w-[18px] h-[18px] text-[#888888] shrink-0" />
            <input
              type="text"
              placeholder="Search for sarees, fabrics, categories..."
              readOnly
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A1A] cursor-pointer placeholder-[#888888]"
            />
          </div>
        </div>

        {!user && (
          <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 md:p-5 border border-[#E8E0D5] flex items-center justify-between mb-4 shadow-3xs hover:shadow-2xs transition-shadow">
            <div className="text-left pr-4">
              <span className="text-[10px] font-bold text-[#C4601A] uppercase tracking-wider block mb-0.5">Welcome Shopper</span>
              <p className="text-[11px] md:text-xs text-[#6A6A6A] leading-relaxed max-w-[240px] sm:max-w-md font-medium">
                Sign in to save items to your wishlist, track recent orders, and access bulk deals.
              </p>
            </div>
            <button
              onClick={() => onNavigate('auth')}
              className="bg-[#C4601A] hover:bg-[#FFF0E8] text-white hover:text-[#C4601A] border border-transparent hover:border-[#C4601A]/30 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer shadow-xs active:scale-95 transition-all shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Horizontal Category Tab strip with dynamic listings */}
        {/* Outer: scroll container centered. Inner inline-flex: centered when fits, scrolls left when overflows */}
        <div
          className="category-strip-outer w-full overflow-x-auto py-2 pb-3.5 flex justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="category-strip-inner inline-flex gap-2 md:gap-3 items-center">

            <div
              onClick={() => onSetCategory('all')}
              className="cat-item flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div
                className={`cat-icon w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-sm border border-[#E8E0D5] transition-all ${activeHomeCategory === 'all'
                  ? 'bg-[#C4601A] border-[#C4601A] scale-95'
                  : 'bg-white hover:bg-[#FAF6F0] active:scale-95'
                  }`}
              >
                <svg className={`w-[30px] h-[30px] ${activeHomeCategory === 'all' ? 'stroke-white' : 'stroke-[#C4601A]'}`} viewBox="0 0 24 24" fill="none" strokeWidth="1.5">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div className={`cat-label text-[10px] md:text-xs font-semibold text-center leading-tight ${activeHomeCategory === 'all' ? 'text-[#C4601A] font-bold' : 'text-[#4A4A4A]'}`}>
                All
              </div>
            </div>

            {categories.map((c) => {
              const active = activeHomeCategory === c.slug;
              const hasImage = !!c.imageUrl;
              return (
                <div
                  key={c.id}
                  onClick={() => onSetCategory(c.slug)}
                  className="cat-item flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
                >
                  <div
                    className={`cat-icon w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center shadow-sm border transition-all overflow-hidden ${active
                      ? hasImage
                        ? 'border-[#C4601A] ring-2 ring-[#C4601A]/30 scale-95'
                        : 'bg-[#C4601A] border-[#C4601A] scale-95'
                      : hasImage
                        ? 'border-[#E8E0D5] hover:border-gray-400 active:scale-95'
                        : 'bg-white border-[#E8E0D5] hover:bg-[#FAF6F0] active:scale-95'
                      }`}
                  >
                    {renderCategoryIcon(c.slug, active, c.imageUrl)}
                  </div>
                  <div className={`cat-label text-[10px] md:text-xs font-semibold text-center leading-tight ${active ? 'text-[#C4601A] font-bold' : 'text-[#4A4A4A] group-hover:text-[#C4601A]'}`}>
                    {c.name}
                  </div>
                </div>
              );
            })}

          </div>
        </div>
        {/* Dynamic Offer Banners Carousel */}
        {banners.length > 0 ? (
          <div 
            onClick={() => {
              if (banners[currentBannerIndex].imageUrl) {
                handleViewAllRoute(banners[currentBannerIndex].ctaLink || 'deals');
              }
            }}
            className={`relative rounded-[20px] overflow-hidden my-1 shadow-sm transition-all duration-500 min-h-[130px] md:min-h-[165px] lg:min-h-[190px] ${
              banners[currentBannerIndex].imageUrl ? 'cursor-pointer hover:brightness-95' : ''
            }`}
            style={{
              background: banners[currentBannerIndex].imageUrl
                ? `url(${banners[currentBannerIndex].imageUrl}) center/cover no-repeat`
                : `linear-gradient(135deg, ${banners[currentBannerIndex].bgFrom || '#C4601A'}, ${banners[currentBannerIndex].bgTo || '#D4A017'})`
            }}
          >
            {!banners[currentBannerIndex].imageUrl ? (
              <div className="p-5 md:p-6 lg:p-7 flex justify-between items-center relative z-10 w-full">
                <div className="banner-text flex flex-col items-start max-w-[70%]">
                  {banners[currentBannerIndex].badgeText && (
                    <span className="banner-tag text-[9px] md:text-[10px] font-bold text-[#FFF8EC] tracking-[0.15em] uppercase mb-1.5">
                      {banners[currentBannerIndex].badgeText}
                    </span>
                  )}
                  <span className="banner-title font-serif text-[18px] md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-2.5">
                    {banners[currentBannerIndex].title}
                  </span>
                  {banners[currentBannerIndex].subtitle && (
                    <p className="text-[10px] md:text-xs text-white/80 mb-3 line-clamp-1">{banners[currentBannerIndex].subtitle}</p>
                  )}
                  <button
                    onClick={() => handleViewAllRoute(banners[currentBannerIndex].ctaLink || 'deals')}
                    className="banner-btn bg-[#F5E4BC] text-[#7A2F08] text-[10px] md:text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:brightness-110 shadow-xs transition-transform hover:scale-[1.02]"
                  >
                    {banners[currentBannerIndex].ctaText || 'Explore Now'}
                  </button>
                </div>
                <div className="banner-emoji font-sans select-none z-10 scale-100 md:scale-110 lg:scale-[1.25]">
                  <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                    <path d="M20 8c-4 0-8 3-8 8s4 8 8 8h24c4 0 8 3 8 8s-4 8-8 8H12c-4 0-8 3-8 8s4 8 8 8" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="20" cy="16" r="4" fill="#F5E4BC" opacity="0.8" />
                    <circle cx="44" cy="32" r="4" fill="#F5E4BC" opacity="0.8" />
                    <circle cx="20" cy="48" r="4" fill="#F5E4BC" opacity="0.8" />
                  </svg>
                </div>
              </div>
            ) : (
              /* Clickable image banner indicator hit area overlay */
              <div className="absolute inset-0 z-10 flex items-end p-4 md:p-5 lg:p-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewAllRoute(banners[currentBannerIndex].ctaLink || 'deals');
                  }}
                  className="bg-[#C4601A] hover:bg-[#a84e15] active:scale-[0.98] text-white text-[10px] md:text-xs font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-md transition-all uppercase tracking-wider cursor-pointer"
                >
                  {banners[currentBannerIndex].ctaText || 'Explore Now'}
                </button>
              </div>
            )}

            {/* Carousel navigation controls */}
            {banners.length > 1 && (
              <>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBannerIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer z-20"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white cursor-pointer z-20"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                  {banners.map((_, i) => (
                    <button 
                      key={i} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBannerIndex(i);
                      }} 
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${currentBannerIndex === i ? 'bg-white' : 'bg-white/45'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="offers-banner brand-gradient rounded-[20px] p-5 md:p-6 lg:p-7 min-h-[110px] md:min-h-[120px] lg:min-h-[148px] flex justify-between items-center relative overflow-hidden my-1 shadow-sm">
            <div className="banner-text z-10 flex flex-col items-start">
              <span className="banner-tag text-[9px] md:text-[10px] font-bold text-[#FFF8EC] tracking-[0.15em] uppercase mb-1.5">Special Offers</span>
              <span className="banner-title font-serif text-[20px] md:text-2xl lg:text-3xl font-semibold text-white leading-tight mb-2.5">New Festive Collection Arrived</span>
              <button onClick={() => handleViewAllRoute('deals')} className="banner-btn bg-[#F5E4BC] text-[#7A2F08] text-[11px] md:text-xs font-bold px-4 py-2 rounded-full cursor-pointer hover:brightness-110 shadow-xs">Explore Now</button>
            </div>
            <div className="banner-emoji font-sans select-none z-10 scale-100 md:scale-110 lg:scale-[1.25]">
              <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
                <path d="M20 8c-4 0-8 3-8 8s4 8 8 8h24c4 0 8 3 8 8s-4 8-8 8H12c-4 0-8 3-8 8s4 8 8 8" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="20" cy="16" r="4" fill="#F5E4BC" opacity="0.8" /><circle cx="44" cy="32" r="4" fill="#F5E4BC" opacity="0.8" /><circle cx="20" cy="48" r="4" fill="#F5E4BC" opacity="0.8" />
              </svg>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="w-full py-20 flex items-center justify-center text-xs text-gray-500 gap-2">
            <div className="w-4 h-4 border-2 border-[#C4601A] border-t-transparent rounded-full animate-spin" />
            Syncing saree catalog...
          </div>
        )}

        {!loading && (
          <>
            {/* === SPECIFIC CATEGORY VIEW: show ALL products in that category === */}
            {activeHomeCategory !== 'all' && (
              <div className="mb-6">
                <div className="section-header flex justify-between items-center py-4 px-0">
                  <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A] capitalize">
                    {categories.find(c => c.slug === activeHomeCategory)?.name || activeHomeCategory} Collection
                  </div>
                  <div className="flex items-center gap-2">
                    {heritage && (
                      <button
                        onClick={scrollToHeritage}
                        className="flex items-center gap-1 bg-[#FFF0E8] hover:bg-[#C4601A]/10 text-[#C4601A] border border-[#C4601A]/20 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-3xs shrink-0"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Weave Heritage
                      </button>
                    )}
                    <span className="text-xs text-[#888888] font-medium shrink-0">{filtered.length} saree{filtered.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {filtered.map((p) => renderProductScrollCard(p))}
                  </div>
                ) : (
                  <div className="w-full py-14 flex flex-col items-center justify-center gap-3 text-center bg-white/50 rounded-2xl border border-[#E8E0D5]/50 p-6">
                    <div className="text-3xl">🪡</div>
                    <div className="font-serif text-base text-[#C4601A] font-semibold">No sarees yet in this category</div>
                    <div className="text-xs text-[#888888]">The admin hasn't added any sarees here yet. Check back soon!</div>
                  </div>
                )}

                {/* Weave Heritage dynamic section (Modern Editorial 3D Saree Spread Style) */}
                {heritage && (
                  <div
                    id="category-heritage-section"
                    className="scroll-mt-36 md:scroll-mt-44 mt-12 rounded-3xl p-6 pt-12 md:p-10 md:pt-14 border border-[#F0C8A0] relative z-0 overflow-hidden shadow-2xl text-left bg-gradient-to-br from-[#FFF6EE] via-[#FDE8D7] to-[#F7D5BA] animate-fade-in"
                  >
                    {/* Subtle layered Kota Doria Khat-check background pattern */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="khat-check-pattern-home" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 0 32 L 32 32 M 32 0 L 32 32" fill="none" stroke="#C4601A" strokeWidth="1" />
                            <path d="M 0 16 L 32 16 M 16 0 L 16 32" fill="none" stroke="#C4601A" strokeWidth="0.5" strokeDasharray="2 2" />
                            <circle cx="16" cy="16" r="1.5" fill="#C4601A" opacity="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#khat-check-pattern-home)" />
                      </svg>
                    </div>

                    {/* High-Performance 3D Saree Fabric Background Artwork */}
                    <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 pointer-events-none select-none opacity-20 md:opacity-25 overflow-hidden">
                      <img src={saree3dBg} alt="3D Saree Fabric Texture" className="w-full h-full object-cover object-right" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FFF6EE] via-[#FDE8D7]/80 to-transparent" />
                    </div>

                    {/* Corner ambient glow */}
                    <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-[#E8920E]/25 to-[#C4601A]/30 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-1">
                      {/* Eyebrow badge */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF0E8] border border-[#F0C8A0]/60 text-[#C4601A] text-[10px] font-bold uppercase tracking-widest mb-3 shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Weaving Heritage & Craft</span>
                      </div>

                      {/* Editorial Title */}
                      <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#7A2F08] mb-2 leading-tight">
                        {heritage.title}
                      </h3>

                      {/* Accent line */}
                      <div className="w-16 h-1 bg-gradient-to-r from-[#C4601A] to-[#E8920E] rounded-full mb-6" />

                      {/* Icon-led Info Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-[#F0C8A0]/60 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center text-[#C4601A] shrink-0">
                            <Compass className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Region of Origin</span>
                            <span className="text-xs md:text-sm font-bold text-[#1A1A1A]">{heritage.origin}</span>
                          </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-[#F0C8A0]/60 shadow-xs flex items-center gap-3.5 hover:shadow-md transition-shadow">
                          <div className="w-10 h-10 rounded-full bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center text-[#C4601A] shrink-0">
                            <Feather className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Weave Technique</span>
                            <span className="text-xs md:text-sm font-bold text-[#1A1A1A]">{heritage.craft}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pull-quote Intro Description */}
                      {heritage.details && (
                        <div className="border-l-3 border-[#C4601A] pl-4 py-2.5 my-6 bg-[#FFF0E8]/70 backdrop-blur-xs rounded-r-xl border-t border-b border-r border-[#F0C8A0]/40">
                          <p className="text-sm md:text-base text-[#7A2F08] font-serif italic leading-relaxed">
                            "{heritage.details}"
                          </p>
                        </div>
                      )}

                      {/* Three Lower Sections with left-border accents and subtle hover lift */}
                      <div className="space-y-4">
                        {/* Section 1: Chronology & History */}
                        {heritage.history && (
                          <div className="bg-white/95 backdrop-blur-xs p-5 rounded-xl border border-[#E8E0D5] border-l-4 border-l-[#C4601A] shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#C4601A]/40 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Scroll className="w-4 h-4 text-[#C4601A]" />
                              <span className="text-xs font-bold text-[#C4601A] uppercase tracking-wider">
                                Chronology & History
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-[#4A4A4A] leading-relaxed font-serif">
                              {heritage.history}
                            </p>
                          </div>
                        )}

                        {/* Section 2: Saree Properties */}
                        {heritage.properties && (
                          <div className="bg-white/95 backdrop-blur-xs p-5 rounded-xl border border-[#E8E0D5] border-l-4 border-l-[#E8920E] shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#E8920E]/40 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Sun className="w-4 h-4 text-[#E8920E]" />
                              <span className="text-xs font-bold text-[#E8920E] uppercase tracking-wider">
                                Saree Properties & Weaving
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-[#4A4A4A] leading-relaxed">
                              {heritage.properties}
                            </p>
                          </div>
                        )}

                        {/* Section 3: Saree Care & Preservation */}
                        {heritage.care && (
                          <div className="bg-white/95 backdrop-blur-xs p-5 rounded-xl border border-[#E8E0D5] border-l-4 border-l-[#7A2F08] shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[#7A2F08]/40 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-1.5">
                              <HeartHandshake className="w-4 h-4 text-[#7A2F08]" />
                              <span className="text-xs font-bold text-[#7A2F08] uppercase tracking-wider">
                                Saree Care & Preservation
                              </span>
                            </div>
                            <p className="text-xs md:text-sm text-[#4A4A4A] leading-relaxed">
                              {heritage.care}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === ALL VIEW: unified product grid === */}
            {activeHomeCategory === 'all' && (
              <>
                {filtered.length > 0 ? (
                  <div className="mb-6">
                    <div className="section-header flex justify-between items-center py-4 px-0">
                      <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#111111]">
                        Our Saree Collection
                      </div>
                      <span className="text-xs text-[#333333] font-bold">{filtered.length} saree{filtered.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                      {filtered.map((p) => renderProductScrollCard(p))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full py-16 text-center text-[#888888] font-serif text-sm">
                    No sarees found matching this category.
                  </div>
                )}

                {/* Section: Recent Customer Reviews */}
                {reviews.length > 0 && (
                  <div className="mb-4">
                    <div className="section-header flex justify-between items-center py-4 px-0">
                      <div className="section-title font-serif text-xl md:text-2xl lg:text-[28px] font-bold text-[#1A1A1A] flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-[#C4601A]" /> Customer Love
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">Verified buyers reviews</span>
                    </div>
                    <div className="h-scroll flex gap-4 overflow-x-auto pb-4 no-scroll">
                      {reviews.map((r) => (
                        <div
                           key={r.id}
                           onClick={() => r.productId && onNavigate('product', String(r.productId))}
                           className="shrink-0 w-[240px] md:w-[280px] bg-white rounded-2xl p-4 border border-[#E8E0D5] flex flex-col justify-between shadow-3xs cursor-pointer hover:shadow-xs hover:border-[#C4601A]/30 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-[#1a1a1a] text-xs">{r.userName}</span>
                              <div className="flex text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : 'text-gray-300'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-600 italic line-clamp-3 mb-2 font-serif">"{r.body}"</p>
                          </div>
                          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                            <span className="text-[9px] text-[#888888] font-semibold truncate max-w-[70%]">Saree: {r.productName}</span>
                            {r.isVerified && <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.5 rounded">Verified</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Reel Video Player Modal */}
      {activeReel && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-[380px] w-full border border-[#E8E0D5] overflow-hidden relative shadow-2xl flex flex-col h-[85vh] max-h-[640px]">
            {/* Close Button */}
            <button
              onClick={() => setActiveReel(null)}
              className="absolute right-3.5 top-3.5 p-1.5 bg-black/60 hover:bg-black/85 rounded-full text-white cursor-pointer z-25"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Video Container */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
              {activeReel.videoUrl.includes('youtube.com') || activeReel.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={activeReel.videoUrl.replace('watch?v=', 'embed/').split('&')[0] + '?autoplay=1&mute=0&controls=1'}
                  title="Reel video"
                  className="w-full h-full aspect-video border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeReel.videoUrl}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Product Purchase Overlay Details */}
            {activeReel.product && (
              <div className="p-4 bg-white border-t border-[#E8E0D5] flex gap-3.5 items-center justify-between shadow-sm">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-13 rounded-lg overflow-hidden border border-[#E8E0D5] shrink-0 bg-[#F0E8DC]">
                    <img src={activeReel.product.image} alt={activeReel.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <span className="block font-serif text-xs font-bold text-[#1A1A1A] truncate">{activeReel.product.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {activeReel.product.discountPrice ? (
                        <>
                          <span className="text-xs font-extrabold text-[#C4601A]">₹{activeReel.product.discountPrice.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-400 line-through">₹{activeReel.product.price.toLocaleString('en-IN')}</span>
                        </>
                      ) : (
                        <span className="text-xs font-extrabold text-[#C4601A]">₹{activeReel.product.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => {
                      if (activeReel.product) {
                        onAddToCart(activeReel.product.id);
                        setActiveReel(null);
                      }
                    }}
                    className="bg-[#C4601A] hover:bg-[#FFF0E8] text-white text-[10px] font-bold px-3.5 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Buy This Look
                  </button>
                  <button
                    onClick={() => {
                      if (activeReel.product) {
                        onNavigate('product', String(activeReel.product.id));
                        setActiveReel(null);
                      }
                    }}
                    className="text-[9px] font-bold text-gray-500 hover:text-[#C4601A] text-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Store Footer */}
      <footer className="bg-white border-t border-[#E8E0D5] mt-16 pt-12 px-6 md:px-12 text-[#4A4A4A]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E8E0D5]">
          <div className="md:col-span-2 space-y-3">
            <div className="font-serif text-2xl font-bold text-[#C4601A]">Sneh Sarees</div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm">
              Discover authentic Kota Doria sarees. Sneh Sarees is a dedicated saree store based in Kota, Rajasthan, offering authentic, lightweight, and elegant Kotadoria sarees.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs font-bold text-[#1A1A1A]">
              <span className="bg-[#FFF0E8] text-[#C4601A] px-2.5 py-1 rounded-md">100% Authentic Kota Doria</span>
              <span className="bg-[#FFF0E8] text-[#C4601A] px-2.5 py-1 rounded-md">Free Delivery ≥ ₹2,000</span>
            </div>
          </div>

          <div>
            <h5 className="font-serif text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">Customer Care</h5>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <button onClick={() => setPolicyModalTab('shipping')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  Shipping &amp; Delivery
                </button>
              </li>
              <li>
                <button onClick={() => setPolicyModalTab('returns')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  7-Day Returns &amp; Refunds
                </button>
              </li>
              <li>
                <button onClick={() => setPolicyModalTab('cancellation')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  Cancellation &amp; Payments
                </button>
              </li>
              <li>
                <button onClick={() => setPolicyModalTab('faqs')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-serif text-sm font-bold text-[#1A1A1A] mb-3 uppercase tracking-wider">Legal &amp; Policies</h5>
            <ul className="space-y-2 text-xs font-medium text-gray-600">
              <li>
                <button onClick={() => setPolicyModalTab('privacy')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setPolicyModalTab('terms')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bulk')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  Bulk &amp; Bridal Orders
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-[#C4601A] transition-colors cursor-pointer">
                  My Account
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} Sneh Sarees. All rights reserved.</p>
          <p>Kota, Rajasthan · Saree Store</p>
        </div>

        {/* Guaranteed clearance buffer so bottom nav bar never covers text */}
        <div className="w-full pointer-events-none" style={{ height: '110px' }} aria-hidden="true" />
      </footer>

      <PolicyModal
        isOpen={!!policyModalTab}
        initialTab={policyModalTab || 'privacy'}
        onClose={() => setPolicyModalTab(null)}
      />
    </div>
  );
};

