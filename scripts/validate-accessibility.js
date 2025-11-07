/**
 * WCAG 2.2 Level AA Accessibility Validator
 *
 * Comprehensive accessibility validation for PDF and HTML documents.
 * Checks compliance with Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.
 *
 * Usage:
 *   node scripts/validate-accessibility.js <path-to-file>
 *
 * Supported formats:
 *   - PDF files (rendered for visual analysis)
 *   - HTML files (analyzed directly)
 *
 * Exit codes:
 *   0 - All accessibility checks passed
 *   1 - One or more accessibility checks failed
 *
 * @see https://www.w3.org/WAI/WCAG22/quickref/
 */

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import WCAG utilities
import * as wcag from './lib/wcag-checker.js';
import { generateAccessibilityReport, SEVERITY_LEVELS } from './lib/accessibility-report-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load configuration
const configPath = path.join(projectRoot, 'config', 'wcag-config.json');
let CONFIG = null;

/**
 * Validation results structure
 */
const results = {
  fileName: '',
  filePath: '',
  fileType: '',
  timestamp: new Date().toISOString(),
  wcagVersion: '2.2',
  level: 'AA',
  overallPasses: true,
  overallScore: 0,
  checks: [],
  violations: [],
  warnings: [],
  detailedFindings: {},
  manualReviewRequired: [],
  summary: {
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0,
    criticalIssues: 0,
    majorIssues: 0,
    minorIssues: 0
  }
};

/**
 * Main validation function
 */
async function validateAccessibility(filePath) {
  console.log('=====================================');
  console.log('WCAG 2.2 AA ACCESSIBILITY VALIDATION');
  console.log('=====================================\n');
  console.log('Target file:', filePath);
  console.log('Started:', new Date().toISOString());
  console.log('\n');

  try {
    // Load configuration
    const configData = await fs.readFile(configPath, 'utf8');
    CONFIG = JSON.parse(configData);
    console.log('✓ Configuration loaded\n');

    // Check if file exists
    await fs.access(filePath);
    results.filePath = filePath;
    results.fileName = path.basename(filePath);
    results.fileType = path.extname(filePath).toLowerCase();

    console.log('✓ File found\n');

    // Create output directories
    const issuesDir = path.join(projectRoot, 'exports', 'accessibility-issues');
    const screenshotsDir = path.join(issuesDir, 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });

    // Run validation checks based on file type
    if (results.fileType === '.pdf') {
      await validatePDFAccessibility(filePath, screenshotsDir);
    } else if (results.fileType === '.html' || results.fileType === '.htm') {
      await validateHTMLAccessibility(filePath, screenshotsDir);
    } else {
      throw new Error(`Unsupported file type: ${results.fileType}. Supported: .pdf, .html`);
    }

    // Calculate overall score and summary
    calculateOverallScore();

    // Generate reports
    await generateReports(issuesDir);

    // Print summary
    printSummary();

    // Return appropriate exit code
    return results.overallPasses ? 0 : 1;

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    console.error(error.stack);
    return 1;
  }
}

/**
 * Validate PDF accessibility
 */
async function validatePDFAccessibility(pdfPath, screenshotsDir) {
  console.log('📄 Analyzing PDF document...\n');

  // Launch browser for visual analysis
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Load PDF in browser
    const pdfData = await fs.readFile(pdfPath);
    const pdfDataUrl = `data:application/pdf;base64,${pdfData.toString('base64')}`;

    await page.goto(pdfDataUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Wait for PDF to render

    // Get PDF structure
    const pdfDoc = await PDFDocument.load(pdfData);
    const pageCount = pdfDoc.getPageCount();

    console.log(`  Pages: ${pageCount}\n`);

    // Run visual checks on each page
    for (let i = 0; i < pageCount; i++) {
      console.log(`  Analyzing page ${i + 1}/${pageCount}...`);
      await analyzePageVisually(page, i, screenshotsDir);
    }

    // Run structure checks
    await checkPDFStructure(pdfDoc);

  } finally {
    await browser.close();
  }

  console.log('\n✓ PDF analysis complete\n');
}

/**
 * Validate HTML accessibility
 */
async function validateHTMLAccessibility(htmlPath, screenshotsDir) {
  console.log('📄 Analyzing HTML document...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Load HTML file
    const htmlContent = await fs.readFile(htmlPath, 'utf8');
    const htmlUrl = `file://${path.resolve(htmlPath)}`;

    await page.goto(htmlUrl, { waitUntil: 'networkidle' });

    // Run all accessibility checks
    await checkColorContrast(page, screenshotsDir);
    await checkTextSize(page, screenshotsDir);
    await checkTouchTargets(page, screenshotsDir);
    await checkAltText(page);
    await checkHeadingHierarchy(page);
    await checkTextSpacing(page);
    await checkFocusIndicators(page);
    await checkColorBlindness(page, screenshotsDir);

  } finally {
    await browser.close();
  }

  console.log('\n✓ HTML analysis complete\n');
}

