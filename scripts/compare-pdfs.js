#!/usr/bin/env node
/**
 * Compare PDFs - CLI Tool for Comprehensive PDF Comparison
 *
 * Usage:
 *   node scripts/compare-pdfs.js <pdf1> <pdf2> [options]
 *
 * Options:
 *   --visual          Include visual comparison
 *   --content         Include content comparison
 *   --quality         Include quality comparison
 *   --benchmark       Compare against benchmarks
 *   --all             Include all comparison types (default)
 *   --output <dir>    Output directory for reports
 *   --format <fmt>    Report format: html, pdf, json, markdown (default: html,json)
 *   --ai              Enable AI insights (default: true)
 *   --no-ai           Disable AI insights
 *
 * Examples:
 *   node scripts/compare-pdfs.js v1.pdf v2.pdf
 *   node scripts/compare-pdfs.js v1.pdf v2.pdf --visual --content
 *   node scripts/compare-pdfs.js v1.pdf v2.pdf --output ./reports --format html,pdf
 *
 * @module compare-pdfs
 */

const fs = require('fs').promises;
const path = require('path');
const { ComparativeAnalyzer, AnalysisDepth } = require('./lib/comparative-analyzer');

// Parse command line arguments
function parseArgs(args) {
  const options = {
    pdf1: null,
    pdf2: null,
    categories: [],
    outputDir: path.join(__dirname, '../comparisons'),
    formats: ['html', 'json'],
    enableAI: true,
    depth: AnalysisDepth.COMPREHENSIVE
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      switch (arg) {
        case '--visual':
          options.categories.push('visual');
          break;
        case '--content':
          options.categories.push('content');
          break;
        case '--layout':
          options.categories.push('layout');
          break;
        case '--color':
          options.categories.push('color');
          break;
        case '--font':
          options.categories.push('font');
          break;
        case '--image':
          options.categories.push('image');
          break;
        case '--quality':
          options.includeQuality = true;
          break;
        case '--benchmark':
          options.includeBenchmark = true;
          break;
        case '--all':
          options.categories = ['visual', 'content', 'layout', 'color', 'font', 'image'];
          break;
        case '--output':
          options.outputDir = args[++i];
          break;
        case '--format':
          options.formats = args[++i].split(',');
          break;
        case '--ai':
          options.enableAI = true;
          break;
        case '--no-ai':
          options.enableAI = false;
          break;
        case '--quick':
          options.depth = AnalysisDepth.QUICK;
          break;
        case '--deep':
          options.depth = AnalysisDepth.DEEP;
          break;
        case '--help':
        case '-h':
          printHelp();
          process.exit(0);
      }
    } else {
      if (!options.pdf1) {
        options.pdf1 = arg;
      } else if (!options.pdf2) {
        options.pdf2 = arg;
      }
    }
  }

  // Default to all categories if none specified
  if (options.categories.length === 0) {
    options.categories = ['visual', 'content', 'layout', 'color', 'font', 'image'];
  }

  return options;
}

function printHelp() {
  console.log(`
PDF Comparison Tool
===================

Usage:
  node scripts/compare-pdfs.js <pdf1> <pdf2> [options]

Arguments:
  <pdf1>              Path to baseline PDF
  <pdf2>              Path to test PDF

Options:
  --visual            Include visual comparison (pixel-perfect)
  --content           Include content comparison (text diff)
  --layout            Include layout comparison (element positions)
  --color             Include color comparison (palette analysis)
  --font              Include font comparison (typography)
  --image             Include image comparison (image diff)
  --quality           Include quality analysis
  --benchmark         Compare against benchmarks
  --all               Include all comparison types (default)

  --output <dir>      Output directory for reports (default: ./comparisons)
  --format <formats>  Report formats: html, pdf, json, markdown (default: html,json)
                      Multiple formats: --format html,pdf,json

  --ai                Enable AI insights (default)
  --no-ai             Disable AI insights

  --quick             Quick comparison (visual + content only)
  --deep              Deep analysis (all features + AI insights)

  --help, -h          Show this help message

Examples:
  # Basic comparison
  node scripts/compare-pdfs.js version1.pdf version2.pdf

  # Visual and content comparison only
  node scripts/compare-pdfs.js v1.pdf v2.pdf --visual --content

  # Full comparison with benchmarking
  node scripts/compare-pdfs.js v1.pdf v2.pdf --all --benchmark

  # Custom output and formats
  node scripts/compare-pdfs.js v1.pdf v2.pdf --output ./reports --format html,pdf

  # Quick comparison without AI
  node scripts/compare-pdfs.js v1.pdf v2.pdf --quick --no-ai

Output:
  Reports are saved to the output directory in the specified formats.
  Default output: ./comparisons/

Report Contents:
  - Executive summary
  - Comparison overview
  - Detailed changes (by category)
  - Quality score comparison
  - AI-powered insights
  - Recommendations
  - Statistical analysis
  `);
}

