import { FullConfig } from '@playwright/test';

/**
 * Global Teardown for Playwright Tests
 * 
 * This file runs once after all tests to:
 * 1. Clean up test data
 * 2. Generate test reports
 * 3. Clean up temporary files
 * 
 * Following Context7 best practices for enterprise testing
 */

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up authentication state file
    await cleanupAuthState();
    
    // Clean up test artifacts
    await cleanupTestArtifacts();
    
    // Generate summary report
    await generateTestSummary();
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid masking test failures
  }
}

/**
 * Clean up authentication state file
 */
async function cleanupAuthState() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const authStatePath = path.join(process.cwd(), 'tests', 'auth-state.json');
    
    if (fs.existsSync(authStatePath)) {
      fs.unlinkSync(authStatePath);
      console.log('🗑️ Authentication state file cleaned up');
    }
  } catch (error) {
    console.warn('⚠️ Failed to clean up auth state:', error);
  }
}

/**
 * Clean up test artifacts
 */
async function cleanupTestArtifacts() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const testResultsPath = path.join(process.cwd(), 'test-results');
    
    if (fs.existsSync(testResultsPath)) {
      // Keep only the latest 5 test result directories
      const dirs = fs.readdirSync(testResultsPath)
        .filter(file => fs.statSync(path.join(testResultsPath, file)).isDirectory())
        .sort()
        .reverse();
      
      if (dirs.length > 5) {
        const dirsToDelete = dirs.slice(5);
        for (const dir of dirsToDelete) {
          fs.rmSync(path.join(testResultsPath, dir), { recursive: true, force: true });
        }
        console.log(`🗑️ Cleaned up ${dirsToDelete.length} old test result directories`);
      }
    }
  } catch (error) {
    console.warn('⚠️ Failed to clean up test artifacts:', error);
  }
}

/**
 * Generate test summary
 */
async function generateTestSummary() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const resultsPath = path.join(process.cwd(), 'test-results', 'results.json');
    
    if (fs.existsSync(resultsPath)) {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      const summary = {
        timestamp: new Date().toISOString(),
        totalTests: results.stats?.total || 0,
        passed: results.stats?.passed || 0,
        failed: results.stats?.failed || 0,
        skipped: results.stats?.skipped || 0,
        duration: results.stats?.duration || 0,
        suites: results.suites?.length || 0
      };
      
      const summaryPath = path.join(process.cwd(), 'test-results', 'summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
      
      console.log('📊 Test summary generated:', {
        total: summary.totalTests,
        passed: summary.passed,
        failed: summary.failed,
        skipped: summary.skipped
      });
    }
  } catch (error) {
    console.warn('⚠️ Failed to generate test summary:', error);
  }
}

export default globalTeardown;
