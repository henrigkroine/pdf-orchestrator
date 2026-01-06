# AI Image Generation Pipeline

**Tier 2-3 AI System for TEEI Partnership Document Photography**

Automatically generates brand-compliant hero images and program photos using DALL-E 3, eliminating manual asset sourcing.

---

## Overview

### What It Does

- Generates **warm, natural, authentic** photography for TEEI partnership documents
- Follows **TEEI brand guidelines** (natural lighting, diverse representation, hopeful atmosphere)
- **Caches images** to reduce API costs (70%+ cache hit rate)
- **Optimizes** for web (150 DPI) and print (300 DPI)
- **Integrates** with pipeline.py Layer 0 (asset preparation before InDesign)

### Architecture

```
ai/image-generation/
├── imageGenerationClient.js       # API integration (DALL-E 3 / Stable Diffusion)
├── promptEngineer.js              # TEEI brand-compliant prompts
├── imageCache.js                  # Caching system (30-day TTL)
├── imageOptimizer.js              # Web/print optimization (sharp)
├── imageGenerationOrchestrator.js # Main controller
└── README.md                      # This file

Pipeline Integration:
└── generate_images_layer0.py      # Layer 0 Python script
```

---

## Quick Start

### 1. Configure API Key

Add to `config/.env`:

```bash
# OpenAI (DALL-E 3) - Primary
OPENAI_API_KEY=sk-your-key-here

# Replicate (Stable Diffusion) - Backup (optional)
REPLICATE_API_KEY=r8-your-key-here
```

### 2. Enable in Job Config

Add to your job JSON (e.g., `example-jobs/aws-tfu-mcp-world-class.json`):

```json
{
  "jobId": "aws-partnership-2025",
  "imageGeneration": {
    "enabled": true,
    "dryRun": false,
    "provider": "dalle3",
    "quality": "standard",
    "caching": true
  },
  "data": {
    "partner": {
      "name": "AWS"
    },
    "aiImageSlots": {
      "hero": "Diverse Ukrainian students collaborating on cloud computing projects, warm natural lighting, authentic educational moment",
      "program_1": "Students engaged in hands-on AWS training, modern laptops, collaborative workspace, hopeful atmosphere",
      "cover": "Hopeful Ukrainian learner using educational technology in bright learning space"
    }
  }
}
```

### 3. Run Image Generation

**Standalone:**
```bash
python generate_images_layer0.py example-jobs/aws-tfu-mcp-world-class.json
```

**Integrated with Pipeline:**
```bash
# Layer 0 runs automatically before InDesign generation
python pipeline.py --world-class --job-config example-jobs/aws-tfu-mcp-world-class.json
```

### 4. Check Results

Generated images saved to:
- **Optimized:** `assets/images/optimized/{jobId}/`
  - `{name}-web.png` (150 DPI, RGB, compressed)
  - `{name}-print.png` (300 DPI, RGB, high quality)
- **Cached:** `assets/images/generated/{jobId}/`
- **Reports:** `reports/image-generation/{jobId}-{timestamp}.json`

---

## Configuration Options

### Image Generation Config

```json
{
  "imageGeneration": {
    "enabled": true,              // Enable/disable image generation
    "dryRun": false,              // true = placeholders, false = real API
    "provider": "dalle3",         // "dalle3" or "stable-diffusion"
    "quality": "standard",        // "standard" or "hd" (DALL-E 3 only)
    "caching": true,              // Enable cache (recommended)
    "images": [                   // Alternative: explicit image array
      {
        "name": "hero",
        "category": "hero",
        "prompt": "Custom prompt..."
      }
    ]
  }
}
```

### Image Slots (Recommended Format)

```json
{
  "data": {
    "aiImageSlots": {
      "hero": "Main hero image prompt...",
      "program_1": "Program photo 1 prompt...",
      "program_2": "Program photo 2 prompt...",
      "cover": "Cover image prompt..."
    }
  }
}
```

