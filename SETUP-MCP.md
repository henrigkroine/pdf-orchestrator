# Adobe MCP Server Setup

## Architecture Overview

The Adobe MCP system has 3 components that all need to be running:

1. **Proxy Server** (port 8013) - Middleman between MCP and Adobe apps
2. **UXP Plugins** (InDesign/Illustrator) - Runs inside Adobe apps
3. **MCP Servers** (Claude Code/Cursor) - Provides AI interface

## Quick Start

### 1. Start the Proxy Server (REQUIRED FIRST!)

```cmd
T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket\start-proxy.cmd
```

Or manually:
```cmd
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket
node proxy.js
```

You should see: `Server is running on http://localhost:8013`

**Leave this terminal window open!** The proxy must stay running.

### 2. Load UXP Plugin in Adobe App

- Open InDesign or Illustrator
- Go to Plugins > Manage Plugins
- Load the UXP plugin from `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id\` (or `ai\`)
- Plugin should connect to proxy automatically

### 3. Use MCP in Claude Code/Cursor

The MCP configuration is already set up:

- **Claude Code**: `.mcp.json` in project root
- **Cursor**: Same `.mcp.json` file

Open the project and approve the MCP servers when prompted.

## Troubleshooting

### "xhr poll error" in console
- **Cause**: Proxy server is not running
- **Fix**: Start the proxy server (step 1)

### MCP tools not appearing
- **Claude Code**: Close and reopen the project
- **Cursor**: Restart Cursor

### Connection timeout
- Verify proxy is running: Open http://localhost:8013 in browser (should show error page, that's OK)
- Check firewall isn't blocking port 8013

## Testing

1. Start proxy server
2. Open InDesign with plugin loaded
3. In Claude Code/Cursor, try: "Create a new InDesign document 800x600"

## Files

- Proxy: `adb-mcp/adb-proxy-socket/proxy.js`
- MCP Servers: `adb-mcp/mcp/id-mcp.py`, `ai-mcp.py`
- UXP Plugins: `adb-mcp/uxp/id/`, `ai/`
- Config: `.mcp.json` (project root)
- Wrappers: `.wrappers/*.cmd`
