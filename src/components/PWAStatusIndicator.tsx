import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useData } from '@/contexts/DataContext';

export const PWAStatusIndicator: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const { isLoading } = useData();

  useEffect(() => {
    const handleReloadStart = () => {
      setIsRefreshing(true);
      setShowIndicator(true);
    };

    const handleReloadEnd = () => {
      setIsRefreshing(false);
      // Keep indicator visible for a short time after refresh completes
      setTimeout(() => setShowIndicator(false), 2000);
    };

    // Listen for PWA reload events
    window.addEventListener('pwa:reload', handleReloadStart);
    
    // Monitor loading state to detect when refresh is complete
    if (isRefreshing && !isLoading) {
      handleReloadEnd();
    }

    return () => {
      window.removeEventListener('pwa:reload', handleReloadStart);
    };
  }, [isRefreshing, isLoading]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-2 text-sm">
      <RefreshCw 
        className={`w-4 h-4 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      <span className="text-gray-700">
        {isRefreshing ? 'در حال بروزرسانی...' : 'بروزرسانی شد ✓'}
      </span>
    </div>
  );
}; 