/**
 * Content Quality Analyzer - Main Orchestrator
 *
 * Comprehensive multi-dimensional content quality analysis system.
 * Coordinates all specialized analyzers and produces unified quality reports.
 *
 * Features:
 * - 8 quality dimensions analyzed
 * - Multi-AI model integration (GPT-5, Claude Opus 4.1, Gemini 2.5 Pro, etc.)
 * - Weighted scoring system
 * - Issue prioritization and recommendations
 * - Export to JSON, HTML, CSV, Markdown
 */

const pdf = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

// Import specialized analyzers
const WritingQualityChecker = require('./writing-quality-checker');
const MessagingAnalyzer = require('./messaging-analyzer');
const StorytellingAnalyzer = require('./storytelling-analyzer');
const CompletenessChecker = require('./completeness-checker');
const AudienceAnalyzer = require('./audience-analyzer');
const EmotionalIntelligenceAnalyzer = require('./emotional-intelligence');

class ContentQualityAnalyzer {
  constructor(config, aiClient, webSearch = null) {
    this.config = config;
    this.aiClient = aiClient;
    this.webSearch = webSearch;

    // Initialize all analyzers
    this.analyzers = {
      writingQuality: new WritingQualityChecker(config, aiClient),
      messaging: new MessagingAnalyzer(config, aiClient),
      storytelling: new StorytellingAnalyzer(config, aiClient),
      completeness: new CompletenessChecker(config, aiClient, webSearch),
      audience: new AudienceAnalyzer(config, aiClient),
      emotional: new EmotionalIntelligenceAnalyzer(config, aiClient)
    };

    console.log('Content Quality Analyzer initialized with 6 specialized analyzers');
  }

  /**
   * Analyze PDF document for content quality
   */
  async analyzePDF(pdfPath, options = {}) {
    const startTime = Date.now();

    try {
      console.log(`\n=== Starting Content Quality Analysis ===`);
      console.log(`PDF: ${pdfPath}`);
      console.log(`Options:`, options);

      // Extract text from PDF
      console.log('\n1. Extracting text from PDF...');
      const text = await this.extractTextFromPDF(pdfPath);

      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      console.log(`   ✓ Extracted ${text.length} characters`);

      // Analyze text
      const analysis = await this.analyzeText(text, options);

      // Add PDF metadata
      analysis.metadata.pdfPath = pdfPath;
      analysis.metadata.totalDuration = Date.now() - startTime;

      console.log(`\n=== Analysis Complete ===`);
      console.log(`Overall Score: ${Math.round(analysis.overallScore)}/100 (${this.getScoreLabel(analysis.overallScore)})`);
      console.log(`Total Issues: ${analysis.allIssues.length} (${this.getIssueCounts(analysis.allIssues)})`);
      console.log(`Duration: ${(analysis.metadata.totalDuration / 1000).toFixed(2)}s`);

      return analysis;

    } catch (error) {
      console.error('PDF analysis error:', error);
      throw new Error(`Failed to analyze PDF: ${error.message}`);
    }
  }

  /**
   * Analyze text content for quality
   */
  async analyzeText(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('\n2. Running 8-dimensional quality analysis...');

      // Run all analyses in parallel for speed
      const results = await Promise.allSettled([
        this.runAnalyzer('writingQuality', text, options),
        this.runAnalyzer('messaging', text, options),
        this.runAnalyzer('storytelling', text, options),
        this.runAnalyzer('completeness', text, options),
        this.runAnalyzer('audience', text, options),
        this.runAnalyzer('emotional', text, options)
      ]);

      // Process results
      const dimensions = {};
      const errors = [];

      results.forEach((result, idx) => {
        const dimensionName = ['writingQuality', 'messaging', 'storytelling', 'completeness', 'audience', 'emotional'][idx];

        if (result.status === 'fulfilled') {
          dimensions[dimensionName] = result.value;
          console.log(`   ✓ ${dimensionName}: ${Math.round(result.value.overallScore)}/100`);
        } else {
          console.error(`   ✗ ${dimensionName}: ${result.reason.message}`);
          errors.push({
            dimension: dimensionName,
            error: result.reason.message
          });
          // Create placeholder result
          dimensions[dimensionName] = this.createErrorResult(dimensionName, result.reason);
        }
      });

      // Calculate overall quality score
      const overallScore = this.calculateOverallScore(dimensions);

      // Combine all issues
      const allIssues = this.combineAllIssues(dimensions);

      // Generate comprehensive recommendations
      const recommendations = this.generateComprehensiveRecommendations(dimensions, overallScore);

      // Determine quality grade
      const grade = this.determineQualityGrade(overallScore);

      const duration = Date.now() - startTime;

      return {
        overallScore: Math.round(overallScore),
        grade,
        dimensions,
        allIssues,
        recommendations,
        errors: errors.length > 0 ? errors : undefined,
        summary: this.createSummary(dimensions, overallScore),
        metadata: {
          analyzedAt: new Date().toISOString(),
          duration,
          textLength: text.length,
          textPreview: text.substring(0, 200) + '...'
        }
      };

    } catch (error) {
      console.error('Text analysis error:', error);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  }

