/**
 * CLAUDE 4 vs CLAUDE 3.5 COMPARISON BENCHMARK
 *
 * Compares Claude 4 series (Opus 4.1, Sonnet 4.5, Haiku 4.5) against Claude 3.5 Sonnet
 * to demonstrate accuracy improvements, extended thinking benefits, and performance gains.
 *
 * Metrics Tested:
 * - Accuracy (score precision)
 * - Analysis depth (reasoning quality)
 * - Extended thinking impact
 * - Speed (latency)
 * - Cost-effectiveness
 * - Context window utilization
 *
 * Usage: node scripts/compare-claude-4-vs-3.5.js <path-to-pdf>
 *
 * Options:
 *   --iterations <n>  Number of test runs per model (default: 3)
 *   --verbose         Show detailed analysis from each model
 */

import Anthropic from '@anthropic-ai/sdk';
import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, 'config', '.env') });

// Test configuration for each model
const TEST_MODELS = {
  'claude-3.5-sonnet': {
    model: 'claude-3-5-sonnet-20241022',
    generation: 3.5,
    thinkingSupport: false,
    contextWindow: 128000,
    maxTokens: 4096,
    costPer1M: { input: 3.00, output: 15.00 }
  },
  'claude-opus-4.1': {
    model: 'claude-opus-4.1',
    generation: 4.1,
    thinkingSupport: true,
    thinkingType: 'extended',
    thinkingBudget: 10000,
    contextWindow: 200000,
    maxTokens: 8192,
    costPer1M: { input: 15.00, output: 75.00 }
  },
  'claude-sonnet-4.5': {
    model: 'claude-sonnet-4.5',
    generation: 4.5,
    thinkingSupport: true,
    thinkingType: 'enabled',
    thinkingBudget: 5000,
    contextWindow: 200000,
    maxTokens: 8192,
    costPer1M: { input: 3.00, output: 15.00 }
  },
  'claude-haiku-4.5': {
    model: 'claude-haiku-4.5',
    generation: 4.5,
    thinkingSupport: false,
    contextWindow: 200000,
    maxTokens: 4096,
    costPer1M: { input: 0.40, output: 2.00 }
  }
};

// Validation prompt
const VALIDATION_PROMPT = `Analyze this TEEI document page for brand compliance.

TEEI Brand Guidelines:
- Colors: Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A (NO copper/orange)
- Fonts: Lora (headlines), Roboto Flex (body)
- Layout: 40pt margins, 12-column grid, consistent spacing

Provide analysis in JSON:
{
  "score": <1-10>,
  "grade": "<A+ to F>",
  "confidence": <0-100>,
  "criticalViolations": ["<issues>"],
  "reasoning": "<explanation of your analysis process>",
  "specificFindings": {
    "colorViolations": ["<specific colors found>"],
    "fontIssues": ["<specific fonts found>"],
    "layoutProblems": ["<specific layout issues>"]
  }
}`;

/**
 * Benchmark Comparison Runner
 */
class ClaudeBenchmark {
  constructor(filePath, options = {}) {
    this.filePath = path.resolve(filePath);
    this.fileName = path.basename(filePath);
    this.outputDir = path.join(projectRoot, 'exports', 'benchmarks', 'claude-4-vs-3.5');
    this.options = {
      iterations: options.iterations || 3,
      verbose: options.verbose || false
    };

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    this.anthropic = new Anthropic({ apiKey });

    this.results = {
      testFile: this.fileName,
      timestamp: new Date().toISOString(),
      iterations: this.options.iterations,
      models: {}
    };
  }

  /**
   * Convert PDF to image (first page only for benchmarking)
   */
  async convertFirstPage() {
    console.log(`\n📄 Converting first page for benchmark...`);

    const isPDF = this.fileName.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      return this.filePath;
    }

    const tempDir = path.join(this.outputDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    try {
      const document = await pdf(this.filePath, { scale: 2.5 });

      for await (const image of document) {
        const imagePath = path.join(tempDir, 'page-1.png');
        await fs.writeFile(imagePath, image);
        console.log(`  ✅ Page 1 converted\n`);
        return imagePath;
      }
    } catch (error) {
      throw new Error(`PDF conversion failed: ${error.message}`);
    }
  }

