# AI Subsystem Architecture Specification

**Version:** 1.0
**Date:** 2025-11-14
**Status:** Approved for Implementation

---

## Executive Summary

This document defines the architecture for integrating Tier 1 AI features (Typography, Whitespace, Color Harmony) into the PDF Orchestrator's world-class pipeline, with scaffolding for Tier 2+ features.

**Design Principles:**
1. **Non-invasive Integration** - AI layer plugs into existing pipeline between Layer 3 and Layer 4
2. **Feature Flags** - Every AI feature can be enabled/disabled via job config
3. **Unified Schema** - All AI features produce consistent JSON output
4. **Fail Fast** - Pipeline stops if AI requirements not met (when enabled)
5. **Extensible** - Clean interfaces for adding Tier 2+ features (SmolDocling, accessibility, RAG)

---

## Directory Structure

```
pdf-orchestrator/
├── ai/
│   ├── AI-ARCHITECTURE-SPEC.md           # This file
│   │
│   ├── core/
│   │   ├── aiConfig.js                   # Configuration loader + feature flags
│   │   ├── aiRunner.js                   # Orchestrator for all AI features
│   │   └── schemas.js                    # JSON schema definitions
│   │
│   ├── features/
│   │   ├── typography/
│   │   │   ├── typographyAnalyzer.js     # Tier 1: Typography scoring
│   │   │   └── README.md                 # Feature documentation
│   │   │
│   │   ├── whitespace/
│   │   │   ├── whitespaceAnalyzer.js     # Tier 1: Whitespace optimization
│   │   │   └── README.md
│   │   │
│   │   └── color/
│   │       ├── colorHarmonyAnalyzer.js   # Tier 1: Color harmony validation
│   │       └── README.md
│   │
│   ├── future/                            # Tier 2+ scaffolding
│   │   ├── layout/                        # SmolDocling integration (Tier 2)
│   │   │   └── README.md                 # Design notes
│   │   │
│   │   ├── accessibility/                 # PDF/UA automation (Tier 2)
│   │   │   └── README.md
│   │   │
│   │   └── rag/                          # Content intelligence (Tier 3)
│   │       └── README.md
│   │
│   └── utils/
│       ├── pdfParser.js                  # Shared PDF parsing utilities
│       ├── contrastChecker.js            # WCAG contrast calculations
│       └── logger.js                     # AI-specific logging
│
├── reports/
│   └── ai/                               # AI analysis output directory
│       └── .gitkeep
│
└── example-jobs/
    └── tfu-aws-partnership-v2.json       # Extended with "ai" section
```

---

## AI Analysis Output Schema

### JSON Structure (Version 1.0)

All AI features write to a unified JSON report:

```json
{
  "version": "1.0",
  "timestamp": "2025-11-14T10:30:45.123Z",
  "jobId": "tfu_aws_partnership_v2",
  "jobConfigPath": "example-jobs/tfu-aws-partnership-v2.json",
  "pdfPath": "exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf",

  "features": {
    "typography": {
      "enabled": true,
      "weight": 0.4,
      "score": 0.92,
      "maxScore": 1.0,
      "issues": [
        {
          "id": "typo_001",
          "severity": "medium",
          "page": 3,
          "location": "program section",
          "message": "Body text leading is too tight; increase by 10-15%",
          "recommendation": "Change paragraph style 'TFU_Program_Body' leading from 13pt to 14.5pt"
        }
      ],
      "summary": "Good hierarchy with 11 distinct type sizes. Minor leading adjustment needed on page 3."
    },

    "whitespace": {
      "enabled": true,
      "weight": 0.3,
      "score": 0.88,
      "maxScore": 1.0,
      "issues": [
        {
          "id": "ws_001",
          "severity": "low",
          "page": 2,
          "location": "about section",
          "message": "Text coverage is 42% (optimal: 30-40%)",
          "recommendation": "Increase margins or reduce content density"
        }
      ],
      "summary": "Strong whitespace balance on pages 1, 3, 4. Page 2 slightly dense."
    },

    "color": {
      "enabled": true,
      "weight": 0.3,
      "score": 1.0,
      "maxScore": 1.0,
      "issues": [],
      "summary": "All colors meet WCAG AA contrast requirements. Harmonious palette."
    }
  },

  "overall": {
    "score": 0.928,
    "maxScore": 1.0,
    "normalizedScore": 0.928,
    "passed": true,
    "threshold": 0.85,
    "calculation": "typography(0.92)*0.4 + whitespace(0.88)*0.3 + color(1.0)*0.3 = 0.928"
  },

  "metadata": {
    "duration_ms": 1245,
    "features_executed": ["typography", "whitespace", "color"],
    "features_skipped": [],
    "errors": []
  }
}
```

