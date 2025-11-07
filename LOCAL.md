# LOCAL SETUP CHECKLIST

**What needs to be configured on YOUR local machine**

This document lists everything that needs to be set up locally that is NOT in the git repository (for security/environment reasons).

---

## 🔑 API KEYS & CREDENTIALS (CRITICAL)

### 1. Gemini API Key (Required for AI Vision QA)
**File**: `config/.env`

```bash
# Current (placeholder):
GEMINI_API_KEY=your_gemini_api_key_here

# Change to your actual key:
GEMINI_API_KEY=AIzaSyAbc123def456ghi789...
```

**How to get**:
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste into `config/.env`

**Cost**: FREE (1,500 requests/day)

**Used by**:
- `scripts/validate-pdf-ai-vision.js` - AI Vision QA system

---

### 2. Adobe PDF Services API (Required for PDF Services Worker)
**File**: `config/.env`

```bash
# Current (placeholder):
ADOBE_CLIENT_ID=your_client_id_here
ADOBE_CLIENT_SECRET=your_client_secret_here
ADOBE_ORGANIZATION_ID=your_org_id_here

# Change to your actual credentials:
ADOBE_CLIENT_ID=abc123def456ghi789...
ADOBE_CLIENT_SECRET=p0-xyz987uvw654rst321...
ADOBE_ORGANIZATION_ID=12345678901234567890@AdobeOrg
```

**How to get**:
1. Go to: https://developer.adobe.com/console
2. Create a new project
3. Add "PDF Services API" to the project
4. Generate OAuth Server-to-Server credentials
5. Copy Client ID, Client Secret, and Organization ID
6. Paste into `config/.env`

**Cost**: FREE tier available, then usage-based pricing

**Used by**:
- `workers/pdf_services_worker/index.js` - PDF Services worker
- `orchestrator.js` - When routing to PDF Services

---

### 3. Cloudflare R2 Storage (Optional - for cloud storage)
**File**: `config/.env`

```bash
# Current (placeholder):
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com

# Change to your actual credentials:
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=1234567890abcdef...
R2_SECRET_ACCESS_KEY=xyz789uvw456rst123...
R2_ENDPOINT_URL=https://abc123def456.r2.cloudflarestorage.com
```

**How to get**:
1. Go to: https://dash.cloudflare.com/
2. Go to R2 Object Storage
3. Create API token
4. Copy credentials
5. Paste into `config/.env`

**Cost**: FREE tier: 10 GB storage, 1 million Class A operations/month

**Used by**:
- `workers/pdf_services_worker/index.js` - Optional cloud storage for outputs

---

### 4. Anthropic API Key (Optional - for Claude integration)
**File**: `config/.env`

```bash
# Current (placeholder):
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Change to your actual key:
ANTHROPIC_API_KEY=sk-ant-api03-abc123...
```

**How to get**:
1. Go to: https://console.anthropic.com/
2. Create API key
3. Copy the key
4. Paste into `config/.env`

**Used by**:
- Intelligent routing (if implemented)
- Content analysis (if implemented)

---

### 5. OpenAI API Key (Optional - for image generation)
**File**: `config/.env`

```bash
# Current (placeholder):
OPENAI_API_KEY=your_openai_api_key_here

# Change to your actual key:
OPENAI_API_KEY=sk-proj-abc123...
```

**How to get**:
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy the key
4. Paste into `config/.env`

**Used by**:
- Image generation (if needed)
- Asset creation workflows

---

### 6. Resend Email API (Optional - for alerts)
**File**: `config/.env`

```bash
# Current (placeholder):
RESEND_API_KEY=your_resend_api_key_here
ALERT_FROM=alerts@yourpersonalai.net
ALERT_TO=your_email@yourpersonalai.net

# Change to your actual credentials:
RESEND_API_KEY=re_abc123def456...
ALERT_FROM=alerts@yourdomain.com
ALERT_TO=yourname@yourdomain.com
```

**How to get**:
1. Go to: https://resend.com/
2. Sign up and create API key
3. Verify domain for sending emails
4. Copy credentials
5. Paste into `config/.env`

**Used by**:
- `config/alerting/` - Cost and failure alerts
- Monitoring system

---

## 💻 SOFTWARE INSTALLATIONS

### 1. Node.js (REQUIRED)
**Current**: v22.21.0
**Minimum**: v18.x

**Check if installed**:
```bash
node --version
```

**Install if needed**:
- Windows: https://nodejs.org/en/download/
- Mac: `brew install node`
- Linux: `sudo apt install nodejs npm`

**Used by**: All JavaScript scripts, orchestrator, validators

---

### 2. Python (REQUIRED)
**Minimum**: Python 3.8+

**Check if installed**:
```bash
python --version
# or
python3 --version
```

**Install if needed**:
- Windows: https://www.python.org/downloads/
- Mac: `brew install python3`
- Linux: `sudo apt install python3 python3-pip`

**Used by**: MCP server, creation scripts, validators

---

