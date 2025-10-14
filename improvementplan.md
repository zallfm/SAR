# Frontend Infrastructure Improvement Plan - Enhanced Security & Quality

## Objective

Full internal refactoring of SAR frontend with enterprise-grade security, standardized error handling, and quality practices to minimize bugs while preserving all existing UI designs and data formats.

## Key Principles

- ✅ NO changes to existing UI/UX designs
- ✅ NO changes to approved data formats/structures
- ✅ TDD/BDD approach for all new functions
- ✅ Comprehensive JSDoc comments on every function
- ✅ Aggressive internal refactor (structure, state, API layer)
- ✅ Enterprise-level security for internal app
- ✅ Standardized error codes for debugging
- ✅ Code quality practices to minimize bugs

---

## Phase 1: Enhanced Security & Error System (Week 1-2)

### 1.1 Standardized Error Code System

**Goal:** Create centralized error handling system for easy debugging

**Files to create:**

- `src/constants/errorCodes.ts` - All error code definitions
- `src/types/errors.ts` - Error interfaces and classes
- `src/utils/errorHandler.ts` - Error handling utilities
- `src/utils/errorLogger.ts` - Error logging with context

**Error Code Structure:**

```typescript
// Format: [MODULE]-[CATEGORY]-[NUMBER]
// AUTH-ERR-001, UAR-ERR-201, API-ERR-401, etc.

export const ERROR_CODES = {
  // Authentication (AUTH-ERR-0xx)
  AUTH_INVALID_CREDENTIALS: 'AUTH-ERR-001',
  AUTH_SESSION_EXPIRED: 'AUTH-ERR-002',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH-ERR-003',
  AUTH_ACCOUNT_LOCKED: 'AUTH-ERR-004',
  AUTH_TOKEN_INVALID: 'AUTH-ERR-005',
  
  // Application Management (APP-ERR-1xx)
  APP_NOT_FOUND: 'APP-ERR-101',
  APP_ALREADY_EXISTS: 'APP-ERR-102',
  APP_INVALID_DATA: 'APP-ERR-103',
  APP_CREATE_FAILED: 'APP-ERR-104',
  APP_UPDATE_FAILED: 'APP-ERR-105',
  APP_DELETE_FAILED: 'APP-ERR-106',
  
  // UAR Operations (UAR-ERR-2xx)
  UAR_RECORD_NOT_FOUND: 'UAR-ERR-201',
  UAR_ALREADY_REVIEWED: 'UAR-ERR-202',
  UAR_REVIEW_INCOMPLETE: 'UAR-ERR-203',
  UAR_APPROVAL_FAILED: 'UAR-ERR-204',
  UAR_STATUS_INVALID: 'UAR-ERR-205',
  
  // Validation (VAL-ERR-3xx)
  VAL_REQUIRED_FIELD: 'VAL-ERR-301',
  VAL_INVALID_FORMAT: 'VAL-ERR-302',
  VAL_OUT_OF_RANGE: 'VAL-ERR-303',
  VAL_DUPLICATE_ENTRY: 'VAL-ERR-304',
  VAL_INVALID_DATE: 'VAL-ERR-305',
  
  // API Communication (API-ERR-4xx)
  API_NETWORK_ERROR: 'API-ERR-401',
  API_TIMEOUT: 'API-ERR-402',
  API_SERVER_ERROR: 'API-ERR-403',
  API_RATE_LIMIT: 'API-ERR-404',
  API_UNAUTHORIZED: 'API-ERR-405',
  
  // System (SYS-ERR-5xx)
  SYS_UNKNOWN_ERROR: 'SYS-ERR-501',
  SYS_CONFIG_ERROR: 'SYS-ERR-502',
  SYS_DATABASE_ERROR: 'SYS-ERR-503',
  SYS_PERMISSION_DENIED: 'SYS-ERR-504',
} as const;

export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid username or password. Please try again.',
  [ERROR_CODES.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please login again.',
  // ... all messages
};
```

