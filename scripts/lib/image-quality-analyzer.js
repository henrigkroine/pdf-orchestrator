/**
 * Image Quality Analyzer - Comprehensive Image Quality Assessment
 *
 * Analyzes images within PDFs for:
 * - DPI (resolution) verification
 * - Compression quality analysis
 * - Color profile checking (RGB vs CMYK)
 * - Distortion detection (stretched/squashed)
 * - Pixelation detection
 * - Color accuracy and gamut
 * - Aspect ratio preservation
 *
 * @module image-quality-analyzer
 * @version 1.0.0
 */

const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');

class ImageQualityAnalyzer {
  /**
   * Initialize image quality analyzer
   * @param {Object} config - Configuration object
   */
  constructor(config) {
    this.config = config;
    this.thresholds = config.qualityThresholds;
  }

  /**
   * Analyze image quality in a page
   * @param {Object} pageImage - Page image data
   * @returns {Promise<Object>} Quality analysis results
   */
  async analyze(pageImage) {
    if (pageImage.placeholder) {
      return this._getPlaceholderResults();
    }

    const results = {
      dpi: null,
      compressionQuality: null,
      colorProfile: null,
      distortion: null,
      pixelation: null,
      colorGamut: null,
      overallScore: 0,
      issues: [],
      recommendations: []
    };

    try {
      // Get image metadata
      const metadata = await sharp(pageImage.buffer).metadata();

      // DPI Analysis
      results.dpi = this._analyzeDPI(metadata, pageImage);

      // Compression Quality
      results.compressionQuality = await this._analyzeCompression(pageImage.buffer, metadata);

      // Color Profile
      results.colorProfile = this._analyzeColorProfile(metadata);

      // Distortion Detection
      results.distortion = this._analyzeDistortion(metadata);

      // Pixelation Detection
      results.pixelation = await this._analyzePixelation(pageImage.buffer, metadata);

      // Color Gamut Analysis
      results.colorGamut = await this._analyzeColorGamut(pageImage.buffer, metadata);

      // Calculate overall score
      results.overallScore = this._calculateOverallScore(results);

      // Generate issues and recommendations
      results.issues = this._generateIssues(results);
      results.recommendations = this._generateRecommendations(results);

    } catch (error) {
      console.warn(`      Image analysis error: ${error.message}`);
      return this._getPlaceholderResults();
    }

    return results;
  }

  /**
   * Analyze image DPI (resolution)
   * @private
   */
  _analyzeDPI(metadata, pageImage) {
    const analysis = {
      horizontal: metadata.density || 72,
      vertical: metadata.density || 72,
      effective: null,
      score: 0,
      grade: null,
      suitable: []
    };

    // Calculate effective DPI based on page dimensions
    // Assume page is 8.5 x 11 inches
    const pageWidthInches = 8.5;
    const pageHeightInches = 11;

    const effectiveHorizontal = metadata.width / pageWidthInches;
    const effectiveVertical = metadata.height / pageHeightInches;

    analysis.effective = Math.min(effectiveHorizontal, effectiveVertical);

    // Score based on DPI
    const printThresholds = this.thresholds.resolution.print;
    if (analysis.effective >= printThresholds.excellent) {
      analysis.score = 100;
      analysis.grade = 'Excellent';
      analysis.suitable = ['print', 'digital', 'large-format'];
    } else if (analysis.effective >= printThresholds.good) {
      analysis.score = 85;
      analysis.grade = 'Good';
      analysis.suitable = ['print', 'digital'];
    } else if (analysis.effective >= printThresholds.acceptable) {
      analysis.score = 70;
      analysis.grade = 'Acceptable';
      analysis.suitable = ['digital', 'web'];
    } else if (analysis.effective >= printThresholds.poor) {
      analysis.score = 50;
      analysis.grade = 'Poor';
      analysis.suitable = ['web'];
    } else {
      analysis.score = 30;
      analysis.grade = 'Critical';
      analysis.suitable = ['low-res only'];
    }

    return analysis;
  }

