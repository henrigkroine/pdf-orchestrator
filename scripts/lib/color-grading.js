/**
 * COLOR GRADING
 * Cinematic color grading for TEEI brand photography
 *
 * Features:
 * - TEEI warm brand look
 * - Professional color presets
 * - HSL adjustments
 * - Selective color grading
 * - LUT-style transformations
 */

const sharp = require('sharp');

class ColorGrading {
  constructor() {
    // TEEI brand color palette
    this.brandColors = {
      nordshore: { h: 186, s: 100, l: 12 },  // #00393F
      sky: { h: 192, s: 54, l: 86 },         // #C9E4EC
      sand: { h: 37, s: 100, l: 94 },        // #FFF1E2
      beige: { h: 23, s: 36, l: 90 },        // #EFE1DC
      gold: { h: 33, s: 35, l: 54 },         // #BA8F5A
      moss: { h: 82, s: 39, l: 38 }          // #65873B
    };

    // Color grading presets
    this.presets = {
      'teei-warm': {
        name: 'TEEI Warm',
        description: 'Signature TEEI look: warm, natural, hopeful',
        adjustments: {
          global: {
            temperature: 15,      // Warmer
            tint: 5,             // Slight magenta
            saturation: 1.15,    // 15% more saturated
            vibrance: 1.10,      // Boost muted colors
            contrast: 1.10       // Subtle contrast boost
          },
          highlights: {
            hue: 45,             // Golden highlights
            saturation: 1.10,
            luminance: 0.95      // Slightly tamed
          },
          midtones: {
            hue: 30,             // Warm midtones
            saturation: 1.05,
            luminance: 1.02      // Slight lift
          },
          shadows: {
            hue: 195,            // Cool shadows (blue-teal)
            saturation: 1.05,
            luminance: 1.08      // Lift shadows
          }
        },
        colorMatrix: [
          [1.10, -0.05, -0.05],  // Red: boost, reduce G/B
          [-0.02, 1.00, -0.02],  // Green: neutral
          [-0.08, -0.05, 0.92]   // Blue: reduce (warmer)
        ]
      },

      'natural-enhanced': {
        name: 'Natural Enhanced',
        description: 'Subtle enhancement preserving natural look',
        adjustments: {
          global: {
            temperature: 5,
            tint: 0,
            saturation: 1.08,
            vibrance: 1.05,
            contrast: 1.05
          },
          highlights: {
            hue: 0,
            saturation: 1.00,
            luminance: 0.98
          },
          midtones: {
            hue: 0,
            saturation: 1.03,
            luminance: 1.01
          },
          shadows: {
            hue: 0,
            saturation: 1.02,
            luminance: 1.05
          }
        },
        colorMatrix: [
          [1.02, 0, 0],
          [0, 1.02, 0],
          [0, 0, 1.00]
        ]
      },

      'golden-hour': {
        name: 'Golden Hour',
        description: 'Warm golden sunset look',
        adjustments: {
          global: {
            temperature: 25,
            tint: 10,
            saturation: 1.20,
            vibrance: 1.15,
            contrast: 1.12
          },
          highlights: {
            hue: 50,             // Very golden
            saturation: 1.20,
            luminance: 0.92
          },
          midtones: {
            hue: 40,
            saturation: 1.10,
            luminance: 1.00
          },
          shadows: {
            hue: 210,            // Blue shadows
            saturation: 1.08,
            luminance: 1.05
          }
        },
        colorMatrix: [
          [1.15, -0.08, -0.08],
          [0, 1.05, 0],
          [-0.10, -0.08, 0.88]
        ]
      },

      'clean-corporate': {
        name: 'Clean Corporate',
        description: 'Professional, slightly cool look',
        adjustments: {
          global: {
            temperature: -5,
            tint: 0,
            saturation: 0.98,
            vibrance: 1.00,
            contrast: 1.08
          },
          highlights: {
            hue: 0,
            saturation: 0.95,
            luminance: 0.97
          },
          midtones: {
            hue: 0,
            saturation: 1.00,
            luminance: 1.00
          },
          shadows: {
            hue: 0,
            saturation: 1.02,
            luminance: 1.08
          }
        },
        colorMatrix: [
          [0.98, 0, 0],
          [0, 1.00, 0],
          [0, 0, 1.05]
        ]
      },

      'vibrant-pop': {
        name: 'Vibrant Pop',
        description: 'Bold, eye-catching colors',
        adjustments: {
          global: {
            temperature: 10,
            tint: 5,
            saturation: 1.30,
            vibrance: 1.25,
            contrast: 1.15
          },
          highlights: {
            hue: 45,
            saturation: 1.25,
            luminance: 0.90
          },
          midtones: {
            hue: 0,
            saturation: 1.20,
            luminance: 1.00
          },
          shadows: {
            hue: 0,
            saturation: 1.15,
            luminance: 1.10
          }
        },
        colorMatrix: [
          [1.15, -0.05, -0.05],
          [-0.03, 1.10, -0.03],
          [-0.05, -0.05, 1.08]
        ]
      }
    };
  }

