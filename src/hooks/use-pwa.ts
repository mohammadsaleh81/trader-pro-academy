import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInfo {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  deferredPrompt: BeforeInstallPromptEvent | null;
  installApp: () => Promise<void>;
  canShowPrompt: boolean;
}

export const usePWA = (): PWAInfo => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // تشخیص نوع دستگاه با try-catch
  let isIOS = false;
  let isAndroid = false;
  let isStandalone = false;
  
  try {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      isIOS = /iphone|ipad|ipod/.test(userAgent);
      isAndroid = /android/.test(userAgent);
      
      // تشخیص حالت standalone
      isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true ||
                     // Check for Chrome custom tabs (Android)
                     window.matchMedia('(display-mode: fullscreen)').matches;
    }
  } catch (error) {
    console.error('Error detecting device type:', error);
  }

  // آیا می‌توان پاپ‌آپ را نشان داد
  const canShowPrompt = (isIOS || isAndroid) && !isStandalone && !isInstalled;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // چک کردن اینکه آیا PWA نصب شده
      setIsInstalled(isStandalone);

      // Event listener برای beforeinstallprompt
      const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
        console.log('beforeinstallprompt event detected in hook', {
          platforms: e.platforms,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
        
        // جلوگیری از نمایش خودکار prompt
        e.preventDefault();
        
        // ذخیره event برای استفاده بعدی
        setDeferredPrompt(e);
        setIsInstallable(true);
        
        // Log to localStorage for debugging
        localStorage.setItem('pwa-debug-event', JSON.stringify({
          timestamp: new Date().toISOString(),
          platforms: e.platforms,
          userAgent: navigator.userAgent.substring(0, 100)
        }));
        
        // Dispatch custom event برای اطلاع سایر کامپوننت‌ها
        window.dispatchEvent(new CustomEvent('pwa-installable', { 
          detail: { deferredPrompt: e } 
        }));
      };

      // Event listener برای appinstalled
      const handleAppInstalled = () => {
        console.log('PWA was installed successfully');
        setIsInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
        
        // Clear localStorage
        localStorage.removeItem('pwa-debug-event');
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('pwa-installed'));
      };

      // Add event listeners
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    } catch (error) {
      console.error('Error setting up PWA event listeners:', error);
    }
  }, [isStandalone]);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      const errorMessage = 'Install prompt is not available. Make sure the site meets PWA requirements and is accessed through a supported browser.';
      console.warn(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      console.log('Attempting to show install prompt...');
      
      // نمایش prompt
      await deferredPrompt.prompt();
      
      // انتظار برای انتخاب کاربر
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('User choice outcome:', outcome);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // setIsInstalled(true) will be handled by appinstalled event
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // پاک کردن prompt بعد از استفاده
      setDeferredPrompt(null);
      setIsInstallable(false);
      
    } catch (error) {
      console.error('Error during app installation:', error);
      throw new Error(`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    isAndroid,
    isStandalone,
    deferredPrompt,
    installApp,
    canShowPrompt
  };
}; 