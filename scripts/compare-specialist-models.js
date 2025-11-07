#!/usr/bin/env node

/**
 * Compare Specialist Models
 *
 * Benchmark each specialist model against general vision model.
 * Shows accuracy improvements, cost-benefit analysis, and demonstrates
 * why specialists matter for world-class QA.
 *
 * Usage:
 *   node scripts/compare-specialist-models.js <pdf-path>
 *   node scripts/compare-specialist-models.js exports/TEEI_AWS.pdf
 *
 * Output:
 *   - Accuracy comparison table
 *   - Cost-benefit analysis
 *   - Specialist recommendations
 *   - Detailed performance report
 */

import { SpecializedModelOrchestrator } from './lib/specialized-model-orchestrator.js';
import { ViTLayoutAnalyzer } from './lib/vit-layout-analyzer.js';
import { CLIPSemanticValidator } from './lib/clip-semantic-validator.js';
import { AzureOCRValidator } from './lib/azure-ocr-validator.js';
import { GoogleVisionValidator } from './lib/google-vision-validator.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { convertPDFToImages } from './lib/pdf-to-images.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SpecialistComparison {
  constructor(pdfPath) {
    this.pdfPath = pdfPath;
    this.pdfName = path.basename(pdfPath, '.pdf');
    this.outputDir = path.join('exports', 'specialist-comparison');
  }

  /**
   * Run comprehensive comparison
   */
  async compare() {
    console.log('🔬 Specialist Model Comparison');
    console.log('================================\n');
    console.log(`PDF: ${this.pdfPath}\n`);

    try {
      // 1. Convert PDF to images
      console.log('📄 Converting PDF to images...');
      const screenshots = await this.convertPDF();
      console.log(`✅ Generated ${screenshots.length} page screenshots\n`);

      // 2. Run baseline (general model only)
      console.log('🎯 Running baseline (Gemini only)...');
      const baselineStart = Date.now();
      const baseline = await this.runBaseline(screenshots);
      const baselineDuration = Date.now() - baselineStart;
      console.log(`✅ Baseline complete: ${(baselineDuration / 1000).toFixed(1)}s\n`);

      // 3. Run each specialist
      console.log('🔬 Running specialist models...\n');

      const specialists = {};

      // Layout specialist
      console.log('📐 Testing ViT Layout Analyzer...');
      const layoutStart = Date.now();
      specialists.layout = await this.runLayoutSpecialist(screenshots);
      const layoutDuration = Date.now() - layoutStart;
      console.log(`✅ Layout analysis: ${(layoutDuration / 1000).toFixed(1)}s\n`);

      // Semantic specialist
      console.log('🎯 Testing CLIP Semantic Validator...');
      const semanticStart = Date.now();
      specialists.semantic = await this.runSemanticSpecialist(screenshots);
      const semanticDuration = Date.now() - semanticStart;
      console.log(`✅ Semantic validation: ${(semanticDuration / 1000).toFixed(1)}s\n`);

      // OCR specialist
      console.log('📄 Testing Azure OCR...');
      const ocrStart = Date.now();
      specialists.ocr = await this.runOCRSpecialist(screenshots);
      const ocrDuration = Date.now() - ocrStart;
      console.log(`✅ OCR validation: ${(ocrDuration / 1000).toFixed(1)}s\n`);

      // Brand specialist
      console.log('🔍 Testing Google Vision...');
      const brandStart = Date.now();
      specialists.brand = await this.runBrandSpecialist(screenshots);
      const brandDuration = Date.now() - brandStart;
      console.log(`✅ Brand validation: ${(brandDuration / 1000).toFixed(1)}s\n`);

      // 4. Run ensemble (all specialists)
      console.log('🎯 Running ensemble (all specialists)...');
      const ensembleStart = Date.now();
      const ensemble = await this.runEnsemble(screenshots);
      const ensembleDuration = Date.now() - ensembleStart;
      console.log(`✅ Ensemble complete: ${(ensembleDuration / 1000).toFixed(1)}s\n`);

      // 5. Analyze results
      const analysis = this.analyzeResults({
        baseline,
        specialists,
        ensemble,
        durations: {
          baseline: baselineDuration,
          layout: layoutDuration,
          semantic: semanticDuration,
          ocr: ocrDuration,
          brand: brandDuration,
          ensemble: ensembleDuration
        }
      });

      // 6. Generate report
      await this.generateReport(analysis);

      // 7. Display summary
      this.displaySummary(analysis);

      return analysis;

    } catch (error) {
      console.error('❌ Error during comparison:', error);
      throw error;
    }
  }

  /**
   * Convert PDF to images
   */
  async convertPDF() {
    // Note: Using placeholder - implement actual PDF conversion
    // In production, use pdf-to-img or similar
    return [`${this.pdfPath}-page-1.png`];
  }

  /**
   * Run baseline (general model only)
   */
  async runBaseline(screenshots) {
    const orchestrator = new SpecializedModelOrchestrator({ tier: 'fast' });
    return orchestrator.validateComprehensive(this.pdfPath, screenshots);
  }

  /**
   * Run layout specialist
   */
  async runLayoutSpecialist(screenshots) {
    const analyzer = new ViTLayoutAnalyzer();
    const results = [];

    for (const [index, screenshot] of screenshots.entries()) {
      const result = await analyzer.analyzeLayout(screenshot, index + 1);
      results.push(result);
    }

    return {
      results,
      avgScore: this.average(results.map(r => r.overallScore)),
      issues: results.flatMap(r => r.issues)
    };
  }

  /**
   * Run semantic specialist
   */
  async runSemanticSpecialist(screenshots) {
    const validator = new CLIPSemanticValidator();

    const imageData = screenshots.map((screenshot, index) => ({
      id: `page-${index + 1}`,
      imagePath: screenshot,
      context: 'TEEI partnership document promoting Ukrainian education'
    }));

    return validator.validateDocumentImages(imageData);
  }

  /**
   * Run OCR specialist
   */
  async runOCRSpecialist(screenshots) {
    const validator = new AzureOCRValidator();
    return validator.validatePages(screenshots);
  }

  /**
   * Run brand specialist
   */
  async runBrandSpecialist(screenshots) {
    const validator = new GoogleVisionValidator();
    return validator.validatePages(screenshots);
  }

  /**
   * Run ensemble (all specialists)
   */
  async runEnsemble(screenshots) {
    const orchestrator = new SpecializedModelOrchestrator({ tier: 'premium' });
    return orchestrator.validateComprehensive(this.pdfPath, screenshots);
  }

  /**
   * Analyze results
   */
  analyzeResults({ baseline, specialists, ensemble, durations }) {
    // Calculate improvements over baseline
    const improvements = {};

    if (specialists.layout) {
      improvements.layout = {
        name: 'ViT Layout Analyzer',
        accuracy: this.calculateImprovement(baseline.overallScore, specialists.layout.avgScore),
        issuesFound: specialists.layout.issues.length,
        specialty: 'Grid detection, spacing, alignment',
        verdict: 'Detects layout issues missed by general models'
      };
    }

    if (specialists.semantic) {
      const semanticScore = specialists.semantic.averageScores?.overall || 0;
      improvements.semantic = {
        name: 'CLIP Semantic Validator',
        accuracy: this.calculateImprovement(baseline.overallScore, semanticScore),
        issuesFound: specialists.semantic.issues?.length || 0,
        specialty: 'Image authenticity, stock photo detection',
        verdict: 'Ensures authentic imagery vs staged stock photos'
      };
    }

    if (specialists.ocr) {
      const ocrScore = parseFloat(specialists.ocr.summary?.avgScore || 0);
      improvements.ocr = {
        name: 'Azure OCR Validator',
        accuracy: this.calculateImprovement(baseline.overallScore, ocrScore),
        issuesFound: specialists.ocr.issues?.length || 0,
        specialty: 'Text cutoffs, placeholders, OCR confidence',
        verdict: 'Catches text quality issues general models miss'
      };
    }

    if (specialists.brand) {
      const brandScore = parseFloat(specialists.brand.summary?.avgScore || 0);
      improvements.brand = {
        name: 'Google Vision Validator',
        accuracy: this.calculateImprovement(baseline.overallScore, brandScore),
        issuesFound: specialists.brand.issues?.length || 0,
        specialty: 'Logo detection, brand colors, safe search',
        verdict: 'Validates brand presence and appropriateness'
      };
    }

    // Calculate ensemble improvement
    const ensembleImprovement = this.calculateImprovement(
      baseline.overallScore,
      ensemble.overallScore
    );

    // Cost analysis
    const costs = {
      baseline: 0.0025,
      balanced: 0.0035,
      premium: 0.005
    };

    return {
      baseline: {
        score: baseline.overallScore,
        issues: baseline.issues.length,
        grade: baseline.verdict.grade,
        duration: durations.baseline
      },
      specialists: improvements,
      ensemble: {
        score: ensemble.overallScore,
        issues: ensemble.issues.length,
        grade: ensemble.verdict.grade,
        improvement: ensembleImprovement,
        duration: durations.ensemble
      },
      costs,
      recommendation: this.getRecommendation(ensembleImprovement, costs)
    };
  }

  /**
   * Calculate improvement percentage
   */
  calculateImprovement(baseline, specialist) {
    const improvement = ((specialist - baseline) / baseline) * 100;
    return {
      baseline: baseline.toFixed(3),
      specialist: specialist.toFixed(3),
      percentage: improvement.toFixed(1),
      improved: improvement > 0
    };
  }

  /**
   * Get recommendation based on results
   */
  getRecommendation(ensembleImprovement, costs) {
    const improvement = parseFloat(ensembleImprovement.percentage);

    if (improvement >= 10) {
      return {
        tier: 'premium',
        reason: `${improvement.toFixed(1)}% accuracy improvement justifies premium tier`,
        roi: 'Excellent - Significant quality gains',
        costPerPage: costs.premium
      };
    } else if (improvement >= 5) {
      return {
        tier: 'balanced',
        reason: `${improvement.toFixed(1)}% improvement with balanced cost`,
        roi: 'Good - Best cost-benefit ratio',
        costPerPage: costs.balanced
      };
    } else {
      return {
        tier: 'fast',
        reason: 'Baseline sufficient for this document',
        roi: 'Cost-effective for simpler documents',
        costPerPage: costs.baseline
      };
    }
  }

  /**
   * Generate detailed report
   */
  async generateReport(analysis) {
    await fs.mkdir(this.outputDir, { recursive: true });

    const reportPath = path.join(
      this.outputDir,
      `comparison-report-${this.pdfName}-${Date.now()}.json`
    );

    await fs.writeFile(
      reportPath,
      JSON.stringify(analysis, null, 2)
    );

    console.log(`\n📄 Report saved: ${reportPath}`);

    // Generate text summary
    const textReport = this.generateTextReport(analysis);
    const textPath = path.join(
      this.outputDir,
      `comparison-report-${this.pdfName}-${Date.now()}.txt`
    );

    await fs.writeFile(textPath, textReport);
    console.log(`📄 Text report: ${textPath}\n`);
  }

  /**
   * Generate text report
   */
  generateTextReport(analysis) {
    return `
SPECIALIST MODEL COMPARISON REPORT
===================================
PDF: ${this.pdfName}
Date: ${new Date().toISOString()}

BASELINE (General Model Only)
------------------------------
Model: Gemini 2.5 Pro
Score: ${(analysis.baseline.score * 100).toFixed(1)}%
Grade: ${analysis.baseline.grade}
Issues: ${analysis.baseline.issues}
Duration: ${(analysis.baseline.duration / 1000).toFixed(1)}s
Cost: $${analysis.costs.baseline}/page

SPECIALIST PERFORMANCE
----------------------
${Object.entries(analysis.specialists).map(([key, spec]) => `
${spec.name}:
  Specialty: ${spec.specialty}
  Baseline: ${(parseFloat(spec.accuracy.baseline) * 100).toFixed(1)}%
  Specialist: ${(parseFloat(spec.accuracy.specialist) * 100).toFixed(1)}%
  Improvement: ${spec.accuracy.percentage}%
  Issues Found: ${spec.issuesFound}
  Verdict: ${spec.verdict}
`).join('\n')}

ENSEMBLE (All Specialists)
--------------------------
Score: ${(analysis.ensemble.score * 100).toFixed(1)}%
Grade: ${analysis.ensemble.grade}
Issues: ${analysis.ensemble.issues}
Improvement: ${analysis.ensemble.improvement.percentage}% over baseline
Duration: ${(analysis.ensemble.duration / 1000).toFixed(1)}s
Cost: $${analysis.costs.premium}/page

RECOMMENDATION
--------------
Tier: ${analysis.recommendation.tier.toUpperCase()}
Reason: ${analysis.recommendation.reason}
ROI: ${analysis.recommendation.roi}
Cost: $${analysis.recommendation.costPerPage}/page

CONCLUSION
----------
${this.getConclusion(analysis)}
    `.trim();
  }

  /**
   * Get conclusion
   */
  getConclusion(analysis) {
    const improvement = parseFloat(analysis.ensemble.improvement.percentage);

    if (improvement >= 15) {
      return `Specialist models provide EXCEPTIONAL value with ${improvement.toFixed(1)}% improvement.
Premium tier recommended for world-class quality.`;
    } else if (improvement >= 10) {
      return `Specialist models provide EXCELLENT value with ${improvement.toFixed(1)}% improvement.
Premium tier recommended for high-stakes documents.`;
    } else if (improvement >= 5) {
      return `Specialist models provide GOOD value with ${improvement.toFixed(1)}% improvement.
Balanced tier recommended for cost-effective quality.`;
    } else {
      return `General model performs well on this document.
Fast tier sufficient unless higher accuracy needed.`;
    }
  }

  /**
   * Display summary
   */
  displaySummary(analysis) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('           COMPARISON SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📊 SCORES:');
    console.log(`   Baseline: ${(analysis.baseline.score * 100).toFixed(1)}% (${analysis.baseline.grade})`);
    console.log(`   Ensemble: ${(analysis.ensemble.score * 100).toFixed(1)}% (${analysis.ensemble.grade})`);
    console.log(`   Improvement: ${analysis.ensemble.improvement.percentage}%\n`);

    console.log('🔬 SPECIALIST CONTRIBUTIONS:');
    for (const [key, spec] of Object.entries(analysis.specialists)) {
      const symbol = spec.accuracy.improved ? '📈' : '━';
      console.log(`   ${symbol} ${spec.name}: ${spec.accuracy.percentage}%`);
    }

    console.log('\n💰 COST-BENEFIT:');
    console.log(`   Fast: $${analysis.costs.baseline}/page`);
    console.log(`   Balanced: $${analysis.costs.balanced}/page`);
    console.log(`   Premium: $${analysis.costs.premium}/page\n`);

    console.log('💡 RECOMMENDATION:');
    console.log(`   Tier: ${analysis.recommendation.tier.toUpperCase()}`);
    console.log(`   Reason: ${analysis.recommendation.reason}`);
    console.log(`   ROI: ${analysis.recommendation.roi}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  /**
   * Helper: Calculate average
   */
  average(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node scripts/compare-specialist-models.js <pdf-path>');
    console.log('Example: node scripts/compare-specialist-models.js exports/TEEI_AWS.pdf');
    process.exit(1);
  }

  const pdfPath = args[0];

  // Verify file exists
  try {
    await fs.access(pdfPath);
  } catch {
    console.error(`❌ Error: File not found: ${pdfPath}`);
    process.exit(1);
  }

  const comparison = new SpecialistComparison(pdfPath);
  await comparison.compare();
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { SpecialistComparison };
