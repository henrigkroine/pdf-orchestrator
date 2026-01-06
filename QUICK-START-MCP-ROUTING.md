# 🚀 Quick Start: MCP Routing Verification

**Purpose**: 90-second verification that premium PDF jobs route through MCP (not PDF Services API)

**Critical Context**: Partnership, program, and report documents MUST use MCP worker for brand-compliant InDesign automation. PDF Services API lacks the precision and quality control needed for premium documents.

---

## ⚡ 90-Second Verification Checklist

### 1. Run Verification Script

```powershell
cd "T:\Projects\pdf-orchestrator"
.\scripts\verify-mcp-routing.ps1
```

**Expected Output**: 🟢 ALL CHECKS PASSED

If you see 🔴 ISSUES FOUND, follow the recommended fixes in the script output.

### 2. Manual Quick Checks (A+ and World-Class Quality)

```powershell
# Check MCP proxy is running
curl http://localhost:8013/health
# Should return: {"status":"ok"}

# Check orchestrator config
Get-Content "T:\Projects\pdf-orchestrator\config\orchestrator.config.json" | ConvertFrom-Json | Select-Object -ExpandProperty routing | Select-Object defaultWorker
# Should show: defaultWorker : mcp

# Verify routing rules include premium types
Get-Content "T:\Projects\pdf-orchestrator\config\orchestrator.config.json" | Select-String -Pattern "partnership|program|report"
# Should show matches in routing rules

# Verify quality threshold (90 for A+, 95 for World-Class)
Get-Content "T:\Projects\pdf-orchestrator\config\orchestrator.config.json" | Select-String -Pattern "threshold.*(90|95)"
# Should show: validation_threshold: 90 (A+) OR 95 (World-Class)

# Verify High Quality Print preset
Get-Content "T:\Projects\pdf-orchestrator\config\orchestrator.config.json" | Select-String -Pattern "High Quality Print"
# Should show: pdf_preset: "High Quality Print"

# Verify intent-aware validation support
Get-Content "T:\Projects\pdf-orchestrator\config\orchestrator.config.json" | Select-String -Pattern "intent"
# Should show: output.intent support (print/screen)
```

### 3. Test with Sample Job

```bash
node orchestrator.js example-jobs/world-class-sample.json
```

**Watch for**:
- ✅ Router trace shows "Selected worker: mcp"
- ✅ Export preset logged as "High Quality Print"
- ✅ Validator report returns total >= 90
- ✅ Fonts embedded: true
- ✅ Forbidden colors absent

---

## 🔧 Common Misconfigurations & Fixes

### Issue 1: MCP Proxy Not Running

**Symptom**: `curl http://localhost:8013/health` fails

**Fix**:
```powershell
cd "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
node proxy.js
```

**Keep terminal window open!** The proxy must stay running.

**Root Cause**: Proxy must start BEFORE Cursor/Claude Desktop loads MCP servers.

---

### Issue 2: Wrong Default Worker

**Symptom**: `defaultWorker: "pdfServices"` in config

**Fix**:
```json
// In config/orchestrator.config.json
{
  "routing": {
    "defaultWorker": "mcp",  // ✅ CORRECT (was: "pdfServices")
    "rules": [...]
  }
}
```

**Why This Matters**:
- `defaultWorker: "pdfServices"` → Premium docs use low-quality API automation ❌
- `defaultWorker: "mcp"` → Premium docs use high-quality InDesign automation ✅

**Impact**: Without this fix, partnership/program/report docs will:
- Skip brand compliance checks
- Use generic templates (no TEEI colors/fonts)
- Produce lower-quality PDFs
- Miss human oversight checkpoints

---

### Issue 3: Missing Routing Rules

**Symptom**: No rules mention "partnership", "program", or "report"

**Fix**: Add to `routing.rules` array in `orchestrator.config.json`:

```json
{
  "condition": "jobType === 'partnership' || jobType === 'program' || jobType === 'report'",
  "worker": "mcp",
  "reason": "Premium documents require MCP for quality control and brand compliance"
}
```

