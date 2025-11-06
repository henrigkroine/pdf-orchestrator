/**
 * TEST ENSEMBLE VALIDATION SYSTEM
 *
 * Tests the multi-model ensemble validator to ensure all components work correctly.
 * This script validates:
 * - Configuration loading
 * - Model initialization (Gemini, Claude, GPT-4V)
 * - Ensemble orchestration
 * - Confidence scoring
 * - Report generation
 *
 * Usage: node test-ensemble.js [path-to-test-image]
 */

import { EnsembleEngine } from './scripts/lib/ensemble-engine.js';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config({ path: path.join(__dirname, 'config', '.env') });

/**
 * Test suite for ensemble system
 */
class EnsembleTestSuite {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Run a test
   */
  async test(name, fn) {
    process.stdout.write(`\n🧪 ${name}... `);
    try {
      await fn();
      console.log('✅ PASSED');
      this.passed++;
      return true;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      this.failed++;
      return false;
    }
  }

  /**
   * Assert condition
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Print summary
   */
  summary() {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`\n✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📊 Total: ${this.passed + this.failed}`);
    console.log(`\n${this.failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️  SOME TESTS FAILED'}\n`);

    return this.failed === 0;
  }
}

/**
 * Create a simple test image (1x1 red pixel PNG)
 */
async function createTestImage() {
  const testDir = path.join(__dirname, 'test-data');
  await fs.mkdir(testDir, { recursive: true });

  const testImagePath = path.join(testDir, 'test-image.png');

  // 1x1 red pixel PNG (base64)
  const redPixelPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );

  await fs.writeFile(testImagePath, redPixelPNG);

  return testImagePath;
}

/**
 * Run all tests
 */
