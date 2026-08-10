import React, { useState } from 'react';
import { ActivePage, Product } from '../../types';
import { ArrowLeft, Send, CheckCircle, Home } from 'lucide-react';
import { API_URL } from '../../config';

interface BulkViewProps {
  onNavigate: (page: ActivePage) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
}

export const BulkView: React.FC<BulkViewProps> = ({ onNavigate, onBack, showToast }) => {
  const [name, setName] = useState('');
  const [boutique, setBoutique] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSarees, setSelectedSarees] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Fetch products
  React.useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
      })
      .catch((err) => console.error('Error fetching products in bulk view:', err));
  }, []);

  // Filter search results
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.fabric.toLowerCase().includes(query.toLowerCase()) ||
      p.colour.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 5));
    setShowResults(true);
  };

  const handleSelectSaree = (product: Product) => {
    if (selectedSarees.some(s => s.product.id === product.id)) {
      showToast('This saree is already added.');
      setSearchQuery('');
      setShowResults(false);
      return;
    }
    setSelectedSarees([...selectedSarees, { product, quantity: 10 }]);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleRemoveSaree = (id: number) => {
    setSelectedSarees(selectedSarees.filter(s => s.product.id !== id));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setSelectedSarees(selectedSarees.map(s => 
      s.product.id === id ? { ...s, quantity: Math.max(1, quantity) } : s
    ));
  };

  const handleReopenWhatsApp = () => {
    const itemsListMsg = selectedSarees
      .map(s => `  - ${s.product.name} (${s.product.fabric} / ${s.product.colour}): ${s.quantity} pieces`)
      .join('\n');

    const msg = `Namaste Sneh Sarees!\n\nBulk Order Inquiry:\n• Name: ${name}\n• Boutique/Event: ${boutique || 'N/A'}\n• WhatsApp: ${whatsapp}\n• Specific Sarees Requested:\n${itemsListMsg}\n• Specific Requirements: ${details || 'None'}\n\nPlease share catalog and wholesale price list. Thank you!`;
    const encodedMsg = encodeURIComponent(msg);

    try {
      window.open(`https://wa.me/919414067123?text=${encodedMsg}`, '_blank');
      showToast('Launching WhatsApp...');
    } catch (err) {
      console.error(err);
      showToast('Failed to redirect to WhatsApp. Please open wa.me/919414067123 directly.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      showToast('Please fill in your Name and WhatsApp Number.');
      return;
    }
    if (selectedSarees.length === 0) {
      showToast('Please search and add at least one saree to your inquiry.');
      return;
    }

    setIsSubmitting(true);

    const totalQty = selectedSarees.reduce((sum, item) => sum + item.quantity, 0);
    const preferredTypeVal = selectedSarees.map(s => s.product.name).join(', ').substring(0, 95);
    
    const itemsText = selectedSarees
      .map(s => `- ${s.product.name} (${s.product.fabric} / ${s.product.colour}): ${s.quantity} pcs`)
      .join('\n');
    const dbDetails = `Requested Sarees:\n${itemsText}\n\nSpecific Requirements:\n${details || 'None'}`;

    try {
      const response = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          boutique: boutique || undefined,
          whatsapp,
          quantity: `${totalQty} pcs`,
          preferredType: preferredTypeVal,
          details: dbDetails
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit inquiry to server.');
      }

      handleReopenWhatsApp();
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      {/* Top sticky navigation bar */}
      <div className="fixed top-0 left-0 right-0 h-[56px] md:h-[64px] bg-white border-b border-[#E8E0D5] flex items-center px-4 z-50 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer animate-scale-100 shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <span className="font-serif text-lg md:text-xl font-bold text-[#C4601A] ml-2 flex-1">
          Bulk & Wholesale
        </span>
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer shrink-0"
          title="Return to Home Section"
        >
          <Home className="w-5 h-5 text-[#1A1A1A]" />
        </button>
      </div>

      <div className="pt-[76px] md:pt-[84px] pb-[80px] px-4 max-w-[600px] mx-auto relative z-10">
        {/* Banner Card */}
        <div className="bg-gradient-to-br from-[#C4601A] via-[#7A2F08] to-[#7A5C00] rounded-2xl p-6 md:p-8 text-white shadow-lg mb-8 relative overflow-hidden">
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
          <ul className="text-[11px] md:text-xs text-[#F5E4BC] font-semibold space-y-1.5 list-disc pl-4">
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
              Thank you for choosing Sneh Sarees. We have launched WhatsApp to coordinate your request. If it didn't open, please click the button below to retry.
            </p>
            <button
              onClick={handleReopenWhatsApp}
              className="bg-[#C4601A] text-white py-3 px-6 rounded-full text-sm font-semibold hover:bg-[#FFF0E8] transition-colors cursor-pointer"
            >
              Reopen WhatsApp Chat
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="block w-full text-[#C4601A] mt-4 text-xs font-semibold hover:underline"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 md:p-8 border border-[#E8E0D5] shadow-xs space-y-5"
          >
            <h3 className="font-serif text-lg md:text-xl font-bold text-[#111111] border-b border-[#FAF6F0] pb-3">
              Request a Custom Quote
            </h3>

            {/* Contact Name */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase mb-1.5">
                Contact Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priyanjali Sharma"
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4601A] text-[#111111]"
              />
            </div>

            {/* Boutique Name */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase mb-1.5">
                Boutique / Institution Name <span className="text-[#333333] font-semibold">(Optional)</span>
              </label>
              <input
                type="text"
                value={boutique}
                onChange={(e) => setBoutique(e.target.value)}
                placeholder="e.g. Sneh Bridal Silks"
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4601A] text-[#111111]"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase mb-1.5">
                WhatsApp Contact Number *
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4601A] text-[#111111]"
              />
            </div>

            {/* Search and Add Saree Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider">
                Search & Add Sarees to Bulk Request *
              </label>
              
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => { if (searchQuery.trim()) setShowResults(true); }}
                  placeholder="Type to search sarees by name, fabric, or color..."
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4601A]"
                />
                
                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E8E0D5] rounded-xl shadow-lg z-25 divide-y divide-[#E8E0D5] max-h-[220px] overflow-y-auto">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectSaree(p)}
                        className="p-3 flex items-center gap-3 hover:bg-[#FAF6F0] cursor-pointer text-xs transition-colors"
                      >
                        <div className="w-8 h-10 bg-gray-100 rounded border overflow-hidden shrink-0">
                          {p.image && <img src={p.image} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-[#1a1a1a] block truncate">{p.name}</span>
                          <span className="text-[10px] text-gray-500 block truncate">{p.fabric} · {p.colour}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showResults && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-[#E8E0D5] rounded-xl shadow-lg p-4 text-center text-xs text-gray-500 z-20">
                    No matching sarees found.
                  </div>
                )}
              </div>
            </div>

            {/* Selected Sarees List */}
            {selectedSarees.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                  Added Sarees list ({selectedSarees.length})
                </label>
                <div className="space-y-2.5">
                  {selectedSarees.map((item) => (
                    <div key={item.product.id} className="flex gap-3 items-center bg-white p-3.5 rounded-xl border border-[#E8E0D5]">
                      {/* Saree Thumbnail */}
                      <div className="w-10 h-13 rounded-lg overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8E0D5]">
                        {item.product.image && (
                          <img src={item.product.image} className="w-full h-full object-cover" />
                        )}
                      </div>

                      {/* Saree Info */}
                      <div className="flex-1 text-xs min-w-0">
                        <span className="font-bold text-[#1a1a1a] block truncate leading-snug">{item.product.name}</span>
                        <span className="text-[10px] text-[#888888] block mt-1">{item.product.fabric} · {item.product.colour}</span>
                      </div>

                      {/* Quantity Input */}
                      <div className="w-[100px] shrink-0">
                        <label className="block text-[8px] font-bold text-gray-400 uppercase text-center mb-0.5">Pieces</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-2 py-1.5 text-xs font-semibold focus:outline-none focus:border-[#C4601A] text-center"
                        />
                      </div>

                      {/* Remove Saree Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSaree(item.product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer font-bold text-sm w-8 h-8 flex items-center justify-center"
                        title="Remove from request"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C4601A] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C4601A] text-white py-3.5 rounded-full text-sm md:text-base font-bold shadow-md hover:bg-[#FFF0E8] hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Registering Inquiry...' : 'Request Catalog & Prices'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
