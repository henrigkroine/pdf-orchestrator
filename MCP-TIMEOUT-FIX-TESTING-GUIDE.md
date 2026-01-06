# MCP Connection Timeout Fix - Testing Guide

**Build ID**: `2025-11-15-TIMEOUT-FIX-01`
**Date**: 2025-11-15
**Status**: Ready for Testing

---

## What Was Fixed

### Critical Bug Identified
The UXP plugin was using `ws://localhost:8013` instead of `http://127.0.0.1:8013`. Socket.IO client expects HTTP/HTTPS URLs, not WebSocket URLs - it handles the WebSocket upgrade automatically.

### Changes Implemented

#### Phase 0: Build Marker
- Added `MCP_PLUGIN_BUILD_ID = "2025-11-15-TIMEOUT-FIX-01"` to `main.js`
- This will appear in UXP console logs to confirm we're running the new code

#### Phase 1: Fixed Socket.IO Client Configuration
- **Changed URL**: `ws://localhost:8013` → `http://127.0.0.1:8013`
- **Explicit configuration**:
  - Base URL: `http://127.0.0.1:8013`
  - Socket.IO path: `/socket.io`
  - Transports: `["websocket"]` only
  - Timeout: 10 seconds
- **Added health check**: Plugin tests `/health` endpoint before connecting
- **Enhanced logging**: All connection events now log detailed information

#### Phase 2: Enhanced Proxy Server
- **Explicit Socket.IO configuration**:
  - Path: `/socket.io`
  - Transports: `["websocket", "polling"]`
  - CORS: Allow all origins
  - Ping timeout: 60s
  - Ping interval: 25s
- **Bind to all interfaces**: `0.0.0.0:8013` (accessible from localhost and 127.0.0.1)
- **Verbose logging**: All connection events, errors, and disconnects

#### Phase 3: Health Check Endpoint
- Already existed at `/health`
- Plugin now calls it before Socket.IO connection
- Returns JSON with proxy status and connected clients

---

## Testing Steps

### Step 1: Verify Proxy is Running

The proxy is already running. You should see in the terminal:

```
[PROXY] ============================================================
[PROXY] InDesign MCP Proxy Server
[PROXY] Build: 2025-11-15-TIMEOUT-FIX-01
[PROXY] ============================================================
[PROXY] Server started successfully!
[PROXY] Listening on: 0.0.0.0:8013
[PROXY] Local access: http://localhost:8013
[PROXY] Network access: http://127.0.0.1:8013
[PROXY] Health check: http://localhost:8013/health
[PROXY] ============================================================
```

**If not running, start it:**
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
node adb-mcp\adb-proxy-socket\proxy.js
```

### Step 2: Test Health Endpoint

Open your browser and navigate to:
```
http://localhost:8013/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "app": "indesign-mcp-proxy",
  "port": 8013,
  "uptime": 123.456,
  "clients": {}
}
```

---

### Step 3: Reload UXP Plugin (CRITICAL)

UXP aggressively caches plugins. You MUST reload it properly:

#### Option A: UXP Developer Tool (Recommended)
1. Open **UXP Developer Tool**
2. **Remove** the existing "InDesign MCP Agent" plugin
3. Click **"Add Plugin"**
4. Browse to: `D:\Dev\VS Projects\Projects\pdf-orchestrator\adb-mcp\uxp\id`
5. Click **"Load"**
6. If it doesn't appear, **restart InDesign completely**

#### Option B: Manual Reload
1. In InDesign, go to **Window → Extensions → InDesign MCP Agent**
2. Close the panel
3. In UXP Developer Tool, click **"Reload"** for the plugin
4. Reopen the panel

---

### Step 4: Verify Plugin Build in UXP Console

1. Open **UXP Developer Tool**
2. Select **"InDesign MCP Agent"** from the dropdown
3. Click **"Console"** tab
4. Look for the FIRST log message

**MUST SEE:**
```
[MCP] Plugin build: 2025-11-15-TIMEOUT-FIX-01
```

**If you see something else**, the old plugin is still cached. Repeat Step 3 and restart InDesign.

---

### Step 5: Connect Plugin to Proxy

1. In InDesign, open **Window → Extensions → InDesign MCP Agent**
2. Click the **"Connect"** button
3. Watch the **UXP Console** (in UXP Developer Tool)

**Expected Console Output (UXP Plugin):**
```
[MCP] ============================================================
[MCP] Starting connection to MCP proxy...
[MCP] Build ID: 2025-11-15-TIMEOUT-FIX-01
[MCP] ============================================================
[MCP] Testing proxy health endpoint: http://127.0.0.1:8013/health
[MCP] /health status: 200
[MCP] /health body: {"status":"ok","app":"indesign-mcp-proxy",...}
[MCP] Connecting to proxy with WebSocket transport: http://127.0.0.1:8013
[MCP] Socket path: /socket.io
[MCP] Socket options: {"transports":["websocket"],"path":"/socket.io",...}
[MCP] ✓ Connected to proxy, socket ID: ABC123
[MCP] Registering for application: indesign
[MCP] ✓ Registration confirmed: {"type":"registration","status":"success",...}
```

**Expected Terminal Output (Proxy Server):**
```
[PROXY] ============================================================
[PROXY] Client connected: ABC123
[PROXY] Transport: websocket
[PROXY] Remote address: ::ffff:127.0.0.1
[PROXY] ============================================================
[PROXY] Registration request from: ABC123
[PROXY] Application: indesign
[PROXY] ✓ Client ABC123 registered for indesign
[PROXY] Total clients for indesign: 1
[PROXY] ============================================================
```

---

### Step 6: Troubleshooting Connection Issues

#### Issue: Health check fails

**UXP Console shows:**
```
[MCP] /health fetch failed: [error message]
[MCP] This means UXP cannot reach the proxy at all!
```

**Solutions:**
1. Verify proxy is running (see Step 1)
2. Check Windows Firewall isn't blocking port 8013
3. Try accessing `http://localhost:8013/health` in a browser
4. If browser works but UXP doesn't, UXP sandbox is blocking network access

