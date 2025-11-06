#!/usr/bin/env node

/**
 * TEEI Custom Model Loader
 *
 * JavaScript wrapper for TEEI fine-tuned LoRA/QLoRA models.
 * Bridges Python-trained models with Node.js orchestrator.
 *
 * Features:
 * - Load LoRA/QLoRA fine-tuned models
 * - Validate TEEI documents with custom model
 * - Fallback to base model if adapters unavailable
 * - Automatic Python subprocess management
 * - Caching for performance
 *
 * Usage:
 *   import { TEEICustomModel } from './scripts/lib/teei-custom-model.js';
 *
 *   const model = new TEEICustomModel();
 *   await model.load('models/teei-brand-lora');
 *   const result = await model.validate('document.pdf');
 */

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

/**
 * TEEI Custom Model Wrapper
 */
export class TEEICustomModel {
  constructor(options = {}) {
    this.modelPath = options.modelPath || null;
    this.modelType = options.modelType || 'lora'; // 'lora' or 'qlora'
    this.baseModel = options.baseModel || 'google/gemini-2.5-flash';
    this.pythonPath = options.pythonPath || 'python3';
    this.loaded = false;
    this.config = null;
    this.cache = new Map();
    this.cacheEnabled = options.cache !== false;
    this.maxCacheSize = options.maxCacheSize || 100;
  }

  /**
   * Load fine-tuned model
   */
  async load(modelPath) {
    console.log(`📥 Loading TEEI custom model from ${modelPath}...`);

    this.modelPath = path.resolve(ROOT_DIR, modelPath);

    // Check if model exists
    const modelExists = await this.checkModelExists();
    if (!modelExists) {
      console.warn(`⚠️  Model not found at ${this.modelPath}`);
      console.warn('   Using base model without TEEI fine-tuning');
      console.warn('   To train: node scripts/finetune/prepare-teei-dataset.js && python scripts/finetune/train-lora-model.py');
      this.loaded = false;
      return false;
    }

    // Load model config
    this.config = await this.loadConfig();

    console.log(`✅ Model loaded: ${this.config.model_name}`);
    console.log(`   Type: ${this.modelType.toUpperCase()}`);
    console.log(`   Rank: ${this.config.lora_config.r}`);
    console.log(`   Trained: ${new Date(this.config.trained_at).toLocaleDateString()}`);
    console.log(`   Training loss: ${this.config.training_results.training_loss.toFixed(4)}`);
    console.log(`   Validation loss: ${this.config.training_results.validation_loss.toFixed(4)}`);

    this.loaded = true;
    return true;
  }

