import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/use-pwa';
import { useToast } from '@/hooks/use-toast';
import { 
  Smartphone, 
  Download, 
  CheckCircle, 
  Zap,
  Shield,
  Wifi,
  Clock,
  Star,
  ArrowLeft,
  Share,
  Plus,
  Gift,
  Sparkles,
  Bug,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppInstallPage: React.FC = () => {
  const { 
    isInstallable, 
    isInstalled, 
    isIOS, 
    isAndroid, 
    isStandalone,
    installApp,
    deferredPrompt
  } = usePWA();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isWaitingForPrompt, setIsWaitingForPrompt] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isAutoInstalling, setIsAutoInstalling] = useState(false);
  
  // شمردن تعداد بازدیدهای این صفحه
  const visitCount = parseInt(localStorage.getItem('install-page-visits') || '0') + 1;
  localStorage.setItem('install-page-visits', visitCount.toString());
  
  // شمردن تعداد رفرش‌های خودکار
  const autoRefreshCount = parseInt(localStorage.getItem('install-auto-refresh-count') || '0');
  
  // Reset کردن شمارنده رفرش بعد از 10 دقیقه
  useEffect(() => {
    const lastRefreshTime = localStorage.getItem('install-last-refresh-time');
    const now = Date.now();
    
    if (lastRefreshTime) {
      const timeDiff = now - parseInt(lastRefreshTime);
      const tenMinutes = 10 * 60 * 1000; // 10 دقیقه به میلی‌ثانیه
      
      if (timeDiff > tenMinutes) {
        localStorage.removeItem('install-auto-refresh-count');
        localStorage.removeItem('install-last-refresh-time');
      }
    }
  }, []);

  // جمع‌آوری اطلاعات debug
  useEffect(() => {
    const collectDebugInfo = async () => {
      const info: any = {
        userAgent: navigator.userAgent,
        isAndroid,
        isIOS,
        isInstallable,
        isInstalled,
        isStandalone,
        hasDeferredPrompt: !!deferredPrompt,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        isHTTPS: location.protocol === 'https:',
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        timestamp: new Date().toISOString()
      };

      // بررسی service worker
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          info.serviceWorkerRegistrations = registrations.length;
          info.serviceWorkerActive = registrations.some(reg => reg.active);
        } catch (error) {
          info.serviceWorkerError = error.message;
        }
      }

      // بررسی manifest
      try {
        const manifestResponse = await fetch('/manifest.json');
        info.manifestAccessible = manifestResponse.ok;
        if (manifestResponse.ok) {
          const manifestData = await manifestResponse.json();
          info.manifestData = {
            name: manifestData.name,
            start_url: manifestData.start_url,
            display: manifestData.display,
            icons: manifestData.icons?.length || 0,
            theme_color: manifestData.theme_color,
            background_color: manifestData.background_color
          };
        }
      } catch (error) {
        info.manifestError = error.message;
      }

      // بررسی event log
      const pwaEventLog = localStorage.getItem('pwa-debug-event');
      if (pwaEventLog) {
        try {
          info.lastEventLog = JSON.parse(pwaEventLog);
        } catch (e) {
          info.lastEventLog = { error: 'Failed to parse event log' };
        }
      }

      setDebugInfo(info);
    };

    collectDebugInfo();
  }, [isAndroid, isIOS, isInstallable, isInstalled, isStandalone, deferredPrompt]);

  // اگر قبلاً نصب شده، به صفحه اصلی برگرد
  useEffect(() => {
    if (isInstalled || isStandalone) {
      navigate('/');
    }
  }, [isInstalled, isStandalone, navigate]);

  // پاک کردن localStorage های قدیمی مربوط به PWA
  useEffect(() => {
    localStorage.removeItem('should-auto-install');
    localStorage.removeItem('install-auto-refresh-count');
    localStorage.removeItem('install-last-refresh-time');
  }, []);

  // تلاش برای نصب خودکار وقتی صفحه لود می‌شود
  useEffect(() => {
    // فقط برای اندروید و اگر PWA prompt موجود باشد
    if (isAndroid && !isInstalled && !isStandalone) {
      console.log('Auto install check:', {
        isAndroid,
        isInstallable,
        isInstalled,
        isStandalone,
        deferredPrompt: !!deferredPrompt
      });
      
      // صبر بیشتر تا PWA prompt آماده شود
      const autoInstallTimer = setTimeout(async () => {
        // چک کن که PWA prompt واقعاً آماده باشد
        if (isInstallable && deferredPrompt && !isAutoInstalling) {
          try {
            setIsAutoInstalling(true);
            
            console.log('Starting automatic installation...');
            
            toast({
              title: "🚀 شروع نصب خودکار...",
              description: "اپ در حال اضافه شدن به صفحه اصلی",
              duration: 4000,
            });
            
            // صبر کمی بیشتر قبل از نمایش prompt
            await new Promise(resolve => setTimeout(resolve, 500));
            
            await installApp();
            
            toast({
              title: "🎉 نصب با موفقیت انجام شد!",
              description: "اکنون می‌توانید از آیکون روی صفحه اصلی استفاده کنید",
              variant: "default",
              duration: 5000,
            });
            
            // بعد از 3 ثانیه به صفحه اصلی برگرد
            setTimeout(() => {
              navigate('/');
            }, 3000);
          } catch (error) {
            console.error('Auto install on page load failed:', error);
            setIsAutoInstalling(false);
            
            // نمایش پیغام که نصب خودکار ناموفق بود
            toast({
              title: "⚠️ نصب خودکار ناموفق",
              description: "می‌توانید از دکمه نصب استفاده کنید",
              variant: "secondary",
              duration: 4000,
            });
          }
        } else {
          console.log('PWA prompt not ready for auto install', {
            isInstallable,
            hasDeferredPrompt: !!deferredPrompt,
            isAutoInstalling
          });
        }
      }, 1200); // 1.2 ثانیه صبر برای اطمینان از آماده بودن PWA
      
      return () => clearTimeout(autoInstallTimer);
    }
  }, [isAndroid, isInstallable, isInstalled, isStandalone, deferredPrompt, installApp, toast, navigate, isAutoInstalling]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // برای اندروید، اول تلاش کن خودکار نصب کنی
    if (isAndroid) {
      // اگر PWA prompt موجود است، استفاده کن
      if (isInstallable && deferredPrompt) {
        try {
          toast({
            title: "🚀 در حال نصب...",
            description: "لطفاً منتظر باشید، Shortcut اضافه می‌شود",
            duration: 3000,
          });
          
          await installApp();
          
          toast({
            title: "🎉 نصب موفق بود!",
            description: "Mr Trader Academy به صفحه اصلی گوشی شما اضافه شد",
            variant: "default",
            duration: 5000,
          });
          
          // بعد از 2 ثانیه به صفحه اصلی برگرد
          setTimeout(() => {
            navigate('/');
          }, 2000);
          return;
        } catch (error) {
          console.error('Auto install failed:', error);
          
          toast({
            title: "⚠️ نصب خودکار ناموفق",
            description: "لطفاً راهنمای زیر را دنبال کنید",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
      
      // اگر خودکار نشد، راهنمای دستی نمایش بده
      toast({
        title: "📱 راهنمای نصب دستی",
        description: "1️⃣ منوی Chrome یا مرورگر (⋮) را باز کنید\n2️⃣ 'Add to Home screen' یا 'افزودن به صفحه اصلی' را بزنید\n3️⃣ روی 'Add' یا 'افزودن' کلیک کنید",
        duration: 12000,
      });
      
      // نمایش راهنمای بصری
      setTimeout(() => {
        toast({
          title: "🔍 نمی‌تونید پیدا کنید؟",
          description: "در Chrome: منو (3 نقطه بالا راست) ← Install app یا Add to Home screen",
          duration: 8000,
        });
      }, 5000);
      
      // بعد از 8 ثانیه به صفحه اصلی برگرد
      setTimeout(() => {
        navigate('/');
      }, 8000);
    } else {
      // برای سایر حالات، راهنمای عمومی
      toast({
        title: "📱 نصب Shortcut",
        description: "از منوی مرورگر خود 'Add to Home Screen' یا 'افزودن به صفحه اصلی' را انتخاب کنید",
        duration: 8000,
      });
      
      setTimeout(() => {
        navigate('/');
      }, 4000);
    }
  };

  const handleSkip = () => {
    // شمردن تعداد skip ها
    const skipCount = parseInt(localStorage.getItem('app-install-skip-count') || '0') + 1;
    localStorage.setItem('app-install-skip-count', skipCount.toString());
    localStorage.setItem('app-install-skipped', Date.now().toString());
    
    // اگر بیشتر از 2 بار skip کرده، یه پیغام قوی‌تر نشون بده
    if (skipCount >= 3) {
      toast({
        title: "😢 واقعاً نمی‌خوای نصب کنی؟",
        description: "با نصب اپ، سرعت و تجربه کاربری خیلی بهتر میشه!",
        duration: 4000,
      });
    } else if (skipCount === 2) {
      toast({
        title: "🤔 یکبار دیگه فکر کن!",
        description: "نصب اپ فقط 10 ثانیه طول می‌کشه",
        duration: 3000,
      });
    }
    
    navigate('/');
  };

  const benefits = [
    {
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      title: "دسترسی فوری",
      description: "یک کلیک از صفحه اصلی گوشی، مستقیماً وارد سایت شوید"
    },
    {
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      title: "آیکون اختصاصی",
      description: "آیکون زیبا و حرفه‌ای در صفحه اصلی گوشی شما"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "امنیت بالا",
      description: "اطلاعات شما با بالاترین استانداردهای امنیتی محافظت می‌شود"
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: "نصب آسان",
      description: "فقط 10 ثانیه طول می‌کشد و هیچ فضای اضافی اشغال نمی‌کند"
    }
  ];

  const iosSteps = [
    {
      step: 1,
      icon: <Share className="w-5 h-5 text-blue-500" />,
      title: "دکمه Share را بزنید",
      description: "در پایین صفحه Safari روی آیکون اشتراک‌گذاری ضربه بزنید"
    },
    {
      step: 2,
      icon: <Plus className="w-5 h-5 text-blue-500" />,
      title: "Add to Home Screen",
      description: "از لیست گزینه‌ها، 'Add to Home Screen' را انتخاب کنید"
    },
    {
      step: 3,
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Add را بزنید",
      description: "نام اپ را تأیید کرده و روی 'Add' ضربه بزنید"
    }
  ];

  if (showIOSGuide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-10 w-10 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  نصب Mr Trader Academy
                </h1>
                <p className="text-gray-600">
                  در iOS، این مراحل را دنبال کنید
                </p>
              </div>

              {/* iOS Steps */}
              <div className="space-y-6 mb-8">
                {iosSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="bg-blue-50 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.step}. {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Guide */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse">
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <Share className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <Plus className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="bg-white rounded-lg p-2 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                >
                  متوجه شدم، ادامه می‌دهم
                </Button>
                {/* <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700"
                >
                  فعلاً رد کن
                </Button> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-trader-50 to-blue-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-trader-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              {/* Skip Button */}
              <div className="flex justify-between items-center mb-6">
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  رد کن
                </Button>
                <Badge variant="outline" className="bg-trader-50 text-trader-600 border-trader-200">
                  <Gift className="w-3 h-3 ml-1" />
                  رایگان
                </Badge>
              </div>



              {/* Auto Install Indicator */}
              {isAutoInstalling && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-center">
                                           <p className="font-semibold text-green-800">🚀 نصب خودکار در حال انجام</p>
                     <p className="text-sm text-green-600">اپ خودکار نصب می‌شود...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Hero Section */}
              <div className="text-center mb-8">
                <div className="bg-trader-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 relative">
                  <Smartphone className="h-12 w-12 text-trader-600" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {visitCount >= 3 
                    ? "دوباره برگشتی! 😊" 
                    : visitCount === 2 
                    ? "خوشحالیم که برگشتی! 🎉"
                    : "Mr Trader Academy را نصب کنید"
                  }
                </h1>
                
                <p className="text-lg text-gray-600 leading-relaxed mb-4">
                  {visitCount >= 3 
                    ? "به نظر واقعاً علاقه‌مندی! بیا این بار shortcut بسازیم 💪"
                    : visitCount === 2 
                    ? "این بار واقعاً ارزششو داره که shortcut بسازی!"
                    : "دسترسی سریع به آموزش‌های تریدینگ، مستقیماً از صفحه اصلی گوشی"
                  }
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span>4.9 امتیاز</span>
                  <span>•</span>
                  <span>+۱۰,۰۰۰ دانشجو</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="bg-white rounded-lg p-2 shadow-sm">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="space-y-4">
                {/* Primary Install Button */}
                <Button
                  onClick={handleInstall}
                  disabled={isAutoInstalling}
                  className="w-full bg-gradient-to-r from-trader-500 to-trader-600 hover:from-trader-600 hover:to-trader-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isAutoInstalling ? (
                    <>
                      <Zap className="w-5 h-5 ml-2 animate-spin" />
                      در حال نصب خودکار...
                    </>
                  ) : isIOS ? (
                    <>
                      <Share className="w-5 h-5 ml-2" />
                      راهنمای نصب در iOS
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 ml-2" />
                      افزودن به صفحه اصلی
                    </>
                  )}
                </Button>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <span className="text-xs font-medium text-green-700">نصب آسان</span>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <span className="text-xs font-medium text-blue-700">کاملاً امن</span>
                  </div>
                </div>



                {/* Secondary Skip Button */}
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
                >
                  فعلاً از نسخه وب استفاده می‌کنم
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="text-center mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  🔒 امن • 🚀 سریع • 📱 بهینه برای موبایل
                </p>
              </div>

              {/* Debug Button (only for Android) */}
              {isAndroid && !isInstallable && (
                <div className="mt-4">
                  <Button
                    onClick={() => setShowDebugInfo(!showDebugInfo)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-gray-400 hover:text-gray-600"
                  >
                    <Bug className="w-3 h-3 ml-1" />
                    {showDebugInfo ? 'مخفی کردن اطلاعات فنی' : 'نمایش اطلاعات فنی'}
                  </Button>
                </div>
              )}

              {/* Debug Info */}
              {showDebugInfo && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Info className="w-3 h-3 ml-1" />
                    اطلاعات فنی
                  </h4>
                  <div className="space-y-1 text-gray-600">
                    <div>اندروید: {debugInfo.isAndroid ? '✅' : '❌'}</div>
                    <div>قابل نصب: {debugInfo.isInstallable ? '✅' : '❌'}</div>
                    <div>نصب شده: {debugInfo.isInstalled ? '✅' : '❌'}</div>
                    <div>حالت Standalone: {debugInfo.isStandalone ? '✅' : '❌'}</div>
                    <div>Deferred Prompt: {debugInfo.hasDeferredPrompt ? '✅' : '❌'}</div>
                    <div>Service Worker: {debugInfo.hasServiceWorker ? '✅' : '❌'}</div>
                    <div>SW فعال: {debugInfo.serviceWorkerActive ? '✅' : '❌'}</div>
                    <div>Manifest: {debugInfo.hasManifest ? '✅' : '❌'}</div>
                    <div>Manifest قابل دسترس: {debugInfo.manifestAccessible ? '✅' : '❌'}</div>
                    <div>HTTPS: {debugInfo.isHTTPS ? '✅' : '❌'}</div>
                    <div>حالت نمایش: {debugInfo.displayMode}</div>
                    {debugInfo.manifestData && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div>نام اپ: {debugInfo.manifestData.name}</div>
                        <div>Start URL: {debugInfo.manifestData.start_url}</div>
                        <div>نوع نمایش: {debugInfo.manifestData.display}</div>
                        <div>تعداد آیکون: {debugInfo.manifestData.icons}</div>
                        <div>رنگ تم: {debugInfo.manifestData.theme_color}</div>
                        <div>رنگ پس‌زمینه: {debugInfo.manifestData.background_color}</div>
                      </div>
                    )}
                    {debugInfo.lastEventLog && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="text-green-700 font-semibold">آخرین رویداد نصب:</div>
                        <div>زمان: {debugInfo.lastEventLog.timestamp}</div>
                        <div>Platforms: {debugInfo.lastEventLog.platforms?.join(', ') || 'N/A'}</div>
                        <div>User Agent: {debugInfo.lastEventLog.userAgent}</div>
                      </div>
                    )}
                    {(debugInfo.serviceWorkerError || debugInfo.manifestError) && (
                      <div className="mt-2 pt-2 border-t border-red-200 text-red-600">
                        {debugInfo.serviceWorkerError && <div>خطای SW: {debugInfo.serviceWorkerError}</div>}
                        {debugInfo.manifestError && <div>خطای Manifest: {debugInfo.manifestError}</div>}
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs">
                      User Agent: {debugInfo.userAgent?.substring(0, 100)}...
                    </div>
                  </div>
                  
                  {!debugInfo.isInstallable && (
                    <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800">
                      <strong>توضیح:</strong> برای نصب PWA در اندروید نیاز به این شرایط است:
                      <ul className="list-disc list-inside mt-1 text-xs">
                        <li>Service Worker فعال</li>
                        <li>Manifest.json معتبر</li>
                        <li>HTTPS</li>
                        <li>آیکون‌های 192x192 و 512x512</li>
                        <li>رویداد beforeinstallprompt</li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppInstallPage; 