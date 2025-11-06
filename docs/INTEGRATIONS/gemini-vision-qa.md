# Google Gemini Vision QA Integration

**Service**: Google Gemini Vision API
**Version**: v1beta
**Base URL**: https://generativelanguage.googleapis.com
**Documentation**: https://ai.google.dev/gemini-api/docs/vision

---

## Overview

Google Gemini Vision API provides multimodal AI capabilities for visual analysis and comparison. Used for:
- Visual QA (comparing generated PDFs to golden snapshots)
- Brand compliance verification (colors, fonts, layout)
- Accessibility checks (contrast ratios, text readability)
- Layout diff detection (text cutoffs, alignment issues)

---

## Authentication

**Model**: API Key (x-goog-api-key header)
**Token Type**: Static API key

**Header Format**:
```
x-goog-api-key: <API_KEY>
Content-Type: application/json
```

**Credentials**:
```bash
GOOGLE_GEMINI_API_KEY=<stored_in_secrets_vault>
GOOGLE_GEMINI_PROJECT_ID=teei-automation
```

**API Key Restrictions** (Google Cloud Console):
- Restrict to specific IPs: 203.0.113.0/24 (production), 198.51.100.0/24 (staging)
- Restrict to API: Generative Language API only
- Quota project: teei-automation

---

## Endpoints

### 1. Generate Content (Vision Analysis)

**Purpose**: Analyze PDF screenshots and compare to golden snapshots

**Endpoint**: `POST /v1beta/models/gemini-2.0-flash-exp:generateContent`

**Request**:
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Compare these two PDF pages. The first is the golden snapshot (approved design), the second is the newly generated version. Identify any differences in:\n1. Colors (check hex codes match TEEI palette: #00393F, #C9E4EC, #FFF1E2, #BA8F5A)\n2. Typography (Lora for headlines, Roboto Flex for body)\n3. Layout (text cutoffs, alignment, spacing)\n4. Content completeness (no 'XX' placeholders)\n5. Accessibility (contrast ratios, alt text presence)\n\nRate severity: CRITICAL (blocks publish), MAJOR (review needed), MINOR (cosmetic)."
        },
        {
          "inline_data": {
            "mime_type": "image/png",
            "data": "<base64_encoded_golden_snapshot>"
          }
        },
        {
          "inline_data": {
            "mime_type": "image/png",
            "data": "<base64_encoded_generated_pdf_page>"
          }
        }
      ]
    }
  ],
  "generationConfig": {
    "temperature": 0.1,
    "topK": 32,
    "topP": 1,
    "maxOutputTokens": 2048
  }
}
```

**Response** (200 OK):
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "**CRITICAL ISSUES:**\n1. Color mismatch: Header uses #913B2F (copper) instead of #00393F (Nordshore)\n2. Text cutoff: 'THE EDUCATIONAL EQUALITY IN-' truncated at page edge\n3. Missing metrics: Shows 'XX Students Reached' instead of actual number\n\n**MAJOR ISSUES:**\n4. Font inconsistency: Body text appears to be Arial, not Roboto Flex\n\n**MINOR ISSUES:**\n5. Spacing: Section break is 55pt instead of 60pt\n\n**SSIM Score**: 0.78 (below 0.95 threshold)\n**Recommendation**: BLOCK PUBLISH - Critical brand violations detected"
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP",
      "index": 0,
      "safetyRatings": [
        {
          "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          "probability": "NEGLIGIBLE"
        }
      ]
    }
  ],
  "promptFeedback": {
    "safetyRatings": []
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request (malformed JSON, missing images)
- `401` - Invalid API key
- `403` - API not enabled or quota exceeded
- `429` - Rate limit exceeded
- `500` - Internal server error

**Timeouts**:
- Connect: 10 seconds
- Total: 60 seconds (vision analysis is fast)

---

## Visual QA Specifications

### SSIM Threshold Analysis

**SSIM (Structural Similarity Index)**:
- **1.0**: Perfect match (identical images)
- **>0.95**: Acceptable (minor anti-aliasing differences)
- **0.90-0.95**: Review needed (noticeable differences)
- **<0.90**: Critical (layout or content changes)

**Calculation**:
```javascript
const ssim = require('ssim.js');

