import React, { useState } from 'react';
import { SAREE_HISTORIES } from '../../data';
import { ActivePage } from '../../types';
import { Star, Landmark, Sun, Grid, Heart, Globe, Phone, Mail, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';
import logoUrl from '@/assets/logo.jpg';

interface LandingViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      return;
    }
    const text = `Namaste Snehsarees!\n\nI have a website enquiry:\n\n*Name:* ${formData.name}\n*Contact (Phone/Email):* ${formData.contact}\n*Message:* ${formData.message}`;
    window.open(`https://wa.me/919414067123?text=${encodeURIComponent(text)}`, '_blank');
  };
  const getHostSymbol = (symbol: string) => {
    switch (symbol) {
      case 'star':
        return <Star className="w-6 h-6 text-[#C9A84C] fill-[#C9A84C]" />;
      case 'temple':
        return <Landmark className="w-6 h-6 text-[#C9A84C]" />;
      case 'sun':
        return <Sun className="w-6 h-6 text-[#C9A84C]" />;
      case 'grid':
        return <Grid className="w-6 h-6 text-[#C9A84C]" />;
      case 'peacock':
        return <Heart className="w-6 h-6 text-[#C9A84C] fill-[#C9A84C]" />;
      default:
        return <Globe className="w-6 h-6 text-[#C9A84C]" />;
    }
  };

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      {/* Sticky Header Navigation Bar */}
      <header className="sticky top-0 left-0 right-0 h-16 bg-[#7B1C2E] border-b border-[#C9A84C]/30 flex items-center justify-between px-4 md:px-8 z-50 shadow-md">
        <div className="font-serif text-xl font-bold text-white tracking-wide cursor-pointer flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-full border border-[#C9A84C] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0">
            <img src={logoUrl} alt="Snehsarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span>Sneh<span className="text-[#C9A84C]">sarees</span></span>
        </div>
        <nav className="flex items-center overflow-x-auto no-scroll gap-4 sm:gap-6 text-[11px] sm:text-xs md:text-sm font-semibold text-white/90 max-w-[70%] sm:max-w-none">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0">Home</button>
          <button onClick={() => {
            const el = document.getElementById('our-story');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0">Our Story</button>
          <button onClick={() => onNavigate('home')} className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0">Shop Now</button>
          <button onClick={() => onNavigate('knowledge')} className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0">Saree Knowledge</button>
          <button onClick={() => {
            const el = document.getElementById('contact-us');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} className="hover:text-[#C9A84C] transition-colors cursor-pointer shrink-0">Contact Us</button>
        </nav>
      </header>
      {/* Hero Header */}
      <div className="min-h-screen bg-linear-to-br from-[#7B1C2E] via-[#5A1020] to-[#2D0810] flex flex-col items-center justify-center p-8 pt-16 pb-12 text-center relative overflow-hidden">
        {/* SVG definitions and patterns */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Horizontal Saree Borders (Top and Bottom) */}
            <pattern id="saree-border-top" width="60" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="8" x2="60" y2="8" stroke="#C9A84C" strokeWidth="1.5" />
              <line x1="0" y1="32" x2="60" y2="32" stroke="#C9A84C" strokeWidth="1" />
              <path d="M 0,20 C 15,10 15,30 30,20 C 45,10 45,30 60,20" fill="none" stroke="#C9A84C" strokeWidth="1" />
              <g transform="translate(15, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#C9A84C" />
                <circle cx="0" cy="-5" r="1.5" fill="#C9A84C" />
                <circle cx="0" cy="5" r="1.5" fill="#C9A84C" />
                <circle cx="-5" cy="0" r="1.5" fill="#C9A84C" />
                <circle cx="5" cy="0" r="1.5" fill="#C9A84C" />
              </g>
              <g transform="translate(45, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#C9A84C" />
                <circle cx="0" cy="-5" r="1.5" fill="#C9A84C" />
                <circle cx="0" cy="5" r="1.5" fill="#C9A84C" />
                <circle cx="-5" cy="0" r="1.5" fill="#C9A84C" />
                <circle cx="5" cy="0" r="1.5" fill="#C9A84C" />
              </g>
              <path d="M 7,16 C 5,11 11,8 13,13 Z" fill="#C9A84C" />
              <path d="M 23,24 C 25,29 19,32 17,27 Z" fill="#C9A84C" />
              <path d="M 37,16 C 35,11 41,8 43,13 Z" fill="#C9A84C" />
              <path d="M 53,24 C 55,29 49,32 47,27 Z" fill="#C9A84C" />
            </pattern>

            <pattern id="saree-border-bottom" width="60" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="8" x2="60" y2="8" stroke="#C9A84C" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="0" y1="32" x2="60" y2="32" stroke="#C9A84C" strokeWidth="1.5" />
              <path d="M 0,20 C 15,30 15,10 30,20 C 45,30 45,10 60,20" fill="none" stroke="#C9A84C" strokeWidth="1" />
              <g transform="translate(15, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#C9A84C" />
                <circle cx="0" cy="-5" r="1.5" fill="#C9A84C" />
                <circle cx="0" cy="5" r="1.5" fill="#C9A84C" />
                <circle cx="-5" cy="0" r="1.5" fill="#C9A84C" />
                <circle cx="5" cy="0" r="1.5" fill="#C9A84C" />
              </g>
              <g transform="translate(45, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#C9A84C" />
                <circle cx="0" cy="-5" r="1.5" fill="#C9A84C" />
                <circle cx="0" cy="5" r="1.5" fill="#C9A84C" />
                <circle cx="-5" cy="0" r="1.5" fill="#C9A84C" />
                <circle cx="5" cy="0" r="1.5" fill="#C9A84C" />
              </g>
              <path d="M 7,24 C 5,29 11,32 13,27 Z" fill="#C9A84C" />
              <path d="M 23,16 C 25,11 19,8 17,13 Z" fill="#C9A84C" />
              <path d="M 37,24 C 35,29 41,32 43,27 Z" fill="#C9A84C" />
              <path d="M 53,16 C 55,11 49,8 47,13 Z" fill="#C9A84C" />
            </pattern>

            {/* Drooping bell flower component */}
            <g id="bell-flower">
              <path d="M -12,-15 C -8,-8 8,-8 12,-15 C 8,-20 -8,-20 -12,-15 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
              <path d="M -10,-12 C -18,10 -5,20 0,20 C 5,20 18,10 10,-12 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
              <path d="M 0,-12 L 0,18" fill="none" stroke="#C9A84C" strokeWidth="1.4" />
              <path d="M -5,-12 C -6,5 -3,15 0,18 C 3,15 6,5 5,-12" fill="none" stroke="#C9A84C" strokeWidth="1.2" />
              <circle cx="-5" cy="24" r="1.5" fill="#C9A84C" />
              <circle cx="5" cy="24" r="1.5" fill="#C9A84C" />
              <line x1="-5" y1="20" x2="-5" y2="23" stroke="#C9A84C" strokeWidth="1.2" />
              <line x1="5" y1="20" x2="5" y2="23" stroke="#C9A84C" strokeWidth="1.2" />
            </g>

            {/* Main traditional Kashmiri flower vine jaal motif */}
            <g id="floral-jaal-motif">
              {/* Curved main vine stem */}
              <path d="M -40,60 C -30,20 -10,-10 20,-20 C 35,-25 55,-20 70,-5" fill="none" stroke="#C9A84C" strokeWidth="1.9" />
              
              {/* Main fanning flower head at the end of the stem */}
              <g transform="translate(70, -5) rotate(45)">
                {/* Base cup */}
                <path d="M -15,10 C -15,0 15,0 15,10 C 10,20 -10,20 -15,10 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
                <path d="M -10,7 C -5,12 5,12 10,7" fill="none" stroke="#C9A84C" strokeWidth="1.2" />
                {/* Petals */}
                <path d="M 0,3 C -6,-15 0,-30 0,-30 C 0,-30 6,-15 0,3 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
                <path d="M -5,5 C -15,-10 -15,-25 -10,-26 C -8,-20 -5,-5 -5,5 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
                <path d="M 5,5 C 15,-10 15,-25 10,-26 C 8,-20 5,-5 5,5 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
                <path d="M -10,8 C -25,0 -26,-15 -20,-17 C -15,-12 -10,-2 -10,8 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
                <path d="M 10,8 C 25,0 26,-15 20,-17 C 15,-12 10,-2 10,8 Z" fill="none" stroke="#C9A84C" strokeWidth="1.6" />
                
                <line x1="0" y1="-5" x2="0" y2="-22" stroke="#C9A84C" strokeWidth="1.0" strokeDasharray="1.5 1.5" />
                <line x1="-5" y1="-2" x2="-10" y2="-18" stroke="#C9A84C" strokeWidth="1.0" strokeDasharray="1.5 1.5" />
                <line x1="5" y1="-2" x2="10" y2="-18" stroke="#C9A84C" strokeWidth="1.0" strokeDasharray="1.5 1.5" />
              </g>
              
              {/* Drooping bell-shaped flower branching off at the middle */}
              <path d="M 10,-13 C 5,5 0,15 -10,25" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
              <g transform="translate(-10, 25) rotate(-30)">
                <use href="#bell-flower" />
              </g>
              
              {/* Side leaves along the vine */}
              <path d="M -25,38 C -40,32 -45,20 -35,18 C -25,16 -20,25 -25,38 Z" fill="none" stroke="#C9A84C" strokeWidth="1.4" />
              <line x1="-25" y1="38" x2="-35" y2="24" stroke="#C9A84C" strokeWidth="1.0" />
              
              <path d="M -5,12 C -15,0 -12,-12 -2,-10 C 8,-8 5,4 -5,12 Z" fill="none" stroke="#C9A84C" strokeWidth="1.4" />
              <line x1="-5" y1="12" x2="-4" y2="-4" stroke="#C9A84C" strokeWidth="1.0" />
 
              <path d="M 42,-22 C 45,-38 35,-45 28,-38 C 21,-31 30,-25 42,-22 Z" fill="none" stroke="#C9A84C" strokeWidth="1.4" />
              <line x1="42" y1="-22" x2="33" y2="-36" stroke="#C9A84C" strokeWidth="1.0" />
            </g>
 
            {/* Small 6-petaled floating flower buti */}
            <g id="small-floating-flower">
              <circle cx="0" cy="0" r="2.5" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <circle
                  key={angle}
                  cx="0"
                  cy="-5.5"
                  r="2.2"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="1.2"
                  transform={`rotate(${angle})`}
                />
              ))}
            </g>
 
            {/* Seamless repeating background jaal pattern (mirrored & distributed equally) */}
            <pattern id="floral-jaal-bg" width="220" height="220" patternUnits="userSpaceOnUse">
              {/* Vine curving up-right */}
              <g transform="translate(45, 145) scale(0.55)">
                <use href="#floral-jaal-motif" />
              </g>
              
              {/* Vine curving down-left (mirrored) */}
              <g transform="translate(155, 35) scale(-0.55, 0.55) rotate(180)">
                <use href="#floral-jaal-motif" />
              </g>
 
              {/* Scattered small flowers filling the grid gaps consistently */}
              <g transform="translate(30, 30) scale(0.7)">
                <use href="#small-floating-flower" />
              </g>
              <g transform="translate(110, 110) scale(0.7)">
                <use href="#small-floating-flower" />
              </g>
              <g transform="translate(190, 190) scale(0.7)">
                <use href="#small-floating-flower" />
              </g>
              <g transform="translate(110, 30) scale(0.7)">
                <use href="#small-floating-flower" />
              </g>
              <g transform="translate(30, 190) scale(0.7)">
                <use href="#small-floating-flower" />
              </g>
            </pattern>
          </defs>
          
          {/* Top Border */}
          <rect y="0" width="100%" height="40" fill="url(#saree-border-top)" opacity="0.35" />
          
          {/* Seamless Repeating Floral Jaal Pattern everywhere consistently */}
          <rect y="40" width="100%" height="calc(100% - 80px)" fill="url(#floral-jaal-bg)" opacity="0.45" />
          
          {/* Bottom Border */}
          <rect y="calc(100% - 40px)" width="100%" height="40" fill="url(#saree-border-bottom)" opacity="0.35" />
        </svg>
        {/* Motif Deco */}
        <div className="mb-6 drop-shadow-[0_4px_16px_rgba(201,168,76,0.5)]">
          <div className="w-24 h-24 rounded-full border-[3px] border-[#C9A84C] p-1 bg-white overflow-hidden flex items-center justify-center">
            <img src={logoUrl} alt="Snehsarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-2 tracking-wide leading-tight">
          Sneh<br /><span className="text-[#C9A84C]">sarees</span>
        </h1>
        <p className="text-[12px] md:text-sm font-semibold tracking-[0.2em] text-white/70 uppercase mb-6">
          Handcrafted Indian Sarees
        </p>
        <p className="font-serif text-lg md:text-xl italic text-white/85 max-w-[320px] md:max-w-[460px] leading-relaxed mb-10">
          "Every saree tells a story of the hands that wove it and the woman who wears it."
        </p>

        <div className="flex gap-4 w-full max-w-[300px] md:max-w-[360px] z-10">
          <button
            onClick={() => onNavigate('home')}
            className="flex-1 bg-[#C9A84C] text-[#5A1020] text-sm md:text-base font-bold py-3.5 rounded-full tracking-wider shadow-[0_4px_16px_rgba(201,168,76,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Shop Now
          </button>
          <button
            onClick={() => {
              document.getElementById('our-story')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex-1 bg-white/12 text-white border border-white/45 text-sm md:text-base font-semibold py-3.5 rounded-full backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            Our Story
          </button>
        </div>

        <div className="absolute bottom-6 text-white/50 text-xs text-center animate-bounce">
          ↓ Scroll to explore
        </div>
      </div>

      {/* Our Story */}
      <section id="our-story" className="py-12 md:py-16 px-6 md:px-10 max-w-[1100px] mx-auto bg-white/60 backdrop-blur-sm rounded-lg my-6 shadow-xs relative z-10">
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-3">
          Our Story
        </h3>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#7B1C2E] mb-5 leading-tight">
          Woven with love, worn with pride
        </h2>
        <p className="text-[#4A4A4A] text-sm md:text-plain leading-relaxed mb-4">
          Snehsarees was born from a grandmother's chest of silk sarees and a dream to bring authentic Indian weaving traditions to every woman's wardrobe. We work directly with weavers across Varanasi, Kanchipuram, Chanderi and Sambhalpur — cutting out middlemen, preserving heritage.
        </p>
        <p className="text-[#4A4A4A] text-sm md:text-plain leading-relaxed">
          Every saree in our collection is hand-selected, quality-checked, and ethically sourced. When you buy from Snehsarees, you're not just buying a saree — you're supporting an artisan family and keeping a 2,000-year-old tradition alive.
        </p>
      </section>

      <div className="saree-divider my-6 max-w-[1100px] mx-auto relative z-10" />

      {/* Saree Knowledge Teaser Section */}
      <section className="py-12 px-6 md:px-10 max-w-[1100px] mx-auto relative z-10">
        <div className="bg-gradient-to-br from-[#7B1C2E] via-[#5A1020] to-[#2D0810] rounded-2xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border border-[#C9A84C]/30">
          {/* Subtle repeating pattern overlay */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="url(#floral-jaal-bg)" />
            </svg>
          </div>
          <div className="flex-1 relative z-10">
            <h3 className="text-xs font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-2">
              Saree Heritage
            </h3>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-3 leading-tight text-white">
              The Saree Knowledge Center
            </h2>
            <p className="text-white/80 text-xs md:text-sm max-w-[580px] leading-relaxed">
              Explore the rich histories, regional weaving styles, and signature motifs of India's most beloved handloom traditions. Dive deep into the art of Banarasi, Kanchipuram, Chanderi, and more.
            </p>
          </div>
          <button
            onClick={() => onNavigate('knowledge')}
            className="bg-[#C9A84C] text-[#5A1020] px-8 py-3.5 rounded-full text-xs md:text-sm font-bold shadow-md hover:bg-white hover:text-[#5A1020] transition-all shrink-0 cursor-pointer relative z-10 active:scale-95"
          >
            Explore Knowledge Center →
          </button>
        </div>
      </section>

      <div className="saree-divider my-6 max-w-[1100px] mx-auto" />

      {/* Customer Reviews */}
      <section className="py-10 max-w-[1100px] mx-auto px-6 md:px-10 bg-white/60 backdrop-blur-sm rounded-xl my-6 relative z-10">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-6">
          What our customers say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#FAF6F0]/65 backdrop-blur-xs rounded-xl p-4 border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#7B1C2E] flex items-center justify-center text-white font-bold text-sm">
                P
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1A1A1A]">Priya Sharma</div>
                <div className="text-[#C9A84C] text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
              "I ordered the Banarasi silk for my wedding and it was absolutely breathtaking. The zari work was so detailed. Got so many compliments!"
            </p>
          </div>

          <div className="bg-[#FAF6F0]/65 backdrop-blur-xs rounded-xl p-4 border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#7B1C2E] flex items-center justify-center text-white font-bold text-sm">
                M
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1A1A1A]">Meena Kulkarni</div>
                <div className="text-[#C9A84C] text-xs">★★★★★</div>
              </div>
            </div>
            <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
              "The Paithani I received is museum-quality. You can tell the artisan put real love into weaving it. Will definitely order again!"
            </p>
          </div>

          <div className="bg-[#FAF6F0]/65 backdrop-blur-xs rounded-xl p-4 border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#7B1C2E] flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1A1A1A]">Sunita Devi</div>
                <div className="text-[#C9A84C] text-xs">★★★★☆</div>
              </div>
            </div>
            <p className="text-[13px] text-[#4A4A4A] leading-relaxed">
              "Fast delivery, beautiful packaging, and the Chanderi saree is exactly as shown. Very lightweight, perfect for office."
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-[#7B1C2E] text-white py-3.5 rounded-full text-sm md:text-base font-semibold hover:bg-[#9B2840] transition-colors cursor-pointer"
        >
          Start Shopping →
        </button>
      </section>

      {/* Bulk Orders Banner */}
      <section className="py-12 px-6 md:px-10 max-w-[1100px] mx-auto bg-gradient-to-r from-[#7B1C2E] to-[#5A1020] rounded-xl my-6 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden z-10">
        {/* Subtle repeating pattern overlay */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none select-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#global-maroon-jaal)" />
          </svg>
        </div>
        <div className="flex-1 relative z-10">
          <h3 className="text-xs font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-2">
            Wholesale & Boutiques
          </h3>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-3 leading-tight">
            Interested in Bulk Orders?
          </h2>
          <p className="text-white/80 text-sm max-w-[580px] leading-relaxed">
            Whether for boutique retail, wedding gifting, or cultural events, Snehsarees provides handloom sarees in volume at direct-from-weaver rates. We customize colors, weaves, and packaging to match your aesthetic.
          </p>
        </div>
        <button
          onClick={() => onNavigate('bulk')}
          className="bg-[#C9A84C] text-[#5A1020] px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:bg-white hover:text-[#5A1020] transition-all shrink-0 cursor-pointer relative z-10 active:scale-95"
        >
          Inquire Wholesale Quote →
        </button>
      </section>

      <div className="saree-divider my-6 max-w-[1100px] mx-auto relative z-10" />

      {/* Contact Us Section */}
      <section id="contact-us" className="py-12 md:py-16 max-w-[1100px] mx-auto px-6 md:px-10 bg-white/60 backdrop-blur-sm rounded-xl my-6 relative z-10">
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#C9A84C] uppercase mb-3">
          Get In Touch
        </h3>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-[#7B1C2E] mb-8 leading-tight">
          Contact Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Contact Details */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="space-y-6">
              <p className="text-[#4A4A4A] text-sm md:text-plain leading-relaxed">
                Have questions about our weaves, customization options, or an active order? Reach out to us, and our team will assist you as soon as possible.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7B1C2E]/10 flex items-center justify-center text-[#7B1C2E] shrink-0 animate-pulse">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider">Phone Number</h4>
                    <a href="tel:+919414067123" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#7B1C2E] transition-colors">+91 94140 67123</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7B1C2E]/10 flex items-center justify-center text-[#7B1C2E] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider">Email Address</h4>
                    <a href="mailto:contact@snehsarees.com" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#7B1C2E] transition-colors">contact@snehsarees.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#7B1C2E]/10 flex items-center justify-center text-[#7B1C2E] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider">Address</h4>
                    <p className="text-sm font-semibold text-[#1A1A1A]">Kota, Rajasthan, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-6 border-t border-[#E8E0D5]">
              <h4 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-3">Connect With Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/snehsarees"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#7B1C2E] text-white flex items-center justify-center hover:bg-[#9B2840] transition-colors cursor-pointer active:scale-95 duration-200"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://facebook.com/snehsarees"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#7B1C2E] text-white flex items-center justify-center hover:bg-[#9B2840] transition-colors cursor-pointer active:scale-95 duration-200"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://pinterest.com/snehsarees"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#7B1C2E] text-white flex items-center justify-center hover:bg-[#9B2840] transition-colors cursor-pointer active:scale-95 duration-200"
                  title="Pinterest"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.042-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.622 0 11.988-5.365 11.988-11.987C24 5.367 18.639 0 12.017 0z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@snehsarees"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-[#7B1C2E] text-white flex items-center justify-center hover:bg-[#9B2840] transition-colors cursor-pointer active:scale-95 duration-200"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <form onSubmit={handleSubmit} className="bg-[#FAF6F0]/70 backdrop-blur-xs p-6 rounded-xl border border-[#E8E0D5] flex flex-col gap-4">
            <div>
              <label htmlFor="enquiry-name" className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                id="enquiry-name"
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-[#E8E0D5] rounded-lg px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-hidden focus:border-[#7B1C2E] focus:ring-1 focus:ring-[#7B1C2E] transition-all"
              />
            </div>

            <div>
              <label htmlFor="enquiry-contact" className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Contact Number / Email</label>
              <input
                id="enquiry-contact"
                type="text"
                required
                placeholder="Enter your phone or email"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="w-full bg-white border border-[#E8E0D5] rounded-lg px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-hidden focus:border-[#7B1C2E] focus:ring-1 focus:ring-[#7B1C2E] transition-all"
              />
            </div>

            <div>
              <label htmlFor="enquiry-message" className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Your Enquiry Message</label>
              <textarea
                id="enquiry-message"
                required
                rows={4}
                placeholder="Describe what you are looking for (e.g. Saree fabric preference, custom designs, etc.)"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white border border-[#E8E0D5] rounded-lg px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-hidden focus:border-[#7B1C2E] focus:ring-1 focus:ring-[#7B1C2E] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#7B1C2E] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#9B2840] transition-colors cursor-pointer mt-2 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 duration-200"
            >
              Send Enquiry via WhatsApp
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#7B1C2E] p-8 text-center text-white">
        <div className="font-serif text-2xl font-semibold mb-2">Snehsarees</div>
        <p className="text-xs text-white/60">
          © {new Date().getFullYear()} Snehsarees. Handcrafted with love in India.
        </p>
      </footer>
    </div>
  );
};
