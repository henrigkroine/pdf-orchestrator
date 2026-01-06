# AI Core Module

**AI Configuration and Runner for PDF Orchestrator**

This module provides the core AI configuration loader and validation runner for Tiers 1-3.

---

## Overview

The AI Core module consists of two main components:

1. **aiConfig.js** - Configuration loader with support for Tier 1-3 features
2. **aiRunner.js** - AI validation pipeline executor

---

## Quick Start

```javascript
const AIConfig = require('./ai/core/aiConfig');

// Load configuration
const config = new AIConfig('example-jobs/tfu-aws-partnership-v2.json');
await config.load();

// Check tier level
console.log(config.getTierLevel()); // "tier2", "tier3", etc.

// Get specific configs
const ragConfig = config.getRagConfig();
const imageConfig = config.getImageGenerationConfig();
const a11yConfig = config.getAccessibilityConfig();

// Print summary
console.log(config.getSummary());
// Output: "AI: Enabled | Tier: TIER2 | Advanced Mode: Yes | Features: typography (weight: 0.4), whitespace (weight: 0.3), color (weight: 0.3) | Threshold: 0.85 | Dry Run: No | Tier 2: RAG"
```

---

## AIConfig Class

### Constructor

```javascript
const config = new AIConfig(jobConfigPath);
```

**Parameters**:
- `jobConfigPath`: Path to job configuration JSON file

### Methods

#### Core Methods

##### `load()`
Load and validate configuration from job config file.

```javascript
const success = await config.load();
if (!success) {
  console.error('Failed to load configuration');
}
```

**Returns**: `Promise<boolean>` - True if loaded successfully

##### `isEnabled()`
Check if AI subsystem is enabled.

```javascript
if (config.isEnabled()) {
  console.log('AI validation enabled');
}
```

**Returns**: `boolean`

##### `isDryRun()`
Check if dry run mode is active (scoring only, no failures).

```javascript
if (config.isDryRun()) {
  console.log('Dry run mode: scores will not fail pipeline');
}
```

**Returns**: `boolean`

##### `isAdvancedMode()`
Check if Tier 1.5 advanced mode is enabled (real PDF extraction + layout validation).

```javascript
if (config.isAdvancedMode()) {
  console.log('Advanced mode: using real PDF extraction');
}
```

**Returns**: `boolean`

#### Tier Detection

##### `getTierLevel()`
Get current tier level based on enabled features.

```javascript
const tier = config.getTierLevel();
// Returns: "tier0", "tier1", "tier1.5", "tier2", or "tier3"
```

**Returns**: `string`

**Tier Logic**:
- `"tier0"` = AI disabled
- `"tier1"` = AI enabled, basic features only
- `"tier1.5"` = Advanced mode enabled
- `"tier2"` = RAG enabled
- `"tier3"` = Image generation OR accessibility enabled

#### Tier 1 Methods

##### `isFeatureEnabled(featureName)`
Check if a specific Tier 1 feature is enabled.

```javascript
if (config.isFeatureEnabled('typography')) {
  console.log('Typography validation enabled');
}
```

**Parameters**:
- `featureName`: `"typography"`, `"whitespace"`, `"color"`, or `"layout"`

**Returns**: `boolean`

##### `getFeatureConfig(featureName)`
Get feature configuration object.

```javascript
const typographyConfig = config.getFeatureConfig('typography');
console.log(typographyConfig);
// { enabled: true, weight: 0.4, minScore: 0.85 }
```

**Returns**: `Object` or `null`

##### `getMinNormalizedScore()`
Get minimum normalized AI score threshold.

```javascript
const threshold = config.getMinNormalizedScore();
// Returns: 0.85 (default)
```

**Returns**: `number` (0.0 - 1.0)

##### `shouldFailOnCriticalIssues()`
Check if pipeline should fail on critical AI issues.

```javascript
if (config.shouldFailOnCriticalIssues()) {
  console.log('Critical issues will fail the pipeline');
}
```

**Returns**: `boolean`

#### Tier 2 Methods

##### `isRagEnabled()`
Check if RAG (Retrieval-Augmented Generation) is enabled.

```javascript
if (config.isRagEnabled()) {
  console.log('RAG personalization enabled');
}
```

**Returns**: `boolean`

##### `getRagConfig()`
Get complete RAG configuration.

