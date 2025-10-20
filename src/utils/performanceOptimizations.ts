/**
 * Performance Optimization Utilities
 * Clean Code & Performance Improvements
 */

// 1. Debounce utility for input validation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 2. Throttle utility for API calls
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 3. Memoized localStorage access
class LocalStorageCache {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 5000; // 5 seconds

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const data = JSON.parse(atob(item));
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  static set(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
      this.cache.set(key, { data: value, timestamp: Date.now() });
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  static clear(): void {
    this.cache.clear();
  }
}

// 4. Constants for magic numbers
export const SECURITY_CONSTANTS = {
  SUSPICIOUS_ATTEMPT_THRESHOLD: 3,
  BRUTE_FORCE_THRESHOLD: 5,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,
  DEBOUNCE_DELAY_MS: 300,
  THROTTLE_DELAY_MS: 1000,
} as const;

// 5. User data cache manager
export class UserDataManager {
  private static userData: any = null;
  private static lastFetch = 0;
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  static getCurrentUser() {
    if (this.userData && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.userData;
    }

    this.userData = LocalStorageCache.get('sar_user_data');
    this.lastFetch = Date.now();
    return this.userData;
  }

  static getUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.username || null;
  }

  static getUserName(): string | null {
    const user = this.getCurrentUser();
    return user?.name || null;
  }

  static getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  static clearCache(): void {
    this.userData = null;
    this.lastFetch = 0;
    LocalStorageCache.clear();
  }
}

// 6. Performance monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTiming(label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  static recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(value);
  }

  static getMetrics(label: string): { avg: number; min: number; max: number; count: number } {
    const values = this.metrics.get(label) || [];
    if (values.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: sum / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}
