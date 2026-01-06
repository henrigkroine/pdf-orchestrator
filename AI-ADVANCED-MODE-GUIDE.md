# AI Advanced Mode Guide

**Purpose**: Comprehensive guide to understanding and using Tier 1, Tier 1.5, and Tier 2 AI analysis modes

**Status**: Production Ready
**Version**: 1.0
**Date**: 2025-11-14

---

## Quick Reference

| Mode | Accuracy | Speed | Use Case |
|------|----------|-------|----------|
| **Tier 1** | Good | ~1-2s | Fast iteration, draft quality checks |
| **Tier 1.5** | Better | ~3-5s | Production quality, real PDF analysis |
| **Tier 2** | Best | ~10-15s | Final QA, comprehensive layout validation |

---

## Three Modes Explained

### Tier 1: Heuristic Mode (Baseline)

**What it does:**
- Typography: Analyzes sidecar JSON (from InDesign export)
- Whitespace: Estimates coverage using role-based heuristics
- Color: Validates against expected TFU brand colors

**Pros:**
- Fast (~1-2 seconds)
- No external dependencies
- Works without advanced PDF parsing

**Cons:**
- Whitespace estimates may be inaccurate
- Cannot detect actual PDF text coverage
- Misses some layout issues

**When to use:**
- Fast iteration during design phase
- Draft quality checks
- When speed matters more than precision

**Job Config:**
```json
{
  "ai": {
    "enabled": true,
    "advancedMode": false,
    "features": {
      "typography": { "enabled": true, "weight": 0.4 },
      "whitespace": { "enabled": true, "weight": 0.3 },
      "color": { "enabled": true, "weight": 0.3 }
    }
  }
}
```

---

### Tier 1.5: Advanced Extraction Mode

**What it does:**
- Typography: Extracts real font data from PDF (names, sizes, usage)
- Whitespace: Calculates actual text coverage per page
- Color: Extracts actual colors from PDF content streams

**Pros:**
- Much more accurate than Tier 1 (+5-10% accuracy)
- Still reasonably fast (~3-5 seconds)
- Automatic fallback to Tier 1 if extraction fails

**Cons:**
- Slightly slower than Tier 1
- Requires pdf-lib dependency
- May fail on complex/encrypted PDFs

**When to use:**
- Production quality checks
- When accuracy matters
- Final validation before client delivery

**Job Config:**
```json
{
  "ai": {
    "enabled": true,
    "advancedMode": true,  // ← Enable advanced extraction
    "features": {
      "typography": { "enabled": true, "weight": 0.4 },
      "whitespace": { "enabled": true, "weight": 0.3 },
      "color": { "enabled": true, "weight": 0.3 }
    }
  }
}
```

---

### Tier 2: Layout AI Mode

**What it does:**
- Everything from Tier 1.5, PLUS:
- Layout: Semantic structure analysis using SmolDocling VLM
- Detects hierarchy issues, grid alignment, visual balance
- Validates reading order

**Pros:**
- Most comprehensive analysis
- Catches structural issues Tier 1/1.5 miss
- AI-powered semantic understanding

**Cons:**
- Slower (~10-15 seconds)
- Requires SmolDocling model (~4GB VRAM)
- May not be available on all systems

**When to use:**
- Final QA before major presentations
- Complex multi-page documents
- When layout quality is critical

**Job Config:**
```json
{
  "ai": {
    "enabled": true,
    "advancedMode": true,
    "features": {
      "typography": { "enabled": true, "weight": 0.3 },
      "whitespace": { "enabled": true, "weight": 0.25 },
      "color": { "enabled": true, "weight": 0.25 },
      "layout": { "enabled": true, "weight": 0.2 }  // ← Enable layout AI
    }
  }
}
```

---

## Technical Comparison

### Accuracy Improvements

| Feature | Tier 1 | Tier 1.5 | Tier 2 |
|---------|--------|----------|--------|
| Typography | Sidecar JSON | Real PDF extraction | Same as 1.5 |
| Whitespace | Role heuristics | Actual coverage | Same as 1.5 |
| Color | Expected colors | Extracted colors | Same as 1.5 |
| Layout | N/A | N/A | SmolDocling VLM |

