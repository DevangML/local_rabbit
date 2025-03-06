import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with improved error handling and reload behavior
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    if (import.meta.env.DEV) {
      console.log('SW registered in dev mode:', registration);
    }
  },
  onRegisterError(error) {
    console.error('SW registration failed:', error);
  }
});

// Add error event listener for module loading issues
window.addEventListener('error', (event) => {
  if (event.message.includes('Failed to load module script')) {
    console.warn('Module loading error detected, attempting reload...');
    window.location.reload();
  }
});

// Get the initial state that was injected by the server
declare global {
  interface Window {
    __INITIAL_STATE__?: {
      url: string;
      env: string;
    };
  }
}

const initialState = window.__INITIAL_STATE__;

hydrateRoot(
  document.getElementById('root') as HTMLElement,
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Remove the server-injected state after hydration
if (window.__INITIAL_STATE__) {
  delete window.__INITIAL_STATE__;
} 