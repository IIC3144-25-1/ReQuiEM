#!/usr/bin/env node

/**
 * Comprehensive Test Runner for ReQuiEM
 * 
 * This script runs all types of tests in the correct order and generates
 * a comprehensive report of the testing status.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      lint: null,
      typecheck: null
    };
    
    this.startTime = Date.now();
  }

  /**
   * Run command and capture output
   */
  runCommand(command, description) {
    console.log(`\n🔄 ${description}...`);
    console.log(`Command: ${command}\n`);
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      console.log(`✅ ${description} completed successfully`);
      return { success: true, output };
    } catch (error) {
      console.log(`❌ ${description} failed`);
      console.log(`Error: ${error.message}`);
      return { success: false, error: error.message, output: error.stdout };
    }
  }

  /**
   * Run TypeScript type checking
   */
  runTypeCheck() {
    const result = this.runCommand('npx tsc --noEmit', 'TypeScript type checking');
    this.results.typecheck = result;
    return result;
  }

  /**
   * Run ESLint
   */
  runLint() {
    const result = this.runCommand('npm run lint', 'ESLint code quality check');
    this.results.lint = result;
    return result;
  }

  /**
   * Run unit tests
   */
  runUnitTests() {
    const result = this.runCommand(
      'npm test -- --coverage --passWithNoTests --testPathIgnorePatterns="cypress|e2e"',
      'Unit tests with coverage'
    );
    this.results.unit = result;
    return result;
  }

  /**
   * Run integration tests
   */
  runIntegrationTests() {
    const result = this.runCommand(
      'npm test -- --testPathPattern="integration" --passWithNoTests',
      'Integration tests'
    );
    this.results.integration = result;
    return result;
  }

  /**
   * Run E2E tests (if Cypress is available)
   */
  runE2ETests() {
    // Check if Cypress is available
    try {
      execSync('npx cypress --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('⚠️  Cypress not available, skipping E2E tests');
      this.results.e2e = { success: false, error: 'Cypress not available' };
      return this.results.e2e;
    }

    const result = this.runCommand(
      'npx cypress run --headless --browser chrome',
      'End-to-end tests'
    );
    this.results.e2e = result;
    return result;
  }

  /**
   * Parse test coverage from Jest output
   */
  parseCoverage(output) {
    if (!output) return null;

    const lines = output.split('\n');
    const coverageLine = lines.find(line => line.includes('All files') && line.includes('%'));
    
    if (!coverageLine) return null;

    const parts = coverageLine.split('|').map(part => part.trim());
    if (parts.length < 5) return null;

    return {
      statements: this.extractPercentage(parts[1]),
      branches: this.extractPercentage(parts[2]),
      functions: this.extractPercentage(parts[3]),
      lines: this.extractPercentage(parts[4])
    };
  }

  /**
   * Extract percentage from string
   */
  extractPercentage(str) {
    const match = str.match(/(\d+\.?\d*)%/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Parse test results from Jest output
   */
  parseTestResults(output) {
    if (!output) return null;

    const testSuitesMatch = output.match(/Test Suites: (\d+) passed(?:, (\d+) failed)?/);
    const testsMatch = output.match(/Tests:\s+(\d+) passed(?:, (\d+) failed)?(?:, (\d+) skipped)?/);
    
    return {
      testSuites: {
        passed: testSuitesMatch ? parseInt(testSuitesMatch[1]) : 0,
        failed: testSuitesMatch && testSuitesMatch[2] ? parseInt(testSuitesMatch[2]) : 0
      },
      tests: {
        passed: testsMatch ? parseInt(testsMatch[1]) : 0,
        failed: testsMatch && testsMatch[2] ? parseInt(testsMatch[2]) : 0,
        skipped: testsMatch && testsMatch[3] ? parseInt(testsMatch[3]) : 0
      }
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        typecheck: this.results.typecheck?.success || false,
        lint: this.results.lint?.success || false,
        unit: this.results.unit?.success || false,
        integration: this.results.integration?.success || false,
        e2e: this.results.e2e?.success || false
      },
      details: {
        typecheck: this.results.typecheck,
        lint: this.results.lint,
        unit: {
          ...this.results.unit,
          coverage: this.parseCoverage(this.results.unit?.output),
          testResults: this.parseTestResults(this.results.unit?.output)
        },
        integration: {
          ...this.results.integration,
          testResults: this.parseTestResults(this.results.integration?.output)
        },
        e2e: this.results.e2e
      }
    };

    // Calculate overall success
    const allPassed = Object.values(report.summary).every(result => result === true);
    report.overall = allPassed ? 'PASS' : 'FAIL';

    return report;
  }

  /**
   * Print summary to console
   */
  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`⏱️  Total Duration: ${(report.duration / 1000).toFixed(2)}s`);
    console.log(`🎯 Overall Result: ${report.overall === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log('\n📋 Test Categories:');
    console.log(`  TypeScript: ${report.summary.typecheck ? '✅' : '❌'}`);
    console.log(`  Lint:       ${report.summary.lint ? '✅' : '❌'}`);
    console.log(`  Unit:       ${report.summary.unit ? '✅' : '❌'}`);
    console.log(`  Integration:${report.summary.integration ? '✅' : '❌'}`);
    console.log(`  E2E:        ${report.summary.e2e ? '✅' : '❌'}`);

    // Show coverage if available
    if (report.details.unit.coverage) {
      const coverage = report.details.unit.coverage;
      console.log('\n📈 Coverage:');
      console.log(`  Statements: ${coverage.statements}%`);
      console.log(`  Branches:   ${coverage.branches}%`);
      console.log(`  Functions:  ${coverage.functions}%`);
      console.log(`  Lines:      ${coverage.lines}%`);
    }

    // Show test counts if available
    if (report.details.unit.testResults) {
      const tests = report.details.unit.testResults.tests;
      console.log('\n🧪 Test Results:');
      console.log(`  Passed:  ${tests.passed}`);
      console.log(`  Failed:  ${tests.failed}`);
      console.log(`  Skipped: ${tests.skipped}`);
    }

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Save report to file
   */
  saveReport(report) {
    const reportsDir = path.join(process.cwd(), 'test-reports');
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, 'test-summary.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`💾 Report saved to: ${reportPath}`);
  }

  /**
   * Run all tests in sequence
   */
  async runAll() {
    console.log('🚀 Starting comprehensive test suite for ReQuiEM');
    console.log('This will run: TypeScript check, Lint, Unit tests, Integration tests, and E2E tests\n');

    // Run tests in order
    this.runTypeCheck();
    this.runLint();
    this.runUnitTests();
    this.runIntegrationTests();
    this.runE2ETests();

    // Generate and display report
    const report = this.generateReport();
    this.printSummary(report);
    this.saveReport(report);

    // Exit with appropriate code
    process.exit(report.overall === 'PASS' ? 0 : 1);
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAll().catch(console.error);
}

module.exports = TestRunner;
