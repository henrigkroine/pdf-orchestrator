# TEEI Brand Compliance Auditing System

**Complete Guide to AI-Powered Brand Validation**

---

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [The 6 Compliance Categories](#the-6-compliance-categories)
4. [AI Models and Their Roles](#ai-models-and-their-roles)
5. [Violation Severity Levels](#violation-severity-levels)
6. [Scoring Methodology](#scoring-methodology)
7. [How to Use](#how-to-use)
8. [Understanding Results](#understanding-results)
9. [Fixing Common Violations](#fixing-common-violations)
10. [Integration with Auto-Fix System](#integration-with-auto-fix-system)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The TEEI Brand Compliance Auditing System is a comprehensive, AI-powered validation tool that ensures PDFs meet TEEI's brand guidelines with extreme precision. It uses multiple state-of-the-art AI models (GPT-5, Claude Opus 4, Gemini 2.5 Pro) to analyze documents across 6 major categories, providing detailed violation reports and actionable recommendations.

### Key Features

- **Multi-Model AI Integration**: Leverages the strengths of different AI models for specialized tasks
- **6 Comprehensive Categories**: Color, typography, logo, spacing, brand voice, photography
- **Pixel-Perfect Analysis**: Exact hex code matching, font detection, image analysis
- **Detailed Violation Reports**: Specific issues with page numbers, quotes, and recommendations
- **Multiple Output Formats**: HTML dashboard, JSON, CSV, annotated PDF
- **Actionable Recommendations**: Prioritized action plan with specific fixes
- **Automated Scoring**: 0-100 scale with letter grades (A+ to F)
- **CI/CD Integration**: Exit codes for automated pipelines

### What It Validates

✅ **Color Palette**: Official TEEI colors used correctly, forbidden colors detected
✅ **Typography**: Lora for headlines, Roboto Flex for body, correct type scale
✅ **Logo Usage**: Clearspace, size, color, placement
✅ **Spacing & Layout**: Margins, section breaks, grid alignment
✅ **Brand Voice**: Empowering, urgent, hopeful, inclusive, respectful, clear
✅ **Photography**: Natural lighting, warm tones, authentic moments, diversity

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   Brand Compliance Auditor                       │
│                        (Orchestrator)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Color     │     │  Typography  │     │  Brand Voice │
│   Checker    │     │   Checker    │     │   Analyzer   │
│              │     │              │     │              │
│  GPT-4o AI   │     │ Claude Opus 4│     │   GPT-5 AI   │
└──────────────┘     └──────────────┘     └──────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ Photography  │ │     Logo     │ │   Spacing    │
        │   Checker    │ │   Checker    │ │   Checker    │
        │              │ │              │ │              │
        │  Gemini 2.5  │ │  Image Rec.  │ │  PDF Parse   │
        └──────────────┘ └──────────────┘ └──────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Results Engine  │
                    │  - Scoring       │
                    │  - Recommendations│
                    │  - Reports        │
                    └──────────────────┘
```

### Component Breakdown

**BrandComplianceAuditor** (orchestrator)
- Coordinates all checkers
- Calculates weighted scores
- Generates comprehensive reports
- Exports to multiple formats

**ColorComplianceChecker**
- Extracts colors from PDF pages (pixel-level)
- Matches to official TEEI palette (±2 tolerance)
- Detects forbidden colors (copper, orange)
- Validates usage ratios (80% Nordshore)
- AI color naming with GPT-4o

**TypographyComplianceChecker**
- Extracts fonts from PDF metadata
- Validates font families (Lora, Roboto Flex)
- Checks type scale compliance
- Analyzes visual hierarchy
- AI typography critique with Claude Opus 4

**BrandVoiceAnalyzer**
- Extracts text from PDF
- NLP analysis (sentiment, tone, complexity)
- Detects jargon and condescending language
- Checks inclusivity
- AI brand voice scoring with GPT-5

**PhotographyComplianceChecker**
- Extracts images from PDF
- AI style detection with Gemini 2.5 Pro Vision
- Color tone analysis (warm vs cool)
- Stock photo detection
- Diversity representation checking

**LogoChecker & SpacingChecker**
- Logo clearspace verification
- Page size and margin validation
- Grid alignment checking

---

## The 6 Compliance Categories

### 1. Color Compliance (25% weight)

**What It Checks:**
- ✅ Official TEEI colors used (Nordshore, Sky, Sand, Beige, Moss, Gold, Clay)
- ✅ Exact hex code matching (±2 tolerance for anti-aliasing)
- ✅ Forbidden colors detected (Copper #C87137, Orange #FF6600)
- ✅ Color usage ratios (80% Nordshore recommended)
- ✅ Color accessibility (WCAG AA contrast)

**Common Violations:**
- ❌ Using copper/orange (not in brand palette)
- ❌ Nordshore missing or underused
- ❌ Too many off-brand colors

**How to Fix:**
- Find/Replace all copper → Nordshore (#00393F)
- Apply 80% Nordshore, 10% Sky, 10% Sand/Beige ratio
- Remove any non-official colors

### 2. Typography Compliance (20% weight)

**What It Checks:**
- ✅ Lora used for all headlines
- ✅ Roboto Flex used for all body text
- ✅ Type scale adherence (42pt, 28pt, 18pt, 11pt, 9pt)
- ✅ Line heights (1.2x headlines, 1.5x body)
- ✅ Visual hierarchy (clear size differentiation)

**Common Violations:**
- ❌ Arial, Helvetica, Times New Roman detected
- ❌ Font sizes not in modular scale
- ❌ Weak hierarchy (sizes too similar)

**How to Fix:**
- Install TEEI fonts: `powershell scripts/install-fonts.ps1`
- Find/Replace all fonts → Lora (headlines) or Roboto Flex (body)
- Apply standard sizes: 42pt (title), 28pt (header), 18pt (subhead), 11pt (body), 9pt (caption)

### 3. Logo Usage (10% weight)

**What It Checks:**
- ✅ Logo clearspace (minimum = icon height)
- ✅ Logo size minimums (0.5" print, 48px digital)
- ✅ Logo colors (Nordshore or White only)
- ✅ No distortion or stretching
- ✅ No effects (drop shadow, glow, etc.)

**Common Violations:**
- ❌ Logo too small
- ❌ Insufficient clearspace
- ❌ Logo stretched or rotated
- ❌ Wrong colors used

**How to Fix:**
- Ensure clearspace = height of logo icon
- Minimum size: 0.5" for print, 48px for digital
- Use only Nordshore (#00393F) or White
- Remove all effects and transformations

### 4. Spacing & Layout (10% weight)

**What It Checks:**
- ✅ Page size (8.5" x 11" Letter)
- ✅ Margins (40pt all sides)
- ✅ Section breaks (60pt)
- ✅ Element spacing (20pt)
- ✅ Paragraph spacing (12pt)
- ✅ 12-column grid alignment

**Common Violations:**
- ❌ Non-standard page size
- ❌ Inconsistent margins
- ❌ Insufficient section breaks
- ❌ Cramped layout

**How to Fix:**
- Set page size to Letter (8.5" x 11")
- Apply 40pt margins all sides
- Use 60pt between major sections
- Maintain 20pt between elements

### 5. Brand Voice (20% weight)

**What It Checks:**
- ✅ **Empowering**: Uplifting, not condescending
- ✅ **Urgent**: Important, without panic
- ✅ **Hopeful**: Optimistic, not naive
- ✅ **Inclusive**: Gender-neutral, welcoming
- ✅ **Respectful**: Dignified, honoring all
- ✅ **Clear**: Jargon-free, accessible

**Common Violations:**
- ❌ Condescending language ("simply", "just", "obviously")
- ❌ Corporate jargon ("synergy", "leverage", "paradigm")
- ❌ Non-inclusive terms ("guys", "mankind")
- ❌ Complex sentences (>25 words average)
- ❌ Low readability score (<60)

**How to Fix:**
- Remove condescending words ("simply" → delete)
- Replace jargon with plain English
- Use inclusive alternatives ("folks" not "guys")
- Shorten sentences to <20 words
- Aim for 60-70 readability score

### 6. Photography (15% weight)

**What It Checks:**
- ✅ **Lighting**: Natural, warm (not studio)
- ✅ **Tone**: Warm colors (align with Sand/Beige)
- ✅ **Authenticity**: Real moments (not stock)
- ✅ **Diversity**: Varied ages, ethnicities, genders
- ✅ **Emotion**: Hope, connection, empowerment

**Common Violations:**
- ❌ No photography (text-only document)
- ❌ Cold/clinical lighting
- ❌ Generic stock photos
- ❌ Studio-lit corporate headshots
- ❌ Limited diversity

**How to Fix:**
- Add 3-5 authentic photos
- Use natural lighting (outdoor or near windows)
- Apply warm color grading
- Show diverse representation
- Capture authentic educational moments

---

## AI Models and Their Roles

### GPT-4o (Color Analysis)
**Task**: Color naming and validation
**Strength**: Excellent at color perception and description
**Usage**: Identifies unknown colors, validates brand color usage

**Example Prompt:**
```
Given RGB values (200, 113, 55), identify if this matches TEEI brand colors:
Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, etc.
Respond with color name if match (within ±2), or 'Unknown' with description.
```

### Claude Opus 4 (Typography Critique)
**Task**: Typography analysis and critique
**Strength**: Deep reasoning for design critique
**Usage**: Analyzes font choices, type scale, hierarchy with detailed reasoning

**Example Prompt:**
```
You are an expert typographer analyzing TEEI typography.
TEEI uses Lora (serif) for headlines, Roboto Flex (sans-serif) for body.
Type scale: 42pt titles, 28pt headers, 18pt subheads, 11pt body, 9pt captions.
Review detected fonts and provide detailed critique with specific fixes.
Use your deep reasoning to assess typographic quality.
```

### GPT-5 (Brand Voice Analysis)
**Task**: NLP analysis of text content
**Strength**: Advanced language understanding and tone detection
**Usage**: Analyzes brand voice qualities, detects violations, scores 0-100

**Example Prompt:**
```
You are a brand voice expert analyzing TEEI communications.
TEEI voice: empowering (not condescending), urgent (without panic),
hopeful (not naive), inclusive, respectful, clear (jargon-free).
Analyze text and score 0-100 on each quality with specific quotes.
```

### Gemini 2.5 Pro Vision (Photography Analysis)
**Task**: Image style and content analysis
**Strength**: Advanced visual understanding
**Usage**: Analyzes photos for lighting, tone, authenticity, diversity, emotion

**Example Prompt:**
```
You are a photography director evaluating for TEEI brand.
Requirements: natural warm lighting, warm color tones (Sand/Beige palette),
authentic moments (not stock), diverse representation, shows hope/connection.
Analyze image and score 0-100 on each criteria.
```

---

## Violation Severity Levels

### Critical (20 points deduction each)
**Impact**: Fundamental brand violations that must be fixed immediately

**Examples:**
- Using forbidden colors (copper, orange)
- Wrong font families (Arial, Times New Roman)
- Condescending language
- Non-inclusive terms
- Missing required brand fonts
- Missing primary color (Nordshore)

**What to Do**: Fix immediately - these are non-negotiable brand requirements

### Major (10 points deduction each)
**Impact**: Significant brand inconsistencies that should be fixed soon

**Examples:**
- Incorrect color usage ratios
- Off-scale font sizes
- Logo clearspace violations
- Missing photography
- Jargon and complexity
- Weak hierarchy

**What to Do**: Fix in next revision - important but not blocking

### Minor (5 points deduction each)
**Impact**: Small inconsistencies that can be improved when possible

**Examples:**
- Accent color usage
- Minor spacing inconsistencies
- Line height variations
- Caption styling
- Small readability issues

**What to Do**: Nice to fix but not critical

---

## Scoring Methodology

### Category Scoring

Each category is scored 0-100 based on violations:
- Start with 100 points
- Deduct for each violation:
  - Critical: -20 points
  - Major: -10 points
  - Minor: -5 points
- AI model scores factored in (when applicable)

### Overall Score Calculation

Weighted average across all categories:

```
Overall Score = (Color × 0.25) + (Typography × 0.20) + (Logo × 0.10)
              + (Spacing × 0.10) + (BrandVoice × 0.20) + (Photography × 0.15)
```

**Category Weights:**
- Color: 25% (most visible brand element)
- Typography: 20% (critical for readability and brand)
- Brand Voice: 20% (content quality and tone)
- Photography: 15% (visual storytelling)
- Logo: 10% (brand recognition)
- Spacing: 10% (layout quality)

### Grade Scale

| Score   | Grade | Status      | Description                    |
|---------|-------|-------------|--------------------------------|
| 100     | A+    | Perfect     | Zero violations                |
| 95-99   | A     | Excellent   | Minor issues only              |
| 85-94   | B     | Good        | Some improvements needed       |
| 70-84   | C     | Fair        | Multiple violations            |
| 50-69   | D     | Poor        | Significant non-compliance     |
| 0-49    | F     | Critical    | Major brand violations         |

**Pass Threshold**: 85 (Grade B or higher)

---

## How to Use

### Basic Usage

```bash
# Full audit (all categories, all formats)
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf

# Output will be in: exports/compliance-audits/
```

### Skip Specific Categories

```bash
# Skip AI-heavy checks for faster audit
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf \
  --skip-brand-voice \
  --skip-photography

# Skip specific checks
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf \
  --skip-color \
  --skip-typography
```

### Choose Output Format

```bash
# HTML dashboard only
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --format html

# JSON only
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --format json

# Multiple formats
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --format html,json,csv

# All formats (default)
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --format all
```

### Custom Output Directory

```bash
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf \
  --output-dir reports/brand-audits
```

### Verbose Logging

```bash
node scripts/audit-brand-compliance.js exports/TEEI_AWS.pdf --verbose
```

### Help

```bash
node scripts/audit-brand-compliance.js --help
```

---

## Understanding Results

### HTML Dashboard

Interactive visual report showing:
- **Overall Score**: Large centered score with grade and pass/fail status
- **Category Breakdown**: Individual scores for each category with weights
- **Violation Statistics**: Count by severity (critical, major, minor)
- **Detailed Violations**: Each violation with severity badge, message, and recommendation
- **Action Plan**: Prioritized recommendations with impact levels

**Location**: `exports/compliance-audits/[filename]-audit-[timestamp].html`

### JSON Report

Complete structured data:
```json
{
  "overallScore": 87,
  "grade": "B",
  "passed": true,
  "categories": {
    "color": { "score": 90, "violations": [...], ... },
    "typography": { "score": 85, "violations": [...], ... }
  },
  "violations": [...],
  "recommendations": [...]
}
```

### CSV Report

Spreadsheet-compatible violation list:
```csv
Category,Type,Severity,Message,Recommendation,Page
color,forbidden_color,critical,"Copper detected","Replace with Nordshore",multiple
typography,missing_brand_font,critical,"Lora not found","Install and apply Lora",all
```

### Annotated PDF

Original PDF with audit summary on first page (future: actual annotations on violations).

---

## Fixing Common Violations

### Violation: Forbidden Colors Detected

**Issue**: Using copper (#C87137) or orange (#FF6600)

**Fix**:
1. Open in InDesign/Illustrator
2. Find/Replace: Copper → Nordshore (#00393F)
3. Find/Replace: Orange → Nordshore (#00393F) or Sky (#C9E4EC)
4. AWS orange only in AWS logo - nowhere else

### Violation: Wrong Font Families

**Issue**: Arial, Helvetica, Times New Roman detected

**Fix**:
1. Install TEEI fonts: `powershell scripts/install-fonts.ps1`
2. Restart InDesign
3. Find/Replace fonts:
   - All headlines → Lora Bold or SemiBold
   - All body text → Roboto Flex Regular
   - All captions → Roboto Flex Regular 9pt

### Violation: Condescending Language

**Issue**: Words like "simply", "just", "obviously" detected

**Fix**:
1. Search document for: simply, just, obviously, clearly, merely
2. Rewrite sentences to remove these words
3. Focus on empowering language
4. Example: "Simply click here" → "Click here to get started"

### Violation: Non-Inclusive Language

**Issue**: "guys", "mankind", "manpower" detected

**Fix**:
1. Replace "guys" → "folks", "everyone", "team"
2. Replace "mankind" → "humanity", "people"
3. Replace "manpower" → "workforce", "staff"
4. Review for other gendered language

### Violation: No Photography

**Issue**: Document is text-only

**Fix**:
1. Source 3-5 authentic photos from TEEI programs
2. Requirements:
   - Natural lighting (outdoor/near windows)
   - Warm color tones
   - Real educational moments
   - Diverse representation
3. Add to document with proper sizing and placement

### Violation: Cold Color Tone in Photos

**Issue**: Images have cool/blue tones

**Fix**:
1. Open in Photoshop
2. Add Color Balance adjustment:
   - Shadows: +10 Red, -5 Blue
   - Midtones: +15 Red, +10 Yellow, -10 Blue
   - Highlights: +5 Red
3. Aim for warmth aligned with Sand (#FFF1E2) and Beige (#EFE1DC)

---

## Integration with Auto-Fix System

The brand compliance auditor integrates with the auto-fix system for automated remediation:

```javascript
// Run audit
const results = await auditor.auditPDF('exports/TEEI_AWS.pdf');

// Pass to auto-fix engine
const autoFix = require('./lib/auto-fix-engine');
const fixedPdf = await autoFix.applyFixes(results);

// Re-audit to verify
const reauditResults = await auditor.auditPDF(fixedPdf);
console.log(`Score improved: ${results.overallScore} → ${reauditResults.overallScore}`);
```

**Auto-fixable violations:**
- ✅ Color replacements (copper → Nordshore)
- ✅ Font family changes (Arial → Roboto Flex)
- ✅ Text rewrites (remove condescending language)
- ✅ Layout adjustments (margins, spacing)

**Manual-fix required:**
- ❌ Photography (requires new images)
- ❌ Complex typography issues
- ❌ Logo placement

---

## Best Practices

### Before Auditing

1. **Ensure PDF is final**: Don't audit draft versions
2. **Check file size**: Large PDFs (>50MB) may take longer
3. **Set environment variables**: OpenAI, Anthropic, Google API keys
4. **Install fonts**: TEEI fonts must be installed for accurate detection

### During Audit

1. **Don't interrupt**: Let the audit complete (5-15 minutes)
2. **Monitor console**: Watch for errors or warnings
3. **Check API limits**: Ensure you have sufficient AI API quota

### After Audit

1. **Review HTML dashboard first**: Easiest to understand
2. **Prioritize critical violations**: Fix these immediately
3. **Use JSON for automation**: Integrate with CI/CD
4. **Save all reports**: Track improvements over time

### For Best Results

1. **Run full audit**: Don't skip categories unless necessary
2. **Fix and re-audit**: Verify improvements with new audit
3. **Track scores**: Aim for 90+ consistently
4. **Share with team**: Use reports for stakeholder review

---

## Troubleshooting

### Error: "AI analysis failed"

**Cause**: API key missing or invalid, rate limits, network issues

**Solution**:
1. Check environment variables:
   ```bash
   echo $OPENAI_API_KEY
   echo $ANTHROPIC_API_KEY
   echo $GOOGLE_API_KEY
   ```
2. Verify API keys are valid and have credits
3. Check network connection
4. Retry with fewer categories: `--skip-brand-voice --skip-photography`

### Error: "Cannot extract colors from PDF"

**Cause**: PDF format not supported, encrypted PDF

**Solution**:
1. Try re-saving PDF: File → Save As → PDF
2. Check if PDF is password-protected
3. Ensure PDF has visual content (not just text)

### Error: "Font detection failed"

**Cause**: Fonts not embedded in PDF

**Solution**:
1. Re-export PDF with embedded fonts
2. InDesign: Export → PDF → Embed all fonts
3. Check PDF properties: File → Properties → Fonts

### Low Score Despite Looking Good

**Cause**: Specific violations you haven't noticed

**Solution**:
1. Review violations list carefully
2. Check AI insights for specific quotes
3. Use annotated PDF to see exact locations
4. Compare to TEEI brand guidelines reference

### Audit Takes Too Long

**Cause**: Large PDF, AI processing, multiple images

**Solution**:
1. Skip AI-heavy checks: `--skip-brand-voice --skip-photography`
2. Reduce PDF page count (test with first 5 pages)
3. Use faster AI models (built-in option coming soon)
4. Run during off-peak hours for faster API responses

---

## Support

For issues or questions:
- **Documentation**: `docs/TEEI-BRAND-REFERENCE.md`
- **Config**: `config/brand-compliance-config.json`
- **Examples**: `example-jobs/brand-compliance/`

---

**Last Updated**: 2025-11-06
**Version**: 1.0.0
**AI Models**: GPT-5, Claude Opus 4, Gemini 2.5 Pro
