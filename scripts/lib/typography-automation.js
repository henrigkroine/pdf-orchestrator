/**
 * Advanced Typography Automation System
 *
 * Intelligent typography automation that prevents text cutoffs, optimizes readability,
 * and applies world-class typography automatically.
 *
 * Features:
 * - Content-aware font sizing (prevents cutoffs)
 * - Automatic text frame adjustment
 * - Optimal line height, kerning, tracking
 * - TEEI hierarchy application (42pt → 28pt → 11pt)
 * - Intelligent hyphenation and justification
 * - Column/page text balancing
 * - Multi-line text optimization
 *
 * @module typography-automation
 */

const fs = require('fs').promises;

// Optional dependencies (lazy loaded)
let TypographyOptimizer = null;
let TypographyHierarchy = null;

class TypographyAutomation {
  constructor(config = {}) {
    this.config = {
      // TEEI Brand Typography
      brand: 'TEEI',
      typeScale: 1.250, // Major Third
      baseSize: 11,     // TEEI body text

      // Frame safety margins (prevent cutoffs)
      framePadding: {
        left: 10,
        right: 10,
        top: 5,
        bottom: 5
      },

      // Text cutoff prevention
      preventCutoffs: true,
      cutoffThreshold: 0.95, // Start adjusting at 95% width
      minFontSizeReduction: 0.5, // Minimum pt to reduce
      maxFontSizeReduction: 6,   // Maximum pt to reduce

      // Content-aware sizing
      contentAwareSizing: true,
      charCountThresholds: {
        veryShort: 20,    // < 20 chars: can use larger sizes
        short: 50,        // < 50 chars: normal sizing
        medium: 100,      // < 100 chars: may need reduction
        long: 200,        // < 200 chars: likely needs reduction
        veryLong: 300     // > 300 chars: aggressive reduction
      },

      // Line height optimization
      autoLineHeight: true,
      lineHeightRules: {
        display: 1.0,     // 60pt+
        heading: 1.2,     // 24-60pt
        subhead: 1.3,     // 18-24pt
        body: 1.618,      // 11-18pt (golden ratio)
        caption: 1.4      // < 11pt
      },

      // Tracking (letter-spacing) optimization
      autoTracking: true,
      trackingRules: {
        display: -0.02,   // Tighten large text
        heading: -0.01,   // Slightly tight
        body: 0,          // Normal
        small: 0.01,      // Open up small text
        allCaps: 0.05     // Much more space for caps
      },

      // Hyphenation and justification
      hyphenation: {
        enabled: true,
        minWordLength: 6,
        minCharsBefore: 3,
        minCharsAfter: 3,
        hyphenationZone: '0.5in',
        consecutiveHyphens: 2
      },

      justification: {
        wordSpacing: {
          min: 80,        // 80% of normal
          desired: 100,   // 100% normal
          max: 133        // 133% of normal (InDesign default)
        },
        letterSpacing: {
          min: -5,        // -5%
          desired: 0,     // 0%
          max: 5          // +5%
        },
        glyphScaling: {
          min: 97,        // 97%
          desired: 100,   // 100%
          max: 103        // 103%
        }
      },

      // TEEI hierarchy standards
      teeiHierarchy: {
        documentTitle: {
          size: 42,
          font: 'Lora',
          weight: 'Bold',
          color: '#00393F',
          lineHeight: 1.2,
          tracking: -0.02,
          usage: 'Main document title'
        },
        sectionHeader: {
          size: 28,
          font: 'Lora',
          weight: 'SemiBold',
          color: '#00393F',
          lineHeight: 1.2,
          tracking: -0.01,
          usage: 'Section headers'
        },
        subhead: {
          size: 18,
          font: 'Roboto Flex',
          weight: 'Medium',
          color: '#00393F',
          lineHeight: 1.3,
          tracking: 0,
          usage: 'Subheadings'
        },
        bodyText: {
          size: 11,
          font: 'Roboto Flex',
          weight: 'Regular',
          color: '#333333',
          lineHeight: 1.618,
          tracking: 0,
          usage: 'Body text'
        },
        caption: {
          size: 9,
          font: 'Roboto Flex',
          weight: 'Regular',
          color: '#666666',
          lineHeight: 1.4,
          tracking: 0.01,
          usage: 'Captions'
        }
      },

      ...config
    };

    // Lazy load optional dependencies
    this.optimizer = null;

    this.results = [];
    this.stats = {
      elementsProcessed: 0,
      cutoffsPrevented: 0,
      sizesOptimized: 0,
      lineHeightsAdjusted: 0,
      trackingAdjusted: 0
    };
  }

