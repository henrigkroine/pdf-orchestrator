/**
 * Image Optimizer
 *
 * Optimizes generated images for different use cases:
 * - WEB: 150 DPI, RGB, compressed (for digital PDFs)
 * - PRINT: 300 DPI, CMYK, high quality (for commercial printing)
 *
 * Uses sharp for high-performance image processing
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

class ImageOptimizer {
  constructor(config = {}) {
    this.outputDir = config.outputDir || 'assets/images/optimized';

    // Web optimization presets
    this.webPresets = {
      dpi: 150,
      quality: 85,
      format: 'png', // PNG for transparency support, can use jpg for smaller files
      colorSpace: 'srgb'
    };

    // Print optimization presets
    this.printPresets = {
      dpi: 300,
      quality: 95,
      format: 'png',
      colorSpace: 'cmyk' // Note: Sharp uses RGB, CMYK conversion typically done in InDesign
    };
  }

  /**
   * Optimize image for web use (digital PDFs)
   * @param {Buffer|string} input - Image buffer or path
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} { buffer, path, metadata }
   */
  async optimizeForWeb(input, options = {}) {
    const startTime = Date.now();

    try {
      logger.info('Optimizing image for web (150 DPI, RGB)');

      const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

      // Process image
      let pipeline = sharp(inputBuffer);

      // Resize if needed (max width for web)
      const maxWidth = options.maxWidth || 1920;
      const metadata = await pipeline.metadata();

      if (metadata.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Set DPI
      pipeline = pipeline.withMetadata({
        density: this.webPresets.dpi
      });

      // Convert to RGB color space
      pipeline = pipeline.toColorspace('srgb');

      // Apply compression
      if (this.webPresets.format === 'png') {
        pipeline = pipeline.png({
          quality: this.webPresets.quality,
          compressionLevel: 9
        });
      } else if (this.webPresets.format === 'jpeg') {
        pipeline = pipeline.jpeg({
          quality: this.webPresets.quality,
          progressive: true
        });
      }

      // Generate output
      const buffer = await pipeline.toBuffer();

      const duration = Date.now() - startTime;
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

      logger.success(`Web optimization complete in ${duration}ms (${sizeMB} MB)`);

      return {
        buffer,
        metadata: {
          format: this.webPresets.format,
          dpi: this.webPresets.dpi,
          colorSpace: 'RGB',
          quality: this.webPresets.quality,
          sizeMB: parseFloat(sizeMB),
          durationMs: duration,
          optimizedFor: 'web'
        }
      };

    } catch (error) {
      logger.error(`Web optimization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Optimize image for print (commercial printing)
   * @param {Buffer|string} input - Image buffer or path
   * @param {Object} options - Optimization options
   * @returns {Promise<Object>} { buffer, path, metadata }
   */
  async optimizeForPrint(input, options = {}) {
    const startTime = Date.now();

    try {
      logger.info('Optimizing image for print (300 DPI, RGB->CMYK in InDesign)');

      const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

      // Process image
      let pipeline = sharp(inputBuffer);

      // Resize if needed (max width for print)
      const maxWidth = options.maxWidth || 3840; // Higher resolution for print
      const metadata = await pipeline.metadata();

      if (metadata.width > maxWidth) {
        pipeline = pipeline.resize(maxWidth, null, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Set DPI to 300
      pipeline = pipeline.withMetadata({
        density: this.printPresets.dpi
      });

      // Keep in RGB (CMYK conversion will be done by InDesign during PDF export)
      pipeline = pipeline.toColorspace('srgb');

      // Minimal compression for print quality
      if (this.printPresets.format === 'png') {
        pipeline = pipeline.png({
          quality: this.printPresets.quality,
          compressionLevel: 6 // Less compression for print
        });
      }

      // Generate output
      const buffer = await pipeline.toBuffer();

      const duration = Date.now() - startTime;
      const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

      logger.success(`Print optimization complete in ${duration}ms (${sizeMB} MB)`);

      return {
        buffer,
        metadata: {
          format: this.printPresets.format,
          dpi: this.printPresets.dpi,
          colorSpace: 'RGB (convert to CMYK in InDesign)',
          quality: this.printPresets.quality,
          sizeMB: parseFloat(sizeMB),
          durationMs: duration,
          optimizedFor: 'print'
        }
      };

    } catch (error) {
      logger.error(`Print optimization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate both web and print versions
   * @param {Buffer|string} input - Image buffer or path
   * @param {string} baseName - Base filename (without extension)
   * @param {string} outputDir - Output directory
   * @returns {Promise<Object>} { web, print }
   */
  async optimizeBoth(input, baseName, outputDir = null) {
    const dir = outputDir || this.outputDir;

    logger.info(`Generating web and print versions: ${baseName}`);

    try {
      // Create output directory
      await fs.mkdir(dir, { recursive: true });

      // Generate both versions in parallel
      const [webResult, printResult] = await Promise.all([
        this.optimizeForWeb(input),
        this.optimizeForPrint(input)
      ]);

      // Save to disk
      const webPath = path.join(dir, `${baseName}-web.png`);
      const printPath = path.join(dir, `${baseName}-print.png`);

      await Promise.all([
        fs.writeFile(webPath, webResult.buffer),
        fs.writeFile(printPath, printResult.buffer)
      ]);

      logger.success(`Saved: ${webPath} and ${printPath}`);

      return {
        web: {
          path: webPath,
          buffer: webResult.buffer,
          metadata: webResult.metadata
        },
        print: {
          path: printPath,
          buffer: printResult.buffer,
          metadata: printResult.metadata
        }
      };

    } catch (error) {
      logger.error(`Failed to generate both versions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Apply TEEI color grading
   * (Warm tones with teal and gold accents)
   * @param {Buffer|string} input - Image buffer or path
   * @returns {Promise<Buffer>} Color-graded image buffer
   */
  async applyTEEIColorGrading(input) {
    try {
      logger.info('Applying TEEI color grading (warm tones, teal/gold accents)');

      const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

      // Apply color adjustments to match TEEI brand palette
      const buffer = await sharp(inputBuffer)
        .modulate({
          brightness: 1.05,    // Slightly brighter
          saturation: 0.95,    // Slightly desaturated for natural look
          hue: 10              // Warm shift toward gold
        })
        .linear(1.1, -10)      // Increase contrast, reduce blacks slightly
        .toBuffer();

      logger.success('TEEI color grading applied');

      return buffer;

    } catch (error) {
      logger.error(`Color grading failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crop image to specific aspect ratio
   * @param {Buffer|string} input - Image buffer or path
   * @param {string} aspectRatio - Aspect ratio (e.g., '16:9', '4:3', '1:1')
   * @returns {Promise<Buffer>} Cropped image buffer
   */
  async cropToAspectRatio(input, aspectRatio = '16:9') {
    try {
      const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;

      const metadata = await sharp(inputBuffer).metadata();
      const { width, height } = metadata;

      // Parse aspect ratio
      const [aspectWidth, aspectHeight] = aspectRatio.split(':').map(Number);
      const targetRatio = aspectWidth / aspectHeight;
      const currentRatio = width / height;

      let cropWidth, cropHeight, left, top;

      if (currentRatio > targetRatio) {
        // Image is wider than target - crop width
        cropHeight = height;
        cropWidth = Math.floor(height * targetRatio);
        left = Math.floor((width - cropWidth) / 2);
        top = 0;
      } else {
        // Image is taller than target - crop height
        cropWidth = width;
        cropHeight = Math.floor(width / targetRatio);
        left = 0;
        top = Math.floor((height - cropHeight) / 2);
      }

      const buffer = await sharp(inputBuffer)
        .extract({
          left,
          top,
          width: cropWidth,
          height: cropHeight
        })
        .toBuffer();

      logger.success(`Cropped to ${aspectRatio} (${cropWidth}x${cropHeight})`);

      return buffer;

    } catch (error) {
      logger.error(`Cropping failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get image metadata
   * @param {Buffer|string} input - Image buffer or path
   * @returns {Promise<Object>} Image metadata
   */
  async getMetadata(input) {
    try {
      const inputBuffer = typeof input === 'string' ? await fs.readFile(input) : input;
      const metadata = await sharp(inputBuffer).metadata();

      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        sizeMB: (inputBuffer.length / 1024 / 1024).toFixed(2)
      };
    } catch (error) {
      logger.error(`Failed to get metadata: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch optimize multiple images
   * @param {Array<{input, name}>} images - Array of image objects
   * @param {string} mode - 'web', 'print', or 'both'
   * @param {string} outputDir - Output directory
   * @returns {Promise<Array>} Results array
   */
  async batchOptimize(images, mode = 'both', outputDir = null) {
    const dir = outputDir || this.outputDir;

    logger.section(`Batch optimizing ${images.length} images (mode: ${mode})`);

    const results = [];

    for (const { input, name } of images) {
      try {
        let result;

        if (mode === 'web') {
          const webResult = await this.optimizeForWeb(input);
          const webPath = path.join(dir, `${name}-web.png`);
          await fs.writeFile(webPath, webResult.buffer);
          result = { web: { path: webPath, ...webResult } };
        } else if (mode === 'print') {
          const printResult = await this.optimizeForPrint(input);
          const printPath = path.join(dir, `${name}-print.png`);
          await fs.writeFile(printPath, printResult.buffer);
          result = { print: { path: printPath, ...printResult } };
        } else {
          result = await this.optimizeBoth(input, name, dir);
        }

        results.push({
          name,
          success: true,
          ...result
        });

        logger.success(`✓ ${name}`);

      } catch (error) {
        logger.error(`✗ ${name}: ${error.message}`);
        results.push({
          name,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    logger.section(`Batch complete: ${successCount}/${images.length} succeeded`);

    return results;
  }
}

export default ImageOptimizer;
