#!/usr/bin/env node

/**
 * Image Generation Orchestrator
 *
 * Purpose: Generates brand-compliant hero images and program photos
 * for partnership documents using AI image generation APIs
 *
 * Integration: Layer 0 (Asset Preparation)
 * Performance: < 30 seconds per image
 *
 * @module ai/image-gen/imageGenerator
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const CONFIG = {
  cachePath: path.join(__dirname, '..', '..', 'data', 'image-cache'),
  outputPath: path.join(__dirname, '..', '..', 'assets', 'images', 'generated'),
  brandStyle: {
    teei: 'warm natural lighting, authentic moments, Ukrainian students, diverse representation, hopeful atmosphere, professional photography',
    tfu: 'Ukrainian blue and yellow accents, educational setting, refugee empowerment, solidarity, documentary style'
  },
  imageSpecs: {
    hero: {
      width: 2400,
      height: 1600,
      aspectRatio: '3:2',
      dpi: 300
    },
    program: {
      width: 1800,
      height: 1200,
      aspectRatio: '3:2',
      dpi: 300
    }
  }
};

/**
 * Image cache manager
 */
class ImageCache {
  constructor() {
    this.cacheIndex = new Map();
  }

  /**
   * Load cache index
   */
  async load() {
    try {
      const indexPath = path.join(CONFIG.cachePath, 'index.json');
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const index = JSON.parse(indexData);
      this.cacheIndex = new Map(Object.entries(index));
      return this.cacheIndex.size;
    } catch (error) {
      console.log('[ImageGen] No cache index found, starting fresh');
      return 0;
    }
  }

  /**
   * Save cache index
   */
  async save() {
    await fs.mkdir(CONFIG.cachePath, { recursive: true });
    const indexPath = path.join(CONFIG.cachePath, 'index.json');
    const indexObj = Object.fromEntries(this.cacheIndex);
    await fs.writeFile(indexPath, JSON.stringify(indexObj, null, 2));
  }

  /**
   * Generate cache key from prompt
   */
  generateKey(prompt, specs) {
    const data = JSON.stringify({ prompt, specs });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Check if image is cached
   */
  async get(prompt, specs) {
    const key = this.generateKey(prompt, specs);
    const cached = this.cacheIndex.get(key);

    if (cached) {
      const cachePath = path.join(CONFIG.cachePath, cached.filename);
      try {
        await fs.access(cachePath);
        return {
          path: cachePath,
          cached: true,
          metadata: cached
        };
      } catch (error) {
        // Cache entry exists but file is missing
        this.cacheIndex.delete(key);
        return null;
      }
    }

    return null;
  }

  /**
   * Store image in cache
   */
  async set(prompt, specs, imagePath) {
    const key = this.generateKey(prompt, specs);
    const filename = `${key}.png`;
    const cachePath = path.join(CONFIG.cachePath, filename);

    // Copy image to cache
    await fs.mkdir(CONFIG.cachePath, { recursive: true });
    await fs.copyFile(imagePath, cachePath);

    // Update index
    this.cacheIndex.set(key, {
      filename,
      prompt,
      specs,
      createdAt: new Date().toISOString()
    });

    await this.save();

    return cachePath;
  }
}

/**
 * Prompt engineering for TEEI brand compliance
 */
class PromptEngineer {
  /**
   * Generate brand-compliant prompt
   */
  generatePrompt(context, imageType = 'hero') {
    const { partner, industry, designSystem } = context;

    // Get brand style guide
    const brandStyle = CONFIG.brandStyle[designSystem] || CONFIG.brandStyle.teei;

    // Base prompt components
    const subject = this.getSubject(imageType, industry);
    const composition = this.getComposition(imageType);
    const technical = this.getTechnicalSpecs(imageType);

    // Construct full prompt
    const fullPrompt = [
      subject,
      brandStyle,
      composition,
      technical,
      'High quality professional photography',
      'No watermarks, no text overlays'
    ].join(', ');

    return fullPrompt;
  }

  /**
   * Get subject based on image type and industry
   */
  getSubject(imageType, industry) {
    if (imageType === 'hero') {
      switch (industry) {
        case 'technology':
          return 'Ukrainian students collaborating on laptops in modern learning space';
        case 'education':
          return 'Diverse group of students studying together, academic setting';
        case 'healthcare':
          return 'Students in medical training, healthcare education';
        default:
          return 'Engaged students in educational environment';
      }
    } else {
      // Program photos
      return 'Small group of students working together, authentic moment';
    }
  }

  /**
   * Get composition guidelines
   */
  getComposition(imageType) {
    if (imageType === 'hero') {
      return 'Wide angle shot, rule of thirds, balanced composition, natural depth of field';
    } else {
      return 'Medium shot, focused composition, shallow depth of field';
    }
  }

