import { useCallback, useEffect, useRef } from 'react';
import { loggingService, LogEntry } from '../services/loggingService';

interface UseLoggingOptions {
  userId?: string;
  componentName?: string;
  enablePerformanceLogging?: boolean;
}

export const useLogging = (options: UseLoggingOptions = {}) => {
  const { userId, componentName, enablePerformanceLogging = true } = options;
  const performanceStartTime = useRef<number>(0);

  // Log component mount
  useEffect(() => {
    if (componentName) {
      loggingService.logUserAction(`component_mount_${componentName}`, {
        component: componentName,
        timestamp: new Date().toISOString(),
      }, userId);
    }

    return () => {
      if (componentName) {
        loggingService.logUserAction(`component_unmount_${componentName}`, {
          component: componentName,
          timestamp: new Date().toISOString(),
        }, userId);
      }
    };
  }, [componentName, userId]);

  // Performance logging helper
  const startPerformanceLogging = useCallback((action: string) => {
    if (enablePerformanceLogging) {
      performanceStartTime.current = performance.now();
      loggingService.debug('performance', `start_${action}`, {
        component: componentName,
        action,
      }, userId);
    }
  }, [componentName, userId, enablePerformanceLogging]);

  const endPerformanceLogging = useCallback((action: string, details?: Record<string, any>) => {
    if (enablePerformanceLogging && performanceStartTime.current > 0) {
      const duration = performance.now() - performanceStartTime.current;
      loggingService.logPerformance(`end_${action}`, duration, {
        component: componentName,
        action,
        ...details,
      });
      performanceStartTime.current = 0;
    }
  }, [componentName, enablePerformanceLogging]);

  // Convenience methods
  const logUserAction = useCallback((action: string, details?: Record<string, any>) => {
    loggingService.logUserAction(action, {
      component: componentName,
      ...details,
    }, userId);
  }, [componentName, userId]);

  const logApiCall = useCallback((method: string, url: string, status?: number, duration?: number, details?: Record<string, any>) => {
    loggingService.logApiCall(method, url, status, duration, {
      component: componentName,
      ...details,
    });
  }, [componentName]);

  const logNavigation = useCallback((from: string, to: string, details?: Record<string, any>) => {
    loggingService.logNavigation(from, to, {
      component: componentName,
      ...details,
    });
  }, [componentName]);

  const logError = useCallback((action: string, error: Error | string, details?: Record<string, any>) => {
    const errorDetails = {
      component: componentName,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...details,
    };
    loggingService.error('error', action, errorDetails, userId);
  }, [componentName, userId]);

  const logInfo = useCallback((action: string, details?: Record<string, any>) => {
    loggingService.info('user_action', action, {
      component: componentName,
      ...details,
    }, userId);
  }, [componentName, userId]);

  const logWarning = useCallback((action: string, details?: Record<string, any>) => {
    loggingService.warn('user_action', action, {
      component: componentName,
      ...details,
    }, userId);
  }, [componentName, userId]);

  // Security logging
  const logSecurity = useCallback((event: string, details?: Record<string, any>, status: 'Success' | 'Error' | 'Warning' = 'Success') => {
    loggingService.logSecurityEvent(event, details, userId, status);
  }, [userId]);

  const logAuthentication = useCallback((action: 'login_success' | 'login_failed' | 'logout' | 'session_timeout' | 'password_change' | 'account_locked', details?: Record<string, any>) => {
    loggingService.logAuthentication(action, details, userId);
  }, [userId]);

  return {
    logUserAction,
    logApiCall,
    logNavigation,
    logError,
    logInfo,
    logWarning,
    logSecurity,
    logAuthentication,
    startPerformanceLogging,
    endPerformanceLogging,
  };
};

// Hook for logging page navigation
export const useNavigationLogging = (userId?: string) => {
  const logNavigation = useCallback((from: string, to: string, details?: Record<string, any>) => {
    loggingService.logNavigation(from, to, details);
  }, []);

  return { logNavigation };
};

// Hook for logging API calls
export const useApiLogging = (userId?: string) => {
  const logApiCall = useCallback((method: string, url: string, status?: number, duration?: number, details?: Record<string, any>) => {
    loggingService.logApiCall(method, url, status, duration, details);
  }, []);

  return { logApiCall };
};
