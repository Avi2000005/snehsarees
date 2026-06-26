import React from 'react';
import { SAREE_HISTORIES } from '../../data';
import { ActivePage } from '../../types';
import { ArrowLeft, Globe } from 'lucide-react';
import logoUrl from '@/assets/logo.jpg';

interface KnowledgeViewProps {
  onNavigate: (page: ActivePage) => void;
  onBack: () => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ onNavigate, onBack }) => {
  const renderStampContent = (title: string) => {
    switch (title) {
      case 'Banarasi Silk':
        return (
          <div className="w-full h-full bg-[#7B1C2E] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#C9A84C] fill-none" strokeWidth="1.2">
              <path d="M10,110 Q40,80 30,50 T75,20" />
              <path d="M30,50 Q15,40 25,25" />
              <path d="M52,35 Q65,45 55,60" />
              <path d="M75,20 C70,10 85,5 80,20 C75,30 65,20 75,20" fill="#C9A84C" />
              <path d="M25,25 C20,15 35,10 30,25 C25,35 15,25 25,25" fill="#C9A84C" strokeWidth="0.8" />
              <path d="M22,80 C30,75 35,80 32,88 Z" fill="#C9A84C" />
              <path d="M40,65 C48,60 53,65 50,73 Z" fill="#C9A84C" />
            </svg>
          </div>
        );
      case 'Kanjivaram Pure Silk':
        return (
          <div className="w-full h-full bg-[#1e1b4b] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#C9A84C] fill-none" strokeWidth="1.2">
              <circle cx="20" cy="20" r="3" fill="#C9A84C" />
              <circle cx="50" cy="20" r="3" fill="#C9A84C" />
              <circle cx="80" cy="20" r="3" fill="#C9A84C" />
              <circle cx="35" cy="50" r="3" fill="#C9A84C" />
              <circle cx="65" cy="50" r="3" fill="#C9A84C" />
              <path d="M10,120 L25,95 L40,120 M40,120 L55,95 L70,120 M70,120 L85,95 L100,120" strokeWidth="1.5" />
              <path d="M25,95 L25,85 M55,95 L55,85 M85,95 L85,85" />
              <path d="M50,40 C45,30 55,25 55,33 C55,38 45,45 50,40 Z" fill="#C9A84C" />
            </svg>
          </div>
        );
      case 'Chanderi Weave':
        return (
          <div className="w-full h-full bg-[#E6F3EA] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 opacity-[0.25] pointer-events-none" style={{
              backgroundImage: 'linear-gradient(90deg, #7B1C2E 1px, transparent 1px), linear-gradient(0deg, #7B1C2E 1px, transparent 1px)',
              backgroundSize: '8px 8px'
            }} />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#C9A84C] fill-none" strokeWidth="1">
              <g transform="translate(25, 30)">
                <circle cx="0" cy="0" r="6" fill="#C9A84C" opacity="0.3" />
                <circle cx="0" cy="0" r="4" strokeWidth="1" />
                <line x1="-3" y1="-3" x2="3" y2="3" />
                <line x1="3" y1="-3" x2="-3" y2="3" />
              </g>
              <g transform="translate(75, 45)">
                <circle cx="0" cy="0" r="6" fill="#C9A84C" opacity="0.3" />
                <circle cx="0" cy="0" r="4" strokeWidth="1" />
                <line x1="-3" y1="-3" x2="3" y2="3" />
                <line x1="3" y1="-3" x2="-3" y2="3" />
              </g>
              <g transform="translate(45, 80)">
                <circle cx="0" cy="0" r="6" fill="#C9A84C" opacity="0.3" />
                <circle cx="0" cy="0" r="4" strokeWidth="1" />
                <line x1="-3" y1="-3" x2="3" y2="3" />
                <line x1="3" y1="-3" x2="-3" y2="3" />
              </g>
            </svg>
          </div>
        );
      case 'Patola Double Ikat':
        return (
          <div className="w-full h-full bg-[#B25329] flex items-center justify-center p-2 relative">
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-white fill-none" strokeWidth="1">
              <path d="M10,60 L50,15 L90,60 L50,105 Z" strokeWidth="1.5" />
              <path d="M25,60 L50,32 L75,60 L50,88 Z" strokeDasharray="1.5 1.5" />
              <g transform="translate(50, 60) scale(0.8)" fill="none" stroke="#FAF6F0">
                <path d="M-10,0 C-10,-10 0,-15 10,-5 C15,0 10,15 -10,0 Z M10,-5 L15,-10 M-5,8 L-10,12" strokeWidth="1.2" />
                <circle cx="2" cy="-5" r="1.5" fill="#FAF6F0" />
              </g>
            </svg>
          </div>
        );
      case 'Paithani Silk':
        return (
          <div className="w-full h-full bg-[#5B21B6] flex items-center justify-center p-2 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-95 fill-none" strokeWidth="1.2">
              <line x1="5" y1="110" x2="95" y2="110" stroke="#C9A84C" strokeWidth="3" />
              <line x1="5" y1="105" x2="95" y2="105" stroke="#C9A84C" strokeWidth="1" />
              <g transform="translate(50, 55) scale(1.1)" stroke="#C9A84C">
                <path d="M0,10 Q-30,-20 -15,-35 Q0,-50 0,10" fill="#FAF6F0" opacity="0.2" />
                <path d="M0,10 Q30,-20 15,-35 Q0,-50 0,10" fill="#FAF6F0" opacity="0.2" />
                <path d="M-5,10 Q-15,-10 0,-20 Q10,-10 5,10 Z" fill="#C9A84C" />
                <path d="M0,-20 Q5,-35 12,-32 Q15,-30 8,-22" strokeWidth="1.5" />
                <circle cx="14" cy="-35" r="1" fill="#C9A84C" />
                <circle cx="10" cy="-37" r="1" fill="#C9A84C" />
              </g>
            </svg>
          </div>
        );
      case 'Sambalpuri Bandha':
        return (
          <div className="w-full h-full bg-[#111827] flex items-center justify-center p-2 relative">
            <svg viewBox="0 0 100 120" className="w-full h-full opacity-90 stroke-[#DC2626] fill-none" strokeWidth="1.2">
              <path d="M10,10 L90,10 M10,110 L90,110" strokeDasharray="3 2" />
              <g transform="translate(50, 60) scale(1.2)" stroke="#FAF6F0">
                <path d="M-15,0 C-15,-20 15,-20 15,0 C15,15 0,25 -5,25 C-10,25 -15,15 -15,0 Z" strokeWidth="1.5" />
                <path d="M-15,0 Q0,5 15,0" />
                <path d="M-10,5 Q0,10 10,5" />
                <path d="M-5,10 Q0,15 5,10" />
              </g>
            </svg>
          </div>
        );
      case 'Pichwai Print':
        return (
          <div className="w-full h-full bg-[#A5C3E5] flex items-center justify-center p-1.5 relative">
            <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
              <g transform="translate(50, 25) scale(0.6)" stroke="#7B1C2E" strokeWidth="1.2" fill="#F43F5E">
                <path d="M0,0 C-15,-15 -25,0 0,20 C25,0 15,-15 0,0 Z" />
                <path d="M-5,5 C-25,-5 -20,15 0,20" fill="none" />
                <path d="M5,5 C25,-5 20,15 0,20" fill="none" />
              </g>
              <g transform="translate(50, 75) scale(0.95)">
                <path d="M-25,10 Q-30,-15 0,-15 Q20,-15 25,5 L20,30 L-20,30 Z" fill="white" stroke="#7B1C2E" strokeWidth="1.2" />
                <path d="M22,0 Q32,-5 32,8 Q28,15 20,12 Z" fill="white" stroke="#7B1C2E" strokeWidth="1.2" />
                <path d="M22,-2 Q15,5 18,10" stroke="#7B1C2E" strokeWidth="1" fill="#FDA4AF" />
                <path d="M25,-4 Q28,-12 33,-10" stroke="#7B1C2E" strokeWidth="1.2" fill="#EAB308" />
                <circle cx="27" cy="4" r="1.2" fill="#7B1C2E" />
                <circle cx="-12" cy="0" r="1.5" fill="#C9A84C" />
                <circle cx="-5" cy="5" r="1.5" fill="#C9A84C" />
                <circle cx="8" cy="2" r="1.5" fill="#C9A84C" />
                <circle cx="-2" cy="-5" r="1.5" fill="#C9A84C" />
              </g>
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-full h-full bg-[#FAF6F0] flex items-center justify-center">
            <Globe className="w-8 h-8 text-[#7B1C2E] opacity-35" />
          </div>
        );
    }
  };

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
          <div className="w-8 h-8 rounded-full border border-[#C9A84C] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Snehsarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-serif text-lg md:text-xl font-bold text-[#7B1C2E] truncate">
            Saree Knowledge Center
          </span>
        </div>
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
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-[#7B1C2E] text-center tracking-wide">
              Print Parichay Guide
            </h2>
            <p className="text-[#4E342E] text-xs md:text-sm leading-relaxed text-center font-serif italic max-w-[650px] mx-auto">
              Explore the magic of traditional Indian weaves. Scroll down to discover regional history, sacred motifs, and the exact cultural occasions to drape these masterworks.
            </p>
          </div>

          {/* Content entries in a clean grid - NO individual card borders, NO card boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-14 relative z-20 mt-4">
            {SAREE_HISTORIES.map((hist, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between gap-5 font-sans pb-8 border-b border-dashed border-[#D2C2A4]/40 lg:pb-0 lg:border-b-0"
              >
                <div>
                  {/* Top Header Row of the Post */}
                  <div className="flex justify-between items-center text-[10px] md:text-xs font-bold tracking-widest text-[#8D7F60] uppercase border-b border-[#C9B28F]/40 pb-2.5 shrink-0">
                    <div>{`0${idx + 1}/0${SAREE_HISTORIES.length}`}</div>
                    <div className="font-serif tracking-wide text-[#7B1C2E]">Snehsarees Heritage</div>
                  </div>

                  {/* Main content area */}
                  <div className="flex flex-col sm:flex-row gap-5 items-stretch mt-4">
                    
                    {/* Left Column: Postage stamp - Borderless, floating organically */}
                    <div className="flex flex-col justify-center items-center shrink-0">
                      <div className="relative p-1.5 bg-white shrink-0 w-[130px] h-[160px] md:w-[150px] md:h-[190px] flex items-center justify-center">
                        {/* Scalloped Stamp Edge punches */}
                        <div className="absolute inset-0 pointer-events-none border-[5px] border-white" style={{
                          backgroundImage: 'radial-gradient(circle, transparent 3px, white 3px)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '-5px -5px'
                        }} />
                        <div className="w-full h-full overflow-hidden border border-[#E8E0D5]/30 bg-[#FAF6F0]">
                          {renderStampContent(hist.title)}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Text Information */}
                    <div className="flex-1 flex flex-col justify-between gap-3">
                      <div>
                        {/* Index & Title */}
                        <h3 className="font-serif text-2xl md:text-3xl font-semibold text-[#7B1C2E] mb-1.5 leading-tight text-center sm:text-left">
                          {hist.title}
                        </h3>
                        {/* Origin */}
                        <p className="font-mono text-[10px] md:text-xs text-[#8D7F60] uppercase tracking-wider mb-2.5 text-center sm:text-left">
                          {`Originated in ${hist.origin}`}
                        </p>
                        {/* Description */}
                        <p className="text-[#3E2723] text-xs md:text-sm leading-relaxed font-serif italic text-center sm:text-left select-text">
                          {hist.desc}
                        </p>
                      </div>

                      {/* Motif Details Line */}
                      {hist.motif_desc && (
                        <div className="pl-3 border-l-2 border-[#C9A84C] py-0.5 mt-1">
                          <p className="text-xs text-[#7B1C2E] font-semibold leading-relaxed text-left font-serif italic">
                            {hist.motif_desc}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* History details line */}
                  {hist.later_desc && (
                    <div className="border-t border-[#C9B28F]/40 pt-3.5 mt-4">
                      <p className="text-[#4E342E] text-xs md:text-[13px] leading-relaxed select-text font-serif">
                        {hist.later_desc}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Occasions Section - Dashed Double line instead of rounded box */}
                <div className="mt-1 border-t border-[#C9B28F]/40 pt-3">
                  <h4 className="font-serif italic text-xs md:text-sm text-[#7B1C2E] mb-2 text-center sm:text-left">
                    When to wear it!?
                  </h4>
                  <div className="border-t border-b border-dashed border-[#D2C2A4] py-2.5 px-3 text-center">
                    <p className="text-[10px] md:text-xs font-semibold text-[#7B1C2E] tracking-widest uppercase font-mono">
                      {hist.occasions ? hist.occasions.join('  ✦  ') : hist.tags.join('  ✦  ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
