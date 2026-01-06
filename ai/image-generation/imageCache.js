/**
 * Image Generation Cache Manager
 *
 * Caches generated images to avoid redundant API calls and reduce costs.
 * Uses content-based hashing to identify duplicate prompts.
 *
 * Cache Strategy:
 * - Hash prompt + category + provider → unique cache key
 * - Store images in assets/images/generated/{jobId}/
 * - Store metadata JSON alongside images
 * - Automatic cache cleanup (images older than 30 days)
 * - Cache hit tracking for analytics
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger.js';

class ImageCache {
  constructor(config = {}) {
    this.cacheDir = config.cacheDir || 'assets/images/generated';
    this.maxAge = config.maxAge || 30 * 24 * 60 * 60 * 1000; // 30 days in ms
    this.enabled = config.enabled !== false; // enabled by default

    // Stats tracking
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0,
      errors: 0
    };
  }

  /**
   * Generate cache key from prompt
   * @param {string} prompt - Image generation prompt
   * @param {string} category - Image category
   * @param {string} provider - AI provider
   * @returns {string} Cache key (hash)
   */
  generateCacheKey(prompt, category, provider = 'dalle3') {
    const content = `${provider}:${category}:${prompt}`;
    return crypto
      .createHash('sha256')
      .update(content)
      .digest('hex')
      .substring(0, 16); // Use first 16 chars for shorter filenames
  }

  /**
   * Check if cached image exists
   * @param {string} cacheKey - Cache key
   * @param {string} jobId - Job identifier
   * @returns {Promise<Object|null>} Cached data or null
   */
  async get(cacheKey, jobId = 'default') {
    if (!this.enabled) {
      return null;
    }

    try {
      const jobCacheDir = path.join(this.cacheDir, jobId);
      const imagePath = path.join(jobCacheDir, `${cacheKey}.png`);
      const metadataPath = path.join(jobCacheDir, `${cacheKey}.json`);

      // Check if files exist
      const [imageExists, metadataExists] = await Promise.all([
        this._fileExists(imagePath),
        this._fileExists(metadataPath)
      ]);

      if (!imageExists || !metadataExists) {
        this.stats.misses++;
        return null;
      }

      // Load metadata
      const metadataContent = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(metadataContent);

      // Check cache age
      const cacheAge = Date.now() - new Date(metadata.cachedAt).getTime();
      if (cacheAge > this.maxAge) {
        logger.debug(`Cache expired for key: ${cacheKey} (age: ${Math.floor(cacheAge / 86400000)} days)`);
        this.stats.misses++;
        return null;
      }

      // Load image
      const imageBuffer = await fs.readFile(imagePath);

      this.stats.hits++;
      logger.info(`Cache HIT: ${cacheKey}`);

      return {
        imageBuffer,
        imagePath,
        metadata,
        cached: true
      };

    } catch (error) {
      logger.debug(`Cache miss for key: ${cacheKey} (${error.message})`);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Save image to cache
   * @param {string} cacheKey - Cache key
   * @param {Buffer} imageBuffer - Image data
   * @param {Object} metadata - Image metadata
   * @param {string} jobId - Job identifier
   * @returns {Promise<string>} Path to cached image
   */
  async save(cacheKey, imageBuffer, metadata, jobId = 'default') {
    if (!this.enabled) {
      return null;
    }

    try {
      // Create cache directory
      const jobCacheDir = path.join(this.cacheDir, jobId);
      await fs.mkdir(jobCacheDir, { recursive: true });

      // Define paths
      const imagePath = path.join(jobCacheDir, `${cacheKey}.png`);
      const metadataPath = path.join(jobCacheDir, `${cacheKey}.json`);

      // Enhance metadata
      const enhancedMetadata = {
        ...metadata,
        cachedAt: new Date().toISOString(),
        cacheKey,
        jobId
      };

      // Save image and metadata
      await Promise.all([
        fs.writeFile(imagePath, imageBuffer),
        fs.writeFile(metadataPath, JSON.stringify(enhancedMetadata, null, 2))
      ]);

      this.stats.saves++;
      logger.success(`Cached image: ${cacheKey}`);

      return imagePath;

    } catch (error) {
      this.stats.errors++;
      logger.error(`Failed to cache image: ${error.message}`);
      return null;
    }
  }

  /**
   * Clean up old cached images
   * @param {number} maxAge - Maximum age in milliseconds (optional)
   * @returns {Promise<Object>} { deletedCount, freedSpace }
   */
  async cleanup(maxAge = null) {
    const ageThreshold = maxAge || this.maxAge;
    const now = Date.now();

    logger.info(`Starting cache cleanup (max age: ${Math.floor(ageThreshold / 86400000)} days)`);

    let deletedCount = 0;
    let freedSpace = 0;

    try {
      // Check if cache directory exists
      if (!await this._fileExists(this.cacheDir)) {
        logger.info('Cache directory does not exist, skipping cleanup');
        return { deletedCount: 0, freedSpace: 0 };
      }

      // Get all job directories
      const jobDirs = await fs.readdir(this.cacheDir);

      for (const jobId of jobDirs) {
        const jobDir = path.join(this.cacheDir, jobId);
        const stat = await fs.stat(jobDir);

        if (!stat.isDirectory()) continue;

        // Get all metadata files in job directory
        const files = await fs.readdir(jobDir);
        const metadataFiles = files.filter(f => f.endsWith('.json'));

        for (const metadataFile of metadataFiles) {
          const metadataPath = path.join(jobDir, metadataFile);
          const imageName = metadataFile.replace('.json', '.png');
          const imagePath = path.join(jobDir, imageName);

          try {
            // Load metadata
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);

            // Check age
            const cachedTime = new Date(metadata.cachedAt).getTime();
            const age = now - cachedTime;

            if (age > ageThreshold) {
              // Delete image and metadata
              const imageSize = (await fs.stat(imagePath)).size;

              await Promise.all([
                fs.unlink(imagePath),
                fs.unlink(metadataPath)
              ]);

              deletedCount++;
              freedSpace += imageSize;

              logger.debug(`Deleted expired cache: ${imageName} (age: ${Math.floor(age / 86400000)} days)`);
            }
          } catch (error) {
            logger.warn(`Failed to process ${metadataFile}: ${error.message}`);
          }
        }
      }

      logger.success(`Cache cleanup complete: ${deletedCount} images deleted, ${(freedSpace / 1024 / 1024).toFixed(2)} MB freed`);

      return {
        deletedCount,
        freedSpace
      };

    } catch (error) {
      logger.error(`Cache cleanup failed: ${error.message}`);
      return {
        deletedCount,
        freedSpace,
        error: error.message
      };
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats
   */
  async getStats() {
    try {
      let totalImages = 0;
      let totalSize = 0;
      const jobStats = {};

      if (!await this._fileExists(this.cacheDir)) {
        return {
          totalImages: 0,
          totalSize: 0,
          jobStats: {},
          ...this.stats
        };
      }

      const jobDirs = await fs.readdir(this.cacheDir);

      for (const jobId of jobDirs) {
        const jobDir = path.join(this.cacheDir, jobId);
        const stat = await fs.stat(jobDir);

        if (!stat.isDirectory()) continue;

        const files = await fs.readdir(jobDir);
        const images = files.filter(f => f.endsWith('.png'));

        let jobSize = 0;
        for (const image of images) {
          const imagePath = path.join(jobDir, image);
          const imageStat = await fs.stat(imagePath);
          jobSize += imageStat.size;
        }

        totalImages += images.length;
        totalSize += jobSize;

        jobStats[jobId] = {
          images: images.length,
          size: jobSize
        };
      }

      return {
        totalImages,
        totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        jobStats,
        cacheHitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
        ...this.stats
      };

    } catch (error) {
      logger.error(`Failed to get cache stats: ${error.message}`);
      return {
        error: error.message,
        ...this.stats
      };
    }
  }

  /**
   * Clear entire cache
   * @returns {Promise<Object>} Deletion stats
   */
  async clear() {
    logger.warn('Clearing entire image cache');

    try {
      const stats = await this.getStats();

      if (!await this._fileExists(this.cacheDir)) {
        logger.info('Cache directory does not exist');
        return { deletedCount: 0, freedSpace: 0 };
      }

      // Remove entire cache directory
      await fs.rm(this.cacheDir, { recursive: true, force: true });

      // Recreate empty directory
      await fs.mkdir(this.cacheDir, { recursive: true });

      logger.success(`Cache cleared: ${stats.totalImages} images, ${stats.totalSizeMB} MB`);

      return {
        deletedCount: stats.totalImages,
        freedSpace: stats.totalSize
      };

    } catch (error) {
      logger.error(`Failed to clear cache: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if file exists
   * @private
   */
  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Enable or disable cache
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`Cache ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      saves: 0,
      errors: 0
    };
  }
}

export default ImageCache;
