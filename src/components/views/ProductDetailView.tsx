import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Heart, RefreshCw, Star, Play, BookOpen, X, Globe, Home, ShoppingCart, Share2, Check } from 'lucide-react';
import { ActivePage, Product, Review, Category, UserProfile } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { API_URL, SITE_URL } from '../../config';

interface ProductDetailViewProps {
  productId: number;
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string) => void;
  onBuyNow: (id: number, colour?: string, directProduct?: Product) => void;
  wishlist: number[];
  cartCount: number;
  token: string | null;
  user: UserProfile | null;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigate,
  onBack,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  wishlist,
  cartCount,
  token,
  user
}) => {
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColour, setSelectedColour] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [showReelPlayer, setShowReelPlayer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);

  // Touch swipe tracking refs (populated values used after mediaItems is computed)
  const touchStartX = React.useRef<number>(0);
  const touchStartY = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleShare = async () => {
    if (!p) return;
    const shareUrl = `${SITE_URL}/?product=${p.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${p.name} | Sneh Sarees`,
          text: `Check out ${p.name} on Sneh Sarees: ${shareUrl}`,
          url: shareUrl
        });
        return;
      } catch (e) {
        // user cancelled or fallback
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  // Review states (read-only — writing happens in My Orders)
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  const fetchReviews = () => {
    fetch(`${API_URL}/api/reviews/product/${productId}`)
      .then((res) => res.json())
      .then((data) => setReviewsList(data || []))
      .catch((err) => console.error('Error loading reviews:', err));
  };

  useEffect(() => {
    setLoading(true);
    setActiveMediaIndex(0);
    setCategoryInfo(null);
    fetch(`${API_URL}/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setP(data);
        const initialColour = data.colour || (data.variants && data.variants[0]?.colour) || '';
        setSelectedColour(initialColour);
        setDisplayImage(data.image || (data.variants && data.variants[0]?.image) || '');
        setLoading(false);
        if (data.categoryId) {
          fetch(`${API_URL}/api/categories`)
            .then((r) => r.json())
            .then((cats) => {
              if (Array.isArray(cats)) {
                const found = cats.find((c) => c.id === data.categoryId);
                if (found) setCategoryInfo(found);
              }
            })
            .catch((err) => console.error('Error fetching category:', err));

          // Fetch suggested products from same category
          fetch(`${API_URL}/api/products`)
            .then((r) => r.json())
            .then((allProducts: Product[]) => {
              if (Array.isArray(allProducts)) {
                const suggestions = allProducts
                  .filter((pr) => pr.categoryId === data.categoryId && pr.id !== data.id)
                  .slice(0, 8);
                setSuggestedProducts(suggestions);
              }
            })
            .catch((err) => console.error('Error fetching suggestions:', err));
        }
        // Save current product to recently viewed in localStorage
        try {
          const stored = localStorage.getItem('sneh_recently_viewed');
          const ids: number[] = stored ? JSON.parse(stored) : [];
          const filtered = ids.filter((id) => id !== data.id);
          const updated = [data.id, ...filtered].slice(0, 12); // keep last 12
          localStorage.setItem('sneh_recently_viewed', JSON.stringify(updated));
        } catch {}
      })
      .catch(() => {
        setP(null);
        setLoading(false);
      });

    // Load recently viewed products from localStorage (excluding current)
    try {
      const stored = localStorage.getItem('sneh_recently_viewed');
      const ids: number[] = stored ? JSON.parse(stored) : [];
      const otherIds = ids.filter((id) => id !== productId);
      if (otherIds.length > 0) {
        fetch(`${API_URL}/api/products`)
          .then((r) => r.json())
          .then((allProducts: Product[]) => {
            if (Array.isArray(allProducts)) {
              // Preserve the recently-viewed order
              const map = new Map(allProducts.map((pr) => [pr.id, pr]));
              const recent = otherIds
                .map((id) => map.get(id))
                .filter((pr): pr is Product => !!pr)
                .slice(0, 8);
              setRecentlyViewedProducts(recent);
            }
          })
          .catch(() => {});
      }
    } catch {}

    fetchReviews();
  }, [productId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center text-xs text-gray-500 gap-2">
        <RefreshCw className="w-5 h-5 text-[#C4601A] animate-spin" />
        Syncing Saree details...
      </div>
    );
  }

  if (!p) {
    return (
      <div className="p-10 text-center font-serif bg-[#FAF6F0] min-h-screen flex flex-col items-center justify-center">
        <h3 className="text-lg">Saree collection not found</h3>
        <button onClick={() => onNavigate('home')} className="mt-4 text-[#C4601A] underline font-bold cursor-pointer">
          Go back Home
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(p.id);

  // Unified list of all saree photos (Main saree image + all variant/angle photos)
  const photoOptions: { name: string; image: string }[] = [];
  const registeredPhotoUrls = new Set<string>();

  // If main product image exists, add it as first photo
  if (p.image && p.image.trim()) {
    const key = p.image.trim().split('?')[0].toLowerCase();
    registeredPhotoUrls.add(key);
    photoOptions.push({
      name: p.colour && p.colour.trim() ? p.colour.trim() : 'Angle 1',
      image: p.image.trim()
    });
  }

  // Add all variants / angle photos
  if (p.variants && Array.isArray(p.variants)) {
    p.variants.forEach((v) => {
      if (v.image && v.image.trim()) {
        const key = v.image.trim().split('?')[0].toLowerCase();
        if (!registeredPhotoUrls.has(key)) {
          registeredPhotoUrls.add(key);
          const label = v.colour && v.colour.trim() ? v.colour.trim() : `Angle ${photoOptions.length + 1}`;
          photoOptions.push({ name: label, image: v.image.trim() });
        }
      }
    });
  }

  const simulatedReviews = [
    { name: 'Priya S.', stars: 5, text: 'Absolutely beautiful! The fabric quality is amazing.' },
    { name: 'Meena K.', stars: 5, text: 'Fast delivery, exactly as shown. Perfect for the occasion.' },
    { name: 'Ritu D.', stars: 4, text: 'Good quality saree, blouse piece is well made too.' }
  ];

  const isOutOfStock = p.stock === 0;
  const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  const isLowStock = effectivePrice >= 2000 && p.stock !== undefined && p.stock > 0 && p.stock <= 3;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(p.id, selectedColour);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onBuyNow(p.id, selectedColour, p);
  };

  const getEmbedUrl = (url: string): { type: 'youtube' | 'instagram' | 'direct'; url: string } => {
    if (!url) return { type: 'direct', url: '' };
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const vidId = url.includes('watch?v=')
        ? url.split('watch?v=')[1].split('&')[0]
        : url.split('/').pop()?.split('?')[0] || '';
      return { type: 'youtube', url: `https://www.youtube.com/embed/${vidId}?autoplay=1` };
    }
    if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
      const parts = url.split('/reel/');
      if (parts.length > 1) {
        const reelId = parts[1].split('/')[0].split('?')[0];
        return { type: 'instagram', url: `https://www.instagram.com/reel/${reelId}/embed` };
      }
      const pParts = url.split('/p/');
      if (pParts.length > 1) {
        const postId = pParts[1].split('/')[0].split('?')[0];
        return { type: 'instagram', url: `https://www.instagram.com/p/${postId}/embed` };
      }
    }
    return { type: 'direct', url };
  };

  const mediaItems: { type: 'image' | 'video'; url: string }[] = [];
  photoOptions.forEach((opt) => {
    mediaItems.push({ type: 'image', url: opt.image });
  });

  const currentImageUrl = displayImage || (mediaItems[activeMediaIndex]?.url) || p.image || '';
  const currentMedia: { type: 'image' | 'video'; url: string } = { type: 'image', url: currentImageUrl };

  // handleTouchEnd defined here (after mediaItems & photoOptions) to properly access them
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mediaItems.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; // not a horizontal swipe
    const newIndex = dx < 0
      ? Math.min(activeMediaIndex + 1, mediaItems.length - 1)  // swipe left → next
      : Math.max(activeMediaIndex - 1, 0);                      // swipe right → prev
    setActiveMediaIndex(newIndex);
    setDisplayImage(mediaItems[newIndex].url);
    if (photoOptions[newIndex]) setSelectedColour(photoOptions[newIndex].name);
  };

  return (
    <div id="page-product" className="min-h-screen pb-[100px] bg-[#FAF6F0]/80">
      {/* Top Bar Navigation */}
      <div className="pd-top-bar sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between px-4 md:px-7 lg:px-12 z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <div className="flex items-center gap-1.5">
          <button
            className="pd-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
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
        <div className="pd-nav-title font-serif text-base md:text-lg font-bold text-[#1A1A1A]">
          Product Details
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="pd-share text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full cursor-pointer relative transition-colors"
            onClick={handleShare}
            title="Share Saree Link"
          >
            {copiedLink ? <Check className="w-[20px] h-[20px] text-emerald-600" /> : <Share2 className="w-[20px] h-[20px] text-[#1A1A1A]" />}
            {copiedLink && (
              <span className="absolute -bottom-7 right-0 bg-[#1A1A1A] text-white text-[10px] font-sans font-medium px-2 py-0.5 rounded shadow whitespace-nowrap z-30">
                Link copied!
              </span>
            )}
          </button>
          <button
            className="pd-wishlist text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full cursor-pointer"
            onClick={() => onToggleWishlist(p.id)}
            title="Wishlist"
          >
            <Heart
              className={`w-[22px] h-[22px] ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-[#1A1A1A]'}`}
            />
          </button>
          <button
            className="pd-cart text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full relative cursor-pointer"
            onClick={() => onNavigate('cart')}
            title="Cart"
          >
            <ShoppingCart className="w-[22px] h-[22px]" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#C4601A] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto bg-white border border-[#E8E0D5] md:my-6 md:rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Media showcase */}
        <div
          className="pd-media-section bg-[#FAF6F0] relative h-[380px] md:h-[480px] lg:h-[550px] overflow-hidden border-b md:border-b-0 md:border-r border-[#E8E0D5]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {currentMedia.type === 'video' ? (
            (currentMedia.url.includes('youtube.com') || currentMedia.url.includes('youtu.be')) ? (
              <iframe
                src={`https://www.youtube.com/embed/${
                  currentMedia.url.includes('watch?v=')
                    ? currentMedia.url.split('watch?v=')[1].split('&')[0]
                    : currentMedia.url.split('/').pop()?.split('?')[0] || ''
                }?autoplay=1&mute=1&loop=1&playlist=${
                  currentMedia.url.includes('watch?v=')
                    ? currentMedia.url.split('watch?v=')[1].split('&')[0]
                    : currentMedia.url.split('/').pop()?.split('?')[0] || ''
                }`}
                title="Product video reel"
                className="w-full h-full aspect-video border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <video
                src={currentMedia.url}
                autoPlay
                muted
                controls
                loop
                playsInline
                className="w-full h-full object-contain bg-black"
              />
            )
          ) : (
            <>
              <SareeSwatch id={p.id} imageUrl={currentMedia.url} />
              {/* Invisible overlay to reliably capture horizontal touch-swipe events */}
              <div
                className="absolute inset-0 z-[5]"
                style={{ touchAction: 'pan-y' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            </>
          )}
          
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10">
              <span className="bg-red-700 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                OUT OF STOCK
              </span>
            </div>
          )}

          {isLowStock && !isOutOfStock && (
            <div className="absolute bottom-4 left-4 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-md animate-pulse z-10">
              Only {p.stock} Left in Stock!
            </div>
          )}

          {mediaItems.length > 1 && (
            <div className="absolute bottom-4 left-4 right-16 flex gap-2 overflow-x-auto py-1 z-20 no-scroll" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {mediaItems.map((item, idx) => {
                const active = displayImage 
                  ? (displayImage === item.url || displayImage.split('?')[0].split('/').pop() === item.url.split('?')[0].split('/').pop())
                  : activeMediaIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveMediaIndex(idx);
                      setDisplayImage(item.url);
                      if (photoOptions[idx]) {
                        setSelectedColour(photoOptions[idx].name);
                      }
                    }}
                    className={`w-10 h-10 rounded-lg border-2 bg-white overflow-hidden relative shrink-0 transition-all cursor-pointer ${
                      active ? 'border-[#C4601A] scale-105 shadow-sm ring-2 ring-[#C4601A]/40' : 'border-white/80 hover:border-white opacity-85 hover:opacity-100'
                    }`}
                  >
                    <img src={item.url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-20">
            {activeMediaIndex + 1} / {mediaItems.length}
          </div>
        </div>

        {/* Right Side: Info and Attributes */}
        <div className="pd-info-section p-5 md:p-8 flex flex-col justify-start pt-5 md:pt-6">
          {/* Fabric + rating badges — only shown when content exists */}
          {((p.fabric && p.fabric.trim()) || reviewsList.length > 0) && (
            <div className="pd-meta flex items-center gap-2 mb-1.5">
              {p.fabric && p.fabric.trim() && (
                <span className="pd-fabric-tag bg-[#FAF6F0] border border-[#E8E0D5] text-[#C4601A] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {p.fabric}
                </span>
              )}
              {reviewsList.length > 0 && (
                <span className="pd-rating bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5">
                  ★ {(reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)}
                </span>
              )}
            </div>
          )}

          <h1 className="pd-title font-serif text-2xl md:text-3xl font-bold text-[#111111] leading-tight mb-2">
            {p.name}
          </h1>

          <div className="pd-price-wrap flex items-baseline gap-2.5 mb-5 border-b border-[#E8E0D5] pb-4 flex-wrap">
            {p.discountPrice && p.discountPrice > 0 ? (
              <>
                <span className="pd-current-price text-2xl font-extrabold text-[#C4601A] font-sans">
                  ₹{p.discountPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-gray-600 font-semibold line-through font-sans">
                  ₹{p.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="pd-current-price text-2xl font-extrabold text-[#C4601A] font-sans">
                ₹{p.price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs text-[#333333] font-bold font-sans">MRP (Incl. of all taxes)</span>
          </div>

          {/* More Photos selection list */}
          {photoOptions.length > 1 && (
            <div className="mb-5">
              <div className="pd-section-label text-xs font-bold text-[#222222] uppercase tracking-wider mb-2.5">
                More Photos:
              </div>
              <div className="flex gap-3.5 mb-1 flex-wrap">
                {photoOptions.map((c, idx) => {
                  const active = displayImage 
                    ? (displayImage === c.image || displayImage.split('?')[0].split('/').pop() === c.image.split('?')[0].split('/').pop())
                    : (selectedColour && selectedColour.toLowerCase() === c.name.toLowerCase()) || activeMediaIndex === idx;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5">
                      <button
                        className={`relative w-12 h-12 rounded-xl border-2 transition-all cursor-pointer overflow-hidden ${
                          active ? 'border-[#C4601A] scale-105 shadow-md ring-2 ring-[#C4601A]/30' : 'border-[#E8E0D5] hover:border-gray-400'
                        }`}
                        onClick={() => {
                          setSelectedColour(c.name);
                          setDisplayImage(c.image);
                          setActiveMediaIndex(idx);
                        }}
                        title={c.name}
                      >
                        {c.image ? (
                          <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-[#C4601A] to-[#F5E4BC]" />
                        )}
                        {active && (
                          <div className="absolute inset-0 bg-[#C4601A]/35 flex items-center justify-center">
                            <span className="text-white text-xs font-bold drop-shadow">✓</span>
                          </div>
                        )}
                      </button>
                      <span className={`text-[10px] font-semibold leading-none ${active ? 'text-[#C4601A] font-bold' : 'text-[#666666]'}`}>
                        {c.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Inventory warnings inside page layout */}
          {isOutOfStock ? (
            <div className="bg-red-50 text-red-700 border border-red-200 py-3 px-4 rounded-xl text-xs font-semibold mb-5">
              ⚠️ This exquisite saree is currently sold out. Contact support for replenishment requests.
            </div>
          ) : isLowStock ? (
            <div className="bg-amber-50 text-amber-800 border border-amber-200 py-3 px-4 rounded-xl text-xs font-semibold mb-5 animate-pulse">
              🔥 Demand is high: only {p.stock} items remaining in our immediate catalog!
            </div>
          ) : null}

          {/* Blouse alert bubble - temporarily hidden as requested */}
          {/*
          {p.blouse ? (
            <div className="pd-blouse-info bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold mb-5 flex items-center gap-1.5">
              <span>✓</span> Blouse Piece Included
            </div>
          ) : (
            <div className="pd-blouse-info bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] py-2.5 px-4 rounded-lg text-xs md:text-sm font-semibold mb-5 flex items-center gap-1.5">
              <span>ℹ</span> Blouse Piece Not Included
            </div>
          )}
          */}



          {/* Description — only shown if content exists */}
          {p.desc && p.desc.trim() && (
            <>
              <div className="pd-section-label text-xs font-bold text-[#555555] uppercase tracking-wider mb-2">
                Description
              </div>
              <p className="pd-description text-[#4A4A4A] text-sm md:text-base leading-relaxed mb-6 font-serif">
                {p.desc}
              </p>
            </>
          )}
        </div>

        {/* Trending Reel Section */}
        {p.reelUrl && (
          <div className="pd-reel-section px-5 md:px-8 pb-6 col-span-1 md:col-span-2 border-t border-[#E8E0D5] pt-6 mt-4">
            <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-3.5">
              Trending Reel
            </h3>
            <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E8E0D5] flex flex-col md:flex-row gap-5 items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-[#C4601A] uppercase tracking-wider mb-1">Watch It In Action</p>
                <p className="text-xs text-gray-500 font-serif leading-relaxed mb-4">
                  See the elegant drape, natural sheen, and fine movements of this saree captured on video.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setShowReelPlayer(true)}
                    className="bg-[#C4601A] hover:bg-[#A0450F] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Watch Reel Video
                  </button>
                  <a
                    href={p.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#C4601A]/35 text-[#C4601A] hover:bg-[#C4601A]/5 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {p.reelUrl.includes('instagram.com') ? 'View on Instagram' : p.reelUrl.includes('youtube.com') ? 'View on YouTube' : 'Open Link'}
                  </a>
                </div>
              </div>
              <div className="w-full md:w-36 h-36 rounded-xl overflow-hidden bg-black border border-[#E8E0D5] shrink-0 relative cursor-pointer flex items-center justify-center group" onClick={() => setShowReelPlayer(true)}>
                <img src={p.image} alt="Reel preview" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 text-[#C4601A] fill-[#C4601A] ml-0.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Inline Video Player Drawer/Modal */}
            {showReelPlayer && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]" onClick={() => setShowReelPlayer(false)}>
                <div className="bg-black rounded-3xl max-w-[360px] w-full border border-white/10 overflow-hidden relative shadow-2xl flex flex-col h-[80vh] max-h-[600px]" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setShowReelPlayer(false)}
                    className="absolute top-4 right-4 z-55 p-1.5 bg-black/40 hover:bg-black/60 rounded-full text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-full h-full flex items-center justify-center relative bg-black">
                    {(() => {
                      const embedInfo = getEmbedUrl(p.reelUrl);
                      if (embedInfo.type === 'youtube') {
                        return (
                          <iframe
                            src={embedInfo.url}
                            title="Reel Playback"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      } else if (embedInfo.type === 'instagram') {
                        return (
                          <iframe
                            src={embedInfo.url}
                            title="Instagram Reel Playback"
                            className="w-full h-full border-0 bg-white"
                            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      } else {
                        return (
                          <video
                            src={embedInfo.url}
                            autoPlay
                            controls
                            loop
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        );
                      }
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer review feed — only shown when there are actual reviews */}
        {reviewsList.length > 0 && (
          <div className="pd-reviews-section px-5 md:px-8 pb-4 col-span-1 md:col-span-2 border-t border-[#E8E0D5] pt-6 mt-4">
            <h3 className="pd-reviews-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A] mb-4">
              Customer Reviews ({reviewsList.length})
            </h3>

            {/* Star summary row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8E0D5] flex items-center gap-4">
                <span className="text-4xl font-extrabold text-[#C4601A] font-sans">
                  {(reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)}
                </span>
                <div>
                  <div className="flex text-amber-500 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;
                      return <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />;
                    })}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{reviewsList.length} verified ratings</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] flex flex-col justify-center space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter(r => Math.round(r.rating) === stars).length;
                  const pct = Math.round((count / reviewsList.length) * 100);
                  return (
                    <div key={stars} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-10 text-right font-medium">{stars} ★</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-7 text-right text-gray-500">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
              {reviewsList.map((r) => (
                <div key={r.id} className="pd-review-card bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-3.5">
                  <div className="pd-review-header flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="pd-review-avatar w-8 h-8 rounded-full bg-[#C4601A] flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                        {(r.userUsername || r.userName || 'A')[0]}
                      </div>
                      <div>
                        <h5 className="pd-reviewer-name text-[13px] font-semibold text-[#1A1A1A] leading-tight">
                          {r.userUsername ? `@${r.userUsername}` : (r.userName || 'Anonymous Buyer')}
                        </h5>
                        <div className="pd-review-stars text-amber-500 flex mt-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    {r.isVerified && (
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Verified Buyer</span>
                    )}
                  </div>
                  <p className="pd-review-text text-xs text-[#4A4A4A] leading-relaxed italic">
                    "{r.body || 'Good product.'}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Write a Review CTA — always visible regardless of review count */}
        <div className="px-5 md:px-8 pb-6 col-span-1 md:col-span-2 border-t border-[#E8E0D5] pt-5 mt-2">
          <div className="bg-[#FAF6F0] rounded-2xl border border-[#E8E0D5] p-5 flex flex-col sm:flex-row items-center gap-4">
            <span className="text-3xl shrink-0">⭐</span>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-bold text-[#1A1A1A] mb-1">Bought this saree?</p>
              <p className="text-xs text-[#888888] leading-relaxed">
                You can write, edit or delete your review from the <strong>My Orders</strong> section after your order is delivered.
              </p>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="shrink-0 border border-[#C4601A] text-[#C4601A] font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-[#C4601A] hover:text-white transition-all cursor-pointer"
            >
              Go to My Orders
            </button>
          </div>
        </div>
      </div>

      {/* ── Suggested Products ─────────────────────────────────────── */}
      {suggestedProducts.length > 0 && (
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-8">
          <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1A1A] mb-4">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {suggestedProducts.map((sp) => {
              const spPrice = sp.discountPrice && sp.discountPrice > 0 ? sp.discountPrice : sp.price;
              const spDiscount = sp.discountPrice && sp.discountPrice > 0
                ? Math.round(((sp.price - sp.discountPrice) / sp.price) * 100)
                : 0;
              return (
                <div
                  key={sp.id}
                  className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => onNavigate('product', String(sp.id))}
                >
                  <div className="relative h-44 md:h-52 bg-[#FAF6F0] overflow-hidden">
                    {sp.image ? (
                      <img
                        src={sp.image}
                        alt={sp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F5E4BC] to-[#C4601A]/30" />
                    )}
                    {spDiscount > 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        {spDiscount}% OFF
                      </span>
                    )}
                    {sp.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-red-700 px-2 py-0.5 rounded-full">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[#1A1A1A] leading-snug line-clamp-2 mb-1.5 font-serif">{sp.name}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-[#C4601A]">₹{spPrice.toLocaleString('en-IN')}</span>
                      {spDiscount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through">₹{sp.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recently Viewed ──────────────────────────────────────── */}
      {recentlyViewedProducts.length > 0 && (
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 pb-6">
          <h3 className="font-serif text-lg md:text-xl font-bold text-[#1A1A1A] mb-4">
            Recently Viewed
          </h3>
          {/* Horizontal scroll strip on mobile, wrap on desktop */}
          <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible no-scroll">
            {recentlyViewedProducts.map((rv) => {
              const rvPrice = rv.discountPrice && rv.discountPrice > 0 ? rv.discountPrice : rv.price;
              const rvDiscount = rv.discountPrice && rv.discountPrice > 0
                ? Math.round(((rv.price - rv.discountPrice) / rv.price) * 100)
                : 0;
              return (
                <div
                  key={rv.id}
                  className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group shrink-0 w-40 md:w-auto"
                  onClick={() => onNavigate('product', String(rv.id))}
                >
                  <div className="relative h-36 md:h-44 bg-[#FAF6F0] overflow-hidden">
                    {rv.image ? (
                      <img
                        src={rv.image}
                        alt={rv.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#F5E4BC] to-[#C4601A]/30" />
                    )}
                    {rvDiscount > 0 && (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
                        {rvDiscount}% OFF
                      </span>
                    )}
                    {rv.stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold bg-red-700 px-2 py-0.5 rounded-full">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-[#1A1A1A] leading-snug line-clamp-2 mb-1 font-serif">{rv.name}</p>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-xs font-extrabold text-[#C4601A]">₹{rvPrice.toLocaleString('en-IN')}</span>
                      {rvDiscount > 0 && (
                        <span className="text-[9px] text-gray-400 line-through">₹{rv.price.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION TOOLBAR */}
      <div className="pd-sticky-bar fixed bottom-0 left-0 right-0 bg-white border-t border-[#E8E0D5] p-2.5 px-3 md:px-9 flex gap-2 items-center z-50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] safe-pb">
        <button
          disabled={isOutOfStock}
          className={`pd-add-cart flex-1 border-2 text-xs md:text-sm font-bold py-3.5 rounded-xl active:scale-98 transition-all cursor-pointer ${
            isOutOfStock 
              ? 'border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-[#C4601A] text-[#C4601A] hover:bg-[#C4601A]/4'
          }`}
          onClick={handleAddToCart}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
        <button
          disabled={isOutOfStock}
          className={`pd-buy-now flex-1 text-xs md:text-sm font-bold py-3.5 rounded-xl active:scale-98 transition-all cursor-pointer ${
            isOutOfStock
              ? 'bg-gray-300 text-gray-400 cursor-not-allowed'
              : 'bg-[#C4601A] text-white hover:bg-[#FFF0E8]'
          }`}
          onClick={handleBuyNow}
        >
          {isOutOfStock ? 'Sold Out' : 'Buy Now'}
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

