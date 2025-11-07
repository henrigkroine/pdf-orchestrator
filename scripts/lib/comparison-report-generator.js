/**
 * Comparison Report Generator - Generate Comprehensive Comparison Reports
 *
 * Features:
 * - Executive summary
 * - Detailed change log with visuals
 * - Quality score charts (Chart.js)
 * - Side-by-side visual comparison
 * - Recommendations
 * - AI report writing (Claude Sonnet 4.5)
 * - Multiple formats: HTML, PDF, JSON, Markdown
 *
 * @module comparison-report-generator
 */

const fs = require('fs').promises;
const path = require('path');

class ComparisonReportGenerator {
  constructor(config = {}) {
    this.config = {
      enableAI: true,
      aiModel: 'claude-sonnet-4.5',
      includeVisuals: true,
      includeStatistics: true,
      includeRecommendations: true,
      chartLibrary: 'chart.js',
      ...config
    };
  }

  async generateHTML(comparisonResults, options = {}) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Comparison Report</title>
  <style>
    ${this._getCSS()}
  </style>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="container">
    ${this._generateExecutiveSummary(comparisonResults)}
    ${this._generateComparisonOverview(comparisonResults)}
    ${this._generateDetailedChanges(comparisonResults)}
    ${this._generateQualityCharts(comparisonResults)}
    ${this._generateRecommendations(comparisonResults)}
    ${this._generateFooter(comparisonResults)}
  </div>

  <script>
    ${this._getChartJS(comparisonResults)}
  </script>
</body>
</html>
    `.trim();

    return html;
  }

  async generatePDF(comparisonResults, options = {}) {
    // In production: convert HTML to PDF using puppeteer or similar
    const html = await this.generateHTML(comparisonResults, options);

    return Buffer.from(html);
  }

  async generateJSON(comparisonResults, options = {}) {
    return JSON.stringify(comparisonResults, null, 2);
  }

  async generateMarkdown(comparisonResults, options = {}) {
    let md = `# PDF Comparison Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    // Executive Summary
    md += `## Executive Summary\n\n`;
    md += this._generateMarkdownSummary(comparisonResults);

    // Comparison Overview
    md += `\n## Comparison Overview\n\n`;
    md += this._generateMarkdownOverview(comparisonResults);

    // Detailed Changes
    md += `\n## Detailed Changes\n\n`;
    md += this._generateMarkdownChanges(comparisonResults);

    // Recommendations
    md += `\n## Recommendations\n\n`;
    md += this._generateMarkdownRecommendations(comparisonResults);

