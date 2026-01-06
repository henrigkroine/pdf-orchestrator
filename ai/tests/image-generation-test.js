/**
 * Image Generation Pipeline Test Suite
 *
 * Tests all components of the image generation system:
 * - Prompt engineering (TEEI brand compliance)
 * - Image generation (DALL-E 3 / dry run mode)
 * - Caching (hash generation, cache hits)
 * - Optimization (web/print quality)
 * - Orchestration (end-to-end workflow)
 */

import { fileURLToPath } from 'url';
import ImageGenerationClient from '../image-generation/imageGenerationClient.js';
import PromptEngineer from '../image-generation/promptEngineer.js';
import ImageCache from '../image-generation/imageCache.js';
import ImageOptimizer from '../image-generation/imageOptimizer.js';
import ImageGenerationOrchestrator from '../image-generation/imageGenerationOrchestrator.js';
import logger from '../utils/logger.js';

// Test configuration
const testJobConfig = {
  jobId: 'test-image-gen-001',
  imageGeneration: {
    enabled: true,
    dryRun: true, // Set to false to test with real API
    provider: 'dalle3',
    quality: 'standard',
    caching: true
  },
  data: {
    partner: {
      name: 'AWS'
    },
    aiImageSlots: {
      hero: 'Diverse Ukrainian students collaborating on cloud computing projects with laptops, warm natural lighting',
      program_1: 'Students engaged in hands-on AWS training, modern learning environment',
      cover: 'Hopeful Ukrainian learner using educational technology, bright inspiring atmosphere'
    }
  }
};

class ImageGenerationTests {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * Run all tests
   */
  async runAll() {
    logger.section('Image Generation Pipeline Test Suite');
    logger.info(`Mode: ${testJobConfig.imageGeneration.dryRun ? 'DRY RUN' : 'LIVE API'}`);

    await this.testPromptEngineer();
    await this.testImageCache();
    await this.testImageOptimizer();
    await this.testImageGenerationClient();
    await this.testOrchestrator();

    this.printSummary();

    return this.results.failed === 0;
  }

  /**
   * Test: Prompt Engineer
   */
  async testPromptEngineer() {
    logger.subsection('Test: Prompt Engineer');

    const engineer = new PromptEngineer({ verbose: false });

    // Test 1: Generate prompt for hero category
    await this.runTest('Generate hero prompt', async () => {
      const prompt = engineer.generatePrompt({ category: 'hero' });

      if (!prompt || prompt.length < 50) {
        throw new Error('Prompt too short or empty');
      }

      if (!prompt.includes('NOT staged')) {
        throw new Error('Prompt missing TEEI brand style negatives');
      }

      logger.info(`Generated: ${prompt.substring(0, 80)}...`);
      return true;
    });

    // Test 2: Enhance user prompt
    await this.runTest('Enhance user prompt', async () => {
      const userPrompt = 'Diverse Ukrainian students collaborating on cloud computing, authentic educational moment';
      const enhanced = engineer.generatePrompt({
        category: 'hero',
        userPrompt
      });

      if (!enhanced.includes(userPrompt)) {
        throw new Error('Enhanced prompt missing original content');
      }

      // Check for TEEI brand style elements (any lighting term)
      const hasLightingTerm = ['warm', 'natural', 'light', 'golden', 'window', 'diffused'].some(
        term => enhanced.toLowerCase().includes(term)
      );

      if (!hasLightingTerm) {
        throw new Error('Enhanced prompt missing lighting keywords');
      }

      logger.info(`Enhanced: ${enhanced.substring(0, 80)}...`);
      return true;
    });

    // Test 3: Validate prompt
    await this.runTest('Validate prompt against TEEI guidelines', async () => {
      const goodPrompt = 'Diverse students, warm natural lighting, authentic moment, NOT staged';
      const validation = engineer.validatePrompt(goodPrompt);

      if (!validation.valid) {
        throw new Error(`Good prompt failed validation: ${validation.warnings}`);
      }

      const badPrompt = 'Corporate stock photography with studio lighting';
      const badValidation = engineer.validatePrompt(badPrompt);

      if (badValidation.valid) {
        throw new Error('Bad prompt passed validation');
      }

      logger.info(`Validation working correctly`);
      return true;
    });

    // Test 4: Generate variations
    await this.runTest('Generate prompt variations', async () => {
      const variations = engineer.generateVariations({ category: 'hero' }, 3);

      if (variations.length !== 3) {
        throw new Error('Expected 3 variations');
      }

      // Check that variations are different
      if (variations[0] === variations[1]) {
        throw new Error('Variations are identical');
      }

      logger.info(`Generated ${variations.length} unique variations`);
      return true;
    });
  }

