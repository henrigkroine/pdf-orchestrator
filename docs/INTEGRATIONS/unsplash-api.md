# Unsplash API Integration

**Service**: Unsplash API
**Version**: v1
**Base URL**: https://api.unsplash.com
**Documentation**: https://unsplash.com/documentation

---

## Overview

Unsplash API provides access to high-quality stock photography. Used for:
- Hero images for partnership documents
- Section backgrounds and illustrations
- Authentic photography (people, education settings)
- Brand palette-aligned images (filtered by TEEI colors)

---

## Authentication

**Model**: Access Key (Client-ID header)
**Token Type**: Static access key

**Header Format**:
```
Authorization: Client-ID <ACCESS_KEY>
Content-Type: application/json
```

**Credentials**:
```bash
UNSPLASH_ACCESS_KEY=<stored_in_secrets_vault>
UNSPLASH_SECRET_KEY=<stored_in_secrets_vault>
```

**Application Details**:
- Application Name: TEEI PDF Orchestrator
- Description: Automated PDF generation for partnership materials
- Callback URL: https://pdf-orchestrator.teei.org/unsplash/callback

---

## Endpoints

### 1. Search Photos

**Purpose**: Find brand-aligned photography for document sections

**Endpoint**: `GET /search/photos`

**Request**:
```
GET /search/photos?query=students+learning+technology&color=teal&orientation=landscape&per_page=10&order_by=relevant
```

**Query Parameters**:
- `query` (required): Search terms (e.g., "students learning", "education classroom")
- `color`: Filter by color (`teal`, `blue`, `yellow`, `orange`, `red`, `purple`, `magenta`, `green`, `black_and_white`)
- `orientation`: `landscape`, `portrait`, `squarish`
- `per_page`: Results per page (1-30, default 10)
- `page`: Page number
- `order_by`: `relevant` (default), `latest`

**TEEI Brand Color Mapping**:
- Nordshore #00393F → `color=teal`
- Sky #C9E4EC → `color=blue`
- Sand/Beige #FFF1E2 → `color=yellow` (warm tones)
- Gold #BA8F5A → `color=orange` (warm metallics)

