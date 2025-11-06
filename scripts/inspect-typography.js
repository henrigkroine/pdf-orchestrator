#!/usr/bin/env node

/**
 * Typography Inspector CLI
 *
 * Command-line tool for comprehensive typography inspection of PDFs.
 *
 * Usage:
 *   node scripts/inspect-typography.js <pdf-path> [options]
 *
 * Examples:
 *   node scripts/inspect-typography.js exports/document.pdf
 *   node scripts/inspect-typography.js exports/document.pdf --format html
 *   node scripts/inspect-typography.js exports/document.pdf --compare baseline.pdf
 *   node scripts/inspect-typography.js exports/document.pdf --fix
 *   node scripts/inspect-typography.js exports/document.pdf --no-ai
 */

const fs = require('fs');
const path = require('path');
const TypographyInspector = require('./lib/typography-inspector');
const TypographyFixer = require('./lib/typography-fixer');

// Parse command-line arguments
const args = process.argv.slice(2);

// Show help if no arguments
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Parse options
const options = {
  pdfPath: args[0],
  format: 'json',
  enableAI: true,
  fix: false,
  dryRun: false,
  compare: null,
  verbose: false,
  categories: {
    fonts: true,
    scale: true,
    spacing: true,
    kerning: true,
    readability: true,
    hierarchy: true,
    polish: true
  }
};

for (let i = 1; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--format' || arg === '-f') {
    options.format = args[++i];
  } else if (arg === '--no-ai') {
    options.enableAI = false;
  } else if (arg === '--fix') {
    options.fix = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  } else if (arg === '--compare' || arg === '-c') {
    options.compare = args[++i];
  } else if (arg === '--verbose' || arg === '-v') {
    options.verbose = true;
  } else if (arg.startsWith('--only-')) {
    // Disable all, enable specific
    Object.keys(options.categories).forEach(cat => options.categories[cat] = false);
    const category = arg.replace('--only-', '');
    options.categories[category] = true;
  } else if (arg.startsWith('--skip-')) {
    const category = arg.replace('--skip-', '');
    options.categories[category] = false;
  }
}

