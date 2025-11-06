# InDesign MCP - Production Hardening Roadmap

## Status: Moving from Prototype → Production-Grade Enterprise System

**Current State**: 61 commands, working prototype, amazing features
**Target State**: Enterprise-ready with contracts, validation, monitoring, security, ops tooling

---

## Phase 1: Foundation & Safety (Priority 1 - CRITICAL)

### 1.1 Contracts and Type Safety
- [ ] Create `schemas/` directory with JSON Schema for every command
- [ ] Version schemas (v1.0.0)
- [ ] Add enum validation for all options
- [ ] Add range validation (e.g., opacity 0-100)
- [ ] Reject unknown fields at MCP boundary
- [ ] Generate TypeScript types from schemas

**Files to Create**:
```
T:/Projects/pdf-orchestrator/schemas/
├── v1/
│   ├── createDocument.schema.json
│   ├── createTextOnPath.schema.json
│   ├── createStrokeGradient.schema.json
│   └── ... (61 schemas total)
└── schema-registry.json
```

### 1.2 Error Model - Uniform Responses
- [ ] Define standard error format: `{ok: false, error: {code, msg, details}}`
- [ ] Implement error codes:
  - `STYLE_NOT_FOUND`
  - `LINK_MISSING`
  - `PAGE_OUT_OF_RANGE`
  - `EXPORT_FAILED`
  - `TIMEOUT`
  - `TRANSPORT_DOWN`
  - `PERMISSION_DENIED`
  - `VALIDATION_ERROR`
  - `DOCUMENT_LOCKED`
  - `FONT_MISSING`
- [ ] Update all command handlers to use uniform errors
- [ ] Add error details (e.g., which style not found)

**Implementation**:
```javascript
// In index.js
class InDesignError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
    }
}

const handleCommandError = (error) => {
    if (error instanceof InDesignError) {
        return {
            ok: false,
            error: {
                code: error.code,
                msg: error.message,
                details: error.details
            }
        };
    }
    // Unknown error
    return {
        ok: false,
        error: {
            code: 'UNKNOWN_ERROR',
            msg: error.message || String(error),
            details: {}
        }
    };
};
```

### 1.3 State and Locking
- [ ] Per-document mutex (prevent concurrent edits)
- [ ] Queue for concurrent operations on same document
- [ ] No overlapping exports or edits
- [ ] Add `documentLocks` map in proxy server
- [ ] Add timeout for lock acquisition

**Implementation in adb-proxy-socket/server.js**:
```javascript
const documentLocks = new Map(); // docId -> {locked: boolean, queue: []}

async function acquireLock(docId, timeout = 30000) {
    const startTime = Date.now();

    while (documentLocks.get(docId)?.locked) {
        if (Date.now() - startTime > timeout) {
            throw new Error('DOCUMENT_LOCKED: Timeout acquiring document lock');
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    documentLocks.set(docId, {locked: true, queue: []});
}

function releaseLock(docId) {
    documentLocks.set(docId, {locked: false, queue: []});
}
```

### 1.4 Security Hardening
- [ ] Deny raw JSX execution (only allow whitelisted commands)
- [ ] Deny shell commands
- [ ] Path allow-list for assets and outputs
- [ ] Secrets only via env or Windows Credential Manager
- [ ] No keys in JSON
- [ ] Input sanitization (prevent path traversal)

**Path Allow-List**:
```javascript
const ALLOWED_PATHS = [
    'T:/Projects/pdf-orchestrator/exports/',
    'T:/Projects/pdf-orchestrator/assets/',
    'T:/Projects/pdf-orchestrator/templates/'
];

function validatePath(path) {
    const normalized = path.resolve(path);
    if (!ALLOWED_PATHS.some(allowed => normalized.startsWith(allowed))) {
        throw new InDesignError('PERMISSION_DENIED', 'Path not in allow-list');
    }
    return normalized;
}
```

---

## Phase 2: Reliability & Observability (Priority 1 - CRITICAL)

