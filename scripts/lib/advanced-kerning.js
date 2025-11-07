/**
 * Advanced Kerning System
 *
 * Provides optical kerning adjustments for professional typography:
 * - Character pair optimization (AV, To, We, etc.)
 * - Optical metrics calculations
 * - Ligature recommendations
 * - Micro-typography perfection
 *
 * @module advanced-kerning
 */

class AdvancedKerning {
  constructor() {
    // Character pairs that typically need kerning adjustment
    // Values in 1/1000 em units (InDesign standard)
    this.kerningPairs = {
      // Capital + lowercase
      'Av': -80, 'Aw': -70, 'Ay': -70,
      'AV': -120, 'AW': -90, 'AY': -100, 'AT': -80,

      // T combinations
      'Ta': -80, 'Te': -80, 'To': -80, 'Tu': -80,
      'TA': -100, 'Te': -80, 'Ti': -60, 'To': -80,
      'Ty': -80, 'Tr': -60,

      // F combinations
      'Fa': -60, 'Fe': -60, 'Fo': -60,
      'FA': -80, 'Fe': -60, 'Fi': -40, 'Fo': -60,

      // L combinations
      'LV': -100, 'LW': -80, 'LY': -100, 'LT': -80,
      'La': -20, 'Le': -20, 'Lo': -20,

      // P combinations
      'Pa': -60, 'Pe': -60, 'Po': -60,
      'PA': -80, 'Pe': -60, 'Pi': -40, 'Po': -60,

      // V combinations
      'Va': -80, 'Ve': -80, 'Vi': -60, 'Vo': -80,
      'VA': -120, 'Ve': -80, 'Vi': -60, 'Vo': -80,

      // W combinations
      'Wa': -70, 'We': -70, 'Wi': -50, 'Wo': -70,
      'WA': -100, 'We': -70, 'Wi': -50, 'Wo': -70,

      // Y combinations
      'Ya': -80, 'Ye': -80, 'Yi': -60, 'Yo': -80,
      'YA': -100, 'Ye': -80, 'Yi': -60, 'Yo': -80,

      // Quote combinations
      "'A": -100, "'a": -60,
      '"A': -100, '"a': -60,

      // Punctuation combinations
      '.A': -80, ',A': -80,
      '.T': -60, ',T': -60,
      '.V': -80, ',V': -80,
      '.W': -70, ',W': -70,
      '.Y': -80, ',Y': -80,

      // Colon combinations
      ':A': -40, ':T': -40, ':V': -40,

      // Dash combinations
      '-T': -60, '-V': -60, '-W': -60, '-Y': -60,

      // Number combinations
      '1/': -20, '7.': -80, '7,': -80
    };

    // Ligatures to recommend
    this.ligatures = {
      standard: ['fi', 'fl', 'ff', 'ffi', 'ffl'],
      discretionary: ['ct', 'st', 'sp'],
      historical: ['st', 'ct', 'tz']
    };

    // Optical size adjustments
    this.opticalSizes = {
      caption: { min: 0, max: 8 },    // < 8pt
      small: { min: 8, max: 13 },     // 8-13pt
      regular: { min: 13, max: 24 },  // 13-24pt
      display: { min: 24, max: 72 },  // 24-72pt
      poster: { min: 72, max: 999 }   // > 72pt
    };
  }

  /**
   * Calculate kerning adjustment for character pair
   * @param {string} char1 - First character
   * @param {string} char2 - Second character
   * @param {number} fontSize - Font size in points
   * @returns {number} Kerning adjustment in 1/1000 em
   */
  getKerningPair(char1, char2, fontSize = 16) {
    const pair = char1 + char2;
    let kerning = this.kerningPairs[pair] || 0;

    // Scale kerning for display sizes (reduce for larger text)
    if (fontSize >= 48) {
      kerning = Math.round(kerning * 0.7);
    } else if (fontSize >= 24) {
      kerning = Math.round(kerning * 0.85);
    }

    return kerning;
  }

