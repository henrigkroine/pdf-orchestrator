# Experiment Mode - A/B Testing for PDF Generation

Experiment mode allows you to generate and test multiple design variants automatically, with the system selecting the best performer based on quality metrics.

## Overview

Experiment mode runs the complete pipeline multiple times with different configurations, then analyzes the results to pick the winner. This is useful for:

- **Design exploration** - Test multiple color schemes, layouts, or typography choices
- **Quality optimization** - Find the configuration that produces the highest scores
- **Visual regression testing** - Ensure design changes don't negatively impact quality
- **Automated decision-making** - Let the system pick the best variant objectively

## Quick Start

1. **Create experiment job config** with `mode: "experiment"`:

```json
{
  "jobId": "aws-partnership-experiment",
  "mode": "experiment",
  "experiment": {
    "name": "AWS Partnership Layout Test",
    "description": "Testing 3 different layout approaches",
    "variants": 3,
    "weights": {
      "totalScore": 0.5,
      "tfuScore": 0.3,
      "visualDiff": 0.15,
      "passed": 0.05
    }
  }
}
```

2. **Run experiment**:

```bash
node orchestrator.js example-jobs/experiment-aws-partnership.json
```

3. **Review results** in `reports/experiments/`:

The system will generate:
- Individual scorecards for each variant
- Comparison table showing all metrics
- Winner selection with detailed reasoning
- Full experiment summary JSON

## How It Works

### 1. Variant Generation

The experiment runner generates multiple variants of your job config:

**Default variants** (if not specified):
- Variant 1: Classic layout (Nordshore primary)
- Variant 2: Modern layout (Sky accents)
- Variant 3: Bold layout (Gold highlights)
- Variant 4: Minimal layout (Sand backgrounds)
- Variant 5: Premium layout (Mixed palette)

**Custom variants** (define explicitly):
```json
"experiment": {
  "variants": 2,
  "variantConfigs": [
    {
      "description": "Conservative Layout",
      "design": {
        "colorScheme": "nordshore-primary",
        "layout": "classic"
      },
      "output": {
        "quality": "high"
      }
    },
    {
      "description": "Bold Modern Layout",
      "design": {
        "colorScheme": "gold-highlight",
        "layout": "modern"
      },
      "output": {
        "quality": "ultra"
      }
    }
  ]
}
```

### 2. Pipeline Execution

For each variant:
1. Creates temporary job config with variant-specific changes
2. Runs full pipeline (InDesign export, QA validation, visual regression)
3. Collects scorecard with all metrics
4. Cleans up temporary files

### 3. Winner Selection

The winner selector calculates a composite score for each variant using weighted metrics:

**Default weights**:
- `totalScore`: 50% - Overall quality score (0-150)
- `tfuScore`: 30% - TFU brand compliance (0-25)
- `visualDiff`: 15% - Visual regression percentage (lower is better)
- `passed`: 5% - Pass/fail status

**Composite score formula**:
```javascript
compositeScore =
  (totalScore/150 * 0.5) +
  (tfuScore/25 * 0.3) +
  ((100-visualDiff)/100 * 0.15) +
  (passed ? 1 : 0 * 0.05)
```

**Tiebreaker rules** (in order):
1. Highest total score
2. Highest TFU score
3. Lowest visual diff
4. Fastest execution
5. First variant (arbitrary)

### 4. Results

Example winner selection output:
```
[WinnerSelector] WINNER: Variant 2
[WinnerSelector] Composite Score: 0.847
[WinnerSelector] Strong quality score (128/150).
                Excellent TFU compliance (23/25).
                Low visual regression (3.2%).
                Passed all QA gates.
                Clear winner by 8.3% margin.
```

## Configuration Reference

### Experiment Config Object

