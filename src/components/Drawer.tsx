import React, { useState, useEffect } from 'react';
import { LogOut, X, Tag, Layers, ArrowLeft, ShieldCheck, Shield } from 'lucide-react';
import { ActivePage } from '../types';
import { API_URL } from '../config';
import { PolicyModal } from './PolicyModal';

interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string;
}

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: ActivePage, param?: string) => void;
  showToast: (msg: string) => void;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onNavigate, showToast }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/api/categories`)
        .then(res => res.json())
        .then(data => setCategories(data || []))
        .catch(() => setCategories([]));
    }
  }, [isOpen]);

  const handleLogout = () => {
    showToast('Signed out of guest session successfully');
    onClose();
    onNavigate('landing');
  };

  // Short store-related category labels mapping
  const categoryEmojis: Record<string, string> = {
    kotadoria: '🪡',
    silk: '✨',
    cotton: '🌿',
    zari: '👑',
    handblock: '🎨',
    gottapatti: '🌸',
    tissue: '💎',
    leheriya: '🌊',
  };

  return (
    <>
      {/* Drawer Overlay */}
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
        className={`drawer fixed top-0 left-0 w-[260px] max-w-[80vw] h-full bg-white z-[201] shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="drawer-header brand-gradient px-5 pt-10 pb-5 text-white shrink-0 flex items-center justify-between border-b border-[#F5E4BC]/20">
          <div>
            <div className="font-serif text-xl font-bold mb-0.5">Categories</div>
            <div className="text-[11px] text-white/80">Explore authentic saree collections</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Categories List */}
        <div className="drawer-menu flex-1 py-3 px-2 overflow-y-auto space-y-1">
          {/* All Sarees */}
          <button
            onClick={() => {
              onNavigate('viewall', 'all');
              onClose();
            }}
            className="drawer-item w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FFF0E8] hover:text-[#C4601A] transition-all cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-[#FFF0E8] border border-[#F0C8A0]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4 text-[#C4601A]" />
            </div>
            <span className="text-[13px] font-bold font-sans text-[#111111] group-hover:text-[#C4601A]">All Sarees</span>
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onNavigate('viewall', cat.slug);
                onClose();
              }}
              className="drawer-item w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FFF0E8] hover:text-[#C4601A] transition-all cursor-pointer group"
            >
              <div className="w-8.5 h-8.5 rounded-lg overflow-hidden shrink-0 border border-[#E8E0D5] group-hover:border-[#C4601A] group-hover:scale-105 transition-all">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FAF6F0] flex items-center justify-center text-[15px]">
                    {categoryEmojis[cat.slug.toLowerCase()] || <Tag className="w-4 h-4 text-[#C4601A]" />}
                  </div>
                )}
              </div>
              <span className="text-[13px] font-bold font-sans text-[#111111] group-hover:text-[#C4601A]">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="shrink-0 border-t border-[#E8E0D5] p-2 space-y-1">
          {/* Back to Landing */}
          <button
            onClick={() => {
              onNavigate('landing');
              onClose();
            }}
            className="drawer-item w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#FFF0E8] transition-all cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-[#FFF0E8] border border-[#F0C8A0]/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowLeft className="w-4 h-4 text-[#C4601A]" />
            </div>
            <span className="text-[13px] font-semibold text-[#1A1A1A] group-hover:text-[#C4601A]">Back to Landing</span>
          </button>

          {/* Store Policies */}
          <button
            onClick={() => {
              setPolicyOpen(true);
            }}
            className="drawer-item w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#FFF0E8] transition-all cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 rounded-lg bg-[#FAF6F0] border border-[#E8E0D5] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-[#C4601A]" />
            </div>
            <span className="text-[13px] font-semibold text-[#1A1A1A] group-hover:text-[#C4601A]">Store Policies &amp; Legal</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="drawer-item w-full text-left flex items-center gap-3 px-4 py-3 border-b border-[#F0EAE2] hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-[13px] font-semibold">Logout</span>
          </button>
        </div>
      </div>

      <PolicyModal
        isOpen={policyOpen}
        initialTab="privacy"
        onClose={() => setPolicyOpen(false)}
      />
    </>
  );
};
