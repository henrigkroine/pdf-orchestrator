# QA Profile Guide

**Config-driven validation for PDF quality assurance**

QA Profiles enable you to define validation rules directly in your job configuration, eliminating the need for external QA scripts and making quality standards explicit, versioned, and portable.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Profile Structure](#profile-structure)
4. [Check Configuration](#check-configuration)
5. [Pre-Built Profiles](#pre-built-profiles)
6. [Custom Profiles](#custom-profiles)
7. [CLI Overrides](#cli-overrides)
8. [Integration](#integration)
9. [Best Practices](#best-practices)

---

## Overview

### What Are QA Profiles?

QA Profiles are JSON configurations that define:
- **Minimum quality scores** required for job success
- **Which validation checks** to run
- **Check weights** (how much each check contributes to total score)
- **Visual regression settings** (baseline, thresholds)
- **Failure modes** (hard fail vs. warning)

### Benefits

✅ **Zero external scripts** - All validation config in job file
✅ **Versioned quality** - Track quality requirements in git
✅ **Portable standards** - Share profiles across projects
✅ **Flexible overrides** - Adjust thresholds per job or via CLI
✅ **Explicit requirements** - No hidden quality expectations

---

## Quick Start

### Basic Profile

Add `qaProfile` to your job config:

```json
{
  "jobId": "my-job",
  "jobType": "partnership",

  "qaProfile": {
    "id": "standard",
    "min_score": 85
  }
}
```

This applies the default `standard` profile with minimum score of 85.

### World-Class Profile

For premium documents:

```json
{
  "qaProfile": {
    "id": "world_class",
    "min_score": 95,
    "fail_on_brand_violations": true
  }
}
```

### With Visual Regression

Enable baseline comparison:

```json
{
  "qaProfile": {
    "id": "tfu_premium",
    "min_score": 95,
    "visual_baseline_id": "tfu-aws-v1",
    "max_visual_diff_percent": 5,
    "create_baseline_on_first_pass": true
  }
}
```

---

## Profile Structure

### Complete Profile Example

```json
{
  "qaProfile": {
    // Identity
    "id": "world_class_partnership",
    "name": "World-Class Partnership Documents",
    "description": "Premium quality for client-facing partnership materials",

    // Score thresholds
    "min_score": 95,
    "min_tfu_score": 140,

    // Visual regression
    "visual_baseline_id": "tfu-aws-v1",
    "max_visual_diff_percent": 5,
    "create_baseline_on_first_pass": true,

    // Failure modes
    "fail_on_brand_violations": true,
    "fail_on_accessibility_errors": false,

    // Individual checks
    "checks": {
      "typography": {
        "enabled": true,
        "weight": 20,
        "min_score": 90
      },
      "colors": {
        "enabled": true,
        "weight": 25,
        "min_score": 95
      },
      "layout": {
        "enabled": true,
        "weight": 20,
        "min_score": 85
      },
      "accessibility": {
        "enabled": true,
        "weight": 15,
        "min_score": 80
      },
      "visual_regression": {
        "enabled": true,
        "weight": 20
      }
    }
  }
}
```

### Field Reference

#### Identity Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique profile identifier |
| `name` | string | No | Human-readable name |
| `description` | string | No | Profile purpose |

#### Score Thresholds

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `min_score` | number | 80 | Minimum overall score (0-100) |
| `min_tfu_score` | number | null | Minimum TFU-specific score (0-150) |
| `min_brand_score` | number | null | Minimum brand compliance score |
| `min_accessibility_score` | number | null | Minimum accessibility score |

#### Visual Regression

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `visual_baseline_id` | string | null | Baseline reference ID |
| `max_visual_diff_percent` | number | 10 | Max allowed visual change (%) |
| `create_baseline_on_first_pass` | boolean | false | Auto-create baseline on first success |
| `visual_diff_mode` | string | "pixel" | Comparison mode: "pixel" or "perceptual" |

#### Failure Modes

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `fail_on_brand_violations` | boolean | false | Hard fail on brand guideline violations |
| `fail_on_accessibility_errors` | boolean | false | Hard fail on WCAG violations |
| `fail_on_visual_regression` | boolean | false | Hard fail on visual diff exceeding threshold |
| `fail_on_text_cutoff` | boolean | true | Hard fail on text cutoffs |

---

## Check Configuration

### Available Checks

| Check | Weight | Validates |
|-------|--------|-----------|
| `typography` | 20 | Font usage, sizes, spacing, hierarchy |
| `colors` | 25 | Brand colors, contrast, palette compliance |
| `layout` | 20 | Grid alignment, spacing, margins |
| `accessibility` | 15 | WCAG 2.1 AA compliance, alt text, structure |
| `visual_regression` | 20 | Pixel/perceptual diff vs baseline |
| `brand_compliance` | Auto | Overall brand guideline adherence |
| `content_quality` | Auto | Spelling, grammar, completeness |

### Check Configuration Options

Each check supports:

```json
{
  "checks": {
    "typography": {
      "enabled": true,          // Enable/disable check
      "weight": 20,             // Contribution to total score (0-100)
      "min_score": 90,          // Minimum score for this check
      "fail_on_error": false,   // Hard fail on check failure
      "config": {               // Check-specific options
        "allowed_fonts": ["Lora", "Roboto Flex"],
        "min_font_size": 9,
        "max_font_size": 72
      }
    }
  }
}
```

### Typography Check

Validates font usage and text styling:

```json
{
  "checks": {
    "typography": {
      "enabled": true,
      "weight": 20,
      "config": {
        "allowed_fonts": ["Lora", "Roboto Flex"],
        "headline_fonts": ["Lora"],
        "body_fonts": ["Roboto Flex"],
        "min_font_size": 9,
        "max_font_size": 72,
        "check_line_height": true,
        "check_kerning": true,
        "check_hierarchy": true
      }
    }
  }
}
```

### Colors Check

Validates color palette and usage:

```json
{
  "checks": {
    "colors": {
      "enabled": true,
      "weight": 25,
      "config": {
        "brand_colors": [
          "#00393F",  // Nordshore
          "#C9E4EC",  // Sky
          "#FFF1E2",  // Sand
          "#BA8F5A"   // Gold
        ],
        "forbidden_colors": [
          "#FF6B35",  // Copper (not in brand)
          "#C87941"   // Orange (not in brand)
        ],
        "check_contrast": true,
        "min_contrast_ratio": 4.5,
        "allow_color_variations": true,
        "max_color_deviation": 10
      }
    }
  }
}
```

### Layout Check

Validates spacing and alignment:

```json
{
  "checks": {
    "layout": {
      "enabled": true,
      "weight": 20,
      "config": {
        "grid_columns": 12,
        "gutter_width": 20,
        "margins": { "top": 40, "right": 40, "bottom": 40, "left": 40 },
        "check_alignment": true,
        "check_spacing_consistency": true,
        "allowed_spacing_units": [12, 20, 40, 60]
      }
    }
  }
}
```

### Accessibility Check

Validates WCAG compliance:

```json
{
  "checks": {
    "accessibility": {
      "enabled": true,
      "weight": 15,
      "config": {
        "wcag_level": "AA",
        "wcag_version": "2.1",
        "check_alt_text": true,
        "check_heading_structure": true,
        "check_color_contrast": true,
        "check_tab_order": false,
        "check_form_labels": false
      }
    }
  }
}
```

### Visual Regression Check

Validates against baseline:

```json
{
  "checks": {
    "visual_regression": {
      "enabled": true,
      "weight": 20,
      "config": {
        "baseline_id": "tfu-aws-v1",
        "max_diff_percent": 5,
        "comparison_mode": "pixel",
        "ignore_antialiasing": true,
        "ignore_regions": [
          { "x": 100, "y": 100, "width": 200, "height": 50 }
        ]
      }
    }
  }
}
```

---

## Pre-Built Profiles

### Draft Profile

Quick validation for development:

```json
{
  "qaProfile": {
    "id": "draft",
    "min_score": 70,
    "checks": {
      "typography": { "enabled": true, "weight": 25 },
      "colors": { "enabled": true, "weight": 25 },
      "layout": { "enabled": true, "weight": 25 },
      "accessibility": { "enabled": false, "weight": 0 },
      "visual_regression": { "enabled": false, "weight": 0 }
    }
  }
}
```

**Use for**: Local development, quick iterations

### Standard Profile

Balanced quality for most jobs:

```json
{
  "qaProfile": {
    "id": "standard",
    "min_score": 85,
    "checks": {
      "typography": { "enabled": true, "weight": 20 },
      "colors": { "enabled": true, "weight": 25 },
      "layout": { "enabled": true, "weight": 20 },
      "accessibility": { "enabled": true, "weight": 15 },
      "visual_regression": { "enabled": true, "weight": 20 }
    }
  }
}
```

**Use for**: Internal documents, standard deliverables

### Premium Profile

High quality for client deliverables:

```json
{
  "qaProfile": {
    "id": "premium",
    "min_score": 90,
    "fail_on_brand_violations": true,
    "checks": {
      "typography": { "enabled": true, "weight": 20, "min_score": 85 },
      "colors": { "enabled": true, "weight": 25, "min_score": 90 },
      "layout": { "enabled": true, "weight": 20, "min_score": 85 },
      "accessibility": { "enabled": true, "weight": 15, "min_score": 85 },
      "visual_regression": { "enabled": true, "weight": 20 }
    }
  }
}
```

**Use for**: Client presentations, marketing materials

### World-Class Profile

Maximum quality for flagship documents:

```json
{
  "qaProfile": {
    "id": "world_class",
    "min_score": 95,
    "min_tfu_score": 140,
    "fail_on_brand_violations": true,
    "fail_on_text_cutoff": true,
    "checks": {
      "typography": { "enabled": true, "weight": 20, "min_score": 90 },
      "colors": { "enabled": true, "weight": 25, "min_score": 95 },
      "layout": { "enabled": true, "weight": 20, "min_score": 90 },
      "accessibility": { "enabled": true, "weight": 15, "min_score": 90 },
      "visual_regression": { "enabled": true, "weight": 20 }
    }
  }
}
```

**Use for**: Partnership documents, executive materials

### Print Production Profile

Print-specific validation:

```json
{
  "qaProfile": {
    "id": "print_production",
    "min_score": 95,
    "fail_on_brand_violations": true,
    "checks": {
      "typography": { "enabled": true, "weight": 15, "min_score": 95 },
      "colors": { "enabled": true, "weight": 30, "min_score": 98 },
      "layout": { "enabled": true, "weight": 20, "min_score": 95 },
      "accessibility": { "enabled": false, "weight": 0 },
      "visual_regression": { "enabled": true, "weight": 20 },
      "print_preflight": { "enabled": true, "weight": 15 }
    }
  }
}
```

**Use for**: Commercial printing, press-ready PDFs

---

## Custom Profiles

### Creating Custom Profiles

Define brand-specific or project-specific profiles:

```json
{
  "qaProfile": {
    "id": "teei_aws_partnership",
    "name": "TEEI AWS Partnership",
    "description": "Custom profile for TEEI-AWS partnership documents",

    "min_score": 95,
    "min_tfu_score": 140,

    "visual_baseline_id": "tfu-aws-v1",
    "max_visual_diff_percent": 5,
    "create_baseline_on_first_pass": true,

    "fail_on_brand_violations": true,
    "fail_on_text_cutoff": true,

    "checks": {
      "typography": {
        "enabled": true,
        "weight": 20,
        "min_score": 90,
        "config": {
          "allowed_fonts": ["Lora", "Roboto Flex"],
          "headline_fonts": ["Lora"],
          "body_fonts": ["Roboto Flex"],
          "min_font_size": 9
        }
      },
      "colors": {
        "enabled": true,
        "weight": 25,
        "min_score": 95,
        "config": {
          "brand_colors": ["#00393F", "#C9E4EC", "#FFF1E2", "#BA8F5A"],
          "forbidden_colors": ["#FF6B35", "#C87941"]
        }
      },
      "layout": {
        "enabled": true,
        "weight": 20,
        "min_score": 85,
        "config": {
          "grid_columns": 12,
          "gutter_width": 20,
          "margins": { "top": 40, "right": 40, "bottom": 40, "left": 40 }
        }
      },
      "accessibility": {
        "enabled": true,
        "weight": 15,
        "min_score": 90,
        "config": {
          "wcag_level": "AA",
          "wcag_version": "2.1"
        }
      },
      "visual_regression": {
        "enabled": true,
        "weight": 20,
        "config": {
          "baseline_id": "tfu-aws-v1",
          "max_diff_percent": 5
        }
      }
    }
  }
}
```

### Profile Inheritance

Extend existing profiles:

```json
{
  "qaProfile": {
    "id": "my_custom_profile",
    "extends": "world_class",
    "min_score": 98,
    "checks": {
      "colors": {
        "weight": 30
      }
    }
  }
}
```

This inherits all settings from `world_class` profile and overrides `min_score` and colors weight.

---

## CLI Overrides

### Override Score Thresholds

```bash
# Override minimum score
node orchestrator.js job.json --qa-min-score 98

# Override TFU score
node orchestrator.js job.json --qa-min-tfu-score 145

# Override visual diff threshold
node orchestrator.js job.json --qa-max-diff 3
```

### Enable/Disable Checks

```bash
# Disable specific check
node orchestrator.js job.json --qa-disable-accessibility

# Enable additional check
node orchestrator.js job.json --qa-enable-brand-compliance

# Disable all visual regression
node orchestrator.js job.json --qa-disable-visual
```

### Adjust Check Weights

```bash
# Increase typography weight
node orchestrator.js job.json --qa-typography-weight 30

# Decrease accessibility weight
node orchestrator.js job.json --qa-accessibility-weight 10
```

### Failure Mode Overrides

```bash
# Hard fail on brand violations
node orchestrator.js job.json --qa-fail-on-brand-violations

# Allow text cutoffs (not recommended)
node orchestrator.js job.json --qa-allow-text-cutoffs
```

---

## Integration

### With Orchestrator

Profiles automatically loaded by orchestrator:

```javascript
const orchestrator = new PDFOrchestrator();

// Profile loaded from job config
const result = await orchestrator.executeJob({
  jobType: "partnership",
  qaProfile: {
    id: "world_class",
    min_score: 95
  }
});

// Result includes QA validation with profile
console.log(result.qa.score);  // 97
console.log(result.qa.passed); // true
```

### With CI/CD

Use in automated pipelines:

```yaml
# .github/workflows/generate-pdfs.yml
- name: Generate PDFs with QA
  run: |
    node orchestrator.js example-jobs/tfu-aws-partnership.json
  env:
    QA_PROFILE: world_class
    QA_MIN_SCORE: 95
```

### With Approval Workflows

Combine with approval:

```json
{
  "qaProfile": {
    "id": "world_class",
    "min_score": 95
  },
  "approval": {
    "mode": "auto"
  }
}
```

Auto-approves only if QA profile passes.

---

## Best Practices

### 1. Start with Pre-Built Profiles

Use `standard` or `premium` profiles before creating custom ones:

```json
{
  "qaProfile": { "id": "standard" }
}
```

### 2. Version Your Profiles

Include profile version in ID:

```json
{
  "qaProfile": { "id": "teei_aws_v2" }
}
```

### 3. Document Profile Purpose

Always include `description`:

```json
{
  "qaProfile": {
    "id": "teei_aws",
    "description": "TEEI AWS partnership documents - world-class quality with TFU layout"
  }
}
```

### 4. Use Baselines for Regression

Enable automatic baseline creation:

```json
{
  "qaProfile": {
    "visual_baseline_id": "tfu-aws-v1",
    "create_baseline_on_first_pass": true
  }
}
```

### 5. Tune Weights by Job Type

Different job types need different emphasis:

**Partnership Documents** (focus on brand):
```json
{ "colors": { "weight": 30 }, "layout": { "weight": 25 } }
```

**Accessibility Reports** (focus on WCAG):
```json
{ "accessibility": { "weight": 40 }, "colors": { "weight": 15 } }
```

### 6. Fail Fast on Critical Issues

Use hard fails for non-negotiable requirements:

```json
{
  "qaProfile": {
    "fail_on_brand_violations": true,
    "fail_on_text_cutoff": true
  }
}
```

### 7. Monitor Profile Effectiveness

Track QA scores over time:

```bash
# View QA score trends
node scripts/analyze-qa-trends.js --profile world_class
```

### 8. Share Profiles Across Teams

Store reusable profiles in separate files:

```json
// profiles/teei-world-class.json
{
  "id": "teei_world_class",
  "min_score": 95,
  ...
}

// job.json
{
  "qaProfile": { "$ref": "profiles/teei-world-class.json" }
}
```

---

## Examples

### Example 1: Simple Draft Profile

```json
{
  "jobId": "test-layout",
  "jobType": "partnership",
  "qaProfile": {
    "id": "draft",
    "min_score": 70
  }
}
```

### Example 2: World-Class with Auto-Baseline

```json
{
  "jobId": "aws-partnership-2025",
  "jobType": "partnership",
  "qaProfile": {
    "id": "world_class",
    "min_score": 95,
    "visual_baseline_id": "tfu-aws-v1",
    "create_baseline_on_first_pass": true
  }
}
```

### Example 3: Custom Print Profile

```json
{
  "jobId": "annual-report-print",
  "jobType": "report",
  "qaProfile": {
    "id": "annual_report_print",
    "min_score": 98,
    "fail_on_brand_violations": true,
    "checks": {
      "colors": {
        "enabled": true,
        "weight": 35,
        "min_score": 99,
        "config": {
          "color_mode": "CMYK",
          "check_overprint": true,
          "check_rich_black": true
        }
      },
      "print_preflight": {
        "enabled": true,
        "weight": 20,
        "config": {
          "check_bleed": true,
          "check_trim_marks": true,
          "check_color_bars": true,
          "min_resolution_dpi": 300
        }
      }
    }
  }
}
```

### Example 4: Accessibility-First Profile

```json
{
  "jobId": "government-report",
  "jobType": "report",
  "qaProfile": {
    "id": "accessibility_first",
    "min_score": 90,
    "min_accessibility_score": 95,
    "fail_on_accessibility_errors": true,
    "checks": {
      "accessibility": {
        "enabled": true,
        "weight": 40,
        "min_score": 95,
        "config": {
          "wcag_level": "AAA",
          "wcag_version": "2.2"
        }
      },
      "colors": {
        "enabled": true,
        "weight": 25,
        "config": {
          "min_contrast_ratio": 7.0
        }
      }
    }
  }
}
```

---

## Next Steps

1. **Try pre-built profiles** - Start with `standard` or `premium`
2. **Create custom profile** - Define brand-specific rules
3. **Enable baselines** - Auto-create visual regression baselines
4. **Integrate with CI/CD** - Add QA profiles to automated pipelines
5. **Monitor effectiveness** - Track QA scores over time

---

## Related Documentation

- [Phase 6 Guide](./PHASE-6-GUIDE.md) - Complete Phase 6 overview
- [MCP Flows Guide](./MCP-FLOWS-GUIDE.md) - Multi-server workflows
- [Experiment Mode Guide](./EXPERIMENT-MODE-GUIDE.md) - A/B testing
- [Migration Guide](./MIGRATION-TO-PHASE-6.md) - Upgrade from Phase 5

---

**Last Updated**: 2025-11-13
**Version**: Phase 6.0
**Status**: Production-ready
