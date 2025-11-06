# PDF Validation Checklist

Use this checklist when validating TEEI PDF documents.

## Pre-Validation Setup

- [ ] All dependencies installed (`npm install`)
- [ ] Playwright browsers installed (`npx playwright install chromium`)
- [ ] TEEI fonts installed (`scripts/install-fonts.ps1`)
- [ ] InDesign restarted after font installation
- [ ] Document created following TEEI brand guidelines

## Export Process

### For Complete Validation (RECOMMENDED)

- [ ] **Step 1:** Export document as HTML from InDesign
  - File > Export > HTML
  - Save to `exports/[document-name].html`

- [ ] **Step 2:** Run validator on HTML
  ```bash
  node scripts/validate-pdf-quality.js exports/[document-name].html
  ```

- [ ] **Step 3:** Review validation report
  - Location: `exports/validation-issues/validation-report-*.txt`
  - Check JSON: `exports/validation-issues/validation-report-*.json`
  - Review screenshots: `exports/validation-issues/screenshots/`

- [ ] **Step 4:** Fix all issues identified
  - Text cutoffs (expand containers, reduce font size)
  - Color violations (use TEEI palette only)
  - Font violations (Lora for headlines, Roboto Flex for body)
  - Image loading issues

- [ ] **Step 5:** Re-run validator to confirm fixes
  ```bash
  node scripts/validate-pdf-quality.js exports/[document-name].html
  ```

- [ ] **Step 6:** Export final PDF from InDesign
  - File > Export > Adobe PDF (Print)
  - Settings: High Quality Print
  - Save to `exports/[document-name].pdf`

- [ ] **Step 7:** Validate final PDF dimensions
  ```bash
  node scripts/validate-pdf-quality.js exports/[document-name].pdf
  ```

### For Quick Dimension Check Only

- [ ] **Step 1:** Export document as PDF from InDesign

- [ ] **Step 2:** Run validator on PDF
  ```bash
  node scripts/validate-pdf-quality.js exports/[document-name].pdf
  ```

- [ ] **Step 3:** Verify page dimensions pass
  - Should show: "All X pages have correct dimensions (8.5 x 11 inches)"

## Validation Results Checklist

### Required Passes

- [ ] ✅ **File Exists** - PDF/HTML file found successfully
- [ ] ✅ **Page Dimensions** - All pages exactly 8.5 x 11 inches
- [ ] ✅ **Text Cutoffs** - No text extends beyond boundaries
- [ ] ✅ **Image Loading** - All images loaded successfully
- [ ] ✅ **Color Validation** - Only TEEI brand colors used
- [ ] ✅ **Font Validation** - Lora + Roboto Flex only

### Exit Code Check

- [ ] Script exits with code `0` (all checks passed)
- [ ] If exit code `1`, review errors and fix issues

## TEEI Brand Compliance Checklist

### Colors
- [ ] Primary: Nordshore #00393F used for headers/key elements
- [ ] Secondary: Sky #C9E4EC used for accents
- [ ] Background: Sand #FFF1E2 or Beige #EFE1DC
- [ ] Accent: Gold #BA8F5A for premium feel (optional)
- [ ] ❌ NO copper/orange colors anywhere (except AWS logo)
- [ ] ❌ NO colors outside TEEI brand palette

### Typography
- [ ] Headlines: Lora Bold or Semibold, 28-48pt
- [ ] Document title: Lora Bold, 42pt, Nordshore
- [ ] Section headers: Lora Semibold, 28pt, Nordshore
- [ ] Subheads: Roboto Flex Medium, 18pt, Nordshore
- [ ] Body text: Roboto Flex Regular, 11pt, Black
- [ ] Captions: Roboto Flex Regular, 9pt, Gray #666666
- [ ] ❌ NO Georgia, Arial, Times New Roman, or other fonts

### Layout
- [ ] Page size: 8.5 x 11 inches (612 x 792 points)
- [ ] Margins: 40pt all sides
- [ ] Grid: 12-column with 20pt gutters
- [ ] Section breaks: 60pt spacing
- [ ] Between elements: 20pt spacing
- [ ] Between paragraphs: 12pt spacing

### Content
- [ ] All text complete (no cutoffs like "THE EDUCATIONAL EQUALITY IN-")
- [ ] All metrics show actual numbers (no "XX" placeholders)
- [ ] Call-to-action text complete (no "Ready to Transform Educa-")
- [ ] Contact information visible
- [ ] Logo clearspace maintained (minimum = icon height)

### Photography (if applicable)
- [ ] Natural lighting (not studio)
- [ ] Warm color tones (align with Sand/Beige palette)
- [ ] Authentic moments (not staged corporate stock)
- [ ] Diverse representation
- [ ] High resolution (300 DPI for print, 150+ for digital)

