#!/usr/bin/env node

/**
 * Visual Quality Checker - CLI Tool
 *
 * Comprehensive AI-powered visual quality inspection for PDFs
 *
 * Usage:
 *   node scripts/check-visual-quality.js <pdf-path> [options]
 *
 * Options:
 *   --output-json <path>      Save JSON report to file
 *   --output-html <path>      Generate HTML dashboard
 *   --annotate <path>         Create annotated PDF with issue markers
 *   --config <path>           Custom config file path
 *   --pages <range>           Analyze specific pages (e.g., "1-3,5")
 *   --no-ai                   Skip AI assessments (CV analysis only)
 *   --verbose                 Detailed logging
 *
 * Examples:
 *   node scripts/check-visual-quality.js exports/document.pdf
 *   node scripts/check-visual-quality.js exports/document.pdf --output-json report.json
 *   node scripts/check-visual-quality.js exports/document.pdf --output-html dashboard.html --annotate annotated.pdf
 *   node scripts/check-visual-quality.js exports/document.pdf --pages "1-3,5" --verbose
 *
 * @version 1.0.0
 */

const fs = require('fs').promises;
const path = require('path');
const VisualQualityInspector = require('./lib/visual-quality-inspector');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  const options = {
    pdfPath: null,
    outputJson: null,
    outputHtml: null,
    annotate: null,
    config: null,
    pages: null,
    noAI: false,
    verbose: false
  };

  options.pdfPath = args[0];

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--output-json':
        options.outputJson = args[++i];
        break;
      case '--output-html':
        options.outputHtml = args[++i];
        break;
      case '--annotate':
        options.annotate = args[++i];
        break;
      case '--config':
        options.config = args[++i];
        break;
      case '--pages':
        options.pages = args[++i];
        break;
      case '--no-ai':
        options.noAI = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        process.exit(1);
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
Visual Quality Checker - AI-Powered PDF Quality Inspection

Usage:
  node scripts/check-visual-quality.js <pdf-path> [options]

Options:
  --output-json <path>      Save JSON report to file
  --output-html <path>      Generate interactive HTML dashboard
  --annotate <path>         Create annotated PDF with issue markers
  --config <path>           Custom configuration file path
  --pages <range>           Analyze specific pages (e.g., "1-3,5")
  --no-ai                   Skip AI assessments (computer vision only)
  --verbose                 Enable detailed logging
  --help, -h                Show this help message

Examples:
  # Basic inspection
  node scripts/check-visual-quality.js exports/document.pdf

  # Save JSON report
  node scripts/check-visual-quality.js exports/document.pdf --output-json report.json

  # Generate HTML dashboard and annotated PDF
  node scripts/check-visual-quality.js exports/document.pdf --output-html dashboard.html --annotate annotated.pdf

  # Analyze specific pages with verbose output
  node scripts/check-visual-quality.js exports/document.pdf --pages "1-3,5" --verbose

  # Computer vision only (no AI models)
  node scripts/check-visual-quality.js exports/document.pdf --no-ai

Quality Grading Scale:
  A+  (95-100)  - Award-winning, world-class design
  A   (90-94)   - Excellent professional quality
  B+  (85-89)   - Very good, minor improvements possible
  B   (80-84)   - Good, some improvements needed
  C   (70-79)   - Adequate, several issues to fix
  D   (60-69)   - Below standard, major issues
  F   (<60)     - Unacceptable, complete redesign needed

Analysis Components:
  ✓ Computer Vision: Blur, noise, sharpness, resolution, compression
  ✓ Image Quality: DPI, color profiles, distortion, pixelation
  ✓ Layout Balance: Visual weight, whitespace, golden ratio, symmetry
  ✓ AI Assessment: GPT-4o Vision, Claude Sonnet 4.5, Gemini 2.5 Pro
  ✓ Ensemble Scoring: Weighted combination of all metrics

