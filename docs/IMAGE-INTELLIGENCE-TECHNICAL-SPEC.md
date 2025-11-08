# Image Intelligence Engine - Technical Specification

**Version:** 1.0.0
**Date:** 2025-11-08
**Status:** Production Ready

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                   IMAGE INTELLIGENCE ENGINE                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  JavaScript    │  │  Python        │  │  CLI         │  │
│  │  API           │  │  Integration   │  │  Interface   │  │
│  │                │  │  (MCP/InDesign)│  │              │  │
│  └───────┬────────┘  └────────┬───────┘  └──────┬───────┘  │
│          │                     │                 │          │
│          └─────────────────────┴─────────────────┘          │
│                              │                               │
│  ┌──────────────────────────┴───────────────────────────┐  │
│  │              CORE PROCESSING LAYER                    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  • Image Sizing & Placement                           │  │
│  │  • Logo Clearspace Calculation                        │  │
│  │  • Brand Overlay Application                          │  │
│  │  • Intelligent Cropping                               │  │
│  │  • Quality Optimization                               │  │
│  │  • Batch Processing                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────┴───────────────────────────┐  │
│  │           SPECIALIZED MODULES                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  • Photo Composition Analyzer                         │  │
│  │  • Photo Enhancer                                     │  │
│  │  • DALL-E 3 Integration                              │  │
│  │  • Claude Vision Analysis                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────┴───────────────────────────┐  │
│  │              FOUNDATION LAYER                         │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  • Sharp (image processing)                           │  │
│  │  • OpenAI SDK (DALL-E 3)                             │  │
│  │  • Anthropic SDK (Claude)                             │  │
│  │  • Node.js File System                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Algorithms

### 1. Intelligent Image Sizing

**Algorithm:** Aspect-Ratio-Preserving Fill (Cover Fit)

```
Input:
  - imageWidth, imageHeight (source image dimensions)
  - frameWidth, frameHeight (target frame dimensions)
  - fitMode ('cover', 'contain', 'fill')
  - position ('center', 'top', 'bottom', 'left', 'right')

Process:
  1. Calculate aspect ratios:
     imageAspect = imageWidth / imageHeight
     frameAspect = frameWidth / frameHeight

  2. Determine resize strategy based on fitMode:

     IF fitMode == 'cover':
       // Fill frame completely, crop excess
       IF imageAspect > frameAspect:
         // Image wider than frame
         newHeight = frameHeight
         newWidth = frameHeight * imageAspect
         crop horizontally based on position
       ELSE:
         // Image taller than frame
         newWidth = frameWidth
         newHeight = frameWidth / imageAspect
         crop vertically based on position

     ELSE IF fitMode == 'contain':
       // Fit entire image, letterbox if needed
       IF imageAspect > frameAspect:
         newWidth = frameWidth
         newHeight = frameWidth / imageAspect
       ELSE:
         newHeight = frameHeight
         newWidth = frameHeight * imageAspect

     ELSE IF fitMode == 'fill':
       // Stretch to fill (may distort)
       newWidth = frameWidth
       newHeight = frameHeight

  3. Apply brand color grading (if enabled):
     - Modulate brightness: +5%
     - Modulate saturation: +10%
     - Shift hue: +10° (warmer tones toward Sand/Beige)

  4. Optimize quality based on preset:
     - Set DPI metadata
     - Apply sharpening (for print/premium)
     - Convert to target format (PNG/JPEG/WebP)
     - Compress with quality setting

Output:
  - Optimized image buffer (ready for placement)
```

**Implementation (Sharp):**

```javascript
const resizedBuffer = await sharp(imagePath)
  .resize({
    width: frameWidth,
    height: frameHeight,
    fit: 'cover',      // or 'contain', 'fill'
    position: 'center'  // or 'top', 'bottom', etc.
  })
  .modulate({
    brightness: 1.05,
    saturation: 1.1,
    hue: 10
  })
  .sharpen({ sigma: 1 })
  .jpeg({ quality: 85, progressive: true })
  .toBuffer();
```

**Time Complexity:** O(n) where n = number of pixels
**Space Complexity:** O(n) for output buffer

---

### 2. Logo Clearspace Calculation

**Algorithm:** Bounding Box Detection with Transparency Trim

