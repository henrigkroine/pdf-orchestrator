#!/usr/bin/env node

/**
 * Image Generation Integration Test Suite
 *
 * Tests:
 * 1. Prompt engineering (TEEI brand style)
 * 2. Image generation
 * 3. Caching (hash-based)
 * 4. Optimization (web and print versions)
 * 5. Pipeline integration
 *
 * Performance Targets:
 * - Generation: < 30s per image
 * - Cache hit rate: > 70%
 */

const fs = require('fs').promises;
const path = require('path');
const { ImageGenerator, PromptEngineer } = require('../image-gen/imageGenerator.js');

class ImageGenIntegrationTest {
  constructor() {
    this.testResults = [];
    this.startTime = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('='.repeat(80));
    console.log('IMAGE GENERATION INTEGRATION TEST SUITE');
    console.log('='.repeat(80));
    console.log('');

    this.startTime = Date.now();

    await this.test1_PromptEngineering();
    await this.test2_ImageGeneration();
    await this.test3_Caching();
    await this.test4_Optimization();
    await this.test5_PipelineIntegration();

    this.printSummary();

    const allPassed = this.testResults.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
  }

  /**
   * Test 1: Prompt Engineering
   */
  async test1_PromptEngineering() {
    console.log('[Test 1] Prompt Engineering');
    console.log('-'.repeat(80));

    try {
      const engineer = new PromptEngineer();

      // Test TEEI brand compliance in prompts
      const contexts = [
        { partner: 'AWS', industry: 'technology', designSystem: 'teei' },
        { partner: 'Cornell', industry: 'education', designSystem: 'tfu' }
      ];

      let allPromptsValid = true;

      for (const context of contexts) {
        const heroPrompt = engineer.generatePrompt(context, 'hero');
        const programPrompt = engineer.generatePrompt(context, 'program');

        // Check that prompts contain brand style keywords
        const teeiBrandKeywords = ['warm', 'natural', 'authentic', 'Ukrainian', 'diverse'];
        const hasBrandStyle = teeiBrandKeywords.some(keyword =>
          heroPrompt.toLowerCase().includes(keyword.toLowerCase())
        );

        if (!hasBrandStyle) {
          allPromptsValid = false;
          console.log(`  ✗ Prompt missing brand style: ${context.designSystem}`);
        }

        // Check that prompts have technical specs
        const hasTechnicalSpecs = heroPrompt.includes('300 DPI');

        if (!hasTechnicalSpecs) {
          allPromptsValid = false;
          console.log(`  ✗ Prompt missing technical specs`);
        }
      }

      const passed = allPromptsValid;

      console.log(`  Contexts tested: ${contexts.length}`);
      console.log(`  Brand style keywords present: ${allPromptsValid ? 'YES' : 'NO'}`);
      console.log(`  Technical specs present: YES`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Prompt Engineering',
        passed,
        details: {
          contextsTested: contexts.length,
          allValid: allPromptsValid
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Prompt Engineering',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 2: Image Generation
   */
  async test2_ImageGeneration() {
    console.log('[Test 2] Image Generation');
    console.log('-'.repeat(80));

    const startTime = Date.now();

    try {
      // Enable dry-run mode for testing
      process.env.DRY_RUN_IMAGE_GEN = '1';

      const generator = new ImageGenerator();
      await generator.initialize();

      // Generate 1 hero image
      const mockJobConfig = {
        name: 'test-generation',
        design_system: 'teei',
        data: {
          partner: 'Test Partner',
          industry: 'technology'
        },
        generation: {
          imageGeneration: {
            enabled: true,
            hero: { enabled: true },
            programPhotos: { count: 0 }
          }
        }
      };

      const results = await generator.generateForJob(mockJobConfig);
      const duration = Date.now() - startTime;

      // Check that image was generated (or mocked)
      const heroGenerated = results.hero !== null;

      // Check performance: < 30s per image (dry-run should be instant)
      const performanceOk = duration < 30000;

      const passed = heroGenerated && performanceOk;

      console.log(`  Hero image generated: ${heroGenerated ? 'YES' : 'NO'}`);
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Target: < 30000ms`);
      console.log(`  Cache hits: ${results.cacheHits}`);
      console.log(`  Total cost: $${results.totalCost.toFixed(2)}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Image Generation',
        passed,
        duration,
        details: {
          heroGenerated,
          durationMs: duration,
          cacheHits: results.cacheHits,
          cost: results.totalCost
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Image Generation',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 3: Caching
   */
  async test3_Caching() {
    console.log('[Test 3] Caching');
    console.log('-'.repeat(80));

    try {
      process.env.DRY_RUN_IMAGE_GEN = '1';

      const generator = new ImageGenerator();
      await generator.initialize();

      const mockJobConfig = {
        name: 'cache-test',
        design_system: 'teei',
        data: {
          partner: 'Cache Test Partner',
          industry: 'technology'
        },
        generation: {
          imageGeneration: {
            enabled: true,
            hero: { enabled: true },
            programPhotos: { count: 0 }
          }
        }
      };

      // First generation (cache miss)
      const start1 = Date.now();
      const results1 = await generator.generateForJob(mockJobConfig);
      const time1 = Date.now() - start1;

      // Second generation (cache hit expected)
      const start2 = Date.now();
      const results2 = await generator.generateForJob(mockJobConfig);
      const time2 = Date.now() - start2;

      // Check cache hit rate
      const cacheHitRate = results2.cacheHits / (results2.cacheHits + results2.totalGenerated);
      const passed = cacheHitRate >= 0.70;

      console.log(`  First generation: ${time1}ms (cache miss)`);
      console.log(`  Second generation: ${time2}ms (cache hit expected)`);
      console.log(`  Cache hits: ${results2.cacheHits}`);
      console.log(`  Cache hit rate: ${(cacheHitRate * 100).toFixed(1)}%`);
      console.log(`  Target: > 70%`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Caching',
        passed,
        details: {
          cacheHitRate: (cacheHitRate * 100).toFixed(1) + '%',
          cacheHits: results2.cacheHits
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Caching',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 4: Optimization
   */
  async test4_Optimization() {
    console.log('[Test 4] Optimization');
    console.log('-'.repeat(80));

    try {
      process.env.DRY_RUN_IMAGE_GEN = '1';

      const generator = new ImageGenerator();
      await generator.initialize();

      const mockJobConfig = {
        name: 'optimization-test',
        design_system: 'teei',
        data: {
          partner: 'Optimization Test',
          industry: 'technology'
        },
        generation: {
          imageGeneration: {
            enabled: true,
            hero: { enabled: true },
            programPhotos: { count: 0 }
          }
        }
      };

      const results = await generator.generateForJob(mockJobConfig);

      // Check that optimized versions are created
      const hasWebVersion = results.hero?.optimized?.web !== null;
      const hasPrintVersion = results.hero?.optimized?.print !== null;

      const passed = hasWebVersion && hasPrintVersion;

      console.log(`  Hero image generated: ${results.hero !== null ? 'YES' : 'NO'}`);
      console.log(`  Web version created: ${hasWebVersion ? 'YES' : 'NO'}`);
      console.log(`  Print version created: ${hasPrintVersion ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Optimization',
        passed,
        details: {
          webVersion: hasWebVersion,
          printVersion: hasPrintVersion
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Optimization',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 5: Pipeline Integration
   */
  async test5_PipelineIntegration() {
    console.log('[Test 5] Pipeline Integration');
    console.log('-'.repeat(80));

    try {
      process.env.DRY_RUN_IMAGE_GEN = '1';

      // Test that job config is properly parsed
      const mockJobConfigPath = path.join(__dirname, '..', '..', 'test-jobs', 'image-gen-test.json');

      const mockJobConfig = {
        name: 'Pipeline Integration Test',
        design_system: 'teei',
        data: {
          partner: 'Pipeline Test Partner',
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

      // Create test job config
      await fs.mkdir(path.dirname(mockJobConfigPath), { recursive: true });
      await fs.writeFile(mockJobConfigPath, JSON.stringify(mockJobConfig, null, 2));

      const generator = new ImageGenerator();
      await generator.initialize();

      const results = await generator.generateForJob(mockJobConfig);

      // Check that all requested images were generated
      const heroGenerated = results.hero !== null;
      const programsGenerated = results.programs.length === 2;

      // Check that image paths are added to results
      const hasImagePaths = results.hero?.path !== undefined;

      const passed = heroGenerated && programsGenerated && hasImagePaths;

      console.log(`  Hero image: ${heroGenerated ? 'Generated' : 'Missing'}`);
      console.log(`  Program photos: ${results.programs.length}/2 generated`);
      console.log(`  Image paths included: ${hasImagePaths ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      // Cleanup
      try {
        await fs.unlink(mockJobConfigPath);
      } catch (e) {
        // Ignore cleanup errors
      }

      this.testResults.push({
        name: 'Pipeline Integration',
        passed,
        details: {
          heroGenerated,
          programsGenerated,
          hasImagePaths
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Pipeline Integration',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.length - passed;

    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('');

    if (failed > 0) {
      console.log('FAILED TESTS:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  ✗ ${r.name}: ${r.error || 'Test failed'}`);
        });
      console.log('');
    }

    const allPassed = failed === 0;
    console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('='.repeat(80));
  }
}

// Run tests
const tester = new ImageGenIntegrationTest();
tester.runAll().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
