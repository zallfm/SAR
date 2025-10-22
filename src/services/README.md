# UAR Progress API Integration Guide

## Overview
This directory contains the service layer for UAR Progress data management, ready for API integration with performance optimizations.

## Files Structure

### 1. `uarProgressService.ts`
Main service class for API communication with caching and error handling.

**Key Features:**
- ✅ Caching mechanism (5-minute TTL)
- ✅ Error handling with fallback to mock data
- ✅ Ready for WebSocket integration
- ✅ Environment-based API URL configuration

**Usage:**
```typescript
import { uarProgressService } from './uarProgressService';

// Get data with caching
const data = await uarProgressService.getUarProgressData({
  period: '07-2025',
  division: 'PWPD'
});

// Refresh data (bypass cache)
const freshData = await uarProgressService.refreshUarProgressData({
  period: '07-2025'
});
```

### 2. `useUarProgressData.ts` (in hooks directory)
Custom React hook for data management with performance optimizations.

**Key Features:**
- ✅ Auto-refresh with configurable intervals
- ✅ WebSocket support for real-time updates
- ✅ Request cancellation and cleanup
- ✅ Loading and error states management

**Usage:**
```typescript
import { useUarProgressData } from '../hooks/useUarProgressData';

const MyComponent = () => {
  const { data, loading, error, refresh } = useUarProgressData(
    { period: '07-2025' },
    {
      autoRefresh: true,
      refreshInterval: 30000, // 30 seconds
      enableCache: true,
      enableWebSocket: true
    }
  );

  // Component logic...
};
```

## API Integration Steps

### Step 1: Configure Environment Variables
Add to your `.env` file:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000/ws
```

### Step 2: Update Service Implementation
In `uarProgressService.ts`, replace the mock data generation with real API calls:

```typescript
// Replace this method:
private generateMockData(filters: UarProgressFilters): UarProgressResponse {
  // Mock data generation...
}

// With this:
private async fetchFromAPI(endpoint: string, filters: UarProgressFilters): Promise<UarProgressResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  const response = await fetch(`${this.baseUrl}${endpoint}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
```

### Step 3: Update Main Method
Replace the mock data call in `getUarProgressData`:

```typescript
// Change from:
const data = this.generateMockData(filters);

// To:
const data = await this.fetchFromAPI('/uar-progress', filters);
```

### Step 4: Implement WebSocket (Optional)
For real-time updates, implement WebSocket connection:

```typescript
public connectWebSocket(onUpdate: (data: UarProgressResponse) => void): () => void {
  const ws = new WebSocket(`${this.wsUrl}/uar-progress/ws`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onUpdate(data);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return () => ws.close();
}
```

## Performance Optimizations

### 1. Caching
- 5-minute TTL for API responses
- Automatic cache invalidation
- Memory-efficient cache management

### 2. Request Management
- Request cancellation on component unmount
- Debounced filter updates
- Abort controller for concurrent requests

### 3. Data Processing
- Virtual scrolling for large datasets
- Batch processing for heavy computations
- Web Workers for CPU-intensive tasks

### 4. Loading States
- Skeleton loaders for better UX
- Progressive loading for large datasets
- Error boundaries for graceful error handling

## API Endpoints Expected

### GET `/api/uar-progress`
Query parameters:
- `period` (optional): Period filter (e.g., "07-2025")
- `division` (optional): Division filter
- `department` (optional): Department filter
- `system` (optional): System filter

Response format:
```json
{
  "divisions": [
    {
      "label": "PWPD",
      "total": 85,
      "approved": 78,
      "review": 82,
      "soApproved": 80
    }
  ],
  "departments": {
    "PWPD": [
      {
        "label": "PWPD-IT",
        "total": 87,
        "approved": 82,
        "review": 85,
        "soApproved": 84
      }
    ]
  },
  "systemApps": [
    {
      "label": "SAR",
      "total": 90,
      "approved": 85,
      "review": 88,
      "soApproved": 87
    }
  ],
  "grandTotal": {
    "review": 70,
    "approved": 49,
    "soApproved": 89,
    "completed": 69
  }
}
```

### WebSocket `/ws/uar-progress/ws`
Real-time updates for data changes.

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=services
```

### Integration Tests
```bash
npm test -- --testPathPattern=integration
```

## Monitoring

### Performance Monitoring
The service includes built-in performance monitoring:

```typescript
import { performanceMonitor } from '../utils/performanceUtils';

// Monitor API call performance
const stopTiming = performanceMonitor.startTiming('API_CALL');
// ... API call
stopTiming();

// Get performance metrics
const metrics = performanceMonitor.getMetrics();
console.log('Average API call time:', metrics.API_CALL?.average);
```

### Error Tracking
All errors are logged and can be integrated with error tracking services:

```typescript
// In uarProgressService.ts
catch (error) {
  console.error('Error fetching UAR progress data:', error);
  // Integrate with error tracking service (e.g., Sentry)
  // errorTrackingService.captureException(error);
  throw error;
}
```

## Migration Checklist

- [ ] Set up environment variables
- [ ] Implement real API endpoints
- [ ] Update service to use real API calls
- [ ] Test API integration
- [ ] Implement WebSocket (if needed)
- [ ] Set up error tracking
- [ ] Configure performance monitoring
- [ ] Test with large datasets
- [ ] Optimize for production
- [ ] Set up API rate limiting
- [ ] Implement authentication
- [ ] Add API documentation