```
Input:
  - logoPath (path to logo image, typically PNG with transparency)

Process:
  1. Load logo image with Sharp
  2. Trim transparent edges:
     trimmed = sharp(logoPath).trim()

  3. Get actual logo bounding box:
     { width, height } = await trimmed.metadata()

  4. Calculate clearspace per TEEI brand guideline:
     clearspace = height  // Minimum = logo height
     recommended = height * 1.5  // Extra safety margin

  5. Define clearspace zone:
     zone = {
       top: clearspace,
       right: clearspace,
       bottom: clearspace,
       left: clearspace
     }

  6. (Optional) Generate visual guide:
     - Create canvas: (width + 2*clearspace) x (height + 2*clearspace)
     - Fill with white background
     - Composite logo in center
     - Draw boundary lines (would require Canvas API)

Output:
  - Clearspace specifications (minimum, recommended, zone)
  - Optional visual guide PNG
```

**Validation Algorithm:**

```
Input:
  - logoPosition { x, y, width, height }
  - otherElements [{ name, x, y, width, height }, ...]
  - clearspace { top, right, bottom, left }

Process:
  1. Calculate clearspace bounding box:
     clearBox = {
       left: logoPosition.x - clearspace.left,
       right: logoPosition.x + logoPosition.width + clearspace.right,
       top: logoPosition.y - clearspace.top,
       bottom: logoPosition.y + logoPosition.height + clearspace.bottom
     }

  2. Check for overlaps with other elements:
     FOR EACH element IN otherElements:
       elementBox = {
         left: element.x,
         right: element.x + element.width,
         top: element.y,
         bottom: element.y + element.height
       }

       IF boxesOverlap(clearBox, elementBox):
         violation = calculateViolation(clearBox, elementBox)
         violations.push({
           element: element.name,
           type: 'clearspace-violation',
           distance: violation.distance,
           direction: violation.direction,
           suggestion: generateFixSuggestion(violation)
         })

Output:
  - valid (boolean)
  - violations (array of violation objects)
```

**Time Complexity:** O(m) where m = number of elements
**Space Complexity:** O(1) for clearspace, O(m) for violations

---

### 3. Intelligent Cropping

**Golden Ratio Crop Algorithm:**

```
Input:
  - imagePath
  - phi = 1.618 (golden ratio constant)

Process:
  1. Analyze image composition:
     composition = await analyzeComposition(imagePath)
     focalPoint = composition.goldenRatio.focalPoint
     // focalPoint.x = imageWidth / phi
     // focalPoint.y = imageHeight / phi

  2. Calculate crop dimensions using phi:
     cropWidth = imageWidth / phi
     cropHeight = imageHeight / phi

  3. Center crop around focal point:
     cropLeft = max(0, focalPoint.x - cropWidth/2)
     cropTop = max(0, focalPoint.y - cropHeight/2)

     // Ensure crop stays within bounds
     IF cropLeft + cropWidth > imageWidth:
       cropLeft = imageWidth - cropWidth
     IF cropTop + cropHeight > imageHeight:
       cropTop = imageHeight - cropHeight

  4. Apply crop:
     croppedBuffer = await sharp(imagePath)
       .extract({
         left: floor(cropLeft),
         top: floor(cropTop),
         width: floor(cropWidth),
         height: floor(cropHeight)
       })
       .toBuffer()

Output:
  - Cropped image buffer
  - Crop area coordinates
  - Composition analysis
```

**Rule of Thirds Algorithm:**

```
Input:
  - imagePath

Process:
  1. Calculate power points (intersections of thirds):
     vertical1 = imageWidth / 3
     vertical2 = 2 * imageWidth / 3
     horizontal1 = imageHeight / 3
     horizontal2 = 2 * imageHeight / 3

     powerPoints = [
       { x: vertical1, y: horizontal1 },     // Top-left
       { x: vertical2, y: horizontal1 },     // Top-right
       { x: vertical1, y: horizontal2 },     // Bottom-left
       { x: vertical2, y: horizontal2 }      // Bottom-right
     ]

  2. Select primary power point (typically top-left or top-right)
     primaryPoint = powerPoints[0]

  3. Calculate crop centered on power point:
     cropWidth = imageWidth * 0.66
     cropHeight = imageHeight * 0.66

     cropLeft = max(0, primaryPoint.x - cropWidth/3)
     cropTop = max(0, primaryPoint.y - cropHeight/3)

  4. Apply crop (same as golden ratio)

Output:
  - Cropped image with subject on power point
```

**AI-Guided Crop (Claude Vision):**

```
Input:
  - imagePath

Process:
  1. Load image as base64:
     imageBuffer = await fs.readFile(imagePath)
     base64Image = imageBuffer.toString('base64')

  2. Send to Claude with vision prompt:
     response = await anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       messages: [{
         role: 'user',
         content: [
           { type: 'image', source: { type: 'base64', data: base64Image } },
           { type: 'text', text: cropAnalysisPrompt }
         ]
       }]
     })

  3. Parse Claude's JSON response:
     cropArea = extractJSON(response.content[0].text)
     // Returns: { left, top, width, height, reasoning }

  4. Apply crop with AI-recommended area

Output:
  - AI-optimized crop
  - Reasoning for crop decision
```

