/**
 * Color Accessibility Checker
 *
 * Advanced WCAG contrast checking:
 * - WCAG 2.1 Level AA and AAA compliance
 * - Color blindness simulation (8 types)
 * - Suggest accessible alternatives
 * - Generate accessible palette variations
 *
 * @module color-accessibility
 */

class ColorAccessibility {
  constructor() {
    // WCAG 2.1 contrast ratios
    this.wcag = {
      aa: {
        normalText: 4.5,
        largeText: 3.0
      },
      aaa: {
        normalText: 7.0,
        largeText: 4.5
      }
    };

    // Color blindness simulation matrices
    this.colorBlindMatrices = {
      protanopia: [  // Red-blind
        [0.567, 0.433, 0, 0, 0],
        [0.558, 0.442, 0, 0, 0],
        [0, 0.242, 0.758, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      deuteranopia: [  // Green-blind
        [0.625, 0.375, 0, 0, 0],
        [0.7, 0.3, 0, 0, 0],
        [0, 0.3, 0.7, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      tritanopia: [  // Blue-blind
        [0.95, 0.05, 0, 0, 0],
        [0, 0.433, 0.567, 0, 0],
        [0, 0.475, 0.525, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      protanomaly: [  // Red-weak
        [0.817, 0.183, 0, 0, 0],
        [0.333, 0.667, 0, 0, 0],
        [0, 0.125, 0.875, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      deuteranomaly: [  // Green-weak
        [0.8, 0.2, 0, 0, 0],
        [0.258, 0.742, 0, 0, 0],
        [0, 0.142, 0.858, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      tritanomaly: [  // Blue-weak
        [0.967, 0.033, 0, 0, 0],
        [0, 0.733, 0.267, 0, 0],
        [0, 0.183, 0.817, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      achromatopsia: [  // Complete color blindness
        [0.299, 0.587, 0.114, 0, 0],
        [0.299, 0.587, 0.114, 0, 0],
        [0.299, 0.587, 0.114, 0, 0],
        [0, 0, 0, 1, 0]
      ],
      achromatomaly: [  // Partial color blindness
        [0.618, 0.320, 0.062, 0, 0],
        [0.163, 0.775, 0.062, 0, 0],
        [0.163, 0.320, 0.516, 0, 0],
        [0, 0, 0, 1, 0]
      ]
    };
  }

  /**
   * Check contrast ratio between two colors
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @returns {Object} Contrast analysis
   */
  checkContrast(foreground, background) {
    const ratio = this.getContrastRatio(foreground, background);

    return {
      ratio: Math.round(ratio * 100) / 100,
      aa: {
        normalText: ratio >= this.wcag.aa.normalText,
        largeText: ratio >= this.wcag.aa.largeText
      },
      aaa: {
        normalText: ratio >= this.wcag.aaa.normalText,
        largeText: ratio >= this.wcag.aaa.largeText
      },
      grade: this.getContrastGrade(ratio),
      recommendation: this.getContrastRecommendation(ratio)
    };
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
   * Get contrast recommendation
   */
  getContrastRecommendation(ratio) {
    if (ratio >= 7) {
      return 'Excellent! Passes WCAG AAA for all text sizes.';
    } else if (ratio >= 4.5) {
      return 'Good! Passes WCAG AA for normal text, AAA for large text.';
    } else if (ratio >= 3) {
      return 'Acceptable for large text only (18pt+ or 14pt+ bold).';
    } else {
      return 'Insufficient contrast. Adjust colors to meet WCAG standards.';
    }
  }

  /**
   * Simulate color blindness
   * @param {string} color - Color in hex
   * @param {string} type - Type of color blindness
   * @returns {string} Simulated color (hex)
   */
  simulateColorBlindness(color, type) {
    const matrix = this.colorBlindMatrices[type];
    if (!matrix) {
      throw new Error(`Unknown color blindness type: ${type}`);
    }

    const rgb = this.hexToRgb(color);
    const result = this.applyColorMatrix(rgb, matrix);

    return this.rgbToHex(result);
  }

  /**
   * Apply color transformation matrix
   */
  applyColorMatrix(rgb, matrix) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const newR = Math.round((r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]) * 255);
    const newG = Math.round((r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]) * 255);
    const newB = Math.round((r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]) * 255);

    return {
      r: Math.max(0, Math.min(255, newR)),
      g: Math.max(0, Math.min(255, newG)),
      b: Math.max(0, Math.min(255, newB))
    };
  }

  /**
   * Test palette against all color blindness types
   */
  testPaletteAccessibility(colors) {
    const results = {
      original: colors,
      simulations: {},
      issues: [],
      distinctiveness: {}
    };

    // Test each type of color blindness
    Object.keys(this.colorBlindMatrices).forEach(type => {
      results.simulations[type] = colors.map(color =>
        this.simulateColorBlindness(color, type)
      );

      // Check if colors remain distinct
      const distinctiveness = this.checkDistinctiveness(
        results.simulations[type]
      );

      results.distinctiveness[type] = distinctiveness;

      if (distinctiveness.similarPairs.length > 0) {
        results.issues.push({
          type: type,
          issue: 'Colors become too similar',
          pairs: distinctiveness.similarPairs,
          severity: 'high'
        });
      }
    });

    // Check contrast for all pairs
    results.contrastMatrix = this.generateContrastMatrix(colors);

    return results;
  }

  /**
   * Check if colors remain distinct
   */
  checkDistinctiveness(colors, threshold = 30) {
    const similarPairs = [];

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const distance = this.getColorDistance(colors[i], colors[j]);

        if (distance < threshold) {
          similarPairs.push({
            color1: colors[i],
            color2: colors[j],
            distance: Math.round(distance),
            distinct: false
          });
        }
      }
    }

    return {
      distinct: similarPairs.length === 0,
      similarPairs: similarPairs,
      avgDistance: this.getAvgColorDistance(colors)
    };
  }

  /**
   * Calculate color distance (Delta E)
   */
  getColorDistance(color1, color2) {
    const lab1 = this.rgbToLab(this.hexToRgb(color1));
    const lab2 = this.rgbToLab(this.hexToRgb(color2));

    const dL = lab1.l - lab2.l;
    const dA = lab1.a - lab2.a;
    const dB = lab1.b - lab2.b;

    return Math.sqrt(dL * dL + dA * dA + dB * dB);
  }

  /**
   * Get average color distance in palette
   */
  getAvgColorDistance(colors) {
    let totalDistance = 0;
    let pairs = 0;

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        totalDistance += this.getColorDistance(colors[i], colors[j]);
        pairs++;
      }
    }

    return pairs > 0 ? Math.round(totalDistance / pairs) : 0;
  }

  /**
   * Generate contrast matrix for palette
   */
  generateContrastMatrix(colors) {
    const matrix = [];

    colors.forEach((color1, i) => {
      const row = [];

      colors.forEach((color2, j) => {
        if (i === j) {
          row.push({ ratio: 1, grade: 'N/A' });
        } else {
          const ratio = this.getContrastRatio(color1, color2);
          row.push({
            ratio: Math.round(ratio * 100) / 100,
            grade: this.getContrastGrade(ratio)
          });
        }
      });

      matrix.push(row);
    });

    return matrix;
  }

  /**
   * Suggest accessible alternative for color
   */
  suggestAccessibleAlternative(foreground, background, targetRatio = 4.5) {
    const currentRatio = this.getContrastRatio(foreground, background);

    if (currentRatio >= targetRatio) {
      return {
        needed: false,
        current: foreground,
        ratio: currentRatio
      };
    }

    // Try adjusting lightness
    const fgHsl = this.hexToHSL(foreground);
    const bgLuminance = this.getRelativeLuminance(background);

    let newForeground;

    if (bgLuminance > 0.5) {
      // Light background, darken foreground
      newForeground = this.adjustLightness(fgHsl, -10, targetRatio, background);
    } else {
      // Dark background, lighten foreground
      newForeground = this.adjustLightness(fgHsl, +10, targetRatio, background);
    }

    return {
      needed: true,
      original: foreground,
      suggested: newForeground,
      originalRatio: Math.round(currentRatio * 100) / 100,
      newRatio: Math.round(this.getContrastRatio(newForeground, background) * 100) / 100,
      adjustment: 'lightness'
    };
  }

  /**
   * Adjust lightness to meet contrast ratio
   */
  adjustLightness(hsl, direction, targetRatio, background, maxIterations = 20) {
    let adjusted = { ...hsl };
    let iterations = 0;

    while (iterations < maxIterations) {
      const hex = this.hslToHex(adjusted);
      const ratio = this.getContrastRatio(hex, background);

      if (ratio >= targetRatio) {
        return hex;
      }

      adjusted.l += direction;

      // Clamp to valid range
      if (adjusted.l <= 0 || adjusted.l >= 100) {
        break;
      }

      iterations++;
    }

    return this.hslToHex(adjusted);
  }

  /**
   * Generate accessible palette variation
   */
  generateAccessiblePalette(colors, background = '#FFFFFF') {
    return colors.map(color => {
      const suggestion = this.suggestAccessibleAlternative(color, background);
      return suggestion.needed ? suggestion.suggested : color;
    });
  }

  /**
   * Convert RGB to LAB color space
   */
  rgbToLab(rgb) {
    // Convert RGB to XYZ
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    return {
      l: (116 * y) - 16,
      a: 500 * (x - y),
      b: 200 * (y - z)
    };
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

  /**
   * Convert hex to HSL
   */
  hexToHSL(hex) {
    const rgb = this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert HSL to hex
   */
  hslToHex(hsl) {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /**
   * Generate comprehensive accessibility report
   */
  generateReport(palette, background = '#FFFFFF') {
    return {
      summary: {
        totalColors: palette.length,
        wcagAA: this.checkAllContrasts(palette, background, 4.5),
        wcagAAA: this.checkAllContrasts(palette, background, 7.0),
        colorBlindSafe: this.isColorBlindSafe(palette)
      },
      colorBlindness: this.testPaletteAccessibility(palette),
      suggestions: palette.map(color =>
        this.suggestAccessibleAlternative(color, background)
      ),
      contrastMatrix: this.generateContrastMatrix([...palette, background])
    };
  }

  /**
   * Check if all colors meet contrast ratio
   */
  checkAllContrasts(colors, background, minRatio) {
    return colors.every(color =>
      this.getContrastRatio(color, background) >= minRatio
    );
  }

  /**
   * Check if palette is color blind safe
   */
  isColorBlindSafe(colors) {
    const types = Object.keys(this.colorBlindMatrices);

    return types.every(type => {
      const simulated = colors.map(color =>
        this.simulateColorBlindness(color, type)
      );
      const distinctiveness = this.checkDistinctiveness(simulated);
      return distinctiveness.distinct;
    });
  }
}

module.exports = ColorAccessibility;
