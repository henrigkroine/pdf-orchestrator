# Job Configuration Reference

**Complete reference for PDF Orchestrator job configuration files**

This document provides comprehensive documentation for all job configuration options, including Tier 1-3 AI features.

---

## Table of Contents

- [Overview](#overview)
- [Configuration Tiers](#configuration-tiers)
- [Core Configuration](#core-configuration)
- [Planning Configuration (Tier 2)](#planning-configuration-tier-2)
- [Generation Configuration (Tier 2-3)](#generation-configuration-tier-2-3)
- [Validation Configuration (Tier 2-3)](#validation-configuration-tier-2-3)
- [AI Subsystem Configuration (Tier 1-1.5)](#ai-subsystem-configuration-tier-1-15)
- [Complete Examples](#complete-examples)
- [Migration Guide](#migration-guide)

---

## Overview

Job configuration files define how PDF Orchestrator generates and validates documents. They support progressive enhancement through four tiers:

- **Tier 0**: No AI (basic PDF generation)
- **Tier 1**: Core AI validation (typography, whitespace, color)
- **Tier 1.5**: Advanced mode (real PDF extraction + layout validation)
- **Tier 2**: RAG-powered personalization
- **Tier 3**: Image generation + accessibility auto-remediation

---

## Configuration Tiers

### Tier 0: Basic PDF Generation
```json
{
  "name": "Basic Partnership Document",
  "template": "partnership",
  "data": { ... },
  "output": { ... }
}
```

**Use when**: Simple document generation, no AI features needed
**Cost**: Lowest (no AI API calls)
**Speed**: Fastest

### Tier 1: Core AI Validation
```json
{
  "ai": {
    "enabled": true,
    "features": {
      "typography": { "enabled": true },
      "whitespace": { "enabled": true },
      "color": { "enabled": true }
    }
  }
}
```

**Use when**: Need AI quality validation (typography, spacing, colors)
**Cost**: Low (~$0.01-0.05 per document)
**Speed**: Fast

### Tier 1.5: Advanced Mode
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

**Use when**: Need real PDF extraction + layout analysis
**Cost**: Medium (~$0.10-0.20 per document)
**Speed**: Moderate

### Tier 2: RAG-Powered Personalization
```json
{
  "planning": {
    "rag": {
      "enabled": true,
      "vectorDatabase": "qdrant",
      "retrievalCount": 5
    }
  }
}
```

**Use when**: Want content personalization based on past high-performing docs
**Cost**: Medium (~$0.05-0.15 per document for embeddings)
**Speed**: Moderate (depends on vector DB)

### Tier 3: Image Generation + Accessibility
```json
{
  "generation": {
    "imageGeneration": { "enabled": true }
  },
  "validation": {
    "accessibility": { "enabled": true }
  }
}
```

**Use when**: Need AI-generated images or accessibility auto-remediation
**Cost**: High (~$0.50-2.00 per document for DALL-E 3 + vision models)
**Speed**: Slow (image generation takes 10-30s per image)

---

## Core Configuration

### Basic Properties

#### `name` (required)
**Type**: `string`
**Description**: Human-readable job name

```json
"name": "TFU AWS Partnership V2 - World-Class"
```

#### `description`
**Type**: `string`
**Description**: Detailed job description

```json
"description": "Together for Ukraine AWS Partnership with enhanced narrative targeting 145-150/150"
```

#### `template` (required)
**Type**: `string`
**Enum**: `["partnership", "report", "campaign", "newsletter"]`
**Description**: Template type to use

```json
"template": "partnership"
```

#### `design_system`
**Type**: `string`
**Enum**: `["tfu", "teei", "custom"]`
**Description**: Design system (TFU = Together for Ukraine, TEEI = Educational Equality Institute)

```json
"design_system": "tfu"
```

#### `validate_tfu`
**Type**: `boolean`
**Default**: `false`
**Description**: Enable TFU brand compliance validation

```json
"validate_tfu": true
```

### Data Section

#### `data` (required)
**Type**: `object`
**Description**: Content data for document population

```json
"data": {
  "title": "Building Europe's Cloud-Native Workforce",
  "subtitle": "Together for Ukraine · AWS Strategic Partnership",
  "organization": "The Educational Equality Institute",
  "partner": "Amazon Web Services"
}
```

### Output Section

#### `output` (required)
**Type**: `object`
**Description**: Output configuration

```json
"output": {
  "formats": ["indd", "pdf_digital", "pdf_print"],
  "intent": "both",
  "filename_base": "TEEI-AWS-Partnership",
  "export_path": "./exports",
  "pdf_settings": {
    "digital": {
      "preset": "[High Quality Print]",
      "color_space": "RGB",
      "resolution": 150,
      "optimize_web": true
    }
  }
}
```

**Properties**:
- `formats`: Array of output formats (`["indd", "pdf_digital", "pdf_print", "html"]`)
- `intent`: Output intent (`"print"`, `"screen"`, `"both"`)
  - `"print"` = 300 DPI, CMYK
  - `"screen"` = 150 DPI, RGB
  - `"both"` = generates both
- `filename_base`: Base filename (without extension)
- `export_path`: Export directory path
- `pdf_settings`: PDF-specific export settings

### Quality Section

#### `quality`
**Type**: `object`
**Description**: Quality thresholds and validation settings

```json
"quality": {
  "validation_threshold": 145,
  "auto_fix": true,
  "strict_mode": true,
  "required_checks": [
    "tfu_compliance",
    "typography_design",
    "pdf_structure",
    "content",
    "visual_hierarchy",
    "accessibility"
  ]
}
```

**Properties**:
- `validation_threshold`: Minimum validation score (0-150)
- `auto_fix`: Enable auto-fix for common issues
- `strict_mode`: Fail on warnings (not just errors)
- `required_checks`: Array of required validation checks

---

## Planning Configuration (Tier 2)

### RAG (Retrieval-Augmented Generation)

#### `planning.rag`
**Type**: `object`
**Description**: RAG configuration for content personalization

```json
"planning": {
  "rag": {
    "enabled": true,
    "vectorDatabase": "qdrant",
    "embeddingModel": "openai/text-embedding-3-large",
    "retrievalCount": 5,
    "similarityThreshold": 0.75,
    "indexPath": "ai/rag/indexes/",
    "fallbackBehavior": "warn",
    "hybridSearch": {
      "enabled": true,
      "keywords": ["AWS", "cloud", "partnership"],
      "minPerformanceScore": 0.7,
      "boostRecent": true
    }
  }
}
```

**Properties**:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable RAG |
| `vectorDatabase` | string | `"qdrant"` | Vector DB provider (`qdrant`, `chromadb`, `pinecone`, `weaviate`) |
| `embeddingModel` | string | `"openai/text-embedding-3-large"` | Embedding model |
| `retrievalCount` | number | `5` | Top N documents to retrieve (1-20) |
| `similarityThreshold` | number | `0.75` | Minimum similarity score (0.0-1.0) |
| `indexPath` | string | `"ai/rag/indexes/"` | Vector index storage path |
| `fallbackBehavior` | string | `"warn"` | Behavior on RAG failure (`warn`, `error`, `disable`) |

**Hybrid Search Properties**:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable hybrid search (semantic + keyword + performance) |
| `keywords` | array | `[]` | Keywords for keyword-based boost |
| `minPerformanceScore` | number | `0.0` | Minimum past performance score (0.0-1.0) |
| `boostRecent` | boolean | `true` | Boost more recent documents |

**Example Use Cases**:
- Retrieve best-performing intro paragraphs from past AWS partnerships
- Find similar partnership value propositions that scored 0.9+
- Personalize content based on partner industry (cloud, healthcare, education)

---

## Generation Configuration (Tier 2-3)

### Image Generation (Tier 3)

#### `generation.imageGeneration`
**Type**: `object`
**Description**: AI image generation configuration

```json
"generation": {
  "imageGeneration": {
    "enabled": true,
    "provider": "openai-dalle3",
    "quality": "hd",
    "style": "natural",
    "size": "1792x1024",
    "cacheEnabled": true,
    "cachePath": "assets/images/generated/",
    "cacheMaxAgeDays": 30,
    "requirements": {
      "heroImage": {
        "enabled": true,
        "prompt": "Ukrainian students using educational technology...",
        "negativePrompt": "staged, corporate stock photo..."
      },
      "programPhotos": {
        "enabled": true,
        "count": 3,
        "promptTemplate": "Educational program: {program_name}..."
      }
    }
  }
}
```

**Properties**:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable AI image generation |
| `provider` | string | `"openai-dalle3"` | Provider (`openai-dalle3`, `stable-diffusion`, `replicate`) |
| `quality` | string | `"hd"` | DALL-E 3 quality (`standard`, `hd`) |
| `style` | string | `"natural"` | DALL-E 3 style (`natural`, `vivid`) |
| `size` | string | `"1792x1024"` | Image dimensions (`1024x1024`, `1792x1024`, `1024x1792`) |
| `cacheEnabled` | boolean | `true` | Cache generated images |
| `cachePath` | string | `"assets/images/generated/"` | Cache directory |
| `cacheMaxAgeDays` | number | `30` | Cache expiration (1-365 days) |

**Requirements Object**:

```json
"requirements": {
  "heroImage": {
    "enabled": true,
    "prompt": "Main hero image prompt",
    "negativePrompt": "What to avoid"
  },
  "programPhotos": {
    "enabled": true,
    "count": 3,
    "promptTemplate": "Template with {program_name} placeholder"
  }
}
```

**Prompt Best Practices**:
- Be specific about style: "documentary photography", "photorealistic", "warm natural lighting"
- Describe mood: "hopeful atmosphere", "authentic moment", "genuine engagement"
- Avoid generic terms: Don't say "professional photo", say "documentary style educational moment"
- Use negative prompts: "NOT staged, NOT corporate stock, NOT artificial lighting"
- For TFU brand: "warm natural lighting, authentic educational moment, diverse students, bright inspiring space"

**Cost Estimation** (DALL-E 3):
- Standard quality: $0.04 per image
- HD quality: $0.08 per image
- Example: 5 HD images = $0.40

### Font Pairing

#### `generation.fontPairing`
**Type**: `object`
**Description**: Font pairing settings

```json
"generation": {
  "fontPairing": {
    "enabled": true,
    "strategy": "constrained",
    "allow_alternatives": false,
    "tfu_brand_lock": true
  }
}
```

**Properties**:
- `enabled`: Enable font pairing logic
- `strategy`: Pairing strategy (`constrained`, `flexible`, `ai_suggested`)
- `allow_alternatives`: Allow alternative fonts
- `tfu_brand_lock`: Lock to TFU brand fonts (Lora + Roboto)

---

## Validation Configuration (Tier 2-3)

### Accessibility (Tier 3)

#### `validation.accessibility`
**Type**: `object`
**Description**: Accessibility validation and auto-remediation

```json
"validation": {
  "accessibility": {
    "enabled": true,
    "standards": {
      "wcag22AA": {
        "enabled": true,
        "failOnViolation": true
      },
      "pdfUA": {
        "enabled": true,
        "failOnViolation": false
      },
      "section508": {
        "enabled": false
      }
    },
    "autoRemediation": {
      "enabled": true,
      "altText": {
        "enabled": true,
        "aiProvider": "aws-bedrock",
        "model": "anthropic.claude-3-haiku-20240307-v1:0",
        "maxLength": 125
      },
      "structureTags": { "enabled": true },
      "readingOrder": { "enabled": true },
      "contrastAdjustment": {
        "enabled": true,
        "targetRatio": 4.5
      }
    },
    "reportPath": "reports/accessibility/"
  }
}
```

**Standards**:

| Standard | Description | Fail On Violation Default |
|----------|-------------|---------------------------|
| `wcag22AA` | WCAG 2.2 Level AA | `true` |
| `pdfUA` | PDF/UA (Universal Accessibility) | `false` |
| `section508` | Section 508 (US Government) | `false` |

**Auto-Remediation Features**:

| Feature | Description | Default |
|---------|-------------|---------|
| `altText` | AI-generated alt text for images | `enabled: true` |
| `structureTags` | Auto-tag structure (headings, paragraphs, lists) | `enabled: true` |
| `readingOrder` | Fix reading order based on layout | `enabled: true` |
| `contrastAdjustment` | Auto-adjust colors to meet contrast ratios | `enabled: true` |

**Alt Text AI Providers**:
- `aws-bedrock`: Claude 3 Haiku via AWS Bedrock (fast, low-cost)
- `openai-gpt4v`: GPT-4 Vision (high-quality, higher cost)
- `google-gemini`: Gemini Pro Vision

**Cost Estimation** (AWS Bedrock Claude 3 Haiku):
- ~$0.003 per image for alt text generation
- Example: 10 images = $0.03

**Contrast Adjustment**:
- `targetRatio: 4.5` = WCAG 2.2 AA (normal text)
- `targetRatio: 7.0` = WCAG 2.2 AAA (enhanced)

---

## AI Subsystem Configuration (Tier 1-1.5)

### AI Config

#### `ai`
**Type**: `object`
**Description**: AI subsystem configuration (Tier 1-1.5)

```json
"ai": {
  "enabled": true,
  "dryRun": false,
  "advancedMode": true,
  "features": {
    "typography": {
      "enabled": true,
      "weight": 0.4,
      "minScore": 0.90
    },
    "whitespace": {
      "enabled": true,
      "weight": 0.3,
      "minScore": 0.85
    },
    "color": {
      "enabled": true,
      "weight": 0.3,
      "minScore": 0.92
    },
    "layout": {
      "enabled": true,
      "weight": 0.25,
      "minScore": 0.88
    }
  },
  "thresholds": {
    "minNormalizedScore": 0.90,
    "failOnCriticalIssues": true
  },
  "output": {
    "reportDir": "reports/ai",
    "includeInLayer1Score": true,
    "layer1Points": 15
  }
}
```

**Properties**:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `false` | Enable AI subsystem |
| `dryRun` | boolean | `true` | Dry run mode (scoring only, no failures) |
| `advancedMode` | boolean | `false` | Tier 1.5: Real PDF extraction + layout validation |

**Features**:

Each feature has:
- `enabled`: Enable this feature
- `weight`: Feature weight in overall score (0.0-1.0)
- `minScore`: Minimum score threshold (0.0-1.0)

**Available Features**:
- `typography`: Font usage, hierarchy, consistency
- `whitespace`: Spacing, margins, padding, density
- `color`: Brand color compliance, contrast, usage
- `layout`: Grid alignment, visual hierarchy (Tier 1.5 only)

**Thresholds**:
- `minNormalizedScore`: Minimum overall AI score (0.0-1.0)
- `failOnCriticalIssues`: Fail pipeline if critical issues detected

**Output**:
- `reportDir`: AI report output directory
- `includeInLayer1Score`: Include AI score in Layer 1 (0-150) total
- `layer1Points`: Points allocated to AI in Layer 1 score (0-50)

---

## Complete Examples

### Example 1: Minimal Tier 1 (Core AI Only)

```json
{
  "name": "Minimal Tier 1 Configuration",
  "template": "partnership",
  "design_system": "tfu",

  "data": { ... },
  "output": { ... },

  "ai": {
    "enabled": true,
    "dryRun": false,
    "advancedMode": false,
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

**Use when**: Need basic AI validation, fastest pipeline
**Cost**: ~$0.01-0.05 per document
**Features**: Typography, whitespace, color (heuristic-based)

### Example 2: Tier 2 with RAG

```json
{
  "name": "Tier 2 with RAG Configuration",
  "template": "partnership",
  "design_system": "tfu",

  "data": { ... },
  "output": { ... },

  "planning": {
    "rag": {
      "enabled": true,
      "vectorDatabase": "qdrant",
      "embeddingModel": "openai/text-embedding-3-large",
      "retrievalCount": 5,
      "similarityThreshold": 0.75,
      "hybridSearch": {
        "enabled": true,
        "keywords": ["AWS", "cloud"],
        "minPerformanceScore": 0.7,
        "boostRecent": true
      }
    }
  },

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

**Use when**: Want content personalization from past docs
**Cost**: ~$0.15-0.25 per document
**Features**: Tier 1.5 (all AI features) + RAG retrieval

### Example 3: Tier 3 World-Class (All Features)

```json
{
  "name": "Tier 3 World-Class - All Features Enabled",
  "template": "partnership",
  "design_system": "tfu",

  "data": { ... },
  "output": { ... },

  "planning": {
    "rag": {
      "enabled": true,
      "vectorDatabase": "qdrant",
      "retrievalCount": 8,
      "similarityThreshold": 0.70
    }
  },

  "generation": {
    "imageGeneration": {
      "enabled": true,
      "provider": "openai-dalle3",
      "quality": "hd",
      "style": "natural",
      "requirements": {
        "heroImage": {
          "enabled": true,
          "prompt": "Ukrainian students learning cloud computing..."
        },
        "programPhotos": {
          "enabled": true,
          "count": 4
        }
      }
    }
  },

  "validation": {
    "accessibility": {
      "enabled": true,
      "standards": {
        "wcag22AA": { "enabled": true, "failOnViolation": true },
        "pdfUA": { "enabled": true }
      },
      "autoRemediation": {
        "enabled": true,
        "altText": {
          "enabled": true,
          "aiProvider": "aws-bedrock"
        },
        "structureTags": { "enabled": true },
        "readingOrder": { "enabled": true },
        "contrastAdjustment": { "enabled": true, "targetRatio": 4.5 }
      }
    }
  },

  "ai": {
    "enabled": true,
    "advancedMode": true,
    "features": {
      "typography": { "enabled": true, "weight": 0.4, "minScore": 0.90 },
      "whitespace": { "enabled": true, "weight": 0.3, "minScore": 0.85 },
      "color": { "enabled": true, "weight": 0.3, "minScore": 0.92 },
      "layout": { "enabled": true, "weight": 0.25, "minScore": 0.88 }
    },
    "thresholds": {
      "minNormalizedScore": 0.90,
      "failOnCriticalIssues": true
    }
  }
}
```

**Use when**: Need maximum quality, all AI features
**Cost**: ~$0.50-2.00 per document (includes image gen)
**Features**: All Tier 1-3 features enabled

---

## Migration Guide

### Migrating from Legacy Config

**Old structure** (deprecated):
```json
"planning": {
  "rag_enabled": true
}
```

**New structure**:
```json
"planning": {
  "rag": {
    "enabled": true,
    "vectorDatabase": "qdrant",
    "retrievalCount": 5
  }
}
```

**Old structure** (deprecated):
```json
"validation": {
  "accessibility": {
    "target_standard": "WCAG_2.2_AA",
    "remediation_provider": "aws_bedrock"
  }
}
```

**New structure**:
```json
"validation": {
  "accessibility": {
    "enabled": true,
    "standards": {
      "wcag22AA": { "enabled": true }
    },
    "autoRemediation": {
      "altText": {
        "aiProvider": "aws-bedrock"
      }
    }
  }
}
```

### Backward Compatibility

The `aiConfig.js` loader supports both old and new structures:

- `planning.rag_enabled` → `planning.rag.enabled`
- `validation.accessibility.remediation_provider` → `validation.accessibility.autoRemediation.altText.aiProvider`
- `generation.imageGeneration.cache_dir` → `generation.imageGeneration.cachePath`

---

## Cost Calculator

| Configuration | Tier | Estimated Cost Per Document |
|---------------|------|----------------------------|
| Tier 0 (No AI) | 0 | $0.00 |
| Tier 1 (Core AI) | 1 | $0.01 - $0.05 |
| Tier 1.5 (Advanced Mode) | 1.5 | $0.10 - $0.20 |
| Tier 2 (RAG) | 2 | $0.15 - $0.25 |
| Tier 3 (Image Gen + A11y) | 3 | $0.50 - $2.00 |

**Note**: Costs vary based on:
- Document complexity (page count, element count)
- Number of images generated
- Embedding model used for RAG
- Alt text generation model

---

## Validation

Job configs are validated against `schemas/job-config-schema.json` using JSON Schema Draft 7.

**Validation checks**:
- Required fields present
- Valid enum values
- Number ranges (e.g., `retrievalCount` 1-20)
- Path existence (warns if paths don't exist but will be created)

**Run validation**:
```bash
node ai/tests/config-validation-test.js example-jobs/tfu-aws-partnership-v2.json
```

---

## See Also

- [AI Architecture Spec](../ai/AI-ARCHITECTURE-SPEC.md) - AI subsystem architecture
- [Phase 6 Guide](PHASE-6-GUIDE.md) - Tier 2-3 implementation guide
- [Accessibility Guide](ACCESSIBILITY-GUIDE.md) - Accessibility validation details
- [Example Jobs](../example-jobs/) - Complete example configurations

---

**Last Updated**: 2025-11-14
**Schema Version**: 1.0.0