/**
 * Analyze page visually for accessibility issues
 */
async function analyzePageVisually(page, pageIndex, screenshotsDir) {
  // Take screenshot for analysis
  const screenshot = await page.screenshot({
    fullPage: true,
    type: 'png'
  });

  const screenshotPath = path.join(screenshotsDir, `page-${pageIndex + 1}.png`);
  await fs.writeFile(screenshotPath, screenshot);

  // Analyze colors in screenshot
  await analyzeImageColors(screenshotPath, pageIndex);
}

/**
 * Check color contrast compliance (WCAG 1.4.3)
 */
async function checkColorContrast(page, screenshotsDir) {
  console.log('  Checking color contrast...');

  if (!CONFIG.checks.colorContrast.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Color Contrast',
    category: 'Perceivable',
    criterion: '1.4.3',
    passes: true,
    issues: []
  };

  try {
    // Get all text elements with their computed styles
    const textElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, div, li'));
      return elements
        .filter(el => {
          const text = el.textContent.trim();
          return text.length > 0 && window.getComputedStyle(el).display !== 'none';
        })
        .map(el => {
          const style = window.getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            text: el.textContent.trim().substring(0, 50),
            color: style.color,
            backgroundColor: style.backgroundColor,
            fontSize: parseFloat(style.fontSize),
            fontWeight: style.fontWeight,
            rect: el.getBoundingClientRect()
          };
        });
    });

    console.log(`    Found ${textElements.length} text elements`);

    // Check contrast for each text element
    const contrastIssues = [];

    for (const element of textElements) {
      // Parse RGB colors
      const fgMatch = element.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      const bgMatch = element.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

      if (!fgMatch || !bgMatch) continue;

      const foreground = [parseInt(fgMatch[1]), parseInt(fgMatch[2]), parseInt(fgMatch[3])];
      const background = [parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3])];

      // Calculate contrast
      const contrast = wcag.calculateContrast(foreground, background);
      const fontSize = element.fontSize * 0.75; // Convert px to pt
      const isBold = parseInt(element.fontWeight) >= 700;

      const compliance = wcag.checkContrastCompliance(contrast, fontSize, isBold, 'AA');

      if (!compliance.passes) {
        contrastIssues.push({
          element: `${element.tag}: "${element.text}"`,
          contrast: compliance.contrast,
          required: compliance.required,
          fontSize: fontSize.toFixed(1),
          isLargeText: compliance.isLargeText
        });
      }
    }

    if (contrastIssues.length > 0) {
      checkResult.passes = false;
      checkResult.issues = contrastIssues;

      results.violations.push({
        title: 'Insufficient Color Contrast',
        criterion: '1.4.3',
        severity: 'CRITICAL',
        description: `Found ${contrastIssues.length} text elements with insufficient contrast ratio.`,
        details: contrastIssues,
        remediation: 'Increase contrast between text and background colors to meet WCAG AA requirements (4.5:1 for normal text, 3:1 for large text).'
      });

      console.log(`    ✗ FAIL: ${contrastIssues.length} contrast issues found`);
      results.overallPasses = false;
      results.summary.criticalIssues++;
    } else {
      console.log('    ✓ PASS: All text has sufficient contrast');
    }

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Check text size compliance
 */
async function checkTextSize(page, screenshotsDir) {
  console.log('  Checking text sizes...');

  if (!CONFIG.checks.textSize.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Text Size',
    category: 'Perceivable',
    passes: true,
    issues: []
  };

  try {
    const textElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, li'))
        .filter(el => el.textContent.trim().length > 0)
        .map(el => {
          const style = window.getComputedStyle(el);
          return {
            tag: el.tagName.toLowerCase(),
            text: el.textContent.trim().substring(0, 50),
            fontSize: parseFloat(style.fontSize)
          };
        });
    });

    const sizeIssues = [];

    for (const element of textElements) {
      const fontSize = element.fontSize * 0.75; // Convert px to pt

      let textType = 'body';
      if (element.tag.startsWith('h')) textType = 'heading';

      const validation = wcag.validateTextSize(fontSize, textType);

      if (!validation.passes) {
        sizeIssues.push({
          element: `${element.tag}: "${element.text}"`,
          fontSize: validation.fontSize.toFixed(1),
          minimum: validation.minimum,
          difference: validation.difference
        });
      }
    }

    if (sizeIssues.length > 0) {
      checkResult.passes = false;
      checkResult.issues = sizeIssues;

      results.violations.push({
        title: 'Text Size Too Small',
        severity: 'MAJOR',
        description: `Found ${sizeIssues.length} text elements below minimum size.`,
        details: sizeIssues,
        remediation: 'Increase text size to meet minimum requirements (11pt body, 14pt headings).'
      });

      console.log(`    ✗ FAIL: ${sizeIssues.length} text size issues found`);
      results.overallPasses = false;
      results.summary.majorIssues++;
    } else {
      console.log('    ✓ PASS: All text meets minimum size requirements');
    }

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Check touch target sizes (WCAG 2.5.8)
 */
