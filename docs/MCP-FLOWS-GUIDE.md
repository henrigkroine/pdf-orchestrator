# MCP Flows Guide

**Multi-server MCP workflow orchestration**

MCP Flows enable you to orchestrate complex workflows across multiple MCP servers (Figma, DALL-E, InDesign, GitHub, etc.) with a single job configuration. This guide covers all available flows, configuration options, and integration patterns.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Available Flows](#available-flows)
4. [Flow Configuration](#flow-configuration)
5. [Figma Flow](#figma-flow)
6. [DALL-E Flow](#dalle-flow)
7. [InDesign Flow](#indesign-flow)
8. [Playwright Flow](#playwright-flow)
9. [GitHub Flow](#github-flow)
10. [Custom Workflows](#custom-workflows)
11. [Error Handling](#error-handling)
12. [Best Practices](#best-practices)

---

## Overview

### What Are MCP Flows?

MCP Flows are **multi-step workflows** that coordinate actions across different MCP servers:

1. **Figma** - Extract brand tokens (colors, typography)
2. **DALL-E** - Generate AI images
3. **InDesign** - Create and export PDFs
4. **Playwright** - Run visual QA validation
5. **GitHub** - Commit results to repository

### Benefits

✅ **Single job config** - Define entire workflow in one JSON file
✅ **Automatic orchestration** - MCP Manager handles server coordination
✅ **Context passing** - Share data between workflow steps
✅ **Error recovery** - Built-in retry and fallback logic
✅ **Parallel execution** - Run independent steps concurrently

---

## Quick Start

### Basic MCP Flow

Enable MCP workflow in your job:

```json
{
  "jobId": "aws-partnership-2025",
  "jobType": "partnership",

  "mcp": {
    "workflow": "generate-partnership-pdf",
    "servers": {
      "indesign": {
        "enabled": true,
        "actions": ["openTemplate", "bindData", "exportPDF"]
      }
    }
  }
}
```

### Multi-Server Flow

Orchestrate multiple servers:

```json
{
  "mcp": {
    "workflow": "generate-partnership-pdf",
    "servers": {
      "figma": {
        "enabled": true,
        "action": "extractDesignTokens"
      },
      "dalle": {
        "enabled": true,
        "action": "generateHeroImage"
      },
      "indesign": {
        "enabled": true,
        "actions": ["openTemplate", "applyBrandColors", "bindData", "placeImage", "exportPDF"]
      },
      "playwright": {
        "enabled": true,
        "action": "validateQA"
      }
    }
  }
}
```

### Execution Flow

```
1. Figma extracts brand colors
   ↓ (passes colors to InDesign)
2. DALL-E generates hero image
   ↓ (passes image URL to InDesign)
3. InDesign creates PDF
   ↓ (passes PDF path to Playwright)
4. Playwright validates QA
   ↓
5. Job completes
```

---

## Available Flows

### Pre-Defined Workflows

| Workflow ID | Description | Servers Used |
|-------------|-------------|--------------|
| `generate-partnership-pdf` | Create partnership document | Figma, DALL-E, InDesign, Playwright |
| `generate-program-overview` | Create program overview | InDesign, Playwright |
| `generate-annual-report` | Create annual report | Figma, InDesign, Playwright, GitHub |
| `generate-marketing-flyer` | Create marketing material | DALL-E, InDesign |
| `brand-refresh` | Update brand assets | Figma, InDesign, GitHub |

### Workflow Structure

Each workflow defines:
- **Steps** - Sequential or parallel actions
- **Server invocations** - Which MCP server to call
- **Context passing** - Data shared between steps
- **Error handling** - Retry/fallback behavior

---

## Flow Configuration

### Server Configuration

Each MCP server can be configured with:

```json
{
  "mcp": {
    "servers": {
      "server_name": {
        "enabled": boolean,       // Enable/disable this server
        "action": string,          // Single action to perform
        "actions": string[],       // Multiple actions in sequence
        "parallel": boolean,       // Run actions in parallel
        "retry": {
          "enabled": boolean,
          "max_attempts": number,
          "backoff_ms": number
        },
        "timeout_ms": number,      // Action timeout
        "fallback": string,        // Fallback action on failure
        "config": object           // Server-specific config
      }
    }
  }
}
```

### Complete Example

```json
{
  "mcp": {
    "workflow": "generate-partnership-pdf",
    "servers": {
      "figma": {
        "enabled": true,
        "action": "extractDesignTokens",
        "timeout_ms": 5000,
        "retry": {
          "enabled": true,
          "max_attempts": 3,
          "backoff_ms": 1000
        },
        "config": {
          "fileId": "TEEI-Brand-System",
          "extractColors": true,
          "extractTypography": true
        }
      },
      "dalle": {
        "enabled": true,
        "action": "generateHeroImage",
        "timeout_ms": 30000,
        "retry": {
          "enabled": true,
          "max_attempts": 2,
          "backoff_ms": 2000
        },
        "config": {
          "model": "dall-e-3",
          "quality": "hd",
          "size": "1792x1024",
          "style": "natural"
        }
      },
      "indesign": {
        "enabled": true,
        "actions": [
          "openTemplate",
          "applyBrandColors",
          "bindData",
          "placeImage",
          "exportPDF"
        ],
        "parallel": false,
        "timeout_ms": 120000,
        "config": {
          "templatePath": "templates/partnership-v1.indt",
          "exportPreset": "High Quality Print"
        }
      },
      "playwright": {
        "enabled": true,
        "action": "validateQA",
        "timeout_ms": 20000,
        "config": {
          "qaProfile": "world_class",
          "visualBaseline": "tfu-aws-v1"
        }
      }
    }
  }
}
```

---

## Figma Flow

### Overview

Extract design tokens (colors, typography, spacing) from Figma files.

### Configuration

```json
{
  "mcp": {
    "servers": {
      "figma": {
        "enabled": true,
        "action": "extractDesignTokens",
        "config": {
          "fileId": "TEEI-Brand-System",
          "extractColors": true,
          "extractTypography": true,
          "extractSpacing": true,
          "extractIcons": false,
          "outputFormat": "json"
        }
      }
    }
  }
}
```

### Available Actions

| Action | Description | Output |
|--------|-------------|--------|
| `extractDesignTokens` | Extract all design tokens | JSON with colors, fonts, spacing |
| `exportAssets` | Export icons, images | Array of asset URLs |
| `getComponentLibrary` | Get component definitions | Component catalog |
| `checkBrandCompliance` | Validate design vs brand | Compliance report |

### Environment Variables

```bash
# Required
FIGMA_ACCESS_TOKEN=your_figma_token

# Optional
FIGMA_FILE_ID=default_file_id
```

### Output Format

```json
{
  "figma": {
    "colors": {
      "nordshore": "#00393F",
      "sky": "#C9E4EC",
      "sand": "#FFF1E2",
      "gold": "#BA8F5A"
    },
    "typography": {
      "headline": {
        "fontFamily": "Lora",
        "fontSize": 42,
        "fontWeight": 700
      },
      "body": {
        "fontFamily": "Roboto Flex",
        "fontSize": 11,
        "fontWeight": 400
      }
    },
    "spacing": {
      "xs": 12,
      "sm": 20,
      "md": 40,
      "lg": 60
    }
  }
}
```

### Error Handling

```json
{
  "figma": {
    "enabled": true,
    "action": "extractDesignTokens",
    "retry": {
      "enabled": true,
      "max_attempts": 3,
      "backoff_ms": 1000
    },
    "fallback": "useDefaultBrandTokens"
  }
}
```

If Figma extraction fails after retries, falls back to default brand tokens.

---

## DALL-E Flow

### Overview

Generate AI images for document hero images, illustrations, and graphics.

### Configuration

```json
{
  "mcp": {
    "servers": {
      "dalle": {
        "enabled": true,
        "action": "generateHeroImage",
        "config": {
          "model": "dall-e-3",
          "quality": "hd",
          "size": "1792x1024",
          "style": "natural",
          "prompts": {
            "hero": "Warm natural lighting photo of diverse Ukrainian students...",
            "program_1": "Students engaged in cloud computing training...",
            "program_2": "Collaborative learning in modern classroom..."
          }
        }
      }
    }
  }
}
```

### Available Actions

| Action | Description | Output |
|--------|-------------|--------|
| `generateHeroImage` | Generate main hero image | Image URL |
| `generateMultipleImages` | Generate batch of images | Array of image URLs |
| `generateIllustration` | Generate vector-style illustration | SVG/PNG URL |
| `generateIcon` | Generate simple icon | SVG URL |

### Model Options

**DALL-E 3** (recommended):
```json
{
  "model": "dall-e-3",
  "quality": "hd",      // or "standard"
  "size": "1792x1024",  // landscape, or "1024x1024", "1024x1792"
  "style": "natural"    // or "vivid"
}
```

**DALL-E 2** (faster, cheaper):
```json
{
  "model": "dall-e-2",
  "size": "1024x1024",  // or "512x512", "256x256"
  "n": 4                // generate 4 variations
}
```

### Prompt Templates

Use template variables for dynamic prompts:

```json
{
  "dalle": {
    "config": {
      "prompts": {
        "hero": "{{style}} photo of {{subject}} in {{setting}}, {{atmosphere}} atmosphere, TEEI brand style"
      },
      "variables": {
        "style": "Warm natural lighting",
        "subject": "diverse Ukrainian students",
        "setting": "modern learning space",
        "atmosphere": "hopeful"
      }
    }
  }
}
```

### Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_key

# Optional (for cost tracking)
OPENAI_ORG_ID=your_org_id
```

### Output Format

```json
{
  "dalle": {
    "images": [
      {
        "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
        "revised_prompt": "Actual prompt used by DALL-E 3",
        "size": "1792x1024",
        "cost_usd": 0.08
      }
    ],
    "total_cost_usd": 0.08
  }
}
```

### Cost Management

DALL-E costs per image:

| Model | Quality | Size | Cost |
|-------|---------|------|------|
| DALL-E 3 | Standard | 1024x1024 | $0.040 |
| DALL-E 3 | HD | 1024x1024 | $0.080 |
| DALL-E 3 | HD | 1792x1024 | $0.120 |
| DALL-E 2 | - | 1024x1024 | $0.020 |

Set cost limits:

```json
{
  "dalle": {
    "config": {
      "max_cost_usd": 0.50,
      "max_images": 5
    }
  }
}
```

---

## InDesign Flow

### Overview

Create and export PDFs using Adobe InDesign.

### Configuration

```json
{
  "mcp": {
    "servers": {
      "indesign": {
        "enabled": true,
        "actions": [
          "openTemplate",
          "applyBrandColors",
          "bindData",
          "placeImage",
          "exportPDF"
        ],
        "config": {
          "templatePath": "templates/partnership-v1.indt",
          "exportPreset": "High Quality Print",
          "exportPath": "exports/output.pdf"
        }
      }
    }
  }
}
```

### Available Actions

| Action | Description | Input |
|--------|-------------|-------|
| `openTemplate` | Open InDesign template | Template path |
| `createDocument` | Create new document | Width, height, pages |
| `applyBrandColors` | Apply brand color swatches | Color definitions |
| `bindData` | Populate text/data fields | Data object |
| `placeImage` | Place images in frames | Image paths, frame IDs |
| `exportPDF` | Export to PDF | Export preset, path |
| `saveDocument` | Save INDD file | File path |

### Action Sequence

Actions run sequentially:

```json
{
  "actions": [
    "openTemplate",      // 1. Open template
    "applyBrandColors",  // 2. Apply colors
    "bindData",          // 3. Populate data
    "placeImage",        // 4. Place images
    "exportPDF"          // 5. Export PDF
  ]
}
```

### Data Binding

Bind data to InDesign fields:

```json
{
  "indesign": {
    "config": {
      "dataBindings": {
        "title": "Together for Ukraine Partnership",
        "partner_name": "AWS",
        "student_count": "5000",
        "program_description": "Comprehensive cloud computing curriculum..."
      }
    }
  }
}
```

### Image Placement

Place images by frame ID:

```json
{
  "indesign": {
    "config": {
      "images": {
        "hero_frame": "https://example.com/hero.jpg",
        "program_1_frame": "/path/to/local/image.png",
        "logo_frame": "assets/partner-logos/aws.svg"
      }
    }
  }
}
```

### Export Presets

Available export presets:

| Preset | Use Case | Settings |
|--------|----------|----------|
| `High Quality Print` | Commercial printing | 300 DPI, PDF/X-4 |
| `[High Quality Print]` | Digital/screen | 150 DPI, RGB |
| `Press Quality` | Press-ready | 300 DPI, CMYK, bleed |
| `Smallest File Size` | Web/email | 72 DPI, compressed |

Custom preset:

```json
{
  "indesign": {
    "config": {
      "exportPreset": "Custom",
      "exportSettings": {
        "format": "PDF",
        "quality": "Maximum",
        "resolution": 300,
        "colorSpace": "RGB",
        "compression": "JPEG",
        "compressionQuality": "High"
      }
    }
  }
}
```

### Output Format

```json
{
  "indesign": {
    "documentPath": "C:/Users/.../document.indd",
    "exportPath": "exports/TEEI-AWS-Partnership.pdf",
    "pageCount": 8,
    "fileSize_mb": 8.5,
    "exportDuration_ms": 30000
  }
}
```

---

## Playwright Flow

### Overview

Run visual QA validation on exported PDFs.

### Configuration

```json
{
  "mcp": {
    "servers": {
      "playwright": {
        "enabled": true,
        "action": "validateQA",
        "config": {
          "qaProfile": "world_class",
          "visualBaseline": "tfu-aws-v1",
          "generateScreenshots": true,
          "runAccessibilityChecks": true
        }
      }
    }
  }
}
```

### Available Actions

| Action | Description | Output |
|--------|-------------|--------|
| `validateQA` | Run full QA validation | QA report with score |
| `generateScreenshots` | Create page screenshots | PNG files |
| `runVisualRegression` | Compare vs baseline | Diff report |
| `checkAccessibility` | Run WCAG checks | Accessibility report |
| `extractText` | Extract text content | Text content JSON |

### QA Profile Integration

Use QA profile from job config:

```json
{
  "qaProfile": {
    "id": "world_class",
    "min_score": 95
  },
  "mcp": {
    "servers": {
      "playwright": {
        "enabled": true,
        "action": "validateQA",
        "config": {
          "useJobQAProfile": true
        }
      }
    }
  }
}
```

### Output Format

```json
{
  "playwright": {
    "qaScore": 97,
    "passed": true,
    "checks": {
      "typography": { "score": 95, "passed": true },
      "colors": { "score": 98, "passed": true },
      "layout": { "score": 96, "passed": true },
      "accessibility": { "score": 92, "passed": true },
      "visualRegression": { "score": 100, "diffPercent": 2.1, "passed": true }
    },
    "screenshots": [
      "exports/validation-issues/screenshots/page-1.png",
      "exports/validation-issues/screenshots/page-2.png"
    ]
  }
}
```

---

## GitHub Flow

### Overview

Commit results to GitHub repository.

### Configuration

```json
{
  "mcp": {
    "servers": {
      "github": {
        "enabled": true,
        "action": "commitResults",
        "config": {
          "repo": "teei/partnership-documents",
          "branch": "main",
          "commitMessage": "Add AWS partnership PDF",
          "files": [
            "exports/TEEI-AWS-Partnership.pdf",
            "reports/metrics/job-metrics.json"
          ]
        }
      }
    }
  }
}
```

### Available Actions

| Action | Description | Output |
|--------|-------------|--------|
| `commitResults` | Commit files to repo | Commit SHA |
| `createPullRequest` | Create PR with changes | PR number |
| `createRelease` | Create GitHub release | Release ID |
| `uploadArtifact` | Upload to release | Asset URL |

### Environment Variables

```bash
# Required
GITHUB_TOKEN=your_github_token
GITHUB_REPO=owner/repo

# Optional
GITHUB_BRANCH=main
```

### Commit Message Templates

Use dynamic commit messages:

```json
{
  "github": {
    "config": {
      "commitMessage": "Add {{partner}} partnership PDF - QA score: {{qa_score}}",
      "variables": {
        "partner": "AWS",
        "qa_score": 97
      }
    }
  }
}
```

### Output Format

```json
{
  "github": {
    "commitSHA": "abc123def456",
    "commitUrl": "https://github.com/teei/partnership-documents/commit/abc123def456",
    "filesCommitted": 2
  }
}
```

---

## Custom Workflows

### Defining Custom Workflows

Create custom workflows in `mcp-workflows.config.json`:

```json
{
  "workflows": {
    "custom-partnership-flow": {
      "name": "Custom Partnership Flow",
      "description": "Custom workflow for partnership documents",
      "steps": [
        {
          "id": "extract-brand",
          "server": "figma",
          "action": "extractDesignTokens",
          "timeout_ms": 5000
        },
        {
          "id": "generate-images",
          "server": "dalle",
          "action": "generateMultipleImages",
          "timeout_ms": 60000,
          "depends_on": []
        },
        {
          "id": "create-pdf",
          "server": "indesign",
          "actions": ["openTemplate", "applyBrandColors", "bindData", "placeImage", "exportPDF"],
          "timeout_ms": 120000,
          "depends_on": ["extract-brand", "generate-images"]
        },
        {
          "id": "validate-qa",
          "server": "playwright",
          "action": "validateQA",
          "timeout_ms": 20000,
          "depends_on": ["create-pdf"]
        },
        {
          "id": "commit-results",
          "server": "github",
          "action": "commitResults",
          "timeout_ms": 10000,
          "depends_on": ["validate-qa"]
        }
      ]
    }
  }
}
```

### Using Custom Workflows

Reference custom workflow in job:

```json
{
  "mcp": {
    "workflow": "custom-partnership-flow"
  }
}
```

---

## Error Handling

### Retry Configuration

Configure retries per server:

```json
{
  "mcp": {
    "servers": {
      "dalle": {
        "enabled": true,
        "action": "generateHeroImage",
        "retry": {
          "enabled": true,
          "max_attempts": 3,
          "backoff_ms": 2000,
          "backoff_multiplier": 2
        }
      }
    }
  }
}
```

Retry attempts: 1st (immediate), 2nd (+2s), 3rd (+4s)

### Fallback Actions

Define fallback on failure:

```json
{
  "figma": {
    "enabled": true,
    "action": "extractDesignTokens",
    "fallback": "useDefaultBrandTokens"
  }
}
```

### Error Propagation

Control how errors propagate:

```json
{
  "mcp": {
    "workflow": "generate-partnership-pdf",
    "continueOnError": false,  // Stop on first error
    "servers": {
      "dalle": {
        "enabled": true,
        "action": "generateHeroImage",
        "optional": true  // Don't fail workflow if this fails
      }
    }
  }
}
```

---

## Best Practices

### 1. Enable Only Needed Servers

Disable unused servers to speed up execution:

```json
{
  "mcp": {
    "servers": {
      "figma": { "enabled": false },  // Not needed
      "dalle": { "enabled": false },  // Not needed
      "indesign": { "enabled": true }
    }
  }
}
```

### 2. Set Appropriate Timeouts

Configure realistic timeouts:

```json
{
  "figma": { "timeout_ms": 5000 },    // Fast API call
  "dalle": { "timeout_ms": 30000 },   // Image generation
  "indesign": { "timeout_ms": 120000 } // PDF creation
}
```

### 3. Use Context Passing

Share data between steps:

```json
{
  "mcp": {
    "contextPassing": {
      "figma.colors": "indesign.brandColors",
      "dalle.images[0].url": "indesign.heroImage"
    }
  }
}
```

### 4. Monitor Costs

Track API costs:

```json
{
  "dalle": {
    "config": {
      "max_cost_usd": 1.00,
      "alert_on_high_cost": true
    }
  }
}
```

### 5. Test Locally First

Test each server independently before full workflow:

```bash
# Test Figma
node scripts/test-figma-flow.js

# Test DALL-E
node scripts/test-dalle-flow.js

# Test full workflow
node orchestrator.js example-jobs/test-mcp-flow.json
```

---

## Next Steps

1. **Try basic flow** - Start with InDesign-only flow
2. **Add Figma** - Extract brand tokens automatically
3. **Add DALL-E** - Generate AI images
4. **Add QA** - Automate validation with Playwright
5. **Add GitHub** - Auto-commit results

---

## Related Documentation

- [Phase 6 Guide](./PHASE-6-GUIDE.md) - Complete Phase 6 overview
- [QA Profile Guide](./QAPROFILE-GUIDE.md) - Config-driven validation
- [Experiment Mode Guide](./EXPERIMENT-MODE-GUIDE.md) - A/B testing
- [Migration Guide](./MIGRATION-TO-PHASE-6.md) - Upgrade from Phase 5

---

**Last Updated**: 2025-11-13
**Version**: Phase 6.0
**Status**: Production-ready
