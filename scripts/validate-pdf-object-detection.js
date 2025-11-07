/**
 * PDF Object Detection Validator
 *
 * Uses Gemini Vision's object detection to identify and locate:
 * - Logos, images, text blocks, headings, CTAs
 * - Generates precise bounding boxes
 * - Detects overlapping elements
 * - Validates logo clearspace with precision
 * - Measures element spacing programmatically
 *
 * Part of Phase 4: World-Class QA System
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');
const ObjectAnalyzer = require('./lib/object-analyzer');

class ObjectDetectionValidator {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('Gemini API key required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: options.model || 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: options.temperature || 0.1
      }
    });

    this.analyzer = new ObjectAnalyzer({
      pageWidth: 612,
      pageHeight: 792,
      dpi: 72,
      gridColumns: 12,
      gutterWidth: 20,
      marginSize: 40
    });

    this.outputDir = options.outputDir || path.join(process.cwd(), 'exports', 'object-detection-reports');
  }

  /**
   * Main validation method with object detection
   */
  async validateWithObjectDetection(imagePath) {
    console.log(`\n🔍 Running object detection on: ${path.basename(imagePath)}`);

    try {
      // Read image
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // Get image dimensions
      const dimensions = await this.getImageDimensions(imagePath);

      // Analyze with object detection
      const objectDetectionResult = await this.analyzeWithObjectDetection(imageBase64, dimensions);

      // Validate bounding boxes with analyzer
      const spatialAnalysis = this.validateBoundingBoxes(objectDetectionResult, dimensions);

      // Generate comprehensive report
      const report = {
        timestamp: new Date().toISOString(),
        imagePath,
        dimensions,
        objectDetection: objectDetectionResult,
        spatialAnalysis,
        overallCompliance: this.calculateCompliance(spatialAnalysis),
        recommendations: this.generateRecommendations(spatialAnalysis)
      };

      // Save report
      await this.saveReport(report, imagePath);

      // Print summary
      this.printSummary(report);

      return report;
    } catch (error) {
      console.error(`❌ Error during object detection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze image with Gemini Vision object detection
   */
  async analyzeWithObjectDetection(imageBase64, dimensions) {
    console.log('🤖 Analyzing with Gemini Vision AI...');

    const prompt = `You are an expert design analysis AI with object detection capabilities.

Analyze this document design and identify ALL key visual elements with precise bounding boxes.

For EACH element you detect, provide:
1. Type (logo, heading, subheading, body_text, image, cta, button, caption, icon)
2. Bounding box coordinates: { "x": number, "y": number, "width": number, "height": number }
   - x, y: top-left corner position in pixels
   - width, height: element dimensions in pixels
   - Coordinates should be relative to image size: ${dimensions.width}x${dimensions.height}px
3. Content description
4. Any visible issues (cutoffs, overlaps, alignment problems)

BRAND COMPLIANCE CHECKS:
- Logo clearspace: Minimum clearspace should equal logo icon height
- Touch targets: Buttons/CTAs should be at least 44x44px
- Grid alignment: Elements should align to 12-column grid with 20pt gutters
- Spacing: 60pt between sections, 20pt between elements, 12pt between paragraphs
- Typography: Lora for headlines, Roboto Flex for body text
- Colors: TEEI palette (Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A)

Return ONLY valid JSON in this exact structure:
{
  "elements": [
    {
      "id": "unique_id",
      "type": "logo|heading|subheading|body_text|image|cta|button|caption|icon",
      "boundingBox": {
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 50
      },
      "content": "Description of element",
      "confidence": 0.95,
      "issues": ["List of any issues detected"],
      "typography": {
        "font": "Lora Bold",
        "size": "42pt",
        "color": "#00393F"
      }
    }
  ],
  "layoutAnalysis": {
    "gridAlignment": "good|fair|poor",
    "spacing": "consistent|inconsistent",
    "hierarchy": "clear|unclear",
    "balance": "balanced|unbalanced"
  },
  "brandCompliance": {
    "colors": "compliant|violations_detected",
    "typography": "compliant|violations_detected",
    "spacing": "compliant|violations_detected",
    "clearspace": "compliant|violations_detected"
  }
}`;

    const result = await this.model.generateContent([
      { text: prompt },
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/png'
        }
      }
    ]);

    const response = result.response.text();

    try {
      const parsed = JSON.parse(response);
      console.log(`✅ Detected ${parsed.elements?.length || 0} elements`);
      return parsed;
    } catch (error) {
      console.error('⚠️ Failed to parse JSON response, attempting extraction...');
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid JSON response from AI model');
    }
  }

  /**
   * Validate bounding boxes using ObjectAnalyzer
   */
  validateBoundingBoxes(objectDetectionResult, dimensions) {
    console.log('📐 Validating spatial relationships...');

    const elements = objectDetectionResult.elements || [];

    if (elements.length === 0) {
      return {
        issues: [],
        warnings: [],
        insights: [],
        summary: {
          totalElements: 0,
          overlappingElements: 0,
          clearspaceViolations: 0,
          accessibilityIssues: 0,
          gridAlignmentIssues: 0
        }
      };
    }

    // Analyze layout
    const layoutAnalysis = this.analyzer.analyzeLayout(elements);

    // Generate visual markup
    const markup = this.analyzer.generateMarkup(elements, layoutAnalysis.issues);

    // Add detailed spacing analysis
    const spacingDetails = this.analyzeDetailedSpacing(elements);

    return {
      ...layoutAnalysis,
      markup,
      spacingDetails,
      dimensions
    };
  }

  /**
   * Analyze detailed spacing between elements
   */
  analyzeDetailedSpacing(elements) {
    const analysis = {
      logoSpacing: [],
      headingSpacing: [],
      sectionBreaks: [],
      violations: []
    };

    // Find logos and check their spacing
    const logos = elements.filter(el => el.type === 'logo');
    for (const logo of logos) {
      const clearspace = this.analyzer.calculateClearspace(
        logo.boundingBox,
        elements.map(el => el.boundingBox)
      );

      const logoHeight = this.analyzer.parseBoundingBox(logo.boundingBox).height;
      const required = logoHeight || 20;

      analysis.logoSpacing.push({
        logo,
        requiredClearspace: required,
        actualClearspace: clearspace,
        compliant: clearspace.minimumDistance >= required
      });

      if (clearspace.minimumDistance < required) {
        analysis.violations.push({
          type: 'logo_clearspace',
          severity: 'critical',
          logo,
          required,
          actual: clearspace.minimumDistance,
          deficit: required - clearspace.minimumDistance
        });
      }
    }

    // Check section breaks (headings)
    const headings = elements.filter(el => el.type === 'heading' || el.type === 'subheading');
    const sortedHeadings = headings.sort((a, b) => {
      const bbox1 = this.analyzer.parseBoundingBox(a.boundingBox);
      const bbox2 = this.analyzer.parseBoundingBox(b.boundingBox);
      return bbox1.y - bbox2.y;
    });

    for (let i = 0; i < sortedHeadings.length - 1; i++) {
      const current = this.analyzer.parseBoundingBox(sortedHeadings[i].boundingBox);
      const next = this.analyzer.parseBoundingBox(sortedHeadings[i + 1].boundingBox);
      const gap = next.y - current.y2;

      analysis.headingSpacing.push({
        heading1: sortedHeadings[i],
        heading2: sortedHeadings[i + 1],
        gap,
        expectedSectionGap: 60,
        compliant: gap >= 50 && gap <= 70
      });

      if (gap < 50) {
        analysis.violations.push({
          type: 'section_spacing_too_tight',
          severity: 'warning',
          gap,
          expected: 60,
          deficit: 60 - gap
        });
      }
    }

    return analysis;
  }

  /**
   * Calculate overall compliance score
   */
  calculateCompliance(spatialAnalysis) {
    const { summary } = spatialAnalysis;

    let score = 10.0;
    let issues = [];

    // Deduct for overlapping elements
    if (summary.overlappingElements > 0) {
      score -= summary.overlappingElements * 1.5;
      issues.push(`${summary.overlappingElements} overlapping elements (-${summary.overlappingElements * 1.5} pts)`);
    }

    // Deduct for clearspace violations
    if (summary.clearspaceViolations > 0) {
      score -= summary.clearspaceViolations * 2.0;
      issues.push(`${summary.clearspaceViolations} clearspace violations (-${summary.clearspaceViolations * 2.0} pts)`);
    }

    // Deduct for accessibility issues
    if (summary.accessibilityIssues > 0) {
      score -= summary.accessibilityIssues * 1.0;
      issues.push(`${summary.accessibilityIssues} accessibility issues (-${summary.accessibilityIssues * 1.0} pts)`);
    }

    // Deduct for grid alignment issues (minor)
    if (summary.gridAlignmentIssues > 3) {
      score -= 0.5;
      issues.push(`${summary.gridAlignmentIssues} grid alignment issues (-0.5 pts)`);
    }

    score = Math.max(0, Math.min(10, score));

    let grade = 'F';
    if (score >= 9.5) grade = 'A+';
    else if (score >= 9.0) grade = 'A';
    else if (score >= 8.5) grade = 'A-';
    else if (score >= 8.0) grade = 'B+';
    else if (score >= 7.5) grade = 'B';
    else if (score >= 7.0) grade = 'B-';
    else if (score >= 6.5) grade = 'C+';
    else if (score >= 6.0) grade = 'C';
    else if (score >= 5.5) grade = 'C-';
    else if (score >= 5.0) grade = 'D';

    return {
      score: parseFloat(score.toFixed(2)),
      grade,
      deductions: issues,
      criticalIssues: summary.overlappingElements + summary.clearspaceViolations,
      minorIssues: summary.accessibilityIssues + summary.gridAlignmentIssues
    };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(spatialAnalysis) {
    const recommendations = [];

    // Critical issues first
    for (const issue of spatialAnalysis.issues) {
      if (issue.type === 'element_overlap') {
        recommendations.push({
          priority: 'CRITICAL',
          category: 'Layout',
          issue: `Overlapping elements: ${issue.element1.type} and ${issue.element2.type}`,
          recommendation: `Separate elements by at least 20pt to prevent overlap. Current overlap: ${issue.overlapPercentage.toFixed(1)}%`,
          actionable: true
        });
      } else if (issue.type === 'logo_clearspace_violation') {
        recommendations.push({
          priority: 'CRITICAL',
          category: 'Brand Compliance',
          issue: `Logo clearspace violation on ${issue.violations.length} sides`,
          recommendation: `Ensure minimum clearspace of ${issue.violations[0].required}pt around logo. Current violations: ${issue.violations.map(v => `${v.direction} (${v.deficit.toFixed(1)}pt deficit)`).join(', ')}`,
          actionable: true
        });
      }
    }

    // Warnings
    for (const warning of spatialAnalysis.warnings) {
      if (warning.type === 'touch_target_too_small') {
        recommendations.push({
          priority: 'HIGH',
          category: 'Accessibility',
          issue: `Interactive element too small for touch targets`,
          recommendation: `Increase ${warning.element.type} to minimum 44x44px. Current: ${warning.issues.map(i => `${i.dimension} ${i.actual}px`).join(', ')}`,
          actionable: true
        });
      } else if (warning.type === 'spacing_too_tight') {
        recommendations.push({
          priority: 'MEDIUM',
          category: 'Spacing',
          issue: `Elements too close together`,
          recommendation: `Increase spacing to at least ${warning.expected}pt. Current: ${warning.gap.toFixed(1)}pt`,
          actionable: true
        });
      }
    }

    // Insights
    if (spatialAnalysis.insights.length > 5) {
      recommendations.push({
        priority: 'LOW',
        category: 'Grid Alignment',
        issue: `Multiple elements not aligned to 12-column grid`,
        recommendation: `Review grid alignment for ${spatialAnalysis.insights.length} elements to improve visual consistency`,
        actionable: true
      });
    }

    // Spacing insights
    if (spatialAnalysis.spacingDetails?.violations) {
      for (const violation of spatialAnalysis.spacingDetails.violations) {
        if (violation.type === 'section_spacing_too_tight') {
          recommendations.push({
            priority: 'MEDIUM',
            category: 'Spacing',
            issue: `Section spacing below brand guidelines`,
            recommendation: `Increase spacing to 60pt between sections. Current: ${violation.gap.toFixed(1)}pt (deficit: ${violation.deficit.toFixed(1)}pt)`,
            actionable: true
          });
        }
      }
    }

    return recommendations;
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(imagePath) {
    // Simple approach: assume standard letter size at 72 DPI
    // In production, would use image processing library
    return {
      width: 612,
      height: 792,
      dpi: 72
    };
  }

  /**
   * Save report
   */
  async saveReport(report, imagePath) {
    await fs.mkdir(this.outputDir, { recursive: true });

    const basename = path.basename(imagePath, path.extname(imagePath));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const reportFilename = `object-detection-${basename}-${timestamp}.json`;
    const reportPath = path.join(this.outputDir, reportFilename);

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved: ${reportPath}`);

    // Also save human-readable text report
    const textReport = this.generateTextReport(report);
    const textPath = path.join(this.outputDir, reportFilename.replace('.json', '.txt'));
    await fs.writeFile(textPath, textReport);
    console.log(`💾 Text report saved: ${textPath}`);

    return reportPath;
  }

  /**
   * Generate human-readable text report
   */
  generateTextReport(report) {
    const { objectDetection, spatialAnalysis, overallCompliance, recommendations } = report;

    let text = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                    OBJECT DETECTION VALIDATION REPORT                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

Document: ${path.basename(report.imagePath)}
Timestamp: ${report.timestamp}
Dimensions: ${report.dimensions.width}x${report.dimensions.height}px

═══════════════════════════════════════════════════════════════════════════════
 OVERALL COMPLIANCE
═══════════════════════════════════════════════════════════════════════════════

Score: ${overallCompliance.score}/10.0 (Grade: ${overallCompliance.grade})
Critical Issues: ${overallCompliance.criticalIssues}
Minor Issues: ${overallCompliance.minorIssues}

Deductions:
${overallCompliance.deductions.map(d => `  - ${d}`).join('\n') || '  None'}

═══════════════════════════════════════════════════════════════════════════════
 DETECTED ELEMENTS
═══════════════════════════════════════════════════════════════════════════════

Total Elements: ${objectDetection.elements?.length || 0}

${(objectDetection.elements || []).map((el, i) => `
${i + 1}. ${el.type.toUpperCase()}
   Position: (${el.boundingBox.x}, ${el.boundingBox.y})
   Size: ${el.boundingBox.width}x${el.boundingBox.height}px
   Content: ${el.content || 'N/A'}
   Confidence: ${((el.confidence || 0.9) * 100).toFixed(1)}%
   Issues: ${el.issues?.length > 0 ? el.issues.join(', ') : 'None'}
`).join('')}

═══════════════════════════════════════════════════════════════════════════════
 SPATIAL ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

Summary:
  - Total Elements: ${spatialAnalysis.summary.totalElements}
  - Overlapping Elements: ${spatialAnalysis.summary.overlappingElements}
  - Clearspace Violations: ${spatialAnalysis.summary.clearspaceViolations}
  - Accessibility Issues: ${spatialAnalysis.summary.accessibilityIssues}
  - Grid Alignment Issues: ${spatialAnalysis.summary.gridAlignmentIssues}

Critical Issues (${spatialAnalysis.issues.length}):
${spatialAnalysis.issues.map((issue, i) => `
  ${i + 1}. ${issue.type} (${issue.severity})
     ${this.formatIssueDetails(issue)}
`).join('')}

Warnings (${spatialAnalysis.warnings.length}):
${spatialAnalysis.warnings.map((warning, i) => `
  ${i + 1}. ${warning.type} (${warning.severity})
     ${this.formatIssueDetails(warning)}
`).join('')}

═══════════════════════════════════════════════════════════════════════════════
 RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════════

${recommendations.map((rec, i) => `
${i + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}
   → ${rec.recommendation}
`).join('')}

${recommendations.length === 0 ? '✅ No recommendations - document meets all spatial requirements!' : ''}

═══════════════════════════════════════════════════════════════════════════════
 LAYOUT ANALYSIS
═══════════════════════════════════════════════════════════════════════════════

Grid Alignment: ${objectDetection.layoutAnalysis?.gridAlignment || 'N/A'}
Spacing: ${objectDetection.layoutAnalysis?.spacing || 'N/A'}
Hierarchy: ${objectDetection.layoutAnalysis?.hierarchy || 'N/A'}
Balance: ${objectDetection.layoutAnalysis?.balance || 'N/A'}

═══════════════════════════════════════════════════════════════════════════════
 BRAND COMPLIANCE
═══════════════════════════════════════════════════════════════════════════════

Colors: ${objectDetection.brandCompliance?.colors || 'N/A'}
Typography: ${objectDetection.brandCompliance?.typography || 'N/A'}
Spacing: ${objectDetection.brandCompliance?.spacing || 'N/A'}
Clearspace: ${objectDetection.brandCompliance?.clearspace || 'N/A'}

═══════════════════════════════════════════════════════════════════════════════

Generated by PDF Orchestrator Object Detection System v1.0
Part of Phase 4: World-Class QA System
`;

    return text;
  }

  /**
   * Format issue details for text report
   */
  formatIssueDetails(issue) {
    if (issue.type === 'element_overlap') {
      return `${issue.element1.type} overlaps ${issue.element2.type} by ${issue.overlapPercentage.toFixed(1)}%`;
    } else if (issue.type === 'logo_clearspace_violation') {
      return `Logo has ${issue.violations.length} clearspace violations`;
    } else if (issue.type === 'touch_target_too_small') {
      return `Element too small: ${issue.issues.map(i => `${i.dimension} ${i.actual}px (needs ${i.required}px)`).join(', ')}`;
    } else if (issue.type === 'spacing_too_tight') {
      return `Gap ${issue.gap.toFixed(1)}pt (expected ${issue.expected}pt)`;
    }
    return JSON.stringify(issue);
  }

  /**
   * Print summary to console
   */
  printSummary(report) {
    const { overallCompliance, spatialAnalysis, recommendations } = report;

    console.log('\n' + '═'.repeat(80));
    console.log('  OBJECT DETECTION VALIDATION SUMMARY');
    console.log('═'.repeat(80));
    console.log(`\n  Score: ${overallCompliance.score}/10.0 (Grade: ${overallCompliance.grade})`);
    console.log(`  Elements Detected: ${spatialAnalysis.summary.totalElements}`);
    console.log(`  Critical Issues: ${overallCompliance.criticalIssues}`);
    console.log(`  Minor Issues: ${overallCompliance.minorIssues}`);

    if (recommendations.length > 0) {
      console.log(`\n  Top Recommendations:`);
      const topRecs = recommendations.slice(0, 3);
      topRecs.forEach((rec, i) => {
        console.log(`    ${i + 1}. [${rec.priority}] ${rec.issue}`);
      });
    } else {
      console.log('\n  ✅ No issues found!');
    }

    console.log('\n' + '═'.repeat(80) + '\n');
  }
}

// CLI execution
if (require.main === module) {
  const apiKey = process.env.GEMINI_API_KEY;
  const imagePath = process.argv[2];

  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.log('\nUsage:');
    console.log('  GEMINI_API_KEY=your_key node scripts/validate-pdf-object-detection.js <image.png>');
    process.exit(1);
  }

  if (!imagePath) {
    console.error('❌ Error: Image path required');
    console.log('\nUsage:');
    console.log('  node scripts/validate-pdf-object-detection.js <image.png>');
    process.exit(1);
  }

  const validator = new ObjectDetectionValidator(apiKey);
  validator.validateWithObjectDetection(imagePath)
    .then(report => {
      if (report.overallCompliance.score < 8.0) {
        console.log('⚠️  Quality below threshold (B+ required)');
        process.exit(1);
      }
      console.log('✅ Validation complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = ObjectDetectionValidator;
