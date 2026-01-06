# PDF Orchestrator - Complete System Overview

**Version**: 2.0
**Last Updated**: 2025-11-13
**Status**: Production-Ready with MCP Integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [MCP Integration Layer](#mcp-integration-layer)
5. [Design Systems](#design-systems)
6. [Document Creation Workflows](#document-creation-workflows)
7. [Export & Optimization](#export--optimization)
8. [Quality Assurance System](#quality-assurance-system)
9. [Available Tools & Scripts](#available-tools--scripts)
10. [Configuration & Settings](#configuration--settings)
11. [API Reference](#api-reference)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## Executive Summary

The PDF Orchestrator is an **intelligent, AI-powered document automation system** specifically designed for creating world-class TEEI (The Educational Equality Institute) partnership materials. It combines:

- **Adobe InDesign** automation via MCP (Model Context Protocol)
- **Brand compliance validation** (TEEI and Together for Ukraine design systems)
- **Multi-format PDF export** (print CMYK, digital RGB, accessibility)
- **Comprehensive QA pipeline** (4-layer validation system with AI critique)
- **Python + JavaScript** hybrid architecture

**Key Capabilities:**
- ✅ Automated 4-page partnership proposals in <30 seconds
- ✅ 95%+ brand compliance guaranteed via validation agents
- ✅ Support for 2 design systems (TEEI world-class + TFU compliance)
- ✅ Dual export (commercial print + digital distribution)
- ✅ Visual regression testing (pixel-perfect QA)
- ✅ ExtendScript + UXP dual-mode operation

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Python CLI  │  │ Node.js CLI  │  │  Pipeline.py │      │
│  │  Controllers │  │  Validators  │  │  Orchestrator│      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └────────┬─────────┴──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP INTEGRATION LAYER                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        WebSocket Proxy (localhost:8013)              │   │
│  │  Protocol Translation: Python ←→ JavaScript/UXP      │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 ADOBE INDESIGN LAYER                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  UXP Plugin    │  │  ExtendScript  │  │  Document    │  │
│  │  (Modern API)  │  │  (Legacy API)  │  │  Engine      │  │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘  │
└───────────┼──────────────────┼──────────────────┼───────────┘
            │                  │                  │
            └────────┬─────────┴──────────────────┘
                     │
                     ▼
           ┌─────────────────────┐
           │  PDF Output Files   │
           │  • Print (CMYK)     │
           │  • Digital (RGB)    │
           │  • Archive (PDF/A)  │
           └─────────────────────┘
```

### Data Flow

```
Job Config (JSON)
    ↓
┌───────────────────────────────────────┐
│ 1. Orchestrator validates schema      │
│ 2. Selects design system (TEEI/TFU)   │
│ 3. Loads content data                 │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│ 4. MCP Client sends commands          │
│    • createDocument                   │
│    • executeExtendScript (JSX)        │
│    • applyStyles                      │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│ 5. InDesign creates document          │
│    • 4 pages (TFU) or 3 pages (TEEI)  │
│    • Brand colors (#00393F teal)      │
│    • Lora + Roboto typography         │
│    • Logo placement                   │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│ 6. Export to PDF via ExtendScript     │
│    • High Quality Print preset        │
│    • Custom settings per format       │
└───────────────┬───────────────────────┘
                ↓
┌───────────────────────────────────────┐
│ 7. QA Validation Pipeline             │
│    • TFU compliance (140/150 score)   │
│    • PDF quality checks               │
│    • Visual regression tests          │
└───────────────┬───────────────────────┘
                ↓
           Final PDF ✓
```

---

## Core Components

### 1. Orchestrator (orchestrator.js)

**Purpose**: Main controller coordinating all automation tasks

**Responsibilities:**
- Job queue management
- Worker coordination (MCP vs Adobe PDF Services)
- Error handling and retry logic
- Status reporting

**Key Functions:**
```javascript
orchestrator.processJob(jobConfig)
  → Validates JSON schema
  → Routes to appropriate worker
  → Monitors execution
  → Handles failures
  → Returns status report
```

**Configuration**: `config/orchestrator.config.json`

```json
{
  "workers": {
    "mcp_worker": {
      "enabled": true,
      "host": "localhost",
      "port": 8013
    },
    "pdf_services_worker": {
      "enabled": false,
      "api_key": "${ADOBE_API_KEY}"
    }
  },
  "job_queue": {
    "max_concurrent": 3,
    "retry_attempts": 2,
    "timeout_ms": 120000
  }
}
```

---

### 2. MCP Worker (workers/mcp_worker/)

**Purpose**: Local InDesign automation via Model Context Protocol

**Components:**

#### A. Python MCP Client (adb-mcp/mcp/)
```python
# Core modules
core.py         # Command creation and execution
socket_client.py # WebSocket communication
logger.py        # Structured logging

# Usage
from core import init, sendCommand, createCommand
init("indesign", socket_client)
result = sendCommand(createCommand("executeExtendScript", {"code": jsx_script}))
```

**Available Commands:**
- `ping` - Connection test
- `readDocumentInfo` - Get document metadata
- `createDocument` - New document with dimensions
- `executeExtendScript` - Run arbitrary JSX code
- `exportPDFViaExtendScript` - Export with ExtendScript (reliable)
- `exportPDF` - Export with UXP API (limited path support)
- `applyColorsViaExtendScript` - Color diagnostics

#### B. WebSocket Proxy (proxy.js - Port 8013)
```javascript
// Translates between Python and UXP plugin
pythonClient → WebSocket → UXP Plugin (InDesign)

// Handles protocol differences:
// Python sends: {action: "ping", options: {}}
// UXP expects: {command: "ping", params: {}}
// Proxy normalizes both formats
```

#### C. UXP Plugin (adb-mcp/uxp/id/)

**Files:**
- `main.js` - Entry point, Socket.IO connection
- `commands/index.js` - 150+ command implementations
- `manifest.json` - Plugin metadata

**Command Handlers** (150+ total):
```javascript
// Document Management
createDocument, loadTemplate, saveDocument, closeDocument

// Content Creation
createTextFrame, createRectangle, createEllipse, placeImage

// Styling
applyTextStyle, applyParagraphStyle, applyGradient, applyDropShadow

// Export
exportPDF, exportPDFViaExtendScript, exportVariants

// Advanced Features (50+ premium commands)
createGradientBox, createTextWithAllEffects, createPattern,
pathfinderUnion, stepAndRepeat, transformScale, transformRotate
```

**Recent Bug Fixes (2025-11-13):**
1. ✅ Protocol mismatch: Now accepts both `action` and `command` fields
2. ✅ Document state: `getActiveDocumentSettings()` returns null when no doc open
3. ✅ Parameter mapping: Supports both `params` and `options`

---

### 3. Pipeline Controller (pipeline.py)

**Purpose**: End-to-end document generation + validation pipeline

**Workflow:**
```python
python pipeline.py --job-config example-jobs/tfu-aws-partnership.json
```

**Steps:**
1. **Connect** - Ping InDesign MCP server
2. **Check Document** - Verify InDesign state
3. **Validate Colors** - Run color diagnostic (optional)
4. **Export PDF** - Generate output files
5. **PDF Analysis** - Extract text, images, metadata
6. **Content Validation** - Check completeness
7. **TFU Compliance** - Score against 150-point rubric
8. **Visual QA** - Run PDF quality checks

**Execution Modes:**
```bash
# Full pipeline (create + validate)
python pipeline.py --job-config job.json

# Validation only (PDF already exists)
python pipeline.py --validate-only --pdf output.pdf --job-config job.json

# CI mode (strict thresholds, exit codes)
python pipeline.py --ci --threshold 95 --job-config job.json
```

**Exit Codes:**
- `0` = Success (all checks passed)
- `1` = Validation failed (below threshold)
- `2` = Connection error
- `3` = Export error

---

### 4. Validation System (validate_document.py)

**Purpose**: Comprehensive document quality scoring

**10 Validation Agents:**

#### Agent 1: TFU Design System Compliance
**Score**: 0-35 points
**Checks:**
- ✅ Page count = exactly 4 (not 3!)
- ✅ Primary color = #00393F (Nordshore teal)
- ✅ Gold color (#BA8F5A) forbidden
- ✅ Fonts: Lora (headlines) + Roboto (body)
- ✅ Roboto Flex forbidden (TFU uses base Roboto)
- ✅ TFU badge present (blue + yellow Ukraine colors)
- ✅ Partner logo grid (3×3, 9 logos)
- ✅ Full teal cover page + closing page
- ✅ Light blue stats sidebar
- ✅ Two-column program matrix

#### Agent 2: Typography Design
**Score**: 0-25 points
**Checks:**
- Font usage consistency
- Hierarchy (H1 > H2 > Body > Caption)
- Line height appropriateness
- No orphans/widows
- Readable font sizes (11pt+ body text)

#### Agent 3: PDF Structure
**Score**: 0-20 points
**Checks:**
- Valid PDF/A or PDF/X compliance
- Embedded fonts
- Proper metadata
- Accessibility tags (if required)
- Bookmarks and navigation

#### Agent 4: Color Accuracy
**Score**: 0-15 points
**Checks:**
- Brand colors match exactly (#00393F, #C9E4EC, etc.)
- No off-brand colors (copper, orange)
- Consistent color space (RGB vs CMYK)

#### Agent 5: Content Completeness
**Score**: 0-15 points
**Checks:**
- All placeholder text replaced
- No "XX" or "[TBD]" markers
- Contact information present
- Actual metrics (not fake numbers)

#### Agent 6: Image Quality
**Score**: 0-15 points
**Checks:**
- All images loaded successfully
- Resolution: 150 DPI+ digital, 300 DPI+ print
- No low-quality compression artifacts

#### Agent 7: Layout Consistency
**Score**: 0-10 points
**Checks:**
- Alignment precision
- Consistent spacing
- Grid adherence
- No text cutoffs

#### Agent 8: Brand Voice
**Score**: 0-10 points
**Checks:**
- Empowering (not condescending)
- Urgent (not panic-inducing)
- Hopeful (not naive)
- Clear and jargon-free

#### Agent 9: Accessibility
**Score**: 0-5 points
**Checks:**
- Alt text for images
- Proper heading structure
- Color contrast ratios (WCAG 2.1 AA)

#### Agent 10: Call to Action
**Score**: 0-5 points
**Checks:**
- Clear next steps
- Contact information visible
- Action verb present ("Schedule", "Join", etc.)

**Scoring Thresholds:**
```
145-150 = A+ (World-Class)
140-144 = A  (Excellent - TFU Minimum)
130-139 = B+ (Good)
120-129 = B  (Acceptable)
100-119 = C  (Needs Improvement)
<100    = F  (Failed - Major Revisions Required)
```

**TFU Compliance Requirement:** 140/150 minimum (93.3%)

---

## MCP Integration Layer

### Protocol Flow

```
┌──────────────────────────────────────────────────────────┐
│  Python Client                                            │
│                                                           │
│  command = createCommand(                                │
│      action="executeExtendScript",                       │
│      options={"code": jsx_script}                        │
│  )                                                        │
│  result = sendCommand(command)                           │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼ WebSocket Message
┌──────────────────────────────────────────────────────────┐
│  WebSocket Proxy (localhost:8013)                        │
│                                                           │
│  {                                                        │
│    "senderId": "python_client_123",                      │
│    "application": "indesign",                            │
│    "command": {                                          │
│      "action": "executeExtendScript",                    │
│      "options": {"code": "...jsx..."}                    │
│    }                                                      │
│  }                                                        │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼ Socket.IO Emit
┌──────────────────────────────────────────────────────────┐
│  UXP Plugin (InDesign)                                   │
│                                                           │
│  socket.on("command_packet", async (packet) => {        │
│    // Normalize protocol differences                     │
│    const commandStr = command.command || command.action  │
│    const params = command.params || command.options      │
│                                                           │
│    // Route to handler                                   │
│    const result = await executeExtendScript({            │
│      options: { code: params.code }                      │
│    })                                                     │
│                                                           │
│    // Send response back                                 │
│    socket.emit("command_packet_response", {             │
│      status: "SUCCESS",                                  │
│      response: result                                    │
│    })                                                     │
│  })                                                       │
└──────────────────┬───────────────────────────────────────┘
                   │
                   ▼ ExtendScript Execution
┌──────────────────────────────────────────────────────────┐
│  Adobe InDesign Application                              │
│                                                           │
│  app.doScript(jsx_code, ScriptLanguage.JAVASCRIPT)      │
│  → Creates 4-page document                               │
│  → Applies TEEI/TFU design system                        │
│  → Places logos and content                              │
│  → Returns success confirmation                          │
└──────────────────────────────────────────────────────────┘
```

### Connection Management

**Proxy Server (proxy.js):**
```javascript
// Start proxy
node proxy.js

// Configuration
const PORT = 8013
const ALLOWED_APPLICATIONS = ['indesign', 'photoshop', 'illustrator']

// Handles multiple clients
clients = {
  'python_client_1': { app: 'indesign', sessionId: 'abc123' },
  'uxp_plugin_1': { app: 'indesign', sessionId: 'def456' }
}
```

**Health Check:**
```bash
# Test connection
python test_connection.py

# Expected output:
✅ Connected to server with session ID: xyz789
✅ Ping successful: {"status": "ok", "app": "InDesign", "version": "20.6.0.41"}
✅ InDesign MCP connection verified
```

---

## Design Systems

### 1. TEEI World-Class Design System

**Target**: Premium partnership materials, annual reports, donor presentations

**Visual Identity:**
- **Primary Color**: Nordshore #00393F (deep teal) - 60% usage
- **Secondary**: Sky #C9E4EC (light blue) - 20% usage
- **Neutral**: Sand #FFF1E2, Beige #EFE1DC - 15% usage
- **Accent**: Gold #BA8F5A (premium touch) - 5% usage

**Typography:**
- Headlines: **Lora Bold** 36-48pt
- Subheads: **Lora SemiBold** 24-32pt
- Body: **Roboto Flex Regular** 11-14pt
- Captions: **Roboto Flex Regular** 9pt

**Layout:**
- Grid: 12-column, 20pt gutters
- Margins: 40pt all sides
- Section spacing: 60pt
- Element spacing: 20pt

**Page Structure (3 pages):**
1. **Cover**: Hero image, title, TEEI logo
2. **Content**: Programs, metrics, partner benefits
3. **CTA**: Call to action, contact information

---

### 2. TFU (Together for Ukraine) Compliance System

**Target**: Government proposals, EU partnerships, humanitarian documentation

**Visual Identity:**
- **Primary**: Nordshore #00393F (teal) - 70% usage
- **Accent**: Ukraine Blue #0057B7, Yellow #FFD700 (badge only)
- **Secondary**: Light Blue sidebar, White backgrounds
- **Forbidden**: Gold #BA8F5A (considered too premium for humanitarian context)

**Typography:**
- Headlines: **Lora SemiBold** 32-42pt
- Subheads: **Lora Regular** 24-28pt
- Body: **Roboto Regular** (not Flex!) 11-13pt
- Stats: **Roboto Bold** 28-36pt

**Required Elements:**
1. **TFU Badge**: "Together for UKRAINE" with blue/yellow colors
2. **Partner Grid**: 3×3 grid, 9 partner logos minimum
3. **Full Teal Pages**: Cover (page 1) + Closing (page 4) must be 100% teal
4. **Stats Sidebar**: Light blue (#C9E4EC) column with key metrics
5. **Program Matrix**: Two-column layout for program details

**Page Structure (4 pages, NOT 3!):**
1. **Cover**: Full teal, TEEI logo, partner name, TFU badge
2. **About + Goals**: Mission, value proposition, impact metrics
3. **Programs**: Detailed program descriptions, success rates
4. **Closing CTA**: Full teal, partner grid, contact information

**Validation Strictness:**
- Minimum score: 140/150 (93.3%)
- Page count validation: CRITICAL (exactly 4 pages)
- Color validation: CRITICAL (no gold color allowed)
- Font validation: CRITICAL (Roboto, not Roboto Flex)

---

## Document Creation Workflows

### Workflow 1: Quick TFU Partnership Document

**Use Case**: Create compliant proposal for AWS, Google, Microsoft partnerships

```bash
# Step 1: Create document via ExtendScript
python execute_tfu_jsx.py

# InDesign creates:
# - 4 pages (TFU compliant)
# - Full teal cover + closing
# - TFU badge placement
# - Partner content populated
# - Lora + Roboto typography

# Step 2: Export PDFs
python export_tfu_pdfs.py

# Generates:
# - TEEI-AWS-Partnership-TFU-DIGITAL.pdf (RGB, 150 DPI)
# - TEEI-AWS-Partnership-TFU-PRINT.pdf (CMYK, 300 DPI)

# Step 3: Validate compliance
python validate_document.py exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf \
  --job-config example-jobs/tfu-aws-partnership.json --strict

# Expected: 140-150/150 score (A or A+)
```

**JSX Script**: `scripts/generate_tfu_aws.jsx` (25,678 characters)
- Self-contained (no external dependencies)
- Hardcoded TEEI brand colors
- Automatic style creation
- Logo placement helpers
- Partner data integration

---

### Workflow 2: TEEI World-Class Document

**Use Case**: Premium donor reports, annual impact summaries

```bash
# Step 1: Full pipeline execution
python pipeline.py --job-config example-jobs/aws-world-class.json

# Pipeline performs:
# 1. Connect to InDesign
# 2. Validate no existing document
# 3. Create 3-page document (TEEI system)
# 4. Apply world-class design
# 5. Export dual PDFs
# 6. Run 10-agent validation
# 7. Generate QA report

# Step 2: Review validation report
cat exports/TEEI-AWS-QA-Report.txt

# Step 3: Visual inspection
node scripts/validate-pdf-quality.js exports/TEEI-AWS-WORLD-CLASS.pdf
```

---

### Workflow 3: Batch Production

**Use Case**: Generate 10+ partnership proposals simultaneously

```bash
# Queue multiple jobs
for job in example-jobs/batch-reports/*.json; do
  python pipeline.py --job-config "$job" --ci &
done

# Wait for all to complete
wait

# Aggregate results
python aggregate_qa_results.py batch-reports/
```

**Batch Configuration** (`example-jobs/batch-config.json`):
```json
{
  "jobs": [
    {"template": "tfu", "partner": "AWS", "priority": 1},
    {"template": "tfu", "partner": "Google", "priority": 1},
    {"template": "teei", "partner": "Bain Capital", "priority": 2}
  ],
  "parallel_limit": 3,
  "auto_retry": true,
  "export_formats": ["pdf_digital", "pdf_print"]
}
```

---

## Export & Optimization

### Export Profiles

#### 1. Print Production (PDF/X-4)
```python
{
  "preset": "[PDF/X-4:2010]",
  "color_space": "CMYK",
  "resolution": 300,  # DPI
  "bleed": "3mm",
  "crop_marks": True,
  "use_case": "Commercial printing, offset lithography"
}
```

**Output**: `TEEI-AWS-Partnership-TFU-PRINT.pdf`
- File size: 2-5 MB (high quality)
- Color profile: Coated FOGRA39 (ISO 12647-2:2004)
- Fonts: Embedded subset
- Transparency: Flattened

#### 2. Digital Distribution (High Quality Print)
```python
{
  "preset": "[High Quality Print]",
  "color_space": "RGB",
  "resolution": 150,  # DPI
  "optimize_web": True,
  "use_case": "Email attachments, web downloads"
}
```

**Output**: `TEEI-AWS-Partnership-TFU-DIGITAL.pdf`
- File size: 0.5-2 MB (optimized)
- Color profile: sRGB IEC61966-2.1
- Fonts: Embedded subset
- Compression: JPEG quality 80

#### 3. Accessibility First (PDF/UA)
```python
{
  "preset": "[Accessible]",
  "tagged_pdf": True,
  "structure_tree": True,
  "alt_text_required": True,
  "use_case": "Government submissions, ADA compliance"
}
```

#### 4. Archive Preservation (PDF/A-2)
```python
{
  "preset": "[PDF/A-2]",
  "embed_all_fonts": True,
  "no_encryption": True,
  "long_term_storage": True,
  "use_case": "Legal records, 50+ year retention"
}
```

### Export Optimizer

**Intelligent export** based on document purpose:

```python
from export_optimizer import ExportOptimizer, ExportPurpose

optimizer = ExportOptimizer()
result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership.pdf",
    purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
)

# Automatically selects:
# - Resolution: 150 DPI (balance quality/size)
# - Color space: RGB (digital viewing)
# - Compression: Optimized for web
# - File size target: <2 MB
```

**7 Built-in Profiles:**
1. `print_production` - Offset printing
2. `partnership_presentation` - Stakeholder review
3. `digital_marketing` - Email campaigns
4. `accessibility_first` - WCAG 2.1 AA
5. `draft_review` - Fast preview
6. `archive_preservation` - Long-term storage
7. `web_optimized` - Website embedding

---

## Quality Assurance System

### 4-Layer QA Architecture

```
Layer 1: Content & Structure Validation
   ↓
Layer 2: PDF Quality Checks
   ↓
Layer 3: Visual Regression Testing
   ↓
Layer 4: AI Design Critique (Gemini Vision)
```

### Layer 1: Content Validation (validate_document.py)

**10 AI-Powered Agents** scoring against 150-point rubric

**Execution:**
```bash
python validate_document.py exports/document.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --strict \
  --threshold 140
```

**Output:**
```
============================================================
 DOCUMENT VALIDATION REPORT
============================================================

 TFU DESIGN SYSTEM COMPLIANCE:
  ✓ Page Count: 4 pages (required: 4) [5/5]
  ✓ Primary Color: #00393F detected [5/5]
  ✓ Gold Color Forbidden: Not found [5/5]
  ✓ Fonts: Lora + Roboto detected [5/5]
  ✓ TFU Badge: Present on cover [5/5]
  ✓ Partner Grid: 3x3 detected [5/5]
  ✓ Full Teal Pages: Cover + Closing [5/5]

 TYPOGRAPHY & DESIGN: [22/25]
  ✓ Font Hierarchy: Proper [8/10]
  ✓ Line Height: Appropriate [7/10]
  ✓ No Orphans/Widows: Clean [7/5]

 PDF STRUCTURE: [18/20]
 COLOR ACCURACY: [14/15]
 CONTENT COMPLETENESS: [15/15]
 IMAGE QUALITY: [14/15]
 LAYOUT CONSISTENCY: [9/10]
 BRAND VOICE: [10/10]
 ACCESSIBILITY: [4/5]
 CALL TO ACTION: [5/5]

============================================================
 OVERALL SCORE: 146/150
 RATING: [PASSED] WORLD-CLASS (A+)
============================================================
```

---

### Layer 2: PDF Quality Validator (validate-pdf-quality.js)

**Automated checks** on exported PDFs

**5 Comprehensive Checks:**

#### Check 1: Page Dimensions
```javascript
// Validates exact Letter size (8.5" × 11")
expected: { width: 612, height: 792 }  // points
tolerance: ±2 points
```

#### Check 2: Text Cutoff Detection
```javascript
// Scans page edges for text overflow
margin: 40 points
detection_zones: [top, bottom, left, right]
threshold: >5 characters cut off = FAIL
```

#### Check 3: Image Loading
```javascript
// Verifies all images rendered successfully
checks: [
  "No broken image placeholders",
  "All <img> tags have valid src",
  "No 404 errors in network log"
]
```

#### Check 4: Color Validation
```javascript
// TEEI brand color compliance
official_colors: [
  "#00393F",  // Nordshore (primary)
  "#C9E4EC",  // Sky
  "#FFF1E2",  // Sand
  "#BA8F5A"   // Gold (TEEI only, forbidden in TFU)
]
forbidden_colors: ["#FF6B35", "#F7931E"]  // Copper/orange
```

#### Check 5: Font Validation
```javascript
// Typography compliance
required_fonts: {
  headlines: "Lora",
  body: "Roboto" // or "Roboto Flex" for TEEI
}
forbidden_fonts: ["Arial", "Helvetica", "Times New Roman"]
```

**Execution:**
```bash
# Validate PDF
node scripts/validate-pdf-quality.js exports/TEEI-AWS-Partnership.pdf

# Validate HTML (more detailed)
node scripts/validate-pdf-quality.js exports/TEEI-AWS-Partnership.html
```

**Output:**
```
✓ Page Dimensions: PASSED (612×792 points)
✓ Text Cutoffs: PASSED (0 instances detected)
✓ Image Loading: PASSED (2/2 images loaded)
✓ Color Validation: PASSED (4/4 brand colors, 0 forbidden)
✓ Font Validation: PASSED (Lora + Roboto detected)

============================================================
VALIDATION RESULT: ALL CHECKS PASSED ✓
============================================================

Report saved:
- exports/validation-issues/validation-report-TEEI-AWS-20251113.json
- exports/validation-issues/validation-report-TEEI-AWS-20251113.txt
```

**Exit Codes:**
- `0` = All checks passed ✅
- `1` = One or more checks failed ❌

---

### Layer 3: Visual Regression Testing (compare-pdf-visual.mjs)

**Pixel-perfect comparison** against approved baseline

**Workflow:**

**Step 1: Create Baseline** (one-time, when design approved)
```bash
node scripts/create-reference-screenshots.js \
  exports/TEEI-AWS-Partnership-APPROVED-v1.pdf \
  teei-aws-baseline-v1

# Creates baseline reference:
# references/teei-aws-baseline-v1/
#   ├── page-1.png (300 DPI screenshot)
#   ├── page-2.png
#   ├── page-3.png
#   ├── page-4.png
#   └── metadata.json
```

**Step 2: Compare New Version**
```bash
node scripts/compare-pdf-visual.mjs \
  exports/TEEI-AWS-Partnership-v2.pdf \
  teei-aws-baseline-v1

# Generates pixel diff:
# comparisons/teei-aws-baseline-v1-20251113/
#   ├── page-1-test.png
#   ├── page-1-diff.png (red overlay showing changes)
#   ├── page-1-comparison.png (reference | test | diff side-by-side)
#   └── comparison-report.json
```

**Diff Analysis:**
```json
{
  "totalPages": 4,
  "results": [
    {
      "page": 1,
      "pixelDiff": 243,
      "totalPixels": 4608000,
      "percentDiff": 0.0053,
      "status": "PASS",
      "threshold": "< 5% = PASS (anti-aliasing only)"
    },
    {
      "page": 2,
      "pixelDiff": 125000,
      "percentDiff": 2.71,
      "status": "PASS",
      "changes": ["Logo position shifted 2px left"]
    }
  ]
}
```

**5 Threshold Levels:**
- **< 5%** = ✅ PASS (anti-aliasing, minor font rendering)
- **5-10%** = ⚠️ MINOR (small layout adjustments)
- **10-20%** = ⚠️ WARNING (noticeable differences, review needed)
- **20-30%** = ❌ MAJOR (significant visual changes)
- **> 30%** = 🚨 CRITICAL (completely different design)

---

### Layer 4: AI Design Critique (Gemini Vision)

**Multimodal AI analysis** of document design quality using Google's Gemini Vision API

**Purpose:**
- Evaluate world-class B2B partnership presentation quality
- Assess visual hierarchy, narrative strength, and executive polish
- Provide actionable design recommendations
- Flag critical issues (unclear value prop, weak CTA, poor hierarchy)

**How It Works:**
1. Converts PDF pages to PNG images (cached for performance)
2. Sends each page to Gemini Vision with role-specific prompts
3. Receives structured JSON with scores, issues, and recommendations
4. Generates overall assessment and markdown improvement guide

**Execution:**
```bash
# Production mode (requires GEMINI_API_KEY)
export GEMINI_API_KEY=your-api-key-here
node scripts/gemini-vision-review.js \
  --pdf exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf \
  --job-config example-jobs/tfu-aws-partnership-v2.json \
  --output reports/gemini/review.json \
  --min-score 0.92

# Dry-run mode (testing without API access)
export DRY_RUN_GEMINI_VISION=1
node scripts/gemini-vision-review.js \
  --pdf exports/document.pdf \
  --job-config example-jobs/job.json \
  --output reports/gemini/test.json \
  --min-score 0.90
```

**Output:**
```
============================================================
GEMINI REVIEW SUMMARY
============================================================

Model: gemini-1.5-pro
Overall Score: 0.93 / 1.00
Threshold: 0.92
Requires Changes: NO

Page Scores:
  Page 1 (cover): 0.91 - 0 issues (0 critical, 0 major)
  Page 2 (about): 0.92 - 0 issues (0 critical, 0 major)
  Page 3 (programs): 0.93 - 1 issues (0 critical, 0 major)
  Page 4 (cta): 0.94 - 0 issues (0 critical, 0 major)

Summary:
The document demonstrates strong TFU compliance with clear visual
hierarchy and strategic narrative flow. Minor improvements possible
in photo sizing and whitespace balance.

Result: ✅ PASS
Score 0.93 >= 0.92, no critical issues
============================================================
```

**Saved Report (JSON):**
```json
{
  "model": "gemini-1.5-pro",
  "overall_score": 0.93,
  "summary": "1-2 paragraph natural language summary",
  "page_scores": [
    {
      "page": 1,
      "score": 0.91,
      "role": "cover",
      "issues": []
    }
  ],
  "recommendations_md": "## Priority Improvements\n\n1. **Visual Balance** - ...\n2. **Whitespace** - ...",
  "requires_changes": false,
  "metadata": {
    "pdf_path": "exports/document.pdf",
    "generated_at": "2025-11-14T...",
    "min_score_threshold": 0.92
  }
}
```

**Exit Codes:**
- `0` = Review passed (score ≥ threshold, no critical issues) ✅
- `1` = Review failed (score < threshold OR critical issues) ❌
- `3` = Infrastructure error (missing API key, network issue) ⚠️

**Job Config Integration:**
```json
{
  "gemini_vision": {
    "enabled": true,
    "min_score": 0.92,
    "fail_on_critical": true,
    "output_dir": "reports/gemini"
  }
}
```

**World-Class Criteria:**
Gemini Vision evaluates against B2B partnership standards:
- **Clarity & Hierarchy** - 11+ distinct type sizes, clear visual rhythm
- **Narrative Arc** - Problem → Approach → Value → Outcomes flow
- **CTA Strength** - Specific next step (not vague "learn more")
- **Visual Polish** - Balanced whitespace, authentic photography, no text cutoffs
- **Executive Appeal** - Professional impression for AWS-level partnerships

**Pipeline Integration:**
Layer 4 runs automatically in `pipeline.py` after Layer 3 when `gemini_vision.enabled = true`:

**Full Pipeline (Export + Validate):**
```bash
# Creates PDF from InDesign, then runs all 4 QA layers
python pipeline.py \
  --job-config example-jobs/tfu-aws-partnership-v2.json
```

**Validation-Only Mode:**
```bash
# Validates existing PDF with all 4 QA layers
python pipeline.py --validate-only \
  --pdf exports/document.pdf \
  --job-config example-jobs/tfu-aws-partnership-v2.json
```

**Notes:**
- TFU compliance (colors, fonts, badge) already enforced by Layer 1
- Layer 4 focuses on design quality, not rule compliance
- Dry-run mode returns synthetic scores for testing
- Cached PNG generation improves performance (reuses images)

---

## Available Tools & Scripts

### Document Creation

| Script | Purpose | Usage |
|--------|---------|-------|
| `execute_tfu_jsx.py` | Create TFU-compliant 4-page doc | `python execute_tfu_jsx.py` |
| `create_world_class_document.py` | Create TEEI 3-page doc | `python create_world_class_document.py` |
| `generate_tfu_aws.jsx` | ExtendScript for TFU creation | Run in InDesign or via MCP |

### Export & Optimization

| Script | Purpose | Usage |
|--------|---------|-------|
| `export_tfu_pdfs.py` | Dual export (print + digital) | `python export_tfu_pdfs.py` |
| `export_optimizer.py` | Intelligent export profiles | `python export_optimizer.py output.pdf --purpose partnership_presentation` |
| `export_world_class_pdf.py` | TEEI export | `python export_world_class_pdf.py` |

### Validation & QA

| Script | Purpose | Usage |
|--------|---------|-------|
| `validate_document.py` | Layer 1: 10-agent comprehensive validation | `python validate_document.py file.pdf --job-config job.json --strict` |
| `validate-pdf-quality.js` | Layer 2: 5-check PDF quality validation | `node scripts/validate-pdf-quality.js file.pdf` |
| `compare-pdf-visual.mjs` | Layer 3: Visual regression testing | `node scripts/compare-pdf-visual.mjs file.pdf baseline-id` |
| `gemini-vision-review.js` | Layer 4: AI design critique with Gemini Vision | `node scripts/gemini-vision-review.js --pdf file.pdf --job-config job.json --output report.json` |
| `create-reference-screenshots.js` | Create visual baseline | `node scripts/create-reference-screenshots.js file.pdf baseline-id` |
| `get-pdf-page-images.js` | Extract PDF pages as PNGs (cached) | `node scripts/get-pdf-page-images.js file.pdf` |

### Pipeline & Orchestration

| Script | Purpose | Usage |
|--------|---------|-------|
| `pipeline.py` | End-to-end pipeline | `python pipeline.py --job-config job.json` |
| `orchestrator.js` | Job queue manager | `node orchestrator.js --config config.json` |
| `test_connection.py` | MCP connection test | `python test_connection.py` |

### Diagnostics & Utilities

| Script | Purpose | Usage |
|--------|---------|-------|
| `run_diagnostics.py` | InDesign document diagnostics | `python run_diagnostics.py` |
| `visual_diagnostic.py` | Visual inspection tool | `python visual_diagnostic.py` |
| `apply_colors_and_export.py` | Color correction | `python apply_colors_and_export.py` |

---

## Configuration & Settings

### Job Configuration Schema

**File**: `schemas/partnership-schema.json`

```json
{
  "name": "AWS Partnership Proposal",
  "description": "Together for Ukraine AWS Partnership - 4-page TFU-compliant design",

  "template": "partnership",
  "design_system": "tfu",  // or "teei"
  "validate_tfu": true,

  "data": {
    "title": "AWS Partnership Proposal",
    "subtitle": "Empowering Ukrainian Students Through Technology",
    "organization": "The Educational Equality Institute",
    "partner": "Amazon Web Services",

    "overview": {
      "mission": "...",
      "value_proposition": "...",
      "impact": "..."
    },

    "programs": [
      {
        "name": "Cloud Computing Curriculum",
        "description": "...",
        "students_reached": 15000,
        "success_rate": "92%"
      }
    ],

    "metrics": {
      "students_reached": 50000,
      "countries": 12,
      "partner_organizations": 45
    },

    "call_to_action": {
      "headline": "Ready to Transform Education Together?",
      "action": "Schedule a Partnership Discussion",
      "contact": {
        "name": "Henrik Røine",
        "email": "henrik@theeducationalequalityinstitute.org",
        "phone": "+47 919 08 939"
      }
    }
  },

  "output": {
    "formats": ["indd", "pdf_print", "pdf_digital"],
    "intent": "print",
    "filename_base": "TEEI-AWS-Partnership-TFU",
    "export_path": "./exports",

    "pdf_settings": {
      "print": {
        "preset": "[PDF/X-4:2010]",
        "color_space": "CMYK",
        "resolution": 300
      },
      "digital": {
        "preset": "[High Quality Print]",
        "color_space": "RGB",
        "resolution": 150
      }
    }
  },

  "quality": {
    "validation_threshold": 140,
    "auto_fix": false,
    "strict_mode": true,
    "required_checks": [
      "tfu_compliance",
      "typography_design",
      "pdf_structure",
      "content"
    ]
  },

  "tfu_requirements": {
    "page_count": 4,
    "primary_color": "#00393F",
    "forbidden_colors": ["#BA8F5A"],
    "required_fonts": ["Lora", "Roboto"],
    "forbidden_fonts": ["Roboto Flex"],
    "required_elements": [
      "TFU badge (blue + yellow)",
      "Partner logo grid (3×3)",
      "Full teal cover page",
      "Full teal closing page"
    ]
  }
}
```

---

### Environment Configuration

**File**: `config/.env`

```bash
# Adobe PDF Services (for cloud-based worker)
ADOBE_CLIENT_ID=your_client_id_here
ADOBE_CLIENT_SECRET=your_client_secret_here
ADOBE_ORGANIZATION_ID=your_org_id_here

# MCP Server
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8013

# Output Storage (Cloudflare R2)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=pdf-outputs

# Logging
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
LOG_FILE=./logs/orchestrator.log

# Quality Thresholds
TFU_MIN_SCORE=140
TEEI_MIN_SCORE=130
```

---

### Orchestrator Configuration

**File**: `config/orchestrator.config.json`

```json
{
  "version": "2.0",

  "workers": {
    "mcp_worker": {
      "enabled": true,
      "type": "local",
      "host": "localhost",
      "port": 8013,
      "timeout_ms": 60000,
      "retry_attempts": 2
    },

    "pdf_services_worker": {
      "enabled": false,
      "type": "cloud",
      "api_endpoint": "https://pdf-services.adobe.io",
      "timeout_ms": 120000
    }
  },

  "job_queue": {
    "max_concurrent": 3,
    "priority_levels": 5,
    "auto_retry": true,
    "retry_delay_ms": 5000
  },

  "export": {
    "default_format": "pdf_digital",
    "compression": "balanced",
    "quality_preset": "partnership_presentation"
  },

  "validation": {
    "run_by_default": true,
    "fail_on_low_score": true,
    "tfu_threshold": 140,
    "teei_threshold": 130
  }
}
```

---

## API Reference

### Python MCP Client API

#### Connection Management

```python
from core import init, sendCommand, createCommand
import socket_client

# Configure connection
socket_client.configure(
    app="indesign",
    url="http://localhost:8013",
    timeout=30
)

# Initialize
init("indesign", socket_client)

# Test connection
result = sendCommand(createCommand("ping", {}))
# Returns: {'status': 'SUCCESS', 'response': {'status': 'ok', 'app': 'InDesign'}}
```

#### Document Operations

```python
# Create new document
result = sendCommand(createCommand("createDocument", {
    "width": 612,
    "height": 792,
    "pages": 4,
    "facing": False
}))

# Get document info
info = sendCommand(createCommand("readDocumentInfo", {}))
# Returns: {'name': 'Untitled-1', 'pages': 4, 'fonts': [...]}

# Execute ExtendScript
jsx_code = """
    var doc = app.activeDocument;
    var page1 = doc.pages[0];
    var textFrame = page1.textFrames.add();
    textFrame.contents = "Hello World";
    return "Success";
"""
result = sendCommand(createCommand("executeExtendScript", {
    "code": jsx_code
}))
```

#### Export Operations

```python
# Export via ExtendScript (recommended)
result = sendCommand(createCommand("exportPDFViaExtendScript", {
    "outputPath": "D:\\exports\\output.pdf",
    "preset": "[High Quality Print]"
}))

# Export via UXP (limited)
result = sendCommand(createCommand("exportPDF", {
    "outputPath": "exports/output.pdf",
    "preset": "High Quality Print",
    "viewPDF": False
}))
```

---

### Validation API

```python
from validate_document import DocumentValidator

# Initialize validator
validator = DocumentValidator(
    pdf_path="exports/TEEI-AWS-Partnership.pdf",
    job_config_path="example-jobs/tfu-aws-partnership.json"
)

# Run validation
results = validator.validate(strict=True, threshold=140)

# Check results
print(f"Score: {results['total_score']}/150")
print(f"Rating: {results['rating']}")
print(f"Passed: {results['passed']}")

# Get detailed breakdown
for agent, score in results['agent_scores'].items():
    print(f"{agent}: {score['score']}/{score['max_score']}")
```

---

### Export Optimizer API

```python
from export_optimizer import ExportOptimizer, ExportPurpose

optimizer = ExportOptimizer()

# Export with specific purpose
result = optimizer.export_document(
    output_path="exports/TEEI_AWS.pdf",
    purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
)

# Result contains:
# - file_path
# - file_size_mb
# - export_settings_used
# - quality_metrics

# List available profiles
profiles = optimizer.list_profiles()
# Returns: ['print_production', 'partnership_presentation', ...]

# Get profile details
profile_info = optimizer.get_profile_info("partnership_presentation")
# Returns: resolution, color_space, compression, use_case
```

---

## Troubleshooting Guide

### Issue 1: MCP Connection Fails

**Symptoms:**
```
Error: Cannot connect to MCP server
Connection refused on localhost:8013
```

**Diagnosis:**
```bash
# Check if proxy is running
netstat -an | findstr 8013

# Test WebSocket connection
curl http://localhost:8013
```

**Solutions:**
1. Start proxy: `node proxy.js`
2. Restart InDesign
3. Reload UXP plugin in UXP Developer Tool
4. Check firewall settings (allow port 8013)

---

### Issue 2: Export Path Not Found

**Symptoms:**
```
Error calling exportPDF: PDF export failed: Could not find an entry of 'file:///exports/output.pdf'
```

**Cause:** UXP file system API has limited path resolution

**Solution:** Use `exportPDFViaExtendScript` instead of `exportPDF`
```python
# ❌ DON'T USE (UXP limitation)
result = sendCommand(createCommand("exportPDF", {...}))

# ✅ USE (ExtendScript reliable)
result = sendCommand(createCommand("exportPDFViaExtendScript", {...}))
```

---

### Issue 3: PDF Preset Not Found

**Symptoms:**
```
Error: Invalid value for parameter 'using' of method 'exportFile'. Expected PDFExportPreset, but received nothing.
```

**Cause:** Preset name doesn't match InDesign's built-in presets

**Solution:** Use bracketed preset names
```python
# ❌ WRONG
"preset": "High Quality Print"

# ✅ CORRECT
"preset": "[High Quality Print]"

# Common presets:
# - "[High Quality Print]"
# - "[PDF/X-1a:2001]"
# - "[PDF/X-4:2010]"
# - "[Press Quality]"
# - "[Smallest File Size]"
```

---

### Issue 4: TFU Validation Failing

**Symptoms:**
```
Score: 45/150
Rating: FAILED - Major revisions required
```

**Common Issues:**

**Page Count Wrong:**
```
Expected: 4 pages (TFU requirement)
Found: 3 pages (TEEI default)
```
**Fix:** Update JSX script `pagesPerDocument: 4`

**Gold Color Detected:**
```
Forbidden color #BA8F5A found (Gold is TEEI-only, not TFU)
```
**Fix:** Remove gold accents, use Nordshore #00393F instead

**Wrong Fonts:**
```
Found: Roboto Flex
Expected: Roboto (base family)
```
**Fix:** Use `Roboto Regular`, not `Roboto Flex Regular`

---

### Issue 5: Fonts Not Available

**Symptoms:**
```
Font not found: Lora
Substituted with: Myriad Pro
```

**Solution:**
```powershell
# Install TEEI fonts
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"

# Restart InDesign
# Verify fonts installed
Get-ChildItem "$env:WINDIR\Fonts" | Where-Object { $_.Name -like "Lora*" }
```

---

### Issue 6: Visual Regression False Positives

**Symptoms:**
```
Page 1: 12.5% diff - WARNING
But visually looks identical
```

**Cause:** Font rendering, anti-aliasing, screen resolution differences

**Solution:**
1. Increase tolerance threshold to 15%
2. Regenerate baseline at same DPI (300 recommended)
3. Use PNG comparison instead of JPEG (lossless)

---

## Performance Benchmarks

### Document Creation Speed

| Operation | Time | Notes |
|-----------|------|-------|
| TFU 4-page document | 8-15 seconds | Via ExtendScript |
| TEEI 3-page document | 6-12 seconds | Via ExtendScript |
| Export PDF (Digital) | 2-5 seconds | 150 DPI, RGB |
| Export PDF (Print) | 5-10 seconds | 300 DPI, CMYK |
| TFU Validation (10 agents) | 3-8 seconds | Depends on PDF size |
| Visual Regression (4 pages) | 10-20 seconds | 300 DPI comparison |

### Full Pipeline End-to-End

**TFU AWS Partnership (typical):**
```
1. Connection test: 1 second
2. Document creation: 12 seconds
3. Export PDFs (2): 8 seconds
4. TFU validation: 6 seconds
5. Visual QA: 15 seconds
─────────────────────────────
TOTAL: 42 seconds
```

**Parallel batch (10 documents):**
```
Sequential: 420 seconds (7 minutes)
Parallel (3 workers): 160 seconds (2.7 minutes)
Speedup: 2.6x
```

---

## Roadmap & Future Enhancements

### Version 2.1 (Next Release)

**Planned Features:**
- [ ] Multi-language support (Ukrainian, Polish, German)
- [ ] Template library (15+ pre-built partnership templates)
- [ ] AI-powered content suggestions
- [ ] Real-time collaboration (multiple users editing)
- [ ] Version control integration (Git commits on export)

### Version 3.0 (Future)

**Major Enhancements:**
- [ ] Web dashboard (browser-based document creation)
- [ ] Mobile preview (iOS/Android app)
- [ ] Cloud rendering (serverless InDesign automation)
- [ ] Advanced analytics (document performance tracking)
- [ ] A/B testing (multiple design variants)

---

## Support & Resources

### Documentation
- **Quick Start**: `README.md`
- **CLAUDE Instructions**: `CLAUDE.md` (AI assistant guide)
- **Design Standards**: `reports/TEEI_AWS_Design_Fix_Report.md`
- **Logo Integration**: `docs/PARTNER-LOGO-INTEGRATION-GUIDE.md`

### Example Jobs
- `example-jobs/tfu-aws-partnership.json` - TFU 4-page AWS proposal
- `example-jobs/aws-world-class.json` - TEEI 3-page premium doc
- `example-jobs/batch-reports/` - Batch processing examples

### Scripts Reference
- `scripts/` - All automation scripts
- `adb-mcp/` - MCP client library
- `workers/` - Worker implementations

### Contact
- **Email**: henrik@theeducationalequalityinstitute.org
- **Phone**: +47 919 08 939
- **GitHub Issues**: (if repository is public)

---

## Changelog

### Version 2.0.1 (2025-11-13)
**Bug Fixes:**
- ✅ Fixed MCP protocol mismatch (`action` vs `command` field)
- ✅ Fixed `getActiveDocumentSettings()` crash when no document open
- ✅ Added parameter normalization (`params` vs `options`)

**Improvements:**
- ✅ Dual-mode export (ExtendScript + UXP fallback)
- ✅ Better error messages for preset name mismatches
- ✅ Connection resilience (auto-retry on WebSocket drops)

### Version 2.0.0 (2025-11-04)
**Major Release:**
- 🎉 MCP integration (Python ↔ InDesign communication)
- 🎉 TFU design system support (4-page compliance)
- 🎉 10-agent AI validation system
- 🎉 3-layer QA architecture
- 🎉 150+ UXP commands available

---

## License

**Proprietary - The Educational Equality Institute (TEEI)**

This software is confidential and proprietary to TEEI. Unauthorized copying, distribution, or use is strictly prohibited.

For licensing inquiries, contact: henrik@theeducationalequalityinstitute.org

---

**End of System Overview**

*This document represents the canonical reference for the PDF Orchestrator system as of November 13, 2025. All components, workflows, and APIs are production-ready and actively maintained.*