function printProgress(message) {
  console.log(`\n${message}`);
}

function printError(message) {
  console.error(`\n❌ Error: ${message}\n`);
}

function printSuccess(message) {
  console.log(`\n✅ ${message}\n`);
}

async function validatePDF(pdfPath) {
  try {
    const stats = await fs.stat(pdfPath);
    if (!stats.isFile()) {
      throw new Error(`Not a file: ${pdfPath}`);
    }
    if (path.extname(pdfPath).toLowerCase() !== '.pdf') {
      throw new Error(`Not a PDF file: ${pdfPath}`);
    }
    return true;
  } catch (error) {
    throw new Error(`Invalid PDF: ${pdfPath} - ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const options = parseArgs(args);

  // Validate inputs
  if (!options.pdf1 || !options.pdf2) {
    printError('Two PDF files required');
    printHelp();
    process.exit(1);
  }

  try {
    // Validate PDFs exist
    printProgress('Validating PDFs...');
    await validatePDF(options.pdf1);
    await validatePDF(options.pdf2);
    printSuccess(`PDFs validated: ${path.basename(options.pdf1)} vs ${path.basename(options.pdf2)}`);

    // Initialize analyzer
    printProgress('Initializing comparative analyzer...');
    const analyzer = new ComparativeAnalyzer({
      enableAI: options.enableAI,
      analysisDepth: options.depth,
      outputDir: options.outputDir,
      reportFormat: options.formats
    });

    // Set up event listeners for progress updates
    analyzer.on('comparison-start', (data) => {
      printProgress(`Starting comparison: ${data.pdf1} vs ${data.pdf2}`);
    });

    analyzer.on('phase-start', (data) => {
      printProgress(`  → ${data.phase}`);
    });

    analyzer.on('regressions-detected', (data) => {
      console.log(`  ⚠️  ${data.count} regression(s) detected`);
    });

    // Perform comparison
    printProgress('Performing comparison...');
    const startTime = Date.now();

    const results = await analyzer.compareVersions(options.pdf1, options.pdf2, {
      categories: options.categories,
      enableAI: options.enableAI
    });

    const duration = Date.now() - startTime;

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('COMPARISON SUMMARY');
    console.log('='.repeat(80));
    console.log(`\nDocuments:`);
    console.log(`  Baseline: ${results.documents.baseline.name}`);
    console.log(`  Test:     ${results.documents.test.name}`);
    console.log(`\nResults:`);
    console.log(`  Total Changes:       ${results.summary.totalChanges}`);
    console.log(`  Significant Changes: ${results.summary.significantChanges || 0}`);
    console.log(`  Quality Delta:       ${results.summary.qualityDelta >= 0 ? '+' : ''}${results.summary.qualityDelta?.toFixed(1) || 0}`);
    console.log(`  Baseline Grade:      ${results.summary.grade.baseline}`);
    console.log(`  Test Grade:          ${results.summary.grade.test}`);
    console.log(`  Regressions:         ${results.summary.regressionCount}`);
    console.log(`\nPerformance:`);
    console.log(`  Analysis Time:       ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(80));

    // Generate reports
    if (options.formats && options.formats.length > 0) {
      printProgress('Generating reports...');
      const reportResults = await analyzer.generateReport(results, {
        formats: options.formats,
        outputDir: options.outputDir
      });

      console.log('\nReports generated:');
      for (const [format, filepath] of Object.entries(reportResults.paths)) {
        console.log(`  ${format.toUpperCase()}: ${filepath}`);
      }

      printSuccess(`Comparison complete! Reports saved to: ${options.outputDir}`);
    }

    // Exit with appropriate code
    process.exit(results.summary.regressionCount > 0 ? 1 : 0);

  } catch (error) {
    printError(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