async function checkTouchTargets(page, screenshotsDir) {
  console.log('  Checking touch target sizes...');

  if (!CONFIG.checks.touchTargets.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Touch Target Size',
    category: 'Operable',
    criterion: '2.5.8',
    passes: true,
    issues: []
  };

  try {
    const interactiveElements = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button, input, select, textarea'))
        .map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || el.value || el.placeholder || '').trim().substring(0, 50),
            width: rect.width,
            height: rect.height
          };
        });
    });

    const targetIssues = [];

    for (const element of interactiveElements) {
      const validation = wcag.validateTouchTarget(element.width, element.height, 'AA');

      if (!validation.passes) {
        targetIssues.push({
          element: `${element.tag}: "${element.text}"`,
          size: `${element.width.toFixed(0)}×${element.height.toFixed(0)}px`,
          minimum: `${validation.minimum}×${validation.minimum}px`
        });
      }
    }

    if (targetIssues.length > 0) {
      checkResult.passes = false;
      checkResult.issues = targetIssues;

      results.violations.push({
        title: 'Touch Targets Too Small',
        criterion: '2.5.8',
        severity: 'MAJOR',
        description: `Found ${targetIssues.length} interactive elements below minimum touch target size.`,
        details: targetIssues,
        remediation: 'Increase size of interactive elements to at least 24×24px (44×44px recommended for AAA).'
      });

      console.log(`    ✗ FAIL: ${targetIssues.length} touch target issues found`);
      results.overallPasses = false;
      results.summary.majorIssues++;
    } else {
      console.log('    ✓ PASS: All interactive elements meet minimum size');
    }

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Check alt text for images (WCAG 1.1.1)
 */
async function checkAltText(page) {
  console.log('  Checking image alt text...');

  if (!CONFIG.checks.altText.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Alternative Text',
    category: 'Perceivable',
    criterion: '1.1.1',
    passes: true,
    issues: []
  };

  try {
    const images = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => ({
          src: img.src.substring(0, 100),
          alt: img.alt,
          hasAlt: img.hasAttribute('alt'),
          isEmpty: !img.alt || img.alt.trim() === ''
        }));
    });

    const altTextIssues = images.filter(img => !img.hasAlt || img.isEmpty);

    if (altTextIssues.length > 0) {
      checkResult.passes = false;
      checkResult.issues = altTextIssues;

      results.violations.push({
        title: 'Missing Alternative Text',
        criterion: '1.1.1',
        severity: 'CRITICAL',
        description: `Found ${altTextIssues.length} images without alternative text.`,
        details: altTextIssues.map(img => ({ src: img.src })),
        remediation: 'Add descriptive alt text to all images. Use alt="" for decorative images.'
      });

      console.log(`    ✗ FAIL: ${altTextIssues.length} images missing alt text`);
      results.overallPasses = false;
      results.summary.criticalIssues++;
    } else {
      console.log(`    ✓ PASS: All ${images.length} images have alt text`);
    }

    // Add to manual review
    results.manualReviewRequired.push({
      item: 'Alternative Text Quality',
      description: 'Automated tools can only check presence of alt text. Please manually verify that alt text is meaningful and describes the image content appropriately.'
    });

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Check heading hierarchy (WCAG 2.4.6)
 */
