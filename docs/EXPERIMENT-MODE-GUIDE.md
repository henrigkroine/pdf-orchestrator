# Experiment Mode Guide

**A/B testing for PDF documents**

Experiment Mode enables you to generate and compare multiple PDF variants automatically, selecting the best version based on configurable criteria (QA score, file size, generation time, visual similarity, etc.).

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Variant Configuration](#variant-configuration)
4. [Selection Criteria](#selection-criteria)
5. [Comparison Metrics](#comparison-metrics)
6. [Winner Selection](#winner-selection)
7. [Use Cases](#use-cases)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)

---

## Overview

### What Is Experiment Mode?

Experiment Mode generates **multiple PDF variants** from a single job config, each with different design parameters (layout, colors, typography, etc.), then **automatically selects the best variant** based on your criteria.

### Benefits

✅ **A/B testing** - Compare design options objectively
✅ **Automatic winner selection** - No manual comparison needed
✅ **Data-driven decisions** - Choose based on QA score, not opinion
✅ **Rapid iteration** - Test multiple designs in one run
✅ **Version control** - Keep all variants for future reference

---

## Quick Start

### Basic Experiment

Test two layout variants:

```json
{
  "jobId": "aws-partnership-experiment",
  "jobType": "partnership",

  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "variant-a-traditional",
        "name": "Traditional Layout",
        "design": {
          "layout": "classic",
          "colorScheme": "nordshore"
        }
      },
      {
        "id": "variant-b-modern",
        "name": "Modern Layout",
        "design": {
          "layout": "asymmetric",
          "colorScheme": "sky"
        }
      }
    ],
    "selectionCriteria": {
      "metric": "qa_score",
      "mode": "highest"
    }
  }
}
```

### Execution Flow

1. **Generate variant A** (traditional layout)
2. **Generate variant B** (modern layout)
3. **Compare variants** (QA scores, file sizes, etc.)
4. **Select winner** (highest QA score)
5. **Output winner** to final destination
6. **Archive all variants** for reference

---

## Variant Configuration

### Variant Structure

Each variant defines:

```json
{
  "id": "variant-a",                // Unique identifier
  "name": "Traditional Layout",     // Human-readable name
  "description": "Classic layout with Nordshore colors",

  // Design overrides
  "design": {
    "layout": "classic",
    "colorScheme": "nordshore",
    "typography": "traditional"
  },

  // Data overrides
  "data": {
    "title": "Alternative Title"
  },

  // Output overrides
  "output": {
    "quality": "high"
  },

  // QA overrides
  "qaProfile": {
    "min_score": 90
  }
}
```

### Design Parameters

#### Layout Variants

```json
{
  "variants": [
    {
      "id": "classic-layout",
      "design": {
        "layout": "classic",
        "grid": { "columns": 12, "gutter": 20 },
        "margins": { "top": 40, "right": 40, "bottom": 40, "left": 40 }
      }
    },
    {
      "id": "modern-layout",
      "design": {
        "layout": "asymmetric",
        "grid": { "columns": 16, "gutter": 16 },
        "margins": { "top": 60, "right": 60, "bottom": 60, "left": 60 }
      }
    }
  ]
}
```

#### Color Variants

```json
{
  "variants": [
    {
      "id": "nordshore-colors",
      "design": {
        "colorScheme": "nordshore",
        "primaryColor": "#00393F",
        "accentColor": "#BA8F5A"
      }
    },
    {
      "id": "sky-colors",
      "design": {
        "colorScheme": "sky",
        "primaryColor": "#C9E4EC",
        "accentColor": "#65873B"
      }
    }
  ]
}
```

#### Typography Variants

```json
{
  "variants": [
    {
      "id": "traditional-type",
      "design": {
        "typography": "traditional",
        "headlineFont": "Lora",
        "headlineSize": 42,
        "bodyFont": "Roboto Flex",
        "bodySize": 11
      }
    },
    {
      "id": "modern-type",
      "design": {
        "typography": "modern",
        "headlineFont": "Lora",
        "headlineSize": 48,
        "bodyFont": "Roboto Flex",
        "bodySize": 12
      }
    }
  ]
}
```

---

## Selection Criteria

### Available Metrics

| Metric | Description | Best For |
|--------|-------------|----------|
| `qa_score` | Overall QA validation score | General quality |
| `brand_score` | Brand compliance score | Brand consistency |
| `accessibility_score` | WCAG compliance score | Accessible documents |
| `file_size` | PDF file size | Email/web distribution |
| `generation_time` | Time to generate PDF | Fast turnaround |
| `visual_diff` | Difference from baseline | Consistency |
| `page_count` | Number of pages | Document length |
| `custom` | User-defined metric | Special requirements |

### Selection Modes

| Mode | Description | Example |
|------|-------------|---------|
| `highest` | Select variant with highest metric value | Highest QA score |
| `lowest` | Select variant with lowest metric value | Smallest file size |
| `closest_to` | Select variant closest to target value | Closest to 5 pages |
| `threshold` | Select first variant meeting threshold | QA score >= 95 |
| `manual` | Prompt user to select winner | User review |

### Simple Selection

Select by single metric:

```json
{
  "selectionCriteria": {
    "metric": "qa_score",
    "mode": "highest"
  }
}
```

### Multi-Metric Selection

Weight multiple metrics:

```json
{
  "selectionCriteria": {
    "metrics": [
      { "name": "qa_score", "weight": 0.6, "mode": "highest" },
      { "name": "file_size", "weight": 0.3, "mode": "lowest" },
      { "name": "generation_time", "weight": 0.1, "mode": "lowest" }
    ],
    "aggregation": "weighted_sum"
  }
}
```

### Threshold-Based Selection

Select first variant meeting requirements:

```json
{
  "selectionCriteria": {
    "metric": "qa_score",
    "mode": "threshold",
    "threshold": 95,
    "fallback": "highest"
  }
}
```

If no variant reaches 95, falls back to highest score.

---

## Comparison Metrics

### QA Score Comparison

```json
{
  "comparison": {
    "variant-a": {
      "qa_score": 97,
      "brand_score": 95,
      "accessibility_score": 92
    },
    "variant-b": {
      "qa_score": 94,
      "brand_score": 98,
      "accessibility_score": 89
    }
  },
  "winner": "variant-a",
  "reason": "Highest overall QA score (97 vs 94)"
}
```

### File Size Comparison

```json
{
  "comparison": {
    "variant-a": {
      "file_size_mb": 8.5,
      "page_count": 8
    },
    "variant-b": {
      "file_size_mb": 6.2,
      "page_count": 8
    }
  },
  "winner": "variant-b",
  "reason": "Smallest file size (6.2 MB vs 8.5 MB)"
}
```

### Generation Time Comparison

```json
{
  "comparison": {
    "variant-a": {
      "generation_time_ms": 135000,
      "qa_score": 97
    },
    "variant-b": {
      "generation_time_ms": 95000,
      "qa_score": 96
    }
  },
  "winner": "variant-b",
  "reason": "Faster generation (95s vs 135s) with comparable quality (96 vs 97)"
}
```

---

## Winner Selection

### Automatic Selection

Winner selected automatically based on criteria:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [...],
    "selectionCriteria": {
      "metric": "qa_score",
      "mode": "highest"
    },
    "autoSelect": true
  }
}
```

### Manual Selection

Prompt user to review and select:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [...],
    "selectionCriteria": {
      "mode": "manual"
    },
    "reviewMode": {
      "generateComparison": true,
      "openInBrowser": true
    }
  }
}
```

Generates comparison page with side-by-side previews.

### Winner Output

Winner copied to final destination:

```json
{
  "experiment": {
    "variants_generated": 2,
    "winner": {
      "id": "variant-a",
      "name": "Traditional Layout",
      "qa_score": 97,
      "file_size_mb": 8.5
    },
    "winner_path": "exports/TEEI-AWS-Partnership.pdf",
    "all_variants_path": "exports/experiments/aws-partnership-2025/"
  }
}
```

All variants archived in experiments directory for future reference.

---

## Use Cases

### Use Case 1: Layout Optimization

Test different grid systems:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "12-column",
        "design": {
          "grid": { "columns": 12, "gutter": 20 }
        }
      },
      {
        "id": "16-column",
        "design": {
          "grid": { "columns": 16, "gutter": 16 }
        }
      },
      {
        "id": "8-column",
        "design": {
          "grid": { "columns": 8, "gutter": 24 }
        }
      }
    ],
    "selectionCriteria": {
      "metric": "qa_score",
      "mode": "highest"
    }
  }
}
```

### Use Case 2: Color Palette Testing

Compare brand color schemes:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "nordshore-primary",
        "design": {
          "primaryColor": "#00393F",
          "secondaryColor": "#C9E4EC"
        }
      },
      {
        "id": "sky-primary",
        "design": {
          "primaryColor": "#C9E4EC",
          "secondaryColor": "#00393F"
        }
      },
      {
        "id": "gold-accent",
        "design": {
          "primaryColor": "#00393F",
          "accentColor": "#BA8F5A"
        }
      }
    ],
    "selectionCriteria": {
      "metrics": [
        { "name": "brand_score", "weight": 0.7, "mode": "highest" },
        { "name": "accessibility_score", "weight": 0.3, "mode": "highest" }
      ]
    }
  }
}
```

