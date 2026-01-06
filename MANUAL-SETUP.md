# MCP HTTP Bridge - Manual Setup Guide

## Quick Start (3 Terminals Required)

### Terminal 1: WebSocket Proxy (Port 8013)

```powershell
cd "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
node proxy.js
```

**Expected Output:**
```
Proxy server listening on port 8013
```

### Terminal 2: HTTP Bridge (Port 8012)

```powershell
cd "T:\Projects\pdf-orchestrator\mcp-local"
.\.venv\Scripts\python.exe indesign_mcp_http_bridge.py
```

**Expected Output:**
```
INFO:     Started server process [PID]
INFO:     Uvicorn running on http://127.0.0.1:8012 (Press CTRL+C to quit)
```

### Terminal 3: Verify Services

```powershell
# Check proxy health
Invoke-RestMethod http://localhost:8013/health

# Check bridge health
Invoke-RestMethod http://localhost:8012/health
```

**Expected Output:**
```
status bridge proxy8013
------ ------ --------
ok     8012   ok
```

---

## Next Steps

Once both services show "ok":

### 1. Connect InDesign MCP Agent

1. Open Adobe InDesign
2. Go to **Window → Utilities → InDesign MCP Agent**
3. Click **Connect** button
4. Verify connection success message

### 2. Run Smoke Test

```powershell
cd "T:\Projects\pdf-orchestrator"
.\scripts\smoke-test.ps1
```

### 3. Generate AWS Partnership PDF

```powershell
cd "T:\Projects\pdf-orchestrator"
node orchestrator.js jobs\aws-partnership.json
```

---

## Expected Console Output (World-Class PDF Generation)

```
[Orchestrator] Loading job: jobs\aws-partnership.json
[Orchestrator] Job type: partnership, worldClass: true
[Orchestrator] ✅ Rule matched: humanSession === true
[Orchestrator] Routing to mcp: Human session requires MCP worker
[Orchestrator] 🔒 MCP mutex acquired

[MCP Worker] Starting job execution...
[MCP Worker] Target application: indesign
[MCP Worker] Export preset specified: High Quality Print
[MCP Worker] Sending job to HTTP bridge...

[MCP Worker] ✅ Job completed with QA validation
[MCP Worker] Export path: T:\Projects\pdf-orchestrator\exports\aws-partnership-20251110.pdf
[MCP Worker] QA score: 96 (world-class threshold: 95)

[Orchestrator] 🔓 MCP mutex released
[Orchestrator] ✅ Job completed successfully
```

---

## Success Criteria

✅ Router selected `mcp` worker (not `pdf_services`)
✅ Export preset: "High Quality Print"
✅ QA threshold: ≥ 95 (world-class)
✅ Color space: CMYK
✅ Image DPI: ≥ 300
✅ Fonts: Embedded
✅ Forbidden colors: None

---

## Deliverables

After successful execution:

```
T:\Projects\pdf-orchestrator\exports\
├── aws-partnership-20251110.pdf       ← World-class PDF
├── bridge-smoke.pdf                   ← Smoke test output
└── qa\
    └── aws-partnership-20251110.json  ← QA validation report
```

---

## Troubleshooting

### Proxy Won't Start

```powershell
# Check if Node.js is installed
node --version

# Verify proxy.js exists
Test-Path "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket\proxy.js"

# Check if port 8013 is in use
netstat -ano | Select-String ":8013"
```

### Bridge Won't Start

```powershell
# Check Python version
python --version

# Verify virtual environment
Test-Path "T:\Projects\pdf-orchestrator\mcp-local\.venv"

# Reinstall dependencies if needed
cd "T:\Projects\pdf-orchestrator\mcp-local"
.\.venv\Scripts\pip.exe install fastapi uvicorn websockets httpx pydantic

# Check if port 8012 is in use
netstat -ano | Select-String ":8012"
```

### InDesign Won't Connect

1. Verify proxy is running: `curl http://localhost:8013/health`
2. Check InDesign MCP Agent plugin is installed
3. Restart InDesign and try connecting again
4. Check Windows Firewall isn't blocking ports 8012/8013

### QA Fails (Score < 95)

- Bridge will return HTTP 422 error
- Check logs in `T:\Projects\pdf-orchestrator\exports\qa\`
- Review QA report JSON for specific failures:
  - Structure (layout, margins, grid)
  - Content (typography, fonts, text formatting)
  - Hierarchy (heading levels, visual flow)
  - Colors (palette compliance, forbidden colors)

---

## Dependencies Already Installed

✅ **Node.js** dependencies (proxy):
```
up to date, audited 410 packages
found 0 vulnerabilities
```

✅ **Python** dependencies (bridge):
```
fastapi
uvicorn
websockets
httpx
pydantic
```

---

## Architecture

```
Orchestrator (Node.js)
    ↓
MCP Worker (workers/mcp_worker/index.js)
    ↓ POST http://localhost:8012/api/jobs
HTTP Bridge (mcp-local/indesign_mcp_http_bridge.py)
    ↓ WebSocket ws://localhost:8013/indesign
Proxy (adb-mcp/adb-proxy-socket/proxy.js)
    ↓ WebSocket
InDesign MCP Agent (UXP Plugin)
    ↓
Adobe InDesign
```

---

## Files Created

1. **HTTP Bridge**: `mcp-local/indesign_mcp_http_bridge.py`
2. **Updated MCP Worker**: `workers/mcp_worker/index.js`
3. **Smoke Test**: `scripts/smoke-test.ps1`
4. **Job Spec**: `jobs/aws-partnership.json`
5. **This Guide**: `MANUAL-SETUP.md`

---

Ready to generate world-class PDFs! 🚀
