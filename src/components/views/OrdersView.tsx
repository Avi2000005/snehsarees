import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Calendar, CheckCircle2, Truck, Package, ExternalLink, Copy, RotateCcw, ChevronDown, Home, XCircle, Star, Edit3, Trash2, RefreshCw } from 'lucide-react';
import { Order, ActivePage, ReturnRequest, ReturnReason, ReturnResolution, Review, Product } from '../../types';
import { SareeSwatch } from '../SareeSwatch';
import { API_URL } from '../../config';

interface OrdersViewProps {
  orders: Order[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  userToken?: string;
  showToast: (msg: string) => void;
  onRefreshOrders?: () => void;
  productsList?: Product[];
}

const RETURN_REASONS: { value: ReturnReason; label: string; icon: string }[] = [
  { value: 'damaged', label: 'Item is damaged', icon: '💔' },
  { value: 'wrong_item', label: 'Wrong item delivered', icon: '❌' },
  { value: 'not_as_described', label: 'Not as described', icon: '🖼️' },
  { value: 'size_issue', label: 'Size / fit issue', icon: '📏' },
  { value: 'changed_mind', label: 'Changed my mind', icon: '🔄' },
  { value: 'other', label: 'Other reason', icon: '📝' },
];

const RETURN_WINDOW_DAYS = 7;

function isReturnEligible(order: Order): boolean {
  if (order.status !== 'delivered') return false;
  const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date();
  const daysElapsed = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysElapsed <= RETURN_WINDOW_DAYS;
}

function daysLeft(order: Order): number {
  const deliveredDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date();
  const elapsed = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(RETURN_WINDOW_DAYS - elapsed));
}