### 2.1 Idempotency and Retries
- [ ] Add optional `requestId` to all commands
- [ ] Server-side de-duplication (cache recent requestIds)
- [ ] Exponential backoff with caps (1s, 2s, 4s, 8s, max 30s)
- [ ] No duplicate exports for same requestId
- [ ] Track operation state (pending, success, failed)

**Implementation**:
```javascript
const requestCache = new Map(); // requestId -> {status, result, timestamp}
const CACHE_TTL = 300000; // 5 minutes

function checkIdempotency(requestId) {
    if (!requestId) return null;

    const cached = requestCache.get(requestId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result; // Return cached result
    }
    return null;
}
```

### 2.2 Timeouts
- [ ] Tool-level timeouts with sane defaults
- [ ] Kill hung jobs after timeout
- [ ] Return partial logs on timeout
- [ ] Configurable per-command timeouts

**Default Timeouts**:
```javascript
const COMMAND_TIMEOUTS = {
    'createDocument': 10000,      // 10s
    'exportPDF': 60000,           // 60s
    'placeImage': 30000,          // 30s
    'createTextOnPath': 5000,     // 5s
    'default': 30000              // 30s
};
```

### 2.3 Logging and Audit
- [ ] Structured JSON logs with fields:
  - `ts` (timestamp)
  - `tool` (command name)
  - `argsHash` (SHA256 of args, for privacy)
  - `durationMs`
  - `ok` (boolean)
  - `errorCode` (if failed)
- [ ] Rotating log files (max 100MB, keep 10 files)
- [ ] Redact paths and text content by rule
- [ ] Separate audit log for security events

**Log Format**:
```json
{
    "ts": "2025-01-15T10:30:45.123Z",
    "tool": "createTextOnPath",
    "argsHash": "a3f5d8c2...",
    "durationMs": 234,
    "ok": true,
    "errorCode": null,
    "userId": "henrik@teei",
    "documentId": "doc-12345"
}
```

**Implementation**:
```javascript
const winston = require('winston');
const crypto = require('crypto');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: 'logs/indesign-mcp-audit.log',
            maxsize: 100 * 1024 * 1024, // 100MB
            maxFiles: 10
        })
    ]
});

function hashArgs(args) {
    return crypto.createHash('sha256').update(JSON.stringify(args)).digest('hex').substring(0, 16);
}

function logCommand(tool, args, durationMs, ok, errorCode = null) {
    logger.info({
        ts: new Date().toISOString(),
        tool,
        argsHash: hashArgs(args),
        durationMs,
        ok,
        errorCode
    });
}
```

### 2.4 Health and Readiness Endpoints
- [ ] `/health` endpoint for proxy
- [ ] `/ready` endpoint for proxy
- [ ] Include metrics:
  - Tool count
  - InDesign attached (boolean)
  - Queue depth
  - Last successful command timestamp
  - Error rate (last 100 commands)

**Implementation in adb-proxy-socket/server.js**:
```javascript
const express = require('express');
const healthApp = express();

let healthMetrics = {
    toolCount: 61,
    indesignAttached: false,
    queueDepth: 0,
    lastSuccessTimestamp: null,
    errorRate: 0,
    uptime: Date.now()
};

healthApp.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        ...healthMetrics
    });
});

healthApp.get('/ready', (req, res) => {
    if (healthMetrics.indesignAttached) {
        res.status(200).json({ready: true});
    } else {
        res.status(503).json({ready: false, reason: 'InDesign not connected'});
    }
});

healthApp.listen(8014, () => {
    console.log('Health endpoints on http://localhost:8014');
});
```

---

## Phase 3: Advanced Features (Priority 2)

### 3.1 Packaging and Fonts
- [ ] Implement `packageDocument` command
- [ ] Copy all fonts to package directory
- [ ] Copy all linked images/assets
- [ ] Embed ICC color profiles
- [ ] Record used fonts in manifest
- [ ] Validate font licenses

