# IMAGE INTELLIGENCE ENGINE - Complete Guide

**Intelligent image placement and optimization for TEEI PDF documents**

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Core Features](#core-features)
3. [Installation](#installation)
4. [JavaScript API](#javascript-api)
5. [Python API](#python-api)
6. [TEEI Brand Compliance](#teei-brand-compliance)
7. [Advanced Usage](#advanced-usage)
8. [Integration Examples](#integration-examples)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

### JavaScript (Node.js)

```javascript
const ImageIntelligence = require('./image-intelligence.js');

const imageAI = new ImageIntelligence();

// Generate hero image with DALL-E 3
await imageAI.generateHeroImage('AWS partnership collaboration');

// Optimize for print (300 DPI)
await imageAI.optimizeImageQuality('hero.jpg', 'print');

// Apply brand overlay (Nordshore at 40%)
await imageAI.applyBrandOverlay('photo.jpg', 'nordshore', 0.4);

// Intelligent crop using golden ratio
await imageAI.intelligentCrop('image.jpg', { strategy: 'golden-ratio' });

// Calculate logo clearspace
await imageAI.calculateLogoClearspace('teei-logo.png', { createGuide: true });
```

### Python (InDesign/MCP)

```python
from image_automation import ImageAutomation

img = ImageAutomation()

# Place hero image with brand overlay
img.place_hero_image(
    'hero.jpg',
    page_number=1,
    apply_overlay=True,
    overlay_color='nordshore',
    overlay_opacity=0.4
)

# Enforce logo clearspace
clearspace = img.enforce_logo_clearspace('teei-logo.png', x=100, y=100)

# Generate and place hero image
img.generate_and_place_hero('AWS partnership students', page_number=1)

# Batch place images
img.batch_place_images([
    {'image_path': 'hero.jpg', 'frame_bounds': {'x': 0, 'y': 0, 'width': 612, 'height': 396}},
    {'image_path': 'photo.jpg', 'frame_bounds': {'x': 50, 'y': 450, 'width': 250, 'height': 200}}
])
```

### CLI (Command Line)

```bash
# Generate hero image
node image-intelligence.js generate "AWS partnership collaboration"

# Optimize for print
node image-intelligence.js optimize hero.jpg print

# Apply overlay
node image-intelligence.js overlay photo.jpg nordshore 0.4

# Intelligent crop
node image-intelligence.js crop image.jpg golden-ratio

# Calculate clearspace
node image-intelligence.js clearspace teei-logo.png

# Show statistics
node image-intelligence.js stats
```

---

## Core Features

### 1. Intelligent Image Sizing & Placement

**Automatically size images to fill frames without distortion**

```javascript
// JavaScript
const buffer = await imageAI.placeImageInFrame(
    'photo.jpg',
    612,  // Frame width (points)
    396,  // Frame height (points)
    {
        fit: 'cover',           // 'cover', 'contain', 'fill'
        position: 'center',     // 'center', 'top', 'bottom', 'left', 'right'
        smartPosition: true,    // Use AI to find best focal point
        brandGrading: true,     // Apply TEEI color grading
        quality: qualityPresets.print  // 300 DPI print quality
    }
);
```

**How it works:**
- Calculates aspect ratios to prevent distortion
- Uses object-fit: cover behavior (fills frame, maintains aspect ratio)
- Smart positioning based on golden ratio composition analysis
- Applies TEEI brand color grading (warm tones)
- Optimizes quality based on target use (print/digital/web)

**Letter size reference:**
- Full page: 612 x 792 points (8.5 x 11 inches)
- Half page: 612 x 396 points
- Quarter page: 306 x 396 points

### 2. Logo Clearspace Enforcement

**Per TEEI brand guidelines: clearspace = logo height**

```javascript
// JavaScript
const clearspace = await imageAI.calculateLogoClearspace(
    'teei-logo.png',
    { createGuide: true }  // Generate visual guide
);

console.log(`Minimum clearspace: ${clearspace.minimum}px on all sides`);
```

```python
# Python - Validate clearspace in layout
clearspace = img.enforce_logo_clearspace(
    'teei-logo.png',
    x=100,  # Logo position
    y=100,
    document_width=612,
    document_height=792
)

if not clearspace['valid']:
    for violation in clearspace['violations']:
        print(violation['fix'])  # e.g., "Move logo right by 25pt"
```

**Features:**
- Automatically calculates logo height (excluding transparency)
- Enforces TEEI brand guideline (clearspace = logo height)
- Validates against document edges
- Checks for violations with other elements
- Generates visual clearspace guide (PNG with boundaries)

### 3. AI-Powered Hero Image Generation

**Generate brand-compliant images with DALL-E 3**

```javascript
const result = await imageAI.generateHeroImage(
    'AWS partnership students collaborating on laptops',
    {
        size: '1792x1024',     // Landscape hero format
        quality: 'hd',         // HD quality ($0.12) or standard ($0.08)
        context: 'Educational technology partnership document',
        mood: 'hopeful, inspiring, professional'
    }
);

// Automatically generates 3 optimized versions:
// - Print: 300 DPI PNG
// - Digital: 150 DPI JPEG
// - Web: 72 DPI WebP
```

**TEEI Brand Photography Requirements (automatically enforced):**
- ✓ Natural lighting (not studio)
- ✓ Warm color tones (Sand/Beige palette)
- ✓ Authentic moments (not staged)
- ✓ Diverse representation
- ✓ Shows connection and hope
- ✓ Photorealistic, professional quality
- ✓ Uses official TEEI colors (Nordshore, Sky, Sand, Gold)

**Cost:**
- Standard quality: $0.08 per image
- HD quality: $0.12 per image

### 4. Photo Overlays with Brand Colors

**Apply TEEI brand color tints for text readability**

```javascript
// Apply Nordshore overlay at 40% opacity
const overlaid = await imageAI.applyBrandOverlay(
    'photo.jpg',
    'nordshore',  // TEEI brand color
    0.4           // 40% opacity
);

// Available brand colors:
// - nordshore (#00393F) - Primary, deep teal
// - sky (#C9E4EC) - Secondary, light blue
// - sand (#FFF1E2) - Background, warm beige
// - beige (#EFE1DC) - Background, soft neutral
// - moss (#65873B) - Accent, green
// - gold (#BA8F5A) - Accent, warm metallic
// - clay (#913B2F) - Accent, terracotta
```

**Common overlay use cases:**
- Hero images with text overlay: Nordshore 40-60%
- Section backgrounds: Sky 20-30%
- Photo cards: Sand 15-25%
- Accent sections: Gold 30-40%

**Recommended opacity by color:**
```
Nordshore: 0.4 - 0.6  (dark overlay for light text)
Sky:       0.2 - 0.4  (light overlay for dark text)
Sand:      0.15 - 0.3 (subtle warm tint)
Gold:      0.3 - 0.5  (premium accent)
```

### 5. Intelligent Cropping

**Crop images using compositional rules**

```javascript
// Rule of thirds
const cropped = await imageAI.intelligentCrop('photo.jpg', {
    strategy: 'rule-of-thirds'  // Emphasize power points
});

// Golden ratio (phi = 1.618)
const cropped = await imageAI.intelligentCrop('photo.jpg', {
    strategy: 'golden-ratio'  // Natural proportions
});

// AI-guided (uses Claude vision)
const cropped = await imageAI.intelligentCrop('photo.jpg', {
    strategy: 'ai-guided'  // Smart focal point detection
});
```

**Strategies explained:**

**Rule of Thirds:**
- Divides image into 9 equal parts (3x3 grid)
- Places key elements at intersection points ("power points")
- Best for: Portraits, landscapes, general photography
- Result: Balanced, professional composition

**Golden Ratio:**
- Uses phi (1.618) proportions
- Creates naturally pleasing compositions
- Best for: Artistic images, premium documents
- Result: Elegant, timeless aesthetic

**AI-Guided:**
- Uses Claude vision to analyze image
- Identifies main subject and focal points
- Considers negative space and leading lines
- Best for: Complex images, when unsure of strategy
- Result: Optimized for visual impact

### 6. Quality Optimization

**Optimize for print, digital, web, or premium use**

```javascript
const optimized = await imageAI.optimizeImageQuality(
    'photo.jpg',
    'print',  // 'print', 'digital', 'web', 'premium'
    {
        maxWidth: 2400,  // Optional max width
        sharpen: true    // Apply sharpening
    }
);

console.log(optimized.stats);
// {
//   originalSize: 5242880,      // 5 MB
//   optimizedSize: 1048576,     // 1 MB
//   reduction: '80.0%',
//   dpi: 300,
//   format: 'png'
// }
```

**Quality Presets:**

| Preset  | DPI | Format | Quality | Use Case                |
|---------|-----|--------|---------|-------------------------|
| Print   | 300 | PNG    | 95%     | High-quality print      |
| Digital | 150 | JPEG   | 85%     | Digital documents, PDFs |
| Web     | 72  | WebP   | 80%     | Web pages, email        |
| Premium | 600 | PNG    | 100%    | Large format, archival  |

**Automatic optimizations:**
- DPI adjustment
- Format conversion
- Smart sharpening (for print/premium)
- Chroma subsampling optimization
- Progressive JPEG encoding
- Lossless WebP compression

---

## Installation

### Prerequisites

```bash
# Node.js 16+ required
node --version

# Python 3.8+ required (for InDesign integration)
python3 --version
```

### Install Dependencies

```bash
# Navigate to project
cd /home/user/pdf-orchestrator

# Install Node.js dependencies
npm install

# Required packages (already in package.json):
# - sharp (image processing)
# - openai (DALL-E 3 generation)
# - @anthropic-ai/sdk (Claude vision analysis)
# - playwright (PDF generation)
```

### Environment Setup

Create `.env` file:

```bash
# OpenAI API key (for DALL-E 3 image generation)
OPENAI_API_KEY=sk-...

# Anthropic API key (for Claude vision analysis)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Custom output directory
IMAGE_OUTPUT_DIR=/path/to/output
```

### Verify Installation

```bash
# Test image intelligence
node image-intelligence.js stats

# Test Python integration
python3 image_automation.py example
```

---

## JavaScript API

### Class: ImageIntelligence

```javascript
const ImageIntelligence = require('./image-intelligence.js');
const imageAI = new ImageIntelligence(config);
```

**Constructor Options:**

```javascript
{
    openaiKey: 'sk-...',           // OpenAI API key
    anthropicKey: 'sk-ant-...',    // Anthropic API key
    outputDir: './assets/images/generated',
    cacheDir: './assets/cache/images'
}
```

### Methods

#### placeImageInFrame(imagePath, frameWidth, frameHeight, options)

Size and optimize image for frame placement.

**Parameters:**
- `imagePath` (string): Path to image file
- `frameWidth` (number): Frame width in pixels
- `frameHeight` (number): Frame height in pixels
- `options` (object):
  - `fit` (string): 'cover', 'contain', 'fill', 'inside', 'outside'
  - `position` (string): 'center', 'top', 'bottom', 'left', 'right'
  - `smartPosition` (boolean): Use AI composition analysis
  - `brandGrading` (boolean): Apply TEEI color grading
  - `quality` (object): Quality preset

**Returns:** Promise<Buffer> - Optimized image buffer

**Example:**

```javascript
const buffer = await imageAI.placeImageInFrame('photo.jpg', 612, 396, {
    fit: 'cover',
    smartPosition: true,
    brandGrading: true,
    quality: imageAI.qualityPresets.print
});
```

#### generateHeroImage(concept, options)

Generate hero image with DALL-E 3.

**Parameters:**
- `concept` (string): Image concept/theme
- `options` (object):
  - `size` (string): '1792x1024', '1024x1792', '1024x1024'
  - `quality` (string): 'hd' or 'standard'
  - `context` (string): Additional context
  - `mood` (string): Desired mood

**Returns:** Promise<Object> - Generation result with paths and metadata

**Example:**

```javascript
const result = await imageAI.generateHeroImage(
    'AWS partnership students collaborating',
    {
        size: '1792x1024',
        quality: 'hd',
        context: 'Educational technology partnership',
        mood: 'hopeful and inspiring'
    }
);

console.log(result.optimized.print);  // Path to 300 DPI print version
console.log(result.optimized.digital);  // Path to 150 DPI digital version
console.log(result.optimized.web);  // Path to 72 DPI web version
```

#### applyBrandOverlay(imagePath, color, opacity, options)

Apply TEEI brand color overlay.

**Parameters:**
- `imagePath` (string): Path to image
- `color` (string): Brand color name
- `opacity` (number): 0-1
- `options` (object): Additional options

**Returns:** Promise<Object> - Result with overlaid image path

**Example:**

```javascript
const result = await imageAI.applyBrandOverlay('photo.jpg', 'nordshore', 0.4);
console.log(result.path);  // Path to overlaid image
```

#### intelligentCrop(imagePath, options)

Crop image using compositional rules.

**Parameters:**
- `imagePath` (string): Path to image
- `options` (object):
  - `strategy` (string): 'rule-of-thirds', 'golden-ratio', 'ai-guided'

**Returns:** Promise<Object> - Crop result with path and metadata

**Example:**

```javascript
const cropped = await imageAI.intelligentCrop('photo.jpg', {
    strategy: 'golden-ratio'
});
```

#### calculateLogoClearspace(logoPath, options)

Calculate logo clearspace per TEEI brand guidelines.

**Parameters:**
- `logoPath` (string): Path to logo
- `options` (object):
  - `createGuide` (boolean): Generate visual guide

**Returns:** Promise<Object> - Clearspace specifications

**Example:**

```javascript
const clearspace = await imageAI.calculateLogoClearspace('teei-logo.png', {
    createGuide: true
});

console.log(`Minimum clearspace: ${clearspace.minimum}px`);
console.log(`Visual guide: ${clearspace.guidePath}`);
```

#### optimizeImageQuality(imagePath, targetUse, options)

Optimize image quality for target use.

**Parameters:**
- `imagePath` (string): Path to image
- `targetUse` (string): 'print', 'digital', 'web', 'premium'
- `options` (object):
  - `maxWidth` (number): Maximum width
  - `sharpen` (boolean): Apply sharpening

**Returns:** Promise<Object> - Optimization result with stats

**Example:**

```javascript
const optimized = await imageAI.optimizeImageQuality('photo.jpg', 'print', {
    maxWidth: 2400,
    sharpen: true
});

console.log(optimized.stats.reduction);  // "75.3%"
```

#### batchProcess(imagePaths, operation, options)

Process multiple images.

**Parameters:**
- `imagePaths` (Array<string>): Array of image paths
- `operation` (string): 'optimize', 'overlay', 'crop', 'enhance'
- `options` (object): Operation-specific options

**Returns:** Promise<Array> - Results for each image

**Example:**

```javascript
const results = await imageAI.batchProcess(
    ['photo1.jpg', 'photo2.jpg', 'photo3.jpg'],
    'optimize',
    { targetUse: 'digital' }
);

console.log(`Success: ${results.filter(r => r.success).length}`);
```

---

## Python API

### Class: ImageAutomation

```python
from image_automation import ImageAutomation

img = ImageAutomation(mcp_host='localhost', mcp_port=8012)
```

### Methods

#### place_image_in_frame(image_path, frame_bounds, fit_mode, position)

Place image in InDesign frame.

**Parameters:**
- `image_path` (str): Path to image
- `frame_bounds` (dict): {'x': float, 'y': float, 'width': float, 'height': float}
- `fit_mode` (str): 'fill', 'fit', 'stretch'
- `position` (str): 'center', 'top', 'bottom', 'left', 'right'

**Returns:** dict - Placement result

**Example:**

```python
result = img.place_image_in_frame(
    'photo.jpg',
    frame_bounds={'x': 50, 'y': 50, 'width': 300, 'height': 200},
    fit_mode='fill',
    position='center'
)
```

#### place_hero_image(image_path, page_number, apply_overlay, overlay_color, overlay_opacity)

Place hero image on page.

**Parameters:**
- `image_path` (str): Path to hero image
- `page_number` (int): Target page (1-indexed)
- `apply_overlay` (bool): Apply brand overlay
- `overlay_color` (str): Brand color name
- `overlay_opacity` (float): 0-1

**Returns:** dict - Placement result

**Example:**

```python
result = img.place_hero_image(
    'hero.jpg',
    page_number=1,
    apply_overlay=True,
    overlay_color='nordshore',
    overlay_opacity=0.4
)
```

#### enforce_logo_clearspace(logo_path, x, y, document_width, document_height)

Validate logo clearspace.

**Parameters:**
- `logo_path` (str): Path to logo
- `x, y` (float): Logo position in points
- `document_width, document_height` (float): Document size in points

**Returns:** dict - Validation result with violations

**Example:**

```python
clearspace = img.enforce_logo_clearspace(
    'teei-logo.png',
    x=100,
    y=100,
    document_width=612,
    document_height=792
)

if not clearspace['valid']:
    for violation in clearspace['violations']:
        print(violation['fix'])
```

#### generate_and_place_hero(concept, page_number, apply_overlay)

Generate and place hero image.

**Parameters:**
- `concept` (str): Image concept
- `page_number` (int): Target page
- `apply_overlay` (bool): Apply brand overlay

**Returns:** dict - Generation and placement result

**Example:**

```python
result = img.generate_and_place_hero(
    'AWS partnership students collaborating',
    page_number=1,
    apply_overlay=True
)
```

#### batch_place_images(image_mappings)

Batch place multiple images.

**Parameters:**
- `image_mappings` (list): List of image/frame mappings

**Returns:** list - Results for each placement

**Example:**

```python
results = img.batch_place_images([
    {
        'image_path': 'hero.jpg',
        'frame_bounds': {'x': 0, 'y': 0, 'width': 612, 'height': 396},
        'fit_mode': 'fill'
    },
    {
        'image_path': 'photo.jpg',
        'frame_bounds': {'x': 50, 'y': 450, 'width': 250, 'height': 200},
        'fit_mode': 'cover'
    }
])
```

---

## TEEI Brand Compliance

### Official Color Palette

```javascript
const brandColors = {
    // Primary (80% usage)
    nordshore: '#00393F',  // Deep teal
    sky: '#C9E4EC',        // Light blue accent
    sand: '#FFF1E2',       // Warm neutral background
    beige: '#EFE1DC',      // Soft neutral

    // Accent (20% usage)
    moss: '#65873B',       // Natural green
    gold: '#BA8F5A',       // Warm metallic
    clay: '#913B2F'        // Rich terracotta
};
```

### Photography Requirements

All generated and selected images MUST follow TEEI brand guidelines:

- ✓ **Lighting:** Natural (golden hour, soft window light)
- ✓ **Tones:** Warm colors aligned with Sand/Beige palette
- ✓ **Authenticity:** Genuine moments, not staged
- ✓ **Diversity:** Diverse representation required
- ✓ **Emotion:** Connection, hope, empowerment
- ✓ **Style:** Photorealistic, professional quality

### Logo Clearspace Rules

Per TEEI Design Guidelines page 8:

**Minimum clearspace = height of logo icon element**

```
┌─────────────────────────────────┐
│                                 │
│     ┌───────────────┐           │ ← Minimum clearspace
│     │               │           │   = Logo height
│     │  TEEI  LOGO   │  ← Logo   │
│     │               │           │
│     └───────────────┘           │
│                                 │ ← Minimum clearspace
└─────────────────────────────────┘   = Logo height
```

**No text, graphics, or other logos within clearspace zone.**

---

## Advanced Usage

### Custom Composition Analysis

```javascript
const PhotoComposition = require('./scripts/lib/photo-composition.js');
const compositionAnalyzer = new PhotoComposition();

const analysis = await compositionAnalyzer.analyzeComposition('photo.jpg');

console.log(analysis.score);  // Overall composition score
console.log(analysis.ruleOfThirds.powerPoints);  // Power point coordinates
console.log(analysis.goldenRatio.focalPoint);    // Golden ratio focal point
console.log(analysis.suggestions);  // Improvement suggestions
```

### Enhanced Photo Processing

```javascript
const PhotoEnhancer = require('./scripts/lib/photo-enhancer.js');
const photoEnhancer = new PhotoEnhancer();

const enhanced = await photoEnhancer.enhancePhoto('photo.jpg', {
    preset: 'teei-warm',  // TEEI brand color grading
    autoCrop: true,       // Intelligent cropping
    optimizeQuality: true // Quality optimization
});

console.log(enhanced.enhanced);  // Path to enhanced image
console.log(enhanced.analysis);  // AI analysis results
```

### Integration with Existing Scripts

```javascript
// In create-ukraine-WORLD-CLASS.js or similar

const ImageIntelligence = require('./image-intelligence.js');
const imageAI = new ImageIntelligence();

// Generate hero for page 1
const hero = await imageAI.generateHeroImage(
    'Ukrainian students learning English online',
    { quality: 'hd', mood: 'hopeful and empowering' }
);

// Apply overlay for text readability
const heroWithOverlay = await imageAI.applyBrandOverlay(
    hero.optimized.digital,
    'nordshore',
    0.5
);

// Use in HTML/CSS
const heroBase64 = fs.readFileSync(heroWithOverlay.path).toString('base64');
const heroDataURL = `data:image/png;base64,${heroBase64}`;

// In HTML:
// <div style="background-image: url('${heroDataURL}')">...</div>
```

---

## Integration Examples

### Example 1: Complete Document Workflow

```javascript
const ImageIntelligence = require('./image-intelligence.js');
const imageAI = new ImageIntelligence();

async function createDocument() {
    // 1. Generate hero image
    console.log('Generating hero image...');
    const hero = await imageAI.generateHeroImage(
        'AWS partnership students collaborating on cloud projects',
        { quality: 'hd' }
    );

    // 2. Apply brand overlay
    console.log('Applying brand overlay...');
    const heroWithOverlay = await imageAI.applyBrandOverlay(
        hero.optimized.print,
        'nordshore',
        0.45
    );

    // 3. Optimize for print
    console.log('Optimizing for print...');
    const printReady = await imageAI.optimizeImageQuality(
        heroWithOverlay.path,
        'print'
    );

    // 4. Calculate logo clearspace
    console.log('Validating logo clearspace...');
    const clearspace = await imageAI.calculateLogoClearspace(
        'assets/images/teei-logo-white.png',
        { createGuide: true }
    );

    console.log('Document assets ready!');
    return {
        hero: printReady.path,
        clearspace: clearspace,
        cost: hero.metadata.cost
    };
}

createDocument();
```

### Example 2: Batch Image Processing

```javascript
async function processBatch() {
    const imageAI = new ImageIntelligence();

    const images = [
        'assets/images/mentorship-hero.jpg',
        'assets/images/mentorship-hands.jpg',
        'assets/images/mentorship-team.jpg'
    ];

    // Batch optimize for digital use
    const results = await imageAI.batchProcess(images, 'optimize', {
        targetUse: 'digital'
    });

    // Batch apply overlays
    const overlays = await imageAI.batchProcess(
        results.filter(r => r.success).map(r => r.result.path),
        'overlay',
        { color: 'nordshore', opacity: 0.3 }
    );

    console.log(`Processed ${overlays.filter(r => r.success).length} images`);
}
```

### Example 3: InDesign Integration

```python
from image_automation import ImageAutomation

def create_indesign_document():
    img = ImageAutomation()

    # Page 1: Hero image
    img.place_hero_image(
        'assets/images/hero-teei-aws.png',
        page_number=1,
        apply_overlay=True,
        overlay_color='nordshore',
        overlay_opacity=0.4
    )

    # Page 1: Logo with clearspace
    clearspace = img.enforce_logo_clearspace(
        'assets/images/teei-logo-white.png',
        x=50,
        y=50
    )

    if not clearspace['valid']:
        print("WARNING: Logo clearspace violations!")
        for v in clearspace['violations']:
            print(f"  - {v['fix']}")

    # Page 2: Program images
    img.batch_place_images([
        {
            'image_path': 'assets/images/mentorship-hero.jpg',
            'frame_bounds': {'x': 50, 'y': 100, 'width': 250, 'height': 200}
        },
        {
            'image_path': 'assets/images/mentorship-hands.jpg',
            'frame_bounds': {'x': 312, 'y': 100, 'width': 250, 'height': 200}
        }
    ])

    print("Document created successfully!")

create_indesign_document()
```

---

## Troubleshooting

### Issue: "Cannot find module 'sharp'"

**Solution:**

```bash
npm install sharp
```

If installation fails, try:

```bash
npm install --platform=linux --arch=x64 sharp
```

### Issue: "OpenAI API key not found"

**Solution:**

Set environment variable:

```bash
export OPENAI_API_KEY="sk-..."

# Or create .env file:
echo "OPENAI_API_KEY=sk-..." > .env
```

### Issue: "Image generation failed: Rate limit exceeded"

**Solution:**

DALL-E 3 has rate limits:
- Free tier: 5 images/minute
- Paid tier: 50 images/minute

Add delays between requests:

```javascript
for (const concept of concepts) {
    await imageAI.generateHeroImage(concept);
    await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
}
```

### Issue: "Clearspace violations detected"

**Solution:**

Move logo or other elements:

```python
clearspace = img.enforce_logo_clearspace('logo.png', x=100, y=100)

if not clearspace['valid']:
    # Adjust logo position based on violations
    new_x = 100
    new_y = 100

    for violation in clearspace['violations']:
        if violation['side'] == 'left':
            new_x += violation['distance']
        elif violation['side'] == 'top':
            new_y += violation['distance']

    # Retry with adjusted position
    clearspace = img.enforce_logo_clearspace('logo.png', x=new_x, y=new_y)
```

### Issue: "Image quality too low"

**Solution:**

Use higher quality preset:

```javascript
// Instead of 'digital':
await imageAI.optimizeImageQuality('image.jpg', 'print');

// Or use 'premium' for highest quality:
await imageAI.optimizeImageQuality('image.jpg', 'premium');
```

### Issue: "Overlay color not showing"

**Solution:**

Increase opacity or use darker color:

```javascript
// Instead of opacity 0.2:
await imageAI.applyBrandOverlay('photo.jpg', 'nordshore', 0.5);

// Or use darker brand color:
await imageAI.applyBrandOverlay('photo.jpg', 'clay', 0.4);
```

---

## Performance Tips

1. **Cache generated images** - Reuse instead of regenerating
2. **Use batch operations** - Process multiple images together
3. **Optimize before placement** - Pre-optimize images for target use
4. **Use appropriate quality presets** - Don't use 'premium' unless needed
5. **Enable smart positioning** - Let AI find best focal points
6. **Leverage composition analysis** - Use intelligent cropping

---

## Cost Estimation

### DALL-E 3 Image Generation

- **Standard quality:** $0.08 per image (1024x1024)
- **HD quality:** $0.12 per image (1792x1024 or 1024x1792)

**Example costs:**
- 10 hero images (HD): $1.20
- 50 supporting images (standard): $4.00
- Full document (5 pages, 15 images): ~$2.00

### Claude Vision Analysis

- **Input tokens:** $3 per million tokens
- **Output tokens:** $15 per million tokens

**Example costs:**
- AI-guided crop (1 image): ~$0.01
- Composition analysis (1 image): ~$0.01
- Batch analysis (100 images): ~$1.00

---

## Resources

### Documentation
- TEEI Design Guidelines: `/reports/TEEI_AWS_Design_Fix_Report.md`
- Partner Logo Guide: `/docs/PARTNER-LOGO-INTEGRATION-GUIDE.md`
- Font Installation: `/assets/fonts/README.md`

### Source Code
- Image Intelligence: `/image-intelligence.js`
- Python Integration: `/image_automation.py`
- Photo Composition: `/scripts/lib/photo-composition.js`
- Photo Enhancer: `/scripts/lib/photo-enhancer.js`

### Support
- GitHub Issues: [Link to repo issues]
- TEEI Documentation: T:\TEEI\TEEI Overviews\
- Brand Guidelines: T:\TEEI\TEEI Overviews\TEEI Design Guidelines.pdf

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Author:** TEEI Development Team
