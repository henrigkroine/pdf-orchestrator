# Adobe Express Embed SDK Integration

**Service**: Adobe Express Embed SDK
**Version**: v4
**Base URL**: https://new.express.adobe.com/embed
**Documentation**: https://developer.adobe.com/express/embed-sdk/docs/

---

## Overview

Adobe Express Embed SDK provides in-browser design editing capabilities. Used for:
- Quick design edits (text, colors, images)
- Template customization for non-technical users
- Real-time preview of document changes
- Export to PDF, PNG, JPEG

---

## Authentication

**Model**: API Key (x-api-key header) + OAuth for user sessions
**Token Type**: Static API key for initialization, user OAuth for editing

**Header Format** (API calls):
```
x-api-key: <CLIENT_ID>
Content-Type: application/json
```

**Credentials**:
```bash
ADOBE_EXPRESS_CLIENT_ID=<stored_in_secrets_vault>
ADOBE_EXPRESS_CLIENT_SECRET=<stored_in_secrets_vault>
```

**OAuth Flow** (for user editing sessions):

1. **SDK Initialization**:
```javascript
const CCEverywhere = await import('https://sdk.cc-embed.adobe.com/v4/CCEverywhere.js');

await CCEverywhere.initialize({
  clientId: process.env.ADOBE_EXPRESS_CLIENT_ID,
  appName: 'TEEI PDF Orchestrator',
  redirectUri: 'https://pdf-orchestrator.teei.org/express/callback',
  locale: 'en_US'
});
```

2. **User Authentication** (automatic):
- SDK handles OAuth flow internally
- User signs in with Adobe ID
- Access token managed by SDK (not exposed)

---

## Initialization Flow

### 1. Load SDK

**Script Tag**:
```html
<script src="https://sdk.cc-embed.adobe.com/v4/CCEverywhere.js"></script>
```

**ES Module**:
```javascript
import CCEverywhere from 'https://sdk.cc-embed.adobe.com/v4/CCEverywhere.js';
```

### 2. Initialize SDK

**Code**:
```javascript
const initialized = await CCEverywhere.initialize({
  clientId: 'cd672e1ca9404614ab1a197e75cf9891',
  appName: 'TEEI PDF Orchestrator',
  redirectUri: 'https://pdf-orchestrator.teei.org/express/callback',
  locale: 'en_US',
  appearance: 'light'  // or 'dark'
});

if (!initialized) {
  throw new Error('Adobe Express SDK failed to initialize');
}
```

**Initialization Options**:
- `clientId` (required): Your Adobe Express API key
- `appName` (required): Display name in editor
- `redirectUri` (required): OAuth callback URL
- `locale`: Language code (default: `en_US`)
- `appearance`: UI theme (`light` or `dark`)

### 3. Create Editor Instance

**Full-Page Editor**:
```javascript
const editor = await CCEverywhere.createDesign({
  callbacks: {
    onCancel: () => {
      console.log('User cancelled editing');
      editor.close();
    },
    onPublish: (publishParams) => {
      console.log('Design published:', publishParams);
      // Download exported asset
      downloadAsset(publishParams.asset.data);
    },
    onError: (error) => {
      console.error('Editor error:', error);
    }
  },
  modalParams: {
    size: 'fullscreen'  // or 'large', 'medium'
  }
});
```

**Embedded Editor** (Iframe):
```javascript
const editor = await CCEverywhere.openQuickAction({
  id: 'image-edit',
  inputParams: {
    asset: {
      data: 'base64_or_url',
      dataType: 'base64' // or 'url'
    }
  },
  callbacks: {
    onPublish: (publishParams) => {
      // Handle exported asset
    }
  },
  modalParams: {
    size: 'large'
  }
});
```

---

## Capabilities and Actions

### Available Quick Actions

**1. Image Editing**:
```javascript
const editor = await CCEverywhere.openQuickAction({
  id: 'image-edit',
  inputParams: {
    asset: {
      data: 'https://example.com/photo.jpg',
      dataType: 'url'
    }
  },
  outputParams: {
    outputType: 'base64',  // or 'url'
    exportOptions: {
      format: 'image/jpeg',
      quality: 0.9
    }
  }
});
```

**Capabilities**:
- Crop, resize, rotate
- Filters and adjustments (brightness, contrast, saturation)
- Text overlays
- Background removal
- Effects and borders

**2. Create from Template**:
```javascript
const editor = await CCEverywhere.createDesignWithAsset({
  asset: {
    data: 'template_asset_id_or_url',
    dataType: 'url'
  },
  canvasSize: {
    width: 1920,
    height: 1080,
    unit: 'px'
  }
});
```