async function comparePages(goldenPath, generatedPath) {
  const golden = await loadImage(goldenPath);
  const generated = await loadImage(generatedPath);

  const { mssim } = ssim(golden, generated);

  return {
    ssim: mssim,
    pass: mssim >= 0.95,
    severity: mssim < 0.90 ? 'CRITICAL' : (mssim < 0.95 ? 'MAJOR' : 'MINOR')
  };
}
```

### Failure Thresholds

**CRITICAL (Block Publish)**:
- SSIM < 0.90
- Wrong color palette detected (non-TEEI colors)
- Text cutoffs or truncation
- Missing content (placeholders like "XX")
- Accessibility violations (contrast ratio < 4.5:1)
- Logo clearspace violations

**MAJOR (Review Required)**:
- SSIM 0.90-0.95
- Font inconsistencies
- Spacing/alignment off by >5pt
- Image quality degradation
- Missing alt text on images

**MINOR (Cosmetic)**:
- SSIM > 0.95
- Spacing off by <5pt
- Minor anti-aliasing differences
- Non-critical metadata missing

### When to Block Publish

**Automated Block** (no human review):
- CRITICAL severity issues detected
- SSIM < 0.85 (major layout changes)
- Gemini explicitly recommends "BLOCK PUBLISH"

**Manual Review Required**:
- MAJOR severity issues
- SSIM 0.85-0.95
- Ambiguous differences

**Auto-Approve**:
- MINOR severity only
- SSIM > 0.95
- Gemini confirms "APPROVED"

---

## Quotas and Rate Limits

**API Rate Limits** (per API key):
- **Free Tier**: 15 requests/minute (RPM)
- **Paid Tier**: 1000 requests/minute
- **Concurrent Requests**: 10 per API key

**Token Limits** (Gemini 2.0 Flash Exp):
- **Input Tokens**: 1,048,576 tokens per request
- **Output Tokens**: 8,192 tokens per response
- **Images**: 16 images per request
- **Image Size**: 20 MB max per image

**Daily Quotas** (Free Tier):
- 1,500 requests/day
- 50,000,000 input tokens/day
- 100,000 output tokens/day

**Paid Tier**: No daily quota limits (usage-based billing)

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 seconds

async function callGeminiVision(prompt, images, attempt = 1) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`,
      {
        method: 'POST',
        headers: {
          'x-goog-api-key': process.env.GOOGLE_GEMINI_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                ...images.map(img => ({
                  inline_data: {
                    mime_type: 'image/png',
                    data: img.base64
                  }
                }))
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,  // Low temp for consistent analysis
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || BASE_DELAY / 1000;
      await sleep(retryAfter * 1000);
      return callGeminiVision(prompt, images, attempt);
    }

    if (response.status === 403) {
      const error = await response.json();
      if (error.error.message.includes('quota')) {
        throw new Error('QUOTA_EXCEEDED: Gemini API quota exceeded');
      }
      throw new Error('API_DISABLED: Gemini API not enabled for project');
    }

    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
      return callGeminiVision(prompt, images, attempt + 1);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${error.error.message}`);
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('QUOTA_EXCEEDED') || error.message.includes('API_DISABLED')) {
      // Don't retry quota/permission errors
      throw error;
    }

    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return callGeminiVision(prompt, images, attempt + 1);
    }

    throw error;
  }
}
```

**Idempotency**:
- Same images + same prompt = deterministic analysis (low temperature)
- Use `x-request-id` header for request tracking
- Cache results keyed by `sha256(golden_hash + generated_hash + prompt_hash)`

---

## Fallbacks

### Primary: Gemini 2.0 Flash Exp
- **Availability**: 99.9% SLA (paid tier)
- **Response Time**: P95 < 5 seconds

### Fallback 1: SSIM-Only Comparison (No AI)
- **Trigger**: Gemini API unavailable or quota exceeded
- **Use Case**: Numeric similarity score only
- **Limitation**: No semantic understanding (can't detect wrong colors, fonts)
- **Threshold**: SSIM < 0.95 = fail

### Fallback 2: Manual Human Review
- **Trigger**: SSIM borderline (0.90-0.95) and Gemini unavailable
- **Use Case**: High-priority documents requiring human judgment
- **Process**:
  1. Email side-by-side comparison to henrik@theeducationalequalityinstitute.org
  2. Wait for approval/rejection
  3. Log decision for future reference

**Fallback Decision Tree**:
```
Gemini Vision QA Fails
  ↓
Is it 403 quota? → Check free tier limit → Upgrade or wait
  ↓
Is it 429 rate limit? → Backoff and retry
  ↓
Is it 5xx? → Retry 3x with backoff
  ↓
Still failing? → Calculate SSIM without AI
  ↓
SSIM < 0.90? → Auto-reject (critical differences)
  ↓
SSIM 0.90-0.95? → Manual human review
  ↓
SSIM > 0.95? → Auto-approve
```

---

## PII and Data Flow

**Data Sent to Google**:
- PDF page screenshots (PNG format)
- Analysis prompts (no PII)
- TEEI brand guidelines (colors, fonts)

**PII in Screenshots**:
- Organization names (TEEI, partner names - public information)
- Program descriptions (non-sensitive)
- No individual student data

**NO PII Sent**:
- Names (individual students, staff)
- Email addresses
- Phone numbers
- Student records

**Data Storage**:
- **Google**: Prompts stored for ~48 hours (API policy), no long-term storage
- **Our R2 storage**: Golden snapshots indefinitely, QA reports 90 days

**Data Retention**:
- PDF screenshots: 90 days (QA archive)
- QA reports: 90 days (JSON with Gemini analysis)
- Golden snapshots: Indefinite (version controlled)
- API logs: 90 days (no image data)

**Compliance**:
- GDPR compliant (Google is data processor)
- No student records (FERPA compliant)
- Public organization information only

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05):
- **Free Tier**:
  - 15 RPM
  - $0/million input tokens
  - $0/million output tokens
  - 1,500 requests/day

- **Paid Tier** (Gemini 2.0 Flash Exp):
  - Input: $0.00025/1K characters (~$0.001/1K tokens)
  - Output: $0.00075/1K characters (~$0.003/1K tokens)
  - Images: Counted as ~258 tokens each

**Cost Per QA Run** (typical TEEI 12-page document):
- Prompt: 500 tokens = $0.0005
- Images: 2 images × 258 tokens = 516 tokens = $0.0005
- Output: 500 tokens = $0.0015
- **Total per page**: ~$0.0025
- **Total per document (12 pages)**: ~$0.03

**Monthly Budget**:
- Max 100 documents/month × 12 pages = 1,200 QA runs
- 1,200 × $0.0025 = $3/month
- **With retries**: $5/month budgeted

**Cost Control**:
```javascript
const MAX_COST_PER_QA = 0.005; // $0.005
const DAILY_CAP = 2.00; // $2/day
const MONTHLY_CAP = 50.00; // $50/month

async function checkGeminiQABudget() {
  const dailySpend = await getDailySpend('gemini_vision');
  if (dailySpend >= DAILY_CAP) {
    // Fallback to SSIM-only
    return false;
  }

  const monthlySpend = await getMonthlySpend('gemini_vision');
  if (monthlySpend >= MONTHLY_CAP) {
    throw new Error('Monthly Gemini QA budget exceeded');
  }

  return true;
}
```

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "gemini_vision_qa",
  "model": "gemini-2.0-flash-exp",
  "operation": "visual_qa",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "page_number": 3,
  "golden_snapshot_hash": "sha256:abc123...",
  "generated_pdf_hash": "sha256:def456...",
  "prompt_tokens": 516,
  "completion_tokens": 487,
  "latency_ms": 3200,
  "status_code": 200,
  "cost_usd": 0.0025,
  "ssim_score": 0.87,
  "severity": "CRITICAL",
  "issues_detected": 3,
  "block_publish": true,
  "critical_issues": [
    "Color mismatch: #913B2F instead of #00393F",
    "Text cutoff: 'THE EDUCATIONAL EQUALITY IN-'",
    "Missing metrics: 'XX Students Reached'"
  ]
}
```

---

## Error Handling

**Common Errors**:

| Error | Status | Cause | Resolution |
|-------|--------|-------|------------|
| Invalid API key | 401 | Key incorrect/revoked | Rotate key in secrets vault |
| API not enabled | 403 | Gemini API disabled | Enable in Google Cloud Console |
| Quota exceeded | 403 | Free tier limit hit | Upgrade to paid or wait |
| Rate limit | 429 | >15 req/min (free tier) | Backoff and retry |
| Image too large | 400 | >20 MB | Compress PNG before sending |
| Invalid image | 400 | Corrupted/unsupported | Re-export PDF page |
| Timeout | 504 | Slow processing | Retry with longer timeout |

**Safety Ratings**:
- Gemini may block responses for safety reasons
- Check `promptFeedback.safetyRatings` for blocks
- Should never occur with PDF screenshots (not harmful content)

**Monitoring**:
- Alert on 3+ consecutive QA failures
- Alert on daily quota >75% (free tier)
- Alert on avg latency >10 seconds
- Alert on CRITICAL issues detected >20% of runs

---

## Testing

**Staging Environment**:
```bash
GOOGLE_GEMINI_API_KEY=<staging_api_key>
GOOGLE_GEMINI_PROJECT_ID=teei-automation-staging
```

**Test Fixtures**:
- `tests/fixtures/golden-snapshots/page-01-approved.png` - Golden reference
- `tests/fixtures/generated/page-01-good.png` - Should pass (SSIM 0.98)
- `tests/fixtures/generated/page-01-color-wrong.png` - Should fail (wrong colors)
- `tests/fixtures/generated/page-01-cutoff.png` - Should fail (text cutoff)

**Integration Tests**:
```bash
npm run test:integration:gemini
```

**Visual Regression Suite**:
```bash
# Run full QA on all 12 pages
npm run qa:visual -- --doc=teei-aws-partnership-v2

# Compare to golden snapshots
npm run qa:compare -- --golden=v1 --generated=v2
```

---

## Support and Escalation

**Support Channels**:
- Developer Forum: https://discuss.ai.google.dev/
- Issue Tracker: https://issuetracker.google.com/issues?q=componentid:1368926
- Email: generativelanguage-support@google.com

**SLA** (Paid Tier):
- P1 (Production down): 1 hour response
- P2 (Degraded): 4 hour response
- P3 (Question): 24 hour response

**Status Page**: https://status.cloud.google.com/

**Escalation**:
- Quota issues: Request increase via Google Cloud Console
- API bugs: File issue at https://issuetracker.google.com/
- Billing issues: cloud-billing@google.com
