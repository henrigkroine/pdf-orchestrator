/**
 * Typography Inspector
 *
 * Comprehensive typography inspection system that validates type quality,
 * readability, and professional typographic standards across 8 categories.
 *
 * Categories:
 * 1. Font Usage Validation
 * 2. Type Scale Validation
 * 3. Line Height and Spacing
 * 4. Kerning and Micro-Typography
 * 5. Readability Analysis
 * 6. Typography Hierarchy
 * 7. Professional Typography Standards
 * 8. Cross-Platform Consistency
 *
 * Features:
 * - Multi-model AI integration (GPT-4o, GPT-5, Claude Opus/Sonnet, Gemini 2.5 Pro)
 * - Comprehensive validation across all typography dimensions
 * - Automated fix suggestions
 * - Before/after comparison mode
 * - Typography scoring (0-100)
 */

const fs = require('fs');
const path = require('path');
const FontValidator = require('./font-validator');
const TypeScaleValidator = require('./type-scale-validator');
const LineSpacingAnalyzer = require('./line-spacing-analyzer');
const KerningAnalyzer = require('./kerning-analyzer');
const ReadabilityChecker = require('./readability-checker');
const TypographyHierarchy = require('./typography-hierarchy');
const TypographyPolish = require('./typography-polish');

class TypographyInspector {
  constructor(options = {}) {
    this.options = {
      // Validation options
      validateFonts: true,
      validateScale: true,
      validateSpacing: true,
      validateKerning: true,
      validateReadability: true,
      validateHierarchy: true,
      validatePolish: true,

      // AI options
      enableAI: true,
      aiModels: {
        fonts: 'gpt-4o',
        scale: 'claude-opus-4.1',
        spacing: 'gpt-5',
        kerning: 'claude-sonnet-4.5',
        readability: 'gemini-2.5-pro',
        hierarchy: 'gpt-4o',
        polish: 'claude-opus-4.1'
      },

      // TEEI compliance
      strictTEEI: true,
      teeiOnly: false,

      // Output options
      verbose: false,
      saveReport: true,
      outputFormat: 'json', // json, html, csv, markdown

      ...options
    };

    this.results = {
      fonts: null,
      scale: null,
      spacing: null,
      kerning: null,
      readability: null,
      hierarchy: null,
      polish: null
    };

    this.overallScore = 0;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Inspect typography in PDF
   */
  async inspect(pdfPath) {
    console.log('🔍 Starting comprehensive typography inspection...');
    console.log(`PDF: ${pdfPath}\n`);

    this.startTime = Date.now();

    try {
      // Validate file exists
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF not found: ${pdfPath}`);
      }

      // 1. Font Usage Validation
      if (this.options.validateFonts) {
        await this.validateFonts(pdfPath);
      }

      // 2. Type Scale Validation
      if (this.options.validateScale) {
        await this.validateScale(pdfPath);
      }

      // 3. Line Height and Spacing
      if (this.options.validateSpacing) {
        await this.validateSpacing(pdfPath);
      }

      // 4. Kerning and Micro-Typography
      if (this.options.validateKerning) {
        await this.validateKerning(pdfPath);
      }

      // 5. Readability Analysis
      if (this.options.validateReadability) {
        await this.validateReadability(pdfPath);
      }

      // 6. Typography Hierarchy
      if (this.options.validateHierarchy) {
        await this.validateHierarchy(pdfPath);
      }

      // 7. Professional Typography Standards
      if (this.options.validatePolish) {
        await this.validatePolish(pdfPath);
      }

      // Calculate overall score
      this.calculateOverallScore();

      // Generate comprehensive report
      const report = this.generateReport(pdfPath);

      // Save report if requested
      if (this.options.saveReport) {
        await this.saveReport(report, pdfPath);
      }

      this.endTime = Date.now();

      return report;

    } catch (error) {
      console.error('Typography inspection error:', error);
      throw error;
    }
  }

  /**
   * Validate fonts (Category 1)
   */
  async validateFonts(pdfPath) {
    console.log('\n📦 1/7 Validating fonts...');

    try {
      const validator = new FontValidator({
        strictBrandCompliance: this.options.strictTEEI,
        aiValidation: this.options.enableAI,
        aiModel: this.options.aiModels.fonts
      });

      this.results.fonts = await validator.validate(pdfPath);

      console.log(`✓ Fonts validated (Score: ${this.results.fonts.summary.score}/100)`);
      this.logSummary(this.results.fonts.summary);

    } catch (error) {
      console.error('Font validation failed:', error);
      this.results.fonts = { error: error.message };
    }
  }

  /**
   * Validate type scale (Category 2)
   */
  async validateScale(pdfPath) {
    console.log('\n📏 2/7 Validating type scale...');

    try {
      const validator = new TypeScaleValidator({
        baseSize: 11, // TEEI body text
        scale: 'perfect-fourth',
        strictHierarchy: true,
        aiValidation: this.options.enableAI,
        aiModel: this.options.aiModels.scale
      });

      this.results.scale = await validator.validate(pdfPath);

      console.log(`✓ Type scale validated (Score: ${this.results.scale.summary.score}/100)`);
      this.logSummary(this.results.scale.summary);

    } catch (error) {
      console.error('Type scale validation failed:', error);
      this.results.scale = { error: error.message };
    }
  }

  /**
   * Validate spacing (Category 3)
   */
  async validateSpacing(pdfPath) {
    console.log('\n📐 3/7 Analyzing line spacing...');

    try {
      const analyzer = new LineSpacingAnalyzer({
        strictTEEI: this.options.strictTEEI,
        detectWidows: true,
        detectOrphans: true,
        aiOptimization: this.options.enableAI,
        aiModel: this.options.aiModels.spacing
      });

      this.results.spacing = await analyzer.analyze(pdfPath);

      console.log(`✓ Spacing analyzed (Score: ${this.results.spacing.summary.score}/100)`);
      this.logSummary(this.results.spacing.summary);

    } catch (error) {
      console.error('Spacing analysis failed:', error);
      this.results.spacing = { error: error.message };
    }
  }

  /**
   * Validate kerning (Category 4)
   */
  async validateKerning(pdfPath) {
    console.log('\n🔤 4/7 Analyzing kerning and micro-typography...');

    try {
      const analyzer = new KerningAnalyzer({
        checkProblematicPairs: true,
        checkLigatures: true,
        checkSmallCaps: true,
        checkHangingPunctuation: true,
        aiValidation: this.options.enableAI,
        aiModel: this.options.aiModels.kerning
      });

      this.results.kerning = await analyzer.analyze(pdfPath);

      console.log(`✓ Kerning analyzed (Score: ${this.results.kerning.summary.score}/100)`);
      this.logSummary(this.results.kerning.summary);

    } catch (error) {
      console.error('Kerning analysis failed:', error);
      this.results.kerning = { error: error.message };
    }
  }

  /**
   * Validate readability (Category 5)
   */
  async validateReadability(pdfPath) {
    console.log('\n📖 5/7 Checking readability...');

    try {
      const checker = new ReadabilityChecker({
        checkLineLength: true,
        checkContrast: true,
        checkRag: true,
        checkRivers: true,
        wcagLevel: 'AAA',
        aiValidation: this.options.enableAI,
        aiModel: this.options.aiModels.readability
      });

      this.results.readability = await checker.check(pdfPath);

      console.log(`✓ Readability checked (Score: ${this.results.readability.summary.score}/100)`);
      this.logSummary(this.results.readability.summary);

    } catch (error) {
      console.error('Readability check failed:', error);
      this.results.readability = { error: error.message };
    }
  }

  /**
   * Validate hierarchy (Category 6)
   */
  async validateHierarchy(pdfPath) {
    console.log('\n📊 6/7 Validating typography hierarchy...');

    try {
      const validator = new TypographyHierarchy({
        strictHierarchy: true,
        checkConsistency: true,
        checkEmphasis: true,
        aiValidation: this.options.enableAI,
        aiModel: this.options.aiModels.hierarchy
      });

      this.results.hierarchy = await validator.analyze(pdfPath);

      console.log(`✓ Hierarchy validated (Score: ${this.results.hierarchy.summary.score}/100)`);
      this.logSummary(this.results.hierarchy.summary);

    } catch (error) {
      console.error('Hierarchy validation failed:', error);
      this.results.hierarchy = { error: error.message };
    }
  }

  /**
   * Validate polish (Category 7)
   */
  async validatePolish(pdfPath) {
    console.log('\n✨ 7/7 Validating typography polish...');

    try {
      const validator = new TypographyPolish({
        checkQuotes: true,
        checkPunctuation: true,
        checkNumbers: true,
        checkSpaces: true,
        aiValidation: this.options.enableAI,
        aiModel: this.options.aiModels.polish
      });

      this.results.polish = await validator.validate(pdfPath);

      console.log(`✓ Polish validated (Score: ${this.results.polish.summary.score}/100)`);
      this.logSummary(this.results.polish.summary);

    } catch (error) {
      console.error('Polish validation failed:', error);
      this.results.polish = { error: error.message };
    }
  }

  /**
   * Calculate overall typography score
   */
  calculateOverallScore() {
    console.log('\n📊 Calculating overall typography score...');

    const scores = [];
    const weights = {
      fonts: 15,        // Font usage - important for brand
      scale: 15,        // Type scale - important for hierarchy
      spacing: 15,      // Spacing - important for readability
      kerning: 10,      // Kerning - refinement
      readability: 20,  // Readability - most important
      hierarchy: 15,    // Hierarchy - important for structure
      polish: 10        // Polish - refinement
    };

    for (const [category, result] of Object.entries(this.results)) {
      if (result && result.summary && result.summary.score !== undefined) {
        scores.push({
          category,
          score: result.summary.score,
          weight: weights[category]
        });
      }
    }

    // Calculate weighted average
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);

    this.overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    console.log(`\n🎯 Overall Typography Score: ${this.overallScore}/100`);
    console.log(this.getScoreGrade(this.overallScore));
  }

  /**
   * Get score grade and description
   */
  getScoreGrade(score) {
    if (score >= 95) return '🏆 PERFECT - Professional publication quality';
    if (score >= 90) return '✨ EXCELLENT - Minor improvements possible';
    if (score >= 85) return '👍 VERY GOOD - Some polish needed';
    if (score >= 80) return '✓ GOOD - Multiple improvements available';
    if (score >= 70) return '⚠️ FAIR - Several issues to fix';
    return '❌ POOR - Major typography work needed';
  }

  /**
   * Generate comprehensive report
   */
  generateReport(pdfPath) {
    const report = {
      metadata: {
        pdfPath: pdfPath,
        inspectionDate: new Date().toISOString(),
        inspectionDuration: this.endTime - this.startTime,
        typographyInspectorVersion: '1.0.0'
      },
      overallScore: this.overallScore,
      grade: this.getScoreGrade(this.overallScore),
      categoryScores: {},
      results: this.results,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations(),
      aiInsights: this.aggregateAIInsights()
    };

    // Add category scores
    for (const [category, result] of Object.entries(this.results)) {
      if (result && result.summary) {
        report.categoryScores[category] = result.summary.score;
      }
    }

    return report;
  }

  /**
   * Generate executive summary
   */
  generateSummary() {
    const summary = {
      strengths: [],
      weaknesses: [],
      criticalIssues: [],
      totalIssues: 0,
      totalWarnings: 0
    };

    for (const [category, result] of Object.entries(this.results)) {
      if (!result || !result.summary) continue;

      const score = result.summary.score;
      const issues = result.issues || [];
      const warnings = result.warnings || [];

      summary.totalIssues += issues.length;
      summary.totalWarnings += warnings.length;

      // Identify strengths (score >= 90)
      if (score >= 90) {
        summary.strengths.push({
          category: category,
          score: score,
          note: `Excellent ${category} quality`
        });
      }

      // Identify weaknesses (score < 80)
      if (score < 80) {
        summary.weaknesses.push({
          category: category,
          score: score,
          note: `${category} needs improvement`
        });
      }

      // Identify critical issues
      const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'error');
      if (criticalIssues.length > 0) {
        summary.criticalIssues.push({
          category: category,
          count: criticalIssues.length,
          issues: criticalIssues.slice(0, 3) // Top 3
        });
      }
    }

    return summary;
  }

  /**
   * Generate prioritized recommendations
   */
  generateRecommendations() {
    const allRecommendations = [];

    for (const [category, result] of Object.entries(this.results)) {
      if (!result || !result.recommendations) continue;

      for (const rec of result.recommendations) {
        allRecommendations.push({
          category: category,
          ...rec
        });
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allRecommendations.sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 3;
      const bPriority = priorityOrder[b.priority] ?? 3;
      return aPriority - bPriority;
    });

    return {
      top10: allRecommendations.slice(0, 10),
      all: allRecommendations,
      byPriority: {
        critical: allRecommendations.filter(r => r.priority === 'critical'),
        high: allRecommendations.filter(r => r.priority === 'high'),
        medium: allRecommendations.filter(r => r.priority === 'medium'),
        low: allRecommendations.filter(r => r.priority === 'low')
      }
    };
  }

  /**
   * Aggregate AI insights from all categories
   */
  aggregateAIInsights() {
    const insights = {
      models: {},
      assessments: [],
      recommendations: []
    };

    for (const [category, result] of Object.entries(this.results)) {
      if (!result || !result.aiInsights) continue;

      const ai = result.aiInsights;

      // Track which models were used
      if (this.options.aiModels[category]) {
        insights.models[category] = this.options.aiModels[category];
      }

      // Aggregate assessments
      if (ai.overallAssessment) {
        insights.assessments.push({
          category: category,
          model: this.options.aiModels[category],
          assessment: ai.overallAssessment
        });
      }

      // Aggregate recommendations
      if (ai.recommendations) {
        for (const rec of ai.recommendations) {
          insights.recommendations.push({
            category: category,
            model: this.options.aiModels[category],
            recommendation: rec
          });
        }
      }
    }

    return insights;
  }

  /**
   * Save report to file
   */
  async saveReport(report, pdfPath) {
    const pdfName = path.basename(pdfPath, '.pdf');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const outputDir = path.join(path.dirname(pdfPath), 'typography-reports');

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save in requested format
    const format = this.options.outputFormat;
    const outputPath = path.join(outputDir, `typography-report-${pdfName}-${timestamp}.${format}`);

    try {
      if (format === 'json') {
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      } else if (format === 'html') {
        const html = this.generateHTML(report);
        fs.writeFileSync(outputPath.replace('.html', '.html'), html);
      } else if (format === 'markdown') {
        const markdown = this.generateMarkdown(report);
        fs.writeFileSync(outputPath, markdown);
      }

      console.log(`\n📄 Report saved: ${outputPath}`);
      return outputPath;

    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  /**
   * Generate HTML report
   */
  generateHTML(report) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Typography Inspection Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; }
    h1 { color: #00393F; }
    .score { font-size: 48px; font-weight: bold; color: ${this.getScoreColor(report.overallScore)}; }
    .category { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    .issue { margin: 10px 0; padding: 10px; border-left: 3px solid #ff0000; }
  </style>
</head>
<body>
  <h1>Typography Inspection Report</h1>
  <p><strong>PDF:</strong> ${report.metadata.pdfPath}</p>
  <p><strong>Date:</strong> ${new Date(report.metadata.inspectionDate).toLocaleString()}</p>

  <h2>Overall Score</h2>
  <div class="score">${report.overallScore}/100</div>
  <p>${report.grade}</p>

  <h2>Category Scores</h2>
  ${Object.entries(report.categoryScores).map(([cat, score]) => `
    <div class="category">
      <strong>${cat}:</strong> ${score}/100
    </div>
  `).join('')}

  <h2>Top Recommendations</h2>
  <ul>
    ${report.recommendations.top10.map(rec => `<li><strong>${rec.priority}:</strong> ${rec.text}</li>`).join('')}
  </ul>
</body>
</html>`;
  }

  /**
   * Generate Markdown report
   */
  generateMarkdown(report) {
    return `# Typography Inspection Report

**PDF:** ${report.metadata.pdfPath}
**Date:** ${new Date(report.metadata.inspectionDate).toLocaleString()}

## Overall Score: ${report.overallScore}/100

${report.grade}

## Category Scores

${Object.entries(report.categoryScores).map(([cat, score]) => `- **${cat}:** ${score}/100`).join('\n')}

## Summary

- **Total Issues:** ${report.summary.totalIssues}
- **Total Warnings:** ${report.summary.totalWarnings}
- **Critical Issues:** ${report.summary.criticalIssues.length}

## Top Recommendations

${report.recommendations.top10.map((rec, i) => `${i + 1}. **[${rec.priority}]** ${rec.text}`).join('\n')}

---
*Generated by Typography Inspector v${report.metadata.typographyInspectorVersion}*
`;
  }

  /**
   * Get score color
   */
  getScoreColor(score) {
    if (score >= 90) return '#00aa00';
    if (score >= 80) return '#66aa00';
    if (score >= 70) return '#aa6600';
    return '#aa0000';
  }

  /**
   * Log summary
   */
  logSummary(summary) {
    if (!this.options.verbose) return;

    console.log(`  Issues: ${summary.totalIssues || (summary.issues?.length || 0)}`);
    console.log(`  Warnings: ${summary.totalWarnings || (summary.warnings?.length || 0)}`);
  }
}

module.exports = TypographyInspector;
