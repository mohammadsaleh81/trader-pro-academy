// مدیریت localStorage برای سیستم نصب اپ

export const InstallStorageKeys = {
  // شمارنده‌های اصلی
  APP_VISIT_COUNT: 'app-visit-count',
  INSTALL_PAGE_VISITS: 'install-page-visits',
  APP_INSTALL_SKIP_COUNT: 'app-install-skip-count',
  
  // زمان‌های مهم
  APP_INSTALL_SKIPPED: 'app-install-skipped',
  LAST_INSTALL_REDIRECT: 'last-install-redirect',
  LAST_STRONG_MODAL: 'last-strong-modal',
  
  // وضعیت UI
  INSTALL_BANNER_DISMISSED: 'install-banner-dismissed',
  FAB_INSTALL_DISMISSED: 'fab-install-dismissed',
  
  // PWA های قدیمی
  PWA_PROMPT_SEEN: 'pwa-prompt-seen',
  PWA_PROMPT_DISMISSED: 'pwa-prompt-dismissed',
} as const;

export class InstallStorage {
  // دریافت مقدار عددی
  static getNumber(key: string, defaultValue = 0): number {
    try {
      const value = localStorage.getItem(key);
      return value ? parseInt(value, 10) || defaultValue : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // دریافت مقدار رشته‌ای
  static getString(key: string, defaultValue = ''): string {
    try {
      return localStorage.getItem(key) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // دریافت مقدار boolean
  static getBoolean(key: string): boolean {
    try {
      return !!localStorage.getItem(key);
    } catch {
      return false;
    }
  }

  // ست کردن مقدار
  static set(key: string, value: string | number): void {
    try {
      localStorage.setItem(key, value.toString());
    } catch (error) {
      console.warn('Failed to set localStorage item:', key, error);
    }
  }

  // حذف یک کلید
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove localStorage item:', key, error);
    }
  }

  // پاک کردن همه داده‌های مربوط به نصب
  static clearAll(): void {
    Object.values(InstallStorageKeys).forEach(key => {
      this.remove(key);
    });
  }

  // گرفتن تعداد skip ها
  static getSkipCount(): number {
    return this.getNumber(InstallStorageKeys.APP_INSTALL_SKIP_COUNT);
  }

  // افزایش تعداد skip ها
  static incrementSkipCount(): number {
    const newCount = this.getSkipCount() + 1;
    this.set(InstallStorageKeys.APP_INSTALL_SKIP_COUNT, newCount);
    this.set(InstallStorageKeys.APP_INSTALL_SKIPPED, Date.now());
    return newCount;
  }

  // گرفتن تعداد بازدیدهای صفحه اصلی
  static getVisitCount(): number {
    return this.getNumber(InstallStorageKeys.APP_VISIT_COUNT);
  }

  // افزایش تعداد بازدیدهای صفحه اصلی
  static incrementVisitCount(): number {
    const newCount = this.getVisitCount() + 1;
    this.set(InstallStorageKeys.APP_VISIT_COUNT, newCount);
    return newCount;
  }

  // چک کردن اینکه آیا کاربر اخیراً skip کرده
  static hasRecentlySkipped(hours = 24): boolean {
    const skipTime = this.getString(InstallStorageKeys.APP_INSTALL_SKIPPED);
    if (!skipTime) return false;

    const hoursAgo = (Date.now() - parseInt(skipTime)) / (1000 * 60 * 60);
    return hoursAgo < hours;
  }

  // چک کردن اینکه آیا banner اخیراً dismiss شده
  static hasBannerBeenDismissed(hours = 12): boolean {
    const dismissTime = this.getString(InstallStorageKeys.INSTALL_BANNER_DISMISSED);
    if (!dismissTime) return false;

    const hoursAgo = (Date.now() - parseInt(dismissTime)) / (1000 * 60 * 60);
    return hoursAgo < hours;
  }

  // چک کردن آیا modal قوی اخیراً نمایش داده شده
  static hasStrongModalShown(hours = 48): boolean {
    const showTime = this.getString(InstallStorageKeys.LAST_STRONG_MODAL);
    if (!showTime) return false;

    const hoursAgo = (Date.now() - parseInt(showTime)) / (1000 * 60 * 60);
    return hoursAgo < hours;
  }

  // آمار کامل کاربر
  static getUserStats() {
    return {
      visitCount: this.getVisitCount(),
      skipCount: this.getSkipCount(),
      installPageVisits: this.getNumber(InstallStorageKeys.INSTALL_PAGE_VISITS),
      hasRecentlySkipped: this.hasRecentlySkipped(),
      hasBannerBeenDismissed: this.hasBannerBeenDismissed(),
      hasStrongModalShown: this.hasStrongModalShown(),
    };
  }

  // آیا کاربر مقاوم است؟ (زیاد skip کرده)
  static isResistantUser(): boolean {
    const skipCount = this.getSkipCount();
    const visitCount = this.getVisitCount();
    
    // اگر بیشتر از 3 بار skip کرده یا بیشتر از 5 بار بازدید کرده
    return skipCount >= 3 || visitCount >= 5;
  }

  // آیا کاربر علاقه‌مند است؟ (زیاد آمده ولی نصب نکرده)
  static isInterestedUser(): boolean {
    const visitCount = this.getVisitCount();
    const installPageVisits = this.getNumber(InstallStorageKeys.INSTALL_PAGE_VISITS);
    const skipCount = this.getSkipCount();
    
    // اگر زیاد آمده ولی کم skip کرده
    return (visitCount >= 3 || installPageVisits >= 2) && skipCount <= 2;
  }
} 