**Time Complexity:**
- Golden Ratio: O(n) for analysis, O(1) for calculation
- Rule of Thirds: O(1) for calculation
- AI-Guided: O(n) + API latency (~2-5 seconds)

---

### 4. Brand Overlay Application

**Algorithm:** Composite Blending with Opacity

```
Input:
  - imagePath
  - brandColor { r, g, b } (RGB values 0-255)
  - opacity (0-1)

Process:
  1. Load image:
     image = sharp(imagePath)
     { width, height } = await image.metadata()

  2. Create solid color overlay with opacity:
     overlayBuffer = await sharp({
       create: {
         width: width,
         height: height,
         channels: 4,  // RGBA
         background: {
           r: brandColor.r,
           g: brandColor.g,
           b: brandColor.b,
           alpha: opacity
         }
       }
     }).png().toBuffer()

  3. Composite overlay onto image:
     resultBuffer = await image
       .composite([{
         input: overlayBuffer,
         blend: 'over'  // Alpha blending
       }])
       .toBuffer()

Output:
  - Image with brand color overlay
```

**Blending Math:**

```
For each pixel (x, y):
  baseColor = image[x, y]
  overlayColor = { r, g, b, a: opacity }

  // Alpha blending formula
  resultR = overlayColor.r * opacity + baseColor.r * (1 - opacity)
  resultG = overlayColor.g * opacity + baseColor.g * (1 - opacity)
  resultB = overlayColor.b * opacity + baseColor.b * (1 - opacity)
  resultA = 1.0  // Full opacity
```

**Time Complexity:** O(n) where n = number of pixels
**Space Complexity:** O(n) for overlay buffer + O(n) for result

---

### 5. Quality Optimization

**Algorithm:** Multi-Stage Optimization Pipeline

```
Input:
  - imagePath
  - preset { dpi, quality, format, colorSpace }
  - options { maxWidth, sharpen }

Process:
  1. Load image:
     image = sharp(imagePath)

  2. Set DPI metadata:
     image = image.withMetadata({ density: preset.dpi })

  3. Resize if needed:
     IF options.maxWidth AND width > options.maxWidth:
       image = image.resize(options.maxWidth, null, {
         fit: 'inside',
         withoutEnlargement: true
       })

  4. Apply sharpening (for print/premium):
     IF preset.format == 'png' OR preset.format == 'print':
       image = image.sharpen({
         sigma: 1,      // Sharpening amount
         m1: 0.5,       // Slope for flat areas
         m2: 0.5        // Slope for steep areas
       })

  5. Convert to target format:
     SWITCH preset.format:
       CASE 'jpeg':
         buffer = await image.jpeg({
           quality: preset.quality,
           progressive: true,
           chromaSubsampling: '4:4:4'
         }).toBuffer()

       CASE 'png':
         buffer = await image.png({
           quality: preset.quality,
           compressionLevel: 6,
           adaptiveFiltering: true
         }).toBuffer()

       CASE 'webp':
         buffer = await image.webp({
           quality: preset.quality,
           lossless: false
         }).toBuffer()

  6. Calculate statistics:
     originalSize = (await fs.stat(imagePath)).size
     optimizedSize = buffer.length
     reduction = (1 - optimizedSize/originalSize) * 100

Output:
  - Optimized buffer
  - Statistics (originalSize, optimizedSize, reduction)
```

**Optimization Presets:**

| Preset | DPI | Format | Quality | Compression | Use Case |
|--------|-----|--------|---------|-------------|----------|
| print | 300 | PNG | 95 | 6 | Print (lossless) |
| digital | 150 | JPEG | 85 | Progressive | PDF documents |
| web | 72 | WebP | 80 | Lossy | Web delivery |
| premium | 600 | PNG | 100 | 9 | Archival quality |

**Time Complexity:** O(n) where n = number of pixels
**Space Complexity:** O(n) for output buffer

---

## Data Structures

### ImageIntelligence Class

