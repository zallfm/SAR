import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { DashboardPage } from '../page-objects/DashboardPage';
import { UARPage } from '../page-objects/UARPage';

/**
 * UAR Filters Test Suite
 * 
 * Tests for UAR filtering functionality, data validation, and user interactions
 * Following Context7 best practices for test organization
 */

test.describe('UAR - Filters', () => {
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

  test('should display all filter dropdowns', async () => {
    // Verify all filter dropdowns are visible
    await expect(uarPage.divisionFilter).toBeVisible();
    await expect(uarPage.departmentFilter).toBeVisible();
    await expect(uarPage.applicationFilter).toBeVisible();
    await expect(uarPage.statusFilter).toBeVisible();
  });

  test('should display filter action buttons', async () => {
    // Verify filter action buttons are visible
    await expect(uarPage.applyFiltersButton).toBeVisible();
    await expect(uarPage.clearFiltersButton).toBeVisible();
  });

  test('should load division filter options', async () => {
    // Get division filter options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    // Verify options are loaded
    expect(divisionOptions.length).toBeGreaterThan(0);
    
    // Verify default option (usually "All" or empty)
    expect(divisionOptions[0]).toBeTruthy();
  });

  test('should load department filter options', async () => {
    // Get department filter options
    const departmentOptions = await uarPage.getFilterOptions('department');
    
    // Verify options are loaded
    expect(departmentOptions.length).toBeGreaterThan(0);
    
    // Verify default option
    expect(departmentOptions[0]).toBeTruthy();
  });

  test('should load application filter options', async () => {
    // Get application filter options
    const applicationOptions = await uarPage.getFilterOptions('application');
    
    // Verify options are loaded
    expect(applicationOptions.length).toBeGreaterThan(0);
    
    // Verify default option
    expect(applicationOptions[0]).toBeTruthy();
  });

  test('should load status filter options', async () => {
    // Get status filter options
    const statusOptions = await uarPage.getFilterOptions('status');
    
    // Verify options are loaded
    expect(statusOptions.length).toBeGreaterThan(0);
    
    // Verify default option
    expect(statusOptions[0]).toBeTruthy();
  });

  test('should apply single division filter', async () => {
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Apply division filter
      await uarPage.applyFilters({ division: divisionOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
    }
  });

  test('should apply single department filter', async () => {
    // Get department options
    const departmentOptions = await uarPage.getFilterOptions('department');
    
    if (departmentOptions.length > 1) {
      // Apply department filter
      await uarPage.applyFilters({ department: departmentOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.departmentFilter).toHaveValue(departmentOptions[1]);
    }
  });

  test('should apply single application filter', async () => {
    // Get application options
    const applicationOptions = await uarPage.getFilterOptions('application');
    
    if (applicationOptions.length > 1) {
      // Apply application filter
      await uarPage.applyFilters({ application: applicationOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.applicationFilter).toHaveValue(applicationOptions[1]);
    }
  });

  test('should apply single status filter', async () => {
    // Get status options
    const statusOptions = await uarPage.getFilterOptions('status');
    
    if (statusOptions.length > 1) {
      // Apply status filter
      await uarPage.applyFilters({ status: statusOptions[1] });
      
      // Verify filter is applied
      await expect(uarPage.statusFilter).toHaveValue(statusOptions[1]);
    }
  });

  test('should apply multiple filters simultaneously', async () => {
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
      
      // Verify all filters are applied
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
      await expect(uarPage.departmentFilter).toHaveValue(departmentOptions[1]);
      await expect(uarPage.applicationFilter).toHaveValue(applicationOptions[0]);
      await expect(uarPage.statusFilter).toHaveValue(statusOptions[0]);
    }
  });

  test('should clear all filters', async () => {
    // Apply some filters first
    const divisionOptions = await uarPage.getFilterOptions('division');
    const departmentOptions = await uarPage.getFilterOptions('department');
    
    if (divisionOptions.length > 1 && departmentOptions.length > 1) {
      await uarPage.applyFilters({
        division: divisionOptions[1],
        department: departmentOptions[1]
      });
      
      // Clear all filters
      await uarPage.clearFilters();
      
      // Verify all filters are cleared
      await expect(uarPage.divisionFilter).toHaveValue('');
      await expect(uarPage.departmentFilter).toHaveValue('');
      await expect(uarPage.applicationFilter).toHaveValue('');
      await expect(uarPage.statusFilter).toHaveValue('');
    }
  });

  test('should handle filter changes without applying', async () => {
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Change filter value without applying
      await uarPage.divisionFilter.selectOption(divisionOptions[1]);
      
      // Verify filter value is changed
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
      
      // Clear filters to reset
      await uarPage.clearFilters();
    }
  });

  test('should handle rapid filter changes', async () => {
    // Get available options
    const divisionOptions = await uarPage.getFilterOptions('division');
    const departmentOptions = await uarPage.getFilterOptions('department');
    
    if (divisionOptions.length > 2 && departmentOptions.length > 2) {
      // Rapidly change filters
      await uarPage.divisionFilter.selectOption(divisionOptions[1]);
      await uarPage.departmentFilter.selectOption(departmentOptions[1]);
      await uarPage.divisionFilter.selectOption(divisionOptions[2]);
      await uarPage.departmentFilter.selectOption(departmentOptions[2]);
      
      // Apply filters
      await uarPage.applyFiltersButton.click();
      
      // Verify final filter values
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[2]);
      await expect(uarPage.departmentFilter).toHaveValue(departmentOptions[2]);
    }
  });

  test('should handle filter with special characters', async () => {
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    // Find option with special characters if any
    const specialCharOption = divisionOptions.find(option => 
      /[^a-zA-Z0-9\s]/.test(option)
    );
    
    if (specialCharOption) {
      // Apply filter with special characters
      await uarPage.applyFilters({ division: specialCharOption });
      
      // Verify filter is applied correctly
      await expect(uarPage.divisionFilter).toHaveValue(specialCharOption);
    }
  });

  test('should handle filter with long text', async () => {
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    // Find option with long text if any
    const longTextOption = divisionOptions.find(option => option.length > 50);
    
    if (longTextOption) {
      // Apply filter with long text
      await uarPage.applyFilters({ division: longTextOption });
      
      // Verify filter is applied correctly
      await expect(uarPage.divisionFilter).toHaveValue(longTextOption);
    }
  });

  test('should handle filter with empty values', async () => {
    // Apply filter with empty values
    await uarPage.applyFilters({
      division: '',
      department: '',
      application: '',
      status: ''
    });
    
    // Verify filters are cleared
    await expect(uarPage.divisionFilter).toHaveValue('');
    await expect(uarPage.departmentFilter).toHaveValue('');
    await expect(uarPage.applicationFilter).toHaveValue('');
    await expect(uarPage.statusFilter).toHaveValue('');
  });

  test('should handle filter with invalid values', async () => {
    // Try to apply filter with invalid values
    await uarPage.divisionFilter.selectOption('invalid_value');
    await uarPage.applyFiltersButton.click();
    
    // Should handle gracefully without errors
    await uarPage.verifyUARPageElements();
  });

  test('should maintain filter state on page refresh', async () => {
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Apply filter
      await uarPage.applyFilters({ division: divisionOptions[1] });
      
      // Refresh page
      await uarPage.page.reload();
      await uarPage.waitForUARPageLoad();
      
      // Verify filter state is maintained
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
    }
  });

  test('should handle filter with network delay', async ({ page }) => {
    // Simulate network delay
    await page.route('**/api/uar/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Apply filter with network delay
      await uarPage.applyFilters({ division: divisionOptions[1] });
      
      // Verify filter is applied after delay
      await expect(uarPage.divisionFilter).toHaveValue(divisionOptions[1]);
    }
  });

  test('should handle filter with network error', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/uar/**', route => route.abort());
    
    // Get division options
    const divisionOptions = await uarPage.getFilterOptions('division');
    
    if (divisionOptions.length > 1) {
      // Try to apply filter with network error
      await uarPage.applyFilters({ division: divisionOptions[1] });
      
      // Should handle gracefully without errors
      await uarPage.verifyUARPageElements();
    }
  });

  test('should handle filter accessibility', async () => {
    // Verify filter elements are accessible
    await expect(uarPage.divisionFilter).toBeVisible();
    await expect(uarPage.departmentFilter).toBeVisible();
    await expect(uarPage.applicationFilter).toBeVisible();
    await expect(uarPage.statusFilter).toBeVisible();
    
    // Verify filter buttons are accessible
    await expect(uarPage.applyFiltersButton).toBeVisible();
    await expect(uarPage.clearFiltersButton).toBeVisible();
  });
});
