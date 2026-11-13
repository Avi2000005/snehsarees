import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCatalog, getCatalog } from './catalog-cache';

// 1. Kick off catalog fetch immediately — races app bootstrap so data is hot on first paint.
preloadCatalog();

// 2. Navigation API: Hold the browser's native loading indicator for SPA route changes
// until the catalog data is completely ready.
if (typeof window !== 'undefined' && 'navigation' in window) {
  // @ts-ignore
  window.navigation.addEventListener('navigate', (event: any) => {
    if (!event.canIntercept || event.downloadRequest || event.formData) return;
    try {
      const url = new URL(event.destination.url);
      if (url.origin !== window.location.origin) return;

      event.intercept({
        handler: async () => {
          await getCatalog();
        }
      });
    } catch {
      // Ignore URL parsing errors
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
