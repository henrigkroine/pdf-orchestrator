/**
 * AI Configuration Loader
 * Loads and validates AI settings from job configs
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class AIConfig {
  constructor(jobConfigPath) {
    this.jobConfigPath = jobConfigPath;
    this.jobConfig = null;
    this.aiConfig = null;
    this.pdfPath = null;
    this.typographySidecarPath = null;
  }

  /**
   * Load and validate configuration
   * @returns {Promise<boolean>} True if config loaded successfully
   */
  async load() {
    try {
      // Load job config
      if (!fs.existsSync(this.jobConfigPath)) {
        logger.error(`Job config not found: ${this.jobConfigPath}`);
        return false;
      }

      const configContent = fs.readFileSync(this.jobConfigPath, 'utf-8');
      this.jobConfig = JSON.parse(configContent);

      // Extract AI config
      this.aiConfig = this.jobConfig.ai || {
        enabled: false,
        dryRun: true,
        features: {},
        thresholds: { minNormalizedScore: 0.85 }
      };

      // Default feature weights if not specified
      if (!this.aiConfig.features) {
        this.aiConfig.features = {};
      }

      // Set default weights
      const defaultFeatures = {
        typography: { enabled: false, weight: 0.4, minScore: 0.85 },
        whitespace: { enabled: false, weight: 0.3, minScore: 0.80 },
        color: { enabled: false, weight: 0.3, minScore: 0.90 },
        layout: { enabled: false, weight: 0.25, minScore: 0.85 }
      };

      for (const [featureName, defaults] of Object.entries(defaultFeatures)) {
        if (!this.aiConfig.features[featureName]) {
          this.aiConfig.features[featureName] = defaults;
        } else {
          // Merge with defaults
          this.aiConfig.features[featureName] = {
            ...defaults,
            ...this.aiConfig.features[featureName]
          };
        }
      }

      // Normalize thresholds
      if (!this.aiConfig.thresholds) {
        this.aiConfig.thresholds = {};
      }
      if (typeof this.aiConfig.thresholds.minNormalizedScore !== 'number') {
        this.aiConfig.thresholds.minNormalizedScore = 0.85;
      }
      if (typeof this.aiConfig.thresholds.failOnCriticalIssues !== 'boolean') {
        this.aiConfig.thresholds.failOnCriticalIssues = true;
      }

      // Normalize output settings
      if (!this.aiConfig.output) {
        this.aiConfig.output = {};
      }
      if (!this.aiConfig.output.reportDir) {
        this.aiConfig.output.reportDir = 'reports/ai';
      }
      if (typeof this.aiConfig.output.includeInLayer1Score !== 'boolean') {
        this.aiConfig.output.includeInLayer1Score = true;
      }
      if (typeof this.aiConfig.output.layer1Points !== 'number') {
        this.aiConfig.output.layer1Points = 10;
      }

      // Extract PDF path
      const filenameBase = this.jobConfig.output?.filename_base || 'document';
      this.pdfPath = path.join('exports', `${filenameBase}-DIGITAL.pdf`);

      // Extract typography sidecar path
      this.typographySidecarPath = this.jobConfig.typography_sidecar ||
                                    path.join('exports', `${filenameBase}-typography.json`);

      logger.success('Configuration loaded successfully');
      logger.debug(`AI enabled: ${this.isEnabled()}`);
      logger.debug(`Dry run: ${this.isDryRun()}`);

      return true;

    } catch (error) {
      logger.error(`Failed to load configuration: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if AI subsystem is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.aiConfig?.enabled === true;
  }

  /**
   * Check if dry run mode is active
   * @returns {boolean}
   */
  isDryRun() {
    return this.aiConfig?.dryRun === true;
  }

  /**
   * Check if advanced mode is enabled (Tier 1.5)
   * Advanced mode uses real PDF extraction instead of heuristics
   * @returns {boolean}
   */
  isAdvancedMode() {
    return this.aiConfig?.advancedMode === true;
  }

  /**
   * Check if a specific feature is enabled
   * @param {string} featureName - "typography", "whitespace", "color", or "layout"
   * @returns {boolean}
   */
  isFeatureEnabled(featureName) {
    return this.aiConfig?.features?.[featureName]?.enabled === true;
  }

  /**
   * Get feature configuration
   * @param {string} featureName
   * @returns {Object} Feature config
   */
  getFeatureConfig(featureName) {
    return this.aiConfig?.features?.[featureName] || null;
  }

  /**
   * Get minimum normalized score threshold
   * @returns {number}
   */
  getMinNormalizedScore() {
    return this.aiConfig?.thresholds?.minNormalizedScore || 0.85;
  }

  /**
   * Check if pipeline should fail on critical issues
   * @returns {boolean}
   */
  shouldFailOnCriticalIssues() {
    return this.aiConfig?.thresholds?.failOnCriticalIssues !== false;
  }

  /**
   * Get report output directory
   * @returns {string}
   */
  getReportDir() {
    return this.aiConfig?.output?.reportDir || 'reports/ai';
  }

  /**
   * Get PDF path
   * @returns {string}
   */
  getPdfPath() {
    return this.pdfPath;
  }

  /**
   * Get typography sidecar path
   * @returns {string}
   */
  getTypographySidecarPath() {
    return this.typographySidecarPath;
  }

  /**
   * Get job ID (sanitized from job config name)
   * @returns {string}
   */
  getJobId() {
    const name = this.jobConfig?.name || 'unknown_job';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Get TFU requirements (for color validation)
   * @returns {Object}
   */
  getTFURequirements() {
    return this.jobConfig?.tfu_requirements || {};
  }

  /**
   * Check if TFU validation is enabled
   * @returns {boolean}
   */
  isTFUValidationEnabled() {
    return this.jobConfig?.validate_tfu === true;
  }

  /**
   * Get full job config
   * @returns {Object}
   */
  getJobConfig() {
    return this.jobConfig;
  }

  /**
   * Get AI config
   * @returns {Object}
   */
  getAIConfig() {
    return this.aiConfig;
  }

  /**
   * Get RAG configuration (Tier 2)
   * @returns {Object} RAG config or null if disabled
   */
  getRagConfig() {
    // Support both old and new config structure
    const ragConfig = this.jobConfig?.planning?.rag || {};
    const legacyEnabled = this.jobConfig?.planning?.rag_enabled === true;

    return {
      enabled: ragConfig.enabled === true || legacyEnabled,
      vectorDatabase: ragConfig.vectorDatabase || 'qdrant',
      embeddingModel: ragConfig.embeddingModel || 'openai/text-embedding-3-large',
      retrievalCount: ragConfig.retrievalCount || 5,
      similarityThreshold: ragConfig.similarityThreshold || 0.75,
      indexPath: ragConfig.indexPath || 'ai/rag/indexes/',
      fallbackBehavior: ragConfig.fallbackBehavior || 'warn',
      hybridSearch: ragConfig.hybridSearch || { enabled: true }
    };
  }

  /**
   * Get Image Generation configuration (Tier 3)
   * @returns {Object} Image generation config or null if disabled
   */
  getImageGenerationConfig() {
    const imgConfig = this.jobConfig?.generation?.imageGeneration || {};

    return {
      enabled: imgConfig.enabled === true,
      provider: imgConfig.provider || 'openai-dalle3',
      quality: imgConfig.quality || 'hd',
      style: imgConfig.style || 'natural',
      size: imgConfig.size || '1792x1024',
      cacheEnabled: imgConfig.cacheEnabled !== false,
      cachePath: imgConfig.cachePath || imgConfig.cache_dir || 'assets/images/generated/',
      cacheMaxAgeDays: imgConfig.cacheMaxAgeDays || 30,
      requirements: imgConfig.requirements || {},
      prompts: imgConfig.prompts || {}
    };
  }

  /**
   * Get Accessibility configuration (Tier 3)
   * @returns {Object} Accessibility config or null if disabled
   */
  getAccessibilityConfig() {
    const a11yConfig = this.jobConfig?.validation?.accessibility || {};

    return {
      enabled: a11yConfig.enabled === true,
      standards: {
        wcag22AA: a11yConfig.standards?.wcag22AA || { enabled: true, failOnViolation: true },
        pdfUA: a11yConfig.standards?.pdfUA || { enabled: true, failOnViolation: false },
        section508: a11yConfig.standards?.section508 || { enabled: false, failOnViolation: false }
      },
      autoRemediation: {
        enabled: a11yConfig.autoRemediation?.enabled !== false,
        altText: {
          enabled: a11yConfig.autoRemediation?.altText?.enabled !== false,
          aiProvider: a11yConfig.autoRemediation?.altText?.aiProvider || a11yConfig.remediation_provider || 'aws-bedrock',
          model: a11yConfig.autoRemediation?.altText?.model || 'anthropic.claude-3-haiku-20240307-v1:0',
          maxLength: a11yConfig.autoRemediation?.altText?.maxLength || 125
        },
        structureTags: a11yConfig.autoRemediation?.structureTags || { enabled: true },
        readingOrder: a11yConfig.autoRemediation?.readingOrder || { enabled: true },
        contrastAdjustment: a11yConfig.autoRemediation?.contrastAdjustment || { enabled: true, targetRatio: 4.5 }
      },
      reportPath: a11yConfig.reportPath || a11yConfig.output_dir || 'reports/accessibility/'
    };
  }

  /**
   * Check if RAG is enabled (Tier 2)
   * @returns {boolean}
   */
  isRagEnabled() {
    return this.getRagConfig().enabled === true;
  }

  /**
   * Check if Image Generation is enabled (Tier 3)
   * @returns {boolean}
   */
  isImageGenerationEnabled() {
    return this.getImageGenerationConfig().enabled === true;
  }

  /**
   * Check if Accessibility validation is enabled (Tier 3)
   * @returns {boolean}
   */
  isAccessibilityEnabled() {
    return this.getAccessibilityConfig().enabled === true;
  }

  /**
   * Get tier level based on enabled features
   * @returns {string} "tier1", "tier1.5", "tier2", or "tier3"
   */
  getTierLevel() {
    if (this.isAccessibilityEnabled() || this.isImageGenerationEnabled()) {
      return 'tier3';
    }
    if (this.isRagEnabled()) {
      return 'tier2';
    }
    if (this.isAdvancedMode()) {
      return 'tier1.5';
    }
    if (this.isEnabled()) {
      return 'tier1';
    }
    return 'tier0';
  }

  /**
   * Validate that all required files exist
   * @returns {Object} { valid: boolean, missing: string[] }
   */
  validatePaths() {
    const missing = [];

    if (!fs.existsSync(this.pdfPath)) {
      missing.push(`PDF: ${this.pdfPath}`);
    }

    if (this.isFeatureEnabled('typography') && !fs.existsSync(this.typographySidecarPath)) {
      missing.push(`Typography sidecar: ${this.typographySidecarPath}`);
    }

    // Validate RAG index path if RAG is enabled
    if (this.isRagEnabled()) {
      const ragConfig = this.getRagConfig();
      if (ragConfig.indexPath && !fs.existsSync(ragConfig.indexPath)) {
        logger.warn(`RAG index path does not exist: ${ragConfig.indexPath} (will be created on first use)`);
      }
    }

    // Validate image cache path if image generation is enabled
    if (this.isImageGenerationEnabled()) {
      const imgConfig = this.getImageGenerationConfig();
      if (imgConfig.cachePath && !fs.existsSync(imgConfig.cachePath)) {
        logger.warn(`Image cache path does not exist: ${imgConfig.cachePath} (will be created on first use)`);
      }
    }

    // Validate accessibility report path if accessibility is enabled
    if (this.isAccessibilityEnabled()) {
      const a11yConfig = this.getAccessibilityConfig();
      if (a11yConfig.reportPath && !fs.existsSync(a11yConfig.reportPath)) {
        logger.warn(`Accessibility report path does not exist: ${a11yConfig.reportPath} (will be created on first use)`);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Create a summary of enabled features
   * @returns {string}
   */
  getSummary() {
    const enabledFeatures = Object.entries(this.aiConfig?.features || {})
      .filter(([_, config]) => config.enabled)
      .map(([name, config]) => `${name} (weight: ${config.weight})`)
      .join(', ');

    const tierLevel = this.getTierLevel();
    const tier2Features = [];
    const tier3Features = [];

    if (this.isRagEnabled()) tier2Features.push('RAG');
    if (this.isImageGenerationEnabled()) tier3Features.push('Image Gen');
    if (this.isAccessibilityEnabled()) tier3Features.push('A11y');

    const advancedMode = this.isAdvancedMode() ? 'Yes' : 'No';
    let summary = `AI: ${this.isEnabled() ? 'Enabled' : 'Disabled'} | ` +
           `Tier: ${tierLevel.toUpperCase()} | ` +
           `Advanced Mode: ${advancedMode} | ` +
           `Features: ${enabledFeatures || 'none'} | ` +
           `Threshold: ${this.getMinNormalizedScore()} | ` +
           `Dry Run: ${this.isDryRun()}`;

    if (tier2Features.length > 0) {
      summary += ` | Tier 2: ${tier2Features.join(', ')}`;
    }
    if (tier3Features.length > 0) {
      summary += ` | Tier 3: ${tier3Features.join(', ')}`;
    }

    return summary;
  }
}

module.exports = AIConfig;
