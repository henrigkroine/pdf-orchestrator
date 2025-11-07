/**
 * Color Theory Engine - AI-Powered Color Harmony System
 *
 * Generates stunning color palettes using:
 * - Color theory (complementary, split-complementary, triadic, etc.)
 * - AI refinement for emotional impact
 * - Extended palettes (tints, shades, tones)
 * - WCAG accessibility validation
 * - Professional usage guidelines
 *
 * @module color-theory-engine
 */

const OpenAI = require('openai');

class ColorTheoryEngine {
  constructor() {
    // OpenAI client (lazy loading)
    this.openai = null;

    // Color theory generators
    this.theories = {
      complementary: this.generateComplementary.bind(this),
      splitComplementary: this.generateSplitComplementary.bind(this),
      triadic: this.generateTriadic.bind(this),
      tetradic: this.generateTetradic.bind(this),
      analogous: this.generateAnalogous.bind(this),
      monochromatic: this.generateMonochromatic.bind(this)
    };

    // TEEI brand colors
    this.brandColors = {
      nordshore: '#00393F',  // Deep teal (primary)
      sky: '#C9E4EC',        // Light blue
      sand: '#FFF1E2',       // Warm neutral
      beige: '#EFE1DC',      // Soft neutral
      moss: '#65873B',       // Natural green
      gold: '#BA8F5A',       // Warm metallic
      clay: '#913B2F'        // Rich terracotta
    };

    // Cache for AI responses
    this.cache = new Map();
  }

