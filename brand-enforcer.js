#!/usr/bin/env node
/**
 * TEEI Brand Compliance Enforcer (Node.js)
 * ==========================================
 * Real-time brand compliance enforcement for the PDF Orchestrator
 *
 * This is NOT validation - this is ENFORCEMENT.
 * Prevents brand violations during document creation, not just after.
 *
 * Usage:
 *   const { BrandEnforcer } = require('./brand-enforcer');
 *
 *   const enforcer = new BrandEnforcer({ strictMode: true, autoCorrect: true });
 *
 *   // All operations are validated and auto-corrected
 *   const { colorName, rgb } = enforcer.enforceColor('#C87137'); // Auto-corrects to Nordshore
 *   const font = enforcer.enforceFont('Arial', 'headline'); // Corrects to Lora
 */

const fs = require('fs');
const path = require('path');

// Load brand compliance configuration
const CONFIG_PATH = path.join(__dirname, 'config', 'brand-compliance-config.json');
const BRAND_CONFIG = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

/**
 * Violation severity levels
 */
const ViolationSeverity = {
  CRITICAL: 'critical',  // Must fix immediately, blocks operation
  MAJOR: 'major',        // Should fix, warns but allows with correction
  MINOR: 'minor'         // Improve when possible, logs only
};

/**
 * Color enforcement engine
 */
class ColorEnforcer {
  constructor() {
    this.officialColors = BRAND_CONFIG.colors.official;
    this.forbiddenColors = BRAND_CONFIG.colors.forbidden;
    this.neutralColors = BRAND_CONFIG.colors.neutral;
    this.tolerance = BRAND_CONFIG.colors.tolerance;
  }

  /**
   * Calculate Euclidean distance between two RGB colors
   */
  _rgbDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  /**
   * Convert hex color to RGB array
   */
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  /**
   * Convert RGB array to hex string
   */
  _rgbToHex(rgb) {
    return '#' + rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  /**
   * Validate and potentially correct a color value
   */
  validateColor(color) {
    let rgb, colorName;

    // Normalize color to RGB
    if (typeof color === 'string') {
      if (color.startsWith('#')) {
        rgb = this._hexToRgb(color);
        colorName = color;
      } else {
        // Try to find by name
        const colorLower = color.toLowerCase();
        const allColors = { ...this.officialColors, ...this.forbiddenColors, ...this.neutralColors };

        for (const [name, data] of Object.entries(allColors)) {
          if (name.toLowerCase() === colorLower) {
            rgb = data.rgb;
            colorName = name;
            break;
          }
        }

        if (!rgb) {
          return {
            isValid: false,
            severity: ViolationSeverity.CRITICAL,
            violationType: 'unknown_color',
            originalValue: color,
            correctedValue: 'Nordshore',
            message: `Unknown color '${color}'. Using Nordshore (primary brand color).`
          };
        }
      }
    } else if (Array.isArray(color) && color.length === 3) {
      rgb = color;
      colorName = this._rgbToHex(rgb);
    } else {
      return {
        isValid: false,
        severity: ViolationSeverity.CRITICAL,
        violationType: 'invalid_color_format',
        originalValue: color,
        correctedValue: 'Nordshore',
        message: `Invalid color format: ${color}. Using Nordshore.`
      };
    }

    // Check if it's a forbidden color
    for (const [name, data] of Object.entries(this.forbiddenColors)) {
      if (this._rgbDistance(rgb, data.rgb) <= this.tolerance) {
        return {
          isValid: false,
          severity: ViolationSeverity.CRITICAL,
          violationType: 'forbidden_color',
          originalValue: colorName,
          correctedValue: 'Nordshore',
          message: `FORBIDDEN COLOR: ${name} (${data.reason}). Auto-corrected to Nordshore.`
        };
      }
    }

    // Check if it's an official color
    for (const [name, data] of Object.entries(this.officialColors)) {
      if (this._rgbDistance(rgb, data.rgb) <= this.tolerance) {
        return {
          isValid: true,
          severity: ViolationSeverity.MINOR,
          violationType: 'none',
          originalValue: colorName,
          correctedValue: name,
          message: `✓ Valid TEEI color: ${name}`
        };
      }
    }

    // Check if it's a neutral color
    for (const [name, data] of Object.entries(this.neutralColors)) {
      if (this._rgbDistance(rgb, data.rgb) <= this.tolerance) {
        return {
          isValid: true,
          severity: ViolationSeverity.MINOR,
          violationType: 'none',
          originalValue: colorName,
          correctedValue: name,
          message: `✓ Valid neutral color: ${name}`
        };
      }
    }

    // Unknown color - default to Nordshore
    return {
      isValid: false,
      severity: ViolationSeverity.MAJOR,
      violationType: 'non_brand_color',
      originalValue: colorName,
      correctedValue: 'Nordshore',
      message: `Non-brand color ${colorName}. Auto-corrected to Nordshore (primary).`
    };
  }

  /**
   * Get RGB values for a brand color by name
   */
  getColorRgb(colorName) {
    const allColors = { ...this.officialColors, ...this.neutralColors };
    if (allColors[colorName]) {
      return allColors[colorName].rgb;
    }
    throw new Error(`Color '${colorName}' not found in brand palette`);
  }
}

/**
 * Typography enforcement engine
 */
class TypographyEnforcer {
  constructor() {
    this.allowedFonts = BRAND_CONFIG.typography.fonts;
    this.forbiddenFonts = BRAND_CONFIG.typography.forbidden;
    this.typeScale = BRAND_CONFIG.typography.scale;
  }

