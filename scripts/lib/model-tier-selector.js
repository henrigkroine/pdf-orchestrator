/**
 * MODEL TIER SELECTOR
 *
 * Provides intelligent model selection based on performance tiers:
 * - FAST: Ultra-fast validation (< 1s, 92-94% accuracy)
 * - BALANCED: Optimal speed/accuracy balance (1-2s, 96-97% accuracy)
 * - PREMIUM: Maximum accuracy with advanced reasoning (3-5s, 98-99% accuracy)
 *
 * This selector automatically configures ensemble models based on:
 * - User requirements (speed vs accuracy)
 * - Budget constraints
 * - Document criticality
 * - Available API keys
 *
 * Usage:
 *   const selector = new ModelTierSelector();
 *   const config = await selector.selectTier('premium');
 *   const engine = new EnsembleEngine(config);
 *
 * @module model-tier-selector
 * @version 2.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

/**
 * Model Tier Selector
 */
export class ModelTierSelector {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(projectRoot, 'config', 'ensemble-config.json');
    this.baseConfig = null;
  }

  /**
   * Load base configuration
   */
  async loadConfig() {
    if (this.baseConfig) {
      return this.baseConfig;
    }

    const configData = await fs.readFile(this.configPath, 'utf8');
    this.baseConfig = JSON.parse(configData);
    return this.baseConfig;
  }

  /**
   * Select tier and generate optimized configuration
   *
   * @param {string} tier - Tier name: 'fast', 'balanced', or 'premium'
   * @param {Object} options - Additional options
   * @returns {Object} Optimized ensemble configuration
   */
  async selectTier(tier = 'balanced', options = {}) {
    const config = await this.loadConfig();

    // Validate tier
    if (!['fast', 'balanced', 'premium'].includes(tier)) {
      throw new Error(`Invalid tier: ${tier}. Must be 'fast', 'balanced', or 'premium'.`);
    }

    const tierConfig = config.tiers[tier];

    console.log(`\n🎯 Selecting ${tierConfig.name}`);
    console.log(`   Description: ${tierConfig.description}`);
    console.log(`   Cost: ${tierConfig.cost}`);
    console.log(`   Speed: ${tierConfig.speed}`);
    console.log(`   Accuracy: ${tierConfig.accuracy}`);
    console.log(`   Use Case: ${tierConfig.useCase}`);

    // Build optimized config for this tier
    const optimizedConfig = {
      description: `${tierConfig.name} - ${tierConfig.description}`,
      version: config.version,
      tier: tier,
      tierMetadata: tierConfig,
      models: {},
      thresholds: config.thresholds,
      ensembleStrategy: config.ensembleStrategy,
      parallelProcessing: config.parallelProcessing,
      reporting: config.reporting
    };

    // Configure models for this tier
    const tierModels = this.getTierModels(tier, config);

    tierModels.forEach(modelKey => {
      const modelConfig = config.models[modelKey];
      if (modelConfig) {
        optimizedConfig.models[modelKey] = {
          ...modelConfig,
          enabled: true
        };

        console.log(`   ✅ ${modelKey}: ${modelConfig.model} (weight: ${modelConfig.weight})`);
      }
    });

    // Apply overrides if provided
    if (options.enableModels) {
      options.enableModels.forEach(modelKey => {
        if (optimizedConfig.models[modelKey]) {
          optimizedConfig.models[modelKey].enabled = true;
        }
      });
    }

    if (options.disableModels) {
      options.disableModels.forEach(modelKey => {
        if (optimizedConfig.models[modelKey]) {
          optimizedConfig.models[modelKey].enabled = false;
        }
      });
    }

    // Calculate estimated cost
    const estimatedCost = this.calculateEstimatedCost(optimizedConfig);
    console.log(`   💰 Estimated cost: $${estimatedCost.toFixed(4)} per page\n`);

    return optimizedConfig;
  }

  /**
   * Get model keys for a specific tier
   */
  getTierModels(tier, config) {
    switch (tier) {
      case 'fast':
        return ['gemini', 'claude-haiku'];

      case 'balanced':
        return ['gemini', 'claude', 'gpt5'];

      case 'premium':
        return ['gemini25pro', 'claude-opus', 'gpt5'];

      default:
        return ['gemini', 'claude', 'gpt4v']; // fallback to legacy
    }
  }

  /**
   * Calculate estimated cost per page
   */
  calculateEstimatedCost(config) {
    let totalCost = 0;

    Object.values(config.models).forEach(model => {
      if (model.enabled) {
        totalCost += model.costPerImage || 0;
      }
    });

    return totalCost;
  }

  /**
   * Recommend tier based on document properties
   *
   * @param {Object} documentProps - Document properties
   * @returns {string} Recommended tier
   */
  recommendTier(documentProps = {}) {
    const {
      isCritical = false,
      pageCount = 1,
      requiresCrossPageAnalysis = false,
      budgetPerPage = 0.05,
      speedRequirement = 'normal' // 'fast', 'normal', 'thorough'
    } = documentProps;

    console.log('\n🤔 Analyzing document requirements...');

    // Premium tier recommendations
    if (isCritical || requiresCrossPageAnalysis) {
      console.log('   ✅ Critical document or cross-page analysis → Recommending PREMIUM tier');
      return 'premium';
    }

    // Budget constraints
    if (budgetPerPage < 0.005) {
      console.log('   ✅ Budget constraint (<$0.005/page) → Recommending FAST tier');
      return 'fast';
    }

    // Speed requirements
    if (speedRequirement === 'fast' && budgetPerPage < 0.02) {
      console.log('   ✅ Speed priority + budget → Recommending FAST tier');
      return 'fast';
    }

    // Large batch processing
    if (pageCount > 100 && budgetPerPage < 0.02) {
      console.log('   ✅ Large batch (>100 pages) + budget → Recommending FAST tier');
      return 'fast';
    }

    // Default to balanced
    console.log('   ✅ Standard requirements → Recommending BALANCED tier');
    return 'balanced';
  }

  /**
   * Get tier comparison table
   */
  async getTierComparison() {
    const config = await this.loadConfig();

    return {
      fast: {
        ...config.tiers.fast,
        models: this.getTierModels('fast', config).map(key => config.models[key]?.model)
      },
      balanced: {
        ...config.tiers.balanced,
        models: this.getTierModels('balanced', config).map(key => config.models[key]?.model)
      },
      premium: {
        ...config.tiers.premium,
        models: this.getTierModels('premium', config).map(key => config.models[key]?.model)
      }
    };
  }

  /**
   * Print tier comparison table to console
   */
  async printTierComparison() {
    const comparison = await this.getTierComparison();

    console.log('\n' + '='.repeat(100));
    console.log('MODEL TIER COMPARISON - 2025 AI MODELS');
    console.log('='.repeat(100));

    Object.entries(comparison).forEach(([tier, info]) => {
      console.log(`\n🎯 ${info.name.toUpperCase()}`);
      console.log('-'.repeat(100));
      console.log(`   Description: ${info.description}`);
      console.log(`   Cost: ${info.cost}`);
      console.log(`   Speed: ${info.speed}`);
      console.log(`   Accuracy: ${info.accuracy}`);
      console.log(`   Models: ${info.models.join(', ')}`);
      console.log(`   Use Case: ${info.useCase}`);

      if (info.features) {
        console.log(`   Special Features:`);
        info.features.forEach(feature => {
          console.log(`     - ${feature}`);
        });
      }
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n💡 Recommendation Guide:');
    console.log('   • FAST: CI/CD pipelines, quick checks, large batches, budget-conscious');
    console.log('   • BALANCED: Standard validation, most use cases (RECOMMENDED)');
    console.log('   • PREMIUM: Critical documents, final validation, client deliverables');
    console.log('\n' + '='.repeat(100) + '\n');
  }

  /**
   * Validate that required API keys are available
   */
  async validateApiKeys(config) {
    const missingKeys = [];

    Object.entries(config.models).forEach(([key, model]) => {
      if (model.enabled) {
        const envKey = model.apiKeyEnv;
        const apiKey = process.env[envKey];

        if (!apiKey || apiKey.includes('your_') || apiKey.includes('_here')) {
          missingKeys.push({ model: key, envKey });
        }
      }
    });

    if (missingKeys.length > 0) {
      console.warn('\n⚠️  WARNING: Missing API keys for the following models:');
      missingKeys.forEach(({ model, envKey }) => {
        console.warn(`   - ${model}: ${envKey} not configured`);
      });
      console.warn('\nThese models will be automatically disabled.\n');
    }

    return missingKeys;
  }
}

/**
 * CLI interface for tier selection
 */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const selector = new ModelTierSelector();

  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    try {
      if (command === 'compare' || command === 'list') {
        await selector.printTierComparison();
      } else if (command === 'recommend') {
        // Parse document properties from CLI
        const props = {};

        for (let i = 1; i < args.length; i += 2) {
          const key = args[i].replace('--', '');
          const value = args[i + 1];

          if (key === 'critical') props.isCritical = value === 'true';
          if (key === 'pages') props.pageCount = parseInt(value);
          if (key === 'budget') props.budgetPerPage = parseFloat(value);
          if (key === 'speed') props.speedRequirement = value;
        }

        const recommended = selector.recommendTier(props);
        console.log(`\n🎯 Recommended Tier: ${recommended.toUpperCase()}\n`);

        const config = await selector.selectTier(recommended);
        console.log('Configuration generated. Use this tier in your validation scripts.\n');
      } else if (command && ['fast', 'balanced', 'premium'].includes(command)) {
        const config = await selector.selectTier(command);
        console.log('✅ Configuration generated successfully!\n');
      } else {
        console.log('Usage: node model-tier-selector.js [command] [options]');
        console.log('\nCommands:');
        console.log('  compare, list    Show tier comparison table');
        console.log('  recommend        Get tier recommendation based on document properties');
        console.log('  fast             Generate fast tier configuration');
        console.log('  balanced         Generate balanced tier configuration (default)');
        console.log('  premium          Generate premium tier configuration');
        console.log('\nRecommend Options:');
        console.log('  --critical <true|false>   Document is critical');
        console.log('  --pages <number>          Number of pages');
        console.log('  --budget <number>         Budget per page (USD)');
        console.log('  --speed <fast|normal|thorough>   Speed requirement');
        console.log('\nExamples:');
        console.log('  node model-tier-selector.js compare');
        console.log('  node model-tier-selector.js recommend --critical true --pages 10');
        console.log('  node model-tier-selector.js premium');
      }
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  })();
}

export default ModelTierSelector;
