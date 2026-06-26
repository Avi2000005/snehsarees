import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Landmark, Wallet, Banknote } from 'lucide-react';
import { CartItem, ActivePage, Order } from '../../types';

interface CheckoutViewProps {
  cart: CartItem[];
  onNavigate: (page: ActivePage, param?: string) => void;
  onOrderConfirm: (order: Order) => void;
  showToast: (msg: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  onNavigate,
  onOrderConfirm,
  showToast
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addr1, setAddr1] = useState('');
  const [addr2, setAddr2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [state, setState] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
  const [customUpiId, setCustomUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
    return paymentMethod === 'cod' ? sub + 49 : sub;
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

  const processOrderPayment = () => {
    if (paymentMethod === 'upi' && !selectedUpiApp && !customUpiId.trim()) {
      showToast('Please select a UPI app or enter UPI ID');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const orderId = 'LXM' + Date.now().toString().slice(-7);
      const totalAmount = getFinalTotal();
      const methodLabel = {
        upi: selectedUpiApp ? `UPI (${selectedUpiApp.toUpperCase()})` : 'UPI',
        card: 'Credit / Debit Card',
        netbanking: 'Net Banking',
        wallet: 'Wallet',
        cod: 'Cash on Delivery'
      }[paymentMethod];

      const finalizedOrder: Order = {
        id: orderId,
        items: [...cart],
        total: totalAmount,
        method: methodLabel,
        name: name.trim(),
        phone: phone.trim(),
        address: `${addr1.trim()}${addr2.trim() ? ', ' + addr2.trim() : ''}, ${city.trim()} - ${pincode.trim()}`,
        createdAt: new Date().toISOString()
      };

      onOrderConfirm(finalizedOrder);
      setIsProcessing(false);
      onNavigate('success');
    }, 2000);
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
        <div className="w-8 h-8" /> {/* Balance spacer */}
      </div>

      {/* Progress Checker Stepper */}
      <div className="checkout-steps max-w-[580px] md:max-w-[620px] mx-auto flex items-center p-4 px-6 bg-white border-b border-[#E8E0D5] mt-1 shadow-xs">
        <div className="checkout-step flex flex-col items-center gap-1 flex-1">
          <div
            className={`step-circle w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 1 ? 'bg-[#7B1C2E] text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {step === 1 ? '1' : '✓'}
          </div>
          <div className={`step-label text-[10px] font-semibold ${step === 1 ? 'text-[#7B1C2E]' : 'text-emerald-700'}`}>
            Delivery
          </div>
        </div>

        <div className={`step-connector flex-1 h-[1.5px] mb-4 mx-2 ${step === 2 ? 'bg-emerald-600' : 'bg-[#E8E0D5]'}`} />

        <div className="checkout-step flex flex-col items-center gap-1 flex-1">
          <div
            className={`step-circle w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
              step === 2 ? 'bg-[#7B1C2E] text-white' : 'bg-[#E8E0D5] text-[#888888]'
            }`}
          >
            2
          </div>
          <div className={`step-label text-[10px] font-semibold ${step === 2 ? 'text-[#7B1C2E]' : 'text-[#888888]'}`}>
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

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Full Name *
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
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
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
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
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
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
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
                type="text"
                value={addr1}
                onChange={(e) => setAddr1(e.target.value)}
                placeholder="House / Flat No., Street, Colony"
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                Address Line 2 (Optional)
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
                type="text"
                value={addr2}
                onChange={(e) => setAddr2(e.target.value)}
                placeholder="Landmark, Area, Near to..."
              />
            </div>

            <div className="form-row grid grid-cols-2 gap-3 mb-4">
              <div className="form-group">
                <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                  City *
                </label>
                <input
                  className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Pune"
                />
              </div>
              <div className="form-group">
                <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                  Pincode *
                </label>
                <input
                  className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  placeholder="411001"
                />
              </div>
            </div>

            <div className="form-group mb-5">
              <label className="form-label block text-xs font-bold text-[#4A4A4A] tracking-wider mb-1.5 uppercase">
                State *
              </label>
              <input
                className="form-input w-full p-3 rounded-lg border border-[#E8E0D5] text-sm focus:border-[#7B1C2E] outline-none"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
              />
            </div>

            <button
              onClick={handleContinueToPayment}
              className="form-continue-btn w-full bg-[#7B1C2E] text-white py-4 rounded-xl text-[15px] font-bold tracking-wider hover:bg-[#9B2840] active:scale-99 transition-all cursor-pointer shadow-md text-center inline-block"
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
              <div className="osm-total mt-4 pt-3 border-t border-[#E8E0D5] text-sm font-bold text-[#7B1C2E] flex justify-between">
                <span>Total Items Bill</span>
                <span>₹{getSubtotal().toLocaleString('en-IN')}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="text-xs text-amber-700 font-bold flex justify-between mt-1">
                  <span>COD Handling Surcharge</span>
                  <span>+ ₹49</span>
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
                  paymentMethod === 'upi' ? 'border-[#7B1C2E]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('upi')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'upi' && (
                      <span className="w-2 h-2 rounded-full bg-[#7B1C2E]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#7B1C2E]">
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
                              ? 'border-[#7B1C2E] text-[#7B1C2E]'
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
                  paymentMethod === 'card' ? 'border-[#7B1C2E]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'card' && (
                      <span className="w-2 h-2 rounded-full bg-[#7B1C2E]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#7B1C2E]">
                    <CreditCard className="w-5 h-5 text-[#7B1C2E]" />
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
                      className="form-input w-full p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#7B1C2E]"
                      type="text"
                      placeholder="Card Number (16-Digit)"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="form-input p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#7B1C2E]"
                        type="text"
                        maxLength={5}
                        placeholder="MM / YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      <input
                        className="form-input p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#7B1C2E]"
                        type="password"
                        maxLength={3}
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <input
                      className="form-input w-full p-2.5 border border-[#E8E0D5] rounded-lg text-xs outline-none focus:border-[#7B1C2E]"
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
                  paymentMethod === 'netbanking' ? 'border-[#7B1C2E]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('netbanking')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'netbanking' && (
                      <span className="w-2 h-2 rounded-full bg-[#7B1C2E]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#7B1C2E]">
                    <Landmark className="w-5 h-5 text-[#7B1C2E]" />
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
                          className="bank-option text-xs font-semibold py-2 bg-white border border-[#E8E0D5] hover:border-[#7B1C2E] rounded-lg cursor-pointer"
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
                  paymentMethod === 'wallet' ? 'border-[#7B1C2E]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'wallet' && (
                      <span className="w-2 h-2 rounded-full bg-[#7B1C2E]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#7B1C2E]">
                    <Wallet className="w-5 h-5 text-[#7B1C2E]" />
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
                  paymentMethod === 'cod' ? 'border-[#7B1C2E]' : 'border-[#E8E0D5]'
                }`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="payment-method-header flex items-center gap-3 p-4">
                  <div className="payment-radio w-[18px] h-[18px] rounded-full border border-gray-400 shrink-0 flex items-center justify-center">
                    {paymentMethod === 'cod' && (
                      <span className="w-2 h-2 rounded-full bg-[#7B1C2E]" />
                    )}
                  </div>
                  <div className="payment-method-icon w-8 h-8 rounded-lg bg-[#FAF6F0] flex items-center justify-center shrink-0 text-[#7B1C2E]">
                    <Banknote className="w-5 h-5 text-[#7B1C2E]" />
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
                className="pay-btn w-full bg-[#7B1C2E] text-white font-bold py-4 rounded-xl hover:bg-[#9B2840] active:scale-99 transition-all cursor-pointer shadow-md text-center inline-block mt-4"
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
    </div>
  );
};
