import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './page-objects/LoginPage';

/**
 * Global Setup for Playwright Tests
 * 
 * This file runs once before all tests to:
 * 1. Authenticate users and save authentication state
 * 2. Set up test data
 * 3. Configure global test environment
 * 
 * Following Context7 best practices for enterprise testing
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Initialize login page
    const loginPage = new LoginPage(page);
    
    // Navigate to login page
    await page.goto('http://localhost:3001/');
    
    // Authenticate as admin user
    console.log('🔐 Authenticating admin user...');
    await loginPage.login('admin', 'password123');
    
    // Wait for successful login and navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Save authentication state
    await context.storageState({ path: 'tests/auth-state.json' });
    console.log('✅ Authentication state saved');
    
    // Set up test data if needed
    console.log('📊 Setting up test data...');
    await setupTestData(page);
    
    console.log('✅ Global setup completed successfully');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Set up test data for all test suites
 */
async function setupTestData(page: any) {
  try {
    // Navigate to UAR page to ensure it's accessible
    await page.goto('http://localhost:3001/uar');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Application Management page
    await page.goto('http://localhost:3001/application');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Logging page
    await page.goto('http://localhost:3001/logging');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Test data setup completed');
  } catch (error) {
    console.warn('⚠️ Test data setup had issues:', error);
    // Don't fail the entire setup for test data issues
  }
}

export default globalSetup;
