/**
 * Closed-Loop Remediation System
 *
 * Implements the full remediation cycle:
 * Detect → Diagnose → Decide → Deploy → Verify → Learn
 *
 * @module closed-loop-remediation
 */

import { ViolationDetector } from './violation-detector.js';
import { AutoFixEngine } from './auto-fix-engine.js';
import { PredictiveAnalytics } from './predictive-analytics.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Root Cause Analyzer
 */
class RootCauseAnalyzer {
  constructor() {
    this.commonPatterns = {
      'color_violations': {
        causes: [
          'Designer not using brand color swatches',
          'Manual color selection instead of palette',
          'Copy-paste from non-brand documents',
          'Template not loaded properly'
        ],
        fixes: [
          'Lock brand color swatches',
          'Remove ability to create custom colors',
          'Provide pre-loaded templates',
          'Training on color palette usage'
        ]
      },
      'typography_violations': {
        causes: [
          'Brand fonts not installed',
          'Copy-paste from external sources',
          'Manual formatting instead of styles',
          'Template not using paragraph styles'
        ],
        fixes: [
          'Install fonts before work begins',
          'Use paragraph styles exclusively',
          'Disable manual font selection',
          'Training on typography system'
        ]
      },
      'text_cutoffs': {
        causes: [
          'Fixed-height text frames',
          'Content longer than expected',
          'Incorrect frame sizing',
          'Manual text editing without review'
        ],
        fixes: [
          'Enable auto-sizing on text frames',
          'Add overflow indicators',
          'Review at multiple zoom levels',
          'Pre-flight check before export'
        ]
      },
      'placeholder_text': {
        causes: [
          'Forgotten to replace during rush',
          'Missing data for replacement',
          'Poor handoff documentation',
          'No pre-export checklist'
        ],
        fixes: [
          'Use data merge for dynamic content',
          'Automated placeholder detection',
          'Mandatory pre-export validation',
          'Clear data requirements document'
        ]
      }
    };
  }

  /**
   * Analyze root causes of violations
   */
  analyzeRootCauses(violations) {
    const analysis = {
      patterns: [],
      systemicIssues: [],
      recommendations: []
    };

    // Group violations by type
    const grouped = this.groupViolationsByType(violations);

    // Analyze each group
    for (const [type, count] of Object.entries(grouped)) {
      if (count > 3) {
        // Systemic issue if > 3 of same type
        analysis.systemicIssues.push({
          type: type,
          count: count,
          severity: 'systemic',
          likelyCauses: this.commonPatterns[type]?.causes || ['Unknown cause'],
          suggestedFixes: this.commonPatterns[type]?.fixes || ['Manual review needed']
        });
      } else {
        // Individual issue
        analysis.patterns.push({
          type: type,
          count: count,
          severity: 'individual'
        });
      }
    }

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis.systemicIssues);

    return analysis;
  }

  groupViolationsByType(violations) {
    const grouped = {};

    for (const severity of ['critical', 'major', 'minor']) {
      for (const violation of violations[severity]) {
        const category = violation.category || 'other';
        grouped[category] = (grouped[category] || 0) + 1;
      }
    }

    return grouped;
  }

  generateRecommendations(systemicIssues) {
    const recommendations = [];

    for (const issue of systemicIssues) {
      recommendations.push({
        priority: 'high',
        area: issue.type,
        action: 'Implement process improvement',
        steps: issue.suggestedFixes,
        expectedImpact: `Reduce ${issue.type} violations by 80%`
      });
    }

    return recommendations;
  }
}

/**
 * Closed-Loop Remediation Engine
 */
export class ClosedLoopRemediation {
  constructor(options = {}) {
    this.options = {
      enableLearning: options.enableLearning !== false,
      enablePrediction: options.enablePrediction !== false,
      verificationStrict: options.verificationStrict || true,
      maxRetries: options.maxRetries || 2,
      verbose: options.verbose || false,
      ...options
    };

    this.detector = new ViolationDetector({ verbose: this.options.verbose });
    this.autoFix = new AutoFixEngine({ verbose: this.options.verbose });
    this.analyzer = new RootCauseAnalyzer();

    if (this.options.enablePrediction) {
      this.predictive = new PredictiveAnalytics({ verbose: this.options.verbose });
    }

    this.remediationLoop = {
      detect: null,
      diagnose: null,
      decide: null,
      deploy: null,
      verify: null,
      learn: null
    };

    this.metrics = {
      detectionTime: 0,
      diagnosisTime: 0,
      decisionTime: 0,
      deploymentTime: 0,
      verificationTime: 0,
      learningTime: 0,
      totalTime: 0,
      violationsBefore: 0,
      violationsAfter: 0,
      fixSuccess: 0,
      mttr: 0 // Mean Time To Resolution
    };
  }

