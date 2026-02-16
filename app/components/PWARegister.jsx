'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker after page load
      const registerSW = () => {
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
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }

      // Handle online/offline status
      window.addEventListener('online', () => {
        console.log('Back online');
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

    // NOTE: beforeinstallprompt is handled ONLY by InstallPrompt.jsx
    // Do NOT intercept it here — two handlers calling e.preventDefault()
    // will race and can prevent the install prompt from working.

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
    });
  }, []);

  return null;
}
