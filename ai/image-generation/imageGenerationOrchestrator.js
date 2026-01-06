/**
 * Image Generation Orchestrator
 *
 * Main controller that coordinates:
 * - Prompt engineering (TEEI brand compliance)
 * - Image generation (DALL-E 3 / Stable Diffusion)
 * - Caching (cost optimization)
 * - Optimization (web and print versions)
 *
 * Usage:
 *   const orchestrator = new ImageGenerationOrchestrator(jobConfig);
 *   const results = await orchestrator.generateImagesForJob();
 */

import fs from 'fs';
import path from 'path';
import ImageGenerationClient from './imageGenerationClient.js';
import PromptEngineer from './promptEngineer.js';
import ImageCache from './imageCache.js';
import ImageOptimizer from './imageOptimizer.js';
import logger from '../utils/logger.js';

class ImageGenerationOrchestrator {
  constructor(jobConfig, options = {}) {
    this.jobConfig = jobConfig;
    this.jobId = jobConfig.jobId || 'default';

    // Extract image generation config
    this.imageGenConfig = jobConfig.imageGeneration || {
      enabled: false,
      dryRun: true
    };

    // Initialize components
    this.client = new ImageGenerationClient({
      provider: this.imageGenConfig.provider || 'dalle3',
      quality: this.imageGenConfig.quality || 'standard',
      dryRun: this.imageGenConfig.dryRun !== false,
      apiKey: options.apiKey || process.env.OPENAI_API_KEY
    });

    this.promptEngineer = new PromptEngineer({
      brandProfile: 'teei',
      verbose: options.verbose || false
    });

    this.cache = new ImageCache({
      cacheDir: 'assets/images/generated',
      enabled: this.imageGenConfig.caching !== false,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    this.optimizer = new ImageOptimizer({
      outputDir: 'assets/images/optimized'
    });

    // Tracking
    this.results = {
      jobId: this.jobId,
      timestamp: new Date().toISOString(),
      images: [],
      stats: {
        generated: 0,
        cached: 0,
        failed: 0,
        totalCost: 0,
        totalDuration: 0
      }
    };
  }

  /**
   * Generate all images for job
   * @returns {Promise<Object>} Generation results
   */
  async generateImagesForJob() {
    logger.section(`Image Generation for Job: ${this.jobId}`);

    // Check if image generation is enabled
    if (!this.imageGenConfig.enabled) {
      logger.info('Image generation disabled in job config');
      return {
        enabled: false,
        images: []
      };
    }

    const startTime = Date.now();

    try {
      // Extract image requirements from job config
      const imageSlots = this._extractImageSlots();

      if (imageSlots.length === 0) {
        logger.warn('No image slots defined in job config');
        return this.results;
      }

      logger.info(`Found ${imageSlots.length} image slots to generate`);

      // Generate each image
      for (const slot of imageSlots) {
        await this._generateImageSlot(slot);
      }

      // Calculate totals
      this.results.stats.totalDuration = Date.now() - startTime;

      // Log summary
      this._logSummary();

      // Save results to disk
      await this._saveResults();

      return this.results;

    } catch (error) {
      logger.error(`Image generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate image for specific slot
   * @private
   */
  async _generateImageSlot(slot) {
    const { category, prompt: userPrompt, name } = slot;

    logger.subsection(`Generating: ${name} (${category})`);

    try {
      // 1. Generate or enhance prompt
      const prompt = this.promptEngineer.generatePrompt({
        category,
        userPrompt,
        context: {
          partnerName: this.jobConfig.data?.partner?.name
        }
      });

      logger.info(`Prompt: ${prompt.substring(0, 100)}...`);

      // 2. Check cache
      const cacheKey = this.cache.generateCacheKey(
        prompt,
        category,
        this.imageGenConfig.provider
      );

      const cached = await this.cache.get(cacheKey, this.jobId);

      if (cached) {
        logger.success('Using cached image');

        // Still optimize if not already done
        const optimized = await this._optimizeImage(cached.imageBuffer, name);

        this.results.images.push({
          name,
          category,
          prompt,
          cached: true,
          ...optimized
        });

        this.results.stats.cached++;

        return;
      }

      // 3. Generate image
      const generated = await this.client.generateImage({
        prompt,
        category,
        options: {
          quality: this.imageGenConfig.quality
        }
      });

      // 4. Cache the generated image
      if (generated.imageBuffer) {
        await this.cache.save(
          cacheKey,
          generated.imageBuffer,
          generated.metadata,
          this.jobId
        );
      }

      // 5. Optimize for web and print
      const optimized = generated.imageBuffer
        ? await this._optimizeImage(generated.imageBuffer, name)
        : { web: null, print: null };

      // 6. Track results
      this.results.images.push({
        name,
        category,
        prompt,
        cached: false,
        ...optimized,
        generation: generated.metadata
      });

      this.results.stats.generated++;
      this.results.stats.totalCost += generated.metadata.cost || 0;

      logger.success(`Generated: ${name}`);

    } catch (error) {
      logger.error(`Failed to generate ${name}: ${error.message}`);

      this.results.images.push({
        name,
        category,
        error: error.message,
        failed: true
      });

      this.results.stats.failed++;
    }
  }

  /**
   * Optimize image for web and print
   * @private
   */
  async _optimizeImage(imageBuffer, baseName) {
    try {
      // Apply TEEI color grading
      const gradedBuffer = await this.optimizer.applyTEEIColorGrading(imageBuffer);

      // Generate both web and print versions
      const optimized = await this.optimizer.optimizeBoth(
        gradedBuffer,
        baseName,
        `assets/images/optimized/${this.jobId}`
      );

      return optimized;

    } catch (error) {
      logger.error(`Optimization failed: ${error.message}`);
      return { web: null, print: null };
    }
  }

  /**
   * Extract image slots from job config
   * @private
   */
  _extractImageSlots() {
    const slots = [];

    // Check for aiImageSlots (new format)
    if (this.jobConfig.data?.aiImageSlots) {
      const aiSlots = this.jobConfig.data.aiImageSlots;

      Object.entries(aiSlots).forEach(([slotName, prompt]) => {
        slots.push({
          name: slotName,
          category: this._inferCategory(slotName),
          prompt: prompt
        });
      });
    }

    // Check for heroImage (legacy format)
    if (this.jobConfig.data?.heroImage?.source === 'ai') {
      slots.push({
        name: 'hero',
        category: 'hero',
        prompt: this.jobConfig.data.heroImage.prompt
      });
    }

    // Check for imageGeneration.images array (explicit format)
    if (this.imageGenConfig.images) {
      this.imageGenConfig.images.forEach(image => {
        slots.push({
          name: image.name || image.slot,
          category: image.category || this._inferCategory(image.name),
          prompt: image.prompt
        });
      });
    }

    return slots;
  }

  /**
   * Infer category from slot name
   * @private
   */
  _inferCategory(slotName) {
    const name = slotName.toLowerCase();

    if (name.includes('hero')) return 'hero';
    if (name.includes('cover')) return 'cover';
    if (name.includes('program')) return 'program';
    if (name.includes('partnership')) return 'partnership';

    return 'generic';
  }

  /**
   * Log generation summary
   * @private
   */
  _logSummary() {
    const { stats } = this.results;

    logger.section('Image Generation Summary');
    logger.info(`Generated: ${stats.generated}`);
    logger.info(`Cached: ${stats.cached}`);
    logger.info(`Failed: ${stats.failed}`);
    logger.info(`Total Cost: $${stats.totalCost.toFixed(3)}`);
    logger.info(`Duration: ${(stats.totalDuration / 1000).toFixed(2)}s`);

    if (stats.cached > 0) {
      const cacheHitRate = (stats.cached / (stats.generated + stats.cached) * 100).toFixed(1);
      logger.success(`Cache Hit Rate: ${cacheHitRate}%`);
    }
  }

  /**
   * Save results to disk
   * @private
   */
  async _saveResults() {
    try {
      const resultsDir = 'reports/image-generation';
      await fs.mkdir(resultsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsPath = path.join(resultsDir, `${this.jobId}-${timestamp}.json`);

      await fs.writeFile(resultsPath, JSON.stringify(this.results, null, 2));

      logger.info(`Results saved: ${resultsPath}`);

    } catch (error) {
      logger.warn(`Failed to save results: ${error.message}`);
    }
  }

  /**
   * Get generated image paths for job
   * @returns {Object} Map of slot names to image paths
   */
  getImagePaths() {
    const paths = {};

    this.results.images.forEach(image => {
      // In dry run mode, web and print might be null
      if (!image.failed) {
        paths[image.name] = {
          web: image.web?.path || null,
          print: image.print?.path || null,
          cached: image.cached || false,
          dryRun: image.generation?.dryRun || false
        };
      }
    });

    return paths;
  }

  /**
   * Update job config with generated image paths
   * @param {string} jobConfigPath - Path to job config file
   * @returns {Promise<void>}
   */
  async updateJobConfig(jobConfigPath) {
    try {
      // Read current job config
      const configContent = await fs.readFile(jobConfigPath, 'utf-8');
      const config = JSON.parse(configContent);

      // Add generated image paths
      if (!config.generatedAssets) {
        config.generatedAssets = {};
      }

      config.generatedAssets.images = this.getImagePaths();
      config.generatedAssets.timestamp = new Date().toISOString();

      // Save updated config
      await fs.writeFile(jobConfigPath, JSON.stringify(config, null, 2));

      logger.success(`Updated job config: ${jobConfigPath}`);

    } catch (error) {
      logger.error(`Failed to update job config: ${error.message}`);
      throw error;
    }
  }

  /**
   * Clean up cache (remove old images)
   * @returns {Promise<Object>}
   */
  async cleanupCache() {
    return await this.cache.cleanup();
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>}
   */
  async getCacheStats() {
    return await this.cache.getStats();
  }

  /**
   * Get provider information
   * @returns {Object}
   */
  getProviderInfo() {
    return this.client.getProviderInfo();
  }
}

export default ImageGenerationOrchestrator;
