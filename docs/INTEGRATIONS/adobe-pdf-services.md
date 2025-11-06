# Adobe PDF Services Integration

**Service**: Adobe PDF Services API
**Version**: v2
**Base URL**: https://pdf-services.adobe.io
**Documentation**: https://developer.adobe.com/document-services/docs/

---

## Overview

Adobe PDF Services provides serverless PDF generation, manipulation, and analysis capabilities. Used for:
- Document Generation (DOCX/PPTX templates → PDF)
- PDF Extract (structure and content extraction)
- Accessibility Auto-Tag (PDF/UA compliance)

---

## Authentication

**Model**: JWT Service-to-Service
**Token Type**: Bearer token
**Token Lifetime**: 1000 days (expires ~2027-10)

**Header Format**:
```
Authorization: Bearer <ACCESS_TOKEN>
x-api-key: <CLIENT_ID>
Content-Type: application/json
```

**Credentials**:
```bash
ADOBE_CLIENT_ID=cd672e1ca9404614ab1a197e75cf9891
ADOBE_CLIENT_SECRET=<stored_in_secrets_vault>
ADOBE_ORGANIZATION_ID=E5DF22C4690873100A495C74@AdobeOrg
ADOBE_ACCESS_TOKEN=<jwt_token>
```

**Scopes**:
- `DCAPI` - Document Cloud API access
- `openid` - OpenID Connect
- `AdobeID` - Adobe Identity

---

## Endpoints

### 1. Document Generation API

**Purpose**: Generate PDFs from Word/PowerPoint templates with data injection

**Endpoint**: `POST /operation/documentgeneration`

**Request**:
```json
{
  "assetID": "urn:aaid:AS:UE1:...",
  "outputFormat": "pdf",
  "jsonDataForMerge": {
    "title": "TEEI AWS Partnership",
    "subtitle": "Together for Ukraine Program",
    "metrics": {
      "studentsReached": 850,
      "partnersEngaged": 12
    }
  }
}
```

**Response** (202 Accepted):
```json
{
  "status": "in_progress",
  "asset": {
    "downloadUri": "https://dcplatformstorageservice-prod-us-east-1.s3.amazonaws.com/...",
    "assetID": "urn:aaid:AS:UE1:..."
  }
}
```

**Status Codes**:
- `202` - Accepted (async operation started)
- `400` - Invalid request
- `401` - Authentication failed
- `403` - Forbidden (quota exceeded)
- `429` - Rate limit exceeded
- `500` - Internal server error

**Timeouts**:
- Connect: 10 seconds
- Total: 120 seconds (2 minutes)

---

### 2. PDF Extract API

**Purpose**: Extract structure, text, tables, and reading order from PDFs

**Endpoint**: `POST /operation/extractpdf`

**Request**:
```json
{
  "assetID": "urn:aaid:AS:UE1:...",
  "elementsToExtract": ["text", "tables"],
  "elementsToExtractRenditions": ["tables", "figures"],
  "tableOutputFormat": "csv"
}
```

**Response** (200 OK):
```json
{
  "content": {
    "structuredContent": [...],
    "tables": [...],
    "figures": [...]
  },
  "metadata": {
    "numPages": 12,
    "author": "TEEI",
    "producer": "Adobe PDF Services"
  }
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid PDF or request
- `401` - Authentication failed
- `413` - File too large (max 100 MB)
- `429` - Rate limit exceeded
- `500` - Extraction failed

**Timeouts**:
- Connect: 10 seconds
- Total: 180 seconds (3 minutes)

---

### 3. Accessibility Auto-Tag API

**Purpose**: Add accessibility tags for PDF/UA compliance

**Endpoint**: `POST /operation/autotag`

**Request**:
```json
{
  "assetID": "urn:aaid:AS:UE1:...",
  "shiftHeadings": false,
  "generateReport": true
}
```

**Response** (202 Accepted):
```json
{
  "status": "in_progress",
  "asset": {
    "downloadUri": "https://...",
    "assetID": "urn:aaid:AS:UE1:..."
  },
  "report": {
    "downloadUri": "https://..."
  }
}
```

**Status Codes**:
- `202` - Accepted
- `400` - Invalid PDF
- `401` - Authentication failed
- `429` - Rate limit exceeded
- `500` - Auto-tag failed

**Timeouts**:
- Connect: 10 seconds
- Total: 300 seconds (5 minutes)

**Report Parsing** (JSON):
```json
{
  "taggingReport": {
    "totalElements": 245,
    "taggedElements": 243,
    "warnings": 2,
    "errors": 0,
    "pdfUA": "compliant"
  }
}
```

---

## Quotas and Rate Limits

**Transaction Limits**:
- Free Tier: 500 transactions/month
- Standard: 10,000 transactions/month
- Enterprise: Custom limits

**Rate Limits** (per credential):
- **Document Generation**: 25 requests/minute
- **Extract**: 25 requests/minute
- **Auto-Tag**: 25 requests/minute

**Concurrent Requests**: 5 per credential

**File Size Limits**:
- Input PDF: 100 MB max
- Input DOCX/PPTX: 50 MB max
- Output PDF: 100 MB max

**Page Limits**:
- Document Generation: 500 pages max
- Extract: 200 pages max
- Auto-Tag: 200 pages max

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 60000; // 60 seconds

async function callAdobeAPI(endpoint, payload, attempt = 1) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_ACCESS_TOKEN}`,
        'x-api-key': process.env.ADOBE_CLIENT_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || BASE_DELAY;
      const delay = Math.min(retryAfter * 1000, MAX_DELAY);
      await sleep(delay);
      return callAdobeAPI(endpoint, payload, attempt);
    }

    if (response.status >= 500 && attempt < MAX_RETRIES) {
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
      const jitter = Math.random() * 1000;
      await sleep(delay + jitter);
      return callAdobeAPI(endpoint, payload, attempt + 1);
    }

    return response;
  } catch (error) {
    if (attempt < MAX_RETRIES) {
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt), MAX_DELAY);
      await sleep(delay);
      return callAdobeAPI(endpoint, payload, attempt + 1);
    }
    throw error;
  }
}
```

**Backoff Strategy**:
- **429 Too Many Requests**: Use `Retry-After` header, max 60s
- **5xx Server Errors**: Exponential backoff with jitter (1s, 2s, 4s)
- **Network Errors**: Exponential backoff (1s, 2s, 4s)

**Idempotency**:
- Use `x-request-id` header for idempotent requests
- Store operation IDs to avoid duplicate submissions

---

## Fallbacks

### Primary: Adobe PDF Services
- **Availability**: 99.9% SLA
- **Response Time**: P95 < 5 seconds

### Fallback 1: Local InDesign Export (via MCP)
- **Trigger**: Adobe API unavailable for >5 minutes
- **Use Case**: Press-ready PDFs with brand compliance
- **Limitation**: Requires human session

### Fallback 2: Cached Artifacts
- **Trigger**: Adobe API quota exceeded
- **Use Case**: Frequently generated documents (templates)
- **Cache TTL**: 24 hours
- **Cache Key**: `sha256(template_id + data_hash)`

**Fallback Decision Tree**:
```
Adobe API Call Fails
  ↓