**Command Signature**:
```javascript
const packageDocument = async (command) => {
    const options = command.options;
    const document = app.activeDocument;

    // Create package directory
    const packageDir = options.outputPath;

    // Collect fonts
    const usedFonts = document.fonts.everyItem().getElements();

    // Collect links
    const links = document.links.everyItem().getElements();

    // Package for print
    document.packageForPrint(packageDir, {
        copyFonts: true,
        copyLinkedGraphics: true,
        updateGraphics: true,
        includeHiddenLayers: false,
        ignorePreflightErrors: false
    });

    // Create manifest
    const manifest = {
        documentName: document.name,
        fonts: usedFonts.map(f => ({name: f.name, family: f.fontFamily})),
        links: links.map(l => ({name: l.name, path: l.filePath})),
        packagedAt: new Date().toISOString()
    };

    return {
        ok: true,
        packagePath: packageDir,
        manifest
    };
};
```

### 3.2 Export Presets
- [ ] Ship standard presets in `presets/` directory
- [ ] Validate preset exists before export
- [ ] Document each preset's use case
- [ ] Pin preset names (no user modification)

**Presets to Include**:
```
presets/
├── HighQualityPrint.joboptions
├── PressQuality.joboptions
├── PDFX4_2010.joboptions
├── Digital_Publishing.joboptions
└── Web_Interactive.joboptions
```

### 3.3 Accessibility Tools
- [ ] `setReadingOrder` - Define reading order for screen readers
- [ ] `setAltText` - Add alt text to images
- [ ] `setDocumentLanguage` - Set primary language
- [ ] `addBookmarks` - Create PDF bookmarks
- [ ] `tagPDF` - Add structure tags
- [ ] Pre-export accessibility check

**Commands**:
```javascript
const setAltText = async (command) => {
    const {objectId, altText} = command.options;
    const object = app.activeDocument.pageItems.itemByID(objectId);
    object.objectExportOptions.altTextSourceType = "SOURCE_CUSTOM";
    object.objectExportOptions.customAltText = altText;
    return {ok: true};
};

const setDocumentLanguage = async (command) => {
    const {language} = command.options; // e.g., "en-US"
    app.activeDocument.languageWithVendors.item(0).appliedLanguage = language;
    return {ok: true};
};
```

### 3.4 Preflight
- [ ] `preflightRun` command
- [ ] Load named preflight profiles
- [ ] Return errors and warnings
- [ ] Block export if fatal errors
- [ ] Include violation details

**Implementation**:
```javascript
const preflightRun = async (command) => {
    const {profileName} = command.options;
    const document = app.activeDocument;

    // Load profile
    const profile = app.preflightProfiles.itemByName(profileName);
    if (!profile.isValid) {
        throw new InDesignError('PREFLIGHT_PROFILE_NOT_FOUND', `Profile ${profileName} not found`);
    }

    // Run preflight
    const process = app.preflightProcesses.add(document, profile);
    process.waitForProcess(60); // Wait up to 60 seconds

    const errors = process.aggregatedResults.filter(r => r.severity === 'ERROR');
    const warnings = process.aggregatedResults.filter(r => r.severity === 'WARNING');

    return {
        ok: errors.length === 0,
        errors: errors.map(e => ({
            rule: e.ruleName,
            description: e.description,
            pageNumber: e.pageNumber
        })),
        warnings: warnings.map(w => ({
            rule: w.ruleName,
            description: w.description
        })),
        hasFatalErrors: errors.length > 0
    };
};
```

### 3.5 Templates
- [ ] Create `templates/` repository
- [ ] Version tag templates (v1.0.0, v2.0.0)
- [ ] `loadTemplate` by name and version
- [ ] Validate required styles exist
- [ ] Template metadata manifest

**Template Structure**:
```
templates/
├── teei-brief/
│   ├── v1.0.0/
│   │   ├── template.indt
│   │   ├── manifest.json
│   │   └── preview.png
│   └── v2.0.0/
│       ├── template.indt
│       ├── manifest.json
│       └── preview.png
└── registry.json
```