  /**
   * Validate font family against brand guidelines
   */
  validateFont(fontFamily, usageType = null) {
    fontFamily = fontFamily.trim();

    // Check if it's a forbidden font
    if (this.forbiddenFonts.includes(fontFamily)) {
      const correctFont = usageType === 'headline' ? 'Lora' : 'Roboto Flex';
      return {
        isValid: false,
        severity: ViolationSeverity.CRITICAL,
        violationType: 'forbidden_font',
        originalValue: fontFamily,
        correctedValue: correctFont,
        message: `FORBIDDEN FONT: ${fontFamily}. Using ${correctFont} instead.`
      };
    }

    // Check if it's Lora (headline font)
    if (fontFamily.startsWith('Lora')) {
      if (usageType === 'body') {
        return {
          isValid: false,
          severity: ViolationSeverity.MAJOR,
          violationType: 'wrong_font_usage',
          originalValue: fontFamily,
          correctedValue: 'Roboto Flex',
          message: 'Lora is for headlines only. Using Roboto Flex for body text.'
        };
      }
      return {
        isValid: true,
        severity: ViolationSeverity.MINOR,
        violationType: 'none',
        originalValue: fontFamily,
        correctedValue: fontFamily,
        message: `✓ Valid headline font: ${fontFamily}`
      };
    }

    // Check if it's Roboto (body font)
    if (fontFamily.startsWith('Roboto')) {
      return {
        isValid: true,
        severity: ViolationSeverity.MINOR,
        violationType: 'none',
        originalValue: fontFamily,
        correctedValue: fontFamily,
        message: `✓ Valid body font: ${fontFamily}`
      };
    }

    // Unknown font - auto-correct based on usage
    const correctFont = usageType === 'headline' ? 'Lora' : 'Roboto Flex';
    return {
      isValid: false,
      severity: ViolationSeverity.CRITICAL,
      violationType: 'non_brand_font',
      originalValue: fontFamily,
      correctedValue: correctFont,
      message: `Non-brand font '${fontFamily}'. Using ${correctFont}.`
    };
  }

  /**
   * Get typography specifications for an element type
   */
  getTypeSpec(elementType) {
    if (this.typeScale[elementType]) {
      return this.typeScale[elementType];
    }
    throw new Error(`Unknown element type: ${elementType}`);
  }

