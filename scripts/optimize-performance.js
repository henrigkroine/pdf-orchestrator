#!/usr/bin/env node

/**
 * PDF Performance Optimization CLI Tool
 *
 * Usage:
 *   node scripts/optimize-performance.js <pdf-path> [options]
 *
 * Options:
 *   --preset <name>      Optimization preset (aggressive, balanced, conservative, web, print, archive)
 *   --output <path>      Output file path (default: <input>-optimized-<preset>.pdf)
 *   --verbose            Show detailed optimization progress
 *   --report <path>      Save optimization report to file
 *   --ai                 Enable AI-powered optimization recommendations
 *   --no-ai              Disable AI recommendations
 *   --help               Show help message
 *
 * Examples:
 *   # Balanced optimization (default)
 *   node scripts/optimize-performance.js document.pdf
 *
 *   # Aggressive web optimization
 *   node scripts/optimize-performance.js document.pdf --preset web
 *
 *   # Print-optimized with custom output
 *   node scripts/optimize-performance.js document.pdf --preset print --output optimized.pdf
 *
 *   # With AI recommendations
 *   node scripts/optimize-performance.js document.pdf --ai --verbose
 */

const fs = require('fs').promises;
const path = require('path');
const PerformanceOptimizer = require('./lib/performance-optimizer');

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

/**
 * Parse command-line arguments
 */
function parseArgs(args) {
  const options = {
    pdfPath: null,
    preset: 'balanced',
    outputPath: null,
    verbose: false,
    reportPath: null,
    aiEnabled: true,
    showHelp: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.showHelp = true;
    } else if (arg === '--preset' || arg === '-p') {
      options.preset = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      options.outputPath = args[++i];
    } else if (arg === '--report' || arg === '-r') {
      options.reportPath = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--ai') {
      options.aiEnabled = true;
    } else if (arg === '--no-ai') {
      options.aiEnabled = false;
    } else if (!arg.startsWith('--') && !options.pdfPath) {
      options.pdfPath = arg;
    }
  }

  return options;
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${colorize('PDF Performance Optimization Tool', 'bright')}
${colorize('========================================', 'dim')}

${colorize('Usage:', 'cyan')}
  node scripts/optimize-performance.js <pdf-path> [options]

${colorize('Options:', 'cyan')}
  --preset <name>      Optimization preset
                       ${colorize('aggressive', 'yellow')}  - Maximum compression (60% reduction)
                       ${colorize('balanced', 'green')}    - Quality/size balance (40% reduction) [default]
                       ${colorize('conservative', 'blue')} - Minimal changes (20% reduction)
                       ${colorize('web', 'magenta')}         - Fast loading, 150 DPI
                       ${colorize('print', 'cyan')}       - High quality, 300 DPI
                       ${colorize('archive', 'yellow')}     - Maximum compatibility, PDF/A

  --output <path>      Output file path
                       Default: <input>-optimized-<preset>.pdf

  --verbose, -v        Show detailed optimization progress

  --report <path>      Save optimization report (JSON)
                       Default: <input>-optimization-report.json

  --ai                 Enable AI-powered recommendations [default]
  --no-ai              Disable AI recommendations

  --help, -h           Show this help message

${colorize('Examples:', 'cyan')}
  ${colorize('# Balanced optimization (default)', 'dim')}
  node scripts/optimize-performance.js document.pdf

  ${colorize('# Aggressive web optimization', 'dim')}
  node scripts/optimize-performance.js document.pdf --preset web --verbose

  ${colorize('# Print-optimized with custom output', 'dim')}
  node scripts/optimize-performance.js document.pdf --preset print --output optimized.pdf

  ${colorize('# With AI recommendations and detailed report', 'dim')}
  node scripts/optimize-performance.js document.pdf --ai --report report.json --verbose

${colorize('Optimization Presets:', 'cyan')}
  ${colorize('aggressive', 'yellow')}  - Smallest file size, acceptable quality loss
                 Image quality: 75, DPI: 150
                 Target reduction: 60%

  ${colorize('balanced', 'green')}    - Good compression, minimal quality loss [RECOMMENDED]
                 Image quality: 85, DPI: 200
                 Target reduction: 40%

  ${colorize('conservative', 'blue')} - Safe optimization, maximum quality preservation
                 Image quality: 95, DPI: 300
                 Target reduction: 20%

  ${colorize('web', 'magenta')}         - Optimized for web viewing
                 Image quality: 80, DPI: 150, RGB
                 Target: <3s loading on 4G

  ${colorize('print', 'cyan')}       - Optimized for print output
                 Image quality: 90, DPI: 300, CMYK
                 Target reduction: 25%

  ${colorize('archive', 'yellow')}     - Maximum compatibility (PDF 1.4)
                 Image quality: 95, DPI: 300
                 PDF/A compliance, all fonts embedded