  /**
   * Run individual analyzer with error handling
   */
  async runAnalyzer(dimensionName, text, options) {
    const analyzer = this.analyzers[dimensionName];

    if (!analyzer) {
      throw new Error(`Analyzer not found: ${dimensionName}`);
    }

    try {
      // Call the appropriate analyze method based on analyzer type
      if (dimensionName === 'writingQuality') {
        return await analyzer.analyzeWritingQuality(text, options);
      } else if (dimensionName === 'messaging') {
        return await analyzer.analyzeMessaging(text, options);
      } else if (dimensionName === 'storytelling') {
        return await analyzer.analyzeStorytelling(text, options);
      } else if (dimensionName === 'completeness') {
        return await analyzer.analyzeCompleteness(text, options);
      } else if (dimensionName === 'audience') {
        return await analyzer.analyzeAudience(text, options);
      } else if (dimensionName === 'emotional') {
        return await analyzer.analyzeEmotionalIntelligence(text, options);
      } else {
        throw new Error(`Unknown analyzer: ${dimensionName}`);
      }

    } catch (error) {
      console.error(`${dimensionName} analyzer error:`, error);
      throw error;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractTextFromPDF(pdfPath) {
    try {
      const dataBuffer = await fs.readFile(pdfPath);
      const data = await pdf(dataBuffer);
      return data.text;

    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Calculate overall quality score from all dimensions
   */
  calculateOverallScore(dimensions) {
    const weights = this.config.qualityDimensions;
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(dimensions).forEach(([dimension, result]) => {
      const weight = weights[dimension]?.weight || 0;
      const score = result.overallScore || 0;

      totalScore += score * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Combine all issues from all dimensions
   */
  combineAllIssues(dimensions) {
    const allIssues = [];

    Object.entries(dimensions).forEach(([dimension, result]) => {
      if (result.issues && Array.isArray(result.issues)) {
        result.issues.forEach(issue => {
          allIssues.push({
            ...issue,
            dimension
          });
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, major: 1, minor: 2, suggestion: 3 };
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return allIssues;
  }

  /**
   * Generate comprehensive recommendations
   */
  generateComprehensiveRecommendations(dimensions, overallScore) {
    const recommendations = {
      immediate: [],
      important: [],
      optional: []
    };

    // Get recommendations from each dimension
    Object.entries(dimensions).forEach(([dimension, result]) => {
      if (result.recommendations && Array.isArray(result.recommendations)) {
        result.recommendations.forEach(rec => {
          // Categorize by urgency
          if (rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('priority')) {
            recommendations.immediate.push(`[${dimension}] ${rec}`);
          } else if (result.overallScore < 70) {
            recommendations.important.push(`[${dimension}] ${rec}`);
          } else {
            recommendations.optional.push(`[${dimension}] ${rec}`);
          }
        });
      }
    });

    // Add overall recommendations based on score
    if (overallScore < 60) {
      recommendations.immediate.unshift('URGENT: Content requires significant revision before publication');
    } else if (overallScore < 70) {
      recommendations.important.unshift('Content needs substantial improvements to meet quality standards');
    } else if (overallScore < 85) {
      recommendations.optional.unshift('Good quality content with room for optimization');
    }

    return recommendations;
  }

  /**
   * Determine quality grade
   */
  determineQualityGrade(score) {
    const ranges = this.config.scoringRanges;

    for (const [key, range] of Object.entries(ranges)) {
      if (score >= range.min && score <= range.max) {
        return {
          letter: this.getLetterGrade(score),
          label: range.label,
          description: range.description,
          color: range.color,
          score: Math.round(score)
        };
      }
    }

    return {
      letter: 'F',
      label: 'Poor',
      description: 'Needs significant work',
      color: '#8B0000',
      score: Math.round(score)
    };
  }

  /**
   * Get letter grade from score
   */
  getLetterGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 87) return 'A-';
    if (score >= 83) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 77) return 'B-';
    if (score >= 73) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 67) return 'C-';
    if (score >= 63) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Create summary object
   */
  createSummary(dimensions, overallScore) {
    const summary = {
      overallScore: Math.round(overallScore),
      dimensionScores: {},
      strengths: [],
      weaknesses: [],
      criticalIssues: 0,
      majorIssues: 0,
      minorIssues: 0
    };

    // Extract dimension scores
    Object.entries(dimensions).forEach(([dimension, result]) => {
      summary.dimensionScores[dimension] = Math.round(result.overallScore || 0);

      // Identify strengths and weaknesses
      if (result.overallScore >= 85) {
        summary.strengths.push(dimension);
      } else if (result.overallScore < 70) {
        summary.weaknesses.push(dimension);
      }

      // Count issues
      if (result.issues) {
        summary.criticalIssues += result.issues.filter(i => i.severity === 'critical').length;
        summary.majorIssues += result.issues.filter(i => i.severity === 'major').length;
        summary.minorIssues += result.issues.filter(i => i.severity === 'minor').length;
      }
    });

    return summary;
  }

  /**
   * Create error result for failed analyzer
   */
  createErrorResult(dimensionName, error) {
    return {
      dimension: dimensionName,
      overallScore: 0,
      scores: {},
      details: {},
      issues: [{
        type: 'error',
        severity: 'critical',
        issue: `Analysis failed: ${error.message}`,
        suggestion: 'Check logs for details'
      }],
      recommendations: ['Fix analyzer error to get complete analysis'],
      metadata: {
        error: error.message,
        errorTime: new Date().toISOString()
      }
    };
  }

  /**
   * Get score label
   */
  getScoreLabel(score) {
    if (score >= 90) return 'Exceptional';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 50) return 'Below Standard';
    return 'Poor';
  }

  /**
   * Get issue counts summary
   */
  getIssueCounts(issues) {
    const critical = issues.filter(i => i.severity === 'critical').length;
    const major = issues.filter(i => i.severity === 'major').length;
    const minor = issues.filter(i => i.severity === 'minor').length;

    return `${critical} critical, ${major} major, ${minor} minor`;
  }

  /**
   * Export analysis results
   */
  async exportResults(analysis, outputPath, format = 'json') {
    try {
      let content;

      switch (format.toLowerCase()) {
        case 'json':
          content = JSON.stringify(analysis, null, 2);
          break;

        case 'html':
          content = this.generateHTMLReport(analysis);
          break;

        case 'csv':
          content = this.generateCSVReport(analysis);
          break;

        case 'markdown':
        case 'md':
          content = this.generateMarkdownReport(analysis);
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await fs.writeFile(outputPath, content, 'utf-8');
      console.log(`\nReport exported to: ${outputPath}`);

      return outputPath;

    } catch (error) {
      console.error('Export error:', error);
      throw new Error(`Failed to export results: ${error.message}`);
    }
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(analysis) {
    const { overallScore, grade, dimensions, allIssues, recommendations, summary } = analysis;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Quality Analysis Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
               max-width: 1200px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
        h1 { color: #00393F; border-bottom: 3px solid #C9E4EC; padding-bottom: 10px; }
        h2 { color: #00393F; margin-top: 40px; }
        h3 { color: #65873B; }
        .score-card { background: linear-gradient(135deg, #00393F 0%, #65873B 100%); color: white; padding: 30px;
                      border-radius: 10px; text-align: center; margin: 30px 0; }
        .score-number { font-size: 72px; font-weight: bold; margin: 10px 0; }
        .score-label { font-size: 24px; opacity: 0.9; }
        .dimensions { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .dimension { background: #FFF1E2; padding: 20px; border-radius: 8px; border-left: 4px solid #BA8F5A; }
        .dimension h3 { margin-top: 0; color: #00393F; }
        .dimension-score { font-size: 36px; font-weight: bold; color: #BA8F5A; }
        .issues { background: #FFF1E2; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .issue { margin: 15px 0; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #913B2F; }
        .issue.critical { border-left-color: #8B0000; }
        .issue.major { border-left-color: #913B2F; }
        .issue.minor { border-left-color: #BA8F5A; }
        .issue-type { font-weight: bold; color: #00393F; }
        .issue-suggestion { color: #65873B; margin-top: 5px; }
        .recommendations { background: #E0F2E9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .recommendation { padding: 10px; margin: 10px 0; background: white; border-radius: 4px; }
        .immediate { border-left: 4px solid #8B0000; }
        .important { border-left: 4px solid #BA8F5A; }
        .metadata { font-size: 14px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
    </style>
</head>
<body>
    <h1>Content Quality Analysis Report</h1>

    <div class="score-card" style="background-color: ${grade.color}">
        <div class="score-label">${grade.label} Quality</div>
        <div class="score-number">${overallScore}</div>
        <div class="score-label">Grade: ${grade.letter}</div>
        <p>${grade.description}</p>
    </div>

    <h2>Quality Dimensions</h2>
    <div class="dimensions">
        ${Object.entries(dimensions).map(([name, result]) => `
            <div class="dimension">
                <h3>${this.formatDimensionName(name)}</h3>
                <div class="dimension-score">${Math.round(result.overallScore)}/100</div>
                <p>${this.getDimensionDescription(name)}</p>
            </div>
        `).join('')}
    </div>

    <h2>Issues Found (${allIssues.length})</h2>
    <div class="issues">
        ${allIssues.slice(0, 20).map(issue => `
            <div class="issue ${issue.severity}">
                <div class="issue-type">[${issue.severity.toUpperCase()}] ${issue.issue}</div>
                ${issue.suggestion ? `<div class="issue-suggestion">💡 ${issue.suggestion}</div>` : ''}
            </div>
        `).join('')}
        ${allIssues.length > 20 ? `<p><em>... and ${allIssues.length - 20} more issues</em></p>` : ''}
    </div>

    <h2>Recommendations</h2>
    <div class="recommendations">
        ${recommendations.immediate.length > 0 ? `
            <h3>🔴 Immediate Action Required</h3>
            ${recommendations.immediate.map(rec => `<div class="recommendation immediate">${rec}</div>`).join('')}
        ` : ''}

        ${recommendations.important.length > 0 ? `
            <h3>🟡 Important Improvements</h3>
            ${recommendations.important.map(rec => `<div class="recommendation important">${rec}</div>`).join('')}
        ` : ''}

        ${recommendations.optional.length > 0 ? `
            <h3>🟢 Optional Enhancements</h3>
            ${recommendations.optional.slice(0, 10).map(rec => `<div class="recommendation">${rec}</div>`).join('')}
        ` : ''}
    </div>

    <div class="metadata">
        <p><strong>Analysis Date:</strong> ${new Date(analysis.metadata.analyzedAt).toLocaleString()}</p>
        <p><strong>Analysis Duration:</strong> ${(analysis.metadata.duration / 1000).toFixed(2)}s</p>
        <p><strong>Text Length:</strong> ${analysis.metadata.textLength.toLocaleString()} characters</p>
        ${analysis.metadata.pdfPath ? `<p><strong>PDF:</strong> ${path.basename(analysis.metadata.pdfPath)}</p>` : ''}
    </div>
</body>
</html>`;
  }

  /**
   * Generate CSV report
   */
  generateCSVReport(analysis) {
    const rows = [
      ['Dimension', 'Score', 'Issues', 'Recommendations'],
      ['OVERALL', analysis.overallScore, analysis.allIssues.length, analysis.recommendations.immediate.length + analysis.recommendations.important.length]
    ];

    Object.entries(analysis.dimensions).forEach(([name, result]) => {
      rows.push([
        this.formatDimensionName(name),
        Math.round(result.overallScore),
        result.issues ? result.issues.length : 0,
        result.recommendations ? result.recommendations.length : 0
      ]);
    });

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Generate Markdown report
   */
  generateMarkdownReport(analysis) {
    const { overallScore, grade, dimensions, allIssues, recommendations, summary } = analysis;

    return `# Content Quality Analysis Report

## Overall Score: ${overallScore}/100 (${grade.letter})

**${grade.label}** - ${grade.description}

---

## Quality Dimensions

${Object.entries(dimensions).map(([name, result]) => `
### ${this.formatDimensionName(name)}: ${Math.round(result.overallScore)}/100

${this.getDimensionDescription(name)}

**Issues:** ${result.issues ? result.issues.length : 0}
`).join('\n')}

---

## Critical Issues

${allIssues.filter(i => i.severity === 'critical').map(issue => `
- **${issue.issue}**
  - *Suggestion:* ${issue.suggestion || 'Review and fix'}
`).join('\n')}

---

## Recommendations

### 🔴 Immediate Action Required

${recommendations.immediate.map(rec => `- ${rec}`).join('\n')}

### 🟡 Important Improvements

${recommendations.important.map(rec => `- ${rec}`).join('\n')}

---

**Analysis Date:** ${new Date(analysis.metadata.analyzedAt).toLocaleString()}
**Duration:** ${(analysis.metadata.duration / 1000).toFixed(2)}s
**Text Length:** ${analysis.metadata.textLength.toLocaleString()} characters
`;
  }

  /**
   * Format dimension name for display
   */
  formatDimensionName(name) {
    const formatted = name.replace(/([A-Z])/g, ' $1').trim();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  /**
   * Get dimension description
   */
  getDimensionDescription(dimension) {
    const descriptions = {
      writingQuality: 'Grammar, clarity, sentence structure, and active voice usage',
      messaging: 'Value proposition, call-to-action, and persuasion effectiveness',
      storytelling: 'Narrative arc, character development, and emotional journey',
      completeness: 'Required elements, no placeholders, data accuracy',
      audience: 'Reading level, technical depth, inclusivity, and professional tone',
      emotional: 'Sentiment balance, empathy, trust-building, and urgency'
    };

    return descriptions[dimension] || '';
  }
}

module.exports = ContentQualityAnalyzer;
