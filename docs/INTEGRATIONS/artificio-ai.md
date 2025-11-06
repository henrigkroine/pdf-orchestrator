# Artificio AI Image Generation Integration

**Service**: Artificio AI Image Generation
**Version**: v1
**Base URL**: https://api.artificio.ai
**Documentation**: https://docs.artificio.ai/

---

## Overview

Artificio AI provides alternative AI image generation capabilities. Used for:
- Fallback image generation when OpenAI DALL-E unavailable
- Alternative to OpenAI safety filter rejections
- Custom graphics and illustrations
- TEEI brand-aligned imagery

---

## Authentication

**Model**: API Key (Bearer token)
**Token Type**: Static API key

**Header Format**:
```
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Credentials**:
```bash
ARTIFICIO_API_KEY=<stored_in_secrets_vault>
ARTIFICIO_PROJECT_ID=teei-pdf-orchestrator
```

**API Key Management**:
- Generate keys at https://platform.artificio.ai/settings/api-keys
- Rotate keys every 90 days (security best practice)
- Store in secrets vault: `T:\Secrets\teei\artificio-api-key.txt`

---

## Endpoints

### 1. Generate Image

**Purpose**: Create AI-generated images from text prompts

**Endpoint**: `POST /v1/images/generate`

**Request**:
```json
{
  "prompt": "A warm, authentic photo of diverse students collaborating on laptops in a modern classroom. Natural lighting, hopeful atmosphere, teal and beige color palette. Photorealistic, professional photography style.",
  "negative_prompt": "low quality, blurry, distorted, cartoon, anime, text, watermark",
  "model": "artificio-xl-v1",
  "width": 1792,
  "height": 1024,
  "num_images": 1,
  "guidance_scale": 7.5,
  "steps": 50,
  "seed": null,
  "style": "photorealistic"
}
```

**Request Parameters**:
- `prompt` (required): Text description of desired image
- `negative_prompt` (optional): What to avoid in generation
- `model` (required): Model ID (`artificio-xl-v1`, `artificio-fast-v1`)
- `width` (required): Image width in pixels (multiple of 64, max 2048)
- `height` (required): Image height in pixels (multiple of 64, max 2048)
- `num_images` (optional): Number of images to generate (1-4, default 1)
- `guidance_scale` (optional): How closely to follow prompt (1-20, default 7.5)
- `steps` (optional): Generation steps (20-100, default 50)
- `seed` (optional): Random seed for reproducibility (integer)
- `style` (optional): Style preset (`photorealistic`, `artistic`, `minimalist`)

**Response** (200 OK):
```json
{
  "id": "img_abc123xyz",
  "created_at": 1699058400,
  "status": "completed",
  "images": [
    {
      "url": "https://cdn.artificio.ai/outputs/img_abc123xyz_0.png",
      "width": 1792,
      "height": 1024,
      "format": "png",
      "seed": 42
    }
  ],
  "metadata": {
    "model": "artificio-xl-v1",
    "steps": 50,
    "guidance_scale": 7.5,
    "prompt_tokens": 42
  }
}
```

**Status Codes**:
- `200` - Success (image generated)
- `202` - Accepted (async processing, poll for result)
- `400` - Invalid request (bad prompt, dimensions, etc.)
- `401` - Invalid API key
- `402` - Insufficient credits
- `429` - Rate limit exceeded
- `500` - Server error

**Timeouts**:
- Connect: 10 seconds
- Total: 120 seconds (XL model can be slow)

---

### 2. Get Generation Status

**Purpose**: Poll for async generation completion

**Endpoint**: `GET /v1/images/{id}`

**Request**:
```
GET /v1/images/img_abc123xyz
```

**Response** (200 OK):
```json
{
  "id": "img_abc123xyz",
  "status": "completed",
  "images": [
    {
      "url": "https://cdn.artificio.ai/outputs/img_abc123xyz_0.png",
      "width": 1792,
      "height": 1024
    }
  ]
}
```

**Status Values**:
- `queued`: Request received, waiting to process
- `processing`: Generating image
- `completed`: Image ready
- `failed`: Generation failed

**Polling Strategy**:
```javascript
async function waitForGeneration(generationId, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `https://api.artificio.ai/v1/images/${generationId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.ARTIFICIO_API_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.status === 'completed') {
      return data.images;
    }

    if (data.status === 'failed') {
      throw new Error(`Generation failed: ${data.error}`);
    }

    // Poll every 3 seconds (typical generation time: 30-60 seconds)
    await sleep(3000);
  }

  throw new Error('Generation timeout after 60 seconds');
}
```

**Status Codes**:
- `200` - Success (status returned)
- `401` - Invalid API key
- `404` - Generation ID not found
- `500` - Server error

**Timeouts**:
- Connect: 10 seconds
- Total: 10 seconds (fast status check)

---

## Model Selection

### Available Models

**artificio-xl-v1** (Recommended for Quality):
- **Resolution**: Up to 2048×2048
- **Speed**: 40-60 seconds per image
- **Quality**: High detail, photorealistic capable
- **Cost**: $0.10/image
- **Use Case**: Hero images, print-quality output

**artificio-fast-v1** (Recommended for Speed):
- **Resolution**: Up to 1024×1024
- **Speed**: 10-20 seconds per image
- **Quality**: Good, but less detail
- **Cost**: $0.05/image
- **Use Case**: Drafts, thumbnails, internal docs

**artificio-turbo-v1** (Experimental):
- **Resolution**: Up to 1024×1024
- **Speed**: 5-10 seconds per image
- **Quality**: Variable, experimental
- **Cost**: $0.02/image
- **Use Case**: Testing, rapid prototyping

---

## Prompt Formatting

### TEEI Brand Prompt Structure

**Core Template**:
```
[Subject] + [Style] + [TEEI Brand Colors] + [Mood] + [Lighting] + [Quality]
```

**Example Prompts**:

**Hero Image**:
```
A warm, authentic photo of diverse students collaborating on laptops in a modern classroom. Deep teal (#00393F) and warm beige (#FFF1E2) color scheme. Natural golden hour lighting, hopeful and empowering atmosphere. Professional photography style, high detail, photorealistic, 300 DPI quality.

Negative prompt: low quality, blurry, cartoon, anime, text overlays, watermarks, dark lighting, cluttered
```

**Section Illustration**:
```
An abstract, minimalist illustration of interconnected nodes representing educational partnerships. Deep teal (#00393F) and gold (#BA8F5A) color palette. Clean vector style, modern and professional. Symbolizes collaboration and growth. High resolution, suitable for print.

Negative prompt: realistic photo, busy, cluttered, dark colors, gradients
```

**Icon/Graphic**:
```
A simple, flat icon of a cloud with an upward arrow, representing data upload. Deep teal color (#00393F). Minimalist design, crisp edges, vector style. Clean and modern, suitable for print at 300 DPI.

Negative prompt: 3d, realistic, textured, shadows, gradients, complex
```

### Prompt Best Practices

**DO**:
- Include TEEI hex codes explicitly
- Specify "photorealistic" or "illustration" style
- Mention lighting (natural, golden hour, soft)
- Specify mood (warm, hopeful, empowering)
- Request high detail / 300 DPI for print

**DON'T**:
- Request specific people's faces
- Include copyrighted brand names (other than TEEI)
- Use vague descriptions ("nice photo")
- Forget negative prompts (avoid common issues)

**Negative Prompt Defaults**:
```
low quality, blurry, distorted, cartoon, anime, text, watermark, signature, logo, dark, cluttered, busy
```

---

## Size and Quality Specifications

### Recommended Sizes

**Hero Images** (Landscape):
- **Artificio XL**: 1792×1024 (same as DALL-E 3)
- **Aspect Ratio**: 16:9
- **Effective DPI**: 298 DPI at 6×4 inch print
- **Use**: Document headers, landing pages

**Section Art** (Square):
- **Artificio XL**: 1024×1024
- **Aspect Ratio**: 1:1
- **Effective DPI**: 341 DPI at 3×3 inch print
- **Use**: Section dividers, thumbnails

**Icons** (Square):
- **Artificio Fast**: 512×512 (upscale to 1024×1024 if needed)
- **Aspect Ratio**: 1:1
- **Use**: UI elements, small graphics

### Print Quality Calculation

**Formula**:
```
Effective DPI = Image Width (px) / Print Width (inches)
```

**Example**:
```
1792px ÷ 300 DPI = 5.97 inches wide (acceptable for 6-inch print)
1024px ÷ 300 DPI = 3.41 inches wide (acceptable for 3-4 inch print)
```

**For Larger Prints**: Use AI upscaling (Lightroom Super Resolution or Real-ESRGAN)

---

## Quotas and Rate Limits

**API Rate Limits** (estimated, not publicly documented):
- **Generation Requests**: 10 requests/minute
- **Status Checks**: 60 requests/minute
- **Concurrent Generations**: 5 per API key

**Credit System**:
- Pay-as-you-go: $10 minimum purchase
- Credits consumed per generation:
  - XL model: 10 credits ($0.10)
  - Fast model: 5 credits ($0.05)
  - Turbo model: 2 credits ($0.02)

**Monthly Budget Cap**:
```javascript
const MONTHLY_CAP = 100.00; // $100/month
const COST_PER_IMAGE = 0.10; // XL model
const MAX_IMAGES_PER_MONTH = MONTHLY_CAP / COST_PER_IMAGE; // 1000 images
```

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 5000; // 5 seconds

async function generateImageArtificio(prompt, options, attempt = 1) {
  try {
    const response = await fetch('https://api.artificio.ai/v1/images/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ARTIFICIO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: options.negativePrompt || DEFAULT_NEGATIVE_PROMPT,
        model: options.model || 'artificio-xl-v1',
        width: options.width || 1792,
        height: options.height || 1024,
        num_images: 1,
        guidance_scale: options.guidanceScale || 7.5,
        steps: options.steps || 50
      })
    });

    if (response.status === 400) {
      const error = await response.json();
      // Don't retry invalid prompts
      throw new Error('INVALID_PROMPT: ' + error.message);
    }

    if (response.status === 402) {
      // Insufficient credits
      throw new Error('INSUFFICIENT_CREDITS: Please add more credits to Artificio account');
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || BASE_DELAY / 1000;
      console.warn(`Rate limit hit, waiting ${retryAfter} seconds...`);
      await sleep(retryAfter * 1000);
      return generateImageArtificio(prompt, options, attempt);
    }

    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      console.warn(`Server error (${response.status}), retry ${attempt}/${MAX_RETRIES}...`);
      await sleep(delay + jitter);
      return generateImageArtificio(prompt, options, attempt + 1);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Artificio API error: ${response.status} - ${error.message}`);
    }

    const data = await response.json();

    // If async, poll for completion
    if (data.status === 'queued' || data.status === 'processing') {
      const images = await waitForGeneration(data.id);
      return images;
    }

    return data.images;
  } catch (error) {
    if (error.message.includes('INVALID_PROMPT') || error.message.includes('INSUFFICIENT_CREDITS')) {
      // Don't retry these errors
      throw error;
    }

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return generateImageArtificio(prompt, options, attempt + 1);
    }

    throw error;
  }
}
```

