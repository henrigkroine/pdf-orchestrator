# Autopilot Mode - Complete Guide

**Version**: 1.0.0
**Last Updated**: 2025-11-15

---

## Overview

**Autopilot Mode** transforms the PDF Orchestrator from an "operator-driven, config-heavy" system into an **intelligent, single-entry AI assistant** that feels like "asking Claude to make the doc."

### Before Autopilot

```bash
# 1. Write complex 300-line JSON job config
vim example-jobs/tfu-aws-partnership-v2.json

# 2. Run content planning
python execute_tfu_aws_v2.py

# 3. Run world-class pipeline
python pipeline.py --world-class --job-config example-jobs/...

# 4. Review 5 different QA reports manually
# 5. Write executive summary yourself
```

**Problem**: Config-heavy, operator-driven, 15+ steps

---

### After Autopilot

```bash
# 1. Write simple 30-line YAML job spec
vim jobs/aws-tfu-2025.yaml

# 2. Run autopilot
python autopilot.py jobs/aws-tfu-2025.yaml
```

**Result**: Claude plans, generates, validates, and explains everything in one shot.

---

## Quick Start

### Step 1: Create Job Spec

Create `jobs/my-partnership.yaml`:

```yaml
job_id: my-partnership-2025
partner_profile_id: aws-cloud
title: "My Partnership Document"
objectives:
  - "Showcase program impact"
  - "Establish long-term partnership"
audience:
  - "Partner leadership team"
```

### Step 2: Run Autopilot

```bash
python autopilot.py jobs/my-partnership.yaml
```

### Step 3: Review Outputs

```
Outputs:
├── example-jobs/autopilot-my-partnership-2025.json  # Generated pipeline config
├── exports/my-partnership-2025-content.json         # LLM-generated content
├── exports/TEEI-MY-PARTNERSHIP-2025-DIGITAL.pdf     # Final PDF
└── reports/autopilot/my-partnership-2025-EXECUTIVE-REPORT.md  # AI summary
```

---

## What Autopilot Does

### 1. Parses Job Spec (Step 1/7)

- Reads YAML/JSON job spec
- Validates required fields
- Applies intelligent defaults
- Loads partner profile

**Input**: `jobs/aws-tfu-2025.yaml`

**Output**: Validated job spec object

---

### 2. Builds Document Plan (Step 2/7)

**Uses:**
- RAGContentEngine (with LLM answer synthesis)
- PartnerProfileRegistry
- PerformanceTracker

**Creates:**
- Document outline (LLM-generated based on objectives)
- Content strategy (from partner profile themes)
- Performance recommendations (from historical data)

**LLM Prompt**:
> "Create a document outline for a TEEI partnership with AWS.
> Objectives: [from spec]
> Audience: [from spec]
> Relevant context from past partnerships: [RAG results]"

**Output**: Document plan with sections and strategy

---

### 3. Generates Pipeline Config (Step 3/7)

Translates simple job spec → complete pipeline config:

```yaml
# Job spec (simple)
layout_prefs:
  pages: 4
  variant_mode: "auto"
```

↓

```json
// Pipeline config (detailed)
{
  "generation": {
    "layoutIteration": {
      "enabled": true,
      "num_variations": 5,
      "variation_strategies": ["spacing", "emphasis", "color_balance"]
    }
  },
  "tfu_requirements": {
    "page_count": 4
  }
}
```

**Output**: `example-jobs/autopilot-{job_id}.json`

---

### 4. Generates Content (Step 4/7)

**Uses:**
- ContentPersonalizer (LLM-enhanced)
- MultilingualGenerator (LLM translation)
- RAGContentEngine (context)

**LLM Prompts:**
- Intro: "Write a 2-3 sentence introduction for TEEI x AWS partnership..."
- Programs: "Describe cloud training programs emphasizing [key themes]..."
- CTA: "Create compelling call-to-action for [audience]..."

**Output**: `exports/{job_id}-content.json`

---

### 5. Runs World-Class Pipeline (Step 5/7)

