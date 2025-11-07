/**
 * Accessibility Report Generator
 *
 * Generates comprehensive HTML reports for WCAG 2.2 accessibility validation results.
 *
 * Features:
 * - Visual pass/fail indicators
 * - Severity levels (Critical, Major, Minor)
 * - Screenshots with annotations
 * - Remediation recommendations
 * - Exportable HTML reports
 *
 * @module accessibility-report-generator
 */

import fs from 'fs/promises';
import path from 'path';
import { getWCAGCriterion } from './wcag-checker.js';

/**
 * Severity levels for accessibility issues
 */
export const SEVERITY_LEVELS = {
  CRITICAL: {
    name: 'Critical',
    color: '#DC2626',
    icon: '🚨',
    description: 'Blocks access for users with disabilities. Must fix immediately.'
  },
  MAJOR: {
    name: 'Major',
    color: '#F59E0B',
    icon: '⚠️',
    description: 'Significantly impacts accessibility. Should fix soon.'
  },
  MINOR: {
    name: 'Minor',
    color: '#3B82F6',
    icon: 'ℹ️',
    description: 'Minor accessibility issue. Recommend fixing when possible.'
  },
  INFO: {
    name: 'Info',
    color: '#6B7280',
    icon: '💡',
    description: 'Best practice recommendation. Not a compliance issue.'
  }
};

/**
 * Generate HTML accessibility report
 *
 * @param {Object} results - Validation results
 * @param {string} outputPath - Path to save HTML report
 * @returns {Promise<string>} Path to generated report
 */
export async function generateAccessibilityReport(results, outputPath) {
  const html = buildHTMLReport(results);

  // Ensure output directory exists
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  // Write HTML file
  await fs.writeFile(outputPath, html, 'utf8');

  return outputPath;
}

/**
 * Build HTML report structure
 *
 * @param {Object} results - Validation results
 * @returns {string} HTML content
 */