const formatStepTime = (dateStr?: string) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const STATUS_STEPS: ReturnRequest['status'][] = ['requested', 'approved', 'picked_up', 'refunded'];
const STATUS_LABELS: Record<string, string> = {
  requested: 'Requested',
  approved: 'Approved',
  picked_up: 'Picked Up',
  refunded: 'Refunded',
  rejected: 'Rejected',
};

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onNavigate, onBack, userToken, showToast, onRefreshOrders, productsList }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    if (onRefreshOrders) {
      setIsSyncing(true);
      await onRefreshOrders();
      setIsSyncing(false);
      showToast('Synced latest order status from server.');
    }
  };
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [existingReturns, setExistingReturns] = useState<Record<string, ReturnRequest>>({});
  const [returnReason, setReturnReason] = useState<ReturnReason>('damaged');
  const [returnDescription, setReturnDescription] = useState('');
  const [returnResolution, setReturnResolution] = useState<ReturnResolution>('refund');
  const [submitting, setSubmitting] = useState(false);
  const [expandedReturn, setExpandedReturn] = useState<string | null>(null);

  // Review states — keyed by productId
  const [myReviews, setMyReviews] = useState<Record<number, Review>>({}); // productId -> review
  const [reviewFormProductId, setReviewFormProductId] = useState<number | null>(null); // which item is being reviewed
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

  // Fetch the current user's reviews on mount
  React.useEffect(() => {
    if (!userToken) return;
    fetch(`${API_URL}/api/reviews/my`, {
      headers: { Authorization: `Bearer ${userToken}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then((reviews: Review[]) => {
        const map: Record<number, Review> = {};
        reviews.forEach(r => { map[r.productId] = r; });
        setMyReviews(map);
      })
      .catch(() => {});
  }, [userToken]);

  const openReviewForm = (productId: number, existingReview?: Review) => {
    setReviewFormProductId(productId);
    setReviewRating(existingReview?.rating ?? 5);
    setReviewBody(existingReview?.body ?? '');
    setEditingReviewId(existingReview?.id ?? null);
  };

  const closeReviewForm = () => {
    setReviewFormProductId(null);
    setEditingReviewId(null);
    setReviewRating(5);
    setReviewBody('');
  };

  const submitReview = async (productId: number) => {
    if (!userToken || submittingReview) return;
    setSubmittingReview(true);
    try {
      const isEdit = editingReviewId !== null;
      const url = isEdit ? `${API_URL}/api/reviews/${editingReviewId}` : `${API_URL}/api/reviews`;
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? JSON.stringify({ rating: reviewRating, body: reviewBody })
        : JSON.stringify({ productId, rating: reviewRating, body: reviewBody });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body,
      });
      const data = await res.json();
      if (res.ok) {
        setMyReviews(prev => ({ ...prev, [productId]: data }));
        showToast(isEdit ? 'Review updated!' : 'Review posted! Thank you.');
        closeReviewForm();
      } else {
        showToast(data.error || 'Failed to submit review.');
      }
    } catch {
      showToast('Network error. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (productId: number, reviewId: number) => {
    if (!userToken || !window.confirm('Delete your review for this product?')) return;
    try {
      const res = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      if (res.ok) {
        setMyReviews(prev => { const next = { ...prev }; delete next[productId]; return next; });
        showToast('Review deleted.');
      } else {
        showToast('Failed to delete review.');
      }
    } catch {
      showToast('Network error.');
    }
  };

  // Load existing return for an order when user clicks the badge
  const loadReturnStatus = async (orderId: string) => {
    if (existingReturns[orderId]) {
      setExpandedReturn(expandedReturn === orderId ? null : orderId);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/returns/order/${orderId}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExistingReturns(prev => ({ ...prev, [orderId]: data }));
        setExpandedReturn(orderId);
      }
    } catch { /* silent */ }
  };

  const openReturnModal = (order: Order) => {
    setReturnModalOrder(order);
    setReturnReason('damaged');
    setReturnDescription('');
    setReturnResolution('refund');
  };

  const submitReturn = async () => {
    if (!returnModalOrder || !userToken) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({
          orderId: returnModalOrder.id,
          reason: returnReason,
          description: returnDescription,
          resolution: returnResolution,
          items: returnModalOrder.items.map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setExistingReturns(prev => ({ ...prev, [returnModalOrder.id]: data }));
        showToast('Return request submitted successfully!');
        setReturnModalOrder(null);
      } else {
        showToast(data.error || 'Failed to submit return request.');
      }
    } catch {
      showToast('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="page-orders" className="bg-[#FAF6F0] min-h-screen">
      {/* Header bar */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={onBack}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          My Orders
        </div>
        <div className="flex items-center gap-1.5">
          {onRefreshOrders && (
            <button
              className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
              onClick={handleManualSync}
              title="Sync latest order status from server"
            >
              <RefreshCw className={`w-[20px] h-[20px] text-[#C4601A] ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
            onClick={() => onNavigate('home')}
            title="Return to Home Section"
          >
            <Home className="w-[22px] h-[22px]" />
          </button>
        </div>
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[820px] mx-auto pt-4 pb-[80px]">
        {orders.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-sm mx-auto">
            <div className="mb-4 flex justify-center text-primrose opacity-35">
              <ShoppingBag className="w-14 h-14" strokeWidth={1.2} />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#1A1A1A] mb-2 leading-tight">
              No orders found
            </h2>
            <p className="text-xs text-[#888888] leading-relaxed mb-6">
              You haven't placed any saree orders yet. Your purchases will appear here.
            </p>
            <button
              onClick={() => onNavigate('home')}
              className="empty-cart-btn bg-[#C4601A] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#FFF0E8] cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((ord) => {
              const returnEligible = isReturnEligible(ord);
              const hasReturn = !!existingReturns[ord.id];
              const ret = existingReturns[ord.id];
              const isExpanded = expandedReturn === ord.id;

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-xl p-4.5 border border-[#E8E0D5] shadow-xs flex flex-col gap-3.5"
                >
                  {/* Order Meta Header */}
                  <div className="flex items-start justify-between border-b border-[#E8E0D5] pb-3 text-xs text-[#4A4A4A]">
                    <div>
                      <span className="block font-bold text-[#C4601A] text-[13px] mb-0.5">
                        Order #{ord.id.slice(0, 20)}{ord.id.length > 20 ? '...' : ''}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#888888] mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                    {/* Dynamic Status Badge */}
                    <span className={`font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 leading-none shrink-0 font-sans text-[10px] uppercase ${
                      ord.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                      ord.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' :
                      ord.status === 'processing' ? 'bg-amber-50 text-amber-700' :
                      ord.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {ord.status === 'shipped' ? <Truck className="w-3.5 h-3.5" /> :
                       ord.status === 'delivered' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                       ord.status === 'processing' ? <Package className="w-3.5 h-3.5" /> :
                       ord.status === 'cancelled' ? <XCircle className="w-3.5 h-3.5" /> :
                       <CheckCircle2 className="w-3.5 h-3.5" />}
                      {ord.status || 'Placed'}
                    </span>
                  </div>

                  {/* Order Status Stepper */}
                  {ord.status === 'cancelled' ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <div>
                        <span className="text-xs font-bold text-red-700">Order Cancelled</span>
                        {ord.cancelledAt && (
                          <span className="block text-[10px] text-red-500 mt-0.5">
                            on {new Date(ord.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                  <div className="flex items-center justify-between px-1 py-1">
                    {(['placed', 'processing', 'shipped', 'delivered'] as const).map((step, idx, arr) => {
                      const stepLabels: Record<string, string> = {
                        placed: 'Placed', processing: 'Packing', shipped: 'Shipped', delivered: 'Delivered'
                      };
                      const statusOrder = ['placed', 'paid', 'processing', 'shipped', 'delivered'];
                      const currentIdx = statusOrder.indexOf(ord.status || 'placed');
                      const stepIdx = statusOrder.indexOf(step);
                      const isDone = currentIdx >= stepIdx;

                      const stepTimes: Record<string, string | undefined> = {
                        placed: ord.createdAt,
                        processing: ord.processingAt,
                        shipped: ord.shippedAt,
                        delivered: ord.deliveredAt
                      };
                      const timeStr = formatStepTime(stepTimes[step]);

                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center gap-0.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold transition-colors ${
                              isDone ? 'bg-[#C4601A] text-white' : 'bg-[#E8E0D5] text-[#888888]'
                            }`}>
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[8px] font-semibold ${isDone ? 'text-[#C4601A]' : 'text-[#888888]'}`}>
                              {stepLabels[step]}
                            </span>
                            {timeStr && (
                              <span className="text-[7px] text-gray-400 mt-0.5 text-center leading-none">
                                {timeStr}
                              </span>
                            )}
                          </div>
                          {idx < arr.length - 1 && (
                            <div className={`flex-1 h-[2px] mx-1 rounded-full transition-colors ${
                              currentIdx > stepIdx ? 'bg-[#C4601A]' : 'bg-[#E8E0D5]'
                            }`} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  )}

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {ord.items.map((it, itemIdx) => {
                      const existingRev = myReviews[it.id];
                      const isWriting = reviewFormProductId === it.id;
                      const isDelivered = ord.status === 'delivered';

                        const itemImage = (it as any).image || productsList?.find(p => p.id === it.id)?.image;
                        return (
                          <div key={itemIdx} className="bg-[#FAF6F0]/60 p-3 rounded-xl border border-[#E8E0D5]/60 flex flex-col gap-2">
                            <div className="flex gap-3 items-center">
                              <div className="w-10 h-13 rounded-md overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8E0D5]">
                                <SareeSwatch id={it.id} imageUrl={itemImage} />
                              </div>
                            <div className="flex-1 flex flex-col justify-center text-xs">
                              <span className="font-serif font-bold text-gray-800 leading-tight">{it.name}</span>
                              <span className="text-[11px] text-[#888888] mt-1">Colour: {it.colour} · Qty: {it.qty}</span>
                            </div>
                            <div className="self-center font-bold text-xs text-right font-sans">
                              ₹{(it.price * it.qty).toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Delivered Order Review Actions & Forms */}
                          {isDelivered && (
                            <div className="border-t border-[#E8E0D5]/60 pt-2 text-xs">
                              {!isWriting && existingRev && (
                                <div className="bg-white p-2.5 rounded-lg border border-[#E8E0D5] flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <div className="flex text-amber-500">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <Star key={s} className={`w-3 h-3 ${s <= existingRev.rating ? 'fill-amber-500' : 'text-gray-300'}`} />
                                        ))}
                                      </div>
                                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Your Review</span>
                                    </div>
                                    <p className="text-[11px] text-gray-700 italic">"{existingRev.body}"</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => openReviewForm(it.id, existingRev)}
                                      className="p-1 hover:bg-gray-100 rounded text-blue-600 transition-colors cursor-pointer"
                                      title="Edit Review"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteReview(it.id, existingRev.id)}
                                      className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors cursor-pointer"
                                      title="Delete Review"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {!isWriting && !existingRev && (
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => openReviewForm(it.id)}
                                    className="flex items-center gap-1 text-[11px] font-bold text-[#C4601A] bg-white border border-[#C4601A]/40 hover:bg-[#C4601A] hover:text-white px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                                  >
                                    <Star className="w-3 h-3 fill-current" /> Write a Review
                                  </button>
                                </div>
                              )}

                              {isWriting && (
                                <div className="bg-white p-3 rounded-lg border border-[#C4601A]/40 space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[11px] text-[#1A1A1A]">
                                      {editingReviewId ? 'Edit Your Review' : 'Write Product Review'}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-500">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setReviewRating(star)}
                                          className="hover:scale-110 transition-transform p-0.5"
                                        >
                                          <Star className={`w-4 h-4 ${star <= reviewRating ? 'fill-amber-500' : 'text-gray-300'}`} />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <textarea
                                    value={reviewBody}
                                    onChange={(e) => setReviewBody(e.target.value)}
                                    placeholder="Share details about quality, fabric, color accuracy..."
                                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-lg p-2 text-xs focus:outline-none focus:border-[#C4601A] h-16 resize-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={closeReviewForm}
                                      className="px-3 py-1 rounded text-[11px] font-semibold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => submitReview(it.id)}
                                      disabled={submittingReview}
                                      className="px-3.5 py-1 rounded text-[11px] font-bold text-white bg-[#C4601A] hover:bg-[#A0450F] transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                      {submittingReview ? 'Saving...' : editingReviewId ? 'Update Review' : 'Submit Review'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Total + Address */}
                  <div className="border-t border-[#E8E0D5] pt-3 space-y-3.5">
                    <div className="flex justify-between items-start text-xs text-[#4A4A4A] gap-4">
                      <div>
                        <span className="block font-semibold">Delivery Address</span>
                        <span className="block text-[11px] text-[#888888] mt-0.5 line-clamp-2 max-w-[280px] md:max-w-md">{ord.address}</span>
                      </div>
                    </div>

                    {/* E-commerce detailed breakdown info */}
                    <div className="bg-[#FAF6F0] rounded-xl p-3 border border-[#E8E0D5] space-y-2 text-[11px] text-[#4A4A4A]">
                      <div className="flex justify-between items-center pb-2 border-b border-[#E8E0D5]/60 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-[#1A1A1A]">
                          <span>Order ID:</span>
                          <span className="font-mono text-[#C4601A]">{ord.id}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(ord.id);
                              showToast('Order ID copied to clipboard!');
                            }}
                            title="Copy Order ID"
                            className="text-[#888888] hover:text-[#C4601A] cursor-pointer p-0.5"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-500 capitalize">
                          Payment Mode: <span className="font-bold text-[#1A1A1A]">{ord.method.replace(/_/g, ' ')}</span>
                        </div>
                      </div>

                      {/* Price Calculation */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Items Subtotal:</span>
                          <span className="font-semibold text-[#1A1A1A]">₹{ord.items.reduce((sum, it) => sum + it.price * it.qty, 0).toLocaleString('en-IN')}</span>
                        </div>
                        {ord.discountAmount && ord.discountAmount > 0 ? (
                          <div className="flex justify-between text-emerald-600">
                            <span>Coupon Discount {ord.couponCode ? `(${ord.couponCode})` : ''}:</span>
                            <span className="font-semibold">-₹{ord.discountAmount.toLocaleString('en-IN')}</span>
                          </div>
                        ) : null}
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span className="text-emerald-600 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between border-t border-[#E8E0D5]/60 pt-1.5 text-xs font-extrabold text-[#1A1A1A]">
                          <span>Total Charged:</span>
                          <span className="text-[#C4601A] font-sans">₹{ord.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Help / Support */}
                    <div className="flex justify-end pt-1">
                      <a
                        href={`https://wa.me/919414067123?text=${encodeURIComponent(`Namaste Sneh Sarees! I need assistance with my Order: #${ord.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C4601A] hover:underline font-bold text-[10px] flex items-center gap-1.5"
                      >
                        💬 Need Help? Contact WhatsApp Support
                      </a>
                    </div>
                  </div>

                  {/* Tracking Card */}
                  {ord.trackingId && ord.status !== 'delivered' && ord.status !== 'cancelled' && (
                    <div className="bg-gradient-to-r from-[#C4601A]/5 to-blue-50 border border-[#C4601A]/15 rounded-xl p-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C4601A]">
                        <Truck className="w-3.5 h-3.5" /> Shipment Dispatched
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <div className="text-[#888888]">Carrier</div>
                        <div className="font-semibold text-[#1A1A1A]">{ord.carrierName}</div>
                        <div className="text-[#888888]">Tracking ID</div>
                        <div className="flex items-center gap-1 font-bold text-[#1A1A1A] font-mono">
                          {ord.trackingId}
                          <button onClick={() => { navigator.clipboard.writeText(ord.trackingId!); }} title="Copy tracking ID" className="text-[#888888] hover:text-[#C4601A] cursor-pointer p-0.5">
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {ord.trackingUrl && (
                        <a href={ord.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 w-full bg-[#C4601A] hover:bg-[#FFF0E8] text-white text-[10px] font-bold py-2 rounded-lg transition-colors">
                          <ExternalLink className="w-3 h-3" /> Track Shipment Live
                        </a>
                      )}
                    </div>
                  )}

                  {/* Return Section */}
                  {ord.status === 'delivered' && (
                    <div className="border-t border-[#E8E0D5] pt-3">
                      {hasReturn ? (
                        /* Show existing return status */
                        <button
                          onClick={() => loadReturnStatus(ord.id)}
                          className="w-full flex items-center justify-between bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-3.5 py-2.5 cursor-pointer transition-colors hover:bg-[#F0E8DC]"
                        >
                          <div className="flex items-center gap-2">
                            <RotateCcw className="w-3.5 h-3.5 text-[#C4601A]" />
                            <span className="text-[11px] font-bold text-[#1A1A1A]">Return Request</span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              ret?.status === 'refunded' ? 'bg-emerald-100 text-emerald-700' :
                              ret?.status === 'rejected' ? 'bg-red-100 text-red-600' :
                              ret?.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                              ret?.status === 'picked_up' ? 'bg-purple-100 text-purple-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {STATUS_LABELS[ret?.status || 'requested']}
                            </span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-[#888888] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      ) : returnEligible ? (
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-[#888888]">
                            Return window: <span className="font-bold text-[#C4601A]">{daysLeft(ord)} day{daysLeft(ord) !== 1 ? 's' : ''} left</span>
                          </div>
                          <button
                            onClick={() => openReturnModal(ord)}
                            className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#C4601A] text-[#C4601A] text-[11px] font-bold px-3.5 py-1.5 rounded-full hover:bg-[#C4601A] hover:text-white transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Return
                          </button>
                        </div>
                      ) : (
                        <p className="text-[10px] text-[#888888] text-center">Return window of {RETURN_WINDOW_DAYS} days has expired.</p>
                      )}

                      {/* Expanded return status tracker */}
                      {isExpanded && ret && (
                        <div className="mt-3 bg-white border border-[#E8E0D5] rounded-xl p-3.5 space-y-3">
                          {ret.status === 'rejected' ? (
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs text-red-700">
                              <p className="font-bold mb-1">❌ Return Rejected</p>
                              <p>{ret.adminNote || 'Your return request could not be approved at this time.'}</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                {STATUS_STEPS.map((step, idx, arr) => {
                                  const stepIdx = STATUS_STEPS.indexOf(ret.status as any);
                                  const isDone = STATUS_STEPS.indexOf(step) <= stepIdx;
                                  return (
                                    <React.Fragment key={step}>
                                      <div className="flex flex-col items-center gap-1">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${isDone ? 'bg-[#C4601A] text-white' : 'bg-[#E8E0D5] text-[#888888]'}`}>
                                          {isDone ? '✓' : idx + 1}
                                        </div>
                                        <span className={`text-[8px] font-semibold text-center leading-tight max-w-[40px] ${isDone ? 'text-[#C4601A]' : 'text-[#888888]'}`}>
                                          {STATUS_LABELS[step]}
                                        </span>
                                      </div>
                                      {idx < arr.length - 1 && <div className={`flex-1 h-[2px] mx-1 rounded-full ${isDone && STATUS_STEPS.indexOf(STATUS_STEPS[idx + 1]) <= stepIdx ? 'bg-[#C4601A]' : 'bg-[#E8E0D5]'}`} />}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                <span className="text-[#888888]">Reason</span>
                                <span className="font-semibold text-[#1A1A1A] capitalize">{ret.reason.replace(/_/g, ' ')}</span>
                                <span className="text-[#888888]">Resolution</span>
                                <span className="font-semibold text-[#1A1A1A] capitalize">{ret.resolution}</span>
                                {ret.adminNote && <>
                                  <span className="text-[#888888]">Admin Note</span>
                                  <span className="font-semibold text-[#1A1A1A]">{ret.adminNote}</span>
                                </>}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end md:items-center justify-center" onClick={() => setReturnModalOrder(null)}>
          <div className="bg-white w-full max-w-[430px] md:max-w-[500px] mx-auto rounded-t-3xl md:rounded-2xl p-5 pb-8 max-h-[88vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-[#E8E0D5] rounded-full mx-auto mb-4" />
            <div className="flex items-center gap-2 mb-1">
              <RotateCcw className="w-5 h-5 text-[#C4601A]" />
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A]">Request a Return</h3>
            </div>
            <p className="text-[11px] text-[#888888] mb-4">
              Order #{returnModalOrder.id.slice(0, 16)}… · {returnModalOrder.items.length} item{returnModalOrder.items.length !== 1 ? 's' : ''}
            </p>

            {/* Reason */}
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase text-[#1A1A1A] tracking-wider block mb-2">Reason for Return</label>
              <div className="grid grid-cols-2 gap-2">
                {RETURN_REASONS.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setReturnReason(r.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                      returnReason === r.value
                        ? 'bg-[#C4601A] text-white border-[#C4601A]'
                        : 'bg-white text-[#4A4A4A] border-[#E8E0D5] hover:border-[#C4601A]'
                    }`}
                  >
                    <span>{r.icon}</span> {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase text-[#1A1A1A] tracking-wider block mb-2">Additional Details (optional)</label>
              <textarea
                value={returnDescription}
                onChange={e => setReturnDescription(e.target.value)}
                placeholder="Describe the issue in more detail..."
                rows={3}
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-3 text-xs resize-none focus:outline-none focus:border-[#C4601A]"
              />
            </div>

            {/* Resolution */}
            <div className="mb-5">
              <label className="text-[10px] font-bold uppercase text-[#1A1A1A] tracking-wider block mb-2">Preferred Resolution</label>
              <div className="flex gap-2">
                {(['refund', 'exchange'] as ReturnResolution[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setReturnResolution(r)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer capitalize ${
                      returnResolution === r
                        ? 'bg-[#C4601A] text-white border-[#C4601A]'
                        : 'bg-white text-[#4A4A4A] border-[#E8E0D5] hover:border-[#C4601A]'
                    }`}
                  >
                    {r === 'refund' ? '💰 Refund' : '🔄 Exchange'}
                  </button>
                ))}
              </div>
            </div>

            {/* Policy Note */}
            <div className="bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl p-3 mb-5 text-[10px] text-[#888888] space-y-1">
              <p className="font-bold text-[#1A1A1A]">Return Policy</p>
              <p>• Returns accepted within <strong>7 days</strong> of delivery</p>
              <p>• Items must be unused and in original packaging</p>
              <p>• Refunds processed within 5–7 business days after pickup</p>
              <p>• Our team will contact you on WhatsApp to arrange pickup</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReturnModalOrder(null)} className="flex-1 border border-[#E8E0D5] py-3 rounded-xl text-xs font-bold text-[#4A4A4A] hover:bg-[#FAF6F0] transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={submitReturn}
                disabled={submitting}
                className="flex-1 bg-[#C4601A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#a84e14] transition-colors cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
