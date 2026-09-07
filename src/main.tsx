import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App.tsx';

function setCurrentDateFavicon(): void {
  const dateNumber = new Date().getDate();
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!favicon) return;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect x="6" y="6" width="52" height="52" rx="16" fill="#1F6B53"/>
    <line x1="16" y1="20" x2="48" y2="20" stroke="#FFFFFF" stroke-opacity=".25" stroke-width="2"/>
    <text x="32" y="44" text-anchor="middle" font-family="Manrope, Inter, sans-serif" font-size="26" font-weight="800" fill="#FFFFFF">${dateNumber}</text>
  </svg>`;

  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

setCurrentDateFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
