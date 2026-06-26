import React from 'react';
import { ArrowLeft, User, Heart, ShoppingBag, Settings, LogIn } from 'lucide-react';
import { ActivePage } from '../../types';

interface ProfileViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  showToast: (msg: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate, showToast }) => {
  return (
    <div id="page-profile" className="bg-[#FAF6F0] min-h-screen">
      {/* Header bar */}
      <div className="va-top-bar sticky top-0 bg-white border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          My Profile
        </div>
        <div className="w-[34px] md:w-10 h-[34px] md:h-10" /> {/* Spacer */}
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[820px] mx-auto pt-6 pb-[80px] flex flex-col items-center">
        {/* Avatar badge */}
        <div className="w-20 h-20 bg-[#7B1C2E] rounded-full flex items-center justify-center shadow-md mb-4 scroll-mt-2">
          <User className="w-10 h-10 text-white" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-1">
          Guest User
        </h2>
        <p className="text-xs text-[#888888] mb-6">
          Sign in to access your saved orders across multiple devices
        </p>

        <button
          onClick={() => showToast('Login feature is coming soon!')}
          className="bg-[#7B1C2E] text-white text-xs font-bold px-8 py-3.5 rounded-full hover:bg-[#9B2840] active:scale-95 transition-all text-center mb-8 shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Sign In / Register
        </button>

        {/* Dashboard quick routes */}
        <div className="w-full bg-white rounded-xl border border-[#E8E0D5] overflow-hidden divide-y divide-[#E8E0D5] shadow-2xs">
          <button
            onClick={() => onNavigate('orders')}
            className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="w-4.5 h-4.5 text-[#7B1C2E]" /> My Orders
            </span>
            <span className="text-[#888888]">→</span>
          </button>
          <button
            onClick={() => onNavigate('wishlist')}
            className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Heart className="w-4.5 h-4.5 text-[#7B1C2E]" /> My Wishlist
            </span>
            <span className="text-[#888888]">→</span>
          </button>
          <button
            onClick={() => showToast('Settings feature coming soon!')}
            className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
          >
            <span className="flex items-center gap-3">
              <Settings className="w-4.5 h-4.5 text-[#7B1C2E]" /> Account Settings
            </span>
            <span className="text-[#888888]">→</span>
          </button>
        </div>
      </div>

    </div>
  );
};
