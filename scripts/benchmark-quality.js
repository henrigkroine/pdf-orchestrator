#!/usr/bin/env node
/**
 * Benchmark Quality - CLI Tool for Quality Benchmarking
 *
 * Usage:
 *   node scripts/benchmark-quality.js <pdf-path> [options]
 *
 * Options:
 *   --target <grade>  Target grade (A+, A, A-, B+, etc.) (default: A+)
 *   --output <dir>    Output directory for reports
 *   --format <fmt>    Report format: html, pdf, json, markdown
 *   --roadmap         Generate improvement roadmap
 *   --ai              Enable AI insights (default: true)
 *
 * @module benchmark-quality
 */

const fs = require('fs').promises;
const path = require('path');
const { ComparativeAnalyzer } = require('./lib/comparative-analyzer');

function parseArgs(args) {
  const options = {
    pdfPath: null,
    targetGrade: 'A+',
    outputDir: path.join(__dirname, '../benchmarks/reports'),
    formats: ['html', 'json'],
    generateRoadmap: false,
    enableAI: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      switch (arg) {
        case '--target':
          options.targetGrade = args[++i];
          break;
        case '--output':
          options.outputDir = args[++i];
          break;
        case '--format':
          options.formats = args[++i].split(',');
          break;
        case '--roadmap':
          options.generateRoadmap = true;
          break;
        case '--ai':
          options.enableAI = true;
          break;
        case '--no-ai':
          options.enableAI = false;
          break;
        case '--help':
        case '-h':
          printHelp();
          process.exit(0);
      }
    } else {
      if (!options.pdfPath) {
        options.pdfPath = arg;
      }
    }
  }

  return options;
}

