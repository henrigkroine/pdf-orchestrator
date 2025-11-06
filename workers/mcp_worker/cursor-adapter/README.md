# Adobe MCP Stdio Adapters

MCP-compatible stdio servers for Adobe InDesign and Illustrator that forward commands to the WebSocket proxy at `ws://localhost:8013`.

## Architecture

```
Cursor/Claude Code (MCP client)
    ↓ stdio (JSON-RPC)
mcp_adobe_indesign.py / mcp_adobe_illustrator.py
    ↓ HTTP POST to localhost:8013/execute
WebSocket Proxy Server (port 8013)
    ↓ WebSocket
Adobe InDesign/Illustrator (UXP/CEP plugin)
```

## Files

- **mcp_adobe_common.py**: Base classes `MCPStdioServer` and `AdobeSocketClient`
- **mcp_adobe_indesign.py**: InDesign MCP stdio server
- **mcp_adobe_illustrator.py**: Illustrator MCP stdio server

## Prerequisites

1. **Python 3.11+** with packages:
   - `requests` (for HTTP calls to proxy)

   Install: `pip install requests`

2. **WebSocket Proxy Running** on port 8013
   - Start proxy: `node T:\Projects\pdf-orchestrator\adb-mcp\proxy\server.js`
   - Verify: `curl http://localhost:8013/health`

3. **Adobe Application Running**
   - InDesign or Illustrator must be open
   - UXP/CEP plugin must be installed and connected to proxy

## Configuration for Cursor

Add to `C:\Users\ovehe\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "adobe-indesign": {
      "command": "C:\\Python314\\python.exe",
      "args": ["T:\\Projects\\pdf-orchestrator\\workers\\mcp_worker\\cursor-adapter\\mcp_adobe_indesign.py"]
    },
    "adobe-illustrator": {
      "command": "C:\\Python314\\python.exe",
      "args": ["T:\\Projects\\pdf-orchestrator\\workers\\mcp_worker\\cursor-adapter\\mcp_adobe_illustrator.py"]
    }
  }
}
```

Or use wrapper scripts:

**C:\Users\ovehe\.cursor\wrappers\adobe-indesign-mcp.cmd**:
```cmd
@echo off
"C:\Python314\python.exe" "T:\Projects\pdf-orchestrator\workers\mcp_worker\cursor-adapter\mcp_adobe_indesign.py"
```

**C:\Users\ovehe\.cursor\wrappers\adobe-illustrator-mcp.cmd**:
```cmd
@echo off
"C:\Python314\python.exe" "T:\Projects\pdf-orchestrator\workers\mcp_worker\cursor-adapter\mcp_adobe_illustrator.py"
```

Then reference in mcp.json:
```json
{
  "mcpServers": {
    "adobe-indesign": {
      "command": "cmd",
      "args": ["/c", "C:\\Users\\ovehe\\.cursor\\wrappers\\adobe-indesign-mcp.cmd"]
    }
  }
}
```

## Configuration for Claude Code

Add to `C:\Users\ovehe\.claude\settings.json`:

```json
{
  "mcpServers": {
    "adobe-indesign": {
      "command": "/mnt/c/Python314/python.exe",
      "args": ["T:\\Projects\\pdf-orchestrator\\workers\\mcp_worker\\cursor-adapter\\mcp_adobe_indesign.py"]
    },
    "adobe-illustrator": {
      "command": "/mnt/c/Python314/python.exe",
      "args": ["T:\\Projects\\pdf-orchestrator\\workers\\mcp_worker\\cursor-adapter\\mcp_adobe_illustrator.py"]
    }
  }
}
```

## Tools Provided

Both adapters provide 5 tools:

### 1. create_new_document
Create new document with specified dimensions.

**Parameters**:
- `width` (number, required): Document width
- `height` (number, required): Document height
- `units` (string, optional): Units ("mm", "cm", "in", "pt"), default "mm"

**Example**:
```json
{
  "name": "create_new_document",
  "params": {
    "width": 210,
    "height": 297,
    "units": "mm"
  }
}
```

### 2. open_template
Open template document from disk.