```json
{
  "mode": "experiment",
  "experiment": {
    // Name of the experiment (for reporting)
    "name": "Layout Comparison Test",

    // Detailed description
    "description": "Testing 3 layout approaches for AWS partnership doc",

    // Number of variants to generate (default: 3)
    "variants": 3,

    // Custom weight configuration (optional)
    "weights": {
      "totalScore": 0.5,    // Weight for overall quality (0-1)
      "tfuScore": 0.3,      // Weight for TFU compliance (0-1)
      "visualDiff": 0.15,   // Weight for visual consistency (0-1)
      "passed": 0.05        // Weight for pass/fail status (0-1)
    },

    // Custom variant configurations (optional)
    // If omitted, system generates default variants
    "variantConfigs": [
      {
        "description": "Variant name",
        "design": { /* design overrides */ },
        "output": { /* output overrides */ },
        "qa": { /* QA overrides */ },
        "data": { /* data overrides */ }
      }
    ]
  }
}
```

### Customizing Weights

Adjust weights based on your priorities:

**Quality-focused** (maximize overall score):
```json
"weights": {
  "totalScore": 0.8,
  "tfuScore": 0.1,
  "visualDiff": 0.05,
  "passed": 0.05
}
```

**Brand-focused** (maximize TFU compliance):
```json
"weights": {
  "totalScore": 0.3,
  "tfuScore": 0.6,
  "visualDiff": 0.05,
  "passed": 0.05
}
```

**Consistency-focused** (minimize visual changes):
```json
"weights": {
  "totalScore": 0.3,
  "tfuScore": 0.2,
  "visualDiff": 0.45,
  "passed": 0.05
}
```

**Balanced** (default):
```json
"weights": {
  "totalScore": 0.5,
  "tfuScore": 0.3,
  "visualDiff": 0.15,
  "passed": 0.05
}
```

## Example Variant Configurations

### Color Scheme Variants

```json
"variantConfigs": [
  {
    "description": "Nordshore Primary",
    "design": { "colorScheme": "nordshore-primary" }
  },
  {
    "description": "Sky Accent",
    "design": { "colorScheme": "sky-accent" }
  },
  {
    "description": "Gold Highlight",
    "design": { "colorScheme": "gold-highlight" }
  }
]
```

### Layout Variants

```json
"variantConfigs": [
  {
    "description": "Classic Grid",
    "design": { "layout": "classic" }
  },
  {
    "description": "Modern Card-Based",
    "design": { "layout": "modern" }
  },
  {
    "description": "Minimal Clean",
    "design": { "layout": "minimal" }
  }
]
```

### Quality Variants

```json
"variantConfigs": [
  {
    "description": "Standard Quality",
    "output": { "quality": "high", "intent": "screen" }
  },
  {
    "description": "Print Quality",
    "output": { "quality": "high", "intent": "print" }
  },
  {
    "description": "Ultra Quality",
    "output": { "quality": "ultra", "intent": "print" }
  }
]
```

### Data Variants

```json
"variantConfigs": [
  {
    "description": "Long-Form Content",
    "data": {
      "content": {
        "source": "file",
        "path": "content/aws-partnership-detailed.md"
      }
    }
  },
  {
    "description": "Short-Form Content",
    "data": {
      "content": {
        "source": "file",
        "path": "content/aws-partnership-brief.md"
      }
    }
  }
]
```

## Experiment Results

### Summary JSON Structure