**Error Handler Utility:**

```typescript
/**
 * Application Error Class
 * Standardized error with code, message, and debugging context
 */
export class ApplicationError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: unknown,
    public requestId?: string
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
  
  /**
   * Convert to user-friendly format for display
   */
  toUserMessage(): string {
    return `[${this.code}] ${this.message}`;
  }
  
  /**
   * Convert to detailed format for logging
   */
  toLogFormat(): object {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      requestId: this.requestId,
      timestamp: new Date().toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Handle any error and convert to ApplicationError
 * Logs error with context for debugging
 * 
 * @param error - Any error object
 * @param context - Context information (component, function, user action)
 * @returns Standardized ApplicationError
 */
export function handleError(
  error: unknown,
  context?: { component?: string; action?: string; userId?: string }
): ApplicationError {
  // Implementation with logging
}
```

**Testing:**

- `src/constants/__tests__/errorCodes.test.ts` - Validate error code format
- `src/utils/__tests__/errorHandler.test.ts` - Test error transformation
- BDD scenarios for error flows

**Comments Required:**

- JSDoc for every error code with description and when it occurs
- Error handling strategy documentation
- Examples of how to throw and catch errors

### 1.2 Audit Trail System

**Goal:** Complete logging for compliance and debugging

**Files to create:**

- `src/services/auditLogger.ts` - Audit trail implementation
- `src/types/audit.ts` - Audit log types
- `src/constants/auditActions.ts` - Standardized action names

**Audit Log Structure:**

```typescript
/**
 * Audit Log Entry
 * Complete record of user action for compliance and debugging
 */
export interface AuditLogEntry {
  // WHO
  userId: string;
  userName: string;
  userRole: string;
  
  // WHAT
  action: AuditAction;
  module: AuditModule;
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

/**
 * Audit Logger Service
 * Logs all sensitive operations for audit trail
 */
export class AuditLogger {
  /**
   * Log user action
   * Automatically captures user context, timestamp, IP
   */
  static log(action: AuditAction, details: Partial<AuditLogEntry>): void;
  
  /**
   * Log successful operation
   */
  static logSuccess(action: AuditAction, details: Partial<AuditLogEntry>): void;
  
  /**
   * Log failed operation with error
   */
  static logFailure(action: AuditAction, error: ApplicationError, details: Partial<AuditLogEntry>): void;
  
  /**
   * Get audit logs for a user
   */
  static getLogsByUser(userId: string, dateRange?: DateRange): Promise<AuditLogEntry[]>;
  
  /**
   * Get audit logs for an action
   */
  static getLogsByAction(action: AuditAction, dateRange?: DateRange): Promise<AuditLogEntry[]>;
}

// Predefined actions to log
export enum AuditAction {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  
  // Application Management
  APP_CREATE = 'APP_CREATE',
  APP_UPDATE = 'APP_UPDATE',
  APP_DELETE = 'APP_DELETE',
  APP_STATUS_CHANGE = 'APP_STATUS_CHANGE',
  
  // UAR Operations
  UAR_REVIEW_START = 'UAR_REVIEW_START',
  UAR_REVIEW_SUBMIT = 'UAR_REVIEW_SUBMIT',
  UAR_APPROVE = 'UAR_APPROVE',
  UAR_REJECT = 'UAR_REJECT',
  UAR_COMMENT_ADD = 'UAR_COMMENT_ADD',
  
  // Data Export
  DATA_EXPORT = 'DATA_EXPORT',
  REPORT_GENERATE = 'REPORT_GENERATE',
  
  // System
  CONFIG_CHANGE = 'CONFIG_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}
```

**Usage Example:**

