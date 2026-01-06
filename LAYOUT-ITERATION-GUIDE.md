# Layout Iteration Engine Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-14

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Variant Strategies](#variant-strategies)
4. [CLI Usage](#cli-usage)
5. [Integration with Pipeline](#integration-with-pipeline)
6. [Configuration](#configuration)
7. [Usage Examples](#usage-examples)
8. [Scoring Modes](#scoring-modes)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The **Layout Iteration Engine** is an A/B testing system for PDF layouts. It generates multiple design variants, scores them against quality gates, and automatically selects the best-performing layout.

**Key Benefits:**
- ✅ **Data-driven design:** Test multiple layouts objectively
- ✅ **Automated optimization:** No manual A/B testing required
- ✅ **Quality assurance:** Every variant is scored before selection
- ✅ **Reproducible:** Variant configs saved for future reference
- ✅ **Fast iteration:** Mock scoring for rapid experimentation

**Use Cases:**
- Finding optimal spacing/density for different content lengths
- Testing visual emphasis strategies (metrics vs. narrative)
- A/B testing color balance variations
- Optimizing layouts for different partner preferences

---

## How It Works

### Workflow

```
Base Job Config
      ↓
  [Generate Variations]
      ↓
  Variant Configs (A, B, C, ...)
      ↓
  [Score Each Variant]
      ↓
  Scored Results
      ↓
  [Pick Best]
      ↓
  Best Variant Config
```

### Core Components

1. **LayoutIterationEngine:** Main class that orchestrates the workflow
2. **Variant Generation:** Creates modified job configs with layout variations
3. **Scoring System:** Fast (mock) or full (pipeline) scoring
4. **Best Selection:** Picks optimal variant based on criteria

---

## Variant Strategies

### Available Strategies

#### 1. Spacing
**What it does:** Adjusts spacing multiplier for compact vs. spacious layouts

```json
{
  "_layout_variant": {
    "spacing_multiplier": 0.8,
    "description": "Compact spacing variant"
  }
}
```

**Use case:** When content is dense, test if tighter spacing improves readability

---

#### 2. Emphasis
**What it does:** Changes visual hierarchy to emphasize different elements

```json
{
  "_layout_variant": {
    "metric_size_multiplier": 1.2,
    "description": "Metrics-focused variant"
  }
}
```

**Use case:** For partners who prioritize data, make metrics more prominent

---

#### 3. Color Balance
**What it does:** Adjusts accent color opacity for lighter/bolder look

```json
{
  "_layout_variant": {
    "accent_opacity": 0.7,
    "description": "Lighter accent colors variant"
  }
}
```

**Use case:** Test color intensity for different brand preferences

---

### Custom Strategies

Add your own strategies by extending the `generate_variations()` method:

```python
# In services/layout_iteration_engine.py

if 'hero_image' in strategies and i == 3:
    changes['hero'] = 'full_bleed'
    variant_config['_layout_variant'] = {
        'hero_image_style': 'full_bleed',
        'description': 'Full-bleed hero image variant'
    }
```

---

## CLI Usage

### Basic Command

```bash
python scripts/run-layout-iteration.py <job_config_path> [options]
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--variants`, `-n` | Number of variants to generate | 3 |
| `--mode`, `-m` | Scoring mode: `fast` or `full` | fast |
| `--strategies`, `-s` | Variation strategies to apply | spacing emphasis color_balance |
| `--export`, `-e` | Export best variant details to JSON | False |
| `--export-path` | Export file path | temp/best-variant.json |

### Examples

**Basic run (3 variants, fast scoring):**
```bash
python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json
```

**5 variants with specific strategies:**
```bash
python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json \
  --variants 5 \
  --strategies spacing emphasis
```

**Full pipeline scoring (expensive):**
```bash
python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json \
  --mode full
```

**Export best variant:**
```bash
python scripts/run-layout-iteration.py example-jobs/tfu-aws-partnership-v2.json \
  --export \
  --export-path results/best-layout.json
```

### Output

```
==============================================================
LAYOUT ITERATION ENGINE - CLI
==============================================================

[INIT] Initializing Layout Iteration Engine...

[RUN] Testing 3 layout variants
      Base config: example-jobs/tfu-aws-partnership-v2.json
      Scoring mode: fast
      Strategies: spacing, emphasis, color_balance

==============================================================
LAYOUT ITERATION: 3 variants
==============================================================

[LAYOUT ITERATION] Generated 3 layout variants
  - variant-A: Compact spacing variant
  - variant-B: Metrics-focused variant
  - variant-C: Lighter accent colors variant

[SCORE] Variant variant-A: Compact spacing variant
  Score: 0.912

[SCORE] Variant variant-B: Metrics-focused variant
  Score: 0.895

[SCORE] Variant variant-C: Lighter accent colors variant
  Score: 0.883

[BEST] Variant variant-A selected
  Description: Compact spacing variant
  Score (overall): 0.912


==============================================================
VARIANT COMPARISON
==============================================================

Variant      Score      Status     Description
--------------------------------------------------------------
variant-A    0.912      ✓          Compact spacing variant
variant-B    0.895      ○          Metrics-focused variant
variant-C    0.883      ○          Lighter accent colors variant

==============================================================
BEST VARIANT SELECTED
==============================================================
  ID: variant-A
  Description: Compact spacing variant
  Score: 0.912
  Config: temp/layout-variants/tfu-aws-partnership-v2-variant-A.json

[OK] Iteration complete - tested 3 variants
     Best score: 0.912
```

---

## Integration with Pipeline

### Automatic Integration

When layout iteration is enabled in job config, the pipeline automatically:
1. Runs iteration before generation
2. Uses best variant config for document creation
3. Logs iteration results

### Enable in Job Config

```json
{
  "generation": {
    "layoutIteration": {
      "enabled": true,
      "num_variations": 5,
      "variation_strategies": ["spacing", "emphasis", "color_balance"],
      "parallel_execution": false
    }
  }
}
```

### Pipeline Output

```bash
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json
```

```
==============================================================
PLANNING PHASE
==============================================================

[Layout Iteration] Generating layout variants...
  ✓ Tested 5 variants
  Best: variant-B (score: 0.923)
  Config: temp/layout-variants/tfu-aws-partnership-v2-variant-B.json

[Planning] Using optimized config: temp/layout-variants/...-variant-B.json

==============================================================
STEP 0: GENERATION
==============================================================
...
```

---

## Configuration

### Job Config Schema

```json
{
  "generation": {
    "layoutIteration": {
      "enabled": false,
      "num_variations": 3,
      "variation_strategies": [
        "spacing",
        "emphasis",
        "color_balance"
      ],
      "parallel_execution": false
    }
  }
}
```

### Configuration Options

| Field | Type | Description |
|-------|------|-------------|
| `enabled` | boolean | Enable layout iteration |
| `num_variations` | integer | Number of variants (2-10 recommended) |
| `variation_strategies` | array | Strategies to apply |
| `parallel_execution` | boolean | Run scoring in parallel (future) |

### Variant Config Storage

Variant configs are stored in `temp/layout-variants/`:

```
temp/layout-variants/
├── tfu-aws-partnership-v2-variant-A.json
├── tfu-aws-partnership-v2-variant-B.json
└── tfu-aws-partnership-v2-variant-C.json
```

---

## Usage Examples

### Example 1: Find Optimal Spacing

```bash
# Test 5 spacing variations
python scripts/run-layout-iteration.py \
  example-jobs/tfu-aws-partnership-v2.json \
  --variants 5 \
  --strategies spacing
```

**Result:** Variant with spacing_multiplier=0.85 scores highest

---

### Example 2: Partner-Specific Optimization

```python
from services.layout_iteration_engine import LayoutIterationEngine

engine = LayoutIterationEngine()

# Test variations for AWS partner
result = engine.run_iteration(
    base_job_config_path='example-jobs/tfu-aws-partnership-v2.json',
    num_variations=4,
    mode='fast'
)

best = result['best_variant']
print(f"Best for AWS: {best['variant_id']} ({best['score']['overall']:.3f})")
```

---

### Example 3: Full Pipeline Scoring (Production)

```bash
# Full world-class scoring for each variant (slow but accurate)
python scripts/run-layout-iteration.py \
  example-jobs/tfu-aws-partnership-v2.json \
  --mode full \
  --export
```

**Note:** This runs the complete 6-layer pipeline for each variant (expensive!)

---

## Scoring Modes

### Fast Mode (Default)

**Method:** Mock scoring with deterministic random scores

**Pros:**
- ⚡ Very fast (seconds)
- 🔄 Reproducible (deterministic seed)
- 💡 Good for rapid iteration

**Cons:**
- ❌ Not real quality scores
- ❌ Doesn't catch actual issues

**Use when:** Exploring design space quickly

```python
score = {
    'overall': 0.912,
    'layer1': 145,
    'layer3.5': 0.91,
    'layer4': 0.93,
    'timestamp': '2025-11-14T...'
}
```

---

### Full Mode (Production)

**Method:** Runs complete world-class pipeline for each variant

**Pros:**
- ✅ Real quality scores
- ✅ Catches actual issues
- ✅ Production-ready selection

**Cons:**
- 🐌 Very slow (5-10 min per variant)
- 💰 Expensive (API calls for Gemini, etc.)
- 📊 Requires full environment

**Use when:** Final selection for production documents

```python
score = {
    'overall': 0.92,
    'layer1': 145,
    'layer3.5': 0.91,
    'layer4': 0.93,
    'status': 'PASS',
    'timestamp': '2025-11-14T...'
}
```

---

## Best Practices

### 1. Start with Fast Mode

```bash
# Quickly test 10 variants
python scripts/run-layout-iteration.py job.json --variants 10 --mode fast
```

Then use full mode only for top 2-3 variants:

```bash
# Full scoring for final selection
python scripts/run-layout-iteration.py top-variant.json --mode full
```

---

### 2. Use Appropriate Number of Variants

| Use Case | Recommended Variants |
|----------|---------------------|
| Quick exploration | 3-5 |
| Thorough testing | 5-10 |
| Production selection | 2-3 (with full mode) |

**Why:** Too many variants → diminishing returns; too few → may miss optimal

---

### 3. Combine with Performance Intelligence

```json
{
  "planning": {
    "performance_recommendations": true
  },
  "generation": {
    "layoutIteration": {
      "enabled": true
    }
  }
}
```

**Result:** Layout iteration uses historical data to inform variant generation

---

### 4. Save Best Variants

```bash
# Export best variant
python scripts/run-layout-iteration.py job.json --export

# Later: Use that variant as base
cp temp/best-variant.json example-jobs/optimized-v2.json
```

---

### 5. Test One Strategy at a Time

```bash
# Test spacing only
python scripts/run-layout-iteration.py job.json --strategies spacing

# Test emphasis only
python scripts/run-layout-iteration.py job.json --strategies emphasis
```

**Why:** Easier to understand what changes improved scores

---

## Troubleshooting

### Issue: All Variants Score the Same

**Symptom:** Scores are identical: 0.912, 0.912, 0.912

**Cause:** Fast mode uses deterministic random with same seed

**Solution:**
```python
# Edit services/layout_iteration_engine.py line 182
random.seed(variant['variant_id'])  # Uses variant ID, should differ

# Or use full mode
--mode full
```

---

### Issue: Layout Iteration Takes Forever

**Symptom:** Each variant takes 5+ minutes

**Cause:** Using `full` mode

**Solution:**
```bash
# Use fast mode for exploration
--mode fast

# Only use full for final selection
--mode full --variants 2
```

---

### Issue: Variant Configs Not Found

**Symptom:** "Config not found: temp/layout-variants/..."

**Cause:** Temp directory cleared or generation failed

**Solution:**
```bash
# Recreate variants
python scripts/run-layout-iteration.py job.json

# Check temp directory
ls temp/layout-variants/
```

---

### Issue: Best Variant Not Optimal

**Symptom:** Manually selected variant looks better than "best"

**Cause:** Fast mode scoring doesn't reflect true quality

**Solution:**
```bash
# Use full mode for accurate scoring
python scripts/run-layout-iteration.py job.json --mode full
```

---

## API Reference

### LayoutIterationEngine

```python
class LayoutIterationEngine:
    def __init__(self, pipeline_script: str = "pipeline.py")

    def generate_variations(
        self,
        base_job_config_path: str,
        num_variations: int = 3,
        strategies: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]

    def score_variants(
        self,
        variants: List[Dict[str, Any]],
        mode: str = 'fast'
    ) -> List[Dict[str, Any]]

    def pick_best(
        self,
        scored_variants: List[Dict[str, Any]],
        criteria: str = 'overall'
    ) -> Dict[str, Any]

    def run_iteration(
        self,
        base_job_config_path: str,
        num_variations: int = 3,
        mode: str = 'fast'
    ) -> Dict[str, Any]
```

### Return Types

**generate_variations():**
```python
[
    {
        'variant_id': 'variant-A',
        'config_path': 'temp/layout-variants/...-variant-A.json',
        'description': 'Compact spacing variant',
        'changes': {'spacing': 'compact'}
    },
    ...
]
```

**score_variants():**
```python
[
    {
        'variant_id': 'variant-A',
        'config_path': '...',
        'description': '...',
        'changes': {...},
        'score': {
            'overall': 0.912,
            'layer1': 145,
            'layer3.5': 0.91,
            'layer4': 0.93
        }
    },
    ...
]
```

**run_iteration():**
```python
{
    'best_variant': {...},
    'all_variants': [...],
    'summary': {
        'num_variants': 3,
        'best_variant_id': 'variant-A',
        'best_score': 0.912,
        'timestamp': '2025-11-14T...'
    }
}
```

---

## Performance Considerations

### Fast Mode
- **Time:** ~2-5 seconds per variant
- **Cost:** Free (no API calls)
- **Accuracy:** Low (mock scores)

### Full Mode
- **Time:** ~5-10 minutes per variant
- **Cost:** Medium (Gemini API calls)
- **Accuracy:** High (real quality scores)

### Recommendations

| Variants | Mode | Time | Use Case |
|----------|------|------|----------|
| 3 | fast | < 10s | Quick exploration |
| 5 | fast | < 20s | Thorough testing |
| 10 | fast | < 1min | Design space search |
| 2 | full | ~15min | Production selection |
| 5 | full | ~40min | Not recommended |

---

## Next Steps

- **Try it:** Run your first iteration
- **Experiment:** Test different strategies
- **Integrate:** Enable in pipeline for automatic optimization
- **Optimize:** Use full mode for final production selection
- **Expand:** Create custom strategies for your use cases

**Documentation:** See also:
- [RAG & Personalization Guide](RAG-PERSONALIZATION-GUIDE.md)
- [Performance Intelligence Guide](PERFORMANCE-INTELLIGENCE-GUIDE.md)
- [Agent Handoff Document](AGENT-RAG-PERF-HANDOFF.md)

---

**Questions or Issues?** Check [Troubleshooting](#troubleshooting) or review code in `services/layout_iteration_engine.py`.