function printHelp() {
  console.log(`
PDF Quality Benchmarking Tool
==============================

Usage:
  node scripts/benchmark-quality.js <pdf-path> [options]

Arguments:
  <pdf-path>          Path to PDF to benchmark

Options:
  --target <grade>    Target grade: A+, A, A-, B+, B, etc. (default: A+)
  --output <dir>      Output directory (default: ./benchmarks/reports)
  --format <formats>  Report formats: html, pdf, json, markdown
  --roadmap           Generate improvement roadmap
  --ai                Enable AI insights (default)
  --no-ai             Disable AI insights
  --help, -h          Show this help

Examples:
  # Benchmark against A+ standard
  node scripts/benchmark-quality.js document.pdf

  # Benchmark against A standard with roadmap
  node scripts/benchmark-quality.js document.pdf --target A --roadmap

  # Custom output
  node scripts/benchmark-quality.js document.pdf --output ./reports --format html,pdf

Output:
  - Current quality grade and score
  - Target grade and required score
  - Gap analysis (what's missing)
  - Improvement roadmap (if requested)
  - AI-powered insights
  `);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const options = parseArgs(args);

  if (!options.pdfPath) {
    console.error('\n❌ Error: PDF path required\n');
    printHelp();
    process.exit(1);
  }

  try {
    // Validate PDF
    console.log('\n🔍 Validating PDF...');
    const stats = await fs.stat(options.pdfPath);
    if (!stats.isFile() || path.extname(options.pdfPath).toLowerCase() !== '.pdf') {
      throw new Error('Invalid PDF file');
    }

    console.log('✅ PDF validated');

    // Initialize analyzer
    console.log('\n📊 Initializing benchmarking system...');
    const analyzer = new ComparativeAnalyzer({
      enableAI: options.enableAI,
      targetGrade: options.targetGrade,
      outputDir: options.outputDir
    });

    // Perform benchmarking
    console.log(`\n🎯 Benchmarking against ${options.targetGrade} standard...`);
    const results = await analyzer.benchmarkQuality(options.pdfPath, {
      targetGrade: options.targetGrade
    });

    // Print results
    console.log('\n' + '='.repeat(80));
    console.log('BENCHMARK RESULTS');
    console.log('='.repeat(80));
    console.log(`\nDocument: ${results.document.name}`);
    console.log(`\nCurrent Performance:`);
    console.log(`  Grade:  ${results.currentGrade}`);
    console.log(`  Score:  ${results.score.toFixed(1)}/100`);
    console.log(`\nTarget Performance:`);
    console.log(`  Grade:  ${results.targetGrade}`);
    console.log(`  Score:  ${results.targetScore}/100`);
    console.log(`  Gap:    ${results.gap.toFixed(1)} points`);

    console.log(`\nStrength Areas (${results.summary.strengthAreas.length}):`);
    results.summary.strengthAreas.slice(0, 5).forEach(area => {
      console.log(`  ✓ ${area.replace('_', ' ')}`);
    });

    console.log(`\nImprovement Areas (${results.summary.improvementAreas.length}):`);
    results.summary.improvementAreas.slice(0, 5).forEach(area => {
      console.log(`  ⚠️  ${area.replace('_', ' ')}`);
    });

    console.log(`\nCritical Gaps (${results.summary.criticalGaps.length}):`);
    results.gaps.critical.forEach(gap => {
      console.log(`  🔴 ${gap.title}: ${gap.description}`);
    });

    if (options.generateRoadmap && results.roadmap) {
      console.log(`\n📅 Improvement Roadmap:`);
      console.log(`  Total Tasks:      ${results.roadmap.totalTasks}`);
      console.log(`  Estimated Hours:  ${results.roadmap.totalHours}`);
      console.log(`  Estimated Weeks:  ${results.roadmap.estimatedWeeks}`);
      console.log(`  Time to Target:   ${results.summary.timeToTarget} weeks`);
    }

    console.log('='.repeat(80));

    // Generate report
    if (options.formats && options.formats.length > 0) {
      console.log('\n📝 Generating benchmark report...');

      // Create custom report for benchmarking
      const reportContent = generateBenchmarkReport(results, options);
      await fs.mkdir(options.outputDir, { recursive: true });

      for (const format of options.formats) {
        const filename = `benchmark-${path.basename(options.pdfPath, '.pdf')}-${Date.now()}.${format}`;
        const filepath = path.join(options.outputDir, filename);

        if (format === 'json') {
          await fs.writeFile(filepath, JSON.stringify(results, null, 2));
        } else if (format === 'html') {
          await fs.writeFile(filepath, reportContent.html);
        } else if (format === 'markdown') {
          await fs.writeFile(filepath, reportContent.markdown);
        }

        console.log(`  ${format.toUpperCase()}: ${filepath}`);
      }

      console.log(`\n✅ Benchmark complete! Reports saved to: ${options.outputDir}\n`);
    }

    // Exit with code based on whether target grade achieved
    const achievedTarget = results.score >= results.targetScore;
    process.exit(achievedTarget ? 0 : 1);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function generateBenchmarkReport(results, options) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Quality Benchmark Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; }
    h1 { color: #00393F; border-bottom: 3px solid #C9E4EC; }
    .summary { background: #FFF1E2; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-label { font-size: 0.9rem; color: #666; }
    .metric-value { font-size: 2rem; font-weight: bold; color: #00393F; }
    .gap { background: #fff; padding: 15px; margin: 10px 0; border-left: 4px solid #913B2F; }
    .gap.critical { border-left-color: #913B2F; }
    .gap.high { border-left-color: #BA8F5A; }
    .gap.medium { border-left-color: #C9E4EC; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #00393F; color: white; }
  </style>
</head>
<body>
  <h1>Quality Benchmark Report</h1>

  <div class="summary">
    <h2>Summary</h2>
    <div class="metric">
      <div class="metric-label">Current Grade</div>
      <div class="metric-value">${results.currentGrade}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Target Grade</div>
      <div class="metric-value">${results.targetGrade}</div>
    </div>
    <div class="metric">
      <div class="metric-label">Gap</div>
      <div class="metric-value">${results.gap.toFixed(1)} pts</div>
    </div>
  </div>

  <h2>Critical Gaps</h2>
  ${results.gaps.critical.map(gap => `
    <div class="gap critical">
      <strong>${gap.title}</strong><br>
      ${gap.description}<br>
      <em>Estimated: ${gap.estimatedHours} hours</em>
    </div>
  `).join('')}

  <h2>Improvement Roadmap</h2>
  ${results.roadmap ? `
    <p><strong>Total Tasks:</strong> ${results.roadmap.totalTasks}</p>
    <p><strong>Estimated Duration:</strong> ${results.roadmap.estimatedWeeks} weeks</p>
  ` : '<p>No roadmap generated</p>'}

  <p><em>Generated: ${new Date().toLocaleString()}</em></p>
</body>
</html>
  `;

  const markdown = `
# Quality Benchmark Report

## Summary

- **Document:** ${results.document.name}
- **Current Grade:** ${results.currentGrade} (${results.score.toFixed(1)}/100)
- **Target Grade:** ${results.targetGrade} (${results.targetScore}/100)
- **Gap:** ${results.gap.toFixed(1)} points

## Critical Gaps

${results.gaps.critical.map(gap => `
### ${gap.title}

${gap.description}

**Estimated:** ${gap.estimatedHours} hours
`).join('\n')}

## Improvement Roadmap

${results.roadmap ? `
- **Total Tasks:** ${results.roadmap.totalTasks}
- **Estimated Duration:** ${results.roadmap.estimatedWeeks} weeks
- **Total Hours:** ${results.roadmap.totalHours}
` : 'No roadmap generated'}

---
*Generated: ${new Date().toLocaleString()}*
  `;

  return { html, markdown };
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };
