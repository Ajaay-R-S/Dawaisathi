'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('DawaiSaathi PWA ServiceWorker registered:', registration.scope);
          })
          .catch((error) => {
            console.warn('DawaiSaathi ServiceWorker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
