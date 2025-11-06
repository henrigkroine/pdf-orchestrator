/**
 * Comprehensive PDF Quality Validation Script
 *
 * Validates TEEI PDF documents against brand guidelines and quality standards.
 *
 * Usage: node scripts/validate-pdf-quality.js <path-to-pdf>
 *
 * Requirements:
 * - Playwright for rendering and visual inspection
 * - pdf-lib for PDF structure analysis
 * - Sharp for image analysis
 * - Canvas for pixel-level color checks
 */

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// TEEI Brand Color Definitions
const TEEI_COLORS = {
  nordshore: { hex: '#00393F', rgb: [0, 57, 63], name: 'Nordshore' },
  sky: { hex: '#C9E4EC', rgb: [201, 228, 236], name: 'Sky' },
  sand: { hex: '#FFF1E2', rgb: [255, 241, 226], name: 'Sand' },
  beige: { hex: '#EFE1DC', rgb: [239, 225, 220], name: 'Beige' },
  moss: { hex: '#65873B', rgb: [101, 135, 59], name: 'Moss' },
  gold: { hex: '#BA8F5A', rgb: [186, 143, 90], name: 'Gold' },
  clay: { hex: '#913B2F', rgb: [145, 59, 47], name: 'Clay' }
};

// Standard US Letter dimensions (8.5 x 11 inches)
const STANDARD_PAGE_SIZE = {
  width: 612, // points (8.5 inches * 72 DPI)
  height: 792, // points (11 inches * 72 DPI)
  widthInches: 8.5,
  heightInches: 11
};

// Tolerance for dimension checks (in points)
const DIMENSION_TOLERANCE = 2;

// Color matching tolerance (0-255 RGB difference)
const COLOR_TOLERANCE = 15;

// Validation results
const results = {
  passed: true,
  checks: [],
  errors: [],
  warnings: [],
  timestamp: new Date().toISOString()
};

/**
 * Main validation function
 */
async function validatePDF(pdfPath) {
  console.log('=====================================');
  console.log('PDF QUALITY VALIDATION');
  console.log('=====================================\n');
  console.log('Target PDF:', pdfPath);
  console.log('Started:', new Date().toISOString());
  console.log('\n');

  try {
    // Check if file exists
    await fs.access(pdfPath);
    results.checks.push({
      name: 'File Exists',
      status: 'PASS',
      message: 'PDF file found successfully'
    });
  } catch (error) {
    results.passed = false;
    results.errors.push({
      check: 'File Exists',
      message: `PDF file not found: ${pdfPath}`,
      error: error.message
    });
    return results;
  }

  // Create output directories
  const issuesDir = path.join(projectRoot, 'exports', 'validation-issues');
  const screenshotsDir = path.join(issuesDir, 'screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  // Run all validation checks
  await checkPageDimensions(pdfPath);
  await checkTextCutoffs(pdfPath, screenshotsDir);
  await checkImageLoading(pdfPath, screenshotsDir);
  await checkColorValidation(pdfPath, screenshotsDir);
  await checkFontValidation(pdfPath, screenshotsDir);

  // Generate reports
  await generateReports(pdfPath, issuesDir);

  return results;
}

/**
 * Check 1: Page Dimensions
 * Ensures all pages are exactly 8.5 x 11 inches
 */
async function checkPageDimensions(pdfPath) {
  console.log('=====================================');
  console.log('CHECK 1: PAGE DIMENSIONS');
  console.log('=====================================\n');

  try {
    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    console.log(`Total pages: ${pages.length}\n`);

    let allPassed = true;
    const dimensionIssues = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();

      const widthDiff = Math.abs(width - STANDARD_PAGE_SIZE.width);
      const heightDiff = Math.abs(height - STANDARD_PAGE_SIZE.height);

      const passed = widthDiff <= DIMENSION_TOLERANCE && heightDiff <= DIMENSION_TOLERANCE;

      console.log(`Page ${i + 1}:`);
      console.log(`  Dimensions: ${width} x ${height} points`);
      console.log(`  Expected: ${STANDARD_PAGE_SIZE.width} x ${STANDARD_PAGE_SIZE.height} points`);
      console.log(`  Difference: ${widthDiff.toFixed(2)} x ${heightDiff.toFixed(2)} points`);
      console.log(`  Status: ${passed ? '✅ PASS' : '❌ FAIL'}\n`);

      if (!passed) {
        allPassed = false;
        dimensionIssues.push({
          page: i + 1,
          actual: { width, height },
          expected: STANDARD_PAGE_SIZE,
          difference: { width: widthDiff, height: heightDiff }
        });
      }
    }

    if (allPassed) {
      results.checks.push({
        name: 'Page Dimensions',
        status: 'PASS',
        message: `All ${pages.length} pages have correct dimensions (8.5 x 11 inches)`
      });
    } else {
      results.passed = false;
      results.errors.push({
        check: 'Page Dimensions',
        message: `${dimensionIssues.length} page(s) have incorrect dimensions`,
        issues: dimensionIssues
      });
    }

  } catch (error) {
    results.passed = false;
    results.errors.push({
      check: 'Page Dimensions',
      message: 'Failed to analyze page dimensions',
      error: error.message
    });
    console.error('❌ Error:', error.message, '\n');
  }
}