  /**
   * Check if model exists
   */
  async checkModelExists() {
    try {
      const configPath = path.join(this.modelPath, 'training_config.json');
      await fs.access(configPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Load model configuration
   */
  async loadConfig() {
    const configPath = path.join(this.modelPath, 'training_config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  }

  /**
   * Validate TEEI document
   */
  async validate(documentPath, options = {}) {
    console.log(`🔍 Validating document: ${documentPath}`);

    // Check cache
    const cacheKey = this.getCacheKey(documentPath, options);
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      console.log('   ⚡ Using cached result');
      return this.cache.get(cacheKey);
    }

    // Prepare validation prompt
    const prompt = options.prompt || this.getDefaultPrompt();

    // Run validation
    const result = await this.runValidation(documentPath, prompt, options);

    // Cache result
    if (this.cacheEnabled) {
      this.cacheResult(cacheKey, result);
    }

    return result;
  }

  /**
   * Run validation via Python subprocess
   */
  async runValidation(documentPath, prompt, options) {
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(ROOT_DIR, 'scripts/lib/validate-with-model.py');

      // Build command arguments
      const args = [
        pythonScript,
        '--model', this.modelPath || 'none',
        '--document', path.resolve(documentPath),
        '--prompt', prompt
      ];

      if (options.temperature) {
        args.push('--temperature', options.temperature.toString());
      }

      if (options.maxTokens) {
        args.push('--max-tokens', options.maxTokens.toString());
      }

      // Spawn Python process
      const python = spawn(this.pythonPath, args);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          console.error('❌ Python validation failed:');
          console.error(stderr);
          reject(new Error(`Python process exited with code ${code}`));
          return;
        }

        try {
          // Parse JSON response
          const result = JSON.parse(stdout);
          console.log(`   ✅ Validation complete: Grade ${result.grade}`);
          resolve(result);
        } catch (error) {
          console.error('❌ Failed to parse validation result:');
          console.error(stdout);
          reject(error);
        }
      });
    });
  }

  /**
   * Get default validation prompt
   */
  getDefaultPrompt() {
    return `Validate this TEEI partnership document for brand compliance.

Analyze against TEEI Brand Guidelines:

**Colors**: Nordshore #00393F (primary), Sky #C9E4EC (secondary), Sand #FFF1E2, Beige #EFE1DC, Moss #65873B, Gold #BA8F5A, Clay #913B2F. FORBIDDEN: Copper/orange tones.

**Typography**: Lora (headlines Bold/SemiBold 28-48pt), Roboto Flex (body Regular 11-14pt, captions 9pt).

**Layout**: 12-column grid, 40pt margins, 60pt section spacing, 20pt element spacing.

**Photography**: Natural light, warm tones, authentic moments (not stock/staged).

**Voice**: Empowering, urgent, hopeful, inclusive, respectful, clear.

Provide detailed validation results with grade (A+ to F), violations, and strengths.`;
  }

  /**
   * Generate cache key
   */
  getCacheKey(documentPath, options) {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify({ documentPath, options, modelPath: this.modelPath }))
      .digest('hex');
    return hash;
  }

  /**
   * Cache validation result
   */
  cacheResult(key, result) {
    // Implement LRU cache
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, result);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get model statistics
   */
  getStats() {
    if (!this.config) {
      return null;
    }

    return {
      modelName: this.config.model_name,
      modelType: this.modelType,
      loraRank: this.config.lora_config.r,
      loraAlpha: this.config.lora_config.lora_alpha,
      trainedAt: this.config.trained_at,
      trainingLoss: this.config.training_results.training_loss,
      validationLoss: this.config.training_results.validation_loss,
      trainingDuration: this.config.training_results.duration_seconds,
      cacheSize: this.cache.size
    };
  }
}

/**
 * TEEI Model Manager
 * Manages multiple fine-tuned models
 */
export class TEEIModelManager {
  constructor() {
    this.models = new Map();
    this.activeModel = null;
  }

  /**
   * Register a model
   */
  async registerModel(name, modelPath, options = {}) {
    console.log(`📝 Registering model: ${name}`);

    const model = new TEEICustomModel({
      modelPath,
      ...options
    });

    const loaded = await model.load(modelPath);

    if (loaded) {
      this.models.set(name, model);
      console.log(`   ✅ Registered: ${name}`);

      // Set as active if first model
      if (!this.activeModel) {
        this.activeModel = name;
        console.log(`   ⭐ Active model: ${name}`);
      }
    }

    return loaded;
  }

  /**
   * Switch active model
   */
  switchModel(name) {
    if (!this.models.has(name)) {
      throw new Error(`Model not found: ${name}`);
    }

    this.activeModel = name;
    console.log(`⭐ Switched to model: ${name}`);
  }

  /**
   * Get active model
   */
  getActiveModel() {
    if (!this.activeModel) {
      throw new Error('No active model. Register a model first.');
    }

    return this.models.get(this.activeModel);
  }

  /**
   * Validate with active model
   */
  async validate(documentPath, options = {}) {
    const model = this.getActiveModel();
    return await model.validate(documentPath, options);
  }

  /**
   * List all models
   */
  listModels() {
    const modelList = [];

    for (const [name, model] of this.models.entries()) {
      const stats = model.getStats();
      modelList.push({
        name,
        active: name === this.activeModel,
        ...stats
      });
    }

    return modelList;
  }

  /**
   * Compare models
   * Run validation with multiple models and compare results
   */
  async compareModels(documentPath, modelNames = null) {
    console.log(`🔬 Comparing models on: ${documentPath}\n`);

    const modelsToCompare = modelNames || Array.from(this.models.keys());
    const results = {};

    for (const name of modelsToCompare) {
      if (!this.models.has(name)) {
        console.warn(`⚠️  Model not found: ${name}`);
        continue;
      }

      console.log(`   Running ${name}...`);
      const model = this.models.get(name);
      const result = await model.validate(documentPath);
      results[name] = result;
    }

    console.log('\n📊 Comparison Results:\n');

    // Print comparison table
    console.log('Model                     | Grade | Score | Violations');
    console.log('------------------------- | ----- | ----- | ----------');

    for (const [name, result] of Object.entries(results)) {
      const grade = result.grade.padEnd(5);
      const score = result.score.toFixed(1);
      const violations = result.violations?.length || 0;
      console.log(`${name.padEnd(25)} | ${grade} | ${score}  | ${violations}`);
    }

    console.log();

    return results;
  }

