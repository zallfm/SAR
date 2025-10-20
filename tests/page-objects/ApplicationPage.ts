import { Page, Locator, expect } from '@playwright/test';

/**
 * Application Management Page Object Model
 * 
 * Encapsulates all interactions with the application management page
 * Following Context7 best practices for page object models
 */
export class ApplicationPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly addApplicationButton: Locator;
  readonly applicationTable: Locator;
  readonly searchInput: Locator;
  readonly statusFilter: Locator;
  readonly divisionFilter: Locator;
  readonly departmentFilter: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.pageTitle = page.getByTestId('application-page-title');
    this.addApplicationButton = page.getByTestId('add-application-button');
    this.applicationTable = page.getByTestId('application-table');
    this.searchInput = page.getByTestId('application-search-input');
    this.statusFilter = page.getByTestId('application-status-filter');
    this.divisionFilter = page.getByTestId('application-division-filter');
    this.departmentFilter = page.getByTestId('application-department-filter');
    this.applyFiltersButton = page.getByTestId('application-apply-filters-button');
    this.clearFiltersButton = page.getByTestId('application-clear-filters-button');
    this.pagination = page.getByTestId('application-pagination');
  }

  /**
   * Navigate to application management page
   */
  async goto() {
    await this.page.goto('/application');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for application page to load
   */
  async waitForApplicationPageLoad() {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    await this.applicationTable.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    await this.pageTitle.waitFor({ state: 'visible' });
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Search for applications
   */
  async searchApplications(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Apply filters
   */
  async applyFilters(filters: {
    status?: string;
    division?: string;
    department?: string;
  }) {
    if (filters.status) {
      await this.statusFilter.selectOption(filters.status);
    }
    
    if (filters.division) {
      await this.divisionFilter.selectOption(filters.division);
    }
    
    if (filters.department) {
      await this.departmentFilter.selectOption(filters.department);
    }
    
    await this.applyFiltersButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clear all filters
   */
  async clearFilters() {
    await this.clearFiltersButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get application table data
   */
  async getApplicationTableData(): Promise<any[]> {
    await this.applicationTable.waitFor({ state: 'visible' });
    
    const rows = this.page.locator('[data-testid="application-table-row"]');
    const count = await rows.count();
    const data: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const rowData = {
        name: await row.locator('[data-testid="application-name"]').textContent(),
        division: await row.locator('[data-testid="application-division"]').textContent(),
        department: await row.locator('[data-testid="application-department"]').textContent(),
        status: await row.locator('[data-testid="application-status"]').textContent(),
        lastUpdated: await row.locator('[data-testid="application-last-updated"]').textContent(),
      };
      data.push(rowData);
    }
    
    return data;
  }

  /**
   * Get filter options
   */
  async getFilterOptions(filterType: 'status' | 'division' | 'department'): Promise<string[]> {
    const filter = this.getFilterLocator(filterType);
    const options = filter.locator('option');
    const count = await options.count();
    const optionTexts: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      if (optionText && optionText.trim() !== '') {
        optionTexts.push(optionText.trim());
      }
    }
    
    return optionTexts;
  }

  /**
   * Get filter locator based on type
   */
  private getFilterLocator(filterType: string): Locator {
    switch (filterType) {
      case 'status':
        return this.statusFilter;
      case 'division':
        return this.divisionFilter;
      case 'department':
        return this.departmentFilter;
      default:
        throw new Error(`Unknown filter type: ${filterType}`);
    }
  }

  /**
   * Click add application button
   */
  async clickAddApplication() {
    await this.addApplicationButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify application page elements are present
   */
  async verifyApplicationPageElements() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.addApplicationButton).toBeVisible();
    await expect(this.applicationTable).toBeVisible();
    await expect(this.searchInput).toBeVisible();
    await expect(this.statusFilter).toBeVisible();
    await expect(this.divisionFilter).toBeVisible();
    await expect(this.departmentFilter).toBeVisible();
    await expect(this.applyFiltersButton).toBeVisible();
    await expect(this.clearFiltersButton).toBeVisible();
  }

  /**
   * Check if pagination is visible
   */
  async isPaginationVisible(): Promise<boolean> {
    try {
      await this.pagination.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Navigate to next page
   */
  async goToNextPage() {
    if (await this.isPaginationVisible()) {
      const nextButton = this.pagination.locator('[data-testid="next-page-button"]');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await this.page.waitForLoadState('networkidle');
      }
    }
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage() {
    if (await this.isPaginationVisible()) {
      const prevButton = this.pagination.locator('[data-testid="prev-page-button"]');
      if (await prevButton.isEnabled()) {
        await prevButton.click();
        await this.page.waitForLoadState('networkidle');
      }
    }
  }

  /**
   * Get search input value
   */
  async getSearchInputValue(): Promise<string> {
    return await this.searchInput.inputValue();
  }

  /**
   * Clear search input
   */
  async clearSearchInput() {
    await this.searchInput.clear();
  }

  /**
   * Check if add application button is enabled
   */
  async isAddApplicationButtonEnabled(): Promise<boolean> {
    return await this.addApplicationButton.isEnabled();
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