**Response** (200 OK):
```json
{
  "total": 487,
  "total_pages": 49,
  "results": [
    {
      "id": "LBI7cgq3pbM",
      "created_at": "2023-06-15T08:00:00Z",
      "width": 5472,
      "height": 3648,
      "color": "#0c5966",
      "description": "Students collaborating on laptops in modern classroom",
      "alt_description": "diverse students working together on technology",
      "urls": {
        "raw": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?ixid=...",
        "full": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?q=85&fm=jpg&w=2400",
        "regular": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?q=80&fm=jpg&w=1080",
        "small": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?q=80&fm=jpg&w=400",
        "thumb": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?q=80&fm=jpg&w=200"
      },
      "links": {
        "self": "https://api.unsplash.com/photos/LBI7cgq3pbM",
        "html": "https://unsplash.com/photos/LBI7cgq3pbM",
        "download": "https://unsplash.com/photos/LBI7cgq3pbM/download",
        "download_location": "https://api.unsplash.com/photos/LBI7cgq3pbM/download"
      },
      "user": {
        "id": "eJ3VGN8fK0A",
        "username": "johndoe",
        "name": "John Doe",
        "portfolio_url": "https://johndoe.com",
        "bio": "Education photographer"
      }
    }
  ]
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request (bad query params)
- `401` - Invalid access key
- `403` - Rate limit exceeded
- `404` - No results found
- `500` - Internal server error

**Timeouts**:
- Connect: 10 seconds
- Total: 30 seconds

---

### 2. Get Photo Details

**Purpose**: Retrieve full metadata for selected photo

**Endpoint**: `GET /photos/{id}`

**Request**:
```
GET /photos/LBI7cgq3pbM
```

**Response** (200 OK):
```json
{
  "id": "LBI7cgq3pbM",
  "created_at": "2023-06-15T08:00:00Z",
  "width": 5472,
  "height": 3648,
  "color": "#0c5966",
  "downloads": 12450,
  "likes": 387,
  "description": "Students collaborating on laptops in modern classroom",
  "exif": {
    "make": "Canon",
    "model": "EOS 5D Mark IV",
    "exposure_time": "1/200",
    "aperture": "2.8",
    "focal_length": "50.0",
    "iso": 800
  },
  "location": {
    "city": null,
    "country": null,
    "position": {
      "latitude": null,
      "longitude": null
    }
  },
  "urls": {
    "raw": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?ixid=...",
    "full": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?q=85&fm=jpg&w=2400",
    "regular": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?q=80&fm=jpg&w=1080"
  },
  "links": {
    "download_location": "https://api.unsplash.com/photos/LBI7cgq3pbM/download"
  },
  "user": {
    "id": "eJ3VGN8fK0A",
    "username": "johndoe",
    "name": "John Doe",
    "links": {
      "html": "https://unsplash.com/@johndoe"
    }
  }
}
```

**Status Codes**:
- `200` - Success
- `401` - Invalid access key
- `404` - Photo not found
- `403` - Rate limit exceeded

**Timeouts**:
- Connect: 10 seconds
- Total: 20 seconds

---

### 3. Track Download

**Purpose**: Track photo download for attribution and analytics (REQUIRED)

**Endpoint**: `GET /photos/{id}/download`

**Request**:
```
GET /photos/LBI7cgq3pbM/download
```

**Response** (200 OK):
```json
{
  "url": "https://images.unsplash.com/photo-1686817920287-a5b1e33a9c42?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=2400&dl=johndoe-LBI7cgq3pbM.jpg"
}
```

**IMPORTANT**: This endpoint MUST be called before downloading the photo. Failure to track downloads violates Unsplash API terms.

**Status Codes**:
- `200` - Success (download URL returned)
- `401` - Invalid access key
- `404` - Photo not found
- `403` - Rate limit exceeded

**Timeouts**:
- Connect: 10 seconds
- Total: 20 seconds

---

## Search Specifications

### TEEI Brand Palette Matching

**Search Strategy**:
```javascript
const TEEI_SEARCH_PROFILES = {
  hero_education: {
    query: 'students learning collaboration technology',
    color: 'teal',           // Nordshore alignment
    orientation: 'landscape'
  },
  hero_partnership: {
    query: 'professional handshake business partnership',
    color: 'blue',           // Sky alignment
    orientation: 'landscape'
  },
  section_background: {
    query: 'abstract modern education',
    color: 'yellow',         // Sand/Beige alignment
    orientation: 'landscape'
  },
  section_people: {
    query: 'diverse students classroom natural light',
    color: 'teal',
    orientation: 'landscape'
  },
  accent_graphic: {
    query: 'minimalist geometric pattern',
    color: 'orange',         // Gold alignment
    orientation: 'squarish'
  }
};

