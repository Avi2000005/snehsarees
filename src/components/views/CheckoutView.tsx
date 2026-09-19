import React, { useState } from 'react';
import { ArrowLeft, Banknote, Home, Plus, X, ShieldCheck, Lock, Check } from 'lucide-react';
import { CartItem, ActivePage, Order, UserProfile, UserAddress } from '../../types';
import { API_URL } from '../../config';
import { PolicyModal, PolicyTab } from '../PolicyModal';

interface CheckoutViewProps {
  cart: CartItem[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onOrderConfirm: (order: Order) => void;
  showToast: (msg: string) => void;
  token: string | null;
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile | null) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  onNavigate,
  onOrderConfirm,
  showToast,
  token,
  user,
  onUpdateUser
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab | null>(null);

  // Find default address (or first if no default)
  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [addr1, setAddr1] = useState(defaultAddr?.addressLine || '');
  const [addr2, setAddr2] = useState('');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [pincode, setPincode] = useState(defaultAddr?.pinCode || '');
  const [state, setState] = useState(defaultAddr?.state || '');

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(defaultAddr?.id || null);

  React.useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!phone && user.phone) setPhone(user.phone);
      if (!email && user.email) setEmail(user.email);

      const def = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
      if (def && !addr1 && !city && !state && !pincode) {
        setSelectedAddressId(def.id);
        setAddr1(def.addressLine || '');
        setCity(def.city || '');
        setState(def.state || '');
        setPincode(def.pinCode || '');
      }
    }
  }, [user]);

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    setAddr1(addr.addressLine);
    setAddr2('');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pinCode);
  };

  // Add Address Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabel, setNewLabel] = useState('Home');
  const [newLine, setNewLine] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newDefault, setNewDefault] = useState(false);
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine.trim() || !newCity.trim() || !newState.trim() || !newPin.trim()) {
      showToast('Please fill in all required address fields.');
      return;
    }

    if (newPin.trim().length !== 6) {
      showToast('Enter a valid 6-digit pincode');
      return;
    }

    const newAddr: UserAddress = {
      id: Date.now().toString(),
      label: newLabel,
      addressLine: newLine.trim(),
      addressLine2: newLine2.trim(),
      city: newCity.trim(),
      state: newState.trim(),
      pinCode: newPin.trim(),
      isDefault: newDefault || !user?.addresses || user.addresses.length === 0,
    };

    const currentAddresses = [...(user?.addresses || [])];
    if (newAddr.isDefault) {
      currentAddresses.forEach(a => a.isDefault = false);
    }
    currentAddresses.push(newAddr);

    setIsSavingAddr(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ addresses: currentAddresses })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save address.');

      onUpdateUser(data.user);
      showToast('Address added successfully! ✨');
      handleSelectAddress(newAddr);

      // Reset & close
      setShowAddModal(false);
      setNewLabel('Home');
      setNewLine('');
      setNewLine2('');
      setNewCity('');
      setNewState('');
      setNewPin('');
      setNewDefault(false);
    } catch (err: any) {
      showToast(err.message || 'Error saving address.');
    } finally {
      setIsSavingAddr(false);
    }
  };

  // Payment state — Razorpay is the only accepted payment method
  const [paymentMethod] = useState<'razorpay'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);


  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getDeliveryFee = () => {
    return getSubtotal() >= 2000 ? 0 : 100; // Free for orders ₹2000+, else ₹100
  };

  const getFinalTotal = () => {
    const sub = getSubtotal();
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const delivery = getDeliveryFee();
    return Math.max(0, sub - discount + delivery);
  };



  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: getSubtotal()
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponError(null);
        showToast('Coupon applied successfully!');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err) {
      setCouponError('Failed to validate coupon.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleContinueToPayment = async () => {
    if (
      !name.trim() ||
      !phone.trim() ||
      !addr1.trim() ||
      !city.trim() ||
      !pincode.trim() ||
      !state.trim()
    ) {
      showToast('Please fill all required fields ✱');
      return;
    }

    if (phone.trim().length < 10) {
      showToast('Enter a valid 10-digit phone number');
      return;
    }

    if (pincode.trim().length !== 6) {
      showToast('Enter a valid 6-digit pincode');
      return;
    }

    // Auto-save new address to user profile if logged in and not already saved
    if (token && user) {
      const existingAddress = (user.addresses || []).find(
        (a) =>
          a.addressLine.trim().toLowerCase() === addr1.trim().toLowerCase() &&
          a.city.trim().toLowerCase() === city.trim().toLowerCase() &&
          a.state.trim().toLowerCase() === state.trim().toLowerCase() &&
          a.pinCode.trim() === pincode.trim()
      );

      if (!existingAddress) {
        const newAddr: UserAddress = {
          id: Date.now().toString(),
          label: 'Saved Address',
          addressLine: addr1.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pincode.trim(),
          isDefault: !user.addresses || user.addresses.length === 0,
        };

        const updatedAddresses = [...(user.addresses || []), newAddr];
        try {
          const res = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ addresses: updatedAddresses }),
          });
          const data = await res.json();
          if (res.ok && data.user) {
            onUpdateUser(data.user);
            setSelectedAddressId(newAddr.id);
            showToast('New shipping address saved to your account! 🏠');
          }
        } catch (err) {
          console.error('Auto-save checkout address error:', err);
        }
      }
    }

    setStep(2);
  };



  // Place COD order
  const processCODOrder = async () => {
    setIsProcessing(true);
    try {
      const addressString = `${addr1.trim()}${addr2.trim() ? ', ' + addr2.trim() : ''}, ${city.trim()} - ${pincode.trim()}, ${state.trim()}`;
      const res = await fetch(`${API_URL}/api/orders/razorpay-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || user?.email || undefined,
          address: addressString,
          city: city.trim(),
          pincode: pincode.trim(),
          state: state.trim(),
          items: cart.map(it => ({ id: it.id, qty: it.qty })),
          method: 'COD',
          couponCode: appliedCoupon ? appliedCoupon.code : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');
      onOrderConfirm(data.order);
      showToast('Order placed! Pay cash on delivery.');
      onNavigate('success');
    } catch (err: any) {
      showToast(err.message || 'Error placing order.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Place Razorpay Standard Checkout order
  const processRazorpayOrder = async () => {
    if (!window.Razorpay) {
      showToast('Payment gateway is not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    try {
      const addressString = `${addr1.trim()}${addr2.trim() ? ', ' + addr2.trim() : ''}, ${city.trim()} - ${pincode.trim()}, ${state.trim()}`;

      // Step 1: Create Razorpay order on backend
      const res = await fetch(`${API_URL}/api/orders/razorpay-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || user?.email || undefined,
          address: addressString,
          city: city.trim(),
          pincode: pincode.trim(),
          state: state.trim(),
          items: cart.map(it => ({ id: it.id, qty: it.qty })),
          method: 'Razorpay',
          couponCode: appliedCoupon ? appliedCoupon.code : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initiate payment.');

      const { order, razorpayOrderId, razorpayKeyId } = data;

      if (!razorpayOrderId) {
        throw new Error('Payment gateway did not return an order ID. Please try again.');
      }

      setIsProcessing(false);

      // Step 2: Open Razorpay modal
      const rzp = new window.Razorpay({
        key: razorpayKeyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(order.total * 100),
        currency: 'INR',
        name: 'Sneh Sarees',
        description: `Order ${order.id}`,
        image: '/logo.jpg',
        order_id: razorpayOrderId,
        prefill: {
          name: name.trim(),
          email: email.trim() || user?.email || '',
          contact: phone.trim(),
        },
        notes: {
          order_id: order.id,
          address: addressString,
        },
        theme: { color: '#C4601A' },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled. Your order is not confirmed.');
          },
        },
        handler: async (response) => {
          // Step 3: Verify payment signature on backend
          try {
            const verifyRes = await fetch(`${API_URL}/api/orders/razorpay-verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                order_id: order.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment verification failed.');
            }
            onOrderConfirm(order);
            showToast('Payment successful! Order confirmed ✨');
            onNavigate('success');
          } catch (verifyErr: any) {
            showToast(verifyErr.message || 'Payment verification error. Please contact support.');
          }
        },
      });

      // Listen for payment failure events
      rzp.on('payment.failed', (response: any) => {
        showToast(`Payment failed: ${response.error?.description || 'Unknown error'}. Please try again.`);
      });

      rzp.open();
    } catch (err: any) {
      showToast(err.message || 'Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div id="page-checkout" className="bg-[#FAF6F0] min-h-screen">
      {/* Checkout Navbar */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              onNavigate('cart');
            }
          }}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          Checkout
        </div>
        <button
          className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
          title="Return to Home Section"
        >
          <Home className="w-[22px] h-[22px]" />
        </button>
      </div>

      {/* Progress Checker Stepper */}
      <div className="checkout-steps max-w-[580px] md:max-w-[620px] mx-auto flex items-center p-4 px-6 bg-white border-b border-[#E8E0D5] mt-1 shadow-xs">
        <div className="checkout-step flex flex-col items-center gap-1 flex-1">
          <div
            className={`step-circle w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 1 ? 'bg-[#C4601A] text-white' : 'bg-emerald-600 text-white'
              }`}
          >
            {step === 1 ? '1' : '✓'}
          </div>
          <div className={`step-label text-[10px] font-semibold ${step === 1 ? 'text-[#C4601A]' : 'text-emerald-700'}`}>
            Delivery
          </div>
        </div>

        <div className={`step-connector flex-1 h-[1.5px] mb-4 mx-2 ${step === 2 ? 'bg-emerald-600' : 'bg-[#E8E0D5]'}`} />

        <div className="checkout-step flex flex-col items-center gap-1 flex-1">
          <div
            className={`step-circle w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 2 ? 'bg-[#C4601A] text-white' : 'bg-[#E8E0D5] text-[#888888]'
              }`}
          >
            2
          </div>
          <div className={`step-label text-[10px] font-semibold ${step === 2 ? 'text-[#C4601A]' : 'text-[#888888]'}`}>
            Payment
          </div>
        </div>

        <div className="step-connector flex-1 h-[1.5px] mb-4 mx-2 bg-[#E8E0D5]" />

        <div className="checkout-step flex flex-col items-center gap-1 flex-1">
          <div className="step-circle w-7.5 h-7.5 rounded-full bg-[#E8E0D5] text-[#888888] flex items-center justify-center text-xs font-bold">
            ✓
          </div>
          <div className="step-label text-[10px] font-semibold text-[#888888]">Done</div>
        </div>
      </div>

      <div className="max-w-[580px] md:max-w-[620px] mx-auto pt-2 pb-16">
        {/* STEP 1: DELIVERY VIEW */}
        {step === 1 ? (
          <div id="checkout-step1" className="checkout-form p-4 px-3.5 bg-white rounded-b-xl border border-[#E8E0D5] shadow-xs">
            <h3 className="form-section-title font-serif text-lg font-bold text-[#1A1A1A] mb-4">
              Delivery Details
            </h3>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="mb-6 pb-4 border-b border-[#E8E0D5]">
                <div className="flex justify-between items-center mb-2.5">
                  <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider uppercase">
                    Select a Saved Address
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="text-[11px] font-bold text-[#C4601A] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-3 no-scroll">
                  {user.addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`min-w-[240px] max-w-[280px] flex-shrink-0 bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected
                            ? 'border-[#C4601A] bg-[#FFF8F4] ring-1 ring-[#C4601A]/20'
                            : 'border-[#E8E0D5] hover:border-gray-400'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold uppercase bg-[#FAF6F0] border border-[#E8E0D5] text-[#C4601A] px-2 py-0.5 rounded-md">
                            {addr.label}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#1A1A1A] font-semibold leading-relaxed mb-1 line-clamp-2 h-[36px] overflow-hidden">
                          {addr.addressLine}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              token && (
                <div className="mb-6 pb-4 border-b border-dashed border-[#E8E0D5] flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-semibold">No saved addresses found.</span>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="bg-[#C4601A]/10 text-[#C4601A] hover:bg-[#C4601A]/20 text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Saved Address
                  </button>
                </div>
              )
            )}

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Full Name *
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Phone Number *
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile number"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Email Address
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Address Line 1 *
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                type="text"
                value={addr1}
                onChange={(e) => {
                  setAddr1(e.target.value);
                  setSelectedAddressId(null);
                }}
                placeholder="House / Flat No., Street, Colony"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Address Line 2 (Optional)
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                type="text"
                value={addr2}
                onChange={(e) => {
                  setAddr2(e.target.value);
                  setSelectedAddressId(null);
                }}
                placeholder="Landmark, Area, Near to..."
              />
            </div>

            <div className="form-row grid grid-cols-2 gap-3 mb-4">
              <div className="form-group">
                <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                  City *
                </label>
                <input
                  className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                  type="text"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setSelectedAddressId(null);
                  }}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                  Pincode *
                </label>
                <input
                  className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ''));
                    setSelectedAddressId(null);
                  }}
                  placeholder="411001"
                />
              </div>
            </div>

            <div className="form-group mb-5">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                State *
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#C4601A] outline-none"
                type="text"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setSelectedAddressId(null);
                }}
                placeholder="Maharashtra"
              />
            </div>

            <button
              onClick={handleContinueToPayment}
              className="form-continue-btn w-full bg-[#C4601A] text-white py-4 rounded-xl text-[15px] font-bold tracking-wider hover:bg-[#FFF0E8] active:scale-99 transition-all cursor-pointer shadow-md text-center inline-block"
            >
              Continue to Payment →
            </button>
          </div>
        ) : (
          /* STEP 2: PAYMENT VIEW */
          <div id="checkout-step2" className="mt-2.5">
            {/* Order sum mini */}
            <div className="order-summary-mini bg-[#FAF6F0] rounded-xl px-4 py-3.5 border border-[#E8E0D5] mb-4 mx-3 shadow-5xs text-[#4A4A4A]">
              <div className="osm-title text-[10px] font-bold text-[#888888] tracking-wider uppercase mb-2">
                Order Summary
              </div>
              <div className="flex flex-col gap-1.5">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.colour}`} className="text-xs flex justify-between">
                    <span>
                      • {item.name} <span className="text-[#888888] font-sans font-bold">x{item.qty}</span> ({item.colour})
                    </span>
                    <span className="font-semibold text-right">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
              <div className="osm-total mt-4 pt-3 border-t border-[#E8E0D5] text-xs font-semibold text-gray-500 flex justify-between">
                <span>Subtotal</span>
                <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>
              <div className="text-xs text-gray-600 font-semibold flex justify-between mt-1">
                <span>Delivery Charges</span>
                {getDeliveryFee() === 0 ? (
                  <span className="text-emerald-700 font-bold">FREE ✓</span>
                ) : (
                  <span className="text-[#1A1A1A] font-bold">+ ₹{getDeliveryFee().toLocaleString('en-IN')}</span>
                )}
              </div>
              {appliedCoupon && (
                <div className="text-xs text-emerald-700 font-semibold flex justify-between mt-1">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="osm-final-total mt-2 pt-2 border-t border-dashed border-[#E8E0D5] text-sm font-bold text-[#C4601A] flex justify-between">
                <span>Final Payable Amount</span>
                <span>₹{getFinalTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Promo / Coupon Apply Box */}
            <div className="bg-white rounded-xl p-4 border border-[#E8E0D5] mb-4 mx-3 shadow-5xs">
              <div className="text-[10px] font-bold text-[#888888] tracking-wider uppercase mb-2">
                Have a Coupon / Promo Code?
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  disabled={!!appliedCoupon}
                  className="flex-1 bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-3 py-2.5 text-xs font-semibold uppercase focus:outline-none focus:border-[#C4601A] disabled:opacity-60"
                />
                {appliedCoupon ? (
                  <button
                    onClick={handleRemoveCoupon}
                    className="bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="bg-[#C4601A] text-white hover:bg-[#FFF0E8] disabled:bg-gray-300 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    {validatingCoupon ? 'Applying...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && <p className="text-[10px] text-red-600 font-bold mt-1.5">{couponError}</p>}
              {appliedCoupon && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 mt-2.5 text-xs font-semibold flex items-center justify-between">
                  <span>✓ Code <strong>{appliedCoupon.code}</strong> Applied!</span>
                  <span className="font-extrabold">- ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* ══ PAYMENT METHODS PANEL ══ */}
            <div className="payment-section px-3.5 pb-6">
              <h3 className="font-serif text-lg font-bold text-[#1A1A1A] mb-3">Select Payment Method</h3>

              {/* ── RAZORPAY — ONLY PAYMENT METHOD ── */}
              <div
                id="pm-razorpay"
                className="bg-white rounded-xl mb-3 border-2 border-[#C4601A] overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-[#C4601A] shrink-0 flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C4601A]" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#FFF0E8] flex items-center justify-center shrink-0">
                    <span className="text-base font-extrabold text-[#C4601A]">₹</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-[#1A1A1A]">Pay via Razorpay</h5>
                    <p className="text-xs text-[#888888]">UPI, Cards, Net Banking, Wallets · Instant & Secure</p>
                  </div>
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Active</span>
                </div>

                <div className="border-t border-[#FAF6F0] px-4 pb-5 pt-4">
                  <div className="text-center">
                    <p className="text-xs text-[#555] font-semibold mb-4 leading-relaxed">
                      Pay <strong className="text-[#C4601A]">₹{getFinalTotal().toLocaleString('en-IN')}</strong> securely via UPI, Credit/Debit Card, Net Banking or Wallets.
                    </p>
                    <div className="flex justify-center gap-3 mb-4 flex-wrap">
                      {['GPay', 'PhonePe', 'VISA', 'MC', 'RuPay'].map(m => (
                        <span key={m} className="bg-[#FAF6F0] border border-[#E8E0D5] text-[10px] font-bold text-[#4A4A4A] px-2.5 py-1 rounded-lg">{m}</span>
                      ))}
                    </div>
                    <button
                      id="btn-razorpay-pay"
                      onClick={processRazorpayOrder}
                      disabled={isProcessing}
                      className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[#a84e15] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                      ) : (
                        <>🔒 Pay ₹{getFinalTotal().toLocaleString('en-IN')} Securely</>
                      )}
                    </button>
                    <p className="text-[10px] text-[#888] font-semibold mt-2">Powered by Razorpay · 256-bit SSL encrypted</p>
                  </div>
                </div>
              </div>

              {/* ── METHOD: Cash on Delivery (Temporarily Disabled) ── */}
              <div
                id="pm-cod"
                className="bg-white rounded-xl mb-3 border border-[#E8E0D5] overflow-hidden opacity-60 cursor-not-allowed"
                onClick={() => showToast('Cash on Delivery is currently unavailable. Please pay online via Razorpay.')}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-[18px] h-[18px] rounded-full border border-gray-300 shrink-0" />
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-gray-700">Cash on Delivery</h5>
                    <p className="text-xs text-[#888888]">Currently unavailable for new orders</p>
                  </div>
                  <span className="text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full uppercase">Unavailable</span>
                </div>
              </div>

              {/* Trust Guarantee & Policy Links Bar */}
              <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#E8E0D5] mt-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-[#1A1A1A] font-bold">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Payment
                  </span>
                  <span className="flex items-center gap-1.5 text-[#C4601A]">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Quality Checked
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-[11px] font-semibold text-gray-500 border-t border-[#E8E0D5]">
                  <button type="button" onClick={() => setPolicyModalTab('shipping')} className="hover:text-[#C4601A] underline cursor-pointer">
                    Shipping Policy
                  </button>
                  <span>•</span>
                  <button type="button" onClick={() => setPolicyModalTab('returns')} className="hover:text-[#C4601A] underline cursor-pointer">
                    7-Day Returns
                  </button>
                  <span>•</span>
                  <button type="button" onClick={() => setPolicyModalTab('cancellation')} className="hover:text-[#C4601A] underline cursor-pointer">
                    Cancellation Policy
                  </button>
                  <span>•</span>
                  <button type="button" onClick={() => setPolicyModalTab('privacy')} className="hover:text-[#C4601A] underline cursor-pointer">
                    Privacy
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>


      {/* ─── ADDRESS ADD MODAL ─── */}

      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-[450px] bg-white rounded-2xl border border-[#E8E0D5] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E8E0D5] bg-[#FAF6F0] flex justify-between items-center">
              <h2 className="font-serif text-lg font-bold text-[#C4601A]">
                Add New Address
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewAddress} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setNewLabel(lbl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${newLabel === lbl
                          ? 'bg-[#C4601A] border-[#C4601A] text-white shadow-xs'
                          : 'bg-white border-[#E8E0D5] text-[#888] hover:bg-gray-50'
                        }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  placeholder="House / Flat No., Street, Colony"
                  value={newLine}
                  onChange={e => setNewLine(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Landmark, Area, Near to..."
                  value={newLine2}
                  onChange={e => setNewLine2(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit PIN"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={newState}
                  onChange={e => setNewState(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-new-default-addr"
                  checked={newDefault}
                  onChange={e => setNewDefault(e.target.checked)}
                  className="rounded text-[#C4601A] focus:ring-[#C4601A] cursor-pointer"
                />
                <label htmlFor="chk-new-default-addr" className="text-xs font-semibold text-gray-600 select-none cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-[#E8E0D5] py-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddr}
                  className="flex-1 bg-[#C4601A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#a84e15] disabled:bg-[#d89b74] transition-colors cursor-pointer text-center"
                >
                  {isSavingAddr ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      <PolicyModal
        isOpen={!!policyModalTab}
        initialTab={policyModalTab || 'privacy'}
        onClose={() => setPolicyModalTab(null)}
      />
    </div>
  );
};