  /**
   * Get best model based on validation results
   */
  async selectBestModel(testDocuments) {
    console.log(`🏆 Selecting best model based on ${testDocuments.length} test documents...\n`);

    const modelScores = new Map();

    for (const model of this.models.keys()) {
      modelScores.set(model, { totalScore: 0, totalLoss: 0, count: 0 });
    }

    // Test all models on all documents
    for (const doc of testDocuments) {
      console.log(`   Testing on: ${doc.path}`);

      for (const [name, model] of this.models.entries()) {
        const result = await model.validate(doc.path);

        const scores = modelScores.get(name);
        scores.totalScore += result.score;
        scores.count++;
      }
    }

    // Calculate average scores
    const rankings = [];
    for (const [name, scores] of modelScores.entries()) {
      rankings.push({
        model: name,
        avgScore: scores.totalScore / scores.count,
        testCount: scores.count
      });
    }

    // Sort by average score
    rankings.sort((a, b) => b.avgScore - a.avgScore);

    console.log('\n🏆 Model Rankings:\n');
    rankings.forEach((rank, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
      console.log(`${medal} ${i + 1}. ${rank.model}: ${rank.avgScore.toFixed(2)} (${rank.testCount} tests)`);
    });

    const bestModel = rankings[0].model;
    console.log(`\n⭐ Best model: ${bestModel}`);

    return bestModel;
  }
}

/**
 * Utility functions
 */

/**
 * Quick validation helper
 */
export async function validateWithTEEIModel(documentPath, modelPath = 'models/teei-brand-lora') {
  const model = new TEEICustomModel();
  await model.load(modelPath);
  return await model.validate(documentPath);
}

/**
 * Check if TEEI models are available
 */
export async function checkTEEIModelsAvailable() {
  const modelsDir = path.join(ROOT_DIR, 'models');

  try {
    const entries = await fs.readdir(modelsDir);
    const models = [];

    for (const entry of entries) {
      const entryPath = path.join(modelsDir, entry);
      const configPath = path.join(entryPath, 'training_config.json');

      try {
        await fs.access(configPath);
        models.push({
          name: entry,
          path: entryPath
        });
      } catch {
        // Not a model directory
      }
    }

    return {
      available: models.length > 0,
      models,
      count: models.length
    };
  } catch {
    return {
      available: false,
      models: [],
      count: 0
    };
  }
}

/**
 * Example usage
 */
async function example() {
  console.log('📚 TEEI Custom Model - Example Usage\n');

  // Check available models
  const availability = await checkTEEIModelsAvailable();

  console.log(`Available models: ${availability.count}`);
  if (availability.count > 0) {
    availability.models.forEach(m => console.log(`  - ${m.name}`));
  } else {
    console.log('  No trained models found. Train a model first:');
    console.log('  1. node scripts/finetune/prepare-teei-dataset.js');
    console.log('  2. python scripts/finetune/train-lora-model.py');
  }
  console.log();

  // Example: Single model validation
  if (availability.count > 0) {
    const model = new TEEICustomModel();
    await model.load(availability.models[0].path);

    // Validate a document
    // const result = await model.validate('path/to/document.pdf');
    // console.log('Validation result:', result);
  }

  // Example: Model manager with multiple models
  const manager = new TEEIModelManager();

  // Register models
  if (availability.count > 0) {
    for (const m of availability.models) {
      await manager.registerModel(m.name, m.path);
    }

    // List registered models
    console.log('\n📋 Registered Models:');
    const models = manager.listModels();
    models.forEach(m => {
      const active = m.active ? '⭐' : '  ';
      console.log(`${active} ${m.name} (${m.modelType.toUpperCase()}, rank=${m.loraRank})`);
    });
  }

  console.log('\n✅ Example complete');
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}