**Output Location:**
- `reports/ai/<job-id>-ai-<timestamp>.json`
- Example: `reports/ai/tfu-aws-partnership-v2-ai-20251114_103045.json`

---

## Job Config Schema Extension

### New "ai" Section in Job Configs

Add to `example-jobs/tfu-aws-partnership-v2.json`:

```json
{
  "name": "TFU AWS Partnership V2 - World-Class",

  // ... existing config ...

  "ai": {
    "enabled": true,
    "dryRun": false,

    "features": {
      "typography": {
        "enabled": true,
        "weight": 0.4,
        "minScore": 0.85
      },
      "whitespace": {
        "enabled": true,
        "weight": 0.3,
        "minScore": 0.80
      },
      "color": {
        "enabled": true,
        "weight": 0.3,
        "minScore": 0.90
      }
    },

    "thresholds": {
      "minNormalizedScore": 0.85,
      "failOnCriticalIssues": true
    },

    "output": {
      "reportDir": "reports/ai",
      "includeInLayer1Score": true,
      "layer1Points": 10
    },

    "future": {
      "layout": { "enabled": false },
      "accessibility": { "enabled": false },
      "rag": { "enabled": false }
    }
  }
}
```

**Configuration Keys:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ai.enabled` | boolean | false | Master switch for AI subsystem |
| `ai.dryRun` | boolean | false | Run AI but don't fail pipeline |
| `ai.features.*.enabled` | boolean | false | Enable/disable individual features |
| `ai.features.*.weight` | float | 0.33 | Weight in overall score calculation |
| `ai.features.*.minScore` | float | 0.80 | Minimum acceptable score for this feature |
| `ai.thresholds.minNormalizedScore` | float | 0.85 | Overall AI score threshold for PASS |
| `ai.thresholds.failOnCriticalIssues` | boolean | true | Fail if any "critical" severity issue found |
| `ai.output.includeInLayer1Score` | boolean | true | Add AI score to validate_document.py rubric |
| `ai.output.layer1Points` | int | 10 | How many points to allocate in Layer 1 (out of 150) |

---

## Pipeline Integration Points

### Current Pipeline (4 Layers)

```
Step 0: Generation (MCP test, V2 generator, PDF export)
  ↓
Layer 1: Content & Design Validation (validate_document.py)
  ↓
Layer 2: PDF Quality Checks (validate-pdf-quality.js)
  ↓
Layer 3: Visual Regression Testing (compare-pdf-visual.js)
  ↓
Layer 4: AI Design Critique (gemini-vision-review.js)
  ↓
Final Summary
```

### Enhanced Pipeline (4+1 Layers)

```
Step 0: Generation (MCP test, V2 generator, PDF export)
  ↓
Layer 1: Content & Design Validation (validate_document.py)
  │        ↓ (reads AI report for AI_Design_Quality subscore)
  ↓
Layer 2: PDF Quality Checks (validate-pdf-quality.js)
  ↓
Layer 3: Visual Regression Testing (compare-pdf-visual.js)
  ↓