```json
{
  "baseJobId": "aws-partnership-experiment",
  "experimentName": "AWS Partnership Layout Test",
  "description": "Testing 3 different layout approaches",
  "timestamp": "2025-11-13T10:30:00.000Z",
  "variantCount": 3,
  "variants": [
    {
      "variant": 1,
      "description": "Classic Layout (Nordshore primary)",
      "jobId": "aws-partnership-variant-1",
      "config": { /* variant config */ },
      "success": true,
      "scorecard": { /* full scorecard */ },
      "score": 128,
      "tfuScore": 23,
      "visualDiff": 3.2,
      "passed": true,
      "duration": 45.3
    }
    // ... more variants
  ],
  "winner": {
    "variant": 2,
    "description": "Modern Layout (Sky accents)",
    "jobId": "aws-partnership-variant-2",
    "compositeScore": 0.847,
    "breakdown": {
      "totalScore": 135,
      "tfuScore": 24,
      "visualDiff": 2.1,
      "passed": true,
      "duration": 43.8
    },
    "reason": "Strong quality score (135/150). Excellent TFU compliance (24/25). Low visual regression (2.1%). Passed all QA gates. Clear winner by 8.3% margin.",
    "tiebreaker": null,
    "allScores": [ /* all composite scores */ ],
    "weights": { /* weights used */ }
  }
}
```

### Accessing Results

**Load experiment summary**:
```javascript
const fs = require('fs');
const summary = JSON.parse(
  fs.readFileSync('reports/experiments/aws-partnership-experiment-2025-11-13.json', 'utf8')
);

console.log(`Winner: Variant ${summary.winner.variant}`);
console.log(`Score: ${summary.winner.compositeScore.toFixed(3)}`);
console.log(`Reason: ${summary.winner.reason}`);
```

**Export winner PDF**:
The winning variant's PDF is saved to:
```
exports/{winner.jobId}-PRINT.pdf
exports/{winner.jobId}-DIGITAL.pdf
```

## Best Practices

### 1. Start Small
Begin with 2-3 variants to understand the system before scaling up.

### 2. Test One Thing at a Time
For clearer results, vary only one aspect (colors OR layout OR content, not all three).

### 3. Use Meaningful Descriptions
Describe what makes each variant unique for easier result interpretation.

### 4. Set Appropriate Weights
Align weights with your project goals (quality, brand compliance, consistency).

### 5. Review All Variants
Don't just look at the winner - review all variants to understand why others scored lower.

### 6. Iterate Based on Results
Use experiment results to refine your job configs for production runs.

### 7. Keep Baselines Updated
Ensure visual regression baselines reflect your current approved design.

## Troubleshooting

### All Variants Failed

**Problem**: No variants completed successfully

**Solutions**:
- Check base job config is valid
- Ensure InDesign is running and connected
- Verify template files exist
- Check logs for specific error messages

### Unexpected Winner

**Problem**: Winner doesn't match expectations

**Solutions**:
- Review weight configuration - adjust priorities
- Check scorecard details for each variant
- Look at tiebreaker reasoning if scores are close
- Examine visual regression diffs manually

### Long Execution Time

**Problem**: Experiments take too long to complete

**Solutions**:
- Reduce number of variants
- Disable visual regression for faster testing
- Use lower quality export presets during experiments
- Run experiments overnight or during off-hours

### Variant Conflicts

**Problem**: Variants produce errors due to config conflicts

**Solutions**:
- Validate variant configs independently first
- Test each variant config manually before running experiment
- Check for conflicting settings between base and variant configs

## Limitations

1. **Sequential Execution**: Variants run one at a time (prevents InDesign conflicts)
2. **No Live Preview**: Can't see variants until pipeline completes
3. **File System Impact**: Generates many temporary files (auto-cleaned)
4. **Resource Intensive**: Full pipeline runs for each variant
5. **InDesign Dependency**: Requires InDesign running for entire experiment

## Future Enhancements

Planned improvements:
- Parallel variant execution (with multiple InDesign instances)
- Live preview dashboard
- Machine learning-based variant generation
- Historical trend analysis
- Automated optimal weight calculation
- Interactive winner selection override

## Related Documentation

- **Pipeline Configuration**: `pipeline.py` documentation
- **QA Profiles**: `QAPROFILE-GUIDE.md`
- **Visual Regression**: `scripts/VISUAL_COMPARISON_README.md`
- **Job Config Schema**: `schemas/report-schema.json`

---

**Last Updated**: 2025-11-13
**Status**: Production-ready
**Version**: 1.0.0
