/**
 * Breathing Calculator
 *
 * Calculates optimal spacing and breathing room for layouts
 *
 * Features:
 * - Golden ratio spacing
 * - Fibonacci sequence spacing
 * - 8pt baseline grid
 * - Responsive spacing scales
 * - Context-aware spacing
 *
 * @module breathing-calculator
 */

class BreathingCalculator {
  constructor(config = {}) {
    this.config = {
      baseUnit: config.baseUnit || 8, // 8pt baseline grid
      useGoldenRatio: config.useGoldenRatio !== false,
      useFibonacci: config.useFibonacci !== false,
      ...config
    };

    // Golden ratio
    this.phi = 1.618033988749;

    // Fibonacci sequence for spacing
    this.fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  }

  /**
   * Calculate optimal spacing between elements
   * @param {Object} element1 - First element
   * @param {Object} element2 - Second element
   * @param {Object} context - Context information
   * @returns {number} Optimal spacing in points
   */
  calculateOptimalSpacing(element1, element2, context = {}) {
    const base = this.config.baseUnit;

    // Determine spacing based on element types
    const type1 = element1.type || 'unknown';
    const type2 = element2.type || 'unknown';

    // Get base spacing multiplier
    let multiplier = this.getSpacingMultiplier(type1, type2);

    // Adjust for context
    if (context.importance === 'high') {
      multiplier *= 1.5; // More space for important content
    } else if (context.importance === 'low') {
      multiplier *= 0.75;
    }

    // Adjust for visual weight
    if (element1.weight === 'heavy' || element2.weight === 'heavy') {
      multiplier *= 1.25; // Heavy elements need more breathing room
    }

    // Calculate spacing
    let spacing = base * multiplier;

    // Round to nearest baseline grid unit
    spacing = Math.round(spacing / base) * base;

    return spacing;
  }

  /**
   * Get spacing multiplier based on element types
   */
  getSpacingMultiplier(type1, type2) {
    const spacingMatrix = {
      'heading-heading': 8,      // 8 base units (64pt with 8pt base)
      'heading-text': 3,         // 3 base units (24pt)
      'heading-image': 4,        // 4 base units (32pt)
      'text-text': 1.5,          // 1.5 base units (12pt) - paragraph spacing
      'text-image': 3,           // 3 base units (24pt)
      'text-heading': 5,         // 5 base units (40pt)
      'image-image': 3,          // 3 base units (24pt)
      'image-text': 3,           // 3 base units (24pt)
      'section-section': 10,     // 10 base units (80pt)
      'default': 2               // 2 base units (16pt)
    };

    const key = `${type1}-${type2}`;
    const reverseKey = `${type2}-${type1}`;

    return spacingMatrix[key] || spacingMatrix[reverseKey] || spacingMatrix.default;
  }

  /**
   * Calculate golden ratio spacing
   * @param {number} baseSize - Base size to scale from
   * @returns {Object} Golden ratio spacing scale
   */
  calculateGoldenRatio(baseSize = this.config.baseUnit) {
    return {
      xs: Math.round(baseSize / (this.phi * this.phi)), // Divided by φ²
      sm: Math.round(baseSize / this.phi),              // Divided by φ
      md: baseSize,                                      // Base
      lg: Math.round(baseSize * this.phi),              // Multiplied by φ
      xl: Math.round(baseSize * this.phi * this.phi),   // Multiplied by φ²
      xxl: Math.round(baseSize * this.phi * this.phi * this.phi) // Multiplied by φ³
    };
  }

  /**
   * Calculate Fibonacci spacing scale
   * @param {number} baseUnit - Base unit (default 8pt)
   * @returns {Object} Fibonacci spacing scale
   */
  calculateFibonacciScale(baseUnit = this.config.baseUnit) {
    return {
      f1: baseUnit * 1,   // 8pt
      f2: baseUnit * 1,   // 8pt
      f3: baseUnit * 2,   // 16pt
      f4: baseUnit * 3,   // 24pt
      f5: baseUnit * 5,   // 40pt
      f6: baseUnit * 8,   // 64pt
      f7: baseUnit * 13,  // 104pt
      f8: baseUnit * 21   // 168pt
    };
  }

  /**
   * Calculate breathing room for text block
   * @param {Object} textBlock - Text block properties
   * @returns {Object} Recommended spacing around text
   */
  calculateTextBreathingRoom(textBlock) {
    const {
      fontSize = 12,
      lineHeight = 1.5,
      width = 600,
      importance = 'normal'
    } = textBlock;

    const base = this.config.baseUnit;

    // Line height in points
    const lineHeightPt = fontSize * lineHeight;

    // Calculate optimal margins
    const topMargin = this.snapToGrid(lineHeightPt * 1.5);
    const bottomMargin = this.snapToGrid(lineHeightPt * 1.5);

    // Side margins based on optimal line length
    // Optimal line length: 50-75 characters
    // If width is too wide, add side padding
    const optimalWidth = fontSize * 45; // Roughly 75 characters
    let sidePadding = 0;

    if (width > optimalWidth * 1.2) {
      sidePadding = this.snapToGrid((width - optimalWidth) / 2);
    }

    // Adjust for importance
    let multiplier = 1.0;
    if (importance === 'high') {
      multiplier = 1.5;
    } else if (importance === 'low') {
      multiplier = 0.75;
    }

    return {
      top: Math.round(topMargin * multiplier),
      right: Math.round(sidePadding * multiplier),
      bottom: Math.round(bottomMargin * multiplier),
      left: Math.round(sidePadding * multiplier),
      lineHeight: lineHeightPt,
      optimalLineLength: `50-75 characters (~${Math.round(optimalWidth)}pt)`
    };
  }

