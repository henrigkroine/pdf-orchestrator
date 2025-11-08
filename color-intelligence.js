/**
 * TEEI Color Intelligence System
 *
 * Intelligent color harmony system for TEEI brand compliance
 * - Automatically selects optimal color combinations from TEEI palette
 * - Calculates contrast ratios for accessibility (WCAG AA/AAA)
 * - Applies strategic color blocking based on content type
 * - Prevents forbidden colors automatically
 * - Generates color overlays and gradients
 *
 * @version 1.0.0
 * @author Claude Code
 * @date 2025-11-08
 */

const fs = require('fs');
const path = require('path');

// Load configuration files
const brandConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'brand-compliance-config.json'), 'utf8')
);
const harmonyConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'color-harmony-config.json'), 'utf8')
);

/**
 * Color Intelligence Engine
 */
class ColorIntelligence {
  constructor() {
    this.brandColors = brandConfig.colors.official;
    this.forbiddenColors = brandConfig.colors.forbidden;
    this.neutralColors = brandConfig.colors.neutral;
    this.documentSchemes = harmonyConfig.document_schemes;
    this.accessibilityMatrix = harmonyConfig.accessibility_matrix;
    this.harmonyRules = harmonyConfig.color_theory.harmony_rules;
  }

  /**
   * Get complete color information for a TEEI color
   * @param {string} colorName - Name of TEEI color (e.g., 'nordshore')
   * @returns {object} Complete color data including hex, rgb, cmyk, accessibility
   */
  getColor(colorName) {
    const color = this.brandColors[colorName] || this.neutralColors[colorName];
    if (!color) {
      throw new Error(`Color '${colorName}' not found in TEEI palette`);
    }
    return color;
  }

  /**
   * Get hex value for a color
   * @param {string} colorName - Name of TEEI color
   * @returns {string} Hex color value (e.g., '#00393F')
   */
  getHex(colorName) {
    return this.getColor(colorName).hex;
  }

  /**
   * Get RGB values for a color
   * @param {string} colorName - Name of TEEI color
   * @returns {object} RGB values {r, g, b}
   */
  getRGB(colorName) {
    return this.getColor(colorName).rgb;
  }

  /**
   * Get CMYK values for a color (for print)
   * @param {string} colorName - Name of TEEI color
   * @returns {object} CMYK values {c, m, y, k}
   */
  getCMYK(colorName) {
    return this.getColor(colorName).cmyk;
  }

