import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, Heart, Home } from 'lucide-react';
import { ActivePage, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { API_URL } from '../../config';

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
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [isSearched, setIsSearched] = useState(false);

  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProductsList(data || []))
      .catch(err => console.error('SearchView product load error:', err));

    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data || []))
      .catch(err => console.error('SearchView category load error:', err));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setResults([]);
      setIsSearched(false);
      return;
    }

    const q = query.toLowerCase();

    // Generate matches for live autocomplete list
    const matched = productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q) ||
        (p.colour || '').toLowerCase().includes(q)
    );

    setSuggestions(matched.slice(0, 8));
  }, [query, productsList]);

  const executeSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    onAddRecentSearch(searchTerm);

    const q = searchTerm.toLowerCase();
    const matched = productsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q) ||
        (p.colour || '').toLowerCase().includes(q)
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

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-100 text-gray-900 font-bold p-0">
              {part}
            </mark>
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
    const isOutOfStock = p.stock === 0;
    const isLowStock = p.stock !== undefined && p.stock > 0 && p.stock <= 3;

    return (
      <div
        key={p.id}
        onClick={() => !isOutOfStock && onNavigate('product', String(p.id))}
        className={`grid-product-card bg-white rounded-xl overflow-hidden shadow-xs border border-[#E8E0D5] relative transition-all ${
          isOutOfStock ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
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
            className="grid-wishlist absolute top-2 right-2 w-7.5 h-7.5 bg-white/90 rounded-full flex items-center justify-center text-sm z-10 hover:scale-110 active:scale-125 transition-transform"
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
              className={`grid-cart-btn w-full border-1.5 text-[11px] font-semibold py-1.5 rounded-lg active:scale-98 transition-transform cursor-pointer ${
                isOutOfStock 
                  ? 'border-gray-300 text-gray-400 cursor-not-allowed'
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
              className={`grid-buy-btn w-full text-white text-[11px] font-semibold py-1.5 rounded-lg active:scale-98 transition-transform cursor-pointer ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
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

  return (
    <div id="page-search">
      {/* Search Header input bar */}
      <div className="search-page-bar flex items-center gap-2.5 p-2.5 px-4 bg-white border-b border-[#E8E0D5] sticky top-0 z-10 max-w-[430px] md:max-w-full mx-auto">
        <button
          className="search-back-btn text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
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
        <div className="search-input-wrap flex-1 flex items-center bg-[#F0E8DC] border border-[#E8E0D5] focus-within:border-[#C4601A] rounded-full p-2 px-3.5 gap-2 transition-colors">
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

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[1320px] mx-auto pt-4 pb-32">
        {/* State 1: Default/Empty prompt */}
        {!query && !isSearched && (
          <div id="search-default">
            {/* History logs */}
            <div className="search-section-label text-xs font-bold text-[#1A1A1A] p-4 px-0 uppercase tracking-wider">
              Recent Searches
            </div>
            <div className="search-history flex flex-col gap-1">
              {recentSearches.length === 0 ? (
                <span className="text-xs text-gray-400 font-serif">No recent search terms logged.</span>
              ) : (
                recentSearches.map((term, index) => (
                  <div
                    key={`${term}-${index}`}
                    className="search-history-item flex items-center justify-between py-2.5 px-3 hover:bg-[#FAF6F0] rounded-xl cursor-pointer transition-colors"
                  >
                    <span
                      className="text-xs font-semibold text-[#1A1A1A] flex-1"
                      onClick={() => executeSearch(term)}
                    >
                      {term}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecentSearch(index);
                      }}
                      className="text-gray-400 hover:text-[#C4601A]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Popular tags search */}
            {(categories.length > 0 || productsList.length > 0) && (
              <>
                <div className="search-section-label text-xs font-bold text-[#1A1A1A] p-4 px-0 uppercase tracking-wider mt-2">
                  Popular Categories
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(categories.length > 0
                    ? categories.map(c => c.name)
                    : Array.from(new Set(productsList.map(p => p.fabric || p.occasion).filter(Boolean)))
                  ).slice(0, 8).map((term) => (
                    <button
                      key={term}
                      onClick={() => executeSearch(term)}
                      className="bg-[#FAF6F0] text-xs text-[#C4601A] border border-[#C4601A]/20 hover:border-[#C4601A]/50 rounded-full px-3.5 py-1.5 font-bold cursor-pointer transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* State 2: Active input text typing (Autocomplete recommendations list) */}
        {query && !isSearched && (
          <div id="search-autocomplete" className="bg-white border border-[#E8E0D5] rounded-2xl shadow-xs divide-y divide-[#E8E0D5]">
            {suggestions.map((p) => (
              <div
                key={p.id}
                onClick={() => executeSearch(p.name)}
                className="autocomplete-item p-3.5 flex items-center gap-3 cursor-pointer hover:bg-[#FAF6F0]/30 transition-colors"
              >
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs font-medium text-gray-800">
                  {highlightText(p.name, query)}
                </span>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="p-6 text-center text-xs text-[#888888] font-serif">
                No autocomplete suggestions. Press enter to search catalog.
              </div>
            )}
          </div>
        )}

        {/* State 3: Search results grid */}
        {isSearched && (
          <div id="search-results">
            <div className="search-section-label text-xs font-bold text-[#1A1A1A] pb-4 px-0 uppercase tracking-wider">
              Search Results ({results.length})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((p) => renderGridCard(p))}
            </div>
            {results.length === 0 && (
              <div className="py-16 text-center text-gray-500 font-serif text-sm">
                No saree matching "{query}" found in catalog. Try adjusting terms.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

