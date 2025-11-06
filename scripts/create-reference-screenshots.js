#!/usr/bin/env node
/**
 * Create Reference Screenshots
 *
 * Takes a "known good" PDF as reference and creates high-resolution screenshots
 * of each page for visual comparison testing.
 *
 * Usage:
 *   node scripts/create-reference-screenshots.js <pdf-path> [document-name]
 *
 * Example:
 *   node scripts/create-reference-screenshots.js exports/ukraine-final.pdf ukraine-final
 */

import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  scale: 3.0, // 3x scale for high resolution (300 DPI equivalent)
  quality: 100,
};

/**
 * Extract metadata from a page screenshot
 */
async function extractMetadata(imageBuffer, pageNumber) {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const stats = await image.stats();

  // Dominant colors (from channel means)
  const dominantColors = stats.channels.map((channel, idx) => ({
    channel: ['R', 'G', 'B', 'Alpha'][idx],
    mean: Math.round(channel.mean),
    stdev: Math.round(channel.stdev),
    min: channel.min,
    max: channel.max,
  }));

  return {
    page: pageNumber,
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    space: metadata.space,
    channels: metadata.channels,
    depth: metadata.depth,
    density: metadata.density,
    hasAlpha: metadata.hasAlpha,
    dominantColors,
    fileSize: imageBuffer.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Detect potential text cutoffs from image analysis
 */
async function detectTextCutoffs(imageBuffer) {
  const image = sharp(imageBuffer);
  const { width, height } = await image.metadata();

  // Extract edge regions (top, bottom, left, right - 5% of dimension)
  const edgeSize = 0.05;
  const topEdge = Math.round(height * edgeSize);
  const bottomStart = Math.round(height * (1 - edgeSize));
  const leftEdge = Math.round(width * edgeSize);
  const rightStart = Math.round(width * (1 - edgeSize));

  // Analyze edges for text-like patterns (high contrast, non-white)
  const edges = {
    top: await analyzeRegion(image, 0, 0, width, topEdge),
    bottom: await analyzeRegion(image, 0, bottomStart, width, height - bottomStart),
    left: await analyzeRegion(image, 0, 0, leftEdge, height),
    right: await analyzeRegion(image, rightStart, 0, width - rightStart, height),
  };

  return edges;
}

/**
 * Analyze a region for text-like content
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
    const threshold = 240; // Consider pixels darker than this as potential text

    for (let i = 0; i < data.length; i++) {
      if (data[i] < threshold) {
        nonWhitePixels++;
      }
    }

    const totalPixels = info.width * info.height;
    const contentDensity = (nonWhitePixels / totalPixels) * 100;

    return {
      hasContent: contentDensity > 5, // More than 5% non-white pixels
      contentDensity: contentDensity.toFixed(2),
      totalPixels,
      nonWhitePixels,
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
 * Create reference screenshots from PDF
 */
async function createReferenceScreenshots(pdfPath, documentName) {
  console.log('📸 Creating Reference Screenshots\n');
  console.log(`PDF: ${pdfPath}`);
  console.log(`Document Name: ${documentName}\n`);

  // Create references directory
  const referencesDir = path.join(projectRoot, 'references', documentName);
  await fs.mkdir(referencesDir, { recursive: true });

  // Resolve PDF path
  const absolutePdfPath = path.isAbsolute(pdfPath)
    ? pdfPath
    : path.resolve(projectRoot, pdfPath);

  // Check if PDF exists
  try {
    await fs.access(absolutePdfPath);
  } catch (error) {
    throw new Error(`PDF not found: ${absolutePdfPath}`);
  }

  console.log('📄 Converting PDF to images...');
  console.log(`   Scale: ${CONFIG.scale}x (high resolution)\n`);

  const metadata = {
    documentName,
    sourcePDF: absolutePdfPath,
    scale: CONFIG.scale,
    createdAt: new Date().toISOString(),
    pages: [],
  };

  try {
    const document = await pdf(absolutePdfPath, { scale: CONFIG.scale });

    let pageNum = 0;
    for await (const image of document) {
      pageNum++;
      console.log(`📸 Page ${pageNum}...`);

      // Save screenshot
      const screenshotPath = path.join(referencesDir, `page-${pageNum}.png`);
      await fs.writeFile(screenshotPath, image);
      console.log(`   ✅ Screenshot saved: ${screenshotPath}`);

      // Extract metadata
      console.log('   🔍 Extracting metadata...');
      const imageMetadata = await extractMetadata(image, pageNum);

      // Detect text cutoffs
      console.log('   🔍 Analyzing edges for text cutoffs...');
      const edges = await detectTextCutoffs(image);

      const pageMetadata = {
        ...imageMetadata,
        edgeAnalysis: edges,
        screenshotPath: `page-${pageNum}.png`,
      };

      metadata.pages.push(pageMetadata);

      // Report potential issues
      const problematicEdges = [];
      if (edges.top.hasContent) problematicEdges.push('top');
      if (edges.bottom.hasContent) problematicEdges.push('bottom');
      if (edges.left.hasContent) problematicEdges.push('left');
      if (edges.right.hasContent) problematicEdges.push('right');

      if (problematicEdges.length > 0) {
        console.log(`   ⚠️  Content detected at edges: ${problematicEdges.join(', ')}`);
        console.log(`      (May indicate text cutoffs or thin margins)`);
      } else {
        console.log(`   ✅ No edge content detected (good margins)`);
      }

      console.log(`   ✅ Page ${pageNum} complete\n`);
    }

    metadata.pageCount = pageNum;

    // Save metadata
    const metadataPath = path.join(referencesDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📋 Metadata saved: ${metadataPath}\n`);

    // Create summary
    console.log('✅ Reference Screenshots Created Successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Document: ${documentName}`);
    console.log(`   Pages: ${pageNum}`);
    console.log(`   Scale: ${CONFIG.scale}x`);
    console.log(`   Output: ${referencesDir}`);
    console.log(`   Screenshots: ${metadata.pages.length}`);
    console.log(`   Metadata: ${metadataPath}\n`);

    // Display page details
    metadata.pages.forEach(pg => {
      console.log(`   Page ${pg.page}:`);
      console.log(`     Resolution: ${pg.width}x${pg.height}px`);
      console.log(`     Size: ${(pg.fileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`     Dominant Color (R/G/B): ${pg.dominantColors.slice(0, 3).map(c => c.mean).join('/')}`);

      // Report edge analysis
      const edges = [];
      if (pg.edgeAnalysis.top.hasContent) edges.push(`top (${pg.edgeAnalysis.top.contentDensity}%)`);
      if (pg.edgeAnalysis.bottom.hasContent) edges.push(`bottom (${pg.edgeAnalysis.bottom.contentDensity}%)`);
      if (pg.edgeAnalysis.left.hasContent) edges.push(`left (${pg.edgeAnalysis.left.contentDensity}%)`);
      if (pg.edgeAnalysis.right.hasContent) edges.push(`right (${pg.edgeAnalysis.right.contentDensity}%)`);

      if (edges.length > 0) {
        console.log(`     ⚠️  Edge Content: ${edges.join(', ')}`);
      }
    });

    console.log('\n🎯 Next Step:');
    console.log(`   Run visual comparison against this reference:`);
    console.log(`   node scripts/compare-pdf-visual.js <test-pdf> ${documentName}\n`);

    return metadata;

  } catch (error) {
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: Missing PDF path\n');
    console.log('Usage:');
    console.log('  node scripts/create-reference-screenshots.js <pdf-path> [document-name]\n');
    console.log('Example:');
    console.log('  node scripts/create-reference-screenshots.js exports/ukraine-final.pdf ukraine-final\n');
    process.exit(1);
  }

  const pdfPath = args[0];
  const documentName = args[1] || path.basename(pdfPath, path.extname(pdfPath));

  try {
    await createReferenceScreenshots(pdfPath, documentName);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack && process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
