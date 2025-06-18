import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BackendStatus {
  subscribe: 'checking' | 'available' | 'missing' | 'error';
  unsubscribe: 'checking' | 'available' | 'missing' | 'error';
  send: 'checking' | 'available' | 'missing' | 'error';
}

export const PushNotificationBackendStatus = () => {
  const [status, setStatus] = useState<BackendStatus>({
    subscribe: 'checking',
    unsubscribe: 'checking', 
    send: 'checking'
  });

  useEffect(() => {
    const checkEndpoints = async () => {
      const endpoints = [
        { name: 'subscribe', url: '/api/push/subscribe' },
        { name: 'unsubscribe', url: '/api/push/unsubscribe' },
        { name: 'send', url: '/api/push/send' }
      ];

      const newStatus = { ...status };

      for (const endpoint of endpoints) {
        try {
          // ارسال OPTIONS request برای بررسی وجود endpoint
          const response = await fetch(endpoint.url, {
            method: 'OPTIONS',
          });

          if (response.status === 405) {
            // Method not allowed معمولاً یعنی endpoint وجود دارد اما method پشتیبانی نمی‌شود
            newStatus[endpoint.name as keyof BackendStatus] = 'missing';
          } else if (response.status < 500) {
            newStatus[endpoint.name as keyof BackendStatus] = 'available';
          } else {
            newStatus[endpoint.name as keyof BackendStatus] = 'error';
          }
        } catch (error) {
          // اگر fetch ناموفق بود، endpoint وجود ندارد
          newStatus[endpoint.name as keyof BackendStatus] = 'missing';
        }
      }

      setStatus(newStatus);
    };

    checkEndpoints();
  }, []);

  const getStatusInfo = (endpointStatus: BackendStatus[keyof BackendStatus]) => {
    switch (endpointStatus) {
      case 'checking':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'بررسی...',
          variant: 'secondary' as const,
          color: 'text-gray-500'
        };
      case 'available':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          text: 'فعال',
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'missing':
        return {
          icon: <XCircle className="h-3 w-3" />,
          text: 'غیرفعال',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          text: 'خطا',
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
    }
  };

  const allMissing = status.subscribe === 'missing' && 
                     status.unsubscribe === 'missing' && 
                     status.send === 'missing';

  const allAvailable = status.subscribe === 'available' && 
                       status.unsubscribe === 'available' && 
                       status.send === 'available';

  if (allAvailable) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          🎉 Backend push notifications کاملاً پیکربندی شده است!
        </AlertDescription>
      </Alert>
    );
  }

  if (allMissing) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="space-y-2">
          <p>
            <strong>Backend Push Notifications پیکربندی نشده است</strong>
          </p>
          <p className="text-sm">
            سیستم push notifications در حالت محلی کار می‌کند. 
            برای عملکرد کامل، لطفاً backend را طبق مستندات پیاده‌سازی کنید.
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer hover:text-foreground">
              جزئیات endpoints مورد نیاز
            </summary>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <code>POST /api/push/subscribe</code>
                <Badge {...getStatusInfo(status.subscribe)} className="text-xs">
                  {getStatusInfo(status.subscribe).text}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <code>POST /api/push/unsubscribe</code>
                <Badge {...getStatusInfo(status.unsubscribe)} className="text-xs">
                  {getStatusInfo(status.unsubscribe).text}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <code>POST /api/push/send</code>
                <Badge {...getStatusInfo(status.send)} className="text-xs">
                  {getStatusInfo(status.send).text}
                </Badge>
              </div>
            </div>
          </details>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-2">
        <p>
          <strong>Backend Push Notifications جزئی پیکربندی شده است</strong>
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            {getStatusInfo(status.subscribe).icon}
            <span>Subscribe</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusInfo(status.unsubscribe).icon}
            <span>Unsubscribe</span>
          </div>
          <div className="flex items-center gap-1">
            {getStatusInfo(status.send).icon}
            <span>Send</span>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}; 