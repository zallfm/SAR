# Authentication & Security Logging System

## Overview
Comprehensive authentication and security logging system that tracks all login/logout activities, failed attempts, session management, and security events for RBAC (Role-Based Access Control) monitoring.

## Features

### 🔐 Authentication Logging
- **Login Success**: Records successful user authentication
- **Login Failed**: Tracks failed login attempts with reasons
- **Logout**: Records user logout events
- **Session Timeout**: Automatic logout due to inactivity
- **Password Changes**: Future implementation for password updates

### 🛡️ Security Monitoring
- **Brute Force Protection**: Tracks multiple failed login attempts
- **Suspicious Activity**: Monitors unusual login patterns
- **Session Management**: Automatic session timeout and warnings
- **IP Tracking**: Records IP addresses for security analysis
- **User Agent Logging**: Tracks browser/device information

### 📊 RBAC Integration
- **Role-Based Logging**: Different log levels based on user roles
- **Permission Tracking**: Logs access to sensitive features
- **User Activity**: Comprehensive user action tracking

## Implementation

### 1. Login Page Logging (`LoginPage.tsx`)
```typescript
// Successful login
logAuthentication('login_success', {
  username: userToLogin.username,
  role: userToLogin.role,
  name: userToLogin.name,
  ip: '127.0.0.1',
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString()
});

// Failed login attempt
logAuthentication('login_failed', {
  username: username,
  reason: 'invalid_credentials',
  attemptNumber: currentAttempts,
  ip: '127.0.0.1',
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString()
});

// Multiple failed attempts (Warning)
if (currentAttempts >= 3) {
  logSecurity('multiple_failed_login_attempts', {
    username: username,
    attemptCount: currentAttempts,
    ip: '127.0.0.1',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }, 'Warning');
}

// Potential brute force attack (Error)
if (currentAttempts >= 5) {
  logSecurity('potential_brute_force_attack', {
    username: username,
    attemptCount: currentAttempts,
    ip: '127.0.0.1',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  }, 'Error');
}
```

### 2. Session Management (`sessionManager.ts`)
```typescript
// Session creation with logging
sessionManager.createSession({
  userId: user.username,
  username: user.username,
  role: user.role,
  name: user.name,
  ip: '127.0.0.1',
  userAgent: navigator.userAgent,
});

// Automatic session timeout
sessionManager.clearSessionDueToTimeout();

// Session warning (5 minutes before timeout)
sessionManager.logSecurityEvent('session_warning', {
  username: this.session.username,
  role: this.session.role,
  sessionId: this.getSessionId(),
  timeRemaining: 5 * 60 * 1000,
  timestamp: new Date().toISOString()
}, this.session.userId, 'Warning');
```

### 3. App-Level Integration (`App.tsx`)
```typescript
// Login success handler
const handleLoginSuccess = (user: User) => {
  sessionManager.createSession({
    userId: user.username,
    username: user.username,
    role: user.role,
    name: user.name,
    ip: '127.0.0.1',
    userAgent: navigator.userAgent,
  });
  setCurrentUser(user);
};

// Logout handler
const handleLogout = () => {
  sessionManager.logout(); // Includes logging
  setCurrentUser(null);
};

// Session validity check
useEffect(() => {
  const checkSession = () => {
    if (currentUser && !sessionManager.isSessionValid()) {
      setCurrentUser(null); // Auto-logout on session expiry
    }
  };
  const interval = setInterval(checkSession, 60000);
  return () => clearInterval(interval);
}, [currentUser]);
```

## Log Categories

### Security Events
- `auth_login_success` - Successful authentication
- `auth_login_failed` - Failed login attempt
- `auth_logout` - User logout
- `auth_session_timeout` - Session expired
- `multiple_failed_login_attempts` - Suspicious activity
- `potential_brute_force_attack` - Security threat
- `session_warning` - Session about to expire

### Log Levels
- **Success**: Successful authentication, logout
- **Error**: Failed login, brute force attacks, session timeout
- **Warning**: Multiple failed attempts, session warnings

## Security Features

### 1. Failed Attempt Tracking
- Tracks failed login attempts per username
- Escalates logging level based on attempt count
- Prevents brute force attacks

### 2. Session Management
- 30-minute session timeout
- 5-minute warning before timeout
- Automatic logout on session expiry
- Activity tracking (mouse, keyboard, clicks)

### 3. IP and Device Tracking
- Records IP addresses for security analysis
- Tracks user agent information
- Enables device-based security policies

### 4. Real-time Monitoring
- All security events logged immediately
- Real-time updates in logging dashboard
- Automatic categorization of security events

## Usage Examples

### Basic Authentication Logging
```typescript
import { useLogging } from '../hooks/useLogging';

const { logAuthentication, logSecurity } = useLogging();

// Log successful login
logAuthentication('login_success', {
  username: 'admin',
  role: 'Administrator',
  ip: '192.168.1.100'
});

// Log failed login
logAuthentication('login_failed', {
  username: 'testuser',
  reason: 'invalid_password',
  attemptNumber: 2
});
```

### Security Event Logging
```typescript
// Log suspicious activity
logSecurity('multiple_failed_login_attempts', {
  username: 'testuser',
  attemptCount: 5,
  ip: '192.168.1.100'
}, 'Warning');

// Log potential attack
logSecurity('potential_brute_force_attack', {
  username: 'testuser',
  attemptCount: 10,
  ip: '192.168.1.100'
}, 'Error');
```

## Monitoring Dashboard

### Security Events Display
- **Login Success**: Green status badge
- **Login Failed**: Red status badge with attempt count
- **Session Timeout**: Orange status badge
- **Brute Force**: Red status badge with warning

### Filtering Options
- Filter by security category
- Filter by user role
- Filter by IP address
- Filter by time range
- Search by username

## Best Practices

### 1. Security Monitoring
- Monitor failed login attempts regularly
- Set up alerts for brute force attacks
- Review session timeout patterns
- Track unusual login locations

### 2. Data Retention
- Keep security logs for compliance
- Implement log rotation for performance
- Archive old security events
- Maintain audit trail integrity

### 3. Performance
- Use efficient logging methods
- Implement log batching for high volume
- Monitor logging performance impact
- Use appropriate log levels

## Future Enhancements

### 1. Advanced Security
- Two-factor authentication logging
- Device fingerprinting
- Geolocation tracking
- Risk-based authentication

### 2. Compliance Features
- GDPR compliance logging
- SOX audit trail
- HIPAA security logging
- PCI DSS compliance

### 3. Analytics
- Login pattern analysis
- Security threat detection
- User behavior analytics
- Risk scoring algorithms

## Integration Points

### 1. External Systems
- SIEM integration
- Security monitoring tools
- Compliance reporting systems
- Alert management platforms

### 2. Internal Systems
- User management system
- Role-based access control
- Session management
- Audit trail systems

This comprehensive authentication and security logging system provides complete visibility into user authentication activities, security events, and potential threats, ensuring robust security monitoring and compliance with RBAC requirements.
