#!/usr/bin/env node

/**
 * TEEI RAG (Retrieval-Augmented Generation) Validator
 *
 * Combines fine-tuned TEEI models with vector database RAG
 * for context-aware, example-driven validation.
 *
 * System Architecture:
 * 1. Extract visual features from document
 * 2. Retrieve similar brand examples from vector DB (RAG)
 * 3. Augment validation prompt with retrieved examples
 * 4. Use fine-tuned TEEI model for validation
 * 5. Return comprehensive results with examples
 *
 * Benefits:
 * - Context-aware: Shows similar approved/rejected examples
 * - Consistent: Uses vector DB as "brand memory"
 * - Accurate: Fine-tuned model + RAG = maximum performance
 * - Fast: <50ms vector retrieval, cached embeddings
 *
 * Usage:
 *   node scripts/validate-pdf-rag.js path/to/document.pdf
 *   node scripts/validate-pdf-rag.js --model models/teei-brand-lora document.pdf
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { chromium } from 'playwright';
import { TEEICustomModel } from './lib/teei-custom-model.js';
import { TEEIBrandVectorStore } from './lib/vector-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * RAG Validator
 */
class RAGValidator {
  constructor(options = {}) {
    this.modelPath = options.modelPath || 'models/teei-brand-lora';
    this.vectorStore = new TEEIBrandVectorStore(options.vectorStore || {});
    this.customModel = new TEEICustomModel({ modelPath: this.modelPath });
    this.browser = null;
    this.retrievalCount = options.retrievalCount || 5;
    this.useCache = options.cache !== false;
  }

  /**
   * Initialize RAG system
   */
  async initialize() {
    console.log('🚀 Initializing TEEI RAG Validator...\n');

    // Initialize vector store
    await this.vectorStore.initialize();

    // Load custom model
    const modelLoaded = await this.customModel.load(this.modelPath);

    if (!modelLoaded) {
      console.warn('⚠️  Fine-tuned model not available, using base model');
      console.warn('   RAG will still work but with reduced accuracy\n');
    }

    // Launch browser for feature extraction
    this.browser = await chromium.launch({ headless: true });

    console.log('✅ RAG Validator ready\n');
  }

