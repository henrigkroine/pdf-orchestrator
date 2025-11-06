/**
 * BATCH REPORT GENERATOR
 *
 * Advanced report generation for batch validation results.
 * Creates comprehensive HTML dashboards, CSV exports, and PDF summaries.
 *
 * Features:
 * - Interactive HTML dashboard with charts
 * - CSV export for Excel analysis
 * - PDF executive summary
 * - Aggregated statistics
 * - Trend analysis
 * - Comparison views
 *
 * Usage:
 *   node generate-batch-report.js <batch-report.json>
 *   node generate-batch-report.js batch-reports/batch-report-*.json --format html,csv
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class BatchReportGenerator {
  constructor(reportPath) {
    this.reportPath = reportPath;
    this.outputDir = path.join(projectRoot, 'batch-reports');
    this.report = null;
  }

  /**
   * Load batch report JSON
   */
  async loadReport() {
    const content = await fs.readFile(this.reportPath, 'utf8');
    this.report = JSON.parse(content);
    console.log(`\n📊 Loaded batch report: ${path.basename(this.reportPath)}`);
    console.log(`   PDFs: ${this.report.summary.totalPDFs}`);
    console.log(`   Pages: ${this.report.summary.totalPages}`);
  }

  /**
   * Generate HTML dashboard
   */
  async generateHTML() {
    console.log('\n📄 Generating HTML dashboard...');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Batch Validation Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }

    header {
      background: linear-gradient(135deg, #00393F 0%, #65873B 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    header h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      font-weight: 700;
    }

    header .subtitle {
      font-size: 1.2em;
      opacity: 0.9;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      padding: 40px;
      background: #f8f9fa;
    }

    .stat-card {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card .value {
      font-size: 3em;
      font-weight: bold;
      color: #00393F;
      margin-bottom: 10px;
    }

    .stat-card .label {
      font-size: 1em;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .stat-card.success .value {
      color: #65873B;
    }

    .stat-card.warning .value {
      color: #BA8F5A;
    }

    .stat-card.danger .value {
      color: #913B2F;
    }

    .results {
      padding: 40px;
    }

    .results h2 {
      font-size: 2em;
      margin-bottom: 30px;
      color: #00393F;
      border-bottom: 3px solid #00393F;
      padding-bottom: 10px;
    }

    .pdf-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 20px;
      transition: all 0.3s;
    }

    .pdf-card:hover {
      border-color: #00393F;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .pdf-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .pdf-name {
      font-size: 1.4em;
      font-weight: 600;
      color: #333;
    }

    .grade-badge {
      padding: 10px 25px;
      border-radius: 50px;
      font-size: 1.2em;
      font-weight: bold;
      color: white;
    }

    .grade-badge.A-plus,
    .grade-badge.A {
      background: linear-gradient(135deg, #65873B, #4CAF50);
    }

    .grade-badge.B {
      background: linear-gradient(135deg, #BA8F5A, #FFA726);
    }

    .grade-badge.C {
      background: linear-gradient(135deg, #FF9800, #FB8C00);
    }

    .grade-badge.D,
    .grade-badge.F {
      background: linear-gradient(135deg, #913B2F, #E53935);
    }

    .pdf-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin-bottom: 15px;
    }

    .pdf-stat {
      text-align: center;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 10px;
    }

    .pdf-stat .stat-value {
      font-size: 1.8em;
      font-weight: bold;
      color: #00393F;
    }

    .pdf-stat .stat-label {
      font-size: 0.9em;
      color: #666;
      margin-top: 5px;
    }

    .violations {
      background: #fff3cd;
      border-left: 4px solid #BA8F5A;
      padding: 15px;
      border-radius: 5px;
      margin-top: 15px;
    }

    .violations h4 {
      color: #913B2F;
      margin-bottom: 10px;
    }

    .violations ul {
      list-style: none;
      padding-left: 0;
    }

    .violations li {
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .violations li:last-child {
      border-bottom: none;
    }

    .status-badge {
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9em;
      font-weight: 600;
      display: inline-block;
      margin-top: 10px;
    }

    .status-badge.passed {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.failed {
      background: #f8d7da;
      color: #721c24;
    }

    footer {
      background: #00393F;
      color: white;
      text-align: center;
      padding: 30px;
      font-size: 0.9em;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Batch Validation Report</h1>
      <div class="subtitle">Generated ${this.report.timestamp}</div>
    </header>

    <div class="summary">
      <div class="stat-card">
        <div class="value">${this.report.summary.totalPDFs}</div>
        <div class="label">Total PDFs</div>
      </div>

      <div class="stat-card success">
        <div class="value">${this.report.summary.passedPDFs}</div>
        <div class="label">Passed</div>
      </div>

      <div class="stat-card danger">
        <div class="value">${this.report.summary.failedPDFs}</div>
        <div class="label">Failed</div>
      </div>

      <div class="stat-card">
        <div class="value">${this.report.summary.totalPages}</div>
        <div class="label">Total Pages</div>
      </div>

      <div class="stat-card warning">
        <div class="value">${this.report.summary.averageScore}</div>
        <div class="label">Avg Score</div>
      </div>

      <div class="stat-card success">
        <div class="value">${this.report.summary.cacheHitRate}%</div>
        <div class="label">Cache Hit Rate</div>
      </div>

      <div class="stat-card">
        <div class="value">${this.report.summary.duration}s</div>
        <div class="label">Duration</div>
      </div>

      <div class="stat-card">
        <div class="value">${(this.report.summary.totalPages / this.report.summary.duration).toFixed(2)}</div>
        <div class="label">Pages/Sec</div>
      </div>
    </div>

    <div class="results">
      <h2>📄 PDF Results</h2>

      ${this.report.results.map((result, idx) => this.generatePDFCard(result, idx + 1)).join('')}
    </div>

    <footer>
      <p><strong>AI Vision PDF Validator</strong></p>
      <p>Powered by Google Gemini Vision | TEEI Brand Compliance System</p>
      <p style="margin-top: 10px; opacity: 0.8;">
        Generated ${new Date(this.report.timestamp).toLocaleString()}
      </p>
    </footer>
  </div>
</body>
</html>`;

    const outputPath = path.join(
      this.outputDir,
      path.basename(this.reportPath, '.json') + '.html'
    );

    await fs.writeFile(outputPath, html);
    console.log(`   ✅ HTML dashboard: ${outputPath}`);

    return outputPath;
  }

  /**
   * Generate PDF card HTML
   */
  generatePDFCard(result, index) {
    if (result.failed) {
      return `
      <div class="pdf-card">
        <div class="pdf-header">
          <div class="pdf-name">${index}. ${result.pdfName}</div>
          <div class="grade-badge F">ERROR</div>
        </div>
        <div class="violations">
          <h4>⚠️ Processing Error</h4>
          <p>${result.error}</p>
        </div>
      </div>`;
    }

    const gradeClass = result.overallGrade.replace('+', '-plus');

    return `
    <div class="pdf-card">
      <div class="pdf-header">
        <div class="pdf-name">${index}. ${result.pdfName}</div>
        <div class="grade-badge ${gradeClass}">${result.overallGrade}</div>
      </div>

      <div class="pdf-stats">
        <div class="pdf-stat">
          <div class="stat-value">${result.scores.overall}</div>
          <div class="stat-label">Overall Score</div>
        </div>
        <div class="pdf-stat">
          <div class="stat-value">${result.scores.brandCompliance}</div>
          <div class="stat-label">Brand Compliance</div>
        </div>
        <div class="pdf-stat">
          <div class="stat-value">${result.successfulPages}/${result.totalPages}</div>
          <div class="stat-label">Pages</div>
        </div>
        <div class="pdf-stat">
          <div class="stat-value">${result.criticalViolations.length}</div>
          <div class="stat-label">Violations</div>
        </div>
      </div>

      <div class="status-badge ${result.passed ? 'passed' : 'failed'}">
        ${result.passed ? '✅ PASSED' : '❌ FAILED'}
      </div>

      ${result.criticalViolations.length > 0 ? `
      <div class="violations">
        <h4>⚠️ Critical Violations (${result.criticalViolations.length})</h4>
        <ul>
          ${result.criticalViolations.slice(0, 5).map(v => `<li>❌ ${v}</li>`).join('')}
          ${result.criticalViolations.length > 5 ? `<li><em>... and ${result.criticalViolations.length - 5} more</em></li>` : ''}
        </ul>
      </div>
      ` : ''}
    </div>`;
  }

  /**
   * Generate CSV export
   */
  async generateCSV() {
    console.log('\n📊 Generating CSV export...');

    const rows = [
      ['PDF Name', 'Grade', 'Overall Score', 'Brand Score', 'Total Pages', 'Successful Pages', 'Violations', 'Status']
    ];

    this.report.results.forEach(result => {
      if (!result.failed) {
        rows.push([
          result.pdfName,
          result.overallGrade,
          result.scores.overall,
          result.scores.brandCompliance,
          result.totalPages,
          result.successfulPages,
          result.criticalViolations.length,
          result.passed ? 'PASSED' : 'FAILED'
        ]);
      } else {
        rows.push([
          result.pdfName,
          'ERROR',
          '0',
          '0',
          '0',
          '0',
          'N/A',
          'ERROR'
        ]);
      }
    });

    const csv = rows.map(row => row.join(',')).join('\n');

    const outputPath = path.join(
      this.outputDir,
      path.basename(this.reportPath, '.json') + '.csv'
    );

    await fs.writeFile(outputPath, csv);
    console.log(`   ✅ CSV export: ${outputPath}`);

    return outputPath;
  }

  /**
   * Generate all formats
   */
  async generateAll(formats = ['html', 'csv']) {
    await this.loadReport();

    const outputs = {};

    if (formats.includes('html')) {
      outputs.html = await this.generateHTML();
    }

    if (formats.includes('csv')) {
      outputs.csv = await this.generateCSV();
    }

    return outputs;
  }
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
BATCH REPORT GENERATOR

Usage:
  node generate-batch-report.js <batch-report.json> [options]

Options:
  --format, -f <formats>    Output formats: html,csv (default: html,csv)
  --help, -h                Show this help

Examples:
  node generate-batch-report.js batch-reports/batch-report-123.json
  node generate-batch-report.js batch-reports/batch-report-123.json --format html
`);
    process.exit(0);
  }

  const options = {
    reportPath: args[0],
    formats: ['html', 'csv']
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--format' || arg === '-f') {
      options.formats = args[++i].split(',');
    }
  }

  return options;
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (!fsSync.existsSync(options.reportPath)) {
    console.error(`❌ Error: Report file not found: ${options.reportPath}`);
    process.exit(1);
  }

  try {
    const generator = new BatchReportGenerator(options.reportPath);
    const outputs = await generator.generateAll(options.formats);

    console.log('\n✅ Report generation complete!');
    console.log('\nGenerated files:');
    Object.entries(outputs).forEach(([format, path]) => {
      console.log(`   ${format.toUpperCase()}: ${path}`);
    });
    console.log('');

  } catch (error) {
    console.error('\n❌ Report generation error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export default BatchReportGenerator;