For more information, see: docs/VISUAL-QUALITY-GUIDE.md
`);
}

/**
 * Validate PDF path
 */
async function validatePdfPath(pdfPath) {
  try {
    const stat = await fs.stat(pdfPath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${pdfPath}`);
    }
    if (path.extname(pdfPath).toLowerCase() !== '.pdf') {
      throw new Error(`Not a PDF file: ${pdfPath}`);
    }
    return true;
  } catch (error) {
    throw new Error(`Invalid PDF path: ${error.message}`);
  }
}

/**
 * Print summary to console
 */
function printSummary(report) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 VISUAL QUALITY INSPECTION SUMMARY');
  console.log('='.repeat(80));

  console.log(`\n📁 File: ${report.metadata.fileName}`);
  console.log(`📄 Pages: ${report.summary.totalPages}`);
  console.log(`⏱️  Duration: ${report.metadata.duration}`);

  console.log(`\n🎯 Overall Grade: ${report.overallGrade.grade} - ${report.overallGrade.label}`);
  console.log(`📈 Overall Score: ${report.overallScore.toFixed(1)}/100`);
  console.log(`   ${report.overallGrade.description}`);

  // Score distribution
  console.log('\n📊 Score Distribution:');
  Object.entries(report.summary.scoreDistribution).forEach(([grade, count]) => {
    const bar = '█'.repeat(Math.ceil(count / report.summary.totalPages * 40));
    console.log(`   ${grade}: ${bar} ${count} page(s)`);
  });

  // Average scores per page
  console.log('\n📄 Per-Page Scores:');
  report.pages.forEach(page => {
    const scoreBar = this._createScoreBar(page.overallScore);
    console.log(`   Page ${page.pageNumber}: ${scoreBar} ${page.overallScore.toFixed(1)}/100 (${page.grade})`);
  });

  // Top issues
  if (Object.keys(report.summary.commonIssues).length > 0) {
    console.log('\n⚠️  Top Issues:');
    const sortedIssues = Object.entries(report.summary.commonIssues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedIssues.forEach(([issue, count]) => {
      const severity = issue.split(':')[0];
      const icon = severity === 'CRITICAL' ? '🚨' : severity === 'MAJOR' ? '⚠️' : '💡';
      console.log(`   ${icon} ${issue} (${count} pages)`);
    });
  }

  // Strengths
  if (Object.keys(report.summary.commonStrengths).length > 0) {
    console.log('\n✅ Strengths:');
    const sortedStrengths = Object.entries(report.summary.commonStrengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    sortedStrengths.forEach(([strength, count]) => {
      console.log(`   ✓ ${strength} (${count} pages)`);
    });
  }

  // Recommendations
  if (report.recommendations && report.recommendations.length > 0) {
    console.log('\n💡 Priority Recommendations:');
    report.recommendations.slice(0, 5).forEach((rec, i) => {
      const priorityIcon = rec.priority === 'CRITICAL' ? '🚨' : rec.priority === 'HIGH' ? '⚠️' : '💡';
      console.log(`   ${i + 1}. ${priorityIcon} [${rec.priority}] ${rec.recommendation}`);
      console.log(`      Impact: ${rec.impact}`);
    });
  }

  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Create visual score bar
 */
function _createScoreBar(score) {
  const width = 30;
  const filled = Math.round(score / 100 * width);
  const empty = width - filled;

  let color;
  if (score >= 90) color = '█'; // Excellent
  else if (score >= 80) color = '▓'; // Good
  else if (score >= 70) color = '▒'; // Acceptable
  else color = '░'; // Poor

  return color.repeat(filled) + '░'.repeat(empty);
}

/**
 * Save JSON report
 */
async function saveJsonReport(report, outputPath) {
  try {
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✅ JSON report saved: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to save JSON report: ${error.message}`);
  }
}

/**
 * Generate HTML dashboard
 */
async function generateHtmlDashboard(report, outputPath) {
  try {
    const html = createDashboardHtml(report);
    await fs.writeFile(outputPath, html);
    console.log(`\n✅ HTML dashboard generated: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to generate HTML dashboard: ${error.message}`);
  }
}

/**
 * Create HTML dashboard
 */
function createDashboardHtml(report) {
  const grade = report.overallGrade;
  const gradeColor = grade.grade.startsWith('A') ? '#10b981' :
                     grade.grade.startsWith('B') ? '#3b82f6' :
                     grade.grade.startsWith('C') ? '#f59e0b' :
                     grade.grade.startsWith('D') ? '#ef4444' : '#991b1b';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Quality Report - ${report.metadata.fileName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #1f2937;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    .header h1 { font-size: 36px; margin-bottom: 10px; }
    .header p { font-size: 18px; opacity: 0.9; }
    .grade-display {
      background: ${gradeColor};
      color: white;
      padding: 60px 40px;
      text-align: center;
    }
    .grade-letter {
      font-size: 120px;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 10px;
      text-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    .grade-label {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: 5px;
    }
    .grade-score {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .grade-description {
      font-size: 18px;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section h2 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
    .stat-label {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: #1f2937;
    }
    .page-scores {
      display: grid;
      gap: 15px;
    }
    .page-score-item {
      background: #f9fafb;
      padding: 15px 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-left: 4px solid #d1d5db;
    }
    .page-score-item.excellent { border-left-color: #10b981; }
    .page-score-item.good { border-left-color: #3b82f6; }
    .page-score-item.acceptable { border-left-color: #f59e0b; }
    .page-score-item.poor { border-left-color: #ef4444; }
    .page-info {
      font-weight: 600;
      font-size: 16px;
    }
    .page-grade {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .grade-badge {
      font-size: 20px;
      font-weight: 800;
      padding: 5px 15px;
      border-radius: 6px;
      background: rgba(0,0,0,0.05);
    }
    .score-bar {
      width: 200px;
      height: 10px;
      background: #e5e7eb;
      border-radius: 5px;
      overflow: hidden;
    }
    .score-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
    .issues-list, .strengths-list, .recommendations-list {
      display: grid;
      gap: 15px;
    }
    .issue-item, .strength-item, .recommendation-item {
      padding: 15px 20px;
      border-radius: 8px;
      background: #f9fafb;
    }
    .issue-item.critical {
      background: #fee2e2;
      border-left: 4px solid #dc2626;
    }
    .issue-item.major {
      background: #fed7aa;
      border-left: 4px solid #ea580c;
    }
    .issue-item.minor {
      background: #fef3c7;
      border-left: 4px solid #d97706;
    }
    .strength-item {
      background: #d1fae5;
      border-left: 4px solid #10b981;
    }
    .recommendation-item.critical {
      background: #fee2e2;
      border-left: 4px solid #dc2626;
    }
    .recommendation-item.high {
      background: #fed7aa;
      border-left: 4px solid #ea580c;
    }
    .issue-severity, .rec-priority {
      display: inline-block;
      font-size: 12px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-right: 10px;
    }
    .issue-severity.critical, .rec-priority.critical {
      background: #dc2626;
      color: white;
    }
    .issue-severity.major, .rec-priority.high {
      background: #ea580c;
      color: white;
    }
    .issue-severity.minor, .rec-priority.medium {
      background: #d97706;
      color: white;
    }
    .footer {
      background: #f3f4f6;
      padding: 30px 40px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔍 Visual Quality Inspection Report</h1>
      <p>${report.metadata.fileName}</p>
      <p style="font-size: 14px; opacity: 0.8; margin-top: 10px;">
        Generated: ${new Date(report.metadata.timestamp).toLocaleString()} • Duration: ${report.metadata.duration}
      </p>
    </div>

    <div class="grade-display">
      <div class="grade-letter">${grade.grade}</div>
      <div class="grade-label">${grade.label}</div>
      <div class="grade-score">${report.overallScore.toFixed(1)}/100</div>
      <div class="grade-description">${grade.description}</div>
    </div>

    <div class="content">
      <div class="section">
        <h2>📊 Summary Statistics</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Pages</div>
            <div class="stat-value">${report.summary.totalPages}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Average Score</div>
            <div class="stat-value">${report.summary.averageScore.toFixed(1)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Issues</div>
            <div class="stat-value">${Object.keys(report.summary.commonIssues).length}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Strengths</div>
            <div class="stat-value">${Object.keys(report.summary.commonStrengths).length}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>📄 Per-Page Scores</h2>
        <div class="page-scores">
          ${report.pages.map(page => {
            const scoreClass = page.overallScore >= 90 ? 'excellent' :
                               page.overallScore >= 80 ? 'good' :
                               page.overallScore >= 70 ? 'acceptable' : 'poor';
            return `
              <div class="page-score-item ${scoreClass}">
                <div class="page-info">Page ${page.pageNumber}</div>
                <div class="page-grade">
                  <div class="score-bar">
                    <div class="score-bar-fill" style="width: ${page.overallScore}%"></div>
                  </div>
                  <span style="font-weight: 700; min-width: 60px; text-align: right;">${page.overallScore.toFixed(1)}</span>
                  <span class="grade-badge">${page.grade}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${Object.keys(report.summary.commonIssues).length > 0 ? `
      <div class="section">
        <h2>⚠️  Top Issues</h2>
        <div class="issues-list">
          ${Object.entries(report.summary.commonIssues)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([issue, count]) => {
              const severity = issue.split(':')[0].toLowerCase();
              return `
                <div class="issue-item ${severity}">
                  <span class="issue-severity ${severity}">${severity}</span>
                  ${issue.split(':').slice(1).join(':').trim()} <strong>(${count} pages)</strong>
                </div>
              `;
            }).join('')}
        </div>
      </div>
      ` : ''}

      ${Object.keys(report.summary.commonStrengths).length > 0 ? `
      <div class="section">
        <h2>✅ Strengths</h2>
        <div class="strengths-list">
          ${Object.entries(report.summary.commonStrengths)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([strength, count]) => `
              <div class="strength-item">
                ✓ ${strength} <strong>(${count} pages)</strong>
              </div>
            `).join('')}
        </div>
      </div>
      ` : ''}

      ${report.recommendations && report.recommendations.length > 0 ? `
      <div class="section">
        <h2>💡 Priority Recommendations</h2>
        <div class="recommendations-list">
          ${report.recommendations.slice(0, 10).map(rec => {
            const priority = rec.priority.toLowerCase();
            return `
              <div class="recommendation-item ${priority}">
                <span class="rec-priority ${priority}">${rec.priority}</span>
                <strong>${rec.recommendation}</strong>
                <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                  Impact: ${rec.impact}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : ''}
    </div>

    <div class="footer">
      <p><strong>Visual Quality Inspector v${report.metadata.inspectorVersion}</strong></p>
      <p>Powered by Computer Vision + AI (GPT-4o Vision, Claude Sonnet 4.5, Gemini 2.5 Pro)</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main function
 */
async function main() {
  try {
    const options = parseArgs();

    // Validate PDF path
    await validatePdfPath(options.pdfPath);

    // Initialize inspector
    console.log('🔧 Initializing Visual Quality Inspector...');
    const inspector = new VisualQualityInspector({
      configPath: options.config
    });

    // Disable AI if requested
    if (options.noAI) {
      console.log('   ℹ️  AI assessments disabled (--no-ai flag)');
      inspector.config.aiModels.gpt4oVision.enabled = false;
      inspector.config.aiModels.claudeSonnet.enabled = false;
      inspector.config.aiModels.geminiVision.enabled = false;
    }

    // Run inspection
    const report = await inspector.inspect(options.pdfPath, {
      pages: options.pages,
      verbose: options.verbose
    });

    // Print summary
    printSummary(report);

    // Save outputs
    if (options.outputJson) {
      await saveJsonReport(report, options.outputJson);
    }

    if (options.outputHtml) {
      await generateHtmlDashboard(report, options.outputHtml);
    }

    // Exit with appropriate code based on grade
    const exitCode = report.overallScore >= 70 ? 0 : 1;
    process.exit(exitCode);

  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    if (options && options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseArgs, validatePdfPath, printSummary, createDashboardHtml };