  /**
   * Get technical specifications
   */
  getTechnicalSpecs(imageType) {
    const specs = CONFIG.imageSpecs[imageType] || CONFIG.imageSpecs.hero;
    return `${specs.width}x${specs.height} resolution, 300 DPI quality`;
  }
}

/**
 * Mock image generation API
 * Production: Replace with DALL-E 3, Midjourney, or Stable Diffusion
 */
class ImageGenerationAPI {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || null;
    this.dryRun = process.env.DRY_RUN_IMAGE_GEN === '1';
  }

  /**
   * Generate image from prompt
   */
  async generate(prompt, specs) {
    console.log(`[ImageGen] Generating image (dry-run: ${this.dryRun})`);
    console.log(`[ImageGen] Prompt: ${prompt.substring(0, 100)}...`);

    if (this.dryRun || !this.apiKey) {
      // Mock generation - create placeholder
      return this.generateMockImage(prompt, specs);
    }

    // Production: Call actual API (OpenAI DALL-E 3, etc.)
    // const response = await openai.images.generate({
    //   model: "dall-e-3",
    //   prompt: prompt,
    //   size: `${specs.width}x${specs.height}`,
    //   quality: "hd",
    //   n: 1
    // });
    // return response.data[0].url;

    throw new Error('Image generation API not configured. Set OPENAI_API_KEY or enable DRY_RUN_IMAGE_GEN=1');
  }

  /**
   * Generate mock/placeholder image
   */
  async generateMockImage(prompt, specs) {
    console.log('[ImageGen] Generating mock placeholder image');

    // Create simple placeholder with prompt text
    const placeholderData = {
      type: 'placeholder',
      prompt: prompt.substring(0, 100),
      specs,
      generatedAt: new Date().toISOString()
    };

    // In a real implementation, this would create an actual image file
    // For now, we'll just return metadata
    return placeholderData;
  }
}

/**
 * Image optimizer
 */
class ImageOptimizer {
  /**
   * Optimize image for web and print
   */
  async optimize(imagePath, outputFormat = 'both') {
    console.log(`[ImageGen] Optimizing image for: ${outputFormat}`);

    const result = {
      web: null,
      print: null
    };

    if (outputFormat === 'web' || outputFormat === 'both') {
      result.web = await this.optimizeForWeb(imagePath);
    }

    if (outputFormat === 'print' || outputFormat === 'both') {
      result.print = await this.optimizeForPrint(imagePath);
    }

    return result;
  }

  /**
   * Optimize for web (RGB, compressed)
   */
  async optimizeForWeb(imagePath) {
    console.log('[ImageGen] Creating web-optimized version (RGB, 96 DPI)');

    // Mock optimization
    return {
      path: imagePath.replace('.png', '-web.png'),
      format: 'RGB',
      dpi: 96,
      quality: 85,
      sizeMB: 0.5
    };
  }

  /**
   * Optimize for print (CMYK, high-res)
   */
  async optimizeForPrint(imagePath) {
    console.log('[ImageGen] Creating print-optimized version (CMYK, 300 DPI)');

    // Mock optimization
    return {
      path: imagePath.replace('.png', '-print.png'),
      format: 'CMYK',
      dpi: 300,
      quality: 100,
      sizeMB: 4.2
    };
  }
}

/**
 * Main Image Generator Orchestrator
 */
class ImageGenerator {
  constructor() {
    this.cache = new ImageCache();
    this.promptEngineer = new PromptEngineer();
    this.api = new ImageGenerationAPI();
    this.optimizer = new ImageOptimizer();
    this.initialized = false;
  }

  /**
   * Initialize image generator
   */
  async initialize() {
    console.log('[ImageGen] Initializing image generator...');

    const cacheSize = await this.cache.load();
    console.log(`[ImageGen] Loaded cache with ${cacheSize} images`);

    // Check API availability
    if (!this.api.apiKey && !this.api.dryRun) {
      console.log('[ImageGen] ⚠️ WARNING: No API key found. Image generation will fail.');
      console.log('[ImageGen] Set OPENAI_API_KEY or enable DRY_RUN_IMAGE_GEN=1 for testing');
    }

    this.initialized = true;
  }

  /**
   * Generate images for job
   */
  async generateForJob(jobConfig) {
    if (!this.initialized) await this.initialize();

    const imageConfig = jobConfig.generation?.imageGeneration || {};

    if (!imageConfig.enabled) {
      console.log('[ImageGen] Image generation disabled in job config');
      return { generated: false };
    }

    console.log('[ImageGen] Generating images for job...');

    const results = {
      hero: null,
      programs: [],
      cacheHits: 0,
      totalGenerated: 0,
      totalCost: 0
    };

    // Generate hero image
    if (imageConfig.hero?.enabled) {
      console.log('[ImageGen] Generating hero image...');
      const heroResult = await this.generateImage('hero', jobConfig);
      results.hero = heroResult;
      if (heroResult.cached) results.cacheHits++;
      else results.totalGenerated++;
    }

    // Generate program photos
    const programCount = imageConfig.programPhotos?.count || 0;
    for (let i = 0; i < programCount; i++) {
      console.log(`[ImageGen] Generating program photo ${i + 1}/${programCount}...`);
      const programResult = await this.generateImage('program', jobConfig, i);
      results.programs.push(programResult);
      if (programResult.cached) results.cacheHits++;
      else results.totalGenerated++;
    }

    // Calculate costs (DALL-E 3 pricing: ~$0.04 per image)
    results.totalCost = results.totalGenerated * 0.04;

    console.log('[ImageGen] ✅ Image generation complete');
    console.log(`[ImageGen] Total: ${results.totalGenerated} generated, ${results.cacheHits} cached`);
    console.log(`[ImageGen] Estimated cost: $${results.totalCost.toFixed(2)}`);

    return results;
  }