${colorize('AI Models:', 'cyan')}
  ${colorize('GPT-4o', 'green')}           - File size optimization strategy
  ${colorize('GPT-5', 'green')}            - Rendering optimization
  ${colorize('Claude Opus 4.1', 'magenta')}  - Loading strategy and compatibility
  ${colorize('Claude Sonnet 4.5', 'magenta')} - Font optimization
  ${colorize('Gemini 2.5 Pro', 'cyan')}    - Image quality assessment

${colorize('Environment Variables:', 'cyan')}
  OPENAI_API_KEY      - OpenAI API key (for GPT-4o, GPT-5)
  ANTHROPIC_API_KEY   - Anthropic API key (for Claude)
  GOOGLE_API_KEY      - Google API key (for Gemini)

${colorize('Performance Scores:', 'cyan')}
  ${colorize('95-100', 'green')} - Excellent (highly optimized)
  ${colorize('90-94', 'cyan')}  - Very good (minor improvements possible)
  ${colorize('85-89', 'blue')}  - Good (some optimization opportunities)
  ${colorize('75-84', 'yellow')} - Fair (multiple improvements recommended)
  ${colorize('60-74', 'yellow')} - Below average (significant optimization needed)
  ${colorize('<60', 'red')}    - Poor (major performance issues)

${colorize('More Information:', 'cyan')}
  docs/PERFORMANCE-OPTIMIZATION-GUIDE.md
  docs/PERFORMANCE-BENCHMARKS.md
  docs/OPTIMIZATION-PRESETS.md
`);
}

/**
 * Validate options
 */
async function validateOptions(options) {
  const errors = [];

  // Check PDF file
  if (!options.pdfPath) {
    errors.push('PDF file path is required');
  } else {
    try {
      await fs.access(options.pdfPath);
    } catch (error) {
      errors.push(`PDF file not found: ${options.pdfPath}`);
    }
  }

  // Check preset
  const validPresets = ['aggressive', 'balanced', 'conservative', 'web', 'print', 'archive'];
  if (!validPresets.includes(options.preset)) {
    errors.push(`Invalid preset: ${options.preset}. Valid presets: ${validPresets.join(', ')}`);
  }

  return errors;
}

/**
 * Format performance score with color
 */
function formatScore(score) {
  let color = 'red';
  if (score >= 95) color = 'green';
  else if (score >= 90) color = 'cyan';
  else if (score >= 85) color = 'blue';
  else if (score >= 75) color = 'yellow';

  return colorize(score.toFixed(1), color);
}

/**
 * Print performance summary
 */
function printPerformanceSummary(baseline, optimized) {
  console.log(`\n${colorize('Performance Summary', 'bright')}`);
  console.log(colorize('===================', 'dim'));

  const categories = [
    { name: 'Overall', key: 'overallScore' },
    { name: 'File Size', key: 'fileSizeScore' },
    { name: 'Loading', key: 'loadingScore' },
    { name: 'Rendering', key: 'renderingScore' },
    { name: 'Images', key: 'imageOptimizationScore' },
    { name: 'Fonts', key: 'fontOptimizationScore' }
  ];

  categories.forEach(({ name, key }) => {
    const before = baseline[key] || 0;
    const after = optimized[key] || 0;
    const improvement = after - before;
    const arrow = improvement > 0 ? '↑' : improvement < 0 ? '↓' : '→';
    const improvementStr = improvement !== 0 ? `${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}` : '0.0';

    console.log(
      `  ${name.padEnd(10)} ${formatScore(before)} → ${formatScore(after)} ` +
      `${colorize(arrow, improvement > 0 ? 'green' : improvement < 0 ? 'red' : 'dim')} ` +
      `${colorize(improvementStr, improvement > 0 ? 'green' : 'dim')}`
    );
  });
}

/**
 * Print loading time comparison
 */
function printLoadingTimes(report) {
  console.log(`\n${colorize('Loading Time Estimates', 'bright')}`);
  console.log(colorize('======================', 'dim'));

  ['3G', '4G', 'wifi'].forEach(network => {
    const before = report.loadingEstimates.before[network];
    const after = report.loadingEstimates.after[network];

    if (before && after) {
      const beforeMs = before.estimatedMs;
      const afterMs = after.estimatedMs;
      const improvement = ((beforeMs - afterMs) / beforeMs) * 100;

      console.log(
        `  ${network.padEnd(6)} ${formatTime(beforeMs)} → ${formatTime(afterMs)} ` +
        `${colorize(`(-${improvement.toFixed(1)}%)`, 'green')}`
      );
    }
  });
}

/**
 * Format time in ms/s
 */
function formatTime(ms) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else {
    return `${(ms / 1000).toFixed(1)}s`;
  }
}

/**
 * Print AI recommendations
 */
function printAIRecommendations(recommendations) {
  if (!recommendations || recommendations.length === 0) {
    return;
  }

  console.log(`\n${colorize('AI Optimization Recommendations', 'bright')}`);
  console.log(colorize('================================', 'dim'));

  recommendations.forEach((rec, index) => {
    console.log(`\n${colorize(`${index + 1}. ${rec.category.toUpperCase()}`, 'cyan')} (${rec.model})`);
    if (rec.recommendations) {
      console.log(colorize(rec.recommendations.split('\n').slice(0, 5).join('\n'), 'dim'));
    }
  });
}

/**
 * Save optimization report
 */
async function saveReport(report, reportPath) {
  try {
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${colorize('✓', 'green')} Report saved: ${colorize(reportPath, 'cyan')}`);
  } catch (error) {
    console.error(`${colorize('✗', 'red')} Error saving report: ${error.message}`);
  }
}

