/**
 * Bundle Analysis Configuration
 * 
 * @description Configuration for bundle analysis and optimization tracking
 * @version 1.0.0
 * @author SAR Development Team
 */

export const bundleAnalysisConfig = {
  // Bundle size thresholds
  thresholds: {
    // Individual chunk size limits (in KB)
    chunkSize: {
      warning: 500,  // 500KB
      error: 1000,   // 1MB
    },
    // Total bundle size limits (in KB)
    totalSize: {
      warning: 2000, // 2MB
      error: 5000,   // 5MB
    },
    // Gzip size limits (in KB)
    gzipSize: {
      warning: 200,  // 200KB
      error: 500,    // 500KB
    }
  },

  // Chunk optimization rules
  chunkRules: {
    // Vendor chunks that should be separate
    vendors: [
      'react',
      'react-dom',
      'react-router-dom',
      'chart.js',
      'react-chartjs-2',
      'zustand',
      'dompurify',
      'validator'
    ],
    
    // Feature chunks that can be lazy loaded
    features: [
      'auth',
      'uar',
      'application',
      'logging',
      'dashboard'
    ],
    
    // Common chunks that should be shared
    common: [
      'utils',
      'types',
      'constants',
      'hooks'
    ]
  },

  // Performance budgets
  performanceBudgets: {
    // First Contentful Paint (FCP)
    fcp: 1500, // 1.5 seconds
    
    // Largest Contentful Paint (LCP)
    lcp: 2500, // 2.5 seconds
    
    // First Input Delay (FID)
    fid: 100, // 100ms
    
    // Cumulative Layout Shift (CLS)
    cls: 0.1, // 0.1
    
    // Time to Interactive (TTI)
    tti: 3000, // 3 seconds
  },

  // Bundle analysis output
  output: {
    // HTML report
    html: {
      enabled: true,
      filename: 'dist/bundle-analysis.html',
      template: 'treemap', // sunburst, treemap, network
      open: true
    },
    
    // JSON report
    json: {
      enabled: true,
      filename: 'dist/bundle-analysis.json'
    },
    
    // CSV report
    csv: {
      enabled: true,
      filename: 'dist/bundle-analysis.csv'
    }
  },

  // Optimization recommendations
  recommendations: {
    // Code splitting recommendations
    codeSplitting: {
      enabled: true,
      minChunkSize: 20000, // 20KB
      maxChunkSize: 500000, // 500KB
    },
    
    // Tree shaking recommendations
    treeShaking: {
      enabled: true,
      analyzeUnusedExports: true,
      analyzeSideEffects: true
    },
    
    // Compression recommendations
    compression: {
      gzip: true,
      brotli: true,
      minify: true
    }
  }
};

/**
 * Generate bundle analysis report
 * 
 * @param {Object} bundleStats - Bundle statistics from rollup
 * @returns {Object} Analysis report with recommendations
 */
export function generateBundleReport(bundleStats) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSize: 0,
      totalChunks: 0,
      totalGzipSize: 0,
      warnings: [],
      errors: []
    },
    chunks: [],
    recommendations: []
  };

  // Analyze each chunk
  Object.entries(bundleStats).forEach(([chunkName, chunk]) => {
    const chunkSize = chunk.size || 0;
    const gzipSize = chunk.gzipSize || 0;
    
    report.summary.totalSize += chunkSize;
    report.summary.totalGzipSize += gzipSize;
    report.summary.totalChunks++;
    
    const chunkAnalysis = {
      name: chunkName,
      size: chunkSize,
      gzipSize: gzipSize,
      modules: chunk.modules || [],
      warnings: [],
      errors: []
    };
    
    // Check size thresholds
    if (chunkSize > bundleAnalysisConfig.thresholds.chunkSize.warning * 1024) {
      chunkAnalysis.warnings.push(`Chunk size (${Math.round(chunkSize / 1024)}KB) exceeds warning threshold`);
    }
    
    if (chunkSize > bundleAnalysisConfig.thresholds.chunkSize.error * 1024) {
      chunkAnalysis.errors.push(`Chunk size (${Math.round(chunkSize / 1024)}KB) exceeds error threshold`);
    }
    
    if (gzipSize > bundleAnalysisConfig.thresholds.gzipSize.warning * 1024) {
      chunkAnalysis.warnings.push(`Gzip size (${Math.round(gzipSize / 1024)}KB) exceeds warning threshold`);
    }
    
    report.chunks.push(chunkAnalysis);
  });
  
  // Generate recommendations
  if (report.summary.totalSize > bundleAnalysisConfig.thresholds.totalSize.warning * 1024) {
    report.recommendations.push({
      type: 'warning',
      message: `Total bundle size (${Math.round(report.summary.totalSize / 1024)}KB) is large. Consider code splitting.`,
      action: 'Implement lazy loading for feature modules'
    });
  }
  
  // Check for large chunks that could be split
  report.chunks.forEach(chunk => {
    if (chunk.size > bundleAnalysisConfig.recommendations.codeSplitting.maxChunkSize) {
      report.recommendations.push({
        type: 'info',
        message: `Chunk "${chunk.name}" (${Math.round(chunk.size / 1024)}KB) could be split further`,
        action: 'Consider splitting this chunk into smaller modules'
      });
    }
  });
  
  return report;
}

/**
 * Validate bundle against performance budgets
 * 
 * @param {Object} bundleReport - Bundle analysis report
 * @returns {Object} Validation results
 */
export function validatePerformanceBudgets(bundleReport) {
  const validation = {
    passed: true,
    results: [],
    score: 100
  };
  
  // Check bundle size budget
  const totalSizeKB = bundleReport.summary.totalSize / 1024;
  const sizeBudget = bundleAnalysisConfig.thresholds.totalSize.warning;
  
  if (totalSizeKB > sizeBudget) {
    validation.passed = false;
    validation.score -= 20;
    validation.results.push({
      metric: 'Bundle Size',
      value: `${Math.round(totalSizeKB)}KB`,
      budget: `${sizeBudget}KB`,
      status: 'failed',
      impact: 'High'
    });
  } else {
    validation.results.push({
      metric: 'Bundle Size',
      value: `${Math.round(totalSizeKB)}KB`,
      budget: `${sizeBudget}KB`,
      status: 'passed',
      impact: 'Low'
    });
  }
  
  // Check chunk count
  const chunkCount = bundleReport.summary.totalChunks;
  const optimalChunkCount = 5; // Optimal number of chunks
  
  if (chunkCount > optimalChunkCount * 2) {
    validation.score -= 10;
    validation.results.push({
      metric: 'Chunk Count',
      value: chunkCount,
      budget: `≤${optimalChunkCount * 2}`,
      status: 'warning',
      impact: 'Medium'
    });
  } else {
    validation.results.push({
      metric: 'Chunk Count',
      value: chunkCount,
      budget: `≤${optimalChunkCount * 2}`,
      status: 'passed',
      impact: 'Low'
    });
  }
  
  return validation;
}

export default bundleAnalysisConfig;