```typescript
// In component
async function handleApprove(record: UarRecord) {
  try {
    await approveRecord(record.id);
    
    // Log success
    AuditLogger.logSuccess(AuditAction.UAR_APPROVE, {
      targetId: record.id,
      description: `Approved UAR record ${record.uarId}`,
      oldValue: { status: 'pending' },
      newValue: { status: 'approved' },
    });
  } catch (error) {
    // Log failure
    const appError = handleError(error, { 
      component: 'UarSystemOwnerDetailPage',
      action: 'approve' 
    });
    
    AuditLogger.logFailure(AuditAction.UAR_APPROVE, appError, {
      targetId: record.id,
    });
  }
}
```

**Testing:**

- Test audit log creation
- Test log retrieval and filtering
- Test log format consistency
- Integration tests for audit trail

### 1.3 Session Management & Security

**Goal:** Enterprise-level session security

**Files to create:**

- `src/config/security.ts` - Security configuration
- `src/services/sessionManager.ts` - Session lifecycle management
- `src/services/securityMonitor.ts` - Security event monitoring

**Security Configuration:**

```typescript
/**
 * Security Configuration for Internal Enterprise Application
 */
export const SECURITY_CONFIG = {
  // Session Management
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,        // 30 minutes inactivity
  SESSION_WARNING_MS: 5 * 60 * 1000,         // 5 min warning before timeout
  TOKEN_REFRESH_THRESHOLD_MS: 5 * 60 * 1000, // Refresh token 5 min before expiry
  MAX_SESSION_DURATION_MS: 8 * 60 * 60 * 1000, // 8 hours max session
  
  // Authentication Security
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000,      // 15 minutes lockout
  PASSWORD_MIN_LENGTH: 8,                    // For future real auth
  REQUIRE_STRONG_PASSWORD: true,
  
  // Rate Limiting
  MAX_API_CALLS_PER_MINUTE: 60,
  MAX_FAILED_REQUESTS: 10,
  
  // Data Protection
  ENCRYPT_LOCALSTORAGE: true,
  CLEAR_DATA_ON_LOGOUT: true,
  SANITIZE_USER_INPUT: true,
  
  // Monitoring
  LOG_FAILED_AUTH_ATTEMPTS: true,
  LOG_SUSPICIOUS_ACTIVITY: true,
  ALERT_ON_MULTIPLE_FAILED_LOGINS: true,
} as const;
```

**Session Manager:**

```typescript
/**
 * Session Manager
 * Handles session lifecycle, timeout, and security
 */
export class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private lastActivityTime: number = Date.now();
  private activityListeners: (() => void)[] = [];
  
  /**
   * Initialize session with activity tracking
   * Starts inactivity timer and listens for user activity
   */
  startSession(userId: string, token: string): void {
    this.setupActivityListeners();
    this.resetInactivityTimer();
    
    AuditLogger.log(AuditAction.SESSION_START, {
      userId,
      description: 'User session started',
    });
  }
  
  /**
   * Track user activity and reset timeout
   * Called on mouse move, keyboard, clicks
   */
  private trackActivity(): void {
    this.lastActivityTime = Date.now();
    this.resetInactivityTimer();
  }
  
  /**
   * Show warning modal before auto-logout
   */
  private showSessionWarning(): void {
    // Display warning modal with countdown
    // Option to extend session or logout now
  }
  
  /**
   * End session and cleanup
   */
  endSession(reason: 'logout' | 'timeout' | 'security'): void {
    this.cleanup();
    this.clearSecureData();
    
    AuditLogger.log(
      reason === 'timeout' ? AuditAction.SESSION_TIMEOUT : AuditAction.LOGOUT,
      { description: `Session ended: ${reason}` }
    );
  }
  
  /**
   * Validate if current session is still valid
   */
  validateSession(): boolean {
    const sessionAge = Date.now() - this.lastActivityTime;
    return sessionAge < SECURITY_CONFIG.SESSION_TIMEOUT_MS;
  }
  
  /**
   * Clear all sensitive data from storage
   */
  private clearSecureData(): void {
    localStorage.clear();
    sessionStorage.clear();
  }
}
```

**Testing:**

