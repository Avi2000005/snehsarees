import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Heart, Star, Play, BookOpen, X, Globe, Home, ShoppingCart, Share2, Check, Instagram, Copy, Plus, Minus, MapPin, Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, ChevronLeft, ChevronRight, Camera, UploadCloud, ImageIcon, Loader2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { ActivePage, Product, Review, Category, UserProfile, StoreOffer, StoreSettings } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { ProductThumbnail } from '../ProductThumbnail';
import { API_URL, SITE_URL } from '../../config';
import { pixelViewContent, pixelAddToCart } from '../MetaPixel';
import { ProductDescription } from '../ProductDescription';
import { stripHtmlToPlainText, sanitizeHtml } from '../../utils/sanitizeHtml';
import { useProduct } from '../../catalog-cache';
import ProductPerks, { Offer } from '../ProductPerks';

// Helper: inject/update dynamic SEO meta tags for the current product
function updateProductSEO(p: Product) {
  const productUrl = `${SITE_URL}/?product=${p.id}`;
  const imageUrl = p.image || `${SITE_URL}/logo.jpg`;
  const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
  const title = `${p.name} | Best Sarees Online - Sneh Sarees`;
  const cleanDesc = stripHtmlToPlainText(p.desc);
  const description = cleanDesc
    ? `${cleanDesc.slice(0, 140)}... Buy authentic ${p.fabric || 'Kota Doria'} sarees online with zari border at Sneh Sarees.`
    : `Buy ${p.name} online - authentic ${p.fabric || 'Kota Doria handloom'} saree from Sneh Sarees, Kota Rajasthan. ₹${effectivePrice.toLocaleString('en-IN')} with pan-India free delivery.`;

  // Page title
  document.title = title;

  // Helper to set/create a meta tag
  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[name="title"]', 'content', title);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[property="og:url"]', 'content', productUrl);
  setMeta('meta[property="og:image"]', 'content', imageUrl);
  setMeta('meta[property="og:image:alt"]', 'content', `${p.name} - Sneh Sarees`);
  setMeta('meta[property="og:type"]', 'content', 'product');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('meta[name="twitter:image"]', 'content', imageUrl);
  setMeta('meta[name="twitter:url"]', 'content', productUrl);

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = productUrl;

  // Product JSON-LD schema
  const schemaId = 'product-jsonld';
  let schemaEl = document.getElementById(schemaId);
  if (!schemaEl) {
    schemaEl = document.createElement('script');
    schemaEl.id = schemaId;
    (schemaEl as HTMLScriptElement).type = 'application/ld+json';
    document.head.appendChild(schemaEl);
  }
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: description,
    image: imageUrl,
    url: productUrl,
    sku: p.code || String(p.id),
    brand: { '@type': 'Brand', name: 'Sneh Sarees' },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: effectivePrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: (p.stock === 0)
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Sneh Sarees' }
    }
  };
  if (p.fabric) {
    schema.material = p.fabric;
  }
  schemaEl.textContent = JSON.stringify(schema);
}

// Restore default SEO when leaving product page
function restoreDefaultSEO() {
  document.title = 'Best Sarees Online | Best Kota Doria Sarees for Women - Sneh Sarees';
  const setMeta = (selector: string, value: string) => {
    const el = document.querySelector(selector) as HTMLMetaElement | null;
    if (el) el.setAttribute('content', value);
  };
  setMeta('meta[name="description"]', 'Buy the best sarees online at Sneh Sarees. Authentic Kota Doria sarees, Rajasthani handloom cotton sarees with zari border, lightweight daily & festive sarees for women with free shipping across India.');
  setMeta('meta[property="og:title"]', 'Best Sarees Online | Best Kota Doria Sarees for Women - Sneh Sarees');
  setMeta('meta[property="og:type"]', 'website');
  setMeta('meta[property="og:url"]', SITE_URL + '/');
  setMeta('meta[property="og:image"]', SITE_URL + '/logo.jpg');
  setMeta('meta[name="twitter:title"]', 'Best Sarees Online | Best Kota Doria Sarees for Women - Sneh Sarees');
  setMeta('meta[name="twitter:url"]', SITE_URL + '/');
  setMeta('meta[name="twitter:image"]', SITE_URL + '/logo.jpg');
  const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (canonical) canonical.href = SITE_URL + '/';
  const schemaEl = document.getElementById('product-jsonld');
  if (schemaEl) schemaEl.remove();
}

interface ProductDetailViewProps {
  productId: number;
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  onToggleWishlist: (id: number) => void;
  onAddToCart: (id: number, colour?: string, qty?: number) => void;
  onBuyNow: (id: number, colour?: string, directProduct?: Product, qty?: number) => void;
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
  // useProduct: looks up catalog cache first, falls back to API fetch only for direct-link opens
  const { product: p, loading } = useProduct(productId);
  const [selectedColour, setSelectedColour] = useState('');
  const [displayImage, setDisplayImage] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [showReelPlayer, setShowReelPlayer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [offers, setOffers] = useState<StoreOffer[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [shippingPolicy, setShippingPolicy] = useState<{ content: string; title: string } | null>(null);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    description: true,
    return: false,
    shipping: false,
    details: false
  });
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({ hours: 0, minutes: 0, seconds: 0 });
  const [deliveryDateStr, setDeliveryDateStr] = useState('');

  // Instagram "Shop Now" share state
  const [showInstaModal, setShowInstaModal] = useState(false);
  const [instaCopied, setInstaCopied] = useState(false);

  // Gallery image natural dimensions cache for adaptive height and CLS elimination
  const [imgNaturalDims, setImgNaturalDims] = useState<Record<string, { width: number; height: number }>>({});
  const galleryScrollRef = React.useRef<HTMLDivElement>(null);

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

