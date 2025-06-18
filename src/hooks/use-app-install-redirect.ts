import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePWA } from './use-pwa';

interface UseAppInstallRedirectOptions {
  // آیا redirect فعال باشه؟
  enabled?: boolean;
  // تعداد بازدیدها که بعدش redirect بشه
  visitThreshold?: number;
  // مسیرهایی که redirect نمی‌شه
  excludePaths?: string[];
  // تاخیر قبل از redirect (میلی‌ثانیه)
  delay?: number;
}

export const useAppInstallRedirect = (options: UseAppInstallRedirectOptions = {}) => {
  const {
    enabled = true,
    visitThreshold = 2,
    excludePaths = ['/install', '/login', '/test/', '/debug/'],
    delay = 5000
  } = options;

  const { isInstalled, isStandalone, isIOS, isAndroid, canShowPrompt } = usePWA();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // اگر redirect غیرفعال باشه، کاری نکن
    if (!enabled) return;

    // اگر اپ نصب شده، کاری نکن
    if (isInstalled || isStandalone) return;

    // اگر موبایل نیست، کاری نکن
    if (!isIOS && !isAndroid) return;

    // اگر مسیر فعلی در لیست استثناها باشه، کاری نکن
    const currentPath = location.pathname;
    const shouldExclude = excludePaths.some(path => 
      path.endsWith('/') ? currentPath.startsWith(path) : currentPath === path
    );
    
    if (shouldExclude) return;

    // چک کردن localStorage
    const hasSkipped = localStorage.getItem('app-install-skipped');
    const visitCount = parseInt(localStorage.getItem('app-visit-count') || '0');
    const lastRedirectTime = localStorage.getItem('last-install-redirect');
    
    // اگر کاربر skip کرده و کمتر از 24 ساعت گذشته، کاری نکن
    if (hasSkipped) {
      const skipTime = parseInt(hasSkipped);
      const now = Date.now();
      const hoursPassed = (now - skipTime) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) return;
      
      // اگر 24 ساعت گذشته، skip flag رو پاک کن
      localStorage.removeItem('app-install-skipped');
    }

    // اگر در آخرین 2 ساعت redirect شده، دوباره نکن
    if (lastRedirectTime) {
      const lastTime = parseInt(lastRedirectTime);
      const now = Date.now();
      const hoursPassed = (now - lastTime) / (1000 * 60 * 60);
      
      if (hoursPassed < 2) return;
    }

    // افزایش تعداد بازدیدها
    const newVisitCount = visitCount + 1;
    localStorage.setItem('app-visit-count', newVisitCount.toString());

    // اگر تعداد بازدیدها کافی نیست، کاری نکن
    if (newVisitCount < visitThreshold) return;

    // redirect با تاخیر - اما اول چک کن که PWA prompt آماده باشه
    const timer = setTimeout(() => {
      // یکبار دیگه چک کن که هنوز شرایط برقرار باشه
      const currentSkipped = localStorage.getItem('app-install-skipped');
      if (currentSkipped) return;

      // اگر اندروید است و PWA prompt آماده نیست، کمی بیشتر صبر کن
      if (isAndroid && !canShowPrompt) {
        // یک تایمر دیگه برای 3 ثانیه بعد
        const secondTimer = setTimeout(() => {
          const stillSkipped = localStorage.getItem('app-install-skipped');
          if (stillSkipped) return;
          
          // ذخیره زمان redirect
          localStorage.setItem('last-install-redirect', Date.now().toString());
          
          // انتقال به صفحه نصب
          navigate('/install');
        }, 3000);
        
        return () => clearTimeout(secondTimer);
      }

      // ذخیره زمان redirect
      localStorage.setItem('last-install-redirect', Date.now().toString());
      
      // انتقال به صفحه نصب
      navigate('/install');
    }, delay);

    return () => clearTimeout(timer);
  }, [
    enabled,
    visitThreshold,
    excludePaths,
    delay,
    isInstalled,
    isStandalone,
    isIOS,
    isAndroid,
    location.pathname,
    navigate
  ]);

  // تابع برای reset کردن شمارنده‌ها (برای تست)
  const resetCounters = () => {
    localStorage.removeItem('app-visit-count');
    localStorage.removeItem('app-install-skipped');
    localStorage.removeItem('last-install-redirect');
  };

  // تابع برای force redirect
  const forceRedirect = () => {
    navigate('/install');
  };

  return {
    resetCounters,
    forceRedirect,
    visitCount: parseInt(localStorage.getItem('app-visit-count') || '0'),
    hasSkipped: !!localStorage.getItem('app-install-skipped'),
    canRedirect: enabled && !isInstalled && !isStandalone && (isIOS || isAndroid)
  };
}; 