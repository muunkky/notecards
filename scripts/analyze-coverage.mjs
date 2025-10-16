#!/usr/bin/env node
/**
 * Test Coverage Analysis and Optimization Tool
 * Analyzes coverage reports and provides optimization recommendations
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const COVERAGE_DIR = './coverage';
const COVERAGE_THRESHOLDS = {
  excellent: { branches: 85, functions: 90, lines: 90, statements: 90 },
  good: { branches: 75, functions: 80, lines: 80, statements: 80 },
  current: { branches: 70, functions: 75, lines: 75, statements: 75 },
  minimum: { branches: 60, functions: 65, lines: 65, statements: 65 }
};

class CoverageAnalyzer {
  constructor() {
    this.coverageData = null;
    this.analysis = {
      overall: {},
      fileAnalysis: [],
      recommendations: [],
      gaps: [],
      improvements: []
    };
  }

  async analyze() {
    console.log('📊 Analyzing Test Coverage...\n');
    
    try {
      await this.loadCoverageData();
      this.analyzeOverallCoverage();
      this.analyzeFileCoverage();
      this.identifyGaps();
      this.generateRecommendations();
      this.printReport();
    } catch (error) {
      console.error('❌ Coverage analysis failed:', error.message);
      this.provideFallbackAnalysis();
    }
  }

  async loadCoverageData() {
    const coverageFile = join(COVERAGE_DIR, 'coverage-summary.json');
    
    if (!existsSync(coverageFile)) {
      throw new Error(`Coverage file not found: ${coverageFile}. Run tests with --coverage first.`);
    }
    
    this.coverageData = JSON.parse(readFileSync(coverageFile, 'utf-8'));
    console.log('✅ Coverage data loaded successfully');
  }

  analyzeOverallCoverage() {
    const total = this.coverageData.total;
    
    this.analysis.overall = {
      branches: {
        pct: total.branches.pct,
        covered: total.branches.covered,
        total: total.branches.total,
        status: this.getStatusLevel(total.branches.pct, 'branches')
      },
      functions: {
        pct: total.functions.pct,
        covered: total.functions.covered,
        total: total.functions.total,
        status: this.getStatusLevel(total.functions.pct, 'functions')
      },
      lines: {
        pct: total.lines.pct,
        covered: total.lines.covered,
        total: total.lines.total,
        status: this.getStatusLevel(total.lines.pct, 'lines')
      },
      statements: {
        pct: total.statements.pct,
        covered: total.statements.covered,
        total: total.statements.total,
        status: this.getStatusLevel(total.statements.pct, 'statements')
      }
    };
  }

  getStatusLevel(percentage, metric) {
    if (percentage >= COVERAGE_THRESHOLDS.excellent[metric]) return 'excellent';
    if (percentage >= COVERAGE_THRESHOLDS.good[metric]) return 'good';
    if (percentage >= COVERAGE_THRESHOLDS.current[metric]) return 'meets-threshold';
    if (percentage >= COVERAGE_THRESHOLDS.minimum[metric]) return 'needs-improvement';
    return 'critical';
  }

  analyzeFileCoverage() {
    const files = Object.keys(this.coverageData)
      .filter(key => key !== 'total')
      .map(file => ({
        file,
        ...this.coverageData[file],
        overallScore: this.calculateOverallScore(this.coverageData[file])
      }))
      .sort((a, b) => a.overallScore - b.overallScore);

    this.analysis.fileAnalysis = files.slice(0, 10); // Top 10 files needing attention
  }

  calculateOverallScore(coverage) {
    return (
      coverage.branches.pct * 0.3 +
      coverage.functions.pct * 0.25 +
      coverage.lines.pct * 0.25 +
      coverage.statements.pct * 0.2
    );
  }

  identifyGaps() {
    const { overall } = this.analysis;
    
    // Identify coverage gaps
    Object.keys(overall).forEach(metric => {
      const current = overall[metric].pct;
      const target = COVERAGE_THRESHOLDS.good[metric];
      
      if (current < target) {
        this.analysis.gaps.push({
          metric,
          current,
          target,
          gap: target - current,
          priority: current < COVERAGE_THRESHOLDS.current[metric] ? 'high' : 'medium'
        });
      }
    });

    // Identify improvement opportunities
    this.analysis.fileAnalysis.forEach(file => {
      if (file.overallScore < 80) {
        this.analysis.improvements.push({
          file: file.file,
          score: file.overallScore,
          weakest: this.findWeakestMetric(file),
          suggestions: this.generateFileSuggestions(file)
        });
      }
    });
  }

  findWeakestMetric(file) {
    const metrics = ['branches', 'functions', 'lines', 'statements'];
    return metrics.reduce((weakest, metric) => 
      file[metric].pct < file[weakest].pct ? metric : weakest
    );
  }

  generateFileSuggestions(file) {
    const suggestions = [];
    
    if (file.branches.pct < 70) {
      suggestions.push('Add tests for conditional logic and error handling paths');
    }
    
    if (file.functions.pct < 75) {
      suggestions.push('Add tests for untested functions and methods');
    }
    
    if (file.lines.pct < 75) {
      suggestions.push('Increase line coverage with additional test cases');
    }
    
    return suggestions;
  }

  generateRecommendations() {
    const { overall, gaps, improvements } = this.analysis;
    
    // Overall recommendations
    if (gaps.length > 0) {
      this.analysis.recommendations.push(
        `🎯 Focus on ${gaps.map(g => g.metric).join(', ')} coverage improvement`
      );
    }
    
    if (improvements.length > 0) {
      this.analysis.recommendations.push(
        `📁 ${improvements.length} files need targeted coverage improvements`
      );
    }
    
    // Specific recommendations based on patterns
    const highPriorityGaps = gaps.filter(g => g.priority === 'high');
    if (highPriorityGaps.length > 0) {
      this.analysis.recommendations.push(
        `🚨 High priority: ${highPriorityGaps.map(g => g.metric).join(', ')} below minimum thresholds`
      );
    }
    
    // Success recommendations
    const excellentMetrics = Object.keys(overall).filter(
      metric => overall[metric].status === 'excellent'
    );
    if (excellentMetrics.length > 0) {
      this.analysis.recommendations.push(
        `✨ Excellent coverage maintained in: ${excellentMetrics.join(', ')}`
      );
    }
  }

  printReport() {
    const { overall, gaps, improvements, recommendations } = this.analysis;
    
    console.log('📋 TEST COVERAGE ANALYSIS REPORT');
    console.log('=' .repeat(50));
    
    // Overall coverage summary
    console.log('\n📊 Overall Coverage:');
    Object.keys(overall).forEach(metric => {
      const data = overall[metric];
      const emoji = this.getStatusEmoji(data.status);
      console.log(`   ${emoji} ${metric.padEnd(12)}: ${data.pct.toFixed(1)}% (${data.covered}/${data.total})`);
    });
    
    // Coverage gaps
    if (gaps.length > 0) {
      console.log('\n⚠️  Coverage Gaps:');
      gaps.forEach(gap => {
        const priority = gap.priority === 'high' ? '🔴' : '🟡';
        console.log(`   ${priority} ${gap.metric}: ${gap.current.toFixed(1)}% → ${gap.target}% (gap: ${gap.gap.toFixed(1)}%)`);
      });
    }
    
    // File improvements needed
    if (improvements.length > 0) {
      console.log('\n📁 Files Needing Attention:');
      improvements.slice(0, 5).forEach(file => {
        console.log(`\n   📄 ${file.file}:`);
        console.log(`      Overall Score: ${file.score.toFixed(1)}%`);
        console.log(`      Weakest Area: ${file.weakest}`);
        file.suggestions.slice(0, 2).forEach(suggestion => {
          console.log(`      • ${suggestion}`);
        });
      });
      
      if (improvements.length > 5) {
        console.log(`\n   ... and ${improvements.length - 5} more files`);
      }
    }
    
    // Recommendations
    if (recommendations.length > 0) {
      console.log('\n🚀 Recommendations:');
      recommendations.forEach(rec => {
        console.log(`   ${rec}`);
      });
    }
    
    // Summary status
    const avgCoverage = Object.values(overall).reduce((sum, metric) => sum + metric.pct, 0) / 4;
    console.log(`\n💡 Summary:`);
    if (avgCoverage >= 85) {
      console.log(`   🟢 Excellent overall coverage (${avgCoverage.toFixed(1)}%)`);
    } else if (avgCoverage >= 75) {
      console.log(`   🟡 Good overall coverage (${avgCoverage.toFixed(1)}%)`);
    } else {
      console.log(`   🔴 Coverage needs improvement (${avgCoverage.toFixed(1)}%)`);
    }
  }

  getStatusEmoji(status) {
    const emojis = {
      'excellent': '🟢',
      'good': '🟡',
      'meets-threshold': '⚪',
      'needs-improvement': '🟠',
      'critical': '🔴'
    };
    return emojis[status] || '⚪';
  }

  provideFallbackAnalysis() {
    console.log('\n📋 FALLBACK COVERAGE ANALYSIS');
    console.log('=' .repeat(50));
    console.log('\n⚠️  Coverage data not available, providing configuration analysis:\n');
    
    console.log('📊 Current Coverage Configuration:');
    console.log('   🔧 Provider: V8 (modern, fast, accurate)');
    console.log('   📈 Thresholds:');
    console.log('      • Branches: 70%');
    console.log('      • Functions: 75%');
    console.log('      • Lines: 75%');
    console.log('      • Statements: 75%');
    
    console.log('\n🚀 Configuration Recommendations:');
    console.log('   ✅ V8 provider is optimal for performance');
    console.log('   ✅ Thresholds are reasonable for maintenance');
    console.log('   💡 Consider gradual threshold increases (2-5% per quarter)');
    console.log('   📊 HTML reports available for detailed analysis');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Run: npm run test:coverage');
    console.log('   2. Review: coverage/index.html');
    console.log('   3. Focus on files with <75% coverage');
    console.log('   4. Add tests for uncovered branches and functions');
  }
}

// Run the analysis
const analyzer = new CoverageAnalyzer();
analyzer.analyze().catch(error => {
  console.error('❌ Analysis failed:', error);
  process.exit(1);
});