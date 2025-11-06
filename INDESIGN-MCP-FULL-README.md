# Adobe InDesign MCP Server - Full Feature Set

Complete implementation of Adobe InDesign automation via Model Context Protocol (MCP).

## Architecture

```
┌─────────────────┐
│  Claude Code    │
│  (or other MCP  │
│   client)       │
└────────┬────────┘
         │ stdio
         ▼
┌─────────────────────────────────┐
│  indesign-mcp-full.py           │
│  (FastMCP Python Server)        │
│  - Core v1 tools                │
│  - Pro v2 tools                 │
│  - Enterprise v3 tools          │
│  - Cross-cutting controls       │
└────────┬────────────────────────┘
         │ HTTP (Socket.IO)
         ▼ localhost:8013
┌─────────────────────────────────┐
│  adb-proxy-socket               │
│  (Node.js Socket Server)        │
└────────┬────────────────────────┘
         │ Socket.IO
         ▼
┌─────────────────────────────────┐
│  InDesign UXP Plugin            │
│  (uxp/id/)                      │
│  - Executes commands inside     │
│    InDesign via UXP APIs        │
└─────────────────────────────────┘
```

## Features

### Core v1 - Must-have tools

| Tool | Description |
|------|-------------|
| `create_document` | Create new InDesign documents with custom size, units, margins, bleed |
| `load_template` | Load .indt template files |
| `place_text` | Create text frames with content and styles |
| `place_image` | Place images with various fit options |
| `apply_style` | Apply paragraph, character, or object styles |
| `export_pdf` | Export to PDF with presets (High Quality, Press, PDF/X-4, Digital) |
| `save_document` | Save .indd files |
| `close_document` | Close active document |
| `read_document_info` | Get document metadata (pages, styles, fonts, links) |

### Pro v2 - Layout and data ops

| Tool | Description |
|------|-------------|
| `grid_frame_text` | Create multi-column text layouts with linked frames |
| `table_from_csv` | Import CSV data as formatted table |
| `place_svg_chart` | Place SVG graphics |
| `master_apply` | Apply master pages to document pages |
| `link_replace_all` | Batch update linked file paths |
| `find_replace_text` | Search and replace with style constraints |
| `toc_generate` | Auto-generate table of contents |
| `preflight_run` | Run preflight checks with custom profiles |

### Enterprise v3 - QA, accessibility, packaging

| Tool | Description |
|------|-------------|
| `accessibility_tag` | Configure PDF accessibility tagging |
| `check_brand_rules` | Validate brand guidelines (fonts, colors) |
| `package_document` | Package document with all assets for handoff |
| `export_variants` | Export multiple PDF presets in one call |
| `document_snapshot` | Create state snapshot for versioning |

### Cross-cutting controls

| Tool | Description |
|------|-------------|
| `set_units` | Set measurement units (pt, mm, in) |
| `set_styles` | Batch create/update paragraph, character, object styles |
| `batch` | Execute multiple operations atomically with rollback |
| `ping` | Health check |

## Installation

### Prerequisites

1. **Adobe InDesign** (version 20.0 or later with UXP support)
2. **Python 3.10+**
3. **Node.js** (for proxy server)

### Setup Steps

#### 1. Install Python Dependencies

```bash
cd T:\Projects\pdf-orchestrator\adb-mcp\mcp
pip install -r requirements.txt
```

Required packages:
- `mcp` - Model Context Protocol SDK
- `python-socketio` - Socket communication
- `requests` - HTTP client

#### 2. Start the Socket Proxy Server

```bash
cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket
npm install
npm start
```

This starts the proxy server on `localhost:8013`.

#### 3. Install UXP Plugin in InDesign

1. Open InDesign
2. Go to **Plugins > UXP Developer Tool**
3. Click **Add Plugin**
4. Navigate to: `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id`
5. Select `manifest.json`
6. Click **Load**
7. In the plugin panel, click **Connect** button

The plugin status should show "Connected to server".

#### 4. Test the Setup

```bash
cd T:\Projects\pdf-orchestrator
python test-acceptance.py
```

## Usage

### From Python (Direct)

```python
import sys
sys.path.insert(0, 'adb-mcp/mcp')

from core import init, sendCommand, createCommand
import socket_client

# Configure
socket_client.configure(
    app="indesign",
    url='http://localhost:8013',
    timeout=30
)

init("indesign", socket_client)

# Create document
command = createCommand("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 4,
    "units": "pt"
})

response = sendCommand(command)
print(response)
```

### From MCP Client (stdio)

```bash
python indesign-mcp-full.py
```

Then from Claude Code or any MCP client:

```python
# Create A4 document
result = mcp__indesign__create_document(
    width=595,
    height=842,
    units="pt",
    pages=4,
    name="my-doc"
)

# Place text
result = mcp__indesign__place_text(
    page=1,
    x=40,
    y=80,
    width=500,
    height=200,
    content="Hello world"
)

# Export PDF
result = mcp__indesign__export_pdf(
    output_path="T:/exports/output.pdf",
    preset="PDF/X-4",
    use_doc_bleed=True,
    include_marks=True
)
```

## Acceptance Tests