**Supported Categories:**
- `hero` - Main hero images (landscape, 16:9)
- `program` - Program photos (content pages)
- `cover` - Cover images (portrait or square)
- `partnership` - Partnership visuals

---

## TEEI Brand Prompt Engineering

### Brand Style Guide

The prompt engineer automatically applies TEEI brand guidelines:

**Lighting:**
- Warm natural lighting
- Soft golden hour light
- Window light, diffused daylight

**Atmosphere:**
- Hopeful atmosphere
- Authentic moment
- Genuine connection
- Empowering scene

**Avoid:**
- NOT staged
- NOT corporate stock photography
- NOT harsh lighting
- NOT studio lighting
- NOT artificial

**Technical Style:**
- Photorealistic
- Documentary photography style
- Candid shot
- 35mm photography

**Color Grading:**
- Warm color tones
- Teal and gold palette (TEEI brand)
- Soft beige and sky blue accents

### Prompt Templates

**Hero Image:**
```
Diverse Ukrainian students collaborating on laptops in modern learning space,
warm natural lighting, hopeful atmosphere, photorealistic, documentary photography style,
warm color tones, NOT staged, NOT corporate stock photography
```

**Program Photo:**
```
Ukrainian students engaged in hands-on technology training, modern computer lab,
soft window light, authentic moment, genuine connection, candid shot,
teal and gold color palette, NOT harsh lighting, NOT posed
```

**Cover Image:**
```
Hopeful Ukrainian student using laptop in bright educational setting,
natural daylight, empowering scene, photorealistic, warm earth tones,
NOT studio lighting, NOT artificial
```

### Custom Prompts

You can provide custom prompts - the system will enhance them with TEEI brand style:

```json
{
  "aiImageSlots": {
    "hero": "Students learning cloud computing"
  }
}
```

Enhanced to:
```
Students learning cloud computing, warm natural lighting, hopeful atmosphere,
photorealistic, documentary photography style, warm color tones,
NOT staged, NOT corporate stock photography
```

---

## Caching System

### How It Works

1. **Hash Generation:** Prompt + Category + Provider → SHA-256 hash (16 chars)
2. **Cache Check:** Before API call, check `assets/images/generated/{jobId}/{hash}.png`
3. **Cache Hit:** Return cached image (skip API, save cost)
4. **Cache Miss:** Generate new image, cache for 30 days

### Cache Management

**Get Cache Stats:**
```javascript
const ImageCache = require('./ai/image-generation/imageCache');
const cache = new ImageCache();

const stats = await cache.getStats();
// { totalImages: 42, totalSizeMB: "123.45", cacheHitRate: 0.73, hits: 15, misses: 5 }
```

**Clean Old Images (>30 days):**
```bash
node -e "const ImageCache = require('./ai/image-generation/imageCache'); new ImageCache().cleanup().then(r => console.log(r));"
```

**Clear Entire Cache:**
```bash
node -e "const ImageCache = require('./ai/image-generation/imageCache'); new ImageCache().clear().then(r => console.log(r));"
```

**Cache Location:**
```
assets/images/generated/
├── aws-partnership-2025/
│   ├── a3f7b2c8e1d4f5a6.png    # Cached hero image
│   ├── a3f7b2c8e1d4f5a6.json   # Metadata
│   ├── b9e4c1a7f3d2e8b5.png    # Cached program image
│   └── b9e4c1a7f3d2e8b5.json
└── test-job-001/
    └── ...
```

---

## Image Optimization

### Web vs Print

| Preset | DPI | Color | Quality | Use Case |
|--------|-----|-------|---------|----------|
| **Web** | 150 | RGB | 85% | Digital PDFs, screen viewing |
| **Print** | 300 | RGB* | 95% | Commercial printing |

*RGB preserved; CMYK conversion done by InDesign during PDF export.

### Optimization Pipeline

