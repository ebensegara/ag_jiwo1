'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 3 seconds if not dismissed
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
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
    
    if (outcome === 'accepted') {
      console.log('PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-bottom-5">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-[#756657] rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Install Jiwo.AI
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Akses lebih cepat dengan install aplikasi di perangkat Anda
          </p>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-[#756657] hover:bg-[#756657]/90"
            >
              Install
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              Nanti
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
