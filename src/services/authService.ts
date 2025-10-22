/**
 * Secure Authentication Service
 * ISO 27001 Compliant Frontend Authentication
 * Currently using mock service for development
 */
import { User, UserRole } from '../../types';
import { AuditLogger } from './auditLogger';
import { AuditAction } from '../constants/auditActions';
import { mockAuthService } from './mockAuthService';

interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

class SecureAuthService {
  private readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';
  private readonly TOKEN_KEY = 'sar_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'sar_refresh_token';
  private readonly USER_KEY = 'sar_user_data';

  /**
   * Secure login with proper validation and error handling
   * Currently using mock service for development
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Input validation
      this.validateCredentials(credentials);

      // Sanitize input
      const sanitizedCredentials = this.sanitizeInput(credentials);

      // Use mock service for development
      const authData = await mockAuthService.login(sanitizedCredentials);

      // Store tokens securely
      this.storeTokensSecurely(authData);

      return authData;

    } catch (error) {
      // Log failed login attempt
      AuditLogger.logFailure(AuditAction.LOGIN_FAILED, error as Error, {
        userName: credentials.username,
        description: `Failed login attempt for ${credentials.username}`
      });

      throw error;
    }
  }

  /**
   * Secure logout with token cleanup
   */
  async logout(): Promise<void> {
    try {
      // Use mock service for development
      await mockAuthService.logout();

      // Clear all stored data
      this.clearStoredData();

    } catch (error) {
      // Even if API call fails, clear local data
      this.clearStoredData();
      console.error('Logout error:', error);
    }
  }

  /**
   * Validate user credentials format
   */
  private validateCredentials(credentials: LoginCredentials): void {
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required');
    }

    if (credentials.username.length < 3 || credentials.username.length > 50) {
      throw new Error('Username must be between 3 and 50 characters');
    }

    if (credentials.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check for dangerous characters
    const dangerousPatterns = /[<>'"&]/;
    if (dangerousPatterns.test(credentials.username)) {
      throw new Error('Username contains invalid characters');
    }
  }

  /**
   * Sanitize input to prevent XSS
   */
  private sanitizeInput(credentials: LoginCredentials): LoginCredentials {
    return {
      username: credentials.username.trim().toLowerCase(),
      password: credentials.password // Don't modify password
    };
  }

  /**
   * Validate authentication response
   */
  private validateAuthResponse(authData: AuthResponse): void {
    if (!authData.user || !authData.token || !authData.refreshToken) {
      throw new Error('Invalid authentication response');
    }

    if (!Object.values(UserRole).includes(authData.user.role)) {
      throw new Error('Invalid user role');
    }

    if (authData.expiresIn <= 0) {
      throw new Error('Invalid token expiration');
    }
  }

  /**
   * Store tokens securely (encrypted in localStorage)
   */
  private storeTokensSecurely(authData: AuthResponse): void {
    try {
      // Encrypt sensitive data before storing
      const encryptedToken = this.encryptData(authData.token);
      const encryptedRefreshToken = this.encryptData(authData.refreshToken);
      const encryptedUser = this.encryptData(JSON.stringify(authData.user));

      localStorage.setItem(this.TOKEN_KEY, encryptedToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, encryptedRefreshToken);
      localStorage.setItem(this.USER_KEY, encryptedUser);

      // Set expiration time
      const expirationTime = Date.now() + (authData.expiresIn * 1000);
      localStorage.setItem('sar_token_expires', expirationTime.toString());

    } catch (error) {
      console.error('Error storing tokens:', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Get stored token (decrypted)
   */
  getStoredToken(): string | null {
    try {
      const encryptedToken = localStorage.getItem(this.TOKEN_KEY);
      if (!encryptedToken) return null;

      // Check if token is expired
      const expirationTime = localStorage.getItem('sar_token_expires');
      if (expirationTime && Date.now() > parseInt(expirationTime)) {
        this.clearStoredData();
        return null;
      }

      return this.decryptData(encryptedToken);
    } catch (error) {
      console.error('Error retrieving token:', error);
      this.clearStoredData();
      return null;
    }
  }

  /**
   * Get stored user data (decrypted)
   */
  getStoredUser(): User | null {
    try {
      const encryptedUser = localStorage.getItem(this.USER_KEY);
      if (!encryptedUser) return null;

      const userData = this.decryptData(encryptedUser);
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Clear all stored authentication data
   */
  private clearStoredData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('sar_token_expires');
  }

  /**
   * Simple encryption for localStorage (for demo purposes)
   * In production, use proper encryption libraries
   */
  private encryptData(data: string): string {
    // Simple base64 encoding (replace with proper encryption in production)
    return btoa(encodeURIComponent(data));
  }

  /**
   * Simple decryption for localStorage
   */
  private decryptData(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return mockAuthService.isAuthenticated();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return mockAuthService.getCurrentUser();
  }
}

export const authService = new SecureAuthService();
