#!/usr/bin/env node

/**
 * Test Coverage Analysis Script for ReQuiEM
 * 
 * This script analyzes test coverage and generates comprehensive reports
 * for different types of tests (unit, integration, e2e).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestCoverageAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.coverageDir = path.join(this.projectRoot, 'coverage');
    this.reportsDir = path.join(this.projectRoot, 'test-reports');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Run unit tests with coverage
   */
  async runUnitTests() {
    console.log('🧪 Running unit tests with coverage...');
    
    try {
      const result = execSync(
        'npm test -- --coverage --coverageDirectory=coverage/unit --testPathPattern="\\.(test|spec)\\.(ts|tsx)$" --testPathIgnorePatterns="cypress|e2e"',
        { 
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      console.log('✅ Unit tests completed successfully');
      return this.parseCoverageOutput(result);
    } catch (error) {
      console.error('❌ Unit tests failed:', error.message);
      return null;
    }
  }

  /**
   * Run integration tests
   */
  async runIntegrationTests() {
    console.log('🔗 Running integration tests...');
    
    try {
      const result = execSync(
        'npm test -- --testPathPattern="integration" --coverage --coverageDirectory=coverage/integration',
        { 
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      console.log('✅ Integration tests completed successfully');
      return this.parseCoverageOutput(result);
    } catch (error) {
      console.error('❌ Integration tests failed:', error.message);
      return null;
    }
  }

  /**
   * Run E2E tests
   */
  async runE2ETests() {
    console.log('🌐 Running E2E tests...');
    
    try {
      const result = execSync(
        'npx cypress run --headless --reporter json --reporter-options "output=test-reports/cypress-results.json"',
        { 
          encoding: 'utf8',
          stdio: 'pipe'
        }
      );
      
      console.log('✅ E2E tests completed successfully');
      return this.parseE2EResults();
    } catch (error) {
      console.error('❌ E2E tests failed:', error.message);
      return null;
    }
  }

  /**
   * Parse Jest coverage output
   */
  parseCoverageOutput(output) {
    const lines = output.split('\n');
    const coverageSection = lines.find(line => line.includes('All files'));
    
    if (!coverageSection) return null;
    
    const parts = coverageSection.split('|').map(part => part.trim());
    
    return {
      statements: this.extractPercentage(parts[1]),
      branches: this.extractPercentage(parts[2]),
      functions: this.extractPercentage(parts[3]),
      lines: this.extractPercentage(parts[4])
    };
  }

  /**
   * Extract percentage from coverage string
   */
  extractPercentage(str) {
    const match = str.match(/(\d+\.?\d*)%/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Parse E2E test results
   */
  parseE2EResults() {
    const resultsPath = path.join(this.reportsDir, 'cypress-results.json');
    
    if (!fs.existsSync(resultsPath)) {
      return null;
    }
    
    try {
      const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
      
      return {
        totalTests: results.stats.tests,
        passed: results.stats.passes,
        failed: results.stats.failures,
        pending: results.stats.pending,
        duration: results.stats.duration
      };
    } catch (error) {
      console.error('Error parsing E2E results:', error.message);
      return null;
    }
  }

  /**
   * Generate comprehensive coverage report
   */
  generateCoverageReport(unitCoverage, integrationCoverage, e2eResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        unit: unitCoverage,
        integration: integrationCoverage,
        e2e: e2eResults
      },
      recommendations: this.generateRecommendations(unitCoverage, integrationCoverage, e2eResults)
    };

    // Write JSON report
    const jsonPath = path.join(this.reportsDir, 'coverage-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    this.generateHTMLReport(report);

    console.log(`📊 Coverage report generated: ${jsonPath}`);
    return report;
  }

  /**
   * Generate recommendations based on coverage
   */
  generateRecommendations(unitCoverage, integrationCoverage, e2eResults) {
    const recommendations = [];

    if (unitCoverage) {
      if (unitCoverage.statements < 80) {
        recommendations.push({
          type: 'unit',
          priority: 'high',
          message: `Statement coverage is ${unitCoverage.statements}%. Aim for 80%+`
        });
      }

      if (unitCoverage.branches < 75) {
        recommendations.push({
          type: 'unit',
          priority: 'medium',
          message: `Branch coverage is ${unitCoverage.branches}%. Aim for 75%+`
        });
      }

      if (unitCoverage.functions < 85) {
        recommendations.push({
          type: 'unit',
          priority: 'medium',
          message: `Function coverage is ${unitCoverage.functions}%. Aim for 85%+`
        });
      }
    }

    if (e2eResults && e2eResults.failed > 0) {
      recommendations.push({
        type: 'e2e',
        priority: 'high',
        message: `${e2eResults.failed} E2E tests are failing. Fix these critical user flows.`
      });
    }

    if (!integrationCoverage) {
      recommendations.push({
        type: 'integration',
        priority: 'medium',
        message: 'No integration tests found. Consider adding API and database integration tests.'
      });
    }

    return recommendations;
  }

  /**
   * Generate HTML coverage report
   */
  generateHTMLReport(report) {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ReQuiEM Test Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .coverage-bar { width: 100%; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; transition: width 0.3s ease; }
        .good { background: #4caf50; }
        .warning { background: #ff9800; }
        .poor { background: #f44336; }
        .recommendation { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .high { background: #ffebee; border-left: 4px solid #f44336; }
        .medium { background: #fff3e0; border-left: 4px solid #ff9800; }
        .low { background: #e8f5e8; border-left: 4px solid #4caf50; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ReQuiEM Test Coverage Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>

    ${this.generateUnitCoverageHTML(report.summary.unit)}
    ${this.generateE2EResultsHTML(report.summary.e2e)}
    ${this.generateRecommendationsHTML(report.recommendations)}
</body>
</html>`;

    const htmlPath = path.join(this.reportsDir, 'coverage-report.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTML report generated: ${htmlPath}`);
  }

  generateUnitCoverageHTML(coverage) {
    if (!coverage) return '<div class="section"><h2>Unit Tests</h2><p>No unit test coverage data available.</p></div>';

    return `
    <div class="section">
        <h2>Unit Test Coverage</h2>
        ${this.generateCoverageBarHTML('Statements', coverage.statements)}
        ${this.generateCoverageBarHTML('Branches', coverage.branches)}
        ${this.generateCoverageBarHTML('Functions', coverage.functions)}
        ${this.generateCoverageBarHTML('Lines', coverage.lines)}
    </div>`;
  }

  generateCoverageBarHTML(label, percentage) {
    const cssClass = percentage >= 80 ? 'good' : percentage >= 60 ? 'warning' : 'poor';
    
    return `
    <div style="margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>${label}</span>
            <span>${percentage}%</span>
        </div>
        <div class="coverage-bar">
            <div class="coverage-fill ${cssClass}" style="width: ${percentage}%"></div>
        </div>
    </div>`;
  }

  generateE2EResultsHTML(e2eResults) {
    if (!e2eResults) return '<div class="section"><h2>E2E Tests</h2><p>No E2E test results available.</p></div>';

    return `
    <div class="section">
        <h2>End-to-End Tests</h2>
        <p><strong>Total Tests:</strong> ${e2eResults.totalTests}</p>
        <p><strong>Passed:</strong> ${e2eResults.passed}</p>
        <p><strong>Failed:</strong> ${e2eResults.failed}</p>
        <p><strong>Pending:</strong> ${e2eResults.pending}</p>
        <p><strong>Duration:</strong> ${e2eResults.duration}ms</p>
    </div>`;
  }

  generateRecommendationsHTML(recommendations) {
    if (!recommendations.length) return '<div class="section"><h2>Recommendations</h2><p>All tests are in good shape! 🎉</p></div>';

    const recommendationItems = recommendations.map(rec => 
      `<div class="recommendation ${rec.priority}">
        <strong>${rec.type.toUpperCase()}:</strong> ${rec.message}
      </div>`
    ).join('');

    return `
    <div class="section">
        <h2>Recommendations</h2>
        ${recommendationItems}
    </div>`;
  }

  /**
   * Run all tests and generate comprehensive report
   */
  async runFullTestSuite() {
    console.log('🚀 Starting comprehensive test suite...\n');

    const unitCoverage = await this.runUnitTests();
    const integrationCoverage = await this.runIntegrationTests();
    const e2eResults = await this.runE2ETests();

    console.log('\n📊 Generating coverage report...');
    const report = this.generateCoverageReport(unitCoverage, integrationCoverage, e2eResults);

    console.log('\n✨ Test suite completed!');
    console.log(`📄 View the full report: ${path.join(this.reportsDir, 'coverage-report.html')}`);

    return report;
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new TestCoverageAnalyzer();
  analyzer.runFullTestSuite().catch(console.error);
}

module.exports = TestCoverageAnalyzer;
