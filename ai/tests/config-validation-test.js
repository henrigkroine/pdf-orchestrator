/**
 * Configuration Validation Test
 *
 * Tests job configuration files against job-config-schema.json
 * Validates all Tier 1-3 configuration options
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Color utilities for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

/**
 * Load JSON schema
 */
function loadSchema() {
  const schemaPath = path.join(__dirname, '../../schemas/job-config-schema.json');

  if (!fs.existsSync(schemaPath)) {
    console.error(`${colors.red}ERROR: Schema not found: ${schemaPath}${colors.reset}`);
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  return JSON.parse(schemaContent);
}

/**
 * Load job config
 */
function loadJobConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    console.error(`${colors.red}ERROR: Config file not found: ${configPath}${colors.reset}`);
    process.exit(1);
  }

  const configContent = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(configContent);
}

/**
 * Validate config against schema
 */
function validateConfig(config, schema) {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const valid = validate(config);

  return {
    valid,
    errors: validate.errors || []
  };
}

/**
 * Detect tier level from config
 */
function detectTierLevel(config) {
  const hasAccessibility = config.validation?.accessibility?.enabled === true;
  const hasImageGen = config.generation?.imageGeneration?.enabled === true;
  const hasRag = config.planning?.rag?.enabled === true || config.planning?.rag_enabled === true;
  const hasAdvancedMode = config.ai?.advancedMode === true;
  const hasAI = config.ai?.enabled === true;

  if (hasAccessibility || hasImageGen) return 'Tier 3';
  if (hasRag) return 'Tier 2';
  if (hasAdvancedMode) return 'Tier 1.5';
  if (hasAI) return 'Tier 1';
  return 'Tier 0';
}

/**
 * Get enabled features summary
 */
function getFeaturesSummary(config) {
  const features = [];

  // Tier 1 features
  if (config.ai?.enabled) {
    const aiFeatures = Object.entries(config.ai.features || {})
      .filter(([_, cfg]) => cfg.enabled)
      .map(([name]) => name);

    if (aiFeatures.length > 0) {
      features.push(`AI: ${aiFeatures.join(', ')}`);
    }
  }

  // Tier 2 features
  if (config.planning?.rag?.enabled || config.planning?.rag_enabled) {
    const ragDb = config.planning?.rag?.vectorDatabase || 'qdrant';
    const ragCount = config.planning?.rag?.retrievalCount || 5;
    features.push(`RAG: ${ragDb} (retrieve ${ragCount})`);
  }

  // Tier 3 features
  if (config.generation?.imageGeneration?.enabled) {
    const provider = config.generation.imageGeneration.provider || 'openai-dalle3';
    const quality = config.generation.imageGeneration.quality || 'hd';
    features.push(`Image Gen: ${provider} (${quality})`);
  }

  if (config.validation?.accessibility?.enabled) {
    const standards = Object.entries(config.validation.accessibility.standards || {})
      .filter(([_, cfg]) => cfg.enabled)
      .map(([name]) => name)
      .join(', ');
    features.push(`Accessibility: ${standards}`);
  }

  return features;
}

/**
 * Format validation errors
 */
function formatErrors(errors) {
  return errors.map(error => {
    const path = error.instancePath || 'root';
    const message = error.message || 'Unknown error';

    let details = '';
    if (error.params) {
      if (error.params.allowedValues) {
        details = ` (allowed: ${error.params.allowedValues.join(', ')})`;
      } else if (error.params.limit !== undefined) {
        details = ` (limit: ${error.params.limit})`;
      }
    }

    return `  ${colors.red}✗${colors.reset} ${path}: ${message}${details}`;
  }).join('\n');
}

/**
 * Validate specific config features
 */
