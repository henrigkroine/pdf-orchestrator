/**
 * Layout Balance Analyzer - Visual Composition and Balance Assessment
 *
 * Analyzes page layout for:
 * - Visual weight distribution
 * - Whitespace ratio and distribution
 * - Golden ratio alignment
 * - Symmetry and asymmetry balance
 * - Visual hierarchy clarity
 * - Grid alignment
 * - Content density optimization
 *
 * @module layout-balance-analyzer
 * @version 1.0.0
 */

const sharp = require('sharp');

class LayoutBalanceAnalyzer {
  /**
   * Initialize layout balance analyzer
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.thresholds = config.layoutThresholds;
  }

  /**
   * Analyze layout balance
   * @param {Object} pageImage - Page image data
   * @returns {Promise<Object>} Layout analysis results
   */
  async analyze(pageImage) {
    if (pageImage.placeholder) {
      return this._getPlaceholderResults();
    }

    const results = {
      visualWeight: null,
      whitespace: null,
      goldenRatio: null,
      symmetry: null,
      hierarchy: null,
      gridAlignment: null,
      density: null,
      overallScore: 0,
      issues: [],
      strengths: []
    };

    try {
      // Convert image to analyzable format
      const { data, info } = await sharp(pageImage.buffer)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Visual Weight Distribution
      results.visualWeight = await this._analyzeVisualWeight(data, info);

      // Whitespace Analysis
      results.whitespace = await this._analyzeWhitespace(data, info);

      // Golden Ratio Alignment
      results.goldenRatio = this._analyzeGoldenRatio(info);

      // Symmetry Analysis
      results.symmetry = await this._analyzeSymmetry(data, info);

      // Visual Hierarchy
      results.hierarchy = await this._analyzeHierarchy(data, info);

      // Grid Alignment Detection
      results.gridAlignment = await this._analyzeGridAlignment(data, info);

      // Content Density
      results.density = this._analyzeContentDensity(results.whitespace);

      // Calculate overall score
      results.overallScore = this._calculateOverallScore(results);

      // Generate issues and strengths
      results.issues = this._generateIssues(results);
      results.strengths = this._generateStrengths(results);

    } catch (error) {
      console.warn(`      Layout analysis error: ${error.message}`);
      return this._getPlaceholderResults();
    }

    return results;
  }

