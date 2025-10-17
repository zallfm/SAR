// UAR Progress Service - Ready for API integration
export interface UarProgressData {
  label: string;
  total: number;
  approved: number;
  review: number;
  soApproved: number;
}

export interface UarProgressFilters {
  period?: string;
  division?: string;
  department?: string;
  system?: string;
}

export interface UarProgressResponse {
  divisions: UarProgressData[];
  departments: Record<string, UarProgressData[]>;
  systemApps: UarProgressData[];
  grandTotal: {
    review: number;
    approved: number;
    soApproved: number;
    completed: number;
  };
}

// Mock data service - will be replaced with real API calls
class UarProgressService {
  private baseUrl = process.env.REACT_APP_API_URL || '/api';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Cache management
  private getCacheKey(filters: UarProgressFilters): string {
    return JSON.stringify(filters);
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Clear cache when needed
  public clearCache(): void {
    this.cache.clear();
  }

  // Real API call method (ready for implementation)
  private async fetchFromAPI(endpoint: string, filters: UarProgressFilters): Promise<UarProgressResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add authentication headers here
        // 'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Mock data generator (temporary)
  private generateMockData(filters: UarProgressFilters): UarProgressResponse {
    // This will be replaced with real API call
    const divisions = [
      { label: 'PWPD', total: 85, approved: 78, review: 82, soApproved: 80 },
      { label: 'PAD', total: 92, approved: 88, review: 90, soApproved: 89 },
      { label: 'GAD', total: 76, approved: 72, review: 74, soApproved: 73 },
      { label: 'ISTD', total: 88, approved: 85, review: 87, soApproved: 86 },
      { label: 'EMD', total: 81, approved: 77, review: 79, soApproved: 78 },
      { label: 'FSD', total: 94, approved: 91, review: 93, soApproved: 92 },
      { label: 'HRD', total: 79, approved: 75, review: 77, soApproved: 76 },
    ];

    const departments: Record<string, UarProgressData[]> = {
      'PWPD': [
        { label: 'PWPD-IT', total: 87, approved: 82, review: 85, soApproved: 84 },
        { label: 'PWPD-Finance', total: 83, approved: 78, review: 81, soApproved: 80 },
        { label: 'PWPD-Admin', total: 80, approved: 75, review: 78, soApproved: 77 },
      ],
      'PAD': [
        { label: 'PAD-Development', total: 95, approved: 92, review: 94, soApproved: 93 },
        { label: 'PAD-QA', total: 89, approved: 85, review: 87, soApproved: 86 },
        { label: 'PAD-Support', total: 90, approved: 87, review: 89, soApproved: 88 },
      ],
      // Add more departments as needed
    };

    const systemApps = [
      { label: 'SAR', total: 90, approved: 85, review: 88, soApproved: 87 },
      { label: 'TPM', total: 88, approved: 83, review: 86, soApproved: 85 },
      { label: 'PASS', total: 92, approved: 89, review: 91, soApproved: 90 },
      { label: 'FAMS', total: 85, approved: 80, review: 83, soApproved: 82 },
      { label: 'BMS', total: 87, approved: 84, review: 86, soApproved: 85 },
      { label: 'HELPDESK', total: 89, approved: 86, review: 88, soApproved: 87 },
      { label: 'IAM', total: 91, approved: 88, review: 90, soApproved: 89 },
    ];

    // Calculate grand total
    const allData = [...divisions, ...Object.values(departments).flat(), ...systemApps];
    const grandTotal = {
      review: Math.round(allData.reduce((sum, item) => sum + item.review, 0) / allData.length),
      approved: Math.round(allData.reduce((sum, item) => sum + item.approved, 0) / allData.length),
      soApproved: Math.round(allData.reduce((sum, item) => sum + item.soApproved, 0) / allData.length),
      completed: Math.round(allData.reduce((sum, item) => sum + item.total, 0) / allData.length),
    };

    return { divisions, departments, systemApps, grandTotal };
  }

  // Main method to get UAR progress data
  public async getUarProgressData(filters: UarProgressFilters = {}): Promise<UarProgressResponse> {
    const cacheKey = this.getCacheKey(filters);
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // TODO: Replace with real API call
      // const data = await this.fetchFromAPI('/uar-progress', filters);
      
      // For now, use mock data
      const data = this.generateMockData(filters);
      
      // Cache the result
      this.setCachedData(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching UAR progress data:', error);
      // Fallback to mock data in case of API error
      return this.generateMockData(filters);
    }
  }

  // Method to refresh data (bypass cache)
  public async refreshUarProgressData(filters: UarProgressFilters = {}): Promise<UarProgressResponse> {
    const cacheKey = this.getCacheKey(filters);
    this.cache.delete(cacheKey);
    return this.getUarProgressData(filters);
  }

  // WebSocket connection for real-time updates (future implementation)
  public connectWebSocket(onUpdate: (data: UarProgressResponse) => void): () => void {
    // TODO: Implement WebSocket connection
    // const ws = new WebSocket(`${this.baseUrl.replace('http', 'ws')}/uar-progress/ws`);
    // 
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   onUpdate(data);
    // };
    // 
    // return () => ws.close();

    // For now, return a no-op function
    return () => {};
  }
}

// Export singleton instance
export const uarProgressService = new UarProgressService();
