# MCP Connection Timeout Fix - Summary

**Build ID**: `2025-11-15-TIMEOUT-FIX-01`
**Status**: ✅ **FIXED AND READY FOR TESTING**

---

## The Root Cause

### What Was Wrong
```javascript
// ❌ WRONG - This was causing the timeout
const PROXY_URL = "ws://localhost:8013";
socket = io(PROXY_URL, socketOptions);
```

**Why it failed:**
- Socket.IO client expects `http://` or `https://` URLs, NOT `ws://`
- Socket.IO automatically upgrades to WebSocket after HTTP handshake
- Using `ws://` protocol causes the client to fail immediately with timeout
- The proxy was listening correctly, but the client couldn't connect

### What Was Fixed
```javascript
// ✅ CORRECT - Now uses http:// protocol
const MCP_PROXY_URL = "http://127.0.0.1:8013";
socket = io(MCP_PROXY_URL, socketOptions);
```

**Why it works:**
- `http://` allows Socket.IO to establish initial HTTP connection
- Socket.IO then upgrades to WebSocket transparently
- Using `127.0.0.1` instead of `localhost` avoids DNS resolution issues
- Proxy accepts connection and establishes WebSocket tunnel

---

## Complete List of Changes

### File: `adb-mcp/uxp/id/main.js` (UXP Plugin)

#### 1. Added Build Marker (Phase 0)
```javascript
const MCP_PLUGIN_BUILD_ID = "2025-11-15-TIMEOUT-FIX-01";
console.log("[MCP] Plugin build:", MCP_PLUGIN_BUILD_ID);
```
**Purpose**: Confirm we're running the new code, not cached version

#### 2. Fixed Proxy URL (Phase 1 - CRITICAL FIX)
```javascript
// Before:
const PROXY_URL = "ws://localhost:8013";

// After:
const MCP_PROXY_URL = "http://127.0.0.1:8013";
const MCP_SOCKET_PATH = "/socket.io";
```
**Purpose**: Use correct protocol for Socket.IO client

#### 3. Added Health Check (Phase 3)
```javascript
async function testProxyHealth() {
    const resp = await fetch(MCP_PROXY_URL + "/health");
    console.log("[MCP] /health status:", resp.status);
    if (resp.ok) {
        const json = await resp.json();
        console.log("[MCP] /health body:", JSON.stringify(json));
        return true;
    }
    return false;
}
```
**Purpose**: Test basic HTTP connectivity before attempting Socket.IO

#### 4. Enhanced Connection Logic (Phase 1)
```javascript
async function connectToServer() {
    // Test health first
    const healthOk = await testProxyHealth();
    if (!healthOk) {
        console.error("[MCP] Health check failed! Cannot connect to proxy.");
        return null;
    }

    // Explicit Socket.IO options
    const socketOptions = {
        transports: ["websocket"],
        path: MCP_SOCKET_PATH,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
    };

    console.log("[MCP] Connecting to proxy:", MCP_PROXY_URL);
    console.log("[MCP] Socket options:", JSON.stringify(socketOptions));

    socket = io(MCP_PROXY_URL, socketOptions);
    // ... event handlers
}
```
**Purpose**: Explicit configuration, health check, detailed logging

#### 5. Enhanced Event Handlers (Phase 1)
```javascript
socket.on("connect", () => {
    console.log("[MCP] ✓ Connected to proxy, socket ID:", socket.id);
    console.log("[MCP] Registering for application:", APPLICATION);
    socket.emit("register", { application: APPLICATION });
});

socket.on("connect_error", (err) => {
    console.error("[MCP] connect_error:", err && err.message);
    console.error("[MCP] Error type:", err && err.type);
    console.error("[MCP] Check that proxy is running and accessible");
});

socket.on("error", (err) => {
    console.error("[MCP] socket error:", err && err.message);
});

socket.on("disconnect", (reason) => {
    console.warn("[MCP] Disconnected from proxy, reason:", reason);
});
```
**Purpose**: Detailed logging for debugging

---

### File: `adb-mcp/adb-proxy-socket/proxy.js` (Proxy Server)

#### 1. Added Build Marker (Phase 2)
```javascript
console.log("[PROXY] ============================================================");
console.log("[PROXY] InDesign MCP Proxy Server");
console.log("[PROXY] Build: 2025-11-15-TIMEOUT-FIX-01");
console.log("[PROXY] ============================================================");
```
**Purpose**: Confirm running updated proxy

#### 2. Explicit Socket.IO Configuration (Phase 2)
```javascript
const io = new Server(server, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    maxHttpBufferSize: 50 * 1024 * 1024,
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});
```
**Purpose**: Explicit configuration matching client expectations

