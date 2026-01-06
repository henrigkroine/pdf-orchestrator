# MCP / UXP Bridge Fix Summary
Date: 2025-11-13
Author: Claude Code

## PROBLEM STATEMENT

The InDesign UXP plugin was showing Socket.IO connection errors repeatedly:
```
Connection error: Error: xhr poll error
at XHR.onError (T:\Projects\pdf-orchestrator\adb-mcp\uxp\id\socket.io.js:819:61)
```

This indicated two critical issues:
1. Hard-coded paths pointing to wrong drive (`T:\` instead of `D:\Dev\VS Projects\`)
2. MCP bridge infrastructure not running

## SOLUTION IMPLEMENTED

### 1. Path Corrections
**Changed all hardcoded T:\ paths to use relative paths or correct absolute paths**

Updated files:
- `CHECK-INDESIGN-STATUS.ps1` - Now uses `$PSScriptRoot` for relative paths
- `CLAUDE.md` - Updated project location
- `start-mcp-stack.ps1` - Already used relative paths, just updated comment
- `scripts\verify-mcp-routing.ps1` - All paths now use `$scriptRoot`
- `mcp-local\indesign_mcp_http_bridge.py` - Uses `os.path` for dynamic paths

### 2. MCP Infrastructure Started
Successfully started both required services:

**WebSocket Proxy (Port 8013)**
- Location: `adb-mcp\adb-proxy-socket\proxy.js`
- Status: ✅ Running
- Connected clients: InDesign UXP plugin confirmed connected

**HTTP Bridge (Port 8012)**
- Location: `mcp-local\indesign_mcp_http_bridge.py`
- Status: ✅ Running
- Health endpoint: http://localhost:8012/health returns `{"status":"ok","bridge":8012,"proxy":8013}`

### 3. Connection Verification
- UXP plugin successfully connected to WebSocket proxy
- No more `xhr poll error` messages
- Commands are routing from HTTP bridge → WebSocket proxy → InDesign

## CURRENT STATUS

✅ **FIXED**: Path issues resolved - no more T:\ drive references
✅ **FIXED**: MCP backend running correctly on ports 8013 and 8012
✅ **FIXED**: UXP plugin connects cleanly without errors
✅ **VERIFIED**: Communication pipeline working (HTTP → WebSocket → InDesign)

⚠️ **REMAINING ISSUE**: InDesign UXP plugin receives commands but doesn't respond
- Commands are delivered to InDesign
- InDesign is not processing them (likely needs template files or manual connection in UXP panel)

## HOW TO START MCP STACK

### Quick Start (Recommended)
```powershell
# From project root
.\start-mcp-stack.ps1
```

### Manual Start
```powershell
# Terminal 1: Start WebSocket Proxy
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
node proxy.js

# Terminal 2: Start HTTP Bridge
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator\mcp-local"
.\.venv\Scripts\python.exe indesign_mcp_http_bridge.py
```

### Health Check
```powershell
# Check if services are running
Invoke-WebRequest -Uri "http://localhost:8012/health" -UseBasicParsing
# Should return: {"status":"ok","bridge":8012,"proxy":8013}
```

## TESTING THE PIPELINE

### Run AWS Partnership Job
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
node orchestrator.js jobs/aws-partnership-mcp.json
```

### Expected Flow
1. Orchestrator loads job and routes to MCP worker
2. MCP worker sends to HTTP bridge (port 8012)
3. HTTP bridge forwards to WebSocket proxy (port 8013)
4. WebSocket proxy delivers to InDesign UXP plugin
5. InDesign processes and returns result

## NEXT STEPS FOR FULL FUNCTIONALITY

1. **Ensure InDesign Setup**:
   - Open Adobe InDesign
   - Load UXP Developer Tool
   - Load plugin from: `D:\Dev\VS Projects\Projects\pdf-orchestrator\adb-mcp\uxp\id`
   - Click "Connect" button in plugin panel

2. **Verify Templates**:
   - Ensure template files exist in expected locations
   - Check that InDesign can access template paths

3. **Debug UXP Plugin**:
   - Check InDesign console for errors
   - Verify command handlers are implemented
   - Test with simpler commands first

## KEY LEARNINGS

1. **No Hard-Coded Paths**: Always use relative paths or environment variables
2. **Service Dependencies**: MCP requires both proxy (8013) and bridge (8012)
3. **Connection Order**: Start services first, then connect InDesign plugin
4. **Path Separators**: Use forward slashes in Node.js paths, even on Windows

## FILES CHANGED

- ✅ CHECK-INDESIGN-STATUS.ps1
- ✅ CLAUDE.md
- ✅ start-mcp-stack.ps1
- ✅ scripts\verify-mcp-routing.ps1
- ✅ mcp-local\indesign_mcp_http_bridge.py

All T:\ references have been eliminated and replaced with dynamic paths.

## TROUBLESHOOTING

If you see `xhr poll error` again:
1. Check proxy is running: `netstat -an | findstr 8013`
2. Check bridge is running: `netstat -an | findstr 8012`
3. Restart both services
4. Reload UXP plugin in InDesign

If commands timeout:
1. Verify InDesign is running
2. Check UXP plugin is loaded and connected
3. Look for errors in InDesign console
4. Ensure templates exist at expected paths