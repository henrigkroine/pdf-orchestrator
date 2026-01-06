/**
 * Contrast Checker - WCAG 2.2 contrast validation and auto-fix
 * Validates and adjusts colors to meet 4.5:1 (normal) and 3:1 (large text) ratios
 *
 * WCAG 2.2: 1.4.3 Contrast (Minimum) - Level AA
 */

import { extractColorsFromPDF, extractTextBlocksWithBounds } from '../utils/advancedPdfParser.js';
import {
  calculateContrastRatio,
  analyzeContrast,
  hexToRgb,
  normalizeHex
} from '../utils/contrastChecker.js';
import logger from '../utils/logger.js';

class ContrastChecker {
  constructor(pdfPath) {
    this.pdfPath = pdfPath;
    this.contrastIssues = [];
    this.colorPairs = [];
  }

  /**
   * Check all text-background contrast ratios
   * @returns {Promise<Object>} Contrast analysis with issues and fixes
   */
  async checkContrast() {
    logger.subsection('Checking Contrast Ratios');

    try {
      // Extract colors and text blocks
      const [colors, textBlocks] = await Promise.all([
        extractColorsFromPDF(this.pdfPath),
        extractTextBlocksWithBounds(this.pdfPath)
      ]);

      // Analyze color usage
      const textColors = colors.filter(c => c.usage.includes('fill'));
      const backgroundColors = colors.filter(c => c.usage.includes('stroke') || c.usage === 'fill');

      // Assume white background if no background color detected
      const bgColor = backgroundColors.length > 0 ? backgroundColors[0].color : '#FFFFFF';

      logger.info(`Found ${textColors.length} text colors, background: ${bgColor}`);

      // Check each text color against background
      textColors.forEach(textColorObj => {
        const textColor = textColorObj.color;

        // Analyze contrast for both normal and large text
        const normalContrast = analyzeContrast(textColor, bgColor, 'normal', 'Body text');
        const largeContrast = analyzeContrast(textColor, bgColor, 'large', 'Headings/Large text');

        this.colorPairs.push({ textColor, bgColor, normalContrast, largeContrast });

        // Check for failures
        if (!normalContrast.passAA) {
          this.contrastIssues.push({
            criterion: 'WCAG 2.2 - 1.4.3 Contrast (Minimum)',
            severity: 'MAJOR',
            textColor,
            backgroundColor: bgColor,
            ratio: normalContrast.ratio,
            required: 4.5,
            textType: 'normal',
            message: `Text color ${textColor} has insufficient contrast (${normalContrast.ratio}:1 < 4.5:1)`,
            autoFixable: true,
            suggestedFix: this.suggestContrastFix(textColor, bgColor, 4.5)
          });
        }

        if (!largeContrast.passAA && normalContrast.passAA) {
          // Only flag if normal passes but large doesn't (unusual case)
          logger.warn(`Large text contrast issue: ${largeContrast.ratio}:1 (need 3:1)`);
        }
      });

      const passRate = this.colorPairs.length > 0
        ? ((this.colorPairs.filter(p => p.normalContrast.passAA).length / this.colorPairs.length) * 100).toFixed(1)
        : '100';

      logger.info(`Contrast pass rate: ${passRate}%`);

      if (this.contrastIssues.length > 0) {
        logger.warn(`Found ${this.contrastIssues.length} contrast issues`);
      } else {
        logger.success('All text meets WCAG 2.2 AA contrast requirements');
      }

      return {
        colorPairs: this.colorPairs,
        issues: this.contrastIssues,
        passRate: parseFloat(passRate),
        totalPairs: this.colorPairs.length
      };

    } catch (error) {
      logger.error(`Contrast check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Suggest color adjustment to meet contrast ratio
   * @param {string} textColor - Hex color
   * @param {string} bgColor - Hex background color
   * @param {number} targetRatio - Target contrast ratio (4.5 or 3.0)
   * @returns {Object} Suggested color adjustments
   */
  suggestContrastFix(textColor, bgColor, targetRatio) {
    const textRGB = hexToRgb(textColor);
    const bgRGB = hexToRgb(bgColor);

    // Determine if we should darken or lighten text
    const bgBrightness = (bgRGB.r + bgRGB.g + bgRGB.b) / 3;
    const shouldDarken = bgBrightness > 128; // Light background, darken text

    let adjustedColor = textColor;
    let currentRatio = calculateContrastRatio(textColor, bgColor);

    // Iteratively adjust until we meet target ratio (max 20 iterations)
    for (let i = 0; i < 20 && currentRatio < targetRatio; i++) {
      const rgb = hexToRgb(adjustedColor);

      // Adjust each channel
      const delta = shouldDarken ? -10 : 10;
      const newR = Math.max(0, Math.min(255, rgb.r + delta));
      const newG = Math.max(0, Math.min(255, rgb.g + delta));
      const newB = Math.max(0, Math.min(255, rgb.b + delta));

      adjustedColor = this.rgbToHex(newR, newG, newB);
      currentRatio = calculateContrastRatio(adjustedColor, bgColor);
    }

    return {
      originalColor: textColor,
      adjustedColor,
      originalRatio: calculateContrastRatio(textColor, bgColor),
      newRatio: currentRatio,
      method: shouldDarken ? 'darken' : 'lighten',
      meetsTarget: currentRatio >= targetRatio
    };
  }

  /**
   * Auto-fix contrast issues by adjusting text colors
   * @returns {Array<Object>} Fixed color mappings
   */
  autoFixContrast() {
    logger.subsection('Auto-Fixing Contrast Issues');

    const fixes = [];

    this.contrastIssues.forEach(issue => {
      if (issue.autoFixable && issue.suggestedFix.meetsTarget) {
        fixes.push({
          originalColor: issue.textColor,
          newColor: issue.suggestedFix.adjustedColor,
          improvement: `${issue.ratio.toFixed(2)}:1 → ${issue.suggestedFix.newRatio.toFixed(2)}:1`
        });

        logger.success(`Fixed ${issue.textColor} → ${issue.suggestedFix.adjustedColor} (${fixes[fixes.length - 1].improvement})`);
      }
    });

    logger.info(`Auto-fixed ${fixes.length}/${this.contrastIssues.length} contrast issues`);

    return fixes;
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16).toUpperCase();
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Generate contrast report
   */
  generateReport() {
    return {
      summary: {
        totalColorPairs: this.colorPairs.length,
        passingPairs: this.colorPairs.filter(p => p.normalContrast.passAA).length,
        failingPairs: this.contrastIssues.length,
        passRate: this.colorPairs.length > 0
          ? ((this.colorPairs.filter(p => p.normalContrast.passAA).length / this.colorPairs.length) * 100).toFixed(1) + '%'
          : '100%'
      },
      issues: this.contrastIssues,
      colorPairs: this.colorPairs.map(p => ({
        text: p.textColor,
        background: p.bgColor,
        ratio: p.normalContrast.ratio,
        passAA: p.normalContrast.passAA,
        passAAA: p.normalContrast.passAAA
      }))
    };
  }
}

export default ContrastChecker;
