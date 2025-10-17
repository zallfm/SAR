// Performance optimization utilities for UAR Progress

// Debounce function for search inputs
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Virtual scrolling helper for large datasets
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
}

export const getVirtualScrollRange = (
  scrollTop: number,
  totalItems: number,
  options: VirtualScrollOptions
) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return { startIndex, endIndex };
};

// Memory-efficient data processing
export const processLargeDataset = <T>(
  data: T[],
  processor: (item: T) => T,
  batchSize: number = 100
): Promise<T[]> => {
  return new Promise((resolve) => {
    const result: T[] = [];
    let index = 0;

    const processBatch = () => {
      const endIndex = Math.min(index + batchSize, data.length);
      
      for (let i = index; i < endIndex; i++) {
        result.push(processor(data[i]));
      }
      
      index = endIndex;
      
      if (index < data.length) {
        // Use requestIdleCallback for better performance
        if (window.requestIdleCallback) {
          window.requestIdleCallback(processBatch);
        } else {
          setTimeout(processBatch, 0);
        }
      } else {
        resolve(result);
      }
    };

    processBatch();
  });
};

// Chart data optimization
export const optimizeChartData = (data: any[], maxItems: number = 100) => {
  if (data.length <= maxItems) {
    return data;
  }

  // For large datasets, sample data intelligently
  const step = Math.ceil(data.length / maxItems);
  const sampledData = [];
  
  for (let i = 0; i < data.length; i += step) {
    sampledData.push(data[i]);
  }
  
  return sampledData;
};

// Cache management for API responses
export class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100; // Maximum number of cached items

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Web Worker for heavy computations
export const createDataProcessorWorker = () => {
  const workerCode = `
    self.onmessage = function(e) {
      const { type, data } = e.data;
      
      switch (type) {
        case 'PROCESS_CHART_DATA':
          // Heavy data processing logic
          const processedData = data.map(item => ({
            ...item,
            // Add any heavy computations here
            calculatedValue: item.value * Math.random(), // Example
          }));
          
          self.postMessage({
            type: 'CHART_DATA_PROCESSED',
            data: processedData
          });
          break;
          
        case 'CALCULATE_STATISTICS':
          // Heavy statistical calculations
          const stats = {
            mean: data.reduce((sum, item) => sum + item.value, 0) / data.length,
            max: Math.max(...data.map(item => item.value)),
            min: Math.min(...data.map(item => item.value)),
          };
          
          self.postMessage({
            type: 'STATISTICS_CALCULATED',
            data: stats
          });
          break;
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
};

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(label)) {
        this.metrics.set(label, []);
      }
      
      this.metrics.get(label)!.push(duration);
      
      // Log slow operations
      if (duration > 100) {
        console.warn(`Slow operation detected: ${label} took ${duration.toFixed(2)}ms`);
      }
    };
  }

  getAverageTime(label: string): number {
    const times = this.metrics.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    this.metrics.forEach((times, label) => {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length,
      };
    });
    
    return result;
  }

  clear(): void {
    this.metrics.clear();
  }
}

// Export singleton performance monitor
export const performanceMonitor = new PerformanceMonitor();
