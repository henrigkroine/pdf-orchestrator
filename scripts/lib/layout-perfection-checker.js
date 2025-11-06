/**
 * Layout Perfection Checker
 *
 * Main orchestrator for comprehensive layout analysis.
 * Integrates all 8 specialized analyzers and multi-model AI critique.
 *
 * Analyzers:
 * 1. Golden Ratio Validator - Mathematical proportion perfection
 * 2. Grid Alignment Checker - 12-column and baseline grid compliance
 * 3. Hierarchy Analyzer - Visual hierarchy clarity
 * 4. Spacing Analyzer - Spacing consistency and rhythm
 * 5. Alignment Checker - Pixel-perfect alignment
 * 6. Balance Analyzer - Visual weight distribution
 * 7. Proximity Checker - Gestalt principles and grouping
 * 8. Professional Standards - Industry benchmarks
 *
 * AI Models:
 * - Claude Opus 4.1: Golden ratio and deep reasoning
 * - GPT-4o: Grid system and proximity analysis
 * - GPT-5: Spacing optimization
 * - Claude Sonnet 4.5: Alignment precision critique
 * - Gemini 2.5 Pro: Hierarchy and balance
 *
 * @module layout-perfection-checker
 */

const fs = require('fs').promises;
const path = require('path');
const GoldenRatioValidator = require('./golden-ratio-validator');
const GridAlignmentChecker = require('./grid-alignment-checker');
const HierarchyAnalyzer = require('./hierarchy-analyzer');
const SpacingAnalyzer = require('./spacing-analyzer');
const AlignmentChecker = require('./alignment-checker');
const BalanceAnalyzer = require('./balance-analyzer');
const ProximityChecker = require('./proximity-checker');

class LayoutPerfectionChecker {
  constructor(config = null) {
    this.config = config || this.loadDefaultConfig();
    this.results = {
      overall: null,
      goldenRatio: null,
      gridAlignment: null,
      hierarchy: null,
      spacing: null,
      alignment: null,
      balance: null,
      proximity: null,
      professionalStandards: null,
      aiCritiques: {},
      violations: [],
      recommendations: [],
      metadata: {
        version: '1.0.0',
        timestamp: null,
        duration: null
      }
    };

    // Initialize analyzers
    this.analyzers = {
      goldenRatio: new GoldenRatioValidator(this.config),
      gridAlignment: new GridAlignmentChecker(this.config),
      hierarchy: new HierarchyAnalyzer(this.config),
      spacing: new SpacingAnalyzer(this.config),
      alignment: new AlignmentChecker(this.config),
      balance: new BalanceAnalyzer(this.config),
      proximity: new ProximityChecker(this.config)
    };
  }

  loadDefaultConfig() {
    const configPath = path.join(__dirname, '../../config/layout-perfection-config.json');
    try {
      return require(configPath);
    } catch (error) {
      console.warn('⚠️  Could not load config, using defaults');
      return this.getDefaultConfig();
    }
  }

  getDefaultConfig() {
    return {
      scoring: {
        weights: {
          goldenRatio: 0.15,
          gridAlignment: 0.20,
          hierarchy: 0.15,
          spacing: 0.15,
          alignment: 0.15,
          balance: 0.10,
          proximity: 0.10
        }
      },
      ai: {
        enabled: false // Disabled by default (requires API keys)
      }
    };
  }