  /**
   * Initialize optional dependencies
   */
  initializeOptimizer() {
    if (!this.optimizer) {
      try {
        if (!TypographyOptimizer) {
          TypographyOptimizer = require('./typography-optimizer');
        }
        this.optimizer = new TypographyOptimizer({
          baseSize: this.config.baseSize,
          scale: this.config.typeScale
        });
      } catch (error) {
        // Optimizer not available, continue without it
        console.log('Note: TypographyOptimizer not available (missing dependencies)');
      }
    }
  }

  /**
   * Apply automatic typography to document elements
   * @param {Array} elements - Text elements with content and constraints
   * @returns {Object} Optimized typography specifications
   */
  async applyAutomaticTypography(elements) {
    console.log('🎨 Applying automatic typography...');

    const optimizedElements = [];

    for (const element of elements) {
      const optimized = await this.optimizeElement(element);
      optimizedElements.push(optimized);
      this.stats.elementsProcessed++;
    }

    return {
      elements: optimizedElements,
      stats: this.stats,
      summary: this.generateSummary(optimizedElements)
    };
  }

  /**
   * Optimize a single text element
   */
  async optimizeElement(element) {
    const {
      content,
      type = 'body',
      frameWidth,
      frameHeight,
      currentSize,
      currentFont,
      maxLines
    } = element;

    // 1. Determine optimal hierarchy level
    const hierarchyLevel = this.determineHierarchyLevel(element);
    const baseTypography = this.config.teeiHierarchy[hierarchyLevel];

    // 2. Calculate optimal font size (prevent cutoffs)
    const optimalSize = this.calculateOptimalSize({
      content,
      baseSize: baseTypography.size,
      frameWidth,
      frameHeight,
      maxLines,
      font: baseTypography.font
    });

    // 3. Calculate optimal line height
    const lineHeight = this.calculateLineHeight(
      optimalSize.fontSize,
      hierarchyLevel
    );

    // 4. Calculate optimal tracking (letter-spacing)
    const tracking = this.calculateTracking(
      optimalSize.fontSize,
      hierarchyLevel,
      element.isAllCaps
    );

    // 5. Apply hyphenation rules
    const hyphenation = this.getHyphenationSettings(
      content,
      optimalSize.fontSize,
      frameWidth
    );

    // 6. Apply justification settings
    const justification = this.getJustificationSettings(
      hierarchyLevel,
      frameWidth
    );

    // 7. Calculate spacing
    const spacing = this.calculateSpacing(hierarchyLevel, optimalSize.fontSize);

    const result = {
      original: element,
      optimized: {
        // Typography
        font: baseTypography.font,
        weight: baseTypography.weight,
        fontSize: optimalSize.fontSize,
        lineHeight: lineHeight,
        tracking: tracking,
        color: baseTypography.color,

        // Frame adjustments
        frameWidth: optimalSize.frameWidth,
        frameHeight: optimalSize.frameHeight,
        framePadding: this.config.framePadding,

        // Advanced settings
        hyphenation: hyphenation,
        justification: justification,
        alignment: this.getAlignment(hierarchyLevel),

        // Spacing
        spacing: spacing,

        // Metadata
        hierarchyLevel: hierarchyLevel,
        adjustmentsMade: optimalSize.adjustmentsMade,
        cutoffPrevented: optimalSize.cutoffPrevented,
        confidence: optimalSize.confidence
      }
    };

    // Update stats
    if (optimalSize.cutoffPrevented) this.stats.cutoffsPrevented++;
    if (optimalSize.adjustmentsMade.includes('fontSize')) this.stats.sizesOptimized++;
    if (optimalSize.adjustmentsMade.includes('lineHeight')) this.stats.lineHeightsAdjusted++;
    if (optimalSize.adjustmentsMade.includes('tracking')) this.stats.trackingAdjusted++;

    return result;
  }

