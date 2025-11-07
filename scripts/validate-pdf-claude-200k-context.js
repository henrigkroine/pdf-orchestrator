/**
 * CLAUDE 200K CONTEXT MULTI-PAGE VALIDATOR
 *
 * Analyzes entire documents (50+ pages) in a single request using Claude 4's 200K context window.
 * Superior cross-page consistency checking compared to single-page analysis.
 *
 * Key Features:
 * - 200K token context window (50-80 pages at once)
 * - Cross-page consistency validation
 * - Full document context awareness
 * - Detects issues across page boundaries
 * - Works with Opus 4.1, Sonnet 4.5, or Haiku 4.5
 *
 * Advantages:
 * - Catches inconsistencies across pages
 * - Validates numbering and references
 * - Checks brand consistency throughout document
 * - More efficient than page-by-page for large docs
 *
 * Use Cases:
 * - Multi-page brand documents
 * - Reports and whitepapers
 * - Full document consistency checks
 * - Cross-reference validation
 *
 * Usage: node scripts/validate-pdf-claude-200k-context.js <path-to-pdf>
 *
 * Options:
 *   --model <opus|sonnet|haiku>  Choose Claude 4 model (default: sonnet)
 *   --thinking                   Enable extended thinking (opus/sonnet only)
 *   --max-pages <n>              Maximum pages to analyze (default: 50)
 */

import Anthropic from '@anthropic-ai/sdk';
import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, 'config', '.env') });

// Model configurations
const MODEL_CONFIGS = {
  opus: {
    model: 'claude-opus-4.1',
    maxTokens: 8192,
    thinkingEnabled: true,
    thinkingType: 'extended',
    thinkingBudget: 10000,
    costPerPage: 0.015,
    tier: 'premium'
  },
  sonnet: {
    model: 'claude-sonnet-4.5',
    maxTokens: 8192,
    thinkingEnabled: true,
    thinkingType: 'enabled',
    thinkingBudget: 5000,
    costPerPage: 0.003,
    tier: 'balanced'
  },
  haiku: {
    model: 'claude-haiku-4.5',
    maxTokens: 4096,
    thinkingEnabled: false,
    thinkingType: 'disabled',
    thinkingBudget: 0,
    costPerPage: 0.0004,
    tier: 'fast'
  }
};

/**
 * Claude 200K Context Validator
 */
class Claude200KValidator {
  constructor(filePath, options = {}) {
    this.filePath = path.resolve(filePath);
    this.fileName = path.basename(filePath);
    this.outputDir = path.join(projectRoot, 'exports', 'ai-validation-reports', 'claude-200k');

    // Model selection
    const modelKey = options.model || 'sonnet';
    this.modelConfig = MODEL_CONFIGS[modelKey];

    if (!this.modelConfig) {
      throw new Error(`Invalid model: ${modelKey}. Use opus, sonnet, or haiku.`);
    }

    this.options = {
      maxPages: options.maxPages || 50,
      enableThinking: options.enableThinking !== false && this.modelConfig.thinkingEnabled,
      verbose: options.verbose || false,
      ...options
    };

    // Initialize Anthropic
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Convert PDF to images
   */
  async convertPDFToImages() {
    console.log(`\n📄 Converting PDF to images...`);

    const isPDF = this.fileName.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      return [this.filePath];
    }

    const tempDir = path.join(this.outputDir, 'temp-images');
    await fs.mkdir(tempDir, { recursive: true });

    const imagePaths = [];
    let pageNum = 1;

    try {
      const document = await pdf(this.filePath, { scale: 2.5 });

      for await (const image of document) {
        if (pageNum > this.options.maxPages) {
          console.log(`  ⚠️  Reached max pages limit (${this.options.maxPages})`);
          break;
        }

        const imagePath = path.join(tempDir, `page-${pageNum}.png`);
        await fs.writeFile(imagePath, image);
        imagePaths.push(imagePath);
        console.log(`  ✅ Page ${pageNum}`);
        pageNum++;
      }
    } catch (error) {
      throw new Error(`PDF conversion failed: ${error.message}`);
    }

    console.log(`  📸 Total: ${imagePaths.length} pages\n`);
    return imagePaths;
  }