- Test session timeout functionality
- Test activity tracking
- Test session warning
- Test automatic logout
- Integration tests for session flow

### 1.4 Environment Variables & Basic Security

**Goal:** Remove hardcoded credentials and setup environment

**Files to create:**

- `.env.local` - Local development credentials (gitignored)
- `.env.example` - Template for team
- `.env.development` - Development environment
- `.env.production` - Production environment (template only)
- `src/services/mockAuthService.ts` - Mock auth with env vars

**Files to modify:**

- `constants.ts` - Remove password field completely
- `components/LoginPage.tsx` - Use mockAuthService
- `.gitignore` - Add all .env* except .env.example

**Mock Auth Service:**

```typescript
/**
 * Mock Authentication Service
 * Uses environment variables for credentials
 * Simulates real authentication flow for development
 * 
 * Security Note: This is for development only.
 * Production must use real authentication API.
 */
export class MockAuthService {
  /**
   * Authenticate user with credentials
   * 
   * @param username - User's username
   * @param password - User's password
   * @returns User object and auth token, or null if invalid
   * @throws {ApplicationError} With specific error code
   */
  static async login(
    username: string,
    password: string
  ): Promise<{ user: User; token: string } | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Validate against env variables
    const envPassword = this.getEnvPassword(username);
    
    if (!envPassword) {
      throw new ApplicationError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS],
        { username }
      );
    }
    
    if (password !== envPassword) {
      // Log failed attempt
      AuditLogger.logFailure(AuditAction.LOGIN_FAILED, 
        new ApplicationError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid password'),
        { description: `Failed login attempt for ${username}` }
      );
      
      return null;
    }
    
    // Generate mock token
    const token = this.generateMockToken(username);
    const user = this.getUserByUsername(username);
    
    if (!user) {
      throw new ApplicationError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]
      );
    }
    
    // Log successful login
    AuditLogger.logSuccess(AuditAction.LOGIN_SUCCESS, {
      userId: user.username,
      description: `User ${username} logged in successfully`,
    });
    
    return { user, token };
  }
  
  /**
   * Logout user and clear session
   */
  static async logout(): Promise<void> {
    const sessionManager = SessionManager.getInstance();
    sessionManager.endSession('logout');
  }
}
```

**Testing:**

- `src/services/__tests__/mockAuthService.test.ts`
- BDD scenarios: successful login, failed login, invalid credentials
- Test error code generation
- Test audit logging integration

---

## Phase 2: Code Quality Foundation (Week 2-3)

### 2.1 TypeScript Strict Mode & Type Safety

**Goal:** Maximum type safety to catch bugs early

**Files to modify:**

- `tsconfig.json` - Enable strict mode options
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```


**Actions:**

- Fix all type errors from strict mode
- Remove all `any` types
- Add proper null checks
- Add proper type guards

**Testing:**

- Verify TypeScript compilation with no errors
- Test type inference

### 2.2 ESLint & Prettier Setup

**Goal:** Consistent code style and catch common bugs

**Install:**

```bash
npm install -D eslint prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-config-prettier eslint-plugin-prettier
```

**Files to create:**

- `.eslintrc.js` - ESLint configuration
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    // Error prevention
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    
    // Code quality
    'complexity': ['warn', 10], // Max cyclomatic complexity
    'max-depth': ['warn', 3],   // Max nesting depth
    'max-lines-per-function': ['warn', 100],
    
    // React specific
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  }
};
```

- `.prettierrc` - Prettier configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```


### 2.3 Pre-commit Hooks with Husky

**Goal:** Prevent bad code from being committed

**Install:**

```bash
npm install -D husky lint-staged
npx husky install
```

**Files to create:**

- `.husky/pre-commit` - Pre-commit hook
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
npm run test -- --bail --findRelatedTests
```

