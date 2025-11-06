/**
 * Color Theory Analyzer - Advanced Color Relationship Detection
 *
 * Analyzes color relationships and harmony using professional color theory:
 * - 6 color harmony types (complementary, analogous, triadic, etc.)
 * - Color wheel position calculation (HSL/HSV)
 * - Saturation and brightness balance
 * - Temperature balance (warm vs cool)
 * - AI-powered harmony validation with GPT-4o
 *
 * @module color-theory-analyzer
 */

const OpenAI = require('openai');

class ColorTheoryAnalyzer {
  constructor() {
    // OpenAI client (lazy loading)
    this.openai = null;

    // Color theory types
    this.harmonyTypes = {
      complementary: 'Complementary',
      splitComplementary: 'Split-Complementary',
      triadic: 'Triadic',
      tetradic: 'Tetradic (Double Complementary)',
      analogous: 'Analogous',
      monochromatic: 'Monochromatic'
    };

    // Color temperature ranges (hue degrees)
    this.temperatureRanges = {
      warm: [0, 60, 300, 360],  // Reds, oranges, yellows
      cool: [180, 240],          // Blues, cyans
      neutral: [60, 180, 240, 300] // Greens, purples
    };
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
   * Analyze color relationships and detect harmony type
   * @param {Array<string>} colors - Array of hex colors
   * @returns {Object} Comprehensive color theory analysis
   */
  async analyzeColorHarmony(colors) {
    if (!colors || colors.length === 0) {
      throw new Error('No colors provided for analysis');
    }

    // Convert to HSL for analysis
    const hslColors = colors.map(hex => ({
      hex,
      hsl: this.hexToHSL(hex),
      rgb: this.hexToRgb(hex)
    }));

    // Detect harmony types
    const detectedHarmonies = this.detectHarmonyTypes(hslColors);

    // Analyze color relationships
    const relationships = this.analyzeRelationships(hslColors);

    // Analyze saturation balance
    const saturationBalance = this.analyzeSaturationBalance(hslColors);

    // Analyze brightness balance
    const brightnessBalance = this.analyzeBrightnessBalance(hslColors);

    // Analyze temperature balance
    const temperatureBalance = this.analyzeTemperatureBalance(hslColors);

    // Calculate color wheel positions
    const wheelPositions = this.calculateWheelPositions(hslColors);

    // Get AI validation (if available)
    const aiValidation = await this.getAIHarmonyValidation(colors, detectedHarmonies);

    // Calculate overall harmony score
    const harmonyScore = this.calculateHarmonyScore({
      detectedHarmonies,
      relationships,
      saturationBalance,
      brightnessBalance,
      temperatureBalance
    });

    return {
      colors: hslColors,
      harmonyScore,
      detectedHarmonies,
      relationships,
      saturationBalance,
      brightnessBalance,
      temperatureBalance,
      wheelPositions,
      aiValidation,
      recommendations: this.generateRecommendations({
        detectedHarmonies,
        saturationBalance,
        brightnessBalance,
        temperatureBalance,
        harmonyScore
      })
    };
  }

  /**
   * Detect which color harmony types are present
   */
  detectHarmonyTypes(hslColors) {
    const harmonies = [];

    // Check complementary (180° apart)
    if (this.isComplementary(hslColors)) {
      harmonies.push({
        type: 'complementary',
        name: this.harmonyTypes.complementary,
        match: 'strong',
        description: 'Colors are opposite on the color wheel, creating high contrast and visual interest'
      });
    }

    // Check split-complementary
    if (this.isSplitComplementary(hslColors)) {
      harmonies.push({
        type: 'splitComplementary',
        name: this.harmonyTypes.splitComplementary,
        match: 'strong',
        description: 'Base color plus two colors adjacent to its complement, offering contrast with more nuance'
      });
    }

    // Check triadic (120° apart)
    if (this.isTriadic(hslColors)) {
      harmonies.push({
        type: 'triadic',
        name: this.harmonyTypes.triadic,
        match: 'strong',
        description: 'Three colors equally spaced on the color wheel, creating vibrant harmony'
      });
    }

    // Check tetradic (90° apart, two complementary pairs)
    if (this.isTetradic(hslColors)) {
      harmonies.push({
        type: 'tetradic',
        name: this.harmonyTypes.tetradic,
        match: 'strong',
        description: 'Four colors in two complementary pairs, offering rich color variety'
      });
    }

    // Check analogous (adjacent colors, 30° apart)
    if (this.isAnalogous(hslColors)) {
      harmonies.push({
        type: 'analogous',
        name: this.harmonyTypes.analogous,
        match: 'strong',
        description: 'Adjacent colors on the wheel, creating harmonious and serene combinations'
      });
    }

    // Check monochromatic (same hue, different saturation/lightness)
    if (this.isMonochromatic(hslColors)) {
      harmonies.push({
        type: 'monochromatic',
        name: this.harmonyTypes.monochromatic,
        match: 'strong',
        description: 'Variations of a single hue, creating cohesive and sophisticated palettes'
      });
    }

    return {
      detected: harmonies,
      count: harmonies.length,
      primary: harmonies[0] || null,
      isHarmonious: harmonies.length > 0
    };
  }

  /**
   * Check if colors form complementary relationship
   */
  isComplementary(hslColors) {
    if (hslColors.length < 2) return false;

    for (let i = 0; i < hslColors.length; i++) {
      for (let j = i + 1; j < hslColors.length; j++) {
        const hueDiff = this.getHueDifference(hslColors[i].hsl.h, hslColors[j].hsl.h);
        if (Math.abs(hueDiff - 180) <= 15) { // 15° tolerance
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Check if colors form split-complementary relationship
   */
  isSplitComplementary(hslColors) {
    if (hslColors.length < 3) return false;

    // Find potential base color and check if other two are ~150° and ~210° from it
    for (let i = 0; i < hslColors.length; i++) {
      const baseHue = hslColors[i].hsl.h;
      const others = hslColors.filter((_, idx) => idx !== i);

      if (others.length >= 2) {
        const diff1 = this.getHueDifference(baseHue, others[0].hsl.h);
        const diff2 = this.getHueDifference(baseHue, others[1].hsl.h);

        // Check for ~150° and ~210° (or ~30° on either side of complement)
        const isSplit = (
          (Math.abs(diff1 - 150) <= 20 && Math.abs(diff2 - 210) <= 20) ||
          (Math.abs(diff1 - 210) <= 20 && Math.abs(diff2 - 150) <= 20)
        );

        if (isSplit) return true;
      }
    }

    return false;
  }

  /**
   * Check if colors form triadic relationship
   */
  isTriadic(hslColors) {
    if (hslColors.length < 3) return false;

    // Check if we have three colors ~120° apart
    for (let i = 0; i < hslColors.length - 2; i++) {
      for (let j = i + 1; j < hslColors.length - 1; j++) {
        for (let k = j + 1; k < hslColors.length; k++) {
          const diff1 = this.getHueDifference(hslColors[i].hsl.h, hslColors[j].hsl.h);
          const diff2 = this.getHueDifference(hslColors[j].hsl.h, hslColors[k].hsl.h);
          const diff3 = this.getHueDifference(hslColors[k].hsl.h, hslColors[i].hsl.h);

          // All three should be ~120° apart
          if (
            Math.abs(diff1 - 120) <= 20 &&
            Math.abs(diff2 - 120) <= 20 &&
            Math.abs(diff3 - 120) <= 20
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if colors form tetradic relationship
   */
  isTetradic(hslColors) {
    if (hslColors.length < 4) return false;

    // Check for two complementary pairs
    const complementaryPairs = [];

    for (let i = 0; i < hslColors.length; i++) {
      for (let j = i + 1; j < hslColors.length; j++) {
        const hueDiff = this.getHueDifference(hslColors[i].hsl.h, hslColors[j].hsl.h);
        if (Math.abs(hueDiff - 180) <= 15) {
          complementaryPairs.push([i, j]);
        }
      }
    }

    // Need at least 2 complementary pairs
    return complementaryPairs.length >= 2;
  }

  /**
   * Check if colors form analogous relationship
   */
  isAnalogous(hslColors) {
    if (hslColors.length < 2) return false;

    // Sort by hue
    const sorted = [...hslColors].sort((a, b) => a.hsl.h - b.hsl.h);

    // Check if all adjacent colors are within 30-60° of each other
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = this.getHueDifference(sorted[i].hsl.h, sorted[i + 1].hsl.h);
      if (diff > 60) return false; // Too far apart
    }

    // Check overall spread (should be < 90°)
    const overallSpread = this.getHueDifference(sorted[0].hsl.h, sorted[sorted.length - 1].hsl.h);
    return overallSpread <= 90;
  }

  /**
   * Check if colors form monochromatic relationship
   */
  isMonochromatic(hslColors) {
    if (hslColors.length < 2) return false;

    const baseHue = hslColors[0].hsl.h;

    // All colors should have similar hue (within 15°)
    return hslColors.every(color => {
      const hueDiff = this.getHueDifference(baseHue, color.hsl.h);
      return hueDiff <= 15;
    });
  }

  /**
   * Get hue difference (accounting for circular nature)
   */
  getHueDifference(hue1, hue2) {
    let diff = Math.abs(hue1 - hue2);
    if (diff > 180) diff = 360 - diff;
    return diff;
  }

  /**
   * Analyze color relationships
   */
  analyzeRelationships(hslColors) {
    const relationships = [];

    for (let i = 0; i < hslColors.length; i++) {
      for (let j = i + 1; j < hslColors.length; j++) {
        const color1 = hslColors[i];
        const color2 = hslColors[j];

        const hueDiff = this.getHueDifference(color1.hsl.h, color2.hsl.h);
        const satDiff = Math.abs(color1.hsl.s - color2.hsl.s);
        const lightDiff = Math.abs(color1.hsl.l - color2.hsl.l);

        relationships.push({
          color1: color1.hex,
          color2: color2.hex,
          hueDifference: Math.round(hueDiff),
          saturationDifference: Math.round(satDiff),
          lightnessDifference: Math.round(lightDiff),
          relationshipType: this.getRelationshipType(hueDiff)
        });
      }
    }

    return relationships;
  }

  /**
   * Get relationship type based on hue difference
   */
  getRelationshipType(hueDiff) {
    if (hueDiff <= 30) return 'analogous';
    if (hueDiff >= 150 && hueDiff <= 210) return 'complementary';
    if (hueDiff >= 110 && hueDiff <= 130) return 'triadic';
    if (hueDiff >= 85 && hueDiff <= 95) return 'square';
    return 'custom';
  }

  /**
   * Analyze saturation balance
   */
  analyzeSaturationBalance(hslColors) {
    const saturations = hslColors.map(c => c.hsl.s);
    const avg = saturations.reduce((sum, s) => sum + s, 0) / saturations.length;
    const min = Math.min(...saturations);
    const max = Math.max(...saturations);
    const range = max - min;

    return {
      average: Math.round(avg),
      min,
      max,
      range,
      variance: this.calculateVariance(saturations),
      balanced: range <= 40, // Balanced if range is within 40%
      distribution: this.categorizeSaturation(saturations)
    };
  }

  /**
   * Analyze brightness (lightness) balance
   */
  analyzeBrightnessBalance(hslColors) {
    const lightnesses = hslColors.map(c => c.hsl.l);
    const avg = lightnesses.reduce((sum, l) => sum + l, 0) / lightnesses.length;
    const min = Math.min(...lightnesses);
    const max = Math.max(...lightnesses);
    const range = max - min;

    return {
      average: Math.round(avg),
      min,
      max,
      range,
      variance: this.calculateVariance(lightnesses),
      balanced: range >= 20 && range <= 60, // Good range for contrast without extremes
      distribution: this.categorizeBrightness(lightnesses)
    };
  }

  /**
   * Analyze temperature balance (warm vs cool)
   */
  analyzeTemperatureBalance(hslColors) {
    const temperatures = hslColors.map(color => this.getColorTemperature(color.hsl.h));

    const warm = temperatures.filter(t => t === 'warm').length;
    const cool = temperatures.filter(t => t === 'cool').length;
    const neutral = temperatures.filter(t => t === 'neutral').length;

    const total = temperatures.length;

    return {
      warm: { count: warm, percentage: Math.round((warm / total) * 100) },
      cool: { count: cool, percentage: Math.round((cool / total) * 100) },
      neutral: { count: neutral, percentage: Math.round((neutral / total) * 100) },
      dominant: warm > cool ? 'warm' : cool > warm ? 'cool' : 'balanced',
      balanced: Math.abs(warm - cool) <= Math.ceil(total * 0.3)
    };
  }

  /**
   * Get color temperature based on hue
   */
  getColorTemperature(hue) {
    // Warm: 0-60° (reds, oranges, yellows) and 300-360° (reds, magentas)
    if ((hue >= 0 && hue <= 60) || (hue >= 300 && hue <= 360)) {
      return 'warm';
    }
    // Cool: 180-240° (cyans, blues)
    if (hue >= 180 && hue <= 240) {
      return 'cool';
    }
    // Neutral: 60-180° (yellows, greens) and 240-300° (purples)
    return 'neutral';
  }

  /**
   * Calculate wheel positions for visualization
   */
  calculateWheelPositions(hslColors) {
    return hslColors.map(color => ({
      hex: color.hex,
      hue: color.hsl.h,
      angle: color.hsl.h,
      radius: color.hsl.s / 100, // Saturation as radius
      lightness: color.hsl.l,
      coordinates: {
        x: Math.cos((color.hsl.h * Math.PI) / 180) * (color.hsl.s / 100),
        y: Math.sin((color.hsl.h * Math.PI) / 180) * (color.hsl.s / 100)
      }
    }));
  }

  /**
   * Get AI validation of color harmony (GPT-4o)
   */
  async getAIHarmonyValidation(colors, detectedHarmonies) {
    this.initializeOpenAI();

    if (!this.openai) {
      return null; // Skip AI validation if not configured
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: `You are a professional color theorist and designer with expertise in:
- Traditional color theory (Itten, Munsell, etc.)
- Color harmony principles
- Visual perception and psychology
- Professional design standards

Analyze color palettes for harmony, balance, and professional quality.`
        }, {
          role: 'user',
          content: `Analyze this color palette for color theory harmony:

Colors: ${colors.join(', ')}

Detected harmonies: ${detectedHarmonies.detected.map(h => h.name).join(', ') || 'None'}

Provide:
1. Harmony assessment (0-100 score)
2. Color theory compliance
3. Professional quality evaluation
4. Specific improvements needed
5. Overall harmony rating (Poor/Fair/Good/Excellent/Perfect)

Return as JSON with structure: { score, compliance, quality, improvements, rating, analysis }`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Error getting AI harmony validation:', error.message);
      return null;
    }
  }

  /**
   * Calculate overall harmony score
   */
  calculateHarmonyScore(analysis) {
    let score = 0;
    const weights = {
      harmony: 40,
      saturation: 20,
      brightness: 20,
      temperature: 20
    };

    // Harmony detection score
    if (analysis.detectedHarmonies.isHarmonious) {
      score += weights.harmony;
    }

    // Saturation balance score
    if (analysis.saturationBalance.balanced) {
      score += weights.saturation;
    } else {
      // Partial credit based on variance
      const varianceScore = Math.max(0, 1 - (analysis.saturationBalance.variance / 1000));
      score += weights.saturation * varianceScore;
    }

    // Brightness balance score
    if (analysis.brightnessBalance.balanced) {
      score += weights.brightness;
    } else {
      // Partial credit based on variance
      const varianceScore = Math.max(0, 1 - (analysis.brightnessBalance.variance / 1000));
      score += weights.brightness * varianceScore;
    }

    // Temperature balance score
    if (analysis.temperatureBalance.balanced) {
      score += weights.temperature;
    } else {
      // Partial credit for intentional warm/cool dominance
      score += weights.temperature * 0.7;
    }

    return Math.round(score);
  }

  /**
   * Generate recommendations for improvement
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Harmony recommendations
    if (!analysis.detectedHarmonies.isHarmonious) {
      recommendations.push({
        category: 'Harmony',
        severity: 'high',
        issue: 'No recognized color harmony pattern detected',
        suggestion: 'Consider reorganizing colors to follow a classic harmony (complementary, analogous, or triadic)'
      });
    }

    // Saturation recommendations
    if (!analysis.saturationBalance.balanced) {
      if (analysis.saturationBalance.range > 60) {
        recommendations.push({
          category: 'Saturation',
          severity: 'medium',
          issue: 'Very wide saturation range may create visual discord',
          suggestion: 'Reduce saturation variance to create more cohesive palette'
        });
      }
    }

    // Brightness recommendations
    if (!analysis.brightnessBalance.balanced) {
      if (analysis.brightnessBalance.range < 20) {
        recommendations.push({
          category: 'Brightness',
          severity: 'medium',
          issue: 'Limited brightness range reduces visual interest',
          suggestion: 'Increase lightness variation for better hierarchy and depth'
        });
      } else if (analysis.brightnessBalance.range > 70) {
        recommendations.push({
          category: 'Brightness',
          severity: 'low',
          issue: 'Very wide brightness range may be challenging to balance',
          suggestion: 'Consider moderating extreme light/dark values'
        });
      }
    }

    // Temperature recommendations
    if (analysis.temperatureBalance.dominant !== 'balanced') {
      const dominant = analysis.temperatureBalance.dominant;
      recommendations.push({
        category: 'Temperature',
        severity: 'low',
        issue: `Palette is ${dominant}-dominated`,
        suggestion: `Consider adding ${dominant === 'warm' ? 'cool' : 'warm'} accent colors for balance`,
        note: 'Temperature dominance can be intentional for specific moods'
      });
    }

    // Score-based recommendations
    if (analysis.harmonyScore < 60) {
      recommendations.push({
        category: 'Overall',
        severity: 'high',
        issue: 'Low harmony score indicates significant color theory issues',
        suggestion: 'Consider starting with a color harmony tool or template to establish better foundation'
      });
    }

    return recommendations;
  }

  /**
   * Calculate variance for a set of values
   */
  calculateVariance(values) {
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    return Math.round(squareDiffs.reduce((sum, sd) => sum + sd, 0) / values.length);
  }

  /**
   * Categorize saturation levels
   */
  categorizeSaturation(saturations) {
    const categories = { high: 0, medium: 0, low: 0 };

    saturations.forEach(s => {
      if (s > 70) categories.high++;
      else if (s > 30) categories.medium++;
      else categories.low++;
    });

    return categories;
  }

  /**
   * Categorize brightness levels
   */
  categorizeBrightness(lightnesses) {
    const categories = { light: 0, medium: 0, dark: 0 };

    lightnesses.forEach(l => {
      if (l > 70) categories.light++;
      else if (l > 30) categories.medium++;
      else categories.dark++;
    });

    return categories;
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
}

module.exports = ColorTheoryAnalyzer;