  /**
   * Test: Image Cache
   */
  async testImageCache() {
    logger.subsection('Test: Image Cache');

    const cache = new ImageCache({ enabled: true });

    // Test 1: Generate cache key
    await this.runTest('Generate cache key', async () => {
      const key1 = cache.generateCacheKey('test prompt', 'hero', 'dalle3');
      const key2 = cache.generateCacheKey('test prompt', 'hero', 'dalle3');
      const key3 = cache.generateCacheKey('different prompt', 'hero', 'dalle3');

      if (key1 !== key2) {
        throw new Error('Same prompt generated different keys');
      }

      if (key1 === key3) {
        throw new Error('Different prompts generated same key');
      }

      logger.info(`Cache key: ${key1}`);
      return true;
    });

    // Test 2: Cache miss
    await this.runTest('Cache miss', async () => {
      const result = await cache.get('nonexistent-key-12345', 'test-job');

      if (result !== null) {
        throw new Error('Expected cache miss but got hit');
      }

      logger.info('Cache miss confirmed');
      return true;
    });

    // Test 3: Cache save and retrieve
    await this.runTest('Cache save and retrieve', async () => {
      const testKey = 'test-cache-key';
      const testBuffer = Buffer.from('fake image data');
      const testMetadata = {
        prompt: 'test prompt',
        provider: 'dalle3',
        category: 'hero'
      };

      await cache.save(testKey, testBuffer, testMetadata, 'test-job');

      const retrieved = await cache.get(testKey, 'test-job');

      if (!retrieved || !retrieved.cached) {
        throw new Error('Failed to retrieve cached image');
      }

      if (retrieved.imageBuffer.toString() !== testBuffer.toString()) {
        throw new Error('Cached image data mismatch');
      }

      logger.info('Cache save/retrieve working');
      return true;
    });

    // Test 4: Cache stats
    await this.runTest('Get cache stats', async () => {
      const stats = await cache.getStats();

      if (typeof stats.hits !== 'number') {
        throw new Error('Invalid stats format');
      }

      logger.info(`Cache stats: ${stats.hits} hits, ${stats.misses} misses`);
      return true;
    });
  }

  /**
   * Test: Image Optimizer
   */
  async testImageOptimizer() {
    logger.subsection('Test: Image Optimizer');

    const optimizer = new ImageOptimizer();

    // Create a test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // Test 1: Optimize for web
    await this.runTest('Optimize for web (150 DPI, RGB)', async () => {
      const result = await optimizer.optimizeForWeb(testImageBuffer);

      if (!result.buffer) {
        throw new Error('No buffer returned');
      }

      if (result.metadata.dpi !== 150) {
        throw new Error(`Expected 150 DPI, got ${result.metadata.dpi}`);
      }

      if (result.metadata.optimizedFor !== 'web') {
        throw new Error('Incorrect optimization target');
      }

      logger.info(`Web: ${result.metadata.sizeMB} MB, ${result.metadata.durationMs}ms`);
      return true;
    });

    // Test 2: Optimize for print
    await this.runTest('Optimize for print (300 DPI)', async () => {
      const result = await optimizer.optimizeForPrint(testImageBuffer);

      if (!result.buffer) {
        throw new Error('No buffer returned');
      }

      if (result.metadata.dpi !== 300) {
        throw new Error(`Expected 300 DPI, got ${result.metadata.dpi}`);
      }

      if (result.metadata.optimizedFor !== 'print') {
        throw new Error('Incorrect optimization target');
      }

      logger.info(`Print: ${result.metadata.sizeMB} MB, ${result.metadata.durationMs}ms`);
      return true;
    });

    // Test 3: Get metadata
    await this.runTest('Get image metadata', async () => {
      const metadata = await optimizer.getMetadata(testImageBuffer);

      if (!metadata.width || !metadata.height) {
        throw new Error('Missing dimension metadata');
      }

      logger.info(`Metadata: ${metadata.width}x${metadata.height}, ${metadata.format}`);
      return true;
    });
  }

