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
      // Prevent Chrome's default mini-infobar
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      console.log('beforeinstallprompt event captured');
      
      // Show our custom prompt after a short delay on first visit
      if (!hasBeenDismissed) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    const onInstalled = () => {
      console.log('PWA was installed');
      setDeferredPrompt(null);
      setShowPrompt(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.warn('No deferred prompt available');
      return;
    }

    try {
      // Show the browser's install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      
      // Clear the prompt regardless of outcome — it can only be used once
      setDeferredPrompt(null);
      setShowPrompt(false);
      
      if (outcome === 'dismissed') {
        // User dismissed, remember so we don't pester them
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }
    } catch (error) {
      console.error('Install prompt error:', error);
      // Clear prompt on error as well — stale prompts can't be reused
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
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
      <div className="bg-white dark:bg-[#0A0A0A] rounded-lg shadow-2xl dark:shadow-none border border-gray-200 dark:border-white/[0.06] p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Install Nandika Jewellers
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm font-medium"
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
