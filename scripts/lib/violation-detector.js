/**
 * Comprehensive Violation Detection System
 *
 * Detects and classifies brand guideline violations with precision.
 * Supports automated fix strategy generation and risk assessment.
 *
 * @module violation-detector
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
const projectRoot = path.resolve(__dirname, '../..');

// TEEI Brand Guidelines - Official Color Palette
const TEEI_COLORS = {
  nordshore: { hex: '#00393F', rgb: [0, 57, 63], name: 'Nordshore', cmyk: [100, 10, 10, 75] },
  sky: { hex: '#C9E4EC', rgb: [201, 228, 236], name: 'Sky', cmyk: [15, 3, 0, 7] },
  sand: { hex: '#FFF1E2', rgb: [255, 241, 226], name: 'Sand', cmyk: [0, 5, 11, 0] },
  beige: { hex: '#EFE1DC', rgb: [239, 225, 220], name: 'Beige', cmyk: [0, 6, 8, 6] },
  moss: { hex: '#65873B', rgb: [101, 135, 59], name: 'Moss', cmyk: [45, 0, 77, 25] },
  gold: { hex: '#BA8F5A', rgb: [186, 143, 90], name: 'Gold', cmyk: [0, 23, 52, 27] },
  clay: { hex: '#913B2F', rgb: [145, 59, 47], name: 'Clay', cmyk: [0, 59, 68, 43] }
};

// Forbidden colors (not in brand palette)
const FORBIDDEN_COLORS = {
  copper: { hex: '#B87333', rgb: [184, 115, 51], name: 'Copper/Orange' },
  orange: { hex: '#FF6B35', rgb: [255, 107, 53], name: 'Orange' }
};

// Official Typography
const TEEI_FONTS = {
  headline: {
    family: 'Lora',
    variants: ['Regular', 'Medium', 'SemiBold', 'Bold'],
    sizes: { title: 42, header: 28, subheader: 20 },
    lineHeight: 1.2
  },
  body: {
    family: 'Roboto Flex',
    variants: ['Regular', 'Medium'],
    sizes: { body: 11, subhead: 18, caption: 9 },
    lineHeight: 1.5
  }
};

// Layout Standards
const LAYOUT_STANDARDS = {
  grid: { columns: 12, gutter: 20 },
  margins: { all: 40 },
  spacing: {
    sections: 60,
    elements: 20,
    paragraphs: 12
  },
  logoClearing: {
    minimum: 'icon_height',
    description: 'Minimum clearspace = height of logo icon element'
  }
};

// Tolerance levels for detection
const TOLERANCES = {
  color: 15,        // RGB difference
  dimension: 2,     // Points
  spacing: 3,       // Points
  fontSize: 1       // Points
};

/**
 * Main Violation Detector Class
 */
