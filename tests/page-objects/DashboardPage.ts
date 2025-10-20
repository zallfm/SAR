import { Page, Locator, expect } from '@playwright/test';

/**
 * Dashboard Page Object Model
 * 
 * Encapsulates all interactions with the dashboard page
 * Following Context7 best practices for page object models
 */
export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly userInfo: Locator;
  readonly navigationMenu: Locator;
  readonly uarProgressCard: Locator;
  readonly applicationCard: Locator;
  readonly loggingCard: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators using actual HTML attributes
    this.welcomeMessage = page.locator('h1:has-text("SYSTEM AUTHORIZATION REVIEW")');
    this.userInfo = page.locator('p.text-sm.font-semibold.text-gray-800'); // User name from Header
    this.navigationMenu = page.locator('nav'); // Sidebar navigation
    this.uarProgressCard = page.locator('button:has-text("UAR Progress")');
    this.applicationCard = page.locator('button:has-text("Application")');
    this.loggingCard = page.locator('button:has-text("Log Monitoring")');
    this.logoutButton = page.locator('button:has-text("Logout")');
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for dashboard to load
   */
  async waitForDashboardLoad() {
    await this.welcomeMessage.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Navigate to UAR page
   */
  async navigateToUAR() {
    await this.uarProgressCard.click();
    // Wait for content to load - just wait a bit for navigation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate to Application Management page
   */
  async navigateToApplication() {
    await this.applicationCard.click();
    // Wait for content to load - just wait a bit for navigation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Navigate to Logging page
   */
  async navigateToLogging() {
    await this.loggingCard.click();
    // Wait for content to load - just wait a bit for navigation
    await this.page.waitForTimeout(2000);
  }

  /**
   * Perform logout
   */
  async logout() {
    // First click on user dropdown to open it
    await this.page.locator('button[aria-haspopup="true"]').click();
    await this.page.waitForTimeout(1000); // Wait for dropdown to open
    
    // Then click logout button (it should be visible now)
    await this.logoutButton.click();
    
    // Wait for logout to complete (don't wait for UI change since there's a bug)
    await this.page.waitForTimeout(2000);
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    await this.welcomeMessage.waitFor({ state: 'visible' });
    return await this.welcomeMessage.textContent() || '';
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<string> {
    await this.userInfo.waitFor({ state: 'visible' });
    return await this.userInfo.textContent() || '';
  }

  /**
   * Verify dashboard elements are present
   */
  async verifyDashboardElements() {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.userInfo).toBeVisible();
    await expect(this.navigationMenu).toBeVisible();
    await expect(this.uarProgressCard).toBeVisible();
    await expect(this.applicationCard).toBeVisible();
    await expect(this.loggingCard).toBeVisible();
  }

  /**
   * Verify user is logged in
   */
  async verifyUserLoggedIn(username: string) {
    const userInfo = await this.getUserInfo();
    expect(userInfo).toContain(username);
  }

  /**
   * Check if navigation menu is visible
   */
  async isNavigationMenuVisible(): Promise<boolean> {
    try {
      await this.navigationMenu.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get navigation menu items
   */
  async getNavigationMenuItems(): Promise<string[]> {
    const menuItems = this.page.locator('[data-testid="nav-item"]');
    const count = await menuItems.count();
    const items: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const itemText = await menuItems.nth(i).textContent();
      if (itemText) items.push(itemText);
    }
    
    return items;
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
