/**
 * Style Consistency Checker
 *
 * Ensures visual consistency across icon sets and illustrations
 *
 * Features:
 * - Style matching and validation
 * - Color palette consistency
 * - Visual weight balancing
 * - Size and proportion checking
 * - Brand guideline compliance
 *
 * @module style-consistency
 */

const Anthropic = require('@anthropic-ai/sdk');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

class StyleConsistency {
  constructor(config = {}) {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.config = config;

    // TEEI brand colors
    this.teeiColors = {
      primary: {
        nordshore: '#00393F',
        sky: '#C9E4EC',
        sand: '#FFF1E2',
        beige: '#EFE1DC'
      },
      accent: {
        moss: '#65873B',
        gold: '#BA8F5A',
        clay: '#913B2F'
      }
    };

    // Style guidelines
    this.styleGuidelines = {
      iconSize: {
        small: 64,
        medium: 128,
        large: 256,
        xlarge: 512
      },
      spacing: {
        minimum: 8,
        comfortable: 16,
        generous: 24
      },
      lineWeight: {
        thin: 1,
        regular: 2,
        medium: 3,
        bold: 4
      },
      contrast: {
        minimum: 4.5, // WCAG AA
        enhanced: 7.0  // WCAG AAA
      }
    };
  }

  /**
   * Check consistency across icon set
   */
  async checkIconSetConsistency(iconPaths, options = {}) {
    console.log(`\n🔍 Checking consistency across ${iconPaths.length} icons...`);

    const icons = [];

    // Analyze each icon
    for (let i = 0; i < iconPaths.length; i++) {
      const iconPath = iconPaths[i];
      console.log(`  [${i + 1}/${iconPaths.length}] Analyzing: ${path.basename(iconPath)}`);

      const analysis = await this.analyzeIcon(iconPath);
      icons.push({
        path: iconPath,
        name: path.basename(iconPath),
        ...analysis
      });
    }

    // Compare consistency
    const consistency = this.compareConsistency(icons);

    // Generate report
    const report = this.generateConsistencyReport(icons, consistency);

    console.log(`\n📊 Consistency Score: ${consistency.overallScore}/10`);

    return {
      icons,
      consistency,
      report
    };
  }