function validateFeatures(config) {
  const warnings = [];

  // Check for deprecated fields
  if (config.planning?.rag_enabled !== undefined) {
    warnings.push(`Deprecated: planning.rag_enabled → Use planning.rag.enabled instead`);
  }

  if (config.validation?.accessibility?.target_standard !== undefined) {
    warnings.push(`Deprecated: validation.accessibility.target_standard → Use validation.accessibility.standards instead`);
  }

  if (config.generation?.imageGeneration?.cache_dir !== undefined) {
    warnings.push(`Deprecated: generation.imageGeneration.cache_dir → Use cachePath instead`);
  }

  // Check RAG config completeness
  if (config.planning?.rag?.enabled) {
    const rag = config.planning.rag;

    if (!rag.vectorDatabase) {
      warnings.push(`RAG enabled but vectorDatabase not specified (will default to "qdrant")`);
    }

    if (!rag.embeddingModel) {
      warnings.push(`RAG enabled but embeddingModel not specified (will default to "openai/text-embedding-3-large")`);
    }

    if (rag.retrievalCount && (rag.retrievalCount < 1 || rag.retrievalCount > 20)) {
      warnings.push(`RAG retrievalCount should be 1-20 (got ${rag.retrievalCount})`);
    }

    if (rag.similarityThreshold && (rag.similarityThreshold < 0 || rag.similarityThreshold > 1)) {
      warnings.push(`RAG similarityThreshold should be 0.0-1.0 (got ${rag.similarityThreshold})`);
    }
  }

  // Check image generation config
  if (config.generation?.imageGeneration?.enabled) {
    const img = config.generation.imageGeneration;

    if (!img.provider) {
      warnings.push(`Image generation enabled but provider not specified (will default to "openai-dalle3")`);
    }

    if (img.cacheMaxAgeDays && (img.cacheMaxAgeDays < 1 || img.cacheMaxAgeDays > 365)) {
      warnings.push(`Image cacheMaxAgeDays should be 1-365 (got ${img.cacheMaxAgeDays})`);
    }

    if (!img.requirements && !img.prompts) {
      warnings.push(`Image generation enabled but no requirements or prompts specified`);
    }
  }

  // Check accessibility config
  if (config.validation?.accessibility?.enabled) {
    const a11y = config.validation.accessibility;

    const enabledStandards = Object.entries(a11y.standards || {})
      .filter(([_, cfg]) => cfg.enabled)
      .length;

    if (enabledStandards === 0) {
      warnings.push(`Accessibility enabled but no standards enabled (wcag22AA, pdfUA, section508)`);
    }

    if (a11y.autoRemediation?.altText?.enabled && !a11y.autoRemediation.altText.aiProvider) {
      warnings.push(`Alt text generation enabled but aiProvider not specified (will default to "aws-bedrock")`);
    }
  }

  // Check AI feature weights sum
  if (config.ai?.enabled && config.ai.features) {
    const weights = Object.values(config.ai.features)
      .filter(f => f.enabled)
      .map(f => f.weight || 0);

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    if (Math.abs(totalWeight - 1.0) > 0.01) {
      warnings.push(`AI feature weights sum to ${totalWeight.toFixed(2)} (should sum to ~1.0)`);
    }
  }

  return warnings;
}

/**
 * Main validation function
 */
