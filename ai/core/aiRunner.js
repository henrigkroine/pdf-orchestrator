#!/usr/bin/env node
/**
 * AI Runner - Orchestrates all AI analysis features
 * Version 1.0
 */

const fs = require('fs');
const path = require('path');
const AIConfig = require('./aiConfig');
const logger = require('../utils/logger');
const {
  validateAIReport,
  createEmptyReport,
  calculateOverallScore
} = require('./schemas');

// Feature analyzers (Tier 1 - Heuristic)
const { analyzeTypography } = require('../features/typography/typographyAnalyzer');
const { analyzeWhitespace } = require('../features/whitespace/whitespaceAnalyzer');
const { analyzeColorHarmony } = require('../features/color/colorHarmonyAnalyzer');

// Advanced analyzers (Tier 1.5 - Real PDF extraction)
const { analyzeTypographyAdvanced } = require('../features/typography/advancedTypographyAnalyzer');
const { analyzeWhitespaceAdvanced } = require('../features/whitespace/advancedWhitespaceAnalyzer');

// Layout analyzer (Tier 2 - SmolDocling VLM)
const { analyzeLayout } = require('../features/layout/layoutAnalyzer');

/**
 * Main AI analysis runner
 * @param {Object} options - { jobConfigPath, outputPath }
 * @returns {Promise<Object>} AI analysis result
 */
