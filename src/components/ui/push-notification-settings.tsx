import { useState } from 'react';
import { Bell, BellOff, Send, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { notificationService } from '@/lib/notification-service';

interface PushNotificationSettingsProps {
  className?: string;
}

export const PushNotificationSettings = ({ className }: PushNotificationSettingsProps) => {
  const {
    isSupported,
    permission,
    subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    clearError,
  } = usePushNotifications();

  const [testSent, setTestSent] = useState(false);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      // می‌توانید toast notification نمایش دهید
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      // می‌توانید toast notification نمایش دهید
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  // تست notification خرید دوره
  const handleTestCoursePurchaseNotification = async () => {
    try {
      const success = await notificationService.sendCoursePurchaseNotification(
        "دوره نمونه آموزش React",
        "sample-course-123"
      );
      if (success) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (error) {
      console.error('Error sending test course purchase notification:', error);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return {
          label: 'مجاز',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'denied':
        return {
          label: 'رد شده',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
      default:
        return {
          label: 'نامشخص',
          variant: 'secondary' as const,
          color: 'text-yellow-600'
        };
    }
  };

  const permissionStatus = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            اعلان‌های فوری
          </CardTitle>
          <CardDescription>
            مرورگر شما از اعلان‌های فوری پشتیبانی نمی‌کند
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              برای استفاده از این قابلیت، لطفاً مرورگر خود را به‌روزرسانی کنید یا از مرورگر مدرن‌تری استفاده کنید.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            اعلان‌های فوری
          </div>
          <Badge variant={permissionStatus.variant}>
            {permissionStatus.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          برای دریافت آخرین اخبار و به‌روزرسانی‌های آموزشی
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearError}
                className="text-xs"
              >
                بستن
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {testSent && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              اعلان آزمایشی ارسال شد! آن را در دستگاه خود بررسی کنید.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">وضعیت اشتراک</p>
              <p className="text-xs text-muted-foreground">
                {subscription ? 'فعال - شما اعلان‌ها را دریافت می‌کنید' : 'غیرفعال - اعلان‌ها دریافت نمی‌شوند'}
              </p>
            </div>
            <div className={`h-3 w-3 rounded-full ${subscription ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>

          {permission === 'default' && (
            <Button 
              onClick={requestPermission}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              درخواست مجوز اعلان‌ها
            </Button>
          )}

          {permission === 'granted' && !subscription && (
            <Button 
              onClick={handleSubscribe}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Bell className="mr-2 h-4 w-4" />
              فعال‌سازی اعلان‌ها
            </Button>
          )}

          {permission === 'granted' && subscription && (
            <div className="space-y-2">
              <Button 
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <BellOff className="mr-2 h-4 w-4" />
                غیرفعال‌سازی اعلان‌ها
              </Button>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleTestNotification}
                  disabled={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Send className="mr-2 h-4 w-4" />
                  ارسال اعلان آزمایشی
                </Button>
                
                <Button 
                  onClick={handleTestCoursePurchaseNotification}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  🎉 تست اعلان خرید دوره
                </Button>
              </div>
            </div>
          )}

          {permission === 'denied' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                برای فعال‌سازی اعلان‌ها، لطفاً از تنظیمات مرورگر خود، مجوز اعلان‌ها را برای این سایت فعال کنید.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="pt-3 border-t">
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              اطلاعات فنی
            </summary>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              <div className="grid grid-cols-2 gap-2">
                <span>پشتیبانی:</span>
                <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
                  {isSupported ? '✓ فعال' : '✗ غیرفعال'}
                </span>
                
                <span>مجوز:</span>
                <span className={permissionStatus.color}>
                  {permissionStatus.label}
                </span>
                
                <span>اشتراک:</span>
                <span className={subscription ? 'text-green-600' : 'text-gray-500'}>
                  {subscription ? '✓ فعال' : '✗ غیرفعال'}
                </span>
              </div>
              
              {subscription && (
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  <p className="font-medium mb-1">Endpoint:</p>
                  <p className="break-all">{subscription.endpoint.slice(0, 50)}...</p>
                </div>
              )}
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
}; 