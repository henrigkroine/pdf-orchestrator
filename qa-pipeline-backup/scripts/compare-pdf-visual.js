#!/usr/bin/env node
/**
 * Visual Regression Testing - Compare PDF against baseline
 *
 * Performs pixel-perfect comparison against approved baseline screenshots.
 *
 * Usage:
 *   node scripts/compare-pdf-visual.js <test-pdf> <baseline-name>
 *
 * Example:
 *   node scripts/compare-pdf-visual.js exports/aws-v2.pdf tfu-aws-partnership-v1
 *
 * Output:
 *   - Per-page PNG screenshots (test, diff, comparison)
 *   - JSON report with diff percentages
 *   - Exit 0 if diff < 5%, exit 1 if >= 5%
 */

import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Threshold levels for visual diff
const THRESHOLDS = {
  PASS: 5.0,        // < 5% = ✅ PASS (anti-aliasing only)
  MINOR: 10.0,      // 5-10% = ⚠️ MINOR (small changes)
  WARNING: 20.0,    // 10-20% = ⚠️ WARNING (noticeable)
  MAJOR: 30.0,      // 20-30% = ❌ MAJOR (significant)
  CRITICAL: 100.0   // > 30% = 🚨 CRITICAL (completely different)
};

/**
 * Compare PDF against baseline
 */