export class ViolationDetector {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      strictMode: options.strictMode || false,
      generateFixes: options.generateFixes !== false,
      ...options
    };

    this.violations = {
      critical: [],   // Must fix before delivery (blocks release)
      major: [],      // Should fix (quality issues)
      minor: [],      // Nice to have (polish)
      warnings: []    // FYI only (informational)
    };

    this.stats = {
      totalViolations: 0,
      autoFixable: 0,
      manualFixRequired: 0,
      estimatedFixTime: 0
    };
  }

  /**
   * Detect all violations in PDF
   */
  async detectAllViolations(pdfPath) {
    console.log('🔍 Starting comprehensive violation detection...');
    console.log(`Target: ${pdfPath}\n`);

    const startTime = Date.now();

    try {
      // Verify file exists
      await fs.access(pdfPath);

      // Run all detection modules in parallel for speed
      const [
        colorViolations,
        typographyViolations,
        layoutViolations,
        contentViolations,
        accessibilityViolations
      ] = await Promise.all([
        this.detectColorViolations(pdfPath),
        this.detectTypographyViolations(pdfPath),
        this.detectLayoutViolations(pdfPath),
        this.detectContentViolations(pdfPath),
        this.detectAccessibilityViolations(pdfPath)
      ]);

      // Classify all violations by severity
      this.classifyViolations([
        ...colorViolations,
        ...typographyViolations,
        ...layoutViolations,
        ...contentViolations,
        ...accessibilityViolations
      ]);

      // Generate fix strategies for each violation
      if (this.options.generateFixes) {
        await this.generateFixStrategies();
      }

      // Calculate statistics
      this.calculateStatistics();

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`\n✅ Detection complete in ${elapsedTime}s`);
      console.log(`Found ${this.stats.totalViolations} violations:`);
      console.log(`  🔴 Critical: ${this.violations.critical.length}`);
      console.log(`  🟡 Major: ${this.violations.major.length}`);
      console.log(`  🟢 Minor: ${this.violations.minor.length}`);
      console.log(`  ℹ️  Warnings: ${this.violations.warnings.length}`);
      console.log(`\n🤖 Auto-fixable: ${this.stats.autoFixable}/${this.stats.totalViolations}`);
      console.log(`⏱️  Estimated fix time: ${this.formatTime(this.stats.estimatedFixTime)}`);

      return {
        violations: this.violations,
        stats: this.stats,
        detectionTime: elapsedTime
      };

    } catch (error) {
      console.error('❌ Detection failed:', error);
      throw error;
    }
  }

  /**
   * Detect color violations (wrong colors, forbidden colors)
   */
  async detectColorViolations(pdfPath) {
    const violations = [];

    console.log('🎨 Checking color compliance...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      // Convert PDF to HTML for analysis
      const htmlPath = await this.convertPdfToHtml(pdfPath);
      await page.goto(`file://${htmlPath}`);

      // Extract all colors from page
      const colors = await page.evaluate(() => {
        const extractColors = (element) => {
          const colors = [];
          const computedStyle = window.getComputedStyle(element);

          // Get background color
          const bgColor = computedStyle.backgroundColor;
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            colors.push({
              type: 'background',
              color: bgColor,
              element: element.tagName,
              text: element.textContent?.substring(0, 50)
            });
          }

          // Get text color
          const textColor = computedStyle.color;
          if (textColor) {
            colors.push({
              type: 'text',
              color: textColor,
              element: element.tagName,
              text: element.textContent?.substring(0, 50)
            });
          }

          return colors;
        };

        const allColors = [];
        document.querySelectorAll('*').forEach(el => {
          allColors.push(...extractColors(el));
        });

        return allColors;
      });

      // Check each color against brand guidelines
      for (const colorInstance of colors) {
        const rgb = this.parseColor(colorInstance.color);
        if (!rgb) continue;

        // Check if it's a forbidden color
        const forbiddenMatch = this.matchesForbiddenColor(rgb);
        if (forbiddenMatch) {
          violations.push({
            type: 'forbidden_color',
            severity: 'critical',
            category: 'color',
            description: `Forbidden color detected: ${forbiddenMatch.name}`,
            location: {
              element: colorInstance.element,
              text: colorInstance.text
            },
            current: {
              color: colorInstance.color,
              rgb: rgb,
              name: forbiddenMatch.name
            },
            expected: {
              alternatives: this.suggestBrandColorAlternative(rgb),
              reason: 'Not in TEEI brand palette'
            },
            impact: 'Brand inconsistency - damages professional image',
            automatable: true,
            estimatedFixTime: 2
          });
        }

        // Check if it's close but not exact to a brand color
        const brandMatch = this.matchesBrandColor(rgb);
        if (brandMatch && brandMatch.distance > TOLERANCES.color) {
          violations.push({
            type: 'color_mismatch',
            severity: 'major',
            category: 'color',
            description: `Color doesn't match brand exactly`,
            location: {
              element: colorInstance.element,
              text: colorInstance.text
            },
            current: {
              color: colorInstance.color,
              rgb: rgb
            },
            expected: {
              color: brandMatch.color.hex,
              rgb: brandMatch.color.rgb,
              name: brandMatch.color.name
            },
            difference: brandMatch.distance,
            impact: 'Visual inconsistency - minor brand dilution',
            automatable: true,
            estimatedFixTime: 1
          });
        }

        // Check if it's an unrecognized color
        if (!brandMatch && !forbiddenMatch) {
          const suggestion = this.suggestBrandColorAlternative(rgb);
          violations.push({
            type: 'unrecognized_color',
            severity: 'minor',
            category: 'color',
            description: `Color not in brand palette`,
            location: {
              element: colorInstance.element,
              text: colorInstance.text
            },
            current: {
              color: colorInstance.color,
              rgb: rgb
            },
            expected: {
              color: suggestion.hex,
              rgb: suggestion.rgb,
              name: suggestion.name
            },
            impact: 'Potential brand inconsistency',
            automatable: true,
            estimatedFixTime: 1
          });
        }
      }

    } finally {
      await browser.close();
    }

    console.log(`  Found ${violations.length} color violations`);
    return violations;
  }

  /**
   * Detect typography violations
   */
  async detectTypographyViolations(pdfPath) {
    const violations = [];

    console.log('✍️  Checking typography compliance...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const htmlPath = await this.convertPdfToHtml(pdfPath);
      await page.goto(`file://${htmlPath}`);

      // Extract all text elements with font information
      const textElements = await page.evaluate(() => {
        const elements = [];

        document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div').forEach(el => {
          const text = el.textContent?.trim();
          if (!text || text.length === 0) return;

          const computedStyle = window.getComputedStyle(el);
          elements.push({
            tag: el.tagName.toLowerCase(),
            text: text.substring(0, 100),
            fontFamily: computedStyle.fontFamily,
            fontSize: computedStyle.fontSize,
            fontWeight: computedStyle.fontWeight,
            lineHeight: computedStyle.lineHeight,
            letterSpacing: computedStyle.letterSpacing
          });
        });

        return elements;
      });

      // Check each text element
      for (const element of textElements) {
        const fontSize = parseFloat(element.fontSize);
        const fontFamily = element.fontFamily.toLowerCase();

        // Determine expected font based on element type
        const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(element.tag);
        const expectedFont = isHeading ? TEEI_FONTS.headline : TEEI_FONTS.body;

        // Check font family
        if (!fontFamily.includes(expectedFont.family.toLowerCase())) {
          violations.push({
            type: 'wrong_font_family',
            severity: 'critical',
            category: 'typography',
            description: `Wrong font family for ${isHeading ? 'heading' : 'body text'}`,
            location: {
              element: element.tag,
              text: element.text
            },
            current: {
              fontFamily: element.fontFamily,
              fontSize: element.fontSize
            },
            expected: {
              fontFamily: expectedFont.family,
              reason: `${expectedFont.family} is required for ${isHeading ? 'headlines' : 'body text'}`
            },
            impact: 'Major brand violation - typography is core to brand identity',
            automatable: true,
            estimatedFixTime: 3
          });
        }

        // Check font size against standards
        const sizeViolation = this.checkFontSize(element, isHeading);
        if (sizeViolation) {
          violations.push(sizeViolation);
        }

        // Check line height
        const lineHeightViolation = this.checkLineHeight(element, expectedFont);
        if (lineHeightViolation) {
          violations.push(lineHeightViolation);
        }
      }

    } finally {
      await browser.close();
    }

    console.log(`  Found ${violations.length} typography violations`);
    return violations;
  }

  /**
   * Detect layout violations
   */
  async detectLayoutViolations(pdfPath) {
    const violations = [];

    console.log('📐 Checking layout compliance...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const htmlPath = await this.convertPdfToHtml(pdfPath);
      await page.goto(`file://${htmlPath}`);

      // Check page dimensions
      const dimensions = await page.evaluate(() => ({
        width: document.body.scrollWidth,
        height: document.body.scrollHeight
      }));

      const expectedWidth = 612; // 8.5 inches
      const expectedHeight = 792; // 11 inches

      if (Math.abs(dimensions.width - expectedWidth) > TOLERANCES.dimension) {
        violations.push({
          type: 'wrong_page_width',
          severity: 'critical',
          category: 'layout',
          description: 'Page width incorrect',
          current: { width: dimensions.width },
          expected: { width: expectedWidth },
          impact: 'Document may not print correctly',
          automatable: true,
          estimatedFixTime: 5
        });
      }

      // Check for text cutoffs
      const textCutoffs = await this.detectTextCutoffs(page);
      violations.push(...textCutoffs);

      // Check spacing consistency
      const spacingViolations = await this.detectSpacingViolations(page);
      violations.push(...spacingViolations);

      // Check logo clearspace
      const logoClearspaceViolations = await this.detectLogoClearspaceViolations(page);
      violations.push(...logoClearspaceViolations);

    } finally {
      await browser.close();
    }

    console.log(`  Found ${violations.length} layout violations`);
    return violations;
  }

  /**
   * Detect content violations (placeholders, incomplete text)
   */
  async detectContentViolations(pdfPath) {
    const violations = [];

    console.log('📄 Checking content quality...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const htmlPath = await this.convertPdfToHtml(pdfPath);
      await page.goto(`file://${htmlPath}`);

      // Extract all text content
      const textContent = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('*'))
          .map(el => el.textContent?.trim())
          .filter(text => text && text.length > 0);
      });

      // Check for placeholder text
      const placeholderPatterns = [
        /XX+/g,
        /\[.*?\]/g,
        /TODO/gi,
        /PLACEHOLDER/gi,
        /REPLACE\s*ME/gi,
        /\{\{.*?\}\}/g
      ];

      for (const text of textContent) {
        for (const pattern of placeholderPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            violations.push({
              type: 'placeholder_text',
              severity: 'critical',
              category: 'content',
              description: 'Placeholder text found - needs real content',
              location: {
                text: text.substring(0, 100)
              },
              current: {
                placeholder: matches[0]
              },
              expected: {
                action: 'Replace with actual data or content'
              },
              impact: 'Unprofessional appearance - document incomplete',
              automatable: false, // Requires human input
              estimatedFixTime: 10
            });
          }
        }
      }

      // Check for incomplete sentences (text cutoffs)
      for (const text of textContent) {
        if (text.endsWith('-') && !text.endsWith('--')) {
          violations.push({
            type: 'text_cutoff',
            severity: 'critical',
            category: 'content',
            description: 'Text appears to be cut off',
            location: {
              text: text.substring(Math.max(0, text.length - 100))
            },
            current: {
              text: text
            },
            expected: {
              action: 'Complete the text or expand text frame'
            },
            impact: 'Unprofessional appearance - content incomplete',
            automatable: true,
            estimatedFixTime: 5
          });
        }
      }

    } finally {
      await browser.close();
    }

    console.log(`  Found ${violations.length} content violations`);
    return violations;
  }

  /**
   * Detect accessibility violations
   */
  async detectAccessibilityViolations(pdfPath) {
    const violations = [];

    console.log('♿ Checking accessibility compliance...');

    // This would integrate with WCAG checker
    // For now, basic checks

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      const htmlPath = await this.convertPdfToHtml(pdfPath);
      await page.goto(`file://${htmlPath}`);

      // Check for alt text on images
      const imagesWithoutAlt = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img'))
          .filter(img => !img.alt || img.alt.trim() === '')
          .length;
      });

      if (imagesWithoutAlt > 0) {
        violations.push({
          type: 'missing_alt_text',
          severity: 'major',
          category: 'accessibility',
          description: `${imagesWithoutAlt} images missing alt text`,
          impact: 'Screen reader users cannot understand images',
          automatable: false,
          estimatedFixTime: 2 * imagesWithoutAlt
        });
      }

      // Check color contrast
      // Would use WCAG checker lib here

    } finally {
      await browser.close();
    }

    console.log(`  Found ${violations.length} accessibility violations`);
    return violations;
  }

  /**
   * Classify violations by severity
   */
  classifyViolations(allViolations) {
    for (const violation of allViolations) {
      switch (violation.severity) {
        case 'critical':
          this.violations.critical.push(violation);
          break;
        case 'major':
          this.violations.major.push(violation);
          break;
        case 'minor':
          this.violations.minor.push(violation);
          break;
        default:
          this.violations.warnings.push(violation);
      }
    }
  }

  /**
   * Generate fix strategies for each violation
   */
  async generateFixStrategies() {
    console.log('\n🔧 Generating fix strategies...');

    for (const severity of ['critical', 'major', 'minor']) {
      for (const violation of this.violations[severity]) {
        violation.fixStrategy = this.determineFixStrategy(violation);
      }
    }
  }

  /**
   * Determine fix strategy for a violation
   */
  determineFixStrategy(violation) {
    const strategies = {
      'forbidden_color': {
        type: 'color_replace',
        action: 'Replace forbidden color with brand color',
        tool: 'indesign_script',
        script: 'replaceColor',
        automatable: true,
        risk: 'low'
      },
      'color_mismatch': {
        type: 'color_adjust',
        action: 'Adjust color to exact brand specification',
        tool: 'indesign_script',
        script: 'adjustColor',
        automatable: true,
        risk: 'low'
      },
      'wrong_font_family': {
        type: 'font_replace',
        action: 'Change font to brand-approved typeface',
        tool: 'indesign_script',
        script: 'replaceFont',
        automatable: true,
        risk: 'low'
      },
      'text_cutoff': {
        type: 'resize_frame',
        action: 'Expand text frame to show complete content',
        tool: 'indesign_script',
        script: 'expandTextFrame',
        automatable: true,
        risk: 'medium'
      },
      'placeholder_text': {
        type: 'content_replace',
        action: 'Replace placeholder with actual data',
        tool: 'ai_generation',
        script: null,
        automatable: false,
        risk: 'high'
      },
      'wrong_page_width': {
        type: 'page_resize',
        action: 'Adjust page dimensions to standard',
        tool: 'indesign_script',
        script: 'resizePage',
        automatable: true,
        risk: 'medium'
      }
    };

    const strategy = strategies[violation.type] || {
      type: 'manual_fix',
      action: 'Manual correction required',
      tool: 'manual',
      automatable: false,
      risk: 'unknown'
    };

    // Add specific parameters for this violation
    strategy.params = this.generateFixParameters(violation);

    return strategy;
  }

  /**
   * Generate specific parameters for fix
   */
  generateFixParameters(violation) {
    const params = {};

    if (violation.current) {
      params.currentValue = violation.current;
    }

    if (violation.expected) {
      params.targetValue = violation.expected;
    }

    if (violation.location) {
      params.location = violation.location;
    }

    return params;
  }

  /**
   * Calculate statistics
   */
  calculateStatistics() {
    this.stats.totalViolations =
      this.violations.critical.length +
      this.violations.major.length +
      this.violations.minor.length;

    // Count auto-fixable violations
    for (const severity of ['critical', 'major', 'minor']) {
      for (const violation of this.violations[severity]) {
        if (violation.automatable) {
          this.stats.autoFixable++;
        } else {
          this.stats.manualFixRequired++;
        }

        this.stats.estimatedFixTime += violation.estimatedFixTime || 0;
      }
    }
  }

  // Helper methods

  parseColor(colorString) {
    const rgbMatch = colorString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    return null;
  }

  matchesForbiddenColor(rgb) {
    for (const [key, color] of Object.entries(FORBIDDEN_COLORS)) {
      const distance = this.colorDistance(rgb, color.rgb);
      if (distance < 30) {
        return color;
      }
    }
    return null;
  }

  matchesBrandColor(rgb) {
    let closest = null;
    let minDistance = Infinity;

    for (const [key, color] of Object.entries(TEEI_COLORS)) {
      const distance = this.colorDistance(rgb, color.rgb);
      if (distance < minDistance) {
        minDistance = distance;
        closest = { color, distance };
      }
    }

    return closest;
  }

  suggestBrandColorAlternative(rgb) {
    const match = this.matchesBrandColor(rgb);
    return match ? match.color : TEEI_COLORS.nordshore;
  }

  colorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  checkFontSize(element, isHeading) {
    // Implementation for font size checking
    return null;
  }

  checkLineHeight(element, expectedFont) {
    // Implementation for line height checking
    return null;
  }

  async detectTextCutoffs(page) {
    // Implementation for text cutoff detection
    return [];
  }

  async detectSpacingViolations(page) {
    // Implementation for spacing violation detection
    return [];
  }

  async detectLogoClearspaceViolations(page) {
    // Implementation for logo clearspace violation detection
    return [];
  }

  async convertPdfToHtml(pdfPath) {
    // Placeholder - would use pdf2html or similar
    // For now, assume HTML version exists
    return pdfPath.replace('.pdf', '.html');
  }

  formatTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  }
}

export default ViolationDetector;