  /**
   * Calculate contrast ratio between two colors
   * @param {string} color1 - First color name
   * @param {string} color2 - Second color name
   * @returns {object} Contrast ratio and WCAG compliance
   */
  getContrastRatio(color1, color2) {
    const rgb1 = this.getRGB(color1);
    const rgb2 = this.getRGB(color2);

    const luminance = (rgb) => {
      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = luminance(rgb1);
    const l2 = luminance(rgb2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: Math.round(ratio * 10) / 10,
      wcag_aa_normal: ratio >= 4.5,
      wcag_aa_large: ratio >= 3.0,
      wcag_aaa: ratio >= 7.0,
      passes_minimum: ratio >= 4.5
    };
  }

  /**
   * Check if a color combination is accessible
   * @param {string} textColor - Text color name
   * @param {string} bgColor - Background color name
   * @param {string} textSize - 'normal' or 'large'
   * @returns {object} Accessibility validation result
   */
  validateAccessibility(textColor, bgColor, textSize = 'normal') {
    const contrast = this.getContrastRatio(textColor, bgColor);
    const required = textSize === 'large' ? 3.0 : 4.5;

    return {
      textColor,
      bgColor,
      textSize,
      contrast: contrast.ratio,
      required,
      passes: contrast.ratio >= required,
      wcag_level: contrast.wcag_aaa ? 'AAA' : (contrast.wcag_aa_normal ? 'AA' : 'Fail'),
      recommendation: contrast.ratio >= required
        ? 'Accessible - safe to use'
        : `Low contrast (${contrast.ratio}). Use ${textSize === 'large' ? 'larger' : 'bolder'} text or choose different colors.`
    };
  }

  /**
   * Get safe text color for a background
   * @param {string} bgColor - Background color name
   * @returns {string} Best contrasting text color
   */
  getSafeTextColor(bgColor) {
    const safeCombos = this.accessibilityMatrix.safe_combinations;
    const match = safeCombos.find(combo => combo.background === bgColor);

    if (match) return match.text;

    // Fallback: test white vs black
    const whiteContrast = this.getContrastRatio('white', bgColor);
    const blackContrast = this.getContrastRatio('black', bgColor);

    return whiteContrast.ratio > blackContrast.ratio ? 'white' : 'black';
  }

  /**
   * Validate if a color is allowed in TEEI brand
   * @param {string} hexColor - Hex color to validate
   * @returns {object} Validation result
   */
  validateColor(hexColor) {
    hexColor = hexColor.toUpperCase();

    // Check if it's a TEEI official color
    const officialColor = Object.values(this.brandColors).find(
      color => color.hex.toUpperCase() === hexColor
    );
    if (officialColor) {
      return {
        valid: true,
        type: 'official',
        name: officialColor.name,
        message: `✅ Official TEEI color: ${officialColor.name}`
      };
    }

    // Check if it's a neutral color
    const neutralColor = Object.values(this.neutralColors).find(
      color => color.hex.toUpperCase() === hexColor
    );
    if (neutralColor) {
      return {
        valid: true,
        type: 'neutral',
        name: neutralColor.name,
        message: `✅ Neutral color: ${neutralColor.name}`
      };
    }

    // Check if it's a forbidden color
    for (const [key, forbidden] of Object.entries(this.forbiddenColors)) {
      if (forbidden.hex_patterns.some(pattern =>
        pattern.toUpperCase() === hexColor
      )) {
        return {
          valid: false,
          type: 'forbidden',
          name: forbidden.name,
          message: `❌ FORBIDDEN: ${forbidden.name}. Reason: ${forbidden.reason}`,
          exception: forbidden.acceptable_exception
        };
      }
    }

    // Unknown color - not in TEEI palette
    return {
      valid: false,
      type: 'unknown',
      message: `⚠️ Color ${hexColor} not in TEEI brand palette. Use official TEEI colors only.`,
      suggestion: this.findClosestTEEIColor(hexColor)
    };
  }

  /**
   * Find closest TEEI color to a given hex color
   * @param {string} hexColor - Target hex color
   * @returns {object} Closest TEEI color
   */
  findClosestTEEIColor(hexColor) {
    const targetRGB = this.hexToRGB(hexColor);
    let closestColor = null;
    let minDistance = Infinity;

    for (const [name, color] of Object.entries(this.brandColors)) {
      const distance = this.colorDistance(targetRGB, color.rgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = { name, ...color };
      }
    }

    return {
      name: closestColor.name,
      hex: closestColor.hex,
      message: `Closest TEEI color: ${closestColor.name} (${closestColor.hex})`
    };
  }

  /**
   * Calculate Euclidean distance between two RGB colors
   * @private
   */
  colorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  /**
   * Convert hex to RGB
   * @private
   */
  hexToRGB(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16)
    };
  }

  /**
   * Get document-specific color scheme
   * @param {string} documentType - Type of document (partnership_document, program_overview, etc.)
   * @returns {object} Complete color scheme with blocking strategy
   */
  getDocumentScheme(documentType) {
    const scheme = this.documentSchemes[documentType];
    if (!scheme) {
      throw new Error(
        `Document type '${documentType}' not found. Available types: ${Object.keys(this.documentSchemes).join(', ')}`
      );
    }

    // Enrich scheme with actual color values
    return {
      ...scheme,
      colors: {
        primary: this.getColor(scheme.primary_color),
        secondary: scheme.secondary_colors.map(name => ({
          name,
          ...this.getColor(name)
        })),
        accent: scheme.accent_colors.map(name => ({
          name,
          ...this.getColor(name)
        })),
        background: scheme.background_colors.map(name => ({
          name,
          ...this.getColor(name)
        }))
      }
    };
  }

  /**
   * Apply color scheme to document elements
   * @param {string} documentType - Type of document
   * @param {object} elements - Document elements to style
   * @returns {object} Styled elements with color values
   */
  applyColorScheme(documentType, elements = {}) {
    const scheme = this.getDocumentScheme(documentType);
    const styled = {};

    // Apply header colors
    if (elements.header) {
      const headerScheme = scheme.color_blocking.header;
      styled.header = {
        backgroundColor: this.getHex(headerScheme.background),
        textColor: this.getHex(headerScheme.text),
        accentColor: this.getHex(headerScheme.accent),
        ...elements.header
      };
    }

    // Apply hero section colors
    if (elements.hero && scheme.color_blocking.hero_section) {
      const heroScheme = scheme.color_blocking.hero_section;
      styled.hero = {
        backgroundColor: this.getHex(heroScheme.background),
        textColor: this.getHex(heroScheme.text),
        accentColor: this.getHex(heroScheme.accent),
        overlay: heroScheme.image_overlay ? {
          color: this.getHex(heroScheme.image_overlay.color),
          opacity: heroScheme.image_overlay.opacity
        } : null,
        ...elements.hero
      };
    }

    // Apply metrics colors
    if (elements.metrics && scheme.color_blocking.metrics) {
      const metricsScheme = scheme.color_blocking.metrics;
      styled.metrics = {
        backgroundColor: this.getHex(metricsScheme.background),
        cardBackgrounds: metricsScheme.card_backgrounds.map(color => this.getHex(color)),
        textColor: this.getHex(metricsScheme.numbers),
        accentColor: metricsScheme.accent_stripes ? this.getHex(metricsScheme.accent_stripes) : null,
        ...elements.metrics
      };
    }

    // Apply CTA colors
    if (elements.cta && scheme.color_blocking.call_to_action) {
      const ctaScheme = scheme.color_blocking.call_to_action;
      styled.cta = {
        backgroundColor: this.getHex(ctaScheme.background),
        textColor: this.getHex(ctaScheme.text),
        button: ctaScheme.button ? {
          backgroundColor: this.getHex(ctaScheme.button.background),
          textColor: this.getHex(ctaScheme.button.text),
          hoverColor: this.getHex(ctaScheme.button.hover)
        } : null,
        ...elements.cta
      };
    }

    // Apply footer colors
    if (elements.footer && scheme.color_blocking.footer) {
      const footerScheme = scheme.color_blocking.footer;
      styled.footer = {
        backgroundColor: this.getHex(footerScheme.background),
        textColor: this.getHex(footerScheme.text),
        accentColor: this.getHex(footerScheme.accent),
        ...elements.footer
      };
    }

    return styled;
  }

  /**
   * Generate image overlay
   * @param {string} overlayType - Type of overlay (dark_overlay, light_overlay, gradient_overlay)
   * @returns {object} Overlay configuration with colors
   */
  generateOverlay(overlayType) {
    const overlays = harmonyConfig.overlay_configurations.image_overlays;
    const overlay = overlays[overlayType];

    if (!overlay) {
      throw new Error(
        `Overlay type '${overlayType}' not found. Available types: ${Object.keys(overlays).join(', ')}`
      );
    }

    const result = { ...overlay };

    if (overlay.color) {
      result.hexColor = this.getHex(overlay.color);
      result.rgbaColor = this.getRGBAString(overlay.color, overlay.opacity_range[0]);
    }

    if (overlay.colors) {
      result.hexColors = overlay.colors.map(c =>
        c === 'transparent' ? 'transparent' : this.getHex(c)
      );
    }

    return result;
  }

  /**
   * Get RGBA color string
   * @param {string} colorName - TEEI color name
   * @param {number} opacity - Opacity value (0-1)
   * @returns {string} RGBA color string
   */
  getRGBAString(colorName, opacity = 1) {
    const rgb = this.getRGB(colorName);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }

  /**
   * Get CSS gradient string
   * @param {object} gradientConfig - Gradient configuration
   * @returns {string} CSS gradient string
   */
  getCSSGradient(gradientConfig) {
    const { colors, direction, opacity } = gradientConfig;

    const colorStops = colors.map((color, index) => {
      if (color === 'transparent') return 'transparent';
      const alpha = opacity !== undefined ? opacity : 1;
      return this.getRGBAString(color, alpha);
    });

    return `linear-gradient(${direction}, ${colorStops.join(', ')})`;
  }

  /**
   * Get complementary color harmony
   * @param {string} baseColor - Base TEEI color
   * @returns {array} Complementary colors
   */
  getComplementaryColors(baseColor) {
    const complementary = this.harmonyRules.complementary.teei_pairs;
    const pair = complementary.find(p => p.includes(baseColor));
    return pair ? pair.filter(c => c !== baseColor) : [];
  }

  /**
   * Get analogous color harmony
   * @param {string} baseColor - Base TEEI color
   * @returns {array} Analogous colors
   */
  getAnalogousColors(baseColor) {
    const analogous = this.harmonyRules.analogous.teei_groups;
    const group = analogous.find(g => g.includes(baseColor));
    return group ? group.filter(c => c !== baseColor) : [];
  }

  /**
   * Get triadic color harmony
   * @param {string} baseColor - Base TEEI color
   * @returns {array} Triadic colors
   */
  getTriadicColors(baseColor) {
    const triadic = this.harmonyRules.triadic.teei_groups;
    const group = triadic.find(g => g.includes(baseColor));
    return group ? group.filter(c => c !== baseColor) : [];
  }

  /**
   * Generate complete color palette for a document
   * @param {string} documentType - Type of document
   * @returns {object} Complete palette with all color values
   */
  generatePalette(documentType) {
    const scheme = this.getDocumentScheme(documentType);
    const palette = {
      documentType,
      name: scheme.name,
      description: scheme.description,
      primary: {
        name: scheme.primary_color,
        hex: this.getHex(scheme.primary_color),
        rgb: this.getRGB(scheme.primary_color),
        cmyk: this.getCMYK(scheme.primary_color)
      },
      secondary: scheme.secondary_colors.map(name => ({
        name,
        hex: this.getHex(name),
        rgb: this.getRGB(name),
        cmyk: this.getCMYK(name)
      })),
      accent: scheme.accent_colors.map(name => ({
        name,
        hex: this.getHex(name),
        rgb: this.getRGB(name),
        cmyk: this.getCMYK(name)
      })),
      background: scheme.background_colors.map(name => ({
        name,
        hex: this.getHex(name),
        rgb: this.getRGB(name),
        cmyk: this.getCMYK(name)
      })),
      usageDistribution: scheme.usage_distribution,
      colorBlocking: scheme.color_blocking
    };

    return palette;
  }

  /**
   * Export color scheme as CSS variables
   * @param {string} documentType - Type of document
   * @returns {string} CSS custom properties
   */
  exportCSSVariables(documentType) {
    const palette = this.generatePalette(documentType);
    const css = [':root {'];

    // Primary colors
    css.push(`  /* Primary */`);
    css.push(`  --teei-primary: ${palette.primary.hex};`);
    css.push(`  --teei-primary-rgb: ${palette.primary.rgb.r}, ${palette.primary.rgb.g}, ${palette.primary.rgb.b};`);

    // Secondary colors
    css.push(`\n  /* Secondary */`);
    palette.secondary.forEach((color, i) => {
      css.push(`  --teei-secondary-${i + 1}: ${color.hex};`);
      css.push(`  --teei-${color.name}: ${color.hex};`);
    });

    // Accent colors
    css.push(`\n  /* Accent */`);
    palette.accent.forEach((color, i) => {
      css.push(`  --teei-accent-${i + 1}: ${color.hex};`);
      css.push(`  --teei-${color.name}: ${color.hex};`);
    });

    // Background colors
    css.push(`\n  /* Backgrounds */`);
    palette.background.forEach((color, i) => {
      css.push(`  --teei-bg-${i + 1}: ${color.hex};`);
    });

    css.push('}');
    return css.join('\n');
  }

  /**
   * Export color scheme as InDesign swatch XML
   * @param {string} documentType - Type of document
   * @returns {string} InDesign swatch XML
   */
  exportInDesignSwatches(documentType) {
    const palette = this.generatePalette(documentType);
    const swatches = [];

    const addSwatch = (color) => {
      const cmyk = color.cmyk;
      return `    <Swatch Self="${color.name}" Name="${color.name}" ColorModel="Process" Space="CMYK">
      <ColorValue>${cmyk.c} ${cmyk.m} ${cmyk.y} ${cmyk.k}</ColorValue>
    </Swatch>`;
    };

    swatches.push('<?xml version="1.0" encoding="UTF-8"?>');
    swatches.push('<Swatches>');
    swatches.push(addSwatch(palette.primary));
    palette.secondary.forEach(color => swatches.push(addSwatch(color)));
    palette.accent.forEach(color => swatches.push(addSwatch(color)));
    swatches.push('</Swatches>');

    return swatches.join('\n');
  }

  /**
   * Validate entire document color usage
   * @param {array} usedColors - Array of hex colors used in document
   * @returns {object} Validation report
   */
  validateDocumentColors(usedColors) {
    const report = {
      totalColors: usedColors.length,
      validColors: [],
      invalidColors: [],
      forbiddenColors: [],
      warnings: [],
      passes: true
    };

    usedColors.forEach(hex => {
      const validation = this.validateColor(hex);

      if (validation.valid) {
        report.validColors.push({ hex, ...validation });
      } else {
        report.passes = false;
        if (validation.type === 'forbidden') {
          report.forbiddenColors.push({ hex, ...validation });
        } else {
          report.invalidColors.push({ hex, ...validation });
        }
      }
    });

    // Check if nordshore is primary color (should be 40-80% usage)
    const nordshorePct = usedColors.filter(
      hex => hex.toUpperCase() === this.getHex('nordshore').toUpperCase()
    ).length / usedColors.length;

    if (nordshorePct < 0.40) {
      report.warnings.push(
        `Nordshore usage is ${(nordshorePct * 100).toFixed(1)}%, should be 40-80% (primary brand color)`
      );
    }

    return report;
  }

  /**
   * Get usage recommendations for a color
   * @param {string} colorName - TEEI color name
   * @returns {object} Usage recommendations
   */
  getColorUsageRecommendations(colorName) {
    const color = this.getColor(colorName);
    const psychology = harmonyConfig.color_theory.color_psychology[colorName];

    return {
      name: color.name,
      hex: color.hex,
      usage: color.usage,
      recommendedPercentage: color.recommended_usage_percentage,
      pairsWith: color.pairs_well_with,
      psychology: psychology || null,
      accessibility: color.accessibility,
      overlayRange: color.overlay_opacity_range || null
    };
  }
}