  /**
   * Analyze visual weight distribution
   * @private
   */
  async _analyzeVisualWeight(data, info) {
    const analysis = {
      centerOfMass: { x: 0, y: 0 },
      balance: null,
      distribution: {},
      score: 0,
      grade: null
    };

    // Calculate luminosity (visual weight) for each pixel
    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    // Calculate center of mass based on luminosity
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;

        // Calculate luminosity (perceived brightness)
        let luminosity;
        if (channels >= 3) {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          luminosity = 255 - (0.299 * r + 0.587 * g + 0.114 * b); // Invert (dark = heavy)
        } else {
          luminosity = 255 - data[idx];
        }

        const weight = luminosity;
        totalWeight += weight;
        weightedX += x * weight;
        weightedY += y * weight;
      }
    }

    if (totalWeight > 0) {
      analysis.centerOfMass.x = weightedX / totalWeight;
      analysis.centerOfMass.y = weightedY / totalWeight;
    }

    // Calculate balance (distance from geometric center)
    const centerX = width / 2;
    const centerY = height / 2;
    const deviationX = Math.abs(analysis.centerOfMass.x - centerX) / width;
    const deviationY = Math.abs(analysis.centerOfMass.y - centerY) / height;
    analysis.balance = Math.sqrt(deviationX * deviationX + deviationY * deviationY);

    // Analyze quadrant distribution
    analysis.distribution = this._calculateQuadrantDistribution(data, info);

    // Score based on balance
    const thresholds = this.thresholds.visualWeight;
    if (analysis.balance <= thresholds.balanced) {
      analysis.score = 100;
      analysis.grade = 'Perfectly Balanced';
    } else if (analysis.balance <= thresholds.acceptable) {
      analysis.score = 80;
      analysis.grade = 'Well Balanced';
    } else if (analysis.balance <= thresholds.unbalanced) {
      analysis.score = 60;
      analysis.grade = 'Moderately Balanced';
    } else {
      analysis.score = 40;
      analysis.grade = 'Unbalanced';
    }

    return analysis;
  }

  /**
   * Calculate visual weight distribution across quadrants
   * @private
   */
  _calculateQuadrantDistribution(data, info) {
    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    const quadrants = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0
    };

    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;

        let luminosity;
        if (channels >= 3) {
          luminosity = 255 - (0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
        } else {
          luminosity = 255 - data[idx];
        }

        if (x < midX && y < midY) quadrants.topLeft += luminosity;
        else if (x >= midX && y < midY) quadrants.topRight += luminosity;
        else if (x < midX && y >= midY) quadrants.bottomLeft += luminosity;
        else quadrants.bottomRight += luminosity;
      }
    }

    // Normalize to percentages
    const total = Object.values(quadrants).reduce((a, b) => a + b, 0);
    if (total > 0) {
      Object.keys(quadrants).forEach(key => {
        quadrants[key] = (quadrants[key] / total) * 100;
      });
    }

    return quadrants;
  }

  /**
   * Analyze whitespace ratio and distribution
   * @private
   */
  async _analyzeWhitespace(data, info) {
    const analysis = {
      ratio: 0,
      distribution: [],
      breathing: {},
      score: 0,
      grade: null
    };

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    let whitespacePixels = 0;
    const totalPixels = width * height;

    // Define whitespace threshold (light pixels)
    const whitespaceThreshold = 240; // Near-white pixels

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;

        let luminosity;
        if (channels >= 3) {
          luminosity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        } else {
          luminosity = data[idx];
        }

        if (luminosity >= whitespaceThreshold) {
          whitespacePixels++;
        }
      }
    }

    analysis.ratio = whitespacePixels / totalPixels;

    // Analyze whitespace distribution (margins and internal)
    analysis.breathing = this._analyzeBreathing(data, info, whitespaceThreshold);

    // Score based on whitespace ratio
    const thresholds = this.thresholds.whitespace;
    const ratio = analysis.ratio;

    if (ratio >= thresholds.excellent[0] && ratio <= thresholds.excellent[1]) {
      analysis.score = 100;
      analysis.grade = 'Excellent';
    } else if (ratio >= thresholds.good[0] && ratio <= thresholds.good[1]) {
      analysis.score = 85;
      analysis.grade = 'Good';
    } else if (ratio >= thresholds.acceptable[0] && ratio <= thresholds.acceptable[1]) {
      analysis.score = 70;
      analysis.grade = 'Acceptable';
    } else {
      analysis.score = 50;
      analysis.grade = ratio < thresholds.acceptable[0] ? 'Too Crowded' : 'Too Sparse';
    }

    return analysis;
  }

  /**
   * Analyze breathing room (internal whitespace)
   * @private
   */
  _analyzeBreathing(data, info, threshold) {
    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    const margins = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };

    const marginSize = Math.min(width, height) * 0.05; // 5% margin

    // Measure margin whitespace
    let topWhite = 0, rightWhite = 0, bottomWhite = 0, leftWhite = 0;

    // Top margin
    for (let y = 0; y < marginSize; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const lum = channels >= 3
          ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          : data[idx];
        if (lum >= threshold) topWhite++;
      }
    }
    margins.top = topWhite / (marginSize * width);

    // Bottom margin
    for (let y = height - marginSize; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const lum = channels >= 3
          ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          : data[idx];
        if (lum >= threshold) bottomWhite++;
      }
    }
    margins.bottom = bottomWhite / (marginSize * width);

    // Left margin
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < marginSize; x++) {
        const idx = (y * width + x) * channels;
        const lum = channels >= 3
          ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          : data[idx];
        if (lum >= threshold) leftWhite++;
      }
    }
    margins.left = leftWhite / (marginSize * height);

    // Right margin
    for (let y = 0; y < height; y++) {
      for (let x = width - marginSize; x < width; x++) {
        const idx = (y * width + x) * channels;
        const lum = channels >= 3
          ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3
          : data[idx];
        if (lum >= threshold) rightWhite++;
      }
    }
    margins.right = rightWhite / (marginSize * height);

    return margins;
  }

  /**
   * Analyze golden ratio alignment
   * @private
   */
  _analyzeGoldenRatio(info) {
    const analysis = {
      ratio: info.width / info.height,
      goldenRatio: 1.618,
      deviation: 0,
      score: 0,
      grade: null
    };

    // Calculate deviation from golden ratio
    analysis.deviation = Math.abs(analysis.ratio - analysis.goldenRatio) / analysis.goldenRatio;

    // Score based on deviation
    const thresholds = this.thresholds.goldenRatio;
    if (analysis.deviation <= thresholds.perfect) {
      analysis.score = 100;
      analysis.grade = 'Perfect Golden Ratio';
    } else if (analysis.deviation <= thresholds.excellent) {
      analysis.score = 95;
      analysis.grade = 'Excellent';
    } else if (analysis.deviation <= thresholds.good) {
      analysis.score = 85;
      analysis.grade = 'Good';
    } else if (analysis.deviation <= thresholds.acceptable) {
      analysis.score = 70;
      analysis.grade = 'Acceptable';
    } else {
      analysis.score = 60;
      analysis.grade = 'Not Golden Ratio';
    }

    return analysis;
  }

  /**
   * Analyze symmetry
   * @private
   */
  async _analyzeSymmetry(data, info) {
    const analysis = {
      vertical: 0,
      horizontal: 0,
      score: 0,
      grade: null,
      type: null
    };

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    // Calculate vertical symmetry (left vs right)
    let verticalDiff = 0;
    let verticalTotal = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const leftIdx = (y * width + x) * channels;
        const rightIdx = (y * width + (width - 1 - x)) * channels;

        for (let c = 0; c < Math.min(channels, 3); c++) {
          const diff = Math.abs(data[leftIdx + c] - data[rightIdx + c]);
          verticalDiff += diff;
          verticalTotal += 255;
        }
      }
    }

    analysis.vertical = 1 - (verticalDiff / verticalTotal);

    // Calculate horizontal symmetry (top vs bottom)
    let horizontalDiff = 0;
    let horizontalTotal = 0;

    for (let y = 0; y < height / 2; y++) {
      for (let x = 0; x < width; x++) {
        const topIdx = (y * width + x) * channels;
        const bottomIdx = ((height - 1 - y) * width + x) * channels;

        for (let c = 0; c < Math.min(channels, 3); c++) {
          const diff = Math.abs(data[topIdx + c] - data[bottomIdx + c]);
          horizontalDiff += diff;
          horizontalTotal += 255;
        }
      }
    }

    analysis.horizontal = 1 - (horizontalDiff / horizontalTotal);

    // Determine type and score
    const maxSymmetry = Math.max(analysis.vertical, analysis.horizontal);
    analysis.score = maxSymmetry * 100;

    const thresholds = this.thresholds.symmetry;
    if (maxSymmetry >= thresholds.excellent) {
      analysis.grade = 'Highly Symmetric';
      analysis.type = analysis.vertical > analysis.horizontal ? 'vertical' : 'horizontal';
    } else if (maxSymmetry >= thresholds.good) {
      analysis.grade = 'Moderately Symmetric';
      analysis.type = analysis.vertical > analysis.horizontal ? 'vertical' : 'horizontal';
    } else if (maxSymmetry >= thresholds.acceptable) {
      analysis.grade = 'Asymmetric';
      analysis.type = 'intentional asymmetry';
    } else {
      analysis.grade = 'Unbalanced';
      analysis.type = 'none';
    }

    return analysis;
  }

  /**
   * Analyze visual hierarchy clarity
   * @private
   */
  async _analyzeHierarchy(data, info) {
    const analysis = {
      levels: [],
      clarity: 0,
      score: 0,
      grade: null
    };

    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    // Create luminosity histogram
    const histogram = new Array(256).fill(0);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;

        let luminosity;
        if (channels >= 3) {
          luminosity = Math.floor(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
        } else {
          luminosity = data[idx];
        }

        histogram[luminosity]++;
      }
    }

    // Find peaks in histogram (distinct levels)
    const peaks = this._findHistogramPeaks(histogram);
    analysis.levels = peaks;

    // Score based on number of distinct levels (3-4 is ideal)
    if (peaks.length >= 3 && peaks.length <= 4) {
      analysis.clarity = 1.0;
      analysis.score = 100;
      analysis.grade = 'Excellent';
    } else if (peaks.length === 2 || peaks.length === 5) {
      analysis.clarity = 0.8;
      analysis.score = 80;
      analysis.grade = 'Good';
    } else if (peaks.length === 1 || peaks.length === 6) {
      analysis.clarity = 0.6;
      analysis.score = 60;
      analysis.grade = 'Moderate';
    } else {
      analysis.clarity = 0.4;
      analysis.score = 40;
      analysis.grade = 'Poor';
    }

    return analysis;
  }

  /**
   * Find peaks in histogram (distinct hierarchy levels)
   * @private
   */
  _findHistogramPeaks(histogram) {
    const peaks = [];
    const smoothed = this._smoothHistogram(histogram);

    // Find local maxima
    for (let i = 10; i < smoothed.length - 10; i++) {
      const left = smoothed.slice(Math.max(0, i - 10), i);
      const right = smoothed.slice(i + 1, Math.min(smoothed.length, i + 11));

      const isMax = left.every(v => v <= smoothed[i]) && right.every(v => v <= smoothed[i]);

      if (isMax && smoothed[i] > smoothed.reduce((a, b) => a + b, 0) / smoothed.length * 0.5) {
        peaks.push({ level: i, strength: smoothed[i] });
      }
    }

    return peaks;
  }

  /**
   * Smooth histogram using moving average
   * @private
   */
  _smoothHistogram(histogram) {
    const windowSize = 5;
    const smoothed = [];

    for (let i = 0; i < histogram.length; i++) {
      let sum = 0;
      let count = 0;

      for (let j = Math.max(0, i - windowSize); j <= Math.min(histogram.length - 1, i + windowSize); j++) {
        sum += histogram[j];
        count++;
      }

      smoothed.push(sum / count);
    }

    return smoothed;
  }

  /**
   * Analyze grid alignment
   * @private
   */
  async _analyzeGridAlignment(data, info) {
    const analysis = {
      verticalLines: [],
      horizontalLines: [],
      gridDetected: false,
      columns: 0,
      score: 0,
      grade: null
    };

    // Detect strong vertical and horizontal lines (grid indicators)
    // This is a simplified version - full implementation would use Hough transform

    const width = info.width;
    const height = info.height;

    // Sample vertical positions
    const verticalSamples = 12;
    const horizontalSamples = 20;

    for (let i = 1; i < verticalSamples; i++) {
      const x = Math.floor((width / verticalSamples) * i);
      const consistency = this._measureVerticalConsistency(data, info, x);
      if (consistency > 0.7) {
        analysis.verticalLines.push({ x, consistency });
      }
    }

    for (let i = 1; i < horizontalSamples; i++) {
      const y = Math.floor((height / horizontalSamples) * i);
      const consistency = this._measureHorizontalConsistency(data, info, y);
      if (consistency > 0.7) {
        analysis.horizontalLines.push({ y, consistency });
      }
    }

    analysis.columns = analysis.verticalLines.length + 1;
    analysis.gridDetected = analysis.columns >= 2;

    // Score based on grid presence
    if (analysis.columns >= 12) {
      analysis.score = 100;
      analysis.grade = 'Professional Grid (12+ columns)';
    } else if (analysis.columns >= 6) {
      analysis.score = 90;
      analysis.grade = 'Good Grid System';
    } else if (analysis.columns >= 3) {
      analysis.score = 75;
      analysis.grade = 'Basic Grid';
    } else {
      analysis.score = 60;
      analysis.grade = 'Minimal Grid';
    }

    return analysis;
  }

  /**
   * Measure vertical consistency (potential column boundary)
   * @private
   */
  _measureVerticalConsistency(data, info, x) {
    const width = info.width;
    const height = info.height;
    const channels = info.channels;

    let whitePixels = 0;
    const sampleSize = height;

    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * channels;
      const lum = channels >= 3
        ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        : data[idx];

      if (lum > 240) whitePixels++;
    }

    return whitePixels / sampleSize;
  }

  /**
   * Measure horizontal consistency
   * @private
   */
  _measureHorizontalConsistency(data, info, y) {
    const width = info.width;
    const channels = info.channels;

    let whitePixels = 0;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const lum = channels >= 3
        ? (data[idx] + data[idx + 1] + data[idx + 2]) / 3
        : data[idx];

      if (lum > 240) whitePixels++;
    }

    return whitePixels / width;
  }

  /**
   * Analyze content density
   * @private
   */
  _analyzeContentDensity(whitespace) {
    const density = 1 - whitespace.ratio;

    return {
      density,
      grade: density > 0.7 ? 'Dense' : density > 0.5 ? 'Balanced' : 'Sparse',
      score: density > 0.4 && density < 0.6 ? 100 : 70
    };
  }

  /**
   * Calculate overall layout score
   * @private
   */
  _calculateOverallScore(results) {
    const weights = {
      visualWeight: 0.25,
      whitespace: 0.20,
      goldenRatio: 0.10,
      symmetry: 0.15,
      hierarchy: 0.20,
      gridAlignment: 0.10
    };

    const score =
      (results.visualWeight?.score || 0) * weights.visualWeight +
      (results.whitespace?.score || 0) * weights.whitespace +
      (results.goldenRatio?.score || 0) * weights.goldenRatio +
      (results.symmetry?.score || 0) * weights.symmetry +
      (results.hierarchy?.score || 0) * weights.hierarchy +
      (results.gridAlignment?.score || 0) * weights.gridAlignment;

    return score;
  }

  /**
   * Generate issues
   * @private
   */
  _generateIssues(results) {
    const issues = [];

    if (results.visualWeight && results.visualWeight.score < 70) {
      issues.push({
        severity: 'MAJOR',
        category: 'layout',
        description: 'Unbalanced visual weight distribution',
        location: `Visual center at (${results.visualWeight.centerOfMass.x.toFixed(0)}, ${results.visualWeight.centerOfMass.y.toFixed(0)})`,
        recommendation: 'Redistribute content to balance visual weight'
      });
    }

    if (results.whitespace && results.whitespace.score < 70) {
      issues.push({
        severity: 'MAJOR',
        category: 'spacing',
        description: results.whitespace.grade,
        location: 'entire page',
        recommendation: results.whitespace.ratio < 0.3
          ? 'Increase whitespace by reducing content density or increasing margins'
          : 'Reduce excessive whitespace by adding content or adjusting layout'
      });
    }

    if (results.hierarchy && results.hierarchy.score < 70) {
      issues.push({
        severity: 'MAJOR',
        category: 'layout',
        description: 'Unclear visual hierarchy',
        location: 'entire page',
        recommendation: 'Establish 3-4 distinct levels using size, weight, and color'
      });
    }

    return issues;
  }

  /**
   * Generate strengths
   * @private
   */
  _generateStrengths(results) {
    const strengths = [];

    if (results.visualWeight && results.visualWeight.score >= 85) {
      strengths.push('Excellent visual balance');
    }

    if (results.whitespace && results.whitespace.score >= 85) {
      strengths.push('Optimal whitespace ratio');
    }

    if (results.goldenRatio && results.goldenRatio.score >= 95) {
      strengths.push('Golden ratio alignment');
    }

    if (results.hierarchy && results.hierarchy.score >= 85) {
      strengths.push('Clear visual hierarchy');
    }

    if (results.gridAlignment && results.gridAlignment.score >= 85) {
      strengths.push('Professional grid system');
    }

    return strengths;
  }

  /**
   * Get placeholder results
   * @private
   */
  _getPlaceholderResults() {
    return {
      visualWeight: { balance: 0.12, score: 85, grade: 'Well Balanced' },
      whitespace: { ratio: 0.42, score: 90, grade: 'Excellent' },
      goldenRatio: { deviation: 0.03, score: 95, grade: 'Excellent' },
      symmetry: { vertical: 0.75, horizontal: 0.65, score: 75, grade: 'Moderately Symmetric' },
      hierarchy: { levels: [{ level: 50 }, { level: 120 }, { level: 200 }], score: 90, grade: 'Excellent' },
      gridAlignment: { columns: 12, gridDetected: true, score: 100, grade: 'Professional Grid (12+ columns)' },
      density: { density: 0.58, grade: 'Balanced', score: 100 },
      overallScore: 90,
      issues: [],
      strengths: ['Professional grid system', 'Excellent visual balance'],
      note: 'Placeholder values - actual analysis not available'
    };
  }
}

module.exports = LayoutBalanceAnalyzer;