**manifest.json**:
```json
{
    "name": "teei-brief",
    "version": "1.0.0",
    "description": "TEEI Partnership Brief Template",
    "requiredStyles": [
        "Hero Title",
        "Section Header",
        "Body Pro"
    ],
    "dimensions": {
        "width": 595,
        "height": 842,
        "units": "pt"
    },
    "createdAt": "2025-01-15",
    "author": "Henrik Røine"
}
```

---

## Phase 4: Internationalization & Data (Priority 3)

### 4.1 International Text
- [ ] UTF-8 throughout (already done in Python)
- [ ] RTL (right-to-left) flag for Arabic/Hebrew
- [ ] CJK (Chinese/Japanese/Korean) flag
- [ ] Fallback fonts map
- [ ] Error if glyph not found

**Implementation**:
```javascript
const createTextFrameInternational = async (command) => {
    const options = command.options;
    const textFrame = page.textFrames.add({...});

    // RTL support
    if (options.rtl) {
        textFrame.texts.item(0).composer = "ADOBE_WORLD_READY_PARAGRAPH_COMPOSER";
        textFrame.texts.item(0).paragraphs.item(0).justification = "RIGHT_ALIGN";
    }

    // CJK support
    if (options.cjk) {
        textFrame.texts.item(0).composer = "ADOBE_CJK_COMPOSER";
    }

    // Fallback fonts
    if (options.fallbackFont) {
        textFrame.texts.item(0).appliedFont = options.fallbackFont;
    }

    // Check for missing glyphs
    const missingGlyphs = textFrame.texts.item(0).glyphs.everyItem().getElements()
        .filter(g => !g.isValid);

    if (missingGlyphs.length > 0) {
        throw new InDesignError('GLYPH_NOT_FOUND',
            `${missingGlyphs.length} glyphs not found in font`);
    }

    return {ok: true, id: textFrame.id};
};
```

### 4.2 Charts and Tables
- [ ] `tableFromCSV` - Import CSV as InDesign table
- [ ] `placeSVGChart` - Place SVG charts
- [ ] Size rules and style hooks
- [ ] Cell formatting options

**tableFromCSV**:
```javascript
const tableFromCSV = async (command) => {
    const {page, x, y, csvPath, styleOptions} = command.options;

    // Read CSV
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const rows = csvContent.split('\n').map(line => line.split(','));

    // Create table
    const pageObj = getPageByNumber(page);
    const table = pageObj.textFrames.add().tables.add({
        bodyRowCount: rows.length - 1,
        columnCount: rows[0].length,
        headerRowCount: 1
    });

    // Populate data
    rows.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            table.cells.item(rowIndex * rows[0].length + colIndex).contents = cell;
        });
    });

    // Apply styles
    if (styleOptions?.headerStyle) {
        table.rows.item(0).cells.everyItem().appliedParagraphStyle = styleOptions.headerStyle;
    }

    return {ok: true, tableId: table.id};
};
```

---

## Phase 5: Operations & Deployment (Priority 2)

### 5.1 Cleanup and Temp Files
- [ ] Scratch directory per job (`temp/{requestId}/`)
- [ ] Auto-delete on success
- [ ] Preserve on failure with pointer in error
- [ ] Periodic cleanup of old temp dirs (>24h)

**Implementation**:
```javascript
const cleanupManager = {
    scratchDir: 'T:/Projects/pdf-orchestrator/temp/',

    createJobDir(requestId) {
        const jobDir = path.join(this.scratchDir, requestId);
        fs.mkdirSync(jobDir, {recursive: true});
        return jobDir;
    },

    cleanupSuccess(requestId) {
        const jobDir = path.join(this.scratchDir, requestId);
        fs.rmSync(jobDir, {recursive: true, force: true});
    },

    cleanupFailure(requestId, error) {
        // Keep directory, create error.json
        const jobDir = path.join(this.scratchDir, requestId);
        fs.writeFileSync(
            path.join(jobDir, 'error.json'),
            JSON.stringify(error, null, 2)
        );
    },

    periodicCleanup() {
        // Run every hour
        setInterval(() => {
            const now = Date.now();
            const dirs = fs.readdirSync(this.scratchDir);

            dirs.forEach(dir => {
                const dirPath = path.join(this.scratchDir, dir);
                const stats = fs.statSync(dirPath);

                // Delete if older than 24 hours
                if (now - stats.mtimeMs > 24 * 60 * 60 * 1000) {
                    fs.rmSync(dirPath, {recursive: true, force: true});
                }
            });
        }, 60 * 60 * 1000); // 1 hour
    }
};
```