// Export singleton instance
const colorIntelligence = new ColorIntelligence();
module.exports = colorIntelligence;

// Export class for advanced usage
module.exports.ColorIntelligence = ColorIntelligence;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
TEEI Color Intelligence System
==============================

Usage:
  node color-intelligence.js <command> [options]

Commands:
  palette <type>              Generate color palette for document type
  validate <hex>              Validate if color is allowed
  contrast <color1> <color2>  Calculate contrast ratio
  scheme <type>               Get complete color scheme
  css <type>                  Export CSS variables
  swatches <type>             Export InDesign swatches

Document Types:
  - partnership_document      Premium partnership materials
  - program_overview          Community-focused program materials
  - impact_report             Data-rich reports
  - executive_summary         High-level summaries

Examples:
  node color-intelligence.js palette partnership_document
  node color-intelligence.js validate "#C87137"
  node color-intelligence.js contrast nordshore white
  node color-intelligence.js css partnership_document
    `);
    process.exit(0);
  }

  const command = args[0];

  try {
    switch (command) {
      case 'palette':
        const palette = colorIntelligence.generatePalette(args[1]);
        console.log(JSON.stringify(palette, null, 2));
        break;

      case 'validate':
        const validation = colorIntelligence.validateColor(args[1]);
        console.log(validation.message);
        if (validation.suggestion) {
          console.log(validation.suggestion.message);
        }
        process.exit(validation.valid ? 0 : 1);
        break;

      case 'contrast':
        const contrast = colorIntelligence.getContrastRatio(args[1], args[2]);
        console.log(`Contrast ratio: ${contrast.ratio}:1`);
        console.log(`WCAG AA (normal): ${contrast.wcag_aa_normal ? '✅ Pass' : '❌ Fail'}`);
        console.log(`WCAG AA (large): ${contrast.wcag_aa_large ? '✅ Pass' : '❌ Fail'}`);
        console.log(`WCAG AAA: ${contrast.wcag_aaa ? '✅ Pass' : '❌ Fail'}`);
        break;

      case 'scheme':
        const scheme = colorIntelligence.getDocumentScheme(args[1]);
        console.log(JSON.stringify(scheme, null, 2));
        break;

      case 'css':
        const css = colorIntelligence.exportCSSVariables(args[1]);
        console.log(css);
        break;

      case 'swatches':
        const swatches = colorIntelligence.exportInDesignSwatches(args[1]);
        console.log(swatches);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}