  // Review states & form (Anyone can review, name asked and saved, images supported)
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState(user?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<Array<{ file?: File; preview: string; url?: string }>>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState<{ url: string; userName: string; index: number; total: number; allUrls: string[] } | null>(null);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(5);

  // Reset to 5 reviews when changing products
  useEffect(() => {
    setVisibleReviewsCount(5);
  }, [productId]);

  // Sort reviews in descending order: higher stars (ratings) first, then latest date first
  const sortedReviews = React.useMemo(() => {
    return [...reviewsList].sort((a, b) => {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [reviewsList]);

  // Only render top 5 reviews initially for maximum page speed and smooth performance
  const displayedReviews = sortedReviews.slice(0, visibleReviewsCount);

  // Sync reviewer name if user object becomes available
  useEffect(() => {
    if (user?.name && !reviewName) {
      setReviewName(user.name);
    }
  }, [user?.name]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - reviewPhotos.length;
    if (remainingSlots <= 0) {
      setReviewError('You can upload up to 5 photos per review.');
      return;
    }
    const filesToAdd = files.slice(0, remainingSlots);
    const newPhotos = filesToAdd.map((file) => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setReviewPhotos((prev) => [...prev, ...newPhotos]);
    setReviewError('');
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setReviewPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    const trimmedName = reviewName.trim();
    if (!trimmedName) {
      setReviewError('Please enter your name.');
      return;
    }
    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a star rating (1-5 stars).');
      return;
    }

    setSubmittingReview(true);
    try {
      let uploadedImageUrls: string[] = [];

      // If photos were chosen, upload to backend or convert to base64
      if (reviewPhotos.length > 0) {
        const formData = new FormData();
        let hasFilesToUpload = false;
        reviewPhotos.forEach((item) => {
          if (item.file) {
            formData.append('images', item.file);
            hasFilesToUpload = true;
          } else if (item.url) {
            uploadedImageUrls.push(item.url);
          }
        });

        if (hasFilesToUpload) {
          try {
            const uploadRes = await fetch(`${API_URL}/api/reviews/upload`, {
              method: 'POST',
              body: formData,
            });
            if (uploadRes.ok) {
              const uploadData = await uploadRes.json();
              if (uploadData.urls && Array.isArray(uploadData.urls)) {
                uploadedImageUrls = [...uploadedImageUrls, ...uploadData.urls];
              }
            } else {
              for (const item of reviewPhotos) {
                if (item.file && !item.url) {
                  const b64 = await fileToBase64(item.file);
                  uploadedImageUrls.push(b64);
                }
              }
            }
          } catch (uploadErr) {
            console.warn('Review photo upload network fallback:', uploadErr);
            for (const item of reviewPhotos) {
              if (item.file && !item.url) {
                const b64 = await fileToBase64(item.file);
                uploadedImageUrls.push(b64);
              }
            }
          }
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId,
          userName: trimmedName,
          rating: reviewRating,
          body: reviewBody.trim(),
          images: uploadedImageUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review. Please try again.');
        return;
      }

      setReviewSuccess('Thank you for your review! Your review and photos are now live.');
      setReviewBody('');
      setReviewPhotos([]);
      setReviewRating(5);
      fetchReviews();

      setTimeout(() => {
        setReviewSuccess('');
        setShowReviewForm(false);
      }, 2500);
    } catch (err: any) {
      setReviewError(err?.message || 'Network error while submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const fetchReviews = () => {
    fetch(`${API_URL}/api/reviews/product/${productId}`)
      .then((res) => res.json())
      .then((data) => setReviewsList(data || []))
      .catch((err) => console.error('Error loading reviews:', err));
  };

  // When p resolves from useProduct (cache or fetch), set up derived state
  useEffect(() => {
    setActiveMediaIndex(0);
    setCategoryInfo(null);
    if (!p) return;

    const variantsList = (p.variants && Array.isArray(p.variants)) ? p.variants.filter(v => v.colour && v.image) : [];
    const initialColour = (variantsList[0]?.colour) || p.colour || '';
    setSelectedColour(initialColour);

    const initialGalleryImg = (p.galleryImages && Array.isArray(p.galleryImages) && p.galleryImages[0])
      || (variantsList[0]?.image)
      || p.image
      || '';
    setDisplayImage(initialGalleryImg);

    if (p.categoryId) {
      // Resolve category and suggestions from catalog cache (no extra fetch needed)
      import('../../catalog-cache').then(({ getCatalog }) => {
        getCatalog().then(catalog => {
          const found = catalog.categories.find(c => c.id === p.categoryId);
          if (found) setCategoryInfo(found);
          const suggestions = catalog.products
            .filter(pr => pr.categoryId === p.categoryId && pr.id !== p.id)
            .slice(0, 8);
          setSuggestedProducts(suggestions);
        });
      });
    }

    // Save current product to recently viewed in localStorage
    try {
      const stored = localStorage.getItem('sneh_recently_viewed');
      const ids: number[] = stored ? JSON.parse(stored) : [];
      const filtered = ids.filter((id) => id !== p.id);
      const updated = [p.id, ...filtered].slice(0, 12);
      localStorage.setItem('sneh_recently_viewed', JSON.stringify(updated));
    } catch {}

    // Load recently viewed products from catalog cache
    try {
      const stored = localStorage.getItem('sneh_recently_viewed');
      const ids: number[] = stored ? JSON.parse(stored) : [];
      const otherIds = ids.filter((id) => id !== productId);
      if (otherIds.length > 0) {
        import('../../catalog-cache').then(({ getCatalog }) => {
          getCatalog().then(catalog => {
            const map = new Map(catalog.products.map(pr => [pr.id, pr]));
            const recent = otherIds
              .map(id => map.get(id))
              .filter((pr): pr is Product => !!pr)
              .slice(0, 8);
            setRecentlyViewedProducts(recent);
          });
        });
      }
    } catch {}

    fetchReviews();
    setQuantity(1);
  }, [p, productId]);

  // Fetch dynamic active offers and business details via API
  useEffect(() => {
    fetch(`${API_URL}/api/offers`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setOffers(Array.isArray(data) ? data : []))
      .catch(() => setOffers([]));

    fetch(`${API_URL}/api/settings`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data) => setSettings(data && typeof data === 'object' ? (data as StoreSettings) : null))
      .catch(() => setSettings(null));

    fetch(`${API_URL}/api/policies/shipping-policy`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setShippingPolicy(data))
      .catch(() => setShippingPolicy(null));
  }, []);

  // Real-time countdown timer for order dispatch notification
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 7);
      setDeliveryDateStr(targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Inject dynamic SEO meta tags when product is loaded; restore on unmount
  useEffect(() => {
    if (p) {
      updateProductSEO(p);
      // Fire Meta Pixel ViewContent (required for Instagram Catalog product matching)
      const effectivePrice = p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;
      pixelViewContent({ id: p.id, name: p.name, price: effectivePrice, category: p.fabric || 'Sarees' });
    }
    return () => {
      restoreDefaultSEO();
    };
  }, [p]);


  // Render an inline skeleton that keeps the page chrome visible (no full-screen takeover)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        {/* Top navigation bar — always visible */}
        <div className="fixed top-0 left-0 right-0 h-[56px] md:h-[64px] bg-white border-b border-[#E8E0D5] flex items-center px-4 z-50 shadow-xs max-w-[430px] md:max-w-full mx-auto">
          <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
          </button>
          <div className="flex-1 ml-2 h-4 bg-[#E8E0D5] rounded animate-pulse w-32" />
          <div className="flex gap-2 ml-auto">
            <div className="w-10 h-10 rounded-full bg-[#E8E0D5] animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-[#E8E0D5] animate-pulse" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="pt-[60px] pb-[100px] max-w-[430px] md:max-w-[900px] mx-auto">
          {/* Image placeholder — 4:5 aspect ratio */}
          <div className="w-full aspect-[4/5] bg-[#E8E0D5] animate-pulse rounded-2xl" />
          <div className="p-5 space-y-4">
            <div className="h-5 bg-[#E8E0D5] rounded animate-pulse w-3/4" />
            <div className="h-4 bg-[#E8E0D5] rounded animate-pulse w-1/2" />
            <div className="h-8 bg-[#E8E0D5] rounded animate-pulse w-1/3" />
            <div className="h-12 bg-[#E8E0D5] rounded-2xl animate-pulse" />
            <div className="h-12 bg-[#E8E0D5] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="p-10 text-center font-sans text-black bg-[#FAF6F0] min-h-screen flex flex-col items-center justify-center">
        <h3 className="text-lg font-bold text-black">Saree collection not found</h3>
        <button onClick={() => onNavigate('home')} className="mt-4 text-[#C4601A] underline font-bold cursor-pointer">
          Go back Home
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.includes(p.id);

  // Active colour variants (Colour Images) strictly from p.variants
  const colourVariants = React.useMemo(() => {
    if (!p || !p.variants || !Array.isArray(p.variants)) return [];
    return p.variants.filter((v) => v.colour && v.colour.trim() && v.image && v.image.trim());
  }, [p]);

  // Model / Advertisement Gallery Images strictly from API (p.galleryImages, with fallback to p.image)
  const modelGalleryImages: string[] = React.useMemo(() => {
    if (!p) return [];
    if (p.galleryImages && Array.isArray(p.galleryImages) && p.galleryImages.length > 0) {
      const valid = p.galleryImages.filter((img) => typeof img === 'string' && img.trim().length > 0);
      if (valid.length > 0) return valid;
    }
    const list: string[] = [];
    if (p.image && p.image.trim()) list.push(p.image.trim());
    if (p.variants && Array.isArray(p.variants)) {
      p.variants.forEach((v) => {
        if (v.image && v.image.trim() && !list.includes(v.image.trim())) {
          list.push(v.image.trim());
        }
      });
    }
    return list;
  }, [p]);

  const activeVariant = colourVariants.find(
    (v) => v.colour && selectedColour && v.colour.trim().toLowerCase() === selectedColour.trim().toLowerCase()
  );

  const currentPrice = activeVariant?.price ?? p.price;
  const currentDiscountPrice = activeVariant?.discountPrice ?? p.discountPrice;
  const currentStock = activeVariant?.stock ?? p.stock;

  const isOutOfStock = currentStock === 0;
  const effectivePrice = currentDiscountPrice && currentDiscountPrice > 0 ? currentDiscountPrice : currentPrice;
  const isLowStock = effectivePrice >= 2000 && currentStock !== undefined && currentStock > 0 && currentStock <= 3;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(p.id, selectedColour, quantity);
    // Fire Meta Pixel AddToCart event (enables retargeting ads for cart abandonments)
    pixelAddToCart({ id: p.id, name: p.name, price: effectivePrice });
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    onBuyNow(p.id, selectedColour, p, quantity);
  };

  // Instagram "Shop Now" — copies direct product link for Instagram bio/caption/story
  const handleInstaShare = async () => {
    const productUrl = `${SITE_URL}/?product=${p.id}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      setInstaCopied(true);
      setTimeout(() => setInstaCopied(false), 3000);
    } catch {
      // fallback — open modal anyway
    }
    setShowInstaModal(true);
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

  const currentImageUrl = displayImage || (modelGalleryImages[activeMediaIndex]) || p.image || '';
  const currentMedia: { type: 'image' | 'video'; url: string } = { type: 'image', url: currentImageUrl };

  // Programmatic scroll coordinator to prevent conflicts between smooth scrolling and onScroll events
  const isProgrammaticScroll = React.useRef(false);
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToSlide = (idx: number, smooth: boolean = true) => {
    if (!galleryScrollRef.current) return;
    const clampedIdx = Math.max(0, Math.min(idx, modelGalleryImages.length - 1));
    isProgrammaticScroll.current = true;
    setActiveMediaIndex(clampedIdx);
    setDisplayImage(modelGalleryImages[clampedIdx]);

    const el = galleryScrollRef.current;
    const targetLeft = clampedIdx * el.clientWidth;
    el.scrollTo({ left: targetLeft, behavior: smooth ? 'smooth' : 'auto' });

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 450);
  };

  const handleGalleryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Ignore scroll events during smooth programmatic scroll to prevent snapping back
    if (isProgrammaticScroll.current) return;
    const el = e.currentTarget;
    if (!el.clientWidth) return;
    const newIdx = Math.round(el.scrollLeft / el.clientWidth);
    if (newIdx !== activeMediaIndex && newIdx >= 0 && newIdx < modelGalleryImages.length) {
      setActiveMediaIndex(newIdx);
      setDisplayImage(modelGalleryImages[newIdx]);
    }
  };

  // Keep active slide aligned on window resize
  useEffect(() => {
    const handleResize = () => {
      if (galleryScrollRef.current) {
        const el = galleryScrollRef.current;
        el.scrollTo({ left: activeMediaIndex * el.clientWidth, behavior: 'instant' });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeMediaIndex]);

  // Mouse wheel & trackpad vertical scroll support on laptop/desktop:
  // Rolling mouse wheel over the image gallery advances/reverses slides smoothly without jumping the page
  useEffect(() => {
    const el = galleryScrollRef.current;
    if (!el) return;

    let wheelCooldown = false;
    let cooldownTimer: ReturnType<typeof setTimeout> | null = null;

    const handleWheel = (e: WheelEvent) => {
      if (modelGalleryImages.length <= 1) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // If user is doing horizontal trackpad swipe, allow native overflow-x-auto
      if (absX > absY && absX > 10) {
        isProgrammaticScroll.current = false;
        return;
      }

      // If user is scrolling vertically with mouse wheel or trackpad over the gallery
      if (absY > 12) {
        e.preventDefault();

        if (wheelCooldown) return;
        wheelCooldown = true;
        cooldownTimer = setTimeout(() => {
          wheelCooldown = false;
        }, 320);

        if (e.deltaY > 0) {
          const next = activeMediaIndex < modelGalleryImages.length - 1 ? activeMediaIndex + 1 : 0;
          scrollToSlide(next);
        } else {
          const prev = activeMediaIndex > 0 ? activeMediaIndex - 1 : modelGalleryImages.length - 1;
          scrollToSlide(prev);
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (cooldownTimer) clearTimeout(cooldownTimer);
    };
  }, [modelGalleryImages, activeMediaIndex]);

  // Pointer drag-to-scroll (enables click & drag to scroll images on laptop/desktop)
  const isPointerDownRef = React.useRef(false);
  const pointerStartXRef = React.useRef(0);
  const pointerScrollStartRef = React.useRef(0);
  const pointerMovedRef = React.useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (modelGalleryImages.length <= 1) return;
    if (e.button !== 0) return; // Only primary mouse button
    isPointerDownRef.current = true;
    pointerStartXRef.current = e.clientX;
    pointerScrollStartRef.current = galleryScrollRef.current ? galleryScrollRef.current.scrollLeft : 0;
    pointerMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !galleryScrollRef.current) return;
    const dx = e.clientX - pointerStartXRef.current;
    if (Math.abs(dx) > 5) {
      pointerMovedRef.current = true;
      isProgrammaticScroll.current = false;
      galleryScrollRef.current.scrollLeft = pointerScrollStartRef.current - dx;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (!galleryScrollRef.current) return;
    const dx = e.clientX - pointerStartXRef.current;

    if (pointerMovedRef.current && Math.abs(dx) > 40) {
      if (dx < -40) {
        const nextIdx = Math.min(activeMediaIndex + 1, modelGalleryImages.length - 1);
        scrollToSlide(nextIdx);
      } else {
        const prevIdx = Math.max(activeMediaIndex - 1, 0);
        scrollToSlide(prevIdx);
      }
    } else if (pointerMovedRef.current) {
      scrollToSlide(activeMediaIndex);
    }
  };

  const handlePointerCancel = () => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      setIsDragging(false);
      if (pointerMovedRef.current) {
        scrollToSlide(activeMediaIndex);
      }
    }
  };

  const activeImageDims = imgNaturalDims[currentImageUrl] || (
    p && p.image === currentImageUrl && p.imageWidth && p.imageHeight
      ? { width: p.imageWidth, height: p.imageHeight }
      : undefined
  );
  const containerAspectRatio = activeImageDims
    ? `${activeImageDims.width} / ${activeImageDims.height}`
    : (p?.imageWidth && p?.imageHeight ? `${p.imageWidth} / ${p.imageHeight}` : undefined);

  // handleTouchEnd for horizontal swipe navigation through model gallery images
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (modelGalleryImages.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return; // not a horizontal swipe
    const newIndex = dx < 0
      ? Math.min(activeMediaIndex + 1, modelGalleryImages.length - 1)  // swipe left → next
      : Math.max(activeMediaIndex - 1, 0);                             // swipe right → prev
    scrollToSlide(newIndex);
  };

  // Map active, valid store offers for ProductPerks coupon tickets
  const perksOffers: Offer[] = offers
    .filter((o) => {
      if (!o.code || !o.code.trim()) return false;
      if (o.isActive !== undefined && !o.isActive) return false;
      if (o.expiresAt && new Date(o.expiresAt) <= new Date()) return false;
      return true;
    })
    .map((o) => ({
      id: o.id,
      title: o.title,
      code: o.code!.trim(),
      note: o.conditions && o.conditions.trim() ? o.conditions.trim() : undefined,
    }));

  const freeShippingThreshold = Number(settings?.free_shipping_above) || 0;

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
        <div className="pd-nav-title font-sans text-base md:text-lg font-bold text-black">
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
          {/* Instagram Shop Now Button */}
          <button
            className="pd-insta-share p-1.5 hover:bg-pink-50 rounded-full cursor-pointer relative transition-colors"
            onClick={handleInstaShare}
            title="Share on Instagram / Get Shop Now link"
            aria-label="Share on Instagram"
          >
            <svg className="w-[20px] h-[20px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433"/>
                  <stop offset="25%" stopColor="#e6683c"/>
                  <stop offset="50%" stopColor="#dc2743"/>
                  <stop offset="75%" stopColor="#cc2366"/>
                  <stop offset="100%" stopColor="#bc1888"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
              <circle cx="12" cy="12" r="4" stroke="url(#ig-grad)" strokeWidth="2" fill="none"/>
              <circle cx="17.5" cy="6.5" r="1" fill="url(#ig-grad)"/>
            </svg>
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

      <div className="max-w-[1100px] mx-auto bg-white border border-[#E8E0D5] md:my-6 md:rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Side: Product Image Gallery */}
        <div className="p-4 md:p-6 bg-[#FAF6F0] flex flex-col justify-start border-b md:border-b-0 md:border-r border-[#E8E0D5]">
          {/* Main Display Image */}
          <div
            className="pd-media-section relative w-full rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#E8E0D5] shadow-xs group transition-[aspect-ratio,height] duration-300 ease-in-out"
            style={{
              aspectRatio: currentMedia.type === 'video' ? '16 / 9' : containerAspectRatio
            }}
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
            ) : modelGalleryImages.length > 0 ? (
              /* Horizontally scrollable model/advertisement gallery with scroll-snap and full image display */
              <div
                ref={galleryScrollRef}
                onScroll={handleGalleryScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onPointerLeave={handlePointerCancel}
                className={`w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scroll select-none ${
                  modelGalleryImages.length > 1
                    ? isDragging
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : ''
                }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y' }}
              >
                {modelGalleryImages.map((imgUrl, idx) => {
                  const dims = imgNaturalDims[imgUrl] || (
                    p.image === imgUrl && p.imageWidth && p.imageHeight
                      ? { width: p.imageWidth, height: p.imageHeight }
                      : undefined
                  );
                  return (
                    <div
                      key={idx}
                      className="w-full shrink-0 snap-center flex items-center justify-center bg-[#FAF6F0]"
                    >
                      <img
                        src={imgUrl}
                        alt={`${p.name} - Photo ${idx + 1}`}
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        // @ts-ignore
                        fetchpriority={idx === 0 ? 'high' : 'auto'}
                        decoding={idx === 0 ? 'sync' : 'async'}
                        width={dims?.width || 800}
                        height={dims?.height || 1000}
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          if (img.naturalWidth && img.naturalHeight) {
                            setImgNaturalDims((prev) => ({
                              ...prev,
                              [imgUrl]: { width: img.naturalWidth, height: img.naturalHeight }
                            }));
                          }
                        }}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          objectFit: 'contain',
                          userSelect: 'none',
                          WebkitUserDrag: 'none'
                        } as React.CSSProperties}
                        className="w-full h-auto block select-none pointer-events-none"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full shrink-0 flex items-center justify-center bg-[#FAF6F0]">
                <ProductThumbnail id={p.id} imageUrl={p.image} priority={true} className="w-full h-full" />
              </div>
            )}

            {/* Desktop Navigation Chevrons */}
            {modelGalleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIdx = activeMediaIndex === 0 ? modelGalleryImages.length - 1 : activeMediaIndex - 1;
                    scrollToSlide(prevIdx);
                  }}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                  title="Previous image"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = activeMediaIndex === modelGalleryImages.length - 1 ? 0 : activeMediaIndex + 1;
                    scrollToSlide(nextIdx);
                  }}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] shadow-md items-center justify-center transition-all opacity-85 hover:opacity-100 hover:scale-110 active:scale-95 z-20 cursor-pointer"
                  title="Next image"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                <span className="bg-red-700 text-white text-xs font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                  OUT OF STOCK
                </span>
              </div>
            )}

