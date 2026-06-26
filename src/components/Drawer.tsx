import React, { useState } from 'react';
import { Heart, ShoppingBag, Shield, FileText, HelpCircle, LogOut, X, Package, BookOpen } from 'lucide-react';
import { ActivePage } from '../types';
import logoUrl from '@/assets/logo.jpg';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: ActivePage, param?: string) => void;
  showToast: (msg: string) => void;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onNavigate, showToast }) => {
  // Modal toggle state for Privacy, Terms, and FAQs
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'faqs' | null>(null);

  const handleLogout = () => {
    try {
      localStorage.removeItem('laxmi_cart');
      localStorage.removeItem('laxmi_wishlist');
    } catch (e) {
      console.warn('localStorage removeItem failed', e);
    }
    
    showToast('Signed out of guest session successfully');
    onClose();
    
    // Smooth reset to homepage
    onNavigate('landing');
  };

  return (
    <>
      {/* Drawer Overlay - Siblings structure to prevent click propagation issues */}
      <div
        id="drawerOverlay"
        onClick={onClose}
        className={`drawer-overlay fixed inset-0 z-[200] bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer Body */}
      <div
        id="drawer"
        className={`drawer fixed top-0 left-0 w-[280px] max-w-[85vw] h-full bg-white z-[201] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="drawer-header bg-gradient-to-br from-[#7B1C2E] to-[#A0243A] p-6 pt-12 pb-6 text-white shrink-0 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full border-2 border-[#C9A84C] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Snehsarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <div className="drawer-brand font-serif text-2xl font-semibold mb-0.5">
              Snehsarees
            </div>
            <div className="drawer-tagline text-xs text-white/70">
              Handcrafted sarees, woven with love
            </div>
          </div>
        </div>

        {/* Drawer Navigation List */}
        <div className="drawer-menu flex-1 py-3 overflow-y-auto">
          <button
            onClick={() => {
              onNavigate('wishlist');
              onClose();
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <Heart className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              Wishlist
            </span>
          </button>

          <button
            onClick={() => {
              onNavigate('orders');
              onClose();
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              My Orders
            </span>
          </button>

          <button
            onClick={() => {
              onNavigate('bulk');
              onClose();
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <Package className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              Bulk Orders
            </span>
          </button>

          <button
            onClick={() => {
              onNavigate('knowledge');
              onClose();
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              Saree Knowledge
            </span>
          </button>

          <button
            onClick={() => {
              setActiveModal('privacy');
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <Shield className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              Privacy Policy
            </span>
          </button>

          <button
            onClick={() => {
              setActiveModal('terms');
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <FileText className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              Terms & Conditions
            </span>
          </button>

          <button
            onClick={() => {
              setActiveModal('faqs');
            }}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-5 h-5 text-[#7B1C2E]" />
            <span className="drawer-item-label text-[15px] font-semibold text-[#1A1A1A]">
              FAQs
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="drawer-item w-full text-left flex items-center gap-4 px-5 py-4 border-b border-[#E8E0D5] hover:bg-[#FAF6F0] text-red-600 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-[#DC3545]" />
            <span className="drawer-item-label text-[15px] font-semibold">
              Logout
            </span>
          </button>
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer p-5 bg-[#FAF6F0] border-t border-[#E8E0D5] shrink-0">
          <div className="drawer-version text-xs text-[#888888]">
            Snehsarees v1.0.0
          </div>
        </div>
      </div>

      {/* Dynamic Popups/Modals for Interactive Secondary options */}
      {activeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-[500px] h-[480px] bg-white rounded-2xl border border-[#E8E0D5] shadow-2xl flex flex-col overflow-hidden animate-scale-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E8E0D5] bg-[#FAF6F0] flex justify-between items-center shrink-0">
              <h2 className="font-serif text-lg md:text-xl font-bold text-[#7B1C2E]">
                {activeModal === 'privacy' && 'Privacy Policy'}
                {activeModal === 'terms' && 'Terms & Conditions'}
                {activeModal === 'faqs' && 'Frequently Asked Questions'}
              </h2>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-5 md:p-6 overflow-y-auto flex-1 font-sans text-xs md:text-sm text-[#4A4A4A] leading-relaxed space-y-4">
              {activeModal === 'privacy' && (
                <>
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">
                    1. Information Collection
                  </p>
                  <p>
                    We collect essential information to capture and fulfill handloom saree orders. This includes your name, shipping address, contact phone number, and preferred payment choice.
                  </p>
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">
                    2. Order Dispatch & WhatsApp
                  </p>
                  <p>
                    Because Snehsarees manages authentic weaver dispatches, your confirmed orders generate ready-to-send WhatsApp messages to coordinate artisanal delivery safely.
                  </p>
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">
                    3. No Commercial Sharing
                  </p>
                  <p>
                    We value consumer privacy above all. Your delivery information or product preferences will never be sold, or shared with third-party digital networks or marketing systems.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">
                    1. Handcrafted Artisan Saree Standard
                  </p>
                  <p>
                    Each saree displayed in our catalogue is curated or loomed manually by hand weavers. Any Minor irregularities in dye layers, block alignments, or weave nodes are normal features of Handcrafted Indian art and are highly prized.
                  </p>
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">
                    2. Secure Invoicing & Quotes
                  </p>
                  <p>
                    All listed retail prices are quoted in Indian Rupees (₹) inclusive of local weaving taxes. Snehsarees covers free domestic express shipping for all orders.
                  </p>
                  <p className="font-serif text-[#1A1A1A] font-bold text-sm">
                    3. Order Fulfillments
                  </p>
                  <p>
                    Placing an order creates a direct invoice track. Weaver partners inspect your saree package personally before courier handover.
                  </p>
                </>
              )}

              {activeModal === 'faqs' && (
                <div className="space-y-4.5">
                  <div>
                    <h4 className="font-serif font-bold text-[#1A1A1A] mb-1 text-sm">
                      Q: How do I verify authenticity?
                    </h4>
                    <p className="text-gray-600 pl-1">
                      A: Our sarees carry Handloom Mark or Silk Mark endorsements where specified, indicating genuine yarn sourcing straight from local weaver clusters.
                    </p>
                  </div>
                  <hr className="border-[#E8E0D5]" />
                  <div>
                    <h4 className="font-serif font-bold text-[#1A1A1A] mb-1 text-sm">
                      Q: Is a blouse piece included?
                    </h4>
                    <p className="text-gray-600 pl-1">
                      A: Yes! Standard handloom pieces are supplied with 80cm of running unstitched blouse material matching the saree yardage.
                    </p>
                  </div>
                  <hr className="border-[#E8E0D5]" />
                  <div>
                    <h4 className="font-serif font-bold text-[#1A1A1A] mb-1 text-sm">
                      Q: What are the typical transit periods?
                    </h4>
                    <p className="text-gray-600 pl-1">
                      A: Snehsarees uses courier agencies for rapid shipping. Deliveries take 5–7 business days to most addresses in India.
                    </p>
                  </div>
                  <hr className="border-[#E8E0D5]" />
                  <div>
                    <h4 className="font-serif font-bold text-[#1A1A1A] mb-1 text-sm">
                      Q: What is the return guideline?
                    </h4>
                    <p className="text-gray-600 pl-1">
                      A: As these are loomed yarn pieces, returns or exchanges are allowed within 7 days ONLY if damage is present on first opening.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF6F0] p-4 border-t border-[#E8E0D5] text-right shrink-0">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#7B1C2E] font-semibold text-white px-5 py-2 rounded-lg text-xs hover:bg-[#9B2840] transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
