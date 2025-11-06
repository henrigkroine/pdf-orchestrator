#!/usr/bin/env node

/**
 * Generate Fix Report
 *
 * Creates visual before/after reports with screenshots, metrics,
 * and detailed fix information.
 *
 * Usage:
 *   node generate-fix-report.js <fix-result-json> [output-dir]
 */

import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Fix Report Generator
 */
class FixReportGenerator {
  constructor(fixResultPath, outputDir) {
    this.fixResultPath = fixResultPath;
    this.outputDir = outputDir || path.join(projectRoot, 'exports', 'fix-reports');
    this.fixResult = null;
    this.reportData = {
      metadata: {},
      beforeAfter: {},
      timeline: [],
      metrics: {},
      screenshots: []
    };
  }

  /**
   * Generate complete fix report
   */
  async generate() {
    console.log('📊 Generating fix report...\n');

    // Load fix result
    await this.loadFixResult();

    // Create output directory
    await fs.mkdir(this.outputDir, { recursive: true });

    // Generate report sections
    await this.extractMetadata();
    await this.captureScreenshots();
    await this.generateTimeline();
    await this.calculateMetrics();
    await this.generateHTML();
    await this.generateJSON();

    console.log('\n✅ Fix report generated successfully!');
    console.log(`📁 Report location: ${this.outputDir}`);

    return this.reportData;
  }

  /**
   * Load fix result from JSON
   */
  async loadFixResult() {
    try {
      const data = await fs.readFile(this.fixResultPath, 'utf-8');
      this.fixResult = JSON.parse(data);
      console.log('✅ Loaded fix result data');
    } catch (error) {
      throw new Error(`Failed to load fix result: ${error.message}`);
    }
  }

  /**
   * Extract metadata
   */
  async extractMetadata() {
    this.reportData.metadata = {
      document: this.fixResult.document || 'Unknown',
      mode: this.fixResult.mode || 'unknown',
      timestamp: this.fixResult.timestamp || new Date().toISOString(),
      duration: this.calculateTotalDuration(),
      generatedAt: new Date().toISOString()
    };

    console.log('✅ Extracted metadata');
  }

  /**
   * Capture before/after screenshots
   */
  async captureScreenshots() {
    console.log('📸 Capturing screenshots...');

    const pdfPath = this.fixResult.document;

    if (!pdfPath) {
      console.warn('⚠️  No document path found, skipping screenshots');
      return;
    }

    try {
      // Check if file exists
      await fs.access(pdfPath);

      const browser = await chromium.launch({ headless: true });
      const page = await browser.newPage();

      // Convert PDF to screenshots (would use pdf2image or similar)
      // For now, capture HTML version if available
      const htmlPath = pdfPath.replace('.pdf', '.html');

      try {
        await page.goto(`file://${htmlPath}`);

        // Capture full page
        const screenshotPath = path.join(this.outputDir, 'document-after.png');
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });

        this.reportData.screenshots.push({
          type: 'after',
          path: screenshotPath,
          timestamp: new Date().toISOString()
        });

        console.log('  ✅ Captured after screenshot');

      } catch (error) {
        console.warn('  ⚠️  Could not capture screenshot:', error.message);
      }