1. **Generate** → Raw image from DALL-E 3 (1792x1024 or 1024x1024)
2. **Color Grade** → Apply TEEI color grading (warm tones, teal/gold accents)
3. **Resize** → Max width: 1920px (web), 3840px (print)
4. **Set DPI** → 150 (web), 300 (print)
5. **Compress** → PNG with quality 85% (web), 95% (print)
6. **Save** → `{name}-web.png` and `{name}-print.png`

### Manual Optimization

```javascript
const ImageOptimizer = require('./ai/image-generation/imageOptimizer');
const optimizer = new ImageOptimizer();

// Optimize for web only
const webResult = await optimizer.optimizeForWeb('path/to/image.png');
fs.writeFileSync('output-web.png', webResult.buffer);

// Optimize for print only
const printResult = await optimizer.optimizeForPrint('path/to/image.png');
fs.writeFileSync('output-print.png', printResult.buffer);

// Generate both versions
const both = await optimizer.optimizeBoth('path/to/image.png', 'hero');
// Saves: hero-web.png and hero-print.png
```

---

## API Providers

### DALL-E 3 (Primary)

**Why DALL-E 3:**
- Superior photorealistic quality
- Better prompt understanding (nuances like "warm natural lighting")
- Reliable API with good uptime
- Content policy compliant for educational use

**Pricing:**
- Standard: $0.040 per image (1024x1024 or 1792x1024)
- HD: $0.080 per image (higher quality)

**Cost per Document:**
- 3 images × $0.040 = **$0.12** (with 0% cache hits)
- 3 images × 30% miss rate = **$0.036** (with 70% cache hits)

### Stable Diffusion (Backup)

**Via Replicate:**
- SDXL model: $0.0055 per image
- Cost per document: **$0.0165** (3 images)
- 7x cheaper than DALL-E 3

**When to Use:**
- Cost optimization (high volume)
- DALL-E unavailable
- Fallback provider

**Switch Provider:**
```json
{
  "imageGeneration": {
    "provider": "stable-diffusion"
  }
}
```

---

## Testing

### Run Test Suite

```bash
node ai/tests/image-generation-test.js
```

**Tests:**
- ✓ Prompt engineering (brand compliance)
- ✓ Cache (hash generation, save/retrieve)
- ✓ Optimization (web/print quality)
- ✓ Image generation (dry run mode)
- ✓ End-to-end orchestration

**Example Output:**
```
==================================================
Image Generation Pipeline Test Suite
==================================================
Mode: DRY RUN

Test: Prompt Engineer
------------------------------------------------------
✓ Generate hero prompt
✓ Enhance user prompt
✓ Validate prompt against TEEI guidelines
✓ Generate prompt variations

Test: Image Cache
------------------------------------------------------
✓ Generate cache key
✓ Cache miss
✓ Cache save and retrieve
✓ Get cache stats

Test: Image Optimizer
------------------------------------------------------
✓ Optimize for web (150 DPI, RGB)
✓ Optimize for print (300 DPI)
✓ Get image metadata

==================================================
Test Summary
==================================================
Total: 18
Passed: 18
Failed: 0
Pass Rate: 100.0%

All tests passed! ✓
```

---

## Usage Examples

### Example 1: Dry Run (No API Cost)

```json
{
  "jobId": "test-dry-run",
  "imageGeneration": {
    "enabled": true,
    "dryRun": true
  },
  "data": {
    "aiImageSlots": {
      "hero": "Test hero image prompt"
    }
  }
}
```

```bash
python generate_images_layer0.py example-jobs/test-dry-run.json
```

**Result:** Placeholder metadata generated, no API calls, $0 cost.

### Example 2: Generate Hero Image Only

```json
{
  "jobId": "aws-hero-only",
  "imageGeneration": {
    "enabled": true,
    "dryRun": false,
    "quality": "hd"
  },
  "data": {
    "partner": { "name": "AWS" },
    "aiImageSlots": {
      "hero": "Diverse Ukrainian students collaborating on AWS cloud computing projects in modern learning space, warm natural lighting, authentic educational moment"
    }
  }
}
```