Is it 401/403? → Refresh token → Retry
  ↓
Is it 429? → Check quota → Wait or fallback
  ↓
Is it 5xx? → Retry 3x with backoff
  ↓
Still failing? → Check MCP availability
  ↓
MCP available? → Use local InDesign export
  ↓
MCP unavailable? → Serve cached artifact or fail gracefully
```

---

## PII and Data Flow

**Data Sent to Adobe**:
- Document templates (DOCX, PPTX)
- Merge data (JSON with metrics, names, descriptions)
- Generated PDFs (temporary storage on Adobe S3)

**PII in Documents**:
- Organization names (TEEI, partner names)
- Program descriptions (non-sensitive)
- Metrics (aggregated, anonymized)

**NO PII Sent**:
- Individual student names
- Email addresses
- Phone numbers
- Addresses

**Data Storage**:
- **Adobe temporary storage**: 24 hours
- **Our R2 storage**: 90 days (production), 30 days (staging)

**Data Retention**:
- PDF exports: 90 days
- API request logs: 90 days (sanitized, no content)
- Cost telemetry: 1 year

**Compliance**:
- GDPR compliant (Adobe is data processor)
- FERPA compliant (no student records)
- CCPA compliant (no personal information)

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05):
- Document Generation: $0.10/transaction
- Extract: $0.05/transaction
- Auto-Tag: $0.15/transaction

**Cost Per Document** (typical TEEI partnership PDF):
- Document Generation: $0.10
- Auto-Tag: $0.15
- **Total**: $0.25/document

**Monthly Budget**:
- Max 100 documents/month = $25/month
- With Extract (optional): $30/month

**Cost Control**:
```javascript
const MAX_COST_PER_DOC = 0.50; // $0.50
const MONTHLY_CAP = 100.00; // $100

async function checkBudget() {
  const monthlySpend = await getMonthlySpend('adobe');
  if (monthlySpend >= MONTHLY_CAP) {
    throw new Error('Monthly budget cap exceeded');
  }
}
```

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "adobe_pdf_services",
  "operation": "document_generation",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "latency_ms": 3420,
  "status_code": 202,
  "cost_usd": 0.10,
  "bytes_in": 125000,
  "bytes_out": 2450000,
  "pages": 12
}
```

---

## Error Handling

**Common Errors**:

| Error | Status | Cause | Resolution |
|-------|--------|-------|------------|
| Invalid credentials | 401 | Token expired | Regenerate JWT token |
| Quota exceeded | 403 | Monthly limit reached | Upgrade plan or wait |
| Rate limit | 429 | Too many requests | Backoff and retry |
| Invalid PDF | 400 | Corrupted file | Re-generate source |
| File too large | 413 | >100 MB | Compress or split |
| Timeout | 504 | Slow processing | Retry with longer timeout |

**Monitoring**:
- Alert on 3+ consecutive failures
- Alert on monthly quota >75%
- Alert on avg latency >10 seconds

---

## Testing

**Staging Environment**:
```bash
ADOBE_CLIENT_ID=<staging_client_id>
ADOBE_BASE_URL=https://pdf-services-ue1-stage.adobe.io
```

**Test Documents**:
- `tests/fixtures/teei-template-minimal.docx` - 1 page, fast test
- `tests/fixtures/teei-partnership-full.docx` - 12 pages, realistic
- `tests/fixtures/corrupted.pdf` - Error handling test

**Integration Tests**:
```bash
npm run test:integration:adobe
```

---

## Support and Escalation

**Support Channels**:
- Developer Forum: https://community.adobe.com/
- Email: grp-pdfservices-support@adobe.com
- Slack: #adobe-api-support (TEEI workspace)

**SLA**:
- P1 (Production down): 1 hour response
- P2 (Degraded): 4 hour response
- P3 (Question): 24 hour response

**Status Page**: https://status.adobe.com/
