// Comprehensive Logging Service for Application Monitoring
export interface LogEntry {
  NO: number;
  PROCESS_ID: string; // Format: yyyymmdd[nomerurut5 sequential]
  USER_ID: string;
  MODULE: string;
  FUNCTION_NAME: string;
  START_DATE: string; // Format: DD-MM-YYYY HH:MM:SS
  END_DATE: string; // Format: DD-MM-YYYY HH:MM:SS
  STATUS: 'Success' | 'Error' | 'Warning' | 'InProgress';
  DETAILS?: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'user_action' | 'api_call' | 'navigation' | 'error' | 'performance' | 'system' | 'security';
  action: string;
  sessionId: string;
  userAgent: string;
  url: string;
  duration?: number; // For performance logs
  timestamp?: Date; // For internal use
}

export interface LogFilter {
  level?: string;
  category?: string;
  action?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private maxLogs: number = 10000; // Maximum logs to keep in memory
  private isEnabled: boolean = true;
  private processCounter: number = 1; // Counter for sequential numbering

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandling();
    this.setupPerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateProcessId(): string {
    const now = new Date();
    const dateStr = now.getFullYear().toString() + 
                   (now.getMonth() + 1).toString().padStart(2, '0') + 
                   now.getDate().toString().padStart(2, '0');
    const sequential = this.processCounter.toString().padStart(5, '0');
    this.processCounter++;
    return `${dateStr}${sequential}`;
  }

  private formatDateTime(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }

  private setupGlobalErrorHandling(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.log('error', 'system', 'global_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.log('error', 'system', 'unhandled_promise_rejection', {
        reason: event.reason,
        promise: event.promise,
      });
    });
  }

  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.log('info', 'performance', 'page_load', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: this.getFirstPaint(),
          totalTime: navigation.loadEventEnd - navigation.fetchStart,
        });
      }
    });

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.log('debug', 'performance', 'memory_usage', {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }, 60000); // Every minute
    }
  }

  private getFirstPaint(): number | null {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : null;
  }

  // Main logging method
  public log(
    level: LogEntry['level'],
    category: LogEntry['category'],
    action: string,
    details: Record<string, any> = {},
    userId: string = 'system',
    module: string = 'System',
    functionName: string = action,
    status: LogEntry['STATUS'] = 'Success'
  ): void {
    if (!this.isEnabled) return;

    const now = new Date();
    const processId = this.generateProcessId();
    const startDate = this.formatDateTime(now);
    const endDate = this.formatDateTime(now);

    const logEntry: LogEntry = {
      NO: this.generateLogId(),
      PROCESS_ID:processId,
      USER_ID: userId,
      MODULE:module,
      FUNCTION_NAME:functionName,
      START_DATE:startDate,
      END_DATE:endDate,
      STATUS:status,
      DETAILS: JSON.stringify(details),
      level,
      category,
      action,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: now,
    };

    // Add new log entry at the beginning (latest first - DESC order)
    this.logs.unshift(logEntry);

    // Keep only the latest logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${category}: ${action}`, details);
    }

    // Send to external logging service (if configured)
    this.sendToExternalService(logEntry);
  }

  private generateLogId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    // TODO: Implement external logging service integration
    // Example: Send to your backend API, Sentry, LogRocket, etc.
    try {
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  // Convenience methods for different log levels
  public info(category: LogEntry['category'], action: string, details?: Record<string, any>, userId: string = 'system', module: string = 'System', functionName: string = action): void {
    this.log('info', category, action, details, userId, module, functionName, 'Success');
  }

  public warn(category: LogEntry['category'], action: string, details?: Record<string, any>, userId: string = 'system', module: string = 'System', functionName: string = action): void {
    this.log('warn', category, action, details, userId, module, functionName, 'Warning');
  }

  public error(category: LogEntry['category'], action: string, details?: Record<string, any>, userId: string = 'system', module: string = 'System', functionName: string = action): void {
    this.log('error', category, action, details, userId, module, functionName, 'Error');
  }

  public debug(category: LogEntry['category'], action: string, details?: Record<string, any>, userId: string = 'system', module: string = 'System', functionName: string = action): void {
    this.log('debug', category, action, details, userId, module, functionName, 'Success');
  }

  // User action logging
  public logUserAction(action: string, details?: Record<string, any>, userId: string = 'system', module: string = 'User'): void {
    this.info('user_action', action, details, userId, module, action);
  }

  // API call logging
  public logApiCall(method: string, url: string, status?: number, duration?: number, details?: Record<string, any>): void {
    const statusText = status && status >= 400 ? 'Error' : 'Success';
    this.info('api_call', `${method} ${url}`, {
      method,
      url,
      status,
      duration,
      ...details,
    }, 'system', 'API', `${method} ${url}`);
  }

  // Navigation logging
  public logNavigation(from: string, to: string, details?: Record<string, any>): void {
    this.info('navigation', `navigate_from_${from}_to_${to}`, {
      from,
      to,
      ...details,
    }, 'system', 'Navigation', `Navigate to ${to}`);
  }

  // Performance logging
  public logPerformance(action: string, duration: number, details?: Record<string, any>): void {
    this.info('performance', action, {
      duration,
      ...details,
    }, 'system', 'Performance', action);
  }

  // Data change logging (for critical data changes)
  public logDataChange(operation: 'Create' | 'Update' | 'Delete', module: string, recordId: string, details?: Record<string, any>, userId: string = 'system'): void {
    this.info('user_action', `${operation} ${module}`, {
      operation,
      module,
      recordId,
      ...details,
    }, userId, module, operation);
  }

  // Security logging (for authentication and security events)
  public logSecurityEvent(event: string, details?: Record<string, any>, userId: string = 'system', status: 'Success' | 'Error' | 'Warning' = 'Success'): void {
    const level = status === 'Error' ? 'error' : status === 'Warning' ? 'warn' : 'info';
    this.log(level, 'security', event, details, userId, 'Security', event, status);
  }

  // Authentication logging
  public logAuthentication(action: 'login_success' | 'login_failed' | 'logout' | 'session_timeout' | 'password_change' | 'account_locked', details?: Record<string, any>, userId: string = 'system'): void {
    const status = action === 'login_success' || action === 'logout' || action === 'password_change' ? 'Success' : 'Error';
    this.logSecurityEvent(`auth_${action}`, details, userId, status);
  }

  // Get logs with filtering - always return latest first
  public getLogs(filter: LogFilter = {}): LogEntry[] {
    // Sort logs by timestamp (latest first) before filtering
    let filteredLogs = [...this.logs].sort((a, b) => {
      if (a.timestamp && b.timestamp) {
        return b.timestamp.getTime() - a.timestamp.getTime(); // Latest first
      }
      return 0;
    });

    if (filter.level) {
      filteredLogs = filteredLogs.filter(log => log.level === filter.level);
    }

    if (filter.category) {
      filteredLogs = filteredLogs.filter(log => log.category === filter.category);
    }

    if (filter.action) {
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(filter.action!.toLowerCase())
      );
    }

    if (filter.userId) {
      filteredLogs = filteredLogs.filter(log => log.USER_ID === filter.userId);
    }

    if (filter.dateFrom) {
      filteredLogs = filteredLogs.filter(log => log.timestamp && log.timestamp >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filteredLogs = filteredLogs.filter(log => log.timestamp && log.timestamp <= filter.dateTo!);
    }

    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.action.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.DETAILS).toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs;
  }

  // Get log statistics
  public getLogStats(): Record<string, any> {
    const stats = {
      total: this.logs.length,
      byLevel: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byAction: {} as Record<string, number>,
      errors: this.logs.filter(log => log.level === 'error').length,
      warnings: this.logs.filter(log => log.level === 'warn').length,
      sessionId: this.sessionId,
      oldestLog: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp || null : null,
      newestLog: this.logs.length > 0 ? this.logs[0].timestamp || null : null,
    };

    // Count by level
    this.logs.forEach(log => {
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
    });

    // Count by category
    this.logs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
    });

    // Count by action (top 10)
    const actionCounts: Record<string, number> = {};
    this.logs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    stats.byAction = Object.fromEntries(
      Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
    );

    return stats;
  }

  // Clear logs
  public clearLogs(): void {
    this.logs = [];
  }

  // Export logs
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Enable/disable logging
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isLoggingEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const loggingService = new LoggingService();
