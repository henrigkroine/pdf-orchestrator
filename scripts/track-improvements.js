#!/usr/bin/env node
/**
 * Track Improvements - CLI Tool for Tracking Quality Improvements
 *
 * Usage:
 *   node scripts/track-improvements.js <versions-dir> [options]
 *
 * Options:
 *   --output <dir>    Output directory for reports
 *   --format <fmt>    Report format: html, pdf, json, markdown
 *   --predict         Generate quality predictions
 *   --ai              Enable AI insights (default: true)
 *
 * @module track-improvements
 */

const fs = require('fs').promises;
const path = require('path');
const { ComparativeAnalyzer } = require('./lib/comparative-analyzer');

async function findVersions(dir) {
  const files = await fs.readdir(dir);
  const pdfFiles = files.filter(f => f.endsWith('.pdf'));

  // Try to extract version numbers and timestamps
  const versions = [];

  for (const file of pdfFiles) {
    const filepath = path.join(dir, file);
    const stats = await fs.stat(filepath);

    // Try to extract version from filename (e.g., v1, v2, version-1, etc.)
    const versionMatch = file.match(/v(\d+)|version[_-]?(\d+)/i);
    const versionNum = versionMatch ? parseInt(versionMatch[1] || versionMatch[2]) : null;

    versions.push({
      path: filepath,
      name: file,
      version: versionNum || file,
      timestamp: stats.mtime
    });
  }

  // Sort by version number or timestamp
  versions.sort((a, b) => {
    if (typeof a.version === 'number' && typeof b.version === 'number') {
      return a.version - b.version;
    }
    return a.timestamp - b.timestamp;
  });

  return versions;
}

function parseArgs(args) {
  const options = {
    versionsDir: null,
    outputDir: path.join(__dirname, '../tracking/reports'),
    formats: ['html', 'json'],
    predict: false,
    enableAI: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith('--')) {
      switch (arg) {
        case '--output':
          options.outputDir = args[++i];
          break;
        case '--format':
          options.formats = args[++i].split(',');
          break;
        case '--predict':
          options.predict = true;
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
      if (!options.versionsDir) {
        options.versionsDir = arg;
      }
    }
  }

  return options;
}

