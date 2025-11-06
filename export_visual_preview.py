#!/usr/bin/env python3
"""
Export InDesign pages as JPEG images so Claude can actually SEE them
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
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    return response

print("\n" + "="*80)
print("EXPORTING VISUAL PREVIEW (JPEG)")
print("="*80 + "\n")

# Export folder in Downloads so I can see the images
export_folder = os.path.join(os.path.expanduser("~"), "Downloads")
export_folder_escaped = export_folder.replace("\\", "\\\\")

print(f"Exporting to: {export_folder}")

# ExtendScript to export pages as JPEG
extendscript = f"""
(function() {{
    var doc = app.activeDocument;
    var results = [];

    // Set JPEG export preferences
    app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.HIGH;
    app.jpegExportPreferences.exportResolution = 150;
    app.jpegExportPreferences.jpegColorSpace = JpegColorSpaceEnum.RGB;

    // Export each page
    for (var i = 0; i < doc.pages.length; i++) {{
        app.jpegExportPreferences.exportingSpread = false;
        app.jpegExportPreferences.pageString = (i + 1).toString();

        var fileName = "TEEI_Premium_Page_" + (i + 1) + ".jpg";
        var file = new File("{export_folder_escaped}\\\\" + fileName);

        doc.exportFile(ExportFormat.JPG, file);
        results.push("Exported: " + fileName);
    }}

    return results.join("\\\\n");
}})();
"""

print("Running JPEG export ExtendScript...")

response = cmd("executeExtendScript", {"code": extendscript})

print("\nResponse:", response)

if response.get("status") == "SUCCESS":
    result = response.get("response", {}).get("result", "")
    print("\n" + "="*80)
    print("[SUCCESS] VISUAL PREVIEW EXPORTED!")
    print("="*80)
    print(f"\nExported pages as JPEG to: {export_folder}")
    print("\nFiles:")
    print("  - TEEI_Premium_Page_1.jpg")
    print("  - TEEI_Premium_Page_2.jpg")
    print("\nNow I can use the Read tool to actually SEE what the document looks like!")
    print("="*80 + "\n")
else:
    print(f"\n[ERROR] Export failed: {response}")