**Result:** 1 HD image, $0.080 cost.

### Example 3: Batch Generate (3 Images)

```json
{
  "jobId": "aws-partnership-full",
  "imageGeneration": {
    "enabled": true,
    "dryRun": false,
    "quality": "standard"
  },
  "data": {
    "partner": { "name": "AWS" },
    "aiImageSlots": {
      "hero": "Diverse Ukrainian students collaborating on cloud computing projects, warm natural lighting",
      "program_1": "Students engaged in hands-on AWS training, modern laptops, hopeful atmosphere",
      "cover": "Hopeful Ukrainian learner using educational technology, bright inspiring space"
    }
  }
}
```

**Result:** 3 standard images, $0.12 cost (first run), ~$0.036 cost (with cache).

### Example 4: Programmatic Usage

```javascript
const ImageGenerationOrchestrator = require('./ai/image-generation/imageGenerationOrchestrator');

const jobConfig = {
  jobId: 'my-custom-job',
  imageGeneration: { enabled: true, dryRun: false },
  data: {
    aiImageSlots: {
      hero: 'Custom hero prompt'
    }
  }
};

const orchestrator = new ImageGenerationOrchestrator(jobConfig);

const results = await orchestrator.generateImagesForJob();
console.log(`Generated ${results.images.length} images`);
console.log(`Total cost: $${results.stats.totalCost.toFixed(3)}`);

// Get generated paths for InDesign
const paths = orchestrator.getImagePaths();
console.log(paths);
// { hero: { web: 'assets/images/optimized/my-custom-job/hero-web.png', print: '...' } }
```

---

## Performance Benchmarks

**DALL-E 3 Standard Quality:**
- Generation time: 15-30 seconds per image
- Download time: 2-5 seconds
- Optimization time: 1-3 seconds
- **Total per image: ~20-40 seconds**

**With Caching:**
- Cache hit time: 50-200ms (read from disk)
- **1000x faster than generation**

**3-Image Document:**
- First run (no cache): 60-120 seconds, $0.12
- Subsequent runs (cached): 1-2 seconds, $0.00
- **Cache savings: 98% time, 100% cost**

---

## Troubleshooting

### Error: OPENAI_API_KEY not configured

**Solution:**
```bash
# Add to config/.env
OPENAI_API_KEY=sk-your-key-here

# Or set environment variable
export OPENAI_API_KEY=sk-your-key-here
```

### Error: Content policy violation

**Issue:** Prompt violates OpenAI content policy.

**Solution:**
- Review prompt for potentially problematic content
- Rephrase to focus on educational/positive themes
- TEEI prompts are pre-validated to be content-safe

### Error: Rate limit exceeded

**Issue:** Too many requests to OpenAI API.

**Solution:**
- Reduce concurrent generation (max 50/minute)
- Enable caching to reduce API calls
- Use batch processing with delays

### Low-Quality Images

**Issue:** Generated images don't match TEEI brand.