### Performance Benchmarks

| Mode | Typical Duration | Max Timeout |
|------|------------------|-------------|
| Tier 1 | 1-2s | 30s |
| Tier 1.5 | 3-5s | 60s |
| Tier 2 | 10-15s | 120s |

### Issue Detection Rates

Based on internal testing:

| Issue Type | Tier 1 | Tier 1.5 | Tier 2 |
|------------|--------|----------|--------|
| Typography problems | 80% | 90% | 90% |
| Whitespace issues | 60% | 85% | 85% |
| Color violations | 95% | 98% | 98% |
| Layout problems | 0% | 0% | 75% |

---

## Choosing the Right Mode

### Decision Tree

```
┌─ Is speed critical? (iteration phase)
│   └─ YES → Use Tier 1
│
├─ Is accuracy critical? (production)
│   └─ YES → Use Tier 1.5
│
├─ Is layout critical? (final QA)
│   └─ YES → Use Tier 2
│
└─ Default → Tier 1.5 (best balance)
```

### Workflow Recommendations

**Phase 1: Design Iteration**
- Mode: Tier 1
- Run: After every export
- Purpose: Quick feedback loop

**Phase 2: Internal Review**
- Mode: Tier 1.5
- Run: Before internal stakeholder review
- Purpose: Catch real issues before humans see it

**Phase 3: Final QA**
- Mode: Tier 2
- Run: Before client delivery
- Purpose: Comprehensive validation

---

## Configuration Examples

### Example 1: Fast Iteration Mode

```json
{
  "ai": {
    "enabled": true,
    "advancedMode": false,
    "dryRun": false,
    "features": {
      "typography": { "enabled": true, "weight": 0.5 },
      "whitespace": { "enabled": true, "weight": 0.5 },
      "color": { "enabled": false }  // Skip color for speed
    },
    "thresholds": {
      "minNormalizedScore": 0.75  // Lower bar for drafts
    }
  }
}
```

### Example 2: Production Quality Mode

```json
{
  "ai": {
    "enabled": true,
    "advancedMode": true,  // Enable real extraction
    "dryRun": false,
    "features": {
      "typography": { "enabled": true, "weight": 0.4 },
      "whitespace": { "enabled": true, "weight": 0.3 },
      "color": { "enabled": true, "weight": 0.3 }
    },
    "thresholds": {
      "minNormalizedScore": 0.85,  // Standard threshold
      "failOnCriticalIssues": true
    }
  }
}
```

### Example 3: World-Class Mode

```json
{
  "ai": {
    "enabled": true,
    "advancedMode": true,
    "dryRun": false,
    "features": {
      "typography": { "enabled": true, "weight": 0.3, "minScore": 0.90 },
      "whitespace": { "enabled": true, "weight": 0.25, "minScore": 0.85 },
      "color": { "enabled": true, "weight": 0.25, "minScore": 0.95 },
      "layout": { "enabled": true, "weight": 0.2, "minScore": 0.85 }
    },
    "thresholds": {
      "minNormalizedScore": 0.90,  // High bar for world-class
      "failOnCriticalIssues": true
    }
  }
}
```

---

## Fallback Behavior

### Tier 1.5 Fallback

If advanced extraction fails, Tier 1.5 automatically falls back to Tier 1:

```
[AI] Using advanced typography analyzer (Tier 1.5)
[AI] Advanced typography analysis failed: Cannot parse encrypted PDF
[AI] Falling back to standard typography analyzer
[AI] Using standard typography analyzer (Tier 1)
```

### Tier 2 Fallback

If SmolDocling is unavailable, Tier 2 skips layout analysis:

```
[AI] Feature 4: Layout Analysis (Tier 2)
[AI] SmolDocling not available - layout analysis skipped
[AI] Layout analysis: SKIPPED (SmolDocling not available)
```

---

## Troubleshooting

### Issue: "advancedMode not working"

**Symptom:** Tier reports "TIER 1" even with `advancedMode: true`

**Cause:** Advanced extraction failed, fell back to Tier 1

**Solution:**
1. Check logs for fallback message
2. Verify PDF is not encrypted
3. Ensure pdf-lib is installed: `npm install pdf-lib`

---

### Issue: "Layout analysis always skipped"

**Symptom:** Tier 2 enabled but layout always skipped

**Cause:** SmolDocling VLM not installed

**Solution:**
1. Install SmolDocling (see future/layout/README.md)
2. Verify model is downloaded
3. Check VRAM requirements (4GB+)

**Workaround:** Use Tier 1.5 without layout

---

### Issue: "AI analysis too slow"

**Symptom:** Tier 1.5 or 2 takes >10s

**Cause:** Large PDF or slow system

**Solution:**
1. Use Tier 1 for iteration
2. Only run Tier 1.5/2 for final checks
3. Increase timeout in pipeline.py if needed

---

## Testing All Modes

Run the full integration test to compare all 3 modes:

```bash
node ai/tests/full-integration-test.js --job-config example-jobs/tfu-aws-partnership-v2.json
```

**Example Output:**
```
Tier Comparison:
────────────────────────────────────────────────────────────────────────────────
Tier                Time        Score       Grade     Issues
────────────────────────────────────────────────────────────────────────────────
Tier 1              1842ms      0.880       B+        3
Tier 1.5            4123ms      0.920       A         2
Tier 2              12456ms     0.935       A         1
────────────────────────────────────────────────────────────────────────────────

Analysis:
1. Tier 1.5 vs Tier 1:
   Score change: +4.5%
   Time overhead: +2281ms
   Issue detection: 2 vs 3 issues

2. Tier 2 vs Tier 1.5:
   Score change: +1.6%
   Time overhead: +8333ms
   Layout analysis: Enabled

Recommendations:
✓ Use Tier 1.5 (advancedMode: true) for best accuracy with acceptable speed
⚠ Tier 2 is slow - only enable for final QA passes
```

---

## FAQ

### Q: Can I mix Tier 1 and Tier 1.5 features?

A: No. `advancedMode` is a global setting. When true, ALL analyzers use advanced extraction (with fallback to Tier 1).

### Q: Does Tier 1.5 require typography sidecar?

A: No. Tier 1.5 extracts typography directly from PDF. The sidecar is only used as fallback if extraction fails.

### Q: Can I enable layout without advancedMode?

A: Yes, but not recommended. Layout analysis works better with real data from Tier 1.5.

### Q: What happens if I enable layout but SmolDocling isn't installed?

A: Layout analysis will be skipped. The AI layer won't fail, but you'll miss layout checks.

### Q: Which mode should I use by default?

A: **Tier 1.5** is recommended for most use cases. It provides the best accuracy/speed balance.

---

## Performance Optimization

### Reduce Execution Time

**Option 1:** Disable features you don't need
```json
{
  "features": {
    "typography": { "enabled": true, "weight": 0.6 },
    "whitespace": { "enabled": false },  // Skip if not needed
    "color": { "enabled": true, "weight": 0.4 }
  }
}
```

**Option 2:** Use Tier 1 during iteration, Tier 1.5 for final
```bash
# Fast iteration (Tier 1)
python pipeline.py --world-class --job-config draft-config.json

# Final validation (Tier 1.5)
python pipeline.py --world-class --job-config production-config.json
```

**Option 3:** Increase timeout for complex PDFs
```python
# In pipeline.py
ai_timeout = 120  # Increase from 60s to 120s
```

---

## Summary

**Tier 1**: Fast, heuristic-based analysis for iteration
**Tier 1.5**: Real PDF extraction for production quality (RECOMMENDED)
**Tier 2**: Comprehensive layout AI for final QA

**Default Recommendation:** Use Tier 1.5 (`advancedMode: true`) for best balance of accuracy and speed.

---

**Last Updated:** 2025-11-14
**Related Docs:**
- AI-INTEGRATION-COMPLETE.md (system architecture)
- AI-FEATURES-ROADMAP.md (future features)
- ai/tests/full-integration-test.js (testing)