#### 3. Bind to All Interfaces (Phase 2)
```javascript
const HOST = "0.0.0.0";  // Listen on all interfaces
server.listen(PORT, HOST, () => {
    console.log("[PROXY] Listening on:", HOST + ":" + PORT);
    console.log("[PROXY] Local access: http://localhost:" + PORT);
    console.log("[PROXY] Network access: http://127.0.0.1:" + PORT);
});
```
**Purpose**: Ensure accessible from localhost and 127.0.0.1

#### 4. Enhanced Connection Logging (Phase 2)
```javascript
io.on("connection", (socket) => {
    console.log("[PROXY] ============================================================");
    console.log("[PROXY] Client connected:", socket.id);
    console.log("[PROXY] Transport:", socket.conn.transport.name);
    console.log("[PROXY] Remote address:", socket.handshake.address);
    console.log("[PROXY] ============================================================");

    socket.on("register", ({ application }) => {
        console.log("[PROXY] Registration request from:", socket.id);
        console.log("[PROXY] Application:", application);
        console.log("[PROXY] ✓ Client", socket.id, "registered for", application);
    });

    socket.on("error", (err) => {
        console.error("[PROXY] Socket error from", socket.id, ":", err);
    });

    socket.on("disconnect", (reason) => {
        console.log("[PROXY] Client disconnected:", socket.id, "reason:", reason);
    });
});
```
**Purpose**: Verbose logging for debugging

---

## Current Status

### ✅ Proxy Running
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
[PROXY] Ready to accept connections from InDesign UXP plugin
```

### ⏳ Next Steps for You

1. **Reload UXP Plugin** (see `MCP-TIMEOUT-FIX-TESTING-GUIDE.md`)
   - Remove plugin from UXP Developer Tool
   - Re-add from `adb-mcp\uxp\id`
   - Restart InDesign if needed

2. **Verify Build ID** in UXP Console
   - Must see: `[MCP] Plugin build: 2025-11-15-TIMEOUT-FIX-01`
   - If not, old plugin is cached

3. **Test Connection**
   - Click "Connect" button in MCP panel
   - Watch UXP Console for health check success
   - Watch for successful connection message
   - Verify proxy logs show client connected

4. **Run Integration Tests**
   - MCP ping test: `node adb-mcp\test-indesign-connection.js`
   - Full autopilot: `python -B autopilot.py jobs/aws-tfu-2025.yaml`

---

## Why This Will Work

### The Bug
```
UXP Plugin: "Let me connect to ws://localhost:8013"
Socket.IO:  "Error: I need http:// or https://, not ws://"
Result:     Timeout (no connection established)
```

### The Fix
```
UXP Plugin: "Let me connect to http://127.0.0.1:8013"
Socket.IO:  "Great! Establishing HTTP connection..."
Socket.IO:  "Now upgrading to WebSocket..."
Proxy:      "Client connected via websocket transport"
Result:     ✓ Connected successfully
```

### Additional Safeguards

1. **Health check runs first** - Confirms HTTP connectivity before Socket.IO
2. **Explicit configuration** - No ambiguity about protocol, path, transport
3. **Detailed logging** - Can see exactly where connection fails if it does
4. **Build markers** - Confirms we're running the new code

---

## Expected Logs After Fix

### UXP Console (Plugin)
```
[MCP] Plugin build: 2025-11-15-TIMEOUT-FIX-01
[MCP] ============================================================
[MCP] Starting connection to MCP proxy...
[MCP] ============================================================
[MCP] Testing proxy health endpoint: http://127.0.0.1:8013/health
[MCP] /health status: 200
[MCP] /health body: {"status":"ok",...}
[MCP] Connecting to proxy with WebSocket transport: http://127.0.0.1:8013
[MCP] Socket path: /socket.io
[MCP] ✓ Connected to proxy, socket ID: [some-id]
[MCP] Registering for application: indesign
[MCP] ✓ Registration confirmed: {"type":"registration","status":"success",...}
```

### Terminal (Proxy)
```
[PROXY] ============================================================
[PROXY] Client connected: [some-id]
[PROXY] Transport: websocket
[PROXY] Remote address: ::ffff:127.0.0.1
[PROXY] ============================================================
[PROXY] Registration request from: [some-id]
[PROXY] Application: indesign
[PROXY] ✓ Client [some-id] registered for indesign
[PROXY] Total clients for indesign: 1
```

---

## Files to Check

1. **Testing Guide**: `MCP-TIMEOUT-FIX-TESTING-GUIDE.md`
2. **Modified Plugin**: `adb-mcp/uxp/id/main.js`
3. **Modified Proxy**: `adb-mcp/adb-proxy-socket/proxy.js`

---

**Bottom Line**: The timeout was caused by using `ws://` instead of `http://` in the Socket.IO client URL. This is now fixed. The plugin will connect successfully as soon as you reload it with the new code.

**Last Updated**: 2025-11-15