  /**
   * Analyze text for kerning opportunities
   * @param {string} text - Text to analyze
   * @param {number} fontSize - Font size in points
   * @returns {Object} Kerning analysis
   */
  analyzeText(text, fontSize = 16) {
    const pairs = [];
    const recommendations = [];

    for (let i = 0; i < text.length - 1; i++) {
      const char1 = text[i];
      const char2 = text[i + 1];
      const pair = char1 + char2;
      const kerning = this.getKerningPair(char1, char2, fontSize);

      if (kerning !== 0) {
        pairs.push({
          pair: pair,
          position: i,
          kerning: kerning,
          context: text.substring(Math.max(0, i - 3), Math.min(text.length, i + 5))
        });

        if (Math.abs(kerning) >= 80) {
          recommendations.push({
            pair: pair,
            position: i,
            kerning: kerning,
            priority: 'high',
            reason: 'Significant visual gap needs adjustment'
          });
        } else if (Math.abs(kerning) >= 40) {
          recommendations.push({
            pair: pair,
            position: i,
            kerning: kerning,
            priority: 'medium',
            reason: 'Noticeable spacing improvement'
          });
        }
      }
    }

    return {
      text: text,
      fontSize: fontSize,
      totalPairs: pairs.length,
      pairs: pairs,
      recommendations: recommendations,
      ligatures: this.findLigatures(text),
      opticalSize: this.getOpticalSize(fontSize)
    };
  }

  /**
   * Find ligature opportunities in text
   * @param {string} text - Text to analyze
   * @returns {Array} Ligature recommendations
   */
  findLigatures(text) {
    const found = [];

    // Check standard ligatures
    this.ligatures.standard.forEach(lig => {
      let pos = text.indexOf(lig);
      while (pos !== -1) {
        found.push({
          ligature: lig,
          position: pos,
          type: 'standard',
          priority: 'high',
          reason: 'Standard ligature improves character spacing'
        });
        pos = text.indexOf(lig, pos + 1);
      }
    });

    // Check discretionary ligatures
    this.ligatures.discretionary.forEach(lig => {
      let pos = text.indexOf(lig);
      while (pos !== -1) {
        found.push({
          ligature: lig,
          position: pos,
          type: 'discretionary',
          priority: 'medium',
          reason: 'Optional ligature for refined typography'
        });
        pos = text.indexOf(lig, pos + 1);
      }
    });

    return found;
  }

  /**
   * Get optimal optical size for font size
   * @param {number} fontSize - Font size in points
   * @returns {string} Optical size name
   */
  getOpticalSize(fontSize) {
    for (const [name, range] of Object.entries(this.opticalSizes)) {
      if (fontSize >= range.min && fontSize < range.max) {
        return name;
      }
    }
    return 'regular';
  }

  /**
   * Generate kerning table for InDesign
   * @param {string} text - Text to kern
   * @param {number} fontSize - Font size
   * @returns {Array} InDesign kerning commands
   */
  generateInDesignKerning(text, fontSize) {
    const analysis = this.analyzeText(text, fontSize);
    const commands = [];

    analysis.pairs.forEach(pair => {
      commands.push({
        action: 'setKerning',
        position: pair.position,
        length: 2,
        value: pair.kerning,
        pair: pair.pair
      });
    });

    analysis.ligatures.forEach(lig => {
      commands.push({
        action: 'enableLigature',
        position: lig.position,
        length: lig.ligature.length,
        ligature: lig.ligature,
        type: lig.type
      });
    });

    return commands;
  }

  /**
   * Calculate optical kerning (simulates InDesign optical kerning)
   * @param {string} char1 - First character
   * @param {string} char2 - Second character
   * @param {number} fontSize - Font size
   * @returns {number} Optical kerning value
   */
  calculateOpticalKerning(char1, char2, fontSize) {
    // Get character shapes (simplified)
    const shape1 = this.getCharacterShape(char1);
    const shape2 = this.getCharacterShape(char2);

    // Calculate visual gap
    const gap = this.calculateVisualGap(shape1, shape2);

    // Adjust for font size
    const sizeAdjustment = this.getOpticalSizeAdjustment(fontSize);

    return Math.round(gap * sizeAdjustment);
  }

  /**
   * Get simplified character shape
   */
  getCharacterShape(char) {
    const shapes = {
      // Vertical shapes
      'I': 'vertical',
      'l': 'vertical',
      '1': 'vertical',
      '|': 'vertical',

      // Round shapes
      'O': 'round',
      'o': 'round',
      'C': 'round',
      'c': 'round',
      'G': 'round',
      'Q': 'round',
      '0': 'round',

      // Diagonal left (lean right)
      'A': 'diagonal-left',
      'V': 'diagonal-left',
      'W': 'diagonal-left',
      'v': 'diagonal-left',
      'w': 'diagonal-left',
      'y': 'diagonal-left',
      '7': 'diagonal-left',

      // Diagonal right (lean left)
      'Y': 'diagonal-right',

      // Open right
      'L': 'open-right',
      'F': 'open-right',
      'T': 'open-right',
      'r': 'open-right',

      // Open left
      'J': 'open-left',
      'f': 'open-left'
    };

    return shapes[char] || 'normal';
  }

