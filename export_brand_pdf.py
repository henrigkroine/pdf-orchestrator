#!/usr/bin/env python3
"""
Export the world-class TEEI document as PDF
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

print("Exporting world-class TEEI document as PDF...")

export_code = """
(function() {
    var doc = app.activeDocument;
    var file = new File("C:\\\\Users\\\\ovehe\\\\Downloads\\\\TEEI_WORLD_CLASS_WITH_BRAND_FONTS.pdf");
    doc.exportFile(ExportFormat.PDF_TYPE, file, false, "[High Quality Print]");
    return "PDF exported successfully to Downloads folder";
})();
"""

response = sendCommand(createCommand("executeExtendScript", {"code": export_code}))

if response.get("status") == "SUCCESS":
    print("SUCCESS: PDF exported!")
    print("")
    print("Location: C:\\Users\\ovehe\\Downloads\\TEEI_WORLD_CLASS_WITH_BRAND_FONTS.pdf")
    print("")
    print("Document features:")
    print("- Lora Bold font for main title")
    print("- Lora Italic font for tagline and quotes")
    print("- Roboto font attempted for body text")
    print("- All official TEEI brand colors (Nordshore, Sky, Sand, Moss, Gold)")
    print("- 2-page professional layout")
    print("- Strategic AWS partnership content")
    print("- Space for logos and images")
    print("- Professional metrics and testimonials")
else:
    print("Export failed:", response)