  /**
   * Initialize OpenAI client (lazy loading)
   */
  initializeOpenAI() {
    if (!this.openai && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Generate stunning palette using color theory + AI
   * @param {string} baseColor - Base color in hex format
   * @param {string} mood - Desired mood/emotion
   * @param {string} theory - Color theory to use
   * @returns {Object} Complete color palette
   */
  async generateStunningPalette(baseColor, mood = 'warm, empowering', theory = 'splitComplementary') {
    // 1. Extract color properties
    const hsl = this.hexToHSL(baseColor);

    // 2. Apply color theory
    const theoreticalPalette = this.theories[theory](hsl);

    // 3. Use AI to refine based on mood
    const refined = await this.refineWithAI(theoreticalPalette, mood, baseColor);

    // 4. Generate extended palette (tints, shades, tones)
    const extended = this.generateExtendedPalette(refined);

    // 5. Validate contrast (WCAG AA+)
    const validated = this.validateContrast(extended);

    // 6. Generate usage guide
    const usage = this.generateUsageGuide(validated);

    return {
      base: baseColor,
      theory: theory,
      mood: mood,
      primary: validated.primary,
      secondary: validated.secondary,
      accent: validated.accent,
      neutrals: validated.neutrals,
      extended: validated.extended,
      usage: usage,
      accessibility: validated.accessibility,
      metadata: {
        generatedAt: new Date().toISOString(),
        theory: theory,
        mood: mood
      }
    };
  }

  /**
   * Complementary color scheme (opposite on color wheel)
   */
  generateComplementary(hsl) {
    const complement = (hsl.h + 180) % 360;

    return {
      primary: { h: hsl.h, s: hsl.s, l: hsl.l },
      secondary: { h: complement, s: hsl.s, l: hsl.l }
    };
  }

  /**
   * Split-complementary (base + two adjacent to complement)
   * Best for warm, harmonious palettes
   */
  generateSplitComplementary(hsl) {
    const complement = (hsl.h + 180) % 360;

    return {
      primary: { h: hsl.h, s: hsl.s, l: hsl.l },
      secondary: { h: (complement - 30 + 360) % 360, s: hsl.s * 0.8, l: hsl.l * 1.1 },
      accent: { h: (complement + 30) % 360, s: hsl.s * 0.8, l: hsl.l * 1.1 }
    };
  }

  /**
   * Triadic (three colors equally spaced on wheel)
   */
  generateTriadic(hsl) {
    return {
      primary: { h: hsl.h, s: hsl.s, l: hsl.l },
      secondary: { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
      accent: { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }
    };
  }

  /**
   * Tetradic (four colors - two complementary pairs)
   */
  generateTetradic(hsl) {
    return {
      primary: { h: hsl.h, s: hsl.s, l: hsl.l },
      secondary: { h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l },
      accent: { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l },
      accent2: { h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }
    };
  }

  /**
   * Analogous (adjacent colors on wheel)
   */
  generateAnalogous(hsl) {
    return {
      primary: { h: hsl.h, s: hsl.s, l: hsl.l },
      secondary: { h: (hsl.h + 30) % 360, s: hsl.s * 0.9, l: hsl.l },
      accent: { h: (hsl.h - 30 + 360) % 360, s: hsl.s * 0.9, l: hsl.l }
    };
  }

  /**
   * Monochromatic (variations of single hue)
   */
  generateMonochromatic(hsl) {
    return {
      primary: { h: hsl.h, s: hsl.s, l: hsl.l },
      secondary: { h: hsl.h, s: hsl.s * 0.6, l: hsl.l * 1.2 },
      accent: { h: hsl.h, s: hsl.s * 1.2, l: hsl.l * 0.8 }
    };
  }

  /**
   * Refine palette with AI for emotional impact
   */
  async refineWithAI(palette, mood, baseColor) {
    const cacheKey = `refine-${JSON.stringify(palette)}-${mood}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Initialize OpenAI if needed
    this.initializeOpenAI();

    if (!this.openai) {
      // Return palette without AI refinement
      return palette;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: `You are a color psychologist and designer expert in:
- Color theory and harmony
- Emotional impact of colors
- Cultural color associations
- WCAG accessibility
- Brand identity and color psychology

Refine color palettes for maximum visual impact and emotional resonance.`
        }, {
          role: 'user',
          content: `Refine this color palette for maximum impact:

Base Color: ${baseColor}
Current Palette (HSL):
${JSON.stringify(palette, null, 2)}

Desired Mood: ${mood}
Brand: TEEI (warm, hopeful, empowering, professional)
Context: Education nonprofit, corporate partnerships

Adjust hue/saturation/lightness for:
1. Stunning visual harmony
2. Strong emotional resonance
3. Professional appearance
4. WCAG AA accessibility
5. Print and digital effectiveness

Return refined HSL values as JSON with same structure.
Include brief explanation of adjustments.`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content);
      this.cache.set(cacheKey, result);

      return result.palette || palette;

    } catch (error) {
      console.error('Error refining with AI:', error);
      return palette; // Return original if AI fails
    }
  }

  /**
   * Generate extended palette (tints, shades, tones)
   */
  generateExtendedPalette(palette) {
    const extended = {};

    Object.entries(palette).forEach(([name, hsl]) => {
      extended[name] = {
        base: this.hslToHex(hsl),
        hsl: hsl,
        tints: this.generateTints(hsl, 5),
        shades: this.generateShades(hsl, 5),
        tones: this.generateTones(hsl, 5)
      };
    });

    // Add neutrals
    extended.neutrals = this.generateNeutrals();

    return extended;
  }

  /**
   * Generate tints (lighter versions)
   */
  generateTints(hsl, count = 5) {
    const tints = [];

    for (let i = 1; i <= count; i++) {
      const lightnessIncrease = i * (95 - hsl.l) / (count + 1);
      const saturationDecrease = i * hsl.s * 0.15 / count;

      tints.push({
        level: i,
        hsl: {
          h: hsl.h,
          s: Math.max(0, hsl.s - saturationDecrease),
          l: Math.min(95, hsl.l + lightnessIncrease)
        },
        hex: this.hslToHex({
          h: hsl.h,
          s: Math.max(0, hsl.s - saturationDecrease),
          l: Math.min(95, hsl.l + lightnessIncrease)
        }),
        name: `tint-${i}`
      });
    }

    return tints;
  }

  /**
   * Generate shades (darker versions)
   */
  generateShades(hsl, count = 5) {
    const shades = [];

    for (let i = 1; i <= count; i++) {
      const lightnessDecrease = i * hsl.l / (count + 1);

      shades.push({
        level: i,
        hsl: {
          h: hsl.h,
          s: hsl.s,
          l: Math.max(5, hsl.l - lightnessDecrease)
        },
        hex: this.hslToHex({
          h: hsl.h,
          s: hsl.s,
          l: Math.max(5, hsl.l - lightnessDecrease)
        }),
        name: `shade-${i}`
      });
    }

    return shades;
  }

  /**
   * Generate tones (grayed versions)
   */
  generateTones(hsl, count = 5) {
    const tones = [];

    for (let i = 1; i <= count; i++) {
      const saturationDecrease = i * hsl.s / (count + 1);

      tones.push({
        level: i,
        hsl: {
          h: hsl.h,
          s: Math.max(5, hsl.s - saturationDecrease),
          l: hsl.l
        },
        hex: this.hslToHex({
          h: hsl.h,
          s: Math.max(5, hsl.s - saturationDecrease),
          l: hsl.l
        }),
        name: `tone-${i}`
      });
    }

    return tones;
  }

  /**
   * Generate neutral colors
   */
  generateNeutrals() {
    return {
      white: { hex: '#FFFFFF', hsl: { h: 0, s: 0, l: 100 } },
      light: { hex: '#F5F5F5', hsl: { h: 0, s: 0, l: 96 } },
      lightGray: { hex: '#E0E0E0', hsl: { h: 0, s: 0, l: 88 } },
      gray: { hex: '#9E9E9E', hsl: { h: 0, s: 0, l: 62 } },
      darkGray: { hex: '#616161', hsl: { h: 0, s: 0, l: 38 } },
      dark: { hex: '#212121', hsl: { h: 0, s: 0, l: 13 } },
      black: { hex: '#000000', hsl: { h: 0, s: 0, l: 0 } }
    };
  }

  /**
   * Validate contrast for accessibility
   */
  validateContrast(palette) {
    const validated = { ...palette };
    validated.accessibility = {
      wcagAA: true,
      wcagAAA: true,
      issues: [],
      recommendations: []
    };

    // Check each color against white and black
    Object.entries(palette).forEach(([name, colorData]) => {
      if (name === 'neutrals') return;

      const baseHex = colorData.base;
      const contrastWhite = this.getContrastRatio(baseHex, '#FFFFFF');
      const contrastBlack = this.getContrastRatio(baseHex, '#000000');

      colorData.contrast = {
        onWhite: contrastWhite,
        onBlack: contrastBlack,
        bestBackground: contrastWhite > contrastBlack ? '#FFFFFF' : '#000000',
        wcagAA: contrastWhite >= 4.5 || contrastBlack >= 4.5,
        wcagAAA: contrastWhite >= 7 || contrastBlack >= 7
      };

      if (!colorData.contrast.wcagAA) {
        validated.accessibility.wcagAA = false;
        validated.accessibility.issues.push({
          color: name,
          issue: 'Does not meet WCAG AA (4.5:1)',
          contrastWhite: contrastWhite,
          contrastBlack: contrastBlack
        });

        // Suggest adjustment
        validated.accessibility.recommendations.push({
          color: name,
          recommendation: contrastWhite > contrastBlack ?
            'Darken color for use on white background' :
            'Lighten color for use on dark background',
          targetContrast: 4.5
        });
      }

      if (!colorData.contrast.wcagAAA) {
        validated.accessibility.wcagAAA = false;
      }
    });

    return validated;
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
   * Generate professional usage guide
   */
  generateUsageGuide(palette) {
    return {
      backgrounds: {
        light: {
          color: palette.neutrals.light.hex,
          usage: 'Primary background for light theme',
          textColor: palette.primary.base
        },
        dark: {
          color: palette.primary.shades[3].hex,
          usage: 'Primary background for dark theme',
          textColor: palette.neutrals.light.hex
        },
        accent: {
          color: palette.secondary.tints[0].hex,
          usage: 'Accent sections, callouts',
          textColor: palette.primary.base
        }
      },

      text: {
        primary: {
          color: palette.primary.shades[4]?.hex || palette.primary.base,
          usage: 'Headlines, body text',
          backgrounds: ['white', 'light backgrounds']
        },
        secondary: {
          color: palette.neutrals.darkGray.hex,
          usage: 'Supporting text, captions',
          backgrounds: ['white', 'light backgrounds']
        },
        onDark: {
          color: palette.neutrals.light.hex,
          usage: 'Text on dark backgrounds',
          backgrounds: ['dark', 'primary color']
        },
        accent: {
          color: palette.accent.base,
          usage: 'Links, emphasis, highlights',
          backgrounds: ['white', 'light backgrounds']
        }
      },

      ui: {
        buttons: {
          primary: {
            background: palette.accent.base,
            text: this.getBestTextColor(palette.accent.base, palette),
            hover: palette.accent.shades[0].hex,
            usage: 'Primary CTA buttons'
          },
          secondary: {
            background: palette.secondary.base,
            text: this.getBestTextColor(palette.secondary.base, palette),
            hover: palette.secondary.shades[0].hex,
            usage: 'Secondary actions'
          }
        },
        links: {
          default: palette.primary.base,
          hover: palette.accent.base,
          visited: palette.primary.shades[1].hex
        },
        borders: {
          subtle: palette.neutrals.lightGray.hex,
          default: palette.neutrals.gray.hex,
          strong: palette.primary.base
        }
      },

      emphasis: {
        highlights: {
          color: palette.secondary.tints[0].hex,
          usage: 'Highlighted text, important info'
        },
        callouts: {
          background: palette.accent.tints[0].hex,
          border: palette.accent.base,
          usage: 'Info boxes, alerts'
        },
        success: {
          color: '#4CAF50',
          usage: 'Success messages'
        },
        warning: {
          color: '#FF9800',
          usage: 'Warning messages'
        },
        error: {
          color: '#F44336',
          usage: 'Error messages'
        }
      }
    };
  }

  /**
   * Get best text color for background
   */
  getBestTextColor(backgroundColor, palette) {
    const contrastWhite = this.getContrastRatio(backgroundColor, '#FFFFFF');
    const contrastBlack = this.getContrastRatio(backgroundColor, '#000000');

    return contrastWhite >= 4.5 ? '#FFFFFF' :
           contrastBlack >= 4.5 ? '#000000' :
           contrastWhite > contrastBlack ? '#FFFFFF' : '#000000';
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
   * Generate color palette from TEEI brand
   */
  async generateTEEIPalette() {
    return this.generateStunningPalette(
      this.brandColors.nordshore,
      'warm, empowering, hopeful, professional',
      'splitComplementary'
    );
  }

  /**
   * Export palette to various formats
   */
  exportPalette(palette, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(palette, null, 2);

      case 'css':
        return this.exportCSS(palette);

      case 'scss':
        return this.exportSCSS(palette);

      case 'ase':
        return this.exportASE(palette);

      default:
        return JSON.stringify(palette, null, 2);
    }
  }

  /**
   * Export as CSS custom properties
   */
  exportCSS(palette) {
    const css = [':root {'];

    // Add base colors
    Object.entries(palette).forEach(([name, colorData]) => {
      if (name === 'neutrals' || name === 'usage' || name === 'metadata' || name === 'accessibility') return;

      css.push(`  --color-${name}: ${colorData.base};`);

      // Add tints
      colorData.tints.forEach((tint, i) => {
        css.push(`  --color-${name}-tint-${i + 1}: ${tint.hex};`);
      });

      // Add shades
      colorData.shades.forEach((shade, i) => {
        css.push(`  --color-${name}-shade-${i + 1}: ${shade.hex};`);
      });
    });

    // Add neutrals
    if (palette.neutrals) {
      Object.entries(palette.neutrals).forEach(([name, data]) => {
        css.push(`  --color-${name}: ${data.hex};`);
      });
    }

    css.push('}');

    return css.join('\n');
  }

  /**
   * Export as SCSS variables
   */
  exportSCSS(palette) {
    const scss = [];

    Object.entries(palette).forEach(([name, colorData]) => {
      if (name === 'neutrals' || name === 'usage' || name === 'metadata' || name === 'accessibility') return;

      scss.push(`$color-${name}: ${colorData.base};`);

      colorData.tints.forEach((tint, i) => {
        scss.push(`$color-${name}-tint-${i + 1}: ${tint.hex};`);
      });

      colorData.shades.forEach((shade, i) => {
        scss.push(`$color-${name}-shade-${i + 1}: ${shade.hex};`);
      });
    });

    if (palette.neutrals) {
      Object.entries(palette.neutrals).forEach(([name, data]) => {
        scss.push(`$color-${name}: ${data.hex};`);
      });
    }

    return scss.join('\n');
  }

  /**
   * Export as Adobe Swatch Exchange (ASE) metadata
   */
  exportASE(palette) {
    // ASE is a binary format, so we export metadata for conversion
    const swatches = [];

    Object.entries(palette).forEach(([name, colorData]) => {
      if (name === 'neutrals' || name === 'usage' || name === 'metadata' || name === 'accessibility') return;

      const rgb = this.hexToRgb(colorData.base);
      swatches.push({
        name: name,
        type: 'RGB',
        r: rgb.r / 255,
        g: rgb.g / 255,
        b: rgb.b / 255
      });

      colorData.tints.forEach((tint, i) => {
        const tintRgb = this.hexToRgb(tint.hex);
        swatches.push({
          name: `${name} Tint ${i + 1}`,
          type: 'RGB',
          r: tintRgb.r / 255,
          g: tintRgb.g / 255,
          b: tintRgb.b / 255
        });
      });

      colorData.shades.forEach((shade, i) => {
        const shadeRgb = this.hexToRgb(shade.hex);
        swatches.push({
          name: `${name} Shade ${i + 1}`,
          type: 'RGB',
          r: shadeRgb.r / 255,
          g: shadeRgb.g / 255,
          b: shadeRgb.b / 255
        });
      });
    });

    return {
      format: 'ASE',
      version: '1.0',
      swatches: swatches,
      metadata: {
        note: 'Import into Adobe applications using ASE converter',
        generatedBy: 'Color Theory Engine',
        date: new Date().toISOString()
      }
    };
  }
}

module.exports = ColorTheoryEngine;
