#!/usr/bin/env node

/**
 * Accessibility Integration Test Suite
 *
 * Tests:
 * 1. Issue detection (missing alt text, structure tags, contrast issues)
 * 2. Auto-remediation
 * 3. WCAG 2.2 AA validation
 * 4. PDF/UA validation
 * 5. Pipeline integration
 *
 * Performance Targets:
 * - Validation: < 5 minutes per document
 * - 95% time reduction vs manual (1-2 hours → 5 minutes)
 */

const fs = require('fs').promises;
const path = require('path');
const { AccessibilityRemediator } = require('../accessibility/accessibilityRemediator.js');

class AccessibilityIntegrationTest {
  constructor() {
    this.testResults = [];
    this.startTime = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('='.repeat(80));
    console.log('ACCESSIBILITY INTEGRATION TEST SUITE');
    console.log('='.repeat(80));
    console.log('');

    this.startTime = Date.now();

    await this.test1_IssueDetection();
    await this.test2_AutoRemediation();
    await this.test3_WCAG22Validation();
    await this.test4_PDFUAValidation();
    await this.test5_PipelineIntegration();

    this.printSummary();

    const allPassed = this.testResults.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
  }

  /**
   * Test 1: Issue Detection
   */
  async test1_IssueDetection() {
    console.log('[Test 1] Issue Detection');
    console.log('-'.repeat(80));

    try {
      const remediator = new AccessibilityRemediator();

      // Create mock PDF path
      const mockPdfPath = path.join(__dirname, '..', '..', 'exports', 'test-accessibility.pdf');

      // Run validation (will use mock implementation)
      const config = {
        autoRemediation: { enabled: false }
      };

      const results = await remediator.validate(mockPdfPath, config);

      // Check that issues were detected
      const issuesDetected = results.totalIssues > 0;

      // Check that issues are categorized by severity
      const hasCritical = results.criticalIssues >= 0;
      const hasMajor = results.majorIssues >= 0;

      // Check that both standards were validated
      const wcagValidated = results.standards.wcag22 !== undefined;
      const pdfuaValidated = results.standards.pdfua !== undefined;

      const passed = issuesDetected && hasCritical && hasMajor && wcagValidated && pdfuaValidated;

      console.log(`  Total issues detected: ${results.totalIssues}`);
      console.log(`  Critical issues: ${results.criticalIssues}`);
      console.log(`  Major issues: ${results.majorIssues}`);
      console.log(`  WCAG 2.2 validated: ${wcagValidated ? 'YES' : 'NO'}`);
      console.log(`  PDF/UA validated: ${pdfuaValidated ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Issue Detection',
        passed,
        details: {
          totalIssues: results.totalIssues,
          critical: results.criticalIssues,
          major: results.majorIssues
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Issue Detection',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 2: Auto-Remediation
   */
  async test2_AutoRemediation() {
    console.log('[Test 2] Auto-Remediation');
    console.log('-'.repeat(80));

    try {
      const remediator = new AccessibilityRemediator();
      const mockPdfPath = path.join(__dirname, '..', '..', 'exports', 'test-accessibility.pdf');

      // Run with auto-remediation enabled
      const config = {
        autoRemediation: { enabled: true }
      };

      const results = await remediator.validate(mockPdfPath, config);

      // Check that remediation was attempted
      const remediationRan = results.remediation !== null;

      // Check that some issues were fixed
      const issuesFixed = results.remediation?.fixed > 0;

      // Check success rate
      const successRate = results.remediation?.fixed / results.remediation?.totalIssues;
      const goodSuccessRate = successRate > 0.80; // 80%+ success rate

      const passed = remediationRan && (issuesFixed || results.totalIssues === 0) && goodSuccessRate;

      console.log(`  Remediation ran: ${remediationRan ? 'YES' : 'NO'}`);
      console.log(`  Issues fixed: ${results.remediation?.fixed || 0}/${results.remediation?.totalIssues || 0}`);
      console.log(`  Success rate: ${(successRate * 100).toFixed(1)}%`);
      console.log(`  Target: > 80%`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Auto-Remediation',
        passed,
        details: {
          issuesFixed: results.remediation?.fixed,
          totalIssues: results.remediation?.totalIssues,
          successRate: (successRate * 100).toFixed(1) + '%'
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Auto-Remediation',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 3: WCAG 2.2 AA Validation
   */
  async test3_WCAG22Validation() {
    console.log('[Test 3] WCAG 2.2 AA Validation');
    console.log('-'.repeat(80));

    try {
      const remediator = new AccessibilityRemediator();
      const mockPdfPath = path.join(__dirname, '..', '..', 'exports', 'test-accessibility.pdf');

      const config = {
        autoRemediation: { enabled: false }
      };

      const results = await remediator.validate(mockPdfPath, config);
      const wcag = results.standards.wcag22;

      // Check that all criteria were checked
      const allCriteriaChecked = wcag.totalCriteria === 45;

      // Check that score is calculated
      const hasScore = wcag.score !== undefined;

      // Check that compliance status is determined
      const hasComplianceStatus = wcag.compliant !== undefined;

      const passed = allCriteriaChecked && hasScore && hasComplianceStatus;

      console.log(`  Total criteria: ${wcag.totalCriteria}/45`);
      console.log(`  Passed: ${wcag.passed}`);
      console.log(`  Failed: ${wcag.failed}`);
      console.log(`  Score: ${wcag.score}`);
      console.log(`  Compliant: ${wcag.compliant ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'WCAG 2.2 AA Validation',
        passed,
        details: {
          totalCriteria: wcag.totalCriteria,
          passed: wcag.passed,
          score: wcag.score,
          compliant: wcag.compliant
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'WCAG 2.2 AA Validation',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 4: PDF/UA Validation
   */
  async test4_PDFUAValidation() {
    console.log('[Test 4] PDF/UA Validation');
    console.log('-'.repeat(80));

    try {
      const remediator = new AccessibilityRemediator();
      const mockPdfPath = path.join(__dirname, '..', '..', 'exports', 'test-accessibility.pdf');

      const config = {
        autoRemediation: { enabled: false }
      };

      const results = await remediator.validate(mockPdfPath, config);
      const pdfua = results.standards.pdfua;

      // Check that all requirements were checked
      const allRequirementsChecked = pdfua.totalRequirements === 17;

      // Check that score is calculated
      const hasScore = pdfua.score !== undefined;

      // Check that compliance status is determined
      const hasComplianceStatus = pdfua.compliant !== undefined;

      const passed = allRequirementsChecked && hasScore && hasComplianceStatus;

      console.log(`  Total requirements: ${pdfua.totalRequirements}/17`);
      console.log(`  Passed: ${pdfua.passed}`);
      console.log(`  Failed: ${pdfua.failed}`);
      console.log(`  Score: ${pdfua.score}`);
      console.log(`  Compliant: ${pdfua.compliant ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'PDF/UA Validation',
        passed,
        details: {
          totalRequirements: pdfua.totalRequirements,
          passed: pdfua.passed,
          score: pdfua.score,
          compliant: pdfua.compliant
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'PDF/UA Validation',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 5: Pipeline Integration
   */
  async test5_PipelineIntegration() {
    console.log('[Test 5] Pipeline Integration');
    console.log('-'.repeat(80));

    const startTime = Date.now();

    try {
      const remediator = new AccessibilityRemediator();
      const mockPdfPath = path.join(__dirname, '..', '..', 'exports', 'test-accessibility.pdf');

      const config = {
        autoRemediation: { enabled: true }
      };

      const results = await remediator.validate(mockPdfPath, config);
      const duration = Date.now() - startTime;

      // Check performance: < 5 minutes (300,000ms)
      const performanceOk = duration < 300000;

      // Check that report can be generated
      const reportPath = path.join(__dirname, '..', '..', 'reports', 'accessibility', 'test-report.json');
      const report = await remediator.generateReport(results, reportPath);
      const reportGenerated = report !== null;

      // Check time savings
      const timeSavedHours = parseFloat(results.timeSavedHours);
      const significantTimeSavings = timeSavedHours >= 1.0;

      const passed = performanceOk && reportGenerated && significantTimeSavings;

      console.log(`  Validation duration: ${(duration / 1000).toFixed(2)}s`);
      console.log(`  Target: < 300s (5 minutes)`);
      console.log(`  Report generated: ${reportGenerated ? 'YES' : 'NO'}`);
      console.log(`  Time saved: ${timeSavedHours} hours (vs manual)`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      // Cleanup
      try {
        await fs.unlink(reportPath);
        await fs.unlink(reportPath.replace('.json', '.txt'));
      } catch (e) {
        // Ignore cleanup errors
      }

      this.testResults.push({
        name: 'Pipeline Integration',
        passed,
        duration,
        details: {
          durationSeconds: (duration / 1000).toFixed(2),
          reportGenerated,
          timeSavedHours
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Pipeline Integration',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.length - passed;

    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('');

    if (failed > 0) {
      console.log('FAILED TESTS:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  ✗ ${r.name}: ${r.error || 'Test failed'}`);
        });
      console.log('');
    }

    const allPassed = failed === 0;
    console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('='.repeat(80));
  }
}

// Run tests
const tester = new AccessibilityIntegrationTest();
tester.runAll().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