```javascript
class ImageIntelligence {
  // Constructor
  constructor(config = {})

  // State
  openai: OpenAI              // OpenAI client
  anthropic: Anthropic        // Anthropic client
  compositionAnalyzer: PhotoComposition
  photoEnhancer: PhotoEnhancer
  brandColors: Object         // TEEI brand color palette
  qualityPresets: Object      // Optimization presets
  outputDir: string
  cacheDir: string

  // Core Methods
  placeImageInFrame(imagePath, frameWidth, frameHeight, options): Promise<Buffer>
  generateHeroImage(concept, options): Promise<Object>
  applyBrandOverlay(imagePath, color, opacity, options): Promise<Object>
  intelligentCrop(imagePath, options): Promise<Object>
  calculateLogoClearspace(logoPath, options): Promise<Object>
  optimizeImageQuality(imagePath, targetUse, options): Promise<Object>
  batchProcess(imagePaths, operation, options): Promise<Array>

  // Utility Methods
  downloadImage(url): Promise<Buffer>
  sanitizeFilename(name): string
  getStats(): Promise<Object>
}
```

### Brand Color Structure

```javascript
{
  nordshore: {
    hex: '#00393F',
    rgb: { r: 0, g: 57, b: 63 },
    name: 'Nordshore',
    usage: 'primary'
  },
  sky: {
    hex: '#C9E4EC',
    rgb: { r: 201, g: 228, b: 236 },
    name: 'Sky',
    usage: 'secondary'
  },
  // ... other colors
}
```

### Quality Preset Structure

```javascript
{
  print: {
    dpi: 300,
    quality: 95,
    format: 'png',
    colorSpace: 'srgb',
    description: 'High-quality for print (300 DPI)'
  },
  // ... other presets
}
```

---

## API Integrations

### DALL-E 3 (OpenAI)

**Endpoint:** `https://api.openai.com/v1/images/generations`

**Request:**
```javascript
{
  model: 'dall-e-3',
  prompt: string,          // TEEI brand-compliant prompt
  n: 1,
  size: '1792x1024',      // Landscape hero
  quality: 'hd',          // or 'standard'
  style: 'natural'        // Photorealistic
}
```

**Response:**
```javascript
{
  data: [{
    url: string,                // Image URL (expires in 1 hour)
    revised_prompt: string      // OpenAI's interpretation
  }]
}
```

**Cost:**
- Standard: $0.08 per image
- HD: $0.12 per image

**Rate Limits:**
- Free tier: 5 images/minute
- Paid tier: 50 images/minute

---

### Claude Vision (Anthropic)

**Endpoint:** `https://api.anthropic.com/v1/messages`

**Request:**
```javascript
{
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1000,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: base64Image
        }
      },
      {
        type: 'text',
        text: analysisPrompt
      }
    ]
  }]
}
```

**Response:**
```javascript
{
  content: [{
    type: 'text',
    text: string  // JSON with analysis
  }]
}
```

**Cost:**
- Input: $3 per million tokens
- Output: $15 per million tokens
- Typical image analysis: ~$0.01

---

## Performance Characteristics

### Image Sizing & Placement
- **Time:** 0.1 - 0.5 seconds (depends on image size)
- **Memory:** 2-4x image size (input + output buffers)
- **Bottleneck:** Sharp resize operation

### Hero Image Generation (DALL-E 3)
- **Time:** 10-30 seconds (API latency)
- **Memory:** Minimal (streaming download)
- **Bottleneck:** OpenAI API response time
- **Cost:** $0.12 per HD image

### Brand Overlay
- **Time:** 0.2 - 0.8 seconds
- **Memory:** 3x image size (input + overlay + output)
- **Bottleneck:** Composite operation

### Intelligent Crop
- **Time:**
  - Golden Ratio: 0.5 - 1.5 seconds (includes composition analysis)
  - Rule of Thirds: 0.2 - 0.5 seconds
  - AI-Guided: 2 - 5 seconds (Claude API latency)
- **Memory:** 2x image size
- **Bottleneck:** AI analysis (if enabled)

### Quality Optimization
- **Time:** 0.2 - 2 seconds (depends on size and format)
- **Memory:** 2x image size
- **Bottleneck:** Format conversion and compression

### Batch Processing
- **Time:** n * operation_time (sequential processing)
- **Memory:** 1x image size (processes one at a time)
- **Optimization:** Could be parallelized with worker threads

---

## Error Handling

### Graceful Degradation

```javascript
try {
  // Primary operation
  const result = await aiGuidedOperation();
} catch (error) {
  console.warn('AI operation failed, using fallback');
  // Fallback to rule-based approach
  const result = await ruleBased Operation();
}
```

### Error Types

1. **File I/O Errors**
   - Missing image file
   - Permission denied
   - Disk full
   - **Mitigation:** Try/catch with clear error messages

2. **API Errors**
   - Rate limit exceeded
   - Invalid API key
   - Network timeout
   - **Mitigation:** Retry logic, exponential backoff

