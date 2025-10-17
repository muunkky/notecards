#!/usr/bin/env node
/**
 * Flaky Test Detection Script
 * Runs tests multiple times to identify intermittent failures
 */

import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

const CONFIG = {
  RUNS: 5,  // Number of test runs
  TIMEOUT: 30000,  // 30s timeout per run
  LOG_FILE: 'log/flaky-test-detection.json'
};

class FlakyTestDetector {
  constructor() {
    this.results = [];
    this.summary = {
      totalRuns: 0,
      passedRuns: 0,
      failedRuns: 0,
      flakyTests: new Set(),
      consistentFailures: new Set(),
      startTime: new Date().toISOString()
    };
  }

  async runTests() {
    console.log(`🔍 Running flaky test detection (${CONFIG.RUNS} iterations)...`);
    
    for (let i = 1; i <= CONFIG.RUNS; i++) {
      console.log(`\n📊 Run ${i}/${CONFIG.RUNS}`);
      const result = await this.executeTestRun(i);
      this.results.push(result);
      this.analyzeBatch();
    }

    this.generateReport();
  }

  executeTestRun(runNumber) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const testProcess = spawn('npm', ['test'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        timeout: CONFIG.TIMEOUT
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      testProcess.on('close', (code) => {
        const duration = Date.now() - startTime;
        const success = code === 0;
        
        this.summary.totalRuns++;
        if (success) {
          this.summary.passedRuns++;
          console.log(`✅ Run ${runNumber}: PASSED (${duration}ms)`);
        } else {
          this.summary.failedRuns++;
          console.log(`❌ Run ${runNumber}: FAILED (${duration}ms)`);
        }

        resolve({
          runNumber,
          success,
          exitCode: code,
          duration,
          stdout,
          stderr,
          timestamp: new Date().toISOString()
        });
      });

      testProcess.on('error', (error) => {
        console.error(`💥 Run ${runNumber}: ERROR - ${error.message}`);
        resolve({
          runNumber,
          success: false,
          exitCode: -1,
          duration: Date.now() - startTime,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  analyzeBatch() {
    const passedRuns = this.results.filter(r => r.success).length;
    const failedRuns = this.results.filter(r => !r.success).length;
    
    // Identify patterns
    if (passedRuns > 0 && failedRuns > 0) {
      console.log(`⚠️  POTENTIAL FLAKY BEHAVIOR: ${passedRuns} passed, ${failedRuns} failed`);
    } else if (failedRuns === this.results.length) {
      console.log(`🔴 CONSISTENT FAILURE across all runs`);
    } else if (passedRuns === this.results.length) {
      console.log(`🟢 STABLE: All runs passed`);
    }
  }

  generateReport() {
    const report = {
      ...this.summary,
      endTime: new Date().toISOString(),
      results: this.results,
      analysis: this.performAnalysis()
    };

    // Write detailed log
    writeFileSync(CONFIG.LOG_FILE, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n📋 FLAKY TEST DETECTION SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Total Runs: ${this.summary.totalRuns}`);
    console.log(`Passed: ${this.summary.passedRuns}`);
    console.log(`Failed: ${this.summary.failedRuns}`);
    console.log(`Success Rate: ${((this.summary.passedRuns / this.summary.totalRuns) * 100).toFixed(1)}%`);
    
    if (this.summary.passedRuns > 0 && this.summary.failedRuns > 0) {
      console.log('\n⚠️  FLAKY BEHAVIOR DETECTED');
      console.log('Some tests are failing intermittently.');
      console.log('Check detailed log:', CONFIG.LOG_FILE);
    } else if (this.summary.failedRuns === this.summary.totalRuns) {
      console.log('\n🔴 CONSISTENT FAILURES');
      console.log('All test runs failed - this indicates a systematic issue, not flakiness.');
    } else {
      console.log('\n✅ NO FLAKY TESTS DETECTED');
      console.log('All test runs passed consistently.');
    }

    return report;
  }

  performAnalysis() {
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
    const maxDuration = Math.max(...this.results.map(r => r.duration));
    const minDuration = Math.min(...this.results.map(r => r.duration));
    
    return {
      averageDuration: Math.round(avgDuration),
      maxDuration,
      minDuration,
      durationVariance: maxDuration - minDuration,
      failureRate: (this.summary.failedRuns / this.summary.totalRuns) * 100,
      recommendation: this.getRecommendation()
    };
  }

  getRecommendation() {
    const failureRate = (this.summary.failedRuns / this.summary.totalRuns) * 100;
    
    if (failureRate === 0) {
      return 'Tests are stable. No action needed.';
    } else if (failureRate === 100) {
      return 'All tests fail consistently. Fix the underlying issue, not flakiness.';
    } else if (failureRate < 30) {
      return 'Mild flakiness detected. Review timing-dependent tests and async patterns.';
    } else {
      return 'Significant flakiness. Urgent investigation needed for test stability.';
    }
  }
}

// Run the detection
const detector = new FlakyTestDetector();
detector.runTests().catch(error => {
  console.error('Flaky test detection failed:', error);
  process.exit(1);
});