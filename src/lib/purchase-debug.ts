/**
 * Debug utility for tracking purchase flow
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const debugPurchase = {
  log: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`🛒 [PURCHASE DEBUG] ${message}`, data || '');
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`🚨 [PURCHASE ERROR] ${message}`, error || '');
    }
  },
  
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ [PURCHASE SUCCESS] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ [PURCHASE WARNING] ${message}`, data || '');
    }
  },
  
  trackPendingCourse: () => {
    const pendingCourseId = localStorage.getItem('pendingCourseId');
    if (isDevelopment) {
      debugPurchase.log('Checking pending course', { pendingCourseId });
    }
    return pendingCourseId;
  },
  
  trackWalletBalance: (wallet: any, requiredAmount: number) => {
    if (isDevelopment) {
      debugPurchase.log('Wallet balance check', {
        balance: wallet?.balance || 0,
        required: requiredAmount,
        sufficient: wallet?.balance >= requiredAmount
      });
    }
  },
  
  trackApiCall: (endpoint: string, method: string, data?: any) => {
    if (isDevelopment) {
      debugPurchase.log(`API Call: ${method} ${endpoint}`, data);
    }
  },
  
  trackApiResponse: (endpoint: string, status: number, data?: any) => {
    if (isDevelopment) {
      if (status >= 200 && status < 300) {
        debugPurchase.success(`API Response: ${endpoint} (${status})`, data);
      } else {
        debugPurchase.error(`API Response: ${endpoint} (${status})`, data);
      }
    }
  }
}; 