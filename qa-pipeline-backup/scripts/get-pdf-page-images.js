#!/usr/bin/env node
/**
 * PDF Page Image Extraction
 *
 * Extracts pages from a PDF as PNG images for AI analysis.
 * Reuses existing pdf-to-img conversion logic with caching.
 *
 * @module scripts/get-pdf-page-images
 */

import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Get file hash for cache validation
 */
async function getFileHash(filePath) {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

/**
 * Check if cached PNGs are still valid
 */
async function areCachedImagesValid(pdfPath, tmpDir, pageCount) {
  try {
    const pdfHash = await getFileHash(pdfPath);
    const cacheMetaPath = path.join(tmpDir, 'cache-meta.json');

    // Check if metadata exists
    const metaExists = await fs.access(cacheMetaPath).then(() => true).catch(() => false);
    if (!metaExists) return false;

    const meta = JSON.parse(await fs.readFile(cacheMetaPath, 'utf-8'));

    // Validate hash and page count
    if (meta.pdfHash !== pdfHash || meta.pageCount !== pageCount) {
      return false;
    }

    // Check if all PNG files exist
    for (let i = 1; i <= pageCount; i++) {
      const pngPath = path.join(tmpDir, `page-${i}.png`);
      const exists = await fs.access(pngPath).then(() => true).catch(() => false);
      if (!exists) return false;
    }

    return true;

  } catch (error) {
    return false;
  }
}

/**
 * Extract pages from PDF as PNG images
 *
 * @param {string} pdfPath - Path to PDF file
 * @param {string} tmpDir - Optional temp directory (defaults to exports/gemini-cache)
 * @param {object} options - Conversion options
 * @returns {Promise<Array<{pageNumber: number, pngPath: string}>>}
 */
export async function getPdfPageImages(pdfPath, tmpDir = null, options = {}) {
  const {
    scale = 2.0, // 2x scale for good quality without huge files
    useCache = true
  } = options;

  // Resolve PDF path
  const absolutePdfPath = path.isAbsolute(pdfPath) ? pdfPath : path.resolve(projectRoot, pdfPath);

  // Ensure PDF exists
  try {
    await fs.access(absolutePdfPath);
  } catch (error) {
    throw new Error(`PDF not found: ${absolutePdfPath}`);
  }

  // Determine temp directory
  const cacheDir = tmpDir || path.join(projectRoot, 'exports', 'gemini-cache', path.basename(pdfPath, '.pdf'));
  await fs.mkdir(cacheDir, { recursive: true });

  console.log(`[PDF→PNG] Converting ${path.basename(pdfPath)} to images...`);
  console.log(`[PDF→PNG] Cache directory: ${cacheDir}`);

  // Convert PDF to images
  const document = await pdf(absolutePdfPath, { scale });
  const pages = [];
  let pageNumber = 1;

  // Check cache validity
  const pageCount = await getPageCount(absolutePdfPath);
  const cacheValid = useCache && await areCachedImagesValid(absolutePdfPath, cacheDir, pageCount);

  if (cacheValid) {
    console.log(`[PDF→PNG] Using cached images (${pageCount} pages)`);

    for (let i = 1; i <= pageCount; i++) {
      pages.push({
        pageNumber: i,
        pngPath: path.join(cacheDir, `page-${i}.png`)
      });
    }

    return pages;
  }

  // Generate new images
  console.log(`[PDF→PNG] Generating new images...`);

  for await (const image of document) {
    const pngPath = path.join(cacheDir, `page-${pageNumber}.png`);

    // Save PNG
    await fs.writeFile(pngPath, image);

    pages.push({
      pageNumber,
      pngPath
    });

    console.log(`[PDF→PNG] Page ${pageNumber}: ${pngPath}`);
    pageNumber++;
  }

  // Save cache metadata
  const pdfHash = await getFileHash(absolutePdfPath);
  const cacheMeta = {
    pdfPath: absolutePdfPath,
    pdfHash,
    pageCount: pages.length,
    generatedAt: new Date().toISOString(),
    scale
  };

  await fs.writeFile(
    path.join(cacheDir, 'cache-meta.json'),
    JSON.stringify(cacheMeta, null, 2)
  );

  console.log(`[PDF→PNG] Extracted ${pages.length} page(s)`);

  return pages;
}

/**
 * Get page count from PDF (helper function)
 */
async function getPageCount(pdfPath) {
  let count = 0;
  const document = await pdf(pdfPath, { scale: 1 });

  for await (const _ of document) {
    count++;
  }

  return count;
}

/**
 * CLI interface
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const pdfPath = process.argv[2];

  if (!pdfPath) {
    console.error('Usage: node get-pdf-page-images.js <pdf-path>');
    process.exit(1);
  }

  try {
    const pages = await getPdfPageImages(pdfPath);
    console.log(JSON.stringify(pages, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}