```javascript
const ragConfig = config.getRagConfig();
console.log(ragConfig);
/*
{
  enabled: true,
  vectorDatabase: "qdrant",
  embeddingModel: "openai/text-embedding-3-large",
  retrievalCount: 5,
  similarityThreshold: 0.75,
  indexPath: "ai/rag/indexes/",
  fallbackBehavior: "warn",
  hybridSearch: { enabled: true, keywords: [...], ... }
}
*/
```

**Returns**: `Object`

**Properties**:
- `enabled`: RAG enabled
- `vectorDatabase`: Vector DB provider (`"qdrant"`, `"chromadb"`, `"pinecone"`, `"weaviate"`)
- `embeddingModel`: Embedding model identifier
- `retrievalCount`: Number of documents to retrieve (1-20)
- `similarityThreshold`: Minimum similarity score (0.0-1.0)
- `indexPath`: Vector index storage path
- `fallbackBehavior`: Behavior on failure (`"warn"`, `"error"`, `"disable"`)
- `hybridSearch`: Hybrid search settings

#### Tier 3 Methods

##### `isImageGenerationEnabled()`
Check if AI image generation is enabled.

```javascript
if (config.isImageGenerationEnabled()) {
  console.log('AI image generation enabled');
}
```

**Returns**: `boolean`

##### `getImageGenerationConfig()`
Get complete image generation configuration.

```javascript
const imgConfig = config.getImageGenerationConfig();
console.log(imgConfig);
/*
{
  enabled: true,
  provider: "openai-dalle3",
  quality: "hd",
  style: "natural",
  size: "1792x1024",
  cacheEnabled: true,
  cachePath: "assets/images/generated/",
  cacheMaxAgeDays: 30,
  requirements: {
    heroImage: { enabled: true, prompt: "..." },
    programPhotos: { enabled: true, count: 3, promptTemplate: "..." }
  },
  prompts: { ... }
}
*/
```

**Returns**: `Object`

**Properties**:
- `enabled`: Image generation enabled
- `provider`: Provider (`"openai-dalle3"`, `"stable-diffusion"`, `"replicate"`)
- `quality`: DALL-E 3 quality (`"standard"`, `"hd"`)
- `style`: DALL-E 3 style (`"natural"`, `"vivid"`)
- `size`: Image dimensions (`"1024x1024"`, `"1792x1024"`, `"1024x1792"`)
- `cacheEnabled`: Cache generated images
- `cachePath`: Cache directory path
- `cacheMaxAgeDays`: Cache expiration (1-365 days)
- `requirements`: Image requirements by type
- `prompts`: Manual prompts for specific slots

##### `isAccessibilityEnabled()`
Check if accessibility validation is enabled.

```javascript
if (config.isAccessibilityEnabled()) {
  console.log('Accessibility validation enabled');
}
```

**Returns**: `boolean`

##### `getAccessibilityConfig()`
Get complete accessibility configuration.

```javascript
const a11yConfig = config.getAccessibilityConfig();
console.log(a11yConfig);
/*
{
  enabled: true,
  standards: {
    wcag22AA: { enabled: true, failOnViolation: true },
    pdfUA: { enabled: true, failOnViolation: false },
    section508: { enabled: false, failOnViolation: false }
  },
  autoRemediation: {
    enabled: true,
    altText: {
      enabled: true,
      aiProvider: "aws-bedrock",
      model: "anthropic.claude-3-haiku-20240307-v1:0",
      maxLength: 125
    },
    structureTags: { enabled: true },
    readingOrder: { enabled: true },
    contrastAdjustment: { enabled: true, targetRatio: 4.5 }
  },
  reportPath: "reports/accessibility/"
}
*/
```

**Returns**: `Object`

**Properties**:
- `enabled`: Accessibility validation enabled
- `standards`: Accessibility standards configuration
  - `wcag22AA`: WCAG 2.2 Level AA
  - `pdfUA`: PDF/UA (Universal Accessibility)
  - `section508`: Section 508 (US Government)
- `autoRemediation`: Auto-remediation settings
  - `altText`: AI-generated alt text
  - `structureTags`: Auto-tag structure
  - `readingOrder`: Fix reading order
  - `contrastAdjustment`: Auto-adjust colors for contrast
- `reportPath`: Accessibility report output path

#### Utility Methods

##### `getReportDir()`
Get AI report output directory.

```javascript
const reportDir = config.getReportDir();
// Returns: "reports/ai"
```

**Returns**: `string`

##### `getPdfPath()`
Get generated PDF path.

```javascript
const pdfPath = config.getPdfPath();
// Returns: "exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf"
```

**Returns**: `string`

##### `getTypographySidecarPath()`
Get typography sidecar JSON path.

