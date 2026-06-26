import { useState, useEffect } from 'react';
import { ActivePage, CartItem, Order } from './types';
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
import { WishlistView } from './components/views/WishlistView';
import { OrdersView } from './components/views/OrdersView';
import { ProfileView } from './components/views/ProfileView';
import { BulkView } from './components/views/BulkView';
import { KnowledgeView } from './components/views/KnowledgeView';


// Icon imports for floating actions & bottom navigation
import { MessageSquare, Home, Grid, ShoppingBag, User } from 'lucide-react';

interface NavigationState {
  page: ActivePage;
  param?: string | number;
}

export default function App() {
  // Navigation states
  const [page, setPage] = useState<ActivePage>('landing');
  const [pageParam, setPageParam] = useState<string | number | undefined>(undefined);
  const [historyStack, setHistoryStack] = useState<NavigationState[]>([{ page: 'landing' }]);

  // Core app synchronized states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Red Silk',
    'Banarasi',
    'Wedding Saree'
  ]);
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Home Filters & UI Controllers
  const [activeHomeCategory, setActiveHomeCategory] = useState<string>('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<NodeJS.Timeout | null>(null);

  const safeSetLocalStorage = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage setItem failed for key: ${key}`, e);
    }
  };

  // 1. Initial State Hydration from Local Storage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('laxmi_cart');
      if (storedCart) setCart(JSON.parse(storedCart));

      const storedWishlist = localStorage.getItem('laxmi_wishlist');
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

      const storedRecent = localStorage.getItem('laxmi_recent_searches');
      if (storedRecent) setRecentSearches(JSON.parse(storedRecent));

      const storedViewed = localStorage.getItem('laxmi_recently_viewed');
      if (storedViewed) setRecentlyViewed(JSON.parse(storedViewed));

      const storedOrders = localStorage.getItem('laxmi_orders');
      if (storedOrders) setOrders(JSON.parse(storedOrders));
    } catch (e) {
      console.error('Error hydrating localStorage state', e);
    }
  }, []);

  // 2. Navigation Actions
  const handleNavigate = (targetPage: ActivePage, param?: string | number) => {
    setPage(targetPage);
    setPageParam(param);

    // Append to navigate stack history
    setHistoryStack((prev) => [...prev, { page: targetPage, param }]);
  };

  const handleBack = () => {
    if (historyStack.length <= 1) {
      // Return to main catalogue shop view
      handleNavigate('home');
      return;
    }

    // Pop current page and view the previous one
    const updated = [...historyStack];
    updated.pop(); // Remove active
    const prev = updated[updated.length - 1];

    setPage(prev.page);
    setPageParam(prev.param);
    setHistoryStack(updated);
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
    const parentProd = products.find((x) => x.id === id);
    if (!parentProd) return;

    const chosenColour = colour || parentProd.colour;
    const existingIdx = cart.findIndex((it) => it.id === id && it.colour === chosenColour);

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
    safeSetLocalStorage('laxmi_cart', JSON.stringify(updatedCart));
    showToast('Added to cart');
  };

  const handleUpdateCartQty = (index: number, delta: number) => {
    let updatedCart = [...cart];
    updatedCart[index].qty += delta;

    if (updatedCart[index].qty <= 0) {
      updatedCart.splice(index, 1);
    }

    setCart(updatedCart);
    safeSetLocalStorage('laxmi_cart', JSON.stringify(updatedCart));
  };

  const handleRemoveCartItem = (index: number) => {
    let updatedCart = [...cart];
    updatedCart.splice(index, 1);

    setCart(updatedCart);
    safeSetLocalStorage('laxmi_cart', JSON.stringify(updatedCart));
    showToast('Item removed from cart');
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
    safeSetLocalStorage('laxmi_wishlist', JSON.stringify(updatedWishlist));
  };

  const handleOrderConfirmed = (finalizedOrder: Order) => {
    // 1. Add order to user state logs
    const updatedOrders = [finalizedOrder, ...orders];
    setOrders(updatedOrders);
    safeSetLocalStorage('laxmi_orders', JSON.stringify(updatedOrders));

    // 2. Set as success target
    setCurrentOrder(finalizedOrder);

    // 3. Clear cart
    setCart([]);
    safeSetLocalStorage('laxmi_cart', JSON.stringify([]));
  };

  // Recent Search controls
  const handleAddRecentSearch = (term: string) => {
    if (!term.trim() || recentSearches.includes(term.trim())) return;
    const updated = [term.trim(), ...recentSearches.slice(0, 4)];
    setRecentSearches(updated);
    safeSetLocalStorage('laxmi_recent_searches', JSON.stringify(updated));
  };

  const handleRemoveRecentSearch = (index: number) => {
    const updated = [...recentSearches];
    updated.splice(index, 1);
    setRecentSearches(updated);
    safeSetLocalStorage('laxmi_recent_searches', JSON.stringify(updated));
  };

  // WhatsApp Floating direct service launcher
  const handleWhatsAppAction = () => {
    try {
      window.open(
        'https://wa.me/919414067123?text=Namaste%20Snehsarees!%20I%20would%20like%20to%20know%20more%20about%20your%20sarees.',
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
        return <LandingView onNavigate={handleNavigate} />;

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
          />
        );

      case 'search':
        return (
          <SearchView
            onNavigate={handleNavigate}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
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
            activeType={String(pageParam || 'all')}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            cartCount={cartBadgeCount}
          />
        );

      case 'product':
        return (
          <ProductDetailView
            productId={Number(pageParam || 1)}
            onNavigate={handleNavigate}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            cartCount={cartBadgeCount}
          />
        );

      case 'cart':
        return (
          <CartView
            cart={cart}
            onNavigate={handleNavigate}
            onChangeQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
          />
        );

      case 'checkout':
        return (
          <CheckoutView
            cart={cart}
            onNavigate={handleNavigate}
            onOrderConfirm={handleOrderConfirmed}
            showToast={showToast}
          />
        );

      case 'success':
        return <SuccessView order={currentOrder} onNavigate={handleNavigate} />;

      case 'wishlist':
        return (
          <WishlistView
            wishlist={wishlist}
            onNavigate={handleNavigate}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
          />
        );

      case 'orders':
        return <OrdersView orders={orders} onNavigate={handleNavigate} />;

      case 'profile':
        return <ProfileView onNavigate={handleNavigate} showToast={showToast} />;

      case 'bulk':
        return <BulkView onNavigate={handleNavigate} onBack={handleBack} showToast={showToast} />;

      case 'knowledge':
        return <KnowledgeView onNavigate={handleNavigate} onBack={handleBack} />;

      default:
        return <LandingView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative font-sans antialiased text-[#1A1A1A] max-w-[430px] md:max-w-full mx-auto bg-ivory min-h-screen">
      {/* Global subtle Maroon Pattern watermark background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035] z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="global-maroon-jaal" width="140" height="140" patternUnits="userSpaceOnUse">
              {/* Thin maroon lines */}
              <path d="M 0,0 L 140,140 M 140,0 L 0,140" fill="none" stroke="#7B1C2E" strokeWidth="0.8" opacity="0.3" />
              
              {/* Stylized Lotus Buti in maroon */}
              <g transform="translate(70, 70) scale(0.6)">
                <path d="M -15,-5 C -10,10 10,10 15,-5 C 10,-2 -10,-2 -15,-5 Z" fill="none" stroke="#7B1C2E" strokeWidth="1.2" />
                <path d="M 0,-5 C -15,-30 -30,-25 -35,-15 C -25,-10 -10,-8 0,-5 Z" fill="none" stroke="#7B1C2E" strokeWidth="1" />
                <path d="M 0,-5 C 15,-30 30,-25 35,-15 C 25,-10 10,-8 0,-5 Z" fill="none" stroke="#7B1C2E" strokeWidth="1" />
                <path d="M 0,-5 C -8,-35 8,-35 0,-5 Z" fill="none" stroke="#7B1C2E" strokeWidth="1.2" />
              </g>
              <circle cx="0" cy="0" r="1.5" fill="#7B1C2E" opacity="0.6" />
              <circle cx="140" cy="0" r="1.5" fill="#7B1C2E" opacity="0.6" />
              <circle cx="0" cy="140" r="1.5" fill="#7B1C2E" opacity="0.6" />
              <circle cx="140" cy="140" r="1.5" fill="#7B1C2E" opacity="0.6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#global-maroon-jaal)" />
        </svg>
      </div>

      {/* Dynamic contents */}
      {renderViewContent()}

      {/* Hamburger Menu Side panel */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNavigate}
        showToast={showToast}
      />

      {/* FLOATING ACTION PILLS: WhatsApp + Chatbot Assistant */}
      <div className={`floating-actions fixed right-4 ${
        ['home', 'viewall', 'orders', 'profile', 'wishlist', 'search'].includes(page)
          ? 'bottom-[80px] md:bottom-[92px]'
          : 'bottom-4'
      } flex flex-col items-center gap-2.5 z-[100]`}>
        <button
          onClick={handleWhatsAppAction}
          className="fab fab-whatsapp w-12 h-12 rounded-full bg-[#25D366] shrink-0 shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          title="Contact us via WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="white" className="w-[26px] h-[26px]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.857L.057 23.643a.5.5 0 00.624.603l5.939-1.56A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.878 9.878 0 01-5.031-1.378l-.36-.214-3.733.981.998-3.648-.235-.374A9.86 9.86 0 012.1 12C2.1 6.533 6.533 2.1 12 2.1S21.9 6.533 21.9 12 17.467 21.9 12 21.9z"/>
          </svg>
        </button>
        <button
          onClick={() => setChatbotOpen(!chatbotOpen)}
          className="fab fab-chat w-12 h-12 rounded-full bg-[#7B1C2E] shrink-0 shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-all text-white hover:bg-[#9B2840]"
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
          className={`toast fixed ${
            ['home', 'viewall', 'orders', 'profile', 'wishlist', 'search'].includes(page)
              ? 'bottom-[80px] md:bottom-[92px]'
              : 'bottom-4'
          } left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white py-3 px-6 rounded-full text-xs font-semibold z-[300] pointer-events-none transition-all duration-300 opacity-100 shadow-xl`}
        >
          {toastMsg}
        </div>
      )}

      {/* Global Bottom Navigation Bar */}
      {['home', 'viewall', 'orders', 'profile', 'wishlist', 'search'].includes(page) && (
        <div className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-full h-[64px] md:h-[60px] lg:h-[60px] bg-white border-t border-[#E8E0D5] flex items-center z-20 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
          <button
            onClick={() => handleNavigate('home')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${
              page === 'home' ? 'text-[#7B1C2E]' : 'text-[#888888] hover:text-[#7B1C2E]'
            } transition-colors cursor-pointer`}
          >
            <Home className={`w-5.5 h-5.5 ${page === 'home' ? 'text-[#7B1C2E]' : ''}`} />
            <span className="text-[10px] md:text-xs">Home</span>
          </button>
          <button
            onClick={() => handleNavigate('viewall', 'all')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${
              page === 'viewall' ? 'text-[#7B1C2E]' : 'text-[#888888] hover:text-[#7B1C2E]'
            } transition-colors cursor-pointer`}
          >
            <Grid className={`w-5.5 h-5.5 ${page === 'viewall' ? 'text-[#7B1C2E]' : ''}`} />
            <span className="text-[10px] md:text-xs">Categories</span>
          </button>
          <button
            onClick={() => handleNavigate('orders')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${
              page === 'orders' ? 'text-[#7B1C2E]' : 'text-[#888888] hover:text-[#7B1C2E]'
            } transition-colors cursor-pointer`}
          >
            <ShoppingBag className={`w-5.5 h-5.5 ${page === 'orders' ? 'text-[#7B1C2E]' : ''}`} />
            <span className="text-[10px] md:text-xs">My Orders</span>
          </button>
          <button
            onClick={() => handleNavigate('profile')}
            className={`bottom-nav-item flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-semibold ${
              page === 'profile' ? 'text-[#7B1C2E]' : 'text-[#888888] hover:text-[#7B1C2E]'
            } transition-colors cursor-pointer`}
          >
            <User className={`w-5.5 h-5.5 ${page === 'profile' ? 'text-[#7B1C2E]' : ''}`} />
            <span className="text-[10px] md:text-xs">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
}
