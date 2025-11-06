# Adobe Lightroom Services Integration

**Service**: Adobe Lightroom Services API
**Version**: v1
**Base URL**: https://lr.adobe.io
**Documentation**: https://developer.adobe.com/lightroom/lightroom-api-docs/

---

## Overview

Adobe Lightroom Services provides cloud-based photo editing and rendition generation. Used for:
- Image color grading (align with TEEI brand palette)
- Batch rendition generation (web, print sizes)
- Photo optimization (tone, exposure, saturation)

---

## Authentication

**Model**: OAuth 2.0 Web App
**Token Type**: Bearer token

**Token Lifetimes**:
- Access Token: 24 hours
- Refresh Token: 14 days

**Header Format**:
```
Authorization: Bearer <ACCESS_TOKEN>
x-api-key: <CLIENT_ID>
Content-Type: application/json
```

**Credentials**:
```bash
ADOBE_LIGHTROOM_CLIENT_ID=325fc64c43684f62b949aa0b9ca64ffa
ADOBE_LIGHTROOM_CLIENT_SECRET=<stored_in_secrets_vault>
```

**OAuth Flow**:

1. **Authorization Request**:
```
https://ims-na1.adobelogin.com/ims/authorize/v2
  ?client_id=<CLIENT_ID>
  &scope=openid,lr_partner_apis,lr_partner_rendition_read,lr_partner_rendition_create
  &response_type=code
  &redirect_uri=https://pdf-orchestrator.teei.org/oauth/callback
```

2. **Token Exchange**:
```bash
POST https://ims-na1.adobelogin.com/ims/token/v3
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=<CLIENT_ID>
&client_secret=<CLIENT_SECRET>
&code=<AUTH_CODE>
&redirect_uri=https://pdf-orchestrator.teei.org/oauth/callback
```

3. **Token Refresh**:
```bash
POST https://ims-na1.adobelogin.com/ims/token/v3

grant_type=refresh_token
&client_id=<CLIENT_ID>
&client_secret=<CLIENT_SECRET>
&refresh_token=<REFRESH_TOKEN>
```

**Scopes Required**:
- `openid` - OpenID Connect
- `lr_partner_apis` - Lightroom API access
- `lr_partner_rendition_read` - Read renditions
- `lr_partner_rendition_create` - Create renditions

**Redirect URIs** (configured in Adobe Developer Console):
- Production: `https://pdf-orchestrator.teei.org/oauth/callback`
- Staging: `https://pdf-orchestrator-staging.pages.dev/oauth/callback`
- Local: `http://localhost:3000/oauth/callback`

---

## Endpoints

### 1. Upload Asset

**Purpose**: Upload photo to Lightroom cloud storage

**Endpoint**: `POST /v2/catalogs/{catalog_id}/assets`

**Request**:
```json
{
  "subtype": "image",
  "payload": {
    "userCreated": "2025-11-05T10:00:00Z",
    "captureDate": "2025-11-01T00:00:00Z"
  }
}
```

**Response** (201 Created):
```json
{
  "id": "asset_id_12345",
  "type": "image",
  "links": {
    "self": {
      "href": "/v2/catalogs/{catalog_id}/assets/asset_id_12345"
    }
  },
  "payload": {
    "importSource": {
      "fileName": "teei-program-photo.jpg",
      "sha256": "abc123..."
    }
  }
}
```

**Status Codes**:
- `201` - Created
- `400` - Invalid request
- `401` - Unauthorized (token expired)
- `403` - Forbidden
- `413` - File too large (max 2 GB)
- `429` - Rate limit exceeded

**Timeouts**:
- Connect: 10 seconds
- Total: 300 seconds (5 minutes for large files)

---

### 2. Apply Edits (Color Grading)

**Purpose**: Apply color adjustments to align with TEEI brand palette

**Endpoint**: `PUT /v2/catalogs/{catalog_id}/assets/{asset_id}/renditions`

**Request** (TEEI Brand Preset):
```json
{
  "editor": "lightroom",
  "develop": {
    "Temperature": 5400,           // Warm tone
    "Tint": 10,                    // Slight magenta (Sand/Beige alignment)
    "Exposure": 0.30,              // Brighten slightly
    "Contrast": 15,                // Moderate contrast
    "Highlights": -20,             // Recover highlights
    "Shadows": 25,                 // Lift shadows
    "Whites": 10,                  // Slightly brighter whites
    "Blacks": -15,                 // Deepen blacks
    "Clarity": 10,                 // Subtle clarity
    "Vibrance": 15,                // Natural color boost
    "Saturation": 5,               // Subtle saturation
    "SplitToningHighlightHue": 40, // Gold tint (TEEI Gold #BA8F5A)
    "SplitToningHighlightSaturation": 15,
    "SplitToningShadowHue": 190,   // Nordshore tint (#00393F)
    "SplitToningShadowSaturation": 8
  }
}
```