**3. PDF Editing** (Limited):
```javascript
// Note: PDF editing is limited - primarily image/graphics editing
const editor = await CCEverywhere.openQuickAction({
  id: 'image-edit',
  inputParams: {
    asset: {
      data: 'https://example.com/page.png',  // PDF page as PNG
      dataType: 'url'
    }
  }
});
```

**Limitation**: Cannot edit multi-page PDFs directly. Must convert pages to images first.

---

## Capability Map

### TEEI Use Cases

**Use Case 1: Quick Color Correction**:
```javascript
// User uploads photo, needs TEEI brand color grading
const editor = await CCEverywhere.openQuickAction({
  id: 'image-edit',
  inputParams: {
    asset: { data: uploadedPhotoUrl, dataType: 'url' }
  },
  callbacks: {
    onPublish: async (result) => {
      const editedImage = result.asset.data;
      // Apply TEEI color overlay (Nordshore tint)
      const brandAligned = await applyBrandOverlay(editedImage);
      saveToR2(brandAligned, 'assets/photos/edited/');
    }
  }
});
```

**Use Case 2: Text Overlay for Call-to-Action**:
```javascript
// Add CTA text to hero image
const editor = await CCEverywhere.createDesign({
  callbacks: {
    onPublish: (result) => {
      // User added text overlay in TEEI brand font
      downloadAsset(result.asset.data);
    }
  }
});

// Note: Font must be available in Adobe Express library
// TEEI fonts (Lora, Roboto Flex) may need to be uploaded to Adobe Fonts
```

**Use Case 3: Template Customization**:
```javascript
// Partner wants to customize partnership document header
const editor = await CCEverywhere.createDesignWithAsset({
  asset: {
    data: 'https://r2.teei.org/templates/partnership-header.png',
    dataType: 'url'
  },
  callbacks: {
    onPublish: (result) => {
      // User customized header with their logo
      replaceHeaderInInDesign(result.asset.data);
    }
  }
});
```

---

## Allowed Domains

**Domain Whitelisting** (Required in Adobe Developer Console):
- Production: `theeducationalequalityinstitute.org`
- Staging: `pdf-orchestrator-staging.pages.dev`
- Local: `localhost` (port 3000, 3001)

**CORS Configuration**:
```
Access-Control-Allow-Origin: https://new.express.adobe.com
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, x-api-key
```

**Redirect URIs** (OAuth):
- Production: `https://pdf-orchestrator.teei.org/express/callback`
- Staging: `https://pdf-orchestrator-staging.pages.dev/express/callback`
- Local: `http://localhost:3000/express/callback`

---

## Integration Points

### Embedded Iframe

**HTML Container**:
```html
<div id="adobe-express-editor" style="width: 100%; height: 800px;"></div>
```

**Mount Editor**:
```javascript
const editor = await CCEverywhere.openQuickAction({
  id: 'image-edit',
  inputParams: { /* ... */ },
  modalParams: {
    container: document.getElementById('adobe-express-editor'),
    size: 'fullscreen'
  }
});
```

**Lifecycle**:
```javascript
// Editor is active
editor.isOpen(); // true

// Close editor programmatically
editor.close();

// Check if editor is closed
editor.isOpen(); // false
```

### Full-Page Modal

**Launch Modal**:
```javascript
const editor = await CCEverywhere.createDesign({
  modalParams: {
    size: 'fullscreen',  // Covers entire viewport
    zIndex: 9999
  }
});
```

**User closes via**:
- Cancel button (triggers `onCancel` callback)
- Publish button (triggers `onPublish` callback)
- Escape key (triggers `onCancel`)

---

## Export Formats

### Supported Formats

**Image Formats**:
- `image/jpeg` (quality: 0.1-1.0)
- `image/png` (lossless)
- `image/webp` (quality: 0.1-1.0)

**Document Formats**:
- `application/pdf` (single page)

**Vector Formats**:
- Not supported (no SVG export)

### Export Configuration

**High-Quality JPEG** (web):
```javascript
outputParams: {
  outputType: 'url',
  exportOptions: {
    format: 'image/jpeg',
    quality: 0.95,
    width: 2400,
    height: 1600,
    dpi: 150
  }
}
```

**PNG** (print):
```javascript
outputParams: {
  outputType: 'url',
  exportOptions: {
    format: 'image/png',
    width: 3600,
    height: 2400,
    dpi: 300
  }
}
```

**PDF** (single page):
```javascript
outputParams: {
  outputType: 'url',
  exportOptions: {
    format: 'application/pdf',
    width: 8.5,   // inches
    height: 11,   // inches (US Letter)
    unit: 'in'
  }
}
```

