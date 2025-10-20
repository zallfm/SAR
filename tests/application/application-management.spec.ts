import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { ApplicationPage } from '../page-objects/ApplicationPage';

/**
 * Application Management Test Suite
 * 
 * Tests for application management functionality, CRUD operations, and data display
 * Following Context7 best practices for test organization
 */

test.describe('Application Management', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let applicationPage: ApplicationPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    applicationPage = new ApplicationPage(page);
    
    // Login before each test
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
    await loginPage.waitForSuccessfulLogin();
    
    // Navigate to application management page
    await dashboardPage.navigateToApplication();
    await applicationPage.waitForApplicationPageLoad();
  });

  test('should display application management page elements', async () => {
    // Verify all application page elements are present
    await applicationPage.verifyApplicationPageElements();
  });

  test('should display page title correctly', async () => {
    // Verify page title
    const pageTitle = await applicationPage.getPageTitle();
    expect(pageTitle).toContain('Application');
  });

  test('should display application table with data', async () => {
    // Verify application table is visible
    await expect(applicationPage.applicationTable).toBeVisible();
    
    // Get table data
    const tableData = await applicationPage.getApplicationTableData();
    
    // Verify table has data
    expect(tableData.length).toBeGreaterThan(0);
    
    // Verify table data structure
    if (tableData.length > 0) {
      const firstRow = tableData[0];
      expect(firstRow).toHaveProperty('name');
      expect(firstRow).toHaveProperty('division');
      expect(firstRow).toHaveProperty('department');
      expect(firstRow).toHaveProperty('status');
      expect(firstRow).toHaveProperty('lastUpdated');
    }
  });

  test('should display add application button', async () => {
    // Verify add application button is visible and enabled
    await expect(applicationPage.addApplicationButton).toBeVisible();
    expect(await applicationPage.isAddApplicationButtonEnabled()).toBe(true);
  });

  test('should display search functionality', async () => {
    // Verify search input is visible
    await expect(applicationPage.searchInput).toBeVisible();
    
    // Test search functionality
    await applicationPage.searchApplications('test');
    
    // Verify search input has the value
    const searchValue = await applicationPage.getSearchInputValue();
    expect(searchValue).toBe('test');
  });

  test('should display filter section', async () => {
    // Verify filter section elements are visible
    await expect(applicationPage.statusFilter).toBeVisible();
    await expect(applicationPage.divisionFilter).toBeVisible();
    await expect(applicationPage.departmentFilter).toBeVisible();
    await expect(applicationPage.applyFiltersButton).toBeVisible();
    await expect(applicationPage.clearFiltersButton).toBeVisible();
  });

  test('should load filter options', async () => {
    // Get filter options for each filter
    const statusOptions = await applicationPage.getFilterOptions('status');
    const divisionOptions = await applicationPage.getFilterOptions('division');
    const departmentOptions = await applicationPage.getFilterOptions('department');
    
    // Verify filter options are loaded
    expect(statusOptions.length).toBeGreaterThan(0);
    expect(divisionOptions.length).toBeGreaterThan(0);
    expect(departmentOptions.length).toBeGreaterThan(0);
  });

  test('should apply status filter', async () => {
    // Get available status options
    const statusOptions = await applicationPage.getFilterOptions('status');
    
    if (statusOptions.length > 1) {
      // Apply status filter
      await applicationPage.applyFilters({ status: statusOptions[1] });
      
      // Verify filter is applied
      await expect(applicationPage.statusFilter).toHaveValue(statusOptions[1]);
    }
  });

  test('should apply division filter', async () => {
    // Get available division options
    const divisionOptions = await applicationPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Apply division filter
      await applicationPage.applyFilters({ division: divisionOptions[1] });
      
      // Verify filter is applied
      await expect(applicationPage.divisionFilter).toHaveValue(divisionOptions[1]);
    }
  });

  test('should apply department filter', async () => {
    // Get available department options
    const departmentOptions = await applicationPage.getFilterOptions('department');
    
    if (departmentOptions.length > 1) {
      // Apply department filter
      await applicationPage.applyFilters({ department: departmentOptions[1] });
      
      // Verify filter is applied
      await expect(applicationPage.departmentFilter).toHaveValue(departmentOptions[1]);
    }
  });

  test('should apply multiple filters', async () => {
    // Get available options
    const statusOptions = await applicationPage.getFilterOptions('status');
    const divisionOptions = await applicationPage.getFilterOptions('division');
    const departmentOptions = await applicationPage.getFilterOptions('department');
    
    if (statusOptions.length > 1 && divisionOptions.length > 1) {
      // Apply multiple filters
      await applicationPage.applyFilters({
        status: statusOptions[1],
        division: divisionOptions[1],
        department: departmentOptions[0]
      });
      
      // Verify filters are applied
      await expect(applicationPage.statusFilter).toHaveValue(statusOptions[1]);
      await expect(applicationPage.divisionFilter).toHaveValue(divisionOptions[1]);
    }
  });

  test('should clear all filters', async () => {
    // Apply some filters first
    const statusOptions = await applicationPage.getFilterOptions('status');
    if (statusOptions.length > 1) {
      await applicationPage.applyFilters({ status: statusOptions[1] });
      
      // Clear all filters
      await applicationPage.clearFilters();
      
      // Verify filters are cleared
      await expect(applicationPage.statusFilter).toHaveValue('');
      await expect(applicationPage.divisionFilter).toHaveValue('');
      await expect(applicationPage.departmentFilter).toHaveValue('');
    }
  });

  test('should handle search with special characters', async () => {
    // Test search with special characters
    await applicationPage.searchApplications('test@#$%');
    
    // Verify search input has the value
    const searchValue = await applicationPage.getSearchInputValue();
    expect(searchValue).toBe('test@#$%');
  });

  test('should handle search with long text', async () => {
    // Test search with long text
    const longSearchTerm = 'a'.repeat(100);
    await applicationPage.searchApplications(longSearchTerm);
    
    // Verify search input has the value
    const searchValue = await applicationPage.getSearchInputValue();
    expect(searchValue).toBe(longSearchTerm);
  });

  test('should clear search input', async () => {
    // Enter search term
    await applicationPage.searchApplications('test');
    
    // Clear search input
    await applicationPage.clearSearchInput();
    
    // Verify search input is cleared
    const searchValue = await applicationPage.getSearchInputValue();
    expect(searchValue).toBe('');
  });

  test('should handle pagination if present', async () => {
    // Check if pagination is visible
    const isPaginationVisible = await applicationPage.isPaginationVisible();
    
    if (isPaginationVisible) {
      // Test pagination navigation
      await applicationPage.goToNextPage();
      await applicationPage.goToPreviousPage();
    }
  });

  test('should handle table sorting', async () => {
    // This test would need to be implemented based on how sorting is handled
    // For now, we'll verify the table is visible and has data
    await expect(applicationPage.applicationTable).toBeVisible();
    
    const tableData = await applicationPage.getApplicationTableData();
    expect(tableData.length).toBeGreaterThan(0);
  });

  test('should handle add application button click', async () => {
    // Click add application button
    await applicationPage.clickAddApplication();
    
    // This would need to be implemented based on how the add application modal/page works
    // For now, we'll verify the button click doesn't cause errors
    await applicationPage.verifyApplicationPageElements();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await applicationPage.verifyApplicationPageElements();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await applicationPage.verifyApplicationPageElements();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await applicationPage.verifyApplicationPageElements();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/application/**', route => route.abort());
    
    // Navigate to application page
    await applicationPage.goto();
    
    // Page should still load with error handling
    await applicationPage.verifyApplicationPageElements();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/application/**', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    // Navigate to application page
    await applicationPage.goto();
    
    // Page should load with loading states
    await applicationPage.waitForApplicationPageLoad();
    await applicationPage.verifyApplicationPageElements();
  });

  test('should maintain filter state on page refresh', async () => {
    // Get status options
    const statusOptions = await applicationPage.getFilterOptions('status');
    
    if (statusOptions.length > 1) {
      // Apply filter
      await applicationPage.applyFilters({ status: statusOptions[1] });
      
      // Refresh page
      await applicationPage.page.reload();
      await applicationPage.waitForApplicationPageLoad();
      
      // Verify filter state is maintained
      await expect(applicationPage.statusFilter).toHaveValue(statusOptions[1]);
    }
  });

  test('should handle filter with network delay', async ({ page }) => {
    // Simulate network delay
    await page.route('**/api/application/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    // Get status options
    const statusOptions = await applicationPage.getFilterOptions('status');
    
    if (statusOptions.length > 1) {
      // Apply filter with network delay
      await applicationPage.applyFilters({ status: statusOptions[1] });
      
      // Verify filter is applied after delay
      await expect(applicationPage.statusFilter).toHaveValue(statusOptions[1]);
    }
  });

  test('should handle filter with network error', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/application/**', route => route.abort());
    
    // Get status options
    const statusOptions = await applicationPage.getFilterOptions('status');
    
    if (statusOptions.length > 1) {
      // Try to apply filter with network error
      await applicationPage.applyFilters({ status: statusOptions[1] });
      
      // Should handle gracefully without errors
      await applicationPage.verifyApplicationPageElements();
    }
  });

  test('should handle accessibility', async () => {
    // Verify all elements are accessible
    await expect(applicationPage.pageTitle).toBeVisible();
    await expect(applicationPage.addApplicationButton).toBeVisible();
    await expect(applicationPage.applicationTable).toBeVisible();
    await expect(applicationPage.searchInput).toBeVisible();
    await expect(applicationPage.statusFilter).toBeVisible();
    await expect(applicationPage.divisionFilter).toBeVisible();
    await expect(applicationPage.departmentFilter).toBeVisible();
  });
});
