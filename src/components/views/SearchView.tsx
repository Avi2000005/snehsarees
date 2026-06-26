import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X } from 'lucide-react';
import { products } from '../../data';
import { ActivePage, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';

interface SearchViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  wishlist: number[];
  recentSearches: string[];
  onAddRecentSearch: (term: string) => void;
  onRemoveRecentSearch: (index: number) => void;
  recentlyViewed: number[];
  onBack: () => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  onNavigate,
  onToggleWishlist,
  onAddToCart,
  wishlist,
  recentSearches,
  onAddRecentSearch,
  onRemoveRecentSearch,
  recentlyViewed,
  onBack
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setResults([]);
      setIsSearched(false);
      return;
    }

    const q = query.toLowerCase();

    // Generate dynamic matches for live autocomplete list
    const matched = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q)
    );

    setSuggestions(matched.slice(0, 8));
  }, [query]);

  const executeSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onAddRecentSearch(searchTerm);

    const q = searchTerm.toLowerCase();
    const matched = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q) ||
        p.colour.toLowerCase().includes(q)
    );

    setResults(matched);
    setIsSearched(true);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setIsSearched(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setIsSearched(false);
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q) return text;
    // Escape regex-special characters to prevent runtime crashes
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQ})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === q.toLowerCase() ? (
            <strong key={i} className="text-[#7B1C2E] font-bold">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const renderGridCard = (p: Product) => {
    const favorited = wishlist.includes(p.id);
    const isTrending = p.tags && p.tags.includes('trending');

    return (
      <div
        key={p.id}
        onClick={() => onNavigate('product', String(p.id))}
        className="grid-product-card bg-white rounded-xl overflow-hidden shadow-xs border border-[#E8E0D5] cursor-pointer hover:shadow-md transition-shadow"
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
            className="grid-wishlist absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 rounded-full flex items-center justify-center text-sm z-10 hover:scale-110 active:scale-125 transition-transform"
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
              className="grid-cart-btn w-full border-1.5 border-[#7B1C2E] text-[#7B1C2E] hover:bg-[#7B1C2E]/5 text-[11px] font-semibold py-1.5 rounded-lg active:scale-98 transition-transform cursor-pointer"
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
    <div id="page-search">
      {/* Search Header input bar */}
      <div className="search-page-bar flex items-center gap-2.5 p-2.5 px-4 bg-white border-b border-[#E8E0D5] sticky top-0 z-10 max-w-[430px] md:max-w-full mx-auto">
        <button
          className="search-back-btn text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="search-input-wrap flex-1 flex items-center bg-[#F0E8DC] border border-[#E8E0D5] focus-within:border-[#7B1C2E] rounded-full p-2 px-3.5 gap-2 transition-colors">
          <Search className="w-4 h-4 text-[#888888] shrink-0" />
          <input
            type="text"
            id="search-input"
            placeholder="Search for sarees..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                executeSearch(query.trim());
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#1A1A1A] placeholder-[#888888]"
            autoFocus
          />
          {query && (
            <button
              className="search-clear text-lg text-[#888888] hover:text-[#1A1A1A] p-0.5"
              onClick={clearSearch}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-4 pb-[80px]">
        {/* State 1: Default/Empty prompt */}
        {!query && !isSearched && (
          <div id="search-default">
            {/* History logs */}
            <div className="search-section-label text-xs font-bold text-[#1A1A1A] p-4 px-0 uppercase tracking-wider">
              Recent Searches
            </div>
            <div className="recent-chips flex flex-wrap gap-2 pb-4">
              {recentSearches.length === 0 ? (
                <div className="text-xs text-[#888888] italic py-2">No recent searches</div>
              ) : (
                recentSearches.map((term, i) => (
                  <div
                    key={i}
                    className="recent-chip flex items-center gap-1.5 bg-white border border-[#E8E0D5] rounded-full px-3 py-1.5 text-xs text-[#4A4A4A] cursor-pointer hover:border-[#7B1C2E] transition-colors"
                  >
                    <Search className="w-3 h-3 text-[#888888]" />
                    <span onClick={() => executeSearch(term)} className="hover:text-[#7B1C2E]">
                      {term}
                    </span>
                    <button
                      className="recent-chip-x text-[#888888] hover:text-[#DC3545] text-sm leading-none pl-1"
                      onClick={() => onRemoveRecentSearch(i)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Recently Viewed */}
            <div className="search-section-label text-xs font-bold text-[#1A1A1A] p-4 px-0 uppercase tracking-wider border-t border-[#E8E0D5] mt-2">
              Recently Viewed
            </div>
            <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4.5 pt-1">
              {recentlyViewed.length === 0 ? (
                <div className="text-xs text-[#888888] italic py-2 col-span-full">
                  No recently viewed products
                </div>
              ) : (
                recentlyViewed
                  .map((id) => products.find((x) => x.id === id))
                  .filter((p): p is Product => !!p)
                  .map((p) => renderGridCard(p))
              )}
            </div>
          </div>
        )}

        {/* State 2: Active Autocomplete Suggestions */}
        {query && !isSearched && (
          <div id="search-suggestions" className="bg-white rounded-xl shadow-xs border border-[#E8E0D5] divide-y divide-[#E8E0D5] overflow-hidden">
            <div className="suggestions-list">
              {suggestions.length === 0 ? (
                <div className="suggestion-item p-3.5 px-4 text-xs text-[#888888]">
                  No suggestions for "{query}"
                </div>
              ) : (
                suggestions.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => executeSearch(p.name)}
                    className="suggestion-item flex items-center gap-3 p-3.5 px-4 hover:bg-[#FAF6F0] cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-[#888888] shrink-0" />
                    <span className="suggestion-text text-sm text-[#1A1A1A]">
                      {highlightMatch(p.name, query)}{' '}
                      <span className="text-[11px] text-[#888888]">· {p.fabric}</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* State 3: Search Results Grid */}
        {isSearched && (
          <div id="search-results">
            <div className="results-header text-xs text-[#888888] p-3 px-0 bg-[#FAF6F0] mb-2 font-semibold">
              Showing <span className="text-[#7B1C2E] font-bold">{results.length} results</span>{' '}
              for "{query}"
            </div>

            {results.length === 0 ? (
              <div id="no-results" className="text-center py-10">
                <div className="text-[#7B1C2E]/30 mb-3 flex justify-center">
                  <Search className="w-12 h-12" />
                </div>
                <div className="font-serif text-[20px] font-semibold mb-2">No sarees found</div>
                <div className="text-sm text-[#888888]">
                  Try different keywords like "silk", "red", "wedding"
                </div>
              </div>
            ) : (
              <div className="product-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4.5">
                {results.map((p) => renderGridCard(p))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