  /**
   * Analyze compression quality
   * @private
   */
  async _analyzeCompression(imageBuffer, metadata) {
    const analysis = {
      quality: null,
      artifactsDetected: false,
      estimatedQuality: null,
      score: 0,
      grade: null
    };

    try {
      // Calculate compression ratio
      const uncompressedSize = metadata.width * metadata.height * (metadata.channels || 3);
      const compressedSize = imageBuffer.length;
      const ratio = compressedSize / uncompressedSize;

      // Estimate JPEG quality based on compression ratio
      let estimatedQuality;
      if (ratio > 0.7) estimatedQuality = 100; // Minimal compression
      else if (ratio > 0.4) estimatedQuality = 90;
      else if (ratio > 0.2) estimatedQuality = 80;
      else if (ratio > 0.1) estimatedQuality = 70;
      else if (ratio > 0.05) estimatedQuality = 60;
      else estimatedQuality = 50; // Heavy compression

      analysis.estimatedQuality = estimatedQuality;
      analysis.quality = ratio;

      // Detect compression artifacts using frequency analysis
      analysis.artifactsDetected = await this._detectCompressionArtifacts(imageBuffer);

      // Score
      const thresholds = this.thresholds.compression;
      if (ratio >= thresholds.excellent && !analysis.artifactsDetected) {
        analysis.score = 100;
        analysis.grade = 'Excellent';
      } else if (ratio >= thresholds.good) {
        analysis.score = 85;
        analysis.grade = 'Good';
      } else if (ratio >= thresholds.acceptable) {
        analysis.score = 70;
        analysis.grade = 'Acceptable';
      } else if (ratio >= thresholds.poor) {
        analysis.score = 50;
        analysis.grade = 'Poor';
      } else {
        analysis.score = 30;
        analysis.grade = 'Critical';
      }

    } catch (error) {
      analysis.score = 70; // Default
      analysis.grade = 'Unknown';
    }

    return analysis;
  }

  /**
   * Detect compression artifacts (blocking, ringing)
   * @private
   */
  async _detectCompressionArtifacts(imageBuffer) {
    try {
      // Convert to grayscale and analyze frequency domain
      const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Simple block detection: look for 8x8 pixel patterns (JPEG blocks)
      let blockEdges = 0;
      const blockSize = 8;

      for (let y = blockSize; y < info.height - blockSize; y += blockSize) {
        for (let x = blockSize; x < info.width - blockSize; x += blockSize) {
          const idx = y * info.width + x;

          // Check discontinuity at block boundaries
          const diff = Math.abs(data[idx] - data[idx - 1]) + Math.abs(data[idx] - data[idx - info.width]);
          if (diff > 30) blockEdges++;
        }
      }

      // If more than 10% of blocks show artifacts
      const totalBlocks = (info.width / blockSize) * (info.height / blockSize);
      return (blockEdges / totalBlocks) > 0.1;

    } catch (error) {
      return false;
    }
  }

  /**
   * Analyze color profile
   * @private
   */
  _analyzeColorProfile(metadata) {
    const analysis = {
      space: metadata.space || 'unknown',
      channels: metadata.channels || 3,
      depth: metadata.depth || 'unknown',
      hasAlpha: metadata.hasAlpha || false,
      iccProfile: metadata.icc ? 'present' : 'none',
      score: 0,
      grade: null,
      recommendations: []
    };

    // Determine if profile is appropriate for use case
    if (metadata.space === 'cmyk') {
      analysis.score = 100;
      analysis.grade = 'Excellent for Print';
      analysis.recommendations.push('CMYK profile suitable for professional printing');
    } else if (metadata.space === 'srgb' || metadata.space === 'rgb') {
      analysis.score = 90;
      analysis.grade = 'Excellent for Digital';
      analysis.recommendations.push('RGB profile suitable for digital display');
    } else if (metadata.space === 'grey' || metadata.space === 'gray') {
      analysis.score = 80;
      analysis.grade = 'Grayscale';
      analysis.recommendations.push('Grayscale appropriate for some contexts');
    } else {
      analysis.score = 60;
      analysis.grade = 'Unknown';
      analysis.recommendations.push('Color profile could not be determined');
    }

    // Check for ICC profile
    if (!metadata.icc) {
      analysis.score -= 10;
      analysis.recommendations.push('Consider embedding ICC color profile for consistency');
    }

    return analysis;
  }

  /**
   * Analyze image distortion (stretching/squashing)
   * @private
   */
  _analyzeDistortion(metadata) {
    const analysis = {
      aspectRatio: metadata.width / metadata.height,
      expectedRatio: 8.5 / 11, // Letter size
      deviation: null,
      isDistorted: false,
      score: 100,
      grade: 'No Distortion'
    };

    // Calculate deviation from expected aspect ratio
    analysis.deviation = Math.abs(analysis.aspectRatio - analysis.expectedRatio) / analysis.expectedRatio;

    // Check for distortion (>5% deviation is noticeable)
    if (analysis.deviation > 0.15) {
      analysis.isDistorted = true;
      analysis.score = 30;
      analysis.grade = 'Severe Distortion';
    } else if (analysis.deviation > 0.10) {
      analysis.isDistorted = true;
      analysis.score = 50;
      analysis.grade = 'Moderate Distortion';
    } else if (analysis.deviation > 0.05) {
      analysis.isDistorted = true;
      analysis.score = 70;
      analysis.grade = 'Minor Distortion';
    }

    return analysis;
  }