Layer 3.5: AI Design Analysis (ai/core/aiRunner.js) ← NEW!
  │         - Typography scoring
  │         - Whitespace optimization
  │         - Color harmony validation
  │         - Writes reports/ai/<job-id>-ai-<timestamp>.json
  ↓
Layer 4: AI Design Critique (gemini-vision-review.js)
  ↓
Final Summary
```

**Execution Order:**

1. **Pipeline runs Layer 1 (validate_document.py) FIRST**
   - If `ai.output.includeInLayer1Score = true`, validate_document.py attempts to load existing AI report
   - If AI report doesn't exist yet, skips AI subscore (backward compatible)

2. **Pipeline runs Layers 2-3 normally**

3. **Pipeline invokes Layer 3.5 (aiRunner.js)**
   - Generates AI report
   - Checks thresholds
   - Exits with non-zero code if below minNormalizedScore (unless dryRun=true)

4. **Pipeline runs Layer 4 (Gemini Vision)**

5. **Pipeline re-runs Layer 1 scoring (optional enhancement)**
   - If `ai.output.includeInLayer1Score = true`, validate_document.py can be re-run to pick up AI subscore
   - OR Layer 1 score is adjusted post-hoc by pipeline.py

**Decision: For simplicity, AI report is consumed by Layer 1 on NEXT validation run, not current run. This avoids circular dependencies.**

---

## Integration with validate_document.py

### New AI_Design_Quality Subscore (10 points)

When `ai.output.includeInLayer1Score = true` in job config:

```python
# In validate_document.py

def score_ai_design_quality(self, ai_report_path, max_points=10):
    """
    Scores AI design quality based on AI report JSON

    Args:
        ai_report_path: Path to AI JSON report
        max_points: Maximum points to award (default: 10)

    Returns:
        dict with points, max_points, details
    """
    if not os.path.exists(ai_report_path):
        return {
            "points": 0,
            "max_points": max_points,
            "status": "SKIP",
            "details": "AI report not found (AI layer not run yet)"
        }

    try:
        with open(ai_report_path, 'r', encoding='utf-8') as f:
            ai_report = json.load(f)

        overall = ai_report.get("overall", {})
        normalized_score = overall.get("normalizedScore", 0.0)

        # Convert 0-1 score to 0-max_points
        ai_points = round(normalized_score * max_points, 1)

        return {
            "points": ai_points,
            "max_points": max_points,
            "status": "PASS" if normalized_score >= 0.85 else "WARN",
            "details": f"Typography: {ai_report['features']['typography']['score']:.2f}, "
                      f"Whitespace: {ai_report['features']['whitespace']['score']:.2f}, "
                      f"Color: {ai_report['features']['color']['score']:.2f}"
        }
    except Exception as e:
        return {
            "points": 0,
            "max_points": max_points,
            "status": "ERROR",
            "details": f"Failed to parse AI report: {e}"
        }
```

**Modified Rubric (150 → 160 points total):**

```
Original Categories (150 points):
  - TFU Compliance (20 pts)
  - Typography Design (20 pts)
  - Content Quality (30 pts)
  - Visual Hierarchy (20 pts)
  - Color Usage (15 pts)
  - Technical Quality (15 pts)
  - Documentation (10 pts)
  - Metrics & Data (20 pts)

NEW Category (10 pts):
  + AI Design Quality (10 pts)
    - Based on ai/core/aiRunner.js output
    - Typography, Whitespace, Color harmony scores

TOTAL: 160 points
```

**Threshold Adjustment:**
- Old threshold: 145/150 (96.7%)
- New threshold: 155/160 (96.9%) to maintain similar bar

---

## API: aiRunner.js Interface

### Command-Line Interface

```bash
node ai/core/aiRunner.js \
  --job-config example-jobs/tfu-aws-partnership-v2.json \
  --output reports/ai/tfu-aws-partnership-v2-ai-20251114_103045.json