**Limitations**:
- Max export size: 8000×8000 px
- PDF export: Single page only (no multi-page)
- DPI metadata: Not always preserved (validate after export)

---

## Quotas and Rate Limits

**API Rate Limits** (per client ID):
- **SDK Initialization**: No limit (client-side)
- **Editor Sessions**: 100 concurrent sessions per client ID
- **Export/Publish**: No explicit limit (tied to user session)

**Not Publicly Documented**:
- Assume 60 requests/minute for API calls
- Monitor `X-RateLimit-*` headers if available

**Usage Limits** (based on Creative Cloud plan):
- **Free Tier**: 25 editor sessions/month
- **Creative Cloud Individual**: Unlimited sessions
- **Creative Cloud Teams**: Unlimited sessions + collaboration

**File Size Limits**:
- Input asset: 100 MB max
- Output asset: 50 MB max (JPEG/PNG), 100 MB (PDF)

---

## Retries and Backoff

**Retry Strategy**:
```javascript
const MAX_RETRIES = 2; // Lower than other APIs (user sessions are time-sensitive)
const BASE_DELAY = 1000; // 1 second

async function launchEditor(config, attempt = 1) {
  try {
    const editor = await CCEverywhere.openQuickAction(config);
    return editor;
  } catch (error) {
    if (error.code === 'AUTH_FAILED') {
      // User cancelled authentication - don't retry
      throw error;
    }

    if (error.code === 'INIT_FAILED' && attempt < MAX_RETRIES) {
      // SDK initialization failed - retry
      console.warn(`Editor init failed (attempt ${attempt}), retrying...`);
      await sleep(BASE_DELAY * attempt);
      return launchEditor(config, attempt + 1);
    }

    if (error.code === 'NETWORK_ERROR' && attempt < MAX_RETRIES) {
      // Network issue - retry
      await sleep(BASE_DELAY * Math.pow(2, attempt - 1));
      return launchEditor(config, attempt + 1);
    }

    throw error;
  }
}
```

**Error Codes**:
- `INIT_FAILED`: SDK initialization failed
- `AUTH_FAILED`: User authentication failed
- `NETWORK_ERROR`: Network connectivity issue
- `ASSET_LOAD_FAILED`: Input asset failed to load
- `EXPORT_FAILED`: Export/publish operation failed

**User Session Handling**:
- No retries for user-cancelled operations (`onCancel`)
- Retry on transient network errors only
- Timeout user sessions after 30 minutes of inactivity

---

## Fallbacks

### Primary: Adobe Express Embed SDK
- **Availability**: 99.9% SLA (same as Creative Cloud)
- **Response Time**: Instant (client-side SDK)

### Fallback 1: Local InDesign via MCP
- **Trigger**: SDK initialization fails or user authentication fails
- **Use Case**: Brand-critical edits (exact font/color control)
- **Limitation**: Requires local InDesign instance, slower

### Fallback 2: Lightroom Services API
- **Trigger**: Image editing only (not text/layout)
- **Use Case**: Photo color grading, batch processing
- **Limitation**: No user interface (automated only)

### Fallback 3: Manual Editing (No Code)
- **Trigger**: All automated options fail
- **Use Case**: High-priority documents requiring human touch
- **Process**: Download template → Edit in InDesign/Photoshop → Re-upload

**Fallback Decision Tree**:
```
Adobe Express SDK Fails
  ↓
Is it AUTH_FAILED? → User cancelled → Show login prompt again
  ↓
Is it INIT_FAILED? → Retry 2x → Still failing?
  ↓
Is it image editing only? → Use Lightroom Services API
  ↓
Is it text/layout editing? → Use local InDesign via MCP
  ↓
Critical document? → Alert team for manual editing
```

---

## PII and Data Flow

**Data Sent to Adobe**:
- Input assets (images, PDFs as images)
- User edits (text, overlays, filters)
- Export requests

**PII in Assets**:
- Organization names (TEEI, partner names - public info)
- May contain faces (program photos)
- No personally identifiable student data

**NO PII Sent**:
- Individual names (students, staff)
- Email addresses
- Phone numbers
- Student records

**Data Storage**:
- **Adobe**: User projects stored in Creative Cloud (if user saves)
- **Our R2 storage**: Exported assets for 90 days

**Data Retention**:
- Adobe temporary assets: 24 hours (then deleted if not saved by user)
- User-saved projects: Indefinite (Creative Cloud storage)
- Our exported assets: 90 days on R2

**Compliance**:
- GDPR compliant (Adobe is data processor)
- User consent required for Creative Cloud storage
- No student records (FERPA compliant)