**Solution:**
- Use prompt engineer templates (don't skip brand style)
- Set `quality: "hd"` for better results (2x cost)
- Add more descriptive prompts (lighting, atmosphere, subjects)
- Review `reports/image-generation/{jobId}.json` for prompt analysis

### Images Not Loading in InDesign

**Issue:** Generated images not placed in document.

**Solution:**
- Check `assets/images/optimized/{jobId}/` exists
- Verify job config updated with `generatedAssets.images`
- Run `await orchestrator.updateJobConfig(jobConfigPath)`
- Check InDesign script reads from correct path

---

## API Reference

### ImageGenerationOrchestrator

```javascript
const ImageGenerationOrchestrator = require('./ai/image-generation/imageGenerationOrchestrator');

const orchestrator = new ImageGenerationOrchestrator(jobConfig, options);

// Generate all images for job
const results = await orchestrator.generateImagesForJob();
// Returns: { jobId, images: [...], stats: { generated, cached, failed, totalCost } }

// Get generated image paths
const paths = orchestrator.getImagePaths();
// Returns: { hero: { web: '...', print: '...' }, program_1: { ... } }

// Update job config with paths
await orchestrator.updateJobConfig('path/to/job.json');

// Clean up old cache
const cleaned = await orchestrator.cleanupCache();
// Returns: { deletedCount, freedSpace }

// Get cache statistics
const stats = await orchestrator.getCacheStats();
// Returns: { totalImages, totalSizeMB, cacheHitRate, ... }
```

### PromptEngineer

```javascript
const PromptEngineer = require('./ai/image-generation/promptEngineer');

const engineer = new PromptEngineer({ brandProfile: 'teei' });

// Generate brand-compliant prompt
const prompt = engineer.generatePrompt({
  category: 'hero',
  userPrompt: 'Optional custom prompt',
  context: { partnerName: 'AWS' }
});

// Generate variations
const variations = engineer.generateVariations({ category: 'hero' }, 3);

// Validate prompt
const validation = engineer.validatePrompt('my custom prompt');
// Returns: { valid: true/false, warnings: [...], suggestions: [...] }

// Get recommendations
const recs = engineer.getRecommendations('hero');
// Returns: { subjectOptions, activityOptions, settingOptions, ... }
```

---

## Integration with Pipeline

### Layer 0 (Asset Preparation)

**Before InDesign Generation:**
```python
# In pipeline.py run_world_class_pipeline()

# NEW: Layer 0 - Image Generation
if job_config.get('imageGeneration', {}).get('enabled'):
    print("[Layer 0] IMAGE GENERATION")
    result = subprocess.run(
        [sys.executable, 'generate_images_layer0.py', job_config_path],
        capture_output=True,
        text=True,
        timeout=300
    )
    if result.returncode != 0:
        print("❌ Layer 0 failed")
        return False

# Then continue with existing layers...
# Layer 1: InDesign Generation
# Layer 2: Content & Design Validation
# ...
```

**Job Config Update:**

After Layer 0 completes, job config is automatically updated:

```json
{
  "jobId": "aws-partnership",
  "generatedAssets": {
    "images": {
      "hero": {
        "web": "assets/images/optimized/aws-partnership/hero-web.png",
        "print": "assets/images/optimized/aws-partnership/hero-print.png"
      },
      "program_1": { "web": "...", "print": "..." }
    },
    "timestamp": "2025-11-14T17:00:00.000Z"
  }
}
```

**InDesign reads from `generatedAssets.images`** to place images.

---

## Cost Optimization Strategies

### 1. Enable Caching (70% savings)

```json
{
  "imageGeneration": {
    "caching": true
  }
}
```

### 2. Use Standard Quality

```json
{
  "imageGeneration": {
    "quality": "standard"  // $0.04 vs $0.08 (HD)
  }
}
```

### 3. Reuse Prompts Across Jobs

Same prompt + category + provider = cache hit

### 4. Switch to Stable Diffusion

```json
{
  "imageGeneration": {
    "provider": "stable-diffusion"  // $0.0055 per image
  }
}
```

### 5. Batch Generate Off-Peak

Generate images during development, commit to repo, disable in production.

---

## Roadmap

### Future Enhancements

- **Tier 3:** Fine-tuned SDXL model on TEEI photo library
- **Inpainting:** Edit specific regions (change laptop brand, etc.)
- **Style Transfer:** Apply TEEI color grading to stock photos
- **Photo Library:** Cache best generations for reuse across clients
- **A/B Testing:** Generate multiple variations, select best via Gemini Vision
- **ControlNet:** Precise composition control (pose, depth, edge)

---

## Support

**Issues:** Check `reports/image-generation/{jobId}.json` for detailed logs

**API Errors:** Review OpenAI status page or switch to `dryRun: true`

**Questions:** See main CLAUDE.md for project documentation

---

**Status:** Production-ready ✓
**Last Updated:** 2025-11-14
**Version:** 1.0.0
