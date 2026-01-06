# Autopilot Quick Start

**One-page reference for immediate use**

---

## Fastest Way to Create a Document

### Step 1: Create Job Spec (30 seconds)

```yaml
# Save as jobs/my-doc.yaml
job_id: my-doc-2025
partner_profile_id: aws-cloud
title: "My Partnership Document"
objectives:
  - "Showcase program impact"
  - "Establish partnership framework"
audience:
  - "Partner leadership"
```

### Step 2: Set API Key (REQUIRED)

```bash
# REQUIRED: Set your Anthropic API key
set ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Important**: Autopilot now **requires** LLM mode by default. If `ANTHROPIC_API_KEY` is not set, autopilot will exit with an error instead of falling back to offline mode.

To use offline mode, you must explicitly request it with `--llm none` (see below).

### Step 3: Run Autopilot (30-90 seconds)

```bash
# Autopilot automatically uses LLM mode (default)
python autopilot.py jobs/my-doc.yaml
```

**Result**:
- ✅ Real world-class pipeline execution (L0-L5 validation)
- 🧠 LLM-powered planning, content, and analysis
- 📄 Production-ready PDF with actual quality scores

### Step 4: Review Outputs

```bash
# Read AI-generated executive report
cat reports/autopilot/my-doc-2025-EXECUTIVE-REPORT.md

# Check PDF
explorer exports/TEEI-MY-DOC-2025-DIGITAL.pdf
```

**Done!** ✅

---

## Mode Selection

### LLM Mode (Default - REQUIRED)

Autopilot **requires LLM mode by default**. You must have `ANTHROPIC_API_KEY` set:

```bash
# Set key once
set ANTHROPIC_API_KEY=sk-ant-your-key

# Run autopilot (uses LLM automatically)
python autopilot.py jobs/my-doc.yaml
```

**If API key is missing**: Autopilot will **exit with an error** instead of falling back to offline mode.

**Benefits**: Claude plans structure, writes custom narratives, translates, analyzes quality

### Offline Mode (Explicit Only)

To use offline mode (deterministic templates), you must **explicitly request it**:

```bash
# Explicitly request offline mode
python autopilot.py jobs/my-doc.yaml --llm none
```

**Use when**: Testing without API costs, or API unavailable

**Important**: Offline mode is no longer a silent fallback. You must explicitly choose it with `--llm none`.

---

## Job Spec Template

```yaml
# Required fields (5 minimum)
job_id: unique-id
partner_profile_id: aws-cloud  # See config/partner-profiles/
title: "Document Title"
objectives:  # 2-5 recommended
  - "First objective"
  - "Second objective"
audience:  # 1+ target groups
  - "Who will read this"

# Optional fields (smart defaults if omitted)
tone: "strategic_b2b"  # Default from partner profile
primary_language: "en"  # Default: English
secondary_languages: []  # Default: none

layout_prefs:
  pages: 4  # Default: TFU standard
  variant_mode: "auto"  # Default: test 3-5 variants

content_inputs:
  deliverables:  # Past content for context
    - "deliverables/past-doc.md"
  metrics_file: "data/metrics.json"  # Optional
  notes:  # Inline guidance for LLM
    - "Highlight key achievement"
    - "Mention specific program"

qa_prefs:
  min_score_layer1: 145  # TFU compliance
  min_ai_tier1: 0.90  # AI validation
  min_gemini: 0.92  # Visual quality
  accessibility_required: false  # WCAG 2.1 AA
```

---

## Common Commands

```bash
# Recommended: LLM mode (auto-detected if ANTHROPIC_API_KEY set)
set ANTHROPIC_API_KEY=sk-ant-your-key
python autopilot.py jobs/my-doc.yaml

# Offline mode (explicitly disable LLM)
python autopilot.py jobs/my-doc.yaml --llm none

# Test autopilot system (runs REAL pipeline)
python scripts/test-autopilot.py

# Quiet mode (minimal output)
python autopilot.py jobs/my-doc.yaml --quiet

# Help
python autopilot.py --help
```

---

## Output Files

```
example-jobs/
└── autopilot-my-doc-2025.json  # Generated pipeline config

exports/
├── my-doc-2025-content.json    # LLM-generated content
└── TEEI-MY-DOC-2025-DIGITAL.pdf  # Final PDF

reports/autopilot/
└── my-doc-2025-EXECUTIVE-REPORT.md  # AI analysis
```

---

## Troubleshooting

### Issue: Partner profile not found

```bash
# List available profiles
python services/partner_profiles.py

# Create new profile
cp config/partner-profiles/aws-cloud.json config/partner-profiles/new.json
```

### Issue: LLM not working

```bash
# Check API key
echo $ANTHROPIC_API_KEY

# Test LLM client
python scripts/test-llm-client.py
```

### Issue: Missing metrics file

```yaml
# Remove from job spec or create file
# Option 1: Remove
# Delete: metrics_file: "data/metrics.json"

# Option 2: Create
echo '{"students": "1000"}' > data/metrics.json
```

---

## Examples

### Minimal (10 lines)

```yaml
job_id: quick-demo
partner_profile_id: aws-cloud
title: "Quick Demo"
objectives: ["Test autopilot"]
audience: ["Me"]
```

### Full (30 lines)

```yaml
job_id: aws-showcase-2025
partner_profile_id: aws-cloud
title: "Building Europe's Cloud-Native Workforce"
objectives:
  - "Scale cloud skills for Ukrainian refugees"
  - "Increase AWS certifications to 90%"
  - "Establish 3-year partnership framework"
audience:
  - "AWS EMEA public sector leadership"
  - "TEEI board of directors"
tone: "strategic_b2b_professional"
primary_language: "en"
secondary_languages: ["de"]
layout_prefs:
  pages: 4
  variant_mode: "auto"
content_inputs:
  deliverables:
    - "deliverables/TEEI-AWS-Partnership-Document-Content.md"
  metrics_file: "data/partnership-aws-metrics.json"
  notes:
    - "Highlight 78% employment rate"
    - "Emphasize mentorship program"
    - "Include AWS Academy expansion details"
qa_prefs:
  min_score_layer1: 145
  min_ai_tier1: 0.90
  min_gemini: 0.92
  accessibility_required: true
```

---

## Complete Documentation

- **Full Guide**: `AUTOPILOT-GUIDE.md`
- **Job Spec Format**: `jobs/schema.md`
- **Implementation**: `AUTOPILOT-IMPLEMENTATION-COMPLETE.md`
- **LLM Integration**: `LLM-UPGRADE-COMPLETE.md`

---

## Quick Reference Card

| What | Command |
|------|---------|
| Create doc | `python autopilot.py jobs/my-doc.yaml` |
| With LLM | `python autopilot.py jobs/my-doc.yaml --llm anthropic` |
| Test | `python scripts/test-autopilot.py` |
| Read report | `cat reports/autopilot/{job_id}-EXECUTIVE-REPORT.md` |
| View PDF | `explorer exports/TEEI-{JOB_ID}-DIGITAL.pdf` |

---

**Last Updated**: 2025-11-15
