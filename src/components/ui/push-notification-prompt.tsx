import React, { useState, useEffect } from 'react';
import { Bell, X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useToast } from '@/hooks/use-toast';

// Helper function برای تشخیص iOS
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// Helper function برای تشخیص Safari
const isSafari = () => {
  return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
};

const PushNotificationPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isSupported, permission, requestPermission, subscribe } = usePushNotifications();
  const { toast } = useToast();

  const isIOSDevice = isIOS();
  const isSafariBrowser = isSafari();

  useEffect(() => {
    // شرایط نمایش prompt:
    const shouldShowPrompt = () => {
      // برای iOS: همیشه راهنمای PWA نمایش بده
      if (isIOSDevice) {
        const hasSeenIOSGuide = localStorage.getItem('ios-pwa-guide-seen');
        return !hasSeenIOSGuide;
      }
      
      // برای سایر دستگاه‌ها: چک معمولی
      if (!isSupported) return false;
      if (permission !== 'default') return false;
      
      const hasSeenPrompt = localStorage.getItem('push-permission-prompted');
      const hasDeclined = localStorage.getItem('push-permission-declined');
      
      if (hasSeenPrompt || hasDeclined) return false;
      
      return true;
    };

    // با تاخیر 3 ثانیه prompt را نمایش بده
    const timer = setTimeout(() => {
      if (shouldShowPrompt()) {
        if (isIOSDevice) {
          setShowIOSGuide(true);
        } else {
          setShowPrompt(true);
          localStorage.setItem('push-permission-prompted', 'true');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, permission, isIOSDevice]);

  const handleAllow = async () => {
    try {
      const permissionGranted = await requestPermission();
      
      if (permissionGranted) {
        // اگر مجوز داده شد، بلافاصله اشتراک کن
        const subscribed = await subscribe();
        
        if (subscribed) {
          toast({
            title: "✅ اعلان‌ها فعال شد",
            description: "از این پس اعلان‌های مهم را دریافت خواهید کرد.",
          });
        }
      }
    } catch (error) {
      console.error('خطا در فعال‌سازی اعلان‌ها:', error);
      toast({
        title: "❌ خطا در فعال‌سازی",
        description: "لطفاً دوباره تلاش کنید.",
        variant: "destructive",
      });
    }
    
    setShowPrompt(false);
  };

  const handleDecline = () => {
    localStorage.setItem('push-permission-declined', 'true');
    setShowPrompt(false);
    
    toast({
      title: "🔕 اعلان‌ها غیرفعال",
      description: "می‌تونید از تنظیمات دوباره فعالشون کنید.",
    });
  };

  const handleIOSGuideClose = () => {
    localStorage.setItem('ios-pwa-guide-seen', 'true');
    setShowIOSGuide(false);
    
    toast({
      title: "📱 راهنمای iOS",
      description: "برای بهترین تجربه، اپ را به Home Screen اضافه کنید.",
    });
  };

  // راهنمای خاص iOS
  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6 relative animate-in slide-in-from-bottom-4 duration-300">
          {/* Close button */}
          <button
            onClick={handleIOSGuideClose}
            className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>

          {/* iOS Icon */}
          <div className="text-center mb-4">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              نصب Mr Trader Academy
            </h3>
            <p className="text-gray-600 leading-relaxed">
              برای بهترین تجربه در iOS، اپ رو به Home Screen اضافه کنید.
            </p>
          </div>

          {/* iOS Instructions */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="text-blue-500 ml-2 mt-1">1️⃣</span>
                <div>
                  <strong>دکمه Share را بزنید</strong>
                  <div className="flex items-center mt-1">
                    <Share className="h-4 w-4 text-blue-500 ml-2" />
                    <span className="text-xs">در پایین صفحه Safari</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-blue-500 ml-2 mt-1">2️⃣</span>
                <div>
                  <strong>"Add to Home Screen" را انتخاب کنید</strong>
                  <div className="flex items-center mt-1">
                    <Plus className="h-4 w-4 text-blue-500 ml-2" />
                    <span className="text-xs">در لیست گزینه‌ها</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="text-blue-500 ml-2 mt-1">3️⃣</span>
                <div>
                  <strong>"Add" را بزنید</strong>
                  <p className="text-xs mt-1">Mr Trader Academy روی Home Screen شما اضافه می‌شود</p>
                </div>
              </div>
            </div>
          </div>

          {/* iOS Limitations Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800">
              <strong>⚠️ توجه:</strong> در iOS، Push Notifications فقط بعد از نصب PWA کار می‌کند.
            </p>
          </div>

          {/* Button */}
          <Button
            onClick={handleIOSGuideClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            متوجه شدم
          </Button>

          {/* Privacy note */}
          <p className="text-xs text-gray-500 text-center mt-3">
            بعد از نصب می‌تونید اعلان‌ها رو فعال کنید
          </p>
        </div>
      </div>
    );
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-auto p-6 relative animate-in slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button
          onClick={handleDecline}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="بستن"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="text-center mb-4">
          <div className="bg-trader-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-trader-600" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            از آخرین اخبار مطلع بشید!
          </h3>
          <p className="text-gray-600 leading-relaxed">
            اجازه بدید تا اعلان‌های مهم آموزشی، تحلیل‌های بازار و فرصت‌های ترید رو برای شما ارسال کنیم.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-right">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500 ml-2">✓</span>
              تحلیل‌های فوری بازار
            </li>
            <li className="flex items-center">
              <span className="text-green-500 ml-2">✓</span>
              فرصت‌های ترید طلایی
            </li>
            <li className="flex items-center">
              <span className="text-green-500 ml-2">✓</span>
              اخبار و رویدادهای مهم
            </li>
            <li className="flex items-center">
              <span className="text-green-500 ml-2">✓</span>
              محتوای آموزشی جدید
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleAllow}
            className="flex-1 bg-trader-600 hover:bg-trader-700 text-white font-medium"
          >
            <Bell className="h-4 w-4 ml-2" />
            فعال‌سازی اعلان‌ها
          </Button>
          
          <Button
            onClick={handleDecline}
            variant="outline"
            className="flex-1"
          >
            فعلاً نه
          </Button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          هر زمان می‌تونید اعلان‌ها رو از تنظیمات غیرفعال کنید
        </p>
      </div>
    </div>
  );
};

export default PushNotificationPrompt; 