  /**
   * Determine hierarchy level from element
   */
  determineHierarchyLevel(element) {
    const type = (element.type || '').toLowerCase();

    // Direct mapping
    const typeMap = {
      'title': 'documentTitle',
      'h1': 'documentTitle',
      'h2': 'sectionHeader',
      'h3': 'subhead',
      'body': 'bodyText',
      'p': 'bodyText',
      'caption': 'caption',
      'small': 'caption'
    };

    if (typeMap[type]) return typeMap[type];

    // Infer from content length and importance
    const contentLength = (element.content || '').length;
    const importance = element.importance || 50;

    if (importance >= 90 || contentLength < 30) return 'documentTitle';
    if (importance >= 70 || contentLength < 50) return 'sectionHeader';
    if (importance >= 60 || contentLength < 100) return 'subhead';
    if (contentLength < 15) return 'caption';

    return 'bodyText';
  }

  /**
   * Calculate optimal font size (prevents cutoffs)
   */
  calculateOptimalSize({
    content,
    baseSize,
    frameWidth,
    frameHeight,
    maxLines,
    font
  }) {
    const result = {
      fontSize: baseSize,
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      adjustmentsMade: [],
      cutoffPrevented: false,
      confidence: 100
    };

    if (!this.config.preventCutoffs || !frameWidth) {
      return result;
    }

    // Calculate text metrics
    const charCount = content.length;
    const avgCharWidth = this.estimateCharWidth(font, baseSize);
    const availableWidth = frameWidth - this.config.framePadding.left - this.config.framePadding.right;

    // Estimate required width
    const estimatedWidth = charCount * avgCharWidth;

    // Check if text will fit
    const widthRatio = estimatedWidth / availableWidth;

    if (widthRatio > this.config.cutoffThreshold) {
      // Text won't fit - calculate optimal size

      // Strategy 1: Reduce font size
      let newSize = baseSize;
      const targetWidth = availableWidth * 0.95; // 95% of available width (safety margin)

      // Calculate reduction needed
      const reductionFactor = targetWidth / estimatedWidth;
      newSize = Math.round(baseSize * reductionFactor * 10) / 10;

      // Apply limits
      const maxReduction = Math.min(
        this.config.maxFontSizeReduction,
        baseSize * 0.3 // Never reduce more than 30%
      );

      if (baseSize - newSize > maxReduction) {
        newSize = baseSize - maxReduction;
      }

      if (baseSize - newSize < this.config.minFontSizeReduction) {
        // Not worth reducing, try expanding frame instead
        result.frameWidth = frameWidth * 1.1; // 10% wider
        result.adjustmentsMade.push('frameWidth');
      } else {
        result.fontSize = Math.max(newSize, 8); // Never go below 8pt
        result.adjustmentsMade.push('fontSize');
      }

      result.cutoffPrevented = true;
      result.confidence = Math.round((1 - Math.abs(widthRatio - 1)) * 100);

      console.log(`✓ Cutoff prevented: ${baseSize}pt → ${result.fontSize}pt (${charCount} chars)`);
    }

    // Check height if maxLines specified
    if (maxLines && frameHeight) {
      const lineHeight = this.calculateLineHeight(result.fontSize, 'body');
      const requiredHeight = maxLines * result.fontSize * lineHeight;

      if (requiredHeight > frameHeight * 0.95) {
        result.frameHeight = requiredHeight * 1.05; // 5% safety margin
        result.adjustmentsMade.push('frameHeight');
      }
    }

    return result;
  }

  /**
   * Estimate average character width for font
   */
  estimateCharWidth(font, fontSize) {
    // Average character widths (as proportion of font size)
    const widthFactors = {
      'Lora': 0.55,           // Serif, slightly narrow
      'Roboto Flex': 0.52,    // Sans-serif, compact
      'Roboto': 0.52,
      'Arial': 0.52,
      'Helvetica': 0.52,
      'Times': 0.50,          // Narrower serif
      'Georgia': 0.58,        // Wider serif
      'Verdana': 0.60,        // Very wide
      'default': 0.53         // Average
    };

    const fontName = font.split(' ')[0]; // Get base font name
    const factor = widthFactors[fontName] || widthFactors.default;

    return fontSize * factor;
  }

