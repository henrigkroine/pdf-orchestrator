# Test Script - Run AFTER Restarting Claude Code

## Step 1: Verify InDesign MCP Tools Loaded

After restarting Claude Code, run this to check if all 61 tools are available:

```
List all available MCP tools that start with "mcp__adobe-indesign"
```

**Expected Result**: You should see 61+ tools like:
- mcp__adobe-indesign__create_document
- mcp__adobe-indesign__create_text_on_path
- mcp__adobe-indesign__create_gradient_box
- mcp__adobe-indesign__apply_drop_shadow
- ... (59 more)

## Step 2: Start InDesign & UXP Plugin

1. **Open Adobe InDesign** (must be running)
2. **Open Adobe UXP Developer Tool**
3. **Load plugin**:
   - Location: `T:\Projects\pdf-orchestrator\adb-mcp\uxp\id`
   - Click "Add Plugin" → Select the folder
   - Click "Load" to activate
4. **Verify WebSocket**: Plugin should connect to `ws://localhost:8013`

## Step 3: Test Basic Command

Ask Claude Code:

```
Use the InDesign MCP to create a new document with these settings:
- Width: 595pt (A4)
- Height: 842pt (A4)
- Margins: 50pt all sides
- Name: "test-document.indd"
```

**Expected Result**: New InDesign document opens with correct dimensions.

## Step 4: Test Advanced Command

Ask Claude Code:

```
Create a gradient box in the active InDesign document:
- X: 0, Y: 0
- Width: 595, Height: 200
- Start color: #00393F (TEEI Blue)
- End color: #009688 (TEEI Green)
- Gradient angle: 45 degrees
```

**Expected Result**: Beautiful gradient box appears in document.

## Step 5: Create TEEI Showcase

If tests pass, proceed to: `create-teei-showcase-commands.md`

---

## Troubleshooting

### No InDesign tools showing
- Verify `id-mcp.py` loaded correctly: Check Claude Code startup logs
- Check `generated_tools.py` exists: `T:\Projects\pdf-orchestrator\adb-mcp\mcp\generated_tools.py`
- Restart Claude Code again

### "Connection refused" errors
- Verify InDesign is running
- Verify UXP plugin is loaded
- Check WebSocket server: `ws://localhost:8013`
- Check proxy: `T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket\proxy.js`

### Commands not working
- Check InDesign console for errors (Window → Utilities → Console)
- Verify document is active (some commands require open document)
- Check parameter types (numbers, strings, objects)