**Alternative (more explicit)**:
```json
[
  {
    "condition": "jobType === 'partnership'",
    "worker": "mcp",
    "reason": "Partnership documents require brand-compliant InDesign automation"
  },
  {
    "condition": "jobType === 'program'",
    "worker": "mcp",
    "reason": "Program materials require human oversight"
  },
  {
    "condition": "jobType === 'report'",
    "worker": "mcp",
    "reason": "Reports require high-quality layout and typography"
  }
]
```

**Why Multiple Rules?**: Explicit rules make routing logic transparent and easier to debug.

---

### Issue 4: InDesign Plugin Not Connected

**Symptom**: Verification passes but jobs fail with "MCP server timeout"

**Fix**:
1. Open **Adobe InDesign**
2. Go to **Window → Utilities → InDesign MCP Agent**
3. Click **Connect** button
4. Should show: "Connected with ID: [socket-id]"

**Common Causes**:
- InDesign not running
- Plugin not installed (see README.md MCP Server Setup)
- Proxy started AFTER InDesign launched (restart InDesign)

---

## 📊 Router Trace Interpretation Guide

When running a job, watch the console output for routing decisions:

### Example 1: Correct MCP Routing (World-Class 95+ Quality) ✅

```
[INFO] Processing job: world-class-sample.json
[INFO] Job type: partnership, worldClass: true
[ROUTER] Evaluating routing rules...
[ROUTER] Rule matched: jobType === 'partnership'
[ROUTER] Selected worker: mcp
[ROUTER] Reason: Premium documents require MCP for quality control
[ROUTER] MCP Mutex: Acquired (serialized execution)
[MCP] Connecting to MCP server at localhost:8012...
[MCP] Job submitted successfully
[MCP] Export preset: High Quality Print
[MCP] World-class mode: ENABLED
[QA] Validation threshold: 95 (World-Class quality)
[QA] Intent-aware validation: print (300 DPI CMYK)
[QA] Fonts embedded: true
[QA] Final score: 96/100 ✅ PASSED
```

**Key Indicators**:
- ✅ "Selected worker: mcp"
- ✅ "MCP Mutex: Acquired" (serialized execution, no parallel jobs)
- ✅ "Export preset: High Quality Print"
- ✅ "Validation threshold: 95" (World-Class) OR "90" (A+)
- ✅ "Intent-aware validation: print"
- ✅ "Fonts embedded: true"
- ✅ Final score >= 95 (World-Class) OR >= 90 (A+)

---

### Example 2: Incorrect PDF Services Routing ❌

```
[INFO] Processing job: premium-sample.json
[INFO] Job type: partnership
[ROUTER] Evaluating routing rules...
[ROUTER] No rules matched
[ROUTER] Using default worker: pdfServices
[PDF_SERVICES] Uploading assets to Adobe PDF Services...
```

**Red Flags**:
- ❌ "No rules matched"
- ❌ "Using default worker: pdfServices"
- ❌ Job continues to PDF Services API

**What Went Wrong**:
1. No routing rule for "partnership" job type
2. defaultWorker is set to "pdfServices"
3. Premium document will use low-quality API automation

**Fix**: Add routing rule OR change defaultWorker to "mcp"

---

### Example 3: MCP Connection Failure ⚠️

```
[INFO] Processing job: premium-sample.json
[ROUTER] Selected worker: mcp
[MCP] Connecting to MCP server at localhost:8012...
[ERROR] MCP connection timeout after 30s
[ERROR] Falling back to pdfServices worker
[PDF_SERVICES] Processing with Adobe PDF Services API...
```

**Red Flags**:
- ⚠️ "MCP connection timeout"
- ⚠️ "Falling back to pdfServices"
- ❌ Job completes but uses wrong worker

**What Went Wrong**: Router correctly selected MCP, but MCP server isn't responding

**Fix**:
1. Check MCP proxy: `curl http://localhost:8013/health`
2. Verify InDesign plugin connected
3. Check logs: `logs/mcp/adobe-indesign.log`

