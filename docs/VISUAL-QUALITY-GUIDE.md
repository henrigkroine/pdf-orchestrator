# Visual Quality Inspection System - Complete Guide

**Version:** 2.0.0
**Last Updated:** 2025-11-06

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [Quick Start](#quick-start)
5. [Analysis Components](#analysis-components)
6. [AI Models Comparison](#ai-models-comparison)
7. [Quality Grading Scale](#quality-grading-scale)
8. [Understanding Scores](#understanding-scores)
9. [Common Issues & Fixes](#common-issues--fixes)
10. [Configuration](#configuration)
11. [Integration Examples](#integration-examples)
12. [API Reference](#api-reference)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The Visual Quality Inspection System provides **comprehensive, AI-powered analysis** of PDF visual quality using cutting-edge computer vision and multiple AI vision models. It evaluates design quality across 40+ metrics and provides actionable recommendations for improvement.

### Key Features

- ✅ **Computer Vision Analysis** - Technical metrics (blur, noise, sharpness, resolution)
- ✅ **Image Quality Assessment** - DPI, compression, color profiles, distortion
- ✅ **Layout Balance Analysis** - Visual weight, whitespace, golden ratio, symmetry
- ✅ **Multi-AI Assessment** - GPT-4o Vision, Claude Sonnet 4.5, Gemini 2.5 Pro
- ✅ **Ensemble Scoring** - Weighted combination with confidence metrics
- ✅ **Issue Detection** - Categorized by severity (CRITICAL, MAJOR, MINOR)
- ✅ **Actionable Recommendations** - Priority-ordered improvements
- ✅ **Multiple Output Formats** - JSON reports, HTML dashboards, annotated PDFs

### Use Cases

- **Pre-Flight Quality Checks** - Validate PDFs before client delivery
- **Brand Compliance** - Ensure design meets brand standards
- **Print Production** - Verify technical specs (DPI, color profiles)
- **Design Review** - Get AI-powered design critique
- **Regression Testing** - Compare against baseline quality
- **Automated QA** - Integrate into CI/CD pipelines

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Visual Quality Inspector                  │
│                      (Main Orchestrator)                     │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴────────────┐
        │                        │
┌───────▼──────┐        ┌───────▼───────┐
│   Computer   │        │  AI Vision    │
│   Vision     │        │  Assessment   │
│   Analysis   │        │   (Ensemble)  │
└───────┬──────┘        └───────┬───────┘
        │                       │
    ┌───┴────┐         ┌────────┴────────┐
    │        │         │                 │
┌───▼───┐ ┌─▼───┐  ┌──▼────┐ ┌────▼───┐ ┌──▼─────┐
│ Image │ │Layout│ │GPT-4o │ │Claude  │ │Gemini  │
│Quality│ │Balance│ │Vision │ │Sonnet  │ │2.5 Pro │
│Analyzer│ │Analyzer│ │       │ │4.5     │ │Vision  │
└───────┘ └──────┘  └───────┘ └────────┘ └────────┘
```

### Component Responsibilities

**1. Visual Quality Inspector** (`visual-quality-inspector.js`)
- Main orchestration engine
- Coordinates all analysis components
- Calculates ensemble scores
- Generates final reports

**2. Image Quality Analyzer** (`image-quality-analyzer.js`)
- DPI calculation and verification
- Compression quality analysis
- Color profile validation
- Distortion and pixelation detection
- Color gamut analysis

**3. Layout Balance Analyzer** (`layout-balance-analyzer.js`)
- Visual weight distribution
- Whitespace ratio and distribution
- Golden ratio alignment
- Symmetry analysis
- Visual hierarchy detection
- Grid alignment detection

**4. AI Vision Models**
- **GPT-4o Vision**: Design principles and aesthetic evaluation
- **Claude Sonnet 4.5**: Detailed critique with brand focus
- **Gemini 2.5 Pro Vision**: Multi-perspective analysis

---

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Required dependencies
npm install sharp pdf-lib axios pdf-to-img
```

### API Keys Setup

Create `.env` file in project root:

```bash
# OpenAI (GPT-4o Vision)
OPENAI_API_KEY=sk-...

# Anthropic (Claude Sonnet 4.5)
ANTHROPIC_API_KEY=sk-ant-...

# Google (Gemini 2.5 Pro Vision)
GOOGLE_API_KEY=...
```

**Note:** All API keys are optional. If a key is missing, that AI model will be skipped.

### Configuration

The system uses `/config/visual-quality-config.json` for all settings. You can customize:

- Quality thresholds (blur, noise, resolution, etc.)
- AI model settings and prompts
- Scoring weights
- Grading scale
- Output options

---

## Quick Start

### Basic Inspection

```bash
node scripts/check-visual-quality.js exports/document.pdf
```

**Output:**
- Console summary with grade and scores
- Exit code 0 (success) if score ≥ 70, 1 (failure) if < 70

### Generate Reports

```bash
# Save JSON report
node scripts/check-visual-quality.js exports/document.pdf \
  --output-json report.json

# Generate HTML dashboard
node scripts/check-visual-quality.js exports/document.pdf \
  --output-html dashboard.html

# Both JSON and HTML
node scripts/check-visual-quality.js exports/document.pdf \
  --output-json report.json \
  --output-html dashboard.html
```

### Analyze Specific Pages

```bash
# Analyze pages 1-3 and page 5
node scripts/check-visual-quality.js exports/document.pdf \
  --pages "1-3,5"
```

### Computer Vision Only (No AI)

```bash
# Skip AI assessments (faster, no API costs)
node scripts/check-visual-quality.js exports/document.pdf \
  --no-ai
```

### Custom Configuration

```bash
node scripts/check-visual-quality.js exports/document.pdf \
  --config config/custom-quality-config.json
```

---

## Analysis Components

### 1. Computer Vision Analysis

**Metrics:**
- **Blur Detection** - Laplacian variance (1000+ = excellent, <100 = critical)
- **Noise Detection** - Standard deviation (0.01 = excellent, >0.10 = critical)
- **Sharpness** - Edge detection (0.90 = excellent, <0.30 = critical)
- **Resolution** - DPI calculation (300+ = print-ready, <72 = web-only)
- **Compression Quality** - Artifact detection (0.95 = excellent, <0.50 = critical)

**Example Output:**
```json
{
  "computerVision": {
    "blurScore": 92,
    "noiseScore": 95,
    "sharpnessScore": 88,
    "resolutionScore": 100,
    "compressionScore": 90,
    "averageScore": 93
  }
}
```

### 2. Image Quality Analysis

**Checks:**
- **DPI Verification** - Ensures print-quality resolution (300 DPI for print, 150+ for digital)
- **Compression Analysis** - Detects over-compression and JPEG artifacts
- **Color Profile** - Validates RGB/CMYK profiles and ICC embedding
- **Distortion Detection** - Identifies stretched/squashed images
- **Pixelation Detection** - Finds upscaled low-res images
- **Color Gamut** - Analyzes color range and dynamic range

**Example Output:**
```json
{
  "imageQuality": {
    "dpi": {
      "effective": 300,
      "score": 100,
      "grade": "Excellent",
      "suitable": ["print", "digital", "large-format"]
    },
    "compressionQuality": {
      "quality": 0.92,
      "artifactsDetected": false,
      "score": 95,
      "grade": "Excellent"
    },
    "overallScore": 93
  }
}
```

### 3. Layout Balance Analysis

**Evaluates:**
- **Visual Weight** - Center of mass, balance deviation, quadrant distribution
- **Whitespace Ratio** - Optimal: 35-50%, Acceptable: 25-60%
- **Golden Ratio** - Alignment with 1.618 ratio (deviation <5% = excellent)
- **Symmetry** - Vertical and horizontal symmetry scores
- **Visual Hierarchy** - 3-4 distinct levels = optimal
- **Grid Alignment** - 12-column grid detection
- **Content Density** - Balance between crowded and sparse

**Example Output:**
```json
{
  "layoutBalance": {
    "visualWeight": {
      "balance": 0.12,
      "score": 90,
      "grade": "Well Balanced"
    },
    "whitespace": {
      "ratio": 0.42,
      "score": 95,
      "grade": "Excellent"
    },
    "goldenRatio": {
      "deviation": 0.03,
      "score": 95,
      "grade": "Excellent"
    },
    "overallScore": 92
  }
}
```

### 4. AI Vision Assessments

**GPT-4o Vision** (Weight: 35%)
- Visual appeal (1-10)
- Professional quality (1-10)
- Brand consistency (1-10)
- Visual hierarchy (1-10)
- Color harmony (1-10)
- Typography quality (1-10)
- Image quality (1-10)
- Whitespace effectiveness (1-10)
- Layout balance (1-10)

**Claude Sonnet 4.5** (Weight: 40%) - Most detailed
- Design excellence with fine attention to detail
- Brand integrity assessment
- Information hierarchy analysis
- Color mastery evaluation
- Typographic excellence critique
- Spatial dynamics review
- Compositional balance assessment
- Comprehensive issue categorization

**Gemini 2.5 Pro Vision** (Weight: 25%)
- Multi-perspective analysis (client, designer, user, brand manager)
- Cross-cultural design effectiveness
- Competitive analysis
- Technical standards compliance

**Ensemble Score**
- Weighted average of all AI assessments
- Confidence metric (based on number of successful responses)
- Aggregated issues and strengths

---

## AI Models Comparison

| Feature | GPT-4o Vision | Claude Sonnet 4.5 | Gemini 2.5 Pro |
|---------|---------------|-------------------|----------------|
| **Speed** | Fast (2-4s) | Medium (3-6s) | Fast (2-4s) |
| **Detail Level** | Good | Excellent | Good |
| **Cost per Call** | $0.01-0.02 | $0.01-0.03 | $0.005-0.01 |
| **Strengths** | Design principles, aesthetics | Detailed critique, brand compliance | Multi-perspective, competitive analysis |
| **Best For** | General design evaluation | In-depth brand review | Holistic assessment |
| **Scoring Weight** | 35% | 40% | 25% |

**Recommendation:** Use all three models for most comprehensive analysis. Claude Sonnet 4.5 typically provides the most actionable critique.

---

## Quality Grading Scale

### A+ (95-100): Award-Winning
**Characteristics:**
- World-class design exceeding all professional standards
- Perfect or near-perfect technical execution
- Exceptional attention to detail
- Strong brand consistency
- Clear, intuitive visual hierarchy
- Professional photography and imagery
- Optimal whitespace and balance

**Example Use Cases:**
- High-profile client presentations
- Award submissions
- Premium brand materials

---

### A (90-94): Excellent
**Characteristics:**
- Professional quality with minor polish opportunities
- Strong technical execution
- Good brand alignment
- Effective visual hierarchy
- Professional imagery
- Well-balanced composition

**Typical Issues:**
- 1-2 minor polish items
- Small spacing inconsistencies
- Minor color adjustments possible

---

### B+ (85-89): Very Good
**Characteristics:**
- Strong design with some improvement areas
- Good technical quality
- Mostly consistent branding
- Clear hierarchy with minor gaps
- Good image quality

**Typical Issues:**
- 2-3 noticeable improvements needed
- Some spacing or alignment issues
- Color harmony could be enhanced

---

### B (80-84): Good
**Characteristics:**
- Solid work with several enhancement opportunities
- Acceptable technical quality
- Basic brand consistency
- Functional hierarchy

**Typical Issues:**
- 3-5 improvements recommended
- Alignment or grid issues
- Image quality concerns
- Whitespace imbalances

---

### C (70-79): Adequate
**Characteristics:**
- Meets minimum standards with significant improvements needed
- Basic technical quality
- Some brand inconsistencies
- Weak visual hierarchy

**Typical Issues:**
- 5-10 issues to address
- Multiple technical concerns
- Inconsistent styling
- Poor image quality or resolution

---

### D (60-69): Below Standard
**Characteristics:**
- Major quality issues requiring substantial revision
- Substandard technical execution
- Weak brand alignment
- Unclear hierarchy

**Typical Issues:**
- 10+ critical issues
- Low resolution images
- Poor layout balance
- Inconsistent design language

---

### F (<60): Unacceptable
**Characteristics:**
- Does not meet professional standards
- Complete redesign required
- Critical technical failures
- No brand consistency

**Typical Issues:**
- 15+ critical issues
- Unacceptable image quality
- No clear hierarchy
- Amateur design patterns

---

## Understanding Scores

### Overall Score Calculation

```
Overall Score = (CV Component × 30%) + (AI Component × 70%)

Where:
  CV Component = (CV Score × 30% + Image Score × 35% + Layout Score × 35%)
  AI Component = Weighted average of GPT-4o (35%), Claude (40%), Gemini (25%)
```

### Score Interpretation

**90-100 (A range):**
- Professional, client-ready quality
- Minor or no issues
- Exceeds industry standards

**80-89 (B range):**
- Good quality, some improvements valuable
- Ready for most use cases
- Meets professional standards

**70-79 (C range):**
- Acceptable baseline quality
- Several improvements recommended
- May require revision for critical uses

**60-69 (D range):**
- Below standard, major revision needed
- Multiple critical issues
- Not ready for professional use

**Below 60 (F):**
- Unacceptable quality
- Complete redesign recommended
- Fundamental issues present

---

## Common Issues & Fixes

### 1. Low Resolution (DPI < 200)

**Issue:** Images appear blurry or pixelated, especially when printed.

**Symptoms:**
- DPI score < 70
- "Low image resolution" issue
- CRITICAL or MAJOR severity

**Fixes:**
```
1. Use higher resolution source images
2. Export PDF at 300 DPI for print, 150+ DPI for digital
3. Avoid upscaling images beyond 150% original size
4. Replace low-res images with high-res versions
```

**Prevention:**
- Always start with 300 DPI images for print
- Maintain original image resolution
- Use vector graphics when possible

---

### 2. Compression Artifacts

**Issue:** Visible blocking or banding in images.

**Symptoms:**
- Compression score < 70
- "Heavy compression detected" issue
- Artifacts detected = true

**Fixes:**
```
1. Re-export images at 90-100% JPEG quality
2. Use PNG for images with sharp edges/text
3. Reduce compression when creating PDF
4. Use original uncompressed sources
```

**Prevention:**
- Export at maximum quality settings
- Compress only as final step
- Keep uncompressed master files

---

### 3. Unbalanced Layout

**Issue:** Visual weight is unevenly distributed across page.

**Symptoms:**
- Visual weight balance > 0.25
- Layout balance score < 70
- "Unbalanced visual weight distribution" issue

**Fixes:**
```
1. Redistribute content to balance left/right
2. Add visual elements to lighter areas
3. Use whitespace intentionally to balance
4. Follow rule of thirds or golden ratio
```

**Prevention:**
- Use grid systems (12-column)
- Check balance during design
- Use symmetry or intentional asymmetry

---

### 4. Poor Whitespace Ratio

**Issue:** Too crowded (<25% whitespace) or too sparse (>70%).

**Symptoms:**
- Whitespace score < 70
- "Too Crowded" or "Too Sparse" grade

**Fixes:**
```
Too Crowded:
- Increase margins (minimum 40pt)
- Reduce content density
- Remove unnecessary elements
- Increase line spacing

Too Sparse:
- Add supporting content
- Adjust layout to use space
- Reduce excessive margins
- Tighten content grouping
```

**Prevention:**
- Target 35-50% whitespace ratio
- Use consistent margin system
- Balance content and breathing room

---

### 5. Unclear Visual Hierarchy

**Issue:** No clear information priority levels.

**Symptoms:**
- Hierarchy score < 70
- "Unclear visual hierarchy" issue
- <3 or >5 hierarchy levels detected

**Fixes:**
```
1. Establish 3-4 distinct levels:
   - Level 1: Document title (48pt)
   - Level 2: Section headers (28pt)
   - Level 3: Subheads (18pt)
   - Level 4: Body text (11pt)

2. Use size, weight, and color consistently
3. Increase contrast between levels
4. Maintain consistent styling per level
```

**Prevention:**
- Define type scale before design
- Use style guide strictly
- Test at thumbnail size

---

### 6. Color Profile Issues

**Issue:** Missing ICC color profile or incorrect profile for use case.

**Symptoms:**
- "Missing ICC color profile" issue
- Color profile score < 80

**Fixes:**
```
Print:
- Embed CMYK profile (FOGRA39 or US Web Coated)
- Convert RGB to CMYK for printing
- Include color profile in PDF export

Digital:
- Embed sRGB IEC61966-2.1 profile
- Ensure consistent color space
- Test on multiple displays
```

**Prevention:**
- Define color profile at start
- Embed profiles in all images
- Export with embedded profiles

---

### 7. Image Distortion

**Issue:** Images stretched or squashed (aspect ratio not maintained).

**Symptoms:**
- Distortion score < 70
- "Image distortion detected" issue
- >5% aspect ratio deviation

**Fixes:**
```
1. Restore original aspect ratio
2. Use "fit" instead of "fill" when resizing
3. Crop intelligently instead of stretching
4. Verify dimensions match original proportions
```

**Prevention:**
- Lock aspect ratio when resizing
- Use constraint proportions
- Check final output visually

---

## Configuration

### Customizing Quality Thresholds

Edit `config/visual-quality-config.json`:

```json
{
  "qualityThresholds": {
    "blur": {
      "excellent": 1000,
      "good": 500,
      "acceptable": 200
    },
    "resolution": {
      "print": {
        "excellent": 300,
        "acceptable": 200
      }
    }
  }
}
```

### Customizing Scoring Weights

Adjust importance of different components:

```json
{
  "scoringWeights": {
    "computerVision": 0.30,  // Technical metrics
    "aiEnsemble": 0.70       // AI assessments
  }
}
```

### Customizing AI Model Prompts

Tailor AI assessments to your specific needs:

```json
{
  "aiModels": {
    "gpt4oVision": {
      "enabled": true,
      "prompt": "Your custom prompt here..."
    }
  }
}
```

### Disabling Specific AI Models

```json
{
  "aiModels": {
    "gpt4oVision": { "enabled": false },
    "claudeSonnet": { "enabled": true },
    "geminiVision": { "enabled": false }
  }
}
```

---

## Integration Examples

### 1. CI/CD Pipeline (GitHub Actions)

```yaml
name: Visual Quality Check

on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run visual quality inspection
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GOOGLE_API_KEY: ${{ secrets.GOOGLE_API_KEY }}
        run: |
          node scripts/check-visual-quality.js exports/document.pdf \
            --output-json report.json \
            --output-html dashboard.html

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: quality-reports
          path: |
            report.json
            dashboard.html

      - name: Check quality threshold
        run: |
          # Fail if overall score < 80
          SCORE=$(jq '.overallScore' report.json)
          if (( $(echo "$SCORE < 80" | bc -l) )); then
            echo "Quality score $SCORE is below threshold 80"
            exit 1
          fi
```

### 2. Pre-Commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Find all PDFs in staged files
PDFS=$(git diff --cached --name-only --diff-filter=ACM | grep '\.pdf$')

if [ -n "$PDFS" ]; then
  echo "Checking visual quality of PDFs..."

  for pdf in $PDFS; do
    node scripts/check-visual-quality.js "$pdf" --no-ai

    if [ $? -ne 0 ]; then
      echo "❌ Quality check failed for $pdf"
      exit 1
    fi
  done

  echo "✅ All PDFs passed quality check"
fi
```

### 3. Node.js API Integration

```javascript
const VisualQualityInspector = require('./scripts/lib/visual-quality-inspector');

async function checkQuality(pdfPath) {
  const inspector = new VisualQualityInspector();

  try {
    const report = await inspector.inspect(pdfPath);

    console.log(`Grade: ${report.overallGrade.grade}`);
    console.log(`Score: ${report.overallScore.toFixed(1)}/100`);

    // Check against threshold
    if (report.overallScore < 80) {
      throw new Error('Quality below acceptable threshold');
    }

    return report;
  } catch (error) {
    console.error('Quality check failed:', error);
    throw error;
  }
}

// Use in your workflow
checkQuality('exports/document.pdf')
  .then(report => console.log('Quality check passed!'))
  .catch(error => console.error('Quality check failed:', error));
```

### 4. Batch Processing

```javascript
const glob = require('glob');
const VisualQualityInspector = require('./scripts/lib/visual-quality-inspector');

async function batchCheck(pattern) {
  const pdfs = glob.sync(pattern);
  const inspector = new VisualQualityInspector();

  const results = [];

  for (const pdf of pdfs) {
    console.log(`\nChecking: ${pdf}`);
    const report = await inspector.inspect(pdf);
    results.push({
      file: pdf,
      grade: report.overallGrade.grade,
      score: report.overallScore
    });
  }

  // Summary
  console.log('\n📊 Batch Summary:');
  results.forEach(r => {
    console.log(`  ${r.file}: ${r.grade} (${r.score.toFixed(1)})`);
  });

  return results;
}

// Check all PDFs in exports directory
batchCheck('exports/**/*.pdf');
```

---

## API Reference

### VisualQualityInspector Class

#### Constructor

```javascript
const inspector = new VisualQualityInspector(options);
```

**Options:**
- `configPath` (string): Path to custom config file

#### Methods

##### inspect(pdfPath, options)

Perform comprehensive visual quality inspection.

**Parameters:**
- `pdfPath` (string): Path to PDF file
- `options` (object):
  - `pages` (string): Page range to analyze (e.g., "1-3,5")
  - `verbose` (boolean): Enable detailed logging

**Returns:** Promise<Report>

**Report Structure:**
```javascript
{
  metadata: {
    file: string,
    fileName: string,
    timestamp: string,
    duration: string,
    inspectorVersion: string
  },
  pages: [
    {
      pageNumber: number,
      scores: {
        computerVision: {...},
        imageQuality: {...},
        layoutBalance: {...},
        aiAssessments: {...}
      },
      issues: [...],
      strengths: [...],
      overallScore: number,
      grade: string
    }
  ],
  summary: {
    totalPages: number,
    averageScore: number,
    scoreDistribution: {...},
    commonIssues: {...},
    commonStrengths: {...}
  },
  overallGrade: {
    grade: string,
    label: string,
    description: string,
    score: number
  },
  overallScore: number,
  recommendations: [...]
}
```

---

### ImageQualityAnalyzer Class

#### analyze(pageImage)

Analyze image quality metrics.

**Returns:**
```javascript
{
  dpi: { effective: number, score: number, grade: string },
  compressionQuality: { quality: number, score: number, artifactsDetected: boolean },
  colorProfile: { space: string, score: number, iccProfile: string },
  distortion: { isDistorted: boolean, score: number },
  pixelation: { detected: boolean, severity: string, score: number },
  colorGamut: { score: number, grade: string },
  overallScore: number,
  issues: [...],
  recommendations: [...]
}
```

---

### LayoutBalanceAnalyzer Class

#### analyze(pageImage)

Analyze layout balance and composition.

**Returns:**
```javascript
{
  visualWeight: { balance: number, score: number, grade: string },
  whitespace: { ratio: number, score: number, grade: string },
  goldenRatio: { deviation: number, score: number, grade: string },
  symmetry: { vertical: number, horizontal: number, score: number },
  hierarchy: { levels: [...], score: number, grade: string },
  gridAlignment: { columns: number, gridDetected: boolean, score: number },
  density: { density: number, grade: string, score: number },
  overallScore: number,
  issues: [...],
  strengths: [...]
}
```

---

## Troubleshooting

### API Key Errors

**Error:** "OPENAI_API_KEY not set"

**Solution:**
1. Create `.env` file in project root
2. Add: `OPENAI_API_KEY=sk-...`
3. Or run with: `OPENAI_API_KEY=sk-... node scripts/check-visual-quality.js ...`

---

### PDF Conversion Errors

**Error:** "pdf-to-img not available"

**Solution:**
```bash
npm install pdf-to-img
```

The system will still run using placeholder analysis if pdf-to-img is unavailable, but accuracy will be reduced.

---

### Out of Memory

**Error:** "JavaScript heap out of memory"

**Solution:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node scripts/check-visual-quality.js ...
```

Or analyze fewer pages at once:
```bash
node scripts/check-visual-quality.js document.pdf --pages "1-3"
```

---

### Slow Performance

**Issue:** Analysis taking too long (>2 minutes per page)

**Solutions:**

1. **Skip AI assessments:**
```bash
node scripts/check-visual-quality.js document.pdf --no-ai
```

2. **Disable specific AI models** in config:
```json
{
  "aiModels": {
    "gpt4oVision": { "enabled": false },
    "claudeSonnet": { "enabled": true },
    "geminiVision": { "enabled": false }
  }
}
```

3. **Adjust timeout:**
```json
{
  "performance": {
    "aiRequestTimeout": 60000  // 60 seconds
  }
}
```

---

### Rate Limiting

**Error:** "Rate limit exceeded" from AI providers

**Solution:**

1. **Add delays between requests** (modify config):
```json
{
  "performance": {
    "maxConcurrentAIRequests": 1,  // Process sequentially
    "cacheEnabled": true,
    "cacheTTL": 3600
  }
}
```

2. **Use caching** to avoid re-analyzing same pages

3. **Batch process** with delays:
```bash
for pdf in exports/*.pdf; do
  node scripts/check-visual-quality.js "$pdf"
  sleep 5  # Wait 5 seconds between files
done
```

---

## Best Practices

### 1. Establish Baseline

Create a baseline from an approved document:

```bash
# Inspect approved document
node scripts/check-visual-quality.js exports/approved-v1.pdf \
  --output-json baselines/approved-v1.json

# Compare new versions against baseline
# (Use scores and issues as reference)
```

### 2. Iterate Based on Recommendations

```bash
# 1. Run inspection
node scripts/check-visual-quality.js document.pdf --output-json report-v1.json

# 2. Review recommendations and make fixes

# 3. Re-inspect
node scripts/check-visual-quality.js document.pdf --output-json report-v2.json

# 4. Compare scores to verify improvements
```

### 3. Use in Development Workflow

```bash
# Before committing
git add exports/document.pdf
node scripts/check-visual-quality.js exports/document.pdf

# If passed, commit
git commit -m "Add updated document"
```

### 4. Set Quality Gates

```javascript
// In your build script
const report = await inspector.inspect('document.pdf');

// Enforce minimum standards
if (report.overallScore < 85) {
  throw new Error('Quality does not meet A-/B+ standard');
}

// Enforce no critical issues
const criticalIssues = report.pages.flatMap(p =>
  p.issues.filter(i => i.severity === 'CRITICAL')
);

if (criticalIssues.length > 0) {
  throw new Error('Critical issues must be resolved');
}
```

---

## Support & Contributing

### Getting Help

- **Documentation:** `/docs/VISUAL-QUALITY-GUIDE.md` (this file)
- **Configuration:** `/config/visual-quality-config.json`
- **Examples:** See [Integration Examples](#integration-examples)

### Reporting Issues

When reporting issues, include:
1. PDF file (if possible)
2. Command used
3. Full error message
4. Node.js version
5. Environment (OS, available memory)

### Feature Requests

The system is designed to be extensible. To add features:

1. **New Analysis Metric:** Add to `ImageQualityAnalyzer` or `LayoutBalanceAnalyzer`
2. **New AI Model:** Add to `aiModels` config and implement in `visual-quality-inspector.js`
3. **Custom Scoring:** Modify `scoringWeights` in config
4. **New Output Format:** Extend `check-visual-quality.js` CLI tool

---

**Version:** 2.0.0
**Last Updated:** 2025-11-06
**Maintainer:** PDF Orchestrator Team
