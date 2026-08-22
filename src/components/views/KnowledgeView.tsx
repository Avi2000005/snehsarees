import React, { useState, useEffect } from 'react';
import { ActivePage, Category } from '../../types';
import { ArrowLeft, Globe, RefreshCw, Home } from 'lucide-react';
import logoUrl from '@/assets/logo.jpg';
import { API_URL } from '../../config';

interface KnowledgeViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  activeSlug?: string;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ onNavigate, onBack, activeSlug }) => {
  const renderStampContent = (title: string) => {
    switch (title) {
      case 'Classic Cotton Kota Doria':
        return (
          <div className="w-full h-full bg-[#E6F3EA] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{
              backgroundImage: 'linear-gradient(90deg, #C4601A 1px, transparent 1px), linear-gradient(0deg, #C4601A 1px, transparent 1px)',
              backgroundSize: '12px 12px'
            }} />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#C4601A] fill-none" strokeWidth="1.2">
              <rect x="20" y="30" width="60" height="60" strokeDasharray="3 3" strokeWidth="1" />
              <circle cx="50" cy="60" r="12" fill="#C4601A" opacity="0.3" />
              <circle cx="50" cy="60" r="6" fill="#C4601A" />
            </svg>
          </div>
        );
      case 'Kotadoria Silk Tissue':
        return (
          <div className="w-full h-full bg-[#78281F] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/15 to-white/0 pointer-events-none" />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#F5E4BC] fill-none" strokeWidth="1.2">
              <path d="M10,110 Q40,80 30,50 T75,20" />
              <path d="M30,50 Q15,40 25,25" />
              <path d="M52,35 Q65,45 55,60" />
              <path d="M75,20 C70,10 85,5 80,20 C75,30 65,20 75,20" fill="#F5E4BC" />
            </svg>
          </div>
        );
      case 'Zari Border Kotadoria':
        return (
          <div className="w-full h-full bg-[#1e1b4b] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#F5E4BC] fill-none" strokeWidth="1.2">
              <circle cx="20" cy="20" r="3" fill="#F5E4BC" />
              <circle cx="50" cy="20" r="3" fill="#F5E4BC" />
              <circle cx="80" cy="20" r="3" fill="#F5E4BC" />
              <path d="M10,120 L25,95 L40,120 M40,120 L55,95 L70,120 M70,120 L85,95 L100,120" strokeWidth="1.5" />
            </svg>
          </div>
        );
      case 'Handblock Printed Kotadoria':
        return (
          <div className="w-full h-full bg-[#B25329] flex items-center justify-center p-2 relative">
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-white fill-none" strokeWidth="1">
              <path d="M10,60 L50,15 L90,60 L50,105 Z" strokeWidth="1.5" />
              <path d="M25,60 L50,32 L75,60 L50,88 Z" strokeDasharray="1.5 1.5" />
            </svg>
          </div>
        );
      case 'Gotta Patti & Zari Kotadoria':
        return (
          <div className="w-full h-full bg-[#5B21B6] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-95 fill-none" strokeWidth="1.2">
              <line x1="5" y1="110" x2="95" y2="110" stroke="#F5E4BC" strokeWidth="3" />
              <line x1="5" y1="105" x2="95" y2="105" stroke="#F5E4BC" strokeWidth="1" />
              <g transform="translate(50, 55) scale(1.1)" stroke="#F5E4BC">
                <path d="M-5,10 Q-15,-10 0,-20 Q10,-10 5,10 Z" fill="#F5E4BC" />
                <circle cx="14" cy="-35" r="1" fill="#F5E4BC" />
              </g>
            </svg>
          </div>
        );
      case 'Leheriya & Bandhani Kotadoria':
        return (
          <div className="w-full h-full bg-[#C4601A] flex items-center justify-center p-1.5 relative">
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#F5E4BC] fill-none" strokeWidth="1.5">
              <path d="M0,20 Q30,40 60,20 T120,20" />
              <path d="M0,50 Q30,70 60,50 T120,50" />
              <path d="M0,80 Q30,100 60,80 T120,80" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-[#FAF6F0] flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-[0.25] pointer-events-none" style={{
              backgroundImage: 'linear-gradient(90deg, #C4601A 1px, transparent 1px), linear-gradient(0deg, #C4601A 1px, transparent 1px)',
              backgroundSize: '10px 10px'
            }} />
            <Globe className="w-8 h-8 text-[#C4601A] opacity-50" />
          </div>
        );
    }
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching categories in knowledge view:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && activeSlug) {
      setTimeout(() => {
        const el = document.getElementById(`cat-${activeSlug}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }, [loading, activeSlug]);

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      {/* Top sticky navigation bar */}
      <div className="fixed top-0 left-0 right-0 h-[56px] md:h-[64px] bg-white border-b border-[#E8E0D5] flex items-center px-4 z-50 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <div className="flex items-center gap-2 ml-2 flex-1 truncate">
          <div className="w-8 h-8 rounded-full border border-[#F5E4BC] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Sneh Sarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-serif text-lg md:text-xl font-bold text-[#C4601A] truncate">
            Saree Knowledge Center
          </span>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer shrink-0"
          title="Return to Home Section"
        >
          <Home className="w-5 h-5 text-[#1A1A1A]" />
        </button>
      </div>

      <div className="pt-[76px] md:pt-[84px] pb-[80px] px-4 max-w-[1200px] mx-auto relative z-10">

        {/* Giant continuous parchment scroll sheet wrapping all contents */}
        <div className="parchment-scroll p-6 px-6 sm:p-10 sm:px-14 md:p-12 md:px-20 flex flex-col gap-6 shadow-md overflow-hidden">

          {/* Left Hand-Drawn Vine Ornament running all the way down the page scroll */}
          <div className="absolute left-4 top-8 bottom-8 w-8 pointer-events-none hidden sm:flex flex-col justify-between z-10 select-none">
            <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-[#5C4033]/25 border-r border-[#5C4033]/10" />
            <svg viewBox="0 0 40 100" className="w-8 h-20 fill-none stroke-[#5C4033]/60 shrink-0" strokeWidth="1.2">
              <path d="M 15,20 Q 0,30 5,45 C 10,40 15,20 15,20 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,45 Q 0,55 5,70 C 10,65 15,45 15,45 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,65 Q -5,80 12,85" />
              <circle cx="5" cy="78" r="1.2" fill="#5C4033" />
            </svg>
            <svg viewBox="0 0 40 100" className="w-8 h-20 fill-none stroke-[#5C4033]/60 shrink-0" strokeWidth="1.2">
              <path d="M 15,25 Q 0,15 5,5 C 10,15 15,25 15,25 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,65 Q 0,55 5,45 C 10,55 15,65 15,65 Z" fill="#5C4033" opacity="0.5" />
            </svg>
            <svg viewBox="0 0 40 100" className="w-8 h-24 fill-none stroke-[#5C4033]/60 shrink-0" strokeWidth="1.2">
              <path d="M 15,10 Q 0,-5 5,-15 C 10,-5 15,10 15,10 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,25 Q 0,40 15,55 Q 30,40 15,25 Z" fill="#5C4033" opacity="0.3" />
              <circle cx="15" cy="40" r="2.5" fill="#5C4033" />
            </svg>
          </div>

          {/* Right Hand-Drawn Vine Ornament running all the way down the page scroll (Symmetric Mirror) */}
          <div className="absolute right-4 top-8 bottom-8 w-8 pointer-events-none hidden sm:flex flex-col justify-between z-10 select-none scale-x-[-1]">
            <div className="absolute left-3.5 top-0 bottom-0 w-[1px] bg-[#5C4033]/25 border-r border-[#5C4033]/10" />
            <svg viewBox="0 0 40 100" className="w-8 h-20 fill-none stroke-[#5C4033]/60 shrink-0" strokeWidth="1.2">
              <path d="M 15,20 Q 0,30 5,45 C 10,40 15,20 15,20 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,45 Q 0,55 5,70 C 10,65 15,45 15,45 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,65 Q -5,80 12,85" />
              <circle cx="5" cy="78" r="1.2" fill="#5C4033" />
            </svg>
            <svg viewBox="0 0 40 100" className="w-8 h-20 fill-none stroke-[#5C4033]/60 shrink-0" strokeWidth="1.2">
              <path d="M 15,25 Q 0,15 5,5 C 10,15 15,25 15,25 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,65 Q 0,55 5,45 C 10,55 15,65 15,65 Z" fill="#5C4033" opacity="0.5" />
            </svg>
            <svg viewBox="0 0 40 100" className="w-8 h-24 fill-none stroke-[#5C4033]/60 shrink-0" strokeWidth="1.2">
              <path d="M 15,10 Q 0,-5 5,-15 C 10,-5 15,10 15,10 Z" fill="#5C4033" opacity="0.5" />
              <path d="M 15,25 Q 0,40 15,55 Q 30,40 15,25 Z" fill="#5C4033" opacity="0.3" />
              <circle cx="15" cy="40" r="2.5" fill="#5C4033" />
            </svg>
          </div>

          {/* Banner inside parchment scroll */}
          <div className="relative z-20 border-b border-[#C9B28F]/60 pb-6">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-[#C4601A] text-center tracking-wide">
              Saree Parichay Guide
            </h2>
            <p className="text-[#4E342E] text-xs md:text-sm leading-relaxed text-center font-serif italic max-w-[650px] mx-auto">
              Explore the magic of traditional Indian weaves. Discover regional history, craftsmanship, and the heritage behind every threads of our collections.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-sm text-[#C4601A] font-semibold relative z-20">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C4601A]" />
              <span>Loading Saree Heritage...</span>
            </div>
          ) : (
            /* Content entries in a clean grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-14 relative z-20 mt-4">
              {categories.map((cat, idx) => {
                const isActive = activeSlug === cat.slug;
                return (
                  <div
                    key={cat.id}
                    id={`cat-${cat.slug}`}
                    className={`relative flex flex-col justify-between gap-5 font-sans p-4 rounded-2xl transition-all duration-500 pb-8 border-b border-dashed border-[#D2C2A4]/40 lg:pb-4 lg:border-b-0 ${isActive
                        ? 'bg-[#C4601A]/5 ring-1 ring-[#C4601A]/30 shadow-xs scale-[1.02]'
                        : 'hover:bg-[#FAF6F0]/40'
                      }`}
                  >
                    <div>
                      {/* Top Header Row of the Post */}
                      <div className="flex justify-between items-center text-[10px] md:text-xs font-bold tracking-widest text-[#8D7F60] uppercase border-b border-[#C9B28F]/40 pb-2.5 shrink-0">
                        <div>{`0${idx + 1}/0${categories.length}`}</div>
                        <div className="font-serif tracking-wide text-[#C4601A]">Sneh Sarees Heritage</div>
                      </div>

                      {/* Main content area */}
                      <div className="flex flex-col sm:flex-row gap-5 items-stretch mt-4">

                        {/* Left Column: Postage stamp - Borderless, floating organically */}
                        <div className="flex flex-col justify-center items-center shrink-0">
                          <div className="relative p-1.5 bg-white shrink-0 w-[130px] h-[160px] md:w-[150px] md:h-[190px] flex items-center justify-center shadow-3xs">
                            {/* Scalloped Stamp Edge punches */}
                            <div className="absolute inset-0 pointer-events-none border-[5px] border-white" style={{
                              backgroundImage: 'radial-gradient(circle, transparent 3px, white 3px)',
                              backgroundSize: '10px 10px',
                              backgroundPosition: '-5px -5px'
                            }} />
                            <div className="w-full h-full overflow-hidden border border-[#E8E0D5]/30 bg-[#FAF6F0]">
                              {cat.imageUrl ? (
                                <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover" />
                              ) : (
                                renderStampContent(cat.name)
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Text Information */}
                        <div className="flex-1 flex flex-col justify-between gap-3">
                          <div>
                            {/* Index & Title */}
                            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-[#C4601A] mb-1.5 leading-tight text-center sm:text-left">
                              {cat.name}
                            </h3>
                            {/* Origin */}
                            <p className="font-mono text-[10px] md:text-xs text-[#8D7F60] uppercase tracking-wider mb-2.5 text-center sm:text-left">
                              {cat.slug === 'silk' ? 'Originated in Banaras & Kanchipuram' : cat.slug === 'cotton' ? 'Originated in Madhya Pradesh & Odisha' : 'Originated in India'}
                            </p>
                            {/* Description */}
                            <p className="text-[#3E2723] text-xs md:text-sm leading-relaxed font-serif text-center sm:text-left select-text whitespace-pre-wrap">
                              {cat.description || "Traditional handloom heritage, woven with dedication. Admin can edit this section to add historic facts, weave types, and details about motifs."}
                            </p>

                            {cat.history && (
                              <div className="mt-3 text-left">
                                <span className="block text-[9px] uppercase font-bold text-[#C4601A] tracking-wider mb-0.5">History & Heritage</span>
                                <p className="text-xs text-[#4E342E] italic leading-relaxed select-text whitespace-pre-wrap">{cat.history}</p>
                              </div>
                            )}

                            {cat.properties && (
                              <div className="mt-3 text-left">
                                <span className="block text-[9px] uppercase font-bold text-[#C4601A] tracking-wider mb-0.5">Properties & Weaving Craft</span>
                                <p className="text-xs text-[#4E342E] leading-relaxed select-text whitespace-pre-wrap">{cat.properties}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Occasions Section - Dashed Double line instead of rounded box */}
                    <div className="mt-1 border-t border-[#C9B28F]/40 pt-3">
                      <h4 className="font-serif italic text-xs md:text-sm text-[#C4601A] mb-2 text-center sm:text-left">
                        Care Instruction
                      </h4>
                      <div className="border-t border-b border-dashed border-[#D2C2A4] py-2.5 px-3 text-center">
                        <p className="text-[10px] md:text-xs font-semibold text-[#C4601A] tracking-widest uppercase font-mono select-text">
                          {cat.care || "Dry clean recommended  ✦  preserves gold threads  ✦  handle with sneh"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

