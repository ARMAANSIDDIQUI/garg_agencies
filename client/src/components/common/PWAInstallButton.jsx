import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

function PWAInstallButton({ className = "" }) {
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    const checkInstallable = () => {
      if (window.deferredPrompt && !window.matchMedia('(display-mode: standalone)').matches) {
        setInstallable(true);
      }
    };

    checkInstallable();

    const handleInstallable = () => {
      setInstallable(true);
    };

    const handleAppInstalled = () => {
      setInstallable(false);
      window.deferredPrompt = null;
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    window.deferredPrompt = null;
    setInstallable(false);
  };

  if (!installable) return null;

  return (
    <Button
      onClick={handleInstallClick}
      variant="outline"
      className={`flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50 hover:text-orange-700 ${className}`}
    >
      <Download className="w-4.5 h-4.5" />
      <span>Download App</span>
    </Button>
  );
}

export default PWAInstallButton;
