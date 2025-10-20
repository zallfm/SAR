import React, { useState, useEffect } from 'react';
import type { User } from '../../../../../types';
import { SystemIcon } from '../../../icons/SystemIcon';
import { EyeIcon } from '../../../icons/EyeIcon';
import { EyeSlashIcon } from '../../../icons/EyeSlashIcon';
import { ExclamationCircleIcon } from '../../../icons/ExclamationCircleIcon';
import { useLogging } from '../../../../hooks/useLogging';
import { sessionManager } from '../../../../services/sessionManager';
import { authService } from '../../../../services/authService';
import { SecurityValidator } from '../../../../services/securityValidator';
import { AuditLogger } from '../../../../services/auditLogger';
import { AuditAction } from '../../../../constants/auditActions';
import { SECURITY_CONFIG } from '../../../../config/security';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string[];
    password?: string[];
  }>({});
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>({});
  const [isLocked, setIsLocked] = useState<Record<string, boolean>>({});
  const { logAuthentication, logSecurity } = useLogging();

  // Initialize security on component mount
  useEffect(() => {
    // Check if user is already authenticated
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user) {
        onLoginSuccess(user);
        return;
      }
    }

    // Initialize audit logger
    AuditLogger.initialize();
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setIsLoading(true);

    try {
      // Check if account is locked
      if (isLocked[username]) {
        setError('Account is temporarily locked due to multiple failed attempts. Please try again later.');
        AuditLogger.logWarning(AuditAction.ACCOUNT_LOCKED, {
          userName: username,
          description: 'Login attempt on locked account'
        });
        return;
      }

      // Validate input (using development mode for relaxed password validation)
      const usernameValidation = SecurityValidator.validateUsername(username);
      const passwordValidation = SecurityValidator.validatePassword(password, true); // true = development mode

      if (!usernameValidation.isValid || !passwordValidation.isValid) {
        setValidationErrors({
          username: usernameValidation.errors,
          password: passwordValidation.errors
        });
        setError('Please correct the validation errors below.');
        return;
      }

      // Attempt login with secure service
      const authResponse = await authService.login({
        username: usernameValidation.sanitizedValue,
        password: passwordValidation.sanitizedValue
      });

      // Reset failed attempts on successful login
      setFailedAttempts(prev => ({ ...prev, [username]: 0 }));
      setIsLocked(prev => ({ ...prev, [username]: false }));

      // Create session
      sessionManager.createSession({
        userId: authResponse.user.username,
        username: authResponse.user.username,
        role: authResponse.user.role,
        name: authResponse.user.name,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
      });

      // Log successful login
      logAuthentication('login_success', {
        username: authResponse.user.username,
        role: authResponse.user.role,
        name: authResponse.user.name,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      onLoginSuccess(authResponse.user);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);

      // Track failed attempts
      const currentAttempts = (failedAttempts[username] || 0) + 1;
      setFailedAttempts(prev => ({ ...prev, [username]: currentAttempts }));

      // Log failed login attempt
      logAuthentication('login_failed', {
        username: username,
        reason: 'invalid_credentials',
        attemptNumber: currentAttempts,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // Lock account after max attempts
      if (currentAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        setIsLocked(prev => ({ ...prev, [username]: true }));
        
        // Set auto-unlock timer
        setTimeout(() => {
          setIsLocked(prev => ({ ...prev, [username]: false }));
          setFailedAttempts(prev => ({ ...prev, [username]: 0 }));
        }, SECURITY_CONFIG.LOCKOUT_DURATION_MS);

        AuditLogger.logWarning(AuditAction.ACCOUNT_LOCKED, {
          userName: username,
          description: `Account locked after ${currentAttempts} failed attempts`
        });
      }

      // Log suspicious activity for multiple failed attempts
      if (currentAttempts >= 3) {
        logSecurity('multiple_failed_login_attempts', {
          username: username,
          attemptCount: currentAttempts,
          ip: '127.0.0.1',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }, 'Warning');
      }

      // Log potential brute force attack
      if (currentAttempts >= 5) {
        logSecurity('potential_brute_force_attack', {
          username: username,
          attemptCount: currentAttempts,
          ip: '127.0.0.1',
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }, 'Error');
      }

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* Left Panel: Branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-12 bg-stone-50 text-center">
          <SystemIcon className="w-48 h-48" />
          <h1 className="mt-8 text-4xl font-bold tracking-wider text-[#0F3460]">
            SYSTEM
            <br />
            AUTHORIZATION
            <br />
            REVIEW
          </h1>
        </div>

        {/* Right Panel: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800">Login to Account</h2>
          <p className="mt-3 text-sm text-gray-500">
            Please enter username and password to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="username"
                className="text-sm font-semibold text-gray-700 block"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter the username"
                maxLength={SECURITY_CONFIG.MAX_INPUT_LENGTH.username}
                className={`mt-2 block w-full px-4 py-3 bg-gray-50 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                  validationErrors.username 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {validationErrors.username && (
                <div className="mt-1 text-sm text-red-600">
                  {validationErrors.username.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 block"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  maxLength={SECURITY_CONFIG.MAX_INPUT_LENGTH.password}
                  className={`block w-full px-4 py-3 bg-gray-50 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                    validationErrors.password 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <div className="mt-1 text-sm text-red-600">
                  {validationErrors.password.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300" role="alert">
                <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || isLocked[username]}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform ${
                  isLoading || isLocked[username]
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : isLocked[username] ? (
                  'Account Locked'
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
