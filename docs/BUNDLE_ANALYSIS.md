# Bundle Analysis Guide

## Overview

This document describes the bundle analysis system implemented for the SAR application to optimize performance and track bundle size.

## Features

- ✅ **Bundle Size Tracking** - Monitor total bundle size and individual chunk sizes
- ✅ **Performance Budgets** - Set and validate performance thresholds
- ✅ **Optimization Recommendations** - Get actionable suggestions for bundle optimization
- ✅ **Multiple Report Formats** - HTML, JSON, and CSV reports
- ✅ **CI/CD Integration** - Automated bundle analysis in build pipeline

## Quick Start

### 1. Build and Analyze

```bash
# Build with bundle analysis
npm run build:analyze

# Or analyze existing build
npm run analyze
```

### 2. View Results

The analysis will generate several reports in the `dist/` directory:

- `bundle-analysis.html` - Interactive HTML report
- `bundle-analysis-report.json` - Detailed JSON report
- `bundle-analysis-report.csv` - CSV data for spreadsheet analysis

## Configuration

### Bundle Analysis Config

The bundle analysis is configured in `bundle-analysis.config.js`:

```javascript
export const bundleAnalysisConfig = {
  // Size thresholds
  thresholds: {
    chunkSize: {
      warning: 500,  // 500KB
      error: 1000,   // 1MB
    },
    totalSize: {
      warning: 2000, // 2MB
      error: 5000,   // 5MB
    }
  },
  
  // Performance budgets
  performanceBudgets: {
    fcp: 1500, // First Contentful Paint
    lcp: 2500, // Largest Contentful Paint
    fid: 100,  // First Input Delay
    cls: 0.1,  // Cumulative Layout Shift
    tti: 3000, // Time to Interactive
  }
};
```

### Vite Configuration

Bundle optimization is configured in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils-vendor': ['dompurify', 'validator'],
        }
      }
    }
  }
});
```

## Performance Budgets

### Current Thresholds

| Metric | Warning | Error | Current |
|--------|---------|-------|---------|
| Total Bundle Size | 2MB | 5MB | - |
| Individual Chunk | 500KB | 1MB | - |
| Gzip Size | 200KB | 500KB | - |

### Performance Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| FCP | 1.5s | First Contentful Paint |
| LCP | 2.5s | Largest Contentful Paint |
| FID | 100ms | First Input Delay |
| CLS | 0.1 | Cumulative Layout Shift |
| TTI | 3s | Time to Interactive |

## Optimization Strategies

### 1. Code Splitting

```typescript
// Lazy load feature modules
const UarProgressPage = lazy(() => import('./UarProgressPage'));
const ApplicationPage = lazy(() => import('./ApplicationPage'));

// Route-based splitting
const routes = [
  {
    path: '/uar',
    component: lazy(() => import('./pages/UarPage'))
  }
];
```

### 2. Vendor Chunking

```typescript
// Separate vendor libraries
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'chart-vendor': ['chart.js', 'react-chartjs-2'],
  'utils-vendor': ['dompurify', 'validator'],
}
```

### 3. Tree Shaking

```typescript
// Import only what you need
import { debounce } from 'lodash/debounce';
import { format } from 'date-fns/format';

// Instead of
import _ from 'lodash';
import * as dateFns from 'date-fns';
```

### 4. Dynamic Imports

```typescript
// Load heavy components on demand
const HeavyChart = lazy(() => import('./HeavyChart'));

// Conditional loading
const loadChartLibrary = () => import('chart.js');
```

## Monitoring

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/bundle-analysis.yml
name: Bundle Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build:analyze
      - name: Upload bundle analysis
        uses: actions/upload-artifact@v2
        with:
          name: bundle-analysis
          path: dist/bundle-analysis-report.json
```

### Performance Monitoring

```typescript
// Monitor bundle size in production
import { performance } from 'perf_hooks';

const startTime = performance.now();
// ... load application
const endTime = performance.now();

console.log(`Bundle load time: ${endTime - startTime}ms`);
```

## Troubleshooting

### Common Issues

1. **Bundle too large**
   - Check for duplicate dependencies
   - Implement code splitting
   - Use dynamic imports

2. **Chunk size warnings**
   - Split large chunks
   - Move heavy libraries to separate chunks
   - Optimize imports

3. **Performance budget exceeded**
   - Review bundle analysis report
   - Implement recommended optimizations
   - Consider lazy loading

### Debug Commands

```bash
# Analyze bundle composition
npm run build:stats

# Check bundle size
npm run analyze

# View detailed report
open dist/bundle-analysis.html
```

## Best Practices

### 1. Regular Monitoring

- Run bundle analysis on every build
- Set up alerts for size increases
- Track performance metrics over time

### 2. Optimization Strategy

- Start with largest chunks
- Focus on vendor libraries
- Implement lazy loading for features

### 3. Performance Budgets

- Set realistic thresholds
- Review and adjust regularly
- Consider user experience impact

## Tools and Resources

- [Vite Bundle Analyzer](https://github.com/rollup/rollup-plugin-visualizer)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Bundlephobia](https://bundlephobia.com/) - Check package sizes
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing

## Contributing

When adding new dependencies or features:

1. Check bundle size impact
2. Consider code splitting opportunities
3. Update performance budgets if needed
4. Document optimization decisions

## Support

For questions or issues with bundle analysis:

1. Check the generated reports
2. Review this documentation
3. Consult the team for optimization strategies
