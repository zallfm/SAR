/**
 * Mock Authentication Service for Development
 * Temporary solution until backend is ready
 */
import { User, UserRole } from '../../types';
import { AuditLogger } from './auditLogger';
import { AuditAction } from '../constants/auditActions';

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

// Mock users for development
const MOCK_USERS: User[] = [
  { username: 'admin', password: 'password123', role: UserRole.Admin, name: 'Hesti' },
  { username: 'dph', password: 'password123', role: UserRole.DpH, name: 'DpH User' },
  { username: 'systemowner', password: 'password123', role: UserRole.SystemOwner, name: 'System Owner' },
];

class MockAuthService {
  /**
   * Mock login for development
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user in mock data
    const foundUser = MOCK_USERS.find(
      (user) => user.username === credentials.username && user.password === credentials.password
    );

    if (!foundUser) {
      // Log failed login attempt
      AuditLogger.logFailure(AuditAction.LOGIN_FAILED, new Error('Invalid credentials'), {
        userName: credentials.username,
        description: `Failed login attempt for ${credentials.username}`
      });
      
      throw new Error('Invalid username or password');
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = foundUser;

    // Generate mock tokens
    const token = this.generateMockToken(userWithoutPassword.username);
    const refreshToken = this.generateMockToken(userWithoutPassword.username + '_refresh');
    const expiresIn = 3600; // 1 hour

    const authResponse: AuthResponse = {
      user: userWithoutPassword,
      token,
      refreshToken,
      expiresIn
    };

    // Log successful login
    AuditLogger.logSuccess(AuditAction.LOGIN_SUCCESS, {
      userId: userWithoutPassword.username,
      description: `User ${userWithoutPassword.username} logged in successfully`
    });

    return authResponse;
  }

  /**
   * Mock logout
   */
  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Log logout
    AuditLogger.logSuccess(AuditAction.LOGOUT, {
      description: 'User logged out'
    });
  }

  /**
   * Generate mock JWT token
   */
  private generateMockToken(username: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Check if user is authenticated (mock implementation)
   */
  isAuthenticated(): boolean {
    try {
      const token = localStorage.getItem('sar_auth_token');
      if (!token) return false;

      // Check if token is expired
      const expirationTime = localStorage.getItem('sar_token_expires');
      if (expirationTime && Date.now() > parseInt(expirationTime)) {
        this.clearStoredData();
        return false;
      }

      return true;
    } catch (error) {
      this.clearStoredData();
      return false;
    }
  }

  /**
   * Get current user (mock implementation)
   */
  getCurrentUser(): User | null {
    try {
      const encryptedUser = localStorage.getItem('sar_user_data');
      if (!encryptedUser) return null;

      const userData = this.decryptData(encryptedUser);
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Clear stored data
   */
  private clearStoredData(): void {
    localStorage.removeItem('sar_auth_token');
    localStorage.removeItem('sar_refresh_token');
    localStorage.removeItem('sar_user_data');
    localStorage.removeItem('sar_token_expires');
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
}

export const mockAuthService = new MockAuthService();
