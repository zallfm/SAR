/**
 * Optimized Audit Logger Service
 * Performance & Clean Code Improvements
 */
import { AuditAction } from '../constants/auditActions';
import { UserDataManager, debounce, SECURITY_CONSTANTS } from '../utils/performanceOptimizations';

export interface AuditLogEntry {
  // WHO
  userId: string;
  userName: string;
  userRole: string;
  
  // WHAT
  action: AuditAction;
  module: string;
  description: string;
  
  // WHEN
  timestamp: string;
  
  // WHERE
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  
  // DETAILS
  targetId?: string;
  targetType?: string;
  oldValue?: unknown;
  newValue?: unknown;
  
  // RESULT
  status: 'success' | 'failure' | 'warning';
  errorCode?: string;
  errorMessage?: string;
  
  // CONTEXT
  requestId: string;
  sessionId: string;
}

class OptimizedAuditLogger {
  private static readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
  private static readonly LOG_BUFFER: AuditLogEntry[] = [];
  private static readonly MAX_BUFFER_SIZE = 100;
  private static readonly FLUSH_INTERVAL = 30000; // 30 seconds
  
  // Performance optimizations
  private static flushTimer: NodeJS.Timeout | null = null;
  private static sessionId: string | null = null;
  private static userAgent: string | null = null;
  private static currentModule: string | null = null;

  /**
   * Debounced flush to prevent excessive API calls
   */
  private static debouncedFlush = debounce(() => {
    this.flushBuffer();
  }, 1000);

  /**
   * Log user action with optimized performance
   */
  static log(action: AuditAction, details: Partial<AuditLogEntry>): void {
    const logEntry = this.createLogEntry(action, details, 'success');
    this.addToBuffer(logEntry);
  }

  /**
   * Log successful operation
   */
  static logSuccess(action: AuditAction, details: Partial<AuditLogEntry>): void {
    const logEntry = this.createLogEntry(action, details, 'success');
    this.addToBuffer(logEntry);
  }

  /**
   * Log failed operation
   */
  static logFailure(action: AuditAction, error: Error, details: Partial<AuditLogEntry>): void {
    const logEntry = this.createLogEntry(action, {
      ...details,
      errorCode: error.name,
      errorMessage: error.message
    }, 'failure');
    this.addToBuffer(logEntry);
  }

  /**
   * Log warning
   */
  static logWarning(action: AuditAction, details: Partial<AuditLogEntry>): void {
    const logEntry = this.createLogEntry(action, details, 'warning');
    this.addToBuffer(logEntry);
  }

  /**
   * Optimized log entry creation with cached values
   */
  private static createLogEntry(
    action: AuditAction, 
    details: Partial<AuditLogEntry>, 
    status: 'success' | 'failure' | 'warning'
  ): AuditLogEntry {
    // Cache expensive operations
    if (!this.sessionId) {
      this.sessionId = this.getSessionId();
    }
    if (!this.userAgent) {
      this.userAgent = navigator.userAgent;
    }
    if (!this.currentModule) {
      this.currentModule = this.getCurrentModule();
    }

    return {
      // WHO - Use cached user data
      userId: details.userId || UserDataManager.getUserId() || 'anonymous',
      userName: details.userName || UserDataManager.getUserName() || 'Unknown',
      userRole: details.userRole || UserDataManager.getUserRole() || 'Unknown',
      
      // WHAT
      action,
      module: details.module || this.currentModule,
      description: details.description || `${action} action performed`,
      
      // WHEN
      timestamp: new Date().toISOString(),
      
      // WHERE - Use cached values
      ipAddress: details.ipAddress || 'client-ip-not-available',
      userAgent: details.userAgent || this.userAgent,
      location: details.location || window.location.href,
      
      // DETAILS
      targetId: details.targetId,
      targetType: details.targetType,
      oldValue: details.oldValue,
      newValue: details.newValue,
      
      // RESULT
      status,
      errorCode: details.errorCode,
      errorMessage: details.errorMessage,
      
      // CONTEXT - Use cached values
      requestId: this.generateRequestId(),
      sessionId: this.sessionId
    };
  }

  /**
   * Optimized buffer management
   */
  private static addToBuffer(logEntry: AuditLogEntry): void {
    this.LOG_BUFFER.push(logEntry);

    // Use debounced flush for better performance
    if (this.LOG_BUFFER.length >= this.MAX_BUFFER_SIZE) {
      this.debouncedFlush();
    }

    // Log to console only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Audit Log:', logEntry);
    }
  }

  /**
   * Optimized buffer flushing with error handling
   */
  private static async flushBuffer(): Promise<void> {
    if (this.LOG_BUFFER.length === 0) return;

    const logsToSend = [...this.LOG_BUFFER];
    this.LOG_BUFFER.length = 0; // Clear buffer efficiently

    try {
      const token = this.getAuthToken();
      
      // Use AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      await fetch(`${this.API_BASE_URL}/audit/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ logs: logsToSend }),
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

    } catch (error) {
      console.error('Failed to send audit logs:', error);
      // Re-add logs to buffer for retry (limit to prevent memory issues)
      if (this.LOG_BUFFER.length < this.MAX_BUFFER_SIZE) {
        this.LOG_BUFFER.unshift(...logsToSend.slice(0, 10)); // Only retry first 10
      }
    }
  }

  /**
   * Optimized session ID management
   */
  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('sar_session_id');
    if (!sessionId) {
      sessionId = this.generateRequestId();
      sessionStorage.setItem('sar_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Optimized module detection
   */
  private static getCurrentModule(): string {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? segments[0] : 'unknown';
  }

  /**
   * Optimized auth token retrieval
   */
  private static getAuthToken(): string | null {
    try {
      const token = localStorage.getItem('sar_auth_token');
      return token ? atob(token) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Optimized request ID generation
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize with proper cleanup
   */
  static initialize(): void {
    // Clear any existing timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Set up periodic flush
    this.flushTimer = setInterval(() => {
      this.flushBuffer();
    }, this.FLUSH_INTERVAL);

    // Flush buffer on page unload
    window.addEventListener('beforeunload', () => {
      this.flushBuffer();
    });

    // Log page load
    this.logSuccess(AuditAction.LOGIN_SUCCESS, {
      description: 'User accessed application',
      module: 'authentication'
    });
  }

  /**
   * Cleanup method for proper resource management
   */
  static cleanup(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush remaining logs
    this.flushBuffer();
    
    // Clear caches
    this.sessionId = null;
    this.userAgent = null;
    this.currentModule = null;
  }

  /**
   * Get audit logs with optimized query
   */
  static async getUserLogs(
    userId?: string, 
    dateRange?: { start: Date; end: Date }
  ): Promise<AuditLogEntry[]> {
    try {
      const token = this.getAuthToken();
      const params = new URLSearchParams();
      
      if (userId) params.append('userId', userId);
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.API_BASE_URL}/audit/logs?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.logs || [];
      }

      throw new Error('Failed to fetch audit logs');

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Export audit logs with progress tracking
   */
  static async exportLogs(
    format: 'csv' | 'json' = 'csv',
    dateRange?: { start: Date; end: Date },
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      const token = this.getAuthToken();
      const params = new URLSearchParams();
      
      params.append('format', format);
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }

      onProgress?.(10);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`${this.API_BASE_URL}/audit/logs/export?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      onProgress?.(50);

      if (response.ok) {
        const blob = await response.blob();
        onProgress?.(80);
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        onProgress?.(100);
      }

    } catch (error) {
      console.error('Error exporting audit logs:', error);
      throw error;
    }
  }
}

export const AuditLogger = OptimizedAuditLogger;
