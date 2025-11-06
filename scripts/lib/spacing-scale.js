/**
 * Spacing Scale
 *
 * Provides harmonious spacing scales for consistent layouts
 *
 * Features:
 * - Modular scale generation
 * - Golden ratio scaling
 * - Fibonacci sequence
 * - Type scale integration
 * - Responsive scaling
 *
 * @module spacing-scale
 */

class SpacingScale {
  constructor(config = {}) {
    this.config = {
      baseUnit: config.baseUnit || 8,
      ratio: config.ratio || 1.618, // Golden ratio by default
      ...config
    };

    // Common scale ratios
    this.ratios = {
      minorSecond: 1.067,
      majorSecond: 1.125,
      minorThird: 1.2,
      majorThird: 1.25,
      perfectFourth: 1.333,
      augmentedFourth: 1.414,
      perfectFifth: 1.5,
      goldenRatio: 1.618,
      majorSixth: 1.667,
      minorSeventh: 1.778,
      majorSeventh: 1.875,
      octave: 2.0,
      majorTenth: 2.5,
      majorEleventh: 2.667,
      majorTwelfth: 3.0,
      doubleOctave: 4.0
    };

    // Fibonacci sequence
    this.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  }

  /**
   * Get standard spacing scale
   * @param {number} base - Base unit (default 8)
   * @returns {Object} Spacing scale
   */
  getScale(base = this.config.baseUnit) {
    return {
      xs: base,           // 8pt
      sm: base * 1.5,     // 12pt
      md: base * 2,       // 16pt
      lg: base * 3,       // 24pt
      xl: base * 5,       // 40pt
      xxl: base * 8,      // 64pt
      xxxl: base * 13     // 104pt
    };
  }

  /**
   * Get modular scale
   * @param {number} base - Base value
   * @param {number} ratio - Scale ratio
   * @param {number} steps - Number of steps
   * @returns {Array} Scale values
   */
  getModularScale(base = this.config.baseUnit, ratio = this.config.ratio, steps = 10) {
    const scale = [];

    for (let i = -3; i <= steps; i++) {
      const value = base * Math.pow(ratio, i);
      scale.push({
        step: i,
        value: Math.round(value),
        pixels: Math.round(value) + 'px',
        points: Math.round(value) + 'pt',
        rem: (value / 16).toFixed(3) + 'rem'
      });
    }

    return scale;
  }

  /**
   * Get golden ratio scale
   * @param {number} base - Base value
   * @returns {Object} Golden ratio scale
   */
  getGoldenScale(base = this.config.baseUnit) {
    const phi = this.ratios.goldenRatio;

    return {
      'xs': Math.round(base / (phi * phi)),      // base / φ²
      'sm': Math.round(base / phi),              // base / φ
      'md': base,                                 // base
      'lg': Math.round(base * phi),              // base × φ
      'xl': Math.round(base * phi * phi),        // base × φ²
      'xxl': Math.round(base * phi * phi * phi), // base × φ³
      'xxxl': Math.round(base * Math.pow(phi, 4)) // base × φ⁴
    };
  }

  /**
   * Get Fibonacci scale
   * @param {number} base - Base unit
   * @returns {Object} Fibonacci scale
   */
  getFibonacciScale(base = this.config.baseUnit) {
    return {
      f1: base * 1,   // 8pt
      f2: base * 1,   // 8pt
      f3: base * 2,   // 16pt
      f4: base * 3,   // 24pt
      f5: base * 5,   // 40pt
      f6: base * 8,   // 64pt
      f7: base * 13,  // 104pt
      f8: base * 21,  // 168pt
      f9: base * 34,  // 272pt
      f10: base * 55  // 440pt
    };
  }

