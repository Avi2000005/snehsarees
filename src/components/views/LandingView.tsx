import React, { useState } from 'react';
import { SAREE_HISTORIES } from '../../data';
import { ActivePage, UserProfile } from '../../types';
import { Star, Landmark, Sun, Grid, Heart, Globe, Phone, Mail, MapPin, Instagram, Facebook, Youtube, ShieldCheck } from 'lucide-react';
import logoUrl from '@/assets/logo.jpg';
import { PolicyModal, PolicyTab } from '../PolicyModal';

interface LandingViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  user: UserProfile | null;
}

export const LandingView: React.FC<LandingViewProps> = ({ onNavigate, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [policyModalTab, setPolicyModalTab] = useState<PolicyTab | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contact || !formData.message) {
      return;
    }
    const text = `Namaste Sneh Sarees!\n\nI have a website enquiry:\n\n*Name:* ${formData.name}\n*Contact (Phone/Email):* ${formData.contact}\n*Message:* ${formData.message}`;
    window.open(`https://wa.me/919461037123?text=${encodeURIComponent(text)}`, '_blank');
  };
  const getHostSymbol = (symbol: string) => {
    switch (symbol) {
      case 'star':
        return <Star className="w-6 h-6 text-[#F5E4BC] fill-[#F5E4BC]" />;
      case 'temple':
        return <Landmark className="w-6 h-6 text-[#F5E4BC]" />;
      case 'sun':
        return <Sun className="w-6 h-6 text-[#F5E4BC]" />;
      case 'grid':
        return <Grid className="w-6 h-6 text-[#F5E4BC]" />;
      case 'peacock':
        return <Heart className="w-6 h-6 text-[#F5E4BC] fill-[#F5E4BC]" />;
      default:
        return <Globe className="w-6 h-6 text-[#F5E4BC]" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Header Navigation Bar */}
      <header className="sticky top-0 left-0 right-0 h-16 brand-gradient border-b border-[#F5E4BC]/30 flex items-center justify-between px-6 z-50 shadow-md">
        <div className="font-serif text-xl font-bold text-white tracking-wide cursor-pointer flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-[#F5E4BC] p-0.5 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            <img src={logoUrl} alt="Sneh Sarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span>Sneh <span className="text-[#F5E4BC]">Sarees</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-white/90">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">Home</button>
          <button onClick={() => {
            const el = document.getElementById('our-story');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">Our Story</button>
          <button onClick={() => onNavigate('home')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">Shop Now</button>
          <button onClick={() => {
            const el = document.getElementById('contact-us');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">Contact Us</button>
          {user ? (
            <button
              onClick={() => onNavigate('profile')}
              className="bg-[#F5E4BC] hover:bg-white text-[#7A2F08] hover:text-[#7A2F08] text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              Profile
            </button>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="bg-[#F5E4BC] hover:bg-white text-[#7A2F08] hover:text-[#7A2F08] text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              Login
            </button>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden text-white hover:text-[#F5E4BC] focus:outline-hidden cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 brand-gradient border-b border-[#F5E4BC]/35 shadow-xl flex flex-col md:hidden z-40 animate-fade-in">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-semibold text-white/90 hover:bg-white/10 px-6 py-3.5 border-b border-white/5 transition-all cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('our-story');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-semibold text-white/90 hover:bg-white/10 px-6 py-3.5 border-b border-white/5 transition-all cursor-pointer"
            >
              Our Story
            </button>
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-semibold text-white/90 hover:bg-white/10 px-6 py-3.5 border-b border-white/5 transition-all cursor-pointer"
            >
              Shop Now
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('contact-us');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                setMobileMenuOpen(false);
              }}
              className="text-left text-sm font-semibold text-white/90 hover:bg-white/10 px-6 py-3.5 border-b border-white/5 transition-all cursor-pointer"
            >
              Contact Us
            </button>
            {user ? (
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm font-bold text-[#F5E4BC] hover:bg-white/10 px-6 py-3.5 transition-all cursor-pointer"
              >
                My Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('auth');
                  setMobileMenuOpen(false);
                }}
                className="text-left text-sm font-bold text-[#F5E4BC] hover:bg-white/10 px-6 py-3.5 transition-all cursor-pointer"
              >
                Login / Register
              </button>
            )}
          </div>
        )}
      </header>
      {/* Hero Header */}
      <div className="hero-section min-h-screen flex flex-col items-center justify-center p-8 pt-16 pb-12 text-center relative overflow-hidden">
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#7A2F08]/60 via-[#7A2F08]/35 to-[#7A2F08]/55 z-0 pointer-events-none" />
        {/* SVG definitions and patterns */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Horizontal Saree Borders (Top and Bottom) */}
            <pattern id="saree-border-top" width="60" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="8" x2="60" y2="8" stroke="#F5E4BC" strokeWidth="1.5" />
              <line x1="0" y1="32" x2="60" y2="32" stroke="#F5E4BC" strokeWidth="1" />
              <path d="M 0,20 C 15,10 15,30 30,20 C 45,10 45,30 60,20" fill="none" stroke="#F5E4BC" strokeWidth="1" />
              <g transform="translate(15, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#F5E4BC" />
                <circle cx="0" cy="-5" r="1.5" fill="#F5E4BC" />
                <circle cx="0" cy="5" r="1.5" fill="#F5E4BC" />
                <circle cx="-5" cy="0" r="1.5" fill="#F5E4BC" />
                <circle cx="5" cy="0" r="1.5" fill="#F5E4BC" />
              </g>
              <g transform="translate(45, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#F5E4BC" />
                <circle cx="0" cy="-5" r="1.5" fill="#F5E4BC" />
                <circle cx="0" cy="5" r="1.5" fill="#F5E4BC" />
                <circle cx="-5" cy="0" r="1.5" fill="#F5E4BC" />
                <circle cx="5" cy="0" r="1.5" fill="#F5E4BC" />
              </g>
              <path d="M 7,16 C 5,11 11,8 13,13 Z" fill="#F5E4BC" />
              <path d="M 23,24 C 25,29 19,32 17,27 Z" fill="#F5E4BC" />
              <path d="M 37,16 C 35,11 41,8 43,13 Z" fill="#F5E4BC" />
              <path d="M 53,24 C 55,29 49,32 47,27 Z" fill="#F5E4BC" />
            </pattern>

            <pattern id="saree-border-bottom" width="60" height="40" patternUnits="userSpaceOnUse">
              <line x1="0" y1="8" x2="60" y2="8" stroke="#F5E4BC" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="0" y1="32" x2="60" y2="32" stroke="#F5E4BC" strokeWidth="1.5" />
              <path d="M 0,20 C 15,30 15,10 30,20 C 45,30 45,10 60,20" fill="none" stroke="#F5E4BC" strokeWidth="1" />
              <g transform="translate(15, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#F5E4BC" />
                <circle cx="0" cy="-5" r="1.5" fill="#F5E4BC" />
                <circle cx="0" cy="5" r="1.5" fill="#F5E4BC" />
                <circle cx="-5" cy="0" r="1.5" fill="#F5E4BC" />
                <circle cx="5" cy="0" r="1.5" fill="#F5E4BC" />
              </g>
              <g transform="translate(45, 20) scale(0.6)">
                <circle cx="0" cy="0" r="2.5" fill="#F5E4BC" />
                <circle cx="0" cy="-5" r="1.5" fill="#F5E4BC" />
                <circle cx="0" cy="5" r="1.5" fill="#F5E4BC" />
                <circle cx="-5" cy="0" r="1.5" fill="#F5E4BC" />
                <circle cx="5" cy="0" r="1.5" fill="#F5E4BC" />
              </g>
              <path d="M 7,24 C 5,29 11,32 13,27 Z" fill="#F5E4BC" />
              <path d="M 23,16 C 25,11 19,8 17,13 Z" fill="#F5E4BC" />
              <path d="M 37,24 C 35,29 41,32 43,27 Z" fill="#F5E4BC" />
              <path d="M 53,16 C 55,11 49,8 47,13 Z" fill="#F5E4BC" />
            </pattern>

            {/* Drooping bell flower component */}
            <g id="bell-flower">
              <path d="M -12,-15 C -8,-8 8,-8 12,-15 C 8,-20 -8,-20 -12,-15 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
              <path d="M -10,-12 C -18,10 -5,20 0,20 C 5,20 18,10 10,-12 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
              <path d="M 0,-12 L 0,18" fill="none" stroke="#F5E4BC" strokeWidth="1.4" />
              <path d="M -5,-12 C -6,5 -3,15 0,18 C 3,15 6,5 5,-12" fill="none" stroke="#F5E4BC" strokeWidth="1.2" />
              <circle cx="-5" cy="24" r="1.5" fill="#F5E4BC" />
              <circle cx="5" cy="24" r="1.5" fill="#F5E4BC" />
              <line x1="-5" y1="20" x2="-5" y2="23" stroke="#F5E4BC" strokeWidth="1.2" />
              <line x1="5" y1="20" x2="5" y2="23" stroke="#F5E4BC" strokeWidth="1.2" />
            </g>

            {/* Main traditional Kashmiri flower vine jaal motif */}
            <g id="floral-jaal-motif">
              {/* Curved main vine stem */}
              <path d="M -40,60 C -30,20 -10,-10 20,-20 C 35,-25 55,-20 70,-5" fill="none" stroke="#F5E4BC" strokeWidth="1.9" />
              
              {/* Main fanning flower head at the end of the stem */}
              <g transform="translate(70, -5) rotate(45)">
                {/* Base cup */}
                <path d="M -15,10 C -15,0 15,0 15,10 C 10,20 -10,20 -15,10 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
                <path d="M -10,7 C -5,12 5,12 10,7" fill="none" stroke="#F5E4BC" strokeWidth="1.2" />
                {/* Petals */}
                <path d="M 0,3 C -6,-15 0,-30 0,-30 C 0,-30 6,-15 0,3 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
                <path d="M -5,5 C -15,-10 -15,-25 -10,-26 C -8,-20 -5,-5 -5,5 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
                <path d="M 5,5 C 15,-10 15,-25 10,-26 C 8,-20 5,-5 5,5 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
                <path d="M -10,8 C -25,0 -26,-15 -20,-17 C -15,-12 -10,-2 -10,8 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
                <path d="M 10,8 C 25,0 26,-15 20,-17 C 15,-12 10,-2 10,8 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.6" />
                
                <line x1="0" y1="-5" x2="0" y2="-22" stroke="#F5E4BC" strokeWidth="1.0" strokeDasharray="1.5 1.5" />
                <line x1="-5" y1="-2" x2="-10" y2="-18" stroke="#F5E4BC" strokeWidth="1.0" strokeDasharray="1.5 1.5" />
                <line x1="5" y1="-2" x2="10" y2="-18" stroke="#F5E4BC" strokeWidth="1.0" strokeDasharray="1.5 1.5" />
              </g>
              
              {/* Drooping bell-shaped flower branching off at the middle */}
              <path d="M 10,-13 C 5,5 0,15 -10,25" fill="none" stroke="#F5E4BC" strokeWidth="1.5" />
              <g transform="translate(-10, 25) rotate(-30)">
                <use href="#bell-flower" />
              </g>
              
              {/* Side leaves along the vine */}
              <path d="M -25,38 C -40,32 -45,20 -35,18 C -25,16 -20,25 -25,38 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.4" />
              <line x1="-25" y1="38" x2="-35" y2="24" stroke="#F5E4BC" strokeWidth="1.0" />
              
              <path d="M -5,12 C -15,0 -12,-12 -2,-10 C 8,-8 5,4 -5,12 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.4" />
              <line x1="-5" y1="12" x2="-4" y2="-4" stroke="#F5E4BC" strokeWidth="1.0" />
 
              <path d="M 42,-22 C 45,-38 35,-45 28,-38 C 21,-31 30,-25 42,-22 Z" fill="none" stroke="#F5E4BC" strokeWidth="1.4" />
              <line x1="42" y1="-22" x2="33" y2="-36" stroke="#F5E4BC" strokeWidth="1.0" />
            </g>
 
            {/* Small 6-petaled floating flower buti */}
            <g id="small-floating-flower">
              <circle cx="0" cy="0" r="2.5" fill="none" stroke="#F5E4BC" strokeWidth="1.5" />
              {[0, 60, 120, 180, 240, 300].map((angle) => (
                <circle
                  key={angle}
                  cx="0"
                  cy="-5.5"
                  r="2.2"
                  fill="none"
                  stroke="#F5E4BC"
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
        {/* Motif Deco - Prominent Hero Logo Circle */}
        <div className="mt-8 md:mt-12 mb-6 drop-shadow-[0_8px_32px_rgba(245,228,188,0.7)]">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-[#F5E4BC] p-1.5 bg-white overflow-hidden flex items-center justify-center shadow-2xl transition-transform hover:scale-105 duration-300">
            <img src={logoUrl} alt="Sneh Sarees Logo" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-wide leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          Sneh <span className="text-[#F5E4BC] drop-shadow-[0_0_20px_rgba(245,228,188,0.7)] font-normal italic">Sarees</span>
        </h1>

        {/* Beautiful Tagline Container */}
        <div className="w-full max-w-[92%] md:max-w-[760px] bg-black/25 backdrop-blur-md border border-[#F5E4BC]/35 rounded-2xl px-6 md:px-10 py-5 mb-10 shadow-[0_12px_36px_rgba(0,0,0,0.35)] text-center relative z-10 transition-all hover:border-[#F5E4BC]/60">
          <p className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold text-[#F5E4BC] tracking-wide leading-relaxed drop-shadow-md">
            “Quality You Can See, Prices You'll Love”
          </p>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#F5E4BC]/60 to-transparent mx-auto my-2.5" />
          <p className="text-xs md:text-sm font-sans uppercase tracking-[0.25em] text-white/95 font-bold drop-shadow-xs">
            The Perfect Saree for Every Occasion
          </p>
        </div>

        <div className="w-full max-w-[200px] md:max-w-[240px] z-10">
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-[#F5E4BC] text-[#7A2F08] text-sm md:text-base font-bold py-3.5 rounded-full tracking-wider shadow-[0_4px_16px_rgba(245,228,188,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            Shop Now
          </button>
        </div>

        <div className="absolute bottom-6 text-white/50 text-xs text-center animate-bounce">
          ↓ Scroll to explore
        </div>
      </div>

      {/* Seamless gradient bridge — eliminates the white strip between hero and body */}
      <div className="h-16 bg-gradient-to-b from-[#7A2F08] to-transparent -mb-16 relative z-10 pointer-events-none" />

      {/* Post-hero content with fabric background */}
      <div className="landing-body-bg relative">
        {/* Light overlay so card content stays readable */}
        <div className="absolute inset-0 bg-white/25 pointer-events-none z-0" />

      {/* Our Story */}
      <section id="our-story" className="py-12 md:py-16 px-6 md:px-12 max-w-[1100px] mx-auto bg-white/80 backdrop-blur-md rounded-2xl my-8 shadow-sm border border-[#E8E0D5]/80 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FFF0E8] to-transparent rounded-bl-full pointer-events-none opacity-60" />
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#C4601A] uppercase mb-2 block">
          Our Story
        </h3>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#7A2F08] mb-6 leading-tight">
          Woven with sneh, worn with pride
        </h2>
        <div className="space-y-4 max-w-[840px]">
          <p className="text-[#111111] font-sans text-sm md:text-base leading-relaxed">
            It all starts with thousands of threads, cotton and silk woven together just to make a beautiful fabric smooth like silk and breathable like cotton. Kota Doria becomes a symbol of grace, as it begins with a quiet labor of love.
          </p>
          <p className="text-sm md:text-base leading-relaxed font-serif italic text-[#7A2F08] text-lg font-semibold">
            "Behind all the elegant borders, intricate motifs, and shimmering zari what emerges is more than just a fabric — it is a timeless story of heritage, devotion, and artistry."
          </p>
        </div>
      </section>

      <div className="saree-divider my-8 max-w-[1100px] mx-auto" />

      {/* Bulk Orders Banner */}
      <section className="py-12 px-8 md:px-12 max-w-[1100px] mx-auto brand-gradient-h rounded-2xl my-8 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden z-10">
        <div className="flex-1 relative z-10">
          <h3 className="text-xs font-bold tracking-[0.2em] text-[#F5E4BC] uppercase mb-2">
            Bulk Orders
          </h3>
          <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold mb-3 leading-tight">
            Interested in Bulk Orders?
          </h2>
          <p className="text-white text-sm md:text-base max-w-[580px] leading-relaxed font-sans">
            Planning a family function, gifting occasion, or buying for a group? We offer authentic Kota Doria sarees in bulk quantities from our store. Contact us on WhatsApp to discuss requirements and pricing.
          </p>
        </div>
        <button
          onClick={() => onNavigate('bulk')}
          className="bg-[#F5E4BC] text-[#7A2F08] px-8 py-4 rounded-full text-sm font-bold shadow-md hover:bg-white hover:text-[#C4601A] hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0 cursor-pointer relative z-10 active:scale-95"
        >
          Enquire for Bulk →
        </button>
      </section>

      <div className="saree-divider my-8 max-w-[1100px] mx-auto relative z-10" />

      {/* Contact Us Section */}
      <section id="contact-us" className="py-12 md:py-16 max-w-[1100px] mx-auto px-6 md:px-12 bg-white/80 backdrop-blur-md rounded-2xl my-8 shadow-sm border border-[#E8E0D5]/80 relative z-10">
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#C4601A] uppercase mb-2 block">
          Get In Touch
        </h3>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-[#7A2F08] mb-8 leading-tight">
          Contact Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column: Contact Details */}
          <div className="flex flex-col gap-6 justify-between">
            <div className="space-y-6">
              <p className="text-[#111111] font-sans text-sm md:text-base leading-relaxed">
                Have questions about our sarees, available collections, or an active order? Reach out to us, and our team will assist you as soon as possible.
              </p>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center shrink-0 text-[#C4601A] shadow-2xs">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Phone Number</h4>
                    <a href="tel:+919461037123" className="text-sm md:text-base font-bold text-[#111111] hover:text-[#C4601A] transition-colors">+91 94610 37123</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center shrink-0 text-[#C4601A] shadow-2xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Email Address</h4>
                    <a href="mailto:info@snehsarees.in" className="text-sm md:text-base font-bold text-[#111111] hover:text-[#C4601A] transition-colors">info@snehsarees.in</a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#FFF0E8] border border-[#F0C8A0] flex items-center justify-center shrink-0 text-[#C4601A] shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider">Location</h4>
                    <p className="text-sm md:text-base font-bold text-[#111111]">Kota, Rajasthan, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="pt-6 border-t border-[#E8E0D5]">
              <h4 className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-3">Connect With Us</h4>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/_sneh_sarees_?igsi=MWU0YzhuMDFzZGJhaQ=="
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full brand-solid-bg text-white flex items-center justify-center transition-all cursor-pointer hover:-translate-y-0.5 shadow-xs hover:shadow-md"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/share/1DH5hK94pk"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full brand-solid-bg text-white flex items-center justify-center transition-all cursor-pointer hover:-translate-y-0.5 shadow-xs hover:shadow-md"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://pin.it/4lkzTeODv"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full brand-solid-bg text-white flex items-center justify-center transition-all cursor-pointer hover:-translate-y-0.5 shadow-xs hover:shadow-md"
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
                  className="w-10 h-10 rounded-full brand-solid-bg text-white flex items-center justify-center transition-all cursor-pointer hover:-translate-y-0.5 shadow-xs hover:shadow-md"
                  title="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <form onSubmit={handleSubmit} className="bg-[#FAF6F0]/90 backdrop-blur-xs p-6 md:p-8 rounded-2xl border border-[#E8E0D5] flex flex-col gap-4 shadow-xs">
            <div>
              <label htmlFor="enquiry-name" className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Your Name</label>
              <input
                id="enquiry-name"
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#C4601A] focus:ring-1 focus:ring-[#C4601A] transition-all"
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
                className="w-full bg-white border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#C4601A] focus:ring-1 focus:ring-[#C4601A] transition-all"
              />
            </div>

            <div>
              <label htmlFor="enquiry-message" className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-1.5">Your Enquiry Message</label>
              <textarea
                id="enquiry-message"
                required
                rows={4}
                placeholder="Describe what you are looking for"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white border border-[#E8E0D5] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#C4601A] focus:ring-1 focus:ring-[#C4601A] transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full brand-solid-bg text-white py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer mt-2 flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-98"
            >
              Send Enquiry via WhatsApp
            </button>
          </form>
        </div>
      </section>

      </div>{/* end landing-body-bg */}

      {/* Footer */}
      <footer className="brand-gradient pt-12 pb-8 px-6 md:px-12 text-center text-white border-t border-[#F5E4BC]/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/15">
          <div className="text-center md:text-left">
            <div className="font-serif text-3xl font-bold mb-1 tracking-wide">Sneh <span className="text-[#F5E4BC]">Sarees</span></div>
            <p className="text-xs text-white/80 max-w-sm">
              Authentic Kota Doria (Kotadoria) sarees from our family store in Kota, Rajasthan — trusted quality at honest prices.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/90">
            <button onClick={() => setPolicyModalTab('privacy')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => setPolicyModalTab('terms')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => setPolicyModalTab('shipping')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">
              Shipping &amp; Delivery
            </button>
            <button onClick={() => setPolicyModalTab('returns')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">
              Return &amp; Refund
            </button>
            <button onClick={() => setPolicyModalTab('cancellation')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">
              Cancellation &amp; Payment
            </button>
            <button onClick={() => setPolicyModalTab('faqs')} className="hover:text-[#F5E4BC] transition-colors cursor-pointer">
              FAQs
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70 gap-3">
          <p className="tracking-wider">
            © {new Date().getFullYear()} Sneh Sarees. Kota, Rajasthan.
          </p>
          <p className="text-[11px] text-white/60">
            Offline &amp; Online Store · Kota, Rajasthan · Authentic Kota Doria
          </p>
        </div>
      </footer>

      <PolicyModal
        isOpen={!!policyModalTab}
        initialTab={policyModalTab || 'privacy'}
        onClose={() => setPolicyModalTab(null)}
      />
    </div>
  );
};