  /**
   * Analyze entire document in single request using 200K context
   */
  async analyzeFullDocument(imagePaths) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📚 FULL DOCUMENT ANALYSIS - ${imagePaths.length} PAGES IN 200K CONTEXT`);
    console.log(`🤖 Model: ${this.modelConfig.model}`);
    console.log('='.repeat(80));

    // Build multi-page prompt
    const prompt = `You are analyzing a complete ${imagePaths.length}-page TEEI document.
Use your 200K context window to examine ALL pages together for comprehensive validation.

TEEI BRAND GUIDELINES:

PRIMARY COLORS: Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
FONTS: Lora (headlines), Roboto Flex (body)
LAYOUT: 40pt margins, 60pt section breaks, 12-column grid

CROSS-PAGE ANALYSIS (leveraging full context):
1. Brand Consistency: Are colors/fonts consistent across ALL pages?
2. Visual Continuity: Does layout maintain consistency throughout?
3. Page Flow: Are transitions between pages smooth and logical?
4. Numbering: Are page numbers, sections, references consistent?
5. Typography: Font usage consistent across document?
6. Photography: Quality and style consistent throughout?

PER-PAGE ANALYSIS:
- Identify which specific pages have violations
- Note patterns across multiple pages
- Flag inconsistencies between pages

Provide JSON analysis:

{
  "overallScore": <1-10>,
  "overallGrade": "<A+ to F>",
  "totalPages": ${imagePaths.length},
  "crossPageAnalysis": {
    "brandConsistency": {
      "score": <1-10>,
      "consistent": <true/false>,
      "issues": ["<cross-page brand inconsistencies>"]
    },
    "visualContinuity": {
      "score": <1-10>,
      "consistent": <true/false>,
      "issues": ["<layout/design breaks between pages>"]
    },
    "contentFlow": {
      "score": <1-10>,
      "logical": <true/false>,
      "issues": ["<page flow problems>"]
    }
  },
  "perPageSummary": [
    {
      "page": 1,
      "score": <1-10>,
      "grade": "<A-F>",
      "criticalIssues": ["<page-specific critical issues>"],
      "notes": "<brief page assessment>"
    },
    ... (for each page)
  ],
  "documentWideIssues": {
    "criticalViolations": ["<issues affecting multiple pages>"],
    "majorIssues": ["<significant problems across document>"],
    "minorIssues": ["<small issues found throughout>"]
  },
  "strengths": ["<what works well across document>"],
  "recommendations": ["<prioritized improvements for entire document>"],
  "readyForPublication": <true/false>,
  "summary": "<comprehensive 2-3 sentence document assessment>"
}`;

    // Build content array with all images
    const content = [{ type: 'text', text: prompt }];

    console.log(`\n📸 Loading ${imagePaths.length} pages into 200K context...`);

    for (let i = 0; i < imagePaths.length; i++) {
      const imageBuffer = await fs.readFile(imagePaths[i]);
      const base64Data = imageBuffer.toString('base64');

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: base64Data
        }
      });

      if ((i + 1) % 10 === 0 || i === imagePaths.length - 1) {
        console.log(`  ✅ Loaded ${i + 1}/${imagePaths.length} pages`);
      }
    }

    // Build request
    const requestConfig = {
      model: this.modelConfig.model,
      max_tokens: this.modelConfig.maxTokens,
      messages: [{ role: 'user', content }]
    };

    // Add thinking if enabled
    if (this.options.enableThinking && this.modelConfig.thinkingEnabled) {
      requestConfig.thinking = {
        type: this.modelConfig.thinkingType,
        budget_tokens: this.modelConfig.thinkingBudget
      };
      console.log(`\n🧠 Extended Thinking: ENABLED (${this.modelConfig.thinkingBudget} tokens)`);
    }

    console.log(`\n🔄 Analyzing full document with ${this.modelConfig.model}...`);
    console.log(`⏱️  This may take 10-30 seconds for deep analysis...\n`);

    const startTime = Date.now();

    try {
      const message = await this.anthropic.messages.create(requestConfig);

      const duration = Date.now() - startTime;

      // Extract response
      const thinkingContent = message.content.find(c => c.type === 'thinking');
      const textContent = message.content.find(c => c.type === 'text');

      if (!textContent) {
        throw new Error('No text content in response');
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Add metadata
      analysis._metadata = {
        model: this.modelConfig.model,
        tier: this.modelConfig.tier,
        contextWindow: 200000,
        pagesAnalyzed: imagePaths.length,
        thinkingEnabled: this.options.enableThinking,
        analysisTime: duration,
        costEstimate: (this.modelConfig.costPerPage * imagePaths.length).toFixed(4),
        timestamp: new Date().toISOString()
      };

      if (thinkingContent) {
        analysis._metadata.thinkingUsed = true;
        analysis._metadata.thinkingLength = thinkingContent.thinking?.length || 0;
      }

      console.log(`\n✅ Analysis complete in ${(duration / 1000).toFixed(1)}s`);

      return analysis;

    } catch (error) {
      throw new Error(`Full document analysis failed: ${error.message}`);
    }
  }

  /**
   * Display analysis results
   */
  displayResults(analysis) {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 FULL DOCUMENT ANALYSIS RESULTS');
    console.log('='.repeat(80));

    console.log(`\n🎯 Overall Assessment:`);
    console.log(`   Grade: ${analysis.overallGrade}`);
    console.log(`   Score: ${analysis.overallScore}/10`);
    console.log(`   Pages: ${analysis.totalPages}`);
    console.log(`   Ready for Publication: ${analysis.readyForPublication ? '✅ YES' : '❌ NO'}`);

    console.log(`\n🔗 Cross-Page Analysis:`);
    console.log(`   Brand Consistency: ${analysis.crossPageAnalysis.brandConsistency.score}/10`);
    console.log(`   Visual Continuity: ${analysis.crossPageAnalysis.visualContinuity.score}/10`);
    console.log(`   Content Flow: ${analysis.crossPageAnalysis.contentFlow.score}/10`);

    if (analysis.documentWideIssues.criticalViolations.length > 0) {
      console.log(`\n🚨 Document-Wide Critical Violations (${analysis.documentWideIssues.criticalViolations.length}):`);
      analysis.documentWideIssues.criticalViolations.forEach(v => {
        console.log(`   ❌ ${v}`);
      });
    }

    if (analysis.documentWideIssues.majorIssues.length > 0) {
      console.log(`\n⚠️  Major Issues (${analysis.documentWideIssues.majorIssues.length}):`);
      analysis.documentWideIssues.majorIssues.slice(0, 5).forEach(i => {
        console.log(`   ⚠️  ${i}`);
      });
      if (analysis.documentWideIssues.majorIssues.length > 5) {
        console.log(`   ... and ${analysis.documentWideIssues.majorIssues.length - 5} more`);
      }
    }

    console.log(`\n✅ Document Strengths:`);
    analysis.strengths.slice(0, 3).forEach(s => {
      console.log(`   ✓ ${s}`);
    });

    console.log(`\n💡 Summary:`);
    console.log(`   ${analysis.summary}`);

    console.log(`\n📈 Performance:`);
    console.log(`   Model: ${analysis._metadata.model} (${analysis._metadata.tier})`);
    console.log(`   Context Used: ${analysis._metadata.pagesAnalyzed} pages in 200K window`);
    console.log(`   Analysis Time: ${(analysis._metadata.analysisTime / 1000).toFixed(1)}s`);
    console.log(`   Cost Estimate: $${analysis._metadata.costEstimate}`);

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Generate report
   */
  async generateReport(analysis) {
    const report = {
      ...analysis,
      documentName: this.fileName,
      validatorType: 'Claude 200K Context Multi-Page'
    };

    await fs.mkdir(this.outputDir, { recursive: true });
    const timestamp = Date.now();
    const baseName = path.basename(this.fileName, path.extname(this.fileName));

    const reportPath = path.join(
      this.outputDir,
      `${baseName}-200k-context-${timestamp}.json`
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    const summaryPath = reportPath.replace('.json', '.txt');
    await this.generateTextSummary(report, summaryPath);

    return { report, reportPath, summaryPath };
  }

  /**
   * Generate text summary
   */
  async generateTextSummary(report, outputPath) {
    const lines = [
      '='.repeat(80),
      'CLAUDE 200K CONTEXT MULTI-PAGE VALIDATION REPORT',
      `Model: ${report._metadata.model} | Full Document Analysis`,
      '='.repeat(80),
      '',
      `Document: ${report.documentName}`,
      `Pages Analyzed: ${report.totalPages} (in single 200K context request)`,
      `Validated: ${report._metadata.timestamp}`,
      '',
      `Overall Grade: ${report.overallGrade}`,
      `Overall Score: ${report.overallScore}/10`,
      `Ready for Publication: ${report.readyForPublication ? 'YES' : 'NO'}`,
      '',
      '='.repeat(80),
      'CROSS-PAGE CONSISTENCY ANALYSIS',
      '='.repeat(80),
      '',
      `Brand Consistency: ${report.crossPageAnalysis.brandConsistency.score}/10`,
      `Visual Continuity: ${report.crossPageAnalysis.visualContinuity.score}/10`,
      `Content Flow: ${report.crossPageAnalysis.contentFlow.score}/10`,
      ''
    ];

    if (report.documentWideIssues.criticalViolations.length > 0) {
      lines.push('🚨 DOCUMENT-WIDE CRITICAL VIOLATIONS:');
      report.documentWideIssues.criticalViolations.forEach((v, i) => {
        lines.push(`${i + 1}. ${v}`);
      });
      lines.push('');
    }

    if (report.documentWideIssues.majorIssues.length > 0) {
      lines.push('⚠️  MAJOR ISSUES:');
      report.documentWideIssues.majorIssues.forEach((i, idx) => {
        lines.push(`${idx + 1}. ${i}`);
      });
      lines.push('');
    }

    lines.push('='.repeat(80));
    lines.push('PER-PAGE SUMMARY');
    lines.push('='.repeat(80));
    lines.push('');

    report.perPageSummary.forEach(page => {
      lines.push(`Page ${page.page}: Grade ${page.grade} (${page.score}/10)`);
      if (page.criticalIssues.length > 0) {
        page.criticalIssues.forEach(issue => {
          lines.push(`  ❌ ${issue}`);
        });
      }
      lines.push(`  ${page.notes}`);
      lines.push('');
    });

    lines.push('='.repeat(80));
    lines.push(`Analysis Time: ${(report._metadata.analysisTime / 1000).toFixed(1)}s`);
    lines.push(`Cost: $${report._metadata.costEstimate}`);
    lines.push('='.repeat(80));

    await fs.writeFile(outputPath, lines.join('\n'));
  }

  /**
   * Run validation
   */
  async validate() {
    console.log('\n' + '='.repeat(80));
    console.log('📚 CLAUDE 200K CONTEXT MULTI-PAGE VALIDATOR');
    console.log('Full Document Analysis | Cross-Page Consistency');
    console.log('='.repeat(80));
    console.log(`\nDocument: ${this.fileName}`);
    console.log(`Model: ${this.modelConfig.model} (${this.modelConfig.tier})`);
    console.log(`Max Pages: ${this.options.maxPages}`);

    const startTime = Date.now();

    try {
      const imagePaths = await this.convertPDFToImages();

      if (imagePaths.length > this.options.maxPages) {
        console.warn(`\n⚠️  Document has ${imagePaths.length} pages, analyzing first ${this.options.maxPages} only`);
      }

      const analysis = await this.analyzeFullDocument(imagePaths);
      this.displayResults(analysis);

      const { report, reportPath, summaryPath } = await this.generateReport(analysis);

      const duration = Date.now() - startTime;

      console.log(`\n⏱️  Total Time: ${(duration / 1000).toFixed(1)}s`);
      console.log(`💰 Estimated Cost: $${report._metadata.costEstimate}`);
      console.log(`\n📄 Report: ${reportPath}`);
      console.log(`📄 Summary: ${summaryPath}`);
      console.log('\n' + '='.repeat(80) + '\n');

      const passed = analysis.documentWideIssues.criticalViolations.length === 0 &&
                     analysis.overallScore >= 8.0;

      process.exit(passed ? 0 : 1);

    } catch (error) {
      console.error('\n❌ ERROR:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  let filePath = null;
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--model' && args[i + 1]) {
      options.model = args[i + 1].toLowerCase();
      i++;
    } else if (args[i] === '--thinking') {
      options.enableThinking = true;
    } else if (args[i] === '--max-pages' && args[i + 1]) {
      options.maxPages = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--verbose') {
      options.verbose = true;
    } else if (!filePath && !args[i].startsWith('--')) {
      filePath = args[i];
    }
  }

  if (!filePath) {
    console.error('Usage: node validate-pdf-claude-200k-context.js <path-to-pdf> [options]');
    console.error('\nOptions:');
    console.error('  --model <opus|sonnet|haiku>  Choose Claude 4 model (default: sonnet)');
    console.error('  --thinking                   Enable extended thinking');
    console.error('  --max-pages <n>              Maximum pages to analyze (default: 50)');
    console.error('  --verbose                    Show detailed logs');
    process.exit(1);
  }

  if (!fsSync.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const validator = new Claude200KValidator(filePath, options);
  validator.validate().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default Claude200KValidator;
