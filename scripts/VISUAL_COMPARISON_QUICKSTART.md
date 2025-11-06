# Visual PDF Comparison - Quick Start Guide

Fast-start guide for visual regression testing of PDF documents.

---

## 5-Minute Quick Start

### 1. Create Reference (First Time Only)

```bash
node scripts/create-reference-screenshots.js exports/your-approved.pdf my-reference
```

**What this does:**
- Converts each PDF page to high-res PNG (3x scale, 300 DPI)
- Analyzes edges for text cutoffs
- Saves to `references/my-reference/`
- Creates metadata.json with color/layout info

**Output:**
```
references/
└── my-reference/
    ├── page-1.png
    ├── page-2.png
    ├── page-3.png
    └── metadata.json
```

### 2. Compare New Version

```bash
node scripts/compare-pdf-visual.js exports/your-new-version.pdf my-reference
```

**What this does:**
- Converts new PDF to same resolution
- Pixel-by-pixel comparison with pixelmatch
- Detects differences > 5% (intelligent thresholds)
- Generates diff images with red overlay
- Creates side-by-side comparison images
- Outputs detailed JSON report

**Output:**
```
comparisons/
└── my-reference-2025-11-05T15-30-00/
    ├── page-1-test.png           # New version
    ├── page-1-diff.png           # Differences (red)
    ├── page-1-comparison.png     # Side-by-side
    └── comparison-report.json    # Full results
```

### 3. Review Results

**Console output:**
```
============================================================
📊 COMPARISON SUMMARY
============================================================

Test PDF: your-new-version.pdf
Reference: my-reference
Pages Compared: 3

Results:
  ✅ Passed:   2 pages
  ⚠️  Minor:    0 pages
  ⚠️  Warnings: 1 pages
  ❌ Major:    0 pages
  🚨 Critical: 0 pages

Average Difference: 2.45%

Overall Verdict:
  ⚠️  WARNING - Minor visual differences detected
```

**Open comparison images:**
```bash
# Windows
start comparisons/my-reference-2025-11-05T15-30-00/page-1-comparison.png

# View all
explorer comparisons/my-reference-2025-11-05T15-30-00
```

---

## Real-World Example

### Testing TEEI Ukraine Document

```bash
# Step 1: Create reference from approved version
node scripts/create-reference-screenshots.js \
  exports/ukraine-perfect.pdf \
  ukraine-approved

# Output:
# ✅ Reference Screenshots Created Successfully!
# 📊 Summary:
#    Document: ukraine-approved
#    Pages: 4
#    Screenshots: 4

# Step 2: Test new build
node scripts/compare-pdf-visual.js \
  exports/ukraine-new-build.pdf \
  ukraine-approved

# Output:
# ============================================================
# 📊 COMPARISON SUMMARY
# ============================================================
#
# Test PDF: ukraine-new-build.pdf
# Reference: ukraine-approved
# Pages Compared: 4
#
# Results:
#   ✅ Passed:   4 pages
#   ⚠️  Minor:    0 pages
#   ⚠️  Warnings: 0 pages
#   ❌ Major:    0 pages
#   🚨 Critical: 0 pages
#
# Average Difference: 0.00%
#
# Overall Verdict:
#   ✅ PASSED - All pages match reference
```

---

## Understanding Results

### Comparison Thresholds

| Diff % | Classification | Meaning | Action |
|--------|----------------|---------|--------|
| < 5% | ✅ PASS | Anti-aliasing only | Deploy |
| 5-10% | ⚠️ MINOR | Small differences | Review |
| 10-20% | ⚠️ WARNING | Layout changes | Investigate |
| 20-30% | ❌ MAJOR | Significant issues | Fix required |
| > 30% | 🚨 CRITICAL | Completely different | Do not deploy |

### Exit Codes (CI/CD)

- **0** = Success (passed or minor warnings)
- **1** = Failure (major or critical issues)

---

## Common Scenarios

### Scenario 1: First-Time Setup

```bash
# Use your production PDF as reference
node scripts/create-reference-screenshots.js \
  exports/production-v1.0.pdf \
  production-v1

# Test against it
node scripts/compare-pdf-visual.js \
  exports/staging-build.pdf \
  production-v1
```

### Scenario 2: Before Deploying Changes

```bash
# Already have reference from approved version
# Just compare new build
node scripts/compare-pdf-visual.js \
  exports/latest-build.pdf \
  approved-version

# If PASSED, safe to deploy
# If FAILED, review comparison images
```

### Scenario 3: Detecting Text Cutoffs

```bash
# Create reference from working version
node scripts/create-reference-screenshots.js \
  exports/working-no-cutoffs.pdf \
  working-reference

# Compare version with suspected cutoffs
node scripts/compare-pdf-visual.js \
  exports/version-with-issues.pdf \
  working-reference

# Output will show:
# ⚠️  New edge content detected: bottom (15.23% content, reference had none)
#    - bottom: New content at bottom edge (possible text cutoff)
```

### Scenario 4: Tracking Changes Over Time

```bash
# Version 1.0 (baseline)
node scripts/create-reference-screenshots.js \
  exports/v1.0.pdf \
  version-1.0

# Version 2.0 comparison
node scripts/compare-pdf-visual.js \
  exports/v2.0.pdf \
  version-1.0

# Review changes, then create new reference
node scripts/create-reference-screenshots.js \
  exports/v2.0.pdf \
  version-2.0

# Now v2.0 is the new baseline
```

---

## Automated Testing

### Pre-Commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run build-pdf
node scripts/compare-pdf-visual.js exports/new-build.pdf production-reference

if [ $? -ne 0 ]; then
  echo "❌ Visual regression test failed!"
  echo "Review comparison images before committing."
  exit 1
