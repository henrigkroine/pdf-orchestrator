# OpenAI GPT Image Generation Integration

**Service**: OpenAI Image Generation API (gpt-image-1 / DALL-E 3)
**Version**: v1
**Base URL**: https://api.openai.com/v1
**Documentation**: https://platform.openai.com/docs/guides/images

---

## Overview

OpenAI Image Generation API provides AI-generated images from text prompts. Used for:
- Hero images for partnership documents
- Section illustrations
- Icons and decorative elements
- Custom graphics aligned with TEEI brand

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
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
```

---

## Endpoints

### 1. Image Generation (DALL-E 3)

**Purpose**: Generate brand-aligned images from text prompts

**Endpoint**: `POST /v1/images/generations`

**Request**:
```json
{
  "model": "dall-e-3",
  "prompt": "A warm, authentic photo of diverse students collaborating on laptops in a modern classroom. Natural lighting, hopeful atmosphere, teal and beige color palette. Photorealistic, professional photography style.",
  "n": 1,
  "size": "1792x1024",
  "quality": "hd",
  "style": "natural"
}
```

**Response** (200 OK):
```json
{
  "created": 1699058400,
  "data": [
    {
      "url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "revised_prompt": "A photorealistic image of diverse students..."
    }
  ]
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request (bad prompt, size, etc.)
- `401` - Invalid API key
- `429` - Rate limit exceeded or quota exceeded
- `500` - Server error

**Timeouts**:
- Connect: 10 seconds
- Total: 60 seconds (image generation is fast)

---

## Prompt Specifications for TEEI

### Brand Alignment Strategy

**Core Prompt Structure**:
```
[Subject] + [Style] + [TEEI Brand Elements] + [Technical Quality]
```

**TEEI Brand Elements to Include**:
- **Colors**: "teal and beige color palette", "warm sandy tones", "deep teal accents"
- **Mood**: "warm", "authentic", "hopeful", "empowering", "inclusive"
- **Lighting**: "natural lighting", "soft diffused light", "golden hour"
- **Style**: "photorealistic", "professional photography", "natural not staged"

**Example Prompts**:

**Hero Image (Partnership Document)**:
```
"A warm, authentic photo of educators and students working together in a modern learning space. Diverse group engaged in collaborative learning. Natural golden hour lighting, deep teal (#00393F) and warm beige (#FFF1E2) color scheme. Professional photography style, hopeful and empowering atmosphere. Photorealistic, high detail, 300 DPI quality."
```

**Section Illustration (Program Overview)**:
```
"An abstract, minimalist illustration of interconnected nodes representing educational partnerships. Deep teal (#00393F) and gold (#BA8F5A) color palette. Clean vector style, modern and professional. Symbolizes collaboration and growth."
```

**Icon (Cloud/Technology)**:
```
"A simple, flat icon of a cloud with upward arrow. Deep teal color (#00393F). Minimalist design, crisp edges, suitable for print at 300 DPI. Vector style, clean and modern."
```

### Safety Filter Handling

**Content Policy**: OpenAI filters out:
- Violence, gore, hate symbols
- Explicit or suggestive content
- Copyrighted characters/logos
- Realistic faces (DALL-E 3 avoids identifiable people)

**If Prompt Rejected (400 error)**:
- **Cause**: "students" + "children" may trigger safety filter
- **Solution**: Rephrase as "young learners", "education setting", "classroom environment"
- **Fallback**: Use Unsplash photos instead

**Revised Prompt Handling**:
- OpenAI may revise prompts for safety/quality
- Log both original and revised prompts
- Review revised prompts to ensure brand alignment

---

## Size and Quality Specifications

### DALL-E 3 Sizes

**Available Sizes**:
- `1024x1024` - Square (good for icons, social)
- `1792x1024` - Landscape 16:9 (good for hero images)
- `1024x1792` - Portrait 9:16 (good for mobile, infographics)

**TEEI Usage**:
- **Hero Images**: `1792x1024` (landscape)
- **Section Art**: `1024x1024` (square)
- **Icons**: `1024x1024` (square, then crop/resize)

### Quality Settings

**`quality: "standard"`**:
- Faster generation (~10 seconds)
- Lower cost ($0.040 per image)
- Good for drafts, internal docs

**`quality: "hd"`** (RECOMMENDED):
- Slower generation (~20 seconds)
- Higher cost ($0.080 per image)
- Better detail, more accurate to prompt
- Required for print-quality output

### 300 DPI Workflow

**Challenge**: DALL-E 3 generates at 72 DPI

**Solution**: Upscale and optimize

1. **Generate at largest size**: `1792x1024` HD
2. **Calculate effective DPI**:
   - 1792px ÷ 300 DPI = 5.97 inches wide
   - 1024px ÷ 300 DPI = 3.41 inches tall
   - **Good for**: 6×4 inch prints

3. **For larger prints**: Use AI upscaling
   ```javascript
   // Option 1: Gigapixel AI (local)
   // Option 2: Real-ESRGAN (open source)
   // Option 3: Adobe Lightroom Super Resolution (2x upscale)
   const upscaled = await upscaleImage(generatedImage, {
     targetWidth: 3600,  // 12 inches at 300 DPI
     targetHeight: 2400, // 8 inches at 300 DPI
     algorithm: 'lightroom-super-resolution'
   });
   ```

4. **Validate effective DPI**:
   ```javascript
   const effectiveDPI = imageWidthPx / (printWidthInches);
   if (effectiveDPI < 300) {
     console.warn('DPI below print quality threshold');
   }
   ```

---

## Quotas and Rate Limits

**API Rate Limits** (per API key):
- **DALL-E 3**: 7 requests/minute
- **DALL-E 2**: 50 requests/minute (fallback)

**Concurrent Requests**: 5 per API key

**Usage Limits** (based on plan):
- **Free Tier**: $5 credit (expires after 3 months)
- **Pay-as-you-go**: No hard limit, just usage billing

**Image Quotas**:
- No explicit quota, limited by rate limits and budget caps

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 5000; // 5 seconds

async function generateImage(prompt, options, attempt = 1) {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: options.size || '1792x1024',
        quality: options.quality || 'hd',
        style: options.style || 'natural',
        n: 1
      })
    });

    if (response.status === 400) {
      const error = await response.json();
      if (error.error.message.includes('content policy')) {
        // Safety filter triggered - rephrase or fallback
        throw new Error('SAFETY_FILTER: ' + error.error.message);
      }
      throw new Error('Invalid request: ' + error.error.message);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || BASE_DELAY / 1000;
      await sleep(retryAfter * 1000);
      return generateImage(prompt, options, attempt);
    }

    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return generateImage(prompt, options, attempt + 1);
    }

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('SAFETY_FILTER')) {
      // Don't retry safety filter rejections
      throw error;
    }

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return generateImage(prompt, options, attempt + 1);
    }

    throw error;
  }
}
```

**Idempotency**:
- Images are not idempotent (same prompt = different image)
- Store generated image URLs/assets with content hash
- Avoid re-generating identical prompts (check cache first)

---

## Fallbacks

### Primary: OpenAI DALL-E 3
- **Availability**: 99.9% SLA
- **Response Time**: P95 < 30 seconds

### Fallback 1: Artificio AI
- **Trigger**: OpenAI safety filter rejection or API unavailable
- **Use Case**: Alternative AI generation with different filters
- **Limitation**: May require different prompt structure

### Fallback 2: Unsplash Photos
- **Trigger**: All AI generation fails or inappropriate for subject
- **Use Case**: Authentic photography (better for people)
- **Limitation**: Limited brand color control (needs Lightroom)

### Fallback 3: Stock Icons (Noun Project, Custom)
- **Trigger**: Simple icons/graphics needed
- **Use Case**: Faster, cheaper than AI generation
- **Limitation**: Generic, not custom

**Fallback Decision Tree**:
```
OpenAI Image Generation Fails
  ↓