  /**
   * Generate single image
   */
  async generateImage(imageType, jobConfig, index = 0) {
    const context = {
      partner: jobConfig.data?.partner || 'Partner',
      industry: jobConfig.data?.industry || 'technology',
      designSystem: jobConfig.design_system || 'teei'
    };

    // Generate prompt
    const prompt = this.promptEngineer.generatePrompt(context, imageType);
    const specs = CONFIG.imageSpecs[imageType];

    // Check cache
    const cached = await this.cache.get(prompt, specs);
    if (cached) {
      console.log('[ImageGen] ✓ Cache hit');
      return cached;
    }

    // Generate new image
    const startTime = Date.now();
    const imageData = await this.api.generate(prompt, specs);
    const generationTime = Date.now() - startTime;

    // Save image
    const jobId = jobConfig.name?.replace(/\s+/g, '-').toLowerCase() || 'job';
    const filename = `${jobId}-${imageType}${index > 0 ? `-${index}` : ''}.png`;
    const outputPath = path.join(CONFIG.outputPath, jobId, filename);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Mock: Just create a JSON file instead of actual image
    await fs.writeFile(
      outputPath.replace('.png', '-metadata.json'),
      JSON.stringify({ prompt, specs, imageData }, null, 2)
    );

    // Optimize image
    const optimized = await this.optimizer.optimize(outputPath);

    // Cache image
    await this.cache.set(prompt, specs, outputPath);

    return {
      path: outputPath,
      cached: false,
      prompt,
      specs,
      optimized,
      generationTimeMs: generationTime
    };
  }

  /**
   * Generate report
   */
  generateReport(results) {
    return {
      timestamp: new Date().toISOString(),
      totalImages: results.totalGenerated + results.cacheHits,
      generated: results.totalGenerated,
      cached: results.cacheHits,
      cacheHitRate: ((results.cacheHits / (results.totalGenerated + results.cacheHits)) * 100).toFixed(1) + '%',
      estimatedCostUSD: results.totalCost.toFixed(2),
      images: {
        hero: results.hero,
        programs: results.programs
      }
    };
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const generator = new ImageGenerator();
  await generator.initialize();

  try {
    if (command === '--generate') {
      // Generate images from job config
      const jobConfigPath = args[1];
      if (!jobConfigPath) {
        console.error('[ImageGen] Error: Job config path required');
        console.log('Usage: node imageGenerator.js --generate <job-config.json>');
        process.exit(1);
      }

      const jobConfig = JSON.parse(await fs.readFile(jobConfigPath, 'utf-8'));
      const results = await generator.generateForJob(jobConfig);
      const report = generator.generateReport(results);

      console.log('\n[ImageGen] Generation Report:');
      console.log('='.repeat(60));
      console.log(JSON.stringify(report, null, 2));
      console.log('='.repeat(60));

      process.exit(0);

    } else if (command === '--test') {
      // Test single image generation
      const mockJobConfig = {
        name: 'test-job',
        design_system: 'teei',
        data: {
          partner: 'Test Partner',
          industry: 'technology'
        },
        generation: {
          imageGeneration: {
            enabled: true,
            hero: { enabled: true },
            programPhotos: { count: 2 }
          }
        }
      };

      console.log('[ImageGen] Running test generation...');
      const results = await generator.generateForJob(mockJobConfig);
      const report = generator.generateReport(results);

      console.log('\n[ImageGen] Test Report:');
      console.log('='.repeat(60));
      console.log(JSON.stringify(report, null, 2));
      console.log('='.repeat(60));

      process.exit(0);

    } else {
      // Show usage
      console.log(`
Image Generation Orchestrator - Usage:

  node imageGenerator.js --generate <job-config.json>
    Generate images based on job configuration

  node imageGenerator.js --test
    Run test generation with mock data

Environment Variables:
  OPENAI_API_KEY - OpenAI API key for DALL-E 3
  DRY_RUN_IMAGE_GEN=1 - Enable dry-run mode (no API calls)

Examples:
  export DRY_RUN_IMAGE_GEN=1
  node imageGenerator.js --test
  node imageGenerator.js --generate example-jobs/tfu-aws-partnership-v2.json
      `);
      process.exit(1);
    }

  } catch (error) {
    console.error('[ImageGen] Error:', error.message);
    console.error(error.stack);
    process.exit(3);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = { ImageGenerator, PromptEngineer, ImageCache, ImageOptimizer };
