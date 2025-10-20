#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * 
 * @description Script to analyze bundle size and generate optimization recommendations
 * @version 1.0.0
 * @author SAR Development Team
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBundleReport, validatePerformanceBudgets } from '../bundle-analysis.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main bundle analysis function
 */
async function analyzeBundle() {
  console.log('🔍 Starting bundle analysis...\n');
  
  try {
    // Check if dist directory exists
    const distPath = path.join(__dirname, '..', 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ Dist directory not found. Please run "npm run build" first.');
      process.exit(1);
    }
    
    // Read bundle stats if available
    const statsPath = path.join(distPath, 'bundle-analysis.json');
    let bundleStats = {};
    
    if (fs.existsSync(statsPath)) {
      bundleStats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    } else {
      console.log('⚠️  Bundle stats not found. Generating from dist files...');
      bundleStats = await generateStatsFromDist(distPath);
    }
    
    // Generate analysis report
    const report = generateBundleReport(bundleStats);
    
    // Validate performance budgets
    const validation = validatePerformanceBudgets(report);
    
    // Display results
    displayAnalysisResults(report, validation);
    
    // Save reports
    await saveReports(report, validation, distPath);
    
    console.log('\n✅ Bundle analysis completed successfully!');
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

/**
 * Generate bundle stats from dist files
 */
async function generateStatsFromDist(distPath) {
  const stats = {};
  
  // Read all JS files in dist/js directory
  const jsDir = path.join(distPath, 'js');
  if (!fs.existsSync(jsDir)) {
    console.log('⚠️  JS directory not found, checking dist root...');
    // Fallback to dist root
    const jsFiles = fs.readdirSync(distPath)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(distPath, file);
        const stat = fs.statSync(filePath);
        return {
          name: file,
          size: stat.size,
          path: filePath
        };
      });
    
    jsFiles.forEach(file => {
      const name = file.name.replace(/\.js$/, '');
      stats[name] = {
        size: file.size,
        gzipSize: estimateGzipSize(file.size),
        modules: [name]
      };
    });
  } else {
    // Read JS files from js directory
    const jsFiles = fs.readdirSync(jsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => {
        const filePath = path.join(jsDir, file);
        const stat = fs.statSync(filePath);
        return {
          name: file,
          size: stat.size,
          path: filePath
        };
      });
    
    jsFiles.forEach(file => {
      const name = file.name.replace(/\.js$/, '');
      stats[name] = {
        size: file.size,
        gzipSize: estimateGzipSize(file.size),
        modules: [name]
      };
    });
  }
  
  return stats;
}

/**
 * Estimate gzip size (rough approximation)
 */
function estimateGzipSize(originalSize) {
  // Typical gzip compression ratio is 60-80%
  return Math.round(originalSize * 0.7);
}

/**
 * Display analysis results
 */
function displayAnalysisResults(report, validation) {
  console.log('📊 Bundle Analysis Results\n');
  
  // Summary
  console.log('📈 Summary:');
  console.log(`   Total Size: ${Math.round(report.summary.totalSize / 1024)}KB`);
  console.log(`   Total Gzip Size: ${Math.round(report.summary.totalGzipSize / 1024)}KB`);
  console.log(`   Total Chunks: ${report.summary.totalChunks}`);
  console.log(`   Warnings: ${report.summary.warnings.length}`);
  console.log(`   Errors: ${report.summary.errors.length}\n`);
  
  // Performance Score
  console.log('🎯 Performance Score:');
  console.log(`   Score: ${validation.score}/100`);
  console.log(`   Status: ${validation.passed ? '✅ PASSED' : '❌ FAILED'}\n`);
  
  // Chunk Details
  console.log('📦 Chunk Details:');
  report.chunks.forEach(chunk => {
    const sizeKB = Math.round(chunk.size / 1024);
    const gzipKB = Math.round(chunk.gzipSize / 1024);
    const status = chunk.errors.length > 0 ? '❌' : 
                   chunk.warnings.length > 0 ? '⚠️' : '✅';
    
    console.log(`   ${status} ${chunk.name}: ${sizeKB}KB (${gzipKB}KB gzipped)`);
    
    if (chunk.warnings.length > 0) {
      chunk.warnings.forEach(warning => {
        console.log(`      ⚠️  ${warning}`);
      });
    }
    
    if (chunk.errors.length > 0) {
      chunk.errors.forEach(error => {
        console.log(`      ❌ ${error}`);
      });
    }
  });
  
  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach((rec, index) => {
      const icon = rec.type === 'error' ? '❌' : 
                   rec.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${index + 1}. ${icon} ${rec.message}`);
      console.log(`      Action: ${rec.action}`);
    });
  }
  
  // Performance Budget Results
  console.log('\n📋 Performance Budget Results:');
  validation.results.forEach(result => {
    const icon = result.status === 'passed' ? '✅' : 
                 result.status === 'warning' ? '⚠️' : '❌';
    console.log(`   ${icon} ${result.metric}: ${result.value} (Budget: ${result.budget})`);
  });
}

/**
 * Save analysis reports
 */
async function saveReports(report, validation, distPath) {
  // Save JSON report
  const jsonReport = {
    report,
    validation,
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(distPath, 'bundle-analysis-report.json'),
    JSON.stringify(jsonReport, null, 2)
  );
  
  // Save CSV report
  const csvContent = generateCSVReport(report);
  fs.writeFileSync(
    path.join(distPath, 'bundle-analysis-report.csv'),
    csvContent
  );
  
  console.log('\n💾 Reports saved:');
  console.log(`   📄 JSON: dist/bundle-analysis-report.json`);
  console.log(`   📊 CSV: dist/bundle-analysis-report.csv`);
}

/**
 * Generate CSV report
 */
function generateCSVReport(report) {
  const headers = ['Chunk Name', 'Size (KB)', 'Gzip Size (KB)', 'Modules', 'Warnings', 'Errors'];
  const rows = [headers.join(',')];
  
  report.chunks.forEach(chunk => {
    const row = [
      chunk.name,
      Math.round(chunk.size / 1024),
      Math.round(chunk.gzipSize / 1024),
      chunk.modules.length,
      chunk.warnings.length,
      chunk.errors.length
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

// Run analysis if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  analyzeBundle();
}

export { analyzeBundle };