fi
```

### CI/CD Pipeline (Jenkins)

```groovy
stage('Visual Regression') {
  steps {
    sh 'npm run build-pdf'
    sh 'node scripts/compare-pdf-visual.js exports/build.pdf production-v1'
  }
  post {
    always {
      archiveArtifacts 'comparisons/**/*.png, comparisons/**/*.json'
    }
    failure {
      emailext(
        subject: "Visual Regression Failed",
        body: "Check archived comparison images",
        attachmentsPattern: 'comparisons/**/page-*-comparison.png'
      )
    }
  }
}
```

### GitHub Actions

```yaml
- name: Visual Regression Test
  run: |
    node scripts/compare-pdf-visual.js exports/build.pdf main-branch

- name: Upload Comparison Results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: visual-comparison
    path: comparisons/
```

---

## Troubleshooting

### "Reference not found"

```bash
# Error: Reference not found: my-reference
# Solution: Create reference first
node scripts/create-reference-screenshots.js exports/approved.pdf my-reference
```

### High diff % on identical PDFs

```bash
# If identical PDFs show > 5% diff:
# 1. Check both PDFs are exactly the same file
# 2. Try recreating reference
# 3. Check for rendering issues (fonts, colors)

# Example:
node scripts/create-reference-screenshots.js exports/test.pdf test-ref
node scripts/compare-pdf-visual.js exports/test.pdf test-ref
# Should show: 0.00% difference
```

### Memory issues

```bash
# For large PDFs, increase Node memory:
node --max-old-space-size=4096 scripts/compare-pdf-visual.js ...
```

### Adjusting sensitivity

Edit `scripts/compare-pdf-visual.js`:
```javascript
// Line 33-38: Thresholds
thresholds: {
  antiAliasing: 0.03,  // More strict (3%)
  minorChange: 0.08,   // or
  majorChange: 0.15,   // More lenient (15%)
  critical: 0.25,
}
```

---

## What Gets Detected

### Automatically Detected Issues

1. **Text Cutoffs**
   - Content at page edges (top/bottom/left/right)
   - New edge content compared to reference
   - Reports content density % at each edge

2. **Layout Changes**
   - Page dimension differences
   - Element repositioning
   - Spacing changes

3. **Visual Differences**
   - Color shifts (tracked via dominant colors)
   - Missing/added graphics
   - Typography changes
   - Any pixel-level differences

### Example Detection Output

```
🔍 Comparing Page 2/3...
   📊 Difference: 12.45%
   ❌ MAJOR
   🔍 Analyzing edges for text cutoffs...
   ⚠️  New edge content detected: bottom (18.23% content, reference had none)
      - bottom: New content at bottom edge (possible text cutoff)
   ✅ Comparison saved: comparisons/.../page-2-comparison.png
```

---

## Best Practices

### 1. Version Your References

```bash
# Good: Version-specific references
node scripts/create-reference-screenshots.js exports/v1.0.pdf ukraine-v1.0
node scripts/create-reference-screenshots.js exports/v2.0.pdf ukraine-v2.0

# Bad: Overwriting single reference
node scripts/create-reference-screenshots.js exports/new.pdf ukraine  # Loses history
```

### 2. Test Early and Often

```bash
# After every significant change
npm run build-pdf
node scripts/compare-pdf-visual.js exports/latest.pdf production-baseline
```

### 3. Keep Reference Fresh

```bash
# When approved version changes, update reference
node scripts/create-reference-screenshots.js \
  exports/newly-approved.pdf \
  production-baseline
```

### 4. Review Visual Diffs

```bash
# Don't rely only on percentages
# Always open comparison images
start comparisons/latest/page-1-comparison.png

# Look for:
# - Text cutoffs
# - Color accuracy
# - Spacing consistency
# - Font rendering
```

### 5. Document Your Baseline

```bash
# Create README in references/
echo "ukraine-v1.0: Approved 2025-11-05 by Henrik" > references/README.md
```

---

## File Structure

```
T:/Projects/pdf-orchestrator/
│
├── scripts/
│   ├── create-reference-screenshots.js  # Create reference
│   ├── compare-pdf-visual.js            # Compare PDFs
│   ├── VISUAL_COMPARISON_README.md      # Full docs
│   └── VISUAL_COMPARISON_QUICKSTART.md  # This file
│
├── exports/                             # Your PDFs
│   ├── ukraine-perfect.pdf
│   ├── ukraine-new-build.pdf
│   └── ...
│
├── references/                          # Reference screenshots
│   ├── ukraine-approved/
│   │   ├── page-1.png
│   │   ├── page-2.png
│   │   └── metadata.json
│   └── production-v1/
│       └── ...
│
└── comparisons/                         # Comparison results
    └── ukraine-approved-2025-11-05T15-30-00/
        ├── page-1-test.png
        ├── page-1-diff.png
        ├── page-1-comparison.png
        ├── page-2-test.png
        ├── page-2-diff.png
        ├── page-2-comparison.png
        └── comparison-report.json
```

---

## Next Steps

1. **Create your first reference:**
   ```bash
   node scripts/create-reference-screenshots.js exports/your-approved.pdf my-first-ref
   ```

2. **Test against it:**
   ```bash
   node scripts/compare-pdf-visual.js exports/your-test.pdf my-first-ref
   ```

3. **Review the comparison images:**
   ```bash
   explorer comparisons\my-first-ref-*
   ```

4. **Read full docs for advanced features:**
   - `scripts/VISUAL_COMPARISON_README.md` - Complete documentation
   - Configuration options
   - CI/CD integration
   - Custom thresholds
   - Extension examples

---

**Questions?** Check the full README: `scripts/VISUAL_COMPARISON_README.md`

**Last Updated:** 2025-11-05
