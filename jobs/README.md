# Job Specs Directory

**Purpose**: Human-friendly YAML specifications for autopilot document generation

---

## What is a Job Spec?

A **job spec** is a simple YAML file that describes what document you want to create. Instead of writing 300+ lines of complex JSON pipeline configuration, you write 10-30 lines of straightforward YAML.

**Autopilot** reads your job spec and handles everything:
- Content planning (using RAG + partner profiles)
- Narrative generation (with LLM)
- Layout optimization
- World-class validation
- Executive summary

---

## Quick Start

### 1. Copy an Example

```bash
# Minimal example
cp jobs/aws-tfu-demo.yaml jobs/my-doc.yaml

# Full example
cp jobs/aws-tfu-2025.yaml jobs/my-doc.yaml
```

### 2. Edit for Your Use Case

```yaml
job_id: my-doc-2025
partner_profile_id: aws-cloud
title: "My Partnership Document"
objectives:
  - "Your first objective"
  - "Your second objective"
audience:
  - "Your target audience"
```

### 3. Run Autopilot

```bash
python autopilot.py jobs/my-doc.yaml
```

**Done!** Check `reports/autopilot/my-doc-2025-EXECUTIVE-REPORT.md`

---

## Files in This Directory

| File | Description | Use Case |
|------|-------------|----------|
| `schema.md` | Complete specification format | Reference when creating new specs |
| `aws-tfu-2025.yaml` | Full example (30 lines) | Production use, shows all features |
| `aws-tfu-demo.yaml` | Minimal example (7 lines) | Quick testing, learning |
| `README.md` | This file | Getting started |

---

## Job Spec Format

### Required Fields (5 minimum)

```yaml
job_id: unique-identifier         # Used for filenames
partner_profile_id: aws-cloud     # Must exist in config/partner-profiles/
title: "Document Title"           # Appears on cover
objectives:                       # What this doc accomplishes
  - "First objective"
  - "Second objective"
audience:                         # Who reads this
  - "Target reader group"
```

### Optional Fields (with smart defaults)

```yaml
tone: "strategic_b2b"             # Default: from partner profile
primary_language: "en"            # Default: English
secondary_languages: []           # Default: none

layout_prefs:
  pages: 4                        # Default: TFU standard
  variant_mode: "auto"            # Default: test variants

content_inputs:
  deliverables: []                # Default: use RAG
  metrics_file: null              # Default: none
  notes: []                       # Default: none

qa_prefs:
  min_score_layer1: 145           # Default: 145/150
  min_ai_tier1: 0.90              # Default: 0.90
  min_gemini: 0.92                # Default: 0.92
  accessibility_required: false   # Default: false
```

---

## Examples

### Minimal (7 lines)

For quick testing or simple documents:

```yaml
job_id: quick-test
partner_profile_id: aws-cloud
title: "Test Document"
objectives:
  - "Test autopilot"
audience:
  - "Me"
```

### Standard (15 lines)

For typical partnership documents:

```yaml
job_id: aws-partnership-2025
partner_profile_id: aws-cloud
title: "AWS Partnership Overview"
objectives:
  - "Showcase cloud training impact"
  - "Establish partnership framework"
audience:
  - "AWS partnership team"
  - "TEEI leadership"
layout_prefs:
  variant_mode: "auto"
content_inputs:
  notes:
    - "Highlight 78% employment rate"
    - "Mention AWS Academy expansion"
```

### Full (30 lines)

For production documents with all options:

```yaml
job_id: aws-showcase-2025
partner_profile_id: aws-cloud
title: "Building Europe's Cloud-Native Workforce"
objectives:
  - "Scale cloud skills for Ukrainian refugees across Europe"
  - "Increase AWS certification completion to 90%"
  - "Establish 3-year strategic partnership framework"
audience:
  - "AWS EMEA public sector leadership"
  - "TEEI board of directors"
tone: "strategic_b2b_professional"
primary_language: "en"
secondary_languages:
  - "de"
  - "uk"
layout_prefs:
  pages: 4
  variant_mode: "auto"
content_inputs:
  deliverables:
    - "deliverables/TEEI-AWS-Partnership-Document-Content.md"
  metrics_file: "data/partnership-aws-metrics.json"
  notes:
    - "Highlight 78% employment rate and €45k average salary"
    - "Emphasize mentorship program and career pathways"
    - "Include AWS Academy partnership expansion details"
qa_prefs:
  min_score_layer1: 145
  min_ai_tier1: 0.90
  min_gemini: 0.92
  accessibility_required: true
```