  /**
   * Analyze individual icon
   */
  async analyzeIcon(iconPath) {
    try {
      const image = await sharp(iconPath);
      const metadata = await image.metadata();
      const stats = await image.stats();

      // Extract dominant colors
      const colors = await this.extractColors(iconPath);

      // Calculate visual weight
      const visualWeight = this.calculateVisualWeight(stats);

      // Check dimensions
      const aspectRatio = metadata.width / metadata.height;

      return {
        dimensions: {
          width: metadata.width,
          height: metadata.height,
          aspectRatio: aspectRatio.toFixed(2)
        },
        colors,
        visualWeight,
        fileSize: metadata.size
      };
    } catch (error) {
      console.error(`  ❌ Failed to analyze ${path.basename(iconPath)}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extract dominant colors
   */
  async extractColors(imagePath) {
    try {
      const image = await sharp(imagePath);
      const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });

      const colorCounts = {};
      const pixelCount = info.width * info.height;

      // Sample pixels (not all for performance)
      const sampleRate = 10;

      for (let i = 0; i < data.length; i += info.channels * sampleRate) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = info.channels === 4 ? data[i + 3] : 255;

        // Skip transparent pixels
        if (a < 128) continue;

        // Convert to hex
        const hex = this.rgbToHex(r, g, b);

        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      // Get top colors
      const sortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color, count]) => ({
          color,
          percentage: ((count / pixelCount) * 100 * sampleRate).toFixed(1)
        }));

      return sortedColors;
    } catch (error) {
      console.error(`  ⚠️  Color extraction failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Calculate visual weight
   */
  calculateVisualWeight(stats) {
    // Calculate based on average pixel intensity
    const avgIntensity = (stats.channels[0].mean + stats.channels[1].mean + stats.channels[2].mean) / 3;

    // Normalize to 0-10 scale (lower intensity = heavier visual weight)
    const weight = 10 - (avgIntensity / 255 * 10);

    return {
      value: weight.toFixed(1),
      intensity: avgIntensity.toFixed(0),
      interpretation: weight > 7 ? 'heavy' : weight > 4 ? 'medium' : 'light'
    };
  }

  /**
   * Compare consistency across icons
   */
  compareConsistency(icons) {
    const scores = {
      colorConsistency: this.checkColorConsistency(icons),
      sizeConsistency: this.checkSizeConsistency(icons),
      weightConsistency: this.checkWeightConsistency(icons),
      aspectRatioConsistency: this.checkAspectRatioConsistency(icons)
    };

    // Calculate overall score (0-10)
    const overallScore = (
      scores.colorConsistency.score +
      scores.sizeConsistency.score +
      scores.weightConsistency.score +
      scores.aspectRatioConsistency.score
    ) / 4;

    return {
      ...scores,
      overallScore: overallScore.toFixed(1)
    };
  }

  /**
   * Check color consistency
   */
  checkColorConsistency(icons) {
    const allColors = icons.flatMap(icon => icon.colors || []);

    if (allColors.length === 0) {
      return { score: 5, message: 'No color data available' };
    }

    // Check if colors match TEEI palette
    const teeiColorSet = new Set(Object.values(this.teeiColors.primary).concat(Object.values(this.teeiColors.accent)));

    let matchingColors = 0;
    let totalColors = 0;

    for (const icon of icons) {
      if (!icon.colors) continue;

      for (const { color } of icon.colors) {
        totalColors++;
        const upperColor = color.toUpperCase();

        // Check exact match or close match
        if (teeiColorSet.has(upperColor) || this.isCloseToTeeiColor(upperColor)) {
          matchingColors++;
        }
      }
    }

    const matchRate = totalColors > 0 ? matchingColors / totalColors : 0;
    const score = matchRate * 10;

    return {
      score: score.toFixed(1),
      matchRate: (matchRate * 100).toFixed(0) + '%',
      message: score >= 7 ? 'Excellent color consistency' :
               score >= 5 ? 'Good color consistency' :
               'Colors need alignment with TEEI palette',
      recommendation: score < 7 ? 'Normalize colors to TEEI brand palette' : null
    };
  }

  /**
   * Check size consistency
   */
  checkSizeConsistency(icons) {
    const widths = icons.map(i => i.dimensions?.width).filter(Boolean);
    const heights = icons.map(i => i.dimensions?.height).filter(Boolean);

    if (widths.length === 0) {
      return { score: 5, message: 'No dimension data available' };
    }

    const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
    const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

    // Calculate variance
    const widthVariance = Math.sqrt(
      widths.reduce((sum, w) => sum + Math.pow(w - avgWidth, 2), 0) / widths.length
    );
    const heightVariance = Math.sqrt(
      heights.reduce((sum, h) => sum + Math.pow(h - avgHeight, 2), 0) / heights.length
    );

    // Lower variance = better consistency
    const varianceScore = 10 - Math.min(10, (widthVariance + heightVariance) / avgWidth * 10);

    return {
      score: Math.max(0, varianceScore).toFixed(1),
      averageSize: `${Math.round(avgWidth)}x${Math.round(avgHeight)}`,
      variance: `±${Math.round((widthVariance + heightVariance) / 2)}px`,
      message: varianceScore >= 7 ? 'Excellent size consistency' :
               varianceScore >= 5 ? 'Good size consistency' :
               'Size variation is too high',
      recommendation: varianceScore < 7 ? 'Resize icons to consistent dimensions' : null
    };
  }

  /**
   * Check visual weight consistency
   */
  checkWeightConsistency(icons) {
    const weights = icons.map(i => parseFloat(i.visualWeight?.value)).filter(w => !isNaN(w));

    if (weights.length === 0) {
      return { score: 5, message: 'No visual weight data available' };
    }

    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

    const variance = Math.sqrt(
      weights.reduce((sum, w) => sum + Math.pow(w - avgWeight, 2), 0) / weights.length
    );

    // Lower variance = better consistency
    const score = 10 - Math.min(10, variance * 2);

    return {
      score: Math.max(0, score).toFixed(1),
      averageWeight: avgWeight.toFixed(1),
      variance: variance.toFixed(2),
      message: score >= 7 ? 'Excellent visual weight consistency' :
               score >= 5 ? 'Good visual weight consistency' :
               'Visual weight varies too much',
      recommendation: score < 7 ? 'Balance visual weight across icons' : null
    };
  }

  /**
   * Check aspect ratio consistency
   */
  checkAspectRatioConsistency(icons) {
    const ratios = icons.map(i => parseFloat(i.dimensions?.aspectRatio)).filter(r => !isNaN(r));

    if (ratios.length === 0) {
      return { score: 5, message: 'No aspect ratio data available' };
    }

    // Check if all ratios are close to 1:1 (square)
    const targetRatio = 1.0;
    const tolerance = 0.1;

    const consistentRatios = ratios.filter(r => Math.abs(r - targetRatio) <= tolerance);
    const consistencyRate = consistentRatios.length / ratios.length;

    const score = consistencyRate * 10;

    return {
      score: score.toFixed(1),
      consistencyRate: (consistencyRate * 100).toFixed(0) + '%',
      message: score >= 7 ? 'Excellent aspect ratio consistency' :
               score >= 5 ? 'Good aspect ratio consistency' :
               'Aspect ratios are inconsistent',
      recommendation: score < 7 ? 'Normalize to square (1:1) aspect ratio' : null
    };
  }

  /**
   * Check if color is close to TEEI palette
   */
  isCloseToTeeiColor(hexColor) {
    const teeiColors = Object.values(this.teeiColors.primary).concat(Object.values(this.teeiColors.accent));

    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return false;

    for (const teeiHex of teeiColors) {
      const teeiRgb = this.hexToRgb(teeiHex);
      if (!teeiRgb) continue;

      // Calculate color distance
      const distance = Math.sqrt(
        Math.pow(rgb.r - teeiRgb.r, 2) +
        Math.pow(rgb.g - teeiRgb.g, 2) +
        Math.pow(rgb.b - teeiRgb.b, 2)
      );

      // If distance is less than threshold, consider it close
      if (distance < 50) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate consistency report
   */
  generateConsistencyReport(icons, consistency) {
    const report = {
      summary: {
        totalIcons: icons.length,
        overallScore: consistency.overallScore,
        grade: this.scoreToGrade(parseFloat(consistency.overallScore))
      },
      scores: {
        colorConsistency: consistency.colorConsistency,
        sizeConsistency: consistency.sizeConsistency,
        weightConsistency: consistency.weightConsistency,
        aspectRatioConsistency: consistency.aspectRatioConsistency
      },
      recommendations: this.generateRecommendations(consistency),
      iconDetails: icons.map(icon => ({
        name: icon.name,
        dimensions: icon.dimensions,
        dominantColors: icon.colors?.slice(0, 3),
        visualWeight: icon.visualWeight
      }))
    };

    return report;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(consistency) {
    const recommendations = [];

    if (consistency.colorConsistency.recommendation) {
      recommendations.push({
        priority: 'high',
        category: 'color',
        action: consistency.colorConsistency.recommendation
      });
    }

    if (consistency.sizeConsistency.recommendation) {
      recommendations.push({
        priority: 'medium',
        category: 'size',
        action: consistency.sizeConsistency.recommendation
      });
    }

    if (consistency.weightConsistency.recommendation) {
      recommendations.push({
        priority: 'medium',
        category: 'weight',
        action: consistency.weightConsistency.recommendation
      });
    }

    if (consistency.aspectRatioConsistency.recommendation) {
      recommendations.push({
        priority: 'low',
        category: 'aspect-ratio',
        action: consistency.aspectRatioConsistency.recommendation
      });
    }

    return recommendations;
  }

  /**
   * Convert score to letter grade
   */
  scoreToGrade(score) {
    if (score >= 9) return 'A+';
    if (score >= 8) return 'A';
    if (score >= 7) return 'B';
    if (score >= 6) return 'C';
    if (score >= 5) return 'D';
    return 'F';
  }

  /**
   * RGB to Hex conversion
   */
  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  }

  /**
   * Hex to RGB conversion
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}

module.exports = StyleConsistency;
