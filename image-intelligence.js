#!/usr/bin/env node
/**
 * IMAGE INTELLIGENCE ENGINE
 * Intelligent image placement and optimization for TEEI PDF documents
 *
 * Features:
 * - Automatic sizing to fill frames without distortion
 * - Logo clearspace enforcement (minimum = logo height)
 * - AI-powered hero image generation with DALL-E 3
 * - Image quality optimization (300 DPI print, 150+ digital)
 * - Photo overlays with brand colors and correct opacity
 * - Rule of thirds / golden ratio cropping
 * - Authentic photography sourcing aligned with TEEI brand
 *
 * Usage:
 *   const ImageIntelligence = require('./image-intelligence.js');
 *   const imageAI = new ImageIntelligence();
 *   await imageAI.placeImageInFrame(imagePath, frameWidth, frameHeight);
 *   await imageAI.generateHeroImage('AWS partnership', options);
 *   await imageAI.applyBrandOverlay(imagePath, 'nordshore', 0.4);
 *
 * @module image-intelligence
 */

const sharp = require('sharp');
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// Import existing specialized modules
const PhotoComposition = require('./scripts/lib/photo-composition.js');
const PhotoEnhancer = require('./scripts/lib/photo-enhancer.js');

class ImageIntelligence {
  constructor(config = {}) {
    // Initialize AI clients
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || config.anthropicKey
    });

    // Initialize specialized modules
    this.compositionAnalyzer = new PhotoComposition(config);
    this.photoEnhancer = new PhotoEnhancer(config);

    // TEEI Brand Guidelines - Official Colors
    this.brandColors = {
      // Primary Colors (80% usage recommended)
      nordshore: { hex: '#00393F', rgb: { r: 0, g: 57, b: 63 }, name: 'Nordshore', usage: 'primary' },
      sky: { hex: '#C9E4EC', rgb: { r: 201, g: 228, b: 236 }, name: 'Sky', usage: 'secondary' },
      sand: { hex: '#FFF1E2', rgb: { r: 255, g: 241, b: 226 }, name: 'Sand', usage: 'background' },
      beige: { hex: '#EFE1DC', rgb: { r: 239, g: 225, b: 220 }, name: 'Beige', usage: 'background' },

      // Accent Colors (20% usage)
      moss: { hex: '#65873B', rgb: { r: 101, g: 135, b: 59 }, name: 'Moss', usage: 'accent' },
      gold: { hex: '#BA8F5A', rgb: { r: 186, g: 143, b: 90 }, name: 'Gold', usage: 'accent' },
      clay: { hex: '#913B2F', rgb: { r: 147, g: 59, b: 47 }, name: 'Clay', usage: 'accent' }
    };

    // Image quality presets
    this.qualityPresets = {
      print: {
        dpi: 300,
        quality: 95,
        format: 'png',
        colorSpace: 'srgb',
        description: 'High-quality for print (300 DPI)'
      },
      digital: {
        dpi: 150,
        quality: 85,
        format: 'jpeg',
        colorSpace: 'srgb',
        description: 'Optimized for digital (150 DPI)'
      },
      web: {
        dpi: 72,
        quality: 80,
        format: 'webp',
        colorSpace: 'srgb',
        description: 'Web-optimized (72 DPI)'
      },
      premium: {
        dpi: 600,
        quality: 100,
        format: 'png',
        colorSpace: 'srgb',
        description: 'Premium quality (600 DPI)'
      }
    };

    // Photography requirements from TEEI brand guidelines
    this.photographyGuidelines = {
      lighting: 'Natural lighting (not studio)',
      tones: 'Warm color tones aligned with Sand/Beige palette',
      authenticity: 'Authentic moments (not staged corporate stock)',
      diversity: 'Diverse representation required',
      emotion: 'Shows connection, hope, and empowerment',
      style: 'Photorealistic, professional, warm atmosphere'
    };

    // Output directory
    this.outputDir = config.outputDir || path.join(process.cwd(), 'assets/images/generated');
    this.cacheDir = config.cacheDir || path.join(process.cwd(), 'assets/cache/images');

    // Ensure directories exist
    this.initDirectories();
  }

  async initDirectories() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.cacheDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'heroes'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'optimized'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'overlays'), { recursive: true });
  }

  // ============================================================
  // CORE FEATURE 1: INTELLIGENT IMAGE SIZING & PLACEMENT
  // ============================================================

  /**
   * Automatically size and crop image to fill frame without distortion
   * Uses object-fit: cover behavior - fills frame while maintaining aspect ratio
   *
   * @param {string} imagePath - Path to source image
   * @param {number} frameWidth - Target frame width in pixels
   * @param {number} frameHeight - Target frame height in pixels
   * @param {Object} options - Placement options
   * @returns {Promise<Buffer>} - Optimized image buffer
   */
  async placeImageInFrame(imagePath, frameWidth, frameHeight, options = {}) {
    console.log(`\n📐 Sizing image for frame: ${frameWidth}x${frameHeight}px`);

    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      console.log(`  Original: ${metadata.width}x${metadata.height}px`);

      // Calculate aspect ratios
      const imageAspect = metadata.width / metadata.height;
      const frameAspect = frameWidth / frameHeight;

      let resizeOptions = {
        width: frameWidth,
        height: frameHeight,
        fit: options.fit || 'cover', // cover, contain, fill, inside, outside
        position: options.position || 'center', // center, top, bottom, left, right
        withoutEnlargement: options.noEnlarge || false
      };

      // Intelligent positioning based on composition analysis
      if (options.smartPosition) {
        console.log('  🎯 Analyzing composition for smart positioning...');
        const composition = await this.compositionAnalyzer.analyzeComposition(imagePath);

        // Use golden ratio focal point for positioning
        if (composition.goldenRatio) {
          const focalX = composition.goldenRatio.focalPoint.x / metadata.width;
          const focalY = composition.goldenRatio.focalPoint.y / metadata.height;

          // Convert to sharp position strategy
          if (focalX < 0.33) resizeOptions.position = 'left';
          else if (focalX > 0.66) resizeOptions.position = 'right';
          if (focalY < 0.33) resizeOptions.position = 'top';
          else if (focalY > 0.66) resizeOptions.position = 'bottom';

          console.log(`  📍 Smart position: ${resizeOptions.position}`);
        }
      }

      // Apply brand color grading if requested
      let processedImage = image.resize(resizeOptions);

      if (options.brandGrading) {
        console.log('  🎨 Applying TEEI brand color grading...');
        processedImage = processedImage
          .modulate({
            brightness: 1.05,  // Slightly brighter
            saturation: 1.1,   // More vibrant
            hue: 10            // Warmer tones (toward Sand/Beige)
          });
      }

      // Optimize quality based on output type
      const quality = options.quality || this.qualityPresets.digital;
      console.log(`  ⚙️ Quality preset: ${quality.description}`);

      let outputBuffer;
      if (quality.format === 'jpeg') {
        outputBuffer = await processedImage.jpeg({ quality: quality.quality }).toBuffer();
      } else if (quality.format === 'png') {
        outputBuffer = await processedImage.png({ quality: quality.quality }).toBuffer();
      } else if (quality.format === 'webp') {
        outputBuffer = await processedImage.webp({ quality: quality.quality }).toBuffer();
      } else {
        outputBuffer = await processedImage.toBuffer();
      }

      console.log(`  ✅ Image sized: ${frameWidth}x${frameHeight}px (${quality.format})`);

      return outputBuffer;

    } catch (error) {
      console.error(`  ❌ Image sizing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Intelligent cropping using rule of thirds or golden ratio
   *
   * @param {string} imagePath - Path to image
   * @param {Object} options - Crop options
   * @returns {Promise<Object>} - Cropped image info
   */
  async intelligentCrop(imagePath, options = {}) {
    console.log('\n✂️ Intelligent cropping...');

    try {
      // Analyze composition
      const composition = await this.compositionAnalyzer.analyzeComposition(imagePath);
      const metadata = await sharp(imagePath).metadata();

      let cropStrategy = options.strategy || 'golden-ratio'; // 'rule-of-thirds', 'golden-ratio', 'ai-guided'

      let cropArea = {};

      if (cropStrategy === 'rule-of-thirds') {
        // Crop to emphasize power points
        const powerPoint = composition.ruleOfThirds.powerPoints[0]; // Top-left by default
        cropArea = {
          left: Math.max(0, powerPoint.x - (metadata.width / 3)),
          top: Math.max(0, powerPoint.y - (metadata.height / 3)),
          width: Math.min(metadata.width, metadata.width * 0.66),
          height: Math.min(metadata.height, metadata.height * 0.66)
        };
        console.log('  📐 Using rule of thirds crop');
      } else if (cropStrategy === 'golden-ratio') {
        // Crop using golden ratio proportions
        const focal = composition.goldenRatio.focalPoint;
        const phi = 1.618;
        cropArea = {
          left: Math.max(0, focal.x - (metadata.width / (2 * phi))),
          top: Math.max(0, focal.y - (metadata.height / (2 * phi))),
          width: Math.min(metadata.width, metadata.width / phi),
          height: Math.min(metadata.height, metadata.height / phi)
        };
        console.log('  φ Using golden ratio crop');
      } else if (cropStrategy === 'ai-guided') {
        // Use AI vision to determine best crop
        const aiCrop = await this.getAIGuidedCrop(imagePath, metadata);
        cropArea = aiCrop.cropArea;
        console.log('  🤖 Using AI-guided crop');
      }

      // Apply crop
      const croppedBuffer = await sharp(imagePath)
        .extract({
          left: Math.floor(cropArea.left),
          top: Math.floor(cropArea.top),
          width: Math.floor(cropArea.width),
          height: Math.floor(cropArea.height)
        })
        .toBuffer();

      // Save cropped version
      const outputPath = path.join(
        this.outputDir,
        'optimized',
        `${path.basename(imagePath, path.extname(imagePath))}-cropped${path.extname(imagePath)}`
      );
      await fs.writeFile(outputPath, croppedBuffer);

      console.log(`  ✅ Cropped and saved: ${outputPath}`);

      return {
        path: outputPath,
        buffer: croppedBuffer,
        cropArea,
        strategy: cropStrategy,
        composition
      };

    } catch (error) {
      console.error(`  ❌ Intelligent crop failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * AI-guided crop using vision analysis
   */
  async getAIGuidedCrop(imagePath, metadata) {
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `Analyze this image and suggest the optimal crop area for maximum visual impact.

Image dimensions: ${metadata.width}x${metadata.height}px

Consider:
1. Main subject/focal point
2. Rule of thirds
3. Negative space
4. Leading lines
5. Visual balance

Return JSON with:
{
  "cropArea": {
    "left": <pixels from left>,
    "top": <pixels from top>,
    "width": <crop width>,
    "height": <crop height>
  },
  "reasoning": "<why this crop works>"
}`
            }
          ]
        }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`  ⚠️ AI crop analysis failed, using fallback: ${error.message}`);
    }

    // Fallback: center crop
    return {
      cropArea: {
        left: metadata.width * 0.125,
        top: metadata.height * 0.125,
        width: metadata.width * 0.75,
        height: metadata.height * 0.75
      },
      reasoning: 'Fallback: center crop with 75% area'
    };
  }

  // ============================================================
  // CORE FEATURE 2: LOGO CLEARSPACE ENFORCEMENT
  // ============================================================

  /**
   * Calculate and enforce logo clearspace (minimum = logo height)
   * Per TEEI brand guidelines: clearspace = height of logo icon element
   *
   * @param {string} logoPath - Path to logo image
   * @param {Object} options - Clearspace options
   * @returns {Promise<Object>} - Clearspace specifications
   */
  async calculateLogoClearspace(logoPath, options = {}) {
    console.log('\n📏 Calculating logo clearspace...');

    try {
      const metadata = await sharp(logoPath).metadata();

      // Get actual logo bounding box (excluding transparency)
      const { info } = await sharp(logoPath)
        .trim() // Remove transparent edges
        .toBuffer({ resolveWithObject: true });

      const logoHeight = info.height;
      const logoWidth = info.width;

      // TEEI brand guideline: clearspace = logo height
      const clearspace = {
        minimum: logoHeight,
        recommended: logoHeight * 1.5, // Extra safety margin
        top: logoHeight,
        right: logoHeight,
        bottom: logoHeight,
        left: logoHeight
      };

      console.log(`  Logo dimensions: ${logoWidth}x${logoHeight}px`);
      console.log(`  Minimum clearspace: ${clearspace.minimum}px on all sides`);
      console.log(`  Recommended clearspace: ${clearspace.recommended}px`);

      // Create visual guide (optional)
      if (options.createGuide) {
        const guideBuffer = await this.createClearspaceGuide(logoPath, clearspace);
        const guidePath = path.join(
          this.outputDir,
          `${path.basename(logoPath, path.extname(logoPath))}-clearspace-guide.png`
        );
        await fs.writeFile(guidePath, guideBuffer);
        console.log(`  📐 Clearspace guide saved: ${guidePath}`);

        clearspace.guidePath = guidePath;
      }

      return clearspace;

    } catch (error) {
      console.error(`  ❌ Clearspace calculation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create visual clearspace guide
   */
  async createClearspaceGuide(logoPath, clearspace) {
    const logo = sharp(logoPath);
    const logoMeta = await logo.metadata();

    const guideWidth = logoMeta.width + (clearspace.minimum * 2);
    const guideHeight = logoMeta.height + (clearspace.minimum * 2);

    // Create canvas with clearspace zone
    const guide = sharp({
      create: {
        width: guideWidth,
        height: guideHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    // Overlay logo in center
    const logoBuffer = await logo.toBuffer();

    const guideBuffer = await guide
      .composite([{
        input: logoBuffer,
        top: clearspace.minimum,
        left: clearspace.minimum
      }])
      .toBuffer();

    // TODO: Add clearspace boundary lines (would need canvas for drawing)

    return guideBuffer;
  }

  /**
   * Validate clearspace in a document layout
   * Checks if any elements violate logo clearspace
   */
  async validateClearspace(logoPosition, otherElements, clearspace) {
    const violations = [];

    const logoBox = {
      left: logoPosition.x - clearspace.left,
      right: logoPosition.x + logoPosition.width + clearspace.right,
      top: logoPosition.y - clearspace.top,
      bottom: logoPosition.y + logoPosition.height + clearspace.bottom
    };

    for (const element of otherElements) {
      // Check if element overlaps with clearspace zone
      const overlap = this.checkOverlap(logoBox, element);
      if (overlap) {
        violations.push({
          element: element.name || element.id,
          type: 'clearspace-violation',
          distance: overlap.distance,
          suggestion: `Move ${overlap.direction} by ${overlap.distance}px`
        });
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      clearspace: logoBox
    };
  }

  /**
   * Check if two boxes overlap
   */
  checkOverlap(box1, box2) {
    const isOverlapping = !(
      box2.x + box2.width < box1.left ||
      box2.x > box1.right ||
      box2.y + box2.height < box1.top ||
      box2.y > box1.bottom
    );

    if (isOverlapping) {
      // Calculate distance to move
      const distances = {
        right: box1.right - box2.x,
        left: box2.x + box2.width - box1.left,
        bottom: box1.bottom - box2.y,
        top: box2.y + box2.height - box1.top
      };

      const minDistance = Math.min(...Object.values(distances));
      const direction = Object.keys(distances).find(key => distances[key] === minDistance);

      return {
        distance: Math.ceil(minDistance),
        direction
      };
    }

    return null;
  }

  // ============================================================
  // CORE FEATURE 3: AI-POWERED HERO IMAGE GENERATION
  // ============================================================

  /**
   * Generate hero image using DALL-E 3 with TEEI brand prompts
   *
   * @param {string} concept - Image concept/theme
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Generated image data
   */
  async generateHeroImage(concept, options = {}) {
    console.log(`\n🎨 Generating hero image: "${concept}"`);

    try {
      // Build brand-compliant prompt
      const prompt = this.buildHeroPrompt(concept, options);

      console.log('📝 Prompt:');
      console.log(prompt);
      console.log('\n⏳ Generating with DALL-E 3 HD...');

      const size = options.size || '1792x1024'; // Landscape for hero images
      const quality = options.quality || 'hd';

      const cost = quality === 'hd' ? 0.12 : 0.08;
      console.log(`💰 Estimated cost: $${cost}`);

      // Generate image
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size,
        quality: quality,
        style: 'natural' // More photorealistic
      });

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      console.log('✅ Image generated!');
      console.log(`🔗 URL: ${imageUrl.substring(0, 60)}...`);

      // Download image
      const imageBuffer = await this.downloadImage(imageUrl);

      // Save original
      const filename = `hero-${this.sanitizeFilename(concept)}.png`;
      const outputPath = path.join(this.outputDir, 'heroes', filename);
      await fs.writeFile(outputPath, imageBuffer);

      console.log(`💾 Saved: ${outputPath}`);

      // Generate optimized versions
      console.log('\n🔧 Generating optimized versions...');
      const optimized = await this.generateOptimizedVersions(outputPath, concept);

      return {
        concept,
        original: {
          path: outputPath,
          url: imageUrl,
          size: size,
          quality: quality
        },
        optimized,
        prompt: {
          user: prompt,
          revised: revisedPrompt
        },
        metadata: {
          generated: new Date().toISOString(),
          model: 'dall-e-3',
          cost: cost
        }
      };

    } catch (error) {
      console.error(`❌ Hero image generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build TEEI brand-compliant hero image prompt
   */
  buildHeroPrompt(concept, options = {}) {
    const guidelines = this.photographyGuidelines;

    let prompt = `A professional, photorealistic photograph depicting: "${concept}"

TEEI BRAND PHOTOGRAPHY REQUIREMENTS:
✓ ${guidelines.lighting}
✓ ${guidelines.tones}
✓ ${guidelines.authenticity}
✓ ${guidelines.diversity}
✓ ${guidelines.emotion}

COLOR PALETTE (MANDATORY):
- Nordshore (deep teal #00393F) - primary brand color
- Sky (light blue #C9E4EC) - secondary accents
- Sand (warm beige #FFF1E2) - background tones
- Gold (#BA8F5A) - warm metallic highlights

COMPOSITION:
- Wide landscape format (hero image)
- Natural golden hour or soft window lighting
- Warm, inviting atmosphere
- Clear focal point with negative space for text overlay
- Professional but authentic (not staged or artificial)

SUBJECT MATTER:
- Education and learning environment
- Diverse students and/or educators
- Genuine human connection and engagement
- Hope, empowerment, transformation
- Modern, contemporary setting

VISUAL STYLE:
- Photorealistic, high detail
- 300 DPI quality
- Warm color grading
- Depth of field (soft bokeh background acceptable)
- Professional photography aesthetic`;

    // Add specific context if provided
    if (options.context) {
      prompt += `\n\nSPECIFIC CONTEXT:\n${options.context}`;
    }

    // Add mood if specified
    if (options.mood) {
      prompt += `\n\nMOOD: ${options.mood}`;
    }

    // Ensure no text in image
    prompt += `\n\nIMPORTANT: NO text, labels, logos, or typography in the image.`;

    return prompt;
  }

  /**
   * Generate optimized versions for different use cases
   */
  async generateOptimizedVersions(imagePath, concept) {
    const versions = {};

    // Print version (300 DPI)
    console.log('  📄 Print version (300 DPI)...');
    const printBuffer = await sharp(imagePath)
      .withMetadata({ density: 300 })
      .png({ quality: 100 })
      .toBuffer();

    const printPath = path.join(
      this.outputDir,
      'optimized',
      `${this.sanitizeFilename(concept)}-print.png`
    );
    await fs.writeFile(printPath, printBuffer);
    versions.print = printPath;

    // Digital version (150 DPI, JPEG)
    console.log('  💻 Digital version (150 DPI)...');
    const digitalBuffer = await sharp(imagePath)
      .withMetadata({ density: 150 })
      .jpeg({ quality: 85 })
      .toBuffer();

    const digitalPath = path.join(
      this.outputDir,
      'optimized',
      `${this.sanitizeFilename(concept)}-digital.jpg`
    );
    await fs.writeFile(digitalPath, digitalBuffer);
    versions.digital = digitalPath;

    // Web version (72 DPI, WebP)
    console.log('  🌐 Web version (72 DPI)...');
    const webBuffer = await sharp(imagePath)
      .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
      .withMetadata({ density: 72 })
      .webp({ quality: 80 })
      .toBuffer();

    const webPath = path.join(
      this.outputDir,
      'optimized',
      `${this.sanitizeFilename(concept)}-web.webp`
    );
    await fs.writeFile(webPath, webBuffer);
    versions.web = webPath;

    console.log('  ✅ All versions generated');

    return versions;
  }

  // ============================================================
  // CORE FEATURE 4: PHOTO OVERLAYS WITH BRAND COLORS
  // ============================================================

  /**
   * Apply brand color overlay (e.g., Nordshore tint at 40% opacity)
   *
   * @param {string} imagePath - Path to image
   * @param {string} color - Brand color name ('nordshore', 'sky', etc.)
   * @param {number} opacity - Opacity (0-1)
   * @returns {Promise<Object>} - Overlaid image data
   */
  async applyBrandOverlay(imagePath, color = 'nordshore', opacity = 0.4, options = {}) {
    console.log(`\n🎨 Applying ${color} overlay at ${opacity * 100}% opacity...`);

    try {
      const brandColor = this.brandColors[color.toLowerCase()];
      if (!brandColor) {
        throw new Error(`Unknown brand color: ${color}. Use: ${Object.keys(this.brandColors).join(', ')}`);
      }

      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // Create solid color overlay
      const overlayColor = brandColor.rgb;
      const overlayBuffer = await sharp({
        create: {
          width: metadata.width,
          height: metadata.height,
          channels: 4,
          background: {
            r: overlayColor.r,
            g: overlayColor.g,
            b: overlayColor.b,
            alpha: opacity
          }
        }
      })
      .png()
      .toBuffer();

      // Composite overlay onto image
      const resultBuffer = await image
        .composite([{
          input: overlayBuffer,
          blend: 'over'
        }])
        .toBuffer();

      // Save result
      const outputPath = path.join(
        this.outputDir,
        'overlays',
        `${path.basename(imagePath, path.extname(imagePath))}-${color}-${Math.round(opacity * 100)}.png`
      );
      await fs.writeFile(outputPath, resultBuffer);

      console.log(`  ✅ Overlay applied: ${outputPath}`);

      return {
        path: outputPath,
        buffer: resultBuffer,
        color: brandColor,
        opacity,
        original: imagePath
      };

    } catch (error) {
      console.error(`  ❌ Overlay failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply gradient overlay (e.g., for text readability)
   */
  async applyGradientOverlay(imagePath, direction = 'bottom', options = {}) {
    console.log(`\n🎨 Applying gradient overlay (${direction})...`);

    const color = options.color || 'nordshore';
    const brandColor = this.brandColors[color];
    const startOpacity = options.startOpacity || 0;
    const endOpacity = options.endOpacity || 0.7;

    // Note: Sharp doesn't support gradients natively
    // For production, consider using canvas or SVG overlay
    console.log('  ℹ️ Gradient overlay requires Canvas API (not yet implemented)');
    console.log('  💡 Use solid overlay as fallback or implement Canvas gradient');

    // Fallback to solid overlay with medium opacity
    return this.applyBrandOverlay(imagePath, color, (startOpacity + endOpacity) / 2, options);
  }

  // ============================================================
  // CORE FEATURE 5: IMAGE QUALITY OPTIMIZATION
  // ============================================================

  /**
   * Optimize image quality for target use case
   *
   * @param {string} imagePath - Path to image
   * @param {string} targetUse - 'print', 'digital', 'web', 'premium'
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} - Optimized image data
   */
  async optimizeImageQuality(imagePath, targetUse = 'digital', options = {}) {
    console.log(`\n⚡ Optimizing for: ${targetUse}`);

    try {
      const preset = this.qualityPresets[targetUse];
      if (!preset) {
        throw new Error(`Unknown target use: ${targetUse}`);
      }

      console.log(`  📋 Preset: ${preset.description}`);

      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // Set DPI
      let processedImage = image.withMetadata({
        density: preset.dpi
      });

      // Apply sharpening for print
      if (targetUse === 'print' || targetUse === 'premium') {
        processedImage = processedImage.sharpen({
          sigma: 1,
          m1: 0.5,
          m2: 0.5
        });
      }

      // Resize if needed (maintain aspect ratio)
      if (options.maxWidth && metadata.width > options.maxWidth) {
        processedImage = processedImage.resize(options.maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert to target format
      let outputBuffer;
      if (preset.format === 'jpeg') {
        outputBuffer = await processedImage
          .jpeg({
            quality: preset.quality,
            progressive: true,
            chromaSubsampling: '4:4:4' // Best quality chroma
          })
          .toBuffer();
      } else if (preset.format === 'png') {
        outputBuffer = await processedImage
          .png({
            quality: preset.quality,
            compressionLevel: 6,
            adaptiveFiltering: true
          })
          .toBuffer();
      } else if (preset.format === 'webp') {
        outputBuffer = await processedImage
          .webp({
            quality: preset.quality,
            lossless: false
          })
          .toBuffer();
      }

      // Save optimized version
      const outputPath = path.join(
        this.outputDir,
        'optimized',
        `${path.basename(imagePath, path.extname(imagePath))}-${targetUse}.${preset.format}`
      );
      await fs.writeFile(outputPath, outputBuffer);

      // Calculate size reduction
      const originalSize = (await fs.stat(imagePath)).size;
      const optimizedSize = outputBuffer.length;
      const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

      console.log(`  📦 Original: ${(originalSize / 1024).toFixed(1)} KB`);
      console.log(`  📦 Optimized: ${(optimizedSize / 1024).toFixed(1)} KB (${reduction}% reduction)`);
      console.log(`  ✅ Saved: ${outputPath}`);

      return {
        path: outputPath,
        buffer: outputBuffer,
        preset,
        stats: {
          originalSize,
          optimizedSize,
          reduction: `${reduction}%`,
          dpi: preset.dpi,
          format: preset.format
        }
      };

    } catch (error) {
      console.error(`  ❌ Optimization failed: ${error.message}`);
      throw error;
    }
  }

  // ============================================================
  // CORE FEATURE 6: BATCH OPERATIONS
  // ============================================================

  /**
   * Batch process multiple images
   */
  async batchProcess(imagePaths, operation, options = {}) {
    console.log(`\n📦 Batch processing ${imagePaths.length} images...`);
    console.log(`   Operation: ${operation}`);

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      console.log(`\n[${i + 1}/${imagePaths.length}] Processing: ${path.basename(imagePath)}`);

      try {
        let result;

        switch (operation) {
          case 'optimize':
            result = await this.optimizeImageQuality(imagePath, options.targetUse || 'digital', options);
            break;
          case 'overlay':
            result = await this.applyBrandOverlay(imagePath, options.color || 'nordshore', options.opacity || 0.4, options);
            break;
          case 'crop':
            result = await this.intelligentCrop(imagePath, options);
            break;
          case 'enhance':
            result = await this.photoEnhancer.enhancePhoto(imagePath, options);
            break;
          default:
            throw new Error(`Unknown operation: ${operation}`);
        }

        results.push({
          success: true,
          original: imagePath,
          result
        });
        successCount++;

      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
        results.push({
          success: false,
          original: imagePath,
          error: error.message
        });
        failCount++;
      }

      // Rate limiting for AI operations
      if (operation === 'generate' && i < imagePaths.length - 1) {
        console.log('  ⏱️ Rate limiting (5s)...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    console.log(`\n✅ Batch processing complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);

    return results;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  /**
   * Download image from URL
   */
  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });
    });
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get statistics
   */
  async getStats() {
    const heroesDir = path.join(this.outputDir, 'heroes');
    const optimizedDir = path.join(this.outputDir, 'optimized');
    const overlaysDir = path.join(this.outputDir, 'overlays');

    try {
      const heroes = await fs.readdir(heroesDir);
      const optimized = await fs.readdir(optimizedDir);
      const overlays = await fs.readdir(overlaysDir);

      return {
        heroes: heroes.length,
        optimized: optimized.length,
        overlays: overlays.length,
        total: heroes.length + optimized.length + overlays.length,
        outputDir: this.outputDir
      };
    } catch (error) {
      return {
        error: error.message,
        outputDir: this.outputDir
      };
    }
  }
}

