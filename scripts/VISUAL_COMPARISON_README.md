# Visual PDF Comparison System

Comprehensive visual regression testing system for PDF documents. Detects layout changes, text cutoffs, color shifts, and typography issues with pixel-perfect accuracy.

---

## Overview

This system provides two powerful scripts for visual quality assurance:

1. **`create-reference-screenshots.js`** - Creates high-resolution reference screenshots from a "known good" PDF
2. **`compare-pdf-visual.js`** - Compares new PDFs against references and generates detailed diff reports

### Key Features

- **Pixel-perfect comparison** using `pixelmatch` algorithm
- **Intelligent thresholds** to ignore anti-aliasing differences (< 5%)
- **Text cutoff detection** (identifies incomplete text at page boundaries)
- **Color shift detection** via dominant color analysis
- **Typography analysis** (font family, size, positioning)
- **Layout change detection** (element count, positioning)
- **Visual diff overlays** (red highlighting of differences)
- **Side-by-side comparisons** (reference | test | differences)
- **Detailed JSON reports** with metadata and analysis
- **CI/CD ready** with exit codes for automated testing

---

## Installation

The required dependencies should already be installed:

```bash
npm install pixelmatch pngjs sharp playwright canvas
```

If not installed, run:

```bash
cd T:/Projects/pdf-orchestrator
npm install --save pixelmatch pngjs sharp
```

---

## Quick Start

### Step 1: Create Reference Screenshots

First, create reference screenshots from your "known good" PDF:

```bash
node scripts/create-reference-screenshots.js exports/ukraine-final.pdf ukraine-final
```

**What it does:**
- Converts each page to high-res PNG (2400x3200px @ 2x scale)
- Extracts metadata (dimensions, colors, fonts)
- Analyzes text content and positioning
- Saves to `references/ukraine-final/`

**Output:**
```
references/
└── ukraine-final/
    ├── page-1.png
    ├── page-2.png
    ├── page-3.png
    └── metadata.json
```

### Step 2: Compare Against Reference

Now compare a new PDF version against the reference:

```bash
node scripts/compare-pdf-visual.js exports/ukraine-new.pdf ukraine-final
```

**What it does:**
- Screenshots each page of test PDF
- Compares pixel-by-pixel against reference
- Detects text cutoffs, layout changes, color shifts
- Generates diff images with red overlays
- Creates side-by-side comparison images
- Outputs detailed validation report

**Output:**
```
comparisons/
└── ukraine-final-2025-11-05T15-30-00/
    ├── page-1-test.png           # Test PDF screenshot
    ├── page-1-diff.png           # Raw diff (red = different)
    ├── page-1-comparison.png     # Side-by-side (ref | test | diff)
    ├── page-2-test.png
    ├── page-2-diff.png
    ├── page-2-comparison.png
    └── comparison-report.json    # Detailed results
```

---

## Usage Examples

### Example 1: Validate AWS Partnership Document

```bash
# Create reference from approved version
node scripts/create-reference-screenshots.js \
  exports/TEEI_AWS_Partnership.pdf \
  aws-partnership

# Compare new version
node scripts/compare-pdf-visual.js \
  exports/TEEI_AWS_Partnership_v2.pdf \
  aws-partnership
```

### Example 2: Validate Ukraine Document

```bash
# Reference
node scripts/create-reference-screenshots.js \
  "T:/TEEI/TEEI Overviews/Together for Ukraine Overviews/Together for Ukraine - Female Entrepreneurship Program.pdf" \
  ukraine-reference

# Compare recreation
node scripts/compare-pdf-visual.js \
  exports/ukraine-final.pdf \
  ukraine-reference
```

### Example 3: Validate After Design Changes

```bash
# Before making changes - create reference
node scripts/create-reference-screenshots.js exports/before.pdf before-changes

# After making changes - compare
node scripts/compare-pdf-visual.js exports/after.pdf before-changes
```

---

## Understanding the Output

### Comparison Thresholds

The system uses intelligent thresholds to classify differences:

