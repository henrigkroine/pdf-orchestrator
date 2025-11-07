/**
 * Brand Color Validator - TEEI Brand Color Compliance
 *
 * Validates color usage against TEEI brand guidelines:
 * - Exact TEEI color matching (7 official colors)
 * - Color usage statistics and ratios
 * - Unauthorized color detection
 * - Usage ratio validation (80% Nordshore target)
 * - Secondary/accent balance
 * - AI brand color critique with Claude Opus 4.1
 *
 * @module brand-color-validator
 */

const Anthropic = require('@anthropic-ai/sdk');

class BrandColorValidator {
  constructor(brandConfig) {
    // Anthropic client (lazy loading)
    this.anthropic = null;

    // TEEI official brand colors
    this.brandColors = brandConfig?.brandColors || {
      nordshore: { hex: '#00393F', name: 'Nordshore', role: 'primary', targetUsage: 80 },
      sky: { hex: '#C9E4EC', name: 'Sky', role: 'secondary', targetUsage: 10 },
      sand: { hex: '#FFF1E2', name: 'Sand', role: 'background', targetUsage: 5 },
      beige: { hex: '#EFE1DC', name: 'Beige', role: 'background', targetUsage: 0 },
      moss: { hex: '#65873B', name: 'Moss', role: 'accent', targetUsage: 2 },
      gold: { hex: '#BA8F5A', name: 'Gold', role: 'accent', targetUsage: 2 },
      clay: { hex: '#913B2F', name: 'Clay', role: 'accent', targetUsage: 1 }
    };

    // Forbidden colors (not in brand palette)
    this.forbiddenColors = brandConfig?.forbiddenColors || [
      { hex: '#FF6B35', name: 'Copper/Orange', reason: 'Not in TEEI brand palette' },
      { hex: '#F7931E', name: 'Orange', reason: 'Not in TEEI brand palette' }
    ];

    // Color matching tolerance (Delta E)
    this.matchTolerance = 10; // Perceptual difference threshold
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
   * Validate document colors against TEEI brand guidelines
   * @param {Array<Object>} colorUsage - Array of { hex, count, percentage, context }
   * @returns {Object} Comprehensive brand color validation
   */
  async validateBrandColors(colorUsage) {
    if (!colorUsage || colorUsage.length === 0) {
      throw new Error('No color usage data provided');
    }

    // Match colors to brand palette
    const matchedColors = this.matchColorsToBrand(colorUsage);

    // Detect unauthorized colors
    const unauthorizedColors = this.detectUnauthorizedColors(matchedColors);

    // Calculate usage statistics
    const usageStats = this.calculateUsageStatistics(matchedColors);

    // Validate usage ratios
    const ratioValidation = this.validateUsageRatios(usageStats);

    // Check color balance
    const balance = this.checkColorBalance(matchedColors);

    // Get AI brand critique (Claude Opus 4.1)
    const aiCritique = await this.getAIBrandCritique(matchedColors, usageStats);

    // Calculate compliance score
    const complianceScore = this.calculateComplianceScore({
      matchedColors,
      unauthorizedColors,
      ratioValidation,
      balance
    });

    return {
      complianceScore,
      matchedColors,
      unauthorizedColors,
      usageStats,
      ratioValidation,
      balance,
      aiCritique,
      recommendations: this.generateRecommendations({
        unauthorizedColors,
        ratioValidation,
        balance,
        complianceScore
      })
    };
  }

  /**
   * Match document colors to brand palette
   */
  matchColorsToBrand(colorUsage) {
    return colorUsage.map(usage => {
      let bestMatch = null;
      let bestDistance = Infinity;

      // Try to match to official brand colors
      Object.entries(this.brandColors).forEach(([key, brandColor]) => {
        const distance = this.getColorDistance(usage.hex, brandColor.hex);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = {
            key,
            ...brandColor,
            distance,
            isExactMatch: distance < 5,
            isCloseMatch: distance < this.matchTolerance
          };
        }
      });

      return {
        ...usage,
        brandMatch: bestMatch,
        isBrandColor: bestMatch && bestMatch.isCloseMatch,
        distanceFromBrand: Math.round(bestDistance)
      };
    });
  }

  /**
   * Detect colors not in brand palette
   */
  detectUnauthorizedColors(matchedColors) {
    const unauthorized = matchedColors.filter(color => !color.isBrandColor);

    // Check against forbidden colors
    const forbidden = unauthorized.filter(color => {
      return this.forbiddenColors.some(forbiddenColor => {
        const distance = this.getColorDistance(color.hex, forbiddenColor.hex);
        return distance < 15; // Close to forbidden color
      });
    });

    return {
      unauthorized,
      count: unauthorized.length,
      totalPercentage: unauthorized.reduce((sum, c) => sum + (c.percentage || 0), 0),
      forbidden,
      forbiddenCount: forbidden.length,
      severity: forbidden.length > 0 ? 'high' : unauthorized.length > 0 ? 'medium' : 'none'
    };
  }

