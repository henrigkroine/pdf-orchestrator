# Smart Generation Guide - Operator Manual

**Version:** 1.0.0
**Date:** 2025-11-14
**For:** System operators and users (not developers)

---

## What is Smart Generation?

Smart Generation is the **pre-InDesign asset preparation phase** that runs before creating your PDF document. It handles three things automatically:

1. **Figma Token Sync** - Fetch design tokens (colors, fonts, spacing) from Figma files
2. **Image Generation** - Create hero images using AI or local placeholders
3. **Font Pairing** - Validate typography choices against TFU brand guidelines

**When it runs:** Before InDesign document creation
**Why it matters:** Ensures assets are ready and validated before expensive document generation

---

## Quick Start (TL;DR)

```bash
# Test services individually (safe, no document creation)
python scripts/test-figma-service.py
python scripts/test-image-service.py

# Run full world-class pipeline with Smart Generation
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json
```

**Default behavior:** Smart Generation runs automatically if providers are enabled in job config.

---

## Feature 1: Figma Token Sync

### What It Does

Connects to your Figma file and extracts design tokens:
- **Colors** (brand palette, UI colors)
- **Typography** (font families, sizes, weights)
- **Spacing** (margins, padding, grid systems)

Saves to: `design-tokens/teei-figma-tokens.json`

### Setup Steps

#### Step 1: Get Figma Personal Access Token