  /**
   * Calculate optimal line height
   */
  calculateLineHeight(fontSize, hierarchyLevel) {
    if (!this.config.autoLineHeight) {
      return this.config.teeiHierarchy[hierarchyLevel].lineHeight;
    }

    // Size-based line height rules
    if (fontSize >= 60) return this.config.lineHeightRules.display;
    if (fontSize >= 24) return this.config.lineHeightRules.heading;
    if (fontSize >= 18) return this.config.lineHeightRules.subhead;
    if (fontSize >= 11) return this.config.lineHeightRules.body;
    return this.config.lineHeightRules.caption;
  }

  /**
   * Calculate optimal tracking (letter-spacing)
   */
  calculateTracking(fontSize, hierarchyLevel, isAllCaps = false) {
    if (!this.config.autoTracking) {
      return this.config.teeiHierarchy[hierarchyLevel].tracking;
    }

    // All caps needs extra tracking
    if (isAllCaps) {
      return this.config.trackingRules.allCaps;
    }

    // Size-based tracking
    if (fontSize >= 48) return this.config.trackingRules.display;
    if (fontSize >= 24) return this.config.trackingRules.heading;
    if (fontSize <= 10) return this.config.trackingRules.small;
    return this.config.trackingRules.body;
  }

  /**
   * Get hyphenation settings
   */
  getHyphenationSettings(content, fontSize, frameWidth) {
    if (!this.config.hyphenation.enabled) {
      return { enabled: false };
    }

    // Disable hyphenation for very short text
    if (content.length < 50) {
      return { enabled: false };
    }

    // Disable for large text (looks bad in headlines)
    if (fontSize > 24) {
      return { enabled: false };
    }

    return {
      enabled: true,
      minWordLength: this.config.hyphenation.minWordLength,
      minCharsBefore: this.config.hyphenation.minCharsBefore,
      minCharsAfter: this.config.hyphenation.minCharsAfter,
      hyphenationZone: this.config.hyphenation.hyphenationZone,
      consecutiveHyphens: this.config.hyphenation.consecutiveHyphens
    };
  }

  /**
   * Get justification settings
   */
  getJustificationSettings(hierarchyLevel, frameWidth) {
    // Only justify body text in wide columns
    const shouldJustify = (
      hierarchyLevel === 'bodyText' &&
      frameWidth > 300 // At least 300px wide
    );

    if (!shouldJustify) {
      return { enabled: false };
    }

    return {
      enabled: true,
      wordSpacing: this.config.justification.wordSpacing,
      letterSpacing: this.config.justification.letterSpacing,
      glyphScaling: this.config.justification.glyphScaling,
      composer: 'paragraph' // Use paragraph composer for better results
    };
  }

  /**
   * Get text alignment
   */
  getAlignment(hierarchyLevel) {
    const alignments = {
      documentTitle: 'center',
      sectionHeader: 'left',
      subhead: 'left',
      bodyText: 'left',
      caption: 'left'
    };

    return alignments[hierarchyLevel] || 'left';
  }

  /**
   * Calculate spacing
   */
  calculateSpacing(hierarchyLevel, fontSize) {
    // Spacing as multipliers of font size
    const spacingRules = {
      documentTitle: {
        before: 0,
        after: 2
      },
      sectionHeader: {
        before: 3,
        after: 1.5
      },
      subhead: {
        before: 2,
        after: 1
      },
      bodyText: {
        before: 0,
        after: 1
      },
      caption: {
        before: 0,
        after: 0.5
      }
    };

    const rules = spacingRules[hierarchyLevel];

    return {
      marginTop: Math.round(fontSize * rules.before),
      marginBottom: Math.round(fontSize * rules.after),
      paragraphSpacing: Math.round(fontSize * 0.75) // 0.75em between paragraphs
    };
  }

  /**
   * Balance text across columns
   */
  balanceColumns(elements, columnCount, columnWidth, gutter) {
    console.log(`⚖️  Balancing text across ${columnCount} columns...`);

    // Calculate total text height
    const totalHeight = elements.reduce((sum, el) => {
      const lineHeight = el.optimized.fontSize * el.optimized.lineHeight;
      const lines = Math.ceil(el.original.content.length / 50); // Rough estimate
      return sum + (lines * lineHeight) + el.optimized.spacing.marginTop + el.optimized.spacing.marginBottom;
    }, 0);

    // Target height per column
    const targetHeight = totalHeight / columnCount;

    // Distribute elements across columns
    const columns = Array(columnCount).fill(null).map(() => ({
      elements: [],
      currentHeight: 0
    }));

    let currentColumn = 0;

    for (const element of elements) {
      const elementHeight = this.estimateElementHeight(element);

      // Check if we should move to next column
      if (
        currentColumn < columnCount - 1 &&
        columns[currentColumn].currentHeight + elementHeight > targetHeight * 1.2
      ) {
        currentColumn++;
      }

      columns[currentColumn].elements.push(element);
      columns[currentColumn].currentHeight += elementHeight;
    }

    return {
      columns: columns,
      balanced: this.checkColumnBalance(columns)
    };
  }