/**
 * Format bytes
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // Show help
  if (options.showHelp || args.length === 0) {
    showHelp();
    process.exit(0);
  }

  // Validate options
  const errors = await validateOptions(options);
  if (errors.length > 0) {
    console.error(colorize('Errors:', 'red'));
    errors.forEach(error => console.error(`  ${colorize('✗', 'red')} ${error}`));
    console.log(`\nUse ${colorize('--help', 'cyan')} for usage information`);
    process.exit(1);
  }

  console.log(colorize('\n╔══════════════════════════════════════════════╗', 'cyan'));
  console.log(colorize('║  PDF Performance Optimization Tool          ║', 'cyan'));
  console.log(colorize('║  Multi-Model AI Integration                 ║', 'cyan'));
  console.log(colorize('╚══════════════════════════════════════════════╝', 'cyan'));

  console.log(`\n${colorize('Input:', 'bright')}     ${options.pdfPath}`);
  console.log(`${colorize('Preset:', 'bright')}    ${colorize(options.preset, 'green')}`);
  if (options.aiEnabled) {
    console.log(`${colorize('AI:', 'bright')}       ${colorize('Enabled', 'green')} (GPT-4o, GPT-5, Claude, Gemini)`);
  } else {
    console.log(`${colorize('AI:', 'bright')}       ${colorize('Disabled', 'dim')}`);
  }

  try {
    // Create optimizer
    const optimizer = new PerformanceOptimizer({
      preset: options.preset,
      verbose: options.verbose,
      aiAssistance: options.aiEnabled ? 'full' : 'none'
    });

    // Optimize
    const result = await optimizer.optimize(options.pdfPath, options.outputPath);

    if (!result.success) {
      throw new Error('Optimization failed');
    }

    // Print summary
    console.log(colorize('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green'));
    console.log(colorize('  Optimization Complete', 'bright'));
    console.log(colorize('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'green'));

    console.log(`\n${colorize('File Size:', 'bright')}`);
    console.log(`  Original:  ${formatBytes(result.metrics.originalSize)}`);
    console.log(`  Optimized: ${formatBytes(result.metrics.optimizedSize)}`);
    console.log(`  Reduced:   ${colorize(formatBytes(result.metrics.reductionBytes), 'green')} ` +
                `${colorize(`(-${result.metrics.reductionPercent.toFixed(1)}%)`, 'green')}`);

    // Performance summary
    printPerformanceSummary(result.baselineAnalysis, result.optimizedAnalysis);

    // Loading times
    printLoadingTimes(result.report);

    // AI recommendations
    if (options.aiEnabled && result.metrics.aiRecommendations) {
      printAIRecommendations(result.metrics.aiRecommendations);
    }

    console.log(`\n${colorize('Output:', 'bright')}    ${colorize(result.outputPath, 'cyan')}`);
    console.log(`${colorize('Duration:', 'bright')}  ${(result.metrics.duration / 1000).toFixed(2)}s`);

    // Save report
    if (options.reportPath || options.verbose) {
      const reportPath = options.reportPath ||
        options.pdfPath.replace(/\.pdf$/i, '-optimization-report.json');
      await saveReport(result.report, reportPath);
    }

    console.log(colorize('\n✓ Success!', 'green'));
    process.exit(0);

  } catch (error) {
    console.error(colorize('\n✗ Error:', 'red'), error.message);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error(colorize('Fatal error:', 'red'), error.message);
    process.exit(1);
  });
}

module.exports = { main, parseArgs, validateOptions };
