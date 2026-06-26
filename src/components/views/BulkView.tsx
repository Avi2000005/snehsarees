import React, { useState } from 'react';
import { ActivePage } from '../../types';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';

interface BulkViewProps {
  onNavigate: (page: ActivePage) => void;
  showToast: (msg: string) => void;
}

export const BulkView: React.FC<BulkViewProps> = ({ onNavigate, showToast }) => {
  const [name, setName] = useState('');
  const [boutique, setBoutique] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [qty, setQty] = useState('10 - 20 pieces');
  const [type, setType] = useState('Banarasi Silk');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      showToast('Please fill in your Name and WhatsApp Number.');
      return;
    }

    const msg = `Namaste Snehsarees!\n\nBulk Order Inquiry:\n• Name: ${name}\n• Boutique/Event: ${boutique || 'N/A'}\n• WhatsApp: ${whatsapp}\n• Est. Quantity: ${qty}\n• Preferred Type: ${type}\n• Specific Requirements: ${details || 'None'}\n\nPlease share catalog and wholesale price list. Thank you!`;
    const encodedMsg = encodeURIComponent(msg);

    try {
      window.open(`https://wa.me/919414067123?text=${encodedMsg}`, '_blank');
      setIsSubmitted(true);
      showToast('Wholesale inquiry created! Launching WhatsApp...');
    } catch (err) {
      console.error(err);
      showToast('Failed to redirect to WhatsApp. Please open wa.me/919414067123 directly.');
    }
  };

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      {/* Top sticky navigation bar */}
      <div className="fixed top-0 left-0 right-0 h-[56px] md:h-[64px] bg-white border-b border-[#E8E0D5] flex items-center px-4 z-50 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          onClick={() => onNavigate('landing')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer animate-scale-100"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <span className="font-serif text-lg md:text-xl font-bold text-[#7B1C2E] ml-2 flex-1">
          Bulk & Wholesale
        </span>
      </div>

      <div className="pt-[76px] md:pt-[84px] pb-[80px] px-4 max-w-[600px] mx-auto relative z-10">
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[#7B1C2E] via-[#5A1020] to-[#2D0810] rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
          {/* Subtle floral background pattern */}
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none select-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="url(#global-maroon-jaal)" />
            </svg>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 text-white tracking-wide">
            Wholesale Partnership
          </h2>
          <p className="text-white/85 text-xs md:text-sm leading-relaxed mb-4">
            We partner with boutique owners, wedding coordinators, and retailers across the globe to supply pure handloom sarees at direct weaver prices. 
          </p>
          <ul className="text-[11px] md:text-xs text-[#C9A84C] font-semibold space-y-1.5 list-disc pl-4">
            <li>Direct artisan sourcing & customizable weaving styles</li>
            <li>Minimum wholesale quantity starting from just 10 pieces</li>
            <li>Inspected packaging and secure nationwide express shipping</li>
          </ul>
        </div>

        {isSubmitted ? (
          <div className="bg-white rounded-2xl p-8 border border-[#E8E0D5] text-center shadow-xs">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-2">
              Inquiry Sent!
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Thank you for choosing Snehsarees. We have launched WhatsApp to coordinate your request. If it didn't open, please click the button below to retry.
            </p>
            <button
              onClick={handleSubmit}
              className="bg-[#7B1C2E] text-white py-3 px-6 rounded-full text-sm font-semibold hover:bg-[#9B2840] transition-colors cursor-pointer"
            >
              Reopen WhatsApp Chat
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="block w-full text-[#7B1C2E] mt-4 text-xs font-semibold hover:underline"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 md:p-8 border border-[#E8E0D5] shadow-xs space-y-5"
          >
            <h3 className="font-serif text-lg md:text-xl font-semibold text-[#1A1A1A] border-b border-[#FAF6F0] pb-3">
              Request a Custom Quote
            </h3>

            {/* Your Name */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priyanjali Sharma"
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B1C2E]"
              />
            </div>

            {/* Boutique Name */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase mb-1.5">
                Boutique / Institution Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={boutique}
                onChange={(e) => setBoutique(e.target.value)}
                placeholder="e.g. Sneh Bridal Silks"
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B1C2E]"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase mb-1.5">
                WhatsApp Contact Number *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B1C2E]"
              />
            </div>

            {/* Saree Quantity */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase mb-1.5">
                Estimated Order Size
              </label>
              <div className="relative">
                <select
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B1C2E] appearance-none"
                >
                  <option value="10 - 20 pieces">10 - 20 pieces</option>
                  <option value="21 - 50 pieces">21 - 50 pieces</option>
                  <option value="51 - 100 pieces">51 - 100 pieces</option>
                  <option value="100+ pieces">100+ pieces</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Saree preference */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase mb-1.5">
                Preferred Weave Category
              </label>
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B1C2E] appearance-none"
                >
                  <option value="Banarasi Silk">Banarasi Silk</option>
                  <option value="Kanjivaram Silk">Kanjivaram Silk</option>
                  <option value="Chanderi Cotton">Chanderi Cotton</option>
                  <option value="Sambalpuri Ikat">Sambalpuri Ikat</option>
                  <option value="Paithani">Paithani</option>
                  <option value="Mixed Collection">Mixed Collection</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  ▼
                </div>
              </div>
            </div>

            {/* Requirements Details */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1A] uppercase mb-1.5">
                Specific Design & Color Requirements
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe your design specifications, border expectations, custom color preferences, packaging needs..."
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B1C2E] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#7B1C2E] text-white py-3.5 rounded-full text-sm md:text-base font-bold shadow-md hover:bg-[#9B2840] hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Request Catalog & Prices
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