**Idempotency**:
- Use `seed` parameter for reproducible generation
- Cache results keyed by `sha256(prompt + model + width + height + seed)`
- Store generated images for 90 days to avoid regeneration

---

## Safety Filters

**Content Policy** (assumed similar to industry standard):
- No violence, gore, hate symbols
- No explicit or suggestive content
- No copyrighted characters/logos
- Realistic faces allowed (unlike DALL-E 3)

**Safety Filter Handling**:
```javascript
async function generateWithSafetyFallback(prompt) {
  try {
    return await generateImageArtificio(prompt, {});
  } catch (error) {
    if (error.message.includes('SAFETY_FILTER') || error.message.includes('CONTENT_POLICY')) {
      console.warn('Safety filter triggered, rephrasing prompt...');

      // Rephrase: Remove potentially sensitive keywords
      const safePr Prompt = prompt
        .replace(/students/gi, 'learners')
        .replace(/children/gi, 'young people')
        .replace(/classroom/gi, 'educational setting');

      return await generateImageArtificio(safePrompt, {});
    }

    throw error;
  }
}
```

---

## Fallbacks

### Primary: OpenAI DALL-E 3
- **Availability**: 99.9% SLA
- **Response Time**: P95 < 30 seconds

### Fallback 1: Artificio AI (This Service)
- **Trigger**: OpenAI unavailable, safety filter rejection, or quota exceeded
- **Availability**: 99% SLA (estimated)
- **Response Time**: P95 < 60 seconds (XL model)

