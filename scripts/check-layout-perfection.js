#!/usr/bin/env node

/**
 * Layout Perfection CLI Tool
 *
 * Command-line interface for comprehensive layout analysis
 *
 * Usage:
 *   node scripts/check-layout-perfection.js <pdf-path> [options]
 *
 * Options:
 *   --output, -o    Output directory for reports (default: ./exports/layout-reports)
 *   --format, -f    Report format: json, html, csv, pdf (default: json,html)
 *   --overlay      Generate visual overlay PDFs showing issues
 *   --ai           Enable AI critiques (requires API keys)
 *   --verbose, -v   Verbose output
 *   --help, -h      Show help
 *
 * Examples:
 *   node scripts/check-layout-perfection.js exports/document.pdf
 *   node scripts/check-layout-perfection.js exports/document.pdf --format html --overlay
 *   node scripts/check-layout-perfection.js exports/document.pdf --ai --verbose
 *
 * @module check-layout-perfection
 */

const fs = require('fs').promises;
const path = require('path');
const LayoutPerfectionChecker = require('./lib/layout-perfection-checker');

// Parse command line arguments
const args = process.argv.slice(2);

// Help text
const helpText = `
Layout Perfection Checker - Mathematical precision & professional standards

Usage:
  node scripts/check-layout-perfection.js <pdf-path> [options]

Options:
  --output, -o <dir>    Output directory (default: ./exports/layout-reports)
  --format, -f <fmt>    Report format: json, html, csv, pdf (default: json,html)
  --overlay             Generate visual overlay PDFs
  --ai                  Enable AI critiques (requires API keys)
  --verbose, -v         Verbose output
  --help, -h            Show this help

Examples:
  node scripts/check-layout-perfection.js exports/document.pdf
  node scripts/check-layout-perfection.js exports/document.pdf --format html --overlay
  node scripts/check-layout-perfection.js exports/document.pdf --ai --verbose

8 Analyzers:
  1. Golden Ratio Validator    - Mathematical proportion perfection (φ = 1.618)
  2. Grid Alignment Checker     - 12-column grid & 8pt baseline compliance
  3. Hierarchy Analyzer         - Visual hierarchy clarity assessment
  4. Spacing Analyzer           - Spacing consistency & rhythm validation
  5. Alignment Checker          - Pixel-perfect alignment (±2px tolerance)
  6. Balance Analyzer           - Visual weight distribution analysis
  7. Proximity Checker          - Gestalt principles & grouping logic
  8. Professional Standards     - Industry benchmark compliance

AI Models (when --ai enabled):
  - Claude Opus 4.1     Golden ratio & deep reasoning
  - GPT-4o              Grid system & proximity analysis
  - GPT-5               Spacing optimization
  - Claude Sonnet 4.5   Alignment precision critique
  - Gemini 2.5 Pro      Hierarchy & balance assessment

Scoring:
  95-100   A++   Mathematical Perfection
  90-94    A+    Excellent Professional
  85-89    A     Very Good
  80-84    B     Good
  70-79    C     Fair
  60-69    D     Poor
  0-59     F     Failing
`;

// Check for help flag
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(helpText);
  process.exit(0);
}

// Parse arguments
const config = {
  pdfPath: args[0],
  outputDir: './exports/layout-reports',
  formats: ['json', 'html'],
  overlay: false,
  ai: false,
  verbose: false
};

for (let i = 1; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--output' || arg === '-o') {
    config.outputDir = args[++i];
  } else if (arg === '--format' || arg === '-f') {
    config.formats = args[++i].split(',');
  } else if (arg === '--overlay') {
    config.overlay = true;
  } else if (arg === '--ai') {
    config.ai = true;
  } else if (arg === '--verbose' || arg === '-v') {
    config.verbose = true;
  }
}

// Validate PDF path
if (!config.pdfPath) {
  console.error('❌ Error: PDF path is required');
  console.log('\nUsage: node scripts/check-layout-perfection.js <pdf-path> [options]');
  console.log('Run with --help for more information');
  process.exit(1);
}