### Use Case 3: File Size Optimization

Optimize for email distribution:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "high-quality",
        "export": {
          "pdfPreset": "High Quality Print",
          "imageQuality": "Maximum"
        }
      },
      {
        "id": "medium-quality",
        "export": {
          "pdfPreset": "High Quality Print",
          "imageQuality": "High",
          "compression": "JPEG"
        }
      },
      {
        "id": "web-optimized",
        "export": {
          "pdfPreset": "Smallest File Size",
          "imageQuality": "Medium"
        }
      }
    ],
    "selectionCriteria": {
      "metrics": [
        { "name": "file_size", "weight": 0.5, "mode": "lowest" },
        { "name": "qa_score", "weight": 0.5, "mode": "highest" }
      ]
    }
  }
}
```

### Use Case 4: Typography Testing

Compare font sizes and weights:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "standard-type",
        "design": {
          "headlineSize": 42,
          "bodySize": 11
        }
      },
      {
        "id": "larger-type",
        "design": {
          "headlineSize": 48,
          "bodySize": 12
        }
      },
      {
        "id": "smaller-type",
        "design": {
          "headlineSize": 36,
          "bodySize": 10
        }
      }
    ],
    "selectionCriteria": {
      "metrics": [
        { "name": "accessibility_score", "weight": 0.6, "mode": "highest" },
        { "name": "page_count", "weight": 0.4, "mode": "closest_to", "target": 8 }
      ]
    }
  }
}
```

