#!/usr/bin/env python3
"""
Export current InDesign page as PNG screenshot
So we can see what's actually in the document!
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    return response

print("\n" + "="*80)
print("EXPORTING INDESIGN SCREENSHOT")
print("="*80 + "\n")

# Export current page as PNG
print("Exporting current page to PNG...")

export_path = os.path.join(os.path.dirname(__file__), "exports", "indesign-screenshot.png")
os.makedirs(os.path.dirname(export_path), exist_ok=True)

response = cmd("exportPageAsImage", {
    "format": "PNG",
    "resolution": 150,
    "outputPath": export_path
})

if response.get("status") == "SUCCESS":
    print(f"\nSUCCESS! Screenshot saved to:")
    print(f"  {export_path}")
    print("\nOpening in default viewer...")
    os.startfile(export_path)
else:
    print(f"\nFailed: {response.get('message')}")
    print("\nTrying ExtendScript method...")

    # Try ExtendScript workaround
    extendscript_code = f'''
        var doc = app.activeDocument;
        var page = doc.pages[0];
        var exportFile = new File("{export_path.replace("\\", "/")}");

        // Set JPEG export preferences
        app.jpegExportPreferences.exportResolution = 150;
        app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.HIGH;
        app.jpegExportPreferences.pageString = "1";

        // Export
        doc.exportFile(ExportFormat.JPG, exportFile);

        "Exported via ExtendScript";
    '''

    response = cmd("executeExtendScript", {"code": extendscript_code})

    if response.get("status") == "SUCCESS":
        print(f"SUCCESS via ExtendScript! Check: {export_path}")
    else:
        print(f"ExtendScript also failed: {response.get('message')}")

print("\n" + "="*80)
