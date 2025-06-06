/**
 * Cache management utility for clearing all cached data on logout
 */

import { TOKEN_STORAGE_KEY } from './config';

/**
 * Clear all localStorage data and cached states
 * @param preservePendingCourse - whether to preserve pending course data during logout
 */
export const clearAllCache = (preservePendingCourse: boolean = true) => {
  console.log('🗑️ Starting cache clearing process...');
  
  // Clear auth tokens
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem('auth_tokens');
  console.log('✅ Auth tokens cleared');
  
  // Clear pending course data only if not preserving
  if (!preservePendingCourse) {
    localStorage.removeItem('pendingCourseId');
    console.log('✅ Pending course data cleared');
  } else {
    console.log('ℹ️ Pending course data preserved');
  }
  
  // Clear any other app-specific data
  // Add more localStorage keys here as needed
  
  // Clear all localStorage that starts with app prefix if any
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      // Remove any keys that might be app-related, but preserve pending course if needed
      if (key.startsWith('auth_') || 
          key.startsWith('course_') || 
          key.startsWith('user_') ||
          key.startsWith('wallet_') ||
          key.includes('token') ||
          (key.includes('pending') && !preservePendingCourse)) {
        keysToRemove.push(key);
      }
    }
  }
  
  // Remove all identified keys
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed cache key: ${key}`);
  });
  
  console.log('🎉 All cache cleared successfully');
};

/**
 * Clear specific cache type
 */
export const clearCacheByType = (type: 'auth' | 'course' | 'user' | 'wallet') => {
  console.log(`🗑️ Clearing ${type} cache...`);
  
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${type}_`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  if (type === 'auth') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('auth_tokens');
  }
  
  console.log(`✅ ${type} cache cleared successfully`);
};

/**
 * Clear pending course data specifically
 */
export const clearPendingCourse = () => {
  localStorage.removeItem('pendingCourseId');
  console.log('✅ Pending course data cleared');
};

/**
 * Force clear all possible cache including browser cache
 */
export const forceFullClear = () => {
  console.log('🔄 Performing full cache clear...');
  clearAllCache(false); // Don't preserve pending course in force clear
  
  // Clear session storage as well
  sessionStorage.clear();
  console.log('✅ Session storage cleared');
  
  // Force reload to clear any in-memory cache
  setTimeout(() => {
    console.log('🔄 Redirecting to home page...');
    window.location.href = '/';
  }, 100);
}; 