  /**
   * Test: Image Generation Client
   */
  async testImageGenerationClient() {
    logger.subsection('Test: Image Generation Client');

    // Test in dry run mode
    const client = new ImageGenerationClient({
      provider: 'dalle3',
      dryRun: true
    });

    // Test 1: Dry run generation
    await this.runTest('Generate image (dry run)', async () => {
      const result = await client.generateImage({
        prompt: 'Test prompt for dry run',
        category: 'hero'
      });

      if (!result.metadata || !result.metadata.dryRun) {
        throw new Error('Dry run flag not set');
      }

      logger.info('Dry run generation successful');
      return true;
    });

    // Test 2: Get provider info
    await this.runTest('Get provider info', async () => {
      const info = client.getProviderInfo();

      if (info.provider !== 'dalle3') {
        throw new Error('Wrong provider reported');
      }

      if (!info.dryRun) {
        throw new Error('Dry run flag not reported');
      }

      logger.info(`Provider: ${info.provider}, Model: ${info.model}`);
      return true;
    });
  }

  /**
   * Test: Full Orchestrator Workflow
   */
  async testOrchestrator() {
    logger.subsection('Test: Orchestrator (End-to-End)');

    const orchestrator = new ImageGenerationOrchestrator(testJobConfig);

    // Test 1: Generate images for job
    await this.runTest('Generate all images for job', async () => {
      const results = await orchestrator.generateImagesForJob();

      if (!results.images || results.images.length === 0) {
        throw new Error('No images generated');
      }

      const expectedSlots = Object.keys(testJobConfig.data.aiImageSlots).length;
      if (results.images.length !== expectedSlots) {
        throw new Error(`Expected ${expectedSlots} images, got ${results.images.length}`);
      }

      logger.info(`Generated ${results.images.length} images`);
      logger.info(`Cost: $${results.stats.totalCost.toFixed(3)}`);
      logger.info(`Duration: ${(results.stats.totalDuration / 1000).toFixed(2)}s`);

      return true;
    });

    // Test 2: Get image paths
    await this.runTest('Get generated image paths', async () => {
      const paths = orchestrator.getImagePaths();

      if (Object.keys(paths).length === 0) {
        throw new Error('No image paths returned');
      }

      logger.info(`Retrieved ${Object.keys(paths).length} image paths`);
      return true;
    });

    // Test 3: Cache statistics
    await this.runTest('Get cache statistics', async () => {
      const stats = await orchestrator.getCacheStats();

      if (typeof stats.totalImages !== 'number') {
        throw new Error('Invalid cache stats format');
      }

      logger.info(`Cache: ${stats.totalImages} images, ${stats.totalSizeMB} MB`);
      return true;
    });
  }

  /**
   * Helper: Run individual test
   */
  async runTest(name, testFn) {
    this.results.total++;

    try {
      await testFn();

      logger.success(`✓ ${name}`);
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASS' });

    } catch (error) {
      logger.error(`✗ ${name}: ${error.message}`);
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAIL', error: error.message });
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    logger.section('Test Summary');
    logger.info(`Total: ${this.results.total}`);
    logger.success(`Passed: ${this.results.passed}`);

    if (this.results.failed > 0) {
      logger.error(`Failed: ${this.results.failed}`);
    }

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    logger.info(`Pass Rate: ${passRate}%`);

    if (this.results.failed === 0) {
      logger.success('\nAll tests passed! ✓');
    } else {
      logger.error('\nSome tests failed. See details above.');
    }
  }
}

// Run tests if executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  const tests = new ImageGenerationTests();

  tests.runAll()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logger.error(`Test suite failed: ${error.message}`);
      process.exit(1);
    });
}

export default ImageGenerationTests;