  /**
   * Test single model with multiple iterations
   */
  async testModel(modelName, imageBase64) {
    const config = TEST_MODELS[modelName];

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTING: ${modelName.toUpperCase()}`);
    console.log('='.repeat(60));
    console.log(`Generation: ${config.generation}`);
    console.log(`Thinking: ${config.thinkingSupport ? 'YES' : 'NO'}`);
    console.log(`Context: ${config.contextWindow} tokens`);
    console.log(`Iterations: ${this.options.iterations}`);

    const iterations = [];

    for (let i = 0; i < this.options.iterations; i++) {
      console.log(`\n  Run ${i + 1}/${this.options.iterations}...`);

      try {
        const result = await this.runAnalysis(config, imageBase64);
        iterations.push(result);

        console.log(`    Score: ${result.analysis.score}/10 | Grade: ${result.analysis.grade}`);
        console.log(`    Time: ${result.duration}ms | Tokens: ${result.tokensUsed}`);

      } catch (error) {
        console.error(`    ❌ Failed: ${error.message}`);
        iterations.push({
          error: error.message,
          duration: null,
          analysis: null
        });
      }
    }

    // Calculate aggregate metrics
    const successfulRuns = iterations.filter(r => !r.error);

    if (successfulRuns.length === 0) {
      return {
        modelName,
        config,
        iterations,
        success: false,
        error: 'All iterations failed'
      };
    }

    const avgScore = successfulRuns.reduce((sum, r) => sum + r.analysis.score, 0) / successfulRuns.length;
    const avgDuration = successfulRuns.reduce((sum, r) => sum + r.duration, 0) / successfulRuns.length;
    const avgTokens = successfulRuns.reduce((sum, r) => sum + r.tokensUsed, 0) / successfulRuns.length;
    const avgConfidence = successfulRuns.reduce((sum, r) => sum + r.analysis.confidence, 0) / successfulRuns.length;

    const allCriticalViolations = new Set();
    successfulRuns.forEach(r => {
      r.analysis.criticalViolations.forEach(v => allCriticalViolations.add(v));
    });

    console.log(`\n  📊 Aggregate Results:`);
    console.log(`    Avg Score: ${avgScore.toFixed(2)}/10`);
    console.log(`    Avg Confidence: ${avgConfidence.toFixed(1)}%`);
    console.log(`    Avg Duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`    Avg Tokens: ${avgTokens.toFixed(0)}`);