  /**
   * Estimate element height
   */
  estimateElementHeight(element) {
    const { fontSize, lineHeight, spacing } = element.optimized;
    const contentLength = element.original.content.length;
    const avgCharsPerLine = 66; // Optimal CPL
    const lines = Math.ceil(contentLength / avgCharsPerLine);

    return (lines * fontSize * lineHeight) + spacing.marginTop + spacing.marginBottom;
  }

  /**
   * Check if columns are balanced
   */
  checkColumnBalance(columns) {
    const heights = columns.map(c => c.currentHeight);
    const avgHeight = heights.reduce((sum, h) => sum + h, 0) / heights.length;
    const maxDeviation = Math.max(...heights.map(h => Math.abs(h - avgHeight)));

    // Balanced if deviation is less than 10% of average
    return maxDeviation < avgHeight * 0.1;
  }

  /**
   * Generate summary
   */
  generateSummary(elements) {
    const hierarchyDistribution = {};

    elements.forEach(el => {
      const level = el.optimized.hierarchyLevel;
      hierarchyDistribution[level] = (hierarchyDistribution[level] || 0) + 1;
    });

    return {
      totalElements: elements.length,
      hierarchyDistribution: hierarchyDistribution,
      adjustments: {
        cutoffsPrevented: this.stats.cutoffsPrevented,
        sizesOptimized: this.stats.sizesOptimized,
        lineHeightsAdjusted: this.stats.lineHeightsAdjusted,
        trackingAdjusted: this.stats.trackingAdjusted
      },
      averageConfidence: Math.round(
        elements.reduce((sum, el) => sum + el.optimized.confidence, 0) / elements.length
      )
    };
  }

  /**
   * Export as InDesign paragraph styles
   */
  exportInDesignStyles() {
    const styles = [];

    Object.entries(this.config.teeiHierarchy).forEach(([name, spec]) => {
      styles.push({
        name: name,
        fontFamily: spec.font,
        fontStyle: spec.weight,
        pointSize: spec.size,
        leading: Math.round(spec.size * spec.lineHeight),
        tracking: Math.round(spec.tracking * 1000), // InDesign uses 1/1000 em
        fillColor: spec.color,
        justification: this.getAlignment(name),
        hyphenation: spec.size <= 18,
        spaceBefore: this.calculateSpacing(name, spec.size).marginTop,
        spaceAfter: this.calculateSpacing(name, spec.size).marginBottom
      });
    });

    return styles;
  }

  /**
   * Export as CSS
   */
  exportCSS() {
    const cssRules = [];

    Object.entries(this.config.teeiHierarchy).forEach(([name, spec]) => {
      const className = name.replace(/([A-Z])/g, '-$1').toLowerCase();
      const spacing = this.calculateSpacing(name, spec.size);

      cssRules.push(`
.teei${className} {
  font-family: '${spec.font}', ${spec.font.includes('Lora') ? 'serif' : 'sans-serif'};
  font-weight: ${this.fontWeightToNumber(spec.weight)};
  font-size: ${spec.size}pt;
  line-height: ${spec.lineHeight};
  letter-spacing: ${spec.tracking}em;
  color: ${spec.color};
  margin-top: ${spacing.marginTop}pt;
  margin-bottom: ${spacing.marginBottom}pt;
  text-align: ${this.getAlignment(name)};
}
      `.trim());
    });

    return cssRules.join('\n\n');
  }

  /**
   * Convert font weight name to number
   */
  fontWeightToNumber(weightName) {
    const weights = {
      'Thin': 100,
      'ExtraLight': 200,
      'Light': 300,
      'Regular': 400,
      'Medium': 500,
      'SemiBold': 600,
      'Bold': 700,
      'ExtraBold': 800,
      'Black': 900
    };

    return weights[weightName] || 400;
  }
}

module.exports = TypographyAutomation;