### Fallback 2: Unsplash Photos
- **Trigger**: Artificio fails or inappropriate for AI generation
- **Use Case**: Authentic photography (better for people/scenes)
- **Limitation**: Stock photos, limited brand color control

### Fallback 3: Local Asset Library
- **Trigger**: All online sources fail
- **Use Case**: Pre-approved TEEI graphics
- **Limitation**: Limited selection

**Fallback Decision Tree**:
```
OpenAI Generation Fails
  ↓
Is it safety filter? → Try Artificio (more permissive filters)
  ↓
Is it quota/cost exceeded? → Try Artificio (cheaper alternative)
  ↓
Is it API unavailable? → Try Artificio
  ↓
Artificio Fails Too?
  ↓
Is it people/authentic scenes? → Use Unsplash photos
  ↓
Is it graphics/abstract? → Use local asset library
  ↓
No local assets? → Fail gracefully (document without images)
```

---

## PII and Data Flow

**Data Sent to Artificio**:
- Text prompts (descriptions, no names)
- Generation parameters (size, style, model)

**NO PII Sent**:
- Names (individuals)
- Faces (specific people)
- Locations (specific addresses)
- Identifiable information

**Data Storage**:
- **Artificio**: Prompts stored for 30 days (API policy, estimated)
- **Artificio CDN**: Generated images for 7 days (temporary)
- **Our R2 storage**: Downloaded images for 90 days

