# Typography Inspector Guide

**Comprehensive typography inspection system for TEEI documents**
Version 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [8 Typography Categories](#8-typography-categories)
5. [AI-Powered Validation](#ai-powered-validation)
6. [Scoring System](#scoring-system)
7. [Common Issues & Fixes](#common-issues--fixes)
8. [TEEI Typography Standards](#teei-typography-standards)
9. [Advanced Usage](#advanced-usage)
10. [Integration](#integration)

---

## Overview

The **Typography Inspector** is a comprehensive AI-powered system for validating typography quality, readability, and professional standards in PDF documents. It analyzes **8 key categories** using **5 different AI models** to provide world-class typography critique.

### Key Features

✅ **8 Validation Categories**
- Font usage validation
- Type scale compliance
- Line height and spacing
- Kerning and micro-typography
- Readability analysis
- Typography hierarchy
- Professional typography standards
- Cross-platform consistency

✅ **Multi-Model AI Integration**
- GPT-4o for font appropriateness
- GPT-5 for spacing optimization
- Claude Opus 4.1 for type scale reasoning
- Claude Sonnet 4.5 for micro-typography
- Gemini 2.5 Pro for readability analysis

✅ **Comprehensive Reporting**
- Overall typography score (0-100)
- Category-specific scores
- Issue identification with locations
- Automated fix suggestions
- Before/after comparison
- Multiple output formats (JSON, HTML, Markdown, CSV)

✅ **TEEI Brand Compliance**
- Validates against TEEI typography standards
- Checks Lora and Roboto Flex usage
- Verifies color palette compliance
- Ensures brand voice consistency

---

## Installation

### Prerequisites

```bash
node >= 16.0.0
npm >= 8.0.0
```

### Install Dependencies

```bash
cd /home/user/pdf-orchestrator
npm install pdf-lib pdf-parse fontkit opentype.js playwright sharp pixelmatch canvas pngjs
```

### Verify Installation

```bash
node scripts/inspect-typography.js --help
```

---

## Quick Start

### Basic Inspection

```bash
node scripts/inspect-typography.js exports/document.pdf
```

### Inspect with HTML Report

```bash
node scripts/inspect-typography.js exports/document.pdf --format html
```

### Apply Automated Fixes

```bash
node scripts/inspect-typography.js exports/document.pdf --fix
```

### Compare with Baseline

```bash
node scripts/inspect-typography.js exports/v2.pdf --compare exports/v1.pdf
```

### Preview Fixes (Dry Run)

```bash
node scripts/inspect-typography.js exports/document.pdf --fix --dry-run
```

---

## 8 Typography Categories

### 1. Font Usage Validation

**Checks:**
- TEEI brand fonts (Lora for headlines, Roboto for body)
- Font embedding and subsetting
- Font substitution detection
- Licensing compliance
- Font appropriateness

**AI Model:** GPT-4o

**Common Issues:**
- ❌ Non-brand fonts used
- ❌ Fonts not embedded
- ❌ Font substitution detected
- ❌ Wrong font for text type (body font for headlines)

**Fixes:**
- Replace non-brand fonts with Lora or Roboto
- Embed all fonts in PDF
- Install missing fonts to prevent substitution

---

### 2. Type Scale Validation

**Checks:**
- Modular scale compliance (8 ratios supported)
- Font size hierarchy (H1 > H2 > H3 > body)
- Minimum/maximum size constraints
- Size relationship consistency
- TEEI scale compliance (42pt, 28pt, 18pt, 11pt, 9pt)

**AI Model:** Claude Opus 4.1

**Common Issues:**
- ❌ Body text too small (< 11pt)
- ❌ Inconsistent heading sizes
- ❌ Size jumps too large or too small
- ❌ Not following modular scale

**Fixes:**
- Use TEEI type scale: 42pt (H1), 28pt (H2), 18pt (H3), 11pt (body), 9pt (caption)
- Maintain consistent scale ratio (perfect fourth: 1.333)
- Ensure minimum 2pt difference between levels

---

### 3. Line Height and Spacing

**Checks:**
- Line height validation (1.5x body, 1.2x headlines)
- Paragraph spacing (12pt target)
- Letter spacing (tracking)
- Word spacing consistency
- Widow and orphan detection

**AI Model:** GPT-5

**Common Issues:**
- ❌ Line height too tight (< 1.2x)
- ❌ Inconsistent paragraph spacing
- ❌ Widows (single word on last line)
- ❌ Orphans (single line at top of page)
- ❌ Excessive letter spacing

**Fixes:**
- Body text: 1.5x line height (e.g., 11pt text = 16.5pt leading)
- Headlines: 1.2x line height
- Paragraph spacing: 12pt
- Fix widows by adjusting line breaks or text

---

### 4. Kerning and Micro-Typography

**Checks:**
- Problematic kerning pairs (AV, WA, To, etc.)
- Ligature usage (fi, fl, ff, ffi, ffl)
- Optical vs metric kerning
- Small caps validation
- Hanging punctuation

**AI Model:** Claude Sonnet 4.5

**Common Issues:**
- ❌ Poor kerning on "AV", "WA", "To"
- ❌ Missing ligatures (fi, fl)
- ❌ Faux small caps (scaled capitals)
- ❌ Punctuation not hanging

**Fixes:**
- Enable OpenType ligatures (liga feature)
- Apply optical kerning to headlines
- Use true small caps (smcp feature), not scaled capitals
- Enable hanging punctuation for clean margins

---

### 5. Readability Analysis

**Checks:**
- Line length (45-75 characters ideal)
- Text alignment appropriateness
- Contrast ratios (WCAG AAA: 7:1)
- Rag quality (for non-justified text)
- River detection (in justified text)

**AI Model:** Gemini 2.5 Pro

**Common Issues:**
- ❌ Lines too long (> 75 characters)
- ❌ Low contrast (< 7:1 for AAA)
- ❌ Poor rag quality (jagged edge)
- ❌ Rivers in justified text
- ❌ Center-aligned body text

**Fixes:**
- Narrow columns to 45-75 characters
- Increase contrast to 7:1 minimum (WCAG AAA)
- Use left-alignment for body text
- Enable hyphenation for justified text
- Adjust line breaks for better rag

---

### 6. Typography Hierarchy

**Checks:**
- Heading structure (H1-H6)
- Visual hierarchy clarity
- Emphasis techniques (bold, italic, color)
- Consistency across pages
- Hierarchical progression

**AI Model:** GPT-4o

**Common Issues:**
- ❌ No H1 heading
- ❌ Multiple H1s per document
- ❌ Skipped heading levels (H1 → H3)
- ❌ Inconsistent heading sizes
- ❌ Overuse of emphasis

**Fixes:**
- Use single H1 per document
- Don't skip heading levels
- Maintain consistent sizes for each level
- Use emphasis sparingly (< 20% of text)

---

### 7. Professional Typography Standards

**Checks:**
- Smart quotes (" " vs " ")
- Apostrophes (' vs ')
- Em dashes (— vs --)
- Ellipses (… vs ...)
- Non-breaking spaces
- Number formatting (1,000 vs 1000)

**AI Model:** Claude Opus 4.1

**Common Issues:**
- ❌ Straight quotes instead of smart quotes
- ❌ Straight apostrophes
- ❌ Double hyphens instead of em dashes
- ❌ Three periods instead of ellipsis
- ❌ Numbers without thousands separators

**Fixes:**
- Replace " with " and "
- Replace ' with '
- Replace -- with —
- Replace ... with …
- Format numbers: 1,000 not 1000
- Use non-breaking spaces (10 GB not 10 GB)

---

### 8. Cross-Platform Consistency

**Checks:**
- Font rendering across devices
- Embedded vs system fonts
- Subset font validation
- OpenType feature availability

**Common Issues:**
- ❌ Fonts not embedded (will substitute)
- ❌ Full fonts embedded (large file size)
- ❌ Missing OpenType features

**Fixes:**
- Embed all fonts as subsets
- Test on multiple devices/platforms
- Ensure OpenType features are supported

---

## AI-Powered Validation

### AI Model Assignments

| Category | AI Model | Provider | Purpose |
|----------|----------|----------|---------|
| **Fonts** | GPT-4o | OpenAI | Font appropriateness and brand compliance |
| **Scale** | Claude Opus 4.1 | Anthropic | Type scale reasoning and critique |
| **Spacing** | GPT-5 | OpenAI | Line spacing and widow/orphan optimization |
| **Kerning** | Claude Sonnet 4.5 | Anthropic | Micro-typography and kerning analysis |
| **Readability** | Gemini 2.5 Pro | Google | Readability and rag quality assessment |
| **Hierarchy** | GPT-4o | OpenAI | Hierarchy effectiveness and clarity |
| **Polish** | Claude Opus 4.1 | Anthropic | Typography polish and refinement |

### Why Multi-Model?

Each AI model has specific strengths:

- **GPT-4o**: Excellent at assessing appropriateness and effectiveness
- **GPT-5**: Advanced optimization and problem-solving
- **Claude Opus**: Deep reasoning about complex typography principles
- **Claude Sonnet**: Fast, detailed analysis of micro-typography
- **Gemini Pro**: Superior readability and flow assessment

### Disabling AI

For faster inspection (without AI insights):

```bash
node scripts/inspect-typography.js exports/document.pdf --no-ai
```

---

## Scoring System

### Score Ranges

| Score | Grade | Description |
|-------|-------|-------------|
| **95-100** | 🏆 PERFECT | Professional publication quality |
| **90-94** | ✨ EXCELLENT | Minor improvements possible |
| **85-89** | 👍 VERY GOOD | Some polish needed |
| **80-84** | ✓ GOOD | Multiple improvements available |
| **70-79** | ⚠️ FAIR | Several issues to fix |
| **< 70** | ❌ POOR | Major typography work needed |

### Weighted Scoring

Overall score is calculated using weighted average:

```
Overall Score = (
  Fonts × 15% +
  Scale × 15% +
  Spacing × 15% +
  Kerning × 10% +
  Readability × 20% +  ← Most important
  Hierarchy × 15% +
  Polish × 10%
) / 100
```

### Exit Codes

- **0**: Score >= 80 (Good or better)
- **1**: Score < 80 (Needs improvement)

Useful for CI/CD pipelines:

```bash
node scripts/inspect-typography.js exports/document.pdf
if [ $? -eq 0 ]; then
  echo "Typography quality acceptable"
else
  echo "Typography needs improvement"
  exit 1
fi
```

---

## Common Issues & Fixes

### Issue: "Straight quotes detected"

**Problem:** Document uses " instead of " and "

**Fix:**
```bash
# Automated fix
node scripts/inspect-typography.js exports/document.pdf --fix

# Manual: Find & Replace in source
" → " (opening)
" → " (closing)
' → '
```

**Impact:** Significantly improves typographic quality

---

### Issue: "Body text too small"

**Problem:** Body text < 11pt (TEEI minimum)

**Fix:**
- Increase body text to 11pt minimum
- Adjust layout to accommodate larger text
- Reduce column width if needed

**Impact:** Essential for readability and accessibility

---

### Issue: "Low contrast ratio"

**Problem:** Text/background contrast < 7:1 (WCAG AAA)

**Fix:**
- Use Nordshore (#00393F) on white (#FFFFFF) = 12.6:1 ✓
- Avoid light text on light backgrounds
- Test with contrast checker

**Impact:** Critical for accessibility (WCAG AAA compliance)

---

### Issue: "Missing ligatures"

**Problem:** "fi", "fl" displayed as separate characters

**Fix:**
```css
/* Enable OpenType ligatures */
font-feature-settings: "liga" 1, "dlig" 1;
```

Or in InDesign: Character Panel → OpenType → Standard Ligatures

**Impact:** Professional typography refinement

---

### Issue: "Widow detected"

**Problem:** Single word on last line of paragraph

**Fix:**
1. Adjust text slightly (add/remove 1-2 words)
2. Adjust line breaks manually
3. Reduce tracking slightly (-5 to -10)
4. Adjust column width

**Impact:** Improves visual flow and professionalism

---

### Issue: "Rivers detected"

**Problem:** White channels running through justified text

**Fix:**
1. Enable hyphenation
2. Adjust column width (wider is better)
3. Use left-aligned instead of justified
4. Adjust word spacing limits

**Impact:** Improves readability and professional appearance

---

## TEEI Typography Standards

### Type Scale

```
Document Title: 42pt Lora Bold #00393F
Section Header:  28pt Lora SemiBold #00393F
Subheading:      18pt Roboto Flex Medium #00393F
Body Text:       11pt Roboto Flex Regular #000000
Caption:          9pt Roboto Flex Regular #666666
```

### Spacing

```
Line Height (Body):      1.5x (16.5pt for 11pt text)
Line Height (Headlines): 1.2x
Paragraph Spacing:       12pt
Section Spacing:         60pt
Element Spacing:         20pt
Margins:                 40pt (all sides)
```

### Grid

```
Columns:     12-column grid
Gutters:     20pt
Alignment:   Left-aligned body text
             Headlines can be centered
```

### Colors

```
Primary:   Nordshore #00393F (80% usage)
Secondary: Sky #C9E4EC (accents)
Neutral:   Sand #FFF1E2 (backgrounds)
Accent:    Gold #BA8F5A (metrics, highlights)
```

### Fonts

```
Headlines: Lora (serif)
  - Regular, Medium, SemiBold, Bold
  - Italic variants available

Body: Roboto Flex (sans-serif)
  - All weights (Thin → Black)
  - Italic variants available
  - Variable font with adjustable width/weight
```

---

## Advanced Usage

### Category-Specific Inspection

```bash
# Inspect only readability
node scripts/inspect-typography.js exports/document.pdf --only-readability

# Inspect only fonts and scale
node scripts/inspect-typography.js exports/document.pdf --only-fonts --only-scale

# Skip kerning and polish (faster)
node scripts/inspect-typography.js exports/document.pdf --skip-kerning --skip-polish
```

### Custom Configuration

Create custom config file:

```json
{
  "teeiTypography": {
    "fonts": {
      "headlines": { "family": "Custom Serif" },
      "body": { "family": "Custom Sans" }
    }
  },
  "validation": {
    "wcagLevel": "AA",
    "strictMode": false
  }
}
```

Use custom config:

```bash
node scripts/inspect-typography.js exports/document.pdf --config custom-config.json
```

### Programmatic Usage

```javascript
const TypographyInspector = require('./scripts/lib/typography-inspector');

const inspector = new TypographyInspector({
  enableAI: true,
  verbose: true,
  outputFormat: 'json'
});

const report = await inspector.inspect('exports/document.pdf');

console.log(`Overall Score: ${report.overallScore}/100`);
console.log(`Grade: ${report.grade}`);

// Check specific category
const readability = report.results.readability;
console.log(`Readability Score: ${readability.summary.score}/100`);

// Get recommendations
for (const rec of report.recommendations.top10) {
  console.log(`- [${rec.priority}] ${rec.text}`);
}
```

---

## Integration

### CI/CD Pipeline

**GitHub Actions:**

```yaml
name: Typography Quality Check

on: [pull_request]

jobs:
  typography:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Dependencies
        run: npm install

      - name: Inspect Typography
        run: |
          node scripts/inspect-typography.js exports/document.pdf
          exit_code=$?
          if [ $exit_code -ne 0 ]; then
            echo "Typography quality below threshold (score < 80)"
            exit 1
          fi

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: typography-report
          path: exports/typography-reports/
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Find PDFs in exports/
pdfs=$(git diff --cached --name-only --diff-filter=ACM | grep '\.pdf$')

if [ -n "$pdfs" ]; then
  echo "Checking typography quality..."

  for pdf in $pdfs; do
    node scripts/inspect-typography.js "$pdf" --no-ai
    if [ $? -ne 0 ]; then
      echo "❌ Typography quality check failed for $pdf"
      echo "Run: node scripts/inspect-typography.js $pdf --fix"
      exit 1
    fi
  done
fi
```

### API Integration

```javascript
// Express.js API endpoint
app.post('/api/inspect-typography', async (req, res) => {
  const pdfPath = req.files.pdf.tempFilePath;

  const inspector = new TypographyInspector({
    enableAI: true,
    outputFormat: 'json'
  });

  try {
    const report = await inspector.inspect(pdfPath);

    res.json({
      success: true,
      score: report.overallScore,
      grade: report.grade,
      issues: report.summary.totalIssues,
      recommendations: report.recommendations.top10
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

---

## Best Practices

### 1. Inspect Early and Often

Run typography inspection:
- During design phase
- Before stakeholder review
- Before final PDF export
- After any text changes

### 2. Fix Critical Issues First

Priority order:
1. **Critical**: Contrast, readability, accessibility
2. **High**: Brand compliance, font usage
3. **Medium**: Spacing, hierarchy
4. **Low**: Polish, micro-typography

### 3. Use Automated Fixes

```bash
# Preview fixes first
node scripts/inspect-typography.js exports/document.pdf --fix --dry-run

# Apply if looks good
node scripts/inspect-typography.js exports/document.pdf --fix

# Verify improvements
node scripts/inspect-typography.js exports/document-FIXED.pdf
```

### 4. Maintain Baselines

```bash
# Create baseline from approved version
cp exports/approved-v1.pdf exports/baselines/

# Compare future versions
node scripts/inspect-typography.js exports/v2.pdf --compare exports/baselines/approved-v1.pdf
```

### 5. Document Exceptions

Some issues may be intentional:
- Add exceptions to config
- Document reasoning
- Track in version control

---

## Troubleshooting

### "PDF not found" error

**Solution:** Verify path is absolute or relative to current directory

```bash
# Absolute path
node scripts/inspect-typography.js /full/path/to/document.pdf

# Relative path
node scripts/inspect-typography.js ./exports/document.pdf
```

### "Font extraction failed"

**Solution:** PDF may be encrypted or corrupted

```bash
# Check PDF integrity
pdfinfo document.pdf

# Remove encryption
qpdf --decrypt document.pdf decrypted.pdf
```

### "AI validation timeout"

**Solution:** Disable AI or increase timeout

```bash
# Disable AI
node scripts/inspect-typography.js exports/document.pdf --no-ai

# Or wait and retry
```

### "Out of memory" error

**Solution:** Process large PDFs page by page

```bash
# Split PDF first
pdftk document.pdf burst output page_%02d.pdf

# Inspect pages individually
for pdf in page_*.pdf; do
  node scripts/inspect-typography.js "$pdf"
done
```

---

## Resources

### Documentation
- [Micro-Typography Guide](./MICRO-TYPOGRAPHY-GUIDE.md)
- [TEEI Design Guidelines](../reports/TEEI_AWS_Design_Fix_Report.md)
- [Configuration Reference](../config/typography-inspector-config.json)

### External Resources
- [Practical Typography](https://practicaltypography.com/) by Matthew Butterick
- [The Elements of Typographic Style](http://webtypography.net/) by Robert Bringhurst
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)
- [OpenType Feature Reference](https://helpx.adobe.com/fonts/using/open-type-syntax.html)

### Tools
- [Modular Scale Calculator](https://www.modularscale.com/)
- [Contrast Ratio Checker](https://contrast-ratio.com/)
- [Google Fonts](https://fonts.google.com/)

---

## Support

For issues, questions, or suggestions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Common Issues](#common-issues--fixes)
3. Consult TEEI design team
4. Open GitHub issue (if applicable)

---

**Version:** 1.0.0
**Last Updated:** 2025-11-06
**Author:** TEEI Typography Team

---
