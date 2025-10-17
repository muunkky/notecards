#!/usr/bin/env node
/**
 * Advanced Test Performance Analyzer
 * Identifies optimization opportunities in the test suite
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';

const TEST_DIR = 'src/test';
const PERFORMANCE_THRESHOLDS = {
  LARGE_TEST_FILE: 50, // tests per file
  SLOW_EXECUTION: 20, // ms per test
  MOCK_HEAVY: 10, // mocks per test
  DEEP_NESTING: 5  // describe nesting levels
};

class TestPerformanceAnalyzer {
  constructor() {
    this.results = {
      totalFiles: 0,
      totalTests: 0,
      performanceIssues: [],
      optimizationRecommendations: [],
      summary: {}
    };
  }

  async analyze() {
    console.log('🔍 Analyzing test performance patterns...\n');
    
    await this.scanTestFiles();
    await this.runPerformanceProfile();
    this.generateRecommendations();
    this.printReport();
  }

  async scanTestFiles() {
    const testFiles = await this.findTestFiles(TEST_DIR);
    
    for (const file of testFiles) {
      await this.analyzeTestFile(file);
    }
  }

  async findTestFiles(dir) {
    const files = [];
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.findTestFiles(fullPath));
      } else if (entry.name.match(/\.(test|spec)\.(ts|tsx|js|jsx)$/)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async analyzeTestFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const analysis = this.analyzeFileContent(content, filePath);
      
      this.results.totalFiles++;
      this.results.totalTests += analysis.testCount;
      
      if (analysis.issues.length > 0) {
        this.results.performanceIssues.push({
          file: filePath,
          ...analysis
        });
      }
    } catch (error) {
      console.warn(`Warning: Could not analyze ${filePath}:`, error.message);
    }
  }

  analyzeFileContent(content, filePath) {
    const lines = content.split('\n');
    const analysis = {
      testCount: 0,
      mockCount: 0,
      nestingDepth: 0,
      issues: [],
      recommendations: []
    };

    let currentNesting = 0;
    let inTest = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Count tests
      if (line.match(/^\s*(it|test)\s*\(/)) {
        analysis.testCount++;
        inTest = true;
      }
      
      // Count mocks
      if (line.includes('vi.') || line.includes('mock') || line.includes('spy')) {
        analysis.mockCount++;
      }
      
      // Track nesting depth
      if (line.match(/^\s*describe\s*\(/)) {
        currentNesting++;
        analysis.nestingDepth = Math.max(analysis.nestingDepth, currentNesting);
      }
      if (line.includes('});') && currentNesting > 0) {
        currentNesting--;
      }
      
      // Identify potential performance issues
      if (line.includes('setTimeout') || line.includes('setInterval')) {
        analysis.issues.push(`Line ${i + 1}: Timer usage may cause flakiness`);
      }
      
      if (line.includes('async') && line.includes('await') && !line.includes('waitFor')) {
        // This is too aggressive, let's be more specific
        if (line.includes('new Promise') || line.includes('Promise.resolve')) {
          analysis.issues.push(`Line ${i + 1}: Raw Promise usage - consider using testing utilities`);
        }
      }
      
      if (line.includes('fireEvent') && !line.includes('userEvent')) {
        analysis.issues.push(`Line ${i + 1}: Consider userEvent over fireEvent for better performance`);
      }
    }

    // Check thresholds
    if (analysis.testCount > PERFORMANCE_THRESHOLDS.LARGE_TEST_FILE) {
      analysis.issues.push(`Large test file: ${analysis.testCount} tests (consider splitting)`);
    }
    
    if (analysis.nestingDepth > PERFORMANCE_THRESHOLDS.DEEP_NESTING) {
      analysis.issues.push(`Deep nesting: ${analysis.nestingDepth} levels (consider flattening)`);
    }
    
    if (analysis.mockCount > PERFORMANCE_THRESHOLDS.MOCK_HEAVY) {
      analysis.issues.push(`Mock-heavy: ${analysis.mockCount} mocks (consider test utilities)`);
    }

    return analysis;
  }

  async runPerformanceProfile() {
    console.log('📊 Running performance profile...');
    
    try {
      const start = Date.now();
      const result = await this.runCommand('npm', ['test']);
      const duration = Date.now() - start;
      
      this.results.summary = {
        totalRuntime: duration,
        averagePerTest: duration / this.results.totalTests,
        averagePerFile: duration / this.results.totalFiles
      };
      
      console.log(`✅ Performance profile complete: ${duration}ms total`);
    } catch (error) {
      console.warn('⚠️  Could not run performance profile:', error.message);
      this.results.summary = { error: 'Could not measure runtime' };
    }
  }

  runCommand(command, args) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { stdio: 'pipe' });
      
      let stdout = '';
      process.stdout.on('data', (data) => stdout += data);
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });
      
      process.on('error', reject);
    });
  }

  generateRecommendations() {
    const { totalFiles, totalTests, performanceIssues } = this.results;
    
    // General recommendations
    if (totalTests > 300) {
      this.results.optimizationRecommendations.push(
        '🚀 Large test suite detected - consider parallel execution optimization'
      );
    }
    
    if (performanceIssues.length > 0) {
      const issueCount = performanceIssues.reduce((sum, file) => sum + file.issues.length, 0);
      this.results.optimizationRecommendations.push(
        `🔧 ${issueCount} performance issues found across ${performanceIssues.length} files`
      );
    }
    
    // Specific pattern recommendations
    const mockHeavyFiles = performanceIssues.filter(f => f.mockCount > PERFORMANCE_THRESHOLDS.MOCK_HEAVY);
    if (mockHeavyFiles.length > 0) {
      this.results.optimizationRecommendations.push(
        `🎭 ${mockHeavyFiles.length} files with heavy mocking - consider test utilities`
      );
    }
    
    const largeFiles = performanceIssues.filter(f => f.testCount > PERFORMANCE_THRESHOLDS.LARGE_TEST_FILE);
    if (largeFiles.length > 0) {
      this.results.optimizationRecommendations.push(
        `📚 ${largeFiles.length} large test files - consider splitting for better parallelization`
      );
    }
  }

  printReport() {
    console.log('\n📋 TEST PERFORMANCE ANALYSIS REPORT');
    console.log('=' .repeat(50));
    
    console.log(`\n📊 Overview:`);
    console.log(`   Test Files: ${this.results.totalFiles}`);
    console.log(`   Total Tests: ${this.results.totalTests}`);
    console.log(`   Average Tests per File: ${(this.results.totalTests / this.results.totalFiles).toFixed(1)}`);
    
    if (this.results.summary.totalRuntime) {
      console.log(`\n⏱️  Performance Metrics:`);
      console.log(`   Total Runtime: ${this.results.summary.totalRuntime}ms`);
      console.log(`   Average per Test: ${this.results.summary.averagePerTest.toFixed(2)}ms`);
      console.log(`   Average per File: ${this.results.summary.averagePerFile.toFixed(2)}ms`);
    }
    
    if (this.results.optimizationRecommendations.length > 0) {
      console.log(`\n🚀 Optimization Recommendations:`);
      this.results.optimizationRecommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }
    
    if (this.results.performanceIssues.length > 0) {
      console.log(`\n⚠️  Performance Issues by File:`);
      this.results.performanceIssues.slice(0, 5).forEach(file => {
        console.log(`\n   📁 ${file.file}:`);
        console.log(`      Tests: ${file.testCount}, Mocks: ${file.mockCount}, Nesting: ${file.nestingDepth}`);
        file.issues.slice(0, 3).forEach(issue => {
          console.log(`      • ${issue}`);
        });
        if (file.issues.length > 3) {
          console.log(`      ... and ${file.issues.length - 3} more issues`);
        }
      });
      
      if (this.results.performanceIssues.length > 5) {
        console.log(`\n   ... and ${this.results.performanceIssues.length - 5} more files with issues`);
      }
    } else {
      console.log(`\n✅ No significant performance issues detected!`);
    }
    
    console.log(`\n💡 Summary:`);
    if (this.results.summary.averagePerTest < 10) {
      console.log(`   🟢 Excellent test performance (${this.results.summary.averagePerTest?.toFixed(2)}ms/test)`);
    } else if (this.results.summary.averagePerTest < 20) {
      console.log(`   🟡 Good test performance (${this.results.summary.averagePerTest?.toFixed(2)}ms/test)`);
    } else {
      console.log(`   🔴 Room for improvement (${this.results.summary.averagePerTest?.toFixed(2)}ms/test)`);
    }
  }
}

// Run the analysis
const analyzer = new TestPerformanceAnalyzer();
analyzer.analyze().catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
});