Executes full validation pipeline:
- Smart Generation (L0)
- TFU Compliance (L1)
- Gemini Vision (L3.5)
- AI Tier 1 (L4)
- Human Expert (L5)

**Output**: PDFs + QA summaries

---

### 6. Collects Outputs (Step 6/7)

Gathers all artifacts:
- PDF paths (digital, print, accessible)
- QA scores (L1, AI, Gemini, L5)
- Validation reports

---

### 7. Generates Executive Report (Step 7/7)

**Uses**: LLMClient to analyze results and create human-friendly report

**LLM Prompt**:
> "Create an executive summary for this partnership document.
> Quality Scores: L1=148/150, AI=0.93, Gemini=0.94
> Objectives: [from spec]
> Audience: [from spec]
> Write 2-page report covering: summary, strengths, assessment, recommendations, next steps."

**Output**: `reports/autopilot/{job_id}-EXECUTIVE-REPORT.md`

---

## Job Spec Format

See `jobs/schema.md` for complete specification.

### Required Fields

```yaml
job_id: unique-identifier
partner_profile_id: aws-cloud  # Must exist in config/partner-profiles/
title: "Document Title"
objectives:  # 2-5 objectives
  - "First objective"
  - "Second objective"
audience:  # 1+ audience groups
  - "Target audience"
```

### Optional Fields with Smart Defaults

```yaml
tone: "strategic_b2b"  # Default from partner profile
primary_language: "en"  # Default: English
secondary_languages: []  # Default: none

layout_prefs:
  pages: 4  # Default: TFU standard
  variant_mode: "auto"  # Default: test variants

content_inputs:
  deliverables: []  # Default: use RAG knowledge base
  metrics_file: null  # Default: none
  notes: []  # Default: none

qa_prefs:
  min_score_layer1: 145  # TFU compliance threshold
  min_ai_tier1: 0.90  # AI validation threshold
  min_gemini: 0.92  # Visual quality threshold
  accessibility_required: false  # Generate accessible version
```

---

## LLM Integration

### LLM-Powered Features

When `llm.provider="anthropic"` (and ANTHROPIC_API_KEY set):

1. **Document Planning**
   - LLM creates structured outline from objectives
   - Uses RAG context for relevant suggestions

2. **Content Generation**
   - LLM writes custom intro narratives
   - LLM personalizes program descriptions
   - LLM creates compelling CTAs

3. **Translation**
   - Real LLM translation to DE, UK, FR, ES, PL
   - Maintains tone and technical accuracy

4. **Executive Report**
   - LLM analyzes QA scores
   - LLM writes actionable recommendations
   - LLM explains strengths and improvements

### Offline Mode

When `llm.provider="none"` (default):

1. **Document Planning**: Deterministic 4-section outline
2. **Content Generation**: Template-based personalization
3. **Translation**: Stub phrase lookup
4. **Executive Report**: Simple summary with scores

**Everything still works** - just uses deterministic logic instead of AI generation.

---

## Usage Examples

### Example 1: Minimal Spec

```yaml
job_id: quick-demo
partner_profile_id: aws-cloud
title: "AWS Partnership"
objectives:
  - "Show impact"
audience:
  - "AWS team"
```

```bash
python autopilot.py jobs/quick-demo.yaml
```

**Result**: Uses all defaults, generates basic 4-page document

---

### Example 2: Full Spec with LLM

```yaml
job_id: aws-showcase-2025
partner_profile_id: aws-cloud
title: "Building Europe's Cloud-Native Workforce"
objectives:
  - "Scale cloud skills for Ukrainian refugees"
  - "Increase AWS certification rates"
  - "Establish multi-year partnership"
audience:
  - "AWS EMEA leadership"
  - "TEEI board"
tone: "strategic_b2b_professional"
primary_language: "en"
secondary_languages:
  - "de"
layout_prefs:
  variant_mode: "auto"
content_inputs:
  deliverables:
    - "deliverables/TEEI-AWS-Partnership-Document-Content.md"
  metrics_file: "data/partnership-aws-metrics.json"
  notes:
    - "Highlight 78% employment rate"
    - "Emphasize mentorship program"
qa_prefs:
  min_score_layer1: 145
  accessibility_required: true
```

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python autopilot.py jobs/aws-showcase-2025.yaml --llm anthropic
```

**Result**: LLM-generated content, German translation, A11y version, AI executive report

---

### Example 3: Test Mode

```bash
# Quick test with minimal spec
python scripts/test-autopilot.py