**Response** (200 OK):
```json
{
  "id": "asset_id_12345",
  "develop": {
    "Temperature": 5400,
    ...
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid develop settings
- `401` - Unauthorized
- `404` - Asset not found
- `429` - Rate limit exceeded

**Timeouts**:
- Connect: 10 seconds
- Total: 60 seconds

---

### 3. Generate Renditions

**Purpose**: Create web and print-optimized versions

**Endpoint**: `POST /v2/catalogs/{catalog_id}/assets/{asset_id}/renditions`

**Request** (Web + Print Sizes):
```json
{
  "renditions": [
    {
      "type": "image/jpeg",
      "width": 2400,
      "height": 1600,
      "quality": 90,
      "profile": "sRGB",
      "name": "web_hero"
    },
    {
      "type": "image/jpeg",
      "width": 3600,
      "height": 2400,
      "quality": 95,
      "profile": "Adobe RGB (1998)",
      "name": "print_300dpi"
    },
    {
      "type": "image/jpeg",
      "width": 800,
      "height": 533,
      "quality": 85,
      "profile": "sRGB",
      "name": "web_thumbnail"
    }
  ]
}
```

**Response** (202 Accepted):
```json
{
  "renditions": [
    {
      "name": "web_hero",
      "href": "https://lr.adobe.io/v2/catalogs/.../renditions/web_hero",
      "status": "processing"
    },
    {
      "name": "print_300dpi",
      "href": "https://lr.adobe.io/v2/catalogs/.../renditions/print_300dpi",
      "status": "processing"
    }
  ]
}
```

**Status Codes**:
- `202` - Accepted (async processing)
- `400` - Invalid rendition spec
- `401` - Unauthorized
- `404` - Asset not found
- `429` - Rate limit exceeded

**Timeouts**:
- Connect: 10 seconds
- Total: 120 seconds

**Polling for Completion**:
```javascript
async function waitForRendition(renditionUrl, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(renditionUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': process.env.ADOBE_LIGHTROOM_CLIENT_ID
      }
    });

    const data = await response.json();
    if (data.status === 'completed') {
      return data.downloadUrl;
    }

    await sleep(3000); // Poll every 3 seconds
  }

  throw new Error('Rendition timeout');
}
```

---

## Rendition Specifications

### TEEI Brand-Aligned Outputs

**Web Hero Image** (Landing pages, headers):
- Size: 2400×1600 px (3:2 aspect)
- DPI: 72 (effective 150 at display size)
- Format: JPEG, quality 90
- Profile: sRGB IEC61966-2.1
- Max file size: 500 KB

**Print Image** (InDesign placement):
- Size: 3600×2400 px (3:2 aspect)
- DPI: 300 (effective at 12×8 inch print)
- Format: JPEG, quality 95 or TIFF
- Profile: Adobe RGB (1998) or Coated FOGRA39 (CMYK)
- Max file size: 5 MB

**Web Thumbnail** (Cards, previews):
- Size: 800×533 px (3:2 aspect)
- DPI: 72
- Format: JPEG, quality 85
- Profile: sRGB
- Max file size: 150 KB

**Social Media** (Optional):
- Size: 1200×630 px (Open Graph)
- DPI: 72
- Format: JPEG, quality 90
- Profile: sRGB
- Max file size: 300 KB

---

## Quotas and Rate Limits

**API Rate Limits** (per access token):
- **Upload**: 10 requests/minute
- **Edit/Develop**: 60 requests/minute
- **Rendition Generation**: 30 requests/minute

**Concurrent Requests**: 3 per access token

**Storage Limits**:
- Free Tier: 5 GB
- Paid Plan: 100 GB
- Max file size: 2 GB per asset

**Rendition Limits**:
- Max renditions per asset: 50
- Batch rendition requests: 10 per call

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 seconds

async function callLightroomAPI(endpoint, options, attempt = 1) {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-api-key': process.env.ADOBE_LIGHTROOM_CLIENT_ID,
        ...options.headers
      }
    });

    // Token expired - refresh and retry
    if (response.status === 401) {
      await refreshAccessToken();
      return callLightroomAPI(endpoint, options, attempt);
    }

    // Rate limit - backoff
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || BASE_DELAY;
      await sleep(retryAfter * 1000);
      return callLightroomAPI(endpoint, options, attempt);
    }

    // Server error - retry with exponential backoff
    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
      return callLightroomAPI(endpoint, options, attempt + 1);
    }

    return response;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return callLightroomAPI(endpoint, options, attempt + 1);
    }
    throw error;
  }
}
```

