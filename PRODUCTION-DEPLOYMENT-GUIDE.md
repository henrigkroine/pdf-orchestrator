# PDF Orchestrator - Production Deployment Guide

**Version**: 1.0.0
**Date**: 2025-11-06
**Status**: Production-Ready

---

## Overview

This guide provides step-by-step instructions for deploying the PDF Orchestrator system to production.

---

## Prerequisites

### Required Software
- **Node.js**: v18+ (tested on v22.21.0)
- **Python**: 3.8+
- **Adobe InDesign**: 2024 or later (for MCP worker)
- **Adobe Illustrator**: 2024 or later (for MCP worker, optional)

### Required Accounts
- **Adobe Developer Account**: For PDF Services API credentials
- **Cloudflare Account**: For R2 storage (optional)

---

## Installation

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd pdf-orchestrator
```

### Step 2: Install Dependencies

**Node.js dependencies:**
```bash
npm install
```

**Python dependencies:**
```bash
python3 -m pip install -r requirements.txt
# OR
python setup-pdf-tools.py
```

### Step 3: Install TEEI Brand Fonts

**CRITICAL**: Install fonts BEFORE running any automation:

```powershell
# Windows (PowerShell as Administrator)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"
```

Then **restart Adobe InDesign** to load the fonts.

**Fonts installed:**
- Lora (8 variants) - Headlines
- Roboto Flex (58 variants) - Body text

**Location**: `assets/fonts/`

---

## Configuration

### Step 1: Set Up Environment Variables

Copy the template:
```bash
cp config/.env.example config/.env
```

Edit `config/.env` with your credentials:

#### **Adobe PDF Services API** (REQUIRED for PDF Services worker)
```bash
ADOBE_CLIENT_ID=your_actual_client_id
ADOBE_CLIENT_SECRET=your_actual_client_secret
ADOBE_ORGANIZATION_ID=your_actual_org_id
```

**How to get Adobe credentials:**
1. Go to https://developer.adobe.com/console
2. Create a new project
3. Add "PDF Services API" to the project
4. Generate OAuth Server-to-Server credentials
5. Copy Client ID, Client Secret, and Organization ID

#### **MCP Server Configuration** (REQUIRED for MCP worker)
```bash
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8012
MCP_SERVER_PROTOCOL=http
```

#### **Cloudflare R2 Storage** (OPTIONAL - for cloud output storage)
```bash
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_ENDPOINT_URL=https://your_account_id.r2.cloudflarestorage.com
R2_BUCKET_OUTPUTS=pdf-outputs
```

#### **Monitoring & Alerts** (OPTIONAL)
```bash
RESEND_API_KEY=your_resend_api_key
ALERT_FROM=alerts@yourdomain.com
ALERT_TO=your_email@yourdomain.com
ENABLE_RESEND_ALERTS=true
```

### Step 2: Verify Configuration

Test that the configuration is valid:

```bash
# Test MCP worker (requires InDesign running)
python test_connection.py

# Test orchestrator loading
node orchestrator.js --version
```

---

## Starting Services

### Option 1: MCP Worker (Local InDesign/Illustrator Automation)

**Requirements:**
- Adobe InDesign running on the machine
- UXP Developer Tool installed
- MCP server running

**Start MCP Server:**
```bash
# Windows
cd mcp-local
launch-indesign-mcp.cmd