async function searchTEEIPhotos(profile) {
  const params = new URLSearchParams({
    query: TEEI_SEARCH_PROFILES[profile].query,
    color: TEEI_SEARCH_PROFILES[profile].color,
    orientation: TEEI_SEARCH_PROFILES[profile].orientation,
    per_page: 20,
    order_by: 'relevant'
  });

  const response = await fetch(
    `https://api.unsplash.com/search/photos?${params}`,
    {
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    }
  );

  return await response.json();
}
```

### Image Quality Filters

**Minimum Requirements**:
- Width: 2400px (web), 3600px (print)
- Aspect Ratio: 3:2 (landscape), 2:3 (portrait)
- Color: Matches TEEI palette filter

**Post-Download Validation**:
```javascript
function validateImageQuality(photo) {
  const minWidth = 2400;
  const minHeight = 1600;

  if (photo.width < minWidth || photo.height < minHeight) {
    return {
      valid: false,
      reason: `Image too small: ${photo.width}×${photo.height} (min ${minWidth}×${minHeight})`
    };
  }

  const aspectRatio = photo.width / photo.height;
  const expectedRatio = 3 / 2; // 1.5
  const tolerance = 0.1;

  if (Math.abs(aspectRatio - expectedRatio) > tolerance) {
    return {
      valid: false,
      reason: `Aspect ratio ${aspectRatio.toFixed(2)} outside tolerance (expected 1.5 ± 0.1)`
    };
  }

  return { valid: true };
}
```

---

## Attribution Requirements

### Unsplash License

**License Type**: Unsplash License (free for commercial use)

**Requirements**:
- Attribution to photographer (name + username)
- Link back to photographer's Unsplash profile
- Track downloads via API
- Do NOT sell/redistribute photos as-is

**Valid Uses**:
- Print materials (partnership documents)
- Digital materials (PDFs, presentations)
- Marketing materials
- Website/social media

**Invalid Uses**:
- Reselling photos
- Creating competing photo service
- Using for wallpapers/prints without attribution

### Attribution Format

**In PDF Documents** (footer or credits page):
```
Photo by [Photographer Name] on Unsplash
https://unsplash.com/@[username]
```

**Example**:
```
Photo by John Doe on Unsplash
https://unsplash.com/@johndoe
```

**Attribution Storage**:
```json
{
  "photo_id": "LBI7cgq3pbM",
  "photographer_name": "John Doe",
  "photographer_username": "johndoe",
  "photographer_url": "https://unsplash.com/@johndoe",
  "photo_url": "https://unsplash.com/photos/LBI7cgq3pbM",
  "download_tracked": true,
  "download_timestamp": "2025-11-05T10:30:00Z",
  "used_in_document": "teei-aws-partnership-v2"
}
```

---

## Quotas and Rate Limits

**API Rate Limits** (per access key):
- **Demo/Development**: 50 requests/hour
- **Production (Registered App)**: 5,000 requests/hour

**Concurrent Requests**: 10 per access key

**Download Tracking**: No separate limit (counts toward hourly quota)

**No Quotas On**:
- Number of photos downloaded
- Bandwidth usage
- Storage of downloaded photos

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 2000; // 2 seconds

async function callUnsplashAPI(endpoint, options = {}, attempt = 1) {
  try {
    const response = await fetch(`https://api.unsplash.com${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        ...options.headers
      }
    });

    if (response.status === 403) {
      const remaining = response.headers.get('X-Ratelimit-Remaining');
      if (remaining === '0') {
        const resetTime = response.headers.get('X-Ratelimit-Reset');
        const resetDate = new Date(resetTime * 1000);
        const waitMs = resetDate - Date.now();

        console.warn(`Rate limit hit. Resets at ${resetDate}. Waiting ${waitMs}ms...`);
        await sleep(waitMs + 1000); // Wait until reset + 1 second buffer
        return callUnsplashAPI(endpoint, options, attempt);
      }
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || BASE_DELAY / 1000;
      await sleep(retryAfter * 1000);
      return callUnsplashAPI(endpoint, options, attempt);
    }

    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
      return callUnsplashAPI(endpoint, options, attempt + 1);
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Unsplash API error: ${response.status} - ${error.errors}`);
    }

    return await response.json();
  } catch (error) {
    if (attempt < MAX_RETRIES && !error.message.includes('403')) {
      const delay = BASE_DELAY * Math.pow(2, attempt - 1);
      await sleep(delay);
      return callUnsplashAPI(endpoint, options, attempt + 1);
    }

    throw error;
  }
}
```

**Rate Limit Headers**:
- `X-Ratelimit-Limit`: Total requests allowed per hour
- `X-Ratelimit-Remaining`: Requests remaining in current window
- `X-Ratelimit-Reset`: Unix timestamp when limit resets

**Idempotency**:
- Search results are idempotent (same query = same results, modulo freshness)
- Download tracking is NOT idempotent (counts each call)
- Cache search results for 24 hours to avoid duplicate searches

---

## Fallbacks

### Primary: Unsplash API
- **Availability**: 99.9% SLA
- **Response Time**: P95 < 2 seconds

### Fallback 1: OpenAI Image Generation
- **Trigger**: No suitable photos found or Unsplash unavailable
- **Use Case**: Custom graphics, illustrations (not authentic photography)
- **Limitation**: AI-generated (not authentic), slower, costs $0.12/image

### Fallback 2: Artificio AI
- **Trigger**: OpenAI unavailable or safety filter issues
- **Use Case**: Alternative AI generation
- **Limitation**: Different prompt structure, untested quality

### Fallback 3: Local Asset Library
- **Trigger**: All online sources fail
- **Use Case**: Pre-approved TEEI photography (if available)
- **Limitation**: Limited selection, may not match document theme

**Fallback Decision Tree**:
```
Unsplash Search Fails
  ↓
Is it 403 rate limit? → Wait for reset → Retry
  ↓
Is it 404 no results? → Try broader search query
  ↓
Still no results? → Is it people/authentic scenes?
  ├─ Yes → Use OpenAI with "photorealistic" prompt
  └─ No (graphics/abstract) → Use OpenAI or Artificio
  ↓
All AI fails? → Check local asset library
  ↓
No local assets? → Fail gracefully (document without images)
```

---

## PII and Data Flow

**Data Sent to Unsplash**:
- Search queries (education keywords, no names)
- Download tracking requests (photo IDs only)

