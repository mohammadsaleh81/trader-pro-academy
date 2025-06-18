import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
}

interface PushNotificationHook extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  sendCoursePurchaseNotification: (courseTitle: string, courseId: string) => Promise<boolean>;
  clearError: () => void;
}

// VAPID Public Key - این باید از سرور شما باشد
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN9QClUOUb20gvWy9o2KPa4DCDX3Cx_VRi4lIXx5B4IYb8fPsUION6Y';

// Helper function برای تبدیل VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (): PushNotificationHook => {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    subscription: null,
    isLoading: false,
    error: null,
  });

  // بررسی پشتیبانی از Push Notifications
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      
      setState(prev => ({
        ...prev,
        isSupported,
        permission: isSupported ? Notification.permission : 'denied'
      }));
    };

    checkSupport();
  }, []);

  // دریافت subscription فعلی
  useEffect(() => {
    const getCurrentSubscription = async () => {
      if (!state.isSupported) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          subscription
        }));
      } catch (error) {
        console.error('Error getting current subscription:', error);
        setState(prev => ({
          ...prev,
          error: 'خطا در دریافت اشتراک فعلی'
        }));
      }
    };

    if (state.isSupported && state.permission === 'granted') {
      getCurrentSubscription();
    }
  }, [state.isSupported, state.permission]);

  // درخواست مجوز
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'مرورگر شما از اعلان‌ها پشتیبانی نمی‌کند'
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      
      setState(prev => ({
        ...prev,
        permission,
        isLoading: false
      }));

      if (permission === 'granted') {
        return true;
      } else if (permission === 'denied') {
        setState(prev => ({
          ...prev,
          error: 'مجوز اعلان‌ها رد شد. لطفاً از تنظیمات مرورگر آن را فعال کنید.'
        }));
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({
        ...prev,
        error: 'خطا در درخواست مجوز اعلان‌ها',
        isLoading: false
      }));
      return false;
    }
  }, [state.isSupported]);

  // اشتراک در push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported || state.permission !== 'granted') {
      const hasPermission = await requestPermission();
      if (!hasPermission) return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setState(prev => ({
        ...prev,
        subscription,
        isLoading: false
      }));

      // ارسال subscription به سرور
      await sendSubscriptionToServer(subscription);

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'خطا در ثبت اشتراک اعلان‌ها',
        isLoading: false
      }));
      return false;
    }
  }, [state.isSupported, state.permission, requestPermission]);

  // لغو اشتراک
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) return true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await state.subscription.unsubscribe();
      
      // حذف subscription از سرور
      await removeSubscriptionFromServer(state.subscription);

      setState(prev => ({
        ...prev,
        subscription: null,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({
        ...prev,
        error: 'خطا در لغو اشتراک اعلان‌ها',
        isLoading: false
      }));
      return false;
    }
  }, [state.subscription]);

  // ارسال notification آزمایشی
  const sendTestNotification = useCallback(async (): Promise<boolean> => {
    if (!state.subscription) {
      setState(prev => ({
        ...prev,
        error: 'ابتدا باید در اعلان‌ها ثبت‌نام کنید'
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // ابتدا سعی کن از backend استفاده کنی
      try {
        const response = await fetch('/api/push/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('Test notification sent via backend:', result.message);
            setState(prev => ({ ...prev, isLoading: false }));
            return true;
          }
        }
      } catch (backendError) {
        console.warn('Backend not available, using local notification:', backendError);
      }

      // اگر backend کار نکرد، از service worker محلی استفاده کن
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification('تست اعلان - مسترتریدر آکادمی', {
        body: 'این یک اعلان آزمایشی محلی است (backend متصل نیست)',
        icon: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
        badge: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
        tag: 'test-notification',
        requireInteraction: false,
        data: {
          url: '/',
          timestamp: Date.now(),
          type: 'test'
        }
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      setState(prev => ({
        ...prev,
        error: 'خطا در ارسال اعلان آزمایشی',
        isLoading: false
      }));
      return false;
    }
  }, [state.subscription]);

  // ارسال notification برای خرید دوره
  const sendCoursePurchaseNotification = useCallback(async (courseTitle: string, courseId: string): Promise<boolean> => {
    if (!state.subscription) {
      console.warn('No push subscription available for course purchase notification');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // ابتدا سعی کن از backend استفاده کنی
      try {
        const response = await fetch('/api/push/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: '🎉 خرید موفق - مسترتریدر آکادمی',
            body: `دوره "${courseTitle}" با موفقیت خریداری شد! می‌توانید از همین الان شروع به یادگیری کنید.`,
            icon: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
            url: `/learn/${courseId}`,
            tag: 'course-purchase'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('Course purchase notification sent via backend:', result.message);
            setState(prev => ({ ...prev, isLoading: false }));
            return true;
          }
        }
      } catch (backendError) {
        console.warn('Backend not available, using local notification:', backendError);
      }

      // اگر backend کار نکرد، از service worker محلی استفاده کن
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification('🎉 خرید موفق - مسترتریدر آکادمی', {
        body: `دوره "${courseTitle}" با موفقیت خریداری شد! می‌توانید از همین الان شروع به یادگیری کنید.`,
        icon: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
        badge: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png',
        tag: 'course-purchase',
        requireInteraction: true, // نمایش بیشتر برای اعلان‌های مهم
        actions: [
          {
            action: 'view-course',
            title: 'شروع یادگیری',
            icon: '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png'
          }
        ],
        data: {
          url: `/learn/${courseId}`,
          timestamp: Date.now(),
          type: 'course-purchase',
          courseId: courseId,
          courseTitle: courseTitle
        }
      });

      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Error sending course purchase notification:', error);
      setState(prev => ({
        ...prev,
        error: 'خطا در ارسال اعلان خرید دوره',
        isLoading: false
      }));
      return false;
    }
  }, [state.subscription]);

  // پاک کردن خطا
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
    sendCoursePurchaseNotification,
    clearError,
  };
};

// Helper functions برای ارتباط با سرور

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    // این endpoint باید در backend شما پیاده‌سازی شود
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      }),
    });

    if (!response.ok) {
      // اگر endpoint وجود ندارد (405, 404), خطا را log نکن
      if (response.status === 405 || response.status === 404) {
        console.warn('Push notification backend endpoints are not implemented yet.');
        console.info('Please implement /api/push/subscribe endpoint according to the documentation.');
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Subscription sent to server successfully');
  } catch (error) {
    // اگر خطای network یا CORS است، فقط warning نمایش بده
    if (error instanceof TypeError || error.message.includes('405')) {
      console.warn('Push notification backend is not configured. Subscription works locally.');
      return;
    }
    console.error('Error sending subscription to server:', error);
  }
}

async function removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
  try {
    // این endpoint باید در backend شما پیاده‌سازی شود
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        timestamp: Date.now()
      }),
    });

    if (!response.ok) {
      // اگر endpoint وجود ندارد (405, 404), خطا را log نکن
      if (response.status === 405 || response.status === 404) {
        console.warn('Push notification backend endpoints are not implemented yet.');
        console.info('Please implement /api/push/unsubscribe endpoint according to the documentation.');
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('Subscription removed from server successfully');
  } catch (error) {
    // اگر خطای network یا CORS است، فقط warning نمایش بده
    if (error instanceof TypeError || error.message.includes('405')) {
      console.warn('Push notification backend is not configured. Unsubscription works locally.');
      return;
    }
    console.error('Error removing subscription from server:', error);
  }
} 