| Threshold | Percentage | Classification | Meaning |
|-----------|------------|----------------|---------|
| Anti-aliasing | < 5% | ✅ PASS | Minor pixel differences (anti-aliasing, rendering) |
| Minor Change | 5-10% | ⚠️ MINOR | Small layout adjustments |
| Major Change | 10-20% | ⚠️ WARNING | Noticeable visual differences |
| Major Issue | 20-30% | ❌ MAJOR | Significant layout/design changes |
| Critical | > 30% | 🚨 CRITICAL | Completely different pages |

### Sample Output

```
🔍 Comparing Page 1/3...
   📊 Difference: 3.24%
   ✅ PASS
   🔍 Analyzing specific issues...
   ✅ Comparison saved: comparisons/ukraine-final-2025-11-05T15-30-00/page-1-comparison.png

🔍 Comparing Page 2/3...
   📊 Difference: 15.67%
   ⚠️  WARNING
   🔍 Analyzing specific issues...
   ⚠️  Text cutoffs detected: 2
      - "Ready to Transform Educa-": Possible text cutoff (ends with hyphen)
      - "THE EDUCATIONAL EQUALITY IN-": Possible text cutoff (ends with hyphen)
   ⚠️  Layout changes: 1
      - Font changes detected
   ✅ Comparison saved: comparisons/ukraine-final-2025-11-05T15-30-00/page-2-comparison.png

============================================================
📊 COMPARISON SUMMARY
============================================================

Test PDF: ukraine-new.pdf
Reference: ukraine-final
Pages Compared: 3

Results:
  ✅ Passed:   1 pages
  ⚠️  Minor:    0 pages
  ⚠️  Warnings: 2 pages
  ❌ Major:    0 pages
  🚨 Critical: 0 pages

Average Difference: 9.52%

Overall Verdict:
  ⚠️  WARNING - Minor visual differences detected

⚠️  Pages with Issues:

  Page 2: ⚠️  WARNING (15.67%)
    - 2 text cutoff(s)
    - 1 layout change(s)
```

### Comparison Report JSON

The `comparison-report.json` contains detailed results:

```json
{
  "testPDF": "T:/Projects/pdf-orchestrator/exports/ukraine-new.pdf",
  "reference": "ukraine-final",
  "timestamp": "2025-11-05T15:30:00.000Z",
  "testPageCount": 3,
  "referencePageCount": 3,
  "pages": [
    {
      "page": 1,
      "diffPercentage": 3.24,
      "diffPixels": 248832,
      "totalPixels": 7680000,
      "classification": "pass",
      "analysis": {
        "textCutoffs": [],
        "colorShifts": [],
        "layoutChanges": [],
        "missingElements": []
      },
      "screenshots": {
        "test": "page-1-test.png",
        "diff": "page-1-diff.png",
        "comparison": "page-1-comparison.png"
      }
    }
  ],
  "summary": {
    "passed": 1,
    "minor": 0,
    "warnings": 2,
    "major": 0,
    "critical": 0,
    "totalDiffPercentage": 28.56,
    "averageDiffPercentage": 9.52
  }
}
```

---

## Detected Issues

The system automatically detects:

### 1. Text Cutoffs

**What it detects:**
- Text extending beyond page boundaries
- Text ending with hyphens (incomplete words)
- Missing text elements compared to reference

**Example:**
```
⚠️  Text cutoffs detected: 1
   - "THE EDUCATIONAL EQUALITY IN-": Possible text cutoff (ends with hyphen)
```

### 2. Layout Changes

**What it detects:**
- Significant changes in text element count
- Font family changes
- Element positioning shifts

**Example:**
```
⚠️  Layout changes: 1
   - Font changes detected
     Missing: "Lora"
     New: "Arial"
```

### 3. Color Shifts

**What it detects:**
- Changes in dominant colors
- RGB channel mean differences
- Color profile shifts

### 4. Visual Differences

**What it detects:**
- Pixel-by-pixel differences
- Missing graphics/images
- Layout restructuring
- Spacing changes

---

## Configuration

Edit the `CONFIG` object in `compare-pdf-visual.js` to adjust settings:

```javascript
const CONFIG = {
  viewport: { width: 2400, height: 3200 }, // Screenshot size
  screenshotScale: 2,                      // Device pixel ratio (retina)

  thresholds: {
    antiAliasing: 0.05,  // 5% - ignore minor anti-aliasing
    minorChange: 0.10,   // 10% - flag as minor layout changes
    majorChange: 0.20,   // 20% - flag as major issues
    critical: 0.30,      // 30% - critical differences
  },

  pixelmatch: {
    threshold: 0.1,      // Matching sensitivity (0-1, lower = more sensitive)
    includeAA: false,    // Don't count anti-aliasing differences
    alpha: 0.1,          // Alpha channel importance
    diffColor: [255, 0, 0], // Red for differences
  }
};
```

### Adjusting Sensitivity

**More Strict** (catch smaller differences):
```javascript
thresholds: {
  antiAliasing: 0.03,  // 3%
  minorChange: 0.05,   // 5%
  majorChange: 0.10,   // 10%
  critical: 0.15,      // 15%
}
```

**More Lenient** (ignore larger differences):
```javascript
thresholds: {
  antiAliasing: 0.10,  // 10%
  minorChange: 0.20,   // 20%
  majorChange: 0.30,   // 30%
  critical: 0.50,      // 50%
}
```

---

## CI/CD Integration

### Exit Codes

The comparison script returns exit codes for CI/CD:

- **0** = Success (all pages passed or minor differences only)
- **1** = Failure (major or critical differences detected)

### Jenkins Pipeline Example

```groovy
stage('Visual Regression Test') {
  steps {
    script {
      // Create reference (only first time)
      if (!fileExists('references/production-pdf')) {
        sh 'node scripts/create-reference-screenshots.js exports/production.pdf production-pdf'
      }

      // Compare new build
      def result = sh(
        script: 'node scripts/compare-pdf-visual.js exports/new-build.pdf production-pdf',
        returnStatus: true
      )

      if (result != 0) {
        error('Visual regression test failed')
      }
    }
  }
  post {
    always {
      // Archive comparison results
      archiveArtifacts artifacts: 'comparisons/**/*.png, comparisons/**/*.json'
    }
  }
}
```

### GitHub Actions Example

```yaml
name: Visual Regression Test

on: [push, pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Create reference (if needed)
        run: |
          if [ ! -d "references/main-branch" ]; then
            node scripts/create-reference-screenshots.js exports/main.pdf main-branch
          fi

      - name: Build new PDF
        run: node scripts/create-executive-grade-pdf.js

      - name: Compare PDFs
        run: node scripts/compare-pdf-visual.js exports/teei-aws-partnership-executive.pdf main-branch

      - name: Upload comparison results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: visual-comparison
          path: comparisons/
```

---

## Advanced Usage

### Comparing Specific Pages Only

Modify the loop in `compare-pdf-visual.js`:

```javascript
// Compare only first 2 pages
const maxPages = Math.min(2, testPageCount, referenceMetadata.pageCount);
```

### Custom Diff Colors

Change the diff overlay color:

```javascript
pixelmatch: {
  diffColor: [0, 255, 0], // Green instead of red
}
```

### Ignore Specific Regions

Add mask support (future enhancement):

```javascript
// Define regions to ignore (e.g., page numbers, dates)
const ignoreMasks = [
  { x: 0, y: 0, width: 100, height: 50 }, // Top-left corner
  { x: 2300, y: 3150, width: 100, height: 50 }, // Bottom-right corner
];
```

---

## Troubleshooting

### Issue: "Reference not found"

**Problem:** Reference screenshots haven't been created yet.

**Solution:**
```bash
node scripts/create-reference-screenshots.js <pdf-path> <reference-name>
```

### Issue: High diff percentage (> 50%) on identical PDFs

**Problem:** Screen resolution or rendering differences.

**Solution:**
- Ensure both PDFs render at same resolution
- Check viewport settings match in both scripts
- Verify PDF viewer compatibility

### Issue: Text layer not detected

**Problem:** PDF doesn't have extractable text layer.

**Solution:**
- Some PDFs are image-based (scanned documents)
- Text analysis will be limited
- Pixel comparison still works

### Issue: Out of memory errors

**Problem:** Large PDFs with many pages or high resolution.

