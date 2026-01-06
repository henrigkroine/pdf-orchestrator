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
    var file = new File("T:\\\\Projects\\\\pdf-orchestrator\\\\exports\\\\TEEI-Partnership-Showcase-FINAL.pdf");
    doc.exportFile(ExportFormat.PDF_TYPE, file, false, "[High Quality Print]");
    return "Exported to " + file.fsName;
})();
"""

print("Exporting to PDF...")
result = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if isinstance(result, dict) and result.get('status') == 'SUCCESS':
    print("✅ PDF EXPORTED!")
    print("Location: T:\\Projects\\pdf-orchestrator\\exports\\TEEI-Partnership-Showcase-FINAL.pdf")
else:
    print(f"ERROR: {result}")