### 3. Adobe InDesign (Required for MCP Worker)
**Version**: InDesign 2024 or later

**Install**:
1. Download from: https://www.adobe.com/products/indesign.html
2. Install with Creative Cloud

**Used by**:
- MCP worker for local document automation
- All `create_*.py` scripts
- InDesign-based workflows

**Alternative**: If you don't have InDesign, you can use PDF Services worker only (cloud-based).

---

### 4. Adobe Illustrator (Optional - for campaign graphics)
**Version**: Illustrator 2024 or later

**Install**:
1. Download from: https://www.adobe.com/products/illustrator.html
2. Install with Creative Cloud

**Used by**:
- MCP worker for campaign/poster generation
- Illustrator-based templates

---

### 5. UXP Developer Tool (Required for MCP Worker)
**Version**: Latest

**Install**:
1. Download from: https://developer.adobe.com/
2. Install UXP Developer Tool
3. Load the MCP plugin

**Used by**:
- MCP server to communicate with InDesign/Illustrator

---

## 🎨 BRAND ASSETS (CRITICAL)

### 1. TEEI Brand Fonts (REQUIRED)
**Fonts needed**:
- Lora (8 variants: Regular, Medium, SemiBold, Bold + Italics)
- Roboto Flex (58 variants: Full family with all weights)

**Location**: `assets/fonts/`

**Install**:
```powershell
# Windows (PowerShell as Administrator)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"
```

**Then**: RESTART Adobe InDesign to load fonts!

**Check if installed**:
1. Open InDesign
2. Open font menu
3. Search for "Lora" and "Roboto Flex"
4. If found: ✅ Installed correctly

**Used by**:
- ALL document creation scripts
- Brand compliance validation
- Typography system

⚠️ **CRITICAL**: Documents will look wrong without these fonts!

---

### 2. TEEI Logos (REQUIRED)
**Logos needed**:
- `teei-logo-dark.png` (Nordshore color)
- `teei-logo-white.png` (white version)
- `together-ukraine-logo.png` (white version)

**Location**: `assets/images/`