### 5.2 Install and Pinning
- [ ] Create `requirements.txt` for Python
- [ ] Create `package-lock.json` for Node.js
- [ ] Document version matrix:
  - Node.js 18.x or 20.x
  - Python 3.10+
  - InDesign 2024 (v19.x) or 2025 (v20.x)
- [ ] Known-good version set documented

**requirements.txt**:
```
fastmcp==0.2.0
python-socketio==5.11.0
requests==2.31.0
```

**Known-Good Matrix**:
```markdown
| Component | Version | Status |
|-----------|---------|--------|
| Node.js | 20.11.0 | ✅ Tested |
| Python | 3.11.7 | ✅ Tested |
| InDesign | 2024 (19.5) | ✅ Tested |
| InDesign | 2025 (20.0) | ✅ Tested |
| Socket.IO | 4.6.1 | ✅ Tested |
```

### 5.3 Windows Service (NSSM)
- [ ] Create Windows service for proxy
- [ ] Auto-restart on crash
- [ ] Backoff on crash (1s, 5s, 15s, 60s)
- [ ] Service runs as Local System
- [ ] Start on boot

**NSSM Installation**:
```powershell
# Install NSSM
choco install nssm

# Create service
nssm install InDesignMCPProxy "C:\Program Files\nodejs\node.exe" "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket\server.js"

# Configure
nssm set InDesignMCPProxy AppDirectory "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
nssm set InDesignMCPProxy AppStdout "T:\Projects\pdf-orchestrator\logs\proxy-stdout.log"
nssm set InDesignMCPProxy AppStderr "T:\Projects\pdf-orchestrator\logs\proxy-stderr.log"
nssm set InDesignMCPProxy AppRotateFiles 1
nssm set InDesignMCPProxy AppRotateBytes 10485760  # 10MB

# Start service
nssm start InDesignMCPProxy
```

### 5.4 CI Tests
- [ ] Unit tests for tool handlers (Jest)
- [ ] Integration tests (connect to real InDesign)
- [ ] Golden PDF hashes for smoke tests
- [ ] Pre-commit hooks (linting, tests)

**Test Structure**:
```
tests/
├── unit/
│   ├── createTextOnPath.test.js
│   ├── createStrokeGradient.test.js
│   └── validation.test.js
├── integration/
│   ├── full-workflow.test.js
│   └── error-handling.test.js
└── golden/
    ├── teei-brief-v1.pdf.sha256
    └── metric-boxes.pdf.sha256
```

### 5.5 Monitoring
- [ ] Basic metrics collection:
  - Operations count (by command)
  - Failures by error code
  - P95 duration (95th percentile)
  - Queue depth over time
- [ ] Emit to file or localhost endpoint
- [ ] Optional Prometheus exporter

**Metrics Endpoint**:
```javascript
const metrics = {
    opsCount: {},      // {createDocument: 145, exportPDF: 67, ...}
    failures: {},      // {TIMEOUT: 5, STYLE_NOT_FOUND: 2, ...}
    durations: [],     // [234, 456, 123, ...] (keep last 1000)
    queueDepth: 0
};

healthApp.get('/metrics', (req, res) => {
    const p95 = calculateP95(metrics.durations);

    res.json({
        operations: metrics.opsCount,
        failures: metrics.failures,
        p95Duration: p95,
        queueDepth: metrics.queueDepth
    });
});

function calculateP95(durations) {
    if (durations.length === 0) return 0;
    const sorted = [...durations].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
}
```