  /**
   * Extract visual features from document
   */
  async extractFeatures(documentPath) {
    console.log('🔍 Extracting visual features...');

    const page = await this.browser.newPage();

    try {
      // Load document (assuming PDF converted to HTML or images)
      const htmlPath = documentPath.replace('.pdf', '.html');
      let url;

      try {
        await fs.access(htmlPath);
        url = `file://${path.resolve(htmlPath)}`;
      } catch {
        // Fallback to PDF path
        url = `file://${path.resolve(documentPath)}`;
      }

      await page.goto(url, { waitUntil: 'networkidle' });

      // Extract colors
      const colors = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const colorSet = new Set();

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            colorSet.add(style.backgroundColor);
          }
          if (style.color) {
            colorSet.add(style.color);
          }
        });

        return Array.from(colorSet);
      });

      // Extract fonts
      const fonts = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const fontSet = new Set();

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const fontFamily = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          fontSet.add(fontFamily);
        });

        return Array.from(fontSet);
      });

      // Extract layout info
      const layout = await page.evaluate(() => {
        const body = document.body;
        const computedStyle = window.getComputedStyle(body);

        return {
          width: body.offsetWidth,
          height: body.offsetHeight,
          marginTop: computedStyle.marginTop,
          marginRight: computedStyle.marginRight,
          marginBottom: computedStyle.marginBottom,
          marginLeft: computedStyle.marginLeft
        };
      });

      // Check for images
      const images = await page.evaluate(() => {
        const imgs = document.querySelectorAll('img');
        return {
          count: imgs.length,
          hasImages: imgs.length > 0
        };
      });

      console.log('   ✅ Features extracted\n');

      return {
        colors,
        fonts,
        layout,
        images
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Retrieve similar brand examples (RAG)
   */
  async retrieveSimilarExamples(features, documentPath) {
    console.log('🔎 Retrieving similar brand examples (RAG)...');

    const retrievalStartTime = Date.now();

    // Build retrieval queries based on features
    const queries = [];

    // Color-based retrieval
    if (features.colors.length > 0) {
      queries.push({
        type: 'color',
        query: `color usage with ${features.colors.slice(0, 3).join(', ')}`
      });
    }

    // Font-based retrieval
    if (features.fonts.length > 0) {
      queries.push({
        type: 'typography',
        query: `typography with ${features.fonts.join(', ')} fonts`
      });
    }

    // Layout-based retrieval
    queries.push({
      type: 'layout',
      query: `layout with ${features.layout.width}x${features.layout.height} dimensions`
    });

    // Photography-based retrieval
    if (features.images.hasImages) {
      queries.push({
        type: 'photography',
        query: 'authentic program photography with natural lighting'
      });
    }

    // Execute retrievals in parallel
    const retrievals = await Promise.all(
      queries.map(async ({ type, query }) => {
        const results = await this.vectorStore.findSimilarExamples(
          query,
          this.retrievalCount,
          { type }  // Filter by type
        );
        return {
          type,
          query,
          ...results
        };
      })
    );

    const retrievalDuration = Date.now() - retrievalStartTime;

    // Flatten and deduplicate examples
    const allExamples = new Map();
    retrievals.forEach(r => {
      r.examples.forEach(ex => {
        const key = `${ex.type}:${ex.description}`;
        if (!allExamples.has(key) || ex.score > allExamples.get(key).score) {
          allExamples.set(key, ex);
        }
      });
    });

    const uniqueExamples = Array.from(allExamples.values());

    // Sort by score (highest first)
    uniqueExamples.sort((a, b) => b.score - a.score);

    // Take top N
    const topExamples = uniqueExamples.slice(0, this.retrievalCount);

    console.log(`   ✅ Retrieved ${topExamples.length} examples in ${retrievalDuration}ms\n`);

    return {
      retrievals,
      examples: topExamples,
      duration_ms: retrievalDuration
    };
  }

  /**
   * Build augmented validation prompt with RAG context
   */
  buildAugmentedPrompt(documentPath, retrievedExamples) {
    const basePrompt = `Validate this TEEI partnership document for brand compliance.

**TEEI Brand Guidelines:**

Colors: Nordshore #00393F (primary), Sky #C9E4EC (secondary), Sand #FFF1E2, Beige #EFE1DC, Moss #65873B, Gold #BA8F5A, Clay #913B2F. FORBIDDEN: Copper/orange tones.

Typography: Lora (headlines Bold/SemiBold 28-48pt), Roboto Flex (body Regular 11-14pt, captions 9pt).

Layout: 12-column grid, 40pt margins, 60pt section spacing, 20pt element spacing.

Photography: Natural light, warm tones, authentic moments (not stock/staged).

Voice: Empowering, urgent, hopeful, inclusive, respectful, clear.

---

**SIMILAR BRAND EXAMPLES FOR REFERENCE:**

Here are ${retrievedExamples.length} similar examples from our brand library to guide your validation:
`;

    // Add retrieved examples
    const examplesText = retrievedExamples.map((ex, i) => {
      return `
${i + 1}. **${ex.type.toUpperCase()}** (Grade: ${ex.grade}, Similarity: ${ex.similarity})
   Description: ${ex.description}
   ${ex.grade === 'A+' ? '✅ APPROVED EXAMPLE - Follow this pattern' : '❌ VIOLATION EXAMPLE - Avoid this pattern'}
   ${ex.metadata ? `Metadata: ${JSON.stringify(ex.metadata)}` : ''}
`;
    }).join('\n');

    const finalPrompt = basePrompt + examplesText + `

---

**YOUR TASK:**

Compare the submitted document against:
1. TEEI Brand Guidelines (above)
2. Similar approved examples (A+/A grades above)
3. Similar violation examples (D/F grades above)

Provide detailed validation results with:
- Grade (A+ to F)
- Score (0-10)
- Violations found (with references to similar violations above)
- Strengths identified (with references to similar approved examples above)
- Specific recommendations

Use the retrieved examples as reference points for your validation.
`;

    return finalPrompt;
  }

  /**
   * Validate document with RAG
   */
  async validate(documentPath, options = {}) {
    console.log(`📄 Validating: ${documentPath}\n`);

    const startTime = Date.now();

    // 1. Extract visual features
    const features = await this.extractFeatures(documentPath);

    console.log('📊 Extracted Features:');
    console.log(`   Colors: ${features.colors.length}`);
    console.log(`   Fonts: ${features.fonts.join(', ')}`);
    console.log(`   Layout: ${features.layout.width}x${features.layout.height}`);
    console.log(`   Images: ${features.images.count}\n`);

    // 2. Retrieve similar examples (RAG)
    const retrieval = await this.retrieveSimilarExamples(features, documentPath);

    console.log('🔎 Retrieved Examples:');
    retrieval.examples.forEach((ex, i) => {
      console.log(`   ${i + 1}. ${ex.type}: ${ex.description.substring(0, 60)}... (${ex.similarity})`);
    });
    console.log();

    // 3. Build augmented prompt
    const augmentedPrompt = this.buildAugmentedPrompt(documentPath, retrieval.examples);

    // 4. Validate with fine-tuned model + RAG context
    console.log('🤖 Running validation with RAG-augmented model...\n');

    const validationResult = await this.customModel.validate(documentPath, {
      prompt: augmentedPrompt,
      temperature: options.temperature || 0.3,
      maxTokens: options.maxTokens || 1024
    });

    const totalDuration = Date.now() - startTime;

    // 5. Combine results
    const result = {
      document: documentPath,
      validation: validationResult,
      rag: {
        retrieval_duration_ms: retrieval.duration_ms,
        examples_retrieved: retrieval.examples.length,
        examples: retrieval.examples
      },
      features,
      timing: {
        feature_extraction_ms: startTime - Date.now() + retrieval.duration_ms,
        retrieval_ms: retrieval.duration_ms,
        validation_ms: totalDuration - retrieval.duration_ms,
        total_ms: totalDuration
      },
      timestamp: new Date().toISOString()
    };

    // Print results
    this.printResults(result);

    return result;
  }

  /**
   * Print validation results
   */
  printResults(result) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION RESULTS (RAG-Enhanced)');
    console.log('='.repeat(80) + '\n');

    const val = result.validation;

    console.log(`📄 Document: ${result.document}`);
    console.log(`⏱️  Duration: ${result.timing.total_ms}ms (retrieval: ${result.timing.retrieval_ms}ms)\n`);

    console.log(`📈 Grade: ${val.grade}`);
    console.log(`📊 Score: ${val.score}/10\n`);

    if (val.violations && val.violations.length > 0) {
      console.log(`❌ Violations (${val.violations.length}):`);
      val.violations.forEach((v, i) => {
        console.log(`   ${i + 1}. [${v.severity.toUpperCase()}] ${v.type}: ${v.issue}`);
        console.log(`      Location: ${v.location}`);
        console.log(`      Fix: ${v.fix}\n`);
      });
    }

    if (val.strengths && val.strengths.length > 0) {
      console.log(`✅ Strengths (${val.strengths.length}):`);
      val.strengths.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.aspect}: ${s.description}\n`);
      });
    }

    console.log(`🔎 RAG Context:`);
    console.log(`   Retrieved examples: ${result.rag.examples_retrieved}`);
    console.log(`   Retrieval time: ${result.rag.retrieval_duration_ms}ms`);
    console.log(`   Top similar examples:`);
    result.rag.examples.slice(0, 3).forEach((ex, i) => {
      console.log(`     ${i + 1}. ${ex.description.substring(0, 60)}... (${ex.similarity})`);
    });
    console.log();

    console.log('='.repeat(80) + '\n');
  }

  /**
   * Save results to file
   */
  async saveResults(result, outputPath) {
    await fs.writeFile(
      outputPath,
      JSON.stringify(result, null, 2),
      'utf-8'
    );
    console.log(`💾 Results saved to: ${outputPath}\n`);
  }

  /**
   * Cleanup
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

/**
 * Main execution
 */
async function main() {
  program
    .name('validate-pdf-rag')
    .description('TEEI RAG Validator - Context-aware PDF validation')
    .argument('<document>', 'Path to document (PDF/HTML)')
    .option('-m, --model <path>', 'Path to fine-tuned model', 'models/teei-brand-lora')
    .option('-n, --retrieval-count <number>', 'Number of examples to retrieve', '5')
    .option('-o, --output <path>', 'Output path for results JSON')
    .option('--no-cache', 'Disable caching')
    .option('--temperature <number>', 'Sampling temperature', '0.3')
    .option('--max-tokens <number>', 'Maximum tokens to generate', '1024');

  program.parse();

  const [documentPath] = program.args;
  const options = program.opts();

  const validator = new RAGValidator({
    modelPath: options.model,
    retrievalCount: parseInt(options.retrievalCount),
    cache: options.cache,
    vectorStore: {
      cache: options.cache
    }
  });

  try {
    await validator.initialize();

    const result = await validator.validate(documentPath, {
      temperature: parseFloat(options.temperature),
      maxTokens: parseInt(options.maxTokens)
    });

    // Save results if output path specified
    if (options.output) {
      await validator.saveResults(result, options.output);
    }

    console.log('✅ Validation complete');

    // Print performance summary
    console.log('\n📊 Performance Summary:');
    console.log(`   RAG retrieval: ${result.timing.retrieval_ms}ms`);
    console.log(`   Validation: ${result.timing.validation_ms}ms`);
    console.log(`   Total: ${result.timing.total_ms}ms`);
    console.log();

    return result;
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  } finally {
    await validator.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export { RAGValidator };
