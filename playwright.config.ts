import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for SAR Application
 * Following Context7 best practices for enterprise testing
 * 
 * Features:
 * - Multi-browser testing (Chrome, Firefox, Safari)
 * - Global setup/teardown for authentication
 * - Parallel test execution
 * - Comprehensive reporting
 * - Environment-specific configurations
 */

export default defineConfig({
  // Test directory following Context7 structure
  testDir: './tests',
  
  // Global test timeout
  timeout: 30 * 1000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10 * 1000,
  },
  
  // Test execution configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list']
  ],
  
  // Global setup and teardown
  // globalSetup: './tests/global-setup.ts',
  // globalTeardown: './tests/global-teardown.ts',
  
  // Global test options
  use: {
    // Base URL for the application
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002',
    
    // Browser context options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Network and performance
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    
    // Viewport configuration
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,
    
    // User agent
    userAgent: 'SAR-Playwright-Test/1.0',
  },
  
  // Project configurations for different browsers and scenarios
  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Desktop Chrome tests
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use authenticated state from setup
        // storageState: 'tests/auth-state.json',
      },
      // dependencies: ['setup'],
    },
    
    // Desktop Firefox tests
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'tests/auth-state.json',
      },
      dependencies: ['setup'],
    },
    
    // Desktop Safari tests
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'tests/auth-state.json',
      },
      dependencies: ['setup'],
    },
    
    // Mobile Chrome tests
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'tests/auth-state.json',
      },
      dependencies: ['setup'],
    },
    
    // Mobile Safari tests
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'tests/auth-state.json',
      },
      dependencies: ['setup'],
    },
    
    // Visual regression tests
    {
      name: 'visual-regression',
      testMatch: /.*\.visual\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/auth-state.json',
      },
      dependencies: ['setup'],
    },
    
    // API tests (no browser needed)
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        extraHTTPHeaders: {
          'Accept': 'application/json',
        },
      },
    },
  ],
  
  // Web server configuration for local development
  webServer: process.env.CI ? undefined : {
    command: 'pnpm run dev',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Test ignore patterns
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
  ],
});