  /**
   * Get type scale (for font sizes)
   * @param {number} base - Base font size
   * @param {string} ratio - Scale ratio name
   * @returns {Object} Type scale
   */
  getTypeScale(base = 16, ratio = 'goldenRatio') {
    const r = this.ratios[ratio] || this.ratios.goldenRatio;

    return {
      caption: Math.round(base / (r * r)),      // ~9-10pt
      small: Math.round(base / r),              // ~11-12pt
      body: base,                                // 16pt
      h6: Math.round(base * r),                 // ~18-20pt
      h5: Math.round(base * r * r),            // ~24-28pt
      h4: Math.round(base * Math.pow(r, 2.5)), // ~32-36pt
      h3: Math.round(base * Math.pow(r, 3)),   // ~42-48pt
      h2: Math.round(base * Math.pow(r, 3.5)), // ~56-64pt
      h1: Math.round(base * Math.pow(r, 4)),   // ~72-84pt
      display: Math.round(base * Math.pow(r, 5)) // ~96-120pt
    };
  }

  /**
   * Get responsive scale
   * @param {Object} breakpoints - Breakpoint definitions
   * @returns {Object} Responsive scales
   */
  getResponsiveScale(breakpoints = {}) {
    const defaultBreakpoints = {
      mobile: { base: 8, ratio: 1.414 },
      tablet: { base: 8, ratio: 1.5 },
      desktop: { base: 8, ratio: 1.618 },
      wide: { base: 10, ratio: 1.618 }
    };

    const bp = { ...defaultBreakpoints, ...breakpoints };

    const scales = {};

    for (const [name, config] of Object.entries(bp)) {
      scales[name] = this.getScale(config.base);
    }

    return scales;
  }

  /**
   * Get vertical rhythm scale
   * @param {number} baseFontSize - Base font size
   * @param {number} baseLineHeight - Base line height
   * @returns {Object} Vertical rhythm scale
   */
  getVerticalRhythmScale(baseFontSize = 16, baseLineHeight = 1.5) {
    const baseline = baseFontSize * baseLineHeight;

    return {
      baseline,
      quarter: baseline * 0.25,
      half: baseline * 0.5,
      single: baseline,
      oneHalf: baseline * 1.5,
      double: baseline * 2,
      triple: baseline * 3,
      quadruple: baseline * 4
    };
  }

  /**
   * Generate custom scale
   * @param {number} base - Base value
   * @param {Array<number>} multipliers - Custom multipliers
   * @returns {Object} Custom scale
   */
  generateCustomScale(base, multipliers) {
    const scale = {};

    multipliers.forEach((mult, index) => {
      const key = `step${index + 1}`;
      scale[key] = Math.round(base * mult);
    });

    return scale;
  }

  /**
   * Get TEEI brand spacing scale
   * @returns {Object} TEEI-specific spacing
   */
  getTeeiScale() {
    const base = 8; // 8pt baseline grid

    return {
      // Micro spacing (within elements)
      micro: {
        xs: base,        // 8pt - Minimal spacing
        sm: base * 1.5,  // 12pt - Comfortable spacing
        md: base * 2,    // 16pt - Standard spacing
        lg: base * 3     // 24pt - Generous spacing
      },

      // Macro spacing (between sections)
      macro: {
        sm: base * 5,    // 40pt - Between related sections
        md: base * 8,    // 64pt - Between major sections
        lg: base * 13,   // 104pt - Between page sections
        xl: base * 21    // 168pt - Page breaks
      },

      // Document structure
      document: {
        pageMargins: base * 5,      // 40pt - Standard page margins
        sectionMargins: base * 8,    // 64pt - Between major sections
        elementSpacing: base * 3,    // 24pt - Between elements
        paragraphSpacing: base * 2,  // 16pt - Between paragraphs
        lineSpacing: base * 1.5      // 12pt - Line-height base (1.5 × 8pt)
      },

      // Typography
      typography: {
        letterSpacing: {
          tight: -0.025,    // -2.5% for large headlines
          normal: 0,        // Normal letter spacing
          loose: 0.05       // +5% for small caps
        },
        wordSpacing: {
          tight: -0.05,     // Tight word spacing
          normal: 0,        // Normal
          loose: 0.1        // Loose (10% extra)
        }
      },

      // Layout grid
      grid: {
        columns: 12,
        gutter: base * 2.5,  // 20pt
        margin: base * 5     // 40pt
      }
    };
  }

