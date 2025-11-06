#!/usr/bin/env node

/**
 * Print Production Auditor - CLI Tool
 *
 * Comprehensive PDF auditing for professional printing.
 *
 * Usage:
 *   node scripts/audit-print-production.js <pdf-path> [options]
 *
 * Options:
 *   --no-ai              Disable AI analysis
 *   --output-json        Export results to JSON
 *   --output-html        Export results to HTML
 *   --output-csv         Export results to CSV
 *   --auto-fix           Apply automated fixes
 *   --standard <name>    Target PDF/X standard (x1a, x3, x4)
 *
 * Examples:
 *   node scripts/audit-print-production.js exports/document.pdf
 *   node scripts/audit-print-production.js exports/document.pdf --output-html --output-json
 *   node scripts/audit-print-production.js exports/document.pdf --standard x4
 *
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs').promises;
const PrintProductionAuditor = require('./lib/print-production-auditor');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const pdfPath = args.find(arg => !arg.startsWith('--'));

  if (!pdfPath) {
    console.error('Error: PDF file path required');
    console.error('Usage: node scripts/audit-print-production.js <pdf-path> [options]');
    process.exit(1);
  }

  const options = {
    pdfPath: path.resolve(pdfPath),
    enableAI: !args.includes('--no-ai'),
    outputJson: args.includes('--output-json'),
    outputHtml: args.includes('--output-html'),
    outputCsv: args.includes('--output-csv'),
    autoFix: args.includes('--auto-fix'),
    standard: getOptionValue(args, '--standard') || null,
    verbose: args.includes('--verbose') || args.includes('-v')
  };

  return options;
}

/**
 * Get value for an option flag
 */
function getOptionValue(args, flag) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return null;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    Print Production Auditor - CLI Tool                       ║
║                     Professional PDF Print Validation                        ║
╚═══════════════════════════════════════════════════════════════════════════════╝

USAGE:
  node scripts/audit-print-production.js <pdf-path> [options]

DESCRIPTION:
  Comprehensive AI-powered print production auditing system that validates PDFs
  for professional printing with preflight checking and production readiness.

FEATURES:
  ✓ PDF/X compliance validation (X-1a, X-3, X-4, UA)
  ✓ Color management and CMYK validation
  ✓ Bleed and trim mark checking
  ✓ Resolution and image quality analysis (300 DPI minimum)
  ✓ Font embedding verification
  ✓ 15+ professional preflight checks
  ✓ Production readiness scoring (0-100)
  ✓ Print cost estimation
  ✓ Automated fix recommendations
  ✓ AI-powered analysis with 5 models

OPTIONS:
  --no-ai              Disable AI analysis (faster, but less comprehensive)
  --output-json        Export results to JSON file
  --output-html        Export results to HTML report
  --output-csv         Export results to CSV spreadsheet
  --auto-fix           Apply automated fixes to PDF
  --standard <name>    Target PDF/X standard: x1a, x3, or x4 (default: x4)
  --verbose, -v        Verbose output with detailed checks
  --help, -h           Show this help message

EXAMPLES:
  # Basic audit
  node scripts/audit-print-production.js exports/document.pdf

  # Full audit with HTML and JSON reports
  node scripts/audit-print-production.js exports/document.pdf --output-html --output-json

  # Audit with PDF/X-1a compliance target
  node scripts/audit-print-production.js exports/document.pdf --standard x1a

  # Audit and apply automated fixes
  node scripts/audit-print-production.js exports/document.pdf --auto-fix

  # Quick audit without AI analysis
  node scripts/audit-print-production.js exports/document.pdf --no-ai

VALIDATION CATEGORIES:
  1. PDF/X Compliance    - PDF/X-1a, X-3, X-4, UA standards
  2. Color Management    - CMYK, ink coverage (300% TAC), profiles
  3. Bleed & Trim        - 3-5mm bleed, trim/crop/registration marks
  4. Resolution          - 300 DPI minimum, upsampling detection
  5. Fonts               - Embedding, subsetting, licensing
  6. Technical Specs     - Page size, color depth, PDF version
  7. Preflight           - 15+ professional production checks

AI MODELS:
  • GPT-4o             - PDF/X compliance assessment
  • GPT-5              - Bleed/trim validation
  • Claude Opus 4      - Color management reasoning
  • Claude Sonnet 4.5  - Production readiness scoring
  • Gemini 2.5 Pro     - Image quality analysis

PRODUCTION READINESS SCORING:
  100      Perfect print-ready, PDF/X-4 compliant
  95-99    Excellent, minor warnings only
  90-94    Very good, ready for most printers
  85-89    Good, some improvements recommended
  70-84    Fair, multiple issues to fix
  <70      Not print-ready, critical issues present

