import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PushNotificationSettings } from '@/components/ui/push-notification-settings';
import { PushNotificationButton } from '@/components/ui/push-notification-button';
import { PushNotificationBackendStatus } from '@/components/ui/push-notification-status';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { usePushNotifications } from '@/hooks/use-push-notifications';

export default function NotificationTest() {
  const { isSupported, permission, subscription } = usePushNotifications();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">تست سیستم اعلان‌های فوری</h1>
        <p className="text-muted-foreground">
          این صفحه برای تست و بررسی عملکرد push notifications طراحی شده است
        </p>
      </div>

      {/* وضعیت فعلی سیستم */}
      <Card>
        <CardHeader>
          <CardTitle>وضعیت فعلی سیستم</CardTitle>
          <CardDescription>
            اطلاعات سریع از وضعیت push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">پشتیبانی مرورگر</p>
              <Badge variant={isSupported ? 'default' : 'destructive'}>
                {isSupported ? 'پشتیبانی می‌کند' : 'پشتیبانی نمی‌کند'}
              </Badge>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">مجوز اعلان‌ها</p>
              <Badge 
                variant={
                  permission === 'granted' ? 'default' : 
                  permission === 'denied' ? 'destructive' : 'secondary'
                }
              >
                {
                  permission === 'granted' ? 'مجاز' :
                  permission === 'denied' ? 'رد شده' : 'نامشخص'
                }
              </Badge>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">وضعیت اشتراک</p>
              <Badge variant={subscription ? 'default' : 'secondary'}>
                {subscription ? 'فعال' : 'غیرفعال'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* دکمه‌های سریع */}
      <Card>
        <CardHeader>
          <CardTitle>دکمه‌های سریع</CardTitle>
          <CardDescription>
            مثال‌هایی از دکمه‌های مختلف push notification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">دکمه ساده (بدون متن):</span>
              <PushNotificationButton />
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">دکمه با متن:</span>
              <PushNotificationButton showText={true} variant="outline" />
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">دکمه بزرگ:</span>
              <PushNotificationButton showText={true} size="lg" variant="default" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* وضعیت Backend */}
      <PushNotificationBackendStatus />

      <Separator />

      {/* کامپوننت کامل تنظیمات */}
      <div className="max-w-2xl mx-auto">
        <PushNotificationSettings />
      </div>

      {/* راهنمای توسعه‌دهنده */}
      <Card>
        <CardHeader>
          <CardTitle>راهنمای توسعه‌دهنده</CardTitle>
          <CardDescription>
            نحوه استفاده از کامپوننت‌ها و hook ها
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">استفاده از Hook:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { usePushNotifications } from '@/hooks/use-push-notifications';

const MyComponent = () => {
  const { 
    isSupported, 
    permission, 
    subscription, 
    subscribe 
  } = usePushNotifications();
  
  return (
    <button onClick={subscribe}>
      فعال‌سازی اعلان‌ها
    </button>
  );
};`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">استفاده از کامپوننت دکمه:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { PushNotificationButton } from '@/components/ui/push-notification-button';

<PushNotificationButton 
  showText={true} 
  variant="outline" 
  size="lg" 
/>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">استفاده از کامپوننت تنظیمات:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { PushNotificationSettings } from '@/components/ui/push-notification-settings';

<PushNotificationSettings className="max-w-md" />`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* توضیحات فنی */}
      <Card>
        <CardHeader>
          <CardTitle>توضیحات فنی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Service Worker:</strong> در مسیر <code>/public/sw.js</code> قرار دارد و push events را handle می‌کند
          </div>
          <div>
            <strong>VAPID Key:</strong> کلید عمومی برای authentication با push service
          </div>
          <div>
            <strong>Subscription:</strong> هر کاربر یک subscription منحصربفرد دارد که باید در backend ذخیره شود
          </div>
          <div>
            <strong>Manifest:</strong> فایل manifest.json برای PWA functionality
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 