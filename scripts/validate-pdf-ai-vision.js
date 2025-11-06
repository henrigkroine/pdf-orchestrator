/**
 * AI VISION PDF VALIDATOR
 *
 * Uses Google Gemini Vision AI to intelligently validate PDF documents
 * against TEEI brand guidelines and world-class design standards.
 *
 * This validator provides REAL AI-powered analysis:
 * - Visual design quality assessment
 * - Brand compliance validation
 * - Typography and layout evaluation
 * - Professional appearance scoring
 * - Specific issue identification with recommendations
 *
 * Usage: node scripts/validate-pdf-ai-vision.js <path-to-pdf-or-image>
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// TEEI Brand Guidelines (loaded from CLAUDE.md)
const TEEI_BRAND_GUIDELINES = `
# TEEI BRAND GUIDELINES

## Official Color Palette
PRIMARY COLORS:
- Nordshore #00393F (Deep teal) - PRIMARY brand color, 80% usage recommended
- Sky #C9E4EC (Light blue) - Secondary highlights
- Sand #FFF1E2 (Warm neutral) - Background
- Beige #EFE1DC (Soft neutral) - Background

ACCENT COLORS:
- Moss #65873B (Natural green)
- Gold #BA8F5A (Warm metallic) - Use for premium feel, metrics
- Clay #913B2F (Rich terracotta)

FORBIDDEN COLORS:
- ❌ Copper/Orange (#C87137 or similar) - NOT in TEEI palette
- ❌ Bright orange, red-orange tones

## Typography System
HEADLINES: Lora (serif) - Bold/SemiBold, 28-48pt
BODY TEXT: Roboto Flex (sans-serif) - Regular, 11-14pt
CAPTIONS: Roboto Flex Regular, 9pt

Typography Scale:
- Document Title: Lora Bold, 42pt, Nordshore
- Section Headers: Lora Semibold, 28pt, Nordshore
- Subheads: Roboto Flex Medium, 18pt, Nordshore
- Body Text: Roboto Flex Regular, 11pt, Black
- Captions: Roboto Flex Regular, 9pt, Gray #666666

## Layout Standards
- Grid: 12-column with 20pt gutters
- Margins: 40pt all sides
- Section breaks: 60pt
- Between elements: 20pt
- Between paragraphs: 12pt
- Line height (body): 1.5x
- Line height (headlines): 1.2x

## Logo Clearspace
- Minimum clearspace = height of logo icon element
- No text, graphics, or other logos within this zone

## Photography Requirements
- Natural lighting (not studio)
- Warm color tones (align with Sand/Beige palette)
- Authentic moments (not staged corporate stock)
- Diverse representation
- Shows connection and hope

## Brand Voice
- Empowering (not condescending)
- Urgent (without panic)
- Hopeful (not naive)
- Inclusive (celebrating diversity)
- Respectful (of all stakeholders)
- Clear and jargon-free

## Critical Quality Standards
❌ VIOLATIONS TO CHECK:
1. Wrong colors (copper/orange instead of Nordshore/Sky/Gold)
2. Wrong fonts (not Lora/Roboto Flex)
3. Text cutoffs (incomplete sentences at page edges)
4. Missing metrics (placeholders like "XX" instead of actual numbers)
5. No photography (when required for warmth/authenticity)
6. Logo clearspace violations
7. Poor hierarchy (unclear visual importance)
8. Inconsistent spacing
9. Low-quality or stock photography
10. Unprofessional appearance
`;

class AIVisionValidator {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
    this.fileName = path.basename(filePath);
    this.outputDir = path.join(projectRoot, 'exports', 'ai-validation-reports');

    // Initialize Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('GEMINI_API_KEY not configured in config/.env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('🤖 AI Vision Validator initialized with Gemini 1.5 Flash');
  }

  /**
   * Convert PDF to high-quality images for AI analysis
   */
  async convertPDFToImages() {
    console.log(`\n📄 Converting PDF to images for AI analysis...`);

    const isPDF = this.fileName.toLowerCase().endsWith('.pdf');

    if (!isPDF) {
      // Already an image file
      console.log('  ℹ️  Input is already an image file');
      return [this.filePath];
    }

    // Convert PDF pages to PNGs
    const tempDir = path.join(this.outputDir, 'temp-images');
    await fs.mkdir(tempDir, { recursive: true });

    const imagePaths = [];
    let pageNum = 1;

    try {
      const document = await pdf(this.filePath, { scale: 3.0 }); // High DPI for quality

      for await (const image of document) {
        const imagePath = path.join(tempDir, `page-${pageNum}.png`);
        await fs.writeFile(imagePath, image);
        imagePaths.push(imagePath);
        console.log(`  ✅ Converted page ${pageNum}`);
        pageNum++;
      }
    } catch (error) {
      throw new Error(`Failed to convert PDF: ${error.message}`);
    }

    console.log(`  📸 Generated ${imagePaths.length} page images\n`);
    return imagePaths;
  }

  /**
   * Analyze a single page/image with Gemini Vision
   */
  async analyzePage(imagePath, pageNumber) {
    console.log(`\n🔍 Analyzing Page ${pageNumber} with AI Vision...`);

    // Read image as base64
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = `You are an expert design critic and brand compliance validator for TEEI (The Educational Equality Institute).

Analyze this document page against TEEI's brand guidelines and world-class design standards.

${TEEI_BRAND_GUIDELINES}

Provide a comprehensive analysis in JSON format with the following structure:

{
  "overallScore": <1-10>,
  "gradeLevel": "<A+, A, B, C, D, or F>",
  "brandCompliance": {
    "score": <1-10>,
    "colors": {
      "pass": <true/false>,
      "issues": ["<specific color violations>"],
      "correctColors": ["<colors that ARE correct>"]
    },
    "typography": {
      "pass": <true/false>,
      "issues": ["<font violations>"],
      "correctFonts": ["<fonts that ARE correct>"]
    },
    "layout": {
      "pass": <true/false>,
      "issues": ["<spacing, margin, grid violations>"]
    },
    "photography": {
      "pass": <true/false>,
      "issues": ["<photo quality, authenticity issues>"]
    },
    "logoUsage": {
      "pass": <true/false>,
      "issues": ["<logo clearspace, placement issues>"]
    }
  },
  "designQuality": {
    "score": <1-10>,
    "visualHierarchy": {
      "pass": <true/false>,
      "issues": ["<hierarchy problems>"]
    },
    "whitespace": {
      "pass": <true/false>,
      "issues": ["<spacing, breathing room issues>"]
    },
    "alignment": {
      "pass": <true/false>,
      "issues": ["<alignment problems>"]
    },
    "consistency": {
      "pass": <true/false>,
      "issues": ["<inconsistency issues>"]
    }
  },
  "contentQuality": {
    "score": <1-10>,
    "textCutoffs": {
      "detected": <true/false>,
      "locations": ["<where text is cut off>"]
    },
    "placeholders": {
      "detected": <true/false>,
      "locations": ["<where XX or placeholders found>"]
    },
    "readability": {
      "pass": <true/false>,
      "issues": ["<readability problems>"]
    }
  },
  "criticalViolations": [
    "<List ONLY critical issues that MUST be fixed>"
  ],
  "recommendations": [
    "<Specific actionable improvements>"
  ],
  "strengths": [
    "<What's working well>"
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Be thorough, specific, and critical. Identify exact locations of problems. Grade harshly - only world-class documents deserve A+.`;

    try {
      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType
          }
        }
      ]);

      const response = result.response;
      const text = response.text();

      // Extract JSON from response (may be wrapped in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI response did not contain valid JSON');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Log summary
      console.log(`  📊 Overall Score: ${analysis.overallScore}/10`);
      console.log(`  🎯 Grade Level: ${analysis.gradeLevel}`);
      console.log(`  ✅ Brand Compliance: ${analysis.brandCompliance.score}/10`);
      console.log(`  🎨 Design Quality: ${analysis.designQuality.score}/10`);
      console.log(`  📝 Content Quality: ${analysis.contentQuality.score}/10`);

      if (analysis.criticalViolations && analysis.criticalViolations.length > 0) {
        console.log(`  ⚠️  Critical Violations: ${analysis.criticalViolations.length}`);
      }

      return analysis;

    } catch (error) {
      console.error(`  ❌ AI analysis failed: ${error.message}`);
      return {
        error: error.message,
        overallScore: 0,
        gradeLevel: 'F',
        summary: `AI analysis failed: ${error.message}`
      };
    }
  }

  /**
   * Generate comprehensive validation report
   */
  async generateReport(pageAnalyses) {
    console.log(`\n📄 Generating AI Validation Report...`);

    // Calculate aggregate scores
    const avgOverallScore = pageAnalyses.reduce((sum, a) => sum + (a.overallScore || 0), 0) / pageAnalyses.length;
    const avgBrandScore = pageAnalyses.reduce((sum, a) => sum + (a.brandCompliance?.score || 0), 0) / pageAnalyses.length;
    const avgDesignScore = pageAnalyses.reduce((sum, a) => sum + (a.designQuality?.score || 0), 0) / pageAnalyses.length;
    const avgContentScore = pageAnalyses.reduce((sum, a) => sum + (a.contentQuality?.score || 0), 0) / pageAnalyses.length;

    // Collect all critical violations
    const allViolations = [];
    pageAnalyses.forEach((analysis, idx) => {
      if (analysis.criticalViolations) {
        analysis.criticalViolations.forEach(violation => {
          allViolations.push(`Page ${idx + 1}: ${violation}`);
        });
      }
    });

    // Determine overall grade
    let overallGrade = 'F';
    if (avgOverallScore >= 9.5) overallGrade = 'A+';
    else if (avgOverallScore >= 9.0) overallGrade = 'A';
    else if (avgOverallScore >= 8.0) overallGrade = 'B';
    else if (avgOverallScore >= 7.0) overallGrade = 'C';
    else if (avgOverallScore >= 6.0) overallGrade = 'D';

    const report = {
      documentName: this.fileName,
      timestamp: new Date().toISOString(),
      validator: 'Gemini Vision AI',
      overallGrade: overallGrade,
      scores: {
        overall: avgOverallScore.toFixed(2),
        brandCompliance: avgBrandScore.toFixed(2),
        designQuality: avgDesignScore.toFixed(2),
        contentQuality: avgContentScore.toFixed(2)
      },
      totalPages: pageAnalyses.length,
      criticalViolations: allViolations,
      pageAnalyses: pageAnalyses,
      passed: allViolations.length === 0 && avgOverallScore >= 8.0
    };

    // Save report
    await fs.mkdir(this.outputDir, { recursive: true });
    const reportPath = path.join(
      this.outputDir,
      `${path.basename(this.fileName, path.extname(this.fileName))}-ai-report-${Date.now()}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate human-readable summary
    const summaryPath = reportPath.replace('.json', '.txt');
    await this.generateTextSummary(report, summaryPath);

    console.log(`  ✅ Report saved: ${reportPath}`);
    console.log(`  ✅ Summary saved: ${summaryPath}`);

    return report;
  }

  /**
   * Generate human-readable text summary
   */
  async generateTextSummary(report, outputPath) {
    const lines = [
      '='.repeat(80),
      'AI VISION VALIDATION REPORT',
      '='.repeat(80),
      '',
      `Document: ${report.documentName}`,
      `Validated: ${report.timestamp}`,
      `Validator: ${report.validator}`,
      '',
      '='.repeat(80),
      'OVERALL ASSESSMENT',
      '='.repeat(80),
      '',
      `Overall Grade: ${report.overallGrade}`,
      `Overall Score: ${report.scores.overall}/10`,
      '',
      'Category Scores:',
      `  🎨 Brand Compliance: ${report.scores.brandCompliance}/10`,
      `  🖼️  Design Quality: ${report.scores.designQuality}/10`,
      `  📝 Content Quality: ${report.scores.contentQuality}/10`,
      '',
      `Total Pages Analyzed: ${report.totalPages}`,
      `Status: ${report.passed ? '✅ PASSED' : '❌ FAILED'}`,
      ''
    ];

    if (report.criticalViolations.length > 0) {
      lines.push(
        '='.repeat(80),
        `⚠️  CRITICAL VIOLATIONS (${report.criticalViolations.length})`,
        '='.repeat(80),
        ''
      );
      report.criticalViolations.forEach((violation, idx) => {
        lines.push(`${idx + 1}. ${violation}`);
      });
      lines.push('');
    }

    // Page-by-page summaries
    lines.push(
      '='.repeat(80),
      'PAGE-BY-PAGE ANALYSIS',
      '='.repeat(80),
      ''
    );

    report.pageAnalyses.forEach((analysis, idx) => {
      lines.push(
        `-`.repeat(80),
        `PAGE ${idx + 1}`,
        `-`.repeat(80),
        '',
        `Grade: ${analysis.gradeLevel}`,
        `Score: ${analysis.overallScore}/10`,
        ''
      );

      if (analysis.summary) {
        lines.push('Summary:', analysis.summary, '');
      }

      if (analysis.criticalViolations && analysis.criticalViolations.length > 0) {
        lines.push('Critical Issues:');
        analysis.criticalViolations.forEach(v => lines.push(`  ❌ ${v}`));
        lines.push('');
      }

      if (analysis.recommendations && analysis.recommendations.length > 0) {
        lines.push('Recommendations:');
        analysis.recommendations.slice(0, 3).forEach(r => lines.push(`  💡 ${r}`));
        lines.push('');
      }

      if (analysis.strengths && analysis.strengths.length > 0) {
        lines.push('Strengths:');
        analysis.strengths.slice(0, 3).forEach(s => lines.push(`  ✅ ${s}`));
        lines.push('');
      }
    });

    lines.push('='.repeat(80));

    await fs.writeFile(outputPath, lines.join('\n'));
  }

  /**
   * Run complete AI validation
   */
  async validate() {
    console.log('\n' + '='.repeat(80));
    console.log('🤖 AI VISION PDF VALIDATOR');
    console.log('='.repeat(80));
    console.log(`\nDocument: ${this.fileName}`);
    console.log(`Validator: Google Gemini 1.5 Flash Vision`);
    console.log(`Started: ${new Date().toISOString()}\n`);

    try {
      // Step 1: Convert PDF to images
      const imagePaths = await this.convertPDFToImages();

      // Step 2: Analyze each page with AI
      const pageAnalyses = [];
      for (let i = 0; i < imagePaths.length; i++) {
        const analysis = await this.analyzePage(imagePaths[i], i + 1);
        pageAnalyses.push(analysis);
      }

      // Step 3: Generate comprehensive report
      const report = await this.generateReport(pageAnalyses);

      // Step 4: Print summary
      console.log('\n' + '='.repeat(80));
      console.log('📊 VALIDATION COMPLETE');
      console.log('='.repeat(80));
      console.log(`\n🎯 Overall Grade: ${report.overallGrade}`);
      console.log(`📈 Overall Score: ${report.scores.overall}/10`);
      console.log(`\n📊 Category Scores:`);
      console.log(`   Brand Compliance: ${report.scores.brandCompliance}/10`);
      console.log(`   Design Quality: ${report.scores.designQuality}/10`);
      console.log(`   Content Quality: ${report.scores.contentQuality}/10`);

      if (report.criticalViolations.length > 0) {
        console.log(`\n⚠️  Critical Violations: ${report.criticalViolations.length}`);
        report.criticalViolations.slice(0, 5).forEach(v => {
          console.log(`   ❌ ${v}`);
        });
        if (report.criticalViolations.length > 5) {
          console.log(`   ... and ${report.criticalViolations.length - 5} more (see report)`);
        }
      }

      console.log(`\n${report.passed ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}`);
      console.log(`\n📄 Full report: ${path.relative(projectRoot, report.reportPath || this.outputDir)}`);
      console.log('\n' + '='.repeat(80) + '\n');

      // Exit with appropriate code
      process.exit(report.passed ? 0 : 1);

    } catch (error) {
      console.error('\n❌ VALIDATION ERROR:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// CLI Interface
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node validate-pdf-ai-vision.js <path-to-pdf-or-image>');
    process.exit(1);
  }

  if (!fsSync.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const validator = new AIVisionValidator(filePath);
  validator.validate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default AIVisionValidator;