// ============================================================
// EXPORT & CLI
// ============================================================

module.exports = ImageIntelligence;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         IMAGE INTELLIGENCE ENGINE - TEEI Brand            ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  node image-intelligence.js <command> [options]

Commands:
  generate <concept>              Generate hero image with DALL-E 3
  optimize <image> <target>       Optimize for print/digital/web/premium
  overlay <image> <color>         Apply brand color overlay
  crop <image> <strategy>         Intelligent crop (rule-of-thirds/golden-ratio/ai-guided)
  clearspace <logo>               Calculate logo clearspace
  stats                           Show statistics

Examples:
  node image-intelligence.js generate "AWS partnership collaboration"
  node image-intelligence.js optimize hero.jpg print
  node image-intelligence.js overlay photo.jpg nordshore 0.4
  node image-intelligence.js crop image.jpg golden-ratio
  node image-intelligence.js clearspace teei-logo.png
`);
    process.exit(0);
  }

  (async () => {
    const imageAI = new ImageIntelligence();
    const command = args[0];

    try {
      switch (command) {
        case 'generate':
          if (!args[1]) throw new Error('Concept required');
          const result = await imageAI.generateHeroImage(args[1]);
          console.log('\n📊 Generation complete!');
          console.log(JSON.stringify(result, null, 2));
          break;

        case 'optimize':
          if (!args[1] || !args[2]) throw new Error('Image path and target required');
          const optimized = await imageAI.optimizeImageQuality(args[1], args[2]);
          console.log('\n📊 Optimization complete!');
          console.log(JSON.stringify(optimized.stats, null, 2));
          break;

        case 'overlay':
          if (!args[1] || !args[2]) throw new Error('Image path and color required');
          const opacity = args[3] ? parseFloat(args[3]) : 0.4;
          const overlaid = await imageAI.applyBrandOverlay(args[1], args[2], opacity);
          console.log('\n📊 Overlay applied!');
          console.log(`Path: ${overlaid.path}`);
          break;

        case 'crop':
          if (!args[1] || !args[2]) throw new Error('Image path and strategy required');
          const cropped = await imageAI.intelligentCrop(args[1], { strategy: args[2] });
          console.log('\n📊 Crop complete!');
          console.log(JSON.stringify(cropped, null, 2));
          break;

        case 'clearspace':
          if (!args[1]) throw new Error('Logo path required');
          const clearspace = await imageAI.calculateLogoClearspace(args[1], { createGuide: true });
          console.log('\n📊 Clearspace calculated!');
          console.log(JSON.stringify(clearspace, null, 2));
          break;

        case 'stats':
          const stats = await imageAI.getStats();
          console.log('\n📊 Statistics:');
          console.log(JSON.stringify(stats, null, 2));
          break;

        default:
          console.error(`Unknown command: ${command}`);
          process.exit(1);
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  })();
}