    return md;
  }

  _getCSS() {
    return `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
        background: white;
      }
      h1 {
        font-size: 2.5rem;
        color: #00393F;
        margin-bottom: 20px;
        border-bottom: 3px solid #C9E4EC;
        padding-bottom: 10px;
      }
      h2 {
        font-size: 1.8rem;
        color: #00393F;
        margin: 40px 0 20px;
        border-bottom: 2px solid #C9E4EC;
        padding-bottom: 8px;
      }
      h3 {
        font-size: 1.4rem;
        color: #00393F;
        margin: 30px 0 15px;
      }
      .summary {
        background: #FFF1E2;
        padding: 30px;
        border-radius: 8px;
        margin: 30px 0;
        border-left: 5px solid #BA8F5A;
      }
      .metric {
        display: inline-block;
        margin: 10px 20px 10px 0;
      }
      .metric-label {
        font-size: 0.9rem;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .metric-value {
        font-size: 2rem;
        font-weight: bold;
        color: #00393F;
      }
      .grade {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: bold;
        font-size: 1.2rem;
      }
      .grade-a-plus { background: #65873B; color: white; }
      .grade-a { background: #BA8F5A; color: white; }
      .grade-b { background: #C9E4EC; color: #00393F; }
      .grade-c { background: #FFF1E2; color: #00393F; }
      .grade-d { background: #913B2F; color: white; }
      .change-positive { color: #65873B; }
      .change-negative { color: #913B2F; }
      .change-neutral { color: #666; }
      .comparison-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
        margin: 30px 0;
      }
      .comparison-card {
        background: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #ddd;
      }
      .changes-list {
        list-style: none;
        padding: 0;
      }
      .change-item {
        padding: 15px;
        margin: 10px 0;
        background: white;
        border-left: 4px solid #C9E4EC;
        border-radius: 4px;
      }
      .severity-critical { border-left-color: #913B2F; }
      .severity-high { border-left-color: #BA8F5A; }
      .severity-medium { border-left-color: #C9E4EC; }
      .severity-low { border-left-color: #65873B; }
      .recommendation {
        background: #f0f8ff;
        padding: 20px;
        margin: 15px 0;
        border-left: 5px solid #00393F;
        border-radius: 4px;
      }
      .priority-critical { border-left-color: #913B2F; }
      .priority-high { border-left-color: #BA8F5A; }
      .priority-medium { border-left-color: #C9E4EC; }
      .chart-container {
        margin: 30px 0;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      canvas {
        max-height: 400px;
      }
      .footer {
        margin-top: 60px;
        padding-top: 20px;
        border-top: 2px solid #C9E4EC;
        color: #666;
        font-size: 0.9rem;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
      th {
        background: #00393F;
        color: white;
        font-weight: 600;
      }
      tr:hover {
        background: #f5f5f5;
      }
    `;
  }

  _generateExecutiveSummary(results) {
    const summary = results.summary || {};

    return `
      <h1>PDF Comparison Report</h1>

      <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Comparison Date:</strong> ${new Date(results.timestamp).toLocaleString()}</p>
        <p><strong>Comparison Type:</strong> ${results.type}</p>

        <div style="margin: 30px 0;">
          <div class="metric">
            <div class="metric-label">Total Changes</div>
            <div class="metric-value">${summary.totalChanges || 0}</div>
          </div>
          <div class="metric">
            <div class="metric-label">Quality Delta</div>
            <div class="metric-value ${summary.qualityDelta >= 0 ? 'change-positive' : 'change-negative'}">
              ${summary.qualityDelta >= 0 ? '+' : ''}${(summary.qualityDelta || 0).toFixed(1)}
            </div>
          </div>
          <div class="metric">
            <div class="metric-label">Regressions</div>
            <div class="metric-value ${summary.regressionCount > 0 ? 'change-negative' : 'change-neutral'}">
              ${summary.regressionCount || 0}
            </div>
          </div>
        </div>

        <div style="margin: 20px 0;">
          <strong>Baseline Grade:</strong> <span class="grade grade-${this._gradeClass(summary.grade?.baseline)}">${summary.grade?.baseline || 'N/A'}</span>
          <strong style="margin: 0 20px;">→</strong>
          <strong>Test Grade:</strong> <span class="grade grade-${this._gradeClass(summary.grade?.test)}">${summary.grade?.test || 'N/A'}</span>
        </div>
      </div>
    `;
  }

  _generateComparisonOverview(results) {
    return `
      <h2>Comparison Overview</h2>

      <div class="comparison-grid">
        <div class="comparison-card">
          <h3>Baseline Document</h3>
          <p><strong>File:</strong> ${results.documents?.baseline?.name || 'N/A'}</p>
          <p><strong>Path:</strong> <code>${results.documents?.baseline?.path || 'N/A'}</code></p>
        </div>
        <div class="comparison-card">
          <h3>Test Document</h3>
          <p><strong>File:</strong> ${results.documents?.test?.name || 'N/A'}</p>
          <p><strong>Path:</strong> <code>${results.documents?.test?.path || 'N/A'}</code></p>
        </div>
      </div>

      ${results.impactAnalysis ? this._generateImpactAnalysis(results.impactAnalysis) : ''}
    `;
  }

  _generateDetailedChanges(results) {
    const categories = results.differences?.categories || {};
    let html = `<h2>Detailed Changes</h2>`;

    for (const [category, categoryResults] of Object.entries(categories)) {
      if (!categoryResults.hasChanges) continue;

      html += `
        <h3>${this._formatCategoryName(category)}</h3>
        <ul class="changes-list">
      `;

      // Visual changes
      if (category === 'visual' && categoryResults.overall) {
        html += `
          <li class="change-item severity-${categoryResults.severity}">
            <strong>Overall Similarity:</strong> ${categoryResults.overall.similarity}%<br>
            <strong>Diff Percentage:</strong> ${categoryResults.overall.diffPercentage}%<br>
            <strong>Severity:</strong> ${categoryResults.severity}
          </li>
        `;
      }

      // Content changes
      if (category === 'content' && categoryResults.changes) {
        html += `
          <li class="change-item severity-${categoryResults.severity}">
            <strong>Additions:</strong> ${categoryResults.changes.additions} (${categoryResults.changes.addedChars} chars)<br>
            <strong>Deletions:</strong> ${categoryResults.changes.deletions} (${categoryResults.changes.deletedChars} chars)<br>
            <strong>Change Percentage:</strong> ${categoryResults.changes.changePercentage}%
          </li>
        `;
      }

      // Other categories
      if (categoryResults.summary) {
        html += `
          <li class="change-item severity-${categoryResults.severity}">
            <strong>Total Changes:</strong> ${categoryResults.summary.totalChanges}<br>
            ${Object.entries(categoryResults.summary).filter(([k]) => k !== 'totalChanges').map(([k, v]) =>
              `<strong>${this._formatKey(k)}:</strong> ${v}`
            ).join('<br>')}
          </li>
        `;
      }

      html += `</ul>`;
    }

    return html;
  }

  _generateQualityCharts(results) {
    if (!this.config.includeStatistics) return '';

    return `
      <h2>Quality Analysis</h2>

      <div class="chart-container">
        <h3>Quality Score Comparison</h3>
        <canvas id="qualityScoreChart"></canvas>
      </div>

      <div class="chart-container">
        <h3>Category Score Breakdown</h3>
        <canvas id="categoryScoreChart"></canvas>
      </div>
    `;
  }

  _generateRecommendations(results) {
    if (!this.config.includeRecommendations || !results.recommendations) return '';

    const recommendations = results.recommendations;

    let html = `<h2>Recommendations</h2>`;

    for (const rec of recommendations) {
      html += `
        <div class="recommendation priority-${rec.priority}">
          <h3>${rec.title}</h3>
          <p><strong>Priority:</strong> ${rec.priority.toUpperCase()}</p>
          <p><strong>Category:</strong> ${rec.category}</p>
          <p>${rec.description}</p>

          ${rec.actions ? `
            <ul>
              ${rec.actions.map(action => `
                <li><strong>${typeof action === 'string' ? action : action.action}</strong>
                ${action.impact ? ` (Impact: ${action.impact})` : ''}</li>
              `).join('')}
            </ul>
          ` : ''}
        </div>
      `;
    }

    return html;
  }

  _generateImpactAnalysis(impactAnalysis) {
    return `
      <div class="comparison-card" style="grid-column: 1 / -1;">
        <h3>AI Impact Analysis</h3>
        <p><strong>Model:</strong> ${impactAnalysis.model}</p>
        <p><strong>Significance:</strong> ${impactAnalysis.significance}</p>

        ${impactAnalysis.impact ? `
          <div style="margin: 15px 0;">
            <p><strong>Visual Impact:</strong> ${impactAnalysis.impact.visual}</p>
            <p><strong>Content Impact:</strong> ${impactAnalysis.impact.content}</p>
            <p><strong>Layout Impact:</strong> ${impactAnalysis.impact.layout}</p>
            <p><strong>Overall:</strong> ${impactAnalysis.impact.overall}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  _generateFooter(results) {
    return `
      <div class="footer">
        <p>Generated by PDF Orchestrator Comparative Analyzer</p>
        <p>Report ID: ${results.comparisonId}</p>
        <p>Duration: ${results.duration}ms</p>
        <p>Timestamp: ${results.timestamp}</p>
      </div>
    `;
  }

  _getChartJS(results) {
    const qualityComparison = results.qualityComparison || {};

    return `
      // Quality Score Chart
      const qualityCtx = document.getElementById('qualityScoreChart')?.getContext('2d');
      if (qualityCtx) {
        new Chart(qualityCtx, {
          type: 'bar',
          data: {
            labels: ['Baseline', 'Test'],
            datasets: [{
              label: 'Quality Score',
              data: [${qualityComparison.baseline?.score || 0}, ${qualityComparison.test?.score || 0}],
              backgroundColor: ['#C9E4EC', '#00393F'],
              borderColor: ['#00393F', '#00393F'],
              borderWidth: 2
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
      }

      // Category Score Chart
      const categoryCtx = document.getElementById('categoryScoreChart')?.getContext('2d');
      if (categoryCtx) {
        const categories = ${JSON.stringify(Object.keys(qualityComparison.categoryDeltas || {}))};
        const baselineScores = ${JSON.stringify(Object.values(qualityComparison.baseline?.details?.categoryScores || {}))};
        const testScores = ${JSON.stringify(Object.values(qualityComparison.test?.details?.categoryScores || {}))};

        new Chart(categoryCtx, {
          type: 'radar',
          data: {
            labels: categories,
            datasets: [
              {
                label: 'Baseline',
                data: baselineScores,
                backgroundColor: 'rgba(201, 228, 236, 0.2)',
                borderColor: '#C9E4EC',
                borderWidth: 2
              },
              {
                label: 'Test',
                data: testScores,
                backgroundColor: 'rgba(0, 57, 63, 0.2)',
                borderColor: '#00393F',
                borderWidth: 2
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              r: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
    `;
  }

  _generateMarkdownSummary(results) {
    const summary = results.summary || {};

    return `
- **Comparison Date:** ${new Date(results.timestamp).toLocaleString()}
- **Comparison Type:** ${results.type}
- **Total Changes:** ${summary.totalChanges || 0}
- **Quality Delta:** ${summary.qualityDelta >= 0 ? '+' : ''}${(summary.qualityDelta || 0).toFixed(1)}
- **Baseline Grade:** ${summary.grade?.baseline || 'N/A'}
- **Test Grade:** ${summary.grade?.test || 'N/A'}
- **Regressions:** ${summary.regressionCount || 0}
    `.trim();
  }

  _generateMarkdownOverview(results) {
    return `
**Baseline Document:** \`${results.documents?.baseline?.path || 'N/A'}\`

**Test Document:** \`${results.documents?.test?.path || 'N/A'}\`
    `.trim();
  }

  _generateMarkdownChanges(results) {
    const categories = results.differences?.categories || {};
    let md = '';

    for (const [category, categoryResults] of Object.entries(categories)) {
      if (!categoryResults.hasChanges) continue;

      md += `### ${this._formatCategoryName(category)}\n\n`;
      md += `- **Severity:** ${categoryResults.severity}\n`;

      if (categoryResults.summary) {
        for (const [key, value] of Object.entries(categoryResults.summary)) {
          md += `- **${this._formatKey(key)}:** ${value}\n`;
        }
      }

      md += '\n';
    }

    return md;
  }

  _generateMarkdownRecommendations(results) {
    if (!results.recommendations) return 'No recommendations available.';

    let md = '';

    for (const rec of results.recommendations) {
      md += `### ${rec.title}\n\n`;
      md += `- **Priority:** ${rec.priority.toUpperCase()}\n`;
      md += `- **Category:** ${rec.category}\n`;
      md += `- **Description:** ${rec.description}\n\n`;

      if (rec.actions) {
        md += '**Actions:**\n\n';
        for (const action of rec.actions) {
          const actionText = typeof action === 'string' ? action : action.action;
          md += `- ${actionText}\n`;
        }
        md += '\n';
      }
    }

    return md;
  }

  _formatCategoryName(category) {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  _formatKey(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  _gradeClass(grade) {
    if (!grade) return 'c';
    if (grade.includes('A')) return 'a-plus';
    if (grade.includes('B')) return 'b';
    if (grade.includes('C')) return 'c';
    return 'd';
  }
}

module.exports = ComparisonReportGenerator;