# Or manually with demo spec
python autopilot.py jobs/aws-tfu-demo.yaml
```

---

## CLI Reference

```bash
python autopilot.py <job_spec> [options]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `job_spec` | Yes | Path to YAML/JSON job specification |

### Options

| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `--llm` | `anthropic`, `none` | `none` | LLM provider |
| `--verbose` | flag | `True` | Print detailed progress |
| `--quiet` | flag | `False` | Suppress all output |

### Examples

```bash
# Default (offline mode)
python autopilot.py jobs/my-doc.yaml

# LLM mode (requires ANTHROPIC_API_KEY)
export ANTHROPIC_API_KEY=sk-ant-...
python autopilot.py jobs/my-doc.yaml --llm anthropic

# Quiet mode
python autopilot.py jobs/my-doc.yaml --quiet
```

---

## Outputs

### Generated Files

```
example-jobs/
└── autopilot-{job_id}.json          # Full pipeline config

exports/
├── {job_id}-content.json            # LLM-generated content
├── TEEI-{JOB_ID}-DIGITAL.pdf        # Digital version (RGB, 150 DPI)
├── TEEI-{JOB_ID}-PRINT.pdf          # Print version (CMYK, 300 DPI)
└── accessibility/
    └── TEEI-{JOB_ID}-ACCESSIBLE.pdf # WCAG 2.1 AA compliant

reports/
└── autopilot/
    └── {job_id}-EXECUTIVE-REPORT.md # AI-generated analysis
```

### Console Output

```
======================================================================
AUTOPILOT - AI-Powered Document Generation
======================================================================

LLM Provider: anthropic
Model: claude-3-5-sonnet-20241022
Available: True

[1/7] Parsing job spec: jobs/aws-tfu-2025.yaml
[2/7] Building document plan...
  ✓ Plan complete: 4 sections
[3/7] Generating pipeline job config...
  ✓ Generated job config: example-jobs/autopilot-aws-tfu-2025.json
[4/7] Generating document content...
  ✓ Generated content: exports/aws-tfu-2025-content.json
[5/7] Running world-class pipeline...
  ✓ Pipeline complete: PASS
[6/7] Collecting outputs...
[7/7] Generating executive report...
  ✓ Executive report: reports/autopilot/aws-tfu-2025-EXECUTIVE-REPORT.md

======================================================================
✓ AUTOPILOT COMPLETE
======================================================================

Job ID: aws-tfu-2025

📄 Outputs:
  Job Config : example-jobs/autopilot-aws-tfu-2025.json
  Content    : exports/aws-tfu-2025-content.json
  PDF        : exports/TEEI-AWS-TFU-2025-DIGITAL.pdf
  Report     : reports/autopilot/aws-tfu-2025-EXECUTIVE-REPORT.md

Next steps:
  1. Review executive report: reports/autopilot/aws-tfu-2025-EXECUTIVE-REPORT.md
  2. Check PDF outputs in exports/
  3. Share with stakeholders
```

---

## Troubleshooting

### Issue: Partner Profile Not Found

**Error**: `ValueError: Partner profile not found: xyz`

**Solution**:
```bash
# List available profiles
python services/partner_profiles.py

# Create new profile
cp config/partner-profiles/aws-cloud.json config/partner-profiles/xyz.json
vim config/partner-profiles/xyz.json
```

---

### Issue: LLM Not Available

**Symptom**: Using offline mode even with `--llm anthropic`

