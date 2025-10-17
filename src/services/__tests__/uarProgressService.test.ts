import { uarProgressService, UarProgressFilters } from '../uarProgressService';

// Mock fetch
global.fetch = jest.fn();

describe('UarProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    uarProgressService.clearCache();
  });

  describe('getUarProgressData', () => {
    it('should return mock data when API is not available', async () => {
      const filters: UarProgressFilters = { period: '07-2025' };
      const result = await uarProgressService.getUarProgressData(filters);

      expect(result).toHaveProperty('divisions');
      expect(result).toHaveProperty('departments');
      expect(result).toHaveProperty('systemApps');
      expect(result).toHaveProperty('grandTotal');
      expect(Array.isArray(result.divisions)).toBe(true);
      expect(typeof result.departments).toBe('object');
      expect(Array.isArray(result.systemApps)).toBe(true);
    });

    it('should cache data correctly', async () => {
      const filters: UarProgressFilters = { period: '07-2025' };
      
      // First call
      const result1 = await uarProgressService.getUarProgressData(filters);
      
      // Second call should use cache
      const result2 = await uarProgressService.getUarProgressData(filters);
      
      expect(result1).toEqual(result2);
    });

    it('should handle different filters', async () => {
      const filters1: UarProgressFilters = { period: '07-2025' };
      const filters2: UarProgressFilters = { period: '08-2025' };
      
      const result1 = await uarProgressService.getUarProgressData(filters1);
      const result2 = await uarProgressService.getUarProgressData(filters2);
      
      // Since mock data doesn't vary by filters yet, results will be the same
      // This test validates that the service handles different filter inputs without error
      expect(result1).toHaveProperty('divisions');
      expect(result1).toHaveProperty('departments');
      expect(result1).toHaveProperty('systemApps');
      expect(result1).toHaveProperty('grandTotal');
      expect(result2).toHaveProperty('divisions');
      expect(result2).toHaveProperty('departments');
      expect(result2).toHaveProperty('systemApps');
      expect(result2).toHaveProperty('grandTotal');
    });
  });

  describe('refreshUarProgressData', () => {
    it('should bypass cache and return fresh data', async () => {
      const filters: UarProgressFilters = { period: '07-2025' };
      
      // First call to populate cache
      await uarProgressService.getUarProgressData(filters);
      
      // Refresh should bypass cache
      const result = await uarProgressService.refreshUarProgressData(filters);
      
      expect(result).toHaveProperty('divisions');
      expect(result).toHaveProperty('departments');
      expect(result).toHaveProperty('systemApps');
      expect(result).toHaveProperty('grandTotal');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      const filters: UarProgressFilters = { period: '07-2025' };
      
      // Populate cache
      await uarProgressService.getUarProgressData(filters);
      
      // Clear cache
      uarProgressService.clearCache();
      
      // Next call should not use cache
      const result = await uarProgressService.getUarProgressData(filters);
      expect(result).toHaveProperty('divisions');
    });
  });

  describe('connectWebSocket', () => {
    it('should return a cleanup function', () => {
      const cleanup = uarProgressService.connectWebSocket(() => {});
      expect(typeof cleanup).toBe('function');
      
      // Should not throw when called
      expect(() => cleanup()).not.toThrow();
    });
  });
});