Is it 400 safety filter? → Rephrase prompt → Retry
  ↓
Still failing? → Try Artificio AI
  ↓
Artificio fails? → Is it people/authentic scenes?
  ├─ Yes → Use Unsplash photos
  └─ No (icons/graphics) → Use stock icons
```

---

## PII and Data Flow

**Data Sent to OpenAI**:
- Text prompts (descriptions, not names)
- Size/quality preferences

**NO PII Sent**:
- Names
- Faces (prompt requests "diverse" not specific people)
- Locations
- Identifiable information

**Data Storage**:
- **OpenAI**: Prompts stored for 30 days (API policy)
- **Our R2 storage**: Generated images for 90 days

**Data Retention**:
- Generated images: 90 days on R2
- Prompt logs: 90 days (for debugging, no PII)
- Image manifests: 1 year (metadata only, no image data)

**Compliance**:
- No personal data sent to OpenAI
- Generated images are non-identifiable
- Zero data retention agreement available (enterprise plan)

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05):
- **DALL-E 3 Standard**: $0.040/image (1024×1024)
- **DALL-E 3 HD**: $0.080/image (1024×1024)
- **DALL-E 3 HD Landscape**: $0.120/image (1792×1024)
- **DALL-E 2**: $0.020/image (fallback)

**Cost Per Document** (typical TEEI partnership PDF):
- Hero image (1792×1024 HD): $0.120
- 3× Section art (1024×1024 HD): $0.240
- **Total**: $0.360/document

**Monthly Budget**:
- Max 100 documents/month = $36/month
- With retries/variations: $50/month budgeted

**Cost Control**:
```javascript
const MAX_COST_PER_IMAGE = 0.15; // $0.15
const DAILY_CAP = 5.00; // $5/day
const MONTHLY_CAP = 100.00; // $100/month

