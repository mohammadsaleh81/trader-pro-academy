import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const usePWAAutoReload = () => {
  const queryClient = useQueryClient();
  const lastReloadTime = useRef<number>(Date.now());
  const RELOAD_INTERVAL = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only reload if the app is now visible and enough time has passed
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const timeSinceLastReload = now - lastReloadTime.current;
        
        if (timeSinceLastReload > RELOAD_INTERVAL) {
          console.log('PWA Auto-Reload: App became visible, refreshing data...');
          
          // Invalidate all queries to refresh data
          queryClient.invalidateQueries();
          
          // Update last reload time
          lastReloadTime.current = now;
          
          // Dispatch custom event for contexts to refresh
          window.dispatchEvent(new CustomEvent('pwa:reload'));
        } else {
          console.log('PWA Auto-Reload: Too soon to reload, skipping...');
        }
      }
    };

    const handleAppFocus = () => {
      // Handle focus event (when PWA gains focus)
      const now = Date.now();
      const timeSinceLastReload = now - lastReloadTime.current;
      
      if (timeSinceLastReload > RELOAD_INTERVAL) {
        console.log('PWA Auto-Reload: App focused, refreshing data...');
        queryClient.invalidateQueries();
        lastReloadTime.current = now;
        window.dispatchEvent(new CustomEvent('pwa:reload'));
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // Handle page show event (when coming back from cache)
      if (event.persisted) {
        console.log('PWA Auto-Reload: Page restored from cache, refreshing data...');
        queryClient.invalidateQueries();
        lastReloadTime.current = Date.now();
        window.dispatchEvent(new CustomEvent('pwa:reload'));
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleAppFocus);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleAppFocus);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [queryClient]);

  // Manual reload function
  const manualReload = () => {
    console.log('PWA Auto-Reload: Manual reload triggered');
    queryClient.invalidateQueries();
    lastReloadTime.current = Date.now();
    window.dispatchEvent(new CustomEvent('pwa:reload'));
  };

  return { manualReload };
}; 