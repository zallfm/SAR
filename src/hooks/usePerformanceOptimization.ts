/**
 * Performance Optimization Hooks
 * 
 * @description Custom hooks for performance optimization and monitoring
 * @version 1.0.0
 * @author SAR Development Team
 */

import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { performanceMonitor } from '../utils/performanceUtils';

/**
 * Hook for memoized callbacks with performance tracking
 * 
 * @param callback - Function to memoize
 * @param deps - Dependencies array
 * @param label - Performance label for tracking
 * @returns Memoized callback
 */
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  label?: string
): T => {
  const stopTiming = useRef<(() => void) | null>(null);
  
  const memoizedCallback = useCallback((...args: Parameters<T>) => {
    if (label) {
      stopTiming.current = performanceMonitor.startTiming(label);
    }
    
    try {
      const result = callback(...args);
      return result;
    } finally {
      if (stopTiming.current) {
        stopTiming.current();
        stopTiming.current = null;
      }
    }
  }, deps);
  
  return memoizedCallback as T;
};

/**
 * Hook for memoized values with performance tracking
 * 
 * @param factory - Function to create the value
 * @param deps - Dependencies array
 * @param label - Performance label for tracking
 * @returns Memoized value
 */
export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  label?: string
): T => {
  const stopTiming = useRef<(() => void) | null>(null);
  
  const memoizedValue = useMemo(() => {
    if (label) {
      stopTiming.current = performanceMonitor.startTiming(label);
    }
    
    try {
      const result = factory();
      return result;
    } finally {
      if (stopTiming.current) {
        stopTiming.current();
        stopTiming.current = null;
      }
    }
  }, deps);
  
  return memoizedValue;
};

/**
 * Hook for component performance monitoring
 * 
 * @param componentName - Name of the component
 * @returns Performance monitoring utilities
 */
export const useComponentPerformance = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef<number>(0);
  
  useEffect(() => {
    renderCount.current += 1;
    lastRenderTime.current = performance.now();
    
    // Log render performance
    if (renderCount.current > 1) {
      const timeSinceLastRender = lastRenderTime.current - (lastRenderTime.current || 0);
      if (timeSinceLastRender < 16) { // Less than 16ms (60fps)
        console.warn(`⚠️ ${componentName} is rendering too frequently (${timeSinceLastRender.toFixed(2)}ms)`);
      }
    }
  });
  
  const getRenderStats = useCallback(() => ({
    renderCount: renderCount.current,
    lastRenderTime: lastRenderTime.current,
    averageRenderTime: renderCount.current > 0 ? lastRenderTime.current / renderCount.current : 0
  }), []);
  
  return {
    renderCount: renderCount.current,
    getRenderStats
  };
};

/**
 * Hook for debounced state updates
 * 
 * @param initialValue - Initial value
 * @param delay - Debounce delay in milliseconds
 * @returns [value, setValue, immediateValue]
 */
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] => {
  const [immediateValue, setImmediateValue] = React.useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = React.useState<T>(initialValue);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [immediateValue, delay]);
  
  return [debouncedValue, setImmediateValue, immediateValue];
};

/**
 * Hook for throttled callbacks
 * 
 * @param callback - Function to throttle
 * @param delay - Throttle delay in milliseconds
 * @param deps - Dependencies array
 * @returns Throttled callback
 */
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList
): T => {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay, ...deps]);
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return throttledCallback as T;
};

/**
 * Hook for intersection observer (lazy loading)
 * 
 * @param options - Intersection observer options
 * @returns [ref, isIntersecting]
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [options]);
  
  return [ref, isIntersecting] as const;
};

/**
 * Hook for virtual scrolling optimization
 * 
 * @param items - Array of items
 * @param itemHeight - Height of each item
 * @param containerHeight - Height of the container
 * @returns Virtual scroll data
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

/**
 * Hook for memory usage monitoring
 * 
 * @returns Memory usage information
 */
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = React.useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };
    
    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return memoryInfo;
};

/**
 * Hook for component lazy loading
 * 
 * @param importFunc - Function that returns a promise for the component
 * @returns Lazy component
 */
export const useLazyComponent = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  const [Component, setComponent] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  const loadComponent = useCallback(async () => {
    if (Component || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const module = await importFunc();
      setComponent(() => module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [Component, loading]);
  
  return {
    Component,
    loading,
    error,
    loadComponent
  };
};

export default {
  useOptimizedCallback,
  useOptimizedMemo,
  useComponentPerformance,
  useDebouncedState,
  useThrottledCallback,
  useIntersectionObserver,
  useVirtualScroll,
  useMemoryUsage,
  useLazyComponent
};