---

## Phase 6: Documentation & Runbooks (Priority 3)

### 6.1 Runbooks
- [ ] **Cold Start**: How to start system from scratch
- [ ] **Rotate Logs**: Log rotation procedure
- [ ] **Clear Stuck Jobs**: Kill hung operations
- [ ] **Font Missing**: What to do when fonts not found
- [ ] **Export Hangs**: Procedure for hung exports
- [ ] **Disaster Recovery**: Restore from backup

**Example Runbook** (`runbooks/export-hangs.md`):
```markdown
# Runbook: Export Hangs

## Symptoms
- exportPDF command doesn't return after 60s
- InDesign UI frozen
- Proxy server shows pending operation

## Diagnosis
1. Check health endpoint: `curl http://localhost:8014/health`
2. Check InDesign responsiveness
3. Check logs: `tail -f logs/indesign-mcp-audit.log`

## Resolution
1. Kill InDesign process: `taskkill /F /IM InDesign.exe`
2. Restart InDesign
3. Reload UXP plugin
4. Retry operation with higher timeout
5. If persists, check document for corruption

## Prevention
- Increase exportPDF timeout to 120s
- Run preflight before export
- Simplify document (reduce effects)
```

### 6.2 API Versioning
- [ ] Semantic versioning (v1.0.0, v1.1.0, v2.0.0)
- [ ] Version in MCP server metadata
- [ ] Claude prompts fixed to version
- [ ] Change log tracking breaking changes

**Version Strategy**:
- **Major** (v2.0.0): Breaking changes (remove commands, change signatures)
- **Minor** (v1.1.0): New features (add commands)
- **Patch** (v1.0.1): Bug fixes, performance improvements

### 6.3 Licensing and Compliance
- [ ] Font license note in docs
- [ ] Asset attribution tracking
- [ ] Record export intent in logs
- [ ] Color profile compliance (ICC)
- [ ] GDPR considerations (PII in documents)

---

## Implementation Priority Matrix

| Phase | Component | Priority | Effort | Impact |
|-------|-----------|----------|--------|--------|
| 1.2 | Error Model | P0 | Medium | High |
| 1.3 | State Locking | P0 | Medium | High |
| 1.4 | Security | P0 | High | Critical |
| 2.2 | Timeouts | P0 | Low | High |
| 2.3 | Logging | P0 | Medium | High |
| 2.4 | Health Endpoints | P0 | Low | Medium |
| 1.1 | JSON Schemas | P1 | High | Medium |
| 2.1 | Idempotency | P1 | Medium | Medium |
| 5.3 | Windows Service | P1 | Low | High |
| 3.1 | Package Tool | P2 | Medium | Medium |
| 3.3 | Accessibility | P2 | High | Low |
| 3.4 | Preflight | P2 | Medium | Medium |
| 4.2 | Tables/Charts | P2 | High | Medium |
| 5.4 | CI Tests | P2 | High | High |
| 3.5 | Templates | P3 | Medium | Low |
| 4.1 | i18n Support | P3 | High | Low |

---

## Quick Wins (Implement First)

1. **Health Endpoints** (2 hours) - `/health` and `/ready`
2. **Timeouts** (2 hours) - Per-command timeouts
3. **Uniform Errors** (4 hours) - Standard error format
4. **Basic Logging** (3 hours) - Structured JSON logs
5. **Security - Path Validation** (2 hours) - Allow-list paths

**Total Quick Wins**: ~13 hours of work for massive stability improvement

---

## Next Steps

1. Start with **Quick Wins**
2. Implement **Phase 1** (Foundation & Safety)
3. Add **CI Tests** early
4. Roll out **Windows Service**
5. Incrementally add Phase 3-4 features

---

*Roadmap Created*: 2025-01-XX
*Target Production Date*: TBD
*Maintainer*: Henrik Røine