function printHelp() {
  console.log(`
PDF Improvement Tracking Tool
==============================

Usage:
  node scripts/track-improvements.js <versions-dir> [options]

Arguments:
  <versions-dir>      Directory containing versioned PDFs

Options:
  --output <dir>      Output directory (default: ./tracking/reports)
  --format <formats>  Report formats: html, pdf, json, markdown
  --predict           Generate quality predictions
  --ai                Enable AI insights (default)
  --no-ai             Disable AI insights
  --help, -h          Show this help

Examples:
  # Track improvements in a directory
  node scripts/track-improvements.js ./versions

  # With predictions
  node scripts/track-improvements.js ./versions --predict

  # Custom output
  node scripts/track-improvements.js ./versions --output ./reports --format html,json

Output:
  - Quality progression over time
  - Regression detection
  - Issue resolution tracking
  - Trend analysis
  - Predictions (if requested)
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

  if (!options.versionsDir) {
    console.error('\n❌ Error: Versions directory required\n');
    printHelp();
    process.exit(1);
  }

  try {
    // Find all PDF versions
    console.log('\n🔍 Finding PDF versions...');
    const versions = await findVersions(options.versionsDir);

    if (versions.length === 0) {
      throw new Error('No PDF files found in directory');
    }

    console.log(`✅ Found ${versions.length} version(s)`);
    versions.forEach((v, idx) => {
      console.log(`  ${idx + 1}. ${v.name}`);
    });

    // Initialize analyzer
    console.log('\n📊 Initializing improvement tracker...');
    const analyzer = new ComparativeAnalyzer({
      enableAI: options.enableAI,
      outputDir: options.outputDir
    });

    // Track improvements
    console.log('\n📈 Tracking improvements across versions...');
    const results = await analyzer.trackImprovements(versions, {
      enableAI: options.enableAI
    });

    // Print results
    console.log('\n' + '='.repeat(80));
    console.log('IMPROVEMENT TRACKING RESULTS');
    console.log('='.repeat(80));
    console.log(`\nVersion Count: ${results.versionCount}`);
    console.log(`\nProgression:`);
    console.log(`  Initial Grade:   ${results.summary.initialGrade}`);
    console.log(`  Current Grade:   ${results.summary.currentGrade}`);
    console.log(`  Improvement:     ${results.summary.improvement >= 0 ? '+' : ''}${results.summary.improvement?.toFixed(1) || 0} points`);
    console.log(`\nIssue Tracking:`);
    console.log(`  Resolved Issues: ${results.summary.resolvedIssues}`);
    console.log(`  Open Issues:     ${results.summary.openIssues}`);
    console.log(`  Regressions:     ${results.summary.regressionCount}`);

    if (options.predict && results.predictions) {
      console.log(`\nPredictions:`);
      console.log(`  Projected Grade: ${results.summary.projectedGrade}`);
      console.log(`  Weeks to Target: ${results.summary.weeksToTarget || 'N/A'}`);
    }

    // Show regressions
    if (results.regressions && results.regressions.length > 0) {
      console.log(`\n⚠️  Regressions Detected:`);
      results.regressions.forEach((reg, idx) => {
        console.log(`  ${idx + 1}. v${reg.fromVersion} → v${reg.toVersion}: ${reg.scoreDrop.toFixed(1)} points (${reg.severity})`);
      });
    }

    // Show trend
    if (results.trends) {
      console.log(`\nTrend Analysis:`);
      console.log(`  Overall Trend: ${results.progression.trend}`);
      results.trends.insights?.forEach(insight => {
        console.log(`  • ${insight}`);
      });
    }

    console.log('='.repeat(80));

    // Generate report
    if (options.formats && options.formats.length > 0) {
      console.log('\n📝 Generating improvement tracking report...');

      const reportContent = generateTrackingReport(results, options);
      await fs.mkdir(options.outputDir, { recursive: true });

      for (const format of options.formats) {
        const filename = `tracking-${Date.now()}.${format}`;
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

      console.log(`\n✅ Tracking complete! Reports saved to: ${options.outputDir}\n`);
    }

    // Exit with code based on regressions
    process.exit(results.summary.regressionCount > 0 ? 1 : 0);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}\n`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

function generateTrackingReport(results, options) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Improvement Tracking Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #00393F; border-bottom: 3px solid #C9E4EC; }
    .summary { background: #FFF1E2; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px; }
    .metric-value { font-size: 2rem; font-weight: bold; color: #00393F; }
    .chart { margin: 30px 0; padding: 20px; background: white; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #00393F; color: white; }
    .trend-improving { color: #65873B; }
    .trend-declining { color: #913B2F; }
  </style>
</head>
<body>
  <h1>Improvement Tracking Report</h1>

  <div class="summary">
    <h2>Summary</h2>
    <div class="metric">
      <div>Initial Grade</div>
      <div class="metric-value">${results.summary.initialGrade}</div>
    </div>
    <div class="metric">
      <div>Current Grade</div>
      <div class="metric-value">${results.summary.currentGrade}</div>
    </div>
    <div class="metric">
      <div>Improvement</div>
      <div class="metric-value ${results.summary.improvement >= 0 ? 'trend-improving' : 'trend-declining'}">
        ${results.summary.improvement >= 0 ? '+' : ''}${results.summary.improvement?.toFixed(1) || 0}
      </div>
    </div>
  </div>

  <div class="chart">
    <h2>Quality Progression</h2>
    <canvas id="progressionChart"></canvas>
  </div>

  <h2>Version History</h2>
  <table>
    <tr>
      <th>Version</th>
      <th>Grade</th>
      <th>Score</th>
      <th>Timestamp</th>
    </tr>
    ${results.progression.versions.map(v => `
      <tr>
        <td>${v.version}</td>
        <td>${v.grade}</td>
        <td>${v.score.toFixed(1)}</td>
        <td>${new Date(v.timestamp).toLocaleString()}</td>
      </tr>
    `).join('')}
  </table>

  <script>
    const ctx = document.getElementById('progressionChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(results.progression.versions.map((v, i) => `v${i + 1}`))},
        datasets: [{
          label: 'Quality Score',
          data: ${JSON.stringify(results.progression.versions.map(v => v.score))},
          borderColor: '#00393F',
          backgroundColor: 'rgba(0, 57, 63, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  </script>

  <p><em>Generated: ${new Date().toLocaleString()}</em></p>
</body>
</html>
  `;

  const markdown = `
# Improvement Tracking Report

## Summary

- **Versions Tracked:** ${results.versionCount}
- **Initial Grade:** ${results.summary.initialGrade}
- **Current Grade:** ${results.summary.currentGrade}
- **Improvement:** ${results.summary.improvement >= 0 ? '+' : ''}${results.summary.improvement?.toFixed(1) || 0} points
- **Resolved Issues:** ${results.summary.resolvedIssues}
- **Open Issues:** ${results.summary.openIssues}
- **Regressions:** ${results.summary.regressionCount}

## Version History

${results.progression.versions.map((v, i) => `
### Version ${i + 1}

- **Grade:** ${v.grade}
- **Score:** ${v.score.toFixed(1)}/100
- **Timestamp:** ${new Date(v.timestamp).toLocaleString()}
`).join('\n')}

## Trend Analysis

**Overall Trend:** ${results.progression.trend}

${results.trends?.insights ? results.trends.insights.map(insight => `- ${insight}`).join('\n') : ''}

---
*Generated: ${new Date().toLocaleString()}*
  `;

  return { html, markdown };
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, findVersions };
