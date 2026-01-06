# RELOAD UXP PLUGIN - CRITICAL STEP!

## The plugin code has been updated and needs to be reloaded in InDesign

### Steps to Reload:

1. **In Adobe InDesign UXP Developer Tool:**
   - Find "InDesign MCP Agent" in the plugin list
   - Click the **Reload** button (circular arrow icon) next to the plugin
   - OR click **Actions → Reload**

2. **In the Plugin Panel (if visible):**
   - Click the "Disconnect" button if connected
   - Wait 2 seconds
   - Click "Connect" button to reconnect

3. **Verify the reload worked:**
   - Open the UXP Developer Tool console
   - You should see new log messages:
     - `[MCP] Processing command: createDocument with options: {...}`
     - `[MCP] Command successful: createDocument`

### What Changed:

The plugin now properly handles the protocol mismatch:
- Converts `command: "openTemplate"` → `action: "loadTemplate"`
- Maps template IDs to file paths
- Adds extensive logging
- Properly sends responses back

### Testing After Reload:

Run the test script:
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
node test-mcp-connection.js
```

Expected Result:
- ✅ SUCCESS! MCP connection is working!
- A new InDesign document should be created
- No more 30-second timeouts!

### If Still Not Working:

1. Check the UXP Developer Tool console for errors
2. Make sure the plugin shows path: `D:\Dev\VS Projects\Projects\pdf-orchestrator\adb-mcp\uxp\id`
3. Verify proxy is running: `netstat -an | findstr 8013`
4. Verify bridge is running: `netstat -an | findstr 8012`