**Source**:
- Original location: `T:\TEEI\Logos\`
- Should already be in `assets/images/`

**Check if present**:
```bash
ls -lh assets/images/*.png
```

**Used by**:
- Document headers
- Brand materials
- Partnership documents

---

### 3. Partner Logos (Optional but Recommended)
**Logos included**:
- `assets/partner-logos/aws.svg` (Amazon Web Services)
- `assets/partner-logos/google.svg` (Google)
- `assets/partner-logos/cornell.svg` (Cornell University)
- `assets/partner-logos/oxford.svg` (Oxford University Press)

**Check if present**:
```bash
ls -lh assets/partner-logos/*.svg
```

**Download more** (if needed):
See: `docs/PARTNER-LOGO-INTEGRATION-GUIDE.md`

**Used by**:
- Partnership documents
- Logos section in PDFs

---

## 📦 NPM PACKAGES

### Already Installed
All npm packages are already installed (run `npm install` if needed):
- ✅ `@google/generative-ai` - Gemini Vision AI
- ✅ `playwright` - Browser automation
- ✅ `sharp` - Image processing
- ✅ `pdf-to-img` - PDF conversion
- ✅ `pdf-lib` - PDF manipulation
- ✅ `ajv` - JSON schema validation
- ✅ And 40+ other dependencies

**Reinstall if needed**:
```bash
npm install
```

---

## 🐍 PYTHON PACKAGES

### Required Packages
Install with:
```bash
pip install -r requirements.txt

# OR use setup script:
python setup-pdf-tools.py
```

**Key packages**:
- `requests` - HTTP requests
- `pdfplumber` - PDF analysis
- `Pillow` - Image processing
- And more...

**Check if installed**:
```bash
pip list | grep pdf
pip list | grep Pillow
```

---

## 🗄️ DATABASE

### SQLite Database (Auto-created)
**File**: `database/orchestrator.db`

**Status**: ✅ Already created (98 KB)

**Contains**:
- Job history
- Cost tracking
- Fallback queue
- Telemetry data

**No action needed** - database is created automatically on first run.

---

## 🔧 CONFIGURATION FILES

### Main Config (Already Present)
**File**: `config/orchestrator.config.json`

**Status**: ✅ Already configured with default settings

**No changes needed** unless you want to customize:
- Routing rules
- Worker timeouts
- Template paths

---

### Cost Limits (Already Present)
**File**: `config/cost-limits.json`

**Status**: ✅ Already configured with sensible defaults
- Daily cap: $50
- Monthly cap: $1,000

**Optional**: Adjust limits if needed for your usage

---

## 🚀 MCP SERVER SETUP

### Local MCP Server (Required for MCP Worker)

**Files**:
- `mcp-local/indesign-mcp-server.py`
- `mcp-local/launch-indesign-mcp.cmd` (Windows)

**Start server**:
```bash
# Windows
cd mcp-local
launch-indesign-mcp.cmd

# Linux/Mac
python3 mcp-local/indesign-mcp-server.py
```

**Test connection**:
```bash
python test_connection.py
```

**Expected output**: `✅ MCP connection successful`

**Configuration**:
```bash
# In config/.env:
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8012
MCP_SERVER_PROTOCOL=http
```

**No changes needed** unless running on different port/host.

---

## 📋 SETUP CHECKLIST

### Priority 1: CRITICAL (Must Do)
- [ ] Install Node.js v18+
- [ ] Install Python 3.8+
- [ ] Run `npm install`
- [ ] Install TEEI fonts: `scripts/install-fonts.ps1`
- [ ] Restart InDesign (after font install)
- [ ] Configure `GEMINI_API_KEY` in `config/.env`

### Priority 2: HIGH (Should Do)
- [ ] Install Adobe InDesign 2024+
- [ ] Configure `ADOBE_CLIENT_ID`, `ADOBE_CLIENT_SECRET`, `ADOBE_ORGANIZATION_ID`
- [ ] Start MCP server and test connection
- [ ] Verify TEEI logos in `assets/images/`

### Priority 3: MEDIUM (Nice to Have)
- [ ] Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- [ ] Configure `RESEND_API_KEY` for email alerts
- [ ] Download additional partner logos
- [ ] Install Adobe Illustrator

### Priority 4: OPTIONAL
- [ ] Configure `ANTHROPIC_API_KEY`
- [ ] Configure `OPENAI_API_KEY`
- [ ] Adjust cost limits in `config/cost-limits.json`
- [ ] Customize routing rules in `config/orchestrator.config.json`

---

## ⚡ QUICK START (Minimum Setup)

**To get started quickly (just AI Vision QA)**:

1. Get Gemini API key: https://makersuite.google.com/app/apikey
2. Edit `config/.env`: `GEMINI_API_KEY=your_key_here`
3. Run: `bash test-ai-vision.sh`

**That's it!** AI Vision QA will work immediately.

---

**To run full orchestrator (document creation)**:

1. Complete Priority 1 checklist (above)
2. Complete Priority 2 checklist (above)
3. Run: `node orchestrator.js example-jobs/campaign-sample.json`

---

## 🆘 TROUBLESHOOTING

### "GEMINI_API_KEY not configured"
**Solution**: Edit `config/.env` and add your actual Gemini API key

### "Adobe authentication failed"
**Solution**:
1. Get credentials from https://developer.adobe.com/console
2. Add to `config/.env`
3. Verify credentials are correct

### "Cannot connect to MCP server"
**Solution**:
1. Make sure InDesign is running
2. Start MCP server: `mcp-local/launch-indesign-mcp.cmd`
3. Test: `python test_connection.py`

### "Font not found"
**Solution**:
1. Run: `scripts/install-fonts.ps1`
2. **RESTART InDesign** (critical!)
3. Verify fonts in InDesign font menu

### "Module not found"
**Solution**:
1. Run: `npm install`
2. Run: `pip install -r requirements.txt`

---

## 📞 GETTING HELP

**Documentation**:
- This file: `LOCAL.md` (setup checklist)
- Main guide: `PRODUCTION-DEPLOYMENT-GUIDE.md` (comprehensive)
- AI Vision: `AI-VISION-QA-QUICK-START.md`
- Testing: `TEST-AI-VISION-INSTRUCTIONS.md`

**Key Links**:
- Gemini API: https://makersuite.google.com/app/apikey
- Adobe Console: https://developer.adobe.com/console
- Cloudflare R2: https://dash.cloudflare.com/
- Resend Email: https://resend.com/

---

## 🎯 WHAT'S ALREADY DONE

You **DON'T** need to:
- ❌ Install npm packages (already done: `npm install`)
- ❌ Create database (auto-created on first run)
- ❌ Configure orchestrator (defaults are sensible)
- ❌ Download fonts (already in `assets/fonts/`)
- ❌ Download logos (already in `assets/images/`)
- ❌ Set up cost tracking (already configured)
- ❌ Write validation scripts (all complete)

You **ONLY** need to:
- ✅ Add API keys to `config/.env`
- ✅ Install software (Node, Python, InDesign)
- ✅ Install fonts with script
- ✅ Restart InDesign

**90% is already set up!** Just add your credentials and test.

---

## 📊 STATUS SUMMARY

| Component | Status | Action Required |
|-----------|--------|-----------------|
| Node.js packages | ✅ Installed | None |
| Python packages | ✅ Defined | Run `pip install` |
| Database | ✅ Created | None |
| Config files | ✅ Present | Add API keys |
| Fonts | ✅ Downloaded | Run install script |
| Logos | ✅ Present | Verify location |
| Documentation | ✅ Complete | Read guides |
| Scripts | ✅ All written | None |
| Workers | ✅ Implemented | Configure API keys |
| AI Vision QA | ✅ Ready | Add Gemini key |

**Overall**: 🟢 95% Complete - Just needs your credentials!

---

**Last Updated**: 2025-11-06
**File**: `LOCAL.md`
**Purpose**: Local setup checklist (not in git)
