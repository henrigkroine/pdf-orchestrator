# PHOTOGRAPHY ENHANCEMENT GUIDE
**AI-Powered Photo Enhancement & Selection System**

## Overview

The Photography Enhancement system provides AI-powered photo enhancement, intelligent selection, cinematic color grading, and composition analysis—all aligned with TEEI brand aesthetics.

---

## Quick Start

### Basic Enhancement

```bash
# Enhance single photo
node scripts/enhance-photos.js enhance photo.jpg

# With TEEI warm preset
node scripts/enhance-photos.js enhance photo.jpg --preset teei-warm

# With before/after comparison
node scripts/enhance-photos.js enhance photo.jpg --comparison

# Batch enhance directory
node scripts/enhance-photos.js batch ./photos --preset teei-warm
```

### Photo Selection

```bash
# Select best 5 photos
node scripts/enhance-photos.js select *.jpg --top 5

# With detailed analysis
node scripts/enhance-photos.js select *.jpg --top 10 --purpose "Marketing materials"
```

### Color Grading

```bash
# Apply cinematic color grading
node scripts/enhance-photos.js grade photo.jpg --preset golden-hour

# With comparison
node scripts/enhance-photos.js grade photo.jpg --preset teei-warm --comparison
```

### Composition Analysis

```bash
# Analyze photo composition
node scripts/enhance-photos.js analyze photo.jpg

# With grid visualization
node scripts/enhance-photos.js analyze photo.jpg --visualize
```

---

## Features

### 1. AI-Powered Enhancement

Intelligent auto-enhancement based on image analysis:

**Adjustments:**
- **Brightness**: Automatic exposure correction
- **Contrast**: Intelligent contrast boost
- **Color**: Temperature and tint adjustments
- **Saturation**: Vibrance and saturation control
- **Sharpness**: Detail enhancement
- **Shadow/Highlight**: Dynamic range optimization

**AI Recommendations:**
- Analyzes image characteristics
- Suggests optimal adjustments
- Provides reasoning for changes
- Considers TEEI brand aesthetics

### 2. TEEI Brand Color Grading

Cinematic color grading aligned with TEEI brand:

**Presets:**
- **TEEI Warm** (default): Signature warm, hopeful look
- **Natural Enhanced**: Subtle natural enhancements
- **Golden Hour**: Warm sunset aesthetic
- **Clean Corporate**: Professional cool tones
- **Vibrant Pop**: Bold saturated colors

**Color Science:**
- Split toning (golden highlights, cool shadows)
- Selective color adjustments
- LUT-style transformations
- Color matrix operations

### 3. Intelligent Photo Selection

AI-powered quality evaluation and ranking:

**Evaluation Criteria:**
- **Technical** (30%): Resolution, sharpness, exposure
- **Aesthetic** (40%): Brand alignment, emotional impact
- **Brand Fit** (30%): TEEI values and aesthetics

**Scoring System:**
- **Excellent** (85-100): Hero images, primary visuals
- **Good** (75-84): Primary content, presentations
- **Acceptable** (65-74): Supporting images
- **Marginal** (50-64): Backup options
- **Poor** (<50): Do not use

### 4. Composition Analysis

Advanced compositional analysis:

**Rules Evaluated:**
- **Rule of Thirds** (30%): Power point alignment
- **Golden Ratio** (25%): Natural proportions
- **Visual Balance** (20%): Weight distribution
- **Leading Lines** (15%): Viewer guidance
- **Symmetry** (10%): Balance and harmony

**Improvement Suggestions:**
- Crop recommendations
- Balance adjustments
- Focal point optimization
- Negative space usage

---

## Enhancement Presets

### TEEI Warm (Default)

**Description:**
Warm, natural tones that embody TEEI's hopeful and empowering brand aesthetic.

**Adjustments:**
- Brightness: +5%
- Contrast: +10%
- Saturation: +15%
- Temperature: +10° (warmer)
- Shadows: Lifted 10%
- Highlights: Tamed 5%

**Best for:**
- TEEI brand materials
- Partnership documents
- Educational content
- Authentic moments

**Example:**
```bash
node scripts/enhance-photos.js enhance classroom.jpg --preset teei-warm
```

