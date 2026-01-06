# Start MCP Stack

Start the InDesign MCP stack (WebSocket Proxy on 8013 + HTTP Bridge on 8012).

Run this PowerShell command to start the MCP servers:

```powershell
powershell -ExecutionPolicy Bypass -File "D:\Dev\VS Projects\Projects\pdf-orchestrator\auto-start-mcp.ps1"
```

After running, verify health:
- WebSocket Proxy: http://localhost:8013/health
- HTTP Bridge: http://localhost:8012/health

Then open InDesign and connect the UXP plugin.