---

## 🎯 Critical Success Criteria

### A+ Quality (90-94)

Your MCP routing is configured correctly when ALL of these are true:

✅ **Proxy Health**: `curl http://localhost:8013/health` returns `{"status":"ok"}`
✅ **Default Worker**: `orchestrator.config.json` has `"defaultWorker": "mcp"`
✅ **Routing Rules**: Config includes rules for partnership/program/report job types
✅ **InDesign Connected**: Plugin panel shows "Connected with ID: [socket-id]"
✅ **Test Job Routes to MCP**: `node orchestrator.js example-jobs/world-class-sample.json` shows "Selected worker: mcp"
✅ **A+ Threshold**: Config has `"validation_threshold": 90`
✅ **Export Preset**: Config has `"pdf_preset": "High Quality Print"`
✅ **Fonts Embedded**: Config has `"fonts_embedded": true`
✅ **Intent Specified**: Job spec includes `"output.intent": "print"` or "screen"

### World-Class Quality (95-100)

All A+ criteria above PLUS:

✅ **World-Class Flag**: Job spec includes `"worldClass": true`
✅ **World-Class Threshold**: Job spec has `"qa.threshold": 95` (explicit, NOT 90)
✅ **Print Intent Required**: Job spec MUST have `"output.intent": "print"` (not screen)
✅ **MCP Mutex Verified**: Console shows "MCP Mutex: Acquired" (serialized execution)
✅ **Export Preset Logged**: Console shows preset name before export
✅ **Enhanced Typography**: Roboto Flex variable font enabled
✅ **Grid System**: 12-column grid, 40pt margins minimum

---

## 📖 Full Documentation

For complete setup instructions, troubleshooting, and architecture details:

**Primary Reference**: `T:\Obsidian\Henrik_Vault_2025Q4\PDF Builder\PDF-Orchestrator-Complete-Documentation.md`

**Project README**: `T:\Projects\pdf-orchestrator\README.md`

---

## 🚨 When to Use Each Worker

### Use MCP Worker (InDesign Automation) ✅

**Job Types**: partnership, program, report, campaign (high-quality)

**Characteristics**:
- Requires brand compliance (TEEI colors, fonts, layouts)
- Needs human oversight checkpoints
- Multi-page complex layouts
- Print-quality output (300 DPI, CMYK)
- Custom typography and spacing
- Authentic photography integration

**Example**: TEEI × AWS partnership overview document

---

### Use PDF Services Worker (Serverless API) ✅

**Job Types**: invoice, certificate, form, simple report

**Characteristics**:
- Template-based (minimal customization)
- No human oversight needed
- Single-page or simple multi-page
- Standard digital output (150 DPI, RGB)
- Generic typography acceptable
- Stock imagery OK

**Example**: Automated course completion certificate

---

## ⏱️ Startup Sequence (Critical!)

**Correct Order**:
1. Start MCP proxy (`node proxy.js`) → Keep terminal open
2. Launch InDesign → Open MCP Agent panel → Click Connect
3. Launch Cursor/Claude Desktop (loads MCP servers)
4. Run orchestrator jobs

**Why Order Matters**:
- Proxy must be running BEFORE InDesign connects
- InDesign must be connected BEFORE MCP servers start
- If started out of order: Restart all components in correct sequence

---

## 🆘 Quick Troubleshooting Decision Tree

```
Job fails → Check router trace output
│
├─ Says "Selected worker: pdfServices"
│  └─ Fix defaultWorker OR add routing rules
│
├─ Says "Selected worker: mcp" but then "Connection timeout"
│  └─ Check MCP proxy health + InDesign plugin connection
│
├─ Says "Selected worker: mcp" and connects successfully
│  └─ Issue is downstream (InDesign automation, not routing)
│
└─ No router output at all
   └─ Check orchestrator.js is running and job file is valid JSON
```

---

**Last Updated**: 2025-11-10
**Quick Start Version**: 1.0
**Verification Script**: `scripts/verify-mcp-routing.ps1`
