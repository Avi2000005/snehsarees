import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, SlidersHorizontal, ArrowUpDown, ChevronDown, Eye, Play, Heart, RefreshCw, Home, BookOpen, Sparkles, MapPin, Layers, ShieldCheck, Compass, Feather, Scroll, Sun, HeartHandshake } from 'lucide-react';
import { ActivePage, Product, Category } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { API_URL } from '../../config';
import saree3dBg from '../saree_heritage_3d_bg.png';

interface ViewAllViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  activeType: string;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  wishlist: number[];
  cartCount: number;
}

type SortOption = 'Popularity' | 'Price: Low to High' | 'Price: High to Low' | 'Newest First' | 'Rating';

export const ViewAllView: React.FC<ViewAllViewProps> = ({
  onNavigate,
  onBack,
  activeType = 'all',
  onToggleWishlist,
  onAddToCart,
  wishlist,
  cartCount
}) => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Section keys that are NOT category slugs
  const SECTION_KEYS = ['all', 'reels'];

  // If activeType is a category slug (not a section key), pre-select it in the sidebar
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState(
    SECTION_KEYS.includes(activeType) ? 'all' : activeType
  );
  const [sortBy, setSortBy] = useState<SortOption>('Popularity');
  const [displayedCount, setDisplayedCount] = useState(8);

  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Dynamic filter state
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);

  // Effective applied filters
  const [appliedOccasion, setAppliedOccasion] = useState<string | null>(null);
  const [appliedFabric, setAppliedFabric] = useState<string | null>(null);
  const [appliedPriceRange, setAppliedPriceRange] = useState<string | null>(null);
  const [appliedColour, setAppliedColour] = useState<string | null>(null);

  const getActiveHeritage = () => {
    const cat = categories.find((c) => c.slug === selectedCategoryGroup);
    if (!cat) return null;
    return {
      title: cat.name + " Saree Heritage & Weaves",
      origin: cat.slug === 'silk' ? 'Banaras & Kanchipuram' : cat.slug === 'cotton' ? 'Chanderi & Sambalpur' : 'Artisanal Weaving Clusters',
      craft: cat.slug === 'silk' ? 'Handloom Silk Zari Warp' : cat.slug === 'cotton' ? 'Fine Combed Thread Weft' : 'Traditional Handloom',
      details: cat.description || "Beautiful hand-loomed saree threads crafted with dedication. Learn details on history, fabrics, and borders from our saree knowledge base.",
      history: cat.history || "Woven under royal patronage for centuries. These sarees reflect generations of craftsmanship passed down to today's handloom artisans.",
      properties: cat.properties || "Natural breathable textures, elegant zari motifs, and lightweight organic drape lines.",
      care: cat.care || "Dry clean recommended to preserve golden thread luster. Handle with sneh."
    };
  };

  const heritage = getActiveHeritage();

  const scrollToHeritage = () => {
    setTimeout(() => {
      const el = document.getElementById('category-heritage-section');
      if (el) {
        const yOffset = -160;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 50);
  };

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/products`).then(res => res.json()),
      fetch(`${API_URL}/api/categories`).then(res => res.json())
    ]).then(([prodData, catData]) => {
      setProductsList(prodData || []);
      setCategories(catData || []);
      setLoading(false);
    }).catch(err => {
      console.error('ViewAllView load error:', err);
      setLoading(false);
    });
  }, []);

  // Sync sidebar selection when activeType changes (e.g. navigating from drawer)
  useEffect(() => {
    const SECTION_KEYS = ['all', 'best-sellers', 'deals', 'trending', 'reels'];
    if (!SECTION_KEYS.includes(activeType)) {
      setSelectedCategoryGroup(activeType);
    } else {
      setSelectedCategoryGroup('all');
    }
  }, [activeType]);

  useEffect(() => {
    // Reset limits when filters change
    setDisplayedCount(8);
  }, [activeType, selectedCategoryGroup, sortBy, appliedOccasion, appliedFabric, appliedPriceRange, appliedColour]);

  const getFilteredProducts = () => {
    let result = [...productsList];

    // 1. Filter by reels if needed
    if (activeType === 'reels') {
      result = result.filter((p) => p.isReel);
    }

    // 2. Filter by Left Sidebar Category Group
    if (selectedCategoryGroup !== 'all') {
      const catObj = categories.find(c => c.slug === selectedCategoryGroup);
      if (selectedCategoryGroup === 'Banarasi') {
        result = result.filter((p) => p.name.toLowerCase().includes('banarasi'));
      } else {
        result = result.filter(
          (p) =>
            p.fabric === selectedCategoryGroup ||
            p.occasion === selectedCategoryGroup ||
            (catObj && p.categoryId === catObj.id)
        );
      }
    }

    // 3. Filter by Applied Dialog Filters (Occasions)
    if (appliedOccasion) {
      result = result.filter((p) => p.occasion === appliedOccasion);
    }

    // 4. Filter by Applied Dialog Filters (Fabrics)
    if (appliedFabric) {
      result = result.filter((p) => p.fabric === appliedFabric);
    }

    // 5. Filter by Applied Dialog Filters (Prices)
    if (appliedPriceRange) {
      result = result.filter((p) => {
        if (appliedPriceRange === 'Under ₹2,000') return p.price < 2000;
        if (appliedPriceRange === '₹2,000 - ₹5,000') return p.price >= 2000 && p.price <= 5000;
        if (appliedPriceRange === '₹5,000 - ₹10,000') return p.price >= 5000 && p.price <= 10000;
        if (appliedPriceRange === 'Over ₹10,000') return p.price > 10000;
        return true;
      });
    }

    // 6. Filter by Applied Dialog Filters (Colours)
    if (appliedColour) {
      result = result.filter((p) => p.colour === appliedColour);
    }

    // 7. Sort listings
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Newest First') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'Rating') {
      result.sort((a, b) => (b.rating || 5.0) - (a.rating || 5.0));
    }

    return result;
  };

  const filteredList = getFilteredProducts();
  const displayedList = filteredList.slice(0, displayedCount);

  const getSectionTitle = () => {
    if (activeType === 'reels') return 'Video Showcase';
    return 'Sneh Sarees Collection';
  };

  const handleApplyFilters = () => {
    setAppliedOccasion(selectedOccasion);
    setAppliedFabric(selectedFabric);
    setAppliedPriceRange(selectedPriceRange);
    setAppliedColour(selectedColour);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setSelectedOccasion(null);
    setSelectedFabric(null);
    setSelectedPriceRange(null);
    setSelectedColour(null);
    setAppliedOccasion(null);
    setAppliedFabric(null);
    setAppliedPriceRange(null);
    setAppliedColour(null);
    setShowFilterModal(false);
  };

  const renderGridCard = (p: Product) => {
    const favorited = wishlist.includes(p.id);
    const isTrending = p.tags && p.tags.includes('trending');
    const isOutOfStock = p.stock === 0;
    const isLowStock = p.stock !== undefined && p.stock > 0 && p.stock <= 3;

    return (
      <div
        key={p.id}
        onClick={() => !isOutOfStock && onNavigate('product', String(p.id))}
        className={`grid-product-card bg-white rounded-xl overflow-hidden shadow-xs border border-[#E8E0D5] relative transition-all ${
          isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
        }`}
      >
        <div className="grid-card-img relative h-[190px] md:h-[228px] lg:h-[250px] bg-[#F0E8DC]">
          <SareeSwatch id={p.id} imageUrl={p.image} />
          {isTrending && (
            <div className="trending-badge absolute top-2 left-2 bg-[#E8871E] text-white text-[9px] font-bold px-2 py-0.75 rounded-full tracking-wider uppercase">
              TRENDING
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10">
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
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p.id);
            }}
            className="grid-wishlist absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 rounded-full flex items-center justify-center text-sm z-10 active:scale-120 transition-transform cursor-pointer"
          >
            {favorited ? '♥' : '♡'}
          </div>
        </div>
        <div className="grid-card-info p-2.5 md:p-3.5">
          <div className="grid-product-name font-sans text-sm md:text-base font-bold text-[#111111] leading-tight mb-1 line-clamp-2 min-h-[38px]">
            {p.name}
          </div>
          <span className="grid-fabric-tag inline-block text-[10px] font-semibold text-[#222222] bg-[#FAF0E6] border border-[#F0C8A0]/60 px-2 py-0.5 rounded-md mb-2">
            {p.fabric}
          </span>
          <div className="grid-rating text-[11px] text-amber-500 mb-1">
            {p.reviews > 0 ? '★'.repeat(Math.round(p.rating || 0)) + '☆'.repeat(5 - Math.round(p.rating || 0)) : '☆☆☆☆☆'}
            <span className="text-[#333333] font-semibold ml-1">({p.reviews || 0})</span>
          </div>
          <div className="grid-price text-base font-bold text-[#C4601A] mb-2.5 font-sans">
            ₹{p.price.toLocaleString('en-IN')}
          </div>
          <div className="grid-card-btns flex flex-col gap-1.5">
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(p.id);
              }}
              className={`grid-cart-btn w-full border text-[11px] font-bold py-1.5 rounded-lg active:scale-98 transition-transform cursor-pointer shadow-3xs ${
                isOutOfStock 
                  ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'border-[#C4601A] text-[#C4601A] hover:bg-[#C4601A]/5'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(p.id);
                onNavigate('cart');
              }}
              className={`grid-buy-btn w-full text-white text-[11px] font-bold py-1.5 rounded-lg active:scale-98 transition-transform cursor-pointer shadow-2xs ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-[#C4601A] hover:bg-[#FFF0E8]'
              }`}
            >
              {isOutOfStock ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReelGridCard = (p: Product) => {
    return (
      <div
        key={p.id}
        onClick={() => onNavigate('product', String(p.id))}
        className="reel-grid-card relative aspect-[9/16] rounded-xl overflow-hidden shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
      >
        <div className="reel-grid-img w-full h-full bg-[#922B21]">
          <SareeSwatch id={p.id + 2} imageUrl={p.image} />
        </div>
        <div className="reel-grid-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="reel-grid-views absolute top-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.75 rounded-full flex items-center gap-1">
          <Eye className="w-3 h-3" /> {p.views || '10k'}
        </div>
        <div className="reel-grid-play absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center">
          <Play className="w-4 h-4 fill-white text-white shrink-0" />
        </div>
        <div className="reel-grid-info absolute bottom-0 left-0 right-0 p-3">
          <div className="reel-grid-name font-serif text-sm font-semibold text-white leading-tight mb-1">
            {p.name}
          </div>
          <div className="reel-grid-price text-xs font-bold text-[#FFF8EC] mb-2 font-sans">
            ₹{p.price.toLocaleString('en-IN')}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(p.id);
            }}
            className="reel-grid-buy text-[10px] font-semibold text-white border border-white/60 py-1 px-2.5 rounded-lg inline-block hover:bg-white hover:text-black transition-colors pointer-events-auto"
          >
            Buy Now
          </button>
        </div>
      </div>
    );
  };

  const getSidebarItems = () => {
    const defaults = [
      { id: 'all', label: 'All', icon: '✦', imageUrl: '' }
    ];
    // Map custom categories
    const custom = categories.map(cat => ({
      id: cat.slug,
      label: cat.name,
      icon: cat.slug === 'silk' ? '🧵' : cat.slug === 'cotton' ? '🌿' : cat.slug === 'georgette' ? '✨' : '🛍️',
      imageUrl: cat.imageUrl || ''
    }));
    // Filter standard fallbacks
    const filteredDefaults = defaults.filter(d => !custom.some(c => c.id.toLowerCase() === d.id.toLowerCase()));
    return [...filteredDefaults, ...custom];
  };

  return (
    <div id="page-viewall">
      {/* Top Header */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-40 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <div className="flex items-center gap-1.5">
          <button
            className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
            onClick={onBack}
            title="Go Back"
          >
            <ArrowLeft className="w-[22px] h-[22px]" />
          </button>
          <button
            className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
            onClick={() => onNavigate('home')}
            title="Return to Home Section"
          >
            <Home className="w-[22px] h-[22px]" />
          </button>
        </div>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A] truncate max-w-[55%]">
          {getSectionTitle()}
        </div>
        <div className="w-9 h-9" />
      </div>

      {/* Main split grid layout */}
      <div className="va-body max-w-[1320px] mx-auto flex items-start">
        {/* Left Category Sidebar */}
        <div
          id="va-sidebar"
          className="va-sidebar shrink-0 w-[92px] md:w-[106px] lg:w-[120px] bg-[#FAF6F0] border-r border-[#E8E0D5] sticky top-[56px] md:top-[60px] lg:top-[68px] h-[calc(100vh-56px-64px)] md:h-[calc(100vh-60px-60px)] lg:h-[calc(100vh-68px-60px)] overflow-y-auto no-scroll z-20"
        >
          {getSidebarItems().map((item) => {
            const active = selectedCategoryGroup === item.id;
            const hasImage = !!item.imageUrl;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedCategoryGroup(item.id)}
                className={`va-sidebar-item flex flex-col items-center gap-1.5 text-center p-3.5 px-1.5 border-l-3 transition-all cursor-pointer ${
                  active ? 'bg-white border-l-[#C4601A]' : 'border-l-transparent hover:bg-white/50'
                }`}
              >
                <div
                  className={`va-sidebar-icon w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center border font-semibold text-sm transition-all overflow-hidden ${
                    active 
                      ? hasImage
                        ? 'border-[#C4601A] ring-2 ring-[#C4601A]/25 scale-105 bg-[#C4601A]/5'
                        : 'bg-[#C4601A] border-[#C4601A] text-white scale-105' 
                      : 'bg-white border-[#E8E0D5] text-[#C4601A]'
                  }`}
                >
                  {hasImage ? (
                    <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
                  ) : (
                    <span className="text-base">{item.icon}</span>
                  )}
                </div>
                <div
                  className={`va-sidebar-label text-[10px] md:text-xs font-semibold leading-tight capitalize ${
                    active ? 'text-[#C4601A] font-bold' : 'text-[#4A4A4A]'
                  }`}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right side Products view */}
        <div className="va-main flex-1 min-w-0 pb-[80px] md:pb-[96px]">
          {/* Sorter / Filter floating toolbar */}
          <div className="sort-filter-bar sticky top-[56px] md:top-[60px] lg:top-[68px] bg-white/98 backdrop-blur-md border-b border-[#E8E0D5] flex gap-2.5 p-2.5 px-4 z-30 select-none shadow-2xs">
            <button
              onClick={() => setShowSortModal(true)}
              className="sort-pill flex items-center gap-1.5 border border-[#E8E0D5] rounded-full py-1.5 px-3.5 text-xs font-semibold text-[#4A4A4A] bg-white hover:border-[#C4601A] transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {sortBy}</span>
              <ChevronDown className="w-3 h-3 text-[#C4601A]" />
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="filter-pill flex items-center gap-1.5 border border-[#E8E0D5] rounded-full py-1.5 px-3.5 text-xs font-semibold text-[#4A4A4A] bg-white hover:border-[#C4601A] transition-colors cursor-pointer ml-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {(appliedOccasion || appliedFabric || appliedPriceRange || appliedColour) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C4601A] shrink-0" />
              )}
            </button>
          </div>

          {/* Active Applied Filters quick tag strip */}
          {(appliedOccasion || appliedFabric || appliedPriceRange || appliedColour) && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-1">
              {appliedOccasion && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#C4601A] flex items-center gap-1">
                  {appliedOccasion}
                  <button onClick={() => setAppliedOccasion(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              {appliedFabric && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#C4601A] flex items-center gap-1">
                  {appliedFabric}
                  <button onClick={() => setAppliedFabric(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              {appliedPriceRange && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#C4601A] flex items-center gap-1">
                  {appliedPriceRange}
                  <button onClick={() => setAppliedPriceRange(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              {appliedColour && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#C4601A] flex items-center gap-1">
                  {appliedColour}
                  <button onClick={() => setAppliedColour(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              <button
                className="text-[10px] font-bold text-red-600 hover:underline px-2"
                onClick={handleResetFilters}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Saree Heritage Sub-header Bar (Only if category selected) */}
          {selectedCategoryGroup !== 'all' && heritage && (
            <div className="bg-[#FAF6F0] px-4 py-2 border-b border-[#E8E0D5] flex items-center justify-between select-none">
              <span className="font-serif text-[13px] font-bold text-[#1A1A1A] capitalize">
                {categories.find(c => c.slug === selectedCategoryGroup)?.name || selectedCategoryGroup} Heritage
              </span>
              <button
                onClick={scrollToHeritage}
                className="flex items-center gap-1 bg-[#FFF0E8] hover:bg-[#C4601A]/10 text-[#C4601A] border border-[#C4601A]/20 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer shadow-3xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Weave Heritage
              </button>
            </div>
          )}

          {/* Dynamic Sync state spinner */}
          {loading && (
            <div className="w-full py-20 flex items-center justify-center text-xs text-gray-400 gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C4601A]" /> Loading products catalog...
            </div>
          )}

          {/* Products List Rendering Layout */}
          {!loading && (
            <>
              {displayedList.length === 0 ? (
                <div className="text-center py-20 px-6 font-serif">
                  <div className="text-[#888888] text-base mb-2">No products match your criteria</div>
                  <button onClick={handleResetFilters} className="text-[#C4601A] font-bold underline text-sm cursor-pointer">
                    Reset Filters
                  </button>
                </div>
              ) : activeType === 'reels' ? (
                <div className="reel-grid grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 gap-3">
                  {displayedList.map((p) => renderReelGridCard(p))}
                </div>
              ) : (
                <div className="product-grid grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4 gap-3 md:gap-4.5">
                  {displayedList.map((p) => renderGridCard(p))}
                </div>
              )}

              {/* Weave Heritage dynamic section (Modern Editorial 3D Saree Spread Style) */}
              {selectedCategoryGroup !== 'all' && heritage && (
                <div className="px-4 mt-6">
                  <div
                    id="category-heritage-section"
                    className="scroll-mt-36 md:scroll-mt-44 rounded-3xl p-6 pt-12 md:p-10 md:pt-14 border border-[#F0C8A0] relative z-0 overflow-hidden shadow-2xl text-left bg-gradient-to-br from-[#FFF6EE] via-[#FDE8D7] to-[#F7D5BA] animate-fade-in"
                  >
                    {/* Subtle layered Kota Doria Khat-check background pattern */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="khat-check-pattern-viewall" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 0 32 L 32 32 M 32 0 L 32 32" fill="none" stroke="#C4601A" strokeWidth="1" />
                            <path d="M 0 16 L 32 16 M 16 0 L 16 32" fill="none" stroke="#C4601A" strokeWidth="0.5" strokeDasharray="2 2" />
                            <circle cx="16" cy="16" r="1.5" fill="#C4601A" opacity="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#khat-check-pattern-viewall)" />
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
                </div>
              )}
            </>
          )}

          {/* Load More Trigger */}
          {filteredList.length > displayedCount && (
            <button
              className="load-more-btn block mx-auto my-6 border-1.5 border-[#C4601A] text-[#C4601A] text-xs font-semibold py-2.5 px-8 rounded-full hover:bg-[#C4601A] hover:text-white transition-all transform hover:scale-102 cursor-pointer"
              onClick={() => setDisplayedCount((prev) => prev + 4)}
            >
              Load More
            </button>
          )}
        </div>
      </div>

      {/* FILTER MODAL POPUP */}
      <div
        className={`filter-modal-overlay fixed inset-0 z-[150] bg-black/50 transition-opacity duration-300 md:items-center md:justify-center ${
          showFilterModal ? 'flex pointer-events-auto opacity-100' : 'hidden pointer-events-none opacity-0'
        }`}
        onClick={() => setShowFilterModal(false)}
      >
        <div
          className="filter-modal bg-white w-full max-w-[430px] md:max-w-[500px] lg:max-w-[560px] mx-auto rounded-t-3xl md:rounded-2xl p-5 pb-10 max-h-[80vh] md:max-h-[82vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="filter-modal-handle w-10 h-1 bg-[#E8E0D5] rounded-full mx-auto mb-4" />
          <h3 className="filter-modal-title font-serif text-xl md:text-2xl font-bold mb-4">
            Filter Sarees
          </h3>

          {/* Occasion */}
          <div className="filter-group mb-5">
            <h4 className="filter-group-label text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2.5">
              Occasion
            </h4>
            <div className="filter-options flex flex-wrap gap-1.5">
              {['Wedding', 'Puja', 'Party', 'Daily Wear', 'Office'].map((occ) => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(selectedOccasion === occ ? null : occ)}
                  className={`filter-option rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                    selectedOccasion === occ
                      ? 'bg-[#C4601A] text-white border-primrose'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#C4601A]'
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric */}
          <div className="filter-group mb-5">
            <h4 className="filter-group-label text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2.5">
              Fabric
            </h4>
            <div className="filter-options flex flex-wrap gap-1.5">
              {['Silk', 'Cotton', 'Georgette', 'Linen', 'Organza', 'Crepe'].map((fab) => (
                <button
                  key={fab}
                  onClick={() => setSelectedFabric(selectedFabric === fab ? null : fab)}
                  className={`filter-option rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                    selectedFabric === fab
                      ? 'bg-[#C4601A] text-white border-primrose'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#C4601A]'
                  }`}
                >
                  {fab}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group mb-5">
            <h4 className="filter-group-label text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2.5">
              Price Range
            </h4>
            <div className="filter-options flex flex-col gap-1.5">
              {['Under ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹10,000', 'Over ₹10,000'].map((price) => (
                <button
                  key={price}
                  onClick={() => setSelectedPriceRange(selectedPriceRange === price ? null : price)}
                  className={`filter-option w-full rounded-xl p-3 text-xs font-semibold text-left cursor-pointer transition-all border ${
                    selectedPriceRange === price
                      ? 'bg-[#C4601A] text-white border-primrose'
                      : 'bg-white text-[#4A4A4A] border-[#E8E0D5] hover:border-[#C4601A]'
                  }`}
                >
                  {price}
                </button>
              ))}
            </div>
          </div>

          {/* Colour */}
          <div className="filter-group mb-6">
            <h4 className="filter-group-label text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2.5">
              Colour Way
            </h4>
            <div className="filter-options flex flex-wrap gap-1.5">
              {['Red', 'Royal Blue', 'Emerald', 'Deep Pink', 'Purple', 'Saffron', 'Teal', 'Maroon'].map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColour(selectedColour === col ? null : col)}
                  className={`filter-option rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                    selectedColour === col
                      ? 'bg-[#C4601A] text-white border-primrose'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#C4601A]'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="filter-dialog-btns flex gap-3">
            <button
              onClick={handleResetFilters}
              className="flex-1 border border-[#E8E0D5] py-3.5 rounded-xl text-xs font-bold text-[#4A4A4A] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#FFF0E8] transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* SORT MODAL POPUP */}
      <div
        className={`sort-modal-overlay fixed inset-0 z-[150] bg-black/50 transition-opacity duration-300 md:items-center md:justify-center ${
          showSortModal ? 'flex pointer-events-auto opacity-100' : 'hidden pointer-events-none opacity-0'
        }`}
        onClick={() => setShowSortModal(false)}
      >
        <div
          className="sort-modal bg-white w-full max-w-[430px] md:max-w-[450px] mx-auto rounded-t-3xl md:rounded-2xl p-5 pb-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sort-modal-handle w-10 h-1 bg-[#E8E0D5] rounded-full mx-auto mb-4" />
          <h3 className="sort-modal-title font-serif text-xl md:text-2xl font-bold mb-4 text-center">
            Sort Sarees By
          </h3>
          <div className="flex flex-col gap-2">
            {(['Popularity', 'Price: Low to High', 'Price: High to Low', 'Newest First', 'Rating'] as SortOption[]).map(
              (option) => {
                const active = sortBy === option;
                return (
                  <button
                    key={option}
                    onClick={() => {
                      setSortBy(option);
                      setShowSortModal(false);
                    }}
                    className={`sort-option-btn w-full rounded-xl p-3.5 text-xs font-semibold text-center cursor-pointer transition-all ${
                      active ? 'bg-[#C4601A]/10 text-[#C4601A]' : 'hover:bg-[#FAF6F0]'
                    }`}
                  >
                    {option}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