  /**
   * Calculate brand color usage statistics
   */
  calculateUsageStatistics(matchedColors) {
    const stats = {
      total: matchedColors.length,
      brandColors: 0,
      unauthorizedColors: 0,
      byBrandColor: {},
      byRole: {
        primary: { count: 0, percentage: 0 },
        secondary: { count: 0, percentage: 0 },
        accent: { count: 0, percentage: 0 },
        background: { count: 0, percentage: 0 }
      }
    };

    // Count brand colors
    matchedColors.forEach(color => {
      if (color.isBrandColor) {
        stats.brandColors++;

        // Count by specific brand color
        const key = color.brandMatch.key;
        if (!stats.byBrandColor[key]) {
          stats.byBrandColor[key] = {
            name: color.brandMatch.name,
            hex: color.brandMatch.hex,
            role: color.brandMatch.role,
            count: 0,
            percentage: 0,
            targetUsage: color.brandMatch.targetUsage
          };
        }
        stats.byBrandColor[key].count++;
        stats.byBrandColor[key].percentage += color.percentage || 0;

        // Count by role
        const role = color.brandMatch.role;
        if (stats.byRole[role]) {
          stats.byRole[role].count++;
          stats.byRole[role].percentage += color.percentage || 0;
        }
      } else {
        stats.unauthorizedColors++;
      }
    });

    // Round percentages
    Object.values(stats.byBrandColor).forEach(stat => {
      stat.percentage = Math.round(stat.percentage * 10) / 10;
    });

    Object.values(stats.byRole).forEach(stat => {
      stat.percentage = Math.round(stat.percentage * 10) / 10;
    });

    return stats;
  }

  /**
   * Validate usage ratios against targets
   */
  validateUsageRatios(usageStats) {
    const validation = {
      overall: true,
      issues: [],
      byColor: {}
    };

    // Check each brand color against target usage
    Object.entries(usageStats.byBrandColor).forEach(([key, stats]) => {
      const target = stats.targetUsage;
      const actual = stats.percentage;
      const diff = Math.abs(target - actual);
      const tolerance = target * 0.3; // 30% tolerance

      const isValid = diff <= tolerance;

      validation.byColor[key] = {
        name: stats.name,
        target,
        actual,
        difference: Math.round(diff * 10) / 10,
        valid: isValid,
        status: isValid ? 'ok' : actual > target ? 'overused' : 'underused'
      };

      if (!isValid) {
        validation.overall = false;
        validation.issues.push({
          color: stats.name,
          issue: actual > target ? 'Overused' : 'Underused',
          target: `${target}%`,
          actual: `${actual}%`,
          difference: `${Math.round(diff)}%`
        });
      }
    });

    // Check primary color (Nordshore) usage
    const nordshoreUsage = usageStats.byBrandColor.nordshore?.percentage || 0;
    if (nordshoreUsage < 60) {
      validation.issues.push({
        color: 'Nordshore (Primary)',
        issue: 'Insufficient primary color usage',
        target: '80%',
        actual: `${nordshoreUsage}%`,
        severity: 'high'
      });
    }

    return validation;
  }

  /**
   * Check overall color balance
   */
  checkColorBalance(matchedColors) {
    const brandColorCount = matchedColors.filter(c => c.isBrandColor).length;
    const totalColors = matchedColors.length;
    const brandColorRatio = brandColorCount / totalColors;

    // Calculate role distribution
    const roles = matchedColors.reduce((acc, color) => {
      if (color.isBrandColor) {
        const role = color.brandMatch.role;
        acc[role] = (acc[role] || 0) + (color.percentage || 0);
      }
      return acc;
    }, {});

    return {
      brandColorRatio: Math.round(brandColorRatio * 100),
      roleDistribution: roles,
      balanced: brandColorRatio >= 0.7, // At least 70% brand colors
      primaryDominant: (roles.primary || 0) >= 60,
      accentAppropriate: (roles.accent || 0) <= 10
    };
  }