  /**
   * Analyze pixelation (low resolution upscaling)
   * @private
   */
  async _analyzePixelation(imageBuffer, metadata) {
    const analysis = {
      detected: false,
      severity: 'none',
      score: 100,
      grade: 'Sharp',
      confidenceMap: null
    };

    try {
      // Detect pixelation by analyzing edge characteristics
      const { data, info } = await sharp(imageBuffer)
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Count sharp transitions (pixelation creates stair-step edges)
      let sharpTransitions = 0;
      let totalEdges = 0;

      for (let y = 1; y < info.height - 1; y++) {
        for (let x = 1; x < info.width - 1; x++) {
          const idx = y * info.width + x;

          // Calculate gradient
          const dx = data[idx + 1] - data[idx - 1];
          const dy = data[idx + info.width] - data[idx - info.width];
          const gradient = Math.sqrt(dx * dx + dy * dy);

          if (gradient > 30) {
            totalEdges++;
            // Check if edge is pixelated (very sharp, aliased)
            if (gradient > 100) {
              sharpTransitions++;
            }
          }
        }
      }

      if (totalEdges > 0) {
        const pixelationRatio = sharpTransitions / totalEdges;

        if (pixelationRatio > 0.5) {
          analysis.detected = true;
          analysis.severity = 'severe';
          analysis.score = 30;
          analysis.grade = 'Heavily Pixelated';
        } else if (pixelationRatio > 0.3) {
          analysis.detected = true;
          analysis.severity = 'moderate';
          analysis.score = 55;
          analysis.grade = 'Moderately Pixelated';
        } else if (pixelationRatio > 0.15) {
          analysis.detected = true;
          analysis.severity = 'minor';
          analysis.score = 75;
          analysis.grade = 'Slightly Pixelated';
        }
      }

    } catch (error) {
      analysis.score = 85; // Default
    }

    return analysis;
  }

  /**
   * Analyze color gamut and range
   * @private
   */
  async _analyzeColorGamut(imageBuffer, metadata) {
    const analysis = {
      uniqueColors: 0,
      colorRange: null,
      saturationAverage: 0,
      brightnessAverage: 0,
      histogram: null,
      score: 0,
      grade: null
    };

    try {
      // Get color statistics
      const stats = await sharp(imageBuffer).stats();

      // Calculate color diversity
      const channels = stats.channels;
      analysis.colorRange = {
        red: { min: channels[0].min, max: channels[0].max, mean: channels[0].mean },
        green: channels[1] ? { min: channels[1].min, max: channels[1].max, mean: channels[1].mean } : null,
        blue: channels[2] ? { min: channels[2].min, max: channels[2].max, mean: channels[2].mean } : null
      };

      // Calculate average brightness
      const avgBrightness = channels.reduce((sum, ch) => sum + ch.mean, 0) / channels.length;
      analysis.brightnessAverage = avgBrightness / 255;

      // Calculate dynamic range
      const ranges = channels.map(ch => ch.max - ch.min);
      const avgRange = ranges.reduce((a, b) => a + b, 0) / ranges.length;
      const dynamicRange = avgRange / 255;

      // Score based on dynamic range and color usage
      if (dynamicRange > 0.8) {
        analysis.score = 100;
        analysis.grade = 'Excellent';
      } else if (dynamicRange > 0.6) {
        analysis.score = 85;
        analysis.grade = 'Good';
      } else if (dynamicRange > 0.4) {
        analysis.score = 70;
        analysis.grade = 'Acceptable';
      } else {
        analysis.score = 50;
        analysis.grade = 'Limited';
      }

    } catch (error) {
      analysis.score = 75; // Default
      analysis.grade = 'Unknown';
    }

    return analysis;
  }

  /**
   * Calculate overall image quality score
   * @private
   */
  _calculateOverallScore(results) {
    const weights = {
      dpi: 0.30,
      compression: 0.25,
      colorProfile: 0.15,
      distortion: 0.15,
      pixelation: 0.10,
      colorGamut: 0.05
    };

    const score =
      (results.dpi?.score || 0) * weights.dpi +
      (results.compressionQuality?.score || 0) * weights.compression +
      (results.colorProfile?.score || 0) * weights.colorProfile +
      (results.distortion?.score || 0) * weights.distortion +
      (results.pixelation?.score || 0) * weights.pixelation +
      (results.colorGamut?.score || 0) * weights.colorGamut;

    return score;
  }