  /**
   * Calculate visual gap between shapes
   */
  calculateVisualGap(shape1, shape2) {
    const gaps = {
      'diagonal-left-round': -80,
      'diagonal-left-vertical': -60,
      'open-right-round': -60,
      'open-right-diagonal-left': -80,
      'vertical-diagonal-left': -40,
      'round-diagonal-left': -40
    };

    const key = `${shape1}-${shape2}`;
    return gaps[key] || 0;
  }

  /**
   * Get optical size adjustment
   */
  getOpticalSizeAdjustment(fontSize) {
    if (fontSize < 8) return 1.2;      // More kerning for tiny text
    if (fontSize < 13) return 1.1;     // Slightly more for small text
    if (fontSize < 24) return 1.0;     // Normal
    if (fontSize < 48) return 0.85;    // Less for subheads
    return 0.7;                        // Much less for display
  }

  /**
   * Generate comprehensive kerning report
   */
  generateReport(text, fontSize) {
    const analysis = this.analyzeText(text, fontSize);

    return {
      summary: {
        text: text,
        fontSize: fontSize,
        opticalSize: analysis.opticalSize,
        totalCharacters: text.length,
        kerningPairs: analysis.totalPairs,
        ligatures: analysis.ligatures.length,
        highPriorityIssues: analysis.recommendations.filter(r => r.priority === 'high').length
      },
      analysis: analysis,
      indesignCommands: this.generateInDesignKerning(text, fontSize),
      cssCode: this.generateCSS(analysis),
      tips: this.generateKerningTips(analysis)
    };
  }

  /**
   * Generate CSS code for web
   */
  generateCSS(analysis) {
    const css = [];

    css.push('/* Kerning and ligatures */');
    css.push('.optimized-text {');
    css.push('  font-feature-settings:');
    css.push('    "kern" 1,  /* Enable kerning */');
    css.push('    "liga" 1,  /* Enable standard ligatures */');
    css.push('    "clig" 1;  /* Enable contextual ligatures */');

    if (analysis.ligatures.some(l => l.type === 'discretionary')) {
      css.push('    "dlig" 1;  /* Enable discretionary ligatures */');
    }

    css.push('}');

    return css.join('\n');
  }

  /**
   * Generate kerning tips
   */
  generateKerningTips(analysis) {
    const tips = [];

    if (analysis.recommendations.length > 5) {
      tips.push({
        tip: 'Many kerning pairs detected',
        action: 'Use optical kerning in InDesign for automatic adjustment',
        priority: 'high'
      });
    }

    if (analysis.ligatures.length > 0) {
      tips.push({
        tip: `${analysis.ligatures.length} ligature opportunities found`,
        action: 'Enable standard ligatures in typography settings',
        priority: 'high'
      });
    }

    if (analysis.fontSize >= 48) {
      tips.push({
        tip: 'Display size detected',
        action: 'Consider using display optical size variant if available',
        priority: 'medium'
      });
    }

    if (analysis.fontSize <= 8) {
      tips.push({
        tip: 'Caption size detected',
        action: 'Use caption optical size variant for better clarity',
        priority: 'high'
      });
    }

    return tips;
  }

  /**
   * Batch analyze multiple text blocks
   */
  batchAnalyze(blocks) {
    return blocks.map(block => ({
      id: block.id || `block-${blocks.indexOf(block)}`,
      text: block.text,
      fontSize: block.fontSize || 16,
      analysis: this.analyzeText(block.text, block.fontSize || 16)
    }));
  }

  /**
   * Generate kerning visualization (for HTML)
   */
  generateVisualization(text, fontSize) {
    const analysis = this.analyzeText(text, fontSize);
    const html = ['<div class="kerning-visualization">'];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (nextChar) {
        const kerning = this.getKerningPair(char, nextChar, fontSize);
        const spacing = kerning !== 0 ? ` style="letter-spacing: ${kerning / 1000}em"` : '';
        html.push(`<span${spacing}>${char}</span>`);
      } else {
        html.push(`<span>${char}</span>`);
      }
    }

    html.push('</div>');

    return html.join('');
  }
}

module.exports = AdvancedKerning;