  /**
   * Calculate section breathing room
   * @param {Object} section - Section properties
   * @returns {Object} Recommended spacing for section
   */
  calculateSectionBreathingRoom(section) {
    const {
      type = 'content',
      hasHeading = true,
      elementCount = 5,
      importance = 'normal'
    } = section;

    const base = this.config.baseUnit;

    // Different spacing for different section types
    const sectionSpacing = {
      'hero': base * 10,      // 80pt
      'header': base * 8,     // 64pt
      'content': base * 6,    // 48pt
      'sidebar': base * 4,    // 32pt
      'footer': base * 5      // 40pt
    };

    const baseSpacing = sectionSpacing[type] || sectionSpacing.content;

    // Adjust for importance
    let multiplier = 1.0;
    if (importance === 'high') {
      multiplier = 1.5;
    } else if (importance === 'low') {
      multiplier = 0.75;
    }

    return {
      marginTop: Math.round(baseSpacing * multiplier),
      marginBottom: Math.round(baseSpacing * multiplier),
      paddingTop: hasHeading ? Math.round(base * 3 * multiplier) : 0,
      paddingBottom: Math.round(base * 2 * multiplier),
      internalSpacing: Math.round(base * 2 * multiplier)
    };
  }

  /**
   * Calculate margin for container
   * @param {Object} container - Container properties
   * @returns {Object} Recommended margins
   */
  calculateContainerMargins(container) {
    const {
      width = 800,
      height = 1100,
      contentDensity = 'medium',
      pageType = 'standard'
    } = container;

    const base = this.config.baseUnit;

    // Base margins
    let topMargin = base * 5;    // 40pt
    let bottomMargin = base * 5; // 40pt
    let leftMargin = base * 5;   // 40pt
    let rightMargin = base * 5;  // 40pt

    // Adjust for page type
    if (pageType === 'cover') {
      topMargin = base * 10;    // 80pt
      bottomMargin = base * 10; // 80pt
    } else if (pageType === 'compact') {
      topMargin = base * 3;     // 24pt
      bottomMargin = base * 3;  // 24pt
      leftMargin = base * 3;    // 24pt
      rightMargin = base * 3;   // 24pt
    }

    // Adjust for content density
    if (contentDensity === 'low') {
      // More margins for sparse content
      topMargin *= 1.5;
      bottomMargin *= 1.5;
      leftMargin *= 1.5;
      rightMargin *= 1.5;
    } else if (contentDensity === 'high') {
      // Tighter margins for dense content
      topMargin *= 0.8;
      bottomMargin *= 0.8;
    }

    // For very wide pages, increase side margins
    if (width > 1000) {
      const extraMargin = (width - 800) / 4;
      leftMargin += this.snapToGrid(extraMargin);
      rightMargin += this.snapToGrid(extraMargin);
    }

    return {
      top: Math.round(topMargin),
      right: Math.round(rightMargin),
      bottom: Math.round(bottomMargin),
      left: Math.round(leftMargin),
      recommendation: this.getMarginRecommendation({
        top: topMargin,
        right: rightMargin,
        bottom: bottomMargin,
        left: leftMargin
      })
    };
  }

  /**
   * Get margin recommendation
   */
  getMarginRecommendation(margins) {
    const total = margins.top + margins.bottom + margins.left + margins.right;
    const avg = total / 4;

    if (avg < 32) {
      return 'Margins are tight - consider increasing for better breathing room';
    } else if (avg > 80) {
      return 'Margins are generous - good for low-density content';
    } else {
      return 'Margins provide comfortable breathing room';
    }
  }

  /**
   * Calculate grid-based spacing
   * @param {number} baseUnit - Base unit for grid
   * @returns {Object} Grid spacing scale
   */
  calculateGridSpacing(baseUnit = this.config.baseUnit) {
    return {
      xs: baseUnit,           // 8pt
      sm: baseUnit * 1.5,     // 12pt
      md: baseUnit * 2,       // 16pt
      lg: baseUnit * 3,       // 24pt
      xl: baseUnit * 5,       // 40pt
      xxl: baseUnit * 8,      // 64pt
      xxxl: baseUnit * 13     // 104pt
    };
  }

  /**
   * Snap value to baseline grid
   * @param {number} value - Value to snap
   * @returns {number} Snapped value
   */
  snapToGrid(value) {
    const base = this.config.baseUnit;
    return Math.round(value / base) * base;
  }

