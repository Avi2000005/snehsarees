import React, { useState } from 'react';
import { ArrowLeft, User, ShoppingBag, LogIn, LogOut, Lock, Shield, FileText, HelpCircle, X, Home, MapPin, Edit3, Trash2, KeyRound, CheckCircle, Mail, Phone, Plus, Check, Truck, RotateCcw, Ban, Loader2 } from 'lucide-react';
import { ActivePage, UserProfile, UserAddress } from '../../types';
import { API_URL } from '../../config';
import { PolicyModal, PolicyTab } from '../PolicyModal';
import { INDIAN_STATES, getDistrictsForState, lookupPincode } from '../../data/indiaLocations';

interface ProfileViewProps {
  onNavigate: (page: ActivePage, param?: string) => void;
  onBack: () => void;
  showToast: (msg: string) => void;
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile | null) => void;
  onLogout: () => void;
  token: string | null;
}

type SubView = 'main' | 'edit-profile' | 'addresses' | 'change-password' | 'delete-account';

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onBack,
  showToast,
  user,
  onUpdateUser,
  onLogout,
  token,
}) => {
  const [activeModal, setActiveModal] = useState<PolicyTab | null>(null);
  const [subView, setSubView] = useState<SubView>('main');

  // Edit Profile Form State
  const [editName, setEditName] = useState(user?.name || '');
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailChanging, setEmailChanging] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Address Form State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrLabel, setAddrLabel] = useState('Home');
  const [addrLine, setAddrLine] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPin, setAddrPin] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);

  // PIN lookup state for Profile Address modal
  const [isAddrPinSearching, setIsAddrPinSearching] = useState(false);
  const [addrPinStatusMsg, setAddrPinStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'loading' } | null>(null);
  const [addrPostOffices, setAddrPostOffices] = useState<string[]>([]);

  const triggerAddrPinLookup = async (pinVal: string) => {
    const clean = pinVal.replace(/\D/g, '').slice(0, 6);
    if (clean.length !== 6) return;
    setIsAddrPinSearching(true);
    setAddrPinStatusMsg({ text: 'Verifying PIN code...', type: 'loading' });
    try {
      const res = await lookupPincode(clean);
      if (res && res.state) {
        setAddrState(res.state);
        if (res.district) setAddrCity(res.district);
        if (res.postOffices && res.postOffices.length > 0) {
          setAddrPostOffices(res.postOffices);
        }
        setAddrPinStatusMsg({
          text: `Auto-detected: ${res.district ? res.district + ', ' : ''}${res.state}`,
          type: 'success'
        });
      } else {
        setAddrPinStatusMsg({
          text: 'PIN not found. Select State & District manually.',
          type: 'error'
        });
      }
    } catch {
      setAddrPinStatusMsg({
        text: 'PIN lookup offline. Select State & District manually.',
        type: 'error'
      });
    } finally {
      setIsAddrPinSearching(false);
    }
  };

  const handleAddrPinChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setAddrPin(clean);
    if (clean.length < 6) {
      setAddrPinStatusMsg(null);
      setAddrPostOffices([]);
    } else if (clean.length === 6) {
      triggerAddrPinLookup(clean);
    }
  };

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Delete Account State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Helper API fetch
  const apiCall = async (path: string, method: string, body: object) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}/api/auth/${path}`, {
      method,
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Operation failed');
    return data;
  };

  // ── UPDATE BASIC PROFILE ───────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return showToast('Name cannot be empty.');
    setSavingProfile(true);
    try {
      const payload: any = {
        name: editName.trim(),
        username: editUsername.trim() || null,
        phone: editPhone.trim() || null,
      };

      // Include new email + OTP if user is changing email
      if (emailChanging && editEmail.toLowerCase() !== (user?.email || '').toLowerCase()) {
        payload.email = editEmail.toLowerCase().trim();
        payload.emailOtp = emailOtp.trim();
      }

      const data = await apiCall('profile', 'PUT', payload);
      onUpdateUser(data.user);
      showToast('Profile updated successfully! ✨');
      setSubView('main');
      setEmailChanging(false);
      setOtpSent(false);
      setEmailOtp('');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ── SEND EMAIL UPDATE OTP ──────────────────────────────────────────
  const handleSendEmailOtp = async () => {
    try {
      showToast('Sending OTP to your current email...');
      await apiCall('send-email-update-otp', 'POST', {});
      setOtpSent(true);
      showToast('Verification code sent to your old email address.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // ── MANAGE ADDRESSES ───────────────────────────────────────────────
  const openAddAddress = () => {
    setEditingAddressId(null);
    setAddrLabel('Home');
    setAddrLine('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('');
    setAddrPin('');
    setAddrDefault(false);
    setAddrPinStatusMsg(null);
    setAddrPostOffices([]);
    setAddressModalOpen(true);
  };

  const openEditAddress = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddrLabel(addr.label);
    setAddrLine(addr.addressLine);
    setAddrLine2(addr.addressLine2 || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPin(addr.pinCode);
    setAddrDefault(addr.isDefault);
    setAddrPinStatusMsg(null);
    setAddrPostOffices([]);
    setAddressModalOpen(true);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrLine || !addrCity || !addrState || !addrPin) {
      return showToast('Please fill in all address fields.');
    }

    const currentAddresses = [...(user?.addresses || [])];

    // If setting as default, unset others first
    if (addrDefault) {
      currentAddresses.forEach(a => a.isDefault = false);
    }

    if (editingAddressId) {
      // Edit existing
      const idx = currentAddresses.findIndex(a => a.id === editingAddressId);
      if (idx !== -1) {
        currentAddresses[idx] = {
          id: editingAddressId,
          label: addrLabel,
          addressLine: addrLine,
          addressLine2: addrLine2,
          city: addrCity,
          state: addrState,
          pinCode: addrPin,
          isDefault: addrDefault || currentAddresses.length === 1,
        };
      }
    } else {
      // Add new
      const newAddr: UserAddress = {
        id: Date.now().toString(),
        label: addrLabel,
        addressLine: addrLine,
        addressLine2: addrLine2,
        city: addrCity,
        state: addrState,
        pinCode: addrPin,
        isDefault: addrDefault || currentAddresses.length === 0,
      };
      currentAddresses.push(newAddr);
    }

    try {
      const data = await apiCall('profile', 'PUT', { addresses: currentAddresses });
      onUpdateUser(data.user);
      showToast('Address saved successfully!');
      setAddressModalOpen(false);
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const deleteAddress = async (addrId: string) => {
    const currentAddresses = (user?.addresses || []).filter(a => a.id !== addrId);
    // If we deleted the default address and there are others, set the first one as default
    if (currentAddresses.length > 0 && !currentAddresses.some(a => a.isDefault)) {
      currentAddresses[0].isDefault = true;
    }
    try {
      const data = await apiCall('profile', 'PUT', { addresses: currentAddresses });
      onUpdateUser(data.user);
      showToast('Address removed.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  const setDefaultAddress = async (addrId: string) => {
    const currentAddresses = [...(user?.addresses || [])].map(a => ({
      ...a,
      isDefault: a.id === addrId
    }));
    try {
      const data = await apiCall('profile', 'PUT', { addresses: currentAddresses });
      onUpdateUser(data.user);
      showToast('Default address updated.');
    } catch (err: any) {
      showToast(err.message);
    }
  };

  // ── PASSWORD CHANGE ───────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return showToast('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return showToast('Passwords do not match.');
    setUpdatingPassword(true);
    try {
      await apiCall('profile', 'PUT', { password: newPassword });
      showToast('Password changed successfully! 🔐');
      setNewPassword('');
      setConfirmPassword('');
      setSubView('main');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // ── DELETE ACCOUNT ────────────────────────────────────────────────
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.toLowerCase() !== 'delete') {
      return showToast('Please type "DELETE" exactly to confirm.');
    }
    setDeletingAccount(true);
    try {
      await apiCall('account', 'DELETE', {});
      showToast('Your account has been deleted. We are sorry to see you go. 👋');
      onLogout();
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div id="page-profile" className="min-h-screen bg-[#FAF6F0]/80 backdrop-blur-xs">
      {/* Header bar */}
      <div className="va-top-bar sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#E8E0D5] px-4 md:px-7 lg:px-12 h-[56px] md:h-[60px] lg:h-[68px] flex items-center justify-between z-20 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          className="va-back text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={subView === 'main' ? onBack : () => setSubView('main')}
        >
          <ArrowLeft className="w-[22px] h-[22px]" />
        </button>
        <div className="va-title font-serif text-lg md:text-xl font-bold text-[#1A1A1A]">
          {subView === 'main' && 'My Profile'}
          {subView === 'edit-profile' && 'Edit Account'}
          {subView === 'addresses' && 'Saved Addresses'}
          {subView === 'change-password' && 'Security'}
          {subView === 'delete-account' && 'Delete Account'}
        </div>
        <button
          className="text-[#1A1A1A] p-1.5 hover:bg-[#FAF6F0] rounded-full transition-colors cursor-pointer"
          onClick={() => onNavigate('home')}
          title="Return to Home Section"
        >
          <Home className="w-[22px] h-[22px]" />
        </button>
      </div>

      <div className="page-content px-4 md:px-7 lg:px-12 max-w-[820px] mx-auto pt-6 pb-32">
        
        {/* ─── MAIN VIEW ─── */}
        {subView === 'main' && (
          <div className="flex flex-col items-center">
            {/* Avatar badge */}
            <div className="w-20 h-20 bg-[#C4601A] rounded-full flex items-center justify-center shadow-md mb-4 scroll-mt-2">
              <User className="w-10 h-10 text-white" />
            </div>

            {user ? (
              <>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-1">
                  {user.name}
                </h2>
                <p className="text-xs text-[#888888] mb-6">
                  {user.username ? `@${user.username}` : 'No username set'} {user.email ? `· ${user.email}` : ''}
                </p>

                {/* Dashboard Options */}
                <div className="w-full bg-white rounded-xl border border-[#E8E0D5] overflow-hidden divide-y divide-[#E8E0D5] shadow-2xs mb-6">
                  <button
                    onClick={() => onNavigate('orders')}
                    className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingBag className="w-4.5 h-4.5 text-[#C4601A]" /> My Orders
                    </span>
                    <span className="text-[#888888] font-normal">→</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditName(user.name);
                      setEditUsername(user.username || '');
                      setEditPhone(user.phone || '');
                      setEditEmail(user.email || '');
                      setSubView('edit-profile');
                    }}
                    className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <User className="w-4.5 h-4.5 text-[#C4601A]" /> Edit Account Details
                    </span>
                    <span className="text-[#888888] font-normal">→</span>
                  </button>

                  <button
                    onClick={() => setSubView('addresses')}
                    className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <MapPin className="w-4.5 h-4.5 text-[#C4601A]" /> Saved Delivery Addresses
                    </span>
                    <span className="text-[#888888] font-normal">→</span>
                  </button>

                  <button
                    onClick={() => setSubView('change-password')}
                    className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Lock className="w-4.5 h-4.5 text-[#C4601A]" /> Change Password
                    </span>
                    <span className="text-[#888888] font-normal">→</span>
                  </button>

                  <button
                    onClick={() => setSubView('delete-account')}
                    className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Trash2 className="w-4.5 h-4.5 text-red-500" /> Delete My Account
                    </span>
                    <span className="text-[#888888] font-normal">→</span>
                  </button>

                  {/* Admin Portal — visible ONLY to info@snehsarees.in */}
                  {user?.email?.toLowerCase() === 'info@snehsarees.in' && (
                    <button
                      onClick={() => onNavigate('admin')}
                      className="w-full text-left p-4 px-5 flex items-center justify-between hover:bg-amber-50 text-sm text-amber-700 font-semibold cursor-pointer border-t border-amber-100"
                    >
                      <span className="flex items-center gap-3">
                        <Shield className="w-4.5 h-4.5 text-amber-600" /> Admin Portal
                      </span>
                      <span className="text-amber-400 font-normal">→</span>
                    </button>
                  )}
                </div>


                <div className="w-full bg-white rounded-xl border border-[#E8E0D5] overflow-hidden divide-y divide-[#E8E0D5] shadow-2xs mb-8">
                  <div className="px-5 py-2.5 bg-[#FAF6F0] text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Store Policies &amp; Legal Center
                  </div>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-[#C4601A]" /> Privacy Policy
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('terms')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#C4601A]" /> Terms of Service
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('shipping')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-[#C4601A]" /> Shipping &amp; Delivery Policy
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>


                  <button
                    onClick={() => setActiveModal('cancellation')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Ban className="w-4 h-4 text-[#C4601A]" /> Cancellation &amp; Payments
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('faqs')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#C4601A]" /> FAQs &amp; Help
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>
                </div>

                <button
                  onClick={onLogout}
                  className="bg-red-50 text-red-600 text-xs font-bold px-8 py-3.5 rounded-full hover:bg-red-100 active:scale-95 transition-all text-center mb-8 shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign Out Account
                </button>
              </>
            ) : (
              <>
                <h2 className="font-serif text-2xl font-bold text-[#1A1A1A] mb-1">
                  Guest User
                </h2>
                <p className="text-xs text-[#888888] mb-6">
                  Sign in to manage your saved addresses, track orders, and write reviews
                </p>

                <button
                  onClick={() => onNavigate('auth')}
                  className="bg-[#C4601A] text-white text-xs font-bold px-8 py-3.5 rounded-full hover:bg-[#a84e15] active:scale-95 transition-all text-center mb-8 shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" /> Sign In / Register
                </button>

                {/* Guest policies menu */}
                <div className="w-full bg-white rounded-xl border border-[#E8E0D5] overflow-hidden divide-y divide-[#E8E0D5] shadow-2xs mb-8">
                  <div className="px-5 py-2.5 bg-[#FAF6F0] text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                    Store Policies &amp; Legal Center
                  </div>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-[#C4601A]" /> Privacy Policy
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('terms')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-[#C4601A]" /> Terms of Service
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('shipping')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Truck className="w-4 h-4 text-[#C4601A]" /> Shipping &amp; Delivery Policy
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>


                  <button
                    onClick={() => setActiveModal('cancellation')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <Ban className="w-4 h-4 text-[#C4601A]" /> Cancellation &amp; Payments
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>

                  <button
                    onClick={() => setActiveModal('faqs')}
                    className="w-full text-left p-3.5 px-5 flex items-center justify-between hover:bg-[#FAF6F0] text-xs md:text-sm text-[#1A1A1A] font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-[#C4601A]" /> FAQs &amp; Help
                    </span>
                    <span className="text-[#888888]">→</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── EDIT PROFILE VIEW ─── */}
        {subView === 'edit-profile' && user && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs max-w-[500px] mx-auto">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#888]" />
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-0.5">
                  Username
                </label>
                <span className="text-[10px] text-gray-500 block mb-1.5">This will be shown publicly when you write product reviews</span>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-bold text-[#888]">@</span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="Choose a username"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 pl-8 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-[#888]" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-2">
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-[#888]" />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={e => {
                        setEditEmail(e.target.value);
                        if (e.target.value.toLowerCase().trim() !== (user.email || '').toLowerCase()) {
                          setEmailChanging(true);
                        } else {
                          setEmailChanging(false);
                          setOtpSent(false);
                        }
                      }}
                      className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    />
                  </div>
                  {emailChanging && !otpSent && user.email && (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      className="bg-[#C4601A] text-white px-3 py-2.5 rounded-xl text-[10px] font-bold hover:bg-[#a84e15] transition-colors cursor-pointer shrink-0"
                    >
                      Send OTP to Old Email
                    </button>
                  )}
                </div>

                {emailChanging && user.email && (
                  <div className="bg-[#FFF8F3] border border-[#F5E4BC] rounded-xl p-3.5 mt-3 space-y-3">
                    <p className="text-[10px] text-gray-600 leading-relaxed">
                      Verification code is required to authorize changing from <strong>{user.email}</strong>.
                    </p>
                    {otpSent && (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="6-digit OTP"
                          value={emailOtp}
                          onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          className="bg-white border border-[#E8E0D5] rounded-lg py-2 px-3 text-center tracking-[0.2em] font-bold text-sm w-36 focus:outline-none focus:border-[#C4601A]"
                        />
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          className="text-[10px] text-[#C4601A] font-bold hover:underline"
                        >
                          Resend Code
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSubView('main')}
                  className="flex-1 border border-[#E8E0D5] py-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex-1 bg-[#C4601A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#a84e15] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── SAVED ADDRESSES VIEW ─── */}
        {subView === 'addresses' && user && (
          <div className="space-y-4 max-w-[600px] mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-gray-500 font-semibold">{user.addresses?.length || 0} Saved Addresses</span>
              <button
                onClick={openAddAddress}
                className="bg-[#C4601A] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#a84e15] transition-colors flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <Plus className="w-4 h-4" /> Add Address
              </button>
            </div>

            {/* Address Cards */}
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white border rounded-2xl p-5 shadow-3xs relative flex flex-col justify-between transition-all ${
                      addr.isDefault ? 'border-[#C4601A] ring-1 ring-[#C4601A]/20' : 'border-[#E8E0D5]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-extrabold uppercase bg-[#FAF6F0] border border-[#E8E0D5] text-[#C4601A] px-2.5 py-0.5 rounded-md">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" /> Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1A1A1A] font-semibold leading-relaxed mb-1">{addr.addressLine}</p>
                      <p className="text-xs text-gray-500">{addr.city}, {addr.state} - {addr.pinCode}</p>
                    </div>

                    <div className="flex gap-4 border-t border-gray-100 mt-4 pt-3.5 text-xs font-bold">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[#C4601A] hover:underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => openEditAddress(addr)}
                        className="text-gray-600 hover:text-[#C4601A] flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-[#E8E0D5] rounded-2xl p-10 text-center text-gray-500">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold">No saved addresses found</p>
                <p className="text-xs text-gray-400 mt-1">Add an address to make checkout faster next time.</p>
              </div>
            )}
          </div>
        )}

        {/* ─── CHANGE PASSWORD VIEW ─── */}
        {subView === 'change-password' && user && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs max-w-[400px] mx-auto">
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#888]" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-[#888]" />
                  <input
                    type="password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubView('main')}
                  className="flex-1 border border-[#E8E0D5] py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="flex-1 bg-[#C4601A] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#a84e15] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {updatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── DELETE ACCOUNT VIEW ─── */}
        {subView === 'delete-account' && user && (
          <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-xs max-w-[400px] mx-auto">
            <h3 className="font-serif text-lg font-bold text-red-600 mb-2">Delete Your Account Permanently?</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              This action is irreversible. All of your saved addresses, wishlist, and profile information will be deleted forever.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1.5">
                  Type "DELETE" to confirm
                </label>
                <input
                  type="text"
                  placeholder="Type DELETE"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-red-50/50 border border-red-200 rounded-xl py-2.5 px-4 text-xs font-bold text-red-700 focus:outline-none focus:border-red-500 focus:bg-red-50/20"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubView('main')}
                  className="flex-1 border border-[#E8E0D5] py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount || deleteConfirmText.toLowerCase() !== 'delete'}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {deletingAccount ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ─── ADDRESS ADD/EDIT MODAL ─── */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-[450px] bg-white rounded-2xl border border-[#E8E0D5] shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#E8E0D5] bg-[#FAF6F0] flex justify-between items-center">
              <h2 className="font-serif text-lg font-bold text-[#C4601A]">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={() => setAddressModalOpen(false)}
                className="p-1 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveAddress} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Address Label
                </label>
                <div className="flex gap-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddrLabel(lbl)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        addrLabel === lbl
                          ? 'bg-[#C4601A] border-[#C4601A] text-white shadow-xs'
                          : 'bg-white border-[#E8E0D5] text-[#888] hover:bg-gray-50'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  placeholder="House / Flat No., Street, Colony"
                  value={addrLine}
                  onChange={e => setAddrLine(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Landmark, Area, Near to..."
                  value={addrLine2}
                  onChange={e => setAddrLine2(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                />
              </div>

              {/* Pincode with Auto-detection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider">
                    Pincode *
                  </label>
                  <span className="text-[10px] font-semibold text-[#C4601A]">
                    ⚡ Auto-fills State & District
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter 6-digit PIN code"
                    value={addrPin}
                    onChange={e => handleAddrPinChange(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 pr-20 text-xs font-semibold focus:outline-none focus:border-[#C4601A]"
                    maxLength={6}
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isAddrPinSearching ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-[#C4601A] bg-[#FFF5EE] px-1.5 py-0.5 rounded">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking
                      </span>
                    ) : addrPin.length === 6 ? (
                      <button
                        type="button"
                        onClick={() => triggerAddrPinLookup(addrPin)}
                        className="text-[10px] font-semibold text-[#C4601A] hover:bg-[#FFF5EE] px-1.5 py-0.5 rounded border border-[#E8E0D5] transition-colors cursor-pointer"
                      >
                        Verify
                      </button>
                    ) : null}
                  </div>
                </div>

                {addrPinStatusMsg && (
                  <div
                    className={`mt-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                      addrPinStatusMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : addrPinStatusMsg.type === 'loading'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {addrPinStatusMsg.type === 'success' && <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                    {addrPinStatusMsg.type === 'loading' && <Loader2 className="w-3 h-3 animate-spin text-amber-600 flex-shrink-0" />}
                    {addrPinStatusMsg.type === 'error' && <span className="text-rose-500 font-bold">ℹ</span>}
                    <span>{addrPinStatusMsg.text}</span>
                  </div>
                )}

                {addrPostOffices.length > 0 && (
                  <div className="mt-2 p-2 bg-[#FAF6F0] rounded-lg border border-[#E8E0D5]">
                    <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block mb-1">
                      Local Post Offices in this PIN:
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {addrPostOffices.slice(0, 6).map((po) => (
                        <button
                          key={po}
                          type="button"
                          onClick={() => {
                            if (!addrLine2) setAddrLine2(po);
                            else if (!addrLine2.includes(po)) setAddrLine2(`${addrLine2}, Near ${po}`);
                            showToast(`Added ${po} to address`);
                          }}
                          className="text-[10px] bg-white border border-[#E8E0D5] hover:border-[#C4601A] hover:text-[#C4601A] px-1.5 py-0.5 rounded text-gray-700 transition-colors cursor-pointer"
                        >
                          + {po}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* State & District Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                    State / UT *
                  </label>
                  <select
                    value={addrState}
                    onChange={e => {
                      setAddrState(e.target.value);
                      setAddrCity('');
                    }}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A] text-[#1A1A1A] cursor-pointer"
                    required
                  >
                    <option value="">-- Select State / UT --</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                    {addrState && !INDIAN_STATES.includes(addrState) && (
                      <option value={addrState}>{addrState}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                    District / City *
                  </label>
                  <select
                    value={addrCity}
                    onChange={e => setAddrCity(e.target.value)}
                    disabled={!addrState}
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none focus:border-[#C4601A] text-[#1A1A1A] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">
                      {!addrState ? '-- Select State First --' : '-- Select District --'}
                    </option>
                    {getDistrictsForState(addrState).map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                    {addrCity && !getDistrictsForState(addrState).includes(addrCity) && (
                      <option value={addrCity}>{addrCity}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-default-addr"
                  checked={addrDefault}
                  onChange={e => setAddrDefault(e.target.checked)}
                  className="rounded text-[#C4601A] focus:ring-[#C4601A]"
                />
                <label htmlFor="chk-default-addr" className="text-xs font-semibold text-gray-600 select-none cursor-pointer">
                  Set as default shipping address
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="flex-1 border border-[#E8E0D5] py-3 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#C4601A] text-white py-3 rounded-xl text-xs font-bold hover:bg-[#a84e15] transition-colors cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standard Store Policies Modal */}
      <PolicyModal
        isOpen={!!activeModal}
        initialTab={activeModal || 'privacy'}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
};
