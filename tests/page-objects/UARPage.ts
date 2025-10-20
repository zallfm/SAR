import { Page, Locator, expect } from '@playwright/test';

/**
 * UAR (User Access Review) Page Object Model
 * 
 * Encapsulates all interactions with the UAR page
 * Following Context7 best practices for page object models
 */
export class UARPage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly progressChart: Locator;
  readonly filterSection: Locator;
  readonly divisionFilter: Locator;
  readonly departmentFilter: Locator;
  readonly applicationFilter: Locator;
  readonly statusFilter: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly uarTable: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.pageTitle = page.getByTestId('uar-page-title');
    this.progressChart = page.getByTestId('uar-progress-chart');
    this.filterSection = page.getByTestId('uar-filter-section');
    this.divisionFilter = page.getByTestId('division-filter');
    this.departmentFilter = page.getByTestId('department-filter');
    this.applicationFilter = page.getByTestId('application-filter');
    this.statusFilter = page.getByTestId('status-filter');
    this.applyFiltersButton = page.getByTestId('apply-filters-button');
    this.clearFiltersButton = page.getByTestId('clear-filters-button');
    this.uarTable = page.getByTestId('uar-table');
    this.pagination = page.getByTestId('uar-pagination');
  }

  /**
   * Navigate to UAR page
   */
  async goto() {
    await this.page.goto('/uar');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for UAR page to load
   */
  async waitForUARPageLoad() {
    await this.pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    await this.progressChart.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Apply filters
   */
  async applyFilters(filters: {
    division?: string;
    department?: string;
    application?: string;
    status?: string;
  }) {
    if (filters.division) {
      await this.divisionFilter.selectOption(filters.division);
    }
    
    if (filters.department) {
      await this.departmentFilter.selectOption(filters.department);
    }
    
    if (filters.application) {
      await this.applicationFilter.selectOption(filters.application);
    }
    
    if (filters.status) {
      await this.statusFilter.selectOption(filters.status);
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
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    await this.pageTitle.waitFor({ state: 'visible' });
    return await this.pageTitle.textContent() || '';
  }

  /**
   * Get progress chart data
   */
  async getProgressChartData(): Promise<any> {
    // This would need to be implemented based on how the chart data is exposed
    // For now, we'll just verify the chart is visible
    await this.progressChart.waitFor({ state: 'visible' });
    return null;
  }

  /**
   * Get UAR table data
   */
  async getUARTableData(): Promise<any[]> {
    await this.uarTable.waitFor({ state: 'visible' });
    
    const rows = this.page.locator('[data-testid="uar-table-row"]');
    const count = await rows.count();
    const data: any[] = [];
    
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const rowData = {
        user: await row.locator('[data-testid="user-name"]').textContent(),
        division: await row.locator('[data-testid="division"]').textContent(),
        department: await row.locator('[data-testid="department"]').textContent(),
        application: await row.locator('[data-testid="application"]').textContent(),
        status: await row.locator('[data-testid="status"]').textContent(),
        lastReview: await row.locator('[data-testid="last-review"]').textContent(),
      };
      data.push(rowData);
    }
    
    return data;
  }

  /**
   * Get filter options
   */
  async getFilterOptions(filterType: 'division' | 'department' | 'application' | 'status'): Promise<string[]> {
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
      case 'division':
        return this.divisionFilter;
      case 'department':
        return this.departmentFilter;
      case 'application':
        return this.applicationFilter;
      case 'status':
        return this.statusFilter;
      default:
        throw new Error(`Unknown filter type: ${filterType}`);
    }
  }

  /**
   * Verify UAR page elements are present
   */
  async verifyUARPageElements() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.progressChart).toBeVisible();
    await expect(this.filterSection).toBeVisible();
    await expect(this.divisionFilter).toBeVisible();
    await expect(this.departmentFilter).toBeVisible();
    await expect(this.applicationFilter).toBeVisible();
    await expect(this.statusFilter).toBeVisible();
    await expect(this.applyFiltersButton).toBeVisible();
    await expect(this.clearFiltersButton).toBeVisible();
    await expect(this.uarTable).toBeVisible();
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
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}
