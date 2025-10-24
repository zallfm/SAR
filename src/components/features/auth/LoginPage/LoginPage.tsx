import React, { useState, useEffect } from "react";
import type { User } from "../../../../../types";
import { SystemIcon } from "../../../icons/SystemIcon";
import { EyeIcon } from "../../../icons/EyeIcon";
import { EyeSlashIcon } from "../../../icons/EyeSlashIcon";
import { ExclamationCircleIcon } from "../../../icons/ExclamationCircleIcon";
import { useLogging } from "../../../../hooks/useLogging";
import { sessionManager } from "../../../../services/sessionManager";
import { authService } from "../../../../services/authService";
import { SecurityValidator } from "../../../../services/securityValidator";
import { AuditLogger } from "../../../../services/auditLogger";
import { AuditAction } from "../../../../constants/auditActions";
import { SECURITY_CONFIG } from "../../../../config/security";

// ⬇️ import hook React Query untuk login
import { useLogin } from "../../../../hooks/useAuth";
import { useAuthStore } from "../../../../store/authStore";
import { postLogMonitoringApi } from "@/src/api/log_monitoring";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState(""); const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // error dari server / validasi UI
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string[];
    password?: string[];
  }>({});
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>(
    {}
  );
  const [isLocked, setIsLocked] = useState<Record<string, boolean>>({});
  const { logAuthentication, logSecurity } = useLogging();

  // ⬇️ React Query login hook
  const { mutateAsync: doLogin, isPending } = useLogin();
  // ambil user dari store kalau mau
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    // Kalau sudah ada user di store (mis. reload halaman & state dipersist), langsung lanjut
    if (currentUser) {
      onLoginSuccess(currentUser);
      return;
    }
    // Initialize audit logger
    AuditLogger.initialize();
  }, [onLoginSuccess, currentUser]);

  const unameKey = username.trim().toLowerCase();

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setError("");
  //   setValidationErrors({});
  //   setIsLoading(true);

  //   try {
  //     // Check if account is locked
  //     if (isLocked[username]) {
  //       setError(
  //         "Account is temporarily locked due to multiple failed attempts. Please try again later."
  //       );
  //       AuditLogger.logWarning(AuditAction.ACCOUNT_LOCKED, {
  //         userName: username,
  //         description: "Login attempt on locked account",
  //       });
  //       return;
  //     }

  //     // Validate input (using development mode for relaxed password validation)
  //     const usernameValidation = SecurityValidator.validateUsername(username);
  //     const passwordValidation = SecurityValidator.validatePassword(
  //       password,
  //       true
  //     ); // true = development mode

  //     if (!usernameValidation.isValid || !passwordValidation.isValid) {
  //       setValidationErrors({
  //         username: usernameValidation.errors,
  //         password: passwordValidation.errors,
  //       });
  //       setError("Please correct the validation errors below.");
  //       return;
  //     }

  //     // Attempt login with secure service
  //     const authResponse = await authService.login({
  //       username: usernameValidation.sanitizedValue,
  //       password: passwordValidation.sanitizedValue,
  //     });

  //     // Reset failed attempts on successful login
  //     setFailedAttempts((prev) => ({ ...prev, [username]: 0 }));
  //     setIsLocked((prev) => ({ ...prev, [username]: false }));

  //     // Create session
  //     sessionManager.createSession({
  //       userId: authResponse.user.username,
  //       username: authResponse.user.username,
  //       role: authResponse.user.role,
  //       name: authResponse.user.name,
  //       ip: "127.0.0.1",
  //       userAgent: navigator.userAgent,
  //     });

  //     // Log successful login
  //     logAuthentication("login_success", {
  //       username: authResponse.user.username,
  //       role: authResponse.user.role,
  //       name: authResponse.user.name,
  //       ip: "127.0.0.1",
  //       userAgent: navigator.userAgent,
  //       timestamp: new Date().toISOString(),
  //     });

  //     onLoginSuccess(authResponse.user);
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Login failed";
  //     setError(errorMessage);

  //     // Track failed attempts
  //     const currentAttempts = (failedAttempts[username] || 0) + 1;
  //     setFailedAttempts((prev) => ({ ...prev, [username]: currentAttempts }));

  //     // Log failed login attempt
  //     logAuthentication("login_failed", {
  //       username: username,
  //       reason: "invalid_credentials",
  //       attemptNumber: currentAttempts,
  //       ip: "127.0.0.1",
  //       userAgent: navigator.userAgent,
  //       timestamp: new Date().toISOString(),
  //     });

  //     // Lock account after max attempts
  //     if (currentAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
  //       setIsLocked((prev) => ({ ...prev, [username]: true }));

  //       // Set auto-unlock timer
  //       setTimeout(() => {
  //         setIsLocked((prev) => ({ ...prev, [username]: false }));
  //         setFailedAttempts((prev) => ({ ...prev, [username]: 0 }));
  //       }, SECURITY_CONFIG.LOCKOUT_DURATION_MS);

  //       AuditLogger.logWarning(AuditAction.ACCOUNT_LOCKED, {
  //         userName: username,
  //         description: `Account locked after ${currentAttempts} failed attempts`,
  //       });
  //     }

  //     // Log suspicious activity for multiple failed attempts
  //     if (currentAttempts >= 3) {
  //       logSecurity(
  //         "multiple_failed_login_attempts",
  //         {
  //           username: username,
  //           attemptCount: currentAttempts,
  //           ip: "127.0.0.1",
  //           userAgent: navigator.userAgent,
  //           timestamp: new Date().toISOString(),
  //         },
  //         "Warning"
  //       );
  //     }

  //     // Log potential brute force attack
  //     if (currentAttempts >= 5) {
  //       logSecurity(
  //         "potential_brute_force_attack",
  //         {
  //           username: username,
  //           attemptCount: currentAttempts,
  //           ip: "127.0.0.1",
  //           userAgent: navigator.userAgent,
  //           timestamp: new Date().toISOString(),
  //         },
  //         "Error"
  //       );
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    try {
      // Check lock
      if (isLocked[unameKey]) {
        setError('Account is temporarily locked due to multiple failed attempts. Please try again later.');
        AuditLogger.logWarning(AuditAction.ACCOUNT_LOCKED, {
          userName: username,
          description: 'Login attempt on locked account'
        });
        return;
      }

      // Validate input (development mode untuk password rule)
      const usernameValidation = SecurityValidator.validateUsername(username);
      const passwordValidation = SecurityValidator.validatePassword(password, true);

      if (!usernameValidation.isValid || !passwordValidation.isValid) {
        setValidationErrors({
          username: usernameValidation.errors,
          password: passwordValidation.errors
        });
        setError('Please correct the validation errors below.');
        return;
      }

      // ⬇️ PANGGIL API lewat React Query
      const res = await doLogin({
        username: usernameValidation.sanitizedValue,
        password: passwordValidation.sanitizedValue
      });

      // React Query hook sudah mengisi Zustand: token, user, expiry
      const user = res.data.user;

      // Reset counters
      setFailedAttempts(prev => ({ ...prev, [unameKey]: 0 }));
      setIsLocked(prev => ({ ...prev, [unameKey]: false }));

      // Buat session (opsional)
      sessionManager.createSession({
        userId: user.username,
        username: user.username,
        role: user.role,
        name: user.name,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
      });

      // Audit log
      logAuthentication('login_success', {
        username: user.username,
        role: user.role,
        name: user.name,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      // ⬇️ Log ke backend
      await postLogMonitoringApi({
        userId: user.username,
        module: "Login",
        action: AuditAction.LOGIN_SUCCESS,
        status: "Success",
        description: `User ${user.username} berhasil login`,
        location: "LoginPage",
        timestamp: new Date().toISOString(),
      });


      // Beri tahu parent
      onLoginSuccess(user);

    } catch (err: any) {
      setError(err?.message || 'Login failed');

      if (err?.status === 423 || err?.details?.locked) {
        const ms = Number(err?.details?.remainingMs ?? 0);
        setIsLocked(prev => ({ ...prev, [unameKey]: true }));
        setTimeout(() => {
          setIsLocked(prev => ({ ...prev, [unameKey]: false }));
          setFailedAttempts(prev => ({ ...prev, [unameKey]: 0 }));
        }, Math.max(ms, 0));
      }


      // Track attempts
      const currentAttempts = (failedAttempts[unameKey] || 0) + 1;
      setFailedAttempts(prev => ({ ...prev, [unameKey]: currentAttempts }));

      // Audit log gagal
      logAuthentication('login_failed', {
        username,
        reason: 'invalid_credentials',
        attemptNumber: currentAttempts,
        ip: '127.0.0.1',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });

      await postLogMonitoringApi({
        userId: username,
        module: "Login",
        action: AuditAction.LOGIN_FAILED,
        status: "Error",
        description: `User ${username} gagal login (${err?.message || "invalid credentials"})`,
        location: "LoginPage",
        timestamp: new Date().toISOString(),
      });


      // Lock setelah mencapai batas
      if (currentAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        setIsLocked(prev => ({ ...prev, [unameKey]: true }));

        setTimeout(() => {
          setIsLocked(prev => ({ ...prev, [unameKey]: false }));
          setFailedAttempts(prev => ({ ...prev, [unameKey]: 0 }));
        }, SECURITY_CONFIG.LOCKOUT_DURATION_MS);

        AuditLogger.logWarning(AuditAction.ACCOUNT_LOCKED, {
          userName: username,
          description: `Account locked after ${currentAttempts} failed attempts`
        });
      }

      // Warning & brute force signals
      if (currentAttempts >= 3) {
        logSecurity('multiple_failed_login_attempts', {
          username, attemptCount: currentAttempts,
          ip: '127.0.0.1', userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }, 'Warning');
      }
      if (currentAttempts >= 5) {
        logSecurity('potential_brute_force_attack', {
          username, attemptCount: currentAttempts,
          ip: '127.0.0.1', userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }, 'Error');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        {/* Left Panel */}
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
                className={`mt-2 block w-full px-4 py-3 bg-gray-50 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${validationErrors.username
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              {validationErrors.username && (
                <div className="mt-1 text-sm text-red-600">
                  {validationErrors.username.map((err, i) => (
                    <div key={i}>{err}</div>
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  maxLength={SECURITY_CONFIG.MAX_INPUT_LENGTH.password}
                  className={`block w-full px-4 py-3 bg-gray-50 border rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${validationErrors.password
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  {validationErrors.password.map((err, i) => (
                    <div key={i}>{err}</div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div
                className="flex items-center p-4 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300"
                role="alert"
              >
                <ExclamationCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error || "Login failed"}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isPending || isLocked[username]}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform ${isPending || isLocked[username]
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                  }`}
              >
                {isPending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Logging in...
                  </div>
                ) : isLocked[username] ? (
                  "Account Locked"
                ) : (
                  "Login"
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