function runValidation(configPath) {
  console.log(`\n${colors.cyan}${colors.bright}=== Job Config Validation ===${colors.reset}\n`);
  console.log(`Config: ${colors.gray}${configPath}${colors.reset}\n`);

  // Load schema and config
  const schema = loadSchema();
  const config = loadJobConfig(configPath);

  // Detect tier
  const tier = detectTierLevel(config);
  console.log(`${colors.bright}Tier Level:${colors.reset} ${tier}`);

  // Show features
  const features = getFeaturesSummary(config);
  if (features.length > 0) {
    console.log(`${colors.bright}Enabled Features:${colors.reset}`);
    features.forEach(f => console.log(`  ${colors.green}✓${colors.reset} ${f}`));
  } else {
    console.log(`${colors.gray}No AI features enabled${colors.reset}`);
  }

  console.log();

  // Validate against schema
  console.log(`${colors.bright}Schema Validation:${colors.reset}`);
  const validation = validateConfig(config, schema);

  if (validation.valid) {
    console.log(`  ${colors.green}✓ PASSED${colors.reset} - Config is valid\n`);
  } else {
    console.log(`  ${colors.red}✗ FAILED${colors.reset} - Config has errors:\n`);
    console.log(formatErrors(validation.errors));
    console.log();
  }

  // Feature-specific validation
  console.log(`${colors.bright}Feature Validation:${colors.reset}`);
  const warnings = validateFeatures(config);

  if (warnings.length === 0) {
    console.log(`  ${colors.green}✓ No warnings${colors.reset}\n`);
  } else {
    console.log(`  ${colors.yellow}⚠ ${warnings.length} warning(s):${colors.reset}`);
    warnings.forEach(w => console.log(`  ${colors.yellow}⚠${colors.reset} ${w}`));
    console.log();
  }

  // Summary
  console.log(`${colors.cyan}${colors.bright}=== Summary ===${colors.reset}\n`);

  if (validation.valid && warnings.length === 0) {
    console.log(`${colors.green}${colors.bright}✓ ALL CHECKS PASSED${colors.reset}`);
    console.log(`Config is ready to use with ${tier} features.\n`);
    return 0;
  } else if (validation.valid && warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bright}⚠ PASSED WITH WARNINGS${colors.reset}`);
    console.log(`Config is valid but has ${warnings.length} warning(s).\n`);
    return 0;
  } else {
    console.log(`${colors.red}${colors.bright}✗ VALIDATION FAILED${colors.reset}`);
    console.log(`Config has ${validation.errors.length} error(s). Fix them before use.\n`);
    return 1;
  }
}

/**
 * Validate all example configs
 */
function validateAllExamples() {
  console.log(`\n${colors.cyan}${colors.bright}=== Validating All Example Configs ===${colors.reset}\n`);

  const exampleDir = path.join(__dirname, '../../example-jobs');
  const exampleFiles = fs.readdirSync(exampleDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(exampleDir, f));

  console.log(`Found ${exampleFiles.length} config files\n`);

  let passed = 0;
  let failed = 0;
  let warnings = 0;

  exampleFiles.forEach(configPath => {
    const fileName = path.basename(configPath);
    process.stdout.write(`${fileName.padEnd(50)} `);

    try {
      const schema = loadSchema();
      const config = loadJobConfig(configPath);
      const validation = validateConfig(config, schema);
      const featureWarnings = validateFeatures(config);

      if (validation.valid && featureWarnings.length === 0) {
        console.log(`${colors.green}✓ PASS${colors.reset}`);
        passed++;
      } else if (validation.valid && featureWarnings.length > 0) {
        console.log(`${colors.yellow}⚠ WARN (${featureWarnings.length})${colors.reset}`);
        warnings++;
      } else {
        console.log(`${colors.red}✗ FAIL (${validation.errors.length})${colors.reset}`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ ERROR: ${error.message}${colors.reset}`);
      failed++;
    }
  });

  console.log(`\n${colors.cyan}${colors.bright}=== Results ===${colors.reset}\n`);
  console.log(`${colors.green}Passed:${colors.reset}  ${passed}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${warnings}`);
  console.log(`${colors.red}Failed:${colors.reset}  ${failed}`);
  console.log(`Total:   ${exampleFiles.length}\n`);

  return failed === 0 ? 0 : 1;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Job Config Validation Tool${colors.reset}

Usage:
  node config-validation-test.js <config-file>    Validate single config
  node config-validation-test.js --all            Validate all example configs
  node config-validation-test.js --help           Show this help

Examples:
  node config-validation-test.js example-jobs/tfu-aws-partnership-v2.json
  node config-validation-test.js example-jobs/tfu-aws-world-class-tier3.json
  node config-validation-test.js --all
`);
    process.exit(0);
  }

  if (args.includes('--all')) {
    const exitCode = validateAllExamples();
    process.exit(exitCode);
  } else {
    const configPath = path.resolve(args[0]);
    const exitCode = runValidation(configPath);
    process.exit(exitCode);
  }
}

module.exports = {
  validateConfig,
  detectTierLevel,
  getFeaturesSummary,
  validateFeatures
};