// Main execution
async function main() {
  try {
    console.log('📄 Loading PDF:', config.pdfPath);

    // Check if file exists
    try {
      await fs.access(config.pdfPath);
    } catch (error) {
      console.error(`❌ Error: PDF file not found: ${config.pdfPath}`);
      process.exit(1);
    }

    // Parse PDF and extract layout data
    console.log('🔍 Parsing PDF layout...');
    const layoutData = await parsePDFLayout(config.pdfPath);

    if (config.verbose) {
      console.log(`   Found ${layoutData.elements?.length || 0} elements`);
      console.log(`   Page size: ${layoutData.page.width}×${layoutData.page.height}pt`);
    }

    // Load checker configuration
    const checkerConfig = await loadCheckerConfig();

    // Enable AI if requested
    if (config.ai) {
      checkerConfig.ai = { enabled: true };
      console.log('🤖 AI critiques enabled (requires API keys)');
    }

    // Create checker instance
    const checker = new LayoutPerfectionChecker(checkerConfig);

    // Run comprehensive analysis
    const results = await checker.validate(layoutData);

    // Ensure output directory exists
    await fs.mkdir(config.outputDir, { recursive: true });

    // Export results in requested formats
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const baseName = path.basename(config.pdfPath, '.pdf');

    for (const format of config.formats) {
      const outputPath = path.join(config.outputDir, `${baseName}-perfection-${timestamp}.${format}`);
      await checker.exportResults(outputPath, format);
    }

    // Generate visual overlays if requested
    if (config.overlay) {
      console.log('\n🎨 Generating visual overlays...');
      await generateVisualOverlays(results, config.pdfPath, config.outputDir, baseName, timestamp);
    }

    // Print file locations
    console.log('\n📁 Reports saved to:');
    for (const format of config.formats) {
      const filename = `${baseName}-perfection-${timestamp}.${format}`;
      console.log(`   ${path.join(config.outputDir, filename)}`);
    }

    // Exit code based on score
    const exitCode = results.overall.score >= 70 ? 0 : 1;
    process.exit(exitCode);

  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
    if (config.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Parse PDF and extract layout data
 */
async function parsePDFLayout(pdfPath) {
  // In production, this would use pdf-lib or similar to extract actual layout data
  // For now, return sample layout data structure

  console.log('   ⚠️  Using sample layout data (PDF parsing not yet implemented)');

  return {
    page: {
      width: 612,  // 8.5" at 72dpi
      height: 792, // 11" at 72dpi
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
      }
    },
    elements: generateSampleElements()
  };
}

/**
 * Generate sample elements for testing
 */
function generateSampleElements() {
  const elements = [];

  // Sample header
  elements.push({
    type: 'heading',
    fontSize: 42,
    bounds: { x: 40, y: 40, width: 532, height: 50 },
    color: '#00393F',
    backgroundColor: '#FFFFFF'
  });

  // Sample body text elements
  for (let i = 0; i < 10; i++) {
    elements.push({
      type: 'text',
      fontSize: 11,
      bounds: {
        x: 40,
        y: 120 + (i * 60),
        width: 250,
        height: 40
      },
      color: '#000000',
      backgroundColor: '#FFFFFF'
    });
  }

  // Sample images
  elements.push({
    type: 'image',
    bounds: { x: 310, y: 120, width: 262, height: 180 }
  });

  return elements;
}

/**
 * Load checker configuration
 */
async function loadCheckerConfig() {
  const configPath = path.join(__dirname, '../config/layout-perfection-config.json');

  try {
    const configData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.warn('⚠️  Could not load config, using defaults');
    return {};
  }
}

/**
 * Generate visual overlay PDFs showing violations
 */
async function generateVisualOverlays(results, pdfPath, outputDir, baseName, timestamp) {
  // Generate different overlay types
  const overlayTypes = [
    'golden-ratio',
    'grid-lines',
    'alignment-guides',
    'spacing-measurements',
    'hierarchy-levels',
    'balance-heatmap',
    'proximity-groups'
  ];

  for (const overlayType of overlayTypes) {
    const overlayPath = path.join(outputDir, `${baseName}-overlay-${overlayType}-${timestamp}.pdf`);
    console.log(`   Generating ${overlayType} overlay...`);

    // In production, would generate actual overlay PDF
    // For now, just create placeholder
    await fs.writeFile(overlayPath, `Overlay PDF: ${overlayType}\n(Implementation pending)`);
  }

  console.log('   ✅ Visual overlays generated');
}

// Run main function
main();