// Main execution
(async () => {
  try {
    console.log('🔍 Typography Inspector\n');

    // Validate PDF exists
    if (!fs.existsSync(options.pdfPath)) {
      console.error(`❌ Error: PDF not found: ${options.pdfPath}`);
      process.exit(1);
    }

    // Create inspector
    const inspector = new TypographyInspector({
      validateFonts: options.categories.fonts,
      validateScale: options.categories.scale,
      validateSpacing: options.categories.spacing,
      validateKerning: options.categories.kerning,
      validateReadability: options.categories.readability,
      validateHierarchy: options.categories.hierarchy,
      validatePolish: options.categories.polish,
      enableAI: options.enableAI,
      verbose: options.verbose,
      saveReport: true,
      outputFormat: options.format
    });

    // Run inspection
    console.log(`📄 Inspecting: ${options.pdfPath}\n`);
    const report = await inspector.inspect(options.pdfPath);

    // Display results
    displayResults(report);

    // Compare with baseline if requested
    if (options.compare) {
      await compareWithBaseline(options.pdfPath, options.compare, inspector);
    }

    // Apply fixes if requested
    if (options.fix) {
      await applyFixes(options.pdfPath, report, options.dryRun);
    }

    // Exit with appropriate code
    const exitCode = report.overallScore >= 80 ? 0 : 1;
    process.exit(exitCode);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();

/**
 * Display inspection results
 */
function displayResults(report) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 INSPECTION RESULTS');
  console.log('='.repeat(60) + '\n');

  // Overall score
  console.log('Overall Typography Score:');
  console.log(`  ${getScoreBar(report.overallScore)} ${report.overallScore}/100`);
  console.log(`  ${report.grade}\n`);

  // Category scores
  console.log('Category Scores:');
  for (const [category, score] of Object.entries(report.categoryScores)) {
    console.log(`  ${category.padEnd(15)} ${getScoreBar(score)} ${score}/100`);
  }
  console.log();

  // Summary
  console.log('Summary:');
  console.log(`  Total Issues:    ${report.summary.totalIssues}`);
  console.log(`  Total Warnings:  ${report.summary.totalWarnings}`);
  console.log(`  Critical Issues: ${report.summary.criticalIssues.length}\n`);

  // Strengths
  if (report.summary.strengths.length > 0) {
    console.log('✓ Strengths:');
    for (const strength of report.summary.strengths) {
      console.log(`  • ${strength.category}: ${strength.note}`);
    }
    console.log();
  }

  // Weaknesses
  if (report.summary.weaknesses.length > 0) {
    console.log('⚠️  Areas for Improvement:');
    for (const weakness of report.summary.weaknesses) {
      console.log(`  • ${weakness.category} (Score: ${weakness.score}/100)`);
    }
    console.log();
  }

  // Top recommendations
  console.log('🎯 Top Recommendations:');
  for (let i = 0; i < Math.min(5, report.recommendations.top10.length); i++) {
    const rec = report.recommendations.top10[i];
    console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.text}`);
  }
  console.log();

  // AI Insights (if available)
  if (report.aiInsights && report.aiInsights.assessments.length > 0) {
    console.log('🤖 AI Insights:');
    for (const insight of report.aiInsights.assessments.slice(0, 3)) {
      console.log(`  ${insight.category}: ${insight.assessment}`);
    }
    console.log();
  }

  console.log('='.repeat(60));
}

/**
 * Get visual score bar
 */
function getScoreBar(score) {
  const filled = Math.round(score / 10);
  const empty = 10 - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

/**
 * Compare with baseline PDF
 */
async function compareWithBaseline(currentPath, baselinePath, inspector) {
  console.log('\n📊 Comparing with baseline...\n');

  try {
    const baselineReport = await inspector.inspect(baselinePath);

    console.log('Comparison Results:');
    console.log(`  Current:  ${inspector.overallScore}/100`);
    console.log(`  Baseline: ${baselineReport.overallScore}/100`);

    const difference = inspector.overallScore - baselineReport.overallScore;
    const symbol = difference > 0 ? '↑' : difference < 0 ? '↓' : '→';
    const color = difference > 0 ? 'Improved' : difference < 0 ? 'Regressed' : 'Same';

    console.log(`  Change:   ${symbol} ${Math.abs(difference)} points (${color})\n`);

    // Category comparisons
    console.log('Category Changes:');
    for (const [category, currentScore] of Object.entries(inspector.results)) {
      if (!currentScore || !currentScore.summary) continue;

      const baselineScore = baselineReport.results[category]?.summary?.score || 0;
      const diff = currentScore.summary.score - baselineScore;

      if (diff !== 0) {
        const symbol = diff > 0 ? '↑' : '↓';
        console.log(`  ${category.padEnd(15)} ${symbol} ${Math.abs(diff)} points`);
      }
    }
    console.log();

  } catch (error) {
    console.error('Comparison failed:', error.message);
  }
}

/**
 * Apply automated fixes
 */
async function applyFixes(pdfPath, report, dryRun = false) {
  console.log('\n🔧 Applying automated fixes...\n');

  try {
    const fixer = new TypographyFixer({
      dryRun: dryRun
    });

    const fixReport = await fixer.fix(pdfPath, report);

    console.log('Fix Summary:');
    console.log(`  Total Fixes:         ${fixReport.summary.totalFixes}`);
    console.log(`  Quotes Fixed:        ${fixReport.summary.quotesFixed}`);
    console.log(`  Dashes Fixed:        ${fixReport.summary.dashesFixed}`);
    console.log(`  Apostrophes Fixed:   ${fixReport.summary.apostrophesFixed}`);
    console.log(`  Numbers Fixed:       ${fixReport.summary.numbersFixed}`);
    console.log();

    if (dryRun) {
      console.log('(Dry run - no changes applied)');
    } else {
      console.log('✓ Fixes applied successfully!');
      console.log('  Run inspection again to verify improvements.');
    }
    console.log();

  } catch (error) {
    console.error('Fixes failed:', error.message);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Typography Inspector CLI

Comprehensive typography inspection for PDFs with AI-powered analysis.

USAGE:
  node scripts/inspect-typography.js <pdf-path> [options]

OPTIONS:
  -f, --format <format>     Output format (json, html, markdown, csv)
                            Default: json

  --no-ai                   Disable AI validation
                            Faster but less insightful

  --fix                     Apply automated fixes after inspection
                            Creates <filename>-FIXED.pdf

  --dry-run                 Preview fixes without applying them
                            Use with --fix

  -c, --compare <baseline>  Compare with baseline PDF
                            Shows score differences

  -v, --verbose             Show detailed progress information

  --only-<category>         Inspect only specific category
                            Categories: fonts, scale, spacing, kerning,
                                      readability, hierarchy, polish

  --skip-<category>         Skip specific category

  -h, --help                Show this help message

EXAMPLES:
  # Basic inspection
  node scripts/inspect-typography.js exports/document.pdf

  # Inspect with HTML report
  node scripts/inspect-typography.js exports/document.pdf --format html

  # Compare with baseline
  node scripts/inspect-typography.js exports/v2.pdf --compare exports/v1.pdf

  # Apply automated fixes
  node scripts/inspect-typography.js exports/document.pdf --fix

  # Preview fixes
  node scripts/inspect-typography.js exports/document.pdf --fix --dry-run

  # Inspect only readability
  node scripts/inspect-typography.js exports/document.pdf --only-readability

  # Fast inspection without AI
  node scripts/inspect-typography.js exports/document.pdf --no-ai

EXIT CODES:
  0   Score >= 80 (Good or better)
  1   Score < 80 (Needs improvement)

SCORING:
  95-100  PERFECT    - Professional publication quality
  90-94   EXCELLENT  - Minor improvements possible
  85-89   VERY GOOD  - Some polish needed
  80-84   GOOD       - Multiple improvements available
  70-79   FAIR       - Several issues to fix
  <70     POOR       - Major typography work needed

AI MODELS:
  GPT-4o         - Font appropriateness, hierarchy effectiveness
  GPT-5          - Line spacing, widow/orphan optimization
  Claude Opus    - Type scale reasoning, typography polish
  Claude Sonnet  - Micro-typography, kerning analysis
  Gemini 2.5 Pro - Readability, rag quality analysis

For more information, see:
  docs/TYPOGRAPHY-INSPECTOR-GUIDE.md
  `);
}
