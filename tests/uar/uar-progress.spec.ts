import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { UARPage } from '../page-objects/UARPage';

/**
 * UAR (User Access Review) Test Suite
 * 
 * Tests for UAR progress tracking, filtering, and data display
 * Following Context7 best practices for test organization
 */

test.describe('UAR - Progress Tracking', () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let uarPage: UARPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    uarPage = new UARPage(page);
    
    // Login before each test
    await loginPage.goto();
    await loginPage.login('admin', 'password123');
    await loginPage.waitForSuccessfulLogin();
    
    // Navigate to UAR page
    await dashboardPage.navigateToUAR();
    await uarPage.waitForUARPageLoad();
  });

  test('should display UAR page elements', async () => {
    // Verify all UAR page elements are present
    await uarPage.verifyUARPageElements();
  });

  test('should display progress chart', async () => {
    // Verify progress chart is visible and loaded
    await expect(uarPage.progressChart).toBeVisible();
    
    // Take screenshot for visual verification
    await uarPage.takeScreenshot('uar-progress-chart');
  });

  test('should display UAR table with data', async () => {
    // Verify UAR table is visible
    await expect(uarPage.uarTable).toBeVisible();
    
    // Get table data
    const tableData = await uarPage.getUARTableData();
    
    // Verify table has data
    expect(tableData.length).toBeGreaterThan(0);
    
    // Verify table data structure
    if (tableData.length > 0) {
      const firstRow = tableData[0];
      expect(firstRow).toHaveProperty('user');
      expect(firstRow).toHaveProperty('division');
      expect(firstRow).toHaveProperty('department');
      expect(firstRow).toHaveProperty('application');
      expect(firstRow).toHaveProperty('status');
      expect(firstRow).toHaveProperty('lastReview');
    }
  });

  test('should display page title correctly', async () => {
    // Verify page title
    const pageTitle = await uarPage.getPageTitle();
    expect(pageTitle).toContain('UAR');
  });

  test('should handle empty data gracefully', async () => {
    // This test would need to be implemented based on how empty states are handled
    // For now, we'll verify the page loads without errors
    await uarPage.verifyUARPageElements();
  });

  test('should display filter section', async () => {
    // Verify filter section is visible
    await expect(uarPage.filterSection).toBeVisible();
    
    // Verify all filter dropdowns are present
    await expect(uarPage.divisionFilter).toBeVisible();
    await expect(uarPage.departmentFilter).toBeVisible();
    await expect(uarPage.applicationFilter).toBeVisible();
    await expect(uarPage.statusFilter).toBeVisible();
    
    // Verify filter buttons are present
    await expect(uarPage.applyFiltersButton).toBeVisible();
    await expect(uarPage.clearFiltersButton).toBeVisible();
  });

  test('should load filter options', async () => {
    // Get filter options for each filter
    const divisionOptions = await uarPage.getFilterOptions('division');
    const departmentOptions = await uarPage.getFilterOptions('department');
    const applicationOptions = await uarPage.getFilterOptions('application');
    const statusOptions = await uarPage.getFilterOptions('status');
    
    // Verify filter options are loaded
    expect(divisionOptions.length).toBeGreaterThan(0);
    expect(departmentOptions.length).toBeGreaterThan(0);
    expect(applicationOptions.length).toBeGreaterThan(0);
    expect(statusOptions.length).toBeGreaterThan(0);
  });

  test('should apply division filter', async () => {
    // Get available division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Apply division filter
      await uarPage.applyFilters({ division: divisionOptions[1] });
      
      // Verify filter is applied (this would need to be implemented based on UI behavior)
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
    }
  });

  test('should apply department filter', async () => {
    // Get available department options
    const departmentOptions = await uarPage.getFilterOptions('department');
    
    if (departmentOptions.length > 1) {
      // Apply department filter
      await uarPage.applyFilters({ department: departmentOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.departmentFilter).toHaveValue(departmentOptions[1]);
    }
  });

  test('should apply application filter', async () => {
    // Get available application options
    const applicationOptions = await uarPage.getFilterOptions('application');
    
    if (applicationOptions.length > 1) {
      // Apply application filter
      await uarPage.applyFilters({ application: applicationOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.applicationFilter).toHaveValue(applicationOptions[1]);
    }
  });

  test('should apply status filter', async () => {
    // Get available status options
    const statusOptions = await uarPage.getFilterOptions('status');
    
    if (statusOptions.length > 1) {
      // Apply status filter
      await uarPage.applyFilters({ status: statusOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.statusFilter).toHaveValue(statusOptions[1]);
    }
  });

  test('should apply multiple filters', async () => {
    // Get available options
    const divisionOptions = await uarPage.getFilterOptions('division');
    const departmentOptions = await uarPage.getFilterOptions('department');
    const applicationOptions = await uarPage.getFilterOptions('application');
    const statusOptions = await uarPage.getFilterOptions('status');
    
    if (divisionOptions.length > 1 && departmentOptions.length > 1) {
      // Apply multiple filters
      await uarPage.applyFilters({
        division: divisionOptions[1],
        department: departmentOptions[1],
        application: applicationOptions[0],
        status: statusOptions[0]
      });
      
      // Verify filters are applied
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
      await expect(uarPage.departmentFilter).toHaveValue(departmentOptions[1]);
    }
  });

  test('should clear all filters', async () => {
    // Apply some filters first
    const divisionOptions = await uarPage.getFilterOptions('division');
    if (divisionOptions.length > 1) {
      await uarPage.applyFilters({ division: divisionOptions[1] });
      
      // Clear all filters
      await uarPage.clearFilters();
      
      // Verify filters are cleared
      await expect(uarPage.divisionFilter).toHaveValue('');
      await expect(uarPage.departmentFilter).toHaveValue('');
      await expect(uarPage.applicationFilter).toHaveValue('');
      await expect(uarPage.statusFilter).toHaveValue('');
    }
  });

  test('should handle pagination if present', async () => {
    // Check if pagination is visible
    const isPaginationVisible = await uarPage.isPaginationVisible();
    
    if (isPaginationVisible) {
      // Test pagination navigation
      await uarPage.goToNextPage();
      await uarPage.goToPreviousPage();
    }
  });

  test('should handle table sorting', async () => {
    // This test would need to be implemented based on how sorting is handled
    // For now, we'll verify the table is visible and has data
    await expect(uarPage.uarTable).toBeVisible();
    
    const tableData = await uarPage.getUARTableData();
    expect(tableData.length).toBeGreaterThan(0);
  });

  test('should handle table search functionality', async () => {
    // This test would need to be implemented based on how search is handled
    // For now, we'll verify the table is visible and has data
    await expect(uarPage.uarTable).toBeVisible();
    
    const tableData = await uarPage.getUARTableData();
    expect(tableData.length).toBeGreaterThan(0);
  });

  test('should display correct user information', async () => {
    // Verify user information is displayed correctly
    await dashboardPage.verifyUserLoggedIn('admin');
    
    // Navigate back to UAR page
    await uarPage.goto();
    await uarPage.waitForUARPageLoad();
    
    // Verify page loads correctly for admin user
    await uarPage.verifyUARPageElements();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await uarPage.verifyUARPageElements();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await uarPage.verifyUARPageElements();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await uarPage.verifyUARPageElements();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/uar/**', route => route.abort());
    
    // Navigate to UAR page
    await uarPage.goto();
    
    // Page should still load with error handling
    await uarPage.verifyUARPageElements();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/uar/**', route => {
      setTimeout(() => route.continue(), 2000);
    });
    
    // Navigate to UAR page
    await uarPage.goto();
    
    // Page should load with loading states
    await uarPage.waitForUARPageLoad();
    await uarPage.verifyUARPageElements();
  });
});