```javascript
const sidecarPath = config.getTypographySidecarPath();
// Returns: "exports/TEEI-AWS-Partnership-TFU-V2-typography.json"
```

**Returns**: `string`

##### `getJobId()`
Get sanitized job ID (from job config name).

```javascript
const jobId = config.getJobId();
// Returns: "tfu_aws_partnership_v2_world_class"
```

**Returns**: `string`

##### `getTFURequirements()`
Get TFU brand requirements object.

```javascript
const tfuReqs = config.getTFURequirements();
console.log(tfuReqs);
/*
{
  page_count: 4,
  primary_color: "#00393F",
  forbidden_colors: ["#BA8F5A"],
  required_fonts: ["Lora", "Roboto"],
  forbidden_fonts: ["Roboto Flex"],
  paragraph_style_prefix: "TFU_",
  ...
}
*/
```

**Returns**: `Object`

##### `isTFUValidationEnabled()`
Check if TFU brand validation is enabled.

```javascript
if (config.isTFUValidationEnabled()) {
  console.log('TFU brand compliance validation enabled');
}
```

**Returns**: `boolean`

##### `validatePaths()`
Validate that all required files and paths exist.

```javascript
const validation = config.validatePaths();
if (!validation.valid) {
  console.error('Missing files:', validation.missing);
}
```

**Returns**: `Object`
```javascript
{
  valid: boolean,
  missing: string[] // Array of missing file paths
}
```

**Note**: For Tier 2-3 paths (RAG indexes, image cache, accessibility reports), missing paths generate warnings (not errors) since they'll be created on first use.

##### `getSummary()`
Get human-readable summary of enabled features.

```javascript
const summary = config.getSummary();
console.log(summary);
// "AI: Enabled | Tier: TIER2 | Advanced Mode: Yes | Features: typography (weight: 0.4), whitespace (weight: 0.3), color (weight: 0.3) | Threshold: 0.85 | Dry Run: No | Tier 2: RAG"
```

**Returns**: `string`

---

## Configuration Examples

### Tier 1: Core AI Validation

```json
{
  "ai": {
    "enabled": true,
    "dryRun": false,
    "features": {
      "typography": { "enabled": true, "weight": 0.4, "minScore": 0.85 },
      "whitespace": { "enabled": true, "weight": 0.3, "minScore": 0.80 },
      "color": { "enabled": true, "weight": 0.3, "minScore": 0.90 }
    },
    "thresholds": {
      "minNormalizedScore": 0.85,
      "failOnCriticalIssues": true
    }
  }
}
```

**Usage**:
```javascript
const config = new AIConfig('config.json');
await config.load();

console.log(config.getTierLevel()); // "tier1"
console.log(config.isFeatureEnabled('typography')); // true
console.log(config.getMinNormalizedScore()); // 0.85
```

### Tier 1.5: Advanced Mode + Layout

```json
{
  "ai": {
    "enabled": true,
    "advancedMode": true,
    "features": {
      "typography": { "enabled": true },
      "whitespace": { "enabled": true },
      "color": { "enabled": true },
      "layout": { "enabled": true }
    }
  }
}
```

**Usage**:
```javascript
const config = new AIConfig('config.json');
await config.load();

console.log(config.getTierLevel()); // "tier1.5"
console.log(config.isAdvancedMode()); // true
console.log(config.isFeatureEnabled('layout')); // true
```

### Tier 2: RAG-Powered Personalization

```json
{
  "planning": {
    "rag": {
      "enabled": true,
      "vectorDatabase": "qdrant",
      "retrievalCount": 5,
      "similarityThreshold": 0.75,
      "hybridSearch": {
        "enabled": true,
        "keywords": ["AWS", "cloud"],
        "minPerformanceScore": 0.7
      }
    }
  }
}
```

**Usage**:
```javascript
const config = new AIConfig('config.json');
await config.load();

console.log(config.getTierLevel()); // "tier2"
console.log(config.isRagEnabled()); // true

const ragConfig = config.getRagConfig();
console.log(ragConfig.retrievalCount); // 5
console.log(ragConfig.vectorDatabase); // "qdrant"
```

### Tier 3: Image Generation + Accessibility

```json
{
  "generation": {
    "imageGeneration": {
      "enabled": true,
      "provider": "openai-dalle3",
      "quality": "hd",
      "requirements": {
        "heroImage": { "enabled": true, "prompt": "..." }
      }
    }
  },
  "validation": {
    "accessibility": {
      "enabled": true,
      "standards": {
        "wcag22AA": { "enabled": true, "failOnViolation": true }
      },
      "autoRemediation": {
        "altText": { "enabled": true, "aiProvider": "aws-bedrock" }
      }
    }
  }
}
```

