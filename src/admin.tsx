import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import './index.css';

function AdminApp() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  return (
    <div className="relative font-sans antialiased text-[#1A1A1A] w-full bg-ivory min-h-screen">
      <AdminDashboardView
        onNavigate={() => {}}
        onBack={() => {}}
        showToast={showToast}
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