**Solutions**:
1. Check API key: `echo $ANTHROPIC_API_KEY`
2. Set API key: `export ANTHROPIC_API_KEY=sk-ant-...`
3. Verify key: `python scripts/test-llm-client.py`

---

### Issue: Metrics File Not Found

**Error**: `FileNotFoundError: data/metrics.json`

**Solution**:
```bash
# Create metrics file
echo '{"students": "1000", "employment_rate": "75%"}' > data/metrics.json

# Or remove from job spec
# Delete: metrics_file: "data/metrics.json"
```

---

### Issue: Missing Required Fields

**Error**: `ValueError: Missing required field: objectives`

**Solution**: Add all required fields to job spec:
- `job_id`
- `partner_profile_id`
- `title`
- `objectives` (array, at least 1)
- `audience` (array, at least 1)

---

## Best Practices

### 1. Start Simple

```yaml
# Minimal viable spec
job_id: test-doc
partner_profile_id: aws-cloud
title: "Test Document"
objectives:
  - "Test autopilot"
audience:
  - "Me"
```

Then iterate and add optional fields.

---

### 2. Use Clear Objectives

**Good**:
```yaml
objectives:
  - "Increase AWS certification completion from 60% to 90%"
  - "Establish 3-year partnership framework with annual review"
```

**Bad**:
```yaml
objectives:
  - "Make partnership better"
  - "Do good stuff"
```

**Why**: LLM uses objectives to generate narrative. Be specific.

---

### 3. Provide Context in Notes

```yaml
content_inputs:
  notes:
    - "Highlight 78% employment rate (key differentiator)"
    - "Mention AWS Academy expansion to 5 new countries"
    - "Include testimonial from Ukrainian student success story"
```

**Result**: LLM incorporates these points into narrative.

---

### 4. Test Before LLM Mode

```bash
# First run offline (fast, free)
python autopilot.py jobs/my-doc.yaml

# If output looks good, enable LLM for better quality
export ANTHROPIC_API_KEY=sk-ant-...
python autopilot.py jobs/my-doc.yaml --llm anthropic
```

---

### 5. Review Executive Report First

Always check the AI-generated report before sharing PDFs:

```bash
cat reports/autopilot/{job_id}-EXECUTIVE-REPORT.md
```

Look for:
- Quality scores (all above thresholds?)
- Recommendations (any concerns?)
- Strengths (what to highlight when sharing)

---

## Integration with Existing Workflow

### Autopilot vs Manual Pipeline

**Use Autopilot when**:
- Creating new partnership documents
- Need quick iteration on content
- Want AI assistance with planning
- Prefer simple YAML over complex JSON

**Use Manual Pipeline when**:
- Need fine-grained control over every setting
- Working on experimental layouts
- Debugging specific validation issues
- Already have complete job config JSON

### Hybrid Workflow

```bash
# 1. Generate base config with autopilot
python autopilot.py jobs/base-spec.yaml

# 2. Manually refine generated config
vim example-jobs/autopilot-base-spec.json

# 3. Run pipeline with refined config
python pipeline.py --world-class --job-config example-jobs/autopilot-base-spec.json
```

---

## Next Steps

- **Try it**: `python autopilot.py jobs/aws-tfu-demo.yaml`
- **Read spec format**: `jobs/schema.md`
- **Create custom profile**: Copy `config/partner-profiles/aws-cloud.json`
- **Enable LLM**: `export ANTHROPIC_API_KEY=sk-ant-...`
- **Review reports**: Check `reports/autopilot/`

---

## Related Documentation

- **Job Spec Format**: `jobs/schema.md`
- **LLM Integration**: `LLM-UPGRADE-COMPLETE.md`
- **RAG & Personalization**: `RAG-PERSONALIZATION-GUIDE.md`
- **Layout Iteration**: `LAYOUT-ITERATION-GUIDE.md`
- **AI Implementation**: `AI-IMPLEMENTATION-COMPLETE.md`

---

**Questions or Issues?** Run test: `python scripts/test-autopilot.py`

---

**Last Updated**: 2025-11-15
**Status**: Production Ready
