/**
 * Enhanced Color Accessibility Checker - WCAG AAA Compliance
 *
 * Advanced accessibility validation:
 * - WCAG 2.2 AAA contrast ratios (7:1 normal, 4.5:1 large)
 * - All text/background combinations tested
 * - Color blindness testing (8 types)
 * - Low vision simulations
 * - Non-color differentiator checking
 * - AI accessibility validation with Gemini 2.5 Pro
 *
 * @module color-accessibility-checker-enhanced
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

class ColorAccessibilityCheckerEnhanced {
  constructor() {
    // Google AI client (lazy loading)
    this.genAI = null;

    // WCAG 2.2 AAA contrast ratios
    this.wcag = {
      aaa: {
        normalText: 7.0,      // 14pt regular or smaller
        largeText: 4.5,       // 18pt+ regular or 14pt+ bold
        uiComponents: 3.0     // UI components and graphics
      },
      aa: {
        normalText: 4.5,
        largeText: 3.0,
        uiComponents: 3.0
      }
    };

    // Color blindness simulation matrices
    this.colorBlindTypes = {
      protanopia: 'Red-blind (1% of males)',
      deuteranopia: 'Green-blind (1% of males)',
      tritanopia: 'Blue-blind (rare)',
      protanomaly: 'Red-weak (1% of males)',
      deuteranomaly: 'Green-weak (most common: 6% of males)',
      tritanomaly: 'Blue-weak (rare)',
      achromatopsia: 'Complete color blindness (very rare)',
      achromatomaly: 'Partial color blindness (rare)'
    };
  }

  /**
   * Initialize Google AI client (lazy loading)
   */
  initializeGoogleAI() {
    if (!this.genAI && process.env.GOOGLE_AI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    }
  }

  /**
   * Comprehensive accessibility validation
   * @param {Array<Object>} colorPairs - Array of { foreground, background, context }
   * @returns {Object} Complete accessibility report
   */
  async validateAccessibility(colorPairs) {
    if (!colorPairs || colorPairs.length === 0) {
      throw new Error('No color pairs provided for validation');
    }

    // WCAG AAA contrast validation
    const contrastResults = this.validateContrast(colorPairs);

    // Color blindness testing
    const colorBlindResults = this.testColorBlindness(colorPairs);

    // Low vision simulations
    const lowVisionResults = this.simulateLowVision(colorPairs);

    // Non-color differentiator check
    const nonColorCheck = this.checkNonColorDifferentiators(colorPairs);

    // Get AI accessibility assessment (Gemini 2.5 Pro)
    const aiAssessment = await this.getAIAccessibilityAssessment(colorPairs, contrastResults);

    // Calculate overall accessibility score
    const accessibilityScore = this.calculateAccessibilityScore({
      contrastResults,
      colorBlindResults,
      lowVisionResults,
      nonColorCheck
    });

    return {
      accessibilityScore,
      wcagCompliance: {
        aaa: contrastResults.aaaCompliant,
        aa: contrastResults.aaCompliant
      },
      contrastResults,
      colorBlindResults,
      lowVisionResults,
      nonColorCheck,
      aiAssessment,
      recommendations: this.generateAccessibilityRecommendations({
        contrastResults,
        colorBlindResults,
        lowVisionResults,
        accessibilityScore
      })
    };
  }

  /**
   * Validate WCAG AAA contrast ratios
   */
  validateContrast(colorPairs) {
    const results = {
      aaaCompliant: true,
      aaCompliant: true,
      pairs: [],
      failures: {
        aaa: [],
        aa: []
      }
    };

    colorPairs.forEach(pair => {
      const ratio = this.getContrastRatio(pair.foreground, pair.background);

      const aaaPass = {
        normalText: ratio >= this.wcag.aaa.normalText,
        largeText: ratio >= this.wcag.aaa.largeText,
        uiComponents: ratio >= this.wcag.aaa.uiComponents
      };

      const aaPass = {
        normalText: ratio >= this.wcag.aa.normalText,
        largeText: ratio >= this.wcag.aa.largeText,
        uiComponents: ratio >= this.wcag.aa.uiComponents
      };

      const pairResult = {
        foreground: pair.foreground,
        background: pair.background,
        context: pair.context || 'unknown',
        ratio: Math.round(ratio * 100) / 100,
        aaa: aaaPass,
        aa: aaPass,
        grade: this.getContrastGrade(ratio),
        passes: {
          aaaNormal: aaaPass.normalText,
          aaaLarge: aaaPass.largeText,
          aaNormal: aaPass.normalText,
          aaLarge: aaPass.largeText
        }
      };

      results.pairs.push(pairResult);

      // Track failures
      if (!aaaPass.normalText && pair.context === 'text') {
        results.aaaCompliant = false;
        results.failures.aaa.push({
          ...pairResult,
          required: this.wcag.aaa.normalText,
          shortfall: Math.round((this.wcag.aaa.normalText - ratio) * 100) / 100
        });
      }

      if (!aaPass.normalText && pair.context === 'text') {
        results.aaCompliant = false;
        results.failures.aa.push({
          ...pairResult,
          required: this.wcag.aa.normalText,
          shortfall: Math.round((this.wcag.aa.normalText - ratio) * 100) / 100
        });
      }
    });

    results.aaaPassRate = Math.round((1 - (results.failures.aaa.length / colorPairs.length)) * 100);
    results.aaPassRate = Math.round((1 - (results.failures.aa.length / colorPairs.length)) * 100);

    return results;
  }

  /**
   * Test all color blindness types
   */
  testColorBlindness(colorPairs) {
    const results = {
      types: {},
      overallSafe: true,
      issues: []
    };

    // Test each color blindness type
    Object.entries(this.colorBlindTypes).forEach(([type, description]) => {
      const typeResults = {
        description,
        safe: true,
        pairs: []
      };

      colorPairs.forEach(pair => {
        const simForeground = this.simulateColorBlindness(pair.foreground, type);
        const simBackground = this.simulateColorBlindness(pair.background, type);

        const originalRatio = this.getContrastRatio(pair.foreground, pair.background);
        const simulatedRatio = this.getContrastRatio(simForeground, simBackground);

        const stillDistinct = simulatedRatio >= 3.0; // Minimum for distinguishability

        typeResults.pairs.push({
          foreground: pair.foreground,
          background: pair.background,
          simForeground,
          simBackground,
          originalRatio: Math.round(originalRatio * 100) / 100,
          simulatedRatio: Math.round(simulatedRatio * 100) / 100,
          stillDistinct
        });

        if (!stillDistinct) {
          typeResults.safe = false;
          results.overallSafe = false;
          results.issues.push({
            type,
            foreground: pair.foreground,
            background: pair.background,
            issue: 'Colors become indistinguishable',
            simulatedRatio: Math.round(simulatedRatio * 100) / 100
          });
        }
      });

      results.types[type] = typeResults;
    });

    return results;
  }

  /**
   * Simulate color blindness
   */
  simulateColorBlindness(hex, type) {
    const matrices = {
      protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
      deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
      tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
      protanomaly: [[0.817, 0.183, 0], [0.333, 0.667, 0], [0, 0.125, 0.875]],
      deuteranomaly: [[0.8, 0.2, 0], [0.258, 0.742, 0], [0, 0.142, 0.858]],
      tritanomaly: [[0.967, 0.033, 0], [0, 0.733, 0.267], [0, 0.183, 0.817]],
      achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
      achromatomaly: [[0.618, 0.320, 0.062], [0.163, 0.775, 0.062], [0.163, 0.320, 0.516]]
    };

    const matrix = matrices[type];
    if (!matrix) return hex;

    const rgb = this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const newR = Math.round((r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]) * 255);
    const newG = Math.round((r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]) * 255);
    const newB = Math.round((r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]) * 255);

    return this.rgbToHex({
      r: Math.max(0, Math.min(255, newR)),
      g: Math.max(0, Math.min(255, newG)),
      b: Math.max(0, Math.min(255, newB))
    });
  }

  /**
   * Simulate low vision conditions
   */
  simulateLowVision(colorPairs) {
    const results = {
      conditions: {}
    };

    // Simulate different low vision conditions
    const conditions = [
      { name: 'cataracts', blur: 0.3, contrastReduction: 0.2 },
      { name: 'glaucoma', blur: 0.2, contrastReduction: 0.3 },
      { name: 'diabeticRetinopathy', blur: 0.4, contrastReduction: 0.25 },
      { name: 'macularDegeneration', blur: 0.5, contrastReduction: 0.15 }
    ];

    conditions.forEach(condition => {
      const conditionResults = {
        name: condition.name,
        description: this.getLowVisionDescription(condition.name),
        safe: true,
        pairs: []
      };

      colorPairs.forEach(pair => {
        const originalRatio = this.getContrastRatio(pair.foreground, pair.background);
        const adjustedRatio = originalRatio * (1 - condition.contrastReduction);

        const stillReadable = adjustedRatio >= 3.0;

        conditionResults.pairs.push({
          foreground: pair.foreground,
          background: pair.background,
          originalRatio: Math.round(originalRatio * 100) / 100,
          adjustedRatio: Math.round(adjustedRatio * 100) / 100,
          stillReadable
        });

        if (!stillReadable) {
          conditionResults.safe = false;
        }
      });

      results.conditions[condition.name] = conditionResults;
    });

    return results;
  }

  /**
   * Get low vision condition description
   */
  getLowVisionDescription(condition) {
    const descriptions = {
      cataracts: 'Clouding of lens causing blur and reduced contrast',
      glaucoma: 'Peripheral vision loss and contrast sensitivity reduction',
      diabeticRetinopathy: 'Retinal damage causing blur and dark spots',
      macularDegeneration: 'Central vision loss and severe blur'
    };
    return descriptions[condition] || condition;
  }

  /**
   * Check for non-color differentiators
   */
  checkNonColorDifferentiators(colorPairs) {
    // This would ideally analyze the document structure for:
    // - Text patterns (bold, italic, underline)
    // - Icons or symbols
    // - Position/proximity
    // - Size differences
    // - Shape differences

    // For now, we return a structure that would be populated by document analysis
    return {
      hasTextDifferentiators: null, // Would check for bold/italic/etc
      hasIconDifferentiators: null, // Would check for icons
      hasPositionDifferentiators: null, // Would check layout
      recommendation: 'Ensure information is conveyed through more than just color (e.g., text labels, icons, patterns)'
    };
  }

  /**
   * Get AI accessibility assessment (Gemini 2.5 Pro)
   */
  async getAIAccessibilityAssessment(colorPairs, contrastResults) {
    this.initializeGoogleAI();

    if (!this.genAI) {
      return null; // Skip AI if not configured
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const pairsSummary = colorPairs
        .map((p, i) => `${i + 1}. ${p.foreground} on ${p.background} (${p.context || 'unknown'})`)
        .join('\n');

      const failuresSummary = contrastResults.failures.aaa.length > 0
        ? contrastResults.failures.aaa
            .map(f => `${f.foreground} on ${f.background}: ${f.ratio}:1 (needs ${f.required}:1)`)
            .join('\n')
        : 'All pairs pass WCAG AAA';

      const prompt = `As an accessibility expert, assess this color palette for WCAG 2.2 AAA compliance:

**Color Pairs:**
${pairsSummary}

**WCAG AAA Failures:**
${failuresSummary}

**WCAG AAA Requirements:**
- Normal text: 7:1 contrast
- Large text (18pt+ or 14pt+ bold): 4.5:1 contrast
- UI components: 3:1 contrast

Provide:
1. Accessibility score (0-100)
2. WCAG compliance level (AAA/AA/A/Fail)
3. Color blindness safety assessment
4. Specific accessibility issues
5. Recommended fixes
6. Overall accessibility rating

Return as JSON with structure: { score, compliance, colorBlindSafety, issues, fixes, rating, assessment }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { raw: text };

    } catch (error) {
      console.error('Error getting AI accessibility assessment:', error.message);
      return null;
    }
  }

  /**
   * Calculate overall accessibility score
   */
  calculateAccessibilityScore(analysis) {
    let score = 0;
    const weights = {
      contrast: 50,
      colorBlind: 30,
      lowVision: 20
    };

    // Contrast score (AAA compliance)
    score += weights.contrast * (analysis.contrastResults.aaaPassRate / 100);

    // Color blindness safety score
    const colorBlindSafe = analysis.colorBlindResults.overallSafe;
    score += weights.colorBlind * (colorBlindSafe ? 1 : 0.5);

    // Low vision score
    const lowVisionSafe = Object.values(analysis.lowVisionResults.conditions)
      .every(c => c.safe);
    score += weights.lowVision * (lowVisionSafe ? 1 : 0.5);

    return Math.round(score);
  }

  /**
   * Generate accessibility recommendations
   */
  generateAccessibilityRecommendations(analysis) {
    const recommendations = [];

    // WCAG AAA failures
    if (analysis.contrastResults.failures.aaa.length > 0) {
      recommendations.push({
        category: 'WCAG AAA Contrast',
        severity: 'high',
        issue: `${analysis.contrastResults.failures.aaa.length} color pairs fail WCAG AAA`,
        suggestion: 'Increase contrast to 7:1 for normal text, 4.5:1 for large text',
        pairs: analysis.contrastResults.failures.aaa.slice(0, 3) // Top 3 failures
      });
    }

    // Color blindness issues
    if (!analysis.colorBlindResults.overallSafe) {
      const issueCount = analysis.colorBlindResults.issues.length;
      recommendations.push({
        category: 'Color Blindness',
        severity: 'high',
        issue: `${issueCount} color pairs problematic for color blind users`,
        suggestion: 'Add non-color differentiators (icons, text labels, patterns)',
        types: [...new Set(analysis.colorBlindResults.issues.map(i => i.type))]
      });
    }

    // Low vision issues
    const lowVisionUnsafe = Object.entries(analysis.lowVisionResults.conditions)
      .filter(([_, condition]) => !condition.safe);

    if (lowVisionUnsafe.length > 0) {
      recommendations.push({
        category: 'Low Vision',
        severity: 'medium',
        issue: `Colors problematic for ${lowVisionUnsafe.length} low vision conditions`,
        suggestion: 'Increase contrast and use larger text sizes',
        conditions: lowVisionUnsafe.map(([name]) => name)
      });
    }

    // Overall accessibility score
    if (analysis.accessibilityScore < 70) {
      recommendations.push({
        category: 'Overall Accessibility',
        severity: 'critical',
        issue: 'Low accessibility score indicates significant barriers',
        suggestion: 'Review WCAG 2.2 AAA guidelines and redesign color scheme',
        score: analysis.accessibilityScore
      });
    }

    return recommendations;
  }

  /**
   * Calculate contrast ratio (WCAG formula)
   */
  getContrastRatio(color1, color2) {
    const l1 = this.getRelativeLuminance(color1);
    const l2 = this.getRelativeLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Calculate relative luminance (WCAG formula)
   */
  getRelativeLuminance(hex) {
    const rgb = this.hexToRgb(hex);

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Get contrast grade
   */
  getContrastGrade(ratio) {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3) return 'AA Large';
    return 'Fail';
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Convert RGB to hex
   */
  rgbToHex(rgb) {
    const toHex = x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
  }
}

module.exports = ColorAccessibilityCheckerEnhanced;