async function runTests(testImagePath) {
  const suite = new EnsembleTestSuite();

  console.log('\n' + '='.repeat(80));
  console.log('🧪 ENSEMBLE VALIDATION SYSTEM - TEST SUITE');
  console.log('='.repeat(80));

  // Test 1: Configuration Loading
  await suite.test('Configuration file loads correctly', async () => {
    const configPath = path.join(__dirname, 'config', 'ensemble-config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);

    suite.assert(config.models, 'Config has models section');
    suite.assert(config.models.gemini, 'Config has Gemini model');
    suite.assert(config.models.claude, 'Config has Claude model');
    suite.assert(config.models.gpt4v, 'Config has GPT-4V model');
    suite.assert(config.thresholds, 'Config has thresholds');
    suite.assert(config.ensembleStrategy, 'Config has ensemble strategy');
  });

  // Test 2: Environment Variables
  await suite.test('API keys are configured', async () => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const claudeKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    suite.assert(
      geminiKey || claudeKey || openaiKey,
      'At least one API key must be configured'
    );

    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      console.log('\n     ✓ Gemini API key configured');
    }
    if (claudeKey && claudeKey !== 'your_anthropic_api_key_here') {
      console.log('     ✓ Claude API key configured');
    }
    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      console.log('     ✓ OpenAI API key configured');
    }
  });

  // Test 3: Ensemble Engine Initialization
  await suite.test('Ensemble Engine initializes successfully', async () => {
    const configPath = path.join(__dirname, 'config', 'ensemble-config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);

    const engine = new EnsembleEngine(config);

    const apiKeys = {};
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      apiKeys.gemini = process.env.GEMINI_API_KEY;
    }
    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
      apiKeys.claude = process.env.ANTHROPIC_API_KEY;
    }
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      apiKeys.gpt4v = process.env.OPENAI_API_KEY;
    }

    suite.assert(Object.keys(apiKeys).length > 0, 'At least one API key available');

    await engine.initialize(apiKeys);

    suite.assert(engine.adapters.length > 0, 'Engine has adapters initialized');
    console.log(`\n     ✓ Initialized ${engine.adapters.length} model(s)`);
  });

  // Test 4: Test Image Analysis (if API keys available)
  const hasAPIKeys = (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') ||
                    (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') ||
                    (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');

  if (hasAPIKeys && testImagePath) {
    await suite.test('Ensemble analysis runs successfully', async () => {
      const configPath = path.join(__dirname, 'config', 'ensemble-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      const engine = new EnsembleEngine(config);

      const apiKeys = {};
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        apiKeys.gemini = process.env.GEMINI_API_KEY;
      }
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
        apiKeys.claude = process.env.ANTHROPIC_API_KEY;
      }
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        apiKeys.gpt4v = process.env.OPENAI_API_KEY;
      }

      await engine.initialize(apiKeys);

      const imageBuffer = await fs.readFile(testImagePath);

      const prompt = `Analyze this image and provide a JSON response with:
{
  "overallScore": <1-10>,
  "gradeLevel": "<A-F>",
  "brandCompliance": { "score": <1-10> },
  "designQuality": { "score": <1-10> },
  "contentQuality": { "score": <1-10> },
  "criticalViolations": [],
  "recommendations": [],
  "strengths": [],
  "summary": "Brief assessment"
}`;

      const result = await engine.analyze(prompt, imageBuffer, 'image/png');

      suite.assert(result, 'Analysis returns result');
      suite.assert(result.overallScore !== undefined, 'Result has overall score');
      suite.assert(result.confidence !== undefined, 'Result has confidence score');
      suite.assert(result.scores, 'Result has category scores');
      suite.assert(result.agreement, 'Result has agreement metrics');
      suite.assert(result.individualAnalyses, 'Result has individual model analyses');

      console.log(`\n     ✓ Overall Score: ${result.overallScore}/10`);
      console.log(`     ✓ Confidence: ${result.confidence}%`);
      console.log(`     ✓ Agreement: ${result.agreement.percentage}%`);
      console.log(`     ✓ Models Succeeded: ${result.metadata.successfulModels}/${result.metadata.totalModels}`);
    });

    await suite.test('Confidence scoring works correctly', async () => {
      const configPath = path.join(__dirname, 'config', 'ensemble-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      const engine = new EnsembleEngine(config);

      const apiKeys = {};
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        apiKeys.gemini = process.env.GEMINI_API_KEY;
      }
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
        apiKeys.claude = process.env.ANTHROPIC_API_KEY;
      }
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        apiKeys.gpt4v = process.env.OPENAI_API_KEY;
      }

      await engine.initialize(apiKeys);

      const imageBuffer = await fs.readFile(testImagePath);

      const prompt = `Simple test: Rate this image 1-10 and provide JSON.`;

      const result = await engine.analyze(prompt, imageBuffer, 'image/png');

      suite.assert(result.confidence >= 0 && result.confidence <= 100, 'Confidence is 0-100');
      suite.assert(result.confidenceLevel, 'Confidence level is set');
      suite.assert(['HIGH', 'MEDIUM', 'LOW'].includes(result.confidenceLevel), 'Valid confidence level');

      console.log(`\n     ✓ Confidence: ${result.confidence}% (${result.confidenceLevel})`);
    });

    await suite.test('Violation aggregation works', async () => {
      const configPath = path.join(__dirname, 'config', 'ensemble-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);

      const engine = new EnsembleEngine(config);

      const apiKeys = {};
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
        apiKeys.gemini = process.env.GEMINI_API_KEY;
      }
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') {
        apiKeys.claude = process.env.ANTHROPIC_API_KEY;
      }
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        apiKeys.gpt4v = process.env.OPENAI_API_KEY;
      }

      await engine.initialize(apiKeys);

      const imageBuffer = await fs.readFile(testImagePath);

      const prompt = `Analyze and report violations in JSON format.`;

      const result = await engine.analyze(prompt, imageBuffer, 'image/png');

      suite.assert(Array.isArray(result.criticalViolations), 'Violations is an array');

      if (result.criticalViolations.length > 0) {
        suite.assert(result.criticalViolations[0].violation, 'Violation has description');
        suite.assert(result.criticalViolations[0].confidence !== undefined, 'Violation has confidence');
        suite.assert(Array.isArray(result.criticalViolations[0].detectedBy), 'Violation shows detecting models');

        console.log(`\n     ✓ Found ${result.criticalViolations.length} violation(s)`);
      } else {
        console.log(`\n     ✓ No violations detected`);
      }
    });
  } else {
    console.log('\n⚠️  Skipping live API tests (no API keys configured or no test image)');
    console.log('   Configure API keys in config/.env to run full test suite');
  }

  // Test 5: File Structure
  await suite.test('Required files exist', async () => {
    const requiredFiles = [
      'package.json',
      'config/ensemble-config.json',
      'scripts/lib/ensemble-engine.js',
      'scripts/validate-pdf-ensemble.js',
      'test-ensemble.js'
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, file);
      suite.assert(fsSync.existsSync(filePath), `${file} exists`);
    }

    console.log('\n     ✓ All required files present');
  });

  // Test 6: Dependencies
  await suite.test('Required dependencies are installed', async () => {
    const packagePath = path.join(__dirname, 'package.json');
    const packageData = await fs.readFile(packagePath, 'utf8');
    const pkg = JSON.parse(packageData);

    const requiredDeps = [
      '@anthropic-ai/sdk',
      '@google/generative-ai',
      'openai',
      'pdf-to-img',
      'sharp',
      'dotenv'
    ];

    for (const dep of requiredDeps) {
      suite.assert(pkg.dependencies[dep], `${dep} is in dependencies`);
    }

    console.log('\n     ✓ All required dependencies listed');
  });

  return suite.summary();
}

// Main execution
(async () => {
  try {
    console.log('\n🚀 Starting Ensemble Validation System Tests...\n');

    // Get test image path from args or create one
    let testImagePath = process.argv[2];

    if (!testImagePath) {
      console.log('📸 No test image provided, creating test image...');
      testImagePath = await createTestImage();
      console.log(`   Created: ${testImagePath}\n`);
    } else if (!fsSync.existsSync(testImagePath)) {
      console.error(`❌ Test image not found: ${testImagePath}`);
      process.exit(1);
    }

    // Run tests
    const success = await runTests(testImagePath);

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