**Usage**:
```javascript
const config = new AIConfig('config.json');
await config.load();

console.log(config.getTierLevel()); // "tier3"
console.log(config.isImageGenerationEnabled()); // true
console.log(config.isAccessibilityEnabled()); // true

const imgConfig = config.getImageGenerationConfig();
console.log(imgConfig.quality); // "hd"

const a11yConfig = config.getAccessibilityConfig();
console.log(a11yConfig.autoRemediation.altText.aiProvider); // "aws-bedrock"
```

---

## Backward Compatibility

The configuration loader supports legacy config formats:

**Legacy** → **New**:
- `planning.rag_enabled` → `planning.rag.enabled`
- `validation.accessibility.remediation_provider` → `validation.accessibility.autoRemediation.altText.aiProvider`
- `generation.imageGeneration.cache_dir` → `generation.imageGeneration.cachePath`

Example:
```javascript
// Both work:
"planning": { "rag_enabled": true }  // Legacy
"planning": { "rag": { "enabled": true } }  // New
```

---

## Error Handling

```javascript
const config = new AIConfig('job-config.json');

try {
  const loaded = await config.load();

  if (!loaded) {
    console.error('Configuration failed to load');
    process.exit(1);
  }

  // Validate paths
  const pathValidation = config.validatePaths();
  if (!pathValidation.valid) {
    console.error('Missing required files:', pathValidation.missing);
    process.exit(1);
  }

  // Use configuration
  console.log(config.getSummary());

} catch (error) {
  console.error('Configuration error:', error.message);
  process.exit(1);
}
```

---

## Integration with AI Runner

```javascript
const AIConfig = require('./ai/core/aiConfig');
const AIRunner = require('./ai/core/aiRunner');

async function runAIValidation() {
  // Load configuration
  const config = new AIConfig('example-jobs/tfu-aws-partnership-v2.json');
  await config.load();

  // Create runner
  const runner = new AIRunner(config);

  // Run validation
  const result = await runner.run();

  console.log(`AI Score: ${result.normalizedScore.toFixed(2)}`);
  console.log(`Passed: ${result.passed}`);
  console.log(`Critical Issues: ${result.criticalIssues.length}`);
}

runAIValidation();
```

---

## API Reference Summary

### Configuration Queries

| Method | Returns | Description |
|--------|---------|-------------|
| `isEnabled()` | `boolean` | AI subsystem enabled |
| `isDryRun()` | `boolean` | Dry run mode (no failures) |
| `isAdvancedMode()` | `boolean` | Tier 1.5 advanced mode |
| `getTierLevel()` | `string` | Current tier (`"tier0"` - `"tier3"`) |

### Tier 1 Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isFeatureEnabled(name)` | `boolean` | Feature enabled check |
| `getFeatureConfig(name)` | `Object` | Feature configuration |
| `getMinNormalizedScore()` | `number` | Minimum AI score threshold |
| `shouldFailOnCriticalIssues()` | `boolean` | Fail on critical issues |

### Tier 2 Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isRagEnabled()` | `boolean` | RAG enabled |
| `getRagConfig()` | `Object` | RAG configuration |

### Tier 3 Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `isImageGenerationEnabled()` | `boolean` | Image generation enabled |
| `getImageGenerationConfig()` | `Object` | Image gen configuration |
| `isAccessibilityEnabled()` | `boolean` | Accessibility enabled |
| `getAccessibilityConfig()` | `Object` | Accessibility configuration |

### Utility Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getReportDir()` | `string` | AI report directory |
| `getPdfPath()` | `string` | Generated PDF path |
| `getTypographySidecarPath()` | `string` | Typography sidecar path |
| `getJobId()` | `string` | Sanitized job ID |
| `getSummary()` | `string` | Human-readable summary |
| `validatePaths()` | `Object` | Path validation results |

---

## See Also

- [Job Config Reference](../../docs/JOB-CONFIG-REFERENCE.md) - Complete configuration documentation
- [AI Architecture Spec](../AI-ARCHITECTURE-SPEC.md) - AI subsystem architecture
- [Phase 6 Guide](../../docs/PHASE-6-GUIDE.md) - Tier 2-3 implementation guide

---

**Last Updated**: 2025-11-14
**Module Version**: 1.0.0