## Quality Assurance Tests

### Visual Inspection (Manual)
- [ ] Test at 100% zoom - all text readable
- [ ] Test at 150% zoom - no cutoffs visible
- [ ] Test at 200% zoom - text still complete
- [ ] Print preview - check print quality
- [ ] Mobile view - check responsive layout (HTML)

### Content Review
- [ ] Spelling and grammar checked
- [ ] All hyperlinks work (if applicable)
- [ ] Metadata correct (title, author, keywords)
- [ ] File size reasonable (<5 MB for web)
- [ ] Accessibility: alt text for images
- [ ] Brand voice: empowering, urgent, hopeful

### Technical Validation
- [ ] PDF/X-4 compliant (for print)
- [ ] Color mode: CMYK (print) or RGB (digital)
- [ ] Resolution: 300 DPI (print) or 150+ DPI (digital)
- [ ] Bleed: 3mm all sides (for print)
- [ ] Trim marks: included (for print)

## Post-Validation Actions

### If All Checks Pass ✅
- [ ] Save validation report for records
- [ ] Archive source InDesign file with version number
- [ ] Distribute PDF to stakeholders
- [ ] Update project documentation
- [ ] Celebrate success! 🎉

### If Checks Fail ❌
- [ ] Review error messages in console output
- [ ] Check JSON report for detailed issue data
- [ ] Review screenshots in `exports/validation-issues/screenshots/`
- [ ] Fix issues in InDesign document
- [ ] Re-export and re-validate
- [ ] Repeat until all checks pass

## Common Issues Quick Reference

| Issue | Symptom | Fix |
|-------|---------|-----|
| Text Cutoff | "THE EDUCATIONAL EQUALITY IN-" | Expand text frame or reduce font size |
| Wrong Colors | Copper/orange detected | Replace with Nordshore/Sky/Gold |
| Wrong Fonts | Georgia, Arial detected | Replace with Lora/Roboto Flex |
| Wrong Dimensions | 816x1056 instead of 612x792 | Set InDesign to 8.5x11 inches |
| Placeholder Text | "XX Students Reached" | Replace with actual metrics |
| Broken Images | Image loading failed | Check image paths and file format |

## File Naming Convention

- [ ] Follow naming pattern: `TEEI_[Project]_[Description]_v[Version]_[Date].pdf`
- [ ] Example: `TEEI_AWS_WorldClass_Partnership_v2_20251105.pdf`
- [ ] Include version number for tracking
- [ ] Use date format: YYYYMMDD

## Stakeholder Review

- [ ] Internal review by TEEI team
- [ ] Validation report shared with stakeholders
- [ ] Feedback incorporated into document
- [ ] Final approval obtained
- [ ] Production version archived

## Archive and Documentation

- [ ] Source InDesign file saved with version
- [ ] Final PDF saved to project archive
- [ ] Validation reports saved for reference
- [ ] Screenshots saved (if issues found)
- [ ] Project documentation updated
- [ ] Version history maintained

## CI/CD Integration (Optional)

- [ ] Add validation to CI/CD pipeline
- [ ] Set up automated testing on commits
- [ ] Configure failure notifications
- [ ] Create pre-commit hooks
- [ ] Enable automated report generation

## Continuous Improvement

- [ ] Track validation issues over time
- [ ] Identify common problems
- [ ] Update brand guidelines as needed
- [ ] Improve validation script (add new checks)
- [ ] Share learnings with team

---

## Quick Validation Command Reference

```bash
# Full validation (HTML)
node scripts/validate-pdf-quality.js exports/document.html

# Dimension check (PDF)
node scripts/validate-pdf-quality.js exports/document.pdf

# View report
cat exports/validation-issues/validation-report-document-*.txt

# View JSON report
cat exports/validation-issues/validation-report-document-*.json

# Check exit code
echo $?  # Linux/Mac
echo $LASTEXITCODE  # PowerShell
```

---

## Support Resources

- **Usage Guide:** `scripts/README-VALIDATOR.md`
- **Examples:** `scripts/VALIDATOR-EXAMPLES.md`
- **Summary:** `scripts/VALIDATOR-SUMMARY.md`
- **Quick Start:** `VALIDATE-PDF-QUICK-START.md`
- **Design Standards:** `reports/TEEI_AWS_Design_Fix_Report.md`
- **Brand Guidelines:** `T:/TEEI/TEEI Overviews/TEEI Design Guidelines.pdf`

---

**Remember:** Always validate HTML first for complete validation, then export final PDF!

**Created:** 2025-11-05
**Version:** 1.0.0
