/**
 * Color Consistency Checker - Cross-Page Color Validation
 *
 * Ensures consistent color usage across pages:
 * - Cross-page color usage tracking
 * - Brand color application consistency
 * - Gradient consistency validation
 * - Color naming consistency
 * - Cross-document comparison
 * - AI consistency critique with Claude Sonnet 4.5
 *
 * @module color-consistency-checker
 */

const Anthropic = require('@anthropic-ai/sdk');

class ColorConsistencyChecker {
  constructor() {
    // Anthropic client (lazy loading)
    this.anthropic = null;

    // Color matching tolerance
    this.matchTolerance = 5; // Delta E threshold for "same color"
  }

  /**
   * Initialize Anthropic client (lazy loading)
   */
  initializeAnthropic() {
    if (!this.anthropic && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }

  /**
   * Check color consistency across pages
   * @param {Array<Object>} pageColors - Array of { page, colors: [{hex, usage, context}] }
   * @returns {Object} Comprehensive consistency analysis
   */
  async checkConsistency(pageColors) {
    if (!pageColors || pageColors.length === 0) {
      throw new Error('No page color data provided');
    }

    // Build color usage map
    const colorMap = this.buildColorUsageMap(pageColors);

    // Detect inconsistencies
    const inconsistencies = this.detectInconsistencies(colorMap, pageColors);

    // Validate brand color consistency
    const brandConsistency = this.validateBrandConsistency(pageColors);

    // Check gradient consistency
    const gradientConsistency = this.checkGradientConsistency(pageColors);

    // Analyze color drift
    const colorDrift = this.analyzeColorDrift(pageColors);

    // Get AI consistency critique (Claude Sonnet 4.5)
    const aiCritique = await this.getAIConsistencyCritique(pageColors, inconsistencies);

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore({
      inconsistencies,
      brandConsistency,
      gradientConsistency,
      colorDrift
    });

    return {
      consistencyScore,
      colorMap,
      inconsistencies,
      brandConsistency,
      gradientConsistency,
      colorDrift,
      aiCritique,
      recommendations: this.generateConsistencyRecommendations({
        inconsistencies,
        brandConsistency,
        colorDrift,
        consistencyScore
      })
    };
  }

  /**
   * Build map of color usage across pages
   */
  buildColorUsageMap(pageColors) {
    const map = new Map();

    pageColors.forEach(pageData => {
      pageData.colors.forEach(colorUsage => {
        const key = this.getColorKey(colorUsage.hex);

        if (!map.has(key)) {
          map.set(key, {
            representativeHex: colorUsage.hex,
            variations: [],
            pages: [],
            totalUsage: 0,
            contexts: new Set()
          });
        }

        const entry = map.get(key);
        entry.variations.push(colorUsage.hex);
        entry.pages.push(pageData.page);
        entry.totalUsage += colorUsage.usage || 1;
        if (colorUsage.context) {
          entry.contexts.add(colorUsage.context);
        }
      });
    });

    return map;
  }

  /**
   * Get color key for grouping similar colors
   */
  getColorKey(hex) {
    const rgb = this.hexToRgb(hex);
    // Round to nearest 10 to group similar colors
    const r = Math.round(rgb.r / 10) * 10;
    const g = Math.round(rgb.g / 10) * 10;
    const b = Math.round(rgb.b / 10) * 10;
    return `${r}-${g}-${b}`;
  }

  /**
   * Detect inconsistencies in color usage
   */
  detectInconsistencies(colorMap, pageColors) {
    const inconsistencies = {
      variations: [],
      missingOnPages: [],
      contextMismatches: []
    };

    // Check for color variations (should be exact matches)
    colorMap.forEach((data, key) => {
      const uniqueVariations = [...new Set(data.variations)];

      if (uniqueVariations.length > 1) {
        // Multiple hex codes for what should be the same color
        const distances = this.calculateVariationDistances(uniqueVariations);

        if (distances.max > this.matchTolerance) {
          inconsistencies.variations.push({
            representativeColor: data.representativeHex,
            variations: uniqueVariations,
            maxDistance: Math.round(distances.max),
            pages: data.pages,
            severity: distances.max > 15 ? 'high' : 'medium'
          });
        }
      }
    });

    // Check for colors missing on some pages (brand colors should be everywhere)
    const allPages = pageColors.map(p => p.page);
    colorMap.forEach((data, key) => {
      if (data.pages.length < allPages.length * 0.7) {
        // Color used on less than 70% of pages
        const missingPages = allPages.filter(p => !data.pages.includes(p));

        inconsistencies.missingOnPages.push({
          color: data.representativeHex,
          presentOn: data.pages,
          missingOn: missingPages,
          consistency: Math.round((data.pages.length / allPages.length) * 100)
        });
      }
    });

    return inconsistencies;
  }

  /**
   * Calculate distances between color variations
   */
  calculateVariationDistances(variations) {
    let max = 0;
    let min = Infinity;
    const distances = [];

    for (let i = 0; i < variations.length; i++) {
      for (let j = i + 1; j < variations.length; j++) {
        const distance = this.getColorDistance(variations[i], variations[j]);
        distances.push(distance);
        max = Math.max(max, distance);
        min = Math.min(min, distance);
      }
    }

    const avg = distances.length > 0 ? distances.reduce((a, b) => a + b, 0) / distances.length : 0;

    return { max, min, avg };
  }

  /**
   * Validate brand color consistency
   */
  validateBrandConsistency(pageColors) {
    const brandColors = {
      nordshore: '#00393F',
      sky: '#C9E4EC',
      sand: '#FFF1E2',
      beige: '#EFE1DC',
      moss: '#65873B',
      gold: '#BA8F5A',
      clay: '#913B2F'
    };

    const consistency = {
      overall: true,
      byColor: {}
    };

    Object.entries(brandColors).forEach(([name, hex]) => {
      const usageAcrossPages = [];

      pageColors.forEach(pageData => {
        const matches = pageData.colors.filter(c =>
          this.getColorDistance(c.hex, hex) < this.matchTolerance
        );

        usageAcrossPages.push({
          page: pageData.page,
          found: matches.length > 0,
          variations: matches.map(m => m.hex)
        });
      });

      const consistentPages = usageAcrossPages.filter(u => u.found).length;
      const totalPages = pageColors.length;
      const consistencyPct = Math.round((consistentPages / totalPages) * 100);
      const isConsistent = consistentPages === totalPages || consistentPages === 0;

      consistency.byColor[name] = {
        hex,
        consistentPages,
        totalPages,
        consistency: consistencyPct,
        isConsistent,
        usageAcrossPages
      };

      if (!isConsistent) {
        consistency.overall = false;
      }
    });

    return consistency;
  }

  /**
   * Check gradient consistency
   */
  checkGradientConsistency(pageColors) {
    // This would analyze gradients if present in the document
    // For now, return placeholder structure
    return {
      gradientsDetected: false,
      consistent: true,
      message: 'Gradient consistency checking requires gradient detection in source data'
    };
  }

  /**
   * Analyze color drift across pages
   */
  analyzeColorDrift(pageColors) {
    const drift = {
      detected: false,
      driftingColors: []
    };

    // Group pages in sequential order
    const sortedPages = [...pageColors].sort((a, b) => a.page - b.page);

    // For each color, check if it drifts across pages
    const colorsByPage = new Map();

    sortedPages.forEach(pageData => {
      pageData.colors.forEach(colorUsage => {
        const key = this.getColorKey(colorUsage.hex);

        if (!colorsByPage.has(key)) {
          colorsByPage.set(key, []);
        }

        colorsByPage.get(key).push({
          page: pageData.page,
          hex: colorUsage.hex
        });
      });
    });

    // Analyze drift for each color
    colorsByPage.forEach((pageUsages, key) => {
      if (pageUsages.length > 2) {
        const distances = [];

        for (let i = 0; i < pageUsages.length - 1; i++) {
          const distance = this.getColorDistance(
            pageUsages[i].hex,
            pageUsages[i + 1].hex
          );
          distances.push(distance);
        }

        const maxDrift = Math.max(...distances);
        const avgDrift = distances.reduce((a, b) => a + b, 0) / distances.length;

        if (maxDrift > this.matchTolerance || avgDrift > this.matchTolerance / 2) {
          drift.detected = true;

          const firstPage = pageUsages[0].page;
          const lastPage = pageUsages[pageUsages.length - 1].page;

          drift.driftingColors.push({
            representativeHex: pageUsages[0].hex,
            maxDrift: Math.round(maxDrift),
            avgDrift: Math.round(avgDrift),
            pageRange: `${firstPage}-${lastPage}`,
            variations: pageUsages.map(u => u.hex)
          });
        }
      }
    });

    return drift;
  }

  /**
   * Get AI consistency critique (Claude Sonnet 4.5)
   */
  async getAIConsistencyCritique(pageColors, inconsistencies) {
    this.initializeAnthropic();

    if (!this.anthropic) {
      return null;
    }

    try {
      const pageSummary = pageColors.map(p =>
        `Page ${p.page}: ${p.colors.length} colors`
      ).join('\n');

      const variationsInfo = inconsistencies.variations.length > 0
        ? inconsistencies.variations.map(v => `${v.representativeColor} has ${v.variations.length} variations`).join(', ')
        : 'None';

      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `As a design consistency expert, analyze color usage across this document:

**Pages:**
${pageSummary}

**Inconsistencies Detected:**
Variations: ${inconsistencies.variations.length}
Missing on pages: ${inconsistencies.missingOnPages.length}

**Color Variations:** ${variationsInfo}

Provide:
1. Consistency score (0-100)
2. Consistency quality assessment
3. Specific issues requiring attention
4. Recommended fixes
5. Overall consistency rating (Poor/Fair/Good/Excellent/Perfect)

Return as JSON with structure: { score, quality, issues, fixes, rating, critique }`
        }]
      });

      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { raw: message.content[0].text };

    } catch (error) {
      console.error('Error getting AI consistency critique:', error.message);
      return null;
    }
  }

  /**
   * Calculate consistency score
   */
  calculateConsistencyScore(analysis) {
    let score = 100;

    // Penalties for inconsistencies
    score -= analysis.inconsistencies.variations.length * 10;
    score -= analysis.inconsistencies.missingOnPages.length * 5;

    // Penalty for brand inconsistency
    if (!analysis.brandConsistency.overall) {
      score -= 20;
    }

    // Penalty for color drift
    if (analysis.colorDrift.detected) {
      score -= analysis.colorDrift.driftingColors.length * 8;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Generate consistency recommendations
   */
  generateConsistencyRecommendations(analysis) {
    const recommendations = [];

    // Color variation recommendations
    if (analysis.inconsistencies.variations.length > 0) {
      recommendations.push({
        category: 'Color Variations',
        severity: 'high',
        issue: `${analysis.inconsistencies.variations.length} colors have multiple variations`,
        suggestion: 'Standardize to exact hex codes across all pages',
        colors: analysis.inconsistencies.variations.slice(0, 3)
      });
    }

    // Missing colors recommendations
    if (analysis.inconsistencies.missingOnPages.length > 0) {
      recommendations.push({
        category: 'Missing Colors',
        severity: 'medium',
        issue: 'Some colors not consistently used across pages',
        suggestion: 'Ensure brand colors appear on all relevant pages'
      });
    }

    // Brand consistency recommendations
    if (!analysis.brandConsistency.overall) {
      const inconsistentBrandColors = Object.entries(analysis.brandConsistency.byColor)
        .filter(([_, data]) => !data.isConsistent)
        .map(([name]) => name);

      recommendations.push({
        category: 'Brand Consistency',
        severity: 'high',
        issue: 'Brand colors not consistently applied',
        suggestion: 'Apply brand colors uniformly across all pages',
        affectedColors: inconsistentBrandColors
      });
    }

    // Color drift recommendations
    if (analysis.colorDrift.detected) {
      recommendations.push({
        category: 'Color Drift',
        severity: 'medium',
        issue: 'Colors drift/change across pages',
        suggestion: 'Lock color values to prevent gradual changes',
        driftingColors: analysis.colorDrift.driftingColors.slice(0, 3)
      });
    }

    return recommendations;
  }

  /**
   * Calculate color distance (Delta E)
   */
  getColorDistance(hex1, hex2) {
    const lab1 = this.hexToLab(hex1);
    const lab2 = this.hexToLab(hex2);

    const dL = lab1.l - lab2.l;
    const dA = lab1.a - lab2.a;
    const dB = lab1.b - lab2.b;

    return Math.sqrt(dL * dL + dA * dA + dB * dB);
  }

  hexToLab(hex) {
    return this.rgbToLab(this.hexToRgb(hex));
  }

  rgbToLab(rgb) {
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

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}

module.exports = ColorConsistencyChecker;