Run the full test suite:

```bash
python test-acceptance.py
```

Tests include:
1. ✓ Create Document (A4, 4 pages)
2. ✓ Place Text
3. ✓ Place Image (requires test image at T:/Assets/logo.png)
4. ✓ Read Document Info
5. ✓ Export PDF/X-4 with bleed and marks
6. ✓ Save Document
7. ✓ Ping health check

## "Most Fancy" Demo

Run the comprehensive demo that showcases all features:

```bash
python demo-fancy-report.py
```

This creates a professional A4 report with:
- 8-page document with master pages and professional styles
- Cover page with styled headings
- Multi-column text layout
- Accessibility tagging for tagged PDF
- Preflight quality check
- Multiple export formats (PDF/X-4, Digital, High Quality Print)
- Document packaging for handoff

Output location: `T:/Projects/pdf-orchestrator/exports/fancy-report/`

## Error Handling

All tools return standardized responses:

**Success:**
```json
{
  "ok": true,
  "data": {...},
  "activeDocument": {...}
}
```

**Failure:**
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "msg": "Human-readable message",
    "details": {...}
  }
}
```

Error codes:
- `CREATE_DOCUMENT_FAILED` - Document creation error
- `FILE_NOT_FOUND` - Template or image file not found
- `STYLE_NOT_FOUND` - Paragraph/character style not found
- `COMMAND_FAILED` - General command execution failure
- `EXPORT_PDF_FAILED` - PDF export error
- `PREFLIGHT_RUN_FAILED` - Preflight check error

## Idempotency

All tools support optional `request_id` parameter for idempotent operations:

```python
# First call - executes
result1 = create_document(..., request_id="doc-123")

# Second call with same request_id - returns cached result
result2 = create_document(..., request_id="doc-123")

# result1 == result2 (cached, not executed again)
```

## Path Validation

- All file paths must be **absolute Windows paths**
- UNC paths (`\\server\share\file`) are blocked by default
- Paths are validated before execution
- Parent directories are created automatically for outputs

Valid path examples:
- `T:/Projects/output.pdf` ✓
- `C:\Users\Henrik\Documents\file.indd` ✓
- `T:\Assets\logo.png` ✓

Invalid:
- `./relative/path.pdf` ✗
- `\\server\share\file.pdf` ✗ (unless explicitly allowed)

## Security

- **No raw JSX execution** - Only curated tool list exposed
- **Path validation** - Absolute paths only, no directory traversal
- **Logging** - All operations logged with args and duration
- **Atomic batch operations** - Rollback on failure

## Troubleshooting

### "Connection refused" or timeout errors

1. Check proxy server is running: `http://localhost:8013`
2. Check InDesign UXP plugin is loaded and connected
3. Increase `PROXY_TIMEOUT` in code

### "No active document" errors

1. Ensure InDesign is open
2. Check a document is open (or use `create_document` first)
3. Some commands require active document (except `create_document`, `load_template`, `ping`)

### UXP Plugin not loading

1. Check InDesign version supports UXP (v20.0+)
2. Verify manifest.json is valid
3. Check UXP Developer Tool console for errors
4. Ensure `commands/index.js` has no syntax errors

### Styles not found

1. Use `read_document_info()` to list available styles
2. Create styles first with `set_styles()` before applying
3. Style names are case-sensitive and must match exactly

## Performance Tips

1. **Use batch operations** for multiple commands
2. **Export variants** exports multiple PDFs more efficiently than separate calls
3. **Preflight** can be slow - adjust timeout if needed
4. **Large documents** may require longer timeouts

## API Reference

See inline docstrings in `indesign-mcp-full.py` for detailed parameter documentation.

Quick reference:
- Units: `"pt"` (points), `"mm"` (millimeters), `"in"` (inches)
- Fit options: `"none"`, `"frame"`, `"content"`, `"proportionally"`, `"contentAware"`
- PDF presets: `"High Quality Print"`, `"Press Quality"`, `"PDF/X-4"`, `"Digital"`
- Overflow: `"expand"`, `"truncate"`, `"autoflow"`

## Architecture Decisions

### Why Two Layers (Python + UXP)?

1. **MCP requires stdio** - UXP doesn't support stdio natively
2. **Socket.IO bridge** - Proven solution from adb-mcp project
3. **Separation of concerns** - MCP layer (Python) + execution layer (JavaScript/UXP)
4. **Reusable** - Same pattern works for Photoshop, Illustrator, etc.

### Why Socket Proxy?

- Windows UXP has issues with WebSocket transport
- HTTP polling (Socket.IO) is more stable
- Proxy handles connection management and message routing

## License

MIT License - Based on adb-mcp by Mike Chambers

## Credits

- **adb-mcp** by Mike Chambers - Foundation for socket-based Adobe automation
- **FastMCP** by Anthropic - MCP server framework
- **Adobe UXP** - InDesign plugin API

## Support

For issues, questions, or contributions, please file an issue on GitHub or contact the maintainer.

---

**Version:** 1.0.0
**Last Updated:** 2025-01-03
**Compatibility:** InDesign 20.0+, Python 3.10+, Node.js 16+
