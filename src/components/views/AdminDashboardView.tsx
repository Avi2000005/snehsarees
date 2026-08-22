import React, { useState, useEffect } from 'react';
import { ActivePage, Product, Order, Category, OfferBanner, Coupon, Review, Reel, ReturnRequest } from '../../types';
import { Inquiry } from '../../../server/models/inquiry.model';
import { API_URL } from '../../config';
import {
  ArrowLeft, LogIn, Lock, Mail, LayoutDashboard, ShoppingBag,
  Users, Layers, Trash2, Edit3, PlusCircle, CheckCircle, RefreshCw, X, MapPin,
  Tag, MessageSquare, Film, RotateCcw
} from 'lucide-react';

interface AdminDashboardViewProps {
  onNavigate: (page: ActivePage) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onNavigate,
  onBack,
  showToast,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Security: session auto-expiry (4 hours)
  const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState('');

  // Dashboard Data
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inquiries' | 'categories' | 'banners' | 'coupons' | 'reviews' | 'reels' | 'returns'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<OfferBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [returnsList, setReturnsList] = useState<ReturnRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // CRUD / Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState('');
  const [prodFabric, setProdFabric] = useState('Silk');
  const [prodOccasion, setProdOccasion] = useState('Wedding');
  const [prodColour, setProdColour] = useState('Red');
  const [prodDesc, setProdDesc] = useState('');
  const [prodBlouse, setProdBlouse] = useState(true);
  const [prodImage, setProdImage] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodStock, setProdStock] = useState('10');
  const [prodReelUrl, setProdReelUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Banner state
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('Explore Now');
  const [bannerCtaLink, setBannerCtaLink] = useState('all');
  const [bannerBgFrom, setBannerBgFrom] = useState('#C4601A');
  const [bannerBgTo, setBannerBgTo] = useState('#C4601A');
  const [bannerSortOrder, setBannerSortOrder] = useState('0');
  const [bannerDiscountPercent, setBannerDiscountPercent] = useState('0');
  const [bannerCategoryId, setBannerCategoryId] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [uploadingBannerImage, setUploadingBannerImage] = useState(false);

  // Coupon state
  const [cpCode, setCpCode] = useState('');
  const [cpDesc, setCpDesc] = useState('');
  const [cpType, setCpType] = useState<'percent' | 'flat'>('percent');
  const [cpValue, setCpValue] = useState('');
  const [cpMinOrder, setCpMinOrder] = useState('0');
  const [cpCap, setCpCap] = useState('');
  const [cpLimit, setCpLimit] = useState('');
  const [cpPerUser, setCpPerUser] = useState('1');
  const [cpCatId, setCpCatId] = useState('');

  // Reel state
  const [reelProdId, setReelProdId] = useState('');
  const [reelVideoUrl, setReelVideoUrl] = useState('');
  const [reelThumbnailUrl, setReelThumbnailUrl] = useState('');
  const [reelCaption, setReelCaption] = useState('');
  const [reelSortOrder, setReelSortOrder] = useState('0');

  // Categories addition state
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatImage, setNewCatImage] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatHistory, setNewCatHistory] = useState('');
  const [newCatProperties, setNewCatProperties] = useState('');
  const [newCatCare, setNewCatCare] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [uploadingCatImage, setUploadingCatImage] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  // Custom Color and Variants states
  const [selectedAdminCategory, setSelectedAdminCategory] = useState('all');
  const [prodColourInputMode, setProdColourInputMode] = useState<'preset' | 'custom'>('preset');
  const [customColourVal, setCustomColourVal] = useState('');
  const [prodVariants, setProdVariants] = useState<{ colour: string; image: string }[]>([]);
  const [newVariantColour, setNewVariantColour] = useState('');
  const [newVariantImage, setNewVariantImage] = useState('');
  const [uploadingVariantImage, setUploadingVariantImage] = useState(false);

  // Address edit modal state
  const [editingOrderLocation, setEditingOrderLocation] = useState<Order | null>(null);
  const [newLocationAddress, setNewLocationAddress] = useState('');

  // Ship & Track modal state
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [shipTrackingId, setShipTrackingId] = useState('');
  const [shipCarrierName, setShipCarrierName] = useState('India Post');
  const [shipTrackingUrl, setShipTrackingUrl] = useState('');
  const [shipLoading, setShipLoading] = useState(false);

  // Check sessionStorage for active token
  useEffect(() => {
    const savedToken = sessionStorage.getItem('laxmi_admin_token');
    const savedExpiry = sessionStorage.getItem('laxmi_admin_expiry');
    if (savedToken && savedExpiry) {
      const expiryMs = parseInt(savedExpiry, 10);
      if (Date.now() < expiryMs) {
        setToken(savedToken);
        setSessionExpiresAt(expiryMs);
      } else {
        // Already expired — clear silently
        sessionStorage.removeItem('laxmi_admin_token');
        sessionStorage.removeItem('laxmi_admin_expiry');
        showToast('Admin session expired. Please log in again.');
      }
    } else if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  // Session expiry countdown tick
  useEffect(() => {
    if (!token || !sessionExpiresAt) return;
    const tick = () => {
      const msLeft = sessionExpiresAt - Date.now();
      if (msLeft <= 0) {
        handleLogout();
        showToast('Admin session expired. Please log in again.');
        return;
      }
      const hLeft = Math.floor(msLeft / 3600000);
      const mLeft = Math.floor((msLeft % 3600000) / 60000);
      const sLeft = Math.floor((msLeft % 60000) / 1000);
      setSessionTimeLeft(
        hLeft > 0 ? `${hLeft}h ${mLeft}m` : mLeft > 0 ? `${mLeft}m ${sLeft}s` : `${sLeft}s`
      );
    };
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [token, sessionExpiresAt]);

  // Fetch data when authenticated
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [resProd, resOrders, resInq, resCats, resBanners, resCoupons, resReviews, resReels, resReturns] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/admin/orders`, { headers }),
        fetch(`${API_URL}/api/admin/inquiries`, { headers }),
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/admin/banners`, { headers }),
        fetch(`${API_URL}/api/admin/coupons`, { headers }),
        fetch(`${API_URL}/api/admin/reviews`, { headers }),
        fetch(`${API_URL}/api/admin/reels`, { headers }),
        fetch(`${API_URL}/api/admin/returns`, { headers }),
      ]);

      // Check if any response is 401 Unauthorized
      const unauthorized = [resOrders, resInq, resBanners, resCoupons, resReviews, resReels, resReturns].some(r => r.status === 401);
      if (unauthorized) {
        handleLogout();
        showToast('Admin session expired or invalid. Please log in again.');
        return;
      }

      if (resProd.ok) setProducts(await resProd.json());
      if (resOrders.ok) setOrders(await resOrders.json());
      if (resInq.ok) setInquiries(await resInq.json());
      if (resCats.ok) setCategories(await resCats.json());
      if (resBanners.ok) setBanners(await resBanners.json());
      if (resCoupons.ok) setCoupons(await resCoupons.json());
      if (resReviews.ok) setReviewsList(await resReviews.json());
      if (resReels.ok) setReels(await resReels.json());
      if (resReturns.ok) setReturnsList(await resReturns.json());
    } catch (err) {
      showToast('Error loading dashboard data.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      if (!data.user || data.user.role !== 'admin') {
        throw new Error('Access denied. Administrator credentials required.');
      }

      const expiryMs = Date.now() + SESSION_DURATION_MS;
      sessionStorage.setItem('laxmi_admin_token', data.token);
      sessionStorage.setItem('laxmi_admin_expiry', String(expiryMs));
      setToken(data.token);
      setSessionExpiresAt(expiryMs);
      showToast('Successfully logged in as Admin!');
    } catch (err: any) {
      showToast(err.message || 'Invalid email or password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('laxmi_admin_token');
    sessionStorage.removeItem('laxmi_admin_expiry');
    setToken(null);
    setSessionExpiresAt(null);
    setSessionTimeLeft('');
    setEmail('');
    setPassword('');
    showToast('Logged out of Admin Portal.');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/admin/products/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setProdImage(data.imageUrl);
        showToast('Image uploaded successfully!');
      } else {
        showToast(data.error || 'Image upload failed.');
      }
    } catch (err) {
      showToast('Error uploading image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/api/admin/categories/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setNewCatImage(data.imageUrl);
        showToast('Category image uploaded!');
      } else {
        showToast(data.error || 'Image upload failed.');
      }
    } catch (err) {
      showToast('Error uploading category image.');
    } finally {
      setUploadingCatImage(false);
    }
  };

  const handleVariantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVariantImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/api/admin/products/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setNewVariantImage(data.imageUrl);
        showToast('Variant image uploaded!');
      } else {
        showToast(data.error || 'Variant image upload failed.');
      }
    } catch (err) {
      showToast('Error uploading variant image.');
    } finally {
      setUploadingVariantImage(false);
    }
  };

  const handleBannerImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBannerImage(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(`${API_URL}/api/admin/products/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setBannerImageUrl(data.imageUrl);
        showToast('Banner image uploaded successfully!');
      } else {
        showToast(data.error || 'Banner image upload failed.');
      }
    } catch (err) {
      showToast('Error uploading banner image.');
    } finally {
      setUploadingBannerImage(false);
    }
  };

  const handleAddVariant = () => {
    if (!newVariantColour.trim()) {
      showToast('Please enter a variant color name.');
      return;
    }
    if (!newVariantImage) {
      showToast('Please upload an image for this color variant.');
      return;
    }
    setProdVariants([...prodVariants, { colour: newVariantColour.trim(), image: newVariantImage }]);
    setNewVariantColour('');
    setNewVariantImage('');
  };

  const handleRemoveVariant = (index: number) => {
    setProdVariants(prodVariants.filter((_, i) => i !== index));
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) {
      showToast('Please enter a name and slug.');
      return;
    }
    setAddingCategory(true);
    try {
      const url = editingCatId
        ? `${API_URL}/api/admin/categories/${editingCatId}`
        : `${API_URL}/api/admin/categories`;
      const method = editingCatId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newCatName,
          slug: newCatSlug,
          imageUrl: newCatImage || undefined,
          description: newCatDescription || undefined,
          history: newCatHistory || undefined,
          properties: newCatProperties || undefined,
          care: newCatCare || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingCatId ? 'Category updated successfully!' : 'Category created successfully!');
        resetCategoryForm();
        fetchDashboardData();
      } else {
        showToast(data.error || 'Failed to save category.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    } finally {
      setAddingCategory(false);
    }
  };

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setNewCatName('');
    setNewCatSlug('');
    setNewCatImage('');
    setNewCatDescription('');
    setNewCatHistory('');
    setNewCatProperties('');
    setNewCatCare('');
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this category? Saree listings under this category will be unassigned.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast('Category deleted successfully.');
        fetchDashboardData();
      } else {
        showToast('Failed to delete category.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  // Product Actions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodPrice) {
      showToast('Please enter a name and price.');
      return;
    }

    const finalColour = prodColourInputMode === 'custom' ? customColourVal.trim() : prodColour;
    if (!finalColour) {
      showToast('Please specify a saree color.');
      return;
    }

    const payload = {
      name: prodName,
      price: parseFloat(prodPrice),
      discountPrice: prodDiscountPrice && prodDiscountPrice.trim() !== '' ? parseFloat(prodDiscountPrice) : null,
      fabric: prodFabric,
      occasion: prodOccasion,
      colour: finalColour,
      desc: prodDesc,
      blouse: prodBlouse,
      image: prodImage,
      stock: parseInt(prodStock, 10) || 0,
      categoryId: prodCategoryId ? parseInt(prodCategoryId, 10) : undefined,
      variants: prodVariants,
      tags: editingProduct ? editingProduct.tags : ['new'],
      reelUrl: prodReelUrl.trim() || null
    };

    try {
      const url = editingProduct
        ? `${API_URL}/api/admin/products/${editingProduct.id}`
        : `${API_URL}/api/admin/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setShowProductModal(false);
        resetProductForm();
        fetchDashboardData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to save product.');
      }
    } catch (err) {
      showToast('Error connecting to backend.');
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
    setProdFabric(p.fabric);
    setProdOccasion(p.occasion);

    const presets = ['Red', 'Royal Blue', 'Emerald', 'Deep Pink', 'Purple', 'Saffron', 'Teal', 'Maroon'];
    if (presets.includes(p.colour)) {
      setProdColourInputMode('preset');
      setProdColour(p.colour);
    } else {
      setProdColourInputMode('custom');
      setProdColour('Other');
      setCustomColourVal(p.colour);
    }

    setProdDesc(p.desc);
    setProdBlouse(p.blouse);
    setProdImage(p.image || '');
    setProdStock((p.stock ?? 10).toString());
    setProdCategoryId(p.categoryId ? p.categoryId.toString() : '');
    setProdVariants(p.variants || []);
    setProdReelUrl(p.reelUrl || '');
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this product from inventory?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast('Product deleted.');
        fetchDashboardData();
      } else {
        showToast('Failed to delete product.');
      }
    } catch (err) {
      showToast('Error connecting to backend.');
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdDiscountPrice('');
    setProdFabric('Silk');
    setProdOccasion('Wedding');
    setProdColour('Red');
    setProdColourInputMode('preset');
    setCustomColourVal('');
    setProdDesc('');
    setProdBlouse(true);
    setProdImage('');
    setProdStock('10');
    setProdCategoryId('');
    setProdVariants([]);
    setNewVariantColour('');
    setNewVariantImage('');
    setProdReelUrl('');
  };

  // Order Actions (Status and Address)
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast(`Order status updated to ${status}.`);
        fetchDashboardData();
      } else {
        showToast('Failed to update status.');
      }
    } catch (err) {
      showToast('Error updating order.');
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrderLocation || !newLocationAddress) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${editingOrderLocation.id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address: newLocationAddress }),
      });

      if (res.ok) {
        showToast('Order shipping location updated!');
        setEditingOrderLocation(null);
        setNewLocationAddress('');
        fetchDashboardData();
      } else {
        showToast('Failed to update address.');
      }
    } catch (err) {
      showToast('Error updating location.');
    }
  };

  // Ship & Track submit
  const handleShipOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder) return;
    if (!shipTrackingId.trim() || !shipCarrierName.trim()) {
      showToast('Please enter a tracking ID and select a carrier.');
      return;
    }
    setShipLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${shippingOrder.id}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          trackingId: shipTrackingId.trim(),
          carrierName: shipCarrierName,
          trackingUrl: shipTrackingUrl.trim() || getDefaultTrackingUrl(shipCarrierName, shipTrackingId.trim()),
        }),
      });

      if (res.ok) {
        showToast(`Order shipped! Tracking: ${shipTrackingId}`);
        setShippingOrder(null);
        setShipTrackingId('');
        setShipCarrierName('India Post');
        setShipTrackingUrl('');
        fetchDashboardData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update tracking.');
      }
    } catch (err) {
      showToast('Error saving tracking info.');
    } finally {
      setShipLoading(false);
    }
  };

  const getDefaultTrackingUrl = (carrier: string, awb: string): string => {
    switch (carrier) {
      case 'India Post': return `https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx`;
      case 'Delhivery': return `https://www.delhivery.com/track/package/${awb}`;
      case 'BlueDart': return `https://www.bluedart.com/tracking`;
      case 'DTDC': return `https://www.dtdc.in/tracking.asp`;
      case 'Shiprocket': return `https://shiprocket.co/tracking/${awb}`;
      default: return '';
    }
  };


  // Offer Banner Actions
  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle) {
      showToast('Banner title is required.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: bannerTitle,
          subtitle: bannerSubtitle,
          badgeText: bannerBadge,
          ctaText: bannerCtaText,
          ctaLink: bannerCtaLink,
          bgFrom: bannerBgFrom,
          bgTo: bannerBgTo,
          sortOrder: parseInt(bannerSortOrder) || 0,
          discountPercent: parseInt(bannerDiscountPercent) || 0,
          categoryId: bannerCategoryId ? parseInt(bannerCategoryId) : null,
          imageUrl: bannerImageUrl || undefined
        })
      });
      if (res.ok) {
        showToast('Offer banner created successfully!');
        setBannerTitle('');
        setBannerSubtitle('');
        setBannerBadge('');
        setBannerCtaText('Explore Now');
        setBannerCtaLink('all');
        setBannerDiscountPercent('0');
        setBannerCategoryId('');
        setBannerImageUrl('');
        fetchDashboardData();
      } else {
        showToast('Failed to create banner.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  const handleDeleteBanner = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this offer banner?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Offer banner deleted.');
        fetchDashboardData();
      } else {
        showToast('Failed to delete banner.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  // Coupon Actions
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode || !cpValue) {
      showToast('Coupon code and discount value are required.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: cpCode.trim().toUpperCase(),
          description: cpDesc,
          discountType: cpType,
          discountValue: parseFloat(cpValue),
          minOrderValue: parseFloat(cpMinOrder) || 0,
          maxDiscountCap: cpCap ? parseFloat(cpCap) : undefined,
          usageLimit: cpLimit ? parseInt(cpLimit) : undefined,
          perUserLimit: parseInt(cpPerUser) || 1,
          applicableCategoryId: cpCatId ? parseInt(cpCatId) : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Coupon ${cpCode.toUpperCase()} created successfully!`);
        setCpCode('');
        setCpDesc('');
        setCpValue('');
        setCpMinOrder('0');
        setCpCap('');
        setCpLimit('');
        setCpPerUser('1');
        setCpCatId('');
        fetchDashboardData();
      } else {
        showToast(data.error || 'Failed to create coupon.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Coupon deleted.');
        fetchDashboardData();
      } else {
        showToast('Failed to delete coupon.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  // Review Actions
  const handleDeleteReview = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this customer review?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Review deleted successfully.');
        fetchDashboardData();
      } else {
        showToast('Failed to delete review.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  // Video Reels Actions
  const handleCreateReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelProdId || !reelVideoUrl) {
      showToast('Please select a product and enter a video URL.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/admin/reels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: parseInt(reelProdId),
          videoUrl: reelVideoUrl.trim(),
          thumbnailUrl: reelThumbnailUrl.trim(),
          caption: reelCaption.trim(),
          sortOrder: parseInt(reelSortOrder) || 0
        })
      });
      if (res.ok) {
        showToast('Video Reel added successfully!');
        setReelProdId('');
        setReelVideoUrl('');
        setReelThumbnailUrl('');
        setReelCaption('');
        setReelSortOrder('0');
        fetchDashboardData();
      } else {
        showToast('Failed to add reel.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  const handleDeleteReel = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this video reel?')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/reels/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Video reel deleted.');
        fetchDashboardData();
      } else {
        showToast('Failed to delete reel.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };

  const handleUpdateReturnStatus = async (id: number, status: string, adminNote?: string) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/returns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNote })
      });
      if (res.ok) {
        showToast(`Return status updated to ${status}!`);
        fetchDashboardData();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to update return status.');
      }
    } catch (err) {
      showToast('Error connecting to server.');
    }
  };



  // Wholesale Inquiry Actions
  const handleInquiryStatus = async (inqId: number, status: 'pending' | 'contacted' | 'closed') => {
    try {
      const res = await fetch(`${API_URL}/api/admin/inquiries/${inqId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        showToast(`Inquiry status updated to ${status}.`);
        fetchDashboardData();
      } else {
        showToast('Failed to update inquiry.');
      }
    } catch (err) {
      showToast('Error updating inquiry.');
    }
  };

  // Compute Stats
  const totalSales = orders
    .filter((o) => (o as any).status === 'paid' || (o as any).status === 'placed' || (o as any).status === 'shipped' || (o as any).status === 'processing' || (o as any).status === 'delivered')
    .filter((o) => (o as any).status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const pendingPaymentCount = orders.filter((o) => (o as any).status === 'pending_payment').length;

  // Authentication Gate View
  if (!token) {
    return (
      <div className="bg-[#FAF6F0] min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-8 max-w-[380px] w-full shadow-lg">
          <button onClick={onBack} className="flex items-center gap-1 text-xs text-[#888888] hover:text-[#C4601A] mb-6">
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-[#C4601A]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-[#C4601A]" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1A1A1A]">Admin Control</h2>
            <p className="text-xs text-[#888888]">Authorization credentials required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#FFF0E8] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" /> {authLoading ? 'Verifying...' : 'Authorize Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard Dashboard View
  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 h-[60px] md:h-[64px] bg-white border-b border-[#E8E0D5] flex items-center px-4 md:px-8 z-30 shadow-xs">
        <span className="font-serif text-lg md:text-xl font-bold text-[#C4601A] flex-1 flex items-center gap-2">
          Sneh Sarees <span className="bg-[#F5E4BC]/25 text-[#C4601A] text-[10px] px-2 py-0.5 rounded font-sans uppercase font-bold">Admin</span>
        </span>
        {sessionTimeLeft && (
          <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full mr-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            Session · {sessionTimeLeft}
          </span>
        )}
        <button
          onClick={handleLogout}
          className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full cursor-pointer transition-colors"
        >
          Logout Portal
        </button>
      </div>

      {/* Main Body Grid */}
      <div className="pt-[76px] md:pt-[84px] pb-12 px-4 md:px-8 max-w-[1200px] mx-auto flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-[220px] bg-white rounded-2xl p-4 border border-[#E8E0D5] h-fit space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'products' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <Layers className="w-4.5 h-4.5" /> Products Catalog
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'orders' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <ShoppingBag className="w-4.5 h-4.5" /> Orders
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'inquiries' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <Users className="w-4.5 h-4.5" /> Wholesale Leads
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'categories' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <Layers className="w-4.5 h-4.5" /> Saree Categories
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'banners' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <Layers className="w-4.5 h-4.5 text-amber-500" /> Offer Banners
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'coupons' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <Tag className="w-4.5 h-4.5 text-emerald-500" /> Coupon Codes
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'reviews' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <MessageSquare className="w-4.5 h-4.5 text-blue-500" /> Customer Reviews
          </button>

          <button
            onClick={() => setActiveTab('reels')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${activeTab === 'reels' ? 'bg-[#C4601A] text-white' : 'text-[#888888] hover:bg-[#FAF6F0]'
              }`}
          >
            <Film className="w-4.5 h-4.5 text-red-500" /> Video Reels
          </button>

          {/* Return Requests saved for Version 2 */}



          <hr className="border-[#E8E0D5] my-2" />
          <button
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 text-left cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" /> Exit to Store
          </button>
        </div>

        {/* Dynamic Views Pane */}
        <div className="flex-1 min-h-[500px]">
          {dataLoading && (
            <div className="w-full h-40 bg-white border border-[#E8E0D5] rounded-2xl flex items-center justify-center text-xs text-[#888888]">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Syncing dashboard metrics...
            </div>
          )}

          {!dataLoading && activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-2xs overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Total Revenue</span>
                  <h3 className="font-serif text-2xl font-bold text-[#C4601A] mt-1 truncate">
                    ₹{totalSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-2xs overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Store Orders</span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1 truncate">{orders.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-2xs overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Bulk Leads</span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1 truncate">{inquiries.length}</h3>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#E8E0D5] shadow-2xs overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-[#888888]">Catalog Size</span>
                  <h3 className="font-serif text-2xl font-bold text-[#1A1A1A] mt-1 truncate">{products.length} Items</h3>
                </div>
              </div>

              {/* Recent Orders block */}
              <div className="bg-white rounded-2xl border border-[#E8E0D5] p-5 shadow-2xs">
                <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-4">Pending Tasks Overview</h3>
                <p className="text-xs text-[#888888] leading-relaxed">
                  Use the sidebar to jump directly into Catalog management (adjust prices, fabrics, descriptions), track order statuses, or verify wholesale customer inquiries.
                </p>
              </div>
            </div>
          )}

          {/* Products Panel */}
          {!dataLoading && activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Catalog Management</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Filter Category:</span>
                  <select
                    value={selectedAdminCategory}
                    onChange={(e) => setSelectedAdminCategory(e.target.value)}
                    className="bg-white border border-[#E8E0D5] rounded-xl p-2 text-xs font-semibold focus:outline-none focus:border-[#C4601A] text-[#1A1A1A]"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => { resetProductForm(); setShowProductModal(true); }}
                  className="bg-[#C4601A] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 hover:bg-[#FFF0E8] transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Add Saree
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden divide-y divide-[#E8E0D5] shadow-2xs">
                {(selectedAdminCategory === 'all'
                  ? products
                  : products.filter(p => p.categoryId === parseInt(selectedAdminCategory, 10))
                ).map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#FAF6F0]/20">
                    <div className="space-y-1">
                      <span className="font-bold text-[#1A1A1A]">{p.name}</span>
                      <div className="flex gap-3 text-[#888888] text-[10px] flex-wrap">
                        <span>Fabric: <strong>{p.fabric}</strong></span>
                        <span>Occasion: <strong>{p.occasion}</strong></span>
                        <span>Category: <strong>{categories.find(c => c.id === p.categoryId)?.name || 'Unassigned'}</strong></span>
                        <span>Stock: <strong className={p.stock === 0 ? "text-red-600 font-extrabold" : "text-gray-800"}>{p.stock !== undefined ? p.stock : 10} qty</strong></span>
                        <span>Price: <strong className="text-[#C4601A]">₹{p.price}</strong></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditProductClick(p)}
                        className="p-2 hover:bg-gray-100 rounded-full text-blue-600 transition-colors cursor-pointer"
                        title="Edit details/price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Panel */}
          {!dataLoading && activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Orders Pipeline</h3>

              {/* Pending Payment Alert Banner */}
              {pendingPaymentCount > 0 && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-2xl">⏳</span>
                  <div className="flex-1">
                    <p className="font-bold text-amber-900 text-sm">
                      {pendingPaymentCount} order{pendingPaymentCount > 1 ? 's' : ''} awaiting payment verification
                    </p>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Customers have placed QR payment orders. Check WhatsApp for payment screenshots and click <strong>"✓ Confirm Payment Received"</strong> below to deduct stock and process the orders.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="bg-white border border-[#E8E0D5] rounded-xl p-4 space-y-3 text-xs shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-2">
                      <span className="font-mono text-[#888888]">{o.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase font-extrabold ${
                        (o as any).status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        (o as any).status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                        (o as any).status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        (o as any).status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        (o as any).status === 'pending_payment' ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {(o as any).status === 'pending_payment' ? '⏳ Awaiting Payment' : ((o as any).status || 'placed')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>Customer: <strong>{o.name}</strong></div>
                      <div>Phone: <strong>{o.phone}</strong></div>
                      <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E8E0D5] px-2.5 py-1 rounded-lg text-[#1A1A1A]">
                        <Mail className="w-3.5 h-3.5 text-[#C4601A] shrink-0" />
                        <span>Account Email: <strong className="text-[#C4601A]">{o.userEmail || (o as any).email || 'Not provided / Guest'}</strong></span>
                      </div>
                      <div className="col-span-1 sm:col-span-2 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C4601A] shrink-0 mt-0.5" />
                        <span>Address: <strong>{o.address}</strong></span>
                        <button
                          onClick={() => { setEditingOrderLocation(o); setNewLocationAddress(o.address); }}
                          className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          [Edit Address]
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-[#FAF6F0] p-2.5 rounded-lg text-[10px] space-y-1">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[#888888]">
                          <span>{it.name} ({it.fabric} - {it.colour}) x{it.qty}</span>
                          <span className="font-bold text-[#1A1A1A]">₹{it.price * it.qty}</span>
                        </div>
                      ))}
                      <div className="border-t border-[#E8E0D5] pt-1 mt-1.5 flex justify-between font-bold text-[#C4601A]">
                        <span>Grand Total</span>
                        <span>₹{o.total}</span>
                      </div>
                    </div>

                    {/* Action buttons — hidden for cancelled/delivered orders */}
                    {(o as any).status !== 'cancelled' && (o as any).status !== 'delivered' && (
                      <div className="flex gap-2 justify-end pt-1 flex-wrap">
                        {/* Confirm Payment button — only for pending_payment orders */}
                        {(o as any).status === 'pending_payment' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Confirm payment received for order ${o.id}? This will deduct inventory and confirm the order.`)) {
                                handleUpdateOrderStatus(o.id, 'placed');
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            ✓ Confirm Payment Received
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'processing')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => {
                            setShippingOrder(o);
                            setShipTrackingId((o as any).trackingId || '');
                            setShipCarrierName((o as any).carrierName || 'India Post');
                            setShipTrackingUrl((o as any).trackingUrl || '');
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          🚚 Ship & Track
                        </button>
                        <button
                          onClick={() => handleUpdateOrderStatus(o.id, 'delivered')}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel order ${o.id}? Stock will be restored for all items.`)) {
                              handleUpdateOrderStatus(o.id, 'cancelled');
                            }
                          }}
                          className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Cancel Order
                        </button>
                      </div>
                    )}

                    {/* Cancelled notice */}
                    {(o as any).status === 'cancelled' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[10px] text-red-700 font-semibold flex items-center gap-1.5 mt-1">
                        <X className="w-3.5 h-3.5" /> Order cancelled{o.cancelledAt ? ` on ${new Date(o.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}. Stock restored.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wholesale Leads Panel */}
          {!dataLoading && activeTab === 'inquiries' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Wholesale Leads</h3>
              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="bg-white border border-[#E8E0D5] rounded-xl p-4 text-xs space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-[#E8E0D5] pb-2">
                      <span className="font-bold text-[#1A1A1A]">{inq.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${inq.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          inq.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {inq.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-600">
                      <div>Boutique/Event: <strong className="text-gray-900">{inq.boutique || 'N/A'}</strong></div>
                      <div>WhatsApp: <strong className="text-gray-900">{inq.whatsapp}</strong></div>
                      <div>Desired Quantity: <strong className="text-gray-900">{inq.quantity}</strong></div>
                      <div>Preferred Saree: <strong className="text-gray-900">{inq.preferredType}</strong></div>
                      {inq.details && (
                        <div className="col-span-2 mt-1 bg-gray-50 p-2.5 rounded whitespace-pre-line leading-relaxed text-gray-700">
                          <strong className="text-gray-900 block border-b border-gray-200/60 pb-1 mb-1">Inquiry Details & Items:</strong>
                          {inq.details}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => handleInquiryStatus(inq.id!, 'contacted')}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                      >
                        Mark Contacted
                      </button>
                      <button
                        onClick={() => handleInquiryStatus(inq.id!, 'closed')}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer"
                      >
                        Close Lead
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Panel */}
          {!dataLoading && activeTab === 'categories' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Manage Saree Categories</h3>

              {/* Category creation/edit form */}
              <form onSubmit={handleCreateCategory} className="bg-white border border-[#E8E0D5] rounded-xl p-4 space-y-3">
                <h4 className="font-serif text-sm font-bold text-[#C4601A]">
                  {editingCatId ? 'Edit Saree Category' : 'Add New Saree Category'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Category Name</label>
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => {
                        setNewCatName(e.target.value);
                        if (!editingCatId) {
                          setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                        }
                      }}
                      placeholder="Category name"
                      className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Slug (URL friendly)</label>
                    <input
                      type="text"
                      value={newCatSlug}
                      onChange={(e) => setNewCatSlug(e.target.value)}
                      placeholder="URL-friendly slug"
                      className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                      required
                      disabled={!!editingCatId}
                    />
                  </div>
                </div>

                {/* Category description (Saree Knowledge) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Saree Knowledge / Description <span className="text-[#888888] normal-case font-normal">(Information shown on product pages)</span>
                  </label>
                  <textarea
                    value={newCatDescription}
                    onChange={(e) => setNewCatDescription(e.target.value)}
                    placeholder="Enter interesting facts, wash care, or weaving process of this category..."
                    rows={3}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  />
                </div>

                {/* Rich Weave Heritage inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Saree History <span className="text-[#888888] normal-case font-normal">(Timeline & Origins)</span>
                    </label>
                    <textarea
                      value={newCatHistory}
                      onChange={(e) => setNewCatHistory(e.target.value)}
                      placeholder="Describe the history and origin of this saree type"
                      rows={3}
                      className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Key Properties <span className="text-[#888888] normal-case font-normal">(Feel & Texture)</span>
                    </label>
                    <textarea
                      value={newCatProperties}
                      onChange={(e) => setNewCatProperties(e.target.value)}
                      placeholder="Describe the key properties, texture, and design features"
                      rows={3}
                      className="w-full bg-[#FAF6F0] border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Care Instructions <span className="text-[#888888] normal-case font-normal">(Preservation tips)</span>
                    </label>
                    <textarea
                      value={newCatCare}
                      onChange={(e) => setNewCatCare(e.target.value)}
                      placeholder="Describe how to care for and preserve this saree"
                      rows={3}
                      className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    />
                  </div>
                </div>

                {/* Category image upload */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Category Icon Image <span className="text-[#888888] normal-case font-normal">(Recommended ratio: 1:1 square, e.g. 500x500 px)</span>
                  </label>
                  <div className="flex gap-3 items-center bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5">
                    {newCatImage && (
                      <img
                        src={newCatImage}
                        alt="Category preview"
                        className="w-10 h-10 rounded-lg object-cover border border-[#E8E0D5] shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryImageUpload}
                        disabled={uploadingCatImage}
                        className="text-[10px] text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[#C4601A]/10 file:text-[#C4601A] hover:file:bg-[#C4601A]/20 cursor-pointer w-full"
                      />
                      {uploadingCatImage && (
                        <span className="text-[9px] text-[#C4601A] animate-pulse block mt-1">Uploading...</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={addingCategory || uploadingCatImage}
                    className="bg-[#C4601A] text-white text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-[#FFF0E8] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {editingCatId ? 'Update Category' : addingCategory ? 'Adding Category...' : 'Create Saree Category'}
                  </button>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl hover:bg-gray-300 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              {/* Categories list */}
              <div className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden divide-y divide-[#E8E0D5] shadow-2xs">
                {categories.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#FAF6F0]/20">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-9 h-9 rounded-lg object-cover border border-[#E8E0D5] shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-[#C4601A]/10 flex items-center justify-center shrink-0">
                          <Layers className="w-4 h-4 text-[#C4601A]" />
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-[#1A1A1A]">{c.name}</span>
                        <span className="text-[10px] text-[#888888] ml-2">Slug: <strong>{c.slug}</strong></span>
                        {c.description && (
                          <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{c.description}</p>
                        )}
                        <div className="flex gap-2.5 mt-1 text-[9px] text-[#888888] flex-wrap">
                          {c.history && <span>History: <strong className="text-gray-600">Configured</strong></span>}
                          {c.properties && <span>Properties: <strong className="text-gray-600">Configured</strong></span>}
                          {c.care && <span>Care: <strong className="text-gray-600">Configured</strong></span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCatId(c.id);
                          setNewCatName(c.name);
                          setNewCatSlug(c.slug);
                          setNewCatImage(c.imageUrl || '');
                          setNewCatDescription(c.description || '');
                          setNewCatHistory(c.history || '');
                          setNewCatProperties(c.properties || '');
                          setNewCatCare(c.care || '');
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors cursor-pointer"
                        title="Edit category info"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-2 hover:bg-red-50 rounded-full text-red-600 transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="p-6 text-center text-[#888888] text-xs">No custom saree categories defined yet.</div>
                )}
              </div>
            </div>
          )}

          {!dataLoading && activeTab === 'banners' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Manage Scrollable Offer Banners</h3>

              <form onSubmit={handleCreateBanner} className="bg-white p-5 rounded-2xl border border-[#E8E0D5] space-y-4 shadow-2xs">
                <span className="block text-xs font-bold text-[#C4601A] border-b border-[#E8E0D5] pb-2">Add New Banner Banner</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Banner Title</label>
                    <input type="text" value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} placeholder="Banner title" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Subtitle</label>
                    <input type="text" value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} placeholder="Banner subtitle" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Badge Text</label>
                    <input type="text" value={bannerBadge} onChange={(e) => setBannerBadge(e.target.value)} placeholder="Badge label" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">CTA Text</label>
                    <input type="text" value={bannerCtaText} onChange={(e) => setBannerCtaText(e.target.value)} placeholder="Button text" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">CTA Section Link</label>
                    <select value={bannerCtaLink} onChange={(e) => setBannerCtaLink(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none">
                      <option value="all">All Sarees</option>
                      <option value="bulk">Bulk Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Sort Order</label>
                    <input type="number" value={bannerSortOrder} onChange={(e) => setBannerSortOrder(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Background Gradient From (Hex)</label>
                    <input type="text" value={bannerBgFrom} onChange={(e) => setBannerBgFrom(e.target.value)} placeholder="#C4601A" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Background Gradient To (Hex)</label>
                    <input type="text" value={bannerBgTo} onChange={(e) => setBannerBgTo(e.target.value)} placeholder="#C4601A" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Automatic Discount (%)</label>
                    <input type="number" min="0" max="90" value={bannerDiscountPercent} onChange={(e) => setBannerDiscountPercent(e.target.value)} placeholder="0" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Target Category Scope</label>
                    <select value={bannerCategoryId} onChange={(e) => setBannerCategoryId(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none">
                      <option value="">All Categories (General Promo)</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Banner Image (Optional)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerImageUpload}
                          className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#C4601A] file:text-white file:cursor-pointer"
                        />
                        {uploadingBannerImage && <span className="text-[9px] text-[#C4601A] block mt-0.5 animate-pulse">Uploading...</span>}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={bannerImageUrl}
                          onChange={(e) => setBannerImageUrl(e.target.value)}
                          placeholder="Or paste image URL"
                          className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-500 font-semibold block mt-1">
                      Recommended Ratio: <strong>3:1 or 4:1</strong> (e.g. 1200x400 pixels) for crisp responsive rendering.
                    </span>
                    {bannerImageUrl && (
                      <div className="relative w-full max-w-[200px] h-[60px] rounded-lg border border-[#E8E0D5] overflow-hidden mt-1.5 bg-gray-50">
                        <img src={bannerImageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBannerImageUrl('')}
                          className="absolute right-1 top-1 p-0.5 bg-black/60 rounded-full text-white hover:bg-black cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button type="submit" className="bg-[#C4601A] hover:bg-[#FFF0E8] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer">Create Banner</button>
              </form>

              {/* Banners List */}
              <div className="grid grid-cols-1 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="p-4 bg-white rounded-2xl border border-[#E8E0D5] flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{ backgroundColor: `${b.bgFrom}15`, color: b.bgFrom }}>
                          {b.badgeText || 'Promo'}
                        </span>
                        <h4 className="font-serif text-sm font-bold text-[#1a1a1a]">{b.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500">{b.subtitle || 'No description'}</p>
                      <div className="flex gap-2.5 mt-1 flex-wrap text-[9px] text-[#888888]">
                        <span>CTA: <strong>{b.ctaText}</strong> ({b.ctaLink})</span>
                        <span>· Sort: {b.sortOrder}</span>
                        {b.discountPercent ? <span className="text-emerald-700 font-bold">· Discount: {b.discountPercent}% Off</span> : null}
                        {b.categoryId ? <span className="text-purple-700 font-bold">· Category ID: {b.categoryId}</span> : null}
                        {b.imageUrl ? <span className="text-blue-600 font-bold">· Image Configured</span> : null}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBanner(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {banners.length === 0 && <div className="bg-white p-6 text-center text-xs text-gray-500 rounded-2xl border border-[#E8E0D5]">No offer banners active.</div>}
              </div>
            </div>
          )}

          {!dataLoading && activeTab === 'coupons' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Manage Coupon Codes</h3>

              <form onSubmit={handleCreateCoupon} className="bg-white p-5 rounded-2xl border border-[#E8E0D5] space-y-4 shadow-2xs">
                <span className="block text-xs font-bold text-[#C4601A] border-b border-[#E8E0D5] pb-2">Create New Coupon</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Coupon Code</label>
                    <input type="text" value={cpCode} onChange={(e) => setCpCode(e.target.value)} placeholder="Coupon code" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Discount Type</label>
                    <select value={cpType} onChange={(e) => setCpType(e.target.value as any)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none">
                      <option value="percent">Percent (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Discount Value</label>
                    <input type="number" value={cpValue} onChange={(e) => setCpValue(e.target.value)} placeholder="Discount value" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Min Order Value (₹)</label>
                    <input type="number" value={cpMinOrder} onChange={(e) => setCpMinOrder(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Max Cap (₹) <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                    <input type="number" value={cpCap} onChange={(e) => setCpCap(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Usage Limit <span className="text-gray-400 normal-case font-normal">(total)</span></label>
                    <input type="number" value={cpLimit} onChange={(e) => setCpLimit(e.target.value)} placeholder="Unlimited" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Per User Limit</label>
                    <input type="number" value={cpPerUser} onChange={(e) => setCpPerUser(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Coupon Description</label>
                    <input type="text" value={cpDesc} onChange={(e) => setCpDesc(e.target.value)} placeholder="Coupon description" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Restricted to Category <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                    <select value={cpCatId} onChange={(e) => setCpCatId(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none">
                      <option value="">All Categories</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="bg-[#C4601A] hover:bg-[#FFF0E8] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer">Create Coupon</button>
              </form>

              {/* Coupons List */}
              <div className="bg-white rounded-2xl border border-[#E8E0D5] divide-y divide-[#E8E0D5] overflow-hidden shadow-2xs">
                {coupons.map((c) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[#FAF6F0]/20 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded border border-emerald-200 uppercase">{c.code}</span>
                        <div>
                          <span className="block font-bold text-[#1A1A1A]">{c.description || 'No description'}</span>
                          <span className="text-[9px] text-[#888888]">
                            Type: <strong>{c.discountType}</strong> · Value: <strong>{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}</strong> · Used: <strong>{c.usedCount} times</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteCoupon(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full cursor-pointer">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
                {coupons.length === 0 && <div className="p-6 text-center text-xs text-gray-500">No active coupons created yet.</div>}
              </div>
            </div>
          )}

          {!dataLoading && activeTab === 'reviews' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Customer Reviews Moderation</h3>
              <div className="bg-white rounded-2xl border border-[#E8E0D5] divide-y divide-[#E8E0D5] overflow-hidden shadow-2xs">
                {reviewsList.map((r) => (
                  <div key={r.id} className="p-4 hover:bg-[#FAF6F0]/20 text-xs flex justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1a1a]">{r.userName}</span>
                        <span className="text-amber-500 font-bold">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                        {r.isVerified && <span className="bg-emerald-50 text-emerald-700 text-[8px] font-bold px-1.5 py-0.25 rounded uppercase">Verified Purchase</span>}
                      </div>
                      <span className="block text-[10px] text-[#888888]">Product: <strong>{r.productName || `Product #${r.productId}`}</strong></span>
                      <p className="text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100">{r.body || 'No review message'}</p>
                    </div>
                    <button onClick={() => handleDeleteReview(r.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full h-fit cursor-pointer align-top shrink-0">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
                {reviewsList.length === 0 && <div className="p-6 text-center text-xs text-gray-500">No customer reviews found.</div>}
              </div>
            </div>
          )}

          {!dataLoading && activeTab === 'reels' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Video Reels Content Manager</h3>

              <form onSubmit={handleCreateReel} className="bg-white p-5 rounded-2xl border border-[#E8E0D5] space-y-4 shadow-2xs">
                <span className="block text-xs font-bold text-[#C4601A] border-b border-[#E8E0D5] pb-2">Add New Reel</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Associated Saree Product</label>
                    <select value={reelProdId} onChange={(e) => setReelProdId(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" required>
                      <option value="">-- Choose Product --</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Reel Video URL <span className="text-gray-400 normal-case font-normal">(YouTube embed/raw .mp4 link)</span></label>
                    <input type="text" value={reelVideoUrl} onChange={(e) => setReelVideoUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Reel Caption</label>
                    <input type="text" value={reelCaption} onChange={(e) => setReelCaption(e.target.value)} placeholder="Reel caption" className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#1A1A1A] mb-1">Sort Order</label>
                    <input type="number" value={reelSortOrder} onChange={(e) => setReelSortOrder(e.target.value)} className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none" />
                  </div>
                </div>

                <button type="submit" className="bg-[#C4601A] hover:bg-[#FFF0E8] text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer">Add Reel</button>
              </form>

              {/* Reels list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reels.map((rl) => (
                  <div key={rl.id} className="p-4 bg-white rounded-2xl border border-[#E8E0D5] flex gap-3 shadow-2xs">
                    <div className="w-16 h-24 bg-gray-100 rounded-lg flex items-center justify-center border overflow-hidden shrink-0">
                      {rl.product?.image ? (
                        <img src={rl.product.image} className="w-full h-full object-cover" />
                      ) : (
                        <Film className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#1a1a1a] block truncate">{rl.caption || 'Video Reel'}</span>
                        <span className="text-[10px] text-gray-500 block truncate">Product: {rl.product?.name || `Product #${rl.productId}`}</span>
                        <a href={rl.videoUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#C4601A] underline block truncate mt-1">Watch Video</a>
                      </div>
                      <button onClick={() => handleDeleteReel(rl.id)} className="text-red-600 hover:text-red-800 text-[10px] font-bold w-fit cursor-pointer">Remove Reel</button>
                    </div>
                  </div>
                ))}
                {reels.length === 0 && <div className="md:col-span-2 bg-white p-6 text-center text-xs text-gray-500 rounded-2xl border border-[#E8E0D5]">No active video reels created.</div>}
              </div>
            </div>
          )}

          {!dataLoading && activeTab === 'returns' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-[#1A1A1A]">Manage Return & Refund Requests</h3>
              <p className="text-xs text-[#888888]">Process customer returns, updates statuses, and document resolution comments.</p>

              <div className="space-y-4">
                {returnsList.map((ret) => {
                  return (
                    <div key={ret.id} className="bg-white rounded-2xl border border-[#E8E0D5] p-5 shadow-2xs space-y-4 text-xs">
                      {/* Return Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#E8E0D5] pb-3 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#C4601A]">Request #{ret.id}</span>
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase leading-none ${ret.status === 'refunded' ? 'bg-emerald-100 text-emerald-700' :
                                ret.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                  ret.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                                    ret.status === 'picked_up' ? 'bg-purple-100 text-purple-700' :
                                      'bg-amber-100 text-amber-700'
                              }`}>
                              {ret.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-500 block mt-1">
                            Order ID: <span className="font-mono">{ret.orderId}</span> · Requested on {new Date(ret.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                        <div className="text-right sm:text-right text-[11px]">
                          <span className="font-bold text-[#1a1a1a] block">{ret.customerName || 'Customer'}</span>
                          <span className="text-gray-500 block">{ret.phone || 'No phone'}</span>
                          {ret.userEmail && (
                            <span className="text-[#C4601A] font-semibold block text-[10px]">{ret.userEmail}</span>
                          )}
                        </div>
                      </div>

                      {/* Return Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF6F0] p-4.5 rounded-xl border border-[#E8E0D5]">
                        <div>
                          <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Reason</span>
                          <span className="font-semibold text-[#1a1a1a] capitalize text-[13px]">{ret.reason.replace(/_/g, ' ')}</span>
                          {ret.description && (
                            <p className="text-[11px] text-gray-600 mt-1 italic">"{ret.description}"</p>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Requested Action</span>
                          <span className="font-semibold text-[#1a1a1a] capitalize text-[13px]">
                            {ret.resolution === 'refund' ? '💰 Refund' : '🔄 Exchange'}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Returned Items</span>
                          <div className="space-y-1 mt-1">
                            {ret.items.map((it, idx) => (
                              <div key={idx} className="text-[11px] text-[#1a1a1a]">
                                • {it.name} <span className="text-gray-500">(Qty: {it.qty})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Admin Note Input / Display */}
                      <div className="space-y-2">
                        <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider block">Internal Resolution Notes</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add administrative notes, WhatsApp coordination details, or rejection reasons here..."
                            defaultValue={ret.adminNote || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (ret.adminNote || '')) {
                                handleUpdateReturnStatus(ret.id, ret.status, e.target.value);
                              }
                            }}
                            className="flex-1 bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs focus:outline-none"
                          />
                        </div>
                        {ret.adminNote && (
                          <span className="text-[10px] text-gray-400 italic">Auto-saves on losing focus if changes are made.</span>
                        )}
                      </div>

                      {/* Actions workflow bar */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-[#E8E0D5] pt-3.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Workflow Actions:</span>

                        {ret.status === 'requested' && (
                          <>
                            <button
                              onClick={() => handleUpdateReturnStatus(ret.id, 'approved')}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                            >
                              Approve Return
                            </button>
                            <button
                              onClick={() => {
                                const note = window.prompt('Please enter the reason for rejection (optional):') || '';
                                handleUpdateReturnStatus(ret.id, 'rejected', note);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                            >
                              Reject Return
                            </button>
                          </>
                        )}

                        {ret.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateReturnStatus(ret.id, 'picked_up')}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                          >
                            Mark Picked Up
                          </button>
                        )}

                        {ret.status === 'picked_up' && (
                          <button
                            onClick={() => handleUpdateReturnStatus(ret.id, 'refunded')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl cursor-pointer"
                          >
                            Confirm Refunded / Exchanged
                          </button>
                        )}

                        {['refunded', 'rejected'].includes(ret.status) && (
                          <span className="text-[11px] font-bold text-gray-500">None available (Request closed)</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {returnsList.length === 0 && (
                  <div className="bg-white p-12 text-center text-xs text-gray-500 rounded-2xl border border-[#E8E0D5]">
                    No return or exchange requests have been submitted.
                  </div>
                )}
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Edit Address Location Modal */}
      {editingOrderLocation && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-[400px] w-full p-6 border border-[#E8E0D5] relative shadow-xl">
            <button onClick={() => setEditingOrderLocation(null)} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-serif text-lg font-bold text-[#1A1A1A] mb-2 flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-[#C4601A]" /> Change Delivery Location
            </h4>
            <p className="text-[11px] text-[#888888] mb-4">
              Updating shipping location for Order <strong>{editingOrderLocation.id}</strong>.
            </p>

            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#1a1a1a] uppercase mb-1">
                  New Shipping Address
                </label>
                <textarea
                  value={newLocationAddress}
                  onChange={(e) => setNewLocationAddress(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-3 text-xs focus:outline-none focus:border-[#C4601A] min-h-[80px]"
                  placeholder="Enter complete shipping details"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C4601A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#FFF0E8] transition-colors cursor-pointer"
              >
                Apply Location Update
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ship & Track Modal */}
      {shippingOrder && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-[420px] w-full p-6 border border-[#E8E0D5] relative shadow-xl">
            <button onClick={() => setShippingOrder(null)} className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full cursor-pointer">
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-serif text-lg font-bold text-[#1A1A1A] mb-1 flex items-center gap-2">
              🚚 Ship Order
            </h4>
            <p className="text-[11px] text-[#888888] mb-4">
              Enter courier details for Order <strong className="text-[#C4601A]">{shippingOrder.id}</strong>.
              Customers will see the tracking link in "My Orders".
            </p>

            <form onSubmit={handleShipOrder} className="space-y-4">
              {/* Carrier Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Courier / Carrier
                </label>
                <select
                  value={shipCarrierName}
                  onChange={(e) => {
                    setShipCarrierName(e.target.value);
                    setShipTrackingUrl('');
                  }}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                >
                  <option value="India Post">India Post</option>
                  <option value="Shiprocket">Shiprocket</option>
                  <option value="Delhivery">Delhivery</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Ekart">Ekart</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Tracking ID / AWB */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Tracking ID / AWB Number
                </label>
                <input
                  type="text"
                  value={shipTrackingId}
                  onChange={(e) => setShipTrackingId(e.target.value)}
                  placeholder="Tracking ID"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>

              {/* Tracking URL — optional */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Tracking URL <span className="text-[#888888] normal-case font-normal">(optional — auto-filled for known carriers)</span>
                </label>
                <input
                  type="url"
                  value={shipTrackingUrl}
                  onChange={(e) => setShipTrackingUrl(e.target.value)}
                  placeholder="Tracking URL"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                />
                <p className="text-[9px] text-[#888888] mt-1">
                  Leave blank to use the default tracking page for {shipCarrierName}.
                </p>
              </div>

              <button
                type="submit"
                disabled={shipLoading}
                className="w-full bg-[#C4601A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#FFF0E8] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {shipLoading ? 'Saving...' : '🚀 Confirm Shipment & Notify'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-[450px] w-full p-6 border border-[#E8E0D5] relative my-8 shadow-xl">
            <button
              onClick={() => { setShowProductModal(false); resetProductForm(); }}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h4 className="font-serif text-lg font-bold text-[#C4601A] mb-4">
              {editingProduct ? 'Edit Saree Inventory' : 'Add New Saree'}
            </h4>

            <form onSubmit={handleProductSubmit} className="space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Saree name"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                  Saree Image <span className="text-[#888888] normal-case font-normal">(Recommended ratio: 3:4 portrait, e.g. 600x800 px)</span>
                </label>
                <div className="flex gap-3 items-center bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5">
                  {prodImage && (
                    <img
                      src={prodImage}
                      alt="Saree preview"
                      className="w-10 h-10 rounded object-cover border border-[#E8E0D5] shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="text-[10px] text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-[#C4601A]/10 file:text-[#C4601A] hover:file:bg-[#C4601A]/20 cursor-pointer w-full"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && <span className="text-[9px] text-[#C4601A] animate-pulse block mt-1">Uploading...</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="Price (₹)"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Discount Price (₹) <span className="text-[#888888] normal-case font-normal">(optional)</span></label>
                  <input
                    type="number"
                    value={prodDiscountPrice}
                    onChange={(e) => setProdDiscountPrice(e.target.value)}
                    placeholder="Discount price (₹)"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Colour</label>
                  <select
                    value={prodColourInputMode === 'custom' ? 'Other' : prodColour}
                    onChange={(e) => {
                      if (e.target.value === 'Other') {
                        setProdColourInputMode('custom');
                        setProdColour('Other');
                      } else {
                        setProdColourInputMode('preset');
                        setProdColour(e.target.value);
                      }
                    }}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  >
                    <option value="Red">Red</option>
                    <option value="Royal Blue">Royal Blue</option>
                    <option value="Emerald">Emerald</option>
                    <option value="Deep Pink">Deep Pink</option>
                    <option value="Purple">Purple</option>
                    <option value="Saffron">Saffron</option>
                    <option value="Teal">Teal</option>
                    <option value="Maroon">Maroon</option>
                    <option value="Other">Other (Custom Color)...</option>
                  </select>
                  {prodColourInputMode === 'custom' && (
                    <input
                      type="text"
                      value={customColourVal}
                      onChange={(e) => setCustomColourVal(e.target.value)}
                      placeholder="Color name"
                      className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A] mt-1.5"
                      required
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Fabric</label>
                  <select
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  >
                    <option value="Silk">Silk</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Georgette">Georgette</option>
                    <option value="Linen">Linen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Occasion</label>
                  <select
                    value={prodOccasion}
                    onChange={(e) => setProdOccasion(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Festive">Festive</option>
                    <option value="Party">Party</option>
                    <option value="Daily Wear">Daily Wear</option>
                    <option value="Office">Office</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Stock Level (Qty)</label>
                  <input
                    type="number"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    placeholder="Stock quantity"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Assign Category</label>
                  <select
                    value={prodCategoryId}
                    onChange={(e) => setProdCategoryId(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    required
                  >
                    <option value="">Select a Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Reel Video URL (Optional)</label>
                <input
                  type="text"
                  value={prodReelUrl}
                  onChange={(e) => setProdReelUrl(e.target.value)}
                  placeholder="Video URL (YouTube or direct MP4)"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  id="blouse-check"
                  checked={prodBlouse}
                  onChange={(e) => setProdBlouse(e.target.checked)}
                  className="w-4 h-4 accent-[#C4601A] cursor-pointer"
                />
                <label htmlFor="blouse-check" className="text-xs font-bold text-[#1A1A1A] cursor-pointer">
                  Includes Matching Blouse Piece
                </label>
              </div>

              {/* Color Variants Builder */}
              <div className="bg-gray-50 border border-dashed border-[#E8E0D5] rounded-xl p-3 space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#C4601A]">
                  Saree Color Variants (Photos)
                </span>

                {/* List of existing variants */}
                {prodVariants.length > 0 && (
                  <div className="flex gap-2 flex-wrap pb-1">
                    {prodVariants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white border border-[#E8E0D5] p-1 pr-2 rounded-lg text-[10px] shadow-3xs">
                        <img src={v.image} alt={v.colour} className="w-5 h-5 rounded object-cover" />
                        <span className="font-semibold text-gray-700">{v.colour}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-red-500 hover:text-red-700 cursor-pointer font-bold ml-0.5 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new variant controls */}
                <div className="space-y-2 pt-1 border-t border-[#E8E0D5]/50">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        value={newVariantColour}
                        onChange={(e) => setNewVariantColour(e.target.value)}
                        placeholder="Variant color"
                        className="w-full bg-white border border-[#E8E0D5] rounded-lg p-2 text-[10px] font-semibold focus:outline-none focus:border-[#C4601A]"
                      />
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleVariantImageUpload}
                        disabled={uploadingVariantImage}
                        className="text-[9px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[9px] file:font-semibold file:bg-[#C4601A]/10 file:text-[#C4601A] hover:file:bg-[#C4601A]/20 cursor-pointer w-full mt-1"
                      />
                      <span className="text-[8px] text-gray-400 block mt-0.5">(Recommended: 3:4 portrait)</span>
                      {uploadingVariantImage && (
                        <span className="text-[8px] text-[#C4601A] animate-pulse block mt-0.5">Uploading...</span>
                      )}
                    </div>
                  </div>
                  {newVariantImage && (
                    <div className="flex items-center gap-2">
                      <img src={newVariantImage} alt="Variant upload preview" className="w-6 h-6 rounded object-cover border border-[#E8E0D5]" />
                      <span className="text-[9px] text-[#888888] italic">Variant image selected!</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="w-full bg-white hover:bg-gray-100 text-[#C4601A] border border-[#C4601A]/20 font-bold py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                  >
                    + Add Color Variant
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">Description</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe the handloom work, border design, weaving style, and care instructions"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A] min-h-[90px]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#FFF0E8] transition-colors cursor-pointer"
              >
                {editingProduct ? 'Save Saree Changes' : 'Publish Saree to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