### Natural Enhanced

**Description:**
Subtle enhancements preserving authentic, documentary feel.

**Adjustments:**
- Brightness: +2%
- Contrast: +5%
- Saturation: +5%
- Temperature: Neutral
- Minimal adjustments

**Best for:**
- Documentary photography
- Candid moments
- When authenticity is priority

**Example:**
```bash
node scripts/enhance-photos.js enhance candid.jpg --preset natural
```

### Vibrant Pop

**Description:**
Bold, eye-catching colors for maximum visual impact.

**Adjustments:**
- Brightness: +8%
- Contrast: +15%
- Saturation: +25%
- Temperature: +5° (slightly warm)
- Enhanced vibrancy

**Best for:**
- Social media
- Marketing materials
- Youth-oriented content
- Attention-grabbing visuals

**Example:**
```bash
node scripts/enhance-photos.js enhance event.jpg --preset vibrant
```

### Professional Corporate

**Description:**
Clean, slightly cool look for formal business contexts.

**Adjustments:**
- Brightness: +3%
- Contrast: +8%
- Saturation: -2% (slightly desaturated)
- Temperature: -5° (cooler)
- Professional polish

**Best for:**
- Business documents
- Corporate presentations
- Formal reports
- Executive materials

**Example:**
```bash
node scripts/enhance-photos.js enhance headshot.jpg --preset professional
```

---

## Color Grading Presets

### TEEI Warm Grade

**Style:**
Golden highlights + Cool shadows (teal) = Cinematic TEEI look

**Color Matrix:**
```
R: [1.10, -0.05, -0.05]  // Boost reds
G: [-0.02, 1.00, -0.02]  // Neutral greens
B: [-0.08, -0.05, 0.92]  // Reduce blues (warmer)
```

**Characteristics:**
- Warm golden highlights (45° hue)
- Cool teal shadows (195° hue)
- +15% saturation
- +10% contrast
- Lifted shadows

### Golden Hour

**Style:**
Warm sunset aesthetic with golden tones throughout.

**Characteristics:**
- Very warm (+25° temperature)
- Golden highlights (50° hue)
- Blue shadows (210° hue)
- +20% saturation
- High contrast

**Best for:**
- Emotional content
- Inspiring imagery
- Hero images
- Sunset/outdoor shots

### Clean Corporate

**Style:**
Professional, slightly cool, neutral look.

**Characteristics:**
- Cool (-5° temperature)
- Neutral tones
- Slightly desaturated
- Clean highlights
- Professional feel

**Best for:**
- Formal documents
- Corporate branding
- Business headshots
- Professional reports

---

## Photo Selection Workflow

### Step 1: Evaluate Collection

```bash
# Evaluate all photos in directory
node scripts/enhance-photos.js select ./photos/*.jpg --top 10
```

### Step 2: Review Scores

**Output:**
```
🏆 Selected Images:

1. classroom-learning.jpg
   Score: 92.3/100
   Verdict: Excellent - Highly recommended
   Brand Alignment: 9.5/10
   Emotional Impact: 9.0/10
   Best for: Hero image, primary visuals

2. teacher-student.jpg
   Score: 87.8/100
   Verdict: Excellent - Highly recommended
   Brand Alignment: 9.0/10
   Emotional Impact: 8.5/10
   Best for: Primary content, presentations
```

### Step 3: Export Report

**Generated Files:**
- `selection-report.json`: Detailed scoring
- Screenshots of top selections
- Metadata and recommendations

### Step 4: Enhance Selected

```bash
# Enhance top selections
node scripts/enhance-photos.js enhance \
  ./exports/photo-selection/selected/*.jpg \
  --preset teei-warm \
  --comparison
```

---

## Composition Analysis

### Rule of Thirds

**Power Points:**
Intersections of 1/3 gridlines—ideal for subject placement.

**Grid:**
```
┌────┬────┬────┐
│    ●    ●    │
├────┼────┼────┤
│    ●    ●    │
├────┼────┼────┤
│    ●    ●    │
└────┴────┴────┘
```

**Best Practices:**
- Place subjects at ● (power points)
- Align horizon on 1/3 lines
- Avoid centering everything