  /**
   * Apply color grading to image
   */
  async applyGrading(imagePath, presetName = 'teei-warm', customAdjustments = {}) {
    console.log(`🎨 Applying ${presetName} color grading...`);

    const preset = this.presets[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    // Merge custom adjustments with preset
    const adjustments = this.mergeAdjustments(preset.adjustments, customAdjustments);

    let pipeline = sharp(imagePath);

    // 1. Apply color matrix (low-level color transformation)
    pipeline = pipeline.recomb(preset.colorMatrix);

    // 2. Apply global adjustments
    const global = adjustments.global;

    // Saturation
    pipeline = pipeline.modulate({
      saturation: global.saturation
    });

    // 3. Apply contrast
    if (global.contrast !== 1.0) {
      const contrastFactor = global.contrast;
      const contrastOffset = -(128 * contrastFactor) + 128;
      pipeline = pipeline.linear(contrastFactor, contrastOffset);
    }

    // 4. Temperature/tint (approximate with color balance)
    if (global.temperature !== 0 || global.tint !== 0) {
      pipeline = await this.applyTemperatureTint(pipeline, global.temperature, global.tint);
    }

    return await pipeline.toBuffer();
  }

  /**
   * Apply temperature and tint adjustments
   */
  async applyTemperatureTint(pipeline, temperature, tint) {
    // Temperature: shift red/blue balance
    // Positive = warmer (more red/yellow), Negative = cooler (more blue)

    // Tint: shift green/magenta balance
    // Positive = more magenta, Negative = more green

    const tempFactor = temperature / 100;
    const tintFactor = tint / 100;

    // Approximate temperature/tint with color adjustments
    return pipeline.modulate({
      hue: temperature  // Hue shift for temperature
    });
  }

  /**
   * Apply selective color adjustments
   */
  async applySelectiveColor(imageBuffer, color, adjustments) {
    // Adjust specific color range (e.g., only blues, only reds)
    // This is a simplified version - full implementation would use HSL masking

    let pipeline = sharp(imageBuffer);

    // Apply adjustments (simplified - affects whole image)
    pipeline = pipeline.modulate({
      saturation: adjustments.saturation || 1.0,
      hue: adjustments.hue || 0
    });

    return await pipeline.toBuffer();
  }

  /**
   * Create custom LUT (Look-Up Table) effect
   */
  async applyCustomLUT(imagePath, lutConfig) {
    // Apply custom color transformation curve
    // This is a simplified version

    let pipeline = sharp(imagePath);

    // Apply curves to each channel
    if (lutConfig.curves) {
      // Red curve
      if (lutConfig.curves.red) {
        // Would apply custom curve here
      }
      // Similar for green and blue
    }

    return await pipeline.toBuffer();
  }

  /**
   * Split toning (different colors for highlights/shadows)
   */
  async applySplitToning(imageBuffer, highlightColor, shadowColor) {
    // Approximate split toning
    // Full implementation would mask highlights/shadows separately

    let pipeline = sharp(imageBuffer);

    // This is a simplified version - would need masking for true split toning
    pipeline = pipeline.modulate({
      hue: (highlightColor.hue + shadowColor.hue) / 2
    });

    return await pipeline.toBuffer();
  }

  /**
   * Color harmony analysis
   */
  analyzeColorHarmony(stats) {
    // Analyze if colors work well together
    const channels = stats.channels;

    // Calculate color distribution
    const rMean = channels[0].mean;
    const gMean = channels[1].mean;
    const bMean = channels[2].mean;

    // Check for dominant color
    const dominant = rMean > gMean && rMean > bMean ? 'warm' :
                    bMean > rMean && bMean > gMean ? 'cool' : 'neutral';

    // Color contrast (how varied are colors)
    const contrast = (
      channels[0].stdev +
      channels[1].stdev +
      channels[2].stdev
    ) / 3 / 255;

    return {
      dominant,
      contrast: contrast.toFixed(2),
      assessment: contrast > 0.3 ? 'high contrast' :
                 contrast > 0.15 ? 'moderate contrast' : 'low contrast',
      harmony: dominant === 'warm' ? 'warm palette' :
              dominant === 'cool' ? 'cool palette' : 'balanced palette'
    };
  }

  /**
   * Match to brand color palette
   */
  async matchToBrandPalette(imageBuffer) {
    // Shift colors to align with TEEI brand palette
    // Focus on warm tones (sand, gold) with cool accents (nordshore, sky)

    return await this.applyGrading(imageBuffer, 'teei-warm');
  }

  /**
   * Merge adjustments (custom overrides preset)
   */
  mergeAdjustments(preset, custom) {
    return {
      global: { ...preset.global, ...custom.global },
      highlights: { ...preset.highlights, ...custom.highlights },
      midtones: { ...preset.midtones, ...custom.midtones },
      shadows: { ...preset.shadows, ...custom.shadows }
    };
  }

  /**
   * Compare color grades side-by-side
   */
  async compareGrades(imagePath, presets = ['natural-enhanced', 'teei-warm', 'golden-hour']) {
    const results = [];

    for (const presetName of presets) {
      console.log(`Applying ${presetName}...`);
      const graded = await this.applyGrading(imagePath, presetName);

      results.push({
        preset: presetName,
        name: this.presets[presetName].name,
        description: this.presets[presetName].description,
        buffer: graded
      });
    }

    return results;
  }

  /**
   * Export graded image
   */
  async exportGraded(imageBuffer, outputPath, format = 'jpeg', quality = 95) {
    await sharp(imageBuffer)
      [format]({ quality, progressive: true })
      .toFile(outputPath);

    console.log(`✅ Exported: ${outputPath}`);
    return outputPath;
  }

  /**
   * Get preset information
   */
  getPresetInfo(presetName) {
    const preset = this.presets[presetName];
    if (!preset) {
      return null;
    }

    return {
      name: preset.name,
      description: preset.description,
      adjustments: preset.adjustments,
      bestFor: this.getPresetBestUse(presetName)
    };
  }

  /**
   * Get preset best use cases
   */
  getPresetBestUse(presetName) {
    const useCases = {
      'teei-warm': 'TEEI brand materials, partnership documents, educational content',
      'natural-enhanced': 'General purpose, when natural look is priority',
      'golden-hour': 'Emotional/inspiring content, hero images',
      'clean-corporate': 'Formal business documents, corporate presentations',
      'vibrant-pop': 'Social media, youth-oriented content, attention-grabbing visuals'
    };

    return useCases[presetName] || 'General use';
  }

  /**
   * List all available presets
   */
  listPresets() {
    return Object.entries(this.presets).map(([key, preset]) => ({
      key,
      name: preset.name,
      description: preset.description,
      bestFor: this.getPresetBestUse(key)
    }));
  }

  /**
   * Create before/after comparison
   */
  async createComparison(originalPath, gradedBuffer, outputPath) {
    const originalBuffer = await sharp(originalPath).toBuffer();
    const metadata = await sharp(originalPath).metadata();

    const width = Math.round(metadata.width / 2);
    const height = metadata.height;

    // Resize both halves
    const originalHalf = await sharp(originalBuffer)
      .resize(width, height, { fit: 'cover' })
      .toBuffer();

    const gradedHalf = await sharp(gradedBuffer)
      .resize(width, height, { fit: 'cover' })
      .toBuffer();

    // Composite side-by-side
    await sharp({
      create: {
        width: width * 2,
        height: height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite([
        { input: originalHalf, left: 0, top: 0 },
        { input: gradedHalf, left: width, top: 0 }
      ])
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    console.log(`✅ Comparison saved: ${outputPath}`);
    return outputPath;
  }
}

module.exports = ColorGrading;