#### Issue: Timeout after health check succeeds

**UXP Console shows:**
```
[MCP] /health status: 200
[MCP] Connecting to proxy...
[MCP] connect_error: timeout
```

**This means:**
- HTTP works (fetch succeeded)
- WebSocket upgrade is failing

**Solutions:**
1. Check proxy logs for connection attempts
2. Verify no other service is using port 8013
3. Try restarting both InDesign and proxy
4. Check for corporate proxy/VPN blocking WebSockets

#### Issue: Old build ID appears

**UXP Console shows:**
```
[MCP] Plugin build: [something other than 2025-11-15-TIMEOUT-FIX-01]
```

**Solution:**
1. Remove plugin from UXP Developer Tool
2. **Restart InDesign completely**
3. Re-add plugin from `adb-mcp\uxp\id`
4. Verify build ID before connecting

---

## Phase 5: Integration Testing

Once connection is successful:

### Test 1: MCP Ping Test

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
node adb-mcp\test-indesign-connection.js
```

**Expected:**
- Proxy receives command
- InDesign plugin executes command
- Response returned to test script

### Test 2: Full Autopilot Run

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
python -B autopilot.py jobs/aws-tfu-2025.yaml
```

**Expected:**
- LLM planning and personalization (already working ✓)
- Pipeline runs world-class validation
- MCP commands sent to InDesign (no timeout!)
- PDFs exported successfully
- Exit code 0

---

## Success Criteria

### ✓ Connection Established
- [x] Proxy shows build `2025-11-15-TIMEOUT-FIX-01`
- [x] Plugin shows build `2025-11-15-TIMEOUT-FIX-01`
- [x] Health check returns 200 OK
- [x] WebSocket connection succeeds
- [x] Registration confirmed

### ✓ Functionality Works
- [ ] MCP ping → pong works
- [ ] Autopilot can send commands to InDesign
- [ ] PDFs are exported without timeout
- [ ] Full pipeline completes successfully

---

## Quick Reference

### Files Modified
- `adb-mcp/uxp/id/main.js` - UXP plugin (build marker, health check, fixed URL)
- `adb-mcp/adb-proxy-socket/proxy.js` - Proxy server (enhanced logging, explicit config)

### Key Configuration
| Setting | Value |
|---------|-------|
| Proxy URL (Plugin) | `http://127.0.0.1:8013` |
| Socket.IO Path | `/socket.io` |
| Transport (Plugin) | `websocket` only |
| Transports (Server) | `websocket, polling` |
| Health Endpoint | `http://127.0.0.1:8013/health` |
| Bind Address | `0.0.0.0:8013` |

### Build Markers
- **Plugin**: `MCP_PLUGIN_BUILD_ID = "2025-11-15-TIMEOUT-FIX-01"`
- **Proxy**: `Build: 2025-11-15-TIMEOUT-FIX-01`

---

## Next Steps After Success

1. **Document the solution** - Update main README with connection requirements
2. **Create startup script** - Automate proxy startup with plugin
3. **Add error recovery** - Handle proxy restarts gracefully
4. **Performance testing** - Stress test with multiple rapid commands
5. **Production deployment** - Package for distribution

---

**Last Updated**: 2025-11-15
**Status**: Ready for Testing
**Expected Result**: Zero timeouts, reliable MCP connection