async function checkImageBudget() {
  const dailySpend = await getDailySpend('openai_images');
  if (dailySpend >= DAILY_CAP) {
    throw new Error('Daily image generation budget exceeded');
  }

  const monthlySpend = await getMonthlySpend('openai_images');
  if (monthlySpend >= MONTHLY_CAP) {
    throw new Error('Monthly image generation budget exceeded');
  }
}
```

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "openai_images",
  "model": "dall-e-3",
  "operation": "generate",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "prompt_hash": "sha256:abc123...",
  "original_prompt": "A warm, authentic photo of...",
  "revised_prompt": "A photorealistic image of...",
  "size": "1792x1024",
  "quality": "hd",
  "latency_ms": 18500,
  "status_code": 200,
  "cost_usd": 0.120,
  "image_url": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "image_sha256": "def456...",
  "stored_path": "r2://teei/assets/ai/2025/11/hero_abc123.png"
}
```

---

## Error Handling

**Common Errors**:

| Error | Status | Cause | Resolution |
|-------|--------|-------|------------|
| Invalid API key | 401 | Key expired/revoked | Rotate key |
| Safety filter | 400 | Prompt violates policy | Rephrase prompt |
| Rate limit | 429 | >7 req/min | Backoff and retry |
| Quota exceeded | 429 | Billing issue | Check account |
| Invalid size | 400 | Unsupported size | Use 1024×1024, 1792×1024, or 1024×1792 |
| Timeout | 504 | Slow generation | Retry |

**Safety Filter Examples**:

**Rejected**:
- "children in classroom" → Too specific about minors
- "student headshots" → Faces of identifiable people
- "TEEI logo on wall" → Potential trademark

**Approved**:
- "diverse young learners in educational setting"
- "collaborative learning environment with students"
- "modern classroom with technology"

**Monitoring**:
- Alert on 3+ consecutive safety filter rejections
- Alert on daily spend >$5
- Alert on monthly spend >75% of cap
- Alert on avg latency >45 seconds

---

## Testing

**Staging Environment**:
```bash
# Use separate API key for dev/test
OPENAI_API_KEY=<test_api_key>
OPENAI_MAX_COST_PER_IMAGE=0.05  # Lower limit for testing
```

**Test Prompts**:
- `tests/fixtures/prompts/teei-hero.txt` - Hero image prompt
- `tests/fixtures/prompts/teei-icon.txt` - Icon prompt
- `tests/fixtures/prompts/safety-filter-test.txt` - Should be rejected

**Integration Tests**:
```bash
npm run test:integration:openai
```

**Visual Regression**:
- Generate test images
- Store as golden snapshots
- Compare future generations (manual review, not pixel-perfect)

---

## Support and Escalation

**Support Channels**:
- Developer Forum: https://community.openai.com/
- Email: support@openai.com
- Status Page: https://status.openai.com/

**SLA**:
- P1 (Production down): 1 hour response (Enterprise)
- P2 (Degraded): 4 hour response
- P3 (Question): 24 hour response

**Escalation**:
- Safety filter issues: Use web form at https://platform.openai.com/
- Billing issues: billing@openai.com
