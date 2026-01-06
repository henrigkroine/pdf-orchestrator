# PDF Orchestrator - Startup Sequence

## Architecture Overview

```
Orchestrator → HTTP (8012) → Bridge Server → WebSocket (8013) → InDesign Plugin
```

## Components

1. **Port 8013**: WebSocket Proxy (`proxy.js`)
   - Forwards commands between bridge and InDesign

2. **Port 8012**: HTTP Bridge Server (`http-bridge-server.js`) ← NEW
   - Provides HTTP API for orchestrator
   - Converts HTTP → WebSocket

3. **InDesign**: UXP Plugin
   - Executes InDesign commands
   - Connects to port 8013

## Startup Order

### 1. Install Dependencies (First Time Only)

```powershell
cd T:\Projects\pdf-orchestrator
npm install
```

### 2. Start WebSocket Proxy (Port 8013)

```powershell
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket
.\start-proxy.cmd
```

**Expected output:**
```
adb-mcp Command proxy server running on ws://localhost:8013
```

### 3. Start HTTP Bridge (Port 8012)

**Option A - Using script:**
```powershell
cd T:\Projects\pdf-orchestrator
.\start-bridge.cmd
```

**Option B - Direct:**
```powershell
cd T:\Projects\pdf-orchestrator
node http-bridge-server.js
```

**Expected output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HTTP-to-WebSocket Bridge Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HTTP API:      http://localhost:8012
  Proxy Target:  ws://localhost:8013
  Status:        ✅ Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Load InDesign Plugin

1. Open Adobe InDesign
2. **Plugins** menu → **Manage Plugins**
3. Click **Load Plugin**
4. Navigate to: `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id\`
5. Load the plugin

**Verify in bridge console:**
```
[HTTP Bridge] Registration confirmed: Registered for indesign
```

### 5. Test the Connection

```powershell
# Open a new PowerShell window
cd T:\Projects\pdf-orchestrator

# Test health endpoint
Invoke-WebRequest http://localhost:8012/health | ConvertFrom-Json

# Should return:
# status    : ok
# connected : True
# proxyPort : 8013
```

### 6. Run the Orchestrator

```powershell
cd T:\Projects\pdf-orchestrator
node orchestrator.js jobs\aws-partnership-mcp.json
```

**Expected output:**
```
[Orchestrator] Routing to mcp: Human session requires MCP worker
[Orchestrator] Dispatching to MCP worker...
[MCP Worker] Sending command to MCP server (attempt 1/3)...
[HTTP Bridge] Received job request: { application: 'indesign', action: 'generateDocument' }
[HTTP Bridge] Sent job to InDesign, waiting for response...
[HTTP Bridge] ✅ Received response from InDesign
[Orchestrator] Job completed successfully
```

## Troubleshooting

### Error: "ECONNREFUSED ::1:8012"

**Problem:** HTTP bridge not running

**Solution:**
```powershell
cd T:\Projects\pdf-orchestrator
node http-bridge-server.js
```

### Error: "Not connected to MCP proxy"

**Problem:** WebSocket proxy (port 8013) not running

**Solution:**
```powershell
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket
.\start-proxy.cmd
```

### Bridge shows "⚠️ Disconnected from MCP proxy"

**Problem:** Proxy started after bridge, or proxy crashed

**Solution:**
1. Restart proxy (port 8013)
2. Bridge will auto-reconnect (watch for "✅ Connected")

### InDesign plugin not responding

**Problem:** Plugin not loaded or crashed

**Solution:**
1. Check InDesign → Plugins → Manage Plugins
2. Verify plugin is listed and enabled
3. Restart InDesign if needed
4. Reload plugin

## Quick Start (All at Once)

**PowerShell Window 1 - Proxy:**
```powershell
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket
.\start-proxy.cmd
```

**PowerShell Window 2 - Bridge:**
```powershell
cd T:\Projects\pdf-orchestrator
node http-bridge-server.js
```

**InDesign:**
- Open InDesign
- Load UXP plugin from `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id\`

**PowerShell Window 3 - Test:**
```powershell
cd T:\Projects\pdf-orchestrator
node orchestrator.js jobs\aws-partnership-mcp.json
```

## Ports Summary

| Port | Service | Protocol | Purpose |
|------|---------|----------|---------|
| 8012 | HTTP Bridge | HTTP | Orchestrator API |
| 8013 | Proxy | WebSocket | InDesign communication |

## Files Created

- ✅ `http-bridge-server.js` - HTTP-to-WebSocket bridge
- ✅ `start-bridge.cmd` - Windows startup script
- ✅ `STARTUP-SEQUENCE.md` - This file