**Solution:**
- Reduce `screenshotScale` from 2 to 1
- Process fewer pages at a time
- Increase Node.js memory:
  ```bash
  node --max-old-space-size=4096 scripts/compare-pdf-visual.js ...
  ```

---

## File Structure

```
T:/Projects/pdf-orchestrator/
├── scripts/
│   ├── create-reference-screenshots.js  # Create reference
│   ├── compare-pdf-visual.js            # Compare PDFs
│   └── VISUAL_COMPARISON_README.md      # This file
│
├── references/                          # Reference screenshots
│   └── <reference-name>/
│       ├── page-1.png
│       ├── page-2.png
│       └── metadata.json
│
├── comparisons/                         # Comparison results
│   └── <reference-name>-<timestamp>/
│       ├── page-1-test.png
│       ├── page-1-diff.png
│       ├── page-1-comparison.png
│       └── comparison-report.json
│
└── exports/                             # Generated PDFs
    └── *.pdf
```

---

## Best Practices

### 1. Always Create References First

Before testing, establish a "golden standard":

```bash
node scripts/create-reference-screenshots.js exports/approved-final.pdf approved-final
```

### 2. Version Your References

Name references with versions:

```bash
node scripts/create-reference-screenshots.js exports/v1.0.pdf ukraine-v1.0
node scripts/create-reference-screenshots.js exports/v2.0.pdf ukraine-v2.0
```

### 3. Run Tests Before Commits

Add to your workflow:

```bash
# Before committing changes
npm run build-pdf
node scripts/compare-pdf-visual.js exports/new.pdf production-reference
```

### 4. Archive Comparison Results

Keep historical comparisons:

```bash
# Archive results with date
mv comparisons/latest comparisons/archive/$(date +%Y-%m-%d)
```

### 5. Review Visual Diffs

Don't rely solely on percentages - always review the comparison images:

```bash
# Open comparison images
start comparisons/ukraine-final-2025-11-05T15-30-00/page-1-comparison.png
```

---

## Integration with Existing Tools

### Integration with `validate_world_class.py`

Run visual comparison after Python validation:

```python
# In validate_world_class.py
import subprocess

def run_visual_comparison(pdf_path):
    """Run Node.js visual comparison"""
    result = subprocess.run([
        'node',
        'scripts/compare-pdf-visual.js',
        pdf_path,
        'world-class-reference'
    ], capture_output=True, text=True)

    return result.returncode == 0
```

### Integration with Pipeline

```javascript
// In orchestrator.js
import { execSync } from 'child_process';

async function validatePDF(pdfPath, referenceName) {
  try {
    execSync(`node scripts/compare-pdf-visual.js "${pdfPath}" ${referenceName}`, {
      stdio: 'inherit'
    });
    return { passed: true };
  } catch (error) {
    return { passed: false, error: error.message };
  }
}
```

---

## Extending the System

### Add Custom Detections

Edit `analyzeSpecificDifferences()` in `compare-pdf-visual.js`:

```javascript
// Detect missing images
const images = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('img')).length;
});

if (images < refPage.imageCount) {
  analysis.missingElements.push({
    type: 'image',
    expected: refPage.imageCount,
    found: images
  });
}
```

### Add Email Notifications

```javascript
import { sendAlertEmail } from './send-alert-resend.js';

// After comparison
if (comparisonResults.summary.major > 0) {
  await sendAlertEmail(
    'Visual Regression Failed',
    `Major differences detected in ${testPdfPath}`
  );
}
```

---

## Performance

**Typical execution times** (3-page document):

- Create reference: ~10 seconds
- Compare PDFs: ~15 seconds
- Total: ~25 seconds

**Optimization tips:**

1. Use headless mode (already enabled)
2. Process pages in parallel (advanced)
3. Cache reference metadata
4. Use lower resolution for CI (faster, less accurate)

---

## License

PRIVATE - Henrik Røine / TEEI

---

## Support

For issues or questions:
1. Check this README
2. Review comparison-report.json for details
3. Inspect comparison images visually
4. Adjust thresholds if needed

---

**Last Updated:** 2025-11-05
**Version:** 1.0.0