# Linux/Mac (requires Python)
python3 mcp-local/indesign-mcp-server.py
```

**Expected Output:**
```
Adobe InDesign MCP Server running on stdio
[MCP] Initialized for indesign
[MCP] Connected to Socket.IO proxy at http://localhost:8013
```

**Verify Connection:**
```bash
python test_connection.py
# Should output: ✅ MCP connection successful
```

### Option 2: PDF Services Worker (Cloud-based Automation)

**Requirements:**
- Adobe PDF Services API credentials in `.env`
- Internet connection

**No server startup required** - PDF Services worker connects on-demand to Adobe's cloud.

**Verify Credentials:**
```bash
# Test authentication (will be added in next version)
# For now, credentials are validated on first job execution
```

---

## Running Jobs

### CLI Interface

**Process a job file:**
```bash
node orchestrator.js example-jobs/campaign-sample.json
```

**Job file structure:**
```json
{
  "jobType": "report",
  "templateId": "report-annual-v1",
  "humanSession": false,
  "data": { /* job data */ },
  "output": { /* output settings */ }
}
```

### Routing Logic

Jobs are automatically routed based on configuration:

- **MCP Worker**: Used when `humanSession: true` or job requires interactive Adobe apps
- **PDF Services Worker**: Used when `humanSession: false` (serverless, scalable)

**Configuration file**: `config/orchestrator.config.json`

---

## Monitoring

### Cost Tracking

The orchestrator automatically tracks costs for Adobe PDF Services API calls.

**View current spend:**
```bash
# Check daily/monthly spend
node -e "const PDFOrchestrator = require('./orchestrator.js'); const orc = new PDFOrchestrator(); orc.getCostStatus().then(console.log)"
```

**Configure cost limits:**

Edit `config/cost-limits.json`:
```json
{
  "budget": {
    "dailyCap": 50,
    "monthlyCap": 1000,
    "alertThresholds": [0.5, 0.75, 0.9]
  }
}
```

### Circuit Breakers

Circuit breakers protect against cascading failures:

- **Failure Threshold**: 5 failures triggers circuit open
- **Timeout**: 60 seconds per request
- **Reset Timeout**: 5 minutes before retry

**Monitor circuit breaker status:**
```bash
# Check worker status including circuit breakers
node -e "const PDFOrchestrator = require('./orchestrator.js'); const orc = new PDFOrchestrator(); orc.getWorkerStatus().then(console.log)"
```

### Logging

Logs are written to:
- **Console**: Real-time logs with timestamps
- **Database**: Job history in `database/orchestrator.db`

**Query job history:**
```bash
sqlite3 database/orchestrator.db "SELECT * FROM cost_tracking ORDER BY timestamp DESC LIMIT 10;"
```

---

## Production Workflows

### Standard Document Creation Workflow

1. **Create Document**
```bash
python create_brand_compliant_ultimate.py
```

2. **Validate Against Brand Guidelines**
```bash
python validate_world_class.py
```

3. **Export Production PDF**
```bash
python export_world_class_pdf.py
```

4. **Run Visual QA**
```bash
node scripts/validate-pdf-quality.js exports/output.pdf
```

### Using the Orchestrator

**Create job file** (`jobs/my-job.json`):
```json
{
  "jobType": "document",
  "templateId": null,
  "humanSession": true,
  "data": {
    "title": "TEEI AWS Partnership Brief",
    "content": { /* ... */ }
  },
  "output": {
    "format": "pdf",
    "destination": "exports/",
    "fileName": "TEEI_AWS_Partnership_v1.pdf"
  }
}
```

**Execute job:**
```bash
node orchestrator.js jobs/my-job.json
```

---

## Production Scripts

### Tier 1: Core Production Scripts

**Document Creation:**
- `create_brand_compliant_ultimate.py` (650 lines) - PRIMARY
- `create_world_class_document.py` (602 lines) - Referenced in CLAUDE.md

**Color Application:**
- `apply_fixed_colors.py` (69 lines) - PRIMARY
- `apply_colors_and_export.py` (73 lines) - Wrapper with export

**Export:**
- `export_world_class_pdf.py` (81 lines) - PRIMARY

**Validation:**
- `validate_document.py` (429 lines) - Comprehensive validation
- `validate_world_class.py` (103 lines) - Quick check
- `run_diagnostics.py` (47 lines) - Instant diagnostic

**Testing:**
- `test_connection.py` (46 lines) - MCP connection test

**Infrastructure:**
- `orchestrator.js` (406 lines) - MAIN CONTROLLER
- `indesign-mcp-full.py` (1,242 lines) - MCP server
- `pipeline.py` (435 lines) - Export pipeline

### Scripts Location

**Root directory:** 35 production-ready scripts
**Archive directory:** 43 archived/experimental scripts

See `archive/README.md` for details on archived scripts.

---

## Quality Assurance

### Automated PDF Validation

**3-layer QA system:**

#### Layer 1: PDF Quality Validator
```bash
# Validate PDF dimensions, content, colors, fonts
node scripts/validate-pdf-quality.js exports/document.pdf
```

**Checks:**
- ✅ Page dimensions (8.5×11 inch Letter)
- ✅ Text cutoffs (content extending beyond page)
- ✅ Image loading (all images loaded successfully)
- ✅ Color validation (TEEI brand colors)
- ✅ Font validation (Lora for headlines, Roboto for body)

#### Layer 2: Visual Baseline System
```bash
# Create baseline from approved PDF
node scripts/create-reference-screenshots.js exports/approved.pdf baseline-v1
```

#### Layer 3: Visual Regression Testing
```bash
# Compare new PDF against baseline
node scripts/compare-pdf-visual.js exports/new-version.pdf baseline-v1
```

**Thresholds:**
- < 5% = ✅ PASS (anti-aliasing only)
- 5-10% = ⚠️ MINOR (small changes)
- 10-20% = ⚠️ WARNING (noticeable differences)
- 20-30% = ❌ MAJOR (significant issues)
- \> 30% = 🚨 CRITICAL (completely different)

---

## Troubleshooting

### MCP Connection Issues

**Problem**: "Cannot connect to MCP server"

**Solution:**
1. Verify InDesign is running
2. Check MCP server is started: `launch-indesign-mcp.cmd`
3. Test connection: `python test_connection.py`
4. Restart InDesign and MCP server

### PDF Services Authentication Fails

**Problem**: "Adobe authentication failed"

**Solution:**
1. Verify credentials in `config/.env`
2. Check credentials are valid at https://developer.adobe.com/console
3. Ensure `ADOBE_CLIENT_ID` and `ADOBE_CLIENT_SECRET` are correct
4. Check organization ID matches your Adobe account

### Circuit Breaker Open

**Problem**: "Circuit breaker OPEN"

**Solution:**
1. Wait 5 minutes for automatic reset
2. Check service status: `node -e "..." `(see Monitoring section)
3. Investigate underlying failures in logs
4. Adjust failure threshold in `config/cost-limits.json` if needed

### Cost Budget Exceeded

**Problem**: "Budget exceeded, operation blocked"

**Solution:**
1. Check current spend: (see Monitoring section)
2. Increase limits in `config/cost-limits.json`
3. Wait for daily/monthly reset
4. Review job queue for queued operations

---

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Store credentials in secrets manager** for production (e.g., AWS Secrets Manager, Azure Key Vault)
3. **Use environment-specific configs** (dev, staging, production)
4. **Rotate API keys quarterly**
5. **Enable alerts for suspicious activity**
6. **Limit network access** to MCP server (localhost only)

---

## Maintenance

### Daily
- Check cost tracking dashboard
- Review failed jobs in `database/orchestrator.db`
- Monitor circuit breaker status

### Weekly
- Review logs for errors
- Check disk space in `exports/` directory
- Verify all workers are healthy

### Monthly
- Rotate logs: `scripts/rotate-logs.ps1`
- Update dependencies: `npm update` and `pip install --upgrade`
- Review and archive old jobs
- Update brand assets if needed

### Quarterly
- Update Adobe credentials (if expiring)
- Review cost-limits configuration
- Performance optimization review
- Update fonts if TEEI brand guidelines change

---

## Scaling

### Horizontal Scaling

**PDF Services Worker**: Scales automatically (cloud-based)

**MCP Worker**: Requires multiple machines with InDesign:
1. Deploy orchestrator to each machine
2. Configure load balancer
3. Use shared database for job queue
4. Configure failover for high availability

### Vertical Scaling

**Increase throughput:**
- Adjust `config/orchestrator.config.json` worker concurrency
- Increase circuit breaker timeout for long-running jobs
- Optimize templates for faster rendering

---

## Support

**Documentation:**
- Main guide: `CLAUDE.md`
- This guide: `PRODUCTION-DEPLOYMENT-GUIDE.md`
- Archive docs: `archive/README.md`
- Design standards: `reports/TEEI_AWS_Design_Fix_Report.md`

**Logs:**
- Console output
- `database/orchestrator.db` (job history)

**Contact:**
- GitHub Issues: <repository-url>/issues
- Email: support@yourdomain.com

---

**Last Updated**: 2025-11-06
**Version**: 1.0.0
**Status**: Production-Ready ✅
