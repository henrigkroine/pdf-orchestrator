# PDF Orchestrator

**Intelligent PDF automation system for creating world-class TEEI partnership materials**

Intelligent PDF automation system that routes jobs between local MCP workers (for human-session Adobe automation) and Adobe PDF Services API (for serverless automation). Designed specifically for generating brand-compliant TEEI documents with Adobe InDesign and Illustrator.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [MCP Server Setup](#mcp-server-setup)
- [TEEI Brand Guidelines](#teei-brand-guidelines)
- [Configuration](#configuration)
- [Job Format](#job-format)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

PDF Orchestrator is a sophisticated automation system that intelligently routes PDF generation jobs between:

- **MCP Worker** (Human Session): For high-quality, brand-compliant documents requiring human oversight and local Adobe application control
- **PDF Services Worker** (Serverless): For automated, scalable cloud processing without local dependencies

**Current Focus**: Creating world-class TEEI AWS partnership documents with strict brand compliance.

---

## ✨ Features

- ✅ **Intelligent Job Routing**: Automatically selects the best worker based on job requirements
- ✅ **Brand Compliance**: Built-in TEEI brand guidelines enforcement
- ✅ **MCP Integration**: Direct control of Adobe InDesign and Illustrator via MCP protocol
- ✅ **Cloud & Local**: Supports both Adobe PDF Services API and local automation
- ✅ **JSON Schema Validation**: Catch errors early with comprehensive validation
- ✅ **Template Management**: Flexible template registry system
- ✅ **Cloudflare R2 Integration**: Automatic upload to cloud storage
- ✅ **Logging & Diagnostics**: Comprehensive logging for debugging

---

## 🏗️ Architecture

```
pdf-orchestrator/
├── orchestrator.js              # Main controller ("brain")
├── config/                      # Configuration files
│   ├── .env.example            # Environment variables template
│   ├── .env                    # Actual credentials (not in git)
│   └── orchestrator.config.json # Routing rules and settings
├── workers/                     # Worker implementations
│   ├── mcp_worker/             # Local MCP server integration (InDesign/Illustrator)
│   └── pdf_services_worker/    # Adobe PDF Services API
├── schemas/                     # JSON validation schemas
│   ├── report-schema.json
│   └── campaign-schema.json
├── templates/                   # Adobe template references
│   ├── template-registry.json
│   └── README.md
├── example-jobs/               # Sample job files
│   ├── report-sample.json
│   └── campaign-sample.json
├── mcp-local/                 # MCP server implementations
│   ├── indesign-mcp-server.py
│   ├── illustrator-mcp-server.py
│   ├── launch-indesign.cmd
│   └── launch-illustrator.cmd
├── adb-mcp/                    # Adobe MCP infrastructure
│   ├── mcp/                    # Core MCP modules
│   ├── adb-proxy-socket/       # WebSocket proxy server
│   └── uxp/                    # Adobe UXP plugins
├── assets/                     # Images, fonts, resources
│   └── fonts/                  # TEEI brand fonts (Lora, Roboto)
├── exports/                    # Generated PDF outputs
├── logs/                       # Log files
│   └── mcp/                   # MCP server logs
└── reports/                    # Design analysis and reports
    └── TEEI_AWS_Design_Fix_Report.md  # Brand compliance guide
```

### Communication Flow

```
Job File (JSON)
    ↓
Orchestrator (Validates & Routes)
    ↓
    ├─→ MCP Worker → MCP Server → Adobe Command Proxy → InDesign/Illustrator
    └─→ PDF Services Worker → Adobe PDF Services API → Cloud Processing
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (v22.12.0 recommended)
- **Python** 3.11+ (3.14.0 recommended)
- **Adobe InDesign** (for MCP worker)
- **Adobe Illustrator** (for MCP worker)
- **Cloudflare R2** account (for cloud storage)

### Installation

```bash
# Clone/navigate to project
cd "T:\Projects\pdf-orchestrator"

# Install Node.js dependencies
npm install

# Set up Python virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install Python dependencies
.venv\Scripts\python.exe -m pip install mcp python-socketio

# Install TEEI brand fonts (REQUIRED for TEEI documents)
powershell -ExecutionPolicy Bypass -File "scripts\install-fonts.ps1"
```

### Basic Usage

```bash
# Test with sample report job
node orchestrator.js example-jobs/report-sample.json

# Test with sample campaign job
node orchestrator.js example-jobs/campaign-sample.json
```

### Runbook Prompts

For Claude Code orchestration workflows, see:

- **Path 4 IDML handoff**: `PROMPTS\01_IDML_Orchestrator_Claude.md` - Build press-ready PDFs via IDML generation and InDesign MCP export
- **Path 5 Hybrid polish**: `PROMPTS\02_Hybrid_Orchestrator_Claude.md` - Build page mocks locally, then polish in InDesign
- **QA gates**: `PROMPTS\QA_Accessibility_and_Visual_Gates.md` - Automated quality checks and gate criteria

Use these prompts inside Claude Code to drive the orchestrator. They reference your existing directories, MCP tools, brand tokens, and PDF Services worker. No commands are required to use them.

---

## 🔌 MCP Server Setup

### Overview

The MCP (Model Context Protocol) servers enable direct control of Adobe InDesign and Illustrator from Cursor/Claude Code. This requires three components working together:

1. **WebSocket Proxy Server** (port 8013)
2. **Adobe UXP Plugins** (running inside InDesign/Illustrator)
3. **MCP Servers** (configured in Cursor)

### Step 1: Start the Proxy Server

**CRITICAL**: The proxy must start BEFORE Cursor/Claude Desktop!

```powershell
cd "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
node proxy.js
```

**Expected Output**:
```
adb-mcp Command proxy server running on ws://localhost:8013
```

**⚠️ Keep this terminal window open!** The proxy must stay running.

### Step 2: Configure Cursor MCP

The MCP servers are configured in `C:\Users\ovehe\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "adobe-indesign": {
      "command": "cmd",
      "args": ["/c", "C:\\Users\\ovehe\\.cursor\\wrappers\\adobe-indesign-mcp.cmd"]
    },
    "adobe-illustrator": {
      "command": "cmd",
      "args": ["/c", "C:\\Users\\ovehe\\.cursor\\wrappers\\adobe-illustrator-mcp.cmd"]
    }
  }
}
```

**Wrapper files** (`C:\Users\ovehe\.cursor\wrappers\`):
- `adobe-indesign-mcp.cmd` - Points to project's MCP server
- `adobe-illustrator-mcp.cmd` - Points to project's MCP server

Both wrappers use the project's virtual environment (`.venv`) and log to `logs/mcp/`.

### Step 3: Install Adobe UXP Plugins

#### InDesign Plugin

1. Open **UXP Developer Tools** (from Creative Cloud Desktop)
2. Click **File > Add Plugin**
3. Navigate to: `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id\`
4. Select **manifest.json**
5. Click **Load**

**Verify Installation**:
- Launch **Adobe InDesign**
- Go to **Window → Utilities → InDesign MCP Agent**
- Click **Connect** button
- Should show "Connected with ID: [socket-id]"

#### Illustrator Plugin

1. Enable CEP Debug Mode (Registry):
   ```
   HKEY_CURRENT_USER\SOFTWARE\Adobe\CSXS.11
   PlayerDebugMode = 1
   ```
2. Copy plugin to: `C:\Users\ovehe\AppData\Roaming\Adobe\CEP\extensions\com.mikechambers.ai`
3. Restart Illustrator

**Verify Installation**:
- Launch **Adobe Illustrator**
- Go to **Window → Extensions → Adobe Illustrator MCP**
- Click **Connect** button

### Step 4: Start Everything

**Correct Startup Order**:

1. ✅ **Start Proxy Server** (terminal window)
2. ✅ **Launch InDesign** → Open plugin panel → Click **Connect**
3. ✅ **Launch Illustrator** → Open plugin panel → Click **Connect**
4. ✅ **Restart Cursor** (to load MCP servers)

### Available MCP Tools

#### InDesign Server
- `create_document(width, height, pages, pages_facing, columns, margins)` - Creates a new InDesign document

#### Illustrator Server
- `get_documents()` - Returns information about open documents
- `get_active_document_info()` - Returns info about the active document
- `open_file(path)` - Opens an Illustrator file
- `export_png(path, ...)` - Exports the active document as PNG
- `execute_extend_script(script_string)` - Executes arbitrary ExtendScript code

### Testing MCP Connection

In Cursor, try:
```
Create a new InDesign document that is 800x600 points
```

**Expected Behavior**:
- InDesign creates a new document instantly
- Proxy window shows command received
- Cursor shows `adobe-indesign` in available MCP tools

### Troubleshooting MCP

**MCP tools not appearing**:
1. Verify proxy is running: `http://localhost:8013` should be accessible
2. Check Cursor MCP config: `C:\Users\ovehe\.cursor\mcp.json` syntax
3. Restart Cursor completely
4. Check logs: `logs/mcp/adobe-indesign.log` and `adobe-illustrator.log`

**Connection timeout**:
1. Verify proxy is running BEFORE starting Cursor
2. Check Adobe apps are open with plugins connected
3. Verify firewall isn't blocking port 8013

**Import errors**:
```bash
# Test Python dependencies
.venv\Scripts\python.exe -c "import mcp.server.fastmcp; import socketio; print('OK')"

# Test adb-mcp modules
.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'adb-mcp/mcp'); import core, socket_client; print('OK')"
```

---

## 🎨 TEEI Brand Guidelines

### Critical Rules

1. ✅ **ALWAYS follow TEEI brand guidelines** (see `reports/TEEI_AWS_Design_Fix_Report.md`)
2. ✅ **Use official TEEI colors**: Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
3. ✅ **Use official fonts**: Lora (headlines), Roboto Flex (body text)
4. 🔤 **Install fonts BEFORE automation**: Run `scripts/install-fonts.ps1` then restart InDesign
5. ❌ **NEVER use copper/orange colors** (not in TEEI brand palette)
6. ❌ **NEVER allow text cutoffs** (all text must be complete and visible)
7. ✅ **Always include actual metrics** (no "XX" placeholders)
8. ✅ **Photography required**: Warm, natural light, authentic moments (not stock)
9. ✅ **Test at multiple zoom levels**: 100%, 150%, 200% (verify no cutoffs)

### Official Color Palette

**Primary Colors:**
- **Nordshore #00393F** - Deep teal (80% usage recommended, primary brand color)
- **Sky #C9E4EC** - Light blue accent (secondary highlights)
- **Sand #FFF1E2** - Warm neutral background
- **Beige #EFE1DC** - Soft neutral background

**Accent Colors:**
- **Moss #65873B** - Natural green accent
- **Gold #BA8F5A** - Warm metallic accent (use for premium feel, metrics)
- **Clay #913B2F** - Rich terracotta accent

### Typography System

**Headlines**: Lora (serif) - Bold/Semibold, 28-48pt  
**Body Text**: Roboto Flex (sans-serif) - Regular, 11-14pt  
**Captions**: Roboto Flex Regular, 9pt

**Typography Scale**:
```
Document Title: Lora Bold, 42pt, Nordshore
Section Headers: Lora Semibold, 28pt, Nordshore
Subheads: Roboto Flex Medium, 18pt, Nordshore
Body Text: Roboto Flex Regular, 11pt, Black
Captions: Roboto Flex Regular, 9pt, Gray #666666
```

### Layout Standards

- **Grid**: 12-column with 20pt gutters
- **Margins**: 40pt all sides
- **Section breaks**: 60pt
- **Between elements**: 20pt
- **Between paragraphs**: 12pt
- **Line height (body)**: 1.5x
- **Line height (headlines)**: 1.2x

### Font Installation

**BEFORE running ANY automation**, install TEEI brand fonts:

```powershell
# Run as Administrator for best results
powershell -ExecutionPolicy Bypass -File "T:\Projects\pdf-orchestrator\scripts\install-fonts.ps1"
```

**Then RESTART InDesign** to load the new fonts!

**What Gets Installed**:
- **Lora** (8 styles): Regular, Medium, SemiBold, Bold + Italic variants
- **Roboto** (66 fonts): All weights (Thin → Black), Condensed, SemiCondensed + Italic variants

**Total**: 74 font files for complete TEEI brand compliance

### Design Fix Report

**Location**: `reports/TEEI_AWS_Design_Fix_Report.md`  
**Purpose**: Comprehensive guide to transform AWS document from D+ → A+ quality

**READ THIS BEFORE**: Starting any TEEI design work

---

## ⚙️ Configuration

### Environment Variables

Copy `config/.env.example` to `config/.env` and fill in:

```bash
# Adobe PDF Services
ADOBE_CLIENT_ID=your_client_id
ADOBE_CLIENT_SECRET=your_client_secret
ADOBE_ORGANIZATION_ID=your_org_id

# Cloudflare R2
R2_ACCOUNT_ID=your_account
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=pdf-outputs

# MCP Server (for local worker)
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8012
```

**Actual credentials**: Stored in `T:\Secrets\teei\` (NEVER commit to git)

### Routing Rules

Edit `config/orchestrator.config.json` to customize routing logic:

```json
{
  "routing": {
    "rules": [
      {
        "condition": "humanSession === true",
        "worker": "mcp"
      },
      {
        "condition": "jobType === 'campaign' && output.quality === 'high'",
        "worker": "mcp"
      }
    ],
    "defaultWorker": "pdfServices"
  }
}
```

---

## 📄 Job Format

### Report Job

```json
{
  "jobType": "report",
  "templateId": "report-annual-v1",
  "humanSession": false,
  "data": {
    "title": "Q4 Report",
    "subtitle": "2025 Annual Summary",
    "content": [
      {
        "type": "text",
        "content": "Your content here..."
      }
    ]
  },
  "output": {
    "format": "pdf",
    "destination": "reports/q4-2025.pdf",
    "quality": "standard"
  }
}
```

### Campaign Job

```json
{
  "jobType": "campaign",
  "templateId": "campaign-flyer-v2",
  "humanSession": true,
  "data": {
    "campaignName": "Spring Launch",
    "brand": "TEEI",
    "assets": [
      {
        "type": "image",
        "path": "assets/images/hero.jpg"
      }
    ]
  },
  "output": {
    "format": "pdf-print",
    "quality": "high",
    "destination": "campaigns/spring-launch.pdf"
  }
}
```

---

## 💻 Development

### Project Structure

```
pdf-orchestrator/
├── orchestrator.js          # Main controller
├── workers/                 # Worker implementations
├── schemas/                 # JSON validation
├── templates/               # Template registry
├── mcp-local/              # MCP server implementations
├── adb-mcp/                # Adobe MCP infrastructure
└── assets/                  # Fonts, images, resources
```

### Adding New Job Types

1. Create schema in `schemas/<type>-schema.json`
2. Add routing rules in `config/orchestrator.config.json`
3. Update workers to handle new type
4. Add example job in `example-jobs/`

### Testing

```bash
# Test with sample jobs
node orchestrator.js example-jobs/report-sample.json
node orchestrator.js example-jobs/campaign-sample.json

# Test .env loading
node -e "require('dotenv').config({path:'./config/.env'}); console.log('R2:', process.env.R2_BUCKET_NAME)"
```

### Logs

- **Orchestrator logs**: Console output
- **MCP server logs**: `logs/mcp/adobe-indesign.log` and `adobe-illustrator.log`
- **Worker logs**: Console output (with worker name prefix)

---

## 🔧 Troubleshooting

### MCP Connection Issues

**Problem**: "Cannot connect to MCP server"

**Solution**:
1. Verify proxy is running: Check terminal window shows "server running on ws://localhost:8013"
2. Verify Adobe apps are open with plugins connected
3. Check MCP config: `C:\Users\ovehe\.cursor\mcp.json`
4. Restart Cursor completely
5. Check logs: `logs/mcp/adobe-indesign.log`

### Font Issues

**Problem**: "Font not found" or wrong fonts in documents

**Solution**:
1. Run font installation: `scripts/install-fonts.ps1`
2. **Restart InDesign** (fonts load at startup)
3. Verify fonts in Windows: `Get-ChildItem "$env:WINDIR\Fonts" | Where-Object { $_.Name -like "Lora*" -or $_.Name -like "Roboto*" }`

### Color Application Issues

**Problem**: "Colors not applying correctly"

**Solution**:
1. Verify color hex codes match brand guidelines exactly
2. Use CMYK for print, RGB for digital
3. Check color profile settings in InDesign
4. Use `apply_fixed_colors.py` to force correct colors

### Text Cutoff Issues

**Problem**: "Text getting cut off at edges"

**Solution**:
1. Increase text frame width by 20pt
2. Reduce font size by 2pt
3. Check 40pt margin requirements
4. Test at 150% and 200% zoom
5. Use diagnostic tool: `python visual_diagnostic.py`

### Export Quality Issues

**Problem**: "PDF quality not meeting standards"

**Solution**:
1. Verify export settings: 300 DPI for print, 150+ for digital
2. Check image resolution in source files
3. Use world-class export script: `python export_world_class_pdf.py`
4. Validate output: `python validate_world_class.py`

---

## 📚 Additional Documentation

- **Design Fix Report**: `reports/TEEI_AWS_Design_Fix_Report.md` - Comprehensive brand compliance guide
- **Quick Start**: `QUICKSTART.md` - 5-minute setup guide
- **MCP Setup**: `mcp-local/README.md` - Detailed MCP server documentation
- **Adobe MCP Setup**: `adb-mcp/SETUP.md` - Complete Adobe MCP installation guide
- **Status**: `STATUS.md` - Current project status and progress

---

## 🎯 Project Goals

**Current Grade**: D+ (multiple critical violations)  
**Target Grade**: A+ (world-class quality)

**Success Criteria**:
✅ All brand guidelines followed exactly  
✅ No text cutoffs anywhere  
✅ Actual metrics visible (no "XX")  
✅ Warm authentic photography included  
✅ Professional layout with clear hierarchy  
✅ Passes 100%/150%/200% zoom test  
✅ AWS approves for partnership presentation  

---

## 📝 License

Private project - All rights reserved

**Based on**: [Mike Chambers' adb-mcp](https://github.com/mikechambers/adb-mcp) (MIT License)

---

**Last Updated**: 2025-11-04  
**Status**: Active development - Phase 1 (Foundation) in progress  
**Next Milestone**: Fix all critical violations (colors, fonts, text cutoffs)
