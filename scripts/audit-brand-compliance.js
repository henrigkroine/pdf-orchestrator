#!/usr/bin/env node

/**
 * TEEI Brand Compliance Audit CLI
 *
 * Command-line tool for comprehensive brand compliance auditing of PDFs.
 * Validates against TEEI brand guidelines across 6 major categories using
 * multi-model AI (GPT-5, Claude Opus 4, Gemini 2.5 Pro).
 *
 * Usage:
 *   node scripts/audit-brand-compliance.js <pdf-path> [options]
 *
 * Options:
 *   --output-dir <dir>        Output directory for reports (default: exports/compliance-audits)
 *   --skip-color             Skip color compliance check
 *   --skip-typography        Skip typography compliance check
 *   --skip-logo              Skip logo usage check
 *   --skip-spacing           Skip spacing & layout check
 *   --skip-brand-voice       Skip brand voice analysis
 *   --skip-photography       Skip photography compliance check
 *   --format <format>        Output format: html,json,csv,pdf,all (default: all)
 *   --verbose                Verbose logging
 *   --help                   Show help
 *
 * Examples:
 *   # Full audit with all formats
 *   node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf
 *
 *   # Quick audit (skip AI-heavy checks)
 *   node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --skip-brand-voice --skip-photography
 *
 *   # HTML report only
 *   node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --format html
 *
 *   # Custom output directory
 *   node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --output-dir reports/audits
 *
 * @module audit-brand-compliance
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const BrandComplianceAuditor = require('./lib/brand-compliance-auditor');

// Parse command line arguments
program
  .name('audit-brand-compliance')
  .description('TEEI Brand Compliance Audit - AI-powered PDF validation')
  .argument('<pdf-path>', 'Path to PDF file to audit')
  .option('--output-dir <dir>', 'Output directory for reports', 'exports/compliance-audits')
  .option('--skip-color', 'Skip color compliance check')
  .option('--skip-typography', 'Skip typography compliance check')
  .option('--skip-logo', 'Skip logo usage check')
  .option('--skip-spacing', 'Skip spacing & layout check')
  .option('--skip-brand-voice', 'Skip brand voice analysis')
  .option('--skip-photography', 'Skip photography compliance check')
  .option('--format <format>', 'Output format: html,json,csv,pdf,all', 'all')
  .option('--verbose', 'Verbose logging')
  .parse(process.argv);

const options = program.opts();
const pdfPath = program.args[0];

/**
 * Main execution
 */
async function main() {
  try {
    // Validate input
    if (!pdfPath) {
      console.error('❌ Error: PDF path is required');
      console.log('\nUsage: node scripts/audit-brand-compliance.js <pdf-path> [options]');
      console.log('Run with --help for more information');
      process.exit(1);
    }

    // Check if PDF exists
    try {
      await fs.access(pdfPath);
    } catch (err) {
      console.error(`❌ Error: PDF file not found: ${pdfPath}`);
      process.exit(1);
    }

    // Resolve paths
    const absolutePdfPath = path.resolve(pdfPath);
    const configPath = path.resolve(__dirname, '../config/brand-compliance-config.json');

    // Check if config exists
    try {
      await fs.access(configPath);
    } catch (err) {
      console.error(`❌ Error: Config file not found: ${configPath}`);
      process.exit(1);
    }

    // Create output directory
    const outputDir = path.resolve(options.outputDir);
    await fs.mkdir(outputDir, { recursive: true });

    // Generate timestamp for output files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const baseName = path.basename(absolutePdfPath, '.pdf');
    const outputBase = path.join(outputDir, `${baseName}-audit-${timestamp}`);

    // Initialize auditor
    console.log('🚀 Initializing TEEI Brand Compliance Auditor...\n');
    const auditor = new BrandComplianceAuditor(configPath);

    // Run audit
    const auditOptions = {
      skipColor: options.skipColor,
      skipTypography: options.skipTypography,
      skipLogo: options.skipLogo,
      skipSpacing: options.skipSpacing,
      skipBrandVoice: options.skipBrandVoice,
      skipPhotography: options.skipPhotography,
      verbose: options.verbose
    };

    const results = await auditor.auditPDF(absolutePdfPath, auditOptions);

    // Generate outputs based on format option
    const formats = options.format === 'all'
      ? ['html', 'json', 'csv']
      : options.format.split(',');

    console.log('\n📦 Generating output reports...\n');

    if (formats.includes('html')) {
      const htmlPath = `${outputBase}.html`;
      await auditor.generateDashboard(results, htmlPath);
      console.log(`  ✅ HTML Dashboard: ${htmlPath}`);
    }

    if (formats.includes('json')) {
      const jsonPath = `${outputBase}.json`;
      await auditor.exportToJSON(results, jsonPath);
      console.log(`  ✅ JSON Report: ${jsonPath}`);
    }

    if (formats.includes('csv')) {
      const csvPath = `${outputBase}.csv`;
      await auditor.exportToCSV(results, csvPath);
      console.log(`  ✅ CSV Report: ${csvPath}`);
    }

    if (formats.includes('pdf')) {
      const annotatedPdfPath = `${outputBase}-annotated.pdf`;
      await auditor.generateAnnotatedPDF(results, absolutePdfPath, annotatedPdfPath);
      console.log(`  ✅ Annotated PDF: ${annotatedPdfPath}`);
    }

    // Print final summary
    console.log('\n' + '='.repeat(80));
    console.log('✨ AUDIT COMPLETE');
    console.log('='.repeat(80));
    console.log(`\nOverall Score: ${results.overallScore}/100 (Grade: ${results.grade})`);
    console.log(`Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Violations: ${results.violations.length} (${results.violations.filter(v => v.severity === 'critical').length} critical)`);
    console.log(`\nReports saved to: ${outputDir}`);

    // Exit with appropriate code
    process.exit(results.passed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run main function
main();