1. Log in to [Figma.com](https://www.figma.com)
2. Go to **Settings** → **Personal Access Tokens**
3. Click **Create new token**
4. Name it: `PDF Orchestrator Token`
5. Copy the token (starts with `figd_...`)

#### Step 2: Set Environment Variable

**Windows (PowerShell):**
```powershell
# Temporary (current session only)
$env:FIGMA_PERSONAL_ACCESS_TOKEN = "figd_YOUR_TOKEN_HERE"

# Permanent (all sessions)
[System.Environment]::SetEnvironmentVariable('FIGMA_PERSONAL_ACCESS_TOKEN', 'figd_YOUR_TOKEN_HERE', 'User')
```

**Windows (Command Prompt):**
```cmd
setx FIGMA_PERSONAL_ACCESS_TOKEN "figd_YOUR_TOKEN_HERE"
```

**Linux/Mac:**
```bash
export FIGMA_PERSONAL_ACCESS_TOKEN="figd_YOUR_TOKEN_HERE"

# Make permanent: Add to ~/.bashrc or ~/.zshrc
echo 'export FIGMA_PERSONAL_ACCESS_TOKEN="figd_YOUR_TOKEN_HERE"' >> ~/.bashrc
```

#### Step 3: Get Figma File ID

1. Open your Figma file in browser
2. Look at URL: `https://www.figma.com/file/ABC123XYZ/My-Design`
3. File ID = `ABC123XYZ` (the part between `/file/` and the design name)

#### Step 4: Enable in Job Config

Edit `example-jobs/tfu-aws-partnership-v2.json`:

```json
{
  "providers": {
    "figma": {
      "enabled": true,
      "fileId": "ABC123XYZ",
      "accessTokenEnv": "FIGMA_PERSONAL_ACCESS_TOKEN",
      "useTokensFor": ["colors", "typography", "spacing"],
      "exportFrames": false,
      "frameIds": [],
      "failOnError": false
    }
  }
}
```

#### Step 5: Test Connection

```bash
python scripts/test-figma-service.py
```

**Expected output (success):**
```
============================================================
FIGMA SERVICE TEST
============================================================

[TEST] Creating Figma service with file ID: ABC123XYZ...
[TEST] Fetching design tokens...

[OK] FIGMA OK:
  Colors: 7
  Text styles: 5
  Tokens written to: design-tokens/teei-figma-tokens.json
```

**Expected output (disabled):**
```
[INFO] FIGMA DISABLED in job config (expected for local/dev)
  This is normal - Figma requires:
  1. Figma file ID
  2. FIGMA_PERSONAL_ACCESS_TOKEN env var
```

### Troubleshooting Figma

**Problem:** "FIGMA DISABLED: missing token"

**Solution:**
1. Verify env var is set: `echo $env:FIGMA_PERSONAL_ACCESS_TOKEN` (PowerShell) or `echo $FIGMA_PERSONAL_ACCESS_TOKEN` (Linux/Mac)
2. If empty, re-run Step 2 above
3. Restart terminal/IDE after setting permanent env var

---

**Problem:** "Invalid Figma file ID"

**Solution:**
1. Double-check file ID from URL (no slashes, no extra characters)
2. Ensure you have access to the Figma file (view or edit permissions)
3. Try accessing file manually in browser while logged in

---

**Problem:** "Rate limit exceeded"

**Solution:**
1. Wait 60 seconds and try again
2. Figma API has rate limits: 100 requests/minute
3. If persistent, create new Personal Access Token

---

## Feature 2: Image Generation

### What It Does

Generates hero images for your PDF cover pages:
- **Local provider** (default): Creates placeholder images with labels
- **OpenAI DALL-E 3** (optional): AI-generated photorealistic images

Saves to: `assets/images/tfu/aws/` + manifest JSON

### Setup Steps

#### Option A: Local Provider (No API Key Needed)

**When to use:** Development, testing, or when external AI is unavailable

**Setup:**
1. Enable in job config (`providers.images.enabled = true`)
2. Set `provider` to `"local"`
3. No API key required!

Edit `example-jobs/tfu-aws-partnership-v2.json`:

```json
{
  "providers": {
    "images": {
      "enabled": true,
      "provider": "local",
      "model": null,
      "outputDir": "assets/images/tfu/aws",
      "roles": ["cover_hero", "impact_hero"],
      "failOnError": false,
      "cache": {
        "enabled": true,
        "maxAgeDays": 30
      }
    }
  }
}
```

**Test:**
```bash
python scripts/test-image-service.py
```

**Expected output:**
```
============================================================
IMAGE GENERATION SERVICE TEST
============================================================

[TEST] Creating image service with provider: local
[OK] local provider enabled
  Output directory: assets/images/tfu/aws

[TEST] Generating 1 test images...

[OK] IMAGERY OK:
  Generated: 1 images
  Provider: local
  Manifest: assets/images/tfu/aws/TEST-images.json
  - cover_hero: assets\images\tfu\aws\cover_hero-20251114.png
```

---

#### Option B: OpenAI DALL-E 3 (AI-Generated Images)

**When to use:** Production documents requiring photorealistic hero images

**Setup:**

**Step 1: Get OpenAI API Key**

1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Go to **API Keys** → **Create new secret key**
3. Copy key (starts with `sk-proj-...`)
4. **Important:** Add billing payment method or you'll get 429 errors

**Step 2: Set Environment Variable**

**Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY = "sk-proj-YOUR_KEY_HERE"

# Make permanent
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-proj-YOUR_KEY_HERE', 'User')
```

**Linux/Mac:**
```bash
export OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"

# Make permanent
echo 'export OPENAI_API_KEY="sk-proj-YOUR_KEY_HERE"' >> ~/.bashrc
```

**Step 3: Enable in Job Config**

```json
{
  "providers": {
    "images": {
      "enabled": true,
      "provider": "openai-dalle3",
      "model": "dall-e-3",
      "outputDir": "assets/images/tfu/aws",
      "roles": ["cover_hero", "impact_hero"],
      "failOnError": false,
      "cache": {
        "enabled": true,
        "maxAgeDays": 30
      }
    }
  },

  "generation": {
    "imageGeneration": {
      "enabled": true,
      "provider": "openai-dalle3",
      "quality": "hd",
      "style": "natural",
      "size": "1792x1024",
      "prompts": {
        "cover_hero": "Ukrainian student learning cloud computing with AWS mentor in modern classroom, warm natural lighting, documentary photography style, photorealistic",
        "impact_hero": "Diverse students collaborating on laptops in bright educational space, warm tones, natural lighting"
      }
    }
  }
}
```

**Step 4: Test**

```bash
python scripts/test-image-service.py
```

**Expected output:**
```
[OK] IMAGERY OK:
  Generated: 1 images
  Provider: openai-dalle3
  Manifest: assets/images/tfu/aws/TEST-images.json
  - cover_hero: assets\images\tfu\aws\cover_hero-20251114.png
```

**Cost:** ~$0.08 per HD image (1792x1024)

### Troubleshooting Image Generation

**Problem:** "Image provider not enabled"

**Solution:**
1. Check `providers.images.enabled = true` in job config
2. Verify provider name is exactly `"local"` or `"openai-dalle3"`
3. Check for typos in JSON config

---

**Problem:** "OpenAI 429 error: Rate limit exceeded"

**Solution:**
1. **Most common:** No billing payment method on file → Add payment method to OpenAI account
2. Actual rate limit → Wait 60 seconds and retry
3. Free tier exhausted → Upgrade to paid tier

---

**Problem:** "OpenAI 401 error: Invalid API key"

**Solution:**
1. Verify API key starts with `sk-proj-` (old keys start with `sk-`, may not work)
2. Check env var: `echo $env:OPENAI_API_KEY` (PowerShell) or `echo $OPENAI_API_KEY` (Linux/Mac)
3. Create new API key if expired or revoked
4. Restart terminal after setting env var

---

**Problem:** "Image file not found after generation"

**Solution:**
1. Check `outputDir` path exists: `assets/images/tfu/aws/`
2. Create directory manually: `mkdir -p assets/images/tfu/aws`
3. Check filesystem permissions (read/write access)

---

## Feature 3: Font Pairing Validation

### What It Does

Automatically validates typography choices against TFU brand guidelines:
- **Required fonts:** Lora (headlines) + Roboto (body)
- **Harmony score:** 0.90-0.95 for TFU pairing
- **Alternatives:** Suggests options if non-TFU document

**No setup required** - enabled by default in V2 job config.

### Configuration

Edit `example-jobs/tfu-aws-partnership-v2.json`:

```json
{
  "generation": {
    "fontPairing": {
      "enabled": true,
      "strategy": "constrained",
      "allow_alternatives": false,
      "tfu_brand_lock": true
    }
  }
}
```

**Options:**
- `enabled`: `true` to validate fonts, `false` to skip
- `strategy`: `"constrained"` (TFU only) or `"flexible"` (allow alternatives)
- `allow_alternatives`: `false` for strict TFU compliance
- `tfu_brand_lock`: `true` to enforce Lora + Roboto

### Standalone Testing

```bash
python -m services.font_pairing_engine --job-config example-jobs/tfu-aws-partnership-v2.json --purpose partnership --industry technology
```

**Expected output:**
```json
{
  "primary_recommendation": {
    "headline": "Lora Bold",
    "body": "Roboto Regular",
    "harmony_score": 0.94,
    "rationale": "TFU brand pairing - optimal for partnership materials"
  },
  "tfu_compliance": true
}
```

### Troubleshooting Font Pairing

**Problem:** "Font pairing validation failed"

**Solution:**
1. Ensure Lora and Roboto fonts installed on system
2. Run font installer: `powershell -ExecutionPolicy Bypass -File scripts/install-fonts.ps1`
3. Restart InDesign after installing fonts

---

**Problem:** "Harmony score too low (< 0.85)"

**Solution:**
1. For TFU documents: Use Lora + Roboto (guaranteed 0.90+)
2. For non-TFU: Set `allow_alternatives = true` to see suggestions
3. Check font weights match recommendations (e.g., Lora Bold, not Light)

---

## Running Smart Generation

### Standard World-Class Pipeline

```bash
# Full pipeline with Smart Generation + 6-layer validation
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json
```

**What happens:**

1. **Smart Generation Phase:**
   - Figma tokens loaded (if enabled)
   - Images generated (if enabled)
   - Fonts validated

2. **InDesign Generation:**
   - ExtendScript creates document
   - Assets applied to design
   - PDF exported

3. **6-Layer Validation:**
   - Layer 0: SmolDocling (if enabled)
   - Layers 1-4: Content, Quality, Visual, Gemini
   - Layer 5: Accessibility (if enabled)

4. **Summary Output:**
   - Console summary
   - JSON report: `reports/pipeline/{name}-world-class-summary.json`

### Pipeline Output Example

```
--- SMART GENERATION ---
Figma: disabled | tokens: not loaded
Images: enabled | provider: local
Fonts: enabled | pairing: Lora + Roboto | TFU compliant

--- VALIDATION LAYERS ---
Layer 0 – SmolDocling: SKIPPED
Layer 1 – Content/Design: 145/150 [PASS] (threshold: 140)
Layer 2 – PDF Quality: PASS (5/5 checks)
Layer 3 – Visual Regression: PASS (0.00% diff from baseline)
Layer 3.5 – AI Tier 1: 0.920 [PASS] (typography: 0.92, whitespace: 0.90, color: 0.95)
Layer 4 – Gemini Vision: 0.950 [PASS] (threshold: 0.92)
Layer 5 – Accessibility: SKIPPED

✅ OVERALL: PASS (all required layers passed)
```

---

## Advanced Configuration

### Caching Images

Enable caching to avoid regenerating identical images:

```json
{
  "providers": {
    "images": {
      "cache": {
        "enabled": true,
        "maxAgeDays": 30
      }
    }
  }
}
```

**How it works:**
- Images cached by prompt hash
- Reused if prompt unchanged and age < 30 days
- Saves API costs and time

### Fail-Soft vs Fail-Hard

Control whether Smart Generation errors stop the pipeline:

```json
{
  "providers": {
    "figma": {
      "failOnError": false  // Continue if Figma fails
    },
    "images": {
      "failOnError": false  // Continue if image generation fails
    }
  }
}
```

**Recommended:** `failOnError: false` (fail-soft) for resilient pipelines

---

## Frequently Asked Questions

### Q: Do I need Figma for Smart Generation?

**A:** No. All Smart Generation features are optional. Default (Figma disabled, local images, fonts enabled) works perfectly.

---

### Q: What's the cost of AI image generation?

**A:**
- **Local provider:** Free (placeholder images)
- **OpenAI DALL-E 3:** ~$0.08 per HD image (1792x1024)
- **Example:** 2 hero images per document = $0.16

---

### Q: Can I use my own images instead of AI-generated?

**A:** Yes! Simply:
1. Place images in `assets/images/tfu/aws/`
2. Name them: `cover_hero.png`, `impact_hero.png`, etc.
3. Disable provider: `providers.images.enabled = false`

---

### Q: How do I know if Smart Generation ran?

**A:** Check pipeline output:
```
--- SMART GENERATION ---
Figma: enabled | tokens: design-tokens/teei-figma-tokens.json
Images: enabled | provider: local
Fonts: enabled | pairing: Lora + Roboto | TFU compliant
```

---

### Q: What happens if Smart Generation fails?

**A:** Depends on `failOnError` setting:
- `false` (default): Pipeline continues, uses fallback assets
- `true`: Pipeline stops, shows error message

---

### Q: Can I test Smart Generation without running full pipeline?

**A:** Yes! Use standalone test scripts:
```bash
python scripts/test-figma-service.py
python scripts/test-image-service.py
```

---

## Troubleshooting Checklist

Before reporting issues, verify:

- [ ] Environment variables set correctly (`FIGMA_PERSONAL_ACCESS_TOKEN`, `OPENAI_API_KEY`)
- [ ] Restarted terminal after setting env vars
- [ ] Job config JSON is valid (no syntax errors)
- [ ] Figma file ID is correct (11-character alphanumeric)
- [ ] OpenAI account has billing payment method
- [ ] Output directories exist and have write permissions
- [ ] Fonts installed on system (Lora + Roboto)
- [ ] InDesign is running (for MCP connection)

---

## Getting Help

**Documentation:**
- Architecture: `services/ARCHITECTURE.md`
- AI Features: `AI-FEATURES-ROADMAP.md`
- Pipeline: `pipeline.py` (read inline comments)

**Test Scripts:**
- Figma: `scripts/test-figma-service.py`
- Images: `scripts/test-image-service.py`

**Logs:**
- Pipeline output: Console + `reports/pipeline/{name}-world-class-summary.json`
- Service errors: Check Python traceback in console

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-14
**Status:** Production Ready
