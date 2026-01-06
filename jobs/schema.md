# Autopilot Job Spec Schema

**Version**: 1.0.0
**Purpose**: Human-friendly YAML/JSON format for creating partnership documents via AI autopilot

---

## Overview

The autopilot job spec is a **simple, high-level format** that lets you describe what document you want without worrying about pipeline internals. Claude (the AI) reads your spec and handles:

- Content planning (using RAG + partner profiles)
- Narrative generation (LLM-powered)
- Layout optimization
- Full world-class validation
- Executive summary report

---

## Required Fields

### `job_id` (string)
Unique identifier for this job.

**Example**: `"aws-tfu-2025"`

**Used for**: Output filenames, job config naming, report paths

---

### `partner_profile_id` (string)
ID of the partner profile to use for personalization.

**Example**: `"aws-cloud"`

**Location**: Must exist in `config/partner-profiles/{partner_profile_id}.json`

**Effect**: Determines tone, key themes, content emphasis, visual preferences

---

### `title` (string)
Document title (appears on cover)

**Example**: `"AWS x TEEI – Together for Ukraine Partnership 2025"`

---

### `objectives` (array of strings)
High-level goals for this document. Used by LLM to generate narrative.

**Example**:
```yaml
objectives:
  - "Scale cloud skills for displaced Ukrainian learners"
  - "Increase AWS certification completion and employability"
  - "Establish multi-year partnership framework"
```

**Length**: 2-5 objectives recommended

---

### `audience` (array of strings)
Who will read this document. Influences tone and content depth.

**Example**:
```yaml
audience:
  - "AWS EMEA public sector leadership"
  - "TEEI board of directors"
```

---

## Optional Fields

### `tone` (string)
Communication style. Defaults to partner profile setting if omitted.

**Options**:
- `"strategic_b2b"` (default for most partnerships)
- `"community_impact"`
- `"technical_detailed"`
- `"executive_summary"`

---

### `primary_language` (string)
Main language for the document. Default: `"en"`

**Supported**: `"en"`, `"de"`, `"uk"`, `"fr"`, `"es"`, `"pl"`

---

### `secondary_languages` (array of strings)
Generate additional translated versions. Default: `[]` (none)

**Example**:
```yaml
secondary_languages:
  - "de"
  - "uk"
```

**Effect**: Creates separate PDFs for each language

---

### `layout_prefs` (object)
Layout preferences. Defaults used if omitted.

**Fields**:
- `pages` (int): Target page count. Default: `4`
- `variant_mode` (string): `"auto"` (test multiple layouts) or `"fixed"` (use defaults). Default: `"auto"`

**Example**:
```yaml
layout_prefs:
  pages: 4
  variant_mode: "auto"
```

---

### `content_inputs` (object)
Pointers to existing content assets and inline notes.

**Fields**:
- `deliverables` (array): Paths to markdown files with past partnership content
- `metrics_file` (string): Path to JSON file with metrics data
- `notes` (array): Inline guidance for content generation

**Example**:
```yaml
content_inputs:
  deliverables:
    - "deliverables/TEEI-AWS-Partnership-Document-Content.md"
  metrics_file: "data/partnership-aws-example.json"
  notes:
    - "Highlight employability outcomes and mentorship"
    - "Emphasize Europe/Ukraine narrative"
    - "Mention AWS Academy partnership expansion"
```

**Defaults**: Uses RAG knowledge base if deliverables omitted

---

### `qa_prefs` (object)
Quality assurance thresholds. Defaults used if omitted.

**Fields**:
- `min_score_layer1` (int): Minimum TFU compliance score. Default: `145`
- `min_ai_tier1` (float): Minimum AI Tier 1 score (0-1). Default: `0.90`
- `min_gemini` (float): Minimum Gemini Vision score (0-1). Default: `0.92`
- `accessibility_required` (bool): Require WCAG 2.1 AA. Default: `false`

**Example**:
```yaml
qa_prefs:
  min_score_layer1: 145
  min_ai_tier1: 0.90
  min_gemini: 0.92
  accessibility_required: true
```

---

## Default Behavior

When fields are omitted, autopilot uses intelligent defaults:

| Field | Default | Source |
|-------|---------|--------|
| `tone` | From partner profile | `partner_profiles/{id}.json` |
| `primary_language` | `"en"` | - |
| `secondary_languages` | `[]` (none) | - |
| `layout_prefs.pages` | `4` | TFU standard |
| `layout_prefs.variant_mode` | `"auto"` | Test 3-5 variants |
| `content_inputs.deliverables` | RAG search | All `deliverables/*.md` |
| `content_inputs.notes` | `[]` | - |
| `qa_prefs.*` | Standard thresholds | See table above |

---

## Mapping to Pipeline Config

The autopilot translates your simple spec into a full pipeline job config:

| Job Spec Field | Pipeline Config Location |
|----------------|--------------------------|
| `job_id` | `name`, output filenames |
| `partner_profile_id` | `planning.partner_profile_id` |
| `title` | `data.title` |
| `objectives` | Used by LLM for narrative (not directly in config) |
| `audience` | Used by LLM for tone (not directly in config) |
| `tone` | Influences `planning.partner_profile_id` tone setting |
| `primary_language` | `i18n.target_language` |
| `secondary_languages` | Additional pipeline runs |
| `layout_prefs.pages` | `tfu_requirements.page_count` |
| `layout_prefs.variant_mode` | `generation.layoutIteration.enabled` |
| `content_inputs.deliverables` | `planning.rag.sources` |
| `content_inputs.metrics_file` | Loaded and merged into `data` |
| `content_inputs.notes` | Passed to LLM as additional context |
| `qa_prefs.*` | `quality.*`, `validation.*` thresholds |

---

## Example: Complete Job Spec

```yaml
# AWS x TEEI Partnership Document - 2025
job_id: aws-tfu-2025

# Partner configuration
partner_profile_id: aws-cloud

# Document metadata
title: "AWS x TEEI – Together for Ukraine Partnership 2025"

# High-level goals (used by LLM)
objectives:
  - "Scale cloud skills for displaced Ukrainian learners"
  - "Increase AWS certification completion and employability"
  - "Establish multi-year partnership framework"

# Target audience (influences tone)
audience:
  - "AWS EMEA public sector leadership"
  - "TEEI board of directors"

# Communication style
tone: "strategic_b2b"

# Languages
primary_language: "en"
secondary_languages:
  - "de"

# Layout preferences
layout_prefs:
  pages: 4
  variant_mode: "auto"

# Content sources
content_inputs:
  deliverables:
    - "deliverables/TEEI-AWS-Partnership-Document-Content.md"
  metrics_file: "data/partnership-aws-example.json"
  notes:
    - "Highlight employability outcomes and mentorship"
    - "Emphasize Europe/Ukraine narrative"
    - "Include specific AWS Academy partnership details"

# Quality thresholds
qa_prefs:
  min_score_layer1: 145
  min_ai_tier1: 0.90
  min_gemini: 0.92
  accessibility_required: true
```

---

## Minimal Example

```yaml
job_id: aws-tfu-simple
partner_profile_id: aws-cloud
title: "AWS Partnership Overview"
objectives:
  - "Showcase cloud training impact"
audience:
  - "AWS partnership team"
```

**Result**: Autopilot uses all defaults for layout, QA, languages, etc.

---

## Usage

```bash
# Run autopilot with your job spec
python autopilot.py jobs/aws-tfu-2025.yaml

# Output:
# - example-jobs/autopilot-aws-tfu-2025.json (generated pipeline config)
# - exports/aws-tfu-2025-content.json (LLM-generated content)
# - exports/TEEI-AWS-TFU-2025-DIGITAL.pdf
# - exports/TEEI-AWS-TFU-2025-PRINT.pdf
# - exports/accessibility/TEEI-AWS-TFU-2025-ACCESSIBLE.pdf
# - reports/autopilot/aws-tfu-2025-EXECUTIVE-REPORT.md (AI summary)
```

---

## Validation

Required fields must be present:
- `job_id`
- `partner_profile_id`
- `title`
- `objectives` (at least 1)
- `audience` (at least 1)

Partner profile must exist:
- `config/partner-profiles/{partner_profile_id}.json`

Optional fields use sensible defaults if omitted.

---

## LLM Integration

When `llm.provider="anthropic"` in global config:

1. **Content Planning**: LLM synthesizes RAG results into document outline
2. **Narrative Generation**: LLM writes custom intro, program descriptions, CTA
3. **Translation**: LLM translates to secondary languages
4. **Executive Report**: LLM analyzes QA results and writes human-friendly summary

When `llm.provider="none"`:
- Uses template-based content
- Uses stub translations
- Skips executive report (or uses deterministic summary)

---

## Next Steps

- See example: `jobs/aws-tfu-2025.yaml`
- Run autopilot: `python autopilot.py jobs/aws-tfu-2025.yaml`
- Read report: `reports/autopilot/{job_id}-EXECUTIVE-REPORT.md`

---

**Last Updated**: 2025-11-15