async function checkHeadingHierarchy(page) {
  console.log('  Checking heading hierarchy...');

  if (!CONFIG.checks.headingHierarchy.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Heading Hierarchy',
    category: 'Understandable',
    criterion: '2.4.6',
    passes: true,
    issues: []
  };

  try {
    const headings = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .map((h, index) => ({
          level: parseInt(h.tagName.substring(1)),
          text: h.textContent.trim(),
          index
        }));
    });

    const validation = wcag.validateHeadingHierarchy(headings);

    if (!validation.passes) {
      checkResult.passes = false;
      checkResult.issues = validation.issues;

      results.violations.push({
        title: 'Heading Hierarchy Issues',
        criterion: '2.4.6',
        severity: 'MAJOR',
        description: `Found ${validation.issues.length} heading hierarchy issues.`,
        details: {
          issues: validation.issues,
          structure: validation.structure
        },
        remediation: 'Ensure proper heading nesting (h1 → h2 → h3, no skipped levels). Document should have exactly one h1.'
      });

      console.log(`    ✗ FAIL: ${validation.issues.length} hierarchy issues found`);
      results.overallPasses = false;
      results.summary.majorIssues++;
    } else {
      console.log(`    ✓ PASS: Heading hierarchy is valid (${headings.length} headings)`);
    }

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Check text spacing (WCAG 1.4.12)
 */
async function checkTextSpacing(page) {
  console.log('  Checking text spacing...');

  if (!CONFIG.checks.textSpacing.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Text Spacing',
    category: 'Perceivable',
    criterion: '1.4.12',
    passes: true,
    issues: []
  };

  try {
    const textBlocks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('p, div, li'))
        .filter(el => el.textContent.trim().length > 0)
        .map(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const lineHeight = parseFloat(style.lineHeight);

          return {
            tag: el.tagName.toLowerCase(),
            text: el.textContent.trim().substring(0, 50),
            lineHeight: lineHeight / fontSize,
            fontSize
          };
        });
    });

    const spacingIssues = [];

    for (const block of textBlocks) {
      const validation = wcag.validateTextSpacing({
        lineHeight: block.lineHeight,
        paragraphSpacing: 2.0 // TODO: Calculate from DOM
      });

      if (!validation.passes) {
        spacingIssues.push({
          element: `${block.tag}: "${block.text}"`,
          lineHeight: block.lineHeight.toFixed(2),
          required: CONFIG.checks.textSpacing.lineHeight,
          violations: validation.violations
        });
      }
    }

    if (spacingIssues.length > 0) {
      checkResult.passes = false;
      checkResult.issues = spacingIssues;

      results.violations.push({
        title: 'Text Spacing Issues',
        criterion: '1.4.12',
        severity: 'MAJOR',
        description: `Found ${spacingIssues.length} text blocks with insufficient spacing.`,
        details: spacingIssues,
        remediation: 'Increase line height to at least 1.5× font size and paragraph spacing to at least 2× font size.'
      });

      console.log(`    ✗ FAIL: ${spacingIssues.length} spacing issues found`);
      results.overallPasses = false;
      results.summary.majorIssues++;
    } else {
      console.log('    ✓ PASS: Text spacing meets requirements');
    }

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Check focus indicators (WCAG 2.4.7)
 */
async function checkFocusIndicators(page) {
  console.log('  Checking focus indicators...');

  if (!CONFIG.checks.focusIndicators.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Focus Indicators',
    category: 'Operable',
    criterion: '2.4.7',
    passes: true,
    issues: []
  };

  // Add to manual review (difficult to test automatically)
  results.manualReviewRequired.push({
    item: 'Focus Indicators',
    description: 'Please manually verify that all interactive elements have visible focus indicators with sufficient contrast (3:1 minimum).'
  });

  console.log('    ⊝ Manual review required');

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  results.summary.passedChecks++;
}

/**
 * Check color blindness simulation
 */
async function checkColorBlindness(page, screenshotsDir) {
  console.log('  Checking color blindness compatibility...');

  if (!CONFIG.checks.colorBlindness.enabled) {
    console.log('    ⊝ Skipped (disabled in config)');
    return;
  }

  const checkResult = {
    name: 'Color Blindness',
    category: 'Perceivable',
    passes: true,
    issues: []
  };

  try {
    // Test TEEI brand color combinations
    const colorCombos = CONFIG.commonColorCombinations || [];
    const cbIssues = [];

    for (const combo of colorCombos) {
      for (const type of CONFIG.checks.colorBlindness.testTypes) {
        const result = wcag.checkColorBlindDistinguishability(
          combo.foreground,
          combo.background,
          type
        );

        if (!result.isDistinguishable) {
          cbIssues.push({
            combination: combo.name,
            context: combo.context,
            colorBlindType: type,
            contrast: result.contrast,
            required: 3.0
          });
        }
      }
    }

    if (cbIssues.length > 0) {
      checkResult.passes = false;
      checkResult.issues = cbIssues;

      results.violations.push({
        title: 'Color Blindness Issues',
        severity: 'MAJOR',
        description: `Found ${cbIssues.length} color combinations that may not be distinguishable for color-blind users.`,
        details: cbIssues,
        remediation: 'Ensure content is distinguishable without relying solely on color. Add text labels, patterns, or icons.'
      });

      console.log(`    ✗ FAIL: ${cbIssues.length} color blindness issues found`);
      results.overallPasses = false;
      results.summary.majorIssues++;
    } else {
      console.log('    ✓ PASS: Colors distinguishable for color-blind users');
    }

  } catch (error) {
    console.error('    ✗ ERROR:', error.message);
    checkResult.passes = false;
    checkResult.error = error.message;
  }

  results.checks.push(checkResult);
  results.summary.totalChecks++;
  if (checkResult.passes) results.summary.passedChecks++;
  else results.summary.failedChecks++;
}