  /**
   * Calculate spacing for specific context
   * @param {string} context - Context (header, section, element, etc.)
   * @returns {number} Recommended spacing
   */
  getContextualSpacing(context) {
    const teeiScale = this.getTeeiScale();

    const contextMap = {
      // Document structure
      'page-margin': teeiScale.document.pageMargins,
      'section': teeiScale.document.sectionMargins,
      'element': teeiScale.document.elementSpacing,
      'paragraph': teeiScale.document.paragraphSpacing,

      // Between specific element types
      'heading-text': teeiScale.micro.lg,
      'text-text': teeiScale.document.paragraphSpacing,
      'text-image': teeiScale.micro.lg,
      'image-image': teeiScale.micro.lg,
      'section-section': teeiScale.macro.md,

      // Grid
      'grid-gutter': teeiScale.grid.gutter,
      'grid-margin': teeiScale.grid.margin
    };

    return contextMap[context] || teeiScale.document.elementSpacing;
  }

  /**
   * Validate spacing value
   * @param {number} value - Spacing value to validate
   * @returns {Object} Validation result
   */
  validateSpacing(value) {
    const base = this.config.baseUnit;

    const isOnGrid = value % base === 0;
    const nearestGrid = Math.round(value / base) * base;
    const difference = Math.abs(value - nearestGrid);

    return {
      value,
      isOnGrid,
      nearestGrid,
      difference,
      recommendation: isOnGrid ?
        'Spacing aligns with baseline grid' :
        `Consider using ${nearestGrid}pt for grid alignment`
    };
  }

  /**
   * Snap value to grid
   * @param {number} value - Value to snap
   * @param {number} base - Grid base unit
   * @returns {number} Snapped value
   */
  snapToGrid(value, base = this.config.baseUnit) {
    return Math.round(value / base) * base;
  }

  /**
   * Generate spacing tokens (for design systems)
   * @param {string} format - Output format (css, scss, json)
   * @returns {string} Spacing tokens
   */
  generateTokens(format = 'css') {
    const scale = this.getScale();

    switch (format) {
      case 'css':
        return this.generateCSSTokens(scale);
      case 'scss':
        return this.generateSCSSTokens(scale);
      case 'json':
        return JSON.stringify(scale, null, 2);
      default:
        return scale;
    }
  }

  /**
   * Generate CSS custom properties
   */
  generateCSSTokens(scale) {
    let css = ':root {\n';

    for (const [name, value] of Object.entries(scale)) {
      css += `  --spacing-${name}: ${value}px;\n`;
    }

    css += '}';

    return css;
  }

  /**
   * Generate SCSS variables
   */
  generateSCSSTokens(scale) {
    let scss = '// Spacing Scale\n';

    for (const [name, value] of Object.entries(scale)) {
      scss += `$spacing-${name}: ${value}px;\n`;
    }

    return scss;
  }

  /**
   * Get all available ratios
   * @returns {Object} All scale ratios
   */
  getAllRatios() {
    return { ...this.ratios };
  }

  /**
   * Compare scales
   * @param {string} ratio1 - First ratio name
   * @param {string} ratio2 - Second ratio name
   * @param {number} base - Base value
   * @returns {Object} Comparison
   */
  compareScales(ratio1, ratio2, base = this.config.baseUnit) {
    const scale1 = this.getModularScale(base, this.ratios[ratio1], 5);
    const scale2 = this.getModularScale(base, this.ratios[ratio2], 5);

    return {
      ratio1: {
        name: ratio1,
        value: this.ratios[ratio1],
        scale: scale1
      },
      ratio2: {
        name: ratio2,
        value: this.ratios[ratio2],
        scale: scale2
      },
      recommendation: this.recommendScale(this.ratios[ratio1], this.ratios[ratio2])
    };
  }

  /**
   * Recommend scale based on use case
   */
  recommendScale(r1, r2) {
    if (r1 < 1.2) {
      return 'Subtle scale - good for text-heavy layouts';
    } else if (r1 < 1.5) {
      return 'Moderate scale - versatile for most layouts';
    } else if (r1 < 1.7) {
      return 'Strong scale - good for clear visual hierarchy';
    } else {
      return 'Dramatic scale - use for bold, impactful designs';
    }
  }
}

module.exports = SpacingScale;
