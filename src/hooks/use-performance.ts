import { useCallback, useMemo, useRef } from 'react';
import React from 'react';

// Debounce hook for performance optimization
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

// Throttle hook for performance optimization
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastCallRef = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

// Memoized component wrapper
export const withMemo = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
) => {
  return React.memo(Component, propsAreEqual);
};

// Hook for optimizing expensive calculations
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  isExpensive: boolean = true
): T => {
  return useMemo(() => {
    if (isExpensive) {
      console.time('expensive-calculation');
      const result = factory();
      console.timeEnd('expensive-calculation');
      return result;
    }
    return factory();
  }, deps);
};
