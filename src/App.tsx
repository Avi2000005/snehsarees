import { useState, useEffect } from 'react';
import { ActivePage, CartItem, Order, Product, UserProfile } from './types';
import { products } from './data';

// Component imports
import { Drawer } from './components/Drawer';
import { Chatbot } from './components/Chatbot';

// View imports
import { LandingView } from './components/views/LandingView';
import { HomeView } from './components/views/HomeView';
import { SearchView } from './components/views/SearchView';
import { ViewAllView } from './components/views/ViewAllView';
import { ProductDetailView } from './components/views/ProductDetailView';
import { CartView } from './components/views/CartView';
import { CheckoutView } from './components/views/CheckoutView';
import { SuccessView } from './components/views/SuccessView';
import { PendingPaymentView } from './components/views/PendingPaymentView';
import { WishlistView } from './components/views/WishlistView';
import { OrdersView } from './components/views/OrdersView';
import { ProfileView } from './components/views/ProfileView';
import { BulkView } from './components/views/BulkView';
import { AuthView } from './components/views/AuthView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { API_URL, BUSINESS_WHATSAPP } from './config';
import bgImage from '@/assets/background.jpg';

// Global Fetch Proxy to automatically send HTTP-only cookies on API calls
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const isApiRequest =
    (typeof input === 'string' && input.startsWith(API_URL)) ||
    (input instanceof URL && input.href.startsWith(API_URL)) ||
    (input instanceof Request && input.url.startsWith(API_URL));

  if (isApiRequest) {
    init = init || {};
    init.credentials = 'include';
  }
  return originalFetch(input, init);
};


// Icon imports for floating actions & bottom navigation
import { MessageSquare, Home, Heart, ShoppingBag, Package, ShoppingCart } from 'lucide-react';

interface NavigationState {
  page: ActivePage;
  param?: string | number;
  scrollPos?: number;
}

export const getPageUrl = (page: ActivePage, param?: string | number): string => {
  switch (page) {
    case 'landing':
      return '#/';
    case 'home':
      return '#/home';
    case 'product':
      return param ? `#/product/${param}` : '#/home';
    case 'viewall':
      return param ? `#/viewall/${param}` : '#/viewall/all';
    case 'cart':
      return '#/cart';
    case 'checkout':
      return '#/checkout';
    case 'orders':
      return '#/orders';
    case 'wishlist':
      return '#/wishlist';
    case 'search':
      return '#/search';
    case 'profile':
      return '#/profile';
    case 'auth':
      return '#/auth';
    case 'bulk':
      return '#/bulk';
    case 'admin':
      return '#/admin';
    case 'success':
      return '#/success';
    case 'pending_payment':
      return '#/pending_payment';
    default:
      return '#/home';
  }
};

export const parseHash = (hash: string): { page: ActivePage; param?: string | number } => {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean || clean === 'landing') return { page: 'landing' };

  const [route, ...rest] = clean.split('/');
  const rawParam = rest.join('/');

  switch (route) {
    case 'home':
      return { page: 'home' };
    case 'product':
    case 'detail': {
      const parsedId = parseInt(rawParam, 10);
      return { page: 'product', param: !isNaN(parsedId) ? parsedId : rawParam || undefined };
    }
    case 'viewall':
    case 'category':
      return { page: 'viewall', param: rawParam || 'all' };
    case 'cart':
      return { page: 'cart' };
    case 'checkout':
      return { page: 'checkout' };
    case 'orders':
      return { page: 'orders' };
    case 'wishlist':
      return { page: 'wishlist' };
    case 'search':
      return { page: 'search' };
    case 'profile':
      return { page: 'profile' };
    case 'auth':
      return { page: 'auth' };
    case 'bulk':
      return { page: 'bulk' };
    case 'admin':
      return { page: 'admin' };
    case 'success':
      return { page: 'success' };
    case 'pending_payment':
      return { page: 'pending_payment' };
    default:
      return { page: 'home' };
  }
};

const getInitialNavigation = (): { page: ActivePage; param?: string | number } => {
  try {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('product') || params.get('productId');
    const viewParam = params.get('view');
    const catParam = params.get('category');

    if (prodId) {
      const parsed = parseInt(prodId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return { page: 'product', param: parsed };
      }
    }
    if (catParam) {
      return { page: 'viewall', param: catParam };
    }
    if (
      viewParam &&
      ['landing', 'home', 'viewall', 'bulk', 'profile', 'cart', 'orders', 'wishlist', 'search', 'auth', 'admin'].includes(
        viewParam
      )
    ) {
      return { page: viewParam as ActivePage };
    }

    if (window.location.hash) {
      return parseHash(window.location.hash);
    }
  } catch (e) {
    console.error('Error determining initial route:', e);
  }
  return { page: 'landing' };
};

