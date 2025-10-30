'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;

    if (isInstalled) {
      return;
    }

    // Check if user has dismissed the prompt before
    const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
    
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds on first visit
      if (!hasBeenDismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`User response to install prompt: ${outcome}`);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[101] animate-slide-up">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] to-[#c19a2e] rounded-lg flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Install Nandika Jewellers
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Install our app for a faster experience with offline access and exclusive features!
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-[#d4af37] text-white rounded-lg font-medium hover:bg-[#c19a2e] transition-colors duration-200 text-sm"
              >
                Install Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