            {isLowStock && !isOutOfStock && (
              <div className="absolute bottom-4 left-4 bg-red-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider shadow-md animate-pulse z-10 pointer-events-none">
                Only {currentStock} Left in Stock!
              </div>
            )}

            {modelGalleryImages.length > 0 && (
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-20 pointer-events-none">
                {activeMediaIndex + 1} / {modelGalleryImages.length}
              </div>
            )}
          </div>

          {/* Horizontal strip of thumbnails directly under the main photo */}
          {modelGalleryImages.length > 1 && (
            <div
              className="mt-4 flex gap-2.5 overflow-x-auto pb-2 no-scroll"
              style={{ scrollbarWidth: 'thin' }}
              onWheel={(e) => {
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {modelGalleryImages.map((imgUrl, idx) => {
                const active = activeMediaIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      scrollToSlide(idx);
                    }}
                    className={`w-14 aspect-[4/5] rounded-xl border-2 bg-[#FAF6F0] overflow-hidden relative shrink-0 transition-all cursor-pointer ${
                      active ? 'border-[#C4601A] ring-2 ring-[#C4601A]/35 scale-102 shadow-xs' : 'border-[#E8E0D5] hover:border-gray-400 opacity-80 hover:opacity-100'
                    }`}
                    title={`View photo ${idx + 1}`}
                  >
                    <ProductThumbnail imageUrl={imgUrl} altText={`Photo ${idx + 1}`} className="w-full h-full pointer-events-none" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Product Details & Purchase Actions */}
        <div className="pd-info-section p-5 md:p-8 flex flex-col justify-start">
          {/* Dispatch countdown timer banner */}
          <div className="flex items-center gap-1.5 text-xs text-[#2E7D32] font-semibold mb-2.5">
            <span className="text-amber-500 font-bold">⚡</span>
            <span>
              Order within <strong className="text-[#1A1A1A] font-bold">{timeLeft.hours} hours {timeLeft.minutes} minutes {timeLeft.seconds} seconds</strong> to get it by <strong className="text-[#1A1A1A] font-bold">{deliveryDateStr}</strong> !
            </span>
          </div>

          {/* Fabric badge & rating */}
          {((p.fabric && p.fabric.trim()) || reviewsList.length > 0 || (p.reviews && p.reviews > 0)) && (
            <div className="pd-meta flex items-center gap-2 mb-2">
              {p.fabric && p.fabric.trim() && (
                <span className="pd-fabric-tag bg-[#FAF6F0] border border-[#E8E0D5] text-[#C4601A] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {p.fabric}
                </span>
              )}
              {(reviewsList.length > 0 || (p.reviews && p.reviews > 0)) && (() => {
                const count = reviewsList.length > 0 ? reviewsList.length : (p.reviews || 0);
                const avgRating = reviewsList.length > 0
                  ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
                  : (p.rating ? Number(p.rating).toFixed(1) : '5.0');
                return (
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.querySelector('.pd-reviews-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="pd-rating bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                    title={`Based on ${count} customer review${count > 1 ? 's' : ''}. Click to view reviews.`}
                  >
                    <span>★ {avgRating}</span>
                    <span className="text-amber-700/80 font-semibold">({count})</span>
                  </button>
                );
              })()}
            </div>
          )}

          {/* Product Title */}
          <h1 className="pd-title font-sans text-2xl md:text-3xl font-bold text-black leading-tight mb-2">
            {p.name}
          </h1>

          {/* Pricing Block */}
          <div className="pd-price-wrap flex items-baseline gap-2.5 mb-4 border-b border-[#E8E0D5] pb-3.5 flex-wrap">
            {currentDiscountPrice && currentDiscountPrice > 0 ? (
              <>
                <span className="pd-current-price text-2xl md:text-3xl font-extrabold text-[#C4601A] font-sans">
                  ₹{currentDiscountPrice.toLocaleString('en-IN')} INR
                </span>
                <span className="text-sm text-black/70 font-semibold line-through font-sans">
                  ₹{currentPrice.toLocaleString('en-IN')} INR
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {Math.round(((currentPrice - currentDiscountPrice) / currentPrice) * 100)}% OFF
                </span>
              </>
            ) : (
              <span className="pd-current-price text-2xl md:text-3xl font-extrabold text-[#C4601A] font-sans">
                ₹{currentPrice.toLocaleString('en-IN')} INR
              </span>
            )}
            <span className="text-xs text-black font-semibold font-sans">MRP (Incl. of all taxes)</span>
          </div>

          {/* Colours / Swatches Strip */}
          {colourVariants.length > 0 && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 bg-[#8A3319] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-t-md">
                <span>Colours:</span>
                <span className="text-amber-200 normal-case font-bold">{selectedColour || colourVariants[0]?.colour}</span>
              </div>
              <div
                className="border border-[#8A3319]/30 rounded-b-xl rounded-tr-xl p-2.5 bg-[#FAF6F0] flex gap-2.5 overflow-x-auto no-scroll"
                style={{ scrollbarWidth: 'thin' }}
                onWheel={(e) => {
                  if (e.deltaY !== 0) {
                    e.currentTarget.scrollLeft += e.deltaY;
                  }
                }}
              >
                {colourVariants.map((v, idx) => {
                  const isSelected = selectedColour
                    ? selectedColour.trim().toLowerCase() === v.colour.trim().toLowerCase()
                    : idx === 0;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedColour(v.colour);
                        if (v.image) {
                          setDisplayImage(v.image);
                          const inGalleryIdx = modelGalleryImages.indexOf(v.image);
                          if (inGalleryIdx >= 0) {
                            scrollToSlide(inGalleryIdx);
                          }
                        }
                      }}
                      className={`w-14 aspect-[4/5] rounded-lg border-2 bg-[#FAF6F0] overflow-hidden relative shrink-0 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#C4601A] ring-2 ring-[#C4601A]/40 scale-105 shadow-sm'
                          : 'border-[#E8E0D5] hover:border-gray-400 opacity-85 hover:opacity-100'
                      }`}
                      title={v.colour}
                      aria-label={`Select colour ${v.colour}`}
                    >
                      <ProductThumbnail imageUrl={v.image} altText={v.colour} className="w-full h-full pointer-events-none" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector and ADD TO CART */}
          <div className="space-y-3 mb-5">
            {/* Quantity Selector */}
            <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="px-3.5 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors font-bold text-sm"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 py-2 text-xs font-bold text-[#1A1A1A] min-w-[36px] text-center select-none font-sans">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={(p.stock !== undefined && quantity >= p.stock) || isOutOfStock}
                className="px-3.5 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors font-bold text-sm"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* ADD TO CART Primary Button */}
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-99 shadow-xs flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#9E3D24] hover:bg-[#85321C] text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Sold Out' : 'ADD TO CART'}
            </button>
          </div>

          {/* Product Perks (Offers / Coupons + Service Highlights) */}
          <ProductPerks
            offers={perksOffers}
            freeShippingAbove={freeShippingThreshold}
            shippingPolicyHref="#/policies/shipping-policy"
            returnPolicyHref="#/policies/return-policy"
          />

          {/* 3. ACCORDION SECTIONS (Collapsible with +/- toggle) */}
          <div className="divide-y divide-[#E8E0D5] border-t border-b border-[#E8E0D5] mb-6">
            {/* Accordion a: Description */}
            {p.desc && p.desc.trim() && (
              <div>
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full py-4 flex items-center justify-between text-left font-sans text-base font-bold text-black hover:text-[#C4601A] transition-colors cursor-pointer"
                >
                  <span>Description</span>
                  <span className="text-xl font-light text-black font-sans">
                    {openAccordions['description'] ? '–' : '+'}
                  </span>
                </button>
                {openAccordions['description'] && (
                  <div className="pb-4 text-xs md:text-sm text-black leading-relaxed font-sans">
                    <ProductDescription content={p.desc} />
                  </div>
                )}
              </div>
            )}

            {/* Accordion b: Return & Exchange */}
            <div>
              <button
                onClick={() => toggleAccordion('return')}
                className="w-full py-4 flex items-center justify-between text-left font-sans text-base font-bold text-black hover:text-[#C4601A] transition-colors cursor-pointer"
              >
                <span>Return &amp; Exchange</span>
                <span className="text-xl font-light text-black font-sans">
                  {openAccordions['return'] ? '–' : '+'}
                </span>
              </button>
              {openAccordions['return'] && (
                <div className="pb-4 text-xs md:text-sm text-black leading-relaxed space-y-3 font-sans">
                  <p className="text-black">
                    Sneh Sarees offers a 7-day return and exchange policy on all eligible handcrafted sarees, subject to company Terms &amp; Conditions.
                  </p>
                  <div>
                    <button
                      onClick={() => onNavigate('policies', 'return-policy')}
                      className="inline-flex items-center gap-1.5 bg-[#FFF0E8] hover:bg-[#FFE4D6] text-[#C4601A] border border-[#F0C8A0] px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Full Return &amp; Refund Policy →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion c: Shipping & Delivery (Dynamic from database) */}
            <div>
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full py-4 flex items-center justify-between text-left font-sans text-base font-bold text-black hover:text-[#C4601A] transition-colors cursor-pointer"
              >
                <span>Shipping &amp; Delivery</span>
                <span className="text-xl font-light text-black font-sans">
                  {openAccordions['shipping'] ? '–' : '+'}
                </span>
              </button>
              {openAccordions['shipping'] && (
                <div className="pb-4 text-xs md:text-sm text-black leading-relaxed space-y-3 font-sans">
                  {shippingPolicy?.content ? (
                    <div
                      className="policy-accordion-content space-y-2 text-xs text-black leading-relaxed
                        [&_h2]:hidden
                        [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-black [&_h3]:text-xs [&_h3]:pt-1.5 [&_h3]:pb-0.5
                        [&_p]:text-black [&_p]:leading-relaxed
                        [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:text-black
                        [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_ol]:text-black
                        [&_strong]:font-bold [&_strong]:text-black
                        [&_a]:text-[#C4601A] [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(shippingPolicy.content) }}
                    />
                  ) : (
                    <div className="space-y-2 text-xs text-black">
                      <p className="font-semibold text-black">Lightning Fast Pan-India Dispatch.</p>
                      <p className="text-black">
                        Orders are shipped within 1–3 business days via trusted couriers (Bluedart, Delhivery, DTDC, Shiprocket).
                        Delivery takes 1–3 days in Metro cities and 2–7 days across other locations. Free shipping on orders ₹2,000+.
                      </p>
                    </div>
                  )}
                  <div className="pt-1">
                    <button
                      onClick={() => onNavigate('policies', 'shipping-policy')}
                      className="text-[#C4601A] font-semibold underline hover:opacity-80 text-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      View Full Shipping &amp; Delivery Terms →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion d: Importer/Marketer/Packer Details */}
            {Boolean(
              settings && (
                (settings.country_of_origin && settings.country_of_origin.trim()) ||
                (settings.business_name && settings.business_name.trim()) ||
                (settings.address && settings.address.trim()) ||
                (settings.email && settings.email.trim()) ||
                (settings.gstin && settings.gstin.trim())
              )
            ) && (
              <div>
                <button
                  onClick={() => toggleAccordion('details')}
                  className="w-full py-4 flex items-center justify-between text-left font-sans text-base font-bold text-black hover:text-[#C4601A] transition-colors cursor-pointer"
                >
                  <span>Importer/Marketer/Packer Details</span>
                  <span className="text-xl font-light text-black font-sans">
                    {openAccordions['details'] ? '–' : '+'}
                  </span>
                </button>
                {openAccordions['details'] && (
                  <div className="pb-4 text-xs md:text-sm text-black leading-relaxed space-y-2 font-sans">
                    {settings?.country_of_origin && (
                      <p className="text-black">
                        <strong className="text-black">Country of Origin :</strong> {settings.country_of_origin}
                      </p>
                    )}
                    {(settings?.business_name || settings?.address) && (
                      <div className="text-black">
                        <strong className="text-black block">Imported/Marketed/Packed By :</strong>
                        {settings.business_name && <p className="mt-0.5 text-black">{settings.business_name}</p>}
                        {settings.address && <p className="text-black">{settings.address}</p>}
                        {settings.pincode && <p className="text-black">Pincode : {settings.pincode}</p>}
                      </div>
                    )}
                    {settings?.email && (
                      <p className="text-black">
                        <strong className="text-black">Email :</strong> {settings.email}
                      </p>
                    )}
                    {settings?.gstin && (
                      <p className="text-black">
                        <strong className="text-black">GST IN :</strong> {settings.gstin}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SHARE section (as in screenshot 4) */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E8E0D5]">
            <span className="text-xs font-bold text-[#777777] uppercase tracking-wider">SHARE</span>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer text-[#1A1A1A]"
              title="Share Saree Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleInstaShare}
              className="p-2 hover:bg-pink-50 rounded-full transition-colors cursor-pointer text-[#C4601A]"
              title="Share on Instagram"
            >
              <Instagram className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Feature Badges (as in screenshot 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center py-2">
            <button
              type="button"
              onClick={() => onNavigate('policies', 'shipping-policy')}
              className="flex flex-col items-center gap-1.5 p-2 bg-[#FAF6F0] hover:bg-[#F3ECE1] rounded-xl border border-[#E8E0D5] transition-colors cursor-pointer"
              title="View Shipping Policy"
            >
              <Truck className="w-5 h-5 text-[#C4601A]" />
              <span className="text-[11px] font-bold text-[#1A1A1A]">Free Shipping</span>
            </button>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-[#FAF6F0] rounded-xl border border-[#E8E0D5]">
              <Headphones className="w-5 h-5 text-[#C4601A]" />
              <span className="text-[11px] font-bold text-[#1A1A1A]">Customer Support</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 bg-[#FAF6F0] rounded-xl border border-[#E8E0D5]">
              <CreditCard className="w-5 h-5 text-[#C4601A]" />
              <span className="text-[11px] font-bold text-[#1A1A1A]">Secure Payment</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('policies', 'return-policy')}
              className="flex flex-col items-center gap-1.5 p-2 bg-[#FAF6F0] hover:bg-[#F3ECE1] rounded-xl border border-[#E8E0D5] transition-colors cursor-pointer"
              title="View Return & Refund Policy"
            >
              <RotateCcw className="w-5 h-5 text-[#C4601A]" />
              <span className="text-[11px] font-bold text-[#1A1A1A]">Easy Return 7 days</span>
            </button>
          </div>
        </div>

        {/* Trending Reel Section */}
        {p.reelUrl && (
          <div className="pd-reel-section px-5 md:px-8 pb-6 col-span-1 md:col-span-2 border-t border-[#E8E0D5] pt-6 mt-4">
            <h3 className="font-sans text-lg font-bold text-black mb-3.5">
              Trending Reel
            </h3>
            <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E8E0D5] flex flex-col md:flex-row gap-5 items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold text-[#C4601A] uppercase tracking-wider mb-1">Watch It In Action</p>
                <p className="text-xs text-black font-sans leading-relaxed mb-4">
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

        {/* ── Customer Reviews Section (Anyone can write a review with name and upload photos) ── */}
        <div className="pd-reviews-section px-5 md:px-8 pb-8 col-span-1 md:col-span-2 border-t border-[#E8E0D5] pt-8 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="pd-reviews-title font-sans text-xl md:text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C4601A]" />
                Customer Reviews ({reviewsList.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Real customer reviews, ratings and saree photos</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowReviewForm(!showReviewForm);
                setReviewError('');
                setReviewSuccess('');
              }}
              className="inline-flex items-center justify-center gap-2 bg-[#C4601A] hover:bg-[#a84f13] text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Star className="w-4 h-4 fill-white" />
              {showReviewForm ? 'Close Form' : 'Write a Review'}
            </button>
          </div>

          {/* Review Form (Collapsible/Toggleable) */}
          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-[#FAF6F0] border border-[#E8E0D5] rounded-2xl p-5 md:p-6 mb-8 shadow-xs space-y-4"
            >
              <div className="border-b border-[#E8E0D5] pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A]">Share Your Experience</h4>
                  <p className="text-[11px] text-gray-500">Anyone can write a review. Tell others how the saree looks and feels!</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Error & Success alerts */}
              {reviewError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                  {reviewError}
                </div>
              )}
              {reviewSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl font-medium">
                  {reviewSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name input */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Enter your name (e.g. Priya Sharma)"
                    required
                    className="w-full bg-white border border-[#E8E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C4601A] font-medium transition-colors"
                  />
                </div>

                {/* Star rating selector */}
                <div>
                  <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                    Overall Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 h-[38px]">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const isFilled = star <= (reviewHoverRating || reviewRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            onMouseEnter={() => setReviewHoverRating(star)}
                            onMouseLeave={() => setReviewHoverRating(0)}
                            className="p-1 text-amber-500 hover:scale-115 transition-transform cursor-pointer focus:outline-none"
                            title={`${star} Star${star > 1 ? 's' : ''}`}
                          >
                            <Star className={`w-5 h-5 ${isFilled ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-[#C4601A] ml-2">
                      {reviewHoverRating || reviewRating} / 5
                      <span className="text-gray-500 font-normal ml-1">
                        {((reviewHoverRating || reviewRating) === 5 && '— Loved it!') ||
                         ((reviewHoverRating || reviewRating) === 4 && '— Very Good') ||
                         ((reviewHoverRating || reviewRating) === 3 && '— Good') ||
                         ((reviewHoverRating || reviewRating) === 2 && '— Fair') ||
                         ((reviewHoverRating || reviewRating) === 1 && '— Poor')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Review comment */}
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] mb-1">
                  Your Review <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share your thoughts on the saree quality, fabric texture, drape, and color. Would you recommend it?"
                  rows={3}
                  className="w-full bg-white border border-[#E8E0D5] rounded-xl px-3.5 py-2.5 text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C4601A] resize-none font-medium transition-colors"
                />
              </div>

              {/* Image upload area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1A1A1A]">
                    Upload Photos of Saree <span className="text-gray-400 font-normal">(Optional, up to 5 photos)</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {reviewPhotos.length} / 5 photos selected
                  </span>
                </div>

                {/* Upload trigger & Previews grid */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Upload button */}
                  {reviewPhotos.length < 5 && (
                    <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-[#C4601A]/40 hover:border-[#C4601A] bg-white hover:bg-orange-50/30 rounded-xl cursor-pointer transition-all group shrink-0">
                      <Camera className="w-6 h-6 text-[#C4601A] group-hover:scale-110 transition-transform mb-1" />
                      <span className="text-[10px] font-bold text-[#C4601A]">Add Photo</span>
                      <span className="text-[8px] text-gray-400">JPG, PNG</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* Previews of selected photos */}
                  {reviewPhotos.map((photo, idx) => (
                    <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-[#E8E0D5] bg-white group shrink-0 shadow-xs">
                      <img
                        src={photo.preview}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full cursor-pointer transition-opacity opacity-90 group-hover:opacity-100"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.2 rounded font-medium">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-[#E8E0D5] bg-white text-gray-600 rounded-xl text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#C4601A] hover:bg-[#a84f13] disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  {submittingReview ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting Review...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Rating Summary (if reviews exist) */}
          {reviewsList.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E8E0D5] flex items-center gap-4">
                <span className="text-4xl font-extrabold text-[#C4601A] font-sans">
                  {(reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)}
                </span>
                <div>
                  <div className="flex text-amber-500 mb-0.5">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const avg = reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length;
                      return (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`}
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                    Based on {reviewsList.length} customer review{reviewsList.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] flex flex-col justify-center space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewsList.filter((r) => Math.round(r.rating) === stars).length;
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
          )}

          {/* Reviews List */}
          {sortedReviews.length === 0 ? (
            <div className="bg-[#FAF6F0] border border-[#E8E0D5] rounded-2xl p-8 text-center">
              <span className="text-3xl block mb-2">✨</span>
              <h4 className="font-bold text-sm text-[#1A1A1A] mb-1">No reviews yet for this saree</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
                Be the first to share your thoughts, photos, and feedback! Anyone can write a review.
              </p>
              {!showReviewForm && (
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="bg-[#C4601A] hover:bg-[#a84f13] text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  Write the First Review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                <span>
                  Showing <strong className="text-[#1A1A1A]">{displayedReviews.length}</strong> of{' '}
                  <strong className="text-[#1A1A1A]">{sortedReviews.length}</strong> customer reviews
                </span>
                <span className="text-[11px] bg-[#FAF6F0] border border-[#E8E0D5] px-2 py-0.5 rounded-md font-semibold text-[#C4601A]">
                  ★ Highest rated & latest first
                </span>
              </div>

              <div className="flex flex-col gap-3.5 pr-1">
                {displayedReviews.map((r) => {
                  const reviewImages = Array.isArray(r.images) ? r.images : [];
                  return (
                    <div key={r.id} className="pd-review-card bg-[#FAF6F0] border border-[#E8E0D5] rounded-2xl p-4 transition-all shadow-3xs hover:shadow-2xs">
                      <div className="pd-review-header flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="pd-review-avatar w-9 h-9 rounded-full bg-[#C4601A] flex items-center justify-center text-white font-bold text-xs uppercase shrink-0 shadow-xs">
                            {(r.userName || r.userUsername || 'C')[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="pd-reviewer-name text-sm font-bold text-[#1A1A1A] leading-tight">
                                {r.userName || (r.userUsername ? `@${r.userUsername}` : 'Customer')}
                              </h5>
                              {r.isVerified && (
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="pd-review-stars text-amber-500 flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              {settings?.show_review_date !== 'false' && r.createdAt && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(r.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {r.body && (
                        <p className="pd-review-text text-xs text-[#2A2A2A] leading-relaxed mb-3">
                          "{r.body}"
                        </p>
                      )}

                      {/* Customer Uploaded Images for this review */}
                      {reviewImages.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#E8E0D5]/70">
                          <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Customer Photos ({reviewImages.length})
                          </span>
                          <div className="flex flex-wrap gap-2.5">
                            {reviewImages.map((imgUrl, imgIdx) => (
                              <div
                                key={imgIdx}
                                onClick={() =>
                                  setActivePhotoModal({
                                    url: imgUrl,
                                    userName: r.userName || 'Customer',
                                    index: imgIdx,
                                    total: reviewImages.length,
                                    allUrls: reviewImages,
                                  })
                                }
                                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-[#E8E0D5] bg-white cursor-pointer hover:opacity-95 hover:scale-105 transition-all shadow-2xs group"
                                title="Click to view full photo"
                              >
                                <img
                                  src={imgUrl}
                                  alt={`Customer photo ${imgIdx + 1} by ${r.userName}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold">
                                  View
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Show More / Show Less Controls (Preserves blazing-fast page performance) */}
              {sortedReviews.length > 5 && (
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  {visibleReviewsCount < sortedReviews.length ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setVisibleReviewsCount((prev) => Math.min(prev + 5, sortedReviews.length))}
                        className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF6F0] border border-[#C4601A] text-[#C4601A] font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow-3xs hover:shadow-xs cursor-pointer active:scale-98"
                      >
                        <ChevronDown className="w-4 h-4" />
                        Show More Reviews ({sortedReviews.length - visibleReviewsCount} remaining)
                      </button>
                      {sortedReviews.length - visibleReviewsCount > 5 && (
                        <button
                          type="button"
                          onClick={() => setVisibleReviewsCount(sortedReviews.length)}
                          className="text-xs font-semibold text-gray-500 hover:text-[#C4601A] underline underline-offset-4 px-2 py-1 cursor-pointer transition-colors"
                        >
                          Show All ({sortedReviews.length})
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setVisibleReviewsCount(5)}
                      className="inline-flex items-center gap-2 bg-white hover:bg-[#FAF6F0] border border-[#E8E0D5] text-gray-600 font-bold text-xs px-5 py-2 rounded-full transition-all cursor-pointer shadow-3xs"
                    >
                      <ChevronUp className="w-4 h-4" />
                      Show Less (Top 5 only)
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Suggested Products ─────────────────────────────────────── */}
      {suggestedProducts.length > 0 && (
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 py-6 md:py-8">
          <h3 className="font-sans text-lg md:text-xl font-bold text-black mb-4">
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
                  <div className="relative w-full aspect-[4/5] bg-[#FAF6F0] overflow-hidden">
                    {sp.image ? (
                      <ProductThumbnail
                        imageUrl={sp.image}
                        altText={sp.name}
                        width={sp.imageWidth}
                        height={sp.imageHeight}
                        className="w-full h-full"
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
                    <p className="text-xs font-semibold text-black leading-snug line-clamp-2 mb-1.5 font-sans">{sp.name}</p>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-extrabold text-[#C4601A] font-sans">₹{spPrice.toLocaleString('en-IN')}</span>
                      {spDiscount > 0 && (
                        <span className="text-[10px] text-black/70 line-through font-sans">₹{sp.price.toLocaleString('en-IN')}</span>
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
          <h3 className="font-sans text-lg md:text-xl font-bold text-black mb-4">
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
                  <div className="relative w-full aspect-[4/5] bg-[#FAF6F0] overflow-hidden">
                    {rv.image ? (
                      <ProductThumbnail
                        imageUrl={rv.image}
                        altText={rv.name}
                        width={rv.imageWidth}
                        height={rv.imageHeight}
                        className="w-full h-full"
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
                    <p className="text-xs font-semibold text-black leading-snug line-clamp-2 mb-1 font-sans">{rv.name}</p>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      <span className="text-xs font-extrabold text-[#C4601A] font-sans">₹{rvPrice.toLocaleString('en-IN')}</span>
                      {rvDiscount > 0 && (
                        <span className="text-[9px] text-black/70 line-through font-sans">₹{rv.price.toLocaleString('en-IN')}</span>
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

      {/* ── Instagram "Shop Now" Link Modal ────────────────────────── */}
      {showInstaModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-[99999]"
          onClick={() => setShowInstaModal(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Instagram gradient header */}
            <div className="relative bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] p-5 text-white">
              <button
                onClick={() => setShowInstaModal(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight">Add "Shop Now" on Instagram</h3>
                  <p className="text-white/80 text-xs mt-0.5">Link this product from your post/reel/bio</p>
                </div>
              </div>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Product info */}
              <div className="flex items-center gap-3 bg-[#FAF6F0] rounded-2xl p-3 border border-[#E8E0D5]">
                {p.image && (
                  <div className="w-12 aspect-[4/5] rounded-xl overflow-hidden shrink-0 border border-[#E8E0D5] bg-[#FAF6F0]">
                    <ProductThumbnail imageUrl={p.image} altText={p.name} className="w-full h-full" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-black leading-snug line-clamp-2 font-sans">{p.name}</p>
                  <p className="text-[#C4601A] font-extrabold text-sm mt-0.5 font-sans">
                    ₹{(p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Direct product link */}
              <div>
                <p className="text-xs font-bold text-[#333] uppercase tracking-wider mb-1.5">Direct Product Link</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <span className="text-[11px] text-gray-600 font-mono flex-1 truncate">
                    {`${SITE_URL}/?product=${p.id}`}
                  </span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${SITE_URL}/?product=${p.id}`);
                        setInstaCopied(true);
                        setTimeout(() => setInstaCopied(false), 3000);
                      } catch {}
                    }}
                    className="shrink-0 bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    {instaCopied ? <Check className="w-3 h-3" /> : <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                    {instaCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {instaCopied && (
                  <p className="text-emerald-600 text-[11px] font-semibold mt-1.5 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Link copied to clipboard!
                  </p>
                )}
              </div>

              {/* Step-by-step instructions */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-pink-100 p-4">
                <p className="text-xs font-bold text-[#dc2743] uppercase tracking-wider mb-3">How to add "Shop Now" on Instagram</p>
                <div className="flex flex-col gap-2.5">
                  {[
                    { step: '1', text: 'Copy the product link above' },
                    { step: '2', text: 'Open Instagram → Create a new Post or Reel' },
                    { step: '3', text: 'In the caption/description, write the product name and paste the link' },
                    { step: '4', text: 'Or go to Edit Profile → Add link in Bio → paste there for permanent access' },
                    { step: '5', text: 'For Stories: use the "Link" sticker and paste the product URL' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-2.5">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-[#f09433] to-[#dc2743] text-white text-[10px] font-extrabold flex items-center justify-center">{step}</span>
                      <p className="text-[11px] text-gray-700 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Open Instagram CTA */}
              <a
                href="https://www.instagram.com/_sneh_sarees_"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-sm py-3.5 rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                onClick={() => setShowInstaModal(false)}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="white"/>
                </svg>
                Open Instagram Profile
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Review Customer Photos */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActivePhotoModal(null)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal.url}
              alt={`Photo by ${activePhotoModal.userName}`}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
            />
            <div className="mt-3 flex items-center justify-between w-full px-2 text-white text-xs">
              <span className="font-semibold text-white/90">
                Photo shared by <strong className="text-white">{activePhotoModal.userName}</strong>
              </span>
              {activePhotoModal.total > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newIdx = (activePhotoModal.index - 1 + activePhotoModal.total) % activePhotoModal.total;
                      setActivePhotoModal({
                        ...activePhotoModal,
                        index: newIdx,
                        url: activePhotoModal.allUrls[newIdx],
                      });
                    }}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white/80 text-[11px]">
                    {activePhotoModal.index + 1} / {activePhotoModal.total}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newIdx = (activePhotoModal.index + 1) % activePhotoModal.total;
                      setActivePhotoModal({
                        ...activePhotoModal,
                        index: newIdx,
                        url: activePhotoModal.allUrls[newIdx],
                      });
                    }}
                    className="p-1 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