async function runAIAnalysis(options) {
  const startTime = Date.now();

  const { jobConfigPath, outputPath } = options;

  // Load configuration
  const config = new AIConfig(jobConfigPath);
  const loaded = await config.load();

  if (!loaded) {
    logger.error("Failed to load AI configuration");
    process.exit(3); // Infrastructure error
  }

  // Check if AI is enabled
  if (!config.isEnabled()) {
    logger.info("AI subsystem is disabled in job config");
    logger.info("Set ai.enabled = true to run AI analysis");
    process.exit(0); // Success - skipped as intended
  }

  // Determine tier based on advancedMode and layout feature
  const advancedMode = config.isAdvancedMode();
  const layoutEnabled = config.isFeatureEnabled('layout');

  let tier = 'TIER 1';
  if (layoutEnabled) {
    tier = 'TIER 2 (with Layout AI)';
  } else if (advancedMode) {
    tier = 'TIER 1.5 (Advanced Extraction)';
  }

  logger.section(`AI DESIGN ANALYSIS (${tier})`);
  logger.info(config.getSummary());

  // Check if dry run
  if (config.isDryRun()) {
    logger.warn("DRY RUN MODE: AI analysis will run but won't fail pipeline");
  }

  // Validate paths
  const pathValidation = config.validatePaths();
  if (!pathValidation.valid) {
    logger.error("Required files missing:");
    pathValidation.missing.forEach(file => logger.error(`  - ${file}`));
    process.exit(3); // Infrastructure error
  }

  // Create empty report
  const report = createEmptyReport({
    jobId: config.getJobId(),
    pdfPath: config.getPdfPath(),
    jobConfigPath
  });

  const featuresExecuted = [];
  const featuresSkipped = [];
  const errors = [];

  try {
    // ========================================
    // FEATURE 1: TYPOGRAPHY
    // ========================================
    if (config.isFeatureEnabled('typography')) {
      logger.subsection("Feature 1: Typography Analysis");
      try {
        let typographyResult;

        if (advancedMode) {
          logger.info("Using advanced typography analyzer (Tier 1.5)");
          typographyResult = await analyzeTypographyAdvanced(
            config.getPdfPath(),
            config.getTypographySidecarPath(),
            config.getFeatureConfig('typography'),
            config.getJobConfig()
          );
        } else {
          logger.info("Using standard typography analyzer (Tier 1)");
          typographyResult = await analyzeTypography(
            config.getTypographySidecarPath(),
            config.getFeatureConfig('typography'),
            config.getJobConfig()
          );
        }

        report.features.typography = typographyResult;
        featuresExecuted.push('typography');
        logger.success(`Typography analysis complete (score: ${typographyResult.score.toFixed(2)})`);
      } catch (error) {
        logger.error(`Typography analysis failed: ${error.message}`);
        errors.push(`Typography: ${error.message}`);
        report.features.typography = {
          enabled: true,
          weight: 0.4,
          score: 0,
          issues: [{ severity: "critical", message: error.message }],
          summary: "Analysis failed"
        };
      }
    } else {
      featuresSkipped.push('typography');
      logger.info("Typography analysis: SKIPPED (disabled)");
    }

    // ========================================
    // FEATURE 2: WHITESPACE
    // ========================================
    if (config.isFeatureEnabled('whitespace')) {
      logger.subsection("Feature 2: Whitespace Analysis");
      try {
        let whitespaceResult;

        if (advancedMode) {
          logger.info("Using advanced whitespace analyzer (Tier 1.5)");
          whitespaceResult = await analyzeWhitespaceAdvanced(
            config.getPdfPath(),
            config.getFeatureConfig('whitespace'),
            config.getJobConfig()
          );
        } else {
          logger.info("Using standard whitespace analyzer (Tier 1)");
          whitespaceResult = await analyzeWhitespace(
            config.getPdfPath(),
            config.getFeatureConfig('whitespace'),
            config.getJobConfig()
          );
        }

        report.features.whitespace = whitespaceResult;
        featuresExecuted.push('whitespace');
        logger.success(`Whitespace analysis complete (score: ${whitespaceResult.score.toFixed(2)})`);
      } catch (error) {
        logger.error(`Whitespace analysis failed: ${error.message}`);
        errors.push(`Whitespace: ${error.message}`);
        report.features.whitespace = {
          enabled: true,
          weight: 0.3,
          score: 0,
          issues: [{ severity: "critical", message: error.message }],
          summary: "Analysis failed"
        };
      }
    } else {
      featuresSkipped.push('whitespace');
      logger.info("Whitespace analysis: SKIPPED (disabled)");
    }

    // ========================================
    // FEATURE 3: COLOR HARMONY
    // ========================================
    if (config.isFeatureEnabled('color')) {
      logger.subsection("Feature 3: Color Harmony Analysis");
      try {
        const colorResult = await analyzeColorHarmony(
          config.getPdfPath(),
          config.getFeatureConfig('color'),
          config.getJobConfig()
        );
        report.features.color = colorResult;
        featuresExecuted.push('color');
        logger.success(`Color analysis complete (score: ${colorResult.score.toFixed(2)})`);
      } catch (error) {
        logger.error(`Color analysis failed: ${error.message}`);
        errors.push(`Color: ${error.message}`);
        report.features.color = {
          enabled: true,
          weight: 0.3,
          score: 0,
          issues: [{ severity: "critical", message: error.message }],
          summary: "Analysis failed"
        };
      }
    } else {
      featuresSkipped.push('color');
      logger.info("Color analysis: SKIPPED (disabled)");
    }

    // ========================================
    // FEATURE 4: LAYOUT (TIER 2)
    // ========================================
    if (config.isFeatureEnabled('layout')) {
      logger.subsection("Feature 4: Layout Analysis (Tier 2)");
      try {
        const layoutResult = await analyzeLayout(
          config.getPdfPath(),
          config.getFeatureConfig('layout'),
          config.getJobConfig()
        );
        report.features.layout = layoutResult;

        if (layoutResult.enabled) {
          featuresExecuted.push('layout');
          logger.success(`Layout analysis complete (score: ${layoutResult.score.toFixed(2)})`);
        } else {
          featuresSkipped.push('layout');
          logger.warn('Layout analysis skipped (SmolDocling not available)');
        }
      } catch (error) {
        logger.error(`Layout analysis failed: ${error.message}`);
        errors.push(`Layout: ${error.message}`);
        report.features.layout = {
          enabled: false,
          weight: 0.25,
          score: 0,
          issues: [{ severity: "low", message: error.message }],
          summary: "Analysis failed"
        };
      }
    } else {
      featuresSkipped.push('layout');
      logger.info("Layout analysis: SKIPPED (disabled)");
    }

    // ========================================
    // CALCULATE OVERALL SCORE
    // ========================================
    logger.subsection("Overall AI Score");

    report.overall = calculateOverallScore(
      report.features,
      config.getMinNormalizedScore()
    );

    // Update metadata
    const endTime = Date.now();
    report.metadata.duration_ms = endTime - startTime;
    report.metadata.features_executed = featuresExecuted;
    report.metadata.features_skipped = featuresSkipped;
    report.metadata.errors = errors;
    report.metadata.tier = tier;
    report.metadata.advancedMode = advancedMode;
    report.metadata.layoutEnabled = layoutEnabled;

    // ========================================
    // SAVE REPORT
    // ========================================
    const reportDir = config.getReportDir();
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = outputPath || path.join(
      reportDir,
      `${config.getJobId()}-ai-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}.json`
    );

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    logger.success(`Report saved: ${reportPath}`);

    // ========================================
    // PRINT SUMMARY
    // ========================================
    logger.section("AI ANALYSIS SUMMARY");

    for (const [featureName, featureData] of Object.entries(report.features)) {
      if (featureData.enabled) {
        const icon = featureData.score >= 0.85 ? "✓" : "⚠️";
        console.log(`${icon} ${featureName.padEnd(12)}: ${featureData.score.toFixed(2)} / 1.00`);
        if (featureData.issues.length > 0) {
          console.log(`  Issues: ${featureData.issues.length}`);
        }
      }
    }

    console.log();
    console.log(`Overall Score: ${report.overall.normalizedScore.toFixed(3)}`);
    console.log(`Grade: ${report.overall.grade}`);
    console.log(`Threshold: ${report.overall.threshold}`);
    console.log(`Status: ${report.overall.passed ? "✓ PASS" : "❌ FAIL"}`);
    console.log();
    console.log(report.overall.message);

    // ========================================
    // CHECK CRITICAL ISSUES
    // ========================================
    const allIssues = Object.values(report.features)
      .filter(f => f.enabled)
      .flatMap(f => f.issues);

    const criticalIssues = allIssues.filter(i => i.severity === "critical");

    if (criticalIssues.length > 0 && config.shouldFailOnCriticalIssues()) {
      logger.error(`Found ${criticalIssues.length} critical issues`);
      for (const issue of criticalIssues.slice(0, 3)) {
        logger.error(`  ${issue.id}: ${issue.message}`);
      }
    }

    // ========================================
    // DETERMINE EXIT CODE
    // ========================================
    let exitCode = 0;

    if (config.isDryRun()) {
      logger.warn("DRY RUN: Exiting with code 0 (would have been " +
                 (report.overall.passed ? "0" : "1") + ")");
      exitCode = 0;
    } else if (!report.overall.passed) {
      logger.error(`AI score ${report.overall.normalizedScore.toFixed(3)} below threshold ${report.overall.threshold}`);
      exitCode = 1;
    } else if (criticalIssues.length > 0 && config.shouldFailOnCriticalIssues()) {
      logger.error("Critical issues found - failing pipeline");
      exitCode = 1;
    } else {
      logger.success("AI analysis PASSED");
      exitCode = 0;
    }

    logger.info(`Exiting with code ${exitCode}`);
    return report;

  } catch (error) {
    logger.error(`AI analysis failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(3); // Infrastructure error
  }
}

// ========================================
// CLI INTERFACE
// ========================================
if (require.main === module) {
  const args = process.argv.slice(2);

  const options = {
    jobConfigPath: null,
    outputPath: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--job-config' && args[i + 1]) {
      options.jobConfigPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.outputPath = args[i + 1];
      i++;
    }
  }

  if (!options.jobConfigPath) {
    console.error("Usage: node aiRunner.js --job-config <path> [--output <path>]");
    process.exit(3);
  }

  runAIAnalysis(options)
    .then(report => {
      const exitCode = report.overall.passed ? 0 : 1;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error(`Fatal error: ${error.message}`);
      process.exit(3);
    });
}

module.exports = { runAIAnalysis };
