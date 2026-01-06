# Performance Intelligence Guide

**Version:** 1.0.0
**Last Updated:** 2025-11-14

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [Performance Tracker](#performance-tracker)
4. [Data-Driven Recommendations](#data-driven-recommendations)
5. [Analytics Dashboard](#analytics-dashboard)
6. [Integration](#integration)
7. [Configuration](#configuration)
8. [Usage Examples](#usage-examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

**Performance Intelligence** is a data analytics system that tracks pipeline runs and provides data-driven recommendations for optimizing document quality.

**Key Benefits:**
- ✅ **Historical context:** Learn from past successful documents
- ✅ **Pattern detection:** Identify what works for different partners
- ✅ **Predictive insights:** Recommendations based on actual data
- ✅ **Quality trends:** Track improvement over time
- ✅ **Offline analytics:** No external dependencies

**Use Cases:**
- Determine typical page counts for different document families
- Find high-scoring layout patterns
- Identify common issues before they occur
- Benchmark new documents against historical performance
- Track quality improvements over time

---

## How It Works

### Data Flow

```
Pipeline Run
      ↓
  [Log Results]
      ↓
  JSONL Store (analytics/performance/log.jsonl)
      ↓
  [Analyze Patterns]
      ↓
  Recommendations
      ↓
  [Inform Planning Phase]
```

### Core Components

1. **PerformanceTracker:** Logs and analyzes pipeline runs
2. **JSONL Store:** Append-only log for all runs
3. **Analytics Engine:** Pattern detection and recommendations
4. **Integration Points:** Planning phase, Layout iteration

---

## Performance Tracker

### Initialization

```python
from services.performance_intelligence import PerformanceTracker

# Initialize tracker
tracker = PerformanceTracker(
    store_path="analytics/performance/log.jsonl"
)
```

### Logging Runs

```python
# Log a pipeline run
record = {
    'job_id': 'tfu-aws-v2-001',
    'partner_id': 'aws',
    'doc_family': 'tfu_partnership',
    'timestamp': '2025-11-14T10:30:00',
    'scores': {
        'layer0': 0.96,
        'layer1': 145,
        'layer3.5': 0.92,
        'layer4': 0.94,
        'layer5': 0.97
    },
    'overall_status': 'PASS',
    'config_path': 'example-jobs/tfu-aws-partnership-v2.json'
}

tracker.log_run(record)
```

**Note:** Pipeline automatically logs runs when `analytics.performance_tracking` is enabled.

### JSONL Format

Each line in `analytics/performance/log.jsonl` is a complete JSON record:

```jsonl
{"job_id": "tfu-aws-001", "partner_id": "aws", "scores": {...}, "timestamp": "2025-11-14T10:00:00"}
{"job_id": "tfu-google-002", "partner_id": "google", "scores": {...}, "timestamp": "2025-11-14T11:00:00"}
{"job_id": "tfu-aws-003", "partner_id": "aws", "scores": {...}, "timestamp": "2025-11-14T12:00:00"}
```

**Why JSONL?**
- ✅ Append-only (no file rewrites)
- ✅ Easy to parse line-by-line
- ✅ Robust to corruption (single line issues don't break entire file)
- ✅ Stream processing friendly

---

## Data-Driven Recommendations

### Getting Recommendations

```python
# Get recommendations for AWS partner
recs = tracker.get_recommendations(partner_id='aws')

# Returns:
# {
#   'total_runs': 15,
#   'pass_rate': 0.93,
#   'typical_page_counts': [4],
#   'high_scoring_patterns': [
#       {'pattern': 'compact_spacing', 'avg_score': 148, 'count': 8},
#       {'pattern': 'metrics_emphasis', 'avg_score': 147, 'count': 5}
#   ],
#   'common_issues': [
#       {'issue': 'layer3_visual_diff', 'frequency': 3}
#   ],
#   'avg_scores': {
#       'layer1': 145.2,
#       'layer3.5': 0.91,
#       'layer4': 0.93
#   }
# }
```

### Recommendation Types

#### 1. Typical Page Counts

**What:** Most common page counts for successful documents

**Use:** Guide layout iteration and content planning

```python
typical_counts = recs['typical_page_counts']
# [4]  # AWS docs typically 4 pages

# Use in layout iteration
if len(content_sections) > typical_counts[0]:
    # Consider more compact layout
```

---

#### 2. High-Scoring Patterns

**What:** Layout/design patterns associated with high scores

**Use:** Prioritize proven successful patterns

```python
patterns = recs['high_scoring_patterns']
# [
#   {'pattern': 'compact_spacing', 'avg_score': 148, 'count': 8},
#   {'pattern': 'metrics_emphasis', 'avg_score': 147, 'count': 5}
# ]

# Apply high-scoring pattern
if patterns[0]['pattern'] == 'compact_spacing':
    layout_config['spacing_multiplier'] = 0.85
```

---

#### 3. Common Issues

**What:** Frequently occurring validation failures

**Use:** Proactively address known problem areas

```python
issues = recs['common_issues']
# [
#   {'issue': 'layer3_visual_diff', 'frequency': 3},
#   {'issue': 'text_overflow', 'frequency': 2}
# ]

# Add extra checks for common issues
if 'layer3_visual_diff' in [i['issue'] for i in issues]:
    # Be extra careful with layout changes
```

---

#### 4. Average Scores

**What:** Historical average scores per layer

**Use:** Set realistic quality expectations

```python
avg = recs['avg_scores']
# {
#   'layer1': 145.2,
#   'layer3.5': 0.91,
#   'layer4': 0.93
# }

# Benchmark new document
if new_score < avg['layer1'] * 0.95:
    print("Warning: Below historical average")
```

---

### Global Statistics

```python
# Get overall statistics (all partners)
stats = tracker.get_stats()

# Returns:
# {
#   'total_runs': 50,
#   'pass_rate': 0.88,
#   'fail_rate': 0.12,
#   'partners': ['aws', 'google', 'cornell'],
#   'doc_families': ['tfu_partnership', 'newsletter', 'report'],
#   'avg_layer_scores': {
#       'layer1': 143.5,
#       'layer3.5': 0.89,
#       'layer4': 0.91
#   }
# }
```

---

## Analytics Dashboard

### CLI View

```bash
# View performance stats
python services/performance_intelligence.py

# Output:
# ==============================================================
# PERFORMANCE INTELLIGENCE TEST
# ==============================================================
#
# [STATS] Overall Performance
#   Total runs: 50
#   Pass rate: 88%
#   Avg Layer 1: 143.5
#   Avg Layer 3.5: 0.89
#   Avg Layer 4: 0.91
#
# [RECS] Recommendations for 'aws'
#   Total runs: 15
#   Pass rate: 93%
#   Typical page count: 4
#   High-scoring patterns: compact_spacing (148), metrics_emphasis (147)
```

### JSON Export

```python
import json

# Export stats to JSON
stats = tracker.get_stats()
with open('analytics/performance-stats.json', 'w') as f:
    json.dump(stats, f, indent=2)

# Export recommendations
recs = tracker.get_recommendations('aws')
with open('analytics/aws-recommendations.json', 'w') as f:
    json.dump(recs, f, indent=2)
```

---

## Integration

### Planning Phase Integration

Performance Intelligence automatically informs the planning phase:

```json
{
  "planning": {
    "performance_recommendations": true
  }
}
```

**Pipeline output:**
```
==============================================================
PLANNING PHASE
==============================================================

[Performance] Loading historical data...
  ✓ Analyzed 15 historical runs
  Typical page count: 4
  Avg scores: L1=145, L3.5=0.91

[Layout Iteration] Generating layout variants...
  (Uses performance data to inform variant generation)
```

### Layout Iteration Integration

```python
from services.performance_intelligence import PerformanceTracker
from services.layout_iteration_engine import LayoutIterationEngine

# Get recommendations
tracker = PerformanceTracker()
recs = tracker.get_recommendations('aws')

# Use in layout iteration
engine = LayoutIterationEngine()

# Prioritize high-scoring patterns
preferred_strategies = [
    p['pattern'] for p in recs['high_scoring_patterns'][:2]
]

result = engine.run_iteration(
    base_job_config_path='job.json',
    strategies=preferred_strategies
)
```

---

## Configuration

### Job Config

```json
{
  "analytics": {
    "performance_tracking": false,
    "partner_id": "aws",
    "doc_family": "tfu_partnership",
    "store_path": "analytics/performance/log.jsonl"
  },
  "planning": {
    "performance_recommendations": false
  }
}
```

### Enable Tracking

```json
"analytics": {
  "performance_tracking": true,
  "partner_id": "aws",
  "doc_family": "tfu_partnership"
}
```

### Enable Recommendations

```json
"planning": {
  "performance_recommendations": true
}
```

---

## Usage Examples

### Example 1: Track Quality Over Time

```python
from services.performance_intelligence import PerformanceTracker

tracker = PerformanceTracker()

# Get recent runs
stats = tracker.get_stats()
total_runs = stats['total_runs']
pass_rate = stats['pass_rate']

print(f"Quality Trend: {total_runs} runs, {pass_rate:.0%} pass rate")

# Check if improving
recent_recs = tracker.get_recommendations()
if recent_recs['avg_scores']['layer1'] > 145:
    print("✓ Above target quality")
else:
    print("⚠ Below target, review patterns")
```

---

### Example 2: Partner-Specific Insights

```python
# Compare partners
partners = ['aws', 'google', 'cornell']

for partner in partners:
    recs = tracker.get_recommendations(partner_id=partner)

    print(f"\n{partner.upper()}:")
    print(f"  Runs: {recs['total_runs']}")
    print(f"  Pass rate: {recs['pass_rate']:.0%}")
    print(f"  Avg Layer 1: {recs['avg_scores'].get('layer1', 0):.1f}")

    # Typical page count
    if recs['typical_page_counts']:
        print(f"  Typical pages: {recs['typical_page_counts'][0]}")
```

**Output:**
```
AWS:
  Runs: 15
  Pass rate: 93%
  Avg Layer 1: 145.2
  Typical pages: 4

GOOGLE:
  Runs: 8
  Pass rate: 88%
  Avg Layer 1: 143.5
  Typical pages: 5

CORNELL:
  Runs: 5
  Pass rate: 100%
  Avg Layer 1: 148.0
  Typical pages: 3
```

---

### Example 3: Predictive Quality Check

```python
# Before generating new document
def check_expected_quality(partner_id, estimated_length):
    tracker = PerformanceTracker()
    recs = tracker.get_recommendations(partner_id)

    # Check typical page count
    typical_pages = recs['typical_page_counts'][0] if recs['typical_page_counts'] else 4

    if abs(estimated_length - typical_pages) > 1:
        print(f"⚠ Warning: Estimated {estimated_length} pages")
        print(f"  Typical for {partner_id}: {typical_pages} pages")
        print(f"  Consider adjusting content density")

    # Check expected score
    avg_layer1 = recs['avg_scores'].get('layer1', 145)
    print(f"Expected Layer 1 score: ~{avg_layer1:.0f}")

    return {
        'typical_pages': typical_pages,
        'expected_score': avg_layer1
    }

# Use before generation
expectations = check_expected_quality('aws', estimated_length=6)
```

---

## Best Practices

### 1. Enable Tracking from Start

```json
// Enable in job config
"analytics": {
  "performance_tracking": true
}
```

**Why:** More data → better recommendations

---

### 2. Use Consistent Partner IDs

```json
// Good (consistent)
"partner_id": "aws"

// Bad (inconsistent)
"partner_id": "AWS"
"partner_id": "amazon-web-services"
```

**Why:** Enables accurate partner-specific analytics

---

### 3. Log Both Pass and Fail

```python
# Don't skip logging on failure!
if pipeline_failed:
    record['overall_status'] = 'FAIL'
    tracker.log_run(record)  # Log it anyway!
```

**Why:** Failure patterns are valuable for recommendations

---

### 4. Review Recommendations Regularly

```bash
# Weekly review
python services/performance_intelligence.py

# Export for analysis
python -c "
from services.performance_intelligence import PerformanceTracker
import json
tracker = PerformanceTracker()
stats = tracker.get_stats()
print(json.dumps(stats, indent=2))
" > weekly-stats.json
```

---

### 5. Clean Up Old Data (Optional)

```python
# Archive logs older than 6 months
import json
from datetime import datetime, timedelta

cutoff = datetime.now() - timedelta(days=180)

# Read all records
with open('analytics/performance/log.jsonl', 'r') as f:
    records = [json.loads(line) for line in f]

# Filter recent only
recent = [r for r in records if datetime.fromisoformat(r['timestamp']) > cutoff]

# Write back
with open('analytics/performance/log.jsonl', 'w') as f:
    for record in recent:
        f.write(json.dumps(record) + '\n')
```

---

## Troubleshooting

### Issue: No Recommendations Available

**Symptom:** `tracker.get_recommendations()` returns empty results

**Cause:** Not enough data logged yet

**Solution:**
```bash
# Check log file
cat analytics/performance/log.jsonl | wc -l

# Should have at least 3-5 runs for meaningful recommendations

# Run pipeline with tracking enabled
python pipeline.py --world-class --job-config job.json
```

---

### Issue: Performance Tracking Not Logging

**Symptom:** Log file not updated after pipeline run

**Check:**
1. Is `analytics.performance_tracking` set to `true`?
2. Does `analytics` directory exist?
3. Check pipeline output for errors

**Solution:**
```bash
# Create analytics directory
mkdir -p analytics/performance

# Enable tracking in job config
"analytics": {
  "performance_tracking": true,
  "partner_id": "aws"
}
```

---

### Issue: Recommendations Not Partner-Specific

**Symptom:** Same recommendations for all partners

**Cause:** `partner_id` not set or inconsistent

**Solution:**
```json
// Set partner_id in job config
"analytics": {
  "partner_id": "aws",  // Must be consistent!
  "performance_tracking": true
}
```

---

### Issue: Log File Corrupted

**Symptom:** `json.JSONDecodeError` when loading logs

**Cause:** Malformed JSON line

**Solution:**
```python
# Find and fix bad line
with open('analytics/performance/log.jsonl', 'r') as f:
    for i, line in enumerate(f, 1):
        try:
            json.loads(line)
        except json.JSONDecodeError:
            print(f"Bad line {i}: {line}")

# Remove bad line manually or restore from backup
```

---

## API Reference

### PerformanceTracker

```python
class PerformanceTracker:
    def __init__(self, store_path: str = "analytics/performance/log.jsonl")

    def log_run(self, record: Dict[str, Any]) -> None
        """Log a pipeline run"""

    def get_recommendations(self, partner_id: Optional[str] = None) -> Dict[str, Any]
        """Get data-driven recommendations"""

    def get_stats(self) -> Dict[str, Any]
        """Get overall statistics"""
```

### Record Format

```python
{
    'job_id': str,                # Unique job identifier
    'partner_id': str,            # Partner identifier
    'doc_family': str,            # Document family
    'timestamp': str,             # ISO 8601 timestamp
    'scores': {
        'layer0': float,
        'layer1': int,
        'layer3.5': float,
        'layer4': float,
        'layer5': float
    },
    'overall_status': str,        # 'PASS' or 'FAIL'
    'config_path': str            # Job config path
}
```

---

## Advanced Usage

### Custom Analytics Queries

```python
import json
from collections import Counter

# Load all records
with open('analytics/performance/log.jsonl', 'r') as f:
    records = [json.loads(line) for line in f]

# Custom query: Find best-performing doc families
family_scores = {}
for record in records:
    family = record['doc_family']
    layer1 = record['scores'].get('layer1', 0)

    if family not in family_scores:
        family_scores[family] = []
    family_scores[family].append(layer1)

# Calculate averages
for family, scores in family_scores.items():
    avg = sum(scores) / len(scores)
    print(f"{family}: {avg:.1f} avg (n={len(scores)})")
```

---

### Export to Dashboard

```python
# Export for external dashboard (Grafana, etc.)
import json
from datetime import datetime

tracker = PerformanceTracker()
stats = tracker.get_stats()

# Add timestamp
stats['exported_at'] = datetime.now().isoformat()

# Write to dashboard-friendly format
with open('analytics/dashboard-export.json', 'w') as f:
    json.dump(stats, f, indent=2)
```

---

## Performance Metrics

### Storage Growth

| Runs | File Size | Notes |
|------|-----------|-------|
| 10 | ~5 KB | Minimal storage |
| 100 | ~50 KB | Still very small |
| 1,000 | ~500 KB | Negligible impact |
| 10,000 | ~5 MB | Consider archiving |

### Query Performance

- **Load all records:** < 10ms (1,000 records)
- **Get recommendations:** < 50ms
- **Get stats:** < 20ms

**Recommendation:** Archive after 10,000+ records or 1 year

---

## Next Steps

- **Enable tracking:** Set `analytics.performance_tracking = true`
- **Run pipeline:** Generate some data
- **Review insights:** Check recommendations
- **Optimize:** Use data to improve quality
- **Iterate:** Continuous improvement cycle

**Documentation:** See also:
- [RAG & Personalization Guide](RAG-PERSONALIZATION-GUIDE.md)
- [Layout Iteration Guide](LAYOUT-ITERATION-GUIDE.md)
- [Agent Handoff Document](AGENT-RAG-PERF-HANDOFF.md)

---

**Questions or Issues?** Check [Troubleshooting](#troubleshooting) or review code in `services/performance_intelligence.py`.
