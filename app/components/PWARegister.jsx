'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available, prompt user to refresh
                    if (confirm('New version available! Refresh to update?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });

            // Update service worker when detected
            registration.update();
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      });

      // Handle online/offline status
      window.addEventListener('online', () => {
        console.log('Back online');
        // Trigger background sync if available
        if ('sync' in navigator.serviceWorker) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.sync.register('sync-cart').catch((err) => {
              console.error('Background sync registration failed:', err);
            });
          });
        }
      });

      window.addEventListener('offline', () => {
        console.log('Gone offline');
      });
    }

    // Handle app installation
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install prompt (optional)
      console.log('PWA install prompt available');
      
      // You can trigger this later with a custom UI
      // Example: showInstallPromotion();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      deferredPrompt = null;
    });
  }, []);

  return null;
}
