# Quick Start - Production-Hardened InDesign MCP

## 🚀 Get Started in 5 Minutes

This guide gets you up and running with the production-hardened InDesign automation system.

---

## Prerequisites

- ✅ **Node.js** 18.x or 20.x ([Download](https://nodejs.org/))
- ✅ **Python** 3.10+ with venv
- ✅ **Adobe InDesign** 2024 (v19.x) or 2025 (v20.x)
- ✅ **Git** for cloning (optional)

---

## Step 1: Install Dependencies

### Node.js Proxy Server

```bash
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket

# Install dependencies (including winston for logging)
npm install
```

### Python MCP Client

```bash
cd T:\Projects\pdf-orchestrator

# Activate virtual environment (if not already active)
.\.venv\Scripts\activate

# Install Python dependencies
pip install fastmcp python-socketio requests
```

---

## Step 2: Create Log Directory

```bash
cd T:\Projects\pdf-orchestrator

# Create logs directory
mkdir logs

# Create temp directory
mkdir temp
```

---

## Step 3: Start Production Proxy Server

```bash
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket

# Start hardened proxy
node proxy-hardened.js
```

**Expected Output**:
```
======================================================================
InDesign MCP Proxy Server - PRODUCTION HARDENED
======================================================================
Socket.IO Server: ws://localhost:8013
Health Endpoint:  http://localhost:8014/health
Ready Endpoint:   http://localhost:8014/ready
Metrics Endpoint: http://localhost:8014/metrics
======================================================================

Health server listening on http://localhost:8014
```

---

## Step 4: Load UXP Plugin in InDesign

1. Open **Adobe InDesign**

2. **Plugins** → **UXP Developer Tool**

3. Click **"Add Plugin"** (if not already added)
   - Navigate to: `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id\`
   - Select the folder

4. Click **"Load"** or **"Reload"**

5. Verify **"Connected"** status appears

---

## Step 5: Verify Health

Open a new terminal and check health:

```bash
# Check overall health
curl http://localhost:8014/health

# Check InDesign connection
curl http://localhost:8014/ready

# View metrics
curl http://localhost:8014/metrics
```

**Expected Response** (health):
```json
{
  "status": "ok",
  "uptime": 12000,
  "uptimeHuman": "0 minutes",
  "indesignConnected": true,
  "queueDepth": 0,
  "lastSuccess": null,
  "totalRequests": 0,
  "totalErrors": 0,
  "errorRate": "0%",
  "version": "1.0.0"
}
```

---

## Step 6: Run Demo Script

```bash
cd T:\Projects\pdf-orchestrator

# Run the ABSOLUTE INSANITY demo
.\.venv\Scripts\python.exe create-teei-ABSOLUTE-INSANITY.py
```

**Expected Output**:
```
======================================================================
TEEI AWS PARTNERSHIP BRIEF - ABSOLUTE INSANITY EDITION
======================================================================

>>> Creating THE MOST INSANE DOCUMENT EVER...
>>> Creating INSANE typography styles...
>>> Creating EXPLOSIVE header with CURVED TEXT and GRADIENT STROKES...
>>> Adding GRADIENT STROKE accent bar...
>>> Building mission section with DIRECTIONAL FEATHER...
>>> Creating INSANE impact metrics with ALL effects...
>>> Building The Ask section with PREMIUM effects...
>>> Building What We Offer section with ARROWS...
>>> Adding EXPLOSIVE footer with curved text...

======================================================================
SUCCESS! ABSOLUTE INSANITY ACHIEVED!
======================================================================

This document features EVERY INSANE EFFECT:
  [OK] Curved text on circular paths
  [OK] Gradient strokes (colored borders)
  [OK] Step and repeat patterns with fade
  [OK] Gradient feather (soft gradient edges)
  [OK] Directional feather (surgical edge softening)
  [OK] Satin effects (luxurious finish)
  [OK] Paragraph rules (professional text lines)
  [OK] Arrow lines with multiple head styles
  [OK] Outer glow on text
  [OK] Character tracking and spacing
  [OK] Multiple layered effects
  [OK] Advanced gradient backgrounds
  [OK] Drop shadows, opacity, blend modes
  [OK] Rounded corners on ALL boxes

THIS IS THE MOST INSANE DESIGN EVER CREATED!

AWS people will say: 'HOLY SHIT! TAKE ALL OUR CREDITS!'

Now in InDesign - Export: File > Export > PDF (Print)
======================================================================
```

---

## Step 7: Export PDF

1. In InDesign, the document should now be open

2. **File** → **Export**

3. Choose **"Adobe PDF (Print)"**

4. Select **"High Quality Print"** preset

5. Save to: `T:\Projects\pdf-orchestrator\exports\TEEI_AWS_Brief.pdf`

6. Open the PDF and marvel at the insanity! 🔥

---

## 🎯 Common Tasks

### Check System Status

```bash
# Is proxy running?
curl http://localhost:8014/ping

# Is InDesign connected?
curl http://localhost:8014/ready

# View performance metrics
curl http://localhost:8014/metrics | jq
```

### Monitor Logs

```bash
# Tail audit log
tail -f T:\Projects\pdf-orchestrator\logs\proxy-audit.log

# View errors only
grep -i "error" T:\Projects\pdf-orchestrator\logs\proxy-audit.log
```

### Restart System

```bash
# Kill Node.js
taskkill /F /IM node.exe

# Restart proxy
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket
node proxy-hardened.js

# Reload UXP plugin in InDesign
# Plugins → UXP Developer Tool → Reload
```

---

## 🔧 Troubleshooting

### Problem: "indesignConnected": false

**Solution**:
1. Open InDesign
2. Plugins → UXP Developer Tool
3. Find plugin → Click "Reload"
4. Verify "Connected" status

### Problem: Commands timeout

**Solution**:
1. Check InDesign is responsive
2. Increase timeout in `proxy-hardened.js`:
   ```javascript
   const COMMAND_TIMEOUTS = {
       'exportPDF': 180000,  // 3 minutes instead of 2
   };
   ```
3. Restart proxy

### Problem: "STYLE_NOT_FOUND" errors

**Solution**:
1. Run `setStyles` command first to create styles
2. Check style name matches exactly (case-sensitive)
3. View available styles in InDesign → Paragraph Styles panel

### Problem: Logs not appearing

**Solution**:
```bash
# Create logs directory if missing
mkdir T:\Projects\pdf-orchestrator\logs

# Check permissions
icacls T:\Projects\pdf-orchestrator\logs

# Restart proxy
```

---

## 📊 Monitoring (Production)

### Health Check Script

Save as `health-check.ps1`:
```powershell
$response = Invoke-WebRequest http://localhost:8014/health | ConvertFrom-Json

if ($response.indesignConnected -eq $false) {
    Write-Host "ERROR: InDesign not connected!"
    exit 1
}

if ([int]$response.errorRate.Replace('%','') -gt 10) {
    Write-Host "WARNING: Error rate above 10%!"
}

Write-Host "System healthy: $($response.errorRate) error rate"
```

Run every 5 minutes via Task Scheduler.

### Metrics Dashboard

```bash
# Create simple dashboard
watch -n 5 "curl -s http://localhost:8014/metrics | jq"
```

---

## 🎉 What You've Achieved

✅ Production-hardened proxy with health endpoints
✅ Structured logging with JSON audit trail
✅ Command-specific timeouts preventing hangs
✅ Document locking preventing corruption
✅ Request idempotency preventing duplicates
✅ Comprehensive error handling with codes
✅ Performance metrics (P95 latency, error rate)
✅ Ready for enterprise deployment

---

## 📚 Next Steps

1. **Read Full Documentation**:
   - `Indesign.md` - Complete feature reference
   - `PRODUCTION-HARDENING.md` - Implementation details
   - `PRODUCTION-ROADMAP.md` - Future enhancements

2. **Create Your Own Scripts**:
   - Use `create-teei-ABSOLUTE-INSANITY.py` as template
   - Reference `schemas/v1/` for command validation
   - Check error codes in `schemas/error-codes.json`

3. **Production Deployment**:
   - Set up Windows Service (NSSM)
   - Configure monitoring/alerting
   - Implement CI/CD tests
   - Add more JSON schema validation

---

## 🆘 Getting Help

- **Documentation**: Check `Indesign.md` for command reference
- **Errors**: Check `schemas/error-codes.json` for error meanings
- **Logs**: Check `logs/proxy-audit.log` for operation history
- **Health**: Check `http://localhost:8014/health` for system status

---

**Congratulations!** You're now running the most insane InDesign automation system ever created! 🚀🔥

*Last Updated*: 2025-01-XX
*Version*: 1.0.0
