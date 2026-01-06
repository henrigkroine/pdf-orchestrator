/**
 * Experiment Runner - A/B Testing for PDF Generation
 *
 * Runs multiple design variants and automatically selects the best one
 * based on QA scores, TFU compliance, and visual regression metrics.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WinnerSelector = require('./winner-selector');

class ExperimentRunner {
  constructor() {
    this.winnerSelector = new WinnerSelector();
  }

  /**
   * Run experiment mode - generate and test multiple variants
   * @param {Object} jobConfig - Base job configuration
   * @param {string} jobConfigPath - Path to job config file
   * @returns {Promise<Object>} Experiment results with winner
   */
  async runExperiment(jobConfig, jobConfigPath) {
    console.log('[Experiment] Starting experiment mode');

    const experimentConfig = jobConfig.experiment || {};
    const variantCount = experimentConfig.variants || 3;
    const variantConfigs = experimentConfig.variantConfigs || [];

    console.log(`[Experiment] Testing ${variantCount} variants`);

    // Generate variant configurations
    const variants = this.generateVariants(jobConfig, variantCount, variantConfigs);

    // Run pipeline for each variant
    const variantResults = [];
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      console.log(`\n[Experiment] === Variant ${i + 1}/${variants.length}: ${variant.description} ===`);

      const result = await this.runVariant(variant, i + 1);
      variantResults.push({
        variant: i + 1,
        description: variant.description,
        jobId: variant.jobId,
        config: variant.variantChanges,
        ...result
      });
    }

    // Select winner
    console.log('\n[Experiment] Analyzing results...');
    const winner = this.winnerSelector.selectWinner(variantResults, experimentConfig.weights);

    // Save experiment summary
    const summary = {
      baseJobId: jobConfig.jobId,
      experimentName: experimentConfig.name || 'Unnamed Experiment',
      description: experimentConfig.description || 'No description',
      timestamp: new Date().toISOString(),
      variantCount: variants.length,
      variants: variantResults,
      winner: winner,
      weights: experimentConfig.weights || this.winnerSelector.getDefaultWeights()
    };

    const summaryPath = this.saveSummary(summary, jobConfig.jobId);
    console.log(`\n[Experiment] Summary saved: ${summaryPath}`);

    return {
      success: true,
      experimentMode: true,
      variants: variantResults,
      winner: winner,
      summaryPath: summaryPath
    };
  }

  /**
   * Generate variant configurations from base job config
   * @param {Object} baseConfig - Base job configuration
   * @param {number} count - Number of variants to generate
   * @param {Array} variantConfigs - Predefined variant configurations
   * @returns {Array} Array of variant configurations
   */
  generateVariants(baseConfig, count, variantConfigs) {
    const variants = [];

    // If variant configs are explicitly defined, use them
    if (variantConfigs && variantConfigs.length > 0) {
      variantConfigs.forEach((variantConfig, index) => {
        const variant = JSON.parse(JSON.stringify(baseConfig)); // Deep clone
        variant.jobId = `${baseConfig.jobId}-variant-${index + 1}`;
        variant.variantNumber = index + 1;

        // Apply variant-specific changes
        this.applyVariantChanges(variant, variantConfig);

        variants.push({
          jobId: variant.jobId,
          description: variantConfig.description || `Variant ${index + 1}`,
          variantChanges: variantConfig,
          config: variant
        });
      });
    } else {
      // Generate default variants with different styles
      const defaultVariants = this.getDefaultVariants(count);

      defaultVariants.forEach((variantDef, index) => {
        const variant = JSON.parse(JSON.stringify(baseConfig)); // Deep clone
        variant.jobId = `${baseConfig.jobId}-variant-${index + 1}`;
        variant.variantNumber = index + 1;

        // Apply variant-specific changes
        this.applyVariantChanges(variant, variantDef);

        variants.push({
          jobId: variant.jobId,
          description: variantDef.description,
          variantChanges: variantDef,
          config: variant
        });
      });
    }

    return variants;
  }

  /**
   * Get default variant configurations
   * @param {number} count - Number of variants
   * @returns {Array} Default variant configurations
   */
  getDefaultVariants(count) {
    const variants = [
      {
        description: 'Classic Layout (Nordshore primary)',
        design: {
          colorScheme: 'nordshore-primary',
          layout: 'classic'
        }
      },
      {
        description: 'Modern Layout (Sky accents)',
        design: {
          colorScheme: 'sky-accent',
          layout: 'modern'
        }
      },
      {
        description: 'Bold Layout (Gold highlights)',
        design: {
          colorScheme: 'gold-highlight',
          layout: 'bold'
        }
      },
      {
        description: 'Minimal Layout (Sand backgrounds)',
        design: {
          colorScheme: 'sand-minimal',
          layout: 'minimal'
        }
      },
      {
        description: 'Premium Layout (Mixed palette)',
        design: {
          colorScheme: 'mixed-premium',
          layout: 'premium'
        }
      }
    ];

    return variants.slice(0, count);
  }

  /**
   * Apply variant-specific changes to job config
   * @param {Object} config - Job config to modify
   * @param {Object} changes - Changes to apply
   */
  applyVariantChanges(config, changes) {
    // Apply design changes
    if (changes.design) {
      config.design = config.design || {};
      Object.assign(config.design, changes.design);
    }

    // Apply output changes
    if (changes.output) {
      config.output = config.output || {};
      Object.assign(config.output, changes.output);
    }

    // Apply QA changes
    if (changes.qa) {
      config.qa = config.qa || {};
      Object.assign(config.qa, changes.qa);
    }

    // Apply any custom data changes
    if (changes.data) {
      config.data = config.data || {};
      Object.assign(config.data, changes.data);
    }
  }

  /**
   * Run pipeline for a single variant
   * @param {Object} variant - Variant configuration
   * @param {number} variantNumber - Variant number
   * @returns {Promise<Object>} Variant execution results
   */
  async runVariant(variant, variantNumber) {
    // Save variant config to temp file
    const variantConfigPath = path.join(
      __dirname,
      '..',
      'example-jobs',
      `_temp_variant_${variantNumber}.json`
    );

    fs.writeFileSync(variantConfigPath, JSON.stringify(variant.config, null, 2));

    console.log(`[Experiment] Saved variant config: ${variantConfigPath}`);
    console.log(`[Experiment] Running pipeline for variant ${variantNumber}...`);

    const startTime = Date.now();

    try {
      // Run orchestrator for this variant
      const result = await this.runOrchestrator(variantConfigPath);

      const duration = (Date.now() - startTime) / 1000;
      console.log(`[Experiment] Variant ${variantNumber} completed in ${duration.toFixed(1)}s`);

      // Load scorecard if available
      const scorecard = this.loadScorecard(variant.jobId);

      return {
        success: result.success,
        scorecard: scorecard,
        score: scorecard?.totalScore || 0,
        tfuScore: scorecard?.tfuScore || 0,
        visualDiff: scorecard?.visualDiffPercent || 0,
        passed: scorecard?.passed || false,
        duration: duration,
        pdfPath: result.pdfPath
      };

    } catch (error) {
      console.error(`[Experiment] Variant ${variantNumber} failed:`, error.message);

      return {
        success: false,
        error: error.message,
        score: 0,
        tfuScore: 0,
        visualDiff: 100,
        passed: false,
        duration: (Date.now() - startTime) / 1000
      };

    } finally {
      // Clean up temp config file
      try {
        fs.unlinkSync(variantConfigPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Run orchestrator for variant config
   * @param {string} configPath - Path to variant config file
   * @returns {Promise<Object>} Orchestrator result
   */
  runOrchestrator(configPath) {
    return new Promise((resolve, reject) => {
      const orchestratorPath = path.join(__dirname, '..', 'orchestrator.js');

      const child = spawn('node', [orchestratorPath, configPath], {
        stdio: 'inherit',
        cwd: path.join(__dirname, '..')
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          reject(new Error(`Orchestrator exited with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Load scorecard JSON for a variant
   * @param {string} jobId - Job ID
   * @returns {Object|null} Scorecard data or null
   */
  loadScorecard(jobId) {
    const scorecardPath = path.join(
      __dirname,
      '..',
      'reports',
      'pipeline',
      `${jobId}-scorecard.json`
    );

    if (!fs.existsSync(scorecardPath)) {
      console.warn(`[Experiment] Scorecard not found: ${scorecardPath}`);
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(scorecardPath, 'utf8'));
    } catch (error) {
      console.error(`[Experiment] Error loading scorecard:`, error.message);
      return null;
    }
  }

  /**
   * Save experiment summary to file
   * @param {Object} summary - Experiment summary data
   * @param {string} baseJobId - Base job ID
   * @returns {string} Path to saved summary
   */
  saveSummary(summary, baseJobId) {
    const summaryDir = path.join(__dirname, '..', 'reports', 'experiments');

    if (!fs.existsSync(summaryDir)) {
      fs.mkdirSync(summaryDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const summaryPath = path.join(summaryDir, `${baseJobId}-experiment-${timestamp}.json`);

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    return summaryPath;
  }
}

module.exports = ExperimentRunner;
