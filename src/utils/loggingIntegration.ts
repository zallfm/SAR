// Utility functions for easy logging integration across components

import { loggingService } from '../services/loggingService';

// Logging decorators for class components
export const logMethod = (methodName: string) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      loggingService.logUserAction(`method_call_${methodName}`, {
        method: propertyKey,
        args: args.length,
        timestamp: new Date().toISOString(),
      });

      try {
        const result = originalMethod.apply(this, args);
        return result;
      } catch (error) {
        loggingService.error('error', `error_in_${methodName}`, {
          method: propertyKey,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
        throw error;
      }
    };

    return descriptor;
  };
};

// Logging utilities for critical actions only
export const logDataChange = (operation: 'Create' | 'Update' | 'Delete', module: string, recordId: string, details?: Record<string, any>, userId: string = 'system') => {
  loggingService.logDataChange(operation, module, recordId, details, userId);
};

export const logCriticalAction = (action: string, module: string, details?: Record<string, any>, userId: string = 'system') => {
  loggingService.logUserAction(action, details, userId, module);
};

export const logFormSubmit = (formName: string, details?: Record<string, any>, userId: string = 'system') => {
  loggingService.logUserAction('form_submit', {
    formName,
    ...details,
  }, userId, 'Form');
};

export const logDataExport = (exportType: string, recordCount: number, details?: Record<string, any>, userId: string = 'system') => {
  loggingService.logUserAction('data_export', {
    exportType,
    recordCount,
    ...details,
  }, userId, 'Export');
};

export const logDataImport = (importType: string, recordCount: number, details?: Record<string, any>, userId: string = 'system') => {
  loggingService.logUserAction('data_import', {
    importType,
    recordCount,
    ...details,
  }, userId, 'Import');
};

// Performance logging utilities
export const logPerformance = (operation: string, duration: number, details?: Record<string, any>) => {
  loggingService.logPerformance(operation, duration, {
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export const withPerformanceLogging = <T extends any[], R>(
  fn: (...args: T) => R,
  operationName: string
) => {
  return (...args: T): R => {
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      const duration = performance.now() - startTime;
      
      logPerformance(operationName, duration, {
        success: true,
        timestamp: new Date().toISOString(),
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      loggingService.error('error', operationName, {
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      
      throw error;
    }
  };
};

// Error logging utilities
export const logError = (error: Error | string, context?: string, details?: Record<string, any>) => {
  loggingService.error('error', context || 'unknown_error', {
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
    } : error,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

export const logWarning = (message: string, context?: string, details?: Record<string, any>) => {
  loggingService.warn('user_action', context || 'unknown_warning', {
    message,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// API logging utilities
export const logApiCall = (method: string, url: string, status?: number, duration?: number, details?: Record<string, any>) => {
  loggingService.logApiCall(method, url, status, duration, {
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Navigation logging utilities
export const logNavigation = (from: string, to: string, details?: Record<string, any>) => {
  loggingService.logNavigation(from, to, {
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Export all logging utilities
export const loggingUtils = {
  logDataChange,
  logCriticalAction,
  logFormSubmit,
  logDataExport,
  logDataImport,
  logPerformance,
  logError,
  logWarning,
  logApiCall,
  logNavigation,
  withPerformanceLogging,
};