### Use Case 5: Content Density Testing

Test different spacing:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "tight-spacing",
        "design": {
          "lineHeight": 1.3,
          "paragraphSpacing": 8,
          "sectionSpacing": 40
        }
      },
      {
        "id": "medium-spacing",
        "design": {
          "lineHeight": 1.5,
          "paragraphSpacing": 12,
          "sectionSpacing": 60
        }
      },
      {
        "id": "loose-spacing",
        "design": {
          "lineHeight": 1.7,
          "paragraphSpacing": 16,
          "sectionSpacing": 80
        }
      }
    ],
    "selectionCriteria": {
      "metrics": [
        { "name": "qa_score", "weight": 0.5, "mode": "highest" },
        { "name": "page_count", "weight": 0.5, "mode": "closest_to", "target": 8 }
      ]
    }
  }
}
```

---

## Advanced Features

### Variant Dependencies

Define variant relationships:

```json
{
  "experimentMode": {
    "variants": [
      {
        "id": "base-variant",
        "design": { "layout": "classic" }
      },
      {
        "id": "derived-variant",
        "extends": "base-variant",
        "design": { "colorScheme": "sky" }
      }
    ]
  }
}
```

### Parallel Generation

Generate variants in parallel:

```json
{
  "experimentMode": {
    "enabled": true,
    "parallel": true,
    "maxParallel": 3,
    "variants": [...]
  }
}
```

### Experiment Tracking

Track experiment history:

```json
{
  "experimentMode": {
    "enabled": true,
    "tracking": {
      "experimentId": "aws-layout-test-2025-11",
      "tags": ["layout", "aws", "partnership"],
      "notes": "Testing grid systems for AWS partnership document"
    }
  }
}
```

### Custom Metrics

Define custom comparison metrics:

```json
{
  "experimentMode": {
    "selectionCriteria": {
      "metric": "custom",
      "customMetric": {
        "name": "cost_per_page",
        "formula": "generation_cost / page_count",
        "mode": "lowest"
      }
    }
  }
}
```

---

## Best Practices

### 1. Start with 2-3 Variants

Don't create too many variants initially:

✅ **Good**: 2-3 focused variants
❌ **Bad**: 10+ variants (slow, hard to compare)

### 2. Test One Variable at a Time

Isolate what you're testing:

✅ **Good**: Test layout only (keep colors/fonts constant)
❌ **Bad**: Change layout + colors + fonts + spacing

### 3. Define Clear Success Criteria

Know what "winner" means before running experiment:

```json
{
  "selectionCriteria": {
    "metric": "qa_score",
    "mode": "highest",
    "min_threshold": 90
  }
}
```

### 4. Archive All Variants

Keep all variants for future reference:

```json
{
  "experimentMode": {
    "archiveVariants": true,
    "archivePath": "exports/experiments/{{jobId}}"
  }
}
```

### 5. Document Experiments

Add metadata to track decisions:

```json
{
  "experimentMode": {
    "tracking": {
      "hypothesis": "Asymmetric layout will score higher than classic layout",
      "notes": "Testing for AWS partnership document",
      "reviewer": "@designer"
    }
  }
}
```

### 6. Use Meaningful IDs

Name variants descriptively:

✅ **Good**: `"id": "asymmetric-layout-nordshore-colors"`
❌ **Bad**: `"id": "variant-a"`

### 7. Set Resource Limits

Prevent runaway experiments:

```json
{
  "experimentMode": {
    "maxVariants": 5,
    "maxDuration_ms": 600000,  // 10 minutes
    "maxTotalCost_usd": 5.00
  }
}
```

### 8. Review Winners Manually

Don't blindly trust automatic selection:

```json
{
  "experimentMode": {
    "autoSelect": false,
    "reviewMode": {
      "generateComparison": true,
      "requireManualApproval": true
    }
  }
}
```

---

## CLI Usage

```bash
# Run experiment
node orchestrator.js example-jobs/aws-experiment.json

