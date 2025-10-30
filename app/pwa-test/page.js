'use client';

import { useState, useEffect } from 'react';

export default function PWATestPage() {
  const [swStatus, setSwStatus] = useState('checking...');
  const [manifestStatus, setManifestStatus] = useState('checking...');
  const [cacheStatus, setCacheStatus] = useState('checking...');
  const [installable, setInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    checkPWAStatus();
  }, []);

  const checkPWAStatus = async () => {
    // Check Service Worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setSwStatus(`✅ Active (Scope: ${registration.scope})`);
        } else {
          setSwStatus('❌ Not registered');
        }
      } catch (error) {
        setSwStatus(`❌ Error: ${error.message}`);
      }
    } else {
      setSwStatus('❌ Not supported');
    }

    // Check Manifest
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        setManifestStatus(`✅ Loaded (${manifest.name})`);
      } else {
        setManifestStatus('❌ Failed to load');
      }
    } catch (error) {
      setManifestStatus(`❌ Error: ${error.message}`);
    }

    // Check Cache
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        setCacheStatus(`✅ ${cacheNames.length} cache(s): ${cacheNames.join(', ')}`);
      } catch (error) {
        setCacheStatus(`❌ Error: ${error.message}`);
      }
    } else {
      setCacheStatus('❌ Not supported');
    }

    // Check if installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        new Notification('Test Notification', {
          body: 'Notifications are now enabled!',
          icon: '/icons/icon-192x192.png',
        });
      }
    }
  };

  const clearCaches = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      alert('All caches cleared! Refresh the page.');
      setCacheStatus('✅ Cleared');
    }
  };

  const unregisterSW = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        alert('Service Worker unregistered! Refresh the page.');
        setSwStatus('❌ Not registered');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PWA Test Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Test and verify Progressive Web App functionality
          </p>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <StatusCard
              title="Service Worker"
              status={swStatus}
              description="Handles offline functionality and caching"
            />
            <StatusCard
              title="Web App Manifest"
              status={manifestStatus}
              description="Defines app metadata and appearance"
            />
            <StatusCard
              title="Cache Storage"
              status={cacheStatus}
              description="Stores assets for offline use"
            />
            <StatusCard
              title="Installation Status"
              status={isStandalone ? '✅ Installed' : '❌ Running in browser'}
              description="Whether app is installed on device"
            />
          </div>

          {/* Notification Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Push Notifications
            </h3>
            <p className="text-gray-700 mb-4">
              Status: <span className="font-mono">{notificationPermission}</span>
            </p>
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Permission
              </button>
            )}
            {notificationPermission === 'granted' && (
              <span className="text-green-600 font-semibold">✅ Enabled</span>
            )}
          </div>

          {/* Actions */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Developer Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={checkPWAStatus}
                className="px-4 py-2 bg-[#d4af37] text-white rounded-lg hover:bg-[#c19a2e] transition-colors"
              >
                Refresh Status
              </button>
              <button
                onClick={clearCaches}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Clear All Caches
              </button>
              <button
                onClick={unregisterSW}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Unregister Service Worker
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Testing Tips
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ Open Chrome DevTools → Application tab for detailed inspection</li>
              <li>✓ Test offline mode: Network tab → Set to "Offline"</li>
              <li>✓ Run Lighthouse audit for PWA score</li>
              <li>✓ Test on mobile device for install prompt</li>
              <li>✓ PWA requires HTTPS in production (localhost is exempt)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, status, description }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      <div className="font-mono text-sm bg-white p-3 rounded border border-gray-300">
        {status}
      </div>
    </div>
  );
}