  /**
   * Calculate optimal line height
   * @param {number} fontSize - Font size in points
   * @param {string} context - Usage context
   * @returns {number} Optimal line height
   */
  calculateLineHeight(fontSize, context = 'body') {
    const lineHeightMap = {
      'headline': 1.2,    // Tight for large headlines
      'subhead': 1.3,     // Slightly more for subheads
      'body': 1.5,        // Comfortable for body text
      'caption': 1.4,     // Moderate for captions
      'dense': 1.4,       // For dense content
      'spacious': 1.8     // Extra breathing room
    };

    const ratio = lineHeightMap[context] || lineHeightMap.body;
    const lineHeight = fontSize * ratio;

    // Snap to baseline grid
    return this.snapToGrid(lineHeight);
  }

  /**
   * Calculate responsive spacing
   * @param {number} viewportWidth - Viewport width
   * @param {Object} breakpoints - Responsive breakpoints
   * @returns {Object} Responsive spacing scale
   */
  calculateResponsiveSpacing(viewportWidth, breakpoints = {}) {
    const defaultBreakpoints = {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
      wide: 1440
    };

    const bp = { ...defaultBreakpoints, ...breakpoints };

    let scale = 1.0;

    if (viewportWidth < bp.mobile) {
      scale = 0.75; // Tighter spacing on small screens
    } else if (viewportWidth < bp.tablet) {
      scale = 0.85;
    } else if (viewportWidth < bp.desktop) {
      scale = 1.0;
    } else if (viewportWidth < bp.wide) {
      scale = 1.15;
    } else {
      scale = 1.3; // More generous spacing on wide screens
    }

    const base = this.config.baseUnit * scale;

    return {
      base: Math.round(base),
      scale: this.calculateGridSpacing(base),
      breakpoint: this.getCurrentBreakpoint(viewportWidth, bp)
    };
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(width, breakpoints) {
    if (width < breakpoints.mobile) return 'mobile-small';
    if (width < breakpoints.tablet) return 'mobile';
    if (width < breakpoints.desktop) return 'tablet';
    if (width < breakpoints.wide) return 'desktop';
    return 'wide';
  }

  /**
   * Calculate vertical rhythm
   * @param {number} baseFontSize - Base font size
   * @param {number} baseLineHeight - Base line height
   * @returns {Object} Vertical rhythm scale
   */
  calculateVerticalRhythm(baseFontSize = 16, baseLineHeight = 1.5) {
    const baselineUnit = baseFontSize * baseLineHeight;

    return {
      baselineUnit,
      spacing: {
        xs: baselineUnit * 0.25,  // Quarter line
        sm: baselineUnit * 0.5,   // Half line
        md: baselineUnit,         // One line
        lg: baselineUnit * 1.5,   // 1.5 lines
        xl: baselineUnit * 2,     // Two lines
        xxl: baselineUnit * 3     // Three lines
      },
      recommendation: 'All spacing should be multiples of the baseline unit for vertical rhythm'
    };
  }

  /**
   * Calculate comfortable reading width
   * @param {number} fontSize - Font size
   * @returns {Object} Optimal reading width
   */
  calculateReadingWidth(fontSize = 16) {
    // Optimal line length: 50-75 characters
    // Average character width is roughly 0.5em for most fonts

    const minChars = 50;
    const idealChars = 65;
    const maxChars = 75;

    const charWidth = fontSize * 0.5; // Approximate

    return {
      minimum: Math.round(minChars * charWidth),
      ideal: Math.round(idealChars * charWidth),
      maximum: Math.round(maxChars * charWidth),
      unit: 'pt',
      recommendation: `Keep line length between ${minChars}-${maxChars} characters for optimal readability`
    };
  }

  /**
   * Generate spacing report
   * @param {Object} layout - Layout to analyze
   * @returns {Object} Spacing report
   */
  generateSpacingReport(layout) {
    const gridScale = this.calculateGridSpacing();
    const goldenScale = this.calculateGoldenRatio();
    const fibonacciScale = this.calculateFibonacciScale();

    return {
      baseUnit: this.config.baseUnit,
      scales: {
        grid: gridScale,
        golden: goldenScale,
        fibonacci: fibonacciScale
      },
      recommendations: {
        sections: `Use ${gridScale.xxl}pt (${goldenScale.xxl}pt golden ratio) between major sections`,
        elements: `Use ${gridScale.lg}pt (${goldenScale.lg}pt golden ratio) between elements`,
        paragraphs: `Use ${gridScale.md}pt (${goldenScale.md}pt golden ratio) between paragraphs`,
        margins: `Use ${gridScale.xl}pt (${goldenScale.xl}pt golden ratio) for page margins`
      },
      principles: [
        'Maintain consistent spacing based on 8pt grid',
        'Use golden ratio for harmonious proportions',
        'Apply Fibonacci sequence for natural scaling',
        'Ensure all spacing is intentional and meaningful'
      ]
    };
  }
}

module.exports = BreathingCalculator;
