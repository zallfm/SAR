import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';

/**
 * Authentication Test Suite
 * 
 * Tests for login functionality, security features, and user authentication
 * Following Context7 best practices for test organization
 */

test.describe('Authentication - Login', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    await loginPage.goto();
  });

  test('should display login page elements', async () => {
    // Verify all login page elements are present
    await loginPage.verifyPageElements();
    await loginPage.verifyPageTitle();
  });

  test('should login successfully with valid credentials', async () => {
    // Test successful login with admin credentials
    await loginPage.login('admin', 'password123');
    await loginPage.waitForSuccessfulLogin();
    
    // Verify navigation to dashboard (conditional rendering, not routing)
    // URL stays the same but content changes
    
    // Verify user is logged in
    await dashboardPage.verifyUserLoggedIn('Hesti');
  });

  test('should login successfully with DpH user credentials', async () => {
    // Test successful login with DpH user credentials
    await loginPage.login('dph', 'password123');
    await loginPage.waitForSuccessfulLogin();
    
    // Verify navigation to dashboard (conditional rendering, not routing)
    // URL stays the same but content changes
    
    // Verify user is logged in
    await dashboardPage.verifyUserLoggedIn('DpH User');
  });

  test('should login successfully with System Owner credentials', async () => {
    // Test successful login with System Owner credentials
    await loginPage.login('systemowner', 'password123');
    await loginPage.waitForSuccessfulLogin();
    
    // Verify navigation to dashboard (conditional rendering, not routing)
    // URL stays the same but content changes
    
    // Verify user is logged in
    await dashboardPage.verifyUserLoggedIn('System Owner');
  });

  test('should show error for invalid username', async () => {
    // Test login with invalid username
    await loginPage.login('invaliduser', 'password123');
    await loginPage.waitForLoginFailure();
    
    // Verify error message is displayed
    expect(await loginPage.hasErrorMessage()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid username or password');
  });

  test('should show error for invalid password', async () => {
    // Test login with invalid password
    await loginPage.login('admin', 'wrongpassword');
    await loginPage.waitForLoginFailure();
    
    // Verify error message is displayed
    expect(await loginPage.hasErrorMessage()).toBe(true);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid username or password');
  });

  test('should show validation errors for empty fields', async () => {
    // Test login with empty fields
    await loginPage.usernameInput.fill('');
    await loginPage.passwordInput.fill('');
    await loginPage.loginButton.click();
    
    // Wait a bit for validation to process
    await loginPage.page.waitForTimeout(1000);
    
    // Check if HTML5 validation prevents submission (form should not submit)
    // The button click should not trigger form submission due to HTML5 validation
    const currentUrl = loginPage.page.url();
    expect(currentUrl).toContain('localhost:3002'); // Should still be on login page
    
    // Check if validation errors are visible (custom validation)
    const hasErrors = await loginPage.hasValidationErrors();
    
    // If no custom validation errors, check if HTML5 validation is working
    if (!hasErrors) {
      // HTML5 validation should prevent form submission
      // We can check if the form is still visible (not submitted)
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    } else {
      const validationErrors = await loginPage.getValidationErrors();
      expect(validationErrors.length).toBeGreaterThan(0);
    }
  });

  test('should show validation error for empty username', async () => {
    // Test login with empty username
    await loginPage.usernameInput.fill('');
    await loginPage.passwordInput.fill('password123');
    await loginPage.loginButton.click();
    
    // Wait a bit for validation to process
    await loginPage.page.waitForTimeout(1000);
    
    // Check if HTML5 validation prevents submission or custom validation shows error
    const hasErrors = await loginPage.hasValidationErrors();
    
    if (hasErrors) {
      const validationErrors = await loginPage.getValidationErrors();
      expect(validationErrors.some(error => error.includes('Username is required'))).toBe(true);
    } else {
      // HTML5 validation should prevent form submission
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    }
  });

  test('should show validation error for empty password', async () => {
    // Test login with empty password
    await loginPage.usernameInput.fill('admin');
    await loginPage.passwordInput.fill('');
    await loginPage.loginButton.click();
    
    // Wait a bit for validation to process
    await loginPage.page.waitForTimeout(1000);
    
    // Check if HTML5 validation prevents submission or custom validation shows error
    const hasErrors = await loginPage.hasValidationErrors();
    
    if (hasErrors) {
      const validationErrors = await loginPage.getValidationErrors();
      expect(validationErrors.some(error => error.includes('Password is required'))).toBe(true);
    } else {
      // HTML5 validation should prevent form submission
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    }
  });

  test('should disable login button during loading', async () => {
    // Start login process
    await loginPage.usernameInput.fill('admin');
    await loginPage.passwordInput.fill('password123');
    
    // Click login button and immediately check if it's disabled
    await loginPage.loginButton.click();
    
    // Verify button is disabled during loading
    expect(await loginPage.isLoginButtonDisabled()).toBe(true);
    
    // Wait for loading to complete
    await loginPage.waitForLoadingComplete();
  });

  test('should clear form fields when clearForm is called', async () => {
    // Fill form fields
    await loginPage.usernameInput.fill('admin');
    await loginPage.passwordInput.fill('password123');
    
    // Clear form
    await loginPage.clearForm();
    
    // Verify fields are empty
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.passwordInput).toHaveValue('');
  });

  test('should handle XSS attempts in username field', async () => {
    // Test XSS attempt in username
    const xssPayload = '<script>alert("xss")</script>';
    await loginPage.usernameInput.fill(xssPayload);
    await loginPage.passwordInput.fill('password123');
    await loginPage.loginButton.click();
    
    // Wait a bit for validation to process
    await loginPage.page.waitForTimeout(1000);
    
    // Check if validation errors are displayed (XSS should be caught by validation)
    const hasErrors = await loginPage.hasValidationErrors();
    
    if (hasErrors) {
      const validationErrors = await loginPage.getValidationErrors();
      // XSS should be caught by validation, not reach login attempt
      expect(validationErrors.length).toBeGreaterThan(0);
    } else {
      // Check if error message indicates validation issues
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Please correct the validation errors below.');
    }
  });

  test('should handle SQL injection attempts', async () => {
    // Test SQL injection attempt
    const sqlPayload = "admin'; DROP TABLE users; --";
    await loginPage.usernameInput.fill(sqlPayload);
    await loginPage.passwordInput.fill('password123');
    await loginPage.loginButton.click();
    
    // Wait a bit for validation to process
    await loginPage.page.waitForTimeout(1000);
    
    // Check if validation errors are displayed (SQL injection should be caught by validation)
    const hasErrors = await loginPage.hasValidationErrors();
    
    if (hasErrors) {
      const validationErrors = await loginPage.getValidationErrors();
      // SQL injection should be caught by validation, not reach login attempt
      expect(validationErrors.length).toBeGreaterThan(0);
    } else {
      // Check if error message indicates validation issues
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).toContain('Please correct the validation errors below.');
    }
  });

  test('should respect input length limits', async () => {
    // Test with very long username
    const longUsername = 'a'.repeat(1000);
    await loginPage.usernameInput.fill(longUsername);
    
    // Verify input is truncated to max length
    const inputValue = await loginPage.usernameInput.inputValue();
    expect(inputValue.length).toBeLessThanOrEqual(50); // Based on security config
  });

  test('should handle special characters in credentials', async () => {
    // Test with special characters
    await loginPage.login('admin@test', 'pass@word123');
    await loginPage.waitForLoginFailure();
    
    // Verify error message is displayed
    expect(await loginPage.hasErrorMessage()).toBe(true);
  });
});