OUTPUT FORMATS:
  JSON     Detailed results with full validation data
  HTML     Visual report with color-coded issues
  CSV      Spreadsheet format for analysis

For more information, visit:
  https://github.com/your-org/pdf-orchestrator

Version: 1.0.0
`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const options = parseArgs();

    console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
    console.log('║              Print Production Auditor - Professional PDF Validation          ║');
    console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

    // Validate PDF file exists
    try {
      await fs.access(options.pdfPath);
    } catch {
      console.error(`✗ Error: PDF file not found: ${options.pdfPath}`);
      process.exit(1);
    }

    // Initialize auditor
    const auditor = new PrintProductionAuditor();
    await auditor.initialize();

    // Run audit
    console.log(`Auditing: ${path.basename(options.pdfPath)}\n`);
    const results = await auditor.auditPDF(options.pdfPath, {
      enableAI: options.enableAI,
      targetStandard: options.standard
    });

    // Export results
    const outputDir = path.join(__dirname, '../exports/audit-reports');
    await fs.mkdir(outputDir, { recursive: true });

    const baseName = path.basename(options.pdfPath, '.pdf');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

    if (options.outputJson) {
      const jsonPath = path.join(outputDir, `${baseName}-audit-${timestamp}.json`);
      await auditor.exportToJSON(jsonPath);
    }

    if (options.outputHtml) {
      const htmlPath = path.join(outputDir, `${baseName}-audit-${timestamp}.html`);
      await auditor.exportToHTML(htmlPath);
    }

    if (options.outputCsv) {
      const csvPath = path.join(outputDir, `${baseName}-audit-${timestamp}.csv`);
      await auditor.exportToCSV(csvPath);
    }

    // Apply automated fixes if requested
    if (options.autoFix && results.autoFixRecommendations.length > 0) {
      console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
      console.log('║                          Applying Automated Fixes                            ║');
      console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

      const optimizer = auditor.optimizer;
      const fixResult = await optimizer.applyFixes(options.pdfPath, results.autoFixRecommendations);

      console.log(`✓ Applied ${fixResult.applied} automated fixes`);
      console.log(`  ${fixResult.message}\n`);
    }

    // Print final summary
    printFinalSummary(results);

    // Exit with appropriate code
    const exitCode = results.productionReadiness.score >= 85 ? 0 : 1;
    process.exit(exitCode);

  } catch (error) {
    console.error('\n✗ Fatal Error:', error.message);
    if (parseArgs().verbose) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Print final summary
 */
function printFinalSummary(results) {
  const score = results.productionReadiness.score;
  const icon = score >= 95 ? '✓' : score >= 85 ? '⚠️' : '✗';
  const color = score >= 95 ? '\x1b[32m' : score >= 85 ? '\x1b[33m' : '\x1b[31m';
  const reset = '\x1b[0m';

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                              FINAL ASSESSMENT                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

  console.log(`${color}${icon} Production Readiness Score: ${score}/100${reset}`);
  console.log(`${color}  Grade: ${results.productionReadiness.grade?.toUpperCase() || 'N/A'}${reset}`);
  console.log(`  Status: ${results.productionReadiness.status}`);
  console.log(`\n  ${results.productionReadiness.recommendation}`);

  if (results.issuesSummary.critical.length > 0) {
    console.log(`\n  🔴 Critical Issues: ${results.issuesSummary.critical.length}`);
    results.issuesSummary.critical.slice(0, 3).forEach(issue => {
      console.log(`     • ${issue.check}: ${issue.message || issue.description}`);
    });
    if (results.issuesSummary.critical.length > 3) {
      console.log(`     ... and ${results.issuesSummary.critical.length - 3} more`);
    }
  }

  if (results.issuesSummary.warning.length > 0) {
    console.log(`\n  ⚠️  Warnings: ${results.issuesSummary.warning.length}`);
  }

  if (results.costEstimate && !results.costEstimate.error) {
    console.log(`\n  💰 Estimated Print Cost: $${results.costEstimate.totalCost?.toFixed(2) || 'N/A'}`);
    console.log(`     Per Page: $${results.costEstimate.perPage?.toFixed(3) || 'N/A'}`);
  }

  console.log('\n' + '─'.repeat(80));

  if (score >= 85) {
    console.log(`\n${color}✓ This PDF is READY FOR PRINTING${reset}`);
  } else {
    console.log(`\n${color}✗ This PDF is NOT READY - please address critical issues${reset}`);
  }

  console.log('\n');
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { parseArgs, main };
