#!/usr/bin/env node

/**
 * Prepare for Print - CLI Tool
 * Prepare PDFs for professional print production
 *
 * Usage:
 *   node scripts/prepare-for-print.js input.pdf [options]
 *
 * Options:
 *   --bleed <mm>        Add bleed (default: 3mm)
 *   --cmyk              Convert to CMYK
 *   --embed-fonts       Embed all fonts
 *   --crop-marks        Add crop marks
 *   --pdfx              Generate PDF/X-4
 *   --package           Create complete print package
 *   --preflight         Run preflight check only
 *   --output <path>     Output file path
 *   --force             Ignore validation errors
 */

const PrintProduction = require('./lib/print-production');
const PreflightChecker = require('./lib/preflight-checker');
const path = require('path');
const fs = require('fs').promises;

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const inputFile = args.find(arg => !arg.startsWith('--'));
if (!inputFile) {
  console.error('❌ Error: No input file specified');
  console.log('Usage: node scripts/prepare-for-print.js input.pdf [options]');
  process.exit(1);
}

// Parse options
const options = {
  bleed: parseOption('--bleed', 3),
  cmyk: args.includes('--cmyk'),
  embedFonts: args.includes('--embed-fonts'),
  cropMarks: args.includes('--crop-marks'),
  pdfx: args.includes('--pdfx'),
  package: args.includes('--package'),
  preflight: args.includes('--preflight'),
  output: parseOption('--output'),
  force: args.includes('--force')
};

// Main execution
(async () => {
  try {
    console.log('🖨️  TEEI Print Production Tool\n');

    // Check if input file exists
    try {
      await fs.access(inputFile);
    } catch (error) {
      console.error(`❌ Error: File not found: ${inputFile}`);
      process.exit(1);
    }

    // Preflight only mode
    if (options.preflight) {
      await runPreflight();
      process.exit(0);
    }

    // Create print package mode
    if (options.package) {
      await createPrintPackage();
      process.exit(0);
    }

    // Normal print preparation
    await preparePDF();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

/**
 * Run preflight check only
 */
async function runPreflight() {
  const checker = new PreflightChecker();
  const results = await checker.runPreflight(inputFile);

  // Export report
  const reportPath = inputFile.replace('.pdf', '-preflight-report.txt');
  await checker.exportReport(results, reportPath);

  process.exit(results.passed ? 0 : 1);
}

/**
 * Create complete print package
 */
async function createPrintPackage() {
  console.log('📦 Creating print-ready package...\n');

  const production = new PrintProduction();
  const result = await production.createPrintPackage(inputFile, {
    bleed: options.bleed,
    force: options.force
  });

  console.log('\n✅ Print package created successfully!');
  console.log(`\n📁 Package location: ${result.packageDir}`);
  console.log('\nContents:');
  console.log('  • PRINT-READY.pdf - Send this to your printer');
  console.log('  • SPECIFICATIONS.pdf - Print specifications sheet');
  console.log('  • production-report.json - Detailed technical report');
  console.log('  • README.txt - Instructions for printer');

  process.exit(0);
}

/**
 * Prepare PDF for print
 */
async function preparePDF() {
  const production = new PrintProduction();

  // Determine what operations to perform
  if (!options.cmyk && !options.embedFonts && !options.cropMarks && !options.pdfx) {
    // Default: do everything
    console.log('📋 Running complete print preparation (all steps)...\n');
    options.cmyk = true;
    options.embedFonts = true;
    options.cropMarks = true;
    options.pdfx = true;
  }

  const report = await production.optimizeForPrint(inputFile, {
    bleed: options.bleed,
    cropMarks: options.cropMarks,
    force: options.force,
    outputPath: options.output
  });

  if (report.ready) {
    console.log('\n✅ PDF successfully prepared for print!');
    console.log(`\n📄 Print-ready file: ${report.outputFile}`);

    // Save detailed report
    const reportPath = inputFile.replace('.pdf', '-production-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Report saved: ${reportPath}`);
  } else {
    console.log('\n❌ PDF preparation failed.');
    console.log('   Check the errors above and fix them.');
    console.log('   Or use --force to proceed anyway (not recommended).');
    process.exit(1);
  }
}

/**
 * Parse command line option
 */
function parseOption(flag, defaultValue) {
  const index = args.indexOf(flag);
  if (index === -1) return defaultValue;

  const value = args[index + 1];
  if (!value || value.startsWith('--')) return defaultValue;

  // Try to parse as number
  const num = parseFloat(value);
  return isNaN(num) ? value : num;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
🖨️  TEEI Print Production Tool

Prepare PDFs for professional print production with proper bleed, CMYK colors,
embedded fonts, crop marks, and PDF/X-4 compliance.

USAGE:
  node scripts/prepare-for-print.js <input.pdf> [options]

OPTIONS:
  --bleed <mm>        Add bleed area (default: 3mm)
  --cmyk              Convert RGB colors to CMYK
  --embed-fonts       Embed all fonts in PDF
  --crop-marks        Add crop marks and registration
  --pdfx              Generate PDF/X-4 compliant file
  --package           Create complete print-ready package
  --preflight         Run preflight check only (no modifications)
  --output <path>     Specify output file path
  --force             Proceed even with validation errors

EXAMPLES:

  # Run preflight check only (recommended first step)
  node scripts/prepare-for-print.js document.pdf --preflight

  # Prepare PDF with all optimizations (default)
  node scripts/prepare-for-print.js document.pdf

  # Add 5mm bleed instead of default 3mm
  node scripts/prepare-for-print.js document.pdf --bleed 5

  # Create complete print package (best for sending to printer)
  node scripts/prepare-for-print.js document.pdf --package

  # Convert to CMYK only
  node scripts/prepare-for-print.js document.pdf --cmyk

  # Full custom workflow
  node scripts/prepare-for-print.js document.pdf --bleed 3 --cmyk --crop-marks --pdfx

PRINT PACKAGE:
  The --package option creates a folder with everything your printer needs:
  • PRINT-READY.pdf - Final PDF with all optimizations
  • SPECIFICATIONS.pdf - Print specs sheet
  • production-report.json - Technical details
  • README.txt - Instructions

REQUIREMENTS:
  Optional but recommended:
  • GhostScript - For CMYK conversion and PDF/X-4 generation
  • poppler-utils - For preflight checks (pdffonts, pdfimages)

  Install on Ubuntu/Debian:
    sudo apt-get install ghostscript poppler-utils

  Install on macOS:
    brew install ghostscript poppler

PRINT SPECIFICATIONS:
  • Bleed: 3mm standard (customizable)
  • Color Mode: CMYK
  • Resolution: 300 DPI minimum
  • Fonts: All embedded
  • Format: PDF/X-4
  • Crop Marks: Included

WORKFLOW:
  1. Run preflight check:
     node scripts/prepare-for-print.js document.pdf --preflight

  2. Fix any critical issues reported

  3. Create print package:
     node scripts/prepare-for-print.js document.pdf --package

  4. Send PRINT-READY.pdf to your printer

For more information, see: docs/PRINT-PRODUCTION-GUIDE.md
`);
}