**NO PII Sent**:
- Names
- Email addresses
- Student information
- Location data

**Data Received**:
- Photo metadata (photographer name, username - public info)
- Photo URLs (hosted by Unsplash)
- EXIF data (camera settings, no GPS)

**Data Storage**:
- **Unsplash CDN**: Photos hosted indefinitely by Unsplash
- **Our R2 storage**: Downloaded photos for 90 days
- **Attribution data**: Indefinite (required for compliance)

**Data Retention**:
- Downloaded photos: 90 days on R2, then archived
- Attribution records: Indefinite (legal requirement)
- Search logs: 90 days (analytics only)

**Compliance**:
- No PII collected or transmitted
- Photos are public domain (Unsplash License)
- Attribution requirements met

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05):
- **API Access**: Free
- **Bandwidth**: Free (Unsplash CDN)
- **Storage**: Our cost (R2 storage = $0.015/GB/month)

**Cost Per Document** (typical TEEI partnership PDF with 5 photos):
- API calls (search + details + download tracking): $0
- Photo downloads: $0
- Our storage (5 photos × 3 MB × $0.015/GB): ~$0.0002/month
- **Total API cost**: $0
- **Total storage cost**: ~$0.0002/month per document

**Monthly Budget**:
- API: $0 (free tier sufficient for 100 docs/month)
- Storage: ~$0.02/month (100 documents)
- **Total**: ~$0.02/month

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "unsplash_api",
  "operation": "search_photos",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "search_query": "students learning technology",
  "color_filter": "teal",
  "orientation": "landscape",
  "results_count": 18,
  "selected_photo_id": "LBI7cgq3pbM",
  "photographer_name": "John Doe",
  "photographer_username": "johndoe",
  "download_tracked": true,
  "photo_width": 5472,
  "photo_height": 3648,
  "latency_ms": 820,
  "status_code": 200,
  "cost_usd": 0.00,
  "storage_bytes": 3200000
}
```

---

## Error Handling

**Common Errors**:

| Error | Status | Cause | Resolution |
|-------|--------|-------|------------|
| Invalid access key | 401 | Key incorrect/revoked | Rotate key in secrets vault |
| Rate limit | 403 | >50 req/hour (demo) | Wait for reset or upgrade |
| No results | 404 | Query too specific | Broaden search terms |
| Photo not found | 404 | Invalid photo ID | Verify ID from search |
| Timeout | 504 | Slow API response | Retry |

**No Results Handling**:
```javascript
async function searchWithFallbacks(baseQuery, colorFilter) {
  // Try exact query
  let results = await searchPhotos(baseQuery, colorFilter);
  if (results.total > 0) return results;

  // Try without color filter
  console.warn(`No results for "${baseQuery}" with color=${colorFilter}, retrying without color...`);
  results = await searchPhotos(baseQuery, null);
  if (results.total > 0) return results;

  // Try broader query
  const broaderQuery = baseQuery.split(' ').slice(0, 2).join(' '); // First 2 words
  console.warn(`No results for "${baseQuery}", trying broader query "${broaderQuery}"...`);
  results = await searchPhotos(broaderQuery, null);
  if (results.total > 0) return results;

  // No results - fallback to AI generation
  throw new Error('NO_RESULTS: No suitable photos found on Unsplash');
}
```

**Monitoring**:
- Alert on 3+ consecutive search failures
- Alert on rate limit reached (upgrade needed)
- Alert on avg latency >5 seconds

---

## Testing

**Staging Environment**:
```bash
UNSPLASH_ACCESS_KEY=<staging_access_key>
```

**Test Queries**:
- `tests/fixtures/unsplash-queries.json` - Pre-defined test queries
- `tests/fixtures/expected-results.json` - Expected photo counts

**Integration Tests**:
```bash
npm run test:integration:unsplash
```

**Test Scenarios**:
1. Search with TEEI color filter (should return >10 results)
2. Download tracking (should return download URL)
3. Rate limit handling (mock 403 response)
4. No results handling (very specific query)

---

## Support and Escalation

**Support Channels**:
- Email: help@unsplash.com
- Community: https://unsplash.com/community
- Status Page: https://status.unsplash.com/

**SLA**:
- P1 (API down): 2 hour response (best effort)
- P2 (Degraded): 8 hour response
- P3 (Question): 48 hour response

**Escalation**:
- Rate limit increase: Email help@unsplash.com with use case
- API bugs: Report via help@unsplash.com
- Attribution questions: legal@unsplash.com