function buildHTMLReport(results) {
  const timestamp = new Date(results.timestamp).toLocaleString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WCAG 2.2 Accessibility Report - ${results.fileName || 'Document'}</title>
  <style>
    ${getReportCSS()}
  </style>
</head>
<body>
  <div class="container">
    ${buildHeader(results, timestamp)}
    ${buildExecutiveSummary(results)}
    ${buildScoreCard(results)}
    ${buildViolationsList(results)}
    ${buildDetailedFindings(results)}
    ${buildRemediation(results)}
    ${buildFooter(timestamp)}
  </div>

  <script>
    ${getReportJavaScript()}
  </script>
</body>
</html>`;
}

/**
 * Build report header
 */
function buildHeader(results, timestamp) {
  const status = results.overallPasses ? 'PASS' : 'FAIL';
  const statusClass = results.overallPasses ? 'pass' : 'fail';

  return `
    <header class="report-header">
      <div class="header-content">
        <h1>WCAG 2.2 Level AA Accessibility Report</h1>
        <div class="report-meta">
          <div class="meta-item">
            <strong>Document:</strong> ${results.fileName || 'Unknown'}
          </div>
          <div class="meta-item">
            <strong>Generated:</strong> ${timestamp}
          </div>
          <div class="meta-item">
            <strong>WCAG Version:</strong> 2.2 Level AA
          </div>
          <div class="meta-item status-${statusClass}">
            <strong>Status:</strong> <span class="status-badge ${statusClass}">${status}</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

/**
 * Build executive summary section
 */
function buildExecutiveSummary(results) {
  const totalChecks = results.checks ? results.checks.length : 0;
  const passedChecks = results.checks ? results.checks.filter(c => c.passes).length : 0;
  const failedChecks = totalChecks - passedChecks;
  const passRate = totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(1) : 0;

  const criticalCount = results.violations ? results.violations.filter(v => v.severity === 'CRITICAL').length : 0;
  const majorCount = results.violations ? results.violations.filter(v => v.severity === 'MAJOR').length : 0;
  const minorCount = results.violations ? results.violations.filter(v => v.severity === 'MINOR').length : 0;

  return `
    <section class="executive-summary">
      <h2>Executive Summary</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Overall Compliance</div>
          <div class="summary-value ${results.overallPasses ? 'pass' : 'fail'}">${passRate}%</div>
          <div class="summary-subtitle">${passedChecks} of ${totalChecks} checks passed</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Critical Issues</div>
          <div class="summary-value ${criticalCount > 0 ? 'fail' : 'pass'}">${criticalCount}</div>
          <div class="summary-subtitle">Must fix immediately</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Major Issues</div>
          <div class="summary-value ${majorCount > 0 ? 'warning' : 'pass'}">${majorCount}</div>
          <div class="summary-subtitle">Should fix soon</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Minor Issues</div>
          <div class="summary-value info">${minorCount}</div>
          <div class="summary-subtitle">Recommend fixing</div>
        </div>
      </div>
    </section>
  `;
}

/**
 * Build scorecard section
 */
function buildScoreCard(results) {
  if (!results.checks || results.checks.length === 0) {
    return '';
  }

  const checksByCategory = groupChecksByCategory(results.checks);

  let html = `
    <section class="scorecard">
      <h2>Compliance Scorecard</h2>
      <div class="scorecard-grid">
  `;

  for (const [category, checks] of Object.entries(checksByCategory)) {
    const passed = checks.filter(c => c.passes).length;
    const total = checks.length;
    const percentage = ((passed / total) * 100).toFixed(0);
    const status = passed === total ? 'pass' : 'fail';

    html += `
      <div class="scorecard-item">
        <div class="scorecard-header">
          <h3>${category}</h3>
          <span class="scorecard-score ${status}">${passed}/${total}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${status}" style="width: ${percentage}%"></div>
        </div>
        <div class="scorecard-checks">
          ${checks.map(check => `
            <div class="check-item ${check.passes ? 'pass' : 'fail'}">
              <span class="check-icon">${check.passes ? '✓' : '✗'}</span>
              <span class="check-name">${check.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  html += `
      </div>
    </section>
  `;

  return html;
}

/**
 * Build violations list section
 */
function buildViolationsList(results) {
  if (!results.violations || results.violations.length === 0) {
    return `
      <section class="violations-list">
        <h2>Violations</h2>
        <div class="no-violations">
          <span class="icon">✅</span>
          <p>No accessibility violations found! This document meets WCAG 2.2 Level AA standards.</p>
        </div>
      </section>
    `;
  }

  // Group violations by severity
  const bySeverity = {
    CRITICAL: results.violations.filter(v => v.severity === 'CRITICAL'),
    MAJOR: results.violations.filter(v => v.severity === 'MAJOR'),
    MINOR: results.violations.filter(v => v.severity === 'MINOR'),
    INFO: results.violations.filter(v => v.severity === 'INFO')
  };

  let html = `
    <section class="violations-list">
      <h2>Violations (${results.violations.length})</h2>
  `;

  for (const [severity, violations] of Object.entries(bySeverity)) {
    if (violations.length === 0) continue;

    const severityInfo = SEVERITY_LEVELS[severity];

    html += `
      <div class="severity-group">
        <h3 class="severity-header" style="border-left-color: ${severityInfo.color}">
          <span class="severity-icon">${severityInfo.icon}</span>
          ${severityInfo.name} (${violations.length})
        </h3>
        <div class="violations-grid">
          ${violations.map((v, idx) => buildViolationCard(v, idx, severityInfo)).join('')}
        </div>
      </div>
    `;
  }

  html += `</section>`;

  return html;
}

/**
 * Build individual violation card
 */
function buildViolationCard(violation, index, severityInfo) {
  const criterion = violation.criterion ? getWCAGCriterion(violation.criterion) : null;

  return `
    <div class="violation-card" id="violation-${index}">
      <div class="violation-header" style="border-left-color: ${severityInfo.color}">
        <div class="violation-title">
          <span class="violation-icon">${severityInfo.icon}</span>
          <strong>${violation.title || 'Accessibility Issue'}</strong>
        </div>
        ${criterion ? `
          <div class="wcag-criterion">
            <a href="${criterion.url}" target="_blank" rel="noopener">
              WCAG ${criterion.number}: ${criterion.name}
            </a>
          </div>
        ` : ''}
      </div>
      <div class="violation-body">
        <p class="violation-description">${violation.description || violation.message}</p>
        ${violation.location ? `
          <div class="violation-location">
            <strong>Location:</strong> ${violation.location}
          </div>
        ` : ''}
        ${violation.details ? `
          <div class="violation-details">
            <strong>Details:</strong>
            <pre>${JSON.stringify(violation.details, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Build detailed findings section
 */
function buildDetailedFindings(results) {
  if (!results.detailedFindings || Object.keys(results.detailedFindings).length === 0) {
    return '';
  }

  let html = `
    <section class="detailed-findings">
      <h2>Detailed Findings</h2>
  `;

  for (const [category, findings] of Object.entries(results.detailedFindings)) {
    html += `
      <div class="findings-category">
        <h3>${formatCategoryName(category)}</h3>
        ${formatFindings(findings)}
      </div>
    `;
  }

  html += `</section>`;

  return html;
}

/**
 * Build remediation section
 */
function buildRemediation(results) {
  if (!results.violations || results.violations.length === 0) {
    return '';
  }

  // Get unique remediation recommendations
  const recommendations = new Set();
  results.violations.forEach(v => {
    if (v.remediation) {
      recommendations.add(v.remediation);
    }
  });

  if (recommendations.size === 0) {
    return '';
  }

  let html = `
    <section class="remediation">
      <h2>Remediation Recommendations</h2>
      <div class="recommendations-list">
  `;

  Array.from(recommendations).forEach((rec, idx) => {
    html += `
      <div class="recommendation-item">
        <div class="recommendation-number">${idx + 1}</div>
        <div class="recommendation-text">${rec}</div>
      </div>
    `;
  });

  html += `
      </div>
      <div class="next-steps">
        <h3>Next Steps</h3>
        <ol>
          <li>Review all Critical issues and fix immediately</li>
          <li>Address Major issues within the next sprint</li>
          <li>Plan Minor issues for future improvements</li>
          <li>Re-run validation after fixes to verify compliance</li>
          <li>Consider manual testing for items requiring human review</li>
        </ol>
      </div>
    </section>
  `;

  return html;
}

/**
 * Build report footer
 */
function buildFooter(timestamp) {
  return `
    <footer class="report-footer">
      <p>Generated by PDF Orchestrator WCAG 2.2 Validator on ${timestamp}</p>
      <p>
        <a href="https://www.w3.org/WAI/WCAG22/quickref/" target="_blank">WCAG 2.2 Quick Reference</a> |
        <a href="https://www.w3.org/WAI/WCAG22/Understanding/" target="_blank">Understanding WCAG 2.2</a>
      </p>
    </footer>
  `;
}

/**
 * Helper: Group checks by category
 */
function groupChecksByCategory(checks) {
  const grouped = {};

  checks.forEach(check => {
    const category = check.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(check);
  });

  return grouped;
}

/**
 * Helper: Format category name
 */
function formatCategoryName(name) {
  return name
    .split(/(?=[A-Z])/)
    .join(' ')
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Helper: Format findings object
 */
function formatFindings(findings) {
  if (typeof findings === 'string') {
    return `<p>${findings}</p>`;
  }

  if (Array.isArray(findings)) {
    return `<ul>${findings.map(f => `<li>${f}</li>`).join('')}</ul>`;
  }

  if (typeof findings === 'object') {
    return `<pre>${JSON.stringify(findings, null, 2)}</pre>`;
  }

  return '';
}

/**
 * Get CSS for report styling
 */
function getReportCSS() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1F2937;
      background: #F9FAFB;
      padding: 20px;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    /* Header */
    .report-header {
      background: linear-gradient(135deg, #00393F 0%, #065B66 100%);
      color: white;
      padding: 40px;
    }

    .report-header h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 20px;
    }

    .report-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      font-size: 14px;
    }

    .meta-item {
      background: rgba(255, 255, 255, 0.1);
      padding: 12px;
      border-radius: 6px;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }

    .status-badge.pass {
      background: #10B981;
      color: white;
    }

    .status-badge.fail {
      background: #EF4444;
      color: white;
    }

    /* Sections */
    section {
      padding: 40px;
      border-bottom: 1px solid #E5E7EB;
    }

    section:last-child {
      border-bottom: none;
    }

    section h2 {
      font-size: 24px;
      font-weight: 700;
      color: #00393F;
      margin-bottom: 24px;
    }

    section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 16px;
    }

    /* Executive Summary */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .summary-card {
      background: #F9FAFB;
      padding: 24px;
      border-radius: 8px;
      border: 2px solid #E5E7EB;
      text-align: center;
    }

    .summary-label {
      font-size: 14px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }

    .summary-value {
      font-size: 48px;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 8px;
    }

    .summary-value.pass {
      color: #10B981;
    }

    .summary-value.fail {
      color: #EF4444;
    }

    .summary-value.warning {
      color: #F59E0B;
    }

    .summary-value.info {
      color: #3B82F6;
    }

    .summary-subtitle {
      font-size: 12px;
      color: #6B7280;
    }

    /* Scorecard */
    .scorecard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .scorecard-item {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }

    .scorecard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .scorecard-score {
      font-size: 18px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 6px;
    }

    .scorecard-score.pass {
      background: #D1FAE5;
      color: #065F46;
    }

    .scorecard-score.fail {
      background: #FEE2E2;
      color: #991B1B;
    }

    .progress-bar {
      height: 8px;
      background: #E5E7EB;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 16px;
    }

    .progress-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-fill.pass {
      background: #10B981;
    }

    .progress-fill.fail {
      background: #F59E0B;
    }

    .scorecard-checks {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      padding: 6px;
      border-radius: 4px;
    }

    .check-item.pass {
      background: #ECFDF5;
    }

    .check-item.fail {
      background: #FEF2F2;
    }

    .check-icon {
      font-weight: 700;
      font-size: 16px;
    }

    .check-item.pass .check-icon {
      color: #10B981;
    }

    .check-item.fail .check-icon {
      color: #EF4444;
    }

    /* Violations */
    .no-violations {
      text-align: center;
      padding: 60px 20px;
      background: #ECFDF5;
      border-radius: 8px;
    }

    .no-violations .icon {
      font-size: 64px;
      display: block;
      margin-bottom: 16px;
    }

    .no-violations p {
      font-size: 18px;
      color: #065F46;
    }

    .severity-group {
      margin-bottom: 32px;
    }

    .severity-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #F9FAFB;
      border-left: 4px solid;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .severity-icon {
      font-size: 24px;
    }

    .violations-grid {
      display: grid;
      gap: 16px;
    }

    .violation-card {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }

    .violation-card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .violation-header {
      padding: 16px;
      background: #F9FAFB;
      border-left: 4px solid;
    }

    .violation-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .violation-icon {
      font-size: 20px;
    }

    .wcag-criterion {
      font-size: 13px;
    }

    .wcag-criterion a {
      color: #00393F;
      text-decoration: none;
    }

    .wcag-criterion a:hover {
      text-decoration: underline;
    }

    .violation-body {
      padding: 16px;
    }

    .violation-description {
      margin-bottom: 12px;
      color: #4B5563;
    }

    .violation-location {
      font-size: 13px;
      color: #6B7280;
      margin-bottom: 8px;
    }

    .violation-details {
      margin-top: 12px;
      font-size: 13px;
    }

    .violation-details pre {
      background: #F3F4F6;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 12px;
      line-height: 1.5;
    }

    /* Remediation */
    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }

    .recommendation-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: #F9FAFB;
      border-radius: 8px;
      border-left: 4px solid #00393F;
    }

    .recommendation-number {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: #00393F;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }

    .recommendation-text {
      flex: 1;
      color: #374151;
    }

    .next-steps {
      background: #EFF6FF;
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #BFDBFE;
    }

    .next-steps h3 {
      color: #1E40AF;
      margin-bottom: 16px;
    }

    .next-steps ol {
      margin-left: 24px;
      color: #1E3A8A;
    }

    .next-steps li {
      margin-bottom: 8px;
    }

    /* Footer */
    .report-footer {
      text-align: center;
      padding: 32px;
      background: #F9FAFB;
      color: #6B7280;
      font-size: 14px;
    }

    .report-footer p {
      margin-bottom: 8px;
    }

    .report-footer a {
      color: #00393F;
      text-decoration: none;
      margin: 0 8px;
    }

    .report-footer a:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 768px) {
      body {
        padding: 0;
      }

      .container {
        border-radius: 0;
      }

      .report-header {
        padding: 24px;
      }

      section {
        padding: 24px;
      }

      .report-meta {
        grid-template-columns: 1fr;
      }

      .summary-grid {
        grid-template-columns: 1fr;
      }

      .scorecard-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Print styles */
    @media print {
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
      }

      .violation-card {
        page-break-inside: avoid;
      }
    }
  `;
}

/**
 * Get JavaScript for report interactivity
 */
function getReportJavaScript() {
  return `
    // Smooth scroll to violations
    document.querySelectorAll('a[href^="#violation-"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.style.background = '#FEF3C7';
          setTimeout(() => {
            target.style.background = '';
          }, 2000);
        }
      });
    });

    // Print functionality
    function printReport() {
      window.print();
    }

    // Export as JSON
    function exportJSON() {
      const data = ${JSON.stringify({}, null, 2)};
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accessibility-report.json';
      a.click();
    }
  `;
}

export default {
  generateAccessibilityReport,
  SEVERITY_LEVELS
};