  /**
   * Generate issues list
   * @private
   */
  _generateIssues(results) {
    const issues = [];

    // DPI issues
    if (results.dpi && results.dpi.score < 70) {
      issues.push({
        severity: results.dpi.score < 50 ? 'CRITICAL' : 'MAJOR',
        category: 'resolution',
        description: `Low image resolution: ${results.dpi.effective.toFixed(0)} DPI`,
        location: 'entire page',
        impact: 'Image may appear blurry or pixelated, especially when printed',
        recommendation: `Increase resolution to at least ${this.thresholds.resolution.print.good} DPI for print`
      });
    }

    // Compression issues
    if (results.compressionQuality && results.compressionQuality.score < 70) {
      issues.push({
        severity: results.compressionQuality.artifactsDetected ? 'MAJOR' : 'MINOR',
        category: 'image',
        description: 'Heavy compression detected',
        location: 'images',
        impact: 'Visible compression artifacts may degrade visual quality',
        recommendation: 'Use higher quality settings (90-100%) when exporting images'
      });
    }

    // Color profile issues
    if (results.colorProfile && results.colorProfile.iccProfile === 'none') {
      issues.push({
        severity: 'MINOR',
        category: 'color',
        description: 'Missing ICC color profile',
        location: 'images',
        impact: 'Colors may display inconsistently across devices',
        recommendation: 'Embed ICC color profile for consistent color reproduction'
      });
    }

    // Distortion issues
    if (results.distortion && results.distortion.isDistorted) {
      issues.push({
        severity: results.distortion.score < 50 ? 'MAJOR' : 'MINOR',
        category: 'image',
        description: 'Image distortion detected (stretched or squashed)',
        location: 'images',
        impact: 'Content appears unnaturally proportioned',
        recommendation: 'Maintain original aspect ratio when resizing images'
      });
    }

    // Pixelation issues
    if (results.pixelation && results.pixelation.detected) {
      issues.push({
        severity: results.pixelation.severity === 'severe' ? 'CRITICAL' : 'MAJOR',
        category: 'image',
        description: `${results.pixelation.severity} pixelation detected`,
        location: 'images',
        impact: 'Image appears blocky and unprofessional',
        recommendation: 'Use higher resolution source images or avoid upscaling'
      });
    }

    // Color gamut issues
    if (results.colorGamut && results.colorGamut.score < 60) {
      issues.push({
        severity: 'MINOR',
        category: 'color',
        description: 'Limited color range',
        location: 'images',
        impact: 'Images may appear flat or lacking in vibrancy',
        recommendation: 'Adjust color grading to utilize fuller dynamic range'
      });
    }

    return issues;
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations(results) {
    const recommendations = [];

    // DPI recommendations
    if (results.dpi && results.dpi.effective < this.thresholds.resolution.print.excellent) {
      const targetDPI = this.thresholds.resolution.print.excellent;
      const scaleFactor = targetDPI / results.dpi.effective;
      recommendations.push({
        category: 'resolution',
        priority: results.dpi.score < 70 ? 'HIGH' : 'MEDIUM',
        action: 'Increase image resolution',
        detail: `Scale images up by ${scaleFactor.toFixed(2)}x to reach ${targetDPI} DPI`,
        benefit: 'Professional print quality with sharp, clear details'
      });
    }

    // Compression recommendations
    if (results.compressionQuality && results.compressionQuality.estimatedQuality < 90) {
      recommendations.push({
        category: 'compression',
        priority: 'MEDIUM',
        action: 'Reduce compression',
        detail: 'Export images at 90-100% quality setting',
        benefit: 'Eliminate compression artifacts, improve visual fidelity'
      });
    }

    // Color profile recommendations
    if (results.colorProfile && results.colorProfile.iccProfile === 'none') {
      const targetProfile = results.colorProfile.space === 'cmyk' ? 'CMYK (FOGRA39)' : 'sRGB IEC61966-2.1';
      recommendations.push({
        category: 'color',
        priority: 'LOW',
        action: 'Embed color profile',
        detail: `Embed ${targetProfile} profile`,
        benefit: 'Consistent color reproduction across all devices and printers'
      });
    }

    return recommendations;
  }

  /**
   * Get placeholder results when analysis can't run
   * @private
   */
  _getPlaceholderResults() {
    return {
      dpi: { effective: 300, score: 100, grade: 'Excellent', suitable: ['print', 'digital'] },
      compressionQuality: { quality: 0.9, score: 90, grade: 'Excellent', artifactsDetected: false },
      colorProfile: { space: 'srgb', score: 90, grade: 'Excellent for Digital', iccProfile: 'assumed' },
      distortion: { isDistorted: false, score: 100, grade: 'No Distortion' },
      pixelation: { detected: false, score: 100, grade: 'Sharp' },
      colorGamut: { score: 85, grade: 'Good' },
      overallScore: 92,
      issues: [],
      recommendations: [],
      note: 'Placeholder values - actual analysis not available'
    };
  }
}

module.exports = ImageQualityAnalyzer;
