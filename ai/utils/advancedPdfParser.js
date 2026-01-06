/**
 * Advanced PDF Parser - Real PDF Extraction Engine
 *
 * Replaces heuristics with ACTUAL PDF parsing using pdf.js and pdf-lib
 * Extracts text blocks with bounding boxes, colors, fonts, and page dimensions
 *
 * @module advancedPdfParser
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Configure pdf.js to use Node.js canvas
const NodeCanvasFactory = {
  create: function (width, height) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    return {
      canvas: canvas,
      context: context,
    };
  },
  reset: function (canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  },
  destroy: function (canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  },
};

/**
 * Convert RGB array [0-255] to hex color
 * @param {Array<number>} rgb - RGB array [r, g, b]
 * @returns {string} Hex color (e.g., "#FF0000")
 */
function rgbToHex(rgb) {
  if (!rgb || rgb.length < 3) return '#000000';
  const r = Math.round(rgb[0]);
  const g = Math.round(rgb[1]);
  const b = Math.round(rgb[2]);
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert CMYK array [0-1] to RGB hex
 * @param {Array<number>} cmyk - CMYK array [c, m, y, k]
 * @returns {string} Hex color
 */
function cmykToHex(cmyk) {
  if (!cmyk || cmyk.length < 4) return '#000000';
  const [c, m, y, k] = cmyk;

  // CMYK to RGB conversion
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return rgbToHex([r, g, b]);
}

/**
 * Normalize color to hex format
 * @param {Array<number>} color - Color array (RGB or CMYK)
 * @returns {string} Hex color
 */
function normalizeColor(color) {
  if (!color || !Array.isArray(color)) return '#000000';

  if (color.length === 3) {
    // RGB color [0-1] - convert to [0-255]
    return rgbToHex(color.map(c => c * 255));
  } else if (color.length === 4) {
    // CMYK color [0-1]
    return cmykToHex(color);
  }

  return '#000000';
}

/**
 * Extract text blocks with bounding boxes from PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Array<Object>>} Array of text blocks with metadata
 */
async function extractTextBlocksWithBounds(pdfPath) {
  logger.info(`Extracting text blocks from: ${path.basename(pdfPath)}`);

  try {
    // Validate PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));

    // Load PDF with pdf.js
    const standardFontsPath = path.join(
      path.dirname(require.resolve('pdfjs-dist/package.json')),
      'standard_fonts/'
    ).replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes

    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      standardFontDataUrl: standardFontsPath,
      useSystemFonts: false,
      disableFontFace: false,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    logger.debug(`PDF loaded successfully: ${numPages} pages`);

    const allTextBlocks = [];

    // Extract text from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });

      // Get text content with positions
      const textContent = await page.getTextContent();

      // Process each text item
      for (const item of textContent.items) {
        if (!item.str || item.str.trim() === '') continue;

        // Transform coordinates (PDF coordinates start at bottom-left)
        const transform = item.transform;
        const x = transform[4];
        const y = viewport.height - transform[5]; // Convert to top-left origin
        const width = item.width;
        const height = item.height;

        // Extract font information
        const fontName = item.fontName || 'Unknown';
        const fontSize = Math.abs(transform[0]); // Font size from transform matrix

        allTextBlocks.push({
          page: pageNum,
          text: item.str,
          bbox: {
            x: Math.round(x * 100) / 100,
            y: Math.round(y * 100) / 100,
            width: Math.round(width * 100) / 100,
            height: Math.round(height * 100) / 100
          },
          fontSize: Math.round(fontSize * 100) / 100,
          fontName: fontName,
          // Calculate center point for easier analysis
          center: {
            x: Math.round((x + width / 2) * 100) / 100,
            y: Math.round((y + height / 2) * 100) / 100
          }
        });
      }
    }

    logger.success(`Extracted ${allTextBlocks.length} text blocks from ${numPages} pages`);

    return allTextBlocks;

  } catch (error) {
    if (error.message && error.message.includes('Password')) {
      logger.error('PDF is password-protected. Cannot extract text.');
      throw new Error('PDF_LOCKED: Document requires password');
    } else if (error.message && error.message.includes('Invalid PDF')) {
      logger.error('PDF file is corrupted or invalid');
      throw new Error('PDF_CORRUPTED: Invalid PDF structure');
    } else {
      logger.error(`Failed to extract text blocks: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Extract actual colors used in PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Array<Object>>} Array of colors with usage information
 */
async function extractColorsFromPDF(pdfPath) {
  logger.info(`Extracting colors from: ${path.basename(pdfPath)}`);

  try {
    // Validate PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));

    // Use pdf-lib for color extraction
    const pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
    const numPages = pdfDoc.getPageCount();

    // Track colors and their usage
    const colorMap = new Map();

    const recordColor = (color, usage) => {
      const hex = normalizeColor(color);
      if (!colorMap.has(hex)) {
        colorMap.set(hex, { color: hex, usages: new Set(), count: 0 });
      }
      const entry = colorMap.get(hex);
      entry.usages.add(usage);
      entry.count++;
    };

    // Load PDF with pdf.js for detailed content extraction
    const standardFontsPath = path.join(
      path.dirname(require.resolve('pdfjs-dist/package.json')),
      'standard_fonts/'
    ).replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes

    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      standardFontDataUrl: standardFontsPath,
    });

    const pdfDocument = await loadingTask.promise;

    // Extract colors from each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);

      // Get operators (drawing operations)
      const operators = await page.getOperatorList();

      for (let i = 0; i < operators.fnArray.length; i++) {
        const fn = operators.fnArray[i];
        const args = operators.argsArray[i];

        // Color setting operators
        // RGB fill color
        if (fn === pdfjsLib.OPS.setFillRGBColor) {
          recordColor(args, 'fill');
        }
        // RGB stroke color
        else if (fn === pdfjsLib.OPS.setStrokeRGBColor) {
          recordColor(args, 'stroke');
        }
        // CMYK fill color
        else if (fn === pdfjsLib.OPS.setFillCMYKColor) {
          recordColor(args, 'fill');
        }
        // CMYK stroke color
        else if (fn === pdfjsLib.OPS.setStrokeCMYKColor) {
          recordColor(args, 'stroke');
        }
        // Gray fill color
        else if (fn === pdfjsLib.OPS.setFillGray) {
          const gray = args[0];
          recordColor([gray, gray, gray], 'fill');
        }
        // Gray stroke color
        else if (fn === pdfjsLib.OPS.setStrokeGray) {
          const gray = args[0];
          recordColor([gray, gray, gray], 'stroke');
        }
      }
    }

    // Convert to array and sort by usage count
    const colors = Array.from(colorMap.values()).map(entry => ({
      color: entry.color,
      usage: Array.from(entry.usages).join('|'), // e.g., "fill|stroke"
      count: entry.count
    })).sort((a, b) => b.count - a.count);

    logger.success(`Extracted ${colors.length} unique colors`);

    // Log top 10 colors
    if (colors.length > 0) {
      logger.debug('Top 10 colors:');
      colors.slice(0, 10).forEach((c, i) => {
        logger.debug(`  ${i + 1}. ${c.color} (${c.usage}, ${c.count}x)`);
      });
    }

    return colors;

  } catch (error) {
    if (error.message && error.message.includes('Password')) {
      logger.error('PDF is password-protected. Cannot extract colors.');
      throw new Error('PDF_LOCKED: Document requires password');
    } else if (error.message && error.message.includes('Invalid PDF')) {
      logger.error('PDF file is corrupted or invalid');
      throw new Error('PDF_CORRUPTED: Invalid PDF structure');
    } else {
      logger.error(`Failed to extract colors: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Extract fonts actually used in PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Array<Object>>} Array of fonts with usage information
 */
async function extractFontsFromPDF(pdfPath) {
  logger.info(`Extracting fonts from: ${path.basename(pdfPath)}`);

  try {
    // Validate PDF exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));

    const standardFontsPath = path.join(
      path.dirname(require.resolve('pdfjs-dist/package.json')),
      'standard_fonts/'
    ).replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes

    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      standardFontDataUrl: standardFontsPath,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    // Track fonts with size and usage count
    const fontMap = new Map();

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      for (const item of textContent.items) {
        if (!item.str || item.str.trim() === '') continue;

        const fontName = item.fontName || 'Unknown';
        const transform = item.transform;
        const fontSize = Math.round(Math.abs(transform[0]) * 100) / 100;

        // Clean up font name (remove subset prefix)
        let cleanFontName = fontName.replace(/^[A-Z]{6}\+/, '');

        // Try to extract font family (remove style suffixes)
        let fontFamily = cleanFontName;
        const styleSuffixes = ['-Bold', '-Italic', '-BoldItalic', '-Regular',
                               '-Medium', '-Light', '-SemiBold', '-Black',
                               'Bold', 'Italic', 'Regular', 'Medium', 'Light'];

        for (const suffix of styleSuffixes) {
          if (cleanFontName.endsWith(suffix)) {
            fontFamily = cleanFontName.slice(0, -suffix.length);
            break;
          }
        }

        const key = `${fontFamily}:${fontSize}`;

        if (!fontMap.has(key)) {
          fontMap.set(key, {
            family: fontFamily,
            originalName: cleanFontName,
            size: fontSize,
            usage_count: 0,
            pages: new Set()
          });
        }

        const entry = fontMap.get(key);
        entry.usage_count++;
        entry.pages.add(pageNum);
      }
    }

    // Convert to array and sort by usage
    const fonts = Array.from(fontMap.values())
      .map(entry => ({
        family: entry.family,
        originalName: entry.originalName,
        size: entry.size,
        usage_count: entry.usage_count,
        pages: Array.from(entry.pages).sort((a, b) => a - b)
      }))
      .sort((a, b) => b.usage_count - a.usage_count);

    logger.success(`Extracted ${fonts.length} font+size combinations`);

    // Log summary
    const uniqueFamilies = new Set(fonts.map(f => f.family));
    logger.info(`Found ${uniqueFamilies.size} unique font families`);

    // Log top 10 fonts
    if (fonts.length > 0) {
      logger.debug('Top 10 font usages:');
      fonts.slice(0, 10).forEach((f, i) => {
        logger.debug(`  ${i + 1}. ${f.family} ${f.size}pt (${f.usage_count}x on pages ${f.pages.join(', ')})`);
      });
    }

    return fonts;

  } catch (error) {
    if (error.message && error.message.includes('Password')) {
      logger.error('PDF is password-protected. Cannot extract fonts.');
      throw new Error('PDF_LOCKED: Document requires password');
    } else if (error.message && error.message.includes('Invalid PDF')) {
      logger.error('PDF file is corrupted or invalid');
      throw new Error('PDF_CORRUPTED: Invalid PDF structure');
    } else {
      logger.error(`Failed to extract fonts: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Extract precise page dimensions from PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} Page dimensions and metadata
 */
async function extractPageDimensions(pdfPath) {
  logger.info(`Extracting page dimensions from: ${path.basename(pdfPath)}`);

  try {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const pdfData = new Uint8Array(fs.readFileSync(pdfPath));
    const pdfDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true });

    const numPages = pdfDoc.getPageCount();
    const pages = [];

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();

      // Convert points to inches (72 points = 1 inch)
      const widthInches = Math.round((width / 72) * 100) / 100;
      const heightInches = Math.round((height / 72) * 100) / 100;

      pages.push({
        page: i + 1,
        width: Math.round(width * 100) / 100,
        height: Math.round(height * 100) / 100,
        widthInches,
        heightInches,
        aspectRatio: Math.round((width / height) * 100) / 100,
        // Detect common page sizes
        format: detectPageFormat(widthInches, heightInches)
      });
    }

    logger.success(`Extracted dimensions for ${numPages} pages`);

    return {
      pageCount: numPages,
      pages
    };

  } catch (error) {
    logger.error(`Failed to extract page dimensions: ${error.message}`);
    throw error;
  }
}

/**
 * Detect common page formats
 * @param {number} width - Width in inches
 * @param {number} height - Height in inches
 * @returns {string} Detected format
 */
function detectPageFormat(width, height) {
  const formats = [
    { name: 'Letter', w: 8.5, h: 11 },
    { name: 'Legal', w: 8.5, h: 14 },
    { name: 'Tabloid', w: 11, h: 17 },
    { name: 'A4', w: 8.27, h: 11.69 },
    { name: 'A3', w: 11.69, h: 16.54 },
    { name: 'A5', w: 5.83, h: 8.27 }
  ];

  const tolerance = 0.1; // 0.1 inch tolerance

  for (const format of formats) {
    // Check both portrait and landscape
    if ((Math.abs(width - format.w) < tolerance && Math.abs(height - format.h) < tolerance) ||
        (Math.abs(width - format.h) < tolerance && Math.abs(height - format.w) < tolerance)) {
      return format.name;
    }
  }

  return `Custom (${width}" × ${height}")`;
}

/**
 * Comprehensive PDF analysis - extracts all information
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} Complete PDF analysis
 */
async function analyzePDF(pdfPath) {
  logger.section('Advanced PDF Analysis');
  logger.info(`Analyzing: ${path.basename(pdfPath)}`);

  try {
    const startTime = Date.now();

    // Extract all information in parallel
    const [dimensions, textBlocks, colors, fonts] = await Promise.all([
      extractPageDimensions(pdfPath),
      extractTextBlocksWithBounds(pdfPath),
      extractColorsFromPDF(pdfPath),
      extractFontsFromPDF(pdfPath)
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Calculate summary statistics
    const summary = {
      file: path.basename(pdfPath),
      pageCount: dimensions.pageCount,
      totalTextBlocks: textBlocks.length,
      totalColors: colors.length,
      totalFontCombinations: fonts.length,
      uniqueFontFamilies: new Set(fonts.map(f => f.family)).size,
      analysisTime: `${duration}s`
    };

    logger.section('Analysis Summary');
    logger.info(`Pages: ${summary.pageCount}`);
    logger.info(`Text blocks: ${summary.totalTextBlocks}`);
    logger.info(`Colors: ${summary.totalColors}`);
    logger.info(`Font combinations: ${summary.totalFontCombinations}`);
    logger.info(`Unique font families: ${summary.uniqueFontFamilies}`);
    logger.success(`Analysis completed in ${summary.analysisTime}`);

    return {
      summary,
      dimensions,
      textBlocks,
      colors,
      fonts
    };

  } catch (error) {
    logger.error(`PDF analysis failed: ${error.message}`);
    throw error;
  }
}

export {
  extractTextBlocksWithBounds,
  extractColorsFromPDF,
  extractFontsFromPDF,
  extractPageDimensions,
  analyzePDF,
  // Helper functions
  rgbToHex,
  cmykToHex,
  normalizeColor,
  detectPageFormat
};
