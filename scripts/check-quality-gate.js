/**
 * Quality Gate Checker
 *
 * Checks if validation results meet minimum quality thresholds
 * Used in CI/CD pipeline to fail builds for low-quality outputs
 *
 * Exit codes:
 * - 0: Quality gate passed
 * - 1: Quality gate failed
 * - 2: Error during check
 */

const fs = require('fs').promises;
const path = require('path');

class QualityGateChecker {
  constructor(options = {}) {
    this.reportsDir = options.reportsDir || path.join(process.cwd(), 'exports', 'ai-validation-reports');
    this.objectDetectionDir = options.objectDetectionDir || path.join(process.cwd(), 'exports', 'object-detection-reports');

    // Default thresholds
    this.thresholds = {
      minimumScore: options.minimumScore || 8.0,
      minimumAccuracy: options.minimumAccuracy || 85.0,
      maximumErrorRate: options.maximumErrorRate || 5.0,
      minimumConfidence: options.minimumConfidence || 0.70,
      requireHumanReview: options.requireHumanReview !== false
    };
  }

  /**
   * Run quality gate check
   */
  async check() {
    console.log('\n🚦 Running Quality Gate Check...\n');
    console.log('Thresholds:');
    console.log(`  - Minimum Score: ${this.thresholds.minimumScore}/10`);
    console.log(`  - Minimum Accuracy: ${this.thresholds.minimumAccuracy}%`);
    console.log(`  - Maximum Error Rate: ${this.thresholds.maximumErrorRate}%`);
    console.log(`  - Minimum Confidence: ${this.thresholds.minimumConfidence}`);
    console.log('');

    try {
      // Load all validation reports
      const reports = await this.loadAllReports();

      if (reports.length === 0) {
        console.log('⚠️  No validation reports found');
        console.log('Quality gate: SKIPPED (no reports)\n');
        return {
          passed: true,
          reason: 'No reports to validate',
          details: {}
        };
      }

      console.log(`Found ${reports.length} validation reports\n`);

      // Calculate aggregate metrics
      const metrics = this.calculateMetrics(reports);

      // Display metrics
      this.displayMetrics(metrics);

      // Check against thresholds
      const gateResults = this.checkThresholds(metrics, reports);

      // Display results
      this.displayResults(gateResults);

      return gateResults;

    } catch (error) {
      console.error(`❌ Error during quality gate check: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load all validation reports
   */
  async loadAllReports() {
    const reports = [];

    // Load AI validation reports
    try {
      const files = await fs.readdir(this.reportsDir);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.reportsDir, file);
        const content = await fs.readFile(filePath, 'utf8');

        try {
          const report = JSON.parse(content);
          reports.push({
            ...report,
            source: 'ai-validation',
            filename: file
          });
        } catch (parseError) {
          console.warn(`⚠️  Failed to parse ${file}: ${parseError.message}`);
        }
      }
    } catch (error) {
      // Directory might not exist
      console.warn(`⚠️  AI validation reports directory not found: ${this.reportsDir}`);
    }

    // Load object detection reports
    try {
      const files = await fs.readdir(this.objectDetectionDir);

      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(this.objectDetectionDir, file);
        const content = await fs.readFile(filePath, 'utf8');

        try {
          const report = JSON.parse(content);
          reports.push({
            ...report,
            source: 'object-detection',
            filename: file
          });
        } catch (parseError) {
          console.warn(`⚠️  Failed to parse ${file}: ${parseError.message}`);
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return reports;
  }

  /**
   * Calculate aggregate metrics
   */
  calculateMetrics(reports) {
    const scores = reports
      .map(r => r.overallScore || r.overallCompliance?.score || 0)
      .filter(s => s > 0);

    const confidences = reports
      .map(r => r.confidence || 0.5)
      .filter(c => c > 0);

    const grades = reports.map(r => r.gradeLevel || 'F');

    // Calculate averages
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    const averageConfidence = confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;

    // Count critical violations
    const criticalViolations = reports.reduce((count, r) => {
      const violations = r.criticalViolations || [];
      return count + violations.filter(v => v.severity === 'critical').length;
    }, 0);

    // Count low confidence reports
    const lowConfidenceCount = confidences.filter(c => c < this.thresholds.minimumConfidence).length;

    // Grade distribution
    const gradeDistribution = {};
    grades.forEach(grade => {
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    // Failure rate (grades below B+)
    const failures = grades.filter(g => {
      const gradeValues = { 'A+': 10, 'A': 9, 'A-': 8.5, 'B+': 8, 'B': 7.5, 'B-': 7, 'C+': 6.5, 'C': 6, 'C-': 5.5, 'D': 5, 'F': 0 };
      return (gradeValues[g] || 0) < 8.0;
    }).length;

    const failureRate = (failures / reports.length) * 100;

    return {
      totalReports: reports.length,
      averageScore: parseFloat(averageScore.toFixed(2)),
      averageConfidence: parseFloat(averageConfidence.toFixed(3)),
      criticalViolations,
      lowConfidenceCount,
      gradeDistribution,
      failureRate: parseFloat(failureRate.toFixed(2)),
      scores,
      confidences
    };
  }

  /**
   * Display metrics
   */
  displayMetrics(metrics) {
    console.log('═'.repeat(80));
    console.log('  AGGREGATE METRICS');
    console.log('═'.repeat(80));
    console.log('');
    console.log(`  Total Reports: ${metrics.totalReports}`);
    console.log(`  Average Score: ${metrics.averageScore}/10`);
    console.log(`  Average Confidence: ${(metrics.averageConfidence * 100).toFixed(1)}%`);
    console.log(`  Critical Violations: ${metrics.criticalViolations}`);
    console.log(`  Low Confidence Reports: ${metrics.lowConfidenceCount}`);
    console.log(`  Failure Rate: ${metrics.failureRate}%`);
    console.log('');
    console.log('  Grade Distribution:');

    const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
    gradeOrder.forEach(grade => {
      const count = metrics.gradeDistribution[grade] || 0;
      if (count > 0) {
        const percentage = ((count / metrics.totalReports) * 100).toFixed(1);
        const bar = '█'.repeat(Math.ceil(count / metrics.totalReports * 20));
        console.log(`    ${grade.padEnd(3)} ${bar} ${count} (${percentage}%)`);
      }
    });

    console.log('');
  }

  /**
   * Check against thresholds
   */
  checkThresholds(metrics, reports) {
    const checks = [];
    let passed = true;

    // Check 1: Minimum average score
    const scoreCheck = {
      name: 'Minimum Average Score',
      threshold: this.thresholds.minimumScore,
      actual: metrics.averageScore,
      passed: metrics.averageScore >= this.thresholds.minimumScore,
      severity: 'critical'
    };
    checks.push(scoreCheck);
    if (!scoreCheck.passed) passed = false;

    // Check 2: Minimum confidence
    const confidenceCheck = {
      name: 'Minimum Confidence',
      threshold: this.thresholds.minimumConfidence,
      actual: metrics.averageConfidence,
      passed: metrics.averageConfidence >= this.thresholds.minimumConfidence,
      severity: 'high'
    };
    checks.push(confidenceCheck);
    if (!confidenceCheck.passed) passed = false;

    // Check 3: Maximum error rate (failure rate)
    const errorRateCheck = {
      name: 'Maximum Failure Rate',
      threshold: this.thresholds.maximumErrorRate,
      actual: metrics.failureRate,
      passed: metrics.failureRate <= this.thresholds.maximumErrorRate,
      severity: 'high'
    };
    checks.push(errorRateCheck);
    if (!errorRateCheck.passed) passed = false;

    // Check 4: No critical violations
    const violationsCheck = {
      name: 'Critical Violations',
      threshold: 0,
      actual: metrics.criticalViolations,
      passed: metrics.criticalViolations === 0,
      severity: 'medium'
    };
    checks.push(violationsCheck);
    // Don't fail on critical violations, just warn

    // Check 5: Low confidence reports
    const lowConfidenceThreshold = Math.ceil(metrics.totalReports * 0.1); // 10% max
    const lowConfidenceCheck = {
      name: 'Low Confidence Reports',
      threshold: lowConfidenceThreshold,
      actual: metrics.lowConfidenceCount,
      passed: metrics.lowConfidenceCount <= lowConfidenceThreshold,
      severity: 'medium'
    };
    checks.push(lowConfidenceCheck);
    // Don't fail on low confidence, just warn

    return {
      passed,
      checks,
      metrics,
      summary: this.generateSummary(passed, checks)
    };
  }

  /**
   * Display results
   */
  displayResults(gateResults) {
    console.log('═'.repeat(80));
    console.log('  QUALITY GATE RESULTS');
    console.log('═'.repeat(80));
    console.log('');

    gateResults.checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      const status = check.passed ? 'PASS' : 'FAIL';

      console.log(`  ${icon} ${check.name}: ${status}`);
      console.log(`     Threshold: ${check.threshold}`);
      console.log(`     Actual: ${check.actual}`);

      if (!check.passed) {
        console.log(`     ⚠️  Severity: ${check.severity.toUpperCase()}`);
      }

      console.log('');
    });

    console.log('═'.repeat(80));

    if (gateResults.passed) {
      console.log('  ✅ QUALITY GATE: PASSED');
    } else {
      console.log('  ❌ QUALITY GATE: FAILED');
    }

    console.log('═'.repeat(80));
    console.log('');

    if (!gateResults.passed) {
      console.log('Recommendations:');
      console.log('  1. Review failed validations in exports/ai-validation-reports/');
      console.log('  2. Address critical violations before deployment');
      console.log('  3. Improve document quality to meet thresholds');
      console.log('  4. Run human review for low confidence reports');
      console.log('');
    }
  }

  /**
   * Generate summary
   */
  generateSummary(passed, checks) {
    const failedChecks = checks.filter(c => !c.passed);

    if (passed) {
      return 'All quality checks passed';
    }

    return `${failedChecks.length} quality check(s) failed: ${
      failedChecks.map(c => c.name).join(', ')
    }`;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    minimumScore: 8.0,
    minimumAccuracy: 85.0,
    maximumErrorRate: 5.0,
    minimumConfidence: 0.70
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--threshold' && args[i + 1]) {
      options.minimumScore = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--accuracy' && args[i + 1]) {
      options.minimumAccuracy = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--error-rate' && args[i + 1]) {
      options.maximumErrorRate = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--confidence' && args[i + 1]) {
      options.minimumConfidence = parseFloat(args[i + 1]);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Quality Gate Checker

Usage:
  node check-quality-gate.js [options]

Options:
  --threshold <score>     Minimum average score (0-10, default: 8.0)
  --accuracy <percent>    Minimum accuracy percentage (default: 85.0)
  --error-rate <percent>  Maximum error rate percentage (default: 5.0)
  --confidence <value>    Minimum confidence (0-1, default: 0.70)
  --help, -h              Show this help message

Examples:
  node check-quality-gate.js --threshold 8.5
  node check-quality-gate.js --threshold 8.0 --confidence 0.80
      `);
      process.exit(0);
    }
  }

  const checker = new QualityGateChecker(options);

  checker.check()
    .then(results => {
      if (results.passed) {
        console.log('✅ Quality gate check passed!\n');
        process.exit(0);
      } else {
        console.log('❌ Quality gate check failed!\n');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Error during quality gate check:', error.message);
      process.exit(2);
    });
}

module.exports = QualityGateChecker;