**Token Refresh Policy**:
- Refresh proactively when token has <1 hour remaining
- Store refresh token securely in secrets vault
- Handle refresh failures gracefully (fallback to Unsplash)

---

## Fallbacks

### Primary: Adobe Lightroom Services
- **Availability**: 99.5% SLA
- **Response Time**: P95 < 10 seconds

### Fallback 1: Direct Unsplash Photos (No Editing)
- **Trigger**: Lightroom API unavailable or token refresh failed
- **Use Case**: Acceptable for web-quality images
- **Limitation**: No TEEI brand color grading

### Fallback 2: Local Photoshop Batch (Manual)
- **Trigger**: High-priority document, Lightroom down
- **Use Case**: Critical partnership materials
- **Limitation**: Manual process, slower

**Fallback Decision Tree**:
```
Lightroom API Call Fails
  ↓
Is it 401? → Refresh token → Retry
  ↓
Is it 429? → Backoff and retry
  ↓
Is it 5xx? → Retry 3x with backoff
  ↓
Still failing? → Use Unsplash photos directly (no color grading)
  ↓
Critical document? → Alert team for manual Photoshop editing
```

---

## PII and Data Flow

**Data Sent to Adobe**:
- Photos uploaded to Lightroom cloud storage
- Edit metadata (develop settings, no image analysis)
- Rendition specifications

**PII in Photos**:
- May contain faces (program participants)
- No personally identifiable metadata
- Photos are stock or licensed from Unsplash (public domain)

**NO PII Sent**:
- Names
- Email addresses
- EXIF location data (stripped before upload)

**Data Storage**:
- **Adobe Lightroom cloud**: Indefinite (until manually deleted)
- **Our R2 storage**: 90 days (production), 30 days (staging)

**Data Retention**:
- Original photos: 90 days on R2, then archived
- Renditions: 90 days on R2
- API logs: 90 days (no image data)

**Compliance**:
- GDPR compliant (Adobe is data processor)
- Photos sourced from Unsplash (license compliant)
- No student photos with identifiable faces

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05):
- Storage: $9.99/month for 1 TB (included in Creative Cloud)
- API Calls: Free (included with Lightroom plan)
- Bandwidth: $0.01/GB (download)

**Cost Per Document** (typical TEEI partnership PDF with 5 photos):
- Upload: Free
- Edit: Free
- Renditions (3 sizes × 5 photos): Free
- Download (15 MB total): $0.15

**Monthly Budget**:
- Lightroom Plan: $9.99/month (fixed)
- Bandwidth: ~$5/month (100 documents)
- **Total**: ~$15/month

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "lightroom_services",
  "operation": "generate_rendition",
  "asset_id": "asset_12345",
  "rendition_name": "print_300dpi",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "latency_ms": 8200,
  "status_code": 202,
  "cost_usd": 0.00,
  "bytes_out": 3400000,
  "width": 3600,
  "height": 2400
}
```

---

## Error Handling

**Common Errors**:

| Error | Status | Cause | Resolution |
|-------|--------|-------|------------|
| Token expired | 401 | Access token >24h old | Refresh token |
| Invalid refresh | 400 | Refresh token expired | Re-authenticate |
| Asset not found | 404 | Invalid asset ID | Verify upload |
| Rate limit | 429 | >60 req/min | Backoff and retry |
| File too large | 413 | >2 GB | Compress image |
| Invalid develop | 400 | Bad edit values | Validate preset |

**Monitoring**:
- Alert on token refresh failures
- Alert on 3+ consecutive 5xx errors
- Alert on avg latency >15 seconds

---

## Testing

**Staging Environment**:
```bash
# Use test account
ADOBE_LIGHTROOM_CLIENT_ID=<test_client_id>
ADOBE_LIGHTROOM_CATALOG_ID=<test_catalog_id>
```

**Test Assets**:
- `tests/fixtures/teei-test-photo.jpg` - 2400×1600, JPEG
- `tests/fixtures/teei-test-photo-large.tif` - 5000×3333, TIFF

**Integration Tests**:
```bash
npm run test:integration:lightroom
```

---

## Support and Escalation

**Support Channels**:
- Developer Forum: https://community.adobe.com/
- Email: grp-lightroom-api-support@adobe.com

**SLA**:
- P1 (Production down): 4 hour response
- P2 (Degraded): 8 hour response
- P3 (Question): 48 hour response

**Status Page**: https://status.adobe.com/