  /**
   * Validate font size against modular type scale
   */
  validateTypeScale(elementType, fontSize) {
    if (!this.typeScale[elementType]) {
      return {
        isValid: false,
        severity: ViolationSeverity.MINOR,
        violationType: 'unknown_element_type',
        originalValue: fontSize,
        correctedValue: 11,
        message: `Unknown element type '${elementType}'. Using default 11pt.`
      };
    }

    const spec = this.typeScale[elementType];
    const expectedSize = spec.size;

    // Allow 1pt tolerance
    if (Math.abs(fontSize - expectedSize) <= 1) {
      return {
        isValid: true,
        severity: ViolationSeverity.MINOR,
        violationType: 'none',
        originalValue: fontSize,
        correctedValue: fontSize,
        message: `✓ Valid size for ${elementType}: ${fontSize}pt`
      };
    }

    return {
      isValid: false,
      severity: ViolationSeverity.MAJOR,
      violationType: 'incorrect_type_scale',
      originalValue: fontSize,
      correctedValue: expectedSize,
      message: `Incorrect size for ${elementType}. Should be ${expectedSize}pt, got ${fontSize}pt.`
    };
  }
}

/**
 * Spacing enforcement engine
 */
class SpacingEnforcer {
  constructor() {
    this.spacing = BRAND_CONFIG.spacing;
    this.layout = BRAND_CONFIG.layout;
  }

  /**
   * Validate page margins
   */
  validateMargins(margins) {
    const expectedMargin = this.spacing.margins.all;
    const issues = [];

    for (const [side, value] of Object.entries(margins)) {
      if (Math.abs(value - expectedMargin) > 2) {  // 2pt tolerance
        issues.push(`${side}: ${value}pt (should be ${expectedMargin}pt)`);
      }
    }

    if (issues.length > 0) {
      const correctedMargins = {};
      for (const side of Object.keys(margins)) {
        correctedMargins[side] = expectedMargin;
      }

      return {
        isValid: false,
        severity: ViolationSeverity.MAJOR,
        violationType: 'incorrect_margins',
        originalValue: margins,
        correctedValue: correctedMargins,
        message: `Margin violations: ${issues.join(', ')}`
      };
    }

    return {
      isValid: true,
      severity: ViolationSeverity.MINOR,
      violationType: 'none',
      originalValue: margins,
      correctedValue: margins,
      message: '✓ Margins correct (40pt all sides)'
    };
  }

  /**
   * Validate text frame doesn't extend beyond page boundaries
   */
  validateTextFrameBounds(x, y, width, height, pageWidth = 612, pageHeight = 792) {
    const margin = this.spacing.margins.all;
    const maxX = x + width;
    const maxY = y + height;

    const safeWidth = pageWidth - (2 * margin);
    const safeHeight = pageHeight - (2 * margin);

    if (maxX > (pageWidth - margin) || maxY > (pageHeight - margin)) {
      const correctedWidth = Math.min(width, safeWidth - x + margin);
      const correctedHeight = Math.min(height, safeHeight - y + margin);

      return {
        isValid: false,
        severity: ViolationSeverity.CRITICAL,
        violationType: 'text_cutoff_risk',
        originalValue: { width, height },
        correctedValue: { width: correctedWidth, height: correctedHeight },
        message: 'Text frame extends beyond margins. Auto-shrunk to prevent cutoff.'
      };
    }

    return {
      isValid: true,
      severity: ViolationSeverity.MINOR,
      violationType: 'none',
      originalValue: { width, height },
      correctedValue: { width, height },
      message: '✓ Text frame within safe margins'
    };
  }

  /**
   * Get standard spacing value
   */
  getSpacingValue(spacingType) {
    const spacingMap = {
      'section': this.spacing.sectionBreaks,
      'element': this.spacing.elementSpacing,
      'paragraph': this.spacing.paragraphSpacing,
      'margin': this.spacing.margins.all
    };

    if (spacingMap[spacingType]) {
      return spacingMap[spacingType];
    }
    throw new Error(`Unknown spacing type: ${spacingType}`);
  }
}

/**
 * Content enforcement engine
 */
class ContentEnforcer {
  /**
   * Validate that metrics don't contain placeholders
   */
  validateMetrics(text) {
    const placeholderPatterns = [
      /\bXX\b/,
      /\b__+\b/,
      /\[.*?\]/,
      /\bTBD\b/i,
      /\bTODO\b/i,
      /\?\?+/
    ];

    for (const pattern of placeholderPatterns) {
      if (pattern.test(text)) {
        return {
          isValid: false,
          severity: ViolationSeverity.CRITICAL,
          violationType: 'placeholder_metrics',
          originalValue: text,
          correctedValue: null,
          message: `PLACEHOLDER DETECTED: '${text}' contains placeholder. Replace with actual metrics!`
        };
      }
    }

    return {
      isValid: true,
      severity: ViolationSeverity.MINOR,
      violationType: 'none',
      originalValue: text,
      correctedValue: text,
      message: '✓ No placeholders detected'
    };
  }

