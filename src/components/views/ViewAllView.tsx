import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, SlidersHorizontal, ArrowUpDown, ChevronDown, Eye, Play } from 'lucide-react';
import { products } from '../../data';
import { ActivePage, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface ViewAllViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  activeType: string;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  wishlist: number[];
  cartCount: number;
}

type SortOption = 'Popularity' | 'Price: Low to High' | 'Price: High to Low' | 'Newest First' | 'Rating';

export const ViewAllView: React.FC<ViewAllViewProps> = ({
  onNavigate,
  activeType = 'all',
  onToggleWishlist,
  onAddToCart,
  wishlist,
  cartCount
}) => {
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState('all');
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

  useEffect(() => {
    // Reset page limits when active parameters alter
    setDisplayedCount(8);
  }, [activeType, selectedCategoryGroup, sortBy, appliedOccasion, appliedFabric, appliedPriceRange, appliedColour]);

  const getFilteredProducts = () => {
    let result = [...products];

    // 1. Filter by Section Type
    if (activeType === 'best-sellers') {
      result = result.filter((p) => p.tags.includes('best-seller'));
    } else if (activeType === 'deals') {
      result = result.filter((p) => p.tags.includes('deals'));
    } else if (activeType === 'trending') {
      result = result.filter((p) => p.tags.includes('trending'));
    } else if (activeType === 'reels') {
      result = result.filter((p) => p.isReel);
    }

    // 2. Filter by Left Sidebar Category Group
    if (selectedCategoryGroup !== 'all') {
      if (selectedCategoryGroup === 'Banarasi') {
        result = result.filter((p) => p.name.toLowerCase().includes('banarasi'));
      } else {
        result = result.filter(
          (p) => p.fabric === selectedCategoryGroup || p.occasion === selectedCategoryGroup
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

    // 5. Filter by Price Scale Range
    if (appliedPriceRange) {
      if (appliedPriceRange === 'Under ₹1,000') {
        result = result.filter((p) => p.price < 1000);
      } else if (appliedPriceRange === '₹1,000–₹2,000') {
        result = result.filter((p) => p.price >= 1000 && p.price <= 2000);
      } else if (appliedPriceRange === '₹2,000–₹5,000') {
        result = result.filter((p) => p.price >= 2000 && p.price <= 5000);
      } else if (appliedPriceRange === 'Above ₹5,000') {
        result = result.filter((p) => p.price > 5000);
      }
    }

    // 6. Filter by Swatch Colour Family
    if (appliedColour) {
      result = result.filter((p) => p.colour.toLowerCase().includes(appliedColour.toLowerCase()));
    }

    // 7. Sort elements
    if (sortBy === 'Price: Low to High') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price: High to Low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'Newest First') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  };

  const filteredList = getFilteredProducts();
  const displayedList = filteredList.slice(0, displayedCount);

  const getSectionTitle = () => {
    switch (activeType) {
      case 'best-sellers':
        return 'Best Sellers';
      case 'deals':
        return 'Deals & Offers';
      case 'trending':
        return 'Trending Collection';
      case 'reels':
        return 'Trending Reels';
      default:
        return 'All Sarees';
    }
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
            {favorited ? '♥' : '♡'}
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

  const renderReelGridCard = (p: Product) => {
    return (
      <div
        key={p.id}
        onClick={() => onNavigate('product', String(p.id))}
        className="reel-grid-card relative aspect-[9/16] rounded-xl overflow-hidden shadow-md hover:scale-[1.01] transition-transform cursor-pointer"
      >
        <div className="reel-grid-img w-full h-full bg-[#922B21]">
          <SareeSwatch id={p.id + 2} />
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
          <div className="reel-grid-price text-xs font-bold text-[#E8D08A] mb-2 font-sans">
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

  return (
    <div id="page-viewall">
      {/* Top Header */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A] truncate max-w-[55%]">
          {getSectionTitle()}
        </div>
        <button
          className="va-cart-btn text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full relative cursor-pointer shrink-0"
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

      {/* Main split grid layout */}
      <div className="va-body max-w-[1320px] mx-auto flex items-start">
        {/* Left Category Sidebar */}
        <div
          id="va-sidebar"
          className="va-sidebar shrink-0 w-[92px] md:w-[106px] lg:w-[120px] bg-[#FAF6F0] border-r border-[#E8E0D5] sticky top-[56px] md:top-[60px] lg:top-[68px] h-[calc(100vh-56px-64px)] md:h-[calc(100vh-60px-60px)] lg:h-[calc(100vh-68px-60px)] overflow-y-auto no-scroll"
        >
          {[
            { id: 'all', label: 'All', icon: '✦' },
            { id: 'Silk', label: 'Silk', icon: '🧵' },
            { id: 'Cotton', label: 'Cotton', icon: '🌿' },
            { id: 'Banarasi', label: 'Banarasi', icon: '👑' },
            { id: 'Wedding', label: 'Wedding', icon: '💍' }
          ].map((item) => {
            const active = selectedCategoryGroup === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedCategoryGroup(item.id)}
                className={`va-sidebar-item flex flex-col items-center gap-1.5 text-center p-3.5 px-1.5 border-l-3 transition-all cursor-pointer ${
                  active ? 'bg-white border-l-[#7B1C2E]' : 'border-l-transparent hover:bg-white/50'
                }`}
              >
                <div
                  className={`va-sidebar-icon w-9 h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center border font-semibold text-sm transition-colors ${
                    active ? 'bg-[#7B1C2E] border-[#7B1C2E] text-white' : 'bg-white border-[#E8E0D5] text-[#7B1C2E]'
                  }`}
                >
                  {item.icon}
                </div>
                <div
                  className={`va-sidebar-label text-[10px] md:text-xs font-semibold leading-tight capitalize ${
                    active ? 'text-[#7B1C2E] font-bold' : 'text-[#4A4A4A]'
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
          <div className="sort-filter-bar sticky top-[56px] md:top-[60px] lg:top-[68px] bg-white border-b border-[#E8E0D5] flex gap-2.5 p-2.5 px-4 z-10 select-none">
            <button
              onClick={() => setShowSortModal(true)}
              className="sort-pill flex items-center gap-1.5 border border-[#E8E0D5] rounded-full py-1.5 px-3.5 text-xs font-semibold text-[#4A4A4A] bg-white hover:border-[#7B1C2E] transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort: {sortBy}</span>
              <ChevronDown className="w-3 h-3 text-[#min-color]" />
            </button>
            <button
              onClick={() => setShowFilterModal(true)}
              className="filter-pill flex items-center gap-1.5 border border-[#E8E0D5] rounded-full py-1.5 px-3.5 text-xs font-semibold text-[#4A4A4A] bg-white hover:border-[#7B1C2E] transition-colors cursor-pointer ml-auto"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
              {(appliedOccasion || appliedFabric || appliedPriceRange || appliedColour) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#7B1C2E] shrink-0" />
              )}
            </button>
          </div>

          {/* Active Applied Filters quick tag strip */}
          {(appliedOccasion || appliedFabric || appliedPriceRange || appliedColour) && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-1">
              {appliedOccasion && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#7B1C2E] flex items-center gap-1">
                  {appliedOccasion}
                  <button onClick={() => setAppliedOccasion(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              {appliedFabric && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#7B1C2E] flex items-center gap-1">
                  {appliedFabric}
                  <button onClick={() => setAppliedFabric(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              {appliedPriceRange && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#7B1C2E] flex items-center gap-1">
                  {appliedPriceRange}
                  <button onClick={() => setAppliedPriceRange(null)} className="font-bold pl-0.5 hover:text-[#DC3545]">×</button>
                </span>
              )}
              {appliedColour && (
                <span className="text-[10px] font-semibold bg-[#FAF6F0] border border-[#E8E0D5] rounded-full px-2.5 py-1 text-[#7B1C2E] flex items-center gap-1">
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

          {/* Products List Rendering Layout */}
          {displayedList.length === 0 ? (
            <div className="text-center py-20 px-6 font-serif">
              <div className="text-[#888888] text-base mb-2">No products match your criteria</div>
              <button onClick={handleResetFilters} className="text-[#7B1C2E] font-bold underline text-sm cursor-pointer">
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

          {/* Load More Trigger */}
          {filteredList.length > displayedCount && (
            <button
              className="load-more-btn block mx-auto my-6 border-1.5 border-[#7B1C2E] text-[#7B1C2E] text-xs font-semibold py-2.5 px-8 rounded-full hover:bg-[#7B1C2E] hover:text-white transition-all transform hover:scale-102 cursor-pointer"
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
                      ? 'bg-[#7B1C2E] text-white border-maroon'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#7B1C2E]'
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
              {['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen'].map((fab) => (
                <button
                  key={fab}
                  onClick={() => setSelectedFabric(selectedFabric === fab ? null : fab)}
                  className={`filter-option rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                    selectedFabric === fab
                      ? 'bg-[#7B1C2E] text-white border-maroon'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#7B1C2E]'
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
            <div className="filter-options flex flex-wrap gap-1.5">
              {['Under ₹1,000', '₹1,000–₹2,000', '₹2,000–₹5,000', 'Above ₹5,000'].map((pr) => (
                <button
                  key={pr}
                  onClick={() => setSelectedPriceRange(selectedPriceRange === pr ? null : pr)}
                  className={`filter-option rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                    selectedPriceRange === pr
                      ? 'bg-[#7B1C2E] text-white border-maroon'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#7B1C2E]'
                  }`}
                >
                  {pr}
                </button>
              ))}
            </div>
          </div>

          {/* Colour */}
          <div className="filter-group mb-5">
            <h4 className="filter-group-label text-[11px] font-bold text-[#888888] uppercase tracking-wider mb-2.5">
              Colour
            </h4>
            <div className="filter-options flex flex-wrap gap-1.5">
              {['Red', 'Blue', 'Green', 'Pink', 'Yellow', 'Purple', 'Teal', 'Maroon', 'Saffron'].map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedColour(selectedColour === col ? null : col)}
                  className={`filter-option rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                    selectedColour === col
                      ? 'bg-[#7B1C2E] text-white border-maroon'
                      : 'bg-white text-[#4A4A4A] border border-[#E8E0D5] hover:border-[#7B1C2E]'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Submit button */}
          <div className="flex gap-2 text-center">
            <button
              className="flex-1 bg-gray-200 text-gray-700 py-3.5 rounded-lg text-sm font-bold tracking-wide hover:bg-gray-300 cursor-pointer"
              onClick={handleResetFilters}
            >
              Reset
            </button>
            <button
              className="flex-[2] bg-[#7B1C2E] text-white py-3.5 rounded-lg text-sm font-bold tracking-wide hover:bg-[#9B2840] cursor-pointer"
              onClick={handleApplyFilters}
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
          className="sort-modal bg-white w-full max-w-[430px] md:max-w-[460px] mx-auto rounded-t-3xl md:rounded-2xl p-5 pb-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="filter-modal-handle w-10 h-1 bg-[#E8E0D5] rounded-full mx-auto mb-4" />
          <h3 className="filter-modal-title font-serif text-lg font-bold mb-2">
            Sort By
          </h3>

          <div className="divide-y divide-[#E8E0D5]">
            {(
              [
                'Popularity',
                'Price: Low to High',
                'Price: High to Low',
                'Newest First',
                'Rating'
              ] as SortOption[]
            ).map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  setSortBy(opt);
                  setShowSortModal(false);
                }}
                className={`sort-option flex items-center justify-between py-3.5 cursor-pointer text-sm font-medium ${
                  sortBy === opt ? 'text-[#7B1C2E] font-bold' : 'text-[#1A1A1A] hover:bg-[#FAF6F0]/50'
                }`}
              >
                <span>{opt}</span>
                {sortBy === opt && <span className="text-[#7B1C2E] pr-2">✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