  /**
   * Main validation method - runs all 8 analyzers
   */
  async validate(layoutData) {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('          LAYOUT PERFECTION CHECKER v1.0.0');
    console.log('     Mathematical Precision & Professional Standards');
    console.log('════════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    this.results.metadata.timestamp = new Date().toISOString();

    try {
      // Run all analyzers in sequence
      console.log('🔬 Running 8 comprehensive layout analyzers...\n');

      // 1. Golden Ratio Validator
      console.log('[1/8] Golden Ratio Validator');
      const goldenRatioResults = await this.analyzers.goldenRatio.validate(layoutData);
      this.results.goldenRatio = goldenRatioResults;

      // 2. Grid Alignment Checker
      console.log('[2/8] Grid Alignment Checker');
      const gridResults = await this.analyzers.gridAlignment.validate(layoutData);
      this.results.gridAlignment = gridResults;

      // 3. Hierarchy Analyzer
      console.log('[3/8] Hierarchy Analyzer');
      const hierarchyResults = await this.analyzers.hierarchy.validate(layoutData);
      this.results.hierarchy = hierarchyResults;

      // 4. Spacing Analyzer
      console.log('[4/8] Spacing Analyzer');
      const spacingResults = await this.analyzers.spacing.validate(layoutData);
      this.results.spacing = spacingResults;

      // 5. Alignment Checker
      console.log('[5/8] Alignment Checker');
      const alignmentResults = await this.analyzers.alignment.validate(layoutData);
      this.results.alignment = alignmentResults;

      // 6. Balance Analyzer
      console.log('[6/8] Balance Analyzer');
      const balanceResults = await this.analyzers.balance.validate(layoutData);
      this.results.balance = balanceResults;

      // 7. Proximity Checker
      console.log('[7/8] Proximity Checker');
      const proximityResults = await this.analyzers.proximity.validate(layoutData);
      this.results.proximity = proximityResults;

      // 8. Professional Standards Assessment
      console.log('[8/8] Professional Standards Assessment');
      const professionalResults = await this.assessProfessionalStandards();
      this.results.professionalStandards = professionalResults;

      // Aggregate violations and recommendations
      this.aggregateViolations();
      this.aggregateRecommendations();

      // Calculate overall perfection score
      const overallScore = this.calculateOverallScore();
      this.results.overall = overallScore;

      // Generate AI critiques (if enabled)
      if (this.config.ai?.enabled) {
        console.log('\n🤖 Generating multi-model AI critiques...');
        await this.generateAICritiques(layoutData);
      }

      const duration = Date.now() - startTime;
      this.results.metadata.duration = duration;

      this.printSummary();

      return this.results;

    } catch (error) {
      console.error('❌ Layout Perfection Check Error:', error.message);
      throw error;
    }
  }

  /**
   * Aggregate violations from all analyzers
   */
  aggregateViolations() {
    const allViolations = [];

    Object.entries(this.analyzers).forEach(([name, analyzer]) => {
      if (analyzer.results?.violations) {
        analyzer.results.violations.forEach(violation => {
          allViolations.push({
            ...violation,
            analyzer: name
          });
        });
      }
    });

    // Sort by severity
    const severityOrder = { high: 1, medium: 2, low: 3 };
    allViolations.sort((a, b) =>
      (severityOrder[a.severity] || 999) - (severityOrder[b.severity] || 999)
    );

    this.results.violations = allViolations;
  }

  /**
   * Aggregate recommendations from all analyzers
   */
  aggregateRecommendations() {
    const allRecommendations = [];

    Object.entries(this.analyzers).forEach(([name, analyzer]) => {
      if (analyzer.results?.recommendations) {
        analyzer.results.recommendations.forEach(rec => {
          allRecommendations.push({
            ...rec,
            analyzer: name
          });
        });
      }
    });

    // Sort by priority
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    allRecommendations.sort((a, b) =>
      (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999)
    );

    this.results.recommendations = allRecommendations;
  }

  /**
   * Assess against professional standards
   */
  async assessProfessionalStandards() {
    console.log('\n   Assessing against professional standards...\n');

    const standards = this.config.professionalStandards?.industryBenchmarks || {};
    const benchmarks = {
      awardWinning: standards.awardWinning || {},
      professional: standards.professional || {},
      acceptable: standards.acceptable || {}
    };

    // Extract scores from analyzers
    const scores = {
      goldenRatioCompliance: this.results.goldenRatio?.overall?.score / 100 || 0,
      gridAlignment: this.results.gridAlignment?.overall?.score / 100 || 0,
      spacingConsistency: this.results.spacing?.overall?.score / 100 || 0,
      alignmentPrecision: this.results.alignment?.overall?.score / 100 || 0,
      hierarchyClarity: this.results.hierarchy?.overall?.score / 100 || 0
    };

    // Determine benchmark level
    let benchmarkLevel = 'Below Acceptable';
    let benchmarkDescription = 'Significant improvements needed';

    if (this.meetsAllBenchmarks(scores, benchmarks.awardWinning)) {
      benchmarkLevel = 'Award-Winning';
      benchmarkDescription = 'Exceptional quality worthy of design awards';
    } else if (this.meetsAllBenchmarks(scores, benchmarks.professional)) {
      benchmarkLevel = 'Professional';
      benchmarkDescription = 'Meets professional industry standards';
    } else if (this.meetsAllBenchmarks(scores, benchmarks.acceptable)) {
      benchmarkLevel = 'Acceptable';
      benchmarkDescription = 'Meets minimum acceptable standards';
    }

    console.log(`      Benchmark Level: ${benchmarkLevel}`);
    console.log(`      ${benchmarkDescription}\n`);

    return {
      type: 'professionalStandards',
      benchmarkLevel: benchmarkLevel,
      description: benchmarkDescription,
      scores: scores,
      benchmarks: benchmarks,
      commonMistakes: this.detectCommonMistakes()
    };
  }

  meetsAllBenchmarks(scores, benchmark) {
    return Object.keys(scores).every(key =>
      scores[key] >= (benchmark[key] || 0)
    );
  }

  detectCommonMistakes() {
    const mistakes = [];
    const commonMistakesConfig = this.config.professionalStandards?.commonMistakes || [];

    // Check for each common mistake
    commonMistakesConfig.forEach(mistake => {
      const detected = this.checkMistake(mistake);
      if (detected) {
        mistakes.push({
          name: mistake.name,
          severity: mistake.severity,
          description: mistake.description,
          detected: true
        });
      }
    });

    return mistakes;
  }

  checkMistake(mistake) {
    // Simplified detection logic - would be more sophisticated in production
    if (mistake.name === 'Center Alignment Overuse') {
      return this.results.alignment?.centerVertical?.alignmentGroups > 5;
    }
    if (mistake.name === 'Inconsistent Spacing') {
      return this.results.spacing?.overall?.score < 70;
    }
    if (mistake.name === 'Poor Contrast') {
      return this.results.hierarchy?.colorHierarchy?.score < 70;
    }
    if (mistake.name === 'Grid Ignorance') {
      return this.results.gridAlignment?.overall?.score < 70;
    }
    return false;
  }

  /**
   * Calculate overall layout perfection score
   */
  calculateOverallScore() {
    const weights = this.config.scoring.weights;
    const components = [];

    if (this.results.goldenRatio?.overall) {
      components.push({
        name: 'Golden Ratio',
        score: this.results.goldenRatio.overall.score,
        weight: weights.goldenRatio,
        grade: this.results.goldenRatio.overall.grade
      });
    }

    if (this.results.gridAlignment?.overall) {
      components.push({
        name: 'Grid Alignment',
        score: this.results.gridAlignment.overall.score,
        weight: weights.gridAlignment,
        grade: this.results.gridAlignment.overall.grade
      });
    }

    if (this.results.hierarchy?.overall) {
      components.push({
        name: 'Hierarchy',
        score: this.results.hierarchy.overall.score,
        weight: weights.hierarchy,
        grade: this.results.hierarchy.overall.grade
      });
    }

    if (this.results.spacing?.overall) {
      components.push({
        name: 'Spacing',
        score: this.results.spacing.overall.score,
        weight: weights.spacing,
        grade: this.results.spacing.overall.grade
      });
    }

    if (this.results.alignment?.overall) {
      components.push({
        name: 'Alignment',
        score: this.results.alignment.overall.score,
        weight: weights.alignment,
        grade: this.results.alignment.overall.grade
      });
    }

    if (this.results.balance?.overall) {
      components.push({
        name: 'Balance',
        score: this.results.balance.overall.score,
        weight: weights.balance,
        grade: this.results.balance.overall.grade
      });
    }

    if (this.results.proximity?.overall) {
      components.push({
        name: 'Proximity',
        score: this.results.proximity.overall.score,
        weight: weights.proximity,
        grade: this.results.proximity.overall.grade
      });
    }

    const weightedSum = components.reduce((sum, c) => sum + (c.score * c.weight), 0);
    const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
    const overallScore = Math.round(weightedSum / totalWeight);

    const grade = this.getGrade(overallScore);

    return {
      score: overallScore,
      grade: grade.label,
      gradeDescription: grade.description,
      components: components,
      timestamp: new Date().toISOString()
    };
  }

  getGrade(score) {
    const grades = this.config.scoring?.grades || {
      aPlusPlus: { min: 95, max: 100, label: 'A++', description: 'Mathematical Perfection' },
      aPlus: { min: 90, max: 94, label: 'A+', description: 'Excellent Professional' },
      a: { min: 85, max: 89, label: 'A', description: 'Very Good' },
      b: { min: 80, max: 84, label: 'B', description: 'Good' },
      c: { min: 70, max: 79, label: 'C', description: 'Fair' },
      d: { min: 60, max: 69, label: 'D', description: 'Poor' },
      f: { min: 0, max: 59, label: 'F', description: 'Failing' }
    };

    for (const [key, grade] of Object.entries(grades)) {
      if (score >= grade.min && score <= grade.max) {
        return grade;
      }
    }

    return { label: 'N/A', description: 'Unknown' };
  }

  /**
   * Generate multi-model AI critiques
   */
  async generateAICritiques(layoutData) {
    // This would integrate with actual AI APIs
    // For now, return placeholder critiques

    this.results.aiCritiques = {
      claudeOpus41: {
        model: 'claude-opus-4.1',
        focus: 'Golden ratio and professional standards',
        summary: 'AI critique would be generated here via Claude Opus 4.1 API'
      },
      gpt4o: {
        model: 'gpt-4o',
        focus: 'Grid system and proximity analysis',
        summary: 'AI critique would be generated here via GPT-4o API'
      },
      gpt5: {
        model: 'gpt-5',
        focus: 'Spacing optimization',
        summary: 'AI critique would be generated here via GPT-5 API'
      },
      claudeSonnet45: {
        model: 'claude-sonnet-4.5',
        focus: 'Alignment precision',
        summary: 'AI critique would be generated here via Claude Sonnet 4.5 API'
      },
      gemini25Pro: {
        model: 'gemini-2.5-pro',
        focus: 'Hierarchy and balance',
        summary: 'AI critique would be generated here via Gemini 2.5 Pro API'
      }
    };

    console.log('      ✅ AI critiques prepared (API integration required)\n');
  }

  /**
   * Print summary results
   */
  printSummary() {
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('                   ANALYSIS COMPLETE');
    console.log('════════════════════════════════════════════════════════════\n');

    console.log(`📊 OVERALL LAYOUT PERFECTION SCORE: ${this.results.overall.score}/100`);
    console.log(`   Grade: ${this.results.overall.grade}`);
    console.log(`   ${this.results.overall.gradeDescription}\n`);

    console.log('📈 COMPONENT SCORES:');
    this.results.overall.components.forEach(component => {
      const bar = this.generateProgressBar(component.score);
      console.log(`   ${component.name.padEnd(20)} ${bar} ${component.score}/100 (${component.grade})`);
    });

    console.log(`\n🎯 PROFESSIONAL STANDARD: ${this.results.professionalStandards.benchmarkLevel}`);
    console.log(`   ${this.results.professionalStandards.description}`);

    console.log(`\n⚠️  VIOLATIONS: ${this.results.violations.length}`);
    const violationsBySeverity = {
      high: this.results.violations.filter(v => v.severity === 'high').length,
      medium: this.results.violations.filter(v => v.severity === 'medium').length,
      low: this.results.violations.filter(v => v.severity === 'low').length
    };
    console.log(`   High: ${violationsBySeverity.high} | Medium: ${violationsBySeverity.medium} | Low: ${violationsBySeverity.low}`);

    console.log(`\n💡 RECOMMENDATIONS: ${this.results.recommendations.length}`);
    console.log(`   Top priority: ${this.results.recommendations.slice(0, 3).map(r => r.message).join('; ')}`);

    console.log(`\n⏱️  ANALYSIS DURATION: ${this.results.metadata.duration}ms`);
    console.log('════════════════════════════════════════════════════════════\n');
  }

  generateProgressBar(score, length = 20) {
    const filled = Math.round((score / 100) * length);
    const empty = length - filled;
    return `[${'█'.repeat(filled)}${' '.repeat(empty)}]`;
  }

  /**
   * Export results to various formats
   */
  async exportResults(outputPath, format = 'json') {
    const formats = {
      json: () => this.exportJSON(outputPath),
      html: () => this.exportHTML(outputPath),
      csv: () => this.exportCSV(outputPath),
      pdf: () => this.exportPDF(outputPath)
    };

    if (formats[format]) {
      await formats[format]();
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  async exportJSON(outputPath) {
    await fs.writeFile(outputPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 JSON report exported to: ${outputPath}`);
  }

  async exportHTML(outputPath) {
    const html = this.generateHTMLReport();
    await fs.writeFile(outputPath, html);
    console.log(`📊 HTML report exported to: ${outputPath}`);
  }

  async exportCSV(outputPath) {
    const csv = this.generateCSVReport();
    await fs.writeFile(outputPath, csv);
    console.log(`📊 CSV report exported to: ${outputPath}`);
  }

  async exportPDF(outputPath) {
    // Would use a PDF library to generate PDF report
    console.log(`📊 PDF export not yet implemented: ${outputPath}`);
  }

  generateHTMLReport() {
    return `
<!DOCTYPE html>
<html>
<head>
  <title>Layout Perfection Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; }
    h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    .score { font-size: 72px; font-weight: bold; color: #007bff; text-align: center; margin: 30px 0; }
    .grade { font-size: 36px; color: #666; text-align: center; margin-bottom: 40px; }
    .component { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; }
    .progress-bar { height: 30px; background: #e0e0e0; border-radius: 15px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #007bff, #00d4ff); transition: width 0.3s; }
    .violation { padding: 10px; margin: 10px 0; border-left: 4px solid #dc3545; background: #fff5f5; }
    .recommendation { padding: 10px; margin: 10px 0; border-left: 4px solid #28a745; background: #f0fff4; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Layout Perfection Analysis Report</h1>
    <div class="score">${this.results.overall.score}/100</div>
    <div class="grade">${this.results.overall.grade} - ${this.results.overall.gradeDescription}</div>

    <h2>Component Scores</h2>
    ${this.results.overall.components.map(c => `
      <div class="component">
        <h3>${c.name} - ${c.score}/100</h3>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${c.score}%"></div>
        </div>
      </div>
    `).join('')}

    <h2>Top Violations (${this.results.violations.length})</h2>
    ${this.results.violations.slice(0, 10).map(v => `
      <div class="violation">
        <strong>${v.severity.toUpperCase()}</strong>: ${v.message}
        ${v.recommendation ? `<br><em>→ ${v.recommendation}</em>` : ''}
      </div>
    `).join('')}

    <h2>Recommendations (${this.results.recommendations.length})</h2>
    ${this.results.recommendations.slice(0, 10).map(r => `
      <div class="recommendation">
        <strong>${r.priority.toUpperCase()}</strong>: ${r.message}
        <br><em>→ ${r.action}</em>
      </div>
    `).join('')}

    <p style="text-align: center; color: #999; margin-top: 40px;">
      Generated: ${this.results.metadata.timestamp}<br>
      Duration: ${this.results.metadata.duration}ms
    </p>
  </div>
</body>
</html>
    `.trim();
  }

  generateCSVReport() {
    const rows = [
      ['Category', 'Score', 'Grade', 'Weight'],
      ...this.results.overall.components.map(c => [c.name, c.score, c.grade, c.weight]),
      [],
      ['Overall Score', this.results.overall.score, this.results.overall.grade, ''],
      [],
      ['Violations', 'Severity', 'Category', 'Message'],
      ...this.results.violations.map(v => ['Violation', v.severity, v.category, v.message])
    ];

    return rows.map(row => row.join(',')).join('\n');
  }
}

module.exports = LayoutPerfectionChecker;
