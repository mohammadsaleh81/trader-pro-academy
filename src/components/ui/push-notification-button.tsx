import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { cn } from '@/lib/utils';

interface PushNotificationButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const PushNotificationButton = ({
  variant = 'ghost',
  size = 'sm',
  showText = false,
  className
}: PushNotificationButtonProps) => {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
    requestPermission
  } = usePushNotifications();

  // اگر پشتیبانی نمی‌شود، دکمه نمایش داده نمی‌شود
  if (!isSupported) {
    return null;
  }

  const handleClick = async () => {
    if (permission === 'default') {
      await requestPermission();
      return;
    }

    if (permission === 'granted') {
      if (subscription) {
        await unsubscribe();
      } else {
        await subscribe();
      }
    }
  };

  const getButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && <span className="mr-2">در حال پردازش...</span>}
        </>
      );
    }

    if (permission === 'denied') {
      return (
        <>
          <BellOff className="h-4 w-4 text-muted-foreground" />
          {showText && <span className="mr-2 text-muted-foreground">غیرفعال</span>}
        </>
      );
    }

    if (subscription) {
      return (
        <>
          <Bell className="h-4 w-4 text-green-600" />
          {showText && <span className="mr-2">اعلان‌ها فعال</span>}
        </>
      );
    }

    return (
      <>
        <Bell className="h-4 w-4" />
        {showText && <span className="mr-2">فعال‌سازی اعلان‌ها</span>}
      </>
    );
  };

  const getButtonTitle = () => {
    if (permission === 'denied') {
      return 'اعلان‌ها غیرفعال - از تنظیمات مرورگر فعال کنید';
    }
    if (subscription) {
      return 'غیرفعال‌سازی اعلان‌ها';
    }
    return 'فعال‌سازی اعلان‌های فوری';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || permission === 'denied'}
      title={getButtonTitle()}
      className={cn(
        'transition-all duration-200',
        subscription && 'hover:bg-green-50 hover:border-green-200',
        className
      )}
    >
      {getButtonContent()}
    </Button>
  );
}; 