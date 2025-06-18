// Notification Service برای مدیریت انواع اعلان‌ها
interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export type NotificationType = 
  | 'course-purchase'
  | 'course-enrollment'
  | 'course-completion'
  | 'wallet-charge'
  | 'system-update'
  | 'general';

class NotificationService {
  private readonly defaultIcon = '/lovable-uploads/970ac420-2fc4-450d-9177-b465e09c7857.png';
  private readonly baseUrl = '/api/push';

  constructor() {}

  // بررسی پشتیبانی از notifications
  public isSupported(): boolean {
    return 'serviceWorker' in navigator && 
           'PushManager' in window && 
           'Notification' in window;
  }

  // ارسال notification با استفاده از backend یا service worker محلی
  private async sendNotification(options: NotificationOptions): Promise<boolean> {
    try {
      // ابتدا تلاش برای استفاده از backend
      const backendSuccess = await this.sendViaBackend(options);
      if (backendSuccess) {
        return true;
      }

      // در صورت عدم دسترسی به backend، از service worker محلی استفاده کن
      return await this.sendViaServiceWorker(options);
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // ارسال از طریق backend
  private async sendViaBackend(options: NotificationOptions): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: options.title,
          body: options.body,
          icon: options.icon || this.defaultIcon,
          url: options.url || '/',
          tag: options.tag || 'master-trader-notification'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('Notification sent via backend:', result.message);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('Backend notification service not available:', error);
      return false;
    }
  }

  // ارسال از طریق service worker محلی
  private async sendViaServiceWorker(options: NotificationOptions): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || this.defaultIcon,
        badge: this.defaultIcon,
        tag: options.tag || 'master-trader-notification',
        requireInteraction: options.requireInteraction || false,
        actions: options.actions || [],
        data: {
          url: options.url || '/',
          timestamp: Date.now(),
          ...options.data
        }
      });

      console.log('Notification sent via service worker');
      return true;
    } catch (error) {
      console.error('Error sending notification via service worker:', error);
      return false;
    }
  }

  // اعلان خرید دوره
  public async sendCoursePurchaseNotification(courseTitle: string, courseId: string): Promise<boolean> {
    return await this.sendNotification({
      title: '🎉 خرید موفق - مسترتریدر آکادمی',
      body: `دوره "${courseTitle}" با موفقیت خریداری شد! می‌توانید از همین الان شروع به یادگیری کنید.`,
      icon: this.defaultIcon,
      url: `/learn/${courseId}`,
      tag: 'course-purchase',
      requireInteraction: true,
      actions: [
        {
          action: 'view-course',
          title: 'شروع یادگیری',
          icon: this.defaultIcon
        }
      ],
      data: {
        type: 'course-purchase',
        courseId: courseId,
        courseTitle: courseTitle
      }
    });
  }

  // اعلان ثبت‌نام در دوره رایگان
  public async sendCourseEnrollmentNotification(courseTitle: string, courseId: string): Promise<boolean> {
    return await this.sendNotification({
      title: '✅ ثبت‌نام موفق - مسترتریدر آکادمی',
      body: `شما با موفقیت در دوره "${courseTitle}" ثبت‌نام شدید. شروع یادگیری کنید!`,
      icon: this.defaultIcon,
      url: `/learn/${courseId}`,
      tag: 'course-enrollment',
      requireInteraction: true,
      actions: [
        {
          action: 'view-course',
          title: 'شروع یادگیری',
          icon: this.defaultIcon
        }
      ],
      data: {
        type: 'course-enrollment',
        courseId: courseId,
        courseTitle: courseTitle
      }
    });
  }

  // اعلان تکمیل دوره
  public async sendCourseCompletionNotification(courseTitle: string, courseId: string): Promise<boolean> {
    return await this.sendNotification({
      title: '🏆 تبریک! دوره تکمیل شد',
      body: `شما دوره "${courseTitle}" را با موفقیت تکمیل کردید. گواهی خود را دریافت کنید!`,
      icon: this.defaultIcon,
      url: `/learn/${courseId}/certificate`,
      tag: 'course-completion',
      requireInteraction: true,
      actions: [
        {
          action: 'view-certificate',
          title: 'مشاهده گواهی',
          icon: this.defaultIcon
        }
      ],
      data: {
        type: 'course-completion',
        courseId: courseId,
        courseTitle: courseTitle
      }
    });
  }

  // اعلان شارژ کیف پول
  public async sendWalletChargeNotification(amount: number, newBalance: number): Promise<boolean> {
    return await this.sendNotification({
      title: '💰 کیف پول شارژ شد',
      body: `مبلغ ${amount.toLocaleString()} تومان به کیف پول شما اضافه شد. موجودی جدید: ${newBalance.toLocaleString()} تومان`,
      icon: this.defaultIcon,
      url: `/wallet`,
      tag: 'wallet-charge',
      requireInteraction: false,
      data: {
        type: 'wallet-charge',
        amount: amount,
        newBalance: newBalance
      }
    });
  }

  // اعلان عمومی سیستم
  public async sendSystemNotification(title: string, body: string, url?: string): Promise<boolean> {
    return await this.sendNotification({
      title: title,
      body: body,
      icon: this.defaultIcon,
      url: url || '/',
      tag: 'system-notification',
      requireInteraction: false,
      data: {
        type: 'system-notification'
      }
    });
  }

  // اعلان آزمایشی
  public async sendTestNotification(): Promise<boolean> {
    return await this.sendNotification({
      title: 'تست اعلان - مسترتریدر آکادمی',
      body: 'این یک اعلان آزمایشی است که به درستی کار می‌کند!',
      icon: this.defaultIcon,
      url: '/test/notifications',
      tag: 'test-notification',
      requireInteraction: false,
      data: {
        type: 'test'
      }
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService; 