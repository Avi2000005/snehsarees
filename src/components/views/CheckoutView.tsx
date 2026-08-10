import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Landmark, Wallet, Banknote, Home, Check, MapPin, Plus, X } from 'lucide-react';
import { CartItem, ActivePage, Order, UserProfile, UserAddress } from '../../types';
import { API_URL } from '../../config';

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
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newDefault, setNewDefault] = useState(false);
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine.trim() || !newCity.trim() || !newState.trim() || !newPin.trim()) {
      showToast('Please fill in all address fields.');
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

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [customUpiId, setCustomUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardName] = useState('');

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const getFinalTotal = () => {
    const sub = getSubtotal();
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
    const base = sub - discount;
    const shipping = paymentMethod === 'cod' ? 49 : 0;
    return base + shipping;
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

  const handleContinueToPayment = () => {
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

    setStep(2);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (value: string) => {
    setCardNumber(formatCardNumber(value));
  };

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processOrderPayment = async () => {
    if (paymentMethod === 'upi' && !selectedUpiApp && !customUpiId.trim()) {
      showToast('Please select a UPI app or enter UPI ID');
      return;
    }

    setIsProcessing(true);

    try {
      const addressString = `${addr1.trim()}${addr2.trim() ? ', ' + addr2.trim() : ''}, ${city.trim()} - ${pincode.trim()}`;
      const methodLabel = paymentMethod === 'cod' ? 'COD' : 'Razorpay';

      const res = await fetch(`${API_URL}/api/orders/razorpay-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: addressString,
          items: cart.map(it => ({ id: it.id, qty: it.qty })),
          method: methodLabel,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order.');
      }

      if (methodLabel === 'COD') {
        showToast('Order placed successfully (Cash on Delivery)!');
        onOrderConfirm(data.order);
        setIsProcessing(false);
        onNavigate('success');
        return;
      }

      // Handle Razorpay Checkout
      if (data.razorpayOrderId) {
        const scriptLoaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!scriptLoaded) {
          showToast('Failed to load Razorpay SDK. Please check your network.');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: data.razorpayKeyId,
          amount: data.order.total * 100,
          currency: 'INR',
          name: 'Sneh Sarees',
          description: 'Saree Purchase',
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch(`${API_URL}/api/orders/razorpay-verify`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                  order_id: data.order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                showToast('Payment successful!');
                onOrderConfirm({ ...data.order, status: 'paid' });
                onNavigate('success');
              } else {
                showToast(verifyData.error || 'Signature verification failed.');
              }
            } catch (err) {
              showToast('Error verifying payment.');
            }
          },
          prefill: {
            name: name.trim(),
            contact: phone.trim(),
            email: email.trim() || 'info@snehsarees.in'
          },
          theme: {
            color: '#C4601A'
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      } else {
        // Fallback: server is running in mock payment mode (no keys configured)
        const verifyRes = await fetch(`${API_URL}/api/orders/razorpay-verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            order_id: data.order.id,
            razorpay_order_id: data.order.id,
            razorpay_payment_id: 'pay_mock_123',
            razorpay_signature: 'mock_sig'
          })
        });

        if (verifyRes.ok) {
          showToast('Demo payment approved!');
          onOrderConfirm({ ...data.order, status: 'paid' });
          onNavigate('success');
        } else {
          showToast('Demo payment validation failed.');
        }
        setIsProcessing(false);
      }

    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'An error occurred during payment processing.');
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
            className={`step-circle w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 1 ? 'bg-[#C4601A] text-white' : 'bg-emerald-600 text-white'
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
            className={`step-circle w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 2 ? 'bg-[#C4601A] text-white' : 'bg-[#E8E0D5] text-[#888888]'
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
                        className={`min-w-[240px] max-w-[280px] flex-shrink-0 bg-white border-2 rounded-xl p-4 cursor-pointer transition-all ${
                          isSelected
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
                  {/* Plus Card inside list */}
                  <div
                    onClick={() => setShowAddModal(true)}
                    className="min-w-[150px] flex-shrink-0 bg-[#FAF6F0] border-2 border-dashed border-[#E8E0D5] hover:border-[#C4601A] rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all hover:bg-white text-center"
                  >
                    <Plus className="w-5 h-5 text-[#C4601A]" />
                    <span className="text-xs font-bold text-[#C4601A]">Add Address</span>
                  </div>
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
                placeholder="Priya Sharma"
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
                placeholder="98765 43210"
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
                placeholder="priya@email.com"
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
                  placeholder="Pune"
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
              {appliedCoupon && (
                <div className="text-xs text-emerald-700 font-semibold flex justify-between mt-1">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>- ₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {paymentMethod === 'cod' && (
                <div className="text-xs text-amber-700 font-semibold flex justify-between mt-1">
                  <span>COD Handling Surcharge</span>
                  <span>+ ₹49</span>
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
                  placeholder="e.g. WELCOME10, FESTIVE50"
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

            {/* Selector panel */}
            <div className="payment-section px-3.5 pb-6">
              <h3 className="payment-section-title font-serif text-lg font-bold text-[#1A1A1A] mb-3">
                Select Payment Method
              </h3>

              {/* method A: UPI */}
              <div
                className={`payment-method bg-white border-1.5 rounded-xl mb-2.5 overflow-hidden transition-colors cursor-pointer ${
                  paymentMethod === 'upi' ? 'border-[#C4601A]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'upi' && (
                      <span className="w-2 h-2 rounded-full bg-[#C4601A]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#C4601A]">
                    📱
                  </div>
                  <div className="flex-1">
                    <h5 className="payment-method-label font-bold text-sm text-[#1A1A1A]">UPI</h5>
                    <p className="payment-method-sub text-xs text-[#888888]">
                      GPay, PhonePe, Paytm, BHIM & more
                    </p>
                  </div>
                </div>
                {paymentMethod === 'upi' && (
                  <div className="payment-method-body px-4 pb-4 border-t border-[#FAF6F0] pt-3">
                    <div className="upi-apps flex gap-1.5 mb-2.5 overflow-x-auto no-scroll">
                      {[
                        { id: 'gpay', label: 'GPay', marker: 'G', bg: 'bg-[#1a73e8]' },
                        { id: 'phonepe', label: 'PhonePe', marker: 'Pe', bg: 'bg-[#5f259f]' },
                        { id: 'paytm', label: 'Paytm', marker: 'Pay', bg: 'bg-[#002970]' }
                      ].map((app) => (
                        <button
                          key={app.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUpiApp(app.id);
                          }}
                          className={`upi-app shrink-0 border rounded-lg p-2 px-3 text-xs font-semibold flex flex-col items-center gap-1.5 cursor-pointer ${
                            selectedUpiApp === app.id
                              ? 'border-[#C4601A] text-[#C4601A]'
                              : 'border-[#E8E0D5] text-[#4A4A4A] bg-white'
                          }`}
                        >
                          <div className={`w-8 h-8 ${app.bg} rounded-md text-white text-xs font-bold flex items-center justify-center`}>
                            {app.marker}
                          </div>
                          {app.label}
                        </button>
                      ))}
                    </div>
                    <div className="upi-id-label text-xs font-bold text-[#555555] mb-2 leading-none uppercase">
                      Or enter UPI ID
                    </div>
                    <input
                      className="form-input w-full p-2.5 border border-[#E8E0D5] rounded-xl text-xs outline-none bg-[#FAF6F0]"
                      type="text"
                      value={customUpiId}
                      onChange={(e) => setCustomUpiId(e.target.value)}
                      placeholder="username@upi"
                    />
                  </div>
                )}
              </div>

              {/* method B: Cards */}
              <div
                className={`payment-method bg-white border-1.5 rounded-xl mb-2.5 overflow-hidden transition-colors cursor-pointer ${
                  paymentMethod === 'card' ? 'border-[#C4601A]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'card' && (
                      <span className="w-2 h-2 rounded-full bg-[#C4601A]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#C4601A]">
                    <CreditCard className="w-5 h-5 text-[#C4601A]" />
                  </div>
                  <div className="flex-1">
                    <h5 className="payment-method-label font-bold text-sm text-[#1A1A1A]">
                      Credit / Debit Card
                    </h5>
                    <p className="payment-method-sub text-xs text-[#888888]">
                      Visa, Mastercard, RuPay & more
                    </p>
                  </div>
                </div>
                {paymentMethod === 'card' && (
                  <div className="payment-method-body px-4 pb-4 flex flex-col gap-2.5 pt-3 border-t border-[#FAF6F0]">
                    <input
                      className="form-input w-full p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#C4601A]"
                      type="text"
                      placeholder="Card Number (16-Digit)"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="form-input p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#C4601A]"
                        type="text"
                        maxLength={5}
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      <input
                        className="form-input p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#C4601A]"
                        type="password"
                        maxLength={3}
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <input
                      className="form-input w-full p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#C4601A]"
                      type="text"
                      placeholder="Name on Card"
                      value={cardHolder}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* method C: NetBanking */}
              <div
                className={`payment-method bg-white border-1.5 rounded-xl mb-2.5 overflow-hidden transition-colors cursor-pointer ${
                  paymentMethod === 'netbanking' ? 'border-[#C4601A]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'netbanking' && (
                      <span className="w-2 h-2 rounded-full bg-[#C4601A]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#C4601A]">
                    <Landmark className="w-5 h-5 text-[#C4601A]" />
                  </div>
                  <div className="flex-1">
                    <h5 className="payment-method-label font-bold text-sm text-[#1A1A1A]">
                      Net Banking
                    </h5>
                    <p className="payment-method-sub text-xs text-[#888888]">
                      SBI, HDFC, ICICI, Axis
                    </p>
                  </div>
                </div>
                {paymentMethod === 'netbanking' && (
                  <div className="payment-method-body px-4 pb-4 border-t border-[#FAF6F0] pt-3">
                    <div className="bank-options grid grid-cols-2 gap-2 text-center">
                      {['SBI', 'HDFC', 'ICICI', 'Axis'].map((bnk) => (
                        <div
                          key={bnk}
                          className="bank-option text-xs font-semibold py-2 bg-white border border-[#E8E0D5] hover:border-[#C4601A] rounded-lg cursor-pointer"
                        >
                          {bnk}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* method D: Wallets */}
              <div
                className={`payment-method bg-white border-1.5 rounded-xl mb-2.5 overflow-hidden transition-colors cursor-pointer ${
                  paymentMethod === 'wallet' ? 'border-[#C4601A]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'wallet' && (
                      <span className="w-2 h-2 rounded-full bg-[#C4601A]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#C4601A]">
                    <Wallet className="w-5 h-5 text-[#C4601A]" />
                  </div>
                  <div className="flex-1">
                    <h5 className="payment-method-label font-bold text-sm text-[#1A1A1A]">
                      Wallets
                    </h5>
                    <p className="payment-method-sub text-xs text-[#888888]">
                      Freecharge, Mobikwik, Paytm
                    </p>
                  </div>
                </div>
              </div>

              {/* method E: Cash on Delivery */}
              <div
                className={`payment-method bg-white border-1.5 rounded-xl mb-2.5 overflow-hidden transition-colors cursor-pointer ${
                  paymentMethod === 'cod' ? 'border-[#C4601A]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'cod' && (
                      <span className="w-2 h-2 rounded-full bg-[#C4601A]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#C4601A]">
                    <Banknote className="w-5 h-5 text-[#C4601A]" />
                  </div>
                  <div className="flex-1">
                    <h5 className="payment-method-label font-bold text-sm text-[#1A1A1A]">
                      Cash on Delivery
                    </h5>
                    <p className="payment-method-sub text-xs text-[#888888]">
                      Pay when your order arrives
                    </p>
                  </div>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="payment-method-body px-4 pb-4 border-t border-[#FAF6F0] pt-3">
                    <div className="cod-info bg-[#FFF8E1] text-[#7B5800] text-xs p-3 rounded-lg leading-relaxed">
                      ℹ A handling charge of ₹49 will be added for COD orders. Please keep exact change ready at delivery.
                    </div>
                  </div>
                )}
              </div>

              {/* Secure checkout trigger button */}
              <button
                disabled={isProcessing}
                onClick={processOrderPayment}
                className="pay-btn w-full bg-[#C4601A] text-white font-bold py-4 rounded-xl hover:bg-[#FFF0E8] active:scale-99 transition-all cursor-pointer shadow-md text-center inline-block mt-4"
              >
                <span className="block text-sm md:text-base font-bold">
                  {isProcessing
                    ? 'Processing Order...'
                    : `Confirm & Pay ₹${getFinalTotal().toLocaleString('en-IN')}`}
                </span>
                <span className="block text-[10px] font-normal opacity-85 mt-0.5">
                  Powered by Razorpay Secure
                </span>
              </button>
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
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newLabel === lbl
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
                  Address Line
                </label>
                <input
                  type="text"
                  placeholder="Street name, house/apartment number"
                  value={newLine}
                  onChange={e => setNewLine(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajasthan"
                    value={newState}
                    onChange={e => setNewState(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Pincode / Postal Code
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
    </div>
  );
};

