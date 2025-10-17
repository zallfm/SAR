import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { uarProgressService, UarProgressFilters, UarProgressResponse } from '../services/uarProgressService';

interface UseUarProgressDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableCache?: boolean;
  enableWebSocket?: boolean;
}

interface UseUarProgressDataReturn {
  data: UarProgressResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
  isRefreshing: boolean;
}

export const useUarProgressData = (
  filters: UarProgressFilters = {},
  options: UseUarProgressDataOptions = {}
): UseUarProgressDataReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    enableCache = true,
    enableWebSocket = false,
  } = options;

  const [data, setData] = useState<UarProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsCleanupRef = useRef<(() => void) | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoized filters to prevent unnecessary re-fetches
  const memoizedFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  // Fetch data function
  const fetchData = useCallback(async (bypassCache = false) => {
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setError(null);
      
      if (bypassCache) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = bypassCache 
        ? await uarProgressService.refreshUarProgressData(memoizedFilters)
        : await uarProgressService.getUarProgressData(memoizedFilters);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setData(response);
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch UAR progress data';
      setError(errorMessage);
      console.error('Error fetching UAR progress data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [memoizedFilters]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    uarProgressService.clearCache();
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchData]);

  // Setup WebSocket connection
  useEffect(() => {
    if (enableWebSocket) {
      wsCleanupRef.current = uarProgressService.connectWebSocket((newData) => {
        setData(newData);
        setError(null);
      });

      return () => {
        if (wsCleanupRef.current) {
          wsCleanupRef.current();
        }
      };
    }
  }, [enableWebSocket]);

  // Initial data fetch
  useEffect(() => {
    fetchData();

    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (wsCleanupRef.current) {
        wsCleanupRef.current();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    isRefreshing,
  };
};

// Hook for real-time updates with WebSocket
export const useUarProgressRealtime = (
  filters: UarProgressFilters = {},
  options: Omit<UseUarProgressDataOptions, 'enableWebSocket'> = {}
) => {
  return useUarProgressData(filters, {
    ...options,
    enableWebSocket: true,
    autoRefresh: false, // WebSocket handles real-time updates
  });
};

// Hook for high-frequency updates (with debouncing)
export const useUarProgressHighFrequency = (
  filters: UarProgressFilters = {},
  options: UseUarProgressDataOptions = {}
) => {
  return useUarProgressData(filters, {
    ...options,
    autoRefresh: true,
    refreshInterval: 10000, // 10 seconds for high frequency
  });
};