      await browser.close();

    } catch (error) {
      console.warn('⚠️  Screenshot capture failed:', error.message);
    }
  }

  /**
   * Generate fix timeline
   */
  async generateTimeline() {
    const timeline = [];

    // Add detection event
    if (this.fixResult.result?.loop?.detect) {
      timeline.push({
        phase: 'Detection',
        timestamp: this.fixResult.timestamp,
        duration: this.fixResult.result.metrics.detectionTime,
        violations: this.fixResult.result.loop.detect.stats.totalViolations,
        status: 'completed'
      });
    }

    // Add diagnosis event
    if (this.fixResult.result?.loop?.diagnose) {
      timeline.push({
        phase: 'Diagnosis',
        duration: this.fixResult.result.metrics.diagnosisTime,
        systemicIssues: this.fixResult.result.loop.diagnose.systemicIssues?.length || 0,
        status: 'completed'
      });
    }

    // Add decision event
    if (this.fixResult.result?.loop?.decide) {
      timeline.push({
        phase: 'Decision',
        duration: this.fixResult.result.metrics.decisionTime,
        automatedFixes: this.fixResult.result.loop.decide.automatedFixes?.length || 0,
        manualFixes: this.fixResult.result.loop.decide.manualFixes?.length || 0,
        status: 'completed'
      });
    }

    // Add deployment event
    if (this.fixResult.result?.loop?.deploy) {
      timeline.push({
        phase: 'Deployment',
        duration: this.fixResult.result.metrics.deploymentTime,
        successful: this.fixResult.result.metrics.fixSuccess,
        failed: this.fixResult.result.loop.deploy.stats?.fixesFailed || 0,
        status: 'completed'
      });
    }

    // Add verification event
    if (this.fixResult.result?.loop?.verify) {
      timeline.push({
        phase: 'Verification',
        duration: this.fixResult.result.metrics.verificationTime,
        remainingViolations: this.fixResult.result.metrics.violationsAfter,
        status: 'completed'
      });
    }

    // Add learning event
    if (this.fixResult.result?.loop?.learn) {
      timeline.push({
        phase: 'Learning',
        duration: this.fixResult.result.metrics.learningTime,
        strategiesImproved: this.fixResult.result.loop.learn.successfulStrategies?.length || 0,
        status: 'completed'
      });
    }

    this.reportData.timeline = timeline;
    console.log('✅ Generated timeline');
  }

  /**
   * Calculate metrics
   */
  async calculateMetrics() {
    const metrics = {
      violations: {},
      fixes: {},
      time: {},
      efficiency: {}
    };

    // Violation metrics
    if (this.fixResult.result?.metrics) {
      metrics.violations = {
        before: this.fixResult.result.metrics.violationsBefore || 0,
        after: this.fixResult.result.metrics.violationsAfter || 0,
        fixed: (this.fixResult.result.metrics.violationsBefore || 0) -
               (this.fixResult.result.metrics.violationsAfter || 0),
        improvementPercent: this.calculateImprovement()
      };

      // Fix metrics
      metrics.fixes = {
        successful: this.fixResult.result.metrics.fixSuccess || 0,
        failed: this.fixResult.result.loop?.deploy?.stats?.fixesFailed || 0,
        skipped: this.fixResult.result.loop?.deploy?.stats?.fixesSkipped || 0,
        successRate: this.calculateSuccessRate()
      };

      // Time metrics
      metrics.time = {
        total: this.fixResult.result.metrics.totalTime || 0,
        detection: this.fixResult.result.metrics.detectionTime || 0,
        fixing: this.fixResult.result.metrics.deploymentTime || 0,
        verification: this.fixResult.result.metrics.verificationTime || 0,
        mttr: this.fixResult.result.metrics.mttr || 0
      };

      // Efficiency metrics
      const manualTimeEstimate = (metrics.violations.fixed) * 35 * 60; // 35 min per fix
      const automatedTime = metrics.time.total;
      const timeSaved = manualTimeEstimate - automatedTime;

      metrics.efficiency = {
        manualTimeEstimate: manualTimeEstimate,
        automatedTime: automatedTime,
        timeSaved: timeSaved,
        efficiencyGain: manualTimeEstimate > 0 ?
          ((timeSaved / manualTimeEstimate) * 100).toFixed(1) : 0
      };
    }

    this.reportData.metrics = metrics;
    console.log('✅ Calculated metrics');
  }

  /**
   * Generate HTML report
   */
  async generateHTML() {
    console.log('📄 Generating HTML report...');

    const html = this.generateHTMLContent();
    const htmlPath = path.join(this.outputDir, 'fix-report.html');

    await fs.writeFile(htmlPath, html);

    console.log(`  ✅ HTML report: ${htmlPath}`);
  }

  /**
   * Generate HTML content
   */
  generateHTMLContent() {
    const metrics = this.reportData.metrics;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fix Report - ${this.reportData.metadata.document}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 2rem;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
    }

    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .header p {
      opacity: 0.9;
    }

    .section {
      padding: 2rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h2 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #667eea;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }

    .metric-card {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      border-left: 4px solid #667eea;
    }

    .metric-label {
      font-size: 0.875rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
    }

    .metric-change {
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .metric-change.positive {
      color: #10b981;
    }

    .metric-change.negative {
      color: #ef4444;
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 2rem;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -2rem;
      top: 0;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #667eea;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #667eea;
    }

    .timeline-item::after {
      content: '';
      position: absolute;
      left: -1.7rem;
      top: 12px;
      width: 2px;
      height: calc(100% - 12px);
      background: #e0e0e0;
    }

    .timeline-item:last-child::after {
      display: none;
    }

    .timeline-phase {
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .timeline-details {
      font-size: 0.875rem;
      color: #666;
    }

    .success-indicator {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      font-weight: bold;
      text-align: center;
      margin-top: 1rem;
    }

    .success-indicator.excellent {
      background: #d1fae5;
      color: #065f46;
    }

    .success-indicator.good {
      background: #dbeafe;
      color: #1e40af;
    }

    .success-indicator.partial {
      background: #fef3c7;
      color: #92400e;
    }

    .success-indicator.limited {
      background: #fee2e2;
      color: #991b1b;
    }

    .screenshot-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-top: 1rem;
    }

    .screenshot-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .screenshot-card img {
      width: 100%;
      display: block;
    }

    .screenshot-label {
      padding: 1rem;
      background: #f9fafb;
      font-weight: bold;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Automated Fix Report</h1>
      <p>Document: ${this.reportData.metadata.document}</p>
      <p>Generated: ${new Date(this.reportData.metadata.generatedAt).toLocaleString()}</p>
      <p>Mode: ${this.reportData.metadata.mode}</p>
    </div>

    <div class="section">
      <h2>📊 Summary</h2>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Violations Fixed</div>
          <div class="metric-value">${metrics.violations?.fixed || 0}</div>
          <div class="metric-change positive">
            ${metrics.violations?.improvementPercent || 0}% improvement
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Success Rate</div>
          <div class="metric-value">${metrics.fixes?.successRate || 0}%</div>
          <div class="metric-change ${(metrics.fixes?.successRate || 0) >= 90 ? 'positive' : 'negative'}">
            ${metrics.fixes?.successful || 0} successful, ${metrics.fixes?.failed || 0} failed
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Time Saved</div>
          <div class="metric-value">${this.formatTime(metrics.efficiency?.timeSaved || 0)}</div>
          <div class="metric-change positive">
            ${metrics.efficiency?.efficiencyGain || 0}% faster than manual
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Total Duration</div>
          <div class="metric-value">${this.formatTime(metrics.time?.total || 0)}</div>
          <div class="metric-change">
            MTTR: ${(metrics.time?.mttr || 0).toFixed(0)}ms per violation
          </div>
        </div>
      </div>

      ${this.getSuccessIndicator(metrics.violations?.improvementPercent || 0)}
    </div>

    <div class="section">
      <h2>⏱️ Timeline</h2>
      <div class="timeline">
        ${this.reportData.timeline.map(item => `
          <div class="timeline-item">
            <div class="timeline-phase">${item.phase}</div>
            <div class="timeline-details">
              Duration: ${this.formatTime(item.duration || 0)}
              ${item.violations ? `<br>Violations: ${item.violations}` : ''}
              ${item.automatedFixes ? `<br>Automated fixes: ${item.automatedFixes}` : ''}
              ${item.successful !== undefined ? `<br>Successful: ${item.successful}` : ''}
              ${item.remainingViolations !== undefined ? `<br>Remaining: ${item.remainingViolations}` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h2>📈 Detailed Metrics</h2>

      <h3>Violations</h3>
      <ul>
        <li>Before: ${metrics.violations?.before || 0}</li>
        <li>After: ${metrics.violations?.after || 0}</li>
        <li>Fixed: ${metrics.violations?.fixed || 0}</li>
        <li>Improvement: ${metrics.violations?.improvementPercent || 0}%</li>
      </ul>

      <h3>Fixes</h3>
      <ul>
        <li>Successful: ${metrics.fixes?.successful || 0}</li>
        <li>Failed: ${metrics.fixes?.failed || 0}</li>
        <li>Skipped: ${metrics.fixes?.skipped || 0}</li>
        <li>Success Rate: ${metrics.fixes?.successRate || 0}%</li>
      </ul>

      <h3>Time Breakdown</h3>
      <ul>
        <li>Detection: ${this.formatTime(metrics.time?.detection || 0)}</li>
        <li>Fixing: ${this.formatTime(metrics.time?.fixing || 0)}</li>
        <li>Verification: ${this.formatTime(metrics.time?.verification || 0)}</li>
        <li>Total: ${this.formatTime(metrics.time?.total || 0)}</li>
      </ul>
    </div>

    ${this.reportData.screenshots.length > 0 ? `
      <div class="section">
        <h2>📸 Screenshots</h2>
        <div class="screenshot-grid">
          ${this.reportData.screenshots.map(screenshot => `
            <div class="screenshot-card">
              <img src="${path.basename(screenshot.path)}" alt="${screenshot.type}">
              <div class="screenshot-label">${screenshot.type.toUpperCase()}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Generate JSON report
   */
  async generateJSON() {
    const jsonPath = path.join(this.outputDir, 'fix-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(this.reportData, null, 2));
    console.log(`  ✅ JSON report: ${jsonPath}`);
  }

  /**
   * Get success indicator HTML
   */
  getSuccessIndicator(improvementPercent) {
    let cssClass = 'limited';
    let text = 'LIMITED SUCCESS';

    if (improvementPercent >= 80) {
      cssClass = 'excellent';
      text = 'EXCELLENT RESULT!';
    } else if (improvementPercent >= 50) {
      cssClass = 'good';
      text = 'GOOD RESULT';
    } else if (improvementPercent >= 25) {
      cssClass = 'partial';
      text = 'PARTIAL SUCCESS';
    }

    return `<div class="success-indicator ${cssClass}">${text}</div>`;
  }

  // Utility methods

  calculateTotalDuration() {
    if (this.fixResult.result?.metrics?.totalTime) {
      return this.fixResult.result.metrics.totalTime;
    }
    return 0;
  }

  calculateImprovement() {
    const metrics = this.fixResult.result?.metrics;
    if (!metrics) return 0;

    const before = metrics.violationsBefore || 0;
    const after = metrics.violationsAfter || 0;

    if (before === 0) return 0;

    return (((before - after) / before) * 100).toFixed(1);
  }

  calculateSuccessRate() {
    const stats = this.fixResult.result?.loop?.deploy?.stats;
    if (!stats) return 0;

    const successful = stats.fixesSuccessful || 0;
    const total = successful + (stats.fixesFailed || 0);

    if (total === 0) return 0;

    return ((successful / total) * 100).toFixed(1);
  }

  formatTime(seconds) {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      const secs = Math.floor(seconds % 60);
      return `${minutes}m ${secs}s`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Generate Fix Report
===================

Usage:
  node generate-fix-report.js <fix-result-json> [output-dir]

Arguments:
  fix-result-json   Path to fix result JSON file
  output-dir        Output directory (default: exports/fix-reports)

Example:
  node generate-fix-report.js exports/fix-results/fix-123.json
`);
    process.exit(0);
  }

  const fixResultPath = args[0];
  const outputDir = args[1];

  const generator = new FixReportGenerator(fixResultPath, outputDir);
  await generator.generate();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default FixReportGenerator;
