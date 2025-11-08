# Image Intelligence Quick Start

**Get started with intelligent image automation in 5 minutes**

---

## Installation

```bash
cd /home/user/pdf-orchestrator
npm install
```

**Required:** Node.js 16+, Sharp, OpenAI SDK (already in package.json)

---

## Quick Examples

### 1. Generate Hero Image (DALL-E 3)

```bash
# Set API key
export OPENAI_API_KEY="sk-..."

# Generate hero
node image-intelligence.js generate "AWS partnership students collaborating"
```

**Output:**
- Original: `assets/images/generated/heroes/hero-aws-partnership-students.png`
- Print (300 DPI): `assets/images/generated/optimized/aws-partnership-students-print.png`
- Digital (150 DPI): `assets/images/generated/optimized/aws-partnership-students-digital.jpg`
- Web (72 DPI): `assets/images/generated/optimized/aws-partnership-students-web.webp`

**Cost:** $0.12 (HD quality)

---

### 2. Apply Brand Overlay

```bash
node image-intelligence.js overlay photo.jpg nordshore 0.4
```

**What it does:**
- Applies Nordshore (#00393F) overlay at 40% opacity
- Perfect for hero images with white text
- Saves to: `assets/images/generated/overlays/photo-nordshore-40.png`

**TEEI Brand Colors:**
- `nordshore` - Deep teal (primary)
- `sky` - Light blue (secondary)
- `sand` - Warm beige (background)
- `gold` - Warm metallic (accent)

---

### 3. Optimize for Print/Digital

```bash
# Print (300 DPI)
node image-intelligence.js optimize photo.jpg print

# Digital (150 DPI)
node image-intelligence.js optimize photo.jpg digital
```

**Results:**
- Print: PNG, 300 DPI, 95% quality
- Digital: JPEG, 150 DPI, 85% quality
- Automatic sharpening for print
- 50-80% file size reduction

---

### 4. Intelligent Crop

```bash
# Golden ratio (natural proportions)
node image-intelligence.js crop photo.jpg golden-ratio

# Rule of thirds (power points)
node image-intelligence.js crop photo.jpg rule-of-thirds
```

**Strategies:**
- `golden-ratio` - Uses phi (1.618) for elegant composition
- `rule-of-thirds` - Places subjects at intersection points
- `ai-guided` - AI vision analysis (requires Anthropic API key)

---

### 5. Logo Clearspace

```bash
node image-intelligence.js clearspace teei-logo.png
```

**TEEI Brand Guideline:**
Minimum clearspace = logo height

**Output:**
- Clearspace calculation
- Visual guide PNG (with boundaries)
- Violation detection

---

## JavaScript API

```javascript
const ImageIntelligence = require('./image-intelligence.js');
const imageAI = new ImageIntelligence();

// Size image for frame (no distortion)
const buffer = await imageAI.placeImageInFrame(
    'photo.jpg',
    612,  // Width (points)
    396,  // Height (points)
    { fit: 'cover', smartPosition: true, brandGrading: true }
);

// Generate hero
const hero = await imageAI.generateHeroImage('AWS partnership', {
    quality: 'hd',
    mood: 'inspiring and hopeful'
});

// Apply overlay
const overlaid = await imageAI.applyBrandOverlay('photo.jpg', 'nordshore', 0.4);

// Optimize
const optimized = await imageAI.optimizeImageQuality('photo.jpg', 'print');

// Calculate clearspace
const clearspace = await imageAI.calculateLogoClearspace('logo.png');
```

---

## Python API (InDesign/MCP)

```python
from image_automation import ImageAutomation

img = ImageAutomation()

# Place hero with overlay
img.place_hero_image(
    'hero.jpg',
    page_number=1,
    apply_overlay=True,
    overlay_color='nordshore',
    overlay_opacity=0.4
)

# Enforce clearspace
clearspace = img.enforce_logo_clearspace('teei-logo.png', x=100, y=100)

if not clearspace['valid']:
    for violation in clearspace['violations']:
        print(violation['fix'])

# Generate and place
img.generate_and_place_hero('AWS partnership students', page_number=1)

# Batch place
img.batch_place_images([
    {
        'image_path': 'hero.jpg',
        'frame_bounds': {'x': 0, 'y': 0, 'width': 612, 'height': 396}
    }
])
```

---

## Common Frame Sizes (Letter 8.5x11)

```
Full page:     612 x 792 points
Half page:     612 x 396 points
Third page:    612 x 264 points
Quarter page:  306 x 396 points
Hero area:     612 x 396 points (top 50%)
```

---

## Brand Overlay Guide

**Recommended opacity by use case:**

| Use Case | Color | Opacity | Text Color |
|----------|-------|---------|------------|
| Hero with text | nordshore | 0.4-0.6 | White |
| Background tint | sky | 0.2-0.3 | Dark |
| Warm accent | sand | 0.15-0.25 | Dark |
| Premium feel | gold | 0.3-0.5 | White |

**Example:**

```bash
# Hero image with white text
node image-intelligence.js overlay hero.jpg nordshore 0.5

# Subtle background tint
node image-intelligence.js overlay section.jpg sky 0.25

# Premium accent section
node image-intelligence.js overlay feature.jpg gold 0.4
```

---

## Quality Presets

| Preset | DPI | Format | Quality | Use Case |
|--------|-----|--------|---------|----------|
| print | 300 | PNG | 95% | High-quality print |
| digital | 150 | JPEG | 85% | Digital documents, PDFs |
| web | 72 | WebP | 80% | Web pages, email |
| premium | 600 | PNG | 100% | Large format, archival |

---

## Run Demo

```bash
# Full feature demonstration
node examples/image-intelligence-demo.js

# Python examples
python3 image_automation.py example
```

---

## Troubleshooting

### "Cannot find module 'sharp'"
```bash
npm install sharp
```

### "OpenAI API key not found"
```bash
export OPENAI_API_KEY="sk-..."
# Or create .env file
```

### "Rate limit exceeded"
Add delays between DALL-E calls:
```javascript
await new Promise(resolve => setTimeout(resolve, 15000)); // 15 seconds
```

---

## Cost Reference

**DALL-E 3:**
- Standard: $0.08 per image (1024x1024)
- HD: $0.12 per image (1792x1024)

**Claude Vision (AI-guided crop):**
- ~$0.01 per image analysis

**Example costs:**
- 10 hero images (HD): $1.20
- Full document (15 images): ~$2.00

---

## Next Steps

1. **Read full documentation:** `docs/IMAGE-INTELLIGENCE-GUIDE.md`
2. **Try examples:** `node examples/image-intelligence-demo.js`
3. **Integrate in your workflow:** See examples in guide
4. **Review TEEI brand guidelines:** `reports/TEEI_AWS_Design_Fix_Report.md`

---

## Key Files

```
image-intelligence.js          # Main engine (JavaScript)
image_automation.py            # InDesign/MCP integration (Python)
docs/IMAGE-INTELLIGENCE-GUIDE.md  # Complete documentation
examples/image-intelligence-demo.js  # Feature demos
scripts/lib/photo-composition.js     # Composition analysis
scripts/lib/photo-enhancer.js        # Photo enhancement
```

---

## Support

- Full guide: `docs/IMAGE-INTELLIGENCE-GUIDE.md`
- TEEI brand guidelines: `reports/TEEI_AWS_Design_Fix_Report.md`
- GitHub Issues: [Link to repo]

---

**Version:** 1.0.0
**Last Updated:** 2025-11-08