  /**
   * Validate text doesn't appear to be cut off
   */
  validateTextCompleteness(text) {
    const cutoffPatterns = [
      /-$/,  // Ends with hyphen
      /\w{3,}$(?![.!?])/  // Ends mid-word without punctuation
    ];

    for (const pattern of cutoffPatterns) {
      if (pattern.test(text.trim())) {
        return {
          isValid: false,
          severity: ViolationSeverity.CRITICAL,
          violationType: 'text_cutoff',
          originalValue: text,
          correctedValue: null,
          message: `TEXT CUTOFF DETECTED: '${text}' appears incomplete!`
        };
      }
    }

    return {
      isValid: true,
      severity: ViolationSeverity.MINOR,
      violationType: 'none',
      originalValue: text,
      correctedValue: text,
      message: '✓ Text appears complete'
    };
  }
}

/**
 * Logo enforcement engine
 */
class LogoEnforcer {
  constructor() {
    this.logoConfig = BRAND_CONFIG.logo;
  }

  /**
   * Validate logo has proper clearspace
   */
  validateLogoClearspace(logoBounds, nearbyElements) {
    const logoHeight = logoBounds.height;
    const minClearspace = logoHeight * this.logoConfig.clearspace.minClearspaceRatio;
    const violations = [];

    for (const element of nearbyElements) {
      const dx = Math.min(
        Math.abs(element.x - (logoBounds.x + logoBounds.width)),
        Math.abs((element.x + element.width) - logoBounds.x)
      );
      const dy = Math.min(
        Math.abs(element.y - (logoBounds.y + logoBounds.height)),
        Math.abs((element.y + element.height) - logoBounds.y)
      );

      const distance = Math.min(dx, dy);

      if (distance < minClearspace) {
        violations.push(
          `Element at (${element.x}, ${element.y}) too close ` +
          `(distance: ${distance.toFixed(1)}pt, need: ${minClearspace.toFixed(1)}pt)`
        );
      }
    }

    if (violations.length > 0) {
      return {
        isValid: false,
        severity: ViolationSeverity.MAJOR,
        violationType: 'logo_clearspace_violation',
        originalValue: logoBounds,
        correctedValue: null,
        message: `Logo clearspace violations: ${violations.join('; ')}`
      };
    }

    return {
      isValid: true,
      severity: ViolationSeverity.MINOR,
      violationType: 'none',
      originalValue: logoBounds,
      correctedValue: logoBounds,
      message: `✓ Logo clearspace maintained (minimum ${minClearspace.toFixed(1)}pt)`
    };
  }
}

/**
 * Main Brand Enforcement System
 */
class BrandEnforcer {
  constructor(options = {}) {
    this.strictMode = options.strictMode !== undefined ? options.strictMode : true;
    this.autoCorrect = options.autoCorrect !== undefined ? options.autoCorrect : true;

    this.colorEnforcer = new ColorEnforcer();
    this.typographyEnforcer = new TypographyEnforcer();
    this.spacingEnforcer = new SpacingEnforcer();
    this.contentEnforcer = new ContentEnforcer();
    this.logoEnforcer = new LogoEnforcer();

    this.violationsLog = [];

    console.log('='.repeat(80));
    console.log('TEEI BRAND COMPLIANCE ENFORCER INITIALIZED');
    console.log('='.repeat(80));
    console.log(`Strict Mode: ${this.strictMode ? 'ENABLED' : 'DISABLED'}`);
    console.log(`Auto-Correct: ${this.autoCorrect ? 'ENABLED' : 'DISABLED'}`);
    console.log();
  }

