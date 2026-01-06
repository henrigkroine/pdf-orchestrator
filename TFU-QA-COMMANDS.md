# TFU Design System - QA Validation Commands

**Purpose**: Canonical QA validation commands for Together for Ukraine design system compliance
**Scoring**: 150 points total (125 base + 25 TFU compliance)
**Threshold**: 140+ points (93%+) for TFU certification
**Date**: 2025-11-13
**Multi-Partner Support**: ✅ Reusable for any partnership (AWS, Google, Microsoft, etc.)

**📋 Complete Runbook**: See `TFU-MIGRATION-STEP-7-FINAL-VERIFICATION.md` for the full Step 7 execution workflow, including:
- PDF generation instructions
- All 5 QA commands in sequence
- 26-item human visual QA checklist
- Pass/fail criteria
- Results tracking table
- Troubleshooting guide

**🚀 Extending to New Partners**: See `TFU-EXTENSION-GUIDE.md` for step-by-step instructions on onboarding new partners to the TFU system.

---

## Multi-Partner TFU System

The TFU validation system is now **partner-agnostic** and reusable for any partnership document. Use the generic job template and generator to onboard new partners:

### Quick Start (New Partner)
```bash
# 1. Copy the TFU partnership template
cp example-jobs/tfu-partnership-template.json example-jobs/tfu-google-partnership.json

# 2. Replace all "REPLACE_ME" placeholders with Google-specific content

# 3. Create content JSON
# (Copy structure from data/partnership-aws-example.json)

# 4. Generate TFU layout
python create_tfu_partnership_from_json.py \
  --content-json data/google-partnership.json \
  --client-name "Google" \
  --output-prefix exports/TEEI-Google-Partnership-TFU \
  --generate-jsx

# 5. Run JSX in InDesign (File → Scripts → Other Script...)

# 6. Validate TFU compliance
python validate_document.py exports/TEEI-Google-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-google-partnership.json --strict
```

### TFU Rules (Per-Partner Flexibility)

Some partners may need slight variations from the standard TFU pattern. Use `tfu_rules` in your job config:

```json
{
  "tfu_rules": {
    "require_logo_grid": true,     // Set to false if partner doesn't have 9 logos
    "require_tfu_badge": true,     // Set to false for non-TFU variants
    "allow_flexible_metrics": false // Set to true if metrics differ
  }
}
```

**Example** (Partner with only 4 logos instead of 9):
```json
{
  "name": "TFU Partnership - Startup ABC",
  "tfu_rules": {
    "require_logo_grid": false,  // ← Skip logo grid check
    "require_tfu_badge": true,
    "allow_flexible_metrics": false
  }
}
```

**Result**: Validation will skip the 2-point logo grid check but still enforce the 3 CRITICAL checks (page count, no gold, teal).

**Note**: The 3 CRITICAL TFU checks are **always mandatory**:
1. Page count = 4 (not 3, not 5)
2. No gold color #BA8F5A
3. Teal color #00393F present

---

## Prerequisites

Ensure PDF has been generated from InDesign:
```bash
# Check exports folder
ls -la exports/TEEI-AWS-Partnership-TFU*

# Should show:
# - TEEI-AWS-Partnership-TFU.indd
# - TEEI-AWS-Partnership-TFU-PRINT.pdf
# - TEEI-AWS-Partnership-TFU-DIGITAL.pdf
```

---

## Command 1: Full TFU Validation (Recommended)

**Run comprehensive validation with TFU job config**

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

python validate_document.py \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --strict
```

**What it checks:**
- ✅ PDF structure (page count, dimensions, file size)
- ✅ Content presence (organization, partner, metrics)
- ✅ Visual hierarchy (headings, sections, CTA)
- ✅ Colors (teal present, NO gold)
- ✅ Typography (Lora + Roboto fonts)
- ✅ Images/assets (intent-aware validation)
- ✅ **TFU compliance (25 points)**:
  - Page count = 4 (not 3)
  - Teal #00393F primary color
  - NO gold #BA8F5A (forbidden)
  - TFU badge text ("Together for" + "UKRAINE")
  - Partner logo grid indicators
  - Lora + Roboto fonts (NOT Roboto Flex)

**Expected output:**
```
Starting comprehensive validation...
Running TFU design system compliance checks...

======================================================================
VALIDATION REPORT
======================================================================
[OK] Score: 148/150 (98.7%)
[OK] Rating: A+ (World-class quality)

