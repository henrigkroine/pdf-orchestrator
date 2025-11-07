/**
 * PHOTO ENHANCER
 * AI-powered photography enhancement system
 *
 * Features:
 * - Intelligent auto-enhancement
 * - TEEI brand color grading
 * - Smart cropping and composition
 * - Quality optimization
 * - Batch processing
 */

const sharp = require('sharp');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

class PhotoEnhancer {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || config.anthropicKey
    });

    // TEEI brand colors for color grading
    this.brandColors = {
      nordshore: { r: 0, g: 57, b: 63 },
      sky: { r: 201, g: 228, b: 236 },
      sand: { r: 255, g: 241, b: 226 },
      beige: { r: 239, g: 225, b: 220 },
      gold: { r: 186, g: 143, b: 90 },
      moss: { r: 101, g: 135, b: 59 }
    };

    // Enhancement presets
    this.presets = {
      'teei-warm': {
        name: 'TEEI Warm',
        description: 'Warm, natural tones aligned with TEEI brand',
        adjustments: {
          brightness: 1.05,
          contrast: 1.1,
          saturation: 1.15,
          temperature: 10, // Warmer
          tint: 5,         // Slight magenta
          shadows: 1.1,    // Lift shadows
          highlights: 0.95, // Tame highlights
          sharpness: 1.2
        }
      },
      'natural': {
        name: 'Natural',
        description: 'Subtle enhancements preserving natural look',
        adjustments: {
          brightness: 1.02,
          contrast: 1.05,
          saturation: 1.05,
          temperature: 0,
          tint: 0,
          shadows: 1.05,
          highlights: 0.98,
          sharpness: 1.1
        }
      },
      'vibrant': {
        name: 'Vibrant',
        description: 'Bold, eye-catching colors',
        adjustments: {
          brightness: 1.08,
          contrast: 1.15,
          saturation: 1.25,
          temperature: 5,
          tint: 0,
          shadows: 1.15,
          highlights: 0.92,
          sharpness: 1.3
        }
      },
      'professional': {
        name: 'Professional',
        description: 'Clean, corporate look',
        adjustments: {
          brightness: 1.03,
          contrast: 1.08,
          saturation: 0.98,
          temperature: -5, // Slightly cooler
          tint: 0,
          shadows: 1.08,
          highlights: 0.95,
          sharpness: 1.15
        }
      }
    };
  }

  /**
   * Enhance photo with AI-powered analysis
   */
  async enhancePhoto(imagePath, options = {}) {
    console.log(`📸 Enhancing: ${path.basename(imagePath)}`);

    try {
      // 1. Analyze image
      console.log('  🔍 Analyzing image...');
      const analysis = await this.analyzeImage(imagePath);

      // 2. Get AI recommendations
      console.log('  🤖 Getting AI recommendations...');
      const recommendations = await this.getAIRecommendations(imagePath, analysis, options);

      // 3. Apply enhancements
      console.log('  ✨ Applying enhancements...');
      const enhanced = await this.applyEnhancements(imagePath, analysis, recommendations, options);

      // 4. Color grade for TEEI brand
      console.log('  🎨 Applying color grading...');
      const graded = await this.colorGrade(enhanced, options.preset || 'teei-warm');

      // 5. Intelligent crop (if requested)
      let final = graded;
      if (options.autoCrop) {
        console.log('  ✂️ Intelligent cropping...');
        final = await this.intelligentCrop(graded, analysis, options);
      }

      // 6. Optimize for output
      console.log('  ⚡ Optimizing...');
      const optimized = await this.optimize(final, options);

      console.log('  ✅ Enhancement complete!');

      return {
        enhanced: optimized,
        original: imagePath,
        analysis: analysis,
        recommendations: recommendations,
        metadata: {
          preset: options.preset || 'teei-warm',
          autoCropped: !!options.autoCrop,
          enhanced: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`  ❌ Enhancement failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze image characteristics
   */
  async analyzeImage(imagePath) {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Calculate average brightness
    const avgBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length / 255;

    // Calculate contrast (standard deviation)
    const avgContrast = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length / 255;

    // Determine if image is generally warm or cool
    const rMean = stats.channels[0]?.mean || 0;
    const bMean = stats.channels[2]?.mean || 0;
    const temperature = (rMean - bMean) / 255; // Positive = warm, negative = cool

    return {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
        aspectRatio: metadata.width / metadata.height
      },
      brightness: {
        score: avgBrightness,
        assessment: avgBrightness < 0.3 ? 'dark' :
                   avgBrightness > 0.7 ? 'bright' : 'normal'
      },
      contrast: {
        score: avgContrast,
        assessment: avgContrast < 0.15 ? 'low' :
                   avgContrast > 0.3 ? 'high' : 'normal'
      },
      temperature: {
        value: temperature,
        assessment: temperature > 0.1 ? 'warm' :
                   temperature < -0.1 ? 'cool' : 'neutral'
      },
      format: metadata.format,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation || 1,
      composition: {
        landscape: metadata.width > metadata.height,
        portrait: metadata.height > metadata.width,
        square: Math.abs(metadata.width - metadata.height) < 100
      }
    };
  }

  /**
   * Get AI-powered enhancement recommendations
   */
  async getAIRecommendations(imagePath, analysis, options) {
    try {
      // Read image as base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const prompt = `Analyze this photograph and provide enhancement recommendations:

IMAGE ANALYSIS:
- Brightness: ${analysis.brightness.assessment} (${(analysis.brightness.score * 100).toFixed(1)}%)
- Contrast: ${analysis.contrast.assessment} (${(analysis.contrast.score * 100).toFixed(1)}%)
- Temperature: ${analysis.temperature.assessment}
- Composition: ${analysis.composition.landscape ? 'Landscape' : analysis.composition.portrait ? 'Portrait' : 'Square'}

CONTEXT:
- Purpose: ${options.purpose || 'Professional/educational document'}
- Brand: TEEI (warm, natural, hopeful aesthetic)
- Target: ${options.target || 'Print and digital use'}

Provide recommendations for:
1. Brightness adjustment (if needed)
2. Contrast enhancement
3. Color adjustments (saturation, temperature)
4. Sharpness
5. Crop suggestions (rule of thirds, composition)
6. Overall aesthetic direction

Return JSON:
{
  "brightness": { "adjust": -0.1 to 0.1, "reason": "..." },
  "contrast": { "adjust": -0.1 to 0.1, "reason": "..." },
  "saturation": { "adjust": -0.2 to 0.2, "reason": "..." },
  "temperature": { "adjust": -10 to 10, "reason": "..." },
  "sharpness": { "level": 0.8 to 1.5, "reason": "..." },
  "crop": {
    "recommended": true/false,
    "type": "rule-of-thirds|golden-ratio|center",
    "reason": "..."
  },
  "overall": "Overall assessment and key recommendation"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('  ⚠️ AI recommendations failed, using analysis-based defaults:', error.message);
      return this.fallbackRecommendations(analysis);
    }
  }

  /**
   * Fallback recommendations based on analysis
   */
  fallbackRecommendations(analysis) {
    const recs = {
      brightness: { adjust: 0, reason: 'Normal brightness' },
      contrast: { adjust: 0, reason: 'Normal contrast' },
      saturation: { adjust: 0.05, reason: 'Slight saturation boost for vibrancy' },
      temperature: { adjust: 5, reason: 'Warm tones for TEEI brand' },
      sharpness: { level: 1.1, reason: 'Subtle sharpening for clarity' },
      crop: { recommended: false, type: 'none', reason: 'Composition appears balanced' },
      overall: 'Apply standard enhancements'
    };

    // Adjust based on analysis
    if (analysis.brightness.score < 0.35) {
      recs.brightness.adjust = 0.1;
      recs.brightness.reason = 'Image is dark, brightening needed';
    } else if (analysis.brightness.score > 0.75) {
      recs.brightness.adjust = -0.05;
      recs.brightness.reason = 'Image is bright, slight reduction';
    }

    if (analysis.contrast.score < 0.12) {
      recs.contrast.adjust = 0.1;
      recs.contrast.reason = 'Low contrast, boost needed';
    }

    if (analysis.temperature.assessment === 'cool') {
      recs.temperature.adjust = 10;
      recs.temperature.reason = 'Cool tones, warming for TEEI brand';
    }

    return recs;
  }

  /**
   * Apply enhancements based on recommendations
   */
  async applyEnhancements(imagePath, analysis, recommendations, options) {
    let pipeline = sharp(imagePath);

    // Get preset adjustments
    const preset = this.presets[options.preset || 'teei-warm'];
    const adj = preset.adjustments;

    // Combine preset with AI recommendations
    const brightness = 1 + (recommendations.brightness?.adjust || 0);
    const contrast = adj.contrast;
    const saturation = adj.saturation + (recommendations.saturation?.adjust || 0);

    // Apply modulation (brightness, saturation, hue)
    pipeline = pipeline.modulate({
      brightness: brightness * adj.brightness,
      saturation: saturation
    });

    // Apply contrast (using linear transformation)
    const contrastFactor = contrast;
    const contrastOffset = -(128 * contrastFactor) + 128;
    pipeline = pipeline.linear(contrastFactor, contrastOffset);

    // Apply sharpening
    const sharpness = recommendations.sharpness?.level || adj.sharpness;
    pipeline = pipeline.sharpen({
      sigma: 0.5 + (sharpness - 1) * 2,
      m1: 0.5,
      m2: 0.5,
      x1: 2,
      y2: 10,
      y3: 20
    });

    // Normalize (auto-level)
    pipeline = pipeline.normalize();

    return await pipeline.toBuffer();
  }

  /**
   * Apply color grading
   */
  async colorGrade(imageBuffer, presetName = 'teei-warm') {
    const preset = this.presets[presetName];

    let pipeline = sharp(imageBuffer);

    // Apply color matrix for TEEI warm look
    if (presetName === 'teei-warm') {
      // Boost reds/oranges (warm), reduce blues (cool)
      pipeline = pipeline.recomb([
        [1.1, -0.05, -0.05],  // Red: boost reds, reduce green/blue
        [-0.02, 1.0, -0.02],  // Green: neutral
        [-0.08, -0.05, 0.92]  // Blue: reduce blues for warmth
      ]);

      // Subtle golden tint to highlights
      pipeline = pipeline.modulate({
        hue: 45 // Golden hue shift
      });
    }

    return await pipeline.toBuffer();
  }

  /**
   * Intelligent cropping using AI
   */
  async intelligentCrop(imageBuffer, analysis, options) {
    try {
      // Convert buffer to base64 for AI analysis
      const base64Image = imageBuffer.toString('base64');

      const prompt = `Suggest optimal crop for this image using compositional rules:

Current dimensions: ${analysis.dimensions.width}x${analysis.dimensions.height}

Apply:
- Rule of thirds
- Golden ratio
- Visual balance
- Subject prominence

Target aspect ratio: ${options.aspectRatio || 'maintain'}

Return JSON:
{
  "crop": {
    "left": pixels_from_left,
    "top": pixels_from_top,
    "width": crop_width,
    "height": crop_height
  },
  "reasoning": "Why this crop improves composition"
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const result = JSON.parse(response.choices[0].message.content);

      // Apply crop
      return await sharp(imageBuffer)
        .extract({
          left: Math.round(result.crop.left),
          top: Math.round(result.crop.top),
          width: Math.round(result.crop.width),
          height: Math.round(result.crop.height)
        })
        .toBuffer();

    } catch (error) {
      console.error('  ⚠️ AI crop failed, using center crop:', error.message);
      return await this.centerCrop(imageBuffer, options);
    }
  }

  /**
   * Center crop fallback
   */
  async centerCrop(imageBuffer, options) {
    const metadata = await sharp(imageBuffer).metadata();
    const targetRatio = options.aspectRatio || 1.5; // Default to 3:2

    let width = metadata.width;
    let height = metadata.height;
    let left = 0;
    let top = 0;

    const currentRatio = width / height;

    if (currentRatio > targetRatio) {
      // Too wide, crop sides
      width = Math.round(height * targetRatio);
      left = Math.round((metadata.width - width) / 2);
    } else if (currentRatio < targetRatio) {
      // Too tall, crop top/bottom
      height = Math.round(width / targetRatio);
      top = Math.round((metadata.height - height) / 2);
    }

    return await sharp(imageBuffer)
      .extract({ left, top, width, height })
      .toBuffer();
  }

  /**
   * Optimize for output
   */
  async optimize(imageBuffer, options) {
    const format = options.format || 'jpeg';
    const quality = options.quality || 90;

    let pipeline = sharp(imageBuffer);

    // Resize if specified
    if (options.maxWidth || options.maxHeight) {
      pipeline = pipeline.resize(options.maxWidth, options.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert to specified format
    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({
        quality,
        progressive: true,
        chromaSubsampling: '4:4:4'
      });
    } else if (format === 'png') {
      pipeline = pipeline.png({
        quality,
        compressionLevel: 9
      });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({
        quality,
        lossless: false
      });
    }

    return await pipeline.toBuffer();
  }

  /**
   * Batch enhance photos
   */
  async batchEnhance(imagePaths, options = {}) {
    console.log(`📸 Batch enhancing ${imagePaths.length} photos...`);

    const results = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      console.log(`\n[${i + 1}/${imagePaths.length}] Processing: ${path.basename(imagePath)}`);

      try {
        const result = await this.enhancePhoto(imagePath, options);
        results.push({
          success: true,
          original: imagePath,
          ...result
        });
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        results.push({
          success: false,
          original: imagePath,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`\n✅ Batch complete: ${successCount}/${imagePaths.length} successful`);

    return results;
  }

  /**
   * Compare before/after
   */
  async createBeforeAfter(original, enhanced, options = {}) {
    const originalBuffer = await fs.readFile(original);
    const enhancedBuffer = enhanced instanceof Buffer ? enhanced : await fs.readFile(enhanced);

    // Resize both to same dimensions
    const metadata = await sharp(originalBuffer).metadata();
    const width = Math.round(metadata.width / 2);
    const height = metadata.height;

    const originalResized = await sharp(originalBuffer)
      .resize(width, height, { fit: 'cover' })
      .toBuffer();

    const enhancedResized = await sharp(enhancedBuffer)
      .resize(width, height, { fit: 'cover' })
      .toBuffer();

    // Composite side-by-side
    const comparison = await sharp({
      create: {
        width: width * 2,
        height: height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
      .composite([
        { input: originalResized, left: 0, top: 0 },
        { input: enhancedResized, left: width, top: 0 }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    return comparison;
  }

  /**
   * Get MIME type from file path
   */
  getMimeType(filepath) {
    const ext = path.extname(filepath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  /**
   * Save enhanced photo
   */
  async saveEnhanced(result, outputPath) {
    await fs.writeFile(outputPath, result.enhanced);
    console.log(`✅ Saved: ${outputPath}`);
    return outputPath;
  }

  /**
   * Generate enhancement report
   */
  generateReport(results) {
    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return {
      summary: {
        total: results.length,
        successful: successCount,
        failed: failCount,
        successRate: ((successCount / results.length) * 100).toFixed(1) + '%'
      },
      enhancements: results.map(r => ({
        image: path.basename(r.original),
        success: r.success,
        preset: r.metadata?.preset,
        brightness: r.analysis?.brightness?.assessment,
        contrast: r.analysis?.contrast?.assessment,
        recommendations: r.recommendations?.overall
      }))
    };
  }
}

module.exports = PhotoEnhancer;
