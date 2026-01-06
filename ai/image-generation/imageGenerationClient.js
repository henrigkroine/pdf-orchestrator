/**
 * Image Generation API Client
 *
 * Supports multiple AI image generation providers:
 * - DALL-E 3 (OpenAI) - Primary choice for quality and reliability
 * - Stable Diffusion (Replicate) - Backup option for cost efficiency
 *
 * Selection Rationale:
 * DALL-E 3 is chosen as primary because:
 * 1. Superior photorealistic quality (critical for TEEI brand authenticity)
 * 2. Better prompt understanding (warm, natural lighting nuances)
 * 3. Reliable API with good uptime
 * 4. Cost: $0.040/image (standard), $0.080/image (HD) - reasonable for <5 images/doc
 * 5. Content policy compliant for educational use
 *
 * Stable Diffusion backup for:
 * 1. Cost optimization ($0.0055/image via Replicate)
 * 2. Fallback if DALL-E unavailable
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import logger from '../utils/logger.js';

class ImageGenerationClient {
  constructor(config = {}) {
    this.provider = config.provider || 'dalle3'; // 'dalle3' or 'stable-diffusion'
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
    this.replicateApiKey = config.replicateApiKey || process.env.REPLICATE_API_KEY;
    this.dryRun = config.dryRun || false;

    // DALL-E 3 settings
    this.dalleModel = 'dall-e-3';
    this.dalleQuality = config.quality || 'standard'; // 'standard' or 'hd'
    this.dalleSize = config.size || '1792x1024'; // landscape for hero images
    this.dalleStyle = 'natural'; // 'natural' or 'vivid' - natural aligns with TEEI brand

    // Stable Diffusion settings
    this.sdModel = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

    // Rate limiting
    this.requestCount = 0;
    this.maxRequestsPerMinute = 50; // DALL-E limit

    // Initialize OpenAI client
    if (this.provider === 'dalle3' && this.apiKey) {
      this.openai = new OpenAI({ apiKey: this.apiKey });
    }
  }

  /**
   * Generate image from prompt
   * @param {Object} params
   * @param {string} params.prompt - Image generation prompt
   * @param {string} params.category - Image category (hero, program, cover)
   * @param {Object} params.options - Additional generation options
   * @returns {Promise<Object>} { imageUrl, imageBuffer, metadata }
   */
  async generateImage(params) {
    const { prompt, category = 'generic', options = {} } = params;

    logger.info(`Generating ${category} image with ${this.provider}`);
    logger.debug(`Prompt: ${prompt.substring(0, 100)}...`);

    // Dry run mode - return placeholder
    if (this.dryRun) {
      return this._generatePlaceholder(params);
    }

    // Check API key
    if (this.provider === 'dalle3' && !this.apiKey) {
      throw new Error('OPENAI_API_KEY not configured. Set in config/.env or use dryRun mode.');
    }

    // Rate limiting
    await this._rateLimitCheck();

    // Generate based on provider
    try {
      if (this.provider === 'dalle3') {
        return await this._generateWithDALLE3(prompt, category, options);
      } else if (this.provider === 'stable-diffusion') {
        return await this._generateWithStableDiffusion(prompt, category, options);
      } else {
        throw new Error(`Unknown provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error(`Image generation failed: ${error.message}`);

      // Fallback to placeholder on error
      logger.warn('Falling back to placeholder image');
      return this._generatePlaceholder(params);
    }
  }

  /**
   * Generate image with DALL-E 3
   * @private
   */
  async _generateWithDALLE3(prompt, category, options) {
    const startTime = Date.now();

    try {
      const response = await this.openai.images.generate({
        model: this.dalleModel,
        prompt: prompt,
        n: 1,
        size: options.size || this.dalleSize,
        quality: options.quality || this.dalleQuality,
        style: this.dalleStyle,
        response_format: 'url'
      });

      const imageUrl = response.data[0].url;
      const revisedPrompt = response.data[0].revised_prompt;

      // Download image
      const imageBuffer = await this._downloadImage(imageUrl);

      const duration = Date.now() - startTime;
      logger.success(`Image generated in ${(duration / 1000).toFixed(2)}s`);

      return {
        imageUrl,
        imageBuffer,
        metadata: {
          provider: 'dalle3',
          model: this.dalleModel,
          prompt: prompt,
          revisedPrompt: revisedPrompt,
          quality: this.dalleQuality,
          size: this.dalleSize,
          category: category,
          generatedAt: new Date().toISOString(),
          durationMs: duration,
          cost: this.dalleQuality === 'hd' ? 0.080 : 0.040
        }
      };
    } catch (error) {
      // Handle DALL-E specific errors
      if (error.status === 400 && error.message.includes('content_policy')) {
        logger.error('Content policy violation detected');
        throw new Error('Image prompt violates OpenAI content policy. Try rephrasing.');
      }
      throw error;
    }
  }

  /**
   * Generate image with Stable Diffusion (via Replicate)
   * @private
   */
  async _generateWithStableDiffusion(prompt, category, options) {
    if (!this.replicateApiKey) {
      throw new Error('REPLICATE_API_KEY not configured');
    }

    const startTime = Date.now();

    try {
      // Create prediction
      const response = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: this.sdModel,
          input: {
            prompt: prompt,
            negative_prompt: 'staged, corporate stock photography, harsh lighting, studio lighting, fake, artificial',
            num_outputs: 1,
            width: 1024,
            height: 768,
            scheduler: 'K_EULER',
            num_inference_steps: 50,
            guidance_scale: 7.5
          }
        },
        {
          headers: {
            'Authorization': `Token ${this.replicateApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictionId = response.data.id;

      // Poll for completion
      let prediction = response.data;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await this._sleep(1000);
        const statusResponse = await axios.get(
          `https://api.replicate.com/v1/predictions/${predictionId}`,
          {
            headers: {
              'Authorization': `Token ${this.replicateApiKey}`
            }
          }
        );
        prediction = statusResponse.data;
      }

      if (prediction.status === 'failed') {
        throw new Error('Stable Diffusion generation failed');
      }

      const imageUrl = prediction.output[0];
      const imageBuffer = await this._downloadImage(imageUrl);

      const duration = Date.now() - startTime;
      logger.success(`Image generated in ${(duration / 1000).toFixed(2)}s`);

      return {
        imageUrl,
        imageBuffer,
        metadata: {
          provider: 'stable-diffusion',
          model: 'sdxl',
          prompt: prompt,
          category: category,
          generatedAt: new Date().toISOString(),
          durationMs: duration,
          cost: 0.0055
        }
      };
    } catch (error) {
      throw new Error(`Stable Diffusion generation failed: ${error.message}`);
    }
  }

  /**
   * Generate placeholder image for dry run mode
   * @private
   */
  async _generatePlaceholder(params) {
    const { prompt, category } = params;

    logger.info('[DRY RUN] Generating placeholder image');

    return {
      imageUrl: null,
      imageBuffer: null,
      metadata: {
        provider: 'placeholder',
        prompt: prompt,
        category: category,
        generatedAt: new Date().toISOString(),
        dryRun: true,
        cost: 0
      }
    };
  }

  /**
   * Download image from URL
   * @private
   */
  async _downloadImage(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      return Buffer.from(response.data);
    } catch (error) {
      throw new Error(`Failed to download image: ${error.message}`);
    }
  }

  /**
   * Rate limiting check
   * @private
   */
  async _rateLimitCheck() {
    this.requestCount++;

    if (this.requestCount > this.maxRequestsPerMinute) {
      logger.warn('Rate limit reached, waiting 60 seconds...');
      await this._sleep(60000);
      this.requestCount = 0;
    }
  }

  /**
   * Sleep utility
   * @private
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get provider info
   * @returns {Object}
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.provider === 'dalle3' ? this.dalleModel : this.sdModel,
      quality: this.dalleQuality,
      size: this.dalleSize,
      dryRun: this.dryRun,
      configured: this.provider === 'dalle3' ? !!this.apiKey : !!this.replicateApiKey
    };
  }
}

export default ImageGenerationClient;