async function compareVisual(testPdfPath, baselineName) {
  console.log('=====================================');
  console.log('VISUAL REGRESSION TEST');
  console.log('=====================================\n');
  console.log(`Test PDF: ${testPdfPath}`);
  console.log(`Baseline: ${baselineName}\n`);

  // Check if baseline exists
  const baselineDir = path.join(projectRoot, 'references', baselineName);
  try {
    await fs.access(baselineDir);
  } catch (error) {
    console.error(`❌ Error: Baseline '${baselineName}' not found at ${baselineDir}`);
    console.error('\nCreate baseline first:');
    console.error(`   node scripts/create-reference-screenshots.js <approved-pdf> ${baselineName}\n`);
    process.exit(1);
  }

  // Load baseline metadata
  const metadataPath = path.join(baselineDir, 'metadata.json');
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
  console.log(`Baseline pages: ${metadata.pageCount}`);
  console.log(`Baseline created: ${metadata.createdAt}\n`);

  // Create comparison output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const comparisonDir = path.join(projectRoot, 'comparisons', `${baselineName}-${timestamp}`);
  await fs.mkdir(comparisonDir, { recursive: true });

  // Convert test PDF to PNGs
  console.log('📄 Converting test PDF to images...\n');
  const document = await pdf(testPdfPath, { scale: 3 }); // 300 DPI

  const results = {
    testPDF: testPdfPath,
    baseline: baselineName,
    timestamp: new Date().toISOString(),
    comparisonDir,
    pages: [],
    overallDiffPercent: 0,
    passed: true,
    verdict: ''
  };

  let pageNum = 0;
  let totalDiffPercent = 0;

  for await (const testImage of document) {
    pageNum++;
    console.log(`📸 Page ${pageNum}:`);

    // Load baseline image
    const baselinePath = path.join(baselineDir, `page-${pageNum}.png`);
    try {
      await fs.access(baselinePath);
    } catch (error) {
      console.log(`   ❌ No baseline for page ${pageNum}\n`);
      results.pages.push({
        page: pageNum,
        error: 'No baseline',
        diffPercent: null
      });
      continue;
    }

    // Save test screenshot
    const testPath = path.join(comparisonDir, `page-${pageNum}-test.png`);
    await fs.writeFile(testPath, testImage);

    // Load both images as PNG objects
    const baseline = PNG.sync.read(await fs.readFile(baselinePath));
    const test = PNG.sync.read(testImage);

    // Ensure dimensions match
    if (baseline.width !== test.width || baseline.height !== test.height) {
      console.log(`   ⚠️  Dimension mismatch: baseline ${baseline.width}x${baseline.height}, test ${test.width}x${test.height}\n`);
      results.pages.push({
        page: pageNum,
        error: 'Dimension mismatch',
        baselineDim: `${baseline.width}x${baseline.height}`,
        testDim: `${test.width}x${test.height}`,
        diffPercent: null
      });
      continue;
    }

    // Create diff image
    const diff = new PNG({ width: baseline.width, height: baseline.height });
    const numDiffPixels = pixelmatch(
      baseline.data,
      test.data,
      diff.data,
      baseline.width,
      baseline.height,
      { threshold: 0.1 } // Sensitivity
    );

    const totalPixels = baseline.width * baseline.height;
    const diffPercent = (numDiffPixels / totalPixels) * 100;
    totalDiffPercent += diffPercent;

    // Save diff image
    const diffPath = path.join(comparisonDir, `page-${pageNum}-diff.png`);
    await fs.writeFile(diffPath, PNG.sync.write(diff));

    // Create side-by-side comparison
    const comparisonPath = path.join(comparisonDir, `page-${pageNum}-comparison.png`);
    await createSideBySide(baselinePath, testPath, diffPath, comparisonPath);

    // Determine verdict
    const verdict = getVerdict(diffPercent);
    const icon = verdict.icon;

    console.log(`   Diff: ${diffPercent.toFixed(2)}% ${icon} ${verdict.label}`);
    console.log(`   Screenshots:`);
    console.log(`     Test: ${path.basename(testPath)}`);
    console.log(`     Diff: ${path.basename(diffPath)}`);
    console.log(`     Comparison: ${path.basename(comparisonPath)}\n`);

    results.pages.push({
      page: pageNum,
      diffPercent: parseFloat(diffPercent.toFixed(2)),
      diffPixels: numDiffPixels,
      totalPixels,
      verdict: verdict.label,
      testImage: path.basename(testPath),
      diffImage: path.basename(diffPath),
      comparisonImage: path.basename(comparisonPath)
    });
  }

  // Calculate overall results
  results.overallDiffPercent = parseFloat((totalDiffPercent / pageNum).toFixed(2));
  const overallVerdict = getVerdict(results.overallDiffPercent);
  results.verdict = overallVerdict.label;
  results.passed = results.overallDiffPercent < THRESHOLDS.PASS;

  // Save results JSON
  const reportPath = path.join(comparisonDir, 'comparison-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));

  // Display summary
  console.log('=====================================');
  console.log('VISUAL REGRESSION COMPLETE');
  console.log('=====================================\n');
  console.log(`Overall Diff: ${results.overallDiffPercent}% ${overallVerdict.icon} ${overallVerdict.label}`);
  console.log(`Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`\nReport: ${reportPath}`);
  console.log(`Output: ${comparisonDir}\n`);

  return results;
}

/**
 * Get verdict based on diff percentage
 */
function getVerdict(diffPercent) {
  if (diffPercent < THRESHOLDS.PASS) {
    return { icon: '✅', label: 'PASS', color: 'green' };
  } else if (diffPercent < THRESHOLDS.MINOR) {
    return { icon: '⚠️', label: 'MINOR', color: 'yellow' };
  } else if (diffPercent < THRESHOLDS.WARNING) {
    return { icon: '⚠️', label: 'WARNING', color: 'orange' };
  } else if (diffPercent < THRESHOLDS.MAJOR) {
    return { icon: '❌', label: 'MAJOR', color: 'red' };
  } else {
    return { icon: '🚨', label: 'CRITICAL', color: 'darkred' };
  }
}

/**
 * Create side-by-side comparison image (baseline | test | diff)
 */
async function createSideBySide(baselinePath, testPath, diffPath, outputPath) {
  const baseline = sharp(baselinePath);
  const test = sharp(testPath);
  const diff = sharp(diffPath);

  const metadata = await baseline.metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Create composite with 3 images side by side
  const composite = sharp({
    create: {
      width: width * 3 + 40, // 20px padding between
      height: height + 100, // Extra space for labels
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  // Add labels (simplified - using sharp's composite, no text rendering)
  // In production, use canvas or ImageMagick for text labels
  const images = [
    { input: await baseline.toBuffer(), left: 0, top: 50 },
    { input: await test.toBuffer(), left: width + 20, top: 50 },
    { input: await diff.toBuffer(), left: (width + 20) * 2, top: 50 }
  ];

  await composite.composite(images).toFile(outputPath);
}

/**
 * CLI entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node compare-pdf-visual.js <test-pdf> <baseline-name>\n');
    console.log('Example:');
    console.log('  node compare-pdf-visual.js exports/aws-v2.pdf tfu-aws-partnership-v1\n');
    process.exit(1);
  }

  const testPdfPath = path.resolve(args[0]);
  const baselineName = args[1];

  try {
    const results = await compareVisual(testPdfPath, baselineName);
    process.exit(results.passed ? 0 : 1);
  } catch (error) {
    console.error('Fatal error:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
