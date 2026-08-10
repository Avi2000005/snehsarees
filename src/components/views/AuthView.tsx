import React, { useState } from 'react';
import { ActivePage, UserProfile } from '../../types';
import { ArrowLeft, Mail, Lock, User, LogIn, UserPlus, Home, Eye, EyeOff, RefreshCw, ShieldCheck, KeyRound } from 'lucide-react';
import { API_URL } from '../../config';

interface AuthViewProps {
  onNavigate: (page: ActivePage) => void;
  onBack: () => void;
  onLoginSuccess: (token: string, user: UserProfile) => void;
  showToast: (msg: string) => void;
  redirectTo?: ActivePage;
  initialMode?: AuthMode;
}

type AuthMode =
  | 'login'           // Email + password
  | 'register-email'  // Enter email → send OTP
  | 'register-otp'    // Enter OTP + name + password
  | 'forgot-email'    // Enter email for reset
  | 'forgot-otp';     // Enter OTP + new password

export const AuthView: React.FC<AuthViewProps> = ({
  onNavigate,
  onBack,
  onLoginSuccess,
  showToast,
  redirectTo,
  initialMode,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode || 'login');

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Resend cooldown timer ─────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(iv); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ── API helper ─────────────────────────────────────────────────────
  const apiCall = async (path: string, body: object) => {
    const res = await fetch(`${API_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // ── LOGIN ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return showToast('Please fill in all fields.');
    setLoading(true);
    try {
      const data = await apiCall('login', { email, password });
      localStorage.setItem('laxmi_user_token', data.token);
      showToast(`Welcome back, ${data.user.name}! 🎉`);
      onLoginSuccess(data.token, data.user);
      onNavigate(redirectTo || 'home');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER: Send OTP ─────────────────────────────────────────────
  const handleSendRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Please enter a valid email address.');
    setLoading(true);
    try {
      await apiCall('send-otp', { email });
      setOtpSent(true);
      setMode('register-otp');
      startResendCooldown();
      showToast('OTP sent to your email! Check your inbox.');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER: Resend OTP ───────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const path = mode === 'register-otp' ? 'send-otp' : 'forgot-password';
      await apiCall(path, { email });
      startResendCooldown();
      showToast('New OTP sent to your email!');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER: Verify OTP + Create Account ──────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !name || !password || !confirmPassword) return showToast('Please fill in all fields.');
    if (password !== confirmPassword) return showToast('Passwords do not match.');
    if (password.length < 6) return showToast('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const data = await apiCall('register', { email, otp, password, name });
      localStorage.setItem('laxmi_user_token', data.token);
      showToast(`Account created! Welcome, ${data.user.name} 🎉`);
      onLoginSuccess(data.token, data.user);
      onNavigate(redirectTo || 'home');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD: Send OTP ──────────────────────────────────────
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return showToast('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast('Please enter a valid email address.');
    setLoading(true);
    try {
      await apiCall('forgot-password', { email });
      setMode('forgot-otp');
      startResendCooldown();
      showToast('Password reset OTP sent to your email!');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('register')) {
        showToast('No account found with this email. Please register first.');
      } else {
        showToast(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── FORGOT PASSWORD: Reset with OTP ───────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmNewPassword) return showToast('Please fill in all fields.');
    if (newPassword !== confirmNewPassword) return showToast('Passwords do not match.');
    if (newPassword.length < 6) return showToast('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await apiCall('reset-password', { email, otp, newPassword });
      showToast('Password reset successfully! Please login.');
      setOtp(''); setNewPassword(''); setConfirmNewPassword('');
      setMode('login');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived UI values ──────────────────────────────────────────────
  const headerTitle = {
    login: 'Sign In',
    'register-email': 'Create Account',
    'register-otp': 'Verify Email',
    'forgot-email': 'Forgot Password',
    'forgot-otp': 'Reset Password',
  }[mode];

  const isRegisterMode = mode === 'register-email' || mode === 'register-otp';
  const isLoginMode = mode === 'login';

  return (
    <div className="bg-[#FAF6F0] min-h-screen">
      {/* Top navigation bar */}
      <div className="fixed top-0 left-0 right-0 h-[56px] md:h-[64px] bg-white border-b border-[#E8E0D5] flex items-center px-4 z-50 shadow-xs max-w-[430px] md:max-w-full mx-auto">
        <button
          onClick={mode === 'login' || mode === 'register-email' ? onBack : () => setMode(mode === 'register-otp' ? 'register-email' : mode === 'forgot-otp' ? 'forgot-email' : 'login')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A1A]" />
        </button>
        <span className="font-serif text-lg md:text-xl font-bold text-[#C4601A] ml-2 flex-1">
          {headerTitle}
        </span>
        <button
          onClick={() => onNavigate('home')}
          className="w-10 h-10 rounded-full flex items-center justify-center active:bg-[#F0E8DC] transition-colors cursor-pointer shrink-0"
          title="Return to Home"
        >
          <Home className="w-5 h-5 text-[#1A1A1A]" />
        </button>
      </div>

      <div className="pt-[76px] md:pt-[84px] pb-[80px] px-4 max-w-[420px] mx-auto relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#C4601A] to-[#E8920E] flex items-center justify-center shadow-lg">
            {mode === 'forgot-email' || mode === 'forgot-otp' ? (
              <KeyRound className="w-8 h-8 text-white" />
            ) : mode === 'register-otp' ? (
              <ShieldCheck className="w-8 h-8 text-white" />
            ) : (
              <span className="text-white font-serif font-bold text-xl">SS</span>
            )}
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#C4601A] tracking-wide mb-1">Sneh Sarees</h2>
          <p className="text-xs text-[#222222] font-semibold">Premium Handloom Silks & Bridal Swatches</p>
        </div>

        {/* Login / Register Tab Switcher — only on login/register-email */}
        {(isLoginMode || mode === 'register-email') && (
          <div className="flex bg-white border border-[#E8E0D5] rounded-full p-1 mb-6 shadow-2xs">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isLoginMode ? 'bg-[#C4601A] text-white shadow-sm' : 'text-[#333333] hover:text-[#C4601A]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register-email')}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isRegisterMode ? 'bg-[#C4601A] text-white shadow-sm' : 'text-[#333333] hover:text-[#C4601A]'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 p-1 text-[#888888] hover:text-[#C4601A] transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot-email'); setPassword(''); }}
                  className="text-[11px] font-semibold text-[#C4601A] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#a84e15] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Signing in...</span>
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── REGISTER STEP 1: Enter Email ── */}
        {mode === 'register-email' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            <p className="text-xs text-[#666] mb-5 leading-relaxed">
              Enter your email address and we'll send a one-time verification code to confirm it's really you.
            </p>
            <form onSubmit={handleSendRegisterOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <button
                id="register-send-otp"
                type="submit"
                disabled={loading}
                className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#a84e15] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...</span>
                ) : (
                  <><Mail className="w-4 h-4" /> Send Verification OTP</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── REGISTER STEP 2: Verify OTP + Fill Details ── */}
        {mode === 'register-otp' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            {/* OTP sent banner */}
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3 mb-5">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-green-700">OTP sent!</p>
                <p className="text-[11px] text-green-600">Check your inbox at <span className="font-semibold">{email}</span></p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              {/* OTP */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  6-Digit OTP
                </label>
                <input
                  id="register-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 px-4 text-center text-xl font-bold tracking-[0.4em] focus:outline-none focus:border-[#C4601A] transition-colors"
                  required
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-[10px] text-[#999]">Valid for 10 minutes</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-[11px] font-semibold text-[#C4601A] hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 p-1 text-[#888888] hover:text-[#C4601A] cursor-pointer" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#a84e15] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Creating account...</span>
                ) : (
                  <><UserPlus className="w-4 h-4" /> Create Account</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── FORGOT PASSWORD STEP 1: Enter Email ── */}
        {mode === 'forgot-email' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            <p className="text-xs text-[#666] mb-5 leading-relaxed">
              Enter the email address linked to your account. We'll send a verification code to reset your password.
            </p>
            <form onSubmit={handleSendForgotOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                id="forgot-send-otp"
                type="submit"
                disabled={loading}
                className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#a84e15] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Sending OTP...</span>
                ) : (
                  <><KeyRound className="w-4 h-4" /> Send Reset OTP</>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[11px] text-[#888] hover:text-[#C4601A] font-semibold cursor-pointer hover:underline"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── FORGOT PASSWORD STEP 2: OTP + New Password ── */}
        {mode === 'forgot-otp' && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3 mb-5">
              <KeyRound className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-blue-700">Reset OTP sent!</p>
                <p className="text-[11px] text-blue-600">Check your inbox at <span className="font-semibold">{email}</span></p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  6-Digit OTP
                </label>
                <input
                  id="reset-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 px-4 text-center text-xl font-bold tracking-[0.4em] focus:outline-none focus:border-[#C4601A] transition-colors"
                  required
                />
                <div className="flex justify-between items-center mt-1.5">
                  <p className="text-[10px] text-[#999]">Valid for 10 minutes</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || loading}
                    className="text-[11px] font-semibold text-[#C4601A] hover:underline cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="reset-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-11 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 p-1 text-[#888888] hover:text-[#C4601A] cursor-pointer" tabIndex={-1}>
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#888888]" />
                  <input
                    id="reset-confirm-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-[#FAF6F0] border border-[#E8E0D5] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-[#C4601A] transition-colors"
                    required
                  />
                </div>
              </div>

              <button
                id="reset-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-[#C4601A] text-white py-3.5 rounded-xl text-xs font-bold hover:bg-[#a84e15] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Resetting...</span>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> Reset Password</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Bottom switch hint */}
        {isLoginMode && (
          <p className="text-center text-[11px] text-[#999] mt-5">
            Don't have an account?{' '}
            <button onClick={() => setMode('register-email')} className="text-[#C4601A] font-bold hover:underline cursor-pointer">
              Register here
            </button>
          </p>
        )}
        {isRegisterMode && (
          <p className="text-center text-[11px] text-[#999] mt-5">
            Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-[#C4601A] font-bold hover:underline cursor-pointer">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
};
