#!/usr/bin/env python3
import sys, os, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

extendscript = """
(function() {
    var doc = app.activeDocument;

    // Export as JPEG at maximum quality
    app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MAXIMUM;
    app.jpegExportPreferences.exportResolution = 300;
    app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_ALL;

    var file = new File("T:\\\\Projects\\\\pdf-orchestrator\\\\exports\\\\TEEI-Partnership-Showcase-FINAL-screenshot.jpg");
    doc.exportFile(ExportFormat.JPG, file, false);

    return "Exported JPEG screenshot to " + file.fsName;
})();
"""

print("Exporting document as PNG screenshot...")
result = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if isinstance(result, dict) and result.get('status') == 'SUCCESS':
    print("✅ PNG SCREENSHOT EXPORTED!")
    print("Location: T:\\Projects\\pdf-orchestrator\\exports\\TEEI-Partnership-Showcase-FINAL-screenshot.png")
else:
    print(f"ERROR: {result}")