  /**
   * Execute complete remediation loop
   */
  async remediateDocument(pdfPath) {
    console.log('\n' + '='.repeat(70));
    console.log('CLOSED-LOOP REMEDIATION');
    console.log('='.repeat(70));
    console.log(`\nDocument: ${pdfPath}\n`);

    const startTime = Date.now();

    try {
      // PHASE 0: Prediction (if enabled)
      if (this.options.enablePrediction && this.predictive) {
        await this.predictive.initialize();
        const metadata = await this.extractDocumentMetadata(pdfPath);
        const prediction = await this.predictive.predictViolations(metadata);

        console.log('\n🔮 PREDICTION:');
        console.log(`  ${prediction.hasViolations ? '⚠️  Violations predicted' : '✅ Clean document predicted'}`);
        console.log(`  Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);

        if (prediction.likelyViolations.length > 0) {
          console.log(`  Likely issues: ${prediction.likelyViolations.map(v => v.type).join(', ')}`);
        }
      }

      // PHASE 1: DETECT violations
      console.log('\n' + '─'.repeat(70));
      console.log('PHASE 1: DETECT');
      console.log('─'.repeat(70));

      const detectStart = Date.now();
      this.remediationLoop.detect = await this.detector.detectAllViolations(pdfPath);
      this.metrics.detectionTime = (Date.now() - detectStart) / 1000;
      this.metrics.violationsBefore = this.remediationLoop.detect.stats.totalViolations;

      // PHASE 2: DIAGNOSE root causes
      console.log('\n' + '─'.repeat(70));
      console.log('PHASE 2: DIAGNOSE');
      console.log('─'.repeat(70));

      const diagnoseStart = Date.now();
      this.remediationLoop.diagnose = this.analyzer.analyzeRootCauses(
        this.remediationLoop.detect.violations
      );
      this.metrics.diagnosisTime = (Date.now() - diagnoseStart) / 1000;

      console.log('\n🔍 Root Cause Analysis:');
      if (this.remediationLoop.diagnose.systemicIssues.length > 0) {
        console.log('\n⚠️  Systemic Issues Found:');
        for (const issue of this.remediationLoop.diagnose.systemicIssues) {
          console.log(`  • ${issue.type}: ${issue.count} occurrences`);
          console.log(`    Likely cause: ${issue.likelyCauses[0]}`);
        }
      }

      // PHASE 3: DECIDE fix strategy
      console.log('\n' + '─'.repeat(70));
      console.log('PHASE 3: DECIDE');
      console.log('─'.repeat(70));

      const decideStart = Date.now();
      this.remediationLoop.decide = await this.autoFix.generateFixPlan(pdfPath);
      this.metrics.decisionTime = (Date.now() - decideStart) / 1000;

      // PHASE 4: DEPLOY automated fixes
      console.log('\n' + '─'.repeat(70));
      console.log('PHASE 4: DEPLOY');
      console.log('─'.repeat(70));

      const deployStart = Date.now();
      this.remediationLoop.deploy = await this.autoFix.executeFixPlan(
        this.remediationLoop.decide
      );
      this.metrics.deploymentTime = (Date.now() - deployStart) / 1000;
      this.metrics.fixSuccess = this.remediationLoop.deploy.stats.fixesSuccessful;

      // PHASE 5: VERIFY fixes worked
      console.log('\n' + '─'.repeat(70));
      console.log('PHASE 5: VERIFY');
      console.log('─'.repeat(70));

      const verifyStart = Date.now();
      this.remediationLoop.verify = await this.verifyFixes(pdfPath);
      this.metrics.verificationTime = (Date.now() - verifyStart) / 1000;
      this.metrics.violationsAfter = this.remediationLoop.verify.stats.totalViolations;

      // PHASE 6: LEARN from results
      if (this.options.enableLearning) {
        console.log('\n' + '─'.repeat(70));
        console.log('PHASE 6: LEARN');
        console.log('─'.repeat(70));

        const learnStart = Date.now();
        this.remediationLoop.learn = await this.learnFromResults();
        this.metrics.learningTime = (Date.now() - learnStart) / 1000;
      }

      // Calculate total metrics
      this.metrics.totalTime = (Date.now() - startTime) / 1000;
      this.metrics.mttr = this.calculateMTTR();

      // Print final summary
      this.printRemediationSummary();

      return {
        loop: this.remediationLoop,
        metrics: this.metrics,
        success: this.metrics.violationsAfter < this.metrics.violationsBefore,
        improvement: this.calculateImprovement()
      };

    } catch (error) {
      console.error('\n❌ Remediation loop failed:', error);
      throw error;
    }
  }

  /**
   * Verify that fixes actually worked
   */
  async verifyFixes(pdfPath) {
    console.log('\n🔍 Verifying fixes...');

    // Re-detect violations
    const verification = await this.detector.detectAllViolations(pdfPath);

    // Compare before/after
    const before = this.remediationLoop.detect.stats.totalViolations;
    const after = verification.stats.totalViolations;
    const improvement = before - after;
    const improvementPercent = before > 0 ? ((improvement / before) * 100).toFixed(1) : 0;

    console.log('\n📊 Verification Results:');
    console.log(`  Before: ${before} violations`);
    console.log(`  After: ${after} violations`);
    console.log(`  Fixed: ${improvement} (${improvementPercent}% improvement)`);

    // Check if any new violations were introduced
    const newViolations = this.findNewViolations(
      this.remediationLoop.detect.violations,
      verification.violations
    );

    if (newViolations.length > 0) {
      console.log(`\n⚠️  Warning: ${newViolations.length} new violations introduced by fixes`);
      for (const violation of newViolations) {
        console.log(`  • ${violation.type}: ${violation.description}`);
      }
    }

    // Verify critical violations are gone
    if (verification.violations.critical.length === 0) {
      console.log('\n✅ All critical violations resolved!');
    } else {
      console.log(`\n⚠️  ${verification.violations.critical.length} critical violations remain`);
    }

    return verification;
  }

  /**
   * Find new violations introduced during fixing
   */
  findNewViolations(before, after) {
    const newViolations = [];

    // Check each severity level
    for (const severity of ['critical', 'major', 'minor']) {
      const beforeTypes = new Set(before[severity].map(v => `${v.type}_${v.location?.text}`));
      const afterViolations = after[severity];

      for (const violation of afterViolations) {
        const key = `${violation.type}_${violation.location?.text}`;
        if (!beforeTypes.has(key)) {
          newViolations.push(violation);
        }
      }
    }

    return newViolations;
  }

  /**
   * Learn from remediation results
   */
  async learnFromResults() {
    console.log('\n🎓 Learning from results...');

    const learning = {
      successfulStrategies: [],
      failedStrategies: [],
      patterns: [],
      recommendations: []
    };

    // Analyze successful fixes
    for (const success of this.remediationLoop.deploy.results.success) {
      learning.successfulStrategies.push({
        type: success.fix.type,
        violationType: success.fix.violation.type,
        timeElapsed: success.result.timeElapsed
      });
    }

    // Analyze failed fixes
    for (const failure of this.remediationLoop.deploy.results.failed) {
      learning.failedStrategies.push({
        type: failure.fix.type,
        violationType: failure.fix.violation.type,
        error: failure.result?.error || failure.error
      });
    }

    // Identify patterns
    if (learning.successfulStrategies.length > 0) {
      const avgTime = learning.successfulStrategies.reduce(
        (sum, s) => sum + s.timeElapsed, 0
      ) / learning.successfulStrategies.length;

      learning.patterns.push({
        pattern: 'automated_fix_efficiency',
        observation: `Automated fixes completed in ${avgTime.toFixed(0)}ms average`,
        confidence: 'high'
      });
    }

    // Generate recommendations for future
    if (learning.failedStrategies.length > 0) {
      const failureTypes = {};
      for (const failure of learning.failedStrategies) {
        failureTypes[failure.type] = (failureTypes[failure.type] || 0) + 1;
      }

      for (const [type, count] of Object.entries(failureTypes)) {
        if (count >= 2) {
          learning.recommendations.push({
            area: type,
            action: `Improve ${type} fix strategy - ${count} failures detected`,
            priority: 'high'
          });
        }
      }
    }

    // Update predictive model if enabled
    if (this.options.enablePrediction && this.predictive) {
      console.log('  Updating predictive model...');

      // Record actual violations for learning
      const documentMetadata = await this.extractDocumentMetadata(
        this.remediationLoop.decide.document
      );

      if (documentMetadata.id) {
        const allViolations = [
          ...this.remediationLoop.detect.violations.critical,
          ...this.remediationLoop.detect.violations.major,
          ...this.remediationLoop.detect.violations.minor
        ];

        await this.predictive.recordViolations(documentMetadata.id, allViolations);
      }

      // Check if retraining is beneficial
      const stats = await this.predictive.getModelStatistics();
      if (stats.improvementRate < 0) {
        console.log('  ⚠️  Model accuracy declining - retraining recommended');
        learning.recommendations.push({
          area: 'predictive_model',
          action: 'Retrain predictive model with recent data',
          priority: 'medium'
        });
      }
    }

    console.log(`\n📚 Learning Summary:`);
    console.log(`  Successful strategies: ${learning.successfulStrategies.length}`);
    console.log(`  Failed strategies: ${learning.failedStrategies.length}`);
    console.log(`  Patterns identified: ${learning.patterns.length}`);
    console.log(`  Recommendations: ${learning.recommendations.length}`);

    return learning;
  }

  /**
   * Extract document metadata
   */
  async extractDocumentMetadata(pdfPath) {
    // Placeholder - would extract actual metadata from PDF
    return {
      id: null,
      path: pdfPath,
      page_count: 0,
      color_count: 0,
      font_count: 0,
      image_count: 0,
      text_frame_count: 0,
      has_custom_colors: false,
      has_custom_fonts: false,
      complexity_score: 0,
      previous_violation_count: 0
    };
  }

  /**
   * Calculate Mean Time To Resolution
   */
  calculateMTTR() {
    // MTTR = Total time to fix all violations / Number of violations fixed
    const violationsFixed = this.metrics.violationsBefore - this.metrics.violationsAfter;

    if (violationsFixed === 0) return 0;

    return (this.metrics.totalTime / violationsFixed) * 1000; // in milliseconds
  }

  /**
   * Calculate improvement percentage
   */
  calculateImprovement() {
    if (this.metrics.violationsBefore === 0) return 0;

    const improvement = this.metrics.violationsBefore - this.metrics.violationsAfter;
    return ((improvement / this.metrics.violationsBefore) * 100).toFixed(1);
  }

  /**
   * Print final remediation summary
   */
  printRemediationSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('REMEDIATION SUMMARY');
    console.log('='.repeat(70));

    console.log('\n📊 Metrics:');
    console.log(`  Detection time: ${this.metrics.detectionTime.toFixed(2)}s`);
    console.log(`  Diagnosis time: ${this.metrics.diagnosisTime.toFixed(2)}s`);
    console.log(`  Decision time: ${this.metrics.decisionTime.toFixed(2)}s`);
    console.log(`  Deployment time: ${this.metrics.deploymentTime.toFixed(2)}s`);
    console.log(`  Verification time: ${this.metrics.verificationTime.toFixed(2)}s`);

    if (this.options.enableLearning) {
      console.log(`  Learning time: ${this.metrics.learningTime.toFixed(2)}s`);
    }

    console.log(`\n  Total time: ${this.metrics.totalTime.toFixed(2)}s`);

    console.log('\n🎯 Results:');
    console.log(`  Violations before: ${this.metrics.violationsBefore}`);
    console.log(`  Violations after: ${this.metrics.violationsAfter}`);
    console.log(`  Fixes successful: ${this.metrics.fixSuccess}`);
    console.log(`  Improvement: ${this.calculateImprovement()}%`);
    console.log(`  MTTR: ${this.metrics.mttr.toFixed(0)}ms per violation`);

    // Calculate time savings
    const manualTime = this.metrics.fixSuccess * 35 * 60; // 35 min per fix
    const automatedTime = this.metrics.totalTime;
    const timeSaved = manualTime - automatedTime;
    const efficiency = manualTime > 0 ? ((timeSaved / manualTime) * 100).toFixed(1) : 0;

    console.log('\n⏱️  Time Savings:');
    console.log(`  Manual time estimate: ${this.formatTime(manualTime)}`);
    console.log(`  Automated time: ${this.formatTime(automatedTime)}`);
    console.log(`  Time saved: ${this.formatTime(timeSaved)}`);
    console.log(`  Efficiency gain: ${efficiency}%`);

    // Success indicator
    const improvement = this.calculateImprovement();
    if (improvement >= 80) {
      console.log('\n🎉 EXCELLENT RESULT!');
    } else if (improvement >= 50) {
      console.log('\n✅ GOOD RESULT');
    } else if (improvement >= 25) {
      console.log('\n⚠️  PARTIAL SUCCESS');
    } else {
      console.log('\n❌ LIMITED SUCCESS - Manual review recommended');
    }

    console.log('\n' + '='.repeat(70) + '\n');
  }

  formatTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(0)}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      const secs = Math.floor(seconds % 60);
      return `${minutes}m ${secs}s`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}

export default ClosedLoopRemediation;