  /**
   * Get AI brand critique (Claude Opus 4.1)
   */
  async getAIBrandCritique(matchedColors, usageStats) {
    this.initializeAnthropic();

    if (!this.anthropic) {
      return null; // Skip AI critique if not configured
    }

    try {
      const colorSummary = Object.entries(usageStats.byBrandColor)
        .map(([key, stats]) => `${stats.name} (${stats.hex}): ${stats.percentage}%`)
        .join('\n');

      const unauthorizedSummary = matchedColors
        .filter(c => !c.isBrandColor)
        .map(c => `${c.hex}: ${c.percentage}%`)
        .join('\n');

      const message = await this.anthropic.messages.create({
        model: 'claude-opus-4-20250514',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `As a brand identity expert, critique this color usage for TEEI (education nonprofit):

**TEEI Brand Colors:**
Nordshore #00393F (primary, deep teal) - Target: 80%
Sky #C9E4EC (secondary, light blue) - Target: 10%
Sand #FFF1E2 (background) - Target: 5%
Moss #65873B, Gold #BA8F5A, Clay #913B2F (accents) - Combined: 5%

**Current Usage:**
${colorSummary}

${unauthorizedSummary ? `**Unauthorized Colors:**\n${unauthorizedSummary}\n` : ''}

**Brand Voice:** Warm, empowering, hopeful, professional, inclusive

Provide:
1. Brand compliance score (0-100)
2. Aesthetic quality assessment
3. Specific color issues
4. Recommended adjustments
5. Overall brand alignment rating (Poor/Fair/Good/Excellent/Perfect)

Return as JSON with structure: { score, aesthetic, issues, adjustments, rating, critique }`
        }]
      });

      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { raw: message.content[0].text };

    } catch (error) {
      console.error('Error getting AI brand critique:', error.message);
      return null;
    }
  }

  /**
   * Calculate brand compliance score
   */
  calculateComplianceScore(analysis) {
    let score = 0;
    const weights = {
      brandColors: 40,
      unauthorized: 30,
      ratios: 20,
      balance: 10
    };

    // Brand color usage score
    const brandColorRatio = analysis.matchedColors.filter(c => c.isBrandColor).length / analysis.matchedColors.length;
    score += weights.brandColors * brandColorRatio;

    // Unauthorized colors penalty
    const unauthorizedRatio = analysis.unauthorizedColors.totalPercentage / 100;
    score += weights.unauthorized * (1 - unauthorizedRatio);

    // Ratio validation score
    const ratioScore = analysis.ratioValidation.overall ? 1 :
      Math.max(0, 1 - (analysis.ratioValidation.issues.length / 7));
    score += weights.ratios * ratioScore;

    // Balance score
    const balanceScore = (
      (analysis.balance.balanced ? 0.4 : 0) +
      (analysis.balance.primaryDominant ? 0.4 : 0) +
      (analysis.balance.accentAppropriate ? 0.2 : 0)
    );
    score += weights.balance * balanceScore * 100;

    return Math.round(score);
  }

  /**
   * Generate recommendations for brand compliance
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Unauthorized color recommendations
    if (analysis.unauthorizedColors.forbidden.length > 0) {
      recommendations.push({
        category: 'Brand Compliance',
        severity: 'critical',
        issue: 'Forbidden colors detected (copper/orange)',
        suggestion: 'Replace with TEEI brand colors immediately',
        colors: analysis.unauthorizedColors.forbidden.map(c => c.hex)
      });
    }

    if (analysis.unauthorizedColors.count > 0 && analysis.unauthorizedColors.forbidden.length === 0) {
      recommendations.push({
        category: 'Brand Compliance',
        severity: 'high',
        issue: `${analysis.unauthorizedColors.count} unauthorized colors detected`,
        suggestion: 'Use only TEEI brand palette colors for consistency',
        percentage: analysis.unauthorizedColors.totalPercentage
      });
    }

    // Ratio recommendations
    if (!analysis.ratioValidation.overall) {
      analysis.ratioValidation.issues.forEach(issue => {
        recommendations.push({
          category: 'Color Usage',
          severity: issue.severity || 'medium',
          issue: `${issue.color}: ${issue.issue}`,
          suggestion: `Adjust from ${issue.actual} to ${issue.target}`,
          difference: issue.difference
        });
      });
    }

    // Balance recommendations
    if (!analysis.balance.balanced) {
      recommendations.push({
        category: 'Color Balance',
        severity: 'medium',
        issue: 'Less than 70% brand colors used',
        suggestion: 'Increase brand color usage for stronger identity',
        current: `${analysis.balance.brandColorRatio}%`
      });
    }

    if (!analysis.balance.primaryDominant) {
      recommendations.push({
        category: 'Primary Color',
        severity: 'high',
        issue: 'Nordshore (primary) is not dominant',
        suggestion: 'Increase Nordshore usage to 60-80% for brand recognition'
      });
    }

    if (!analysis.balance.accentAppropriate) {
      recommendations.push({
        category: 'Accent Colors',
        severity: 'low',
        issue: 'Accent colors overused',
        suggestion: 'Reduce accent color usage to 5-10% total'
      });
    }

    // Compliance score recommendations
    if (analysis.complianceScore < 70) {
      recommendations.push({
        category: 'Overall',
        severity: 'critical',
        issue: 'Low brand compliance score',
        suggestion: 'Review TEEI brand guidelines and adjust color usage significantly',
        score: analysis.complianceScore
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

  /**
   * Convert hex to LAB color space
   */
  hexToLab(hex) {
    const rgb = this.hexToRgb(hex);
    return this.rgbToLab(rgb);
  }

  /**
   * Convert RGB to LAB
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
}

module.exports = BrandColorValidator;
