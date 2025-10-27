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
      { label: 'PWPD', total: 90, approved: 85, review: 87, soApproved: 80 },
      { label: 'PAD', total: 84, approved: 80, review: 81, soApproved: 78 },
      { label: 'GAD', total: 89, approved: 82, review: 85, soApproved: 80 },
      { label: 'ISTD', total: 93, approved: 88, review: 90, soApproved: 85 },
      { label: 'EMD', total: 82, approved: 80, review: 80, soApproved: 77 },
      { label: 'FSD', total: 75, approved: 72, review: 73, soApproved: 71 },
      { label: 'HRD', total: 93, approved: 87, review: 90, soApproved: 88 },
      { label: 'ITD', total: 83, approved: 75, review: 82, soApproved: 78 },
      { label: 'MKT', total: 91, approved: 85, review: 88, soApproved: 83 },
      { label: 'RND', total: 92, approved: 85, review: 89, soApproved: 86 },
      { label: 'QAD', total: 83, approved: 78, review: 82, soApproved: 79 },
      { label: 'SCD', total: 78, approved: 73, review: 75, soApproved: 72 },
      { label: 'PRD', total: 90, approved: 85, review: 88, soApproved: 86 },
      { label: 'FIN', total: 87, approved: 83, review: 85, soApproved: 84 },
      { label: 'LOG', total: 83, approved: 78, review: 80, soApproved: 75 },
      { label: 'SAD', total: 80, approved: 74, review: 79, soApproved: 72 },
      { label: 'TMD', total: 90, approved: 83, review: 87, soApproved: 82 },
      { label: 'CRD', total: 85, approved: 80, review: 82, soApproved: 80 },
      { label: 'EVD', total: 94, approved: 88, review: 91, soApproved: 89 },
      { label: 'BDD', total: 85, approved: 80, review: 84, soApproved: 81 },
      { label: 'CMD', total: 83, approved: 78, review: 82, soApproved: 77 },
      { label: 'SPD', total: 93, approved: 88, review: 90, soApproved: 91 },
      { label: 'HSD', total: 95, approved: 90, review: 92, soApproved: 89 },
      { label: 'OPD', total: 85, approved: 80, review: 82, soApproved: 79 },
      { label: 'ASD', total: 92, approved: 87, review: 89, soApproved: 90 },
      { label: 'CSD', total: 92, approved: 83, review: 87, soApproved: 86 },
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
      'ISTD': [
        { label: 'CIO', total: 90, approved: 84, review: 87, soApproved: 86 },
        { label: 'NWS', total: 85, approved: 79, review: 82, soApproved: 80 },
        { label: 'SSL', total: 88, approved: 82, review: 85, soApproved: 84 },
        { label: 'SCM', total: 92, approved: 86, review: 89, soApproved: 88 },
      ],
      'GAD': [
        { label: 'GAD-Main', total: 89, approved: 82, review: 85, soApproved: 80 },
      ],
      'EMD': [
        { label: 'EMD-1', total: 84, approved: 78, review: 82, soApproved: 80 },
      ],
      'FSD': [
        { label: 'FSD-1', total: 78, approved: 74, review: 76, soApproved: 73 },
      ],
      'HRD': [
        { label: 'HRD-Recruitment', total: 94, approved: 88, review: 91, soApproved: 89 },
        { label: 'HRD-Payroll', total: 92, approved: 86, review: 89, soApproved: 87 },
      ],
      'ITD': [
        { label: 'ITD-Infra', total: 85, approved: 78, review: 83, soApproved: 80 },
        { label: 'ITD-Apps', total: 88, approved: 81, review: 85, soApproved: 82 },
      ],
      'MKT': [
        { label: 'MKT-Digital', total: 92, approved: 87, review: 89, soApproved: 85 },
      ],
      'RND': [
        { label: 'RND-Labs', total: 93, approved: 86, review: 90, soApproved: 88 },
      ],
      'QAD': [
        { label: 'QAD-Audit', total: 85, approved: 80, review: 83, soApproved: 81 },
      ],
      'SCD': [
        { label: 'SCD-Logistics', total: 80, approved: 75, review: 78, soApproved: 74 },
      ],
      'PRD': [
        { label: 'PRD-Ops', total: 91, approved: 86, review: 89, soApproved: 87 },
      ],
      'FIN': [
        { label: 'FIN-Accounting', total: 88, approved: 84, review: 86, soApproved: 85 },
      ],
      'LOG': [
        { label: 'LOG-Warehouse', total: 85, approved: 80, review: 82, soApproved: 78 },
      ],
      'SAD': [
        { label: 'SAD-Sales', total: 82, approved: 76, review: 80, soApproved: 75 },
      ],
      'TMD': [
        { label: 'TMD-Training', total: 91, approved: 85, review: 88, soApproved: 84 },
      ],
      'CRD': [
        { label: 'CRD-Internal', total: 86, approved: 81, review: 83, soApproved: 81 },
      ],
      'EVD': [
        { label: 'EVD-Planning', total: 95, approved: 90, review: 92, soApproved: 91 },
      ],
      'BDD': [
        { label: 'BDD-Analytics', total: 86, approved: 81, review: 85, soApproved: 83 },
      ],
      'CMD': [
        { label: 'CMD-Comms', total: 84, approved: 79, review: 83, soApproved: 79 },
      ],
      'SPD': [
        { label: 'SPD-Proc', total: 94, approved: 89, review: 91, soApproved: 92 },
      ],
      'HSD': [
        { label: 'HSD-Safety', total: 96, approved: 91, review: 93, soApproved: 90 },
      ],
      'OPD': [
        { label: 'OPD-Dash', total: 86, approved: 81, review: 83, soApproved: 80 },
      ],
      'ASD': [
        { label: 'ASD-Assets', total: 93, approved: 88, review: 90, soApproved: 91 },
      ],
      'CSD': [
        { label: 'CSD-Support', total: 93, approved: 85, review: 88, soApproved: 87 },
      ]

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
    return () => { };
  }
}

// Export singleton instance
export const uarProgressService = new UarProgressService();