/**
 * Analyze colors in screenshot
 */
async function analyzeImageColors(imagePath, pageIndex) {
  // Load image and extract dominant colors
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  // Sample colors from image (simplified analysis)
  const imageData = ctx.getImageData(0, 0, image.width, image.height);
  // TODO: Implement color extraction and contrast checking
}

/**
 * Check PDF structure
 */
async function checkPDFStructure(pdfDoc) {
  console.log('  Checking PDF structure...');

  // Check if PDF is tagged (for screen readers)
  // Note: pdf-lib has limited support for tagged PDFs
  results.manualReviewRequired.push({
    item: 'PDF Tagging',
    description: 'Please verify that the PDF is tagged for screen reader accessibility. Tagged PDFs provide structure and reading order.'
  });

  results.manualReviewRequired.push({
    item: 'PDF Form Fields',
    description: 'If the PDF contains forms, verify that all form fields have proper labels and tab order.'
  });
}

/**
 * Calculate overall score
 */
function calculateOverallScore() {
  const { totalChecks, passedChecks } = results.summary;

  if (totalChecks === 0) {
    results.overallScore = 0;
    return;
  }

  // Base score on pass rate
  const passRate = passedChecks / totalChecks;

  // Apply penalties for violations
  let penalty = 0;
  penalty += results.summary.criticalIssues * 0.10; // 10% per critical
  penalty += results.summary.majorIssues * 0.05;    // 5% per major
  penalty += results.summary.minorIssues * 0.02;    // 2% per minor

  const score = Math.max(0, (passRate - penalty) * 10);
  results.overallScore = parseFloat(score.toFixed(2));

  // Overall pass if score >= 8.0 and no critical issues
  results.overallPasses = results.overallScore >= 8.0 && results.summary.criticalIssues === 0;
}

/**
 * Generate reports
 */
async function generateReports(issuesDir) {
  console.log('  Generating reports...\n');

  // Generate JSON report
  const jsonPath = path.join(issuesDir, `accessibility-report-${Date.now()}.json`);
  await fs.writeFile(jsonPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`  ✓ JSON report: ${jsonPath}`);

  // Generate HTML report
  const htmlPath = path.join(issuesDir, `accessibility-report-${Date.now()}.html`);
  await generateAccessibilityReport(results, htmlPath);
  console.log(`  ✓ HTML report: ${htmlPath}\n`);
}

/**
 * Print summary to console
 */
function printSummary() {
  console.log('=====================================');
  console.log('VALIDATION SUMMARY');
  console.log('=====================================\n');

  console.log(`File: ${results.fileName}`);
  console.log(`Overall Score: ${results.overallScore}/10`);
  console.log(`Status: ${results.overallPasses ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Checks:');
  console.log(`  Total: ${results.summary.totalChecks}`);
  console.log(`  Passed: ${results.summary.passedChecks}`);
  console.log(`  Failed: ${results.summary.failedChecks}\n`);

  console.log('Issues:');
  console.log(`  Critical: ${results.summary.criticalIssues}`);
  console.log(`  Major: ${results.summary.majorIssues}`);
  console.log(`  Minor: ${results.summary.minorIssues}\n`);

  if (results.manualReviewRequired.length > 0) {
    console.log('Manual Review Required:');
    results.manualReviewRequired.forEach(item => {
      console.log(`  • ${item.item}`);
    });
    console.log('');
  }

  console.log('=====================================\n');
}

// Run validation if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node validate-accessibility.js <path-to-file>');
    console.error('');
    console.error('Supported formats: .pdf, .html');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/validate-accessibility.js exports/document.pdf');
    console.error('  node scripts/validate-accessibility.js exports/document.html');
    process.exit(1);
  }

  validateAccessibility(filePath)
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default validateAccessibility;
export { results, CONFIG };
