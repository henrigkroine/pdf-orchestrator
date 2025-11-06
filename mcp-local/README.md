# Adobe MCP Servers - Local Configuration

This directory contains MCP (Model Context Protocol) server implementations for Adobe InDesign and Illustrator, configured for use with Cursor and Claude Code.

## Overview

These MCP servers enable Cursor/Claude Code to interact with Adobe Creative Cloud applications through a proxy server. The servers communicate with Adobe apps via UXP plugins that expose functionality through a WebSocket proxy.

## Files

- **launch-indesign.cmd** - Launcher script for InDesign MCP server (uses project's `.venv`)
- **launch-illustrator.cmd** - Launcher script for Illustrator MCP server (uses project's `.venv`)
- **indesign-mcp-server.py** - InDesign MCP server implementation
- **illustrator-mcp-server.py** - Illustrator MCP server implementation

## Configuration

### Cursor Configuration

The MCP servers are configured in `C:\Users\ovehe\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "adobe-indesign": {
      "command": "cmd",
      "args": ["/c", "C:\\Users\\ovehe\\.cursor\\wrappers\\adobe-indesign-mcp.cmd"]
    },
    "adobe-illustrator": {
      "command": "cmd",
      "args": ["/c", "C:\\Users\\ovehe\\.cursor\\wrappers\\adobe-illustrator-mcp.cmd"]
    }
  }
}
```

### Wrapper Files

The wrapper files in `C:\Users\ovehe\.cursor\wrappers\` are configured to:

1. Navigate to project root (`T:\Projects\pdf-orchestrator`)
2. Use the project's Python virtual environment (`.venv\Scripts\python.exe`)
3. Launch the MCP server scripts from `mcp-local\`
4. Log output to `logs\mcp\`

**Wrapper Configuration** (`adobe-indesign-mcp.cmd`):
```cmd
@echo off
REM Navigate to project root
cd /d "T:\Projects\pdf-orchestrator"

REM Ensure logs directory exists
if not exist "logs\mcp" mkdir "logs\mcp"

REM Log startup
echo [%date% %time%] Starting Adobe InDesign MCP server... >> logs\mcp\adobe-indesign.log

REM Launch MCP server using project's Python venv
.venv\Scripts\python.exe mcp-local\indesign-mcp-server.py 2>> logs\mcp\adobe-indesign.log
```

## Architecture

```
Cursor/Claude Code
    ↓ (MCP Protocol via stdio)
Wrapper (.cmd)
    ↓
launch-*.cmd (or direct Python call)
    ↓
Python MCP Server (FastMCP)
    ↓ (Socket.IO over WebSocket)
Adobe Command Proxy (localhost:8013)
    ↓ (UXP API)
Adobe Application (InDesign/Illustrator)
```

## Prerequisites

1. **Python Environment**: Project uses `.venv` with Python 3.14.0
2. **Required Packages** (installed in `.venv`):
   - `mcp` (MCP SDK v1.20.0+)
   - `python-socketio` (for WebSocket communication)
3. **Adobe Command Proxy**: Must be running on `localhost:8013`
4. **Adobe UXP Plugins**: Must be installed and active in the Adobe apps

## Installation

### Python Dependencies

The Python dependencies are installed in the project's virtual environment:

```bash
cd "T:\Projects\pdf-orchestrator"
.venv\Scripts\python.exe -m pip install mcp python-socketio
```

### Verify Installation

```bash
# Test Python dependencies
.venv\Scripts\python.exe -c "import mcp.server.fastmcp; import socketio; print('OK')"

# Test adb-mcp modules
.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'adb-mcp/mcp'); import core, socket_client; print('OK')"
```

## Usage

The MCP servers are automatically launched by Cursor when the `adobe-indesign` or `adobe-illustrator` MCP servers are enabled in `mcp.json`.

### Startup Sequence (CRITICAL!)

**The proxy must start BEFORE Cursor!**

1. **Start Proxy Server** (in a separate terminal, keep it running):
   ```powershell
   cd "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
   node proxy.js
   ```
   Wait for: `adb-mcp Command proxy server running on ws://localhost:8013`

2. **Launch Adobe Applications**:
   - Open InDesign → Window → Utilities → InDesign MCP Agent → Click **Connect**
   - Open Illustrator → Window → Extensions → Adobe Illustrator MCP → Click **Connect**

3. **Launch/Restart Cursor**:
   - The MCP servers will start automatically
   - Tools should appear in Cursor's MCP tool list

### Available Tools

#### InDesign Server

- `create_document(width, height, pages, pages_facing, columns, margins)` - Creates a new InDesign document with specified dimensions and layout

**Example**:
```
Create a new InDesign document that is 800x600 points with 2 columns and 40pt margins
```

#### Illustrator Server

- `get_documents()` - Returns information about all open documents
- `get_active_document_info()` - Returns info about the active document
- `open_file(path)` - Opens an Illustrator file
- `export_png(path, ...)` - Exports the active document as PNG
- `execute_extend_script(script_string)` - Executes arbitrary ExtendScript code

**Example**:
```
Tell me about the currently open Illustrator documents
```

### Resources

Both servers provide a `config://get_instructions` resource with usage guidelines.

## Logs

Server logs are written to:
- `logs/mcp/adobe-indesign.log`
- `logs/mcp/adobe-illustrator.log`

Logs include:
- Startup timestamps
- Error messages
- Connection status
- Command execution results

**View logs**:
```powershell
# View InDesign logs
Get-Content "T:\Projects\pdf-orchestrator\logs\mcp\adobe-indesign.log" -Tail 50

# View Illustrator logs
Get-Content "T:\Projects\pdf-orchestrator\logs\mcp\adobe-illustrator.log" -Tail 50
```

## Proxy Configuration

Both servers connect to the Adobe Command Proxy at:
- **URL**: `http://localhost:8013`
- **Timeout**: 20 seconds
- **Protocol**: Socket.IO with WebSocket transport

**Verify proxy is running**:
```powershell
# Test proxy connection
Invoke-WebRequest -Uri "http://localhost:8013" -UseBasicParsing
```

Should return an error page (that's OK - it means the proxy is running).

## Troubleshooting

### Server won't start

1. **Check that `.venv` exists and has all dependencies**:
   ```bash
   .venv\Scripts\python.exe -c "import mcp.server.fastmcp; import socketio; print('OK')"
   ```

2. **Verify the adb-mcp modules are accessible**:
   ```bash
   .venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'adb-mcp/mcp'); import core, socket_client, logger; print('OK')"
   ```

3. **Check wrapper file paths**:
   - Verify `C:\Users\ovehe\.cursor\wrappers\adobe-indesign-mcp.cmd` exists
   - Verify `C:\Users\ovehe\.cursor\wrappers\adobe-illustrator-mcp.cmd` exists

4. **Check Cursor MCP configuration**:
   - Verify `C:\Users\ovehe\.cursor\mcp.json` syntax is valid JSON
   - Verify paths use double backslashes (`\\`)

### Connection errors

1. **Ensure the Adobe Command Proxy is running on port 8013**:
   ```powershell
   # Check if proxy is running
   netstat -ano | findstr :8013
   ```

2. **Check that the Adobe application is open**:
   - InDesign: Window → Utilities → InDesign MCP Agent → Should show "Connected"
   - Illustrator: Window → Extensions → Adobe Illustrator MCP → Should show "Connected"

3. **Verify the UXP plugin is installed and connected**:
   - InDesign: Use UXP Developer Tools to load plugin
   - Illustrator: Verify CEP plugin is in correct location

### Import errors

The servers add `adb-mcp/mcp` to Python's path to import shared modules:
```python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'adb-mcp', 'mcp'))
```

If imports fail, check that the `adb-mcp/mcp` directory exists and contains:
- `core.py`
- `socket_client.py`
- `logger.py`

### MCP tools not appearing in Cursor

1. **Verify startup sequence**:
   - ✅ Proxy started BEFORE Cursor
   - ✅ Adobe apps open with plugins connected
   - ✅ Cursor restarted after proxy startup

2. **Check Cursor MCP configuration**:
   ```powershell
   # Verify mcp.json is valid JSON
   python -m json.tool "C:\Users\ovehe\.cursor\mcp.json"
   ```

3. **Check logs for errors**:
   ```powershell
   Get-Content "T:\Projects\pdf-orchestrator\logs\mcp\adobe-indesign.log" -Tail 20
   ```

4. **Restart Cursor completely**:
   - Close ALL Cursor windows
   - Relaunch Cursor
   - MCP servers should start automatically

## Development

To add new tools to the servers:

1. **Add a new function decorated with `@mcp.tool()`** in the appropriate server file:
   ```python
   @mcp.tool()
   def my_new_tool(param1: str, param2: int):
       """
       Description of what this tool does.
       
       Args:
           param1: Description of param1
           param2: Description of param2
       
       Returns:
           dict: Result of the command execution
       """
       command = createCommand("myAction", {
           "param1": param1,
           "param2": param2
       })
       return sendCommand(command)
   ```

2. **Use `createCommand(action, options)`** to create a command
3. **Use `sendCommand(command)`** to execute it via the proxy
4. **The proxy will call the corresponding UXP plugin function** in the Adobe app

### Testing New Tools

1. Make changes to the server file
2. Restart Cursor (to reload MCP servers)
3. Test the new tool in Cursor
4. Check logs for any errors

## File Locations

| Item | Path |
|------|------|
| InDesign MCP Server | `T:\Projects\pdf-orchestrator\mcp-local\indesign-mcp-server.py` |
| Illustrator MCP Server | `T:\Projects\pdf-orchestrator\mcp-local\illustrator-mcp-server.py` |
| InDesign Launcher | `T:\Projects\pdf-orchestrator\mcp-local\launch-indesign.cmd` |
| Illustrator Launcher | `T:\Projects\pdf-orchestrator\mcp-local\launch-illustrator.cmd` |
| Cursor MCP Config | `C:\Users\ovehe\.cursor\mcp.json` |
| InDesign Wrapper | `C:\Users\ovehe\.cursor\wrappers\adobe-indesign-mcp.cmd` |
| Illustrator Wrapper | `C:\Users\ovehe\.cursor\wrappers\adobe-illustrator-mcp.cmd` |
| Proxy Server | `T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket\proxy.js` |
| Logs | `T:\Projects\pdf-orchestrator\logs\mcp\` |

## License

MIT License - Based on work by Mike Chambers (https://github.com/mikechambers/adb-mcp)

---

**Last Updated**: 2025-11-04  
**Status**: Active - MCP servers configured and working