- `package.json` - Add lint-staged configuration
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "npm run test -- --bail --findRelatedTests"
    ]
  }
}
```


**Benefits:**

- Auto-fix linting errors before commit
- Auto-format code
- Run tests for modified files
- Prevent commits with errors

### 2.4 Project Structure Reorganization

**Goal:** Clean, scalable folder structure

**New Structure:**

```
src/
├── api/                      # API layer
│   ├── client.ts
│   ├── auth.api.ts
│   ├── application.api.ts
│   ├── uar.api.ts
│   ├── types.ts
│   └── __tests__/
├── components/
│   ├── common/               # Reusable UI components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   ├── LoadingSpinner/
│   │   └── ErrorMessage/
│   ├── features/             # Feature-specific components
│   │   ├── auth/
│   │   │   ├── LoginPage/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── LoginPage.test.tsx
│   │   │   │   └── index.ts
│   │   ├── application/
│   │   ├── uar/
│   │   ├── schedule/
│   │   └── system-master/
│   ├── layout/               # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Dashboard.tsx
│   └── icons/                # SVG icons
├── config/                   # Configuration
│   ├── security.ts
│   └── app.ts
├── constants/                # Constants
│   ├── errorCodes.ts
│   ├── auditActions.ts
│   └── index.ts
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   ├── useDebounce.ts
│   └── __tests__/
├── schemas/                  # Validation schemas
│   ├── auth.schema.ts
│   ├── application.schema.ts
│   └── __tests__/
├── services/                 # Business logic services
│   ├── mockAuthService.ts
│   ├── sessionManager.ts
│   ├── auditLogger.ts
│   └── __tests__/
├── store/                    # Zustand state management
│   ├── authStore.ts
│   ├── applicationStore.ts
│   ├── uarStore.ts
│   ├── uiStore.ts
│   └── __tests__/
├── types/                    # TypeScript types
│   ├── index.ts
│   ├── errors.ts
│   ├── audit.ts
│   └── api.ts
├── utils/                    # Utility functions
│   ├── dateFormatter.ts
│   ├── errorHandler.ts
│   ├── errorLogger.ts
│   └── __tests__/
└── styles/                   # Global styles
    └── index.css
