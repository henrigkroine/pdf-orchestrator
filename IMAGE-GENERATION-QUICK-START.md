# AI Image Generation - Quick Start Guide

**Get started in 5 minutes** ⚡

---

## Step 1: Configure API Key (30 seconds)

Add to `config/.env`:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Get your key from: https://platform.openai.com/api-keys

---

## Step 2: Enable in Job Config (1 minute)

Add to your job JSON (e.g., `example-jobs/my-job.json`):

```json
{
  "jobId": "my-partnership-2025",
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
      "hero": "Diverse Ukrainian students collaborating on cloud projects, warm natural lighting",
      "program_1": "Students engaged in hands-on AWS training, modern laptops",
      "cover": "Hopeful Ukrainian learner using educational technology"
    }
  }
}
```

---

## Step 3: Generate Images (30 seconds - 2 minutes)

```bash
python generate_images_layer0.py example-jobs/my-job.json
```

**Output:**
```
==================================================
LAYER 0: IMAGE GENERATION (Asset Preparation)
==================================================

Job: my-partnership-2025
Provider: dalle3
Quality: standard

Image slots to generate: 3
   • hero
   • program_1
   • cover

Starting image generation...
✓ hero generated (24.3s)
✓ program_1 generated (31.7s)
✓ cover generated (28.1s)

Generation Statistics:
   Generated: 3
   Cached: 0
   Failed: 0
   Total Cost: $0.120

==================================================
✅ LAYER 0 COMPLETE: Images prepared for document generation
==================================================
```

---

## Step 4: Use Generated Images (Automatic)

Generated images are automatically saved to:

```
assets/images/optimized/my-partnership-2025/
├── hero-web.png (150 DPI, RGB)
├── hero-print.png (300 DPI, RGB)
├── program_1-web.png
├── program_1-print.png
├── cover-web.png
└── cover-print.png
```

And job config is updated with paths:

```json
{
  "generatedAssets": {
    "images": {
      "hero": {
        "web": "assets/images/optimized/my-partnership-2025/hero-web.png",
        "print": "assets/images/optimized/my-partnership-2025/hero-print.png"
      }
    }
  }
}
```

InDesign workflow automatically reads from `generatedAssets.images` ✓

---

## Dry Run Mode (Test Without API Cost)

Set `"dryRun": true` in job config:

```json
{
  "imageGeneration": {
    "enabled": true,
    "dryRun": true
  }
}
```

Generates placeholder metadata with $0 cost.

---

## Run Tests

```bash
node ai/tests/image-generation-test.js
```

Expected output:
```
All tests passed! ✓
Pass Rate: 100.0%
```

---

## Cost Per Document

| Scenario | Cost | Time |
|----------|------|------|
| 3 images (first run) | $0.12 | 60-120s |
| 3 images (cached) | $0.00 | 1-2s |
| HD quality | $0.24 | 60-120s |

With 70% cache hit rate: **$0.036 average**

---

## Troubleshooting

### Error: OPENAI_API_KEY not configured

**Fix:**
```bash
# Add to config/.env
OPENAI_API_KEY=sk-your-key-here
```

### Error: Content policy violation

**Fix:** Rephrase prompt to focus on educational/positive themes. TEEI prompts are pre-validated to be content-safe.

### Images not loading in InDesign

**Fix:** Verify `generatedAssets.images` exists in job config after Layer 0 completes.

---

## Next Steps

- **Documentation:** See `ai/image-generation/README.md` (comprehensive guide)
- **Examples:** Check `example-jobs/image-gen-test.json`
- **Integration:** Layer 0 runs automatically in world-class pipeline

---

**Status:** Production-ready ✓
**Version:** 1.0.0
**Agent:** Agent 3 - Image Generation Pipeline Builder