# Run experiment with specific variants
node orchestrator.js example-jobs/aws-experiment.json --variants variant-a,variant-b

# Override selection criteria
node orchestrator.js example-jobs/aws-experiment.json --select-by file_size --select-mode lowest

# Manual selection mode
node orchestrator.js example-jobs/aws-experiment.json --manual-select
```

---

## Output Structure

Experiment results saved to:

```
exports/experiments/aws-partnership-2025/
├── experiment-report.json        # Comparison data
├── variant-a/
│   ├── TEEI-AWS-Partnership.pdf
│   ├── qa-report.json
│   └── metrics.json
├── variant-b/
│   ├── TEEI-AWS-Partnership.pdf
│   ├── qa-report.json
│   └── metrics.json
├── comparison/
│   ├── side-by-side.html         # Visual comparison
│   ├── metrics-chart.png
│   └── diff-images/
└── winner -> variant-a/           # Symlink to winner
```

---

## Next Steps

1. **Try simple experiment** - Test 2 layout variants
2. **Compare by QA score** - Use automatic winner selection
3. **Test color schemes** - Compare brand palettes
4. **Optimize file size** - Balance quality vs size
5. **Track experiments** - Build experiment history

---

## Related Documentation

- [Phase 6 Guide](./PHASE-6-GUIDE.md) - Complete Phase 6 overview
- [QA Profile Guide](./QAPROFILE-GUIDE.md) - Config-driven validation
- [MCP Flows Guide](./MCP-FLOWS-GUIDE.md) - Multi-server workflows
- [Migration Guide](./MIGRATION-TO-PHASE-6.md) - Upgrade from Phase 5

---

**Last Updated**: 2025-11-13
**Version**: Phase 6.0
**Status**: Production-ready