```

**Migration Steps:**

1. Create folder structure
2. Move files incrementally (one module at a time)
3. Update imports after each module
4. Run tests after each module
5. Verify app works after each module

**Testing:**

- Verify all imports resolve
- Run full test suite after migration
- Manual testing of all features

---

## Phase 3: State Management with Zustand (Week 3-4)

### 3.1 Install and Setup Zustand

**Install:**
```bash
npm install zustand
```

### 3.2 Create Store Structure

**Files to create:**
- `src/store/authStore.ts` - Authentication state
- `src/store/applicationStore.ts` - Applications data
- `src/store/uarStore.ts` - UAR records
- `src/store/uiStore.ts` - UI state (modals, notifications)

**Auth Store Example:**
```typescript
/**
 * Authentication Store
 * Manages user authentication state and operations
 * 
 * @module authStore
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MockAuthService } from '../services/mockAuthService';
import { AuditLogger } from '../services/auditLogger';
import { AuditAction } from '../constants/auditActions';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: ApplicationError | null;
  
  /**
   * Login user with credentials
   * 
   * @param username - User's username
   * @param password - User's password
   * @throws {ApplicationError} With error code
   */
  login: (username: string, password: string) => Promise<void>;
  
  /**
   * Logout current user
   * Clears session and redirects to login
   */
  logout: () => void;
  
  /**
   * Refresh authentication token
   */
  refreshToken: () => Promise<void>;
  
  /**
   * Clear error state
   */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        
        try {
          const result = await MockAuthService.login(username, password);
          
          if (result) {
            set({
              user: result.user,
              token: result.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new ApplicationError(
              ERROR_CODES.AUTH_INVALID_CREDENTIALS,
              ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS]
            );
          }
        } catch (error) {
          const appError = handleError(error, { action: 'login' });
          set({ error: appError, isLoading: false });
          throw appError;
        }
      },
      
      logout: () => {
        const { user } = get();
        
        if (user) {
          AuditLogger.log(AuditAction.LOGOUT, {
            userId: user.username,
            description: 'User logged out',
          });
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      refreshToken: async () => {
        // Implementation for token refresh
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

**Testing:**
- `src/store/__tests__/authStore.test.ts` - Test all store actions
- TDD approach with BDD scenarios
- Mock services and test state changes

### 3.3 Replace Component State

**Files to modify:**
- `App.tsx` - Use authStore instead of local state
- `Dashboard.tsx` - Use stores for data
- All components with local state

**Keep UI exactly same** - only internal state logic changes

---

## Phase 4: API Layer & Data Services (Week 4-5)

### 4.1 Create API Client

**Files to create:**
- `src/api/client.ts` - Axios instance with interceptors

```typescript
/**
 * API Client
 * Configured Axios instance with interceptors for auth and error handling
 */
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { handleError } from '../utils/errorHandler';
import { ERROR_CODES } from '../constants/errorCodes';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await useAuthStore.getState().refreshToken();
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        throw handleError(refreshError);
      }
    }
    
    // Convert to ApplicationError with code
    throw handleError(error, { component: 'API' });
  }
);

export default apiClient;
```

### 4.2 Create API Services

**Files to create:**
- `src/api/auth.api.ts`
- `src/api/application.api.ts`
- `src/api/uar.api.ts`

**Currently returns mock data with simulated delay**

**Testing:**
- Mock axios
- Test request/response interceptors
- Test error handling with error codes

---

## Phase 5: Validation & Forms (Week 5-6)

### 5.1 Install Libraries

```bash
npm install zod react-hook-form @hookform/resolvers/zod
npm install dompurify
npm install -D @types/dompurify
```

### 5.2 Create Validation Schemas

**Files to create:**
- `src/schemas/auth.schema.ts`
- `src/schemas/application.schema.ts`
- `src/schemas/uar.schema.ts`

**With TDD/BDD testing and comprehensive JSDoc**

### 5.3 Update Forms

Update all forms with validation, keeping UI identical

---

## Phase 6: Loading & Error States (Week 6-7)

### 6.1 Create UI Components

**Files to create:**
- `src/components/common/LoadingSpinner.tsx`
- `src/components/common/LoadingOverlay.tsx`
- `src/components/common/ErrorMessage.tsx`
- `src/components/common/ErrorBoundary.tsx`

**Match existing app styling**

### 6.2 Add Loading States

Add to all async operations while keeping UI consistent

---

## Phase 7: Custom Hooks (Week 7-8)

### 7.1 Create Hooks

**Files to create:**
- `src/hooks/useAuth.ts`
- `src/hooks/useApi.ts`
- `src/hooks/useDebounce.ts`
- `src/hooks/useLocalStorage.ts`
- `src/hooks/useClickOutside.ts`

**With comprehensive tests and JSDoc**

### 7.2 Refactor Components

Replace duplicate logic with hooks

---

## Phase 8: Comprehensive Testing (Week 8-9)

### 8.1 Unit Tests

**Goal:** 80%+ coverage for utilities and services

**Test all:**
- Utils, services, API functions
- Validation schemas, hooks
- With TDD/BDD approach

### 8.2 Component Tests

**Goal:** 75%+ coverage for React components

**Test all:**
- Common components, feature components
- User interactions, error states
- With React Testing Library

### 8.3 Integration Tests

**Goal:** Test full user flows

**Test scenarios:**
- Auth flow, CRUD operations
- UAR review flow, error handling

### 8.4 End-to-End Testing dengan Playwright

**Goal:** Automated E2E testing for critical paths and regression prevention

**Install Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Folder Structure:**
```
e2e/
├── fixtures/
│   ├── auth.fixture.ts          # Reusable auth fixture
│   └── data.fixture.ts           # Test data fixtures
├── pages/                        # Page Object Model
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── ApplicationPage.ts
│   ├── UarSystemOwnerPage.ts
│   └── UarDetailPage.ts
├── tests/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── logout.spec.ts
│   │   └── session-timeout.spec.ts
│   ├── application/
│   │   ├── create-application.spec.ts
│   │   ├── edit-application.spec.ts
│   │   └── delete-application.spec.ts
│   ├── uar/
│   │   ├── uar-review-flow.spec.ts
│   │   ├── uar-approve-flow.spec.ts
│   │   └── uar-bulk-operations.spec.ts
│   └── integration/
│       ├── full-user-journey.spec.ts
│       └── critical-paths.spec.ts
└── utils/
    ├── helpers.ts
    └── test-data.ts
```

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/junit.xml' }]
  ],
  
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Page Object Model Example:**
```typescript
/**
 * Login Page Object
 * Encapsulates login page interactions
 */
export class LoginPage {
  constructor(private page: Page) {}
  
  private selectors = {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    loginButton: 'button[type="submit"]',
    errorMessage: '[role="alert"]',
  };
  
  async goto(): Promise<void> {
    await this.page.goto('/');
  }
  
  async login(username: string, password: string): Promise<void> {
    await this.page.fill(this.selectors.usernameInput, username);
    await this.page.fill(this.selectors.passwordInput, password);
    await this.page.click(this.selectors.loginButton);
  }
  
  async getErrorMessage(): Promise<string> {
    return await this.page.textContent(this.selectors.errorMessage) || '';
  }
}
```

**E2E Test Example:**
```typescript
// e2e/tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Authentication Flow', () => {
  let loginPage: LoginPage;
  
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });
  
  /**
   * BDD: Given I am on login page
   *      When I enter valid credentials
   *      Then I should be redirected to dashboard
   */
  test('should login successfully', async ({ page }) => {
    await loginPage.login('admin', 'password123');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Hesti')).toBeVisible();
  });
  
  /**
   * BDD: When I enter invalid credentials
   *      Then I should see error with error code
   */
  test('should show error with code', async ({ page }) => {
    await loginPage.login('admin', 'wrongpass');
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('AUTH-ERR-001');
    expect(errorMessage).toContain('Invalid username or password');
  });
});
```

**Critical Path Test:**
```typescript
// e2e/tests/integration/full-user-journey.spec.ts
test('Critical: Login → Create App → Review UAR → Logout', async ({ page }) => {
  // 1. Login
  await page.goto('/');
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
  
  // 2. Create application
  await page.click('text=Application');
  await page.click('button:has-text("Add Application")');
  await page.fill('input[name="id"]', `TEST_${Date.now()}`);
  await page.fill('input[name="name"]', 'Test App');
  await page.click('button:has-text("Save")');
  await expect(page.locator('.toast-success')).toBeVisible();
  
  // 3. Review UAR
  await page.click('text=UAR System Owner');
  await page.click('button:has-text("Review")').first();
  
  // 4. Logout
  await page.click('[aria-label="User menu"]');
  await page.click('text=Logout');
  await expect(page).toHaveURL(/.*login/);
});
```

**Update package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:headed": "playwright test --headed",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

**E2E Testing Coverage:**
- ✅ All critical user paths
- ✅ Authentication flows (login, logout, timeout)
- ✅ Application CRUD operations
- ✅ Complete UAR review flow
- ✅ Error code verification
- ✅ Cross-browser testing
- ✅ Regression prevention

**Estimasi Phase 8:**
- Unit tests: 8 hours
- Component tests: 12 hours
- Integration tests: 8 hours
- E2E setup & tests: 18 hours
- **Total: 46 hours (~6 days)**

---

## Phase 9: Documentation (Week 9-10)

### 9.1 JSDoc for All Functions

**Standard format with examples for every function**

### 9.2 Update BDD Documentation

**Add scenarios for all new features**

### 9.3 Technical Documentation

**Files to create:**
- `docs/ARCHITECTURE.md`
- `docs/STATE_MANAGEMENT.md`
- `docs/API_INTEGRATION.md`
- `docs/TESTING_GUIDE.md`
- `docs/ERROR_CODES.md`
- `docs/MIGRATION_GUIDE.md`

---

## Phase 10: Performance & Polish (Week 10-12)

### 10.1 Performance Optimization

- React.memo for expensive components
- useMemo and useCallback
- Lazy loading for routes
- Bundle size analysis

### 10.2 Final Code Quality

- Fix all ESLint errors
- Remove unused code
- Consistent formatting
- TypeScript strict mode fixes

### 10.3 Security Audit

- Review all security implementations
- Test session management
- Verify audit logging
- Check error handling

### 10.4 Final Verification
(State Management, API Layer, Validation, Loading States, Hooks, Testing, Documentation, Performance)
All subsequent phases remain the same as original plan, but now with:
- Error codes used everywhere
- Audit logging on all sensitive operations
- Enhanced security checks
- Comprehensive JSDoc comments
- TDD/BDD approach
- Type safety enforced

**Checklist:**
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] TypeScript strict mode
- [ ] All functions documented
- [ ] Error codes everywhere
- [ ] Audit logging works
- [ ] UI identical to before
- [ ] Data formats unchanged
- [ ] E2E tests pass all browsers

---

## Success Criteria (Enhanced)

### ✅ Security (Enterprise-level)

- Session management with timeout
- Audit trail for all actions
- No hardcoded credentials
- Environment variables properly used
- Session validation on critical operations
- Auto-logout on inactivity

### ✅ Error Handling (Production-ready)

- Standardized error codes throughout
- User-friendly error messages
- Detailed error logging for debugging
- Error context captured (user, action, timestamp)
- Error code documentation complete

### ✅ Code Quality (Minimal Bugs)

- TypeScript strict mode enabled
- ESLint with no errors
- Prettier formatting consistent
- Pre-commit hooks prevent bad commits
- Complexity metrics under thresholds
- No console.log in production code

### ✅ Audit & Compliance

- All sensitive operations logged
- Audit logs include WHO, WHAT, WHEN, WHERE
- Audit logs exportable for investigations
- Compliance with internal security policies

### ✅ Testing (High Coverage)

- 80%+ test coverage
- All error scenarios tested
- Security features tested
- Audit logging tested
- TDD/BDD approach followed

### ✅ Documentation (Complete)

- Every function has JSDoc
- Error codes documented
- Security configuration documented
- Architecture documented
- Migration guide complete

---

## Debugging Support

### Error Code Reference

All errors include standardized codes for easy debugging:

```
[AUTH-ERR-001] Invalid credentials
→ Check: username/password correct, account not locked
→ Logs: Check audit logs for failed login attempts

[UAR-ERR-203] Review incomplete
→ Check: All required fields filled, validation passed
→ Logs: Check audit logs for review submission errors
```

### Audit Trail Queries

```typescript
// Find all failed login attempts
AuditLogger.getLogsByAction(AuditAction.LOGIN_FAILED);

// Find all actions by specific user
AuditLogger.getLogsByUser('admin');

// Find all errors in date range
AuditLogger.getLogsWithErrors(dateRange);
```

### Development Tools

- Redux DevTools for state inspection
- Error boundary with stack traces
- Console logging in development mode only
- Request ID tracking for API calls

---

## Timeline Summary (Updated)

- **Week 1-2:** Enhanced security, error system, audit trail
- **Week 2-3:** Code quality setup, TypeScript strict mode, folder structure
- **Week 3-4:** State management (Zustand)
- **Week 4-5:** API layer & data services
- **Week 5-6:** Validation & forms
- **Week 6-7:** Loading & error states
- **Week 7-8:** Custom hooks
- **Week 8-9:** Comprehensive testing
- **Week 9-10:** Documentation
- **Week 10-11:** Performance & polish
- **Week 11-12:** Security audit & final verification

**Total:** 12 weeks for enterprise-grade infrastructure