### Golden Ratio

**Phi Point:**
Focal point at 1/1.618 = 0.618 from edge.

**Characteristics:**
- Natural, pleasing proportions
- Creates visual flow
- Guides viewer attention

### Visual Balance

**Evaluation:**
- Horizontal balance (left vs. right)
- Vertical balance (top vs. bottom)
- Weight distribution
- Color balance

**Score Interpretation:**
- **0.8-1.0**: Well-balanced
- **0.6-0.8**: Moderately balanced
- **<0.6**: Unbalanced (needs adjustment)

### Analysis Example

```bash
node scripts/enhance-photos.js analyze photo.jpg --visualize
```

**Output:**
```
📐 Composition Score: 8.2/10

Visual Balance: well-balanced
  Horizontal: 87.5%
  Vertical: 81.2%

Leading Lines: Present
  Score: 8/10

Symmetry: asymmetrical
  Score: 7/10

💡 Improvement Suggestions:

1. [HIGH] Visual Balance
   Issue: Slight horizontal imbalance
   Suggestion: Crop to center subject on power point
   Technique: Apply rule of thirds grid overlay

2. [MEDIUM] Negative Space
   Issue: Cluttered composition
   Suggestion: Allow more breathing room around subject
   Technique: Crop tighter or wider
```

---

## Advanced Features

### Intelligent Auto-Cropping

```bash
# Enable AI-powered intelligent cropping
node scripts/enhance-photos.js enhance photo.jpg --auto-crop
```

**AI Analysis:**
- Identifies subject/focal point
- Applies compositional rules
- Optimizes aspect ratio
- Removes distracting edges

### Custom Aspect Ratios

```bash
# Crop to 16:9 for presentations
node scripts/enhance-photos.js enhance photo.jpg \
  --auto-crop --aspect-ratio 1.78

# Square for social media
node scripts/enhance-photos.js enhance photo.jpg \
  --auto-crop --aspect-ratio 1.0
```

### Resolution Optimization

```bash
# Optimize for print (300 DPI)
node scripts/enhance-photos.js enhance photo.jpg \
  --max-width 3600 --max-height 2400 \
  --quality 95

# Optimize for web
node scripts/enhance-photos.js enhance photo.jpg \
  --max-width 1920 --max-height 1280 \
  --quality 85 --format webp
```

### Batch Processing

```bash
# Enhance all photos in directory
node scripts/enhance-photos.js batch ./photos \
  --preset teei-warm \
  --comparison \
  --output ./enhanced

# Select then enhance best
node scripts/enhance-photos.js batch ./photos \
  --mode select \
  --top 10
# Then enhance selected photos
```

---

## Programmatic Use

### Enhancement API

```javascript
const PhotoEnhancer = require('./scripts/lib/photo-enhancer');
const enhancer = new PhotoEnhancer();

async function enhancePhoto() {
  const result = await enhancer.enhancePhoto('./photo.jpg', {
    preset: 'teei-warm',
    autoCrop: true,
    format: 'jpeg',
    quality: 90
  });

  // Save enhanced photo
  await enhancer.saveEnhanced(result, './enhanced.jpg');

  // View analysis
  console.log('Brightness:', result.analysis.brightness.assessment);
  console.log('Recommendations:', result.recommendations.overall);
}
```

### Selection API

```javascript
const PhotoSelector = require('./scripts/lib/photo-selector');
const selector = new PhotoSelector();

async function selectBestPhotos() {
  const files = ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'];

  const results = await selector.selectBestImages(files, {
    selectTop: 2,
    purpose: 'Marketing materials',
    target: 'Print and web'
  });

  // Review selected
  results.selected.forEach(img => {
    console.log(img.filename, ':', img.overallScore);
    console.log('Verdict:', img.recommendation.verdict);
  });

  // Export report
  await selector.exportReport(results, './report.json');
}
```

### Color Grading API

```javascript
const ColorGrading = require('./scripts/lib/color-grading');
const grading = new ColorGrading();

async function applyGrading() {
  // Apply preset
  const graded = await grading.applyGrading('./photo.jpg', 'teei-warm');

  // Export
  await grading.exportGraded(graded, './graded.jpg', 'jpeg', 95);

  // Create comparison
  await grading.createComparison('./photo.jpg', graded, './comparison.jpg');
}
```

