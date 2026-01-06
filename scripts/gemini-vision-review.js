#!/usr/bin/env node
/**
 * Gemini Vision Review CLI
 *
 * Command-line interface for AI-powered design critique using Gemini Vision.
 * Can be called from pipeline.py or run standalone.
 *
 * Exit codes:
 *   0 - Review successful and meets quality threshold
 *   1 - Review successful but below threshold or requires changes
 *   3 - Infrastructure/configuration error
 *
 * Usage:
 *   node scripts/gemini-vision-review.js \
 *     --pdf exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf \
 *     --job-config example-jobs/tfu-aws-partnership-v2.json \
 *     --output reports/gemini/tfu-aws-v2-gemini-review.json \
 *     --min-score 0.92
 */

import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPdfPageImages } from './get-pdf-page-images.js';
import { reviewDocumentWithGemini } from '../ai/geminiVisionReview.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Load job configuration
 */
async function loadJobConfig(configPath) {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`[GEMINI] Error loading job config: ${error.message}`);
    return {};
  }
}

/**
 * Main CLI function
 */
async function main() {
  const program = new Command();

  program
    .name('gemini-vision-review')
    .description('AI-powered design critique using Gemini Vision')
    .requiredOption('--pdf <path>', 'Path to PDF file to review')
    .requiredOption('--job-config <path>', 'Path to job configuration JSON')
    .requiredOption('--output <path>', 'Path to save review results JSON')
    .option('--min-score <number>', 'Minimum acceptable overall score (0-1)', parseFloat, 0.90)
    .parse(process.argv);

  const options = program.opts();

  console.log('============================================================');
  console.log('GEMINI VISION DESIGN REVIEW');
  console.log('============================================================');
  console.log();
  console.log(`[GEMINI] PDF: ${options.pdf}`);
  console.log(`[GEMINI] Job Config: ${options.jobConfig}`);
  console.log(`[GEMINI] Output: ${options.output}`);
  console.log(`[GEMINI] Min Score: ${options.minScore}`);
  console.log();

  try {
    // Load job configuration
    const jobConfig = await loadJobConfig(options.jobConfig);

    // Extract page images
    console.log('[GEMINI] Step 1: Extracting PDF pages...');
    const pageImages = await getPdfPageImages(options.pdf);

    if (pageImages.length === 0) {
      throw new Error('No pages extracted from PDF');
    }

    console.log(`[GEMINI] Extracted ${pageImages.length} page(s)`);
    console.log();

    // Call Gemini Vision API
    console.log('[GEMINI] Step 2: Analyzing with Gemini Vision...');
    const review = await reviewDocumentWithGemini(pageImages, jobConfig);

    // Add metadata
    const finalReport = {
      ...review,
      metadata: {
        pdf_path: options.pdf,
        job_config: options.jobConfig,
        generated_at: new Date().toISOString(),
        min_score_threshold: options.minScore
      }
    };

    // Save output
    console.log();
    console.log('[GEMINI] Step 3: Saving results...');
    const outputDir = path.dirname(options.output);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(options.output, JSON.stringify(finalReport, null, 2));
    console.log(`[GEMINI] Saved: ${options.output}`);
    console.log();

    // Print summary
    console.log('============================================================');
    console.log('GEMINI REVIEW SUMMARY');
    console.log('============================================================');
    console.log();
    console.log(`Model: ${review.model}`);
    console.log(`Overall Score: ${review.overall_score.toFixed(2)} / 1.00`);
    console.log(`Threshold: ${options.minScore.toFixed(2)}`);
    console.log(`Requires Changes: ${review.requires_changes ? 'YES' : 'NO'}`);
    console.log();

    // Page scores
    console.log('Page Scores:');
    review.page_scores.forEach(page => {
      const issueCount = page.issues?.length || 0;
      const criticalCount = page.issues?.filter(i => i.severity === 'critical').length || 0;
      const majorCount = page.issues?.filter(i => i.severity === 'major').length || 0;

      console.log(`  Page ${page.page} (${page.role}): ${page.score.toFixed(2)} - ${issueCount} issues (${criticalCount} critical, ${majorCount} major)`);
    });
    console.log();

    // Summary
    console.log('Summary:');
    console.log(review.summary);
    console.log();

    // Check pass/fail conditions
    const hasCriticalIssues = review.page_scores.some(p =>
      p.issues?.some(i => i.severity === 'critical')
    );

    const meetsThreshold = review.overall_score >= options.minScore;
    const passesQA = meetsThreshold && !review.requires_changes && !hasCriticalIssues;

    if (passesQA) {
      console.log('Result: ✅ PASS');
      console.log(`Score ${review.overall_score.toFixed(2)} >= ${options.minScore.toFixed(2)}, no critical issues`);
      console.log();
      console.log('============================================================');
      process.exit(0);
    } else {
      console.log('Result: ❌ FAIL');

      const reasons = [];
      if (!meetsThreshold) {
        reasons.push(`Score ${review.overall_score.toFixed(2)} < ${options.minScore.toFixed(2)}`);
      }
      if (review.requires_changes) {
        reasons.push('Requires changes');
      }
      if (hasCriticalIssues) {
        reasons.push('Has critical issues');
      }

      console.log(`Reason: ${reasons.join(', ')}`);
      console.log();
      console.log('Top Issues:');
      const allIssues = review.page_scores.flatMap(p => p.issues || []);
      const topIssues = allIssues
        .filter(i => i.severity === 'critical' || i.severity === 'major')
        .slice(0, 5);

      topIssues.forEach((issue, idx) => {
        console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.area}: ${issue.description}`);
      });

      if (topIssues.length === 0) {
        console.log('  (No major issues found, but score below threshold)');
      }

      console.log();
      console.log('See full report:', options.output);
      console.log();
      console.log('============================================================');
      process.exit(1);
    }

  } catch (error) {
    console.error();
    console.error('============================================================');
    console.error('GEMINI REVIEW ERROR');
    console.error('============================================================');
    console.error();
    console.error(`Error: ${error.message}`);
    console.error();

    if (error.message.includes('GEMINI_API_KEY')) {
      console.error('Configuration Issue:');
      console.error('- Set GEMINI_API_KEY environment variable with your API key');
      console.error('- OR set DRY_RUN_GEMINI_VISION=1 for testing without API access');
      console.error();
      console.error('Example:');
      console.error('  export GEMINI_API_KEY=your-api-key-here');
      console.error('  # OR for dry-run testing:');
      console.error('  export DRY_RUN_GEMINI_VISION=1');
    }

    console.error();
    console.error('============================================================');
    process.exit(3); // Infrastructure error
  }
}

main();