3. **Image Processing Errors**
   - Corrupt image file
   - Unsupported format
   - Out of memory
   - **Mitigation:** Validate before processing, fallback formats

4. **Validation Errors**
   - Invalid brand color name
   - Invalid quality preset
   - Invalid frame dimensions
   - **Mitigation:** Type checking, validation functions

---

## Testing Strategy

### Unit Tests

```javascript
// Example unit test
describe('ImageIntelligence', () => {
  it('should calculate correct clearspace', async () => {
    const imageAI = new ImageIntelligence();
    const clearspace = await imageAI.calculateLogoClearspace('test-logo.png');

    expect(clearspace.minimum).toBeGreaterThan(0);
    expect(clearspace.recommended).toBe(clearspace.minimum * 1.5);
  });

  it('should apply brand overlay correctly', async () => {
    const imageAI = new ImageIntelligence();
    const result = await imageAI.applyBrandOverlay('test.jpg', 'nordshore', 0.4);

    expect(result.path).toContain('nordshore-40');
    expect(result.opacity).toBe(0.4);
  });
});
```

### Integration Tests

```javascript
// Full workflow test
describe('Complete Document Workflow', () => {
  it('should generate, optimize, and place hero image', async () => {
    const imageAI = new ImageIntelligence();

    // Generate
    const hero = await imageAI.generateHeroImage('test concept');
    expect(hero.original.path).toExist();

    // Optimize
    const optimized = await imageAI.optimizeImageQuality(hero.original.path, 'print');
    expect(optimized.stats.dpi).toBe(300);

    // Place
    const buffer = await imageAI.placeImageInFrame(optimized.path, 612, 396);
    expect(buffer).toBeInstanceOf(Buffer);
  });
});
```

### Performance Tests

```javascript
// Benchmark
describe('Performance Benchmarks', () => {
  it('should size image within 500ms', async () => {
    const imageAI = new ImageIntelligence();
    const start = Date.now();

    await imageAI.placeImageInFrame('test.jpg', 612, 396);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });
});
```

---

## Future Enhancements

### Planned Features

1. **Gradient Overlays**
   - Use Canvas API for linear/radial gradients
   - Multiple brand color stops
   - Directional control (top-to-bottom, etc.)

2. **Batch Parallel Processing**
   - Use worker threads for concurrent processing
   - 3-5x speed improvement for batch operations

3. **Smart Image Selection**
   - AI-powered image search (Unsplash, Pexels)
   - Automatic best-fit selection for concepts
   - Brand compliance validation

4. **Advanced Composition**
   - Face detection and cropping
   - Subject isolation
   - Background removal
   - Smart object placement

5. **Real-time Preview**
   - Web interface for image operations
   - Live composition adjustment
   - Before/after comparison

6. **Template Integration**
   - Pre-defined layouts for TEEI documents
   - Automatic image placement in templates
   - Multi-page document generation

---

## Dependencies

### Required (package.json)

```json
{
  "sharp": "^0.33.0",              // Image processing
  "openai": "^4.20.0",             // DALL-E 3 integration
  "@anthropic-ai/sdk": "^0.27.0",  // Claude vision
  "playwright": "^1.40.0"          // PDF generation
}
```

### Optional

```json
{
  "canvas": "^2.11.0",   // For gradient overlays (future)
  "potrace": "^2.1.8"    // For SVG conversion
}
```

---

## Security Considerations

### API Key Management

- Store in environment variables (never commit)
- Use `.env` file for local development
- Rotate keys regularly
- Monitor API usage for anomalies

### Input Validation

- Validate file paths (prevent directory traversal)
- Check file types (only allow images)
- Limit file sizes (prevent DoS)
- Sanitize filenames (remove special characters)

### Output Validation

- Verify image dimensions
- Check file sizes (detect generation failures)
- Validate color values (0-255 range)
- Verify opacity (0-1 range)

---

## Changelog

### Version 1.0.0 (2025-11-08)

**Initial Release**

Features:
- ✅ Intelligent image sizing and placement
- ✅ Logo clearspace calculation and validation
- ✅ AI-powered hero image generation (DALL-E 3)
- ✅ Brand color overlay application
- ✅ Intelligent cropping (golden ratio, rule of thirds, AI-guided)
- ✅ Quality optimization (print, digital, web, premium)
- ✅ Batch processing
- ✅ JavaScript API
- ✅ Python integration (InDesign/MCP)
- ✅ CLI interface
- ✅ Comprehensive documentation

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-08
**Author:** TEEI Development Team