TFU Compliance:
  ✓ Page count correct (4 pages)
  ✓ No gold color detected
  ✓ Teal color present (#00393F)
  ✓ TFU badge found
  ✓ Correct fonts (Lora + Roboto)
  ✓ Logo grid found

[OK] TFU Design System Certified
```

**Exit codes:**
- `0` = Validation passed (score ≥ 140)
- `1` = Validation failed (score < 140) [in --strict mode]

---

## Command 2: Quick TFU Compliance Check

**Run ONLY TFU-specific checks (faster)**

```bash
python validate_document.py \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --json | jq '.validations.tfu_compliance'
```

**What it checks:**
- Page count = 4
- Teal color present
- No gold color
- TFU badge text
- Logo grid
- Font compliance

**Expected output (JSON):**
```json
{
  "tfu_compliant": true,
  "page_count_correct": true,
  "no_gold_color": true,
  "teal_color_present": true,
  "tfu_badge_found": true,
  "correct_fonts": true,
  "logo_grid_found": true,
  "issues": [],
  "warnings": []
}
```

---

## Command 3: Visual Regression Test

**Compare against TFU baseline (if baseline exists)**

```bash
# First: Create baseline from approved TFU PDF
node scripts/create-reference-screenshots.js \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  tfu-aws-v1

# Then: Compare new versions against baseline
node scripts/compare-pdf-visual.js \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  tfu-aws-v1
```

**What it checks:**
- Pixel-perfect layout comparison
- Color accuracy (teal vs gold detection)
- Text cutoffs at page edges
- Font rendering consistency
- Any visual regressions

**Expected output:**
```
Visual Comparison Report:
- Page 1: 2.1% difference (✅ PASS - anti-aliasing only)
- Page 2: 1.8% difference (✅ PASS - anti-aliasing only)
- Page 3: 3.2% difference (✅ PASS - minor changes)
- Page 4: 2.5% difference (✅ PASS - anti-aliasing only)

Overall: ✅ PASS (all pages < 5% difference)
```

---

## Command 4: Structural Validation

**Validate HTML export for detailed analysis**

```bash
# Export PDF as HTML first (in InDesign)
# File → Export → HTML

node scripts/validate-pdf-quality.js \
  exports/TEEI-AWS-Partnership-TFU.html
```

**What it checks:**
- Page dimensions (8.5×11 inches)
- Text cutoffs (content beyond page boundaries)
- Image loading (all images loaded successfully)
- Color validation (TEEI brand colors present)
- Font validation (Lora + Roboto usage)

**Expected output:**
```
✅ Page Dimensions: PASS (612×792pt Letter size)
✅ Text Cutoffs: PASS (no text extending beyond boundaries)
✅ Image Loading: PASS (all images loaded)
✅ Color Validation: PASS (teal #00393F present, NO gold)
✅ Font Validation: PASS (Lora + Roboto only)

Overall: ✅ ALL CHECKS PASSED
```

---

## Command 5: Pipeline Validation (Full Stack)

**Run complete orchestration pipeline with TFU profile**

```bash
python pipeline.py \
  --job example-jobs/tfu-aws-partnership.json \
  --validate \
  --strict
```

**What it does:**
1. Connects to InDesign (if needed)
2. Checks document status
3. Validates colors in InDesign
4. Exports PDF (CMYK + RGB)
5. Runs full validation (150-point scoring)
6. Generates detailed report
7. Fails CI if score < 140

**Expected output:**
```
======================================================================
INDESIGN PIPELINE - TFU AWS PARTNERSHIP
======================================================================
[OK] Connected to InDesign
[OK] Document status: ready
[OK] Colors validated
[OK] Exported Print PDF (CMYK)
[OK] Exported Digital PDF (RGB)
[OK] Validation: 148/150 (98.7%)
[OK] TFU compliance: CERTIFIED

Pipeline completed successfully
```

---

## TFU Certification Rules

**To achieve TFU certification, a PDF MUST meet ALL of the following criteria:**

### 1. Automated Validation Score
- **Requirement**: Score ≥ 140/150 (93%+)
- **Command**: `python validate_document.py ... --job-config example-jobs/tfu-aws-partnership.json --strict`
- **Exit Code**: Must be `0` (no failures)

### 2. Critical TFU Checks (All 3 MUST Pass)
- ✅ **Page count = 4** (not 3, not 5)
- ✅ **No gold color** (#BA8F5A forbidden, will deduct 5 points if found)
- ✅ **Teal color present** (#00393F must be detected)

**Note**: Even if overall score is high, failure of ANY critical check = CERTIFICATION DENIED

### 3. Structural Integrity
- **Requirement**: All checks passed in `validate-pdf-quality.js`
- **No text cutoffs** beyond page boundaries
- **All images loaded** successfully
- **No critical layout issues**

### 4. Visual Regression (If Baseline Exists)
- **Requirement**: All pages ≤ 5% difference
- **Command**: `node scripts/compare-pdf-visual.js ... tfu-aws-v1`
- **Acceptable**: < 5% = anti-aliasing / minor rendering differences
- **Unacceptable**: > 5% = unintended layout changes or regressions

### 5. Human Visual QA
- **Requirement**: 26/26 checklist items verified
- **Checklist**: See `TFU-MIGRATION-STEP-7-FINAL-VERIFICATION.md` Phase 3
- **Key Visual Elements**:
  - 4-page structure ✓
  - Full teal cover + closing ✓
  - TFU badge (blue + yellow) ✓
  - 3×3 partner logo grid ✓
  - NO gold color anywhere ✓

### TFU Certification is REVOKED if:
- ❌ Any CRITICAL check fails (page count, gold color, teal color)
- ❌ Score < 140/150 (below 93% threshold)
- ❌ Structural validation finds critical issues
- ❌ Visual regression > 5% (unintended)
- ❌ Human QA finds major design violations

### Summary
```
TFU CERTIFIED =
  (Score ≥ 140/150) AND
  (All 3 CRITICAL checks pass) AND
  (No structural issues) AND
  (Visual diff ≤ 5% OR N/A) AND
  (Human QA approved)
```

**See**: `TFU-MIGRATION-STEP-7-FINAL-VERIFICATION.md` for complete acceptance criteria

---

## Troubleshooting

### Issue: "TFU compliance failed - page count is 3"
**Solution**: The JSX script created 3 pages instead of 4. Check `scripts/generate_tfu_aws.jsx` line 120:
```javascript
pagesPerDocument: 4  // Must be 4, not 3!
```

### Issue: "Forbidden gold color detected"
**Solution**: Gold (#BA8F5A) is NOT in TFU design system. Check ExtendScript color palette:
```javascript
// CORRECT (TFU)
teal: [0, 57, 63]  // #00393F

// FORBIDDEN (Old system)
gold: [186, 143, 90]  // #BA8F5A - DO NOT USE
```

### Issue: "TFU badge text not found"
**Solution**: Page 4 must contain "Together for" + "UKRAINE" text. Check ExtendScript lines 575-596.

### Issue: "Missing TFU fonts: Lora, Roboto"
**Solution**: Fonts not installed or not embedded in PDF.
1. Install fonts: `scripts/install-fonts.ps1`
2. Restart InDesign
3. Regenerate PDF

### Issue: "Score below threshold (e.g., 132/150)"
**Solution**: Run validation with `--json` to see detailed breakdown:
```bash
python validate_document.py \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --json > validation-report.json

# Then inspect:
jq '.validations' validation-report.json
```

---

## Scoring Breakdown (150 points total)

### Base Validation (125 points)
- **PDF Structure** (25 pts): Page count, text presence, file size, dimensions
- **Content** (25 pts): Organization, partner, metrics, sections
- **Visual Hierarchy** (20 pts): Headings, sections, CTA
- **Colors** (15 pts): Brand colors present
- **Typography** (25 pts): Lora + Roboto fonts, styles, no forbidden fonts
- **Images** (15 pts): Intent-aware validation (CMYK for print, RGB for digital)

### TFU Compliance (25 points)
- **Page count = 4** (5 pts): CRITICAL
- **No gold color** (5 pts): CRITICAL (-5 if gold found)
- **Teal color present** (5 pts): CRITICAL
- **TFU badge found** (5 pts): "Together for" + "UKRAINE" text
- **Lora + Roboto fonts** (3 pts): NOT Roboto Flex
- **Logo grid found** (2 pts): Partner logos on page 4

### Pass/Fail Thresholds
- **A+ (World-class)**: 140-150 pts (93-100%) ← TFU certified
- **A (Excellent)**: 125-139 pts (83-92%)
- **B (Good)**: 100-124 pts (67-82%)
- **C (Acceptable)**: 80-99 pts (53-66%)
- **F (Fail)**: <80 pts (<53%)

**TFU Certification requires**: 140+ points AND all 3 critical checks passing:
1. Page count = 4 ✓
2. No gold color ✓
3. Teal color present ✓

---

## CI/CD Integration

**GitHub Actions example:**

```yaml
name: TFU PDF Quality Check

on: [push, pull_request]

jobs:
  validate-tfu-pdf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install pdfplumber pillow pypdf2

      - name: Validate TFU PDF
        run: |
          python validate_document.py \
            exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
            --job-config example-jobs/tfu-aws-partnership.json \
            --strict \
            --json > validation-report.json

      - name: Check threshold
        run: |
          SCORE=$(jq '.score' validation-report.json)
          echo "TFU PDF Score: $SCORE/150"
          if [ $SCORE -lt 140 ]; then
            echo "❌ TFU validation failed (threshold: 140)"
            exit 1
          fi
          echo "✅ TFU validation passed"

      - name: Upload validation report
        uses: actions/upload-artifact@v3
        with:
          name: tfu-validation-report
          path: validation-report.json
```

---

## Quick Reference

**Most common command (full validation):**
```bash
python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs/tfu-aws-partnership.json --strict
```

**JSON output for scripting:**
```bash
python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs/tfu-aws-partnership.json --json
```

**Get TFU compliance only:**
```bash
python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs/tfu-aws-partnership.json --json | jq '.validations.tfu_compliance'
```

**Check score programmatically:**
```bash
SCORE=$(python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs/tfu-aws-partnership.json --json | jq '.score')
echo "Score: $SCORE/150"
```

---

**Last Updated**: 2025-11-13
**TFU System Version**: 3.0
**Validation Schema**: 150-point scoring (125 base + 25 TFU)
