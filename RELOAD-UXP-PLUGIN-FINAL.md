# 🔧 FINAL FIX - RELOAD UXP PLUGIN

## What Was Fixed

The InDesign UXP plugin response format was incorrect. The bridge was timing out because it couldn't match the response command ID.

### The Problem
- **Bridge expects**: `{ command: { id: "..." }, status: "SUCCESS", ... }`
- **Plugin was sending**: `{ command: { ...entire command object... }, id: "...", ... }`

### The Solution
Fixed the response packet structure in `adb-mcp/uxp/id/main.js` to match what the bridge expects.

---

## 🚀 RELOAD STEPS (CRITICAL!)

### 1. In Adobe InDesign UXP Developer Tool:
   - Find **"InDesign MCP Agent"** in the plugin list
   - Click the **Reload** button (circular arrow icon)
   - OR click **Actions → Reload**

### 2. In the Plugin Panel:
   - If connected, click **"Disconnect"**
   - Wait 2 seconds
   - Click **"Connect"** to reconnect

### 3. Verify in Console:
You should see these new log messages:
```
[MCP] Executing command: createDocument with options: {...}
[MCP] Command successful: createDocument
[MCP] Sending response: {
  "senderId": "...",
  "command": { "id": "create-..." },
  "status": "SUCCESS",
  "response": {...}
}
```

---

## ✅ Test the Fix

Run this test:
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
node test-mcp-connection.js
```

### Expected Result:
```
Testing MCP connection with ping command...
Sending test job to HTTP bridge at http://localhost:8012/api/jobs

✅ SUCCESS! MCP connection is working!
Response: {
  "jobId": "test-ping-...",
  "status": "completed",
  "exportPath": "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/..."
}

📄 PDF exported to: D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/...
```

---

## 🐛 Troubleshooting

### Still Timing Out?
1. **Check UXP Console** - Look for "[MCP] Sending response:" logs
2. **Check Proxy** - Should show "Sent confirmation to client..."
3. **Check Bridge** - Should not show TimeoutError anymore

### Plugin Not Responding?
1. **Verify plugin loaded from correct path**:
   - Should be: `D:\Dev\VS Projects\Projects\pdf-orchestrator\adb-mcp\uxp\id`
   - NOT: `T:\Projects\pdf-orchestrator\...`

2. **Check services are running**:
   ```powershell
   # WebSocket Proxy (port 8013)
   netstat -an | findstr 8013

   # HTTP Bridge (port 8012)
   netstat -an | findstr 8012
   ```

3. **Restart services if needed**:
   ```powershell
   # Start MCP stack
   .\start-mcp-stack.ps1
   ```

---

## 📊 What Changed in the Code

**File**: `adb-mcp/uxp/id/main.js` (lines 91-96)

**Before**:
```javascript
let out = {
    senderId: packet.senderId,
    command: packet.command,  // ❌ Entire command object
    id: packet.command?.id || packet.id
};
```

**After**:
```javascript
let out = {
    senderId: packet.senderId,
    command: {
        id: packet.command?.id || packet.id  // ✅ Just the ID
    },
    status: "PENDING"
};
```

This ensures the bridge can match responses by checking `data.get("command", {}).get("id")` on line 39 of `indesign_mcp_http_bridge.py`.

---

## 🎯 Next Steps

Once the plugin is reloaded and the test passes:

1. **Run the AWS Partnership Pipeline**:
   ```bash
   node orchestrator.js jobs/aws-partnership-mcp.json
   ```

2. **Check the Output**:
   ```
   [Orchestrator] ✅ Rule matched: humanSession === true
   [MCP Worker] Starting job execution...
   [MCP Worker] Job completed successfully
   ```

3. **Verify PDF Export**:
   - Check `exports/` directory
   - PDF should be generated with TEEI branding

---

## 🔍 Understanding the Flow

```
Orchestrator → HTTP Bridge → WebSocket Proxy → InDesign Plugin
     ↓              ↓              ↓              ↓
  Job JSON    REST API     Socket.IO        UXP Commands
                                  ↓
                            [YOUR RELOAD HERE]
                                  ↓
InDesign Plugin → WebSocket Proxy → HTTP Bridge → Orchestrator
     ↓              ↓              ↓              ↓
  Response     Socket.IO       REST API      Job Result
  (FIXED!)
```

The fix ensures the response packet structure matches what the bridge expects, enabling proper command correlation and response handling.

---

**Status**: ✅ Fix applied, ready to reload
**Impact**: Critical - enables end-to-end MCP communication
**Time to fix**: ~2 minutes (reload plugin + test)