export default function App() {
  // Navigation states synchronized with URL hash and browser history
  const initialNav = getInitialNavigation();
  const [page, setPage] = useState<ActivePage>(initialNav.page);
  const [pageParam, setPageParam] = useState<string | number | undefined>(initialNav.param);
  const [historyStack, setHistoryStack] = useState<NavigationState[]>([
    { page: initialNav.page, param: initialNav.param }
  ]);

  // Core app synchronized states with localStorage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sneh_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('sneh_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sneh_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [buyNowCart, setBuyNowCart] = useState<CartItem[] | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sneh_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to localStorage:', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('sneh_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('sneh_recent_searches', JSON.stringify(recentSearches));
    } catch (e) {
      console.error('Error saving recent searches to localStorage:', e);
    }
  }, [recentSearches]);

  // Home Filters & UI Controllers
  const [activeHomeCategory, setActiveHomeCategory] = useState<string>('all');
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProductsList(data || []))
      .catch(err => console.error('App products load error:', err));
  }, [page]);

  // 1. Initial State Sync & Browser History popstate Listener
  useEffect(() => {
    // 1a. Sync initial browser history entry with the active route
    const currentHash = window.location.hash;
    const targetUrl = getPageUrl(page, pageParam);
    if (!currentHash || currentHash === '#/' || currentHash === '') {
      window.history.replaceState({ page, param: pageParam, scrollPos: window.scrollY }, '', targetUrl);
    } else {
      window.history.replaceState({ page, param: pageParam, scrollPos: window.scrollY }, '', currentHash);
    }

    // 1b. Listen for browser back / forward buttons and mobile back gesture
    const handlePopState = (event: PopStateEvent) => {
      // Close drawer or chatbot if open
      setDrawerOpen(false);
      setChatbotOpen(false);

      let targetPage: ActivePage = 'home';
      let targetParam: string | number | undefined = undefined;
      let targetScroll = 0;

      if (event.state && event.state.page) {
        targetPage = event.state.page;
        targetParam = event.state.param;
        targetScroll = event.state.scrollPos || 0;
      } else if (window.location.hash) {
        const parsed = parseHash(window.location.hash);
        targetPage = parsed.page;
        targetParam = parsed.param;
      } else {
        targetPage = 'landing';
      }

      if (targetPage !== 'checkout') {
        setBuyNowCart(null);
      }

      setPage(targetPage);
      setPageParam(targetParam);

      setHistoryStack((prev) => {
        if (prev.length > 1) {
          const updated = [...prev];
          updated.pop();
          return updated;
        }
        return [{ page: targetPage, param: targetParam }];
      });

      // Restore scroll position smoothly
      if (targetScroll > 0) {
        let attempts = 0;
        const interval = setInterval(() => {
          window.scrollTo(0, targetScroll);
          attempts++;
          if (attempts >= 8 || Math.abs(window.scrollY - targetScroll) < 10) {
            clearInterval(interval);
          }
        }, 50);
      } else {
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 20);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 2. Read Auth Token
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sneh_user_token') || localStorage.getItem('laxmi_user_token');
      if (storedToken) {
        setToken(storedToken);
        fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((userData) => {
            if (userData) setUser(userData);
          })
          .catch((err) => console.error('Error fetching user profile from database:', err));
      }
    } catch (e) {
      console.error('Error reading auth token', e);
    }
  }, []);

  // 3. Navigation Actions
  const handleNavigate = (targetPage: ActivePage, param?: string | number, replace = false) => {
    if (targetPage !== 'checkout') {
      setBuyNowCart(null);
    }

    // Close any open drawer or chatbot on forward navigation
    setDrawerOpen(false);
    setChatbotOpen(false);

    // If clicking on the exact same page & param, smoothly scroll to top without adding duplicate history
    if (targetPage === page && param === pageParam) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const currentScroll = window.scrollY;
    const currentUrl = window.location.hash || getPageUrl(page, pageParam);

    // Save scroll position for the current entry in window.history
    try {
      window.history.replaceState(
        { page, param: pageParam, scrollPos: currentScroll },
        '',
        currentUrl
      );
    } catch (e) {
      console.error('Error updating current history state:', e);
    }

    const nextUrl = getPageUrl(targetPage, param);
    const nextState = { page: targetPage, param, scrollPos: 0 };

    if (replace) {
      window.history.replaceState(nextState, '', nextUrl);
    } else {
      window.history.pushState(nextState, '', nextUrl);
    }

    setHistoryStack((prev) => {
      if (replace) {
        const updated = [...prev];
        updated[updated.length - 1] = nextState;
        return updated;
      }
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          scrollPos: currentScroll
        };
      }
      return [...updated, nextState];
    });

    setPage(targetPage);
    setPageParam(param);

    // Scroll to top for forward navigation
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 20);
  };

  const handleBack = () => {
    setBuyNowCart(null);
    setDrawerOpen(false);
    setChatbotOpen(false);

    // If there is browser history within our app, trigger browser back so history and state stay 100% in sync
    if (historyStack.length > 1) {
      window.history.back();
    } else {
      // Fallback: If landed directly on a subpage, navigate to home
      handleNavigate('home');
    }
  };

  // 3. User Actions Helper Actions (Cart, Wishlist, Notifications)
  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimer) clearTimeout(toastTimer);

    const timer = setTimeout(() => {
      setToastMsg(null);
    }, 2500);
    setToastTimer(timer);
  };

  const handleAddToCart = (id: number, colour?: string) => {
    const parentProd = productsList.find((x) => x.id === id) || products.find((x) => x.id === id);
    if (!parentProd) return;

    const chosenColour = colour || parentProd.colour;
    const existingIdx = cart.findIndex((it) => it.id === id && it.colour === chosenColour);

    // Get active stock
    const currentStock = parentProd.stock !== undefined ? parentProd.stock : 10;
    const existingQty = existingIdx > -1 ? cart[existingIdx].qty : 0;

    if (existingQty >= currentStock) {
      showToast(`Cannot add: only ${currentStock} item(s) available in stock.`);
      return;
    }

    let updatedCart = [...cart];
    if (existingIdx > -1) {
      updatedCart[existingIdx] = {
        ...updatedCart[existingIdx],
        qty: updatedCart[existingIdx].qty + 1
      };
    } else {
      updatedCart.push({
        id,
        name: parentProd.name,
        price: parentProd.price,
        fabric: parentProd.fabric,
        colour: chosenColour,
        qty: 1
      });
    }

    setCart(updatedCart);
    showToast('Added to cart');
  };

  const handleUpdateCartQty = (index: number, delta: number) => {
    let updatedCart = [...cart];
    const item = updatedCart[index];
    const parentProd = productsList.find((x) => x.id === item.id) || products.find((x) => x.id === item.id);
    const maxStock = parentProd && parentProd.stock !== undefined ? parentProd.stock : 10;

    if (delta > 0 && item.qty + delta > maxStock) {
      showToast(`Cannot increment: only ${maxStock} items available in stock.`);
      return;
    }

    updatedCart[index].qty += delta;

    if (updatedCart[index].qty <= 0) {
      updatedCart.splice(index, 1);
    }

    setCart(updatedCart);
  };

  const handleRemoveCartItem = (index: number) => {
    let updatedCart = [...cart];
    updatedCart.splice(index, 1);

    setCart(updatedCart);
    showToast('Item removed from cart');
  };

  const getResolvedCart = (): CartItem[] => {
    return cart.map((item) => {
      const product = productsList.find((p) => p.id === item.id);
      if (!product) return item;

      // Find variant image matching colour
      const variant = product.variants?.find(
        (v) => v.colour.toLowerCase() === item.colour.toLowerCase()
      );
      const imageUrl = variant?.image || product.image;

      // Find updated price
      const price = product.discountPrice !== undefined && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

      return {
        ...item,
        price,
        image: imageUrl
      };
    });
  };

  const handleToggleWishlist = (id: number) => {
    let updatedWishlist = [...wishlist];
    if (wishlist.includes(id)) {
      updatedWishlist = updatedWishlist.filter((x) => x !== id);
      showToast('Removed from wishlist');
    } else {
      updatedWishlist.push(id);
      showToast('Added to wishlist');
    }

    setWishlist(updatedWishlist);
  };

  const handleOrderConfirmed = (finalizedOrder: Order) => {
    // 1. Add order to user state logs
    const updatedOrders = [finalizedOrder, ...orders];
    setOrders(updatedOrders);

    // 2. Set as success target
    setCurrentOrder(finalizedOrder);

    // 3. Clear cart (only if it was a regular cart order, not a buy-now)
    if (!buyNowCart) {
      setCart([]);
    }

    // 4. Always clear buyNowCart after order
    setBuyNowCart(null);
  };

  // Buy Now: go straight to checkout with just this one product, skipping the cart
  const handleBuyNow = (id: number, colour?: string, directProduct?: Product) => {
    const prod = directProduct || productsList.find((x) => x.id === id);
    if (!prod) return;
    const chosenColour = colour || prod.colour;
    const price = prod.discountPrice && prod.discountPrice > 0 ? prod.discountPrice : prod.price;
    const variant = prod.variants?.find((v) => v.colour.toLowerCase() === chosenColour.toLowerCase());
    const imageUrl = variant?.image || prod.image;
    setBuyNowCart([{ id: prod.id, name: prod.name, price, fabric: prod.fabric, colour: chosenColour, qty: 1, image: imageUrl }]);
    handleNavigate('checkout');
  };

  // Recent Search controls
  const handleAddRecentSearch = (term: string) => {
    if (!term.trim() || recentSearches.includes(term.trim())) return;
    const updated = [term.trim(), ...recentSearches.slice(0, 4)];
    setRecentSearches(updated);
  };

  const handleRemoveRecentSearch = (index: number) => {
    const updated = [...recentSearches];
    updated.splice(index, 1);
    setRecentSearches(updated);
  };

  const handleLoginSuccess = (userToken: string, userProfile: UserProfile) => {
    setToken(userToken);
    setUser(userProfile);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sneh_user_token');
    localStorage.removeItem('laxmi_user_token');
    setOrders([]);
    showToast('Logged out successfully.');
  };

  const fetchCustomerOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    }
  };

  useEffect(() => {
    if (page === 'orders' || page === 'profile') {
      fetchCustomerOrders();
    }
  }, [token, page]);

  // WhatsApp Floating direct service launcher
  const handleWhatsAppAction = () => {
    try {
      window.open(
        `https://wa.me/${BUSINESS_WHATSAPP || '919461037123'}?text=Namaste%20Snehsarees!%20I%20would%20like%20to%20know%20more%20about%20your%20sarees.`,
        '_blank'
      );
    } catch (e) {
      console.error('WhatsApp redirect error:', e);
      showToast('Redirect blocked. Please enable popups or use a new tab.');
    }
  };

  // Calculate cart badge numbers
  const cartBadgeCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // 4. Render active routes view controllers
  const renderViewContent = () => {
    switch (page) {
      case 'landing':
        return <LandingView onNavigate={handleNavigate} user={user} />;

      case 'home':
        return (
          <HomeView
            onNavigate={handleNavigate}
            onOpenDrawer={() => setDrawerOpen(true)}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            cartCount={cartBadgeCount}
            wishlist={wishlist}
            activeHomeCategory={activeHomeCategory}
            onSetCategory={setActiveHomeCategory}
            user={user}
          />
        );

      case 'search':
        return (
          <SearchView
            onNavigate={handleNavigate}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            wishlist={wishlist}
            recentSearches={recentSearches}
            onAddRecentSearch={handleAddRecentSearch}
            onRemoveRecentSearch={handleRemoveRecentSearch}
            recentlyViewed={recentlyViewed}
            onBack={handleBack}
          />
        );

      case 'viewall':
        return (
          <ViewAllView
            onNavigate={handleNavigate}
            onBack={handleBack}
            activeType={String(pageParam || 'all')}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            wishlist={wishlist}
            cartCount={cartBadgeCount}
          />
        );

      case 'product':
        return (
          <ProductDetailView
            productId={Number(pageParam || 1)}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            wishlist={wishlist}
            cartCount={cartBadgeCount}
            token={token}
            user={user}
          />
        );

      case 'cart':
        return (
          <CartView
            cart={getResolvedCart()}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onChangeQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            user={user}
          />
        );

      case 'checkout':
        return (
          <CheckoutView
            cart={buyNowCart || getResolvedCart()}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onOrderConfirm={handleOrderConfirmed}
            showToast={showToast}
            token={token}
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
            }}
          />
        );

      case 'success':
        return <SuccessView order={currentOrder} onNavigate={handleNavigate} />;

      case 'pending_payment':
        return <PendingPaymentView order={currentOrder} onNavigate={handleNavigate} />;

      case 'wishlist':
        return (
          <WishlistView
            wishlist={wishlist}
            onNavigate={handleNavigate}
            onBack={handleBack}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            productsList={productsList}
          />
        );

      case 'orders':
        return (
          <OrdersView
            orders={orders}
            onNavigate={handleNavigate}
            onBack={handleBack}
            userToken={token || undefined}
            showToast={showToast}
            onRefreshOrders={fetchCustomerOrders}
            productsList={productsList}
            onLoginClick={() => handleNavigate('auth')}
          />
        );

      case 'profile':
        return (
          <ProfileView
            onNavigate={handleNavigate}
            onBack={handleBack}
            showToast={showToast}
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
            }}
            onLogout={handleLogout}
            token={token}
          />
        );

      case 'auth':
        return (
          <AuthView
            onNavigate={handleNavigate}
            onBack={handleBack}
            onLoginSuccess={handleLoginSuccess}
            showToast={showToast}
            redirectTo={pageParam === 'checkout' ? 'checkout' : undefined}
          />
        );

      case 'bulk':
        return <BulkView onNavigate={handleNavigate} onBack={handleBack} showToast={showToast} />;

      case 'admin':
        // Security gate: only the store owner email may see the admin page at all
        if (!user || user.email?.toLowerCase() !== 'info@snehsarees.in') {
          // Silently redirect — no login screen shown to any other user
          setTimeout(() => handleNavigate('landing'), 0);
          return <LandingView onNavigate={handleNavigate} user={user} />;
        }
        return (
          <AdminDashboardView
            onNavigate={handleNavigate}
            onBack={handleBack}
            showToast={showToast}
            adminToken={token}
          />
        );

      default:
        return <LandingView onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <div className={`relative font-sans antialiased text-[#1A1A1A] max-w-[430px] md:max-w-full mx-auto min-h-screen ${page === 'landing' ? 'bg-ivory' : ''}`}>
      {/* Background for shopping website (all pages except landing) */}
      {page !== 'landing' ? (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {/* Balanced ambient saree flatlay background */}
          <div
            className="w-full h-full bg-cover bg-no-repeat opacity-[0.38] sm:opacity-[0.44] transition-opacity duration-300"
            style={{
              backgroundImage: `url(${bgImage})`,
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center top',
              backgroundSize: 'cover',
            }}
          />
          {/* Gentle soft wash so foreground text and elements stay clearly in the spotlight */}
          <div className="absolute inset-0 bg-[#FFFDF9]/30" />
        </div>
      ) : (
        /* Global subtle warm gradient watermark background for landing page */
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] z-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="global-maroon-jaal" width="140" height="140" patternUnits="userSpaceOnUse">
                {/* Thin warm lines */}
                <path d="M 0,0 L 140,140 M 140,0 L 0,140" fill="none" stroke="#C4601A" strokeWidth="0.8" opacity="0.3" />

                {/* Stylized Lotus Buti in warm coral */}
                <g transform="translate(70, 70) scale(0.6)">
                  <path d="M -15,-5 C -10,10 10,10 15,-5 C 10,-2 -10,-2 -15,-5 Z" fill="none" stroke="#C4601A" strokeWidth="1.2" />
                  <path d="M 0,-5 C -15,-30 -30,-25 -35,-15 C -25,-10 -10,-8 0,-5 Z" fill="none" stroke="#C4601A" strokeWidth="1" />
                  <path d="M 0,-5 C 15,-30 30,-25 35,-15 C 25,-10 10,-8 0,-5 Z" fill="none" stroke="#C4601A" strokeWidth="1" />
                  <path d="M 0,-5 C -8,-35 8,-35 0,-5 Z" fill="none" stroke="#C4601A" strokeWidth="1.2" />
                </g>
                <circle cx="0" cy="0" r="1.5" fill="#C4601A" opacity="0.6" />
                <circle cx="140" cy="0" r="1.5" fill="#C4601A" opacity="0.6" />
                <circle cx="0" cy="140" r="1.5" fill="#C4601A" opacity="0.6" />
                <circle cx="140" cy="140" r="1.5" fill="#C4601A" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#global-maroon-jaal)" />
          </svg>
        </div>
      )}

      {/* Dynamic contents */}
      <div className="relative z-[1]">
        {renderViewContent()}
      </div>

      {/* Hamburger Menu Side panel */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigate}
        showToast={showToast}
        user={user}
        onLogout={handleLogout}
      />

      {/* FLOATING ACTION PILLS: WhatsApp + Chatbot Assistant */}
      <div className={`floating-actions fixed right-4 ${['home', 'viewall', 'orders', 'profile', 'wishlist', 'search', 'bulk', 'cart'].includes(page)
        ? 'bottom-[80px] md:bottom-[92px]'
        : 'bottom-4'
        } flex flex-col items-center gap-2.5 z-[100]`}>
        <button
          onClick={handleWhatsAppAction}
          className="fab fab-whatsapp w-12 h-12 rounded-full bg-[#25D366] shrink-0 shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          title="Contact us via WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-[26px] h-[26px]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.643a.5.5 0 00.624.603l5.939-1.56A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 01-5.031-1.378l-.36-.214-3.733.981.998-3.648-.235-.374A9.86 9.86 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z" />
          </svg>
        </button>
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="fab fab-chat w-12 h-12 rounded-full bg-[#C4601A] shrink-0 shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all text-white hover:bg-[#FFF0E8]"
          title="Chat with Assistant"
        >
          <MessageSquare className="w-5.5 h-5.5 text-white" />
        </button>
      </div>

      {/* Stateful Rule-Based Intelligent Chat Assistant popup */}
      <Chatbot
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        onNavigate={handleNavigate}
        onSetCategory={setActiveHomeCategory}
        showToast={showToast}
      />

      {/* Dynamic System wide Toast Notification banner overlay */}
      {toastMsg && (
        <div
          id="toast"
          className={`toast fixed ${['home', 'viewall', 'orders', 'profile', 'wishlist', 'search', 'bulk', 'cart'].includes(page)
            ? 'bottom-[80px] md:bottom-[92px]'
            : 'bottom-4'
            } left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white py-3 px-6 rounded-full text-xs font-semibold z-[300] pointer-events-none transition-all duration-300 opacity-100 shadow-xl`}
        >
          {toastMsg}
        </div>
      )}

      {/* Global Bottom Navigation Bar */}
      {['home', 'viewall', 'orders', 'profile', 'wishlist', 'search', 'bulk', 'cart'].includes(page) && (
        <div className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-full h-[64px] md:h-[60px] lg:h-[60px] bg-white/95 backdrop-blur-md border-t border-[#E8E0D5] flex items-center z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => handleNavigate('home')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${page === 'home' ? 'text-[#C4601A]' : 'text-[#888888] hover:text-[#C4601A]'
              } transition-colors cursor-pointer`}
          >
            <Home className={`w-5.5 h-5.5 ${page === 'home' ? 'text-[#C4601A]' : ''}`} />
            <span className="text-[10px] md:text-xs">Home</span>
          </button>
          <button
            onClick={() => handleNavigate('wishlist')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${page === 'wishlist' ? 'text-[#C4601A]' : 'text-[#888888] hover:text-[#C4601A]'
              } transition-colors cursor-pointer`}
          >
            <Heart className={`w-5.5 h-5.5 ${page === 'wishlist' ? 'text-[#C4601A] fill-[#C4601A]' : ''}`} />
            <span className="text-[10px] md:text-xs">Wishlist</span>
          </button>
          <button
            onClick={() => handleNavigate('orders')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${page === 'orders' ? 'text-[#C4601A]' : 'text-[#888888] hover:text-[#C4601A]'
              } transition-colors cursor-pointer`}
          >
            <ShoppingBag className={`w-5.5 h-5.5 ${page === 'orders' ? 'text-[#C4601A]' : ''}`} />
            <span className="text-[10px] md:text-xs">My Orders</span>
          </button>
          <button
            onClick={() => handleNavigate('cart')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${page === 'cart' ? 'text-[#C4601A]' : 'text-[#888888] hover:text-[#C4601A]'
              } transition-colors cursor-pointer relative`}
          >
            <div className="relative">
              <ShoppingCart className={`w-5.5 h-5.5 ${page === 'cart' ? 'text-[#C4601A]' : ''}`} />
              {cartBadgeCount > 0 && (
                <span className="cart-badge absolute -top-1.5 -right-2 bg-[#C4601A] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {cartBadgeCount > 9 ? '9+' : cartBadgeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] md:text-xs">Cart</span>
          </button>
          <button
            onClick={() => handleNavigate('bulk')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${page === 'bulk' ? 'text-[#C4601A]' : 'text-[#888888] hover:text-[#C4601A]'
              } transition-colors cursor-pointer`}
          >
            <Package className={`w-5.5 h-5.5 ${page === 'bulk' ? 'text-[#C4601A]' : ''}`} />
            <span className="text-[10px] md:text-xs">Bulk Order</span>
          </button>
        </div>
      )}
    </div>
  );
}