---

## Cost Tracking

**Pricing Model** (as of 2025-11-05):
- **SDK Usage**: Included in Creative Cloud plan
- **API Calls**: Free (no per-request cost)
- **Storage**: User's Creative Cloud quota (not our cost)

**Creative Cloud Plan Required**:
- **Teams Plan**: $54.99/user/month (includes Adobe Express)
- **Individual Plan**: $54.99/month (includes Adobe Express)

**Cost Per Document** (typical TEEI partnership PDF):
- Editor session: $0 (included in plan)
- Export: $0
- **Total**: $0 (fixed monthly cost)

**Monthly Budget**:
- Creative Cloud Teams (3 users): $164.97/month (fixed)
- No variable costs per document

**Cost Control**:
```javascript
// No per-request cost tracking needed
// Monitor concurrent sessions to stay within 100 limit
async function checkEditorSessions() {
  const activeSessions = await getActiveEditorSessions();
  if (activeSessions >= 100) {
    throw new Error('Max concurrent editor sessions reached (100)');
  }
}
```

**Telemetry Schema**:
```json
{
  "timestamp": "2025-11-05T10:30:00Z",
  "service": "adobe_express_embed",
  "operation": "editor_session",
  "doc_slug": "teei-aws-partnership-v2",
  "run_id": "uuid-1234",
  "editor_action": "image-edit",
  "input_asset_url": "https://r2.teei.org/assets/hero.jpg",
  "input_asset_size_bytes": 2400000,
  "session_duration_ms": 120000,
  "user_cancelled": false,
  "output_format": "image/jpeg",
  "output_asset_size_bytes": 1800000,
  "latency_ms": 120000,
  "status": "published",
  "cost_usd": 0.00
}
```

---

## Error Handling

**Common Errors**:

| Error | Code | Cause | Resolution |
|-------|------|-------|------------|
| Init failed | INIT_FAILED | SDK load error | Check network, retry |
| Auth failed | AUTH_FAILED | User cancelled login | Prompt user to log in |
| Asset load failed | ASSET_LOAD_FAILED | Invalid URL or format | Verify asset URL and format |
| Export failed | EXPORT_FAILED | Invalid export config | Check export options |
| Session timeout | TIMEOUT | User idle >30 min | Re-launch editor |
| Domain not allowed | DOMAIN_ERROR | Domain not whitelisted | Add domain in Adobe Console |

**User-Facing Errors**:
```javascript
const editor = await CCEverywhere.openQuickAction({
  id: 'image-edit',
  inputParams: { /* ... */ },
  callbacks: {
    onError: (error) => {
      switch (error.code) {
        case 'AUTH_FAILED':
          showToast('Please log in to Adobe to continue', 'error');
          break;
        case 'ASSET_LOAD_FAILED':
          showToast('Failed to load image. Please try a different file.', 'error');
          break;
        case 'EXPORT_FAILED':
          showToast('Export failed. Please try again.', 'error');
          break;
        default:
          showToast('An unexpected error occurred.', 'error');
          logError(error);
      }
    }
  }
});
```

**Monitoring**:
- Alert on >5 INIT_FAILED errors per hour
- Alert on >10% AUTH_FAILED rate (may indicate OAuth misconfiguration)
- Alert on DOMAIN_ERROR (critical - blocks all sessions)

---

## Testing

**Staging Environment**:
```bash
ADOBE_EXPRESS_CLIENT_ID=<staging_client_id>
ADOBE_EXPRESS_REDIRECT_URI=https://pdf-orchestrator-staging.pages.dev/express/callback
```

**Test Scenarios**:
1. SDK initialization (success)
2. User authentication (success and cancel)
3. Image editing (upload, edit, export)
4. Export formats (JPEG, PNG, PDF)
5. Session timeout handling
6. Domain whitelisting validation

**Integration Tests**:
```bash
npm run test:integration:express
```

**Manual Testing**:
```bash
# Launch local dev server (must match redirect URI)
npm run dev -- --port 3000

# Open test page
open http://localhost:3000/test/express-editor
```

---

## Support and Escalation

**Support Channels**:
- Developer Forum: https://community.adobe.com/
- Email: grp-express-api-support@adobe.com
- Slack: #adobe-express-api (if available)

**SLA** (Teams Plan):
- P1 (Production down): 2 hour response
- P2 (Degraded): 8 hour response
- P3 (Question): 24 hour response

**Status Page**: https://status.adobe.com/

**Escalation**:
- Domain whitelisting issues: Update in Adobe Developer Console
- OAuth issues: Check redirect URIs match exactly
- SDK bugs: Report via developer forum or email support
