import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import './index.css';

function AdminApp() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  useEffect(() => {
    // Only users logged in as info@snehsarees.in may access admin.html
    const token =
      sessionStorage.getItem('laxmi_admin_token') ||
      localStorage.getItem('sneh_user_token') ||
      localStorage.getItem('laxmi_user_token');

    if (!token) {
      // Unauthenticated visitor -> redirect immediately to main store
      window.location.replace('/');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isStoreOwner =
        payload.role === 'admin' ||
        payload.email?.toLowerCase() === 'info@snehsarees.in';

      if (isStoreOwner) {
        setAuthToken(token);
        setIsAuthorized(true);
      } else {
        // Logged in as regular customer -> redirect immediately to main store
        window.location.replace('/');
      }
    } catch {
      window.location.replace('/');
    }
  }, []);

  // Show neutral loading spinner while verifying authorization
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#C4601A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authorized -> will be redirected by useEffect
  if (!isAuthorized || !authToken) {
    return null;
  }

  return (
    <div className="relative font-sans antialiased text-[#1A1A1A] w-full bg-ivory min-h-screen">
      <AdminDashboardView
        onNavigate={() => { window.location.href = '/'; }}
        onBack={() => { window.location.href = '/'; }}
        showToast={showToast}
        adminToken={authToken}
      />

      {toastMsg && (
        <div
          id="toast"
          className="toast fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white py-3 px-6 rounded-full text-xs font-semibold z-[300] pointer-events-none transition-all duration-300 opacity-100 shadow-xl"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