---

## TEEI Brand Criteria

### Mood & Tone

**Desired:**
- Hopeful
- Empowering
- Warm
- Authentic
- Inclusive

**Avoid:**
- Staged/artificial
- Stock-photo feel
- Corporate-stiff
- Dated aesthetics

### Subjects

**Preferred:**
- Students learning
- Teachers teaching
- Collaboration
- Technology in education
- Diverse representation

**Photography Style:**
- Natural lighting
- Warm color tones
- Authentic moments (not posed)
- Genuine expressions
- Cultural inclusivity

### Technical Standards

**Minimum Requirements:**
- Resolution: 1200px width
- Sharpness: 0.7/1.0
- Exposure: 0.6/1.0
- Color balance: 0.6/1.0

**Recommended:**
- Resolution: 2400px+ for print
- Natural lighting
- Warm color temperature
- Good composition
- Professional quality

---

## Troubleshooting

### Issue: Over-saturated colors

**Solution:**
```bash
# Use less aggressive preset
node scripts/enhance-photos.js enhance photo.jpg --preset natural

# Or adjust custom
# Edit config/photography-config.json saturation value
```

### Issue: Too dark/bright

**Solution:**
- Check original exposure
- AI will auto-adjust brightness
- Manually adjust if needed
- Consider HDR source material

### Issue: Color cast

**Solution:**
- Use white balance correction
- TEEI warm preset adds intentional warmth
- For neutral: use 'natural' or 'professional' presets

### Issue: Soft/blurry

**Solution:**
- Check source image sharpness
- Enhancement can't fix out-of-focus
- Use higher sharpness setting
- Source higher resolution images

### Issue: AI analysis timeout

**Solution:**
- Check internet connection
- Verify API keys set correctly
- Reduce image file size
- Use fallback presets

---

## Best Practices

### Do's

✅ **Start with high-quality originals**
Better input = better output

✅ **Use TEEI warm for brand materials**
Signature look for TEEI documents

✅ **Test multiple presets**
Different photos suit different styles

✅ **Review before/after comparisons**
Ensure enhancements align with goals

✅ **Select photos first, then enhance**
Don't waste time on low-quality images

✅ **Consider final usage**
Print vs. web requires different optimization

### Don'ts

❌ **Don't over-enhance**
Subtle is better than dramatic

❌ **Don't ignore composition**
Enhancement can't fix poor framing

❌ **Don't use low-resolution sources**
Can't add detail that isn't there

❌ **Don't rely only on AI**
Human judgment still essential

❌ **Don't forget brand alignment**
Always check TEEI brand criteria

❌ **Don't skip quality checks**
Test at actual size and usage

---

## Configuration

Edit `/home/user/pdf-orchestrator/config/photography-config.json`:

```json
{
  "defaults": {
    "preset": "teei-warm",
    "autoCrop": false,
    "quality": 90
  },
  "qualityThresholds": {
    "minResolution": 1200,
    "minSharpness": 0.7
  }
}
```

---

## Resources

**Documentation:**
- Photo Enhancer: `/home/user/pdf-orchestrator/scripts/lib/photo-enhancer.js`
- Photo Selector: `/home/user/pdf-orchestrator/scripts/lib/photo-selector.js`
- Composition Analyzer: `/home/user/pdf-orchestrator/scripts/lib/photo-composition.js`
- Color Grading: `/home/user/pdf-orchestrator/scripts/lib/color-grading.js`

**Examples:**
- Enhanced photos: `/home/user/pdf-orchestrator/exports/enhanced-photos/`
- Selection reports: `/home/user/pdf-orchestrator/exports/photo-selection/`
- Composition analysis: `/home/user/pdf-orchestrator/exports/analysis/`

**Support:**
- Help: Run `node scripts/enhance-photos.js --help`
- Presets: Run `node scripts/enhance-photos.js presets`
- Debug: Set `DEBUG=1` environment variable

---

**Last Updated:** 2025-11-06
**Version:** 1.0.0
**Status:** Production Ready