  /**
   * Log a violation for reporting
   */
  _logViolation(result) {
    this.violationsLog.push({
      severity: result.severity,
      type: result.violationType,
      original: result.originalValue,
      corrected: result.correctedValue,
      message: result.message
    });

    const severityIcons = {
      [ViolationSeverity.CRITICAL]: '🚫',
      [ViolationSeverity.MAJOR]: '⚠️',
      [ViolationSeverity.MINOR]: 'ℹ️'
    };

    const icon = severityIcons[result.severity] || '•';
    console.log(`${icon} ${result.message}`);
  }

  /**
   * Enforce color compliance
   */
  enforceColor(color, context = '') {
    const result = this.colorEnforcer.validateColor(color);

    if (!result.isValid) {
      this._logViolation(result);

      if (result.severity === ViolationSeverity.CRITICAL && this.strictMode) {
        if (!this.autoCorrect) {
          throw new Error(`CRITICAL COLOR VIOLATION: ${result.message}`);
        }
      }
    }

    const correctedName = (!result.isValid && this.autoCorrect)
      ? result.correctedValue
      : result.originalValue;

    let rgb;
    if (typeof correctedName === 'string' && !correctedName.startsWith('#')) {
      rgb = this.colorEnforcer.getColorRgb(correctedName);
    } else {
      rgb = typeof correctedName === 'string'
        ? this.colorEnforcer._hexToRgb(correctedName)
        : correctedName;
    }

    return { colorName: correctedName, rgb };
  }

  /**
   * Enforce typography compliance
   */
  enforceFont(fontFamily, usageType = 'body') {
    const result = this.typographyEnforcer.validateFont(fontFamily, usageType);

    if (!result.isValid) {
      this._logViolation(result);

      if (result.severity === ViolationSeverity.CRITICAL && this.strictMode) {
        if (!this.autoCorrect) {
          throw new Error(`CRITICAL FONT VIOLATION: ${result.message}`);
        }
      }
    }

    return (!result.isValid && this.autoCorrect)
      ? result.correctedValue
      : result.originalValue;
  }

  /**
   * Enforce text frame bounds to prevent cutoffs
   */
  enforceTextFrame(x, y, width, height, pageWidth = 612, pageHeight = 792) {
    const result = this.spacingEnforcer.validateTextFrameBounds(
      x, y, width, height, pageWidth, pageHeight
    );

    if (!result.isValid) {
      this._logViolation(result);
    }

    const corrected = (!result.isValid && this.autoCorrect)
      ? result.correctedValue
      : result.originalValue;

    return {
      x,
      y,
      width: corrected.width,
      height: corrected.height
    };
  }

  /**
   * Enforce that metrics don't contain placeholders
   */
  enforceMetrics(text) {
    const result = this.contentEnforcer.validateMetrics(text);

    if (!result.isValid) {
      this._logViolation(result);

      if (this.strictMode) {
        throw new Error(`PLACEHOLDER DETECTED: ${result.message}`);
      }
    }

    return text;
  }

  /**
   * Enforce text completeness
   */
  enforceTextCompleteness(text) {
    const result = this.contentEnforcer.validateTextCompleteness(text);

    if (!result.isValid) {
      this._logViolation(result);

      if (this.strictMode) {
        throw new Error(`TEXT CUTOFF: ${result.message}`);
      }
    }

    return text;
  }

  /**
   * Enforce logo clearspace
   */
  enforceLogoClearspace(logoBounds, nearbyElements) {
    const result = this.logoEnforcer.validateLogoClearspace(logoBounds, nearbyElements);

    if (!result.isValid) {
      this._logViolation(result);
    }

    return result.isValid;
  }