**Parameters**:
- `path` (string, required): Absolute path to template file (must be in `T:\Projects\pdf-orchestrator\`)

**Example**:
```json
{
  "name": "open_template",
  "params": {
    "path": "T:\\Projects\\pdf-orchestrator\\templates\\my-template.indd"
  }
}
```

### 3. place_text_in_frame
Place text in named text frame.

**Parameters**:
- `frame_name` (string, required): Name of text frame
- `text` (string, required): Text content

**Example**:
```json
{
  "name": "place_text_in_frame",
  "params": {
    "frame_name": "TitleFrame",
    "text": "My Document Title"
  }
}
```

### 4. place_image_in_frame
Place image in named frame.

**Parameters**:
- `frame_name` (string, required): Name of image frame
- `url` (string, required): File path or URL to image

**Example**:
```json
{
  "name": "place_image_in_frame",
  "params": {
    "frame_name": "LogoFrame",
    "url": "T:\\Projects\\pdf-orchestrator\\assets\\logo.png"
  }
}
```

### 5. export_pdf
Export active document as PDF.

**Parameters**:
- `preset` (string, optional): PDF preset name, default "[High Quality Print]"
- `output_path` (string, required): Absolute path for output PDF (must be in `T:\Projects\pdf-orchestrator\`)

**Example**:
```json
{
  "name": "export_pdf",
  "params": {
    "preset": "[High Quality Print]",
    "output_path": "T:\\Projects\\pdf-orchestrator\\output\\document.pdf"
  }
}
```

## Security

**Path Validation**: All file paths are validated to ensure they're within `T:\Projects\pdf-orchestrator\`. Attempts to access other paths will be rejected.

**Timeout**: All proxy requests timeout after 20 seconds.

**Retry Logic**: Idempotent read operations (like `get_document_info`) will retry once on timeout.

## MCP Protocol

### Handshake

On startup, each server emits:

1. **server_info**:
```json
{
  "type": "server_info",
  "name": "adobe-indesign",
  "version": "1.0.0"
}
```

2. **tools** (list of 5 tools with JSON schemas)

### Tool Calls

**Request format**:
```json
{
  "type": "tool_call",
  "name": "create_new_document",
  "params": {
    "width": 800,
    "height": 600,
    "units": "pt"
  }
}
```

**Success response**:
```json
{
  "type": "tool_result",
  "name": "create_new_document",
  "result": {
    "status": "success",
    "document_id": "..."
  }
}
```

**Error response**:
```json
{
  "type": "tool_error",
  "name": "create_new_document",
  "error": "Path not allowed: C:\\temp\\file.pdf"
}
```

## Testing

### Manual Test (Command Line)

**InDesign**:
```bash
cd T:\Projects\pdf-orchestrator\workers\mcp_worker\cursor-adapter
python mcp_adobe_indesign.py
```

Expected output:
```json
{"type":"server_info","name":"adobe-indesign","version":"1.0.0"}
{"type":"tools","tools":[...]}
```

Then send a tool call via stdin:
```json
{"type":"tool_call","name":"create_new_document","params":{"width":800,"height":600,"units":"pt"}}
```

Expected response:
```json
{"type":"tool_result","name":"create_new_document","result":{...}}
```

### Test from Cursor/Claude Code

1. Restart Cursor/Claude Code after updating config
2. In chat, list available tools: "List all adobe-indesign tools"
3. Call tool: "Use adobe-indesign to create a new 210x297mm document"

### Verify Proxy Connection

```bash
curl http://localhost:8013/health
```

Expected: `{"status":"ok"}`

## Troubleshooting

### "No server info found" Error

**Cause**: Server not emitting proper MCP handshake.

**Fix**: Verify Python version is 3.11+ and `mcp_adobe_common.py` is importable.

### "Connection refused" to port 8013

**Cause**: WebSocket proxy not running.

**Fix**: Start proxy: `node T:\Projects\pdf-orchestrator\adb-mcp\proxy\server.js`

### "Path not allowed" Error

**Cause**: Trying to access files outside `T:\Projects\pdf-orchestrator\`.

**Fix**: Use only paths within the allowed directory.

### Timeout Errors

**Cause**: Adobe app not responding or not connected to proxy.

**Fix**:
1. Verify Adobe app is running
2. Check UXP/CEP plugin is installed and connected
3. Check proxy logs for connection status

## Development

### Running Tests

Minimal acceptance tests:

**Test 1: Handshake**
```bash
python mcp_adobe_indesign.py | head -2
```
Should emit server_info and tools.

**Test 2: Tool Call (InDesign)**
```bash
echo '{"type":"tool_call","name":"create_new_document","params":{"width":800,"height":600,"units":"pt"}}' | python mcp_adobe_indesign.py
```

**Test 3: Tool Call (Illustrator)**
```bash
echo '{"type":"tool_call","name":"create_new_document","params":{"width":800,"height":600,"units":"pt"}}' | python mcp_adobe_illustrator.py
```

### Extending

To add new tools:

1. Add method to `AdobeSocketClient` in `mcp_adobe_common.py`
2. Add tool definition to `get_tools()` in adapter
3. Add routing in `handle_tool_call()` in `mcp_adobe_common.py`

## Related Documentation

- Main proxy README: `T:\Projects\pdf-orchestrator\adb-mcp\SETUP.md`
- Original MCP scripts: `T:\Projects\pdf-orchestrator\adb-mcp\mcp\`
- MCP protocol spec: https://modelcontextprotocol.io/

## Version History

- **1.0.0** (2025-01-03): Initial release with 5 core tools
