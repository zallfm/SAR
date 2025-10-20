import { Page, Locator, expect } from '@playwright/test';

/**
 * Login Page Object Model
 * 
 * Encapsulates all interactions with the login page
 * Following Context7 best practices for page object models
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly validationErrors: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using actual HTML attributes
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('[role="alert"]');
    this.validationErrors = page.locator('.text-red-600');
    this.loadingSpinner = page.locator('button:has-text("Logging in...")');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Wait for successful login and navigation
   */
  async waitForSuccessfulLogin() {
    // Wait for dashboard to appear (since it's conditional rendering, not routing)
    await this.page.waitForSelector('h1:has-text("SYSTEM AUTHORIZATION REVIEW")', { timeout: 10000 });
  }

  /**
   * Wait for login failure
   */
  async waitForLoginFailure() {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if validation errors are displayed
   */
  async hasValidationErrors(): Promise<boolean> {
    try {
      await this.validationErrors.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get validation error messages
   */
  async getValidationErrors(): Promise<string[]> {
    if (await this.hasValidationErrors()) {
      const errorElements = this.validationErrors;
      const count = await errorElements.count();
      const errors: string[] = [];
      
      for (let i = 0; i < count; i++) {
        const errorText = await errorElements.nth(i).textContent();
        if (errorText) errors.push(errorText);
      }
      
      return errors;
    }
    return [];
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading(): Promise<boolean> {
    try {
      await this.loadingSpinner.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Clear form fields
   */
  async clearForm() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if login button is enabled
   */
  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  /**
   * Check if login button is disabled
   */
  async isLoginButtonDisabled(): Promise<boolean> {
    return await this.loginButton.isDisabled();
  }

  /**
   * Get login button text
   */
  async getLoginButtonText(): Promise<string> {
    return await this.loginButton.textContent() || '';
  }

  /**
   * Verify page elements are present
   */
  async verifyPageElements() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string = 'System Authorization Review') {
    await expect(this.page).toHaveTitle(expectedTitle);
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}
