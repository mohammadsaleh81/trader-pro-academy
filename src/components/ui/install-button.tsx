import React from 'react';
import { Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/use-pwa';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface InstallButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showText?: boolean;
}

const InstallButton: React.FC<InstallButtonProps> = ({
  variant = "outline",
  size = "sm",
  className = "",
  showText = true
}) => {
  const { isInstallable, isInstalled, installApp, isIOS, isAndroid } = usePWA();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInstall = async () => {
    // اگر iOS است، به صفحه نصب ببر
    if (isIOS) {
      navigate('/install');
      return;
    }

    // برای اندروید، اول تلاش کن خودکار نصب کنی
    if (isAndroid) {
      // اگر PWA prompt موجود است، استفاده کن
      if (isInstallable) {
        try {
          await installApp();
          toast({
            title: "🎉 نصب موفق!",
            description: "Mr Trader Academy با موفقیت نصب شد",
            variant: "default",
          });
          return;
        } catch (error) {
          console.log('Auto install failed, showing manual guide');
        }
      }
      
      // اگر خودکار نشد، راهنمای دستی نمایش بده
      toast({
        title: "📱 نصب Shortcut",
        description: "منوی Chrome (⋮) ← 'افزودن به صفحه اصلی'",
        duration: 6000,
      });
      
      // بعد از 2 ثانیه به صفحه نصب ببر
      setTimeout(() => {
        navigate('/install');
      }, 2000);
    } else {
      // برای سایر حالات، به صفحه نصب ببر
      navigate('/install');
    }
  };

  // اگر برنامه نصب شده، دکمه را نمایش نده
  if (isInstalled) return null;

  // فقط در موبایل نمایش داده شود
  if (!isIOS && !isAndroid) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstall}
      className={`flex items-center gap-2 ${className}`}
    >
      {isIOS ? (
        <Smartphone className="w-4 h-4" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {showText && (
        <span className="hidden sm:inline">
          {isIOS ? "راهنمای نصب" : "نصب برنامه"}
        </span>
      )}
    </Button>
  );
};

export default InstallButton; 