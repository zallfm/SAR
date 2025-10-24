/**
 * Audit Logger Service
 * ISO 27001 Compliant Frontend Audit Logging
 */
import { AuditAction } from '../constants/auditActions';

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

export class AuditLogger {
  private static readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
  private static readonly LOG_BUFFER: AuditLogEntry[] = [];
  private static readonly MAX_BUFFER_SIZE = 100;
  private static readonly FLUSH_INTERVAL = 30000; // 30 seconds

  /**
   * Log user action
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
   * Create standardized log entry
   */
  private static createLogEntry(
    action: AuditAction,
    details: Partial<AuditLogEntry>,
    status: 'success' | 'failure' | 'warning'
  ): AuditLogEntry {
    const timestamp = new Date().toISOString();
    const requestId = this.generateRequestId();
    const sessionId = this.getSessionId();

    return {
      // WHO
      userId: details.userId || this.getCurrentUserId() || 'anonymous',
      userName: details.userName || this.getCurrentUserName() || 'Unknown',
      userRole: details.userRole || this.getCurrentUserRole() || 'Unknown',

      // WHAT
      action,
      module: details.module || this.getCurrentModule(),
      description: details.description || `${action} action performed`,

      // WHEN
      timestamp,

      // WHERE
      ipAddress: details.ipAddress || this.getClientIP(),
      userAgent: details.userAgent || navigator.userAgent,
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

      // CONTEXT
      requestId,
      sessionId
    };
  }

  /**
   * Add log entry to buffer
   */
  private static addToBuffer(logEntry: AuditLogEntry): void {
    this.LOG_BUFFER.push(logEntry);

    // Flush buffer if it's full
    if (this.LOG_BUFFER.length >= this.MAX_BUFFER_SIZE) {
      this.flushBuffer();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Audit Log:', logEntry);
    }
  }

  /**
   * Flush log buffer to server
   */
  private static async flushBuffer(): Promise<void> {
    if (this.LOG_BUFFER.length === 0) return;

    // kirim satu-satu supaya BE yang sekarang gampang
    const logsToSend = [...this.LOG_BUFFER];
    this.LOG_BUFFER.length = 0;

    try {
      const token = this.getAuthToken();
      for (const log of logsToSend) {
        await fetch(`${this.API_BASE_URL}/sar/log_monitoring`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(log),
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Failed to send audit logs:', error);
      // kalau gagal, balikin ke buffer biar dicoba lagi nanti
      this.LOG_BUFFER.unshift(...logsToSend);
    }
  }


  /**
   * Get current user ID
   */
  private static getCurrentUserId(): string | null {
    try {
      const userData = localStorage.getItem('sar_user_data');
      if (userData) {
        const user = JSON.parse(atob(userData));
        return user.username;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
    return null;
  }

  /**
   * Get current user name
   */
  private static getCurrentUserName(): string | null {
    try {
      const userData = localStorage.getItem('sar_user_data');
      if (userData) {
        const user = JSON.parse(atob(userData));
        return user.name;
      }
    } catch (error) {
      console.error('Error getting current user name:', error);
    }
    return null;
  }

  /**
   * Get current user role
   */
  private static getCurrentUserRole(): string | null {
    try {
      const userData = localStorage.getItem('sar_user_data');
      if (userData) {
        const user = JSON.parse(atob(userData));
        return user.role;
      }
    } catch (error) {
      console.error('Error getting current user role:', error);
    }
    return null;
  }

  /**
   * Get current module/component
   */
  private static getCurrentModule(): string {
    const path = window.location.pathname;
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? segments[0] : 'unknown';
  }

  /**
   * Get client IP (if available)
   */
  private static getClientIP(): string | undefined {
    // In a real application, this would be provided by the server
    // For now, we'll use a placeholder
    return 'client-ip-not-available';
  }

  /**
   * Get session ID
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
   * Get authentication token
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
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize audit logger
   */
  static initialize(): void {
    // Flush buffer periodically
    setInterval(() => {
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
   * Get audit logs for current user
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

      const response = await fetch(`${this.API_BASE_URL}/audit/logs?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });

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
   * Export audit logs
   */
  static async exportLogs(
    format: 'csv' | 'json' = 'csv',
    dateRange?: { start: Date; end: Date }
  ): Promise<void> {
    try {
      const token = this.getAuthToken();
      const params = new URLSearchParams();

      params.append('format', format);
      if (dateRange) {
        params.append('startDate', dateRange.start.toISOString());
        params.append('endDate', dateRange.end.toISOString());
      }

      const response = await fetch(`${this.API_BASE_URL}/audit/logs/export?${params}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  }
}