```

**Exit Codes:**
- `0` = AI analysis passed (score >= minNormalizedScore)
- `1` = AI analysis failed (score < minNormalizedScore OR critical issues found)
- `3` = Infrastructure error (missing PDF, malformed config, feature crash)

### Programmatic Interface (Node.js)

```javascript
// In pipeline.py or other Node.js code
const { runAIAnalysis } = require('./ai/core/aiRunner.js');

const result = await runAIAnalysis({
  jobConfigPath: 'example-jobs/tfu-aws-partnership-v2.json',
  outputPath: 'reports/ai/tfu-aws-partnership-v2-ai-20251114_103045.json'
});

console.log(result.overall.normalizedScore);  // 0.928
console.log(result.overall.passed);            // true
```

### Python Subprocess Interface

```python
# In pipeline.py
import subprocess
import json

def run_ai_layer(job_config_path: str) -> dict:
    """Execute Layer 3.5: AI Design Analysis"""

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = f"reports/ai/tfu-aws-partnership-v2-ai-{timestamp}.json"

    cmd = [
        "node", "ai/core/aiRunner.js",
        "--job-config", job_config_path,
        "--output", output_path
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

    if result.returncode == 3:
        raise RuntimeError(f"AI infrastructure error: {result.stderr}")

    # Load results
    with open(output_path, 'r', encoding='utf-8') as f:
        ai_report = json.load(f)

    return {
        "passed": result.returncode == 0,
        "score": ai_report["overall"]["normalizedScore"],
        "report_path": output_path
    }
```

---

## Feature Implementation Contracts

### typographyAnalyzer.js

**Input:**
- `pdfPath`: Path to PDF
- `typographySidecar`: Path to `exports/<filename>-typography.json`
- `jobConfig`: Full job config object

**Output:**
```javascript
{
  "enabled": true,
  "weight": 0.4,
  "score": 0.92,
  "maxScore": 1.0,
  "issues": [...],
  "summary": "...",
  "details": {
    "distinctStyles": 14,
    "distinctSizes": 11,
    "sizeRange": { "min": 9, "max": 60 },
    "hierarchyLevels": ["cover_title", "section_heading", ...]
  }
}
```

**Logic:**
1. Load typography sidecar JSON
2. Count distinct paragraph styles
3. Count distinct font sizes
4. Validate against `tfu_requirements.typography_requirements.min_type_sizes`
5. Check for hierarchy (at least 5 levels: cover, H1, H2, body, caption)
6. Penalize outliers (random 7pt text, excessive micro-variations)
7. Compute score 0-1

---

### whitespaceAnalyzer.js

**Input:**
- `pdfPath`: Path to PDF
- `jobConfig`: Full job config object

**Output:**
```javascript
{
  "enabled": true,
  "weight": 0.3,
  "score": 0.88,
  "maxScore": 1.0,
  "issues": [...],
  "summary": "...",
  "details": {
    "pageAnalysis": [
      {
        "page": 1,
        "textCoverage": 0.15,
        "textBlocks": 3,
        "rating": "optimal"
      },
      {
        "page": 2,
        "textCoverage": 0.42,
        "textBlocks": 12,
        "rating": "slightly_dense"
      }
    ]
  }
}
```

**Logic:**
1. Parse PDF with pdf-lib or similar
2. For each page:
   - Compute text coverage % (bounding boxes / page area)
   - Count text blocks
3. Apply heuristics:
   - Cover page: optimal 10-20% coverage
   - Content pages: optimal 30-40% coverage
   - CTA page: optimal 20-30% coverage
4. Penalize pages outside optimal ranges
5. Compute score 0-1

---

### colorHarmonyAnalyzer.js

**Input:**
- `pdfPath`: Path to PDF
- `jobConfig`: Full job config object (includes `tfu_requirements.primary_color`, `forbidden_colors`)

**Output:**
```javascript
{
  "enabled": true,
  "weight": 0.3,
  "score": 1.0,
  "maxScore": 1.0,
  "issues": [],
  "summary": "...",
  "details": {
    "colorsUsed": ["#00393F", "#FFFFFF", "#C9E4EC", ...],
    "contrastRatios": [
      { "fg": "#FFFFFF", "bg": "#00393F", "ratio": 14.2, "wcagLevel": "AAA" }
    ],
    "forbiddenColors": []
  }
}
```

**Logic:**
1. Extract colors from PDF (fills, text colors)
2. Check against brand palette (`tfu_requirements.primary_color`, `forbidden_colors`)
3. Compute WCAG contrast ratios for all text/background pairs
4. Identify violations:
   - Use of forbidden colors (e.g., gold #BA8F5A)
   - Contrast < 4.5:1 for body text
   - Contrast < 3:1 for large text
5. Compute score 0-1 (deduct for violations)

---

## Future Tier 2+ Scaffolding

### ai/future/layout/README.md

```markdown
# Layout Analysis (Tier 2 - SmolDocling Integration)

**Status:** Planned for Month 1-2

**Purpose:** Understand document structure semantically using SmolDocling VLM

**Integration Point:** New Layer 0 (before Layer 1)

**APIs:**
- SmolDocling open-source library
- DocTags markup format

**Output Schema:**
```json
{
  "layout": {
    "enabled": true,
    "structure": { ... },
    "hierarchyDepth": 3,
    "visualElements": { ... }
  }
}
```
```

### ai/future/accessibility/README.md

```markdown
# Accessibility Automation (Tier 2 - PDF/UA)

**Status:** Planned for Month 2-3

**Purpose:** Automated WCAG 2.2 AA / PDF/UA compliance

**Integration Point:** New Layer 5 (after Layer 4)

**APIs:**
- AWS Bedrock (alt text generation)
- CommonLook PDF API
- PDFix API

**Target:** 95% compliance score, 95% time reduction
```

### ai/future/rag/README.md

```markdown
# RAG Content Intelligence (Tier 3)

**Status:** Planned for Month 4-6

**Purpose:** Learn from past partnerships, suggest proven patterns

**Integration Point:** Pre-generation phase (before Step 0)

**APIs:**
- LangChain
- Pinecone/Weaviate (vector DB)
- OpenAI embeddings

**Use Cases:**
- "Show successful CTAs from tech partnerships"
- "Suggest metrics for this industry"
```

---

## Testing Strategy

### Unit Tests

Each feature analyzer has its own test suite:

```
ai/features/typography/__tests__/typographyAnalyzer.test.js
ai/features/whitespace/__tests__/whitespaceAnalyzer.test.js
ai/features/color/__tests__/colorHarmonyAnalyzer.test.js
```

### Integration Tests

Test aiRunner orchestration:

```
ai/core/__tests__/aiRunner.test.js
```

### End-to-End Tests

Run full world-class pipeline with AI enabled:

```bash
# Test script: test-ai-pipeline.cmd
set DRY_RUN_GEMINI_VISION=1
python -B pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json
```

**Assertions:**
- AI report JSON exists at `reports/ai/tfu-aws-partnership-v2-ai-*.json`
- AI report has valid schema (version, features, overall, metadata)
- validate_document.py includes AI_Design_Quality subscore
- Final summary shows "Layer 3.5 - AI Design Tier 1: 0.XX [PASS|FAIL]"

---

## Backward Compatibility

### When ai.enabled = false

- aiRunner.js is NOT invoked
- Pipeline behaves exactly as before (4 layers)
- validate_document.py skips AI subscore (0/10 points, marked as SKIP)
- No AI reports generated

### When ai.enabled = true, ai.dryRun = true

- aiRunner.js runs and generates report
- But exits with code 0 regardless of score
- Pipeline does NOT fail based on AI results
- Useful for testing and iteration

---

## Deployment Checklist

### Phase 1: Bootstrap (Agent 2)

- [ ] Create ai/ directory structure
- [ ] Implement ai/core/aiConfig.js
- [ ] Implement ai/core/aiRunner.js
- [ ] Implement ai/features/typography/typographyAnalyzer.js
- [ ] Implement ai/features/whitespace/whitespaceAnalyzer.js
- [ ] Implement ai/features/color/colorHarmonyAnalyzer.js
- [ ] Create ai/utils/pdfParser.js, contrastChecker.js
- [ ] Update example-jobs/tfu-aws-partnership-v2.json with "ai" section

### Phase 2: Pipeline Integration (Agent 2)

- [ ] Modify pipeline.py:run_world_class_pipeline() to add Layer 3.5
- [ ] Add run_ai_layer() helper function
- [ ] Update final summary to show AI layer results

### Phase 3: Layer 1 Integration (Agent 3)

- [ ] Modify validate_document.py to add score_ai_design_quality()
- [ ] Update rubric: 150 → 160 points (add AI_Design_Quality 10 pts)
- [ ] Update threshold: 145 → 155
- [ ] Update report output to show AI subscore

### Phase 4: Documentation (Agent 3)

- [ ] Update AI-FEATURES-ROADMAP.md (mark Tier 1 as "Implemented")
- [ ] Update SYSTEM-OVERVIEW.md (add Layer 3.5 to QA section)
- [ ] Update GEMINI-VISION-INTEGRATION.md (explain AI vs Gemini)
- [ ] Update TFU-MIGRATION-SUMMARY.md (mention AI enhancements)
- [ ] Create AI-INTEGRATION-COMPLETE.md (final summary)

### Phase 5: Verification (Agent 3)

- [ ] Run test-ai-pipeline.cmd
- [ ] Verify AI report JSON exists and valid
- [ ] Verify Layer 1 includes AI subscore
- [ ] Verify final summary shows Layer 3.5
- [ ] Verify pipeline fails correctly when AI score < threshold

---

## Dependencies

### Node.js Packages (for AI subsystem)

```json
{
  "dependencies": {
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^3.11.174",
    "color-contrast-checker": "^2.1.0"
  }
}
```

### Python Packages (for validate_document.py integration)

Already installed:
- `pdfplumber`
- `PyPDF2`
- `PIL`

---

## Success Metrics

### Technical Metrics

- **AI Layer Execution Time:** < 5 seconds (Tier 1 features)
- **False Positive Rate:** < 10% (AI issues that aren't real problems)
- **False Negative Rate:** < 5% (Real problems AI misses)
- **Schema Compliance:** 100% (all AI reports match schema)

### Quality Metrics

- **Typography Issues Detected:** 80%+ of hierarchy problems
- **Whitespace Issues Detected:** 70%+ of density problems
- **Color Issues Detected:** 95%+ of contrast violations
- **Pipeline Pass Rate:** ~90% (for world-class documents)

### Business Metrics

- **Iteration Time Reduction:** 50% (catch issues earlier)
- **Designer Satisfaction:** 8/10+ (helpful, not annoying)
- **Client Revision Requests:** -30% (higher first-pass quality)

---

## Appendix: Example AI Report (Full)

See next section for complete sample output from a real TFU AWS V2 run.

```json
{
  "version": "1.0",
  "timestamp": "2025-11-14T10:30:45.123Z",
  "jobId": "tfu_aws_partnership_v2",
  "jobConfigPath": "example-jobs/tfu-aws-partnership-v2.json",
  "pdfPath": "exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf",

  "features": {
    "typography": {
      "enabled": true,
      "weight": 0.4,
      "score": 0.92,
      "maxScore": 1.0,
      "issues": [
        {
          "id": "typo_001",
          "severity": "medium",
          "page": 3,
          "location": "program section",
          "message": "Body text leading is too tight; increase by 10-15%",
          "recommendation": "Change 'TFU_Program_Body' leading from 13pt to 14.5pt"
        }
      ],
      "summary": "Strong hierarchy with 11 distinct type sizes. Good role differentiation. Minor leading issue on page 3.",
      "details": {
        "distinctStyles": 14,
        "distinctSizes": 11,
        "sizeRange": { "min": 9, "max": 60 },
        "hierarchyLevels": [
          "cover_title",
          "section_heading",
          "cta_heading",
          "stat_number",
          "program_name",
          "subheading",
          "body_lead",
          "body",
          "caption",
          "label",
          "fine_print"
        ],
        "styleUsage": {
          "TFU_Cover_Title": 1,
          "TFU_Section_Heading": 8,
          "TFU_Body": 45,
          "TFU_Caption": 12
        }
      }
    },

    "whitespace": {
      "enabled": true,
      "weight": 0.3,
      "score": 0.88,
      "maxScore": 1.0,
      "issues": [
        {
          "id": "ws_001",
          "severity": "low",
          "page": 2,
          "location": "about section",
          "message": "Text coverage is 42% (optimal: 30-40%)",
          "recommendation": "Increase margins or reduce content density by 10%"
        }
      ],
      "summary": "Strong whitespace balance on pages 1, 3, 4. Page 2 slightly dense but acceptable.",
      "details": {
        "pageAnalysis": [
          {
            "page": 1,
            "role": "cover",
            "textCoverage": 0.15,
            "textBlocks": 3,
            "rating": "optimal",
            "notes": "Clean, spacious cover design"
          },
          {
            "page": 2,
            "role": "about",
            "textCoverage": 0.42,
            "textBlocks": 12,
            "rating": "slightly_dense",
            "notes": "High information density, still readable"
          },
          {
            "page": 3,
            "role": "programs",
            "textCoverage": 0.35,
            "textBlocks": 18,
            "rating": "optimal",
            "notes": "Balanced grid layout"
          },
          {
            "page": 4,
            "role": "cta",
            "textCoverage": 0.25,
            "textBlocks": 5,
            "rating": "optimal",
            "notes": "Strong call-to-action hierarchy"
          }
        ],
        "overallDensity": 0.29,
        "optimalRange": [0.25, 0.40]
      }
    },

    "color": {
      "enabled": true,
      "weight": 0.3,
      "score": 1.0,
      "maxScore": 1.0,
      "issues": [],
      "summary": "Perfect color compliance. All brand colors used correctly. All text meets WCAG AA contrast.",
      "details": {
        "colorsUsed": [
          "#00393F",  // TFU Teal (primary)
          "#FFFFFF",  // White
          "#C9E4EC",  // Light blue
          "#FFD700",  // TFU badge yellow
          "#0057B8"   // TFU badge blue
        ],
        "forbiddenColorsFound": [],
        "contrastRatios": [
          {
            "foreground": "#FFFFFF",
            "background": "#00393F",
            "ratio": 14.2,
            "wcagLevel": "AAA",
            "location": "page 1, cover title"
          },
          {
            "foreground": "#00393F",
            "background": "#FFFFFF",
            "ratio": 14.2,
            "wcagLevel": "AAA",
            "location": "page 2-4, body text"
          },
          {
            "foreground": "#00393F",
            "background": "#C9E4EC",
            "ratio": 6.8,
            "wcagLevel": "AA",
            "location": "page 3, stats sidebar"
          }
        ],
        "violations": []
      }
    }
  },

  "overall": {
    "score": 0.928,
    "maxScore": 1.0,
    "normalizedScore": 0.928,
    "passed": true,
    "threshold": 0.85,
    "calculation": "typography(0.92)*0.4 + whitespace(0.88)*0.3 + color(1.0)*0.3 = 0.928",
    "grade": "A",
    "message": "Excellent AI design quality. Minor improvements possible."
  },

  "metadata": {
    "duration_ms": 1245,
    "features_executed": ["typography", "whitespace", "color"],
    "features_skipped": [],
    "errors": [],
    "environment": {
      "node_version": "v20.10.0",
      "platform": "win32",
      "aiRunnerVersion": "1.0.0"
    }
  }
}
```

---

**Status:** Architecture approved. Ready for Agent 2 implementation.
**Next:** Agent 2 implements Tier 1 features + aiRunner orchestration.
