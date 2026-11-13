import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadCatalog } from './catalog-cache';

// Kick off catalog fetch immediately — races app bootstrap so the first
// view that needs it gets data instantly (or very close to it).
preloadCatalog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
