/**
 * Test Data Fixtures
 * 
 * Centralized test data for Playwright tests
 * Following Context7 best practices for test data management
 */

export const TEST_USERS = {
  admin: {
    username: 'admin',
    password: 'password123',
    role: 'Admin',
    name: 'Hesti'
  },
  dph: {
    username: 'dph',
    password: 'password123',
    role: 'DpH',
    name: 'DpH User'
  },
  systemOwner: {
    username: 'systemowner',
    password: 'password123',
    role: 'SystemOwner',
    name: 'System Owner'
  }
};

export const TEST_APPLICATIONS = [
  {
    name: 'Test Application 1',
    division: 'IT Division',
    department: 'Development',
    status: 'Active',
    lastUpdated: '2024-01-15'
  },
  {
    name: 'Test Application 2',
    division: 'HR Division',
    department: 'Human Resources',
    status: 'Inactive',
    lastUpdated: '2024-01-10'
  },
  {
    name: 'Test Application 3',
    division: 'Finance Division',
    department: 'Accounting',
    status: 'Pending',
    lastUpdated: '2024-01-20'
  }
];

export const TEST_UAR_DATA = [
  {
    user: 'John Doe',
    division: 'IT Division',
    department: 'Development',
    application: 'Test Application 1',
    status: 'Approved',
    lastReview: '2024-01-15'
  },
  {
    user: 'Jane Smith',
    division: 'HR Division',
    department: 'Human Resources',
    application: 'Test Application 2',
    status: 'Pending',
    lastReview: '2024-01-10'
  },
  {
    user: 'Bob Johnson',
    division: 'Finance Division',
    department: 'Accounting',
    application: 'Test Application 3',
    status: 'Rejected',
    lastReview: '2024-01-20'
  }
];

export const TEST_FILTERS = {
  divisions: ['IT Division', 'HR Division', 'Finance Division', 'Operations Division'],
  departments: ['Development', 'Human Resources', 'Accounting', 'Operations'],
  applications: ['Test Application 1', 'Test Application 2', 'Test Application 3'],
  statuses: ['Active', 'Inactive', 'Pending', 'Approved', 'Rejected']
};

export const TEST_SEARCH_TERMS = [
  'test',
  'application',
  'user',
  'admin',
  'system',
  'review',
  'access',
  'management'
];

export const TEST_SPECIAL_CHARACTERS = [
  'test@#$%',
  'user&name',
  'app*lication',
  'test+user',
  'user-name',
  'test_user',
  'user.name',
  'test@domain.com'
];

export const TEST_LONG_TEXT = [
  'a'.repeat(100),
  'b'.repeat(500),
  'c'.repeat(1000)
];

export const TEST_XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src="x" onerror="alert(\'xss\')">',
  'javascript:alert("xss")',
  '<svg onload="alert(\'xss\')">',
  '<iframe src="javascript:alert(\'xss\')"></iframe>'
];

export const TEST_SQL_INJECTION_PAYLOADS = [
  "admin'; DROP TABLE users; --",
  "admin' OR '1'='1",
  "admin' UNION SELECT * FROM users --",
  "admin'; INSERT INTO users VALUES ('hacker', 'password'); --",
  "admin' AND 1=1 --"
];

export const TEST_NETWORK_CONDITIONS = {
  slow: {
    downloadThroughput: 500 * 1024, // 500 KB/s
    uploadThroughput: 500 * 1024,   // 500 KB/s
    latency: 2000                   // 2 seconds
  },
  fast: {
    downloadThroughput: 10 * 1024 * 1024, // 10 MB/s
    uploadThroughput: 10 * 1024 * 1024,   // 10 MB/s
    latency: 10                           // 10 ms
  },
  offline: {
    downloadThroughput: 0,
    uploadThroughput: 0,
    latency: 0
  }
};

export const TEST_VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 }
};

export const TEST_TIMEOUTS = {
  short: 5000,    // 5 seconds
  medium: 10000,  // 10 seconds
  long: 30000,    // 30 seconds
  veryLong: 60000 // 60 seconds
};

export const TEST_URLS = {
  base: 'http://localhost:3000',
  login: '/',
  dashboard: '/dashboard',
  uar: '/uar',
  application: '/application',
  logging: '/logging'
};

export const TEST_API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh'
  },
  uar: {
    list: '/api/uar',
    create: '/api/uar',
    update: '/api/uar/:id',
    delete: '/api/uar/:id'
  },
  application: {
    list: '/api/application',
    create: '/api/application',
    update: '/api/application/:id',
    delete: '/api/application/:id'
  },
  logging: {
    list: '/api/logging',
    create: '/api/logging'
  }
};
