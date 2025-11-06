#!/usr/bin/env node

/**
 * Structured PDF Validator with Few-Shot Learning
 * Enhanced validator using Gemini JSON mode and training examples
 * Phase 2: Structured JSON Output + Few-Shot Learning
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
const FewShotPromptBuilder = require('./lib/few-shot-prompt-builder');
const SchemaValidator = require('./lib/schema-validator');

class StructuredPDFValidator {
  constructor(apiKey, projectRoot) {
    this.apiKey = apiKey;
    this.projectRoot = projectRoot;
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Initialize components
    this.trainingDir = path.join(projectRoot, 'training-examples');
    this.schemasDir = path.join(projectRoot, 'schemas');
    this.promptBuilder = new FewShotPromptBuilder(this.trainingDir);
    this.schemaValidator = new SchemaValidator();

    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize validator
   */
  async init() {
    console.log('🚀 Initializing structured PDF validator...');

    // Launch browser
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();

    // Load schemas
    await this.schemaValidator.loadAllSchemas(this.schemasDir);

    // Load training examples
    try {
      const stats = await this.promptBuilder.loadExamples();
      console.log(`📚 Loaded ${stats.total} training examples (${stats.good} good, ${stats.bad} bad)`);
    } catch (error) {
      console.warn(`⚠️  Could not load training examples: ${error.message}`);
      console.warn('   Continuing without few-shot learning...');
    }

    console.log('✅ Initialized');
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Get AI vision output schema for Gemini JSON mode
   */
  getAIVisionSchema() {
    return {
      type: 'object',
      properties: {
        overallScore: {
          type: 'number',
          description: 'Overall score from 0-10',
          minimum: 0,
          maximum: 10
        },
        gradeLevel: {
          type: 'string',
          description: 'Letter grade',
          enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F']
        },
        confidence: {
          type: 'number',
          description: 'Confidence in this analysis (0.0-1.0)',
          minimum: 0,
          maximum: 1
        },
        brandCompliance: {
          type: 'object',
          properties: {
            colors: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 0, maximum: 10 },
                pass: { type: 'boolean' },
                notes: { type: 'string' },
                correctColors: {
                  type: 'array',
                  items: { type: 'string' }
                },
                incorrectColors: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['score', 'pass', 'notes']
            },
            typography: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 0, maximum: 10 },
                pass: { type: 'boolean' },
                notes: { type: 'string' },
                correctFonts: {
                  type: 'array',
                  items: { type: 'string' }
                },
                incorrectFonts: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['score', 'pass', 'notes']
            },
            layout: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 0, maximum: 10 },
                pass: { type: 'boolean' },
                notes: { type: 'string' },
                gridCompliance: { type: 'boolean' },
                spacingCorrect: { type: 'boolean' },
                textCutoffs: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['score', 'pass', 'notes']
            },
            photography: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 0, maximum: 10 },
                pass: { type: 'boolean' },
                notes: { type: 'string' },
                hasPhotography: { type: 'boolean' },
                photographyQuality: {
                  type: 'string',
                  enum: ['excellent', 'good', 'fair', 'poor', 'none']
                },
                warmTones: { type: 'boolean' },
                authentic: { type: 'boolean' }
              },
              required: ['score', 'pass', 'notes', 'hasPhotography']
            },
            logos: {
              type: 'object',
              properties: {
                score: { type: 'number', minimum: 0, maximum: 10 },
                pass: { type: 'boolean' },
                notes: { type: 'string' },
                clearspaceCorrect: { type: 'boolean' },
                logoQuality: {
                  type: 'string',
                  enum: ['high-resolution', 'acceptable', 'low-resolution', 'pixelated']
                }
              },
              required: ['score', 'pass', 'notes']
            }
          },
          required: ['colors', 'typography', 'layout']
        },
        violations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['color', 'typography', 'layout', 'photography', 'logo', 'content', 'accessibility']
              },
              severity: {
                type: 'string',
                enum: ['critical', 'major', 'minor']
              },
              description: { type: 'string' },
              location: { type: 'string' },
              recommendation: { type: 'string' }
            },
            required: ['type', 'severity', 'description', 'location', 'recommendation']
          }
        },
        strengths: {
          type: 'array',
          items: { type: 'string' }
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' }
        },
        accessibilityCompliance: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 0, maximum: 10 },
            colorContrast: { type: 'string' },
            textSize: { type: 'string' },
            readingOrder: { type: 'string' }
          }
        }
      },
      required: [
        'overallScore',
        'gradeLevel',
        'confidence',
        'brandCompliance',
        'violations',
        'strengths',
        'recommendations'
      ]
    };
  }

  /**
   * Build prompt with few-shot examples
   */
  async buildPromptWithExamples() {
    try {
      const prompt = await this.promptBuilder.buildValidationPrompt({
        goodExampleCount: 2,
        badExampleCount: 2,
        includeFullAnnotations: true
      });

      return prompt;
    } catch (error) {
      console.warn(`⚠️  Could not build few-shot prompt: ${error.message}`);

      // Fallback to basic prompt without examples
      return `
# TEEI Brand Compliance Validation

Analyze this document for TEEI brand compliance.

**TEEI Brand Standards:**
- Colors: Nordshore #00393F (primary), Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
- Forbidden: Copper/orange tones
- Typography: Lora (headlines), Roboto Flex (body)
- Layout: 12-column grid, 40pt margins, 60pt section breaks
- Photography: Warm, natural, authentic (not stock)

Evaluate and return structured JSON analysis.
      `.trim();
    }
  }

  /**
   * Convert PDF to image for analysis
   */
  async convertPDFToImage(pdfPath) {
    console.log(`📄 Converting PDF to image...`);

    const pdfBuffer = await fs.readFile(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${pdfBase64}`;

    await this.page.goto(dataUrl);
    await this.page.waitForTimeout(2000);

    const screenshot = await this.page.screenshot({
      fullPage: true,
      type: 'png',
      scale: 'device'
    });

    return screenshot.toString('base64');
  }

  /**
   * Analyze PDF with structured JSON output
   */
  async analyzePDF(pdfPath, options = {}) {
    const {
      model = 'gemini-1.5-flash',
      temperature = 0.4,  // Lower for more consistent output
      maxRetries = 2
    } = options;

    console.log(`\n🔍 Analyzing PDF: ${path.basename(pdfPath)}`);
    console.log(`   Model: ${model}`);
    console.log(`   Temperature: ${temperature}`);

    // Convert PDF to image
    const imageBase64 = await this.convertPDFToImage(pdfPath);

    // Build prompt with few-shot examples
    const promptText = await this.buildPromptWithExamples();

    // Configure model with JSON mode
    const generationConfig = {
      temperature,
      topP: 0.8,
      topK: 40,
      responseMimeType: 'application/json',  // Force JSON output
      responseSchema: this.getAIVisionSchema()  // Strict schema
    };

    const genModel = this.genAI.getGenerativeModel({
      model,
      generationConfig
    });

    // Prepare content for API
    const parts = [
      { text: promptText },
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/png'
        }
      }
    ];

    // Analyze with retry logic
    let attempts = 0;
    let lastError;

    while (attempts <= maxRetries) {
      attempts++;

      try {
        console.log(`   Attempt ${attempts}/${maxRetries + 1}...`);

        const startTime = Date.now();
        const result = await genModel.generateContent(parts);
        const response = result.response;
        const duration = Date.now() - startTime;

        // Get JSON response
        const text = response.text();
        let analysisData;

        try {
          analysisData = JSON.parse(text);
        } catch (parseError) {
          throw new Error(`Failed to parse JSON response: ${parseError.message}`);
        }

        console.log(`   ⏱️  Analysis took ${duration}ms`);

        // Validate against schema
        console.log(`   🔍 Validating output schema...`);

        // Create simplified schema for validation (without responseSchema format)
        const validation = this.validateAnalysisOutput(analysisData);

        if (!validation.valid) {
          console.warn(`   ⚠️  Schema validation warnings:`);
          validation.formattedErrors.forEach(err => console.warn(`      ${err}`));

          if (attempts <= maxRetries) {
            // Retry with correction prompt
            console.log(`   🔄 Retrying with corrections...`);

            const correctionPrompt = this.schemaValidator.createCorrectionPrompt(
              validation.formattedErrors
            );

            parts[0] = { text: promptText + '\n\n' + correctionPrompt };
            continue;
          } else {
            console.warn(`   ⚠️  Max retries reached, using best attempt`);
          }
        } else {
          console.log(`   ✅ Schema validation passed`);
        }

        // Add metadata
        analysisData.metadata = {
          pdfPath: path.basename(pdfPath),
          timestamp: new Date().toISOString(),
          model,
          temperature,
          durationMs: duration,
          attempts,
          schemaValidation: validation.valid ? 'passed' : 'warning'
        };

        return {
          success: true,
          data: analysisData,
          attempts,
          duration
        };
      } catch (error) {
        lastError = error;
        console.error(`   ❌ Attempt ${attempts} failed: ${error.message}`);

        if (attempts <= maxRetries) {
          console.log(`   🔄 Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
        }
      }
    }

    // All retries failed
    throw new Error(`Analysis failed after ${attempts} attempts: ${lastError.message}`);
  }

  /**
   * Validate analysis output
   */
  validateAnalysisOutput(data) {
    // Basic validation (simplified from schema)
    const errors = [];

    if (typeof data.overallScore !== 'number' || data.overallScore < 0 || data.overallScore > 10) {
      errors.push('overallScore must be a number between 0 and 10');
    }

    if (!['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].includes(data.gradeLevel)) {
      errors.push('gradeLevel must be one of: A+, A, B+, B, C, D, F');
    }

    if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 1) {
      errors.push('confidence must be a number between 0 and 1');
    }

    if (!data.brandCompliance || typeof data.brandCompliance !== 'object') {
      errors.push('brandCompliance is required and must be an object');
    }

    if (!Array.isArray(data.violations)) {
      errors.push('violations must be an array');
    }

    if (!Array.isArray(data.strengths)) {
      errors.push('strengths must be an array');
    }

    if (!Array.isArray(data.recommendations)) {
      errors.push('recommendations must be an array');
    }

    return {
      valid: errors.length === 0,
      formattedErrors: errors
    };
  }

  /**
   * Save analysis report
   */
  async saveReport(analysis, pdfPath, outputDir) {
    const baseName = path.basename(pdfPath, path.extname(pdfPath));
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    // Save JSON report
    const jsonPath = path.join(outputDir, `${baseName}-analysis-${timestamp}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(analysis, null, 2), 'utf8');
    console.log(`✅ Saved JSON report: ${jsonPath}`);

    // Save human-readable report
    const textPath = path.join(outputDir, `${baseName}-analysis-${timestamp}.txt`);
    const textReport = this.formatTextReport(analysis);
    await fs.writeFile(textPath, textReport, 'utf8');
    console.log(`✅ Saved text report: ${textPath}`);

    return { jsonPath, textPath };
  }

  /**
   * Format analysis as human-readable text
   */
  formatTextReport(analysis) {
    const data = analysis.data;

    let report = '';
    report += '=' .repeat(80) + '\n';
    report += 'TEEI BRAND COMPLIANCE ANALYSIS - STRUCTURED VALIDATION\n';
    report += '=' .repeat(80) + '\n\n';

    report += `Document: ${data.metadata.pdfPath}\n`;
    report += `Analyzed: ${data.metadata.timestamp}\n`;
    report += `Model: ${data.metadata.model}\n`;
    report += `Duration: ${data.metadata.durationMs}ms\n`;
    report += `Attempts: ${data.metadata.attempts}\n`;
    report += `Schema Validation: ${data.metadata.schemaValidation}\n\n`;

    report += '-'.repeat(80) + '\n';
    report += 'OVERALL RESULTS\n';
    report += '-'.repeat(80) + '\n\n';

    report += `Grade: ${data.gradeLevel}\n`;
    report += `Score: ${data.overallScore.toFixed(1)}/10\n`;
    report += `Confidence: ${(data.confidence * 100).toFixed(1)}%\n\n`;

    // Brand compliance breakdown
    report += '-'.repeat(80) + '\n';
    report += 'BRAND COMPLIANCE BREAKDOWN\n';
    report += '-'.repeat(80) + '\n\n';

    const bc = data.brandCompliance;

    if (bc.colors) {
      report += `Colors: ${bc.colors.score.toFixed(1)}/10 ${bc.colors.pass ? '✅' : '❌'}\n`;
      report += `  ${bc.colors.notes}\n\n`;
    }

    if (bc.typography) {
      report += `Typography: ${bc.typography.score.toFixed(1)}/10 ${bc.typography.pass ? '✅' : '❌'}\n`;
      report += `  ${bc.typography.notes}\n\n`;
    }

    if (bc.layout) {
      report += `Layout: ${bc.layout.score.toFixed(1)}/10 ${bc.layout.pass ? '✅' : '❌'}\n`;
      report += `  ${bc.layout.notes}\n\n`;
    }

    if (bc.photography) {
      report += `Photography: ${bc.photography.score.toFixed(1)}/10 ${bc.photography.pass ? '✅' : '❌'}\n`;
      report += `  ${bc.photography.notes}\n\n`;
    }

    if (bc.logos) {
      report += `Logos: ${bc.logos.score.toFixed(1)}/10 ${bc.logos.pass ? '✅' : '❌'}\n`;
      report += `  ${bc.logos.notes}\n\n`;
    }

    // Violations
    if (data.violations && data.violations.length > 0) {
      report += '-'.repeat(80) + '\n';
      report += 'VIOLATIONS FOUND\n';
      report += '-'.repeat(80) + '\n\n';

      const critical = data.violations.filter(v => v.severity === 'critical');
      const major = data.violations.filter(v => v.severity === 'major');
      const minor = data.violations.filter(v => v.severity === 'minor');

      if (critical.length > 0) {
        report += `CRITICAL (${critical.length}):\n`;
        critical.forEach((v, i) => {
          report += `  ${i + 1}. ${v.description}\n`;
          report += `     Location: ${v.location}\n`;
          report += `     Fix: ${v.recommendation}\n\n`;
        });
      }

      if (major.length > 0) {
        report += `MAJOR (${major.length}):\n`;
        major.forEach((v, i) => {
          report += `  ${i + 1}. ${v.description}\n`;
          report += `     Location: ${v.location}\n`;
          report += `     Fix: ${v.recommendation}\n\n`;
        });
      }

      if (minor.length > 0) {
        report += `MINOR (${minor.length}):\n`;
        minor.forEach((v, i) => {
          report += `  ${i + 1}. ${v.description}\n`;
          report += `     Location: ${v.location}\n\n`;
        });
      }
    } else {
      report += '✅ No violations found!\n\n';
    }

    // Strengths
    if (data.strengths && data.strengths.length > 0) {
      report += '-'.repeat(80) + '\n';
      report += 'STRENGTHS\n';
      report += '-'.repeat(80) + '\n\n';

      data.strengths.forEach((s, i) => {
        report += `  ${i + 1}. ${s}\n`;
      });
      report += '\n';
    }

    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      report += '-'.repeat(80) + '\n';
      report += 'RECOMMENDATIONS\n';
      report += '-'.repeat(80) + '\n\n';

      data.recommendations.forEach((r, i) => {
        report += `  ${i + 1}. ${r}\n`;
      });
      report += '\n';
    }

    // Accessibility
    if (data.accessibilityCompliance) {
      report += '-'.repeat(80) + '\n';
      report += 'ACCESSIBILITY COMPLIANCE\n';
      report += '-'.repeat(80) + '\n\n';

      const ac = data.accessibilityCompliance;
      report += `Score: ${ac.score}/10\n\n`;

      if (ac.colorContrast) {
        report += `Color Contrast: ${ac.colorContrast}\n`;
      }
      if (ac.textSize) {
        report += `Text Size: ${ac.textSize}\n`;
      }
      if (ac.readingOrder) {
        report += `Reading Order: ${ac.readingOrder}\n`;
      }
      report += '\n';
    }

    report += '=' .repeat(80) + '\n';

    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Structured PDF Validator with Few-Shot Learning

USAGE:
  node validate-pdf-structured.js <pdf-path> [options]

OPTIONS:
  --model <name>          Gemini model (default: gemini-1.5-flash)
  --temperature <float>   Temperature 0-1 (default: 0.4)
  --output-dir <path>     Output directory (default: exports/ai-validation-reports)

EXAMPLES:
  node validate-pdf-structured.js exports/teei-aws-v1.pdf
  node validate-pdf-structured.js exports/teei-aws-v1.pdf --model gemini-1.5-pro
  node validate-pdf-structured.js exports/teei-aws-v1.pdf --temperature 0.3
    `.trim());
    process.exit(0);
  }

  const pdfPath = args[0];
  const model = args.includes('--model') ? args[args.indexOf('--model') + 1] : 'gemini-1.5-flash';
  const temperature = args.includes('--temperature') ? parseFloat(args[args.indexOf('--temperature') + 1]) : 0.4;
  const outputDir = args.includes('--output-dir') ? args[args.indexOf('--output-dir') + 1] : path.join(__dirname, '..', 'exports', 'ai-validation-reports');

  // Verify API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY environment variable not set');
    process.exit(1);
  }

  // Verify PDF exists
  try {
    await fs.access(pdfPath);
  } catch (error) {
    console.error(`❌ PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  const projectRoot = path.resolve(__dirname, '..');
  const validator = new StructuredPDFValidator(apiKey, projectRoot);

  try {
    await validator.init();

    const analysis = await validator.analyzePDF(pdfPath, {
      model,
      temperature
    });

    const reports = await validator.saveReport(analysis, pdfPath, outputDir);

    console.log(`\n✅ Analysis complete!`);
    console.log(`   Grade: ${analysis.data.gradeLevel} (${analysis.data.overallScore.toFixed(1)}/10)`);
    console.log(`   Confidence: ${(analysis.data.confidence * 100).toFixed(1)}%`);
    console.log(`   Violations: ${analysis.data.violations.length}`);
    console.log(`\n📄 Reports:`);
    console.log(`   JSON: ${reports.jsonPath}`);
    console.log(`   Text: ${reports.textPath}`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Validation failed:`, error.message);
    process.exit(1);
  } finally {
    await validator.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = StructuredPDFValidator;