---

## Partner Profiles

Job specs reference partner profiles. Available profiles:

```bash
# List profiles
python services/partner_profiles.py

# Current profiles:
# - aws-cloud (Amazon Web Services)
```

### Creating New Profiles

```bash
# Copy existing profile
cp config/partner-profiles/aws-cloud.json config/partner-profiles/new-partner.json

# Edit fields
vim config/partner-profiles/new-partner.json

# Use in job spec
partner_profile_id: new-partner
```

---

## Workflow

```
1. Create job spec YAML
   jobs/my-doc.yaml

2. Run autopilot
   python autopilot.py jobs/my-doc.yaml

3. Autopilot generates:
   example-jobs/autopilot-my-doc.json     # Pipeline config
   exports/my-doc-content.json            # Content
   exports/TEEI-MY-DOC-DIGITAL.pdf        # PDF
   reports/autopilot/my-doc-EXECUTIVE-REPORT.md  # AI summary

4. Review executive report
   cat reports/autopilot/my-doc-EXECUTIVE-REPORT.md

5. Share PDF
   explorer exports/
```

---

## LLM Mode

### Offline Mode (Default)

```bash
python autopilot.py jobs/my-doc.yaml
```

**Uses**:
- Template-based content
- Stub translations
- Deterministic executive report

### LLM Mode (Better Quality)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
python autopilot.py jobs/my-doc.yaml --llm anthropic
```

**Uses**:
- Claude plans document outline from objectives
- Claude generates custom narratives
- Claude translates to target languages
- Claude writes executive analysis

---

## Troubleshooting

### Missing Partner Profile

```
Error: Partner profile 'xyz' not found
```

**Solution**:
```bash
# List available profiles
python services/partner_profiles.py

# Or create new profile
cp config/partner-profiles/aws-cloud.json config/partner-profiles/xyz.json
```

### Missing Metrics File

```
Error: FileNotFoundError: data/metrics.json
```

**Solution**:
```yaml
# Option 1: Remove from spec
# Delete line: metrics_file: "data/metrics.json"

# Option 2: Create file
echo '{"students": "1000", "employment_rate": "75%"}' > data/metrics.json
```

### LLM Not Available

```
Warning: LLM not available - using offline fallbacks
```

**Solution**:
```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-your-key

# Test LLM
python scripts/test-llm-client.py
```

---

## Complete Documentation

- **Quick Start**: `AUTOPILOT-QUICKSTART.md` (1-page reference)
- **Full Guide**: `AUTOPILOT-GUIDE.md` (complete workflow)
- **Spec Format**: `jobs/schema.md` (field-by-field reference)
- **Implementation**: `AUTOPILOT-IMPLEMENTATION-COMPLETE.md` (technical details)

---

## Tips

### 1. Start Minimal, Add Details

```yaml
# Start simple
job_id: test
partner_profile_id: aws-cloud
title: "Test"
objectives: ["Test autopilot"]
audience: ["Me"]
```

Run, review, then add optional fields as needed.

---

### 2. Clear Objectives = Better Output

**Good**:
```yaml
objectives:
  - "Increase AWS certification completion from 60% to 90%"
  - "Establish 3-year partnership with annual $150K commitment"
```

**Bad**:
```yaml
objectives:
  - "Make partnership better"
  - "Do stuff"
```

LLM uses objectives to generate narrative. Be specific!

---

### 3. Provide Context in Notes

```yaml
content_inputs:
  notes:
    - "Highlight 78% employment rate (our best metric)"
    - "Mention AWS Academy expansion to 5 countries"
    - "Include specific success story from Natalia (Ukrainian student)"
```

These guide the LLM to emphasize what matters.

---

### 4. Test Offline First

```bash
# Fast, free, validates format
python autopilot.py jobs/my-doc.yaml

# If it works, enable LLM for better quality
export ANTHROPIC_API_KEY=sk-ant-...
python autopilot.py jobs/my-doc.yaml --llm anthropic
```

---

## Next Steps

1. **Try demo**: `python autopilot.py jobs/aws-tfu-demo.yaml`
2. **Create your spec**: Copy `jobs/aws-tfu-demo.yaml` → `jobs/my-doc.yaml`
3. **Edit fields**: Update for your use case
4. **Run autopilot**: `python autopilot.py jobs/my-doc.yaml`
5. **Review report**: `cat reports/autopilot/my-doc-EXECUTIVE-REPORT.md`

---

**Last Updated**: 2025-11-15