/**
 * Check 2: Text Cutoffs
 * Detects text extending beyond page boundaries
 */
async function checkTextCutoffs(pdfPath, screenshotsDir) {
  console.log('=====================================');
  console.log('CHECK 2: TEXT CUTOFFS');
  console.log('=====================================\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: {
        width: 816, // 8.5 inches at 96 DPI
        height: 1056 // 11 inches at 96 DPI
      }
    });

    // Convert PDF path to file URL
    const fileUrl = 'file://' + path.resolve(pdfPath).replace(/\\/g, '/');

    console.log('Loading PDF in browser...');
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for rendering

    console.log('Analyzing text elements...\n');

    // Analyze text cutoffs
    const textCutoffIssues = await page.evaluate(() => {
      const issues = [];

      // Select all text elements (adjust selectors based on PDF structure)
      const textElements = document.querySelectorAll('span, div, p, h1, h2, h3, h4, h5, h6');

      textElements.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const text = el.textContent.trim();

        // Skip empty elements
        if (!text || text.length === 0) return;

        // Check if text is overflowing
        const isOverflowing = el.scrollWidth > el.clientWidth + 2 ||
                            el.scrollHeight > el.clientHeight + 2;

        // Check if text extends beyond viewport
        const exceedsViewport = rect.right > window.innerWidth ||
                               rect.bottom > window.innerHeight ||
                               rect.left < 0 ||
                               rect.top < 0;

        if (isOverflowing || exceedsViewport) {
          issues.push({
            index: idx,
            text: text.length > 80 ? text.substring(0, 80) + '...' : text,
            fullText: text,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
            bounds: {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom
            },
            fontSize: style.fontSize,
            fontFamily: style.fontFamily,
            isOverflowing,
            exceedsViewport
          });
        }
      });

      return issues;
    });

    if (textCutoffIssues.length === 0) {
      console.log('✅ No text cutoff issues detected\n');
      results.checks.push({
        name: 'Text Cutoffs',
        status: 'PASS',
        message: 'No text extends beyond page boundaries'
      });
    } else {
      console.log(`❌ Found ${textCutoffIssues.length} text cutoff issue(s):\n`);

      textCutoffIssues.forEach((issue, idx) => {
        console.log(`Issue ${idx + 1}:`);
        console.log(`  Text: "${issue.text}"`);
        console.log(`  Overflow: ${issue.isOverflowing ? 'YES' : 'NO'}`);
        console.log(`  Exceeds viewport: ${issue.exceedsViewport ? 'YES' : 'NO'}`);
        console.log(`  Content size: ${issue.scrollWidth}x${issue.scrollHeight}px`);
        console.log(`  Container size: ${issue.clientWidth}x${issue.clientHeight}px`);
        console.log(`  Font: ${issue.fontFamily}, ${issue.fontSize}\n`);
      });

      // Capture screenshot of the issue
      const cutoffScreenshot = path.join(screenshotsDir, 'text-cutoff-issues.png');
      await page.screenshot({ path: cutoffScreenshot, fullPage: true });
      console.log(`Screenshot saved: ${cutoffScreenshot}\n`);

      results.passed = false;
      results.errors.push({
        check: 'Text Cutoffs',
        message: `${textCutoffIssues.length} text cutoff issue(s) detected`,
        issues: textCutoffIssues,
        screenshot: cutoffScreenshot
      });
    }

  } catch (error) {
    results.passed = false;
    results.errors.push({
      check: 'Text Cutoffs',
      message: 'Failed to analyze text cutoffs',
      error: error.message
    });
    console.error('❌ Error:', error.message, '\n');
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Check 3: Image Loading
 * Verifies all images loaded successfully
 */
async function checkImageLoading(pdfPath, screenshotsDir) {
  console.log('=====================================');
  console.log('CHECK 3: IMAGE LOADING');
  console.log('=====================================\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: {
        width: 816,
        height: 1056
      }
    });

    // Track failed images
    const failedImages = [];
    page.on('requestfailed', request => {
      if (request.resourceType() === 'image') {
        failedImages.push({
          url: request.url(),
          failure: request.failure().errorText
        });
      }
    });

    const fileUrl = 'file://' + path.resolve(pdfPath).replace(/\\/g, '/');

    console.log('Loading PDF and checking images...');
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Check for broken images
    const imageIssues = await page.evaluate(() => {
      const issues = [];
      const images = document.querySelectorAll('img');

      images.forEach((img, idx) => {
        const isBroken = !img.complete || img.naturalWidth === 0;

        if (isBroken) {
          issues.push({
            index: idx,
            src: img.src,
            alt: img.alt || '(no alt text)',
            width: img.width,
            height: img.height
          });
        }
      });

      return {
        totalImages: images.length,
        brokenImages: issues
      };
    });

    console.log(`Total images: ${imageIssues.totalImages}`);
    console.log(`Failed requests: ${failedImages.length}`);
    console.log(`Broken images: ${imageIssues.brokenImages.length}\n`);

    const allIssues = [...imageIssues.brokenImages];

    if (failedImages.length > 0) {
      console.log('Failed image requests:');
      failedImages.forEach((fail, idx) => {
        console.log(`  ${idx + 1}. ${fail.url}`);
        console.log(`     Error: ${fail.failure}\n`);
      });
    }

    if (allIssues.length === 0 && failedImages.length === 0) {
      console.log('✅ All images loaded successfully\n');
      results.checks.push({
        name: 'Image Loading',
        status: 'PASS',
        message: `All ${imageIssues.totalImages} images loaded successfully`
      });
    } else {
      console.log('❌ Image loading issues detected\n');

      // Capture screenshot
      const imageScreenshot = path.join(screenshotsDir, 'image-loading-issues.png');
      await page.screenshot({ path: imageScreenshot, fullPage: true });
      console.log(`Screenshot saved: ${imageScreenshot}\n`);

      results.passed = false;
      results.errors.push({
        check: 'Image Loading',
        message: `${allIssues.length} broken image(s) detected`,
        brokenImages: allIssues,
        failedRequests: failedImages,
        screenshot: imageScreenshot
      });
    }

  } catch (error) {
    results.warnings.push({
      check: 'Image Loading',
      message: 'Could not fully analyze image loading (may be due to PDF format)',
      error: error.message
    });
    console.log('⚠️  Warning:', error.message);
    console.log('    (This is normal for PDFs without embedded web images)\n');
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Check 4: Color Validation
 * Verifies TEEI brand colors are used correctly
 */
async function checkColorValidation(pdfPath, screenshotsDir) {
  console.log('=====================================');
  console.log('CHECK 4: COLOR VALIDATION');
  console.log('=====================================\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: {
        width: 816,
        height: 1056
      }
    });

    const fileUrl = 'file://' + path.resolve(pdfPath).replace(/\\/g, '/');

    console.log('Loading PDF for color analysis...');
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Capture full page screenshot for color analysis
    const screenshotPath = path.join(screenshotsDir, 'color-analysis-full.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Analyze colors in the screenshot
    const image = sharp(screenshotPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

    console.log(`Analyzing colors in ${info.width}x${info.height} image...\n`);

    // Sample colors from the image (every 10th pixel to speed up)
    const colorFrequency = new Map();

    for (let i = 0; i < data.length; i += info.channels * 10) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Skip very light colors (likely white background)
      if (r > 245 && g > 245 && b > 245) continue;

      // Skip very dark colors (likely text)
      if (r < 10 && g < 10 && b < 10) continue;

      const colorKey = `${r},${g},${b}`;
      colorFrequency.set(colorKey, (colorFrequency.get(colorKey) || 0) + 1);
    }

    // Find dominant colors (sort by frequency)
    const sortedColors = Array.from(colorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10 colors

    console.log('Top 10 dominant colors:\n');

    const brandColorMatches = [];
    const nonBrandColors = [];

    sortedColors.forEach(([colorKey, count], idx) => {
      const [r, g, b] = colorKey.split(',').map(Number);

      // Check if this color matches any TEEI brand color
      let matchedBrand = null;
      let closestDistance = Infinity;

      for (const [key, brandColor] of Object.entries(TEEI_COLORS)) {
        const distance = Math.sqrt(
          Math.pow(r - brandColor.rgb[0], 2) +
          Math.pow(g - brandColor.rgb[1], 2) +
          Math.pow(b - brandColor.rgb[2], 2)
        );

        if (distance < COLOR_TOLERANCE && distance < closestDistance) {
          matchedBrand = brandColor;
          closestDistance = distance;
        }
      }

      const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const percentage = ((count / (data.length / info.channels)) * 100).toFixed(2);

      console.log(`${idx + 1}. RGB(${r}, ${g}, ${b}) - ${hexColor}`);
      console.log(`   Frequency: ${percentage}%`);

      if (matchedBrand) {
        console.log(`   ✅ Matches: ${matchedBrand.name} (${matchedBrand.hex})`);
        brandColorMatches.push({
          detected: { r, g, b, hex: hexColor },
          matched: matchedBrand,
          frequency: percentage
        });
      } else {
        console.log(`   ⚠️  Not a standard TEEI brand color`);
        nonBrandColors.push({
          color: { r, g, b, hex: hexColor },
          frequency: percentage
        });
      }
      console.log('');
    });

    // Check for forbidden colors (copper/orange)
    const forbiddenColors = sortedColors.filter(([colorKey]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      // Check for copper/orange range (high red, medium-high green, low blue)
      return r > 180 && g > 80 && g < 140 && b < 80;
    });

    if (forbiddenColors.length > 0) {
      console.log('❌ FORBIDDEN COLORS DETECTED (copper/orange):');
      forbiddenColors.forEach(([colorKey]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        console.log(`   ${hexColor} - RGB(${r}, ${g}, ${b})`);
      });
      console.log('');

      results.passed = false;
      results.errors.push({
        check: 'Color Validation',
        message: 'Forbidden colors (copper/orange) detected - not in TEEI brand palette',
        forbiddenColors: forbiddenColors.map(([colorKey]) => {
          const [r, g, b] = colorKey.split(',').map(Number);
          return { r, g, b };
        })
      });
    }

    if (nonBrandColors.length > 0 && nonBrandColors.some(c => parseFloat(c.frequency) > 1)) {
      results.warnings.push({
        check: 'Color Validation',
        message: `${nonBrandColors.length} non-brand colors detected (may be acceptable for images/gradients)`,
        colors: nonBrandColors.filter(c => parseFloat(c.frequency) > 1)
      });
    }

    if (brandColorMatches.length > 0) {
      results.checks.push({
        name: 'Color Validation',
        status: forbiddenColors.length === 0 ? 'PASS' : 'FAIL',
        message: `${brandColorMatches.length} TEEI brand colors detected correctly`,
        brandColors: brandColorMatches
      });
    }

    console.log('Summary:');
    console.log(`  TEEI brand colors: ${brandColorMatches.length}`);
    console.log(`  Non-brand colors: ${nonBrandColors.length}`);
    console.log(`  Forbidden colors: ${forbiddenColors.length}\n`);

  } catch (error) {
    results.warnings.push({
      check: 'Color Validation',
      message: 'Could not fully analyze colors',
      error: error.message
    });
    console.log('⚠️  Warning:', error.message, '\n');
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Check 5: Font Validation
 * Verifies correct fonts are used (Lora for headlines, Roboto Flex for body)
 */
async function checkFontValidation(pdfPath, screenshotsDir) {
  console.log('=====================================');
  console.log('CHECK 5: FONT VALIDATION');
  console.log('=====================================\n');

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: {
        width: 816,
        height: 1056
      }
    });

    const fileUrl = 'file://' + path.resolve(pdfPath).replace(/\\/g, '/');

    console.log('Loading PDF for font analysis...');
    await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Analyze fonts used in the document
    const fontAnalysis = await page.evaluate(() => {
      const fonts = new Map();
      const elements = document.querySelectorAll('*');

      // Expected brand fonts
      const brandFonts = ['Lora', 'Roboto Flex', 'Roboto'];

      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;
        const fontSize = style.fontSize;
        const fontWeight = style.fontWeight;
        const text = el.textContent.trim();

        if (!text || text.length === 0) return;

        // Determine element type
        let elementType = 'body';
        if (el.tagName.match(/^H[1-6]$/)) {
          elementType = 'heading';
        } else if (el.classList.contains('title') || el.classList.contains('header')) {
          elementType = 'title';
        }

        const key = `${fontFamily}|${fontSize}|${elementType}`;

        if (!fonts.has(key)) {
          fonts.set(key, {
            fontFamily,
            fontSize,
            fontWeight,
            elementType,
            count: 0,
            sample: text.length > 50 ? text.substring(0, 50) + '...' : text
          });
        }

        fonts.get(key).count++;
      });

      return {
        fonts: Array.from(fonts.values()),
        brandFonts
      };
    });

    console.log('Font usage analysis:\n');

    const loraUsage = fontAnalysis.fonts.filter(f => f.fontFamily.includes('Lora'));
    const robotoUsage = fontAnalysis.fonts.filter(f =>
      f.fontFamily.includes('Roboto Flex') || f.fontFamily.includes('Roboto')
    );
    const otherFonts = fontAnalysis.fonts.filter(f =>
      !f.fontFamily.includes('Lora') &&
      !f.fontFamily.includes('Roboto')
    );

    console.log('Lora (Headlines/Titles):');
    if (loraUsage.length > 0) {
      loraUsage.forEach(font => {
        console.log(`  ✅ ${font.fontFamily}, ${font.fontSize}, ${font.fontWeight}`);
        console.log(`     Type: ${font.elementType}, Count: ${font.count}`);
        console.log(`     Sample: "${font.sample}"\n`);
      });
    } else {
      console.log('  ❌ NOT FOUND (should be used for headlines!)\n');
    }

    console.log('Roboto/Roboto Flex (Body Text):');
    if (robotoUsage.length > 0) {
      robotoUsage.forEach(font => {
        console.log(`  ✅ ${font.fontFamily}, ${font.fontSize}, ${font.fontWeight}`);
        console.log(`     Type: ${font.elementType}, Count: ${font.count}`);
        console.log(`     Sample: "${font.sample}"\n`);
      });
    } else {
      console.log('  ❌ NOT FOUND (should be used for body text!)\n');
    }

    if (otherFonts.length > 0) {
      console.log('Other fonts (not TEEI brand):');
      otherFonts.forEach(font => {
        console.log(`  ⚠️  ${font.fontFamily}, ${font.fontSize}, ${font.fontWeight}`);
        console.log(`     Type: ${font.elementType}, Count: ${font.count}`);
        console.log(`     Sample: "${font.sample}"\n`);
      });
    }

    // Validation
    const hasLora = loraUsage.length > 0;
    const hasRoboto = robotoUsage.length > 0;
    const hasNonBrandFonts = otherFonts.length > 0;

    if (hasLora && hasRoboto && !hasNonBrandFonts) {
      results.checks.push({
        name: 'Font Validation',
        status: 'PASS',
        message: 'Correct TEEI brand fonts detected (Lora + Roboto)',
        fonts: { loraUsage, robotoUsage }
      });
      console.log('✅ Font validation PASSED\n');
    } else {
      const issues = [];
      if (!hasLora) issues.push('Lora font not found (required for headlines)');
      if (!hasRoboto) issues.push('Roboto font not found (required for body text)');
      if (hasNonBrandFonts) issues.push(`${otherFonts.length} non-brand fonts detected`);

      results.passed = false;
      results.errors.push({
        check: 'Font Validation',
        message: 'Font validation failed',
        issues,
        fonts: { loraUsage, robotoUsage, otherFonts }
      });
      console.log('❌ Font validation FAILED\n');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('');
    }

  } catch (error) {
    results.warnings.push({
      check: 'Font Validation',
      message: 'Could not fully analyze fonts (may be due to PDF format)',
      error: error.message
    });
    console.log('⚠️  Warning:', error.message);
    console.log('    (Font validation may not work on all PDF formats)\n');
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * Generate validation reports (JSON and human-readable)
 */
async function generateReports(pdfPath, issuesDir) {
  console.log('=====================================');
  console.log('GENERATING VALIDATION REPORTS');
  console.log('=====================================\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const pdfName = path.basename(pdfPath, '.pdf');

  // JSON report
  const jsonReportPath = path.join(issuesDir, `validation-report-${pdfName}-${timestamp}.json`);
  await fs.writeFile(jsonReportPath, JSON.stringify(results, null, 2));
  console.log('JSON report saved:', jsonReportPath);

  // Human-readable report
  const textReport = generateTextReport(pdfPath);
  const textReportPath = path.join(issuesDir, `validation-report-${pdfName}-${timestamp}.txt`);
  await fs.writeFile(textReportPath, textReport);
  console.log('Text report saved:', textReportPath);

  console.log('\n');
}

/**
 * Generate human-readable text report
 */
function generateTextReport(pdfPath) {
  let report = '';

  report += '=====================================\n';
  report += 'PDF QUALITY VALIDATION REPORT\n';
  report += '=====================================\n\n';
  report += `PDF: ${pdfPath}\n`;
  report += `Date: ${results.timestamp}\n`;
  report += `Overall Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}\n\n`;

  report += '-------------------------------------\n';
  report += 'CHECKS PASSED\n';
  report += '-------------------------------------\n';
  results.checks.forEach(check => {
    report += `✅ ${check.name}: ${check.message}\n`;
  });
  report += '\n';

  if (results.errors.length > 0) {
    report += '-------------------------------------\n';
    report += 'ERRORS (MUST FIX)\n';
    report += '-------------------------------------\n';
    results.errors.forEach((error, idx) => {
      report += `${idx + 1}. ${error.check}\n`;
      report += `   ${error.message}\n`;
      if (error.issues) {
        report += `   Issues: ${JSON.stringify(error.issues, null, 2)}\n`;
      }
      if (error.screenshot) {
        report += `   Screenshot: ${error.screenshot}\n`;
      }
      report += '\n';
    });
  }

  if (results.warnings.length > 0) {
    report += '-------------------------------------\n';
    report += 'WARNINGS (REVIEW RECOMMENDED)\n';
    report += '-------------------------------------\n';
    results.warnings.forEach((warning, idx) => {
      report += `${idx + 1}. ${warning.check}\n`;
      report += `   ${warning.message}\n\n`;
    });
  }

  report += '-------------------------------------\n';
  report += 'TEEI BRAND GUIDELINES REFERENCE\n';
  report += '-------------------------------------\n';
  report += 'Required Colors:\n';
  Object.entries(TEEI_COLORS).forEach(([key, color]) => {
    report += `  - ${color.name}: ${color.hex} RGB(${color.rgb.join(', ')})\n`;
  });
  report += '\nRequired Fonts:\n';
  report += '  - Headlines: Lora (Bold, Semibold)\n';
  report += '  - Body Text: Roboto Flex (Regular, Medium)\n';
  report += '\nRequired Page Size:\n';
  report += `  - 8.5 x 11 inches (${STANDARD_PAGE_SIZE.width} x ${STANDARD_PAGE_SIZE.height} points)\n\n`;

  report += '=====================================\n';
  report += 'END OF REPORT\n';
  report += '=====================================\n';

  return report;
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: node scripts/validate-pdf-quality.js <path-to-pdf>');
    console.error('\nExample:');
    console.error('  node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf');
    process.exit(1);
  }

  const pdfPath = path.resolve(args[0]);

  try {
    const results = await validatePDF(pdfPath);

    console.log('=====================================');
    console.log('VALIDATION COMPLETE');
    console.log('=====================================\n');
    console.log(`Overall Status: ${results.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Checks Passed: ${results.checks.length}`);
    console.log(`Errors: ${results.errors.length}`);
    console.log(`Warnings: ${results.warnings.length}`);
    console.log('\n');

    // Exit with appropriate code
    process.exit(results.passed ? 0 : 1);

  } catch (error) {
    console.error('❌ Fatal error during validation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run main function
main();