  /**
   * Get complete typography specification for an element
   */
  getTypeSpec(elementType) {
    const spec = this.typographyEnforcer.getTypeSpec(elementType);
    const { colorName, rgb } = this.enforceColor(spec.color, `${elementType} color`);

    return {
      font: spec.font,
      size: spec.size,
      lineHeight: spec.lineHeight,
      color: colorName,
      colorRgb: rgb
    };
  }

  /**
   * Get standard spacing value
   */
  getSpacing(spacingType) {
    return this.spacingEnforcer.getSpacingValue(spacingType);
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    const critical = this.violationsLog.filter(v => v.severity === ViolationSeverity.CRITICAL);
    const major = this.violationsLog.filter(v => v.severity === ViolationSeverity.MAJOR);
    const minor = this.violationsLog.filter(v => v.severity === ViolationSeverity.MINOR);

    const totalViolations = this.violationsLog.length;
    let score = 100 - (critical.length * 20 + major.length * 5 + minor.length * 1);
    score = Math.max(0, score);

    return {
      totalViolations,
      critical: critical.length,
      major: major.length,
      minor: minor.length,
      score,
      grade: this._getGrade(score),
      violations: this.violationsLog
    };
  }

  /**
   * Convert score to letter grade
   */
  _getGrade(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Print formatted compliance report
   */
  printReport() {
    const report = this.generateReport();

    console.log();
    console.log('='.repeat(80));
    console.log('BRAND COMPLIANCE REPORT');
    console.log('='.repeat(80));
    console.log(`\nTotal Violations: ${report.totalViolations}`);
    console.log(`  🚫 Critical: ${report.critical}`);
    console.log(`  ⚠️  Major: ${report.major}`);
    console.log(`  ℹ️  Minor: ${report.minor}`);
    console.log(`\nCompliance Score: ${report.score}/100`);
    console.log(`Grade: ${report.grade}`);
    console.log();

    if (report.score >= 95) {
      console.log('🌟 WORLD-CLASS! Document meets all brand standards!');
    } else if (report.score >= 85) {
      console.log('✅ EXCELLENT! Minor improvements possible.');
    } else if (report.score >= 70) {
      console.log('⚠️  GOOD. Some violations need attention.');
    } else {
      console.log('❌ NEEDS WORK. Critical violations must be fixed.');
    }

    console.log('='.repeat(80));
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BrandEnforcer, ViolationSeverity };
}

// CLI usage
if (require.main === module) {
  console.log('\n🧪 TESTING BRAND ENFORCEMENT\n');

  const enforcer = new BrandEnforcer({ strictMode: true, autoCorrect: true });

  // Test 1: Color enforcement
  console.log('Test 1: Color Enforcement');
  console.log('-'.repeat(40));
  try {
    const { colorName, rgb } = enforcer.enforceColor('#C87137', 'header');
    console.log(`Corrected to: ${colorName} RGB[${rgb.join(', ')}]`);
  } catch (e) {
    console.log(`Blocked: ${e.message}`);
  }
  console.log();

  // Test 2: Font enforcement
  console.log('Test 2: Font Enforcement');
  console.log('-'.repeat(40));
  try {
    const font = enforcer.enforceFont('Arial', 'headline');
    console.log(`Corrected to: ${font}`);
  } catch (e) {
    console.log(`Blocked: ${e.message}`);
  }
  console.log();

  // Test 3: Metrics validation
  console.log('Test 3: Metrics Validation');
  console.log('-'.repeat(40));
  try {
    const text = enforcer.enforceMetrics('XX Students Reached');
  } catch (e) {
    console.log(`Blocked: ${e.message}`);
  }
  console.log();

  // Test 4: Text completeness
  console.log('Test 4: Text Completeness');
  console.log('-'.repeat(40));
  try {
    const text = enforcer.enforceTextCompleteness('Ready to Transform Educa-');
  } catch (e) {
    console.log(`Blocked: ${e.message}`);
  }
  console.log();

  // Test 5: Type specification
  console.log('Test 5: Type Specification');
  console.log('-'.repeat(40));
  const spec = enforcer.getTypeSpec('documentTitle');
  console.log('Document Title Spec:', JSON.stringify(spec, null, 2));
  console.log();

  // Generate final report
  enforcer.printReport();
}
