#!/usr/bin/env node

/**
 * Generate Visual Comparison Reports
 *
 * Uses DALL·E 3 to generate "ideal" corrected versions of pages with violations.
 * Creates professional before/after comparison reports with annotations.
 *
 * Usage:
 *   node scripts/generate-visual-comparison.js <validation-report-json>
 *   node scripts/generate-visual-comparison.js exports/validation-issues/report.json
 *
 * Output:
 *   - Before/after comparisons for each page with violations
 *   - Annotated violation explanations
 *   - Professional design mockups
 *   - Training examples for design team
 */

import { DALLE3VisualComparator } from './lib/dalle3-visual-comparator.js';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VisualComparisonGenerator {
  constructor(reportPath) {
    this.reportPath = reportPath;
    this.outputDir = path.join('exports', 'visual-comparisons');
    this.comparator = new DALLE3VisualComparator({
      outputDir: this.outputDir
    });
  }

  /**
   * Generate comprehensive visual comparison report
   */
  async generate() {
    console.log('🎨 Visual Comparison Generator');
    console.log('===============================\n');
    console.log(`Report: ${this.reportPath}\n`);

    try {
      // 1. Load validation report
      console.log('📄 Loading validation report...');
      const report = await this.loadReport();
      console.log(`✅ Loaded report with ${report.pages?.length || 0} pages\n`);

      // 2. Generate comparisons for pages with violations
      console.log('🎨 Generating visual comparisons...\n');
      const comparisons = await this.generateComparisons(report);

      if (comparisons.length === 0) {
        console.log('✅ No violations found - Document is perfect!');
        return { success: true, comparisons: [] };
      }

      // 3. Create comprehensive report
      console.log('\n📊 Creating comprehensive report...');
      const fullReport = await this.createComprehensiveReport(comparisons, report);

      // 4. Generate training examples
      console.log('📚 Generating training examples...');
      const trainingExamples = await this.generateTrainingExamples(comparisons);

      // 5. Display summary
      this.displaySummary(comparisons, fullReport);

      return {
        success: true,
        comparisons,
        report: fullReport,
        trainingExamples
      };

    } catch (error) {
      console.error('❌ Error generating visual comparisons:', error);
      throw error;
    }
  }

  /**
   * Load validation report
   */
  async loadReport() {
    try {
      const content = await fs.readFile(this.reportPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to load report: ${error.message}`);
    }
  }

  /**
   * Generate comparisons for all pages with violations
   */
  async generateComparisons(report) {
    const comparisons = [];

    // Extract pages with violations
    const pagesWithViolations = this.extractPagesWithViolations(report);

    if (pagesWithViolations.length === 0) {
      return comparisons;
    }

    console.log(`Found ${pagesWithViolations.length} page(s) with violations\n`);

    // Estimate cost
    const costEstimate = this.comparator.getCostEstimate(pagesWithViolations.length);
    console.log(`💰 Estimated cost: $${costEstimate.total.toFixed(2)}\n`);

    // Generate comparison for each page
    for (const pageData of pagesWithViolations) {
      console.log(`\n🎨 Processing page ${pageData.pageNumber}...`);
      console.log(`   Violations: ${pageData.violations.length}`);

      try {
        const comparison = await this.comparator.generateIdealVersion(
          pageData.violations,
          pageData.screenshot,
          pageData.pageNumber
        );

        comparisons.push({
          pageNumber: pageData.pageNumber,
          violationCount: pageData.violations.length,
          ...comparison
        });

        console.log(`   ✅ Generated ideal version`);
        console.log(`   💰 Cost: $${comparison.cost.toFixed(2)}`);

      } catch (error) {
        console.error(`   ❌ Failed to generate comparison: ${error.message}`);
      }
    }

    return comparisons;
  }

  /**
   * Extract pages with violations from report
   */
  extractPagesWithViolations(report) {
    const pages = [];

    // Handle different report formats
    if (report.pages) {
      // Format 1: Organized by pages
      for (const page of report.pages) {
        if (page.violations && page.violations.length > 0) {
          pages.push({
            pageNumber: page.pageNumber,
            violations: page.violations,
            screenshot: page.screenshot || this.guessScreenshotPath(page.pageNumber)
          });
        }
      }
    } else if (report.issues) {
      // Format 2: Flat list of issues
      const issuesByPage = {};

      for (const issue of report.issues) {
        const page = issue.pageNumber || 1;
        if (!issuesByPage[page]) {
          issuesByPage[page] = [];
        }
        issuesByPage[page].push(issue);
      }

      for (const [pageNum, violations] of Object.entries(issuesByPage)) {
        pages.push({
          pageNumber: parseInt(pageNum),
          violations,
          screenshot: this.guessScreenshotPath(parseInt(pageNum))
        });
      }
    }

    return pages;
  }

  /**
   * Guess screenshot path based on page number
   */
  guessScreenshotPath(pageNumber) {
    // Try common patterns
    const patterns = [
      `exports/validation-issues/screenshots/page-${pageNumber}.png`,
      `exports/screenshots/page-${pageNumber}.png`,
      `page-${pageNumber}.png`
    ];

    // Return first pattern (actual file check would be done during processing)
    return patterns[0];
  }

  /**
   * Create comprehensive report
   */
  async createComprehensiveReport(comparisons, originalReport) {
    const reportPath = path.join(
      this.outputDir,
      `visual-comparison-report-${Date.now()}.html`
    );

    const html = this.generateReportHTML(comparisons, originalReport);

    await fs.writeFile(reportPath, html);

    console.log(`\n📄 Comprehensive report: ${reportPath}`);

    return {
      path: reportPath,
      format: 'html',
      comparisons: comparisons.length
    };
  }

  /**
   * Generate HTML report
   */
  generateReportHTML(comparisons, originalReport) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Comparison Report - TEEI Document QA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      font-size: 2.5rem;
      color: #00393F;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 40px;
    }
    .summary {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary h2 {
      color: #00393F;
      margin-bottom: 20px;
    }
    .stat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat {
      padding: 20px;
      background: #f8f8f8;
      border-radius: 6px;
      border-left: 4px solid #BA8F5A;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #00393F;
    }
    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 5px;
    }
    .comparison-card {
      background: white;
      border-radius: 8px;
      padding: 30px;
      margin-bottom: 40px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .comparison-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #C9E4EC;
    }
    .comparison-header h3 {
      color: #00393F;
      font-size: 1.5rem;
    }
    .violation-badge {
      background: #913B2F;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    .comparison-item {
      text-align: center;
    }
    .comparison-item h4 {
      color: #00393F;
      margin-bottom: 15px;
      font-size: 1.1rem;
    }
    .comparison-item img {
      width: 100%;
      border-radius: 6px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .violations-list {
      background: #FFF1E2;
      padding: 20px;
      border-radius: 6px;
      border-left: 4px solid #BA8F5A;
    }
    .violations-list h4 {
      color: #00393F;
      margin-bottom: 15px;
    }
    .violation-item {
      padding: 10px 0;
      border-bottom: 1px solid #EFE1DC;
    }
    .violation-item:last-child {
      border-bottom: none;
    }
    .violation-category {
      font-weight: 600;
      color: #913B2F;
      text-transform: uppercase;
      font-size: 0.85rem;
    }
    .violation-message {
      margin-top: 5px;
      color: #333;
    }
    .footer {
      text-align: center;
      padding: 40px 20px;
      color: #666;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Visual Comparison Report</h1>
    <p class="subtitle">TEEI Document Quality Assurance - Before/After Analysis</p>

    <div class="summary">
      <h2>Executive Summary</h2>
      <div class="stat-grid">
        <div class="stat">
          <div class="stat-value">${comparisons.length}</div>
          <div class="stat-label">Pages with Violations</div>
        </div>
        <div class="stat">
          <div class="stat-value">${this.getTotalViolations(comparisons)}</div>
          <div class="stat-label">Total Violations</div>
        </div>
        <div class="stat">
          <div class="stat-value">$${this.getTotalCost(comparisons).toFixed(2)}</div>
          <div class="stat-label">Comparison Cost</div>
        </div>
        <div class="stat">
          <div class="stat-value">${new Date().toLocaleDateString()}</div>
          <div class="stat-label">Generated</div>
        </div>
      </div>
    </div>

    ${comparisons.map(comp => this.generateComparisonHTML(comp)).join('\n')}

  </div>

  <div class="footer">
    Generated by TEEI PDF Orchestrator Visual Comparison System<br>
    Powered by DALL·E 3 for ideal version generation
  </div>
</body>
</html>`;
  }

  /**
   * Generate HTML for single comparison
   */
  generateComparisonHTML(comparison) {
    return `
    <div class="comparison-card">
      <div class="comparison-header">
        <h3>Page ${comparison.pageNumber}</h3>
        <span class="violation-badge">${comparison.violationCount} Violations</span>
      </div>

      <div class="comparison-grid">
        <div class="comparison-item">
          <h4>❌ Current Version</h4>
          <img src="${comparison.original}" alt="Current version">
        </div>
        <div class="comparison-item">
          <h4>✅ Ideal Version</h4>
          <img src="${comparison.correctedUrl || 'data:image/png;base64,' + comparison.corrected.toString('base64')}" alt="Ideal version">
        </div>
      </div>

      <div class="violations-list">
        <h4>🔍 Violations Fixed:</h4>
        ${comparison.fixes.map(fix => `
          <div class="violation-item">
            <div class="violation-category">${fix.category || 'General'}</div>
            <div class="violation-message">${fix.message}</div>
          </div>
        `).join('')}
      </div>
    </div>
    `;
  }

  /**
   * Generate training examples
   */
  async generateTrainingExamples(comparisons) {
    const examplesDir = path.join(this.outputDir, 'training-examples');
    await fs.mkdir(examplesDir, { recursive: true });

    const examples = [];

    for (const comparison of comparisons) {
      const example = {
        pageNumber: comparison.pageNumber,
        violationCount: comparison.violationCount,
        violations: comparison.fixes.map(f => ({
          category: f.category,
          message: f.message,
          severity: f.severity
        })),
        learnings: this.extractLearnings(comparison.fixes),
        files: {
          before: path.join(examplesDir, `page-${comparison.pageNumber}-before.png`),
          after: path.join(examplesDir, `page-${comparison.pageNumber}-after.png`),
          prompt: path.join(examplesDir, `page-${comparison.pageNumber}-prompt.txt`)
        }
      };

      // Save files
      if (typeof comparison.original === 'string') {
        await fs.copyFile(comparison.original, example.files.before);
      }

      if (comparison.corrected) {
        await fs.writeFile(example.files.after, comparison.corrected);
      }

      await fs.writeFile(example.files.prompt, comparison.prompt);

      examples.push(example);
    }

    // Save training examples manifest
    const manifestPath = path.join(examplesDir, 'training-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(examples, null, 2));

    console.log(`📚 Training examples: ${examplesDir}`);
    console.log(`📄 Manifest: ${manifestPath}`);

    return examples;
  }

  /**
   * Extract learnings from violations
   */
  extractLearnings(violations) {
    const learnings = [];

    const categories = [...new Set(violations.map(v => v.category))];

    for (const category of categories) {
      const categoryViolations = violations.filter(v => v.category === category);

      learnings.push({
        category,
        count: categoryViolations.length,
        prevention: this.getPreventionTip(category)
      });
    }

    return learnings;
  }

  /**
   * Get prevention tip
   */
  getPreventionTip(category) {
    const tips = {
      color: 'Always use TEEI color swatches. Avoid manual hex entry.',
      typography: 'Install brand fonts first. Use paragraph styles.',
      cutoff: 'Use 40pt margins minimum. Test at 150-200% zoom.',
      spacing: 'Create spacing presets (60/20/12pt).',
      imagery: 'Source authentic program photos. Avoid stock.'
    };

    return tips[category] || 'Follow TEEI brand guidelines.';
  }

  /**
   * Display summary
   */
  displaySummary(comparisons, report) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('       VISUAL COMPARISON SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 RESULTS:');
    console.log(`   Pages processed: ${comparisons.length}`);
    console.log(`   Total violations: ${this.getTotalViolations(comparisons)}`);
    console.log(`   Total cost: $${this.getTotalCost(comparisons).toFixed(2)}\n`);

    console.log('📁 OUTPUT:');
    console.log(`   Visual comparisons: ${this.outputDir}`);
    console.log(`   Comprehensive report: ${report.path}`);
    console.log(`   Training examples: ${path.join(this.outputDir, 'training-examples')}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Get total violations
   */
  getTotalViolations(comparisons) {
    return comparisons.reduce((sum, c) => sum + c.violationCount, 0);
  }

  /**
   * Get total cost
   */
  getTotalCost(comparisons) {
    return comparisons.reduce((sum, c) => sum + (c.cost || 0), 0);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/generate-visual-comparison.js <validation-report-json>');
    console.log('Example: node scripts/generate-visual-comparison.js exports/validation-issues/report.json');
    process.exit(1);
  }

  const reportPath = args[0];

  // Verify file exists
  try {
    await fs.access(reportPath);
  } catch {
    console.error(`❌ Error: File not found: ${reportPath}`);
    process.exit(1);
  }

  const generator = new VisualComparisonGenerator(reportPath);
  await generator.generate();
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { VisualComparisonGenerator };