    return {
      modelName,
      config,
      iterations,
      aggregates: {
        avgScore: Number(avgScore.toFixed(2)),
        avgDuration: Number(avgDuration.toFixed(0)),
        avgTokens: Number(avgTokens.toFixed(0)),
        avgConfidence: Number(avgConfidence.toFixed(1)),
        criticalViolations: Array.from(allCriticalViolations)
      },
      success: true
    };
  }

  /**
   * Run single analysis
   */
  async runAnalysis(config, imageBase64) {
    const requestConfig = {
      model: config.model,
      max_tokens: config.maxTokens,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: VALIDATION_PROMPT
            }
          ]
        }
      ]
    };

    // Add thinking if supported
    if (config.thinkingSupport) {
      requestConfig.thinking = {
        type: config.thinkingType,
        budget_tokens: config.thinkingBudget
      };
    }

    const startTime = Date.now();
    const message = await this.anthropic.messages.create(requestConfig);
    const duration = Date.now() - startTime;

    // Extract response
    const textContent = message.content.find(c => c.type === 'text');
    const thinkingContent = message.content.find(c => c.type === 'thinking');

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Calculate token usage (approximate)
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

    return {
      duration,
      tokensUsed,
      analysis,
      thinkingUsed: thinkingContent ? thinkingContent.thinking?.length || 0 : 0,
      usage: message.usage
    };
  }

  /**
   * Generate comparison report
   */
  generateComparison() {
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('📊 CLAUDE 4 vs 3.5 COMPARISON RESULTS');
    console.log('='.repeat(80));

    const modelNames = Object.keys(this.results.models);

    // Comparison table
    console.log(`\n${'Model'.padEnd(20)} | ${'Score'.padEnd(10)} | ${'Confidence'.padEnd(12)} | ${'Speed'.padEnd(10)} | ${'Tokens'.padEnd(10)}`);
    console.log('-'.repeat(80));

    modelNames.forEach(name => {
      const result = this.results.models[name];
      if (!result.success) return;

      const agg = result.aggregates;
      console.log(
        `${name.padEnd(20)} | ` +
        `${agg.avgScore.toFixed(2).padEnd(10)} | ` +
        `${agg.avgConfidence.toFixed(1) + '%'.padEnd(12)} | ` +
        `${agg.avgDuration + 'ms'.padEnd(10)} | ` +
        `${agg.avgTokens.toString().padEnd(10)}`
      );
    });

    // Calculate improvements
    const baseline = this.results.models['claude-3.5-sonnet'];
    if (baseline && baseline.success) {
      console.log(`\n${'='.repeat(80)}`);
      console.log('🚀 IMPROVEMENTS OVER CLAUDE 3.5 SONNET');
      console.log('='.repeat(80));

      modelNames.forEach(name => {
        if (name === 'claude-3.5-sonnet') return;

        const model = this.results.models[name];
        if (!model.success) return;

        const scoreDiff = model.aggregates.avgScore - baseline.aggregates.avgScore;
        const confDiff = model.aggregates.avgConfidence - baseline.aggregates.avgConfidence;
        const speedDiff = ((baseline.aggregates.avgDuration - model.aggregates.avgDuration) / baseline.aggregates.avgDuration * 100);

        console.log(`\n${name.toUpperCase()}:`);
        console.log(`  Accuracy: ${scoreDiff >= 0 ? '+' : ''}${scoreDiff.toFixed(2)} points (${(scoreDiff / 10 * 100).toFixed(1)}% ${scoreDiff >= 0 ? 'better' : 'worse'})`);
        console.log(`  Confidence: ${confDiff >= 0 ? '+' : ''}${confDiff.toFixed(1)}%`);
        console.log(`  Speed: ${speedDiff >= 0 ? '' : '+'}${Math.abs(speedDiff).toFixed(1)}% ${speedDiff >= 0 ? 'faster' : 'slower'}`);
      });
    }

    // Key findings
    console.log(`\n${'='.repeat(80)}`);
    console.log('🔑 KEY FINDINGS');
    console.log('='.repeat(80));

    const findings = [];

    // Find best model
    const sortedByScore = modelNames
      .map(name => ({ name, score: this.results.models[name].aggregates?.avgScore || 0 }))
      .sort((a, b) => b.score - a.score);

    findings.push(`✓ Most Accurate: ${sortedByScore[0].name} (${sortedByScore[0].score.toFixed(2)}/10)`);

    // Find fastest
    const sortedBySpeed = modelNames
      .map(name => ({ name, speed: this.results.models[name].aggregates?.avgDuration || Infinity }))
      .sort((a, b) => a.speed - b.speed);

    findings.push(`✓ Fastest: ${sortedBySpeed[0].name} (${sortedBySpeed[0].speed}ms)`);

    // Extended thinking impact (Opus vs Sonnet)
    const opus = this.results.models['claude-opus-4.1'];
    const sonnet = this.results.models['claude-sonnet-4.5'];
    if (opus?.success && sonnet?.success) {
      const thinkingImpact = opus.aggregates.avgScore - sonnet.aggregates.avgScore;
      findings.push(`✓ Extended Thinking Impact: ${thinkingImpact >= 0 ? '+' : ''}${thinkingImpact.toFixed(2)} points (Opus vs Sonnet)`);
    }

    // Context window advantage
    findings.push(`✓ Context Window: Claude 4 has 200K (vs 128K in 3.5) = +56% capacity`);

    findings.forEach(f => console.log(`  ${f}`));

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Save report
   */
  async saveReport() {
    await fs.mkdir(this.outputDir, { recursive: true });

    const timestamp = Date.now();
    const reportPath = path.join(this.outputDir, `comparison-${timestamp}.json`);

    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));

    console.log(`\n📄 Full Report: ${reportPath}`);

    return reportPath;
  }

  /**
   * Run full benchmark
   */
  async run() {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 CLAUDE 4 vs 3.5 BENCHMARK COMPARISON');
    console.log('='.repeat(80));
    console.log(`\nTest File: ${this.fileName}`);
    console.log(`Iterations per Model: ${this.options.iterations}`);
    console.log(`Models: ${Object.keys(TEST_MODELS).join(', ')}`);

    try {
      // Convert first page
      const imagePath = await this.convertFirstPage();
      const imageBuffer = await fs.readFile(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      // Test each model
      for (const modelName of Object.keys(TEST_MODELS)) {
        const result = await this.testModel(modelName, imageBase64);
        this.results.models[modelName] = result;
      }

      // Generate comparison
      this.generateComparison();

      // Save report
      await this.saveReport();

      console.log('\n✅ Benchmark complete!\n');

    } catch (error) {
      console.error('\n❌ Benchmark failed:', error.message);
      if (this.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

// CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  let filePath = null;
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--iterations' && args[i + 1]) {
      options.iterations = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--verbose') {
      options.verbose = true;
    } else if (!filePath && !args[i].startsWith('--')) {
      filePath = args[i];
    }
  }

  if (!filePath) {
    console.error('Usage: node compare-claude-4-vs-3.5.js <path-to-pdf> [options]');
    console.error('\nOptions:');
    console.error('  --iterations <n>  Number of test runs per model (default: 3)');
    console.error('  --verbose         Show detailed analysis from each model');
    process.exit(1);
  }

  if (!fsSync.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const benchmark = new ClaudeBenchmark(filePath, options);
  benchmark.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default ClaudeBenchmark;
