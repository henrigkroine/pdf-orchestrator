#!/usr/bin/env node
/**
 * Visual PDF Comparison
 *
 * Compares a new PDF against reference screenshots to detect visual differences.
 * Uses pixel-perfect comparison with intelligent thresholds for anti-aliasing.
 *
 * Usage:
 *   node scripts/compare-pdf-visual.mjs <test-pdf> <reference-name>
 *
 * Example:
 *   node scripts/compare-pdf-visual.mjs exports/ukraine-new.pdf ukraine-final
 */

import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { createCanvas, loadImage } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  scale: 3.0, // Match reference scale

  // Comparison thresholds
  thresholds: {
    antiAliasing: 0.05, // 5% - ignore minor anti-aliasing differences
    minorChange: 0.10,  // 10% - flag as minor layout changes
    majorChange: 0.20,  // 20% - flag as major issues
    critical: 0.30,     // 30% - critical differences
  },

  // Pixelmatch options
  pixelmatch: {
    threshold: 0.1,     // Matching threshold (0-1, lower = more sensitive)
    includeAA: false,   // Don't count anti-aliasing differences
    alpha: 0.1,         // Alpha channel importance
    diffColor: [255, 0, 0], // Red for differences
  }
};

/**
 * Load reference metadata
 */
async function loadReferenceMetadata(referenceName) {
  const metadataPath = path.join(projectRoot, 'references', referenceName, 'metadata.json');

  try {
    const data = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Reference not found: ${referenceName}\nRun create-reference-screenshots.js first.`);
  }
}

/**
 * Load PNG image as buffer
 */
async function loadPNG(imagePath) {
  const buffer = await fs.readFile(imagePath);
  return PNG.sync.read(buffer);
}

/**
 * Compare two images using pixelmatch
 */
async function compareImages(referencePath, testBuffer, outputPath) {
  // Load reference image
  const referenceImg = await loadPNG(referencePath);

  // Parse test image
  const testImg = PNG.sync.read(testBuffer);

  // Ensure dimensions match
  if (referenceImg.width !== testImg.width || referenceImg.height !== testImg.height) {
    console.log(`   ℹ️  Resizing test image to match reference (${referenceImg.width}x${referenceImg.height})`);

    // Resize test image to match reference
    const resized = await sharp(testBuffer)
      .resize(referenceImg.width, referenceImg.height, { fit: 'fill' })
      .png()
      .toBuffer();

    const resizedImg = PNG.sync.read(resized);
    testImg.data = resizedImg.data;
    testImg.width = resizedImg.width;
    testImg.height = resizedImg.height;
  }

  // Create diff image
  const diffImg = new PNG({
    width: referenceImg.width,
    height: referenceImg.height
  });

  // Run pixelmatch comparison
  const numDiffPixels = pixelmatch(
    referenceImg.data,
    testImg.data,
    diffImg.data,
    referenceImg.width,
    referenceImg.height,
    CONFIG.pixelmatch
  );

  // Save diff image
  const diffBuffer = PNG.sync.write(diffImg);
  await fs.writeFile(outputPath, diffBuffer);

  // Calculate difference percentage
  const totalPixels = referenceImg.width * referenceImg.height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;

  return {
    totalPixels,
    diffPixels: numDiffPixels,
    diffPercentage,
    width: referenceImg.width,
    height: referenceImg.height,
  };
}

/**
 * Create visual overlay with highlighted differences
 */
async function createOverlayImage(referencePath, testBuffer, diffBuffer, outputPath) {
  try {
    // Load images
    const referenceImg = await loadImage(referencePath);
    const testImg = await loadImage(testBuffer);
    const diffImg = await loadImage(diffBuffer);

    const width = referenceImg.width;
    const height = referenceImg.height;

    // Create side-by-side comparison with diff overlay
    const canvas = createCanvas(width * 3 + 40, height + 60);
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw reference (left)
    ctx.drawImage(referenceImg, 0, 50, width, height);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('REFERENCE', 10, 35);

    // Draw test (middle)
    ctx.drawImage(testImg, width + 20, 50, width, height);
    ctx.fillStyle = '#000000';
    ctx.fillText('TEST', width + 30, 35);

    // Draw diff (right) with red overlay
    ctx.drawImage(testImg, width * 2 + 40, 50, width, height);
    ctx.globalAlpha = 0.5;
    ctx.drawImage(diffImg, width * 2 + 40, 50, width, height);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#FF0000';
    ctx.fillText('DIFFERENCES', width * 2 + 50, 35);

    // Save
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);

    return true;
  } catch (error) {
    console.log(`   ⚠️  Could not create overlay image: ${error.message}`);
    return false;
  }
}

/**
 * Detect text cutoffs in test image
 */
async function detectTextCutoffs(imageBuffer) {
  const image = sharp(imageBuffer);
  const { width, height } = await image.metadata();

  const edgeSize = 0.05;
  const topEdge = Math.round(height * edgeSize);
  const bottomStart = Math.round(height * (1 - edgeSize));
  const leftEdge = Math.round(width * edgeSize);
  const rightStart = Math.round(width * (1 - edgeSize));

  const edges = {
    top: await analyzeRegion(image, 0, 0, width, topEdge),
    bottom: await analyzeRegion(image, 0, bottomStart, width, height - bottomStart),
    left: await analyzeRegion(image, 0, 0, leftEdge, height),
    right: await analyzeRegion(image, rightStart, 0, width - rightStart, height),
  };

  return edges;
}

/**
 * Analyze region for content
 */
async function analyzeRegion(image, left, top, width, height) {
  try {
    const region = await image
      .extract({ left, top, width, height })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = region;
    let nonWhitePixels = 0;
    const threshold = 240;

    for (let i = 0; i < data.length; i++) {
      if (data[i] < threshold) {
        nonWhitePixels++;
      }
    }

    const totalPixels = info.width * info.height;
    const contentDensity = (nonWhitePixels / totalPixels) * 100;

    return {
      hasContent: contentDensity > 5,
      contentDensity: contentDensity.toFixed(2),
    };
  } catch (error) {
    return {
      hasContent: false,
      contentDensity: 0,
      error: error.message,
    };
  }
}

/**
 * Classify difference severity
 */
function classifyDifference(diffPercentage) {
  const { antiAliasing, minorChange, majorChange, critical } = CONFIG.thresholds;

  if (diffPercentage < antiAliasing) {
    return { level: 'pass', label: '✅ PASS', color: '#00FF00' };
  } else if (diffPercentage < minorChange) {
    return { level: 'minor', label: '⚠️  MINOR', color: '#FFAA00' };
  } else if (diffPercentage < majorChange) {
    return { level: 'warning', label: '⚠️  WARNING', color: '#FF9900' };
  } else if (diffPercentage < critical) {
    return { level: 'major', label: '❌ MAJOR', color: '#FF0000' };
  } else {
    return { level: 'critical', label: '🚨 CRITICAL', color: '#AA0000' };
  }
}

/**
 * Compare test PDF against reference
 */
async function comparePDFVisual(testPdfPath, referenceName) {
  console.log('🔍 Visual PDF Comparison\n');
  console.log(`Test PDF: ${testPdfPath}`);
  console.log(`Reference: ${referenceName}\n`);

  // Load reference metadata
  console.log('📋 Loading reference metadata...');
  const referenceMetadata = await loadReferenceMetadata(referenceName);
  console.log(`   ✅ Reference has ${referenceMetadata.pageCount} page(s)\n`);

  // Create comparison output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const comparisonDir = path.join(projectRoot, 'comparisons', `${referenceName}-${timestamp}`);
  await fs.mkdir(comparisonDir, { recursive: true });

  // Resolve test PDF path
  const absoluteTestPath = path.isAbsolute(testPdfPath)
    ? testPdfPath
    : path.resolve(projectRoot, testPdfPath);

  try {
    await fs.access(absoluteTestPath);
  } catch (error) {
    throw new Error(`Test PDF not found: ${absoluteTestPath}`);
  }

  console.log('📄 Converting test PDF to images...');
  console.log(`   Scale: ${CONFIG.scale}x\n`);

  const comparisonResults = {
    testPDF: absoluteTestPath,
    reference: referenceName,
    timestamp: new Date().toISOString(),
    pages: [],
    summary: {
      passed: 0,
      minor: 0,
      warnings: 0,
      major: 0,
      critical: 0,
      totalDiffPercentage: 0,
    }
  };

  try {
    const document = await pdf(absoluteTestPath, { scale: CONFIG.scale });

    let pageNum = 0;
    for await (const image of document) {
      pageNum++;

      // Stop if we've exceeded reference page count
      if (pageNum > referenceMetadata.pageCount) {
        console.log(`\n⚠️  Test PDF has more pages than reference (${pageNum} > ${referenceMetadata.pageCount})`);
        console.log(`   Stopping comparison at page ${referenceMetadata.pageCount}`);
        break;
      }

      console.log(`\n🔍 Comparing Page ${pageNum}/${referenceMetadata.pageCount}...`);

      // Get reference screenshot path
      const referencePath = path.join(
        projectRoot,
        'references',
        referenceName,
        `page-${pageNum}.png`
      );

      // Compare images
      const diffPath = path.join(comparisonDir, `page-${pageNum}-diff.png`);
      const comparison = await compareImages(referencePath, image, diffPath);

      console.log(`   📊 Difference: ${comparison.diffPercentage.toFixed(2)}%`);
      console.log(`   📊 Different pixels: ${comparison.diffPixels.toLocaleString()} / ${comparison.totalPixels.toLocaleString()}`);

      // Classify difference
      const classification = classifyDifference(comparison.diffPercentage);
      console.log(`   ${classification.label}`);

      // Detect text cutoffs
      console.log('   🔍 Analyzing edges for text cutoffs...');
      const edges = await detectTextCutoffs(image);

      const analysis = {
        textCutoffs: [],
        layoutChanges: [],
      };

      // Compare edge content with reference
      const refPage = referenceMetadata.pages.find(p => p.page === pageNum);
      if (refPage && refPage.edgeAnalysis) {
        const edgeIssues = [];

        if (edges.top.hasContent && !refPage.edgeAnalysis.top.hasContent) {
          edgeIssues.push(`top (${edges.top.contentDensity}% content, reference had none)`);
          analysis.textCutoffs.push({
            edge: 'top',
            contentDensity: edges.top.contentDensity,
            issue: 'New content at top edge (possible text cutoff)',
          });
        }

        if (edges.bottom.hasContent && !refPage.edgeAnalysis.bottom.hasContent) {
          edgeIssues.push(`bottom (${edges.bottom.contentDensity}% content, reference had none)`);
          analysis.textCutoffs.push({
            edge: 'bottom',
            contentDensity: edges.bottom.contentDensity,
            issue: 'New content at bottom edge (possible text cutoff)',
          });
        }

        if (edges.left.hasContent && !refPage.edgeAnalysis.left.hasContent) {
          edgeIssues.push(`left (${edges.left.contentDensity}% content, reference had none)`);
          analysis.textCutoffs.push({
            edge: 'left',
            contentDensity: edges.left.contentDensity,
            issue: 'New content at left edge (possible text cutoff)',
          });
        }

        if (edges.right.hasContent && !refPage.edgeAnalysis.right.hasContent) {
          edgeIssues.push(`right (${edges.right.contentDensity}% content, reference had none)`);
          analysis.textCutoffs.push({
            edge: 'right',
            contentDensity: edges.right.contentDensity,
            issue: 'New content at right edge (possible text cutoff)',
          });
        }

        if (edgeIssues.length > 0) {
          console.log(`   ⚠️  New edge content detected: ${edgeIssues.join(', ')}`);
        } else {
          console.log(`   ✅ No new edge content detected`);
        }
      }

      // Save test screenshot
      const testScreenshotPath = path.join(comparisonDir, `page-${pageNum}-test.png`);
      await fs.writeFile(testScreenshotPath, image);

      // Create overlay comparison image
      const overlayPath = path.join(comparisonDir, `page-${pageNum}-comparison.png`);
      await createOverlayImage(referencePath, image, diffPath, overlayPath);
      console.log(`   ✅ Comparison saved: ${overlayPath}`);

      // Record results
      const pageResult = {
        page: pageNum,
        diffPercentage: comparison.diffPercentage,
        diffPixels: comparison.diffPixels,
        totalPixels: comparison.totalPixels,
        classification: classification.level,
        analysis,
        screenshots: {
          test: `page-${pageNum}-test.png`,
          diff: `page-${pageNum}-diff.png`,
          comparison: `page-${pageNum}-comparison.png`,
        }
      };

      comparisonResults.pages.push(pageResult);
      comparisonResults.summary[classification.level === 'pass' ? 'passed' : classification.level]++;
      comparisonResults.summary.totalDiffPercentage += comparison.diffPercentage;

      // Report specific issues
      if (analysis.textCutoffs.length > 0) {
        console.log(`   ⚠️  Potential text cutoffs: ${analysis.textCutoffs.length}`);
        analysis.textCutoffs.forEach(cutoff => {
          console.log(`      - ${cutoff.edge}: ${cutoff.issue}`);
        });
      }
    }

    comparisonResults.testPageCount = pageNum;
    comparisonResults.referencePageCount = referenceMetadata.pageCount;

    // Check for missing pages
    if (pageNum < referenceMetadata.pageCount) {
      console.log(`\n⚠️  Test PDF has fewer pages than reference (${pageNum} < ${referenceMetadata.pageCount})`);
      comparisonResults.summary.major += (referenceMetadata.pageCount - pageNum);
    }

    // Calculate average difference
    if (pageNum > 0) {
      comparisonResults.summary.averageDiffPercentage =
        comparisonResults.summary.totalDiffPercentage / pageNum;
    } else {
      comparisonResults.summary.averageDiffPercentage = 0;
    }

    // Save results
    const resultsPath = path.join(comparisonDir, 'comparison-report.json');
    await fs.writeFile(resultsPath, JSON.stringify(comparisonResults, null, 2));

    // Generate summary report
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPARISON SUMMARY');
    console.log('='.repeat(60) + '\n');

    console.log(`Test PDF: ${path.basename(absoluteTestPath)}`);
    console.log(`Reference: ${referenceName}`);
    console.log(`Pages Compared: ${pageNum}\n`);

    console.log('Results:');
    console.log(`  ✅ Passed:   ${comparisonResults.summary.passed} pages`);
    console.log(`  ⚠️  Minor:    ${comparisonResults.summary.minor} pages`);
    console.log(`  ⚠️  Warnings: ${comparisonResults.summary.warnings} pages`);
    console.log(`  ❌ Major:    ${comparisonResults.summary.major} pages`);
    console.log(`  🚨 Critical: ${comparisonResults.summary.critical} pages\n`);

    console.log(`Average Difference: ${comparisonResults.summary.averageDiffPercentage.toFixed(2)}%\n`);

    // Overall verdict
    let overallVerdict;
    if (comparisonResults.summary.critical > 0) {
      overallVerdict = '🚨 CRITICAL ISSUES - Major visual differences detected';
    } else if (comparisonResults.summary.major > 0) {
      overallVerdict = '❌ FAILED - Significant visual differences detected';
    } else if (comparisonResults.summary.warnings > 0) {
      overallVerdict = '⚠️  WARNING - Minor visual differences detected';
    } else if (comparisonResults.summary.minor > 0) {
      overallVerdict = '⚠️  MINOR - Small differences (likely anti-aliasing)';
    } else {
      overallVerdict = '✅ PASSED - All pages match reference';
    }

    console.log('Overall Verdict:');
    console.log(`  ${overallVerdict}\n`);

    // List problem pages
    const problemPages = comparisonResults.pages.filter(
      p => !['pass', 'minor'].includes(p.classification)
    );

    if (problemPages.length > 0) {
      console.log('⚠️  Pages with Issues:\n');
      problemPages.forEach(p => {
        const classification = classifyDifference(p.diffPercentage);
        console.log(`  Page ${p.page}: ${classification.label} (${p.diffPercentage.toFixed(2)}%)`);

        if (p.analysis.textCutoffs.length > 0) {
          console.log(`    - ${p.analysis.textCutoffs.length} potential text cutoff(s)`);
          p.analysis.textCutoffs.forEach(cutoff => {
            console.log(`      • ${cutoff.edge} edge: ${cutoff.contentDensity}% content`);
          });
        }
      });
      console.log('');
    }

    console.log('📂 Output Directory:');
    console.log(`   ${comparisonDir}\n`);
    console.log('📄 Detailed Report:');
    console.log(`   ${resultsPath}\n`);

    return comparisonResults;

  } catch (error) {
    throw new Error(`Failed to process test PDF: ${error.message}`);
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ Error: Missing arguments\n');
    console.log('Usage:');
    console.log('  node scripts/compare-pdf-visual.mjs <test-pdf> <reference-name>\n');
    console.log('Example:');
    console.log('  node scripts/compare-pdf-visual.mjs exports/ukraine-new.pdf ukraine-final\n');
    console.log('Note: Reference must be created first with create-reference-screenshots.js\n');
    process.exit(1);
  }

  const testPdfPath = args[0];
  const referenceName = args[1];

  try {
    const results = await comparePDFVisual(testPdfPath, referenceName);

    // Exit code based on results
    if (results.summary.critical > 0 || results.summary.major > 0) {
      process.exit(1); // Fail CI/CD
    } else if (results.summary.warnings > 0) {
      process.exit(0); // Pass with warnings
    } else {
      process.exit(0); // Success
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