**Data Retention**:
- Generated images: 90 days on R2
- Prompt logs: 90 days (for debugging, no PII)
- Image manifests: 1 year (metadata only)

**Compliance**:
- No personal data sent
- Generated images are non-identifiable
- GDPR compliant (no EU data residency concerns)

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05, estimated):
- **XL Model**: $0.10/image (1792×1024 or 1024×1024)
- **Fast Model**: $0.05/image (1024×1024)
- **Turbo Model**: $0.02/image (512×512)

**Cost Per Document** (typical TEEI partnership PDF):
- Hero image (1792×1024 XL): $0.10
- 3× Section art (1024×1024 Fast): $0.15
- **Total**: $0.25/document

**Monthly Budget**:
- Max 100 documents/month = $25/month
- With retries/variations: $35/month budgeted

**Comparison to OpenAI**:
- OpenAI DALL-E 3 HD: $0.12/image (landscape)
- Artificio XL: $0.10/image (landscape)
- **Savings**: ~17% cheaper

**Cost Control**:
```javascript
const MAX_COST_PER_IMAGE = 0.15; // $0.15
const DAILY_CAP = 5.00; // $5/day
const MONTHLY_CAP = 100.00; // $100/month

async function checkArtificioBudget() {
  const dailySpend = await getDailySpend('artificio');
  if (dailySpend >= DAILY_CAP) {
    throw new Error('Daily Artificio budget exceeded');
  }

  const monthlySpend = await getMonthlySpend('artificio');
  if (monthlySpend >= MONTHLY_CAP) {
    throw new Error('Monthly Artificio budget exceeded');
  }
}
```

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "artificio_ai",
  "model": "artificio-xl-v1",
  "operation": "generate",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "prompt_hash": "sha256:abc123...",
  "original_prompt": "A warm, authentic photo of...",
  "negative_prompt": "low quality, blurry...",
  "width": 1792,
  "height": 1024,
  "guidance_scale": 7.5,
  "steps": 50,
  "seed": 42,
  "latency_ms": 45000,
  "status_code": 200,
  "cost_usd": 0.10,
  "generation_id": "img_abc123xyz",
  "image_url": "https://cdn.artificio.ai/outputs/img_abc123xyz_0.png",
  "image_sha256": "def456...",
  "stored_path": "r2://teei/assets/ai/2025/11/hero_abc123.png"
}
```

---

## Error Handling

**Common Errors**:

| Error | Status | Cause | Resolution |
|-------|--------|-------|------------|
| Invalid API key | 401 | Key incorrect/revoked | Rotate key in secrets vault |
| Insufficient credits | 402 | Account balance low | Add credits at platform.artificio.ai |
| Invalid prompt | 400 | Malformed request | Validate prompt format |
| Invalid dimensions | 400 | Width/height not multiple of 64 | Round to nearest 64px |
| Rate limit | 429 | >10 req/min | Backoff and retry |
| Generation failed | 500 | Internal error | Retry with backoff |
| Timeout | 504 | Slow generation | Retry or use Fast model |

**Safety Filter Examples** (if implemented):

**Potentially Rejected**:
- "children in classroom" (if overly strict)
- "student headshots" (specific faces)

**Likely Accepted**:
- "diverse young learners in educational setting"
- "collaborative learning environment with students"
- "modern classroom with technology"

**Monitoring**:
- Alert on 3+ consecutive generation failures
- Alert on daily spend >$5
- Alert on monthly spend >75% of cap
- Alert on avg latency >90 seconds (XL model)
- Alert on insufficient credits (balance <$10)

---

## Testing

**Staging Environment**:
```bash
ARTIFICIO_API_KEY=<staging_api_key>
ARTIFICIO_PROJECT_ID=teei-pdf-orchestrator-staging
ARTIFICIO_MAX_COST_PER_IMAGE=0.05  # Use Fast model for testing
```

**Test Prompts**:
- `tests/fixtures/prompts/artificio-hero.txt` - Hero image prompt
- `tests/fixtures/prompts/artificio-icon.txt` - Icon prompt
- `tests/fixtures/prompts/artificio-invalid.txt` - Should fail validation

**Integration Tests**:
```bash
npm run test:integration:artificio
```

**Test Scenarios**:
1. Generate XL image (1792×1024)
2. Generate Fast image (1024×1024)
3. Poll for async completion
4. Handle invalid prompt (400 error)
5. Handle rate limit (429 error)
6. Handle insufficient credits (402 error)

**Visual Regression**:
- Generate test images with fixed seed
- Store as golden snapshots
- Compare future generations (manual review)

---

## Support and Escalation

**Support Channels**:
- Email: support@artificio.ai
- Developer Forum: https://community.artificio.ai/ (if available)
- Status Page: https://status.artificio.ai/ (if available)

**SLA** (estimated, not publicly documented):
- P1 (API down): 4 hour response
- P2 (Degraded): 12 hour response
- P3 (Question): 48 hour response

**Escalation**:
- API issues: support@artificio.ai
- Billing issues: billing@artificio.ai
- Safety filter